/*
 * Timeline of the approved neural logo animation (prototype v2.4, approved by
 * Gátai Bence on 2026-10-19). `p` runs from 0 to 1 and is scrubbed by scroll,
 * forward and backward. Every value here is a pure function of `p`, so the
 * same scroll position always produces the same phase.
 *
 * Phases: brain-shaped network fires → nodes settle onto the letter outlines →
 * matte GÁTAI (azure AI) trembles → explosion into a rotating neural sphere →
 * snap back → a vertical beam sweeps left to right, igniting chrome/azure
 * GÁTAI and revealing STUDIO, so the full logo is complete when it exits.
 */

export const clamp = (v: number, a = 0, b = 1) => Math.max(a, Math.min(b, v));

/** Cubic ease in-out, as in the prototype. */
export const ease = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
export const easeOutExpo = (t: number) =>
  t >= 1 ? 1 : 1 - Math.pow(2, -10 * t);
export const easeInCubic = (t: number) => t * t * t;

/** Normalised position of `p` inside [a, b], clamped to 0..1. */
export const seg = (p: number, a: number, b: number) =>
  clamp((p - a) / (b - a));

/** Phase boundaries (unchanged from the prototype). */
export const T = {
  settle: [0.14, 0.46],
  matte: [0.46, 0.52],
  shake: [0.52, 0.555],
  boom: [0.555, 0.63],
  hold: 0.68,
  snap: [0.68, 0.735],
  wave: [0.735, 0.84],
} as const;

export type NeuralPhase =
  "fire" | "settle" | "matte" | "sphere" | "snap" | "logo";

export const PHASE_LABELS: Record<NeuralPhase, string> = {
  fire: "Idegsejtek tüzelnek",
  settle: "A háló betűkké rendeződik",
  matte: "GÁTAI, még színek nélkül",
  sphere: "Robbanás: neurális gömb",
  snap: "Visszarántás",
  logo: "A logó színekkel",
};

export function neuralPhase(p: number): NeuralPhase {
  if (p < 0.22) return "fire";
  if (p < 0.46) return "settle";
  if (p < 0.555) return "matte";
  if (p < T.snap[0]) return "sphere";
  if (p < T.snap[1]) return "snap";
  return "logo";
}

/** Global layer weights for a timeline value. */
export function stageState(p: number) {
  const t = clamp(Number.isFinite(p) ? p : 0);
  const explode = easeOutExpo(seg(t, T.boom[0], T.boom[1]));
  const back = easeInCubic(seg(t, T.snap[0], T.snap[1]));
  const blend = explode * (1 - back);
  const neural = Math.max(1 - ease(seg(t, 0.22, 0.42)), blend);
  const skeleton =
    ease(seg(t, 0.3, 0.46)) *
    (1 - blend) *
    (1 - 0.75 * ease(seg(t, 0.8, 0.92)));
  const matte =
    ease(seg(t, T.matte[0], T.matte[1])) *
    (1 - seg(t, T.boom[0], T.boom[0] + 0.012));
  const wave = ease(seg(t, T.wave[0], T.wave[1]));
  return {
    /** Sphere weight: 0 = letters/brain, 1 = fully exploded sphere. */
    blend,
    /** Strength of the proximity synapse web. */
    neural,
    /** Letter-outline skeleton opacity. */
    skeleton,
    /** Matte, colourless GÁTAI fill. */
    matte,
    /** Beam sweep progress, 0..1. */
    wave,
    /** Beam front x in logo units (letters span roughly 0..850). */
    waveX: -90 + wave * 1000,
    /** Filled logo strength (dims the outline nodes). */
    fill: ease(seg(t, 0.735, 0.85)),
    /** Node opacity multiplier (nodes fade once the logo is lit). */
    nodes: 1 - 0.8 * ease(seg(t, 0.82, 0.95)),
    /** True once the full logo, including STUDIO, is complete. */
    complete: t >= T.wave[1],
  };
}

/** Number of scroll chapters on the home hero (see src/lib/chapters.ts). */
export const HERO_CHAPTERS = 4;

/** Maps the continuous chapter value (0..4) from `chapterProgress` onto p. */
export function timelineFromChapter(chapter: number): number {
  if (!Number.isFinite(chapter)) return 0;
  return clamp(chapter / HERO_CHAPTERS);
}

/**
 * Frame-rate independent approach of the drawn value toward the scroll target,
 * so wheel steps glide instead of jumping. Snaps once close enough.
 */
export function approach(
  current: number,
  target: number,
  dtMs: number,
  tauMs = 110,
): number {
  const next =
    current + (target - current) * (1 - Math.exp(-Math.max(0, dtMs) / tauMs));
  return Math.abs(target - next) < 1e-4 ? target : next;
}
