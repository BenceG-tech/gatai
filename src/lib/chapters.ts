/** Scroll chapters of the home hero; mapped onto the neural-logo timeline by `timelineFromChapter`. */
export const CHAPTERS = [0, 1, 2, 3, 4] as const;

/**
 * Maps scroll position to a continuous chapter value in [0, 4].
 * A chapter "arrives" when its section top crosses 60% of the viewport height.
 * `tops` are document-space section tops; missing sections (NaN) are skipped.
 */
export function chapterProgress(tops: number[], scrollY: number, vh: number): number {
  const marker = scrollY + vh * 0.6;
  const pts = tops
    .map((t, k) => ({ k, t: k === 0 ? vh * 0.6 : t }))
    .filter((p) => Number.isFinite(p.t));
  if (pts.length < 2) return 0;
  if (marker <= pts[0]!.t) return pts[0]!.k;
  for (let i = 0; i < pts.length - 1; i++) {
    const a = pts[i]!, b = pts[i + 1]!;
    if (marker < b.t) {
      const span = Math.max(1, b.t - a.t);
      return a.k + ((marker - a.t) / span) * (b.k - a.k);
    }
  }
  return pts[pts.length - 1]!.k;
}
