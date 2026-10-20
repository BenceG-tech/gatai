import { useEffect, useRef } from "react";
import { useMotionAllowed } from "@/lib/motion";
import { cn } from "@/lib/utils";

/*
 * Smaller cousin of the hero network: drifting neurons, proximity synapses,
 * impulses that cascade along them, and (on pointer devices) a cursor neuron
 * that wires itself to nearby nodes. 2D canvas, paused offscreen and in hidden
 * tabs; with reduced motion it draws a single still frame.
 */

type Neuron = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  azure: boolean;
  glow: number;
  ph: number;
};
type Impulse = { a: number; b: number; t: number; v: number };

function seeded(seed: number) {
  let s = seed;
  return () => (s = (s * 16807) % 2147483647) / 2147483647;
}

export function NeuralMesh({
  className,
  density = 1,
  label = "Neurális háló animáció",
}: {
  className?: string;
  density?: number;
  label?: string;
}) {
  const ref = useRef<HTMLCanvasElement>(null);
  const allowed = useMotionAllowed();

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas || allowed === null) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const rnd = seeded(23);
    let W = 0;
    let H = 0;
    let dpr = 1;
    let nodes: Neuron[] = [];
    let impulses: Impulse[] = [];
    const mouse = { x: 0, y: 0, on: false };
    let raf = 0;
    let last = performance.now();
    let inView = false;
    const linkR = () => Math.max(90, Math.min(150, W / 9));

    const build = () => {
      dpr = Math.min(2, window.devicePixelRatio || 1);
      const r = canvas.getBoundingClientRect();
      W = r.width;
      H = r.height;
      canvas.width = Math.max(1, Math.round(W * dpr));
      canvas.height = Math.max(1, Math.round(H * dpr));
      const count = Math.round(
        Math.max(28, Math.min(120, (W * H) / 9000)) * density,
      );
      nodes = Array.from({ length: count }, () => ({
        x: rnd() * W,
        y: rnd() * H,
        vx: (rnd() - 0.5) * 0.12,
        vy: (rnd() - 0.5) * 0.12,
        azure: rnd() < 0.18,
        glow: 0,
        ph: rnd() * 6.28,
      }));
      impulses = [];
    };

    const draw = (dt: number, still: boolean) => {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);
      const R = linkR();
      if (!still)
        for (const n of nodes) {
          n.x += n.vx * dt * 0.06 * 16;
          n.y += n.vy * dt * 0.06 * 16;
          if (n.x < -20) n.x = W + 20;
          if (n.x > W + 20) n.x = -20;
          if (n.y < -20) n.y = H + 20;
          if (n.y > H + 20) n.y = -20;
          if (mouse.on) {
            const dx = mouse.x - n.x;
            const dy = mouse.y - n.y;
            const d = Math.hypot(dx, dy);
            if (d < 180 && d > 1) {
              n.x += (dx / d) * 0.25;
              n.y += (dy / d) * 0.25;
            }
          }
        }
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
      ctx.lineWidth = 1;
      for (const [i, j, d] of edges) {
        const a = nodes[i]!;
        const b = nodes[j]!;
        const azure = a.azure && b.azure;
        ctx.strokeStyle = azure
          ? `rgba(47,155,255,${(1 - d / R) * 0.5})`
          : `rgba(191,228,255,${(1 - d / R) * 0.22})`;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
      }
      if (
        !still &&
        edges.length &&
        impulses.length < 40 &&
        rnd() < 0.12 * (dt / 16)
      ) {
        const e = edges[(rnd() * edges.length) | 0]!;
        impulses.push({ a: e[0], b: e[1], t: 0, v: 0.012 + rnd() * 0.02 });
      }
      if (mouse.on) {
        for (const n of nodes) {
          const d = Math.hypot(n.x - mouse.x, n.y - mouse.y);
          if (d < 170) {
            ctx.strokeStyle = `rgba(47,155,255,${(1 - d / 170) * 0.6})`;
            ctx.beginPath();
            ctx.moveTo(mouse.x, mouse.y);
            ctx.lineTo(n.x, n.y);
            ctx.stroke();
            if (d < 60) n.glow = Math.max(n.glow, 0.6);
          }
        }
        ctx.fillStyle = "rgba(47,155,255,.95)";
        ctx.beginPath();
        ctx.arc(mouse.x, mouse.y, 3.5, 0, 6.29);
        ctx.fill();
      }
      const spawned: Impulse[] = [];
      impulses = impulses.filter((q) => {
        q.t += (q.v * dt) / 16;
        const a = nodes[q.a];
        const b = nodes[q.b];
        if (!a || !b) return false;
        if (q.t >= 1) {
          b.glow = 1;
          if (rnd() < 0.6) {
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
        ctx.fillStyle = "rgba(255,255,255,.95)";
        ctx.beginPath();
        ctx.arc(a.x + (b.x - a.x) * q.t, a.y + (b.y - a.y) * q.t, 1.7, 0, 6.29);
        ctx.fill();
        return true;
      });
      impulses.push(...spawned);
      for (const n of nodes) {
        n.glow *= 0.94;
        const r = 1.5 + n.glow * 2.4;
        ctx.fillStyle = n.azure
          ? "rgba(47,155,255,.9)"
          : n.glow > 0.3
            ? "rgba(255,255,255,.95)"
            : "rgba(223,229,238,.62)";
        ctx.beginPath();
        ctx.arc(n.x, n.y, r, 0, 6.29);
        ctx.fill();
        if (n.glow > 0.2) {
          ctx.fillStyle = `rgba(47,155,255,${n.glow * 0.22})`;
          ctx.beginPath();
          ctx.arc(n.x, n.y, r * 3.4, 0, 6.29);
          ctx.fill();
        }
      }
    };

    const frame = (now: number) => {
      raf = 0;
      const dt = Math.min(50, now - last);
      last = now;
      draw(dt, false);
      if (inView && !document.hidden) raf = requestAnimationFrame(frame);
    };
    const start = () => {
      if (!allowed || raf || !inView || document.hidden) return;
      last = performance.now();
      raf = requestAnimationFrame(frame);
    };

    build();
    if (!allowed) draw(16, true);
    const observer = new IntersectionObserver(([entry]) => {
      inView = !!entry?.isIntersecting;
      start();
    });
    observer.observe(canvas);
    const sizes = new ResizeObserver(() => {
      build();
      if (!allowed) draw(16, true);
    });
    sizes.observe(canvas);
    const host = canvas.parentElement ?? canvas;
    const move = (event: PointerEvent) => {
      if (!allowed || event.pointerType === "touch") return;
      const r = canvas.getBoundingClientRect();
      mouse.x = event.clientX - r.left;
      mouse.y = event.clientY - r.top;
      mouse.on = true;
    };
    const leave = () => {
      mouse.on = false;
    };
    host.addEventListener("pointermove", move);
    host.addEventListener("pointerleave", leave);
    document.addEventListener("visibilitychange", start);
    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
      sizes.disconnect();
      host.removeEventListener("pointermove", move);
      host.removeEventListener("pointerleave", leave);
      document.removeEventListener("visibilitychange", start);
    };
  }, [allowed, density]);

  return (
    <canvas
      ref={ref}
      className={cn("neural-mesh", className)}
      role="img"
      aria-label={label}
    />
  );
}
