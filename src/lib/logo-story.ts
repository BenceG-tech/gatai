const clamp = (n: number) => Math.max(0, Math.min(1, n));
export function smoother(n: number) {
  const t = clamp(n);
  return t * t * t * (t * (t * 6 - 15) + 10);
}

/** Reversible scroll pose. The camera and AI never change scale or position. */
export function logoStory(progress: number) {
  const p = Number.isFinite(progress) ? Math.max(0, Math.min(4, progress)) : 0;
  const spread = smoother((p - 0.35) / 1.1) * (1 - smoother((p - 2.5) / 1.12));
  return { spread, network: smoother(spread), intact: spread === 0 };
}

export function stableNoise(n: number) {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}

/** Upper chrome letters only. The blue AI and STUDIO remain part of the same unmoving image. */
export function logoBoundary(v: number) {
  return 0.6 + Math.max(0, Math.min(0.3, v - 0.4)) * 0.3;
}

export function movableLogoRegion(u: number, v: number) {
  return u < logoBoundary(v) && v > 0.4;
}

export function networkTarget(x: number, y: number, seed: number): [number, number, number] {
  return [
    -0.3 + x * 0.95 + (stableNoise(seed) - 0.5) * 0.9,
    0.2 + y * 0.9 + (stableNoise(seed + 7) - 0.5) * 1.4,
    -0.3 - stableNoise(seed + 13) * 2.4,
  ];
}
