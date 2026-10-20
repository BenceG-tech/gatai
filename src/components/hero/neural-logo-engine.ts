/*
 * Canvas engine for the approved neural logo animation (prototype v2.4).
 *
 * This is a typed port of the approved `neural.js`: same seeded random
 * sequence, same node sampling, same timeline constants and the same draw
 * order, so a given timeline value renders the same frame as the prototype.
 * Differences are integration only: the timeline is fed by the page scroll
 * (with a short glide), rendering pauses when inactive, and the cursor neuron
 * is driven by the host component (pointer devices only).
 *
 * Browser-only: create it from an effect, never during SSR.
 */
import { WORDMARK_PARTS, type WordmarkRole } from "@/lib/brand";
import {
  T,
  approach,
  clamp,
  ease,
  easeInCubic,
  easeOutExpo,
  neuralPhase,
  seg,
  type NeuralPhase,
} from "@/lib/neural-timeline";

type RGB = readonly [number, number, number];
const SILVER: RGB = [223, 229, 238];
const AZ: RGB = [47, 155, 255];
const ICE: RGB = [191, 228, 255];
const WHITE: RGB = [255, 255, 255];
const DEEP_ICE: RGB = [140, 205, 255];
const rgba = (c: RGB, a: number) => `rgba(${c[0]},${c[1]},${c[2]},${a})`;
const TAU = 6.29;

type Shape = { d: string; dx: number; role: WordmarkRole; p2d: Path2D };

type NeuralNode = {
  amb: boolean;
  ai: boolean;
  /** Target point on a letter outline (logo units). */
  tx: number;
  ty: number;
  /** Point on the explosion sphere (unit sphere) and its ragged shell factor. */
  sx: number;
  sy: number;
  sz: number;
  shell: number;
  /** Point inside the brain-shaped network. */
  hx: number;
  hy: number;
  /** Free-floating position for ambient neurons. */
  fx: number;
  fy: number;
  ph: number;
  sp: number;
  delay: number;
  glow: number;
  x: number;
  y: number;
  k: number;
  depth: number;
};

type Pulse = {
  a: number;
  b: number;
  t: number;
  v: number;
  ai: boolean;
  hop: number;
};
type Spark = { i: number; ca: number; sa: number; len: number; w: number };

export type NeuralLogoOptions = {
  /** Fewer nodes for small screens (prototype: min(viewport) < 700). */
  mobile: boolean;
  /** Called when the visible phase changes. */
  onPhase?: (phase: NeuralPhase) => void;
};

export type NeuralLogo = {
  /** Scroll-driven target; the drawn value glides toward it. */
  setTarget(p: number): void;
  /** Jump straight to a timeline value (no glide). */
  jumpTo(p: number): void;
  /** Cursor neuron position in client (viewport) coordinates. */
  pointer(clientX: number, clientY: number): void;
  pointerLeave(): void;
  /** Start or pause the render loop (offscreen, hidden tab). */
  setActive(active: boolean): void;
  resize(): void;
  destroy(): void;
  readonly progress: number;
};

/** Centre of the wordmark in logo units, as in the prototype. */
const C = { x: 421, y: 118 } as const;

export function createNeuralLogo(
  canvas: HTMLCanvasElement,
  { mobile, onPhase }: NeuralLogoOptions,
): NeuralLogo {
  const maybeCtx = canvas.getContext("2d");
  if (!maybeCtx) throw new Error("2D canvas is not available");
  const ctx: CanvasRenderingContext2D = maybeCtx;

  const seed = { s: 7 };
  const rnd = () => (seed.s = (seed.s * 16807) % 2147483647) / 2147483647;

  // ---- sample outline points from the real logo paths
  const ns = "http://www.w3.org/2000/svg";
  const tmp = document.createElementNS(ns, "svg");
  tmp.setAttribute("width", "0");
  tmp.setAttribute("height", "0");
  tmp.setAttribute("aria-hidden", "true");
  tmp.style.position = "absolute";
  document.body.appendChild(tmp);
  const shapes: (Shape & { el: SVGPathElement })[] = WORDMARK_PARTS.map(
    (part) => {
      const el = document.createElementNS(ns, "path");
      el.setAttribute("d", part.d);
      tmp.appendChild(el);
      return { ...part, el, p2d: new Path2D(part.d) };
    },
  );

  const STEP = mobile ? 15 : 10;
  const nodes: NeuralNode[] = [];
  const skel: [number, number][] = [];
  const blank = (): NeuralNode => ({
    amb: false,
    ai: false,
    tx: 0,
    ty: 0,
    sx: 0,
    sy: 0,
    sz: 0,
    shell: 1,
    hx: 0,
    hy: 0,
    fx: 0,
    fy: 0,
    ph: 0,
    sp: 0,
    delay: 0,
    glow: 0,
    x: 0,
    y: 0,
    k: 0,
    depth: 0.5,
  });
  shapes.forEach((s) => {
    if (s.role === "studio") return;
    const L = s.el.getTotalLength();
    const n = Math.max(6, Math.round(L / STEP));
    const first = nodes.length;
    let prev: NeuralNode | null = null;
    for (let i = 0; i < n; i++) {
      const q = s.el.getPointAtLength((i / n) * L);
      const pt = { ...blank(), tx: q.x + s.dx, ty: q.y, ai: s.role === "ai" };
      // gaps (subpaths) show up as long jumps; don't wire them
      if (prev && Math.hypot(pt.tx - prev.tx, pt.ty - prev.ty) < STEP * 2.2)
        skel.push([nodes.length - 1, nodes.length]);
      nodes.push(pt);
      prev = pt;
    }
    const a = nodes[first]!;
    const b = nodes[nodes.length - 1]!;
    if (Math.hypot(a.tx - b.tx, a.ty - b.ty) < STEP * 2.2)
      skel.push([first, nodes.length - 1]);
  });
  tmp.remove();
  const OUTLINE = nodes.length;

  // explosion form: a neural sphere, one point per outline node, with a ragged shell
  const GA = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < OUTLINE; i++) {
    const y = 1 - (i / (OUTLINE - 1)) * 2;
    const r = Math.sqrt(1 - y * y);
    const th = GA * i;
    const j = (i * 7919) % OUTLINE; // scatter so neighbouring letters don't stay neighbours
    const n = nodes[j]!;
    n.sx = Math.cos(th) * r;
    n.sy = y;
    n.sz = Math.sin(th) * r;
    n.shell = 0.82 + (((i * 2654435761) % 1000) / 1000) * 0.36;
  }
  // ambient neurons that never become letters
  const AMB = mobile ? 70 : 150;
  for (let i = 0; i < AMB; i++) nodes.push({ ...blank(), amb: true });

  // brain: two hemispheres with a fissure, flatter at the bottom
  function brainPoint(): [number, number] {
    for (;;) {
      const side = rnd() < 0.5 ? -1 : 1;
      const x = rnd() * 2 - 1;
      const y = rnd() * 2 - 1;
      const yy = y < 0 ? y : y * 1.25;
      if (x * x + yy * yy > 1) continue;
      const hx = C.x + side * 150 + x * 210;
      const hy = C.y + y * 185;
      if ((hx - C.x) * side < 12) continue;
      return [hx, hy];
    }
  }
  nodes.forEach((n) => {
    const [hx, hy] = brainPoint();
    n.hx = hx;
    n.hy = hy;
    n.ph = rnd() * 6.28;
    n.sp = 0.4 + rnd() * 0.8;
    if (n.amb) {
      n.fx = -260 + rnd() * 1390;
      n.fy = -240 + rnd() * 770;
    }
    n.delay = n.amb ? 0 : clamp((n.tx + 60) / 980) * 0.55 + rnd() * 0.12;
  });

  // debris thrown off the letters on impact: short streaks with a node at the head
  const sparks: Spark[] = [];
  for (let i = 0; i < OUTLINE; i += mobile ? 4 : 2) {
    const n = nodes[i]!;
    const a = Math.atan2((n.ty - C.y) * 2.2, n.tx - C.x) + (rnd() - 0.5) * 0.9;
    sparks.push({
      i,
      ca: Math.cos(a),
      sa: Math.sin(a),
      len: 60 + rnd() * 260,
      w: 0.8 + rnd() * 1.6,
    });
  }

  // static paths for the lit logo
  const letters = new Path2D();
  shapes.forEach((s) => {
    if (s.role !== "studio")
      letters.addPath(s.p2d, new DOMMatrix().translate(s.dx, 0));
  });
  const studio = shapes.find((s) => s.role === "studio")!.p2d;
  const all = new Path2D(letters);
  all.addPath(studio);
  const sil = ctx.createLinearGradient(0, 44, 30, 176);
  (
    [
      [0, "#F6F8FF"],
      [0.34, "#C6CEDB"],
      [0.5, "#F6F8FF"],
      [0.64, "#9AA5B7"],
      [1, "#D9DEE7"],
    ] as const
  ).forEach(([o, c]) => sil.addColorStop(o, c));
  const az = ctx.createLinearGradient(0, 44, 30, 176);
  (
    [
      [0, "#8FD8FF"],
      [0.45, "#2F9BFF"],
      [1, "#1468D8"],
    ] as const
  ).forEach(([o, c]) => az.addColorStop(o, c));

  // ---- layout
  let W = 0;
  let H = 0;
  let DPR = 1;
  let S = 1;
  let OX = 0;
  let OY = 0;
  function resize() {
    DPR = Math.min(2, window.devicePixelRatio || 1);
    const r = canvas.getBoundingClientRect();
    W = r.width;
    H = r.height;
    canvas.width = Math.max(1, Math.round(W * DPR));
    canvas.height = Math.max(1, Math.round(H * DPR));
    S = Math.min((W * 0.8) / 870, (H * 0.46) / 285);
    OX = W / 2 - 421 * S;
    OY = H / 2 - 128 * S;
  }
  resize();
  const X = (x: number) => OX + x * S;
  const Y = (y: number) => OY + y * S;

  // ---- cursor neuron
  const mouse = { x: -1e4, y: -1e4, on: false };

  // ---- pulses travelling along connections
  let pulses: Pulse[] = [];
  const spawn = (a: number, b: number, ai: boolean) => {
    if (pulses.length < 260)
      pulses.push({ a, b, t: 0, v: 0.025 + rnd() * 0.03, ai, hop: 0 });
  };

  let p = 0;
  let target = 0;
  let last = performance.now();
  let raf = 0;
  let active = false;
  let phase: NeuralPhase | null = null;
  let blend = 0;
  const edges: number[] = [];

  function positions(time: number) {
    const nOn = seg(p, T.settle[0], T.settle[1]);
    const e = easeOutExpo(seg(p, T.boom[0], T.boom[1]));
    const back = easeInCubic(seg(p, T.snap[0], T.snap[1]));
    blend = e * (1 - back);
    const shake = seg(p, T.shake[0], T.shake[1]) * (1 - e);
    const rot = time * 0.00045 + p * 9;
    const tilt = 0.35;
    const cr = Math.cos(rot);
    const sr = Math.sin(rot);
    const ct = Math.cos(tilt);
    const st = Math.sin(tilt);
    const Rs = 255 * (1 + 0.18 * Math.sin(seg(p, T.boom[0], T.hold) * Math.PI)); // overshoot, then breathe back
    for (const n of nodes) {
      const jx = Math.sin(time * 0.0007 * n.sp + n.ph) * 7;
      const jy = Math.cos(time * 0.0006 * n.sp + n.ph * 1.3) * 7;
      if (n.amb) {
        const k = ease(seg(p, 0.2, 0.5));
        n.x = n.hx + (n.fx - n.hx) * k + jx * 1.4;
        n.y = n.hy + (n.fy - n.hy) * k + jy * 1.4;
        // blown outward by the explosion
        n.x += (n.x - C.x) * 0.9 * blend;
        n.y += (n.y - C.y) * 0.9 * blend;
        n.depth = 0.5;
      } else {
        const k = ease(clamp((nOn - n.delay) / 0.4));
        n.k = k;
        let x = n.hx + (n.tx - n.hx) * k + jx * (1 - k);
        let y = n.hy + (n.ty - n.hy) * k + jy * (1 - k);
        if (shake > 0) {
          x += Math.sin(time * 0.09 + n.ph * 9) * 3.5 * shake;
          y += Math.cos(time * 0.11 + n.ph * 7) * 3.5 * shake;
        }
        if (blend > 0) {
          // rotate the sphere point (Y spin, X tilt) and project with a little perspective
          const X3 = n.sx * cr + n.sz * sr;
          const Z3 = -n.sx * sr + n.sz * cr;
          const Y3 = n.sy;
          const Y4 = Y3 * ct - Z3 * st;
          const Z4 = Y3 * st + Z3 * ct;
          const persp = 1 / (1 - Z4 * 0.32);
          const R = Rs * n.shell;
          const bx = C.x + X3 * R * persp * 1.15;
          const by = C.y + Y4 * R * persp * 0.92;
          x += (bx - x) * blend;
          y += (by - y) * blend;
          n.depth = (Z4 + 1) / 2;
        } else n.depth = 0.5;
        n.x = x;
        n.y = y;
      }
      if (mouse.on) {
        const dx = n.x - mouse.x;
        const dy = n.y - mouse.y;
        const d = Math.hypot(dx, dy);
        const R = 95;
        if (d < R && d > 0.1) {
          const f =
            (1 - d / R) * 22 * (n.amb ? 1 : 1 - n.k * 0.85 * (1 - blend));
          n.x += (dx / d) * f;
          n.y += (dy / d) * f;
        }
      }
    }
  }

  function flash(a: number, b: number, strength: number, rgb: string) {
    const f = seg(p, a, b);
    if (f <= 0 || f >= 1) return;
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    const cx = X(C.x);
    const cy = Y(C.y);
    const rad = Math.max(W, H) * (0.15 + f * 0.9);
    const fg = ctx.createRadialGradient(cx, cy, 0, cx, cy, rad);
    fg.addColorStop(0, `rgba(${rgb},${(1 - f) * (1 - f) * strength})`);
    fg.addColorStop(1, `rgba(${rgb},0)`);
    ctx.fillStyle = fg;
    ctx.fillRect(0, 0, W, H);
    ctx.restore();
  }

  function draw(now: number, dt: number) {
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    ctx.clearRect(0, 0, W, H);
    // ambient glow
    const g = ctx.createRadialGradient(
      W / 2,
      H * 0.55,
      0,
      W / 2,
      H * 0.55,
      Math.max(W, H) * 0.6,
    );
    g.addColorStop(0, `rgba(47,155,255,${0.1 + 0.08 * seg(p, 0.6, 0.9)})`);
    g.addColorStop(1, "rgba(8,9,13,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);

    const neural = Math.max(1 - ease(seg(p, 0.22, 0.42)), blend); // proximity web
    const skelA =
      ease(seg(p, 0.3, 0.46)) *
      (1 - blend) *
      (1 - 0.75 * ease(seg(p, 0.8, 0.92)));
    const fill = ease(seg(p, 0.735, 0.85));
    const nodeA = 1 - 0.8 * ease(seg(p, 0.82, 0.95));

    // proximity edges (synapses)
    const R = 46 + 22 * blend;
    edges.length = 0;
    if (neural > 0.02 || mouse.on) {
      for (let i = 0; i < nodes.length; i += 1) {
        const a = nodes[i]!;
        for (let j = i + 1; j < nodes.length; j++) {
          const b = nodes[j]!;
          const dx = a.x - b.x;
          if (dx > R || dx < -R) continue;
          const dy = a.y - b.y;
          if (dy > R || dy < -R) continue;
          const d = Math.hypot(dx, dy);
          if (d < R) edges.push(i, j, d);
        }
      }
      ctx.lineWidth = 1;
      for (let e = 0; e < edges.length; e += 3) {
        const a = nodes[edges[e]!]!;
        const b = nodes[edges[e + 1]!]!;
        const d = edges[e + 2]!;
        const al =
          (1 - d / R) *
          0.38 *
          (a.amb || b.amb ? Math.max(neural, 0.35) : neural);
        if (al < 0.01) continue;
        const colour =
          a.ai && b.ai && !blend
            ? AZ
            : blend > 0.2 && a.depth + b.depth > 1.3
              ? DEEP_ICE
              : ICE;
        ctx.strokeStyle = rgba(
          colour,
          al * (blend ? 0.6 + (a.depth + b.depth) * 0.45 : 1),
        );
        ctx.beginPath();
        ctx.moveTo(X(a.x), Y(a.y));
        ctx.lineTo(X(b.x), Y(b.y));
        ctx.stroke();
      }
      // fire new signals
      const count = edges.length / 3;
      const rate = (neural + blend * 1.5) * (mobile ? 5 : 9) + 0.6;
      for (let k = 0; k < ((rate * dt) / 16) * 0.35; k++) {
        const e = ((rnd() * count) | 0) * 3;
        if (e >= edges.length) break;
        spawn(edges[e]!, edges[e + 1]!, nodes[edges[e]!]!.ai);
      }
    }

    // cursor neuron
    if (mouse.on) {
      ctx.lineWidth = 1;
      for (const n of nodes) {
        const d = Math.hypot(n.x - mouse.x, n.y - mouse.y);
        if (d < 150) {
          ctx.strokeStyle = rgba(AZ, (1 - d / 150) * 0.55);
          ctx.beginPath();
          ctx.moveTo(X(mouse.x), Y(mouse.y));
          ctx.lineTo(X(n.x), Y(n.y));
          ctx.stroke();
        }
      }
      ctx.fillStyle = rgba(AZ, 0.9);
      ctx.beginPath();
      ctx.arc(X(mouse.x), Y(mouse.y), 3.5, 0, TAU);
      ctx.fill();
    }

    // skeleton (letter outlines forming)
    if (skelA > 0.01) {
      ctx.lineWidth = 1.3;
      for (const [i, j] of skel) {
        const a = nodes[i]!;
        const b = nodes[j]!;
        const k = Math.min(a.k, b.k);
        if (k < 0.05) continue;
        ctx.strokeStyle = rgba(a.ai ? AZ : SILVER, skelA * k * 0.9);
        ctx.beginPath();
        ctx.moveTo(X(a.x), Y(a.y));
        ctx.lineTo(X(b.x), Y(b.y));
        ctx.stroke();
      }
      // signals racing along the outlines
      if (skelA > 0.2 && rnd() < 0.5) {
        const e = skel[(rnd() * skel.length) | 0];
        if (e) spawn(e[0], e[1], nodes[e[0]]!.ai);
      }
    }

    // colourless GÁTAI: a matte, flat fill that holds for a beat, trembles, then blows apart
    const mf =
      ease(seg(p, T.matte[0], T.matte[1])) *
      (1 - seg(p, T.boom[0], T.boom[0] + 0.012));
    if (mf > 0) {
      ctx.save();
      ctx.translate(OX, OY);
      ctx.scale(S, S);
      const sh = seg(p, T.shake[0], T.shake[1]);
      if (sh > 0)
        ctx.translate(
          Math.sin(now * 0.08) * 3 * sh,
          Math.cos(now * 0.1) * 2 * sh,
        );
      ctx.globalAlpha = mf * 0.92;
      for (const s of shapes) {
        if (s.role === "studio") continue;
        ctx.save();
        ctx.translate(s.dx, 0);
        ctx.fillStyle = s.role === "ai" ? "#2F9BFF" : "#AEB5C1";
        ctx.fill(s.p2d);
        ctx.restore();
      }
      ctx.restore();
    }
    flash(T.boom[0], T.boom[0] + 0.05, 0.9, "220,238,255"); // the blast
    flash(T.snap[1] - 0.004, T.snap[1] + 0.04, 0.7, "120,190,255"); // impact on the snap back

    // filled logo: an ignition wave runs left to right, letters light up white-hot behind it,
    // cool into chrome, and the AI flares azure when the wave reaches it
    const wave = ease(seg(p, T.wave[0], T.wave[1]));
    const waveX = -90 + wave * 1000;
    if (wave > 0) {
      ctx.save();
      ctx.translate(OX, OY);
      ctx.scale(S, S);
      // AI flare: spikes when the wave crosses x≈560, settles to a steady glow
      const aiHit = clamp((waveX - 560) / 120);
      const flare =
        aiHit > 0 ? Math.max(0.35, Math.exp(-((waveX - 640) ** 2) / 9000)) : 0;

      ctx.save();
      ctx.beginPath();
      ctx.rect(-200, -200, waveX + 200, 600);
      ctx.clip();
      for (const s of shapes) {
        if (s.role === "studio") continue;
        ctx.save();
        ctx.translate(s.dx, 0);
        if (s.role === "ai") {
          ctx.shadowColor = `rgba(47,155,255,${0.55 + 0.45 * flare})`;
          ctx.shadowBlur = 18 + 70 * flare;
        } else {
          ctx.shadowColor = "rgba(160,200,255,.25)";
          ctx.shadowBlur = 16;
        }
        ctx.fillStyle = s.role === "ai" ? az : sil;
        ctx.fill(s.p2d);
        ctx.restore();
      }
      // STUDIO appears under the beam as it passes, so the logo completes when the beam exits
      ctx.shadowColor = "rgba(160,200,255,.3)";
      ctx.shadowBlur = 10;
      ctx.fillStyle = "#D3D9E3";
      ctx.fill(studio);
      ctx.shadowBlur = 0;
      // heat trail: white-hot just behind the front, cooling over ~160 units
      ctx.clip(all);
      if (wave < 1) {
        const hot = ctx.createLinearGradient(waveX - 170, 0, waveX, 0);
        hot.addColorStop(0, "rgba(255,255,255,0)");
        hot.addColorStop(0.7, "rgba(190,230,255,.55)");
        hot.addColorStop(1, "rgba(255,255,255,1)");
        ctx.fillStyle = hot;
        ctx.fillRect(waveX - 170, -50, 170, 300);
      }
      // AI charge: azure light poured over the letters while flaring
      if (flare > 0.36) {
        ctx.globalCompositeOperation = "lighter";
        ctx.fillStyle = `rgba(47,155,255,${(flare - 0.35) * 0.7})`;
        ctx.fillRect(500, 0, 400, 220);
        ctx.globalCompositeOperation = "source-over";
      }
      ctx.restore();

      // the front itself: a beam of light slightly taller than the letters
      if (wave > 0 && wave < 1) {
        ctx.save();
        ctx.globalCompositeOperation = "lighter";
        const beam = ctx.createLinearGradient(waveX - 26, 0, waveX + 26, 0);
        beam.addColorStop(0, "rgba(47,155,255,0)");
        beam.addColorStop(0.5, "rgba(200,235,255,.9)");
        beam.addColorStop(1, "rgba(47,155,255,0)");
        ctx.fillStyle = beam;
        ctx.fillRect(waveX - 26, 10, 52, 272);
        ctx.fillStyle = "rgba(255,255,255,.95)";
        ctx.fillRect(waveX - 1.2, 30, 2.4, 238);
        // sparks thrown off the beam
        for (let i = 0; i < 14; i++) {
          const yy = rnd() < 0.8 ? 44 + rnd() * 132 : 228 + rnd() * 34;
          const xx = waveX - rnd() * 40;
          ctx.fillStyle = `rgba(${rnd() < 0.5 ? "255,255,255" : "120,200,255"},${0.5 + rnd() * 0.5})`;
          ctx.fillRect(xx, yy, 2 + rnd() * 3, 1.4);
        }
        ctx.restore();
      }

      // impact debris: streaks fly out of the letter edges and burn out
      const df = seg(p, T.snap[1] - 0.002, T.snap[1] + 0.09);
      if (df > 0 && df < 1) {
        ctx.save();
        ctx.globalCompositeOperation = "lighter";
        const go = 1 - Math.pow(2, -9 * df);
        const fade = Math.pow(1 - df, 1.6);
        for (const k of sparks) {
          const n = nodes[k.i]!;
          const d = go * k.len;
          const tail = Math.min(d, 26 + k.len * 0.25 * (1 - df));
          const x1 = n.tx + k.ca * (d - tail);
          const y1 = n.ty + k.sa * (d - tail);
          const x2 = n.tx + k.ca * d;
          const y2 = n.ty + k.sa * d;
          const c = n.ai ? "90,180,255" : "235,243,255";
          const lg = ctx.createLinearGradient(x1, y1, x2, y2);
          lg.addColorStop(0, `rgba(${c},0)`);
          lg.addColorStop(1, `rgba(${c},${fade})`);
          ctx.strokeStyle = lg;
          ctx.lineWidth = k.w;
          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);
          ctx.stroke();
          ctx.fillStyle = `rgba(${c},${fade})`;
          ctx.beginPath();
          ctx.arc(x2, y2, k.w * 1.3, 0, TAU);
          ctx.fill();
        }
        ctx.restore();
      }

      ctx.restore();
      // nodes catch fire as the front passes them
      if (wave < 1)
        for (const n of nodes)
          if (!n.amb && Math.abs(n.x - waveX) < 18) n.glow = 1;
    }

    // pulses
    pulses = pulses.filter((q) => {
      q.t += (q.v * dt) / 16;
      const a = nodes[q.a]!;
      const b = nodes[q.b]!;
      if (q.t >= 1) {
        b.glow = 1;
        // cascade: a firing neuron passes the signal on
        if (q.hop < 3 && rnd() < 0.55 * Math.max(neural, skelA)) {
          for (let k = 0; k < 6; k++) {
            const c = (rnd() * nodes.length) | 0;
            const n = nodes[c]!;
            if (Math.hypot(n.x - b.x, n.y - b.y) < R * 1.1 && c !== q.b) {
              pulses.push({
                a: q.b,
                b: c,
                t: 0,
                v: q.v,
                ai: n.ai,
                hop: q.hop + 1,
              });
              break;
            }
          }
        }
        return false;
      }
      const x = a.x + (b.x - a.x) * q.t;
      const y = a.y + (b.y - a.y) * q.t;
      ctx.fillStyle = rgba(q.ai ? AZ : WHITE, 0.95 * nodeA);
      ctx.beginPath();
      ctx.arc(X(x), Y(y), 1.8, 0, TAU);
      ctx.fill();
      return true;
    });

    // nodes
    for (const n of nodes) {
      n.glow *= 0.93;
      const base = n.amb ? 0.35 * Math.max(neural, 0.4) : 0.75;
      const a =
        Math.min(1, base + n.glow) * nodeA * (n.amb ? 1 : 1 - fill * 0.6);
      if (a < 0.02) continue;
      const dep = blend * (n.depth - 0.5);
      const r =
        ((n.amb ? 1.3 : 1.8) + n.glow * 2.6) * (1 + dep * 1.4 + blend * 0.25);
      const colour = n.ai
        ? AZ
        : n.glow > 0.3
          ? WHITE
          : blend > 0.3 && n.depth > 0.6
            ? ICE
            : SILVER;
      ctx.fillStyle = rgba(colour, clamp(a * (1 + dep)));
      ctx.beginPath();
      ctx.arc(X(n.x), Y(n.y), r, 0, TAU);
      ctx.fill();
      if (n.glow > 0.2) {
        ctx.fillStyle = rgba(AZ, n.glow * 0.25 * nodeA);
        ctx.beginPath();
        ctx.arc(X(n.x), Y(n.y), r * 3.2, 0, TAU);
        ctx.fill();
      }
    }

    const next = neuralPhase(p);
    if (next !== phase) {
      phase = next;
      onPhase?.(next);
    }
  }

  function frame(now: number) {
    raf = 0;
    const dt = Math.min(50, Math.max(0, now - last));
    last = now;
    p = approach(p, target, dt);
    positions(now);
    draw(now, dt);
    if (active) raf = requestAnimationFrame(frame);
  }

  function schedule() {
    if (!raf) raf = requestAnimationFrame(frame);
  }

  return {
    setTarget(value) {
      target = clamp(Number.isFinite(value) ? value : 0);
    },
    jumpTo(value) {
      target = p = clamp(Number.isFinite(value) ? value : 0);
      schedule();
    },
    pointer(clientX, clientY) {
      const r = canvas.getBoundingClientRect();
      mouse.x = (clientX - r.left - OX) / S;
      mouse.y = (clientY - r.top - OY) / S;
      mouse.on = true;
    },
    pointerLeave() {
      mouse.on = false;
      mouse.x = mouse.y = -1e4;
    },
    setActive(next) {
      if (next === active) return;
      active = next;
      if (active) {
        last = performance.now();
        schedule();
      } else if (raf) {
        cancelAnimationFrame(raf);
        raf = 0;
      }
    },
    resize() {
      resize();
      schedule();
    },
    destroy() {
      active = false;
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
      pulses = [];
    },
    get progress() {
      return p;
    },
  };
}
