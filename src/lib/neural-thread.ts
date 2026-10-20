/*
 * Formations for the home page's continuous neural thread: one set of nodes
 * that leaves the hero logo and re-forms behind every section (drift field,
 * river, lattice, sphere halo, timeline, clusters, final core). Pure and
 * seeded, so the same viewport always gives the same layout.
 */

export const FORMATIONS = [
  "logo",
  "drift",
  "flow",
  "grid",
  "constellation",
  "sphere",
  "line",
  "converge",
] as const;
export type Formation = (typeof FORMATIONS)[number];

export function isFormation(value: unknown): value is Formation {
  return (
    typeof value === "string" &&
    (FORMATIONS as readonly string[]).includes(value)
  );
}

function seeded(seed: number) {
  let s = seed;
  return () => (s = (s * 16807) % 2147483647) / 2147483647;
}

/** Interleaved [x0, y0, x1, y1, …] targets in CSS pixels for `count` nodes. */
export function formationTargets(
  formation: Formation,
  count: number,
  width: number,
  height: number,
  seed = 31,
): Float32Array {
  const out = new Float32Array(count * 2);
  const rnd = seeded(seed + FORMATIONS.indexOf(formation) * 101);
  const w = Math.max(1, width);
  const h = Math.max(1, height);
  const narrow = w < 768;
  const set = (i: number, x: number, y: number) => {
    out[i * 2] = x;
    out[i * 2 + 1] = y;
  };

  for (let i = 0; i < count; i++) {
    const u = count > 1 ? i / (count - 1) : 0.5;
    switch (formation) {
      case "logo": {
        // a wordmark-shaped band where the hero logo was
        set(i, w * (0.16 + 0.68 * rnd()), h * (0.47 + (rnd() - 0.5) * 0.16));
        break;
      }
      case "drift": {
        set(i, w * (-0.04 + 1.08 * rnd()), h * (-0.04 + 1.08 * rnd()));
        break;
      }
      case "flow": {
        // three braided streams crossing the screen
        const band = i % 3;
        const x =
          w *
          (-0.08 + 1.16 * ((i / 3 / Math.ceil(count / 3) + rnd() * 0.02) % 1));
        const phase = band * 2.1;
        const y =
          h * (0.5 + (band - 1) * 0.08) +
          Math.sin((x / w) * Math.PI * 2.2 + phase) * h * 0.16 +
          (rnd() - 0.5) * h * 0.035;
        set(i, x, y);
        break;
      }
      case "grid": {
        const cols = narrow ? 6 : 12;
        const rows = Math.max(1, Math.ceil(count / cols));
        const c = i % cols;
        const r = Math.floor(i / cols);
        set(
          i,
          w * (0.04 + (0.92 * (c + 0.5)) / cols) + (rnd() - 0.5) * 6,
          h * (0.06 + (0.88 * (r + 0.5)) / rows) + (rnd() - 0.5) * 6,
        );
        break;
      }
      case "constellation": {
        const centres = narrow
          ? [
              [0.25, 0.22],
              [0.78, 0.4],
              [0.3, 0.62],
              [0.72, 0.84],
            ]
          : [
              [0.12, 0.25],
              [0.38, 0.72],
              [0.62, 0.2],
              [0.88, 0.62],
              [0.5, 0.48],
            ];
        const c = centres[i % centres.length]!;
        const a = rnd() * Math.PI * 2;
        const d = Math.sqrt(rnd()) * Math.min(w, h) * 0.13;
        set(i, w * c[0]! + Math.cos(a) * d, h * c[1]! + Math.sin(a) * d);
        break;
      }
      case "sphere": {
        // halo around the 3D sphere (right column on desktop)
        const cx = narrow ? w * 0.5 : w * 0.73;
        const cy = narrow ? h * 0.55 : h * 0.5;
        const R = Math.min(narrow ? w * 0.46 : w * 0.24, h * 0.42);
        const y = 1 - 2 * ((i + 0.5) / count);
        const ring = Math.sqrt(1 - y * y);
        const t = i * 2.399963;
        const shell = R * (1.02 + rnd() * 0.18);
        set(i, cx + Math.cos(t) * ring * shell, cy + y * shell * 0.96);
        break;
      }
      case "line": {
        // the process timeline: a beam across the screen with satellites
        const onBeam = i % 4 !== 0;
        const x = w * (0.02 + 0.96 * u);
        const y = onBeam
          ? h * 0.56 + (rnd() - 0.5) * 10
          : h * 0.56 + (rnd() < 0.5 ? -1 : 1) * h * (0.08 + rnd() * 0.2);
        set(i, x, y);
        break;
      }
      case "converge": {
        const a = rnd() * Math.PI * 2;
        const d = Math.pow(rnd(), 0.7) * Math.min(w, h) * 0.2;
        set(i, w * 0.5 + Math.cos(a) * d, h * 0.5 + Math.sin(a) * d);
        break;
      }
    }
  }
  return out;
}

/**
 * How visible the thread is while the pinned hero leaves the screen:
 * 0 while the hero still fills the viewport, 1 once it is mostly gone.
 */
export function handoff(heroBottom: number, viewportHeight: number): number {
  if (!Number.isFinite(heroBottom) || viewportHeight <= 0) return 1;
  const t = (viewportHeight - heroBottom) / (viewportHeight * 0.55);
  return Math.min(1, Math.max(0, t));
}
