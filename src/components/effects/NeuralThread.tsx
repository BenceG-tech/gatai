import { useEffect, useRef } from "react";
import { useFinePointer, useMotionAllowed } from "@/lib/motion";
import {
  formationTargets,
  handoff,
  isFormation,
  type Formation,
} from "@/lib/neural-thread";

/*
 * The home page's continuous thread: the hero logo's network does not end
 * with the hero. One fixed 2D canvas keeps the same neurons alive behind every
 * section and lets them re-form for whatever is on screen, so the page reads
 * as one uninterrupted scroll. Sections opt in with
 * `data-formation="drift|flow|grid|constellation|sphere|line|converge"`.
 *
 * - Fades in only as the pinned hero leaves the viewport (handoff), starting
 *   from a wordmark-shaped band where the logo was.
 * - Paused in hidden tabs; skipped entirely for reduced motion / motion off.
 * - Fewer nodes on small screens; cursor links only on fine pointers.
 */

type Node = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  azure: boolean;
  glow: number;
  ph: number;
};
type Impulse = { a: number; b: number; t: number; v: number };

export function NeuralThread() {
  const allowed = useMotionAllowed();
  const fine = useFinePointer();
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!allowed || !canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let W = 0;
    let H = 0;
    let dpr = 1;
    let nodes: Node[] = [];
    let targets: Float32Array = new Float32Array(0);
    let formation: Formation = "logo";
    let wanted: Formation = "drift";
    let logoBase: Float32Array = new Float32Array(0);
    let impulses: Impulse[] = [];
    let raf = 0;
    let last = performance.now();
    let seed = 7;
    const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
    const mouse = { x: -1e4, y: -1e4, on: false };
    const hero = document.querySelector<HTMLElement>(".neural-hero");

    const retarget = (next: Formation) => {
      formation = next;
      targets = formationTargets(next, nodes.length, W, H);
    };

    const build = () => {
      dpr = Math.min(1.5, window.devicePixelRatio || 1);
      W = window.innerWidth;
      H = window.innerHeight;
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      const count = W < 768 ? 64 : W < 1280 ? 110 : 140;
      if (nodes.length !== count) {
        const start = formationTargets("logo", count, W, H);
        nodes = Array.from({ length: count }, (_, i) => ({
          x: start[i * 2] ?? 0,
          y: start[i * 2 + 1] ?? 0,
          vx: 0,
          vy: 0,
          azure: rnd() < 0.2,
          glow: 0,
          ph: rnd() * Math.PI * 2,
        }));
        impulses = [];
      }
      logoBase = formationTargets("logo", count, W, H);
      retarget(formation);
    };

    const draw = (now: number, dt: number, alpha: number) => {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);
      if (alpha <= 0.001) return;
      ctx.globalAlpha = alpha;

      // critically damped spring toward the current formation + slow breathing
      const k = 1 - Math.exp(-dt / 520);
      const wobble = formation === "grid" || formation === "line" ? 3 : 9;
      nodes.forEach((n, i) => {
        const tx =
          (targets[i * 2] ?? n.x) + Math.sin(now * 0.00042 + n.ph) * wobble;
        const ty =
          (targets[i * 2 + 1] ?? n.y) +
          Math.cos(now * 0.00037 + n.ph * 1.3) * wobble;
        n.vx = (n.vx + (tx - n.x) * k) * 0.82;
        n.vy = (n.vy + (ty - n.y) * k) * 0.82;
        if (mouse.on) {
          const dx = n.x - mouse.x;
          const dy = n.y - mouse.y;
          const d = Math.hypot(dx, dy);
          if (d < 120 && d > 1) {
            n.vx += (dx / d) * 0.6;
            n.vy += (dy / d) * 0.6;
          }
        }
        n.x += n.vx;
        n.y += n.vy;
      });

      const R = Math.max(80, Math.min(140, W / 10));
      const edges: [number, number, number][] = [];
      for (let i = 0; i < nodes.length; i++) {
        const a = nodes[i]!;
        for (let j = i + 1; j < nodes.length; j++) {
          const b = nodes[j]!;
          const dx = a.x - b.x;
          if (dx > R || dx < -R) continue;
          const dy = a.y - b.y;
          if (dy > R || dy < -R) continue;
          const d = Math.hypot(dx, dy);
          if (d < R) edges.push([i, j, d]);
        }
      }
      // batched: 3 opacity buckets per colour instead of one stroke per edge
      ctx.lineWidth = 1;
      for (const azure of [false, true]) {
        for (let bucket = 0; bucket < 3; bucket++) {
          ctx.beginPath();
          let any = false;
          for (const [i, j, d] of edges) {
            const a = nodes[i]!;
            const b = nodes[j]!;
            if ((a.azure && b.azure) !== azure) continue;
            if (Math.min(2, Math.floor((1 - d / R) * 3)) !== bucket) continue;
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            any = true;
          }
          if (!any) continue;
          const f = (bucket + 0.5) / 3;
          ctx.strokeStyle = azure
            ? `rgba(47,155,255,${f * 0.34})`
            : `rgba(191,228,255,${f * 0.13})`;
          ctx.stroke();
        }
      }

      if (edges.length && impulses.length < 26 && rnd() < 0.09 * (dt / 16)) {
        const e = edges[(rnd() * edges.length) | 0]!;
        impulses.push({ a: e[0], b: e[1], t: 0, v: 0.014 + rnd() * 0.018 });
      }
      ctx.fillStyle = "rgba(255,255,255,.9)";
      ctx.beginPath();
      const spawned: Impulse[] = [];
      impulses = impulses.filter((q) => {
        q.t += (q.v * dt) / 16;
        const a = nodes[q.a];
        const b = nodes[q.b];
        if (!a || !b) return false;
        if (q.t >= 1) {
          b.glow = 1;
          if (rnd() < 0.55) {
            const next = edges.find(
              ([i, j]) => (i === q.b || j === q.b) && i !== q.a && j !== q.a,
            );
            if (next)
              spawned.push({
                a: q.b,
                b: next[0] === q.b ? next[1] : next[0],
                t: 0,
                v: q.v,
              });
          }
          return false;
        }
        const x = a.x + (b.x - a.x) * q.t;
        const y = a.y + (b.y - a.y) * q.t;
        ctx.moveTo(x + 1.5, y);
        ctx.arc(x, y, 1.5, 0, 6.29);
        return true;
      });
      impulses.push(...spawned);
      ctx.fill();

      if (mouse.on) {
        for (const n of nodes) {
          const d = Math.hypot(n.x - mouse.x, n.y - mouse.y);
          if (d < 160) {
            ctx.strokeStyle = `rgba(47,155,255,${(1 - d / 160) * 0.45})`;
            ctx.beginPath();
            ctx.moveTo(mouse.x, mouse.y);
            ctx.lineTo(n.x, n.y);
            ctx.stroke();
            if (d < 50) n.glow = Math.max(n.glow, 0.5);
          }
        }
      }

      // batched by colour: halos, then three node tints
      ctx.fillStyle = "rgba(47,155,255,.14)";
      ctx.beginPath();
      for (const n of nodes) {
        n.glow *= 0.95;
        if (n.glow <= 0.2) continue;
        const r = (1.3 + n.glow * 2.2) * 3.2;
        ctx.moveTo(n.x + r, n.y);
        ctx.arc(n.x, n.y, r, 0, 6.29);
      }
      ctx.fill();
      const tints: [string, (n: Node) => boolean][] = [
        ["rgba(223,229,238,.5)", (n) => !n.azure && n.glow <= 0.3],
        ["rgba(255,255,255,.9)", (n) => !n.azure && n.glow > 0.3],
        ["rgba(47,155,255,.85)", (n) => n.azure],
      ];
      for (const [colour, pick] of tints) {
        ctx.fillStyle = colour;
        ctx.beginPath();
        for (const n of nodes) {
          if (!pick(n)) continue;
          const r = 1.3 + n.glow * 2.2;
          ctx.moveTo(n.x + r, n.y);
          ctx.arc(n.x, n.y, r, 0, 6.29);
        }
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    };

    let shown = -1;
    const frame = (now: number) => {
      raf = 0;
      const dt = Math.min(50, Math.max(0, now - last));
      last = now;
      const bottom = hero ? hero.getBoundingClientRect().bottom : -Infinity;
      const alpha = hero ? handoff(bottom, H) : 1;
      // While the hero leaves, the nodes ride along on the logo band (the hero
      // canvas fades out over the same scroll range in CSS), so the logo
      // visibly dissolves into the thread. Released once the intro takes over.
      const parked = bottom > H * 0.42;
      if (parked) {
        formation = "logo";
        const shift = Math.min(0, bottom - H);
        targets = logoBase;
        nodes.forEach((n, i) => {
          n.x = logoBase[i * 2] ?? n.x;
          n.y = (logoBase[i * 2 + 1] ?? n.y) + shift;
          n.vx = 0;
          n.vy = shift === 0 ? 0 : -2;
        });
      } else if (formation !== wanted) retarget(wanted);
      if (alpha <= 0.001) {
        if (shown !== 0) draw(now, dt, 0);
      } else draw(now, dt, alpha);
      shown = alpha;
      if (!document.hidden) raf = requestAnimationFrame(frame);
    };
    const start = () => {
      if (raf || document.hidden) return;
      last = performance.now();
      raf = requestAnimationFrame(frame);
    };

    // the section crossing the middle of the viewport decides the formation
    const sections = [
      ...document.querySelectorAll<HTMLElement>("[data-formation]"),
    ];
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const next = (entry.target as HTMLElement).dataset["formation"];
          if (isFormation(next)) wanted = next;
        }
      },
      { rootMargin: "-48% 0px -48% 0px" },
    );
    sections.forEach((s) => io.observe(s));

    const move = (e: PointerEvent) => {
      if (e.pointerType === "touch") return;
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      mouse.on = true;
    };
    const leave = () => {
      mouse.on = false;
    };
    if (fine) {
      window.addEventListener("pointermove", move, { passive: true });
      document.addEventListener("pointerleave", leave);
    }
    const onResize = () => build();
    window.addEventListener("resize", onResize);
    document.addEventListener("visibilitychange", start);

    build();
    start();
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      window.removeEventListener("pointermove", move);
      document.removeEventListener("pointerleave", leave);
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", start);
    };
  }, [allowed, fine]);

  if (!allowed) return null;
  return <canvas ref={ref} className="neural-thread" aria-hidden="true" />;
}
