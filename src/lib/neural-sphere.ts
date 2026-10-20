/*
 * Neural sphere graph: the same sphere language as the hero's explosion phase
 * (Fibonacci sphere, ragged shell between 0.82 and 1.18), wired to its
 * nearest neighbours. Pure and deterministic, so the R3F scene and its static
 * SVG fallback (rendered on the server) show the same network.
 */

export type SphereGraph = {
  count: number;
  /** xyz triplets on a unit-ish sphere (radius scaled by the shell factor). */
  positions: Float32Array;
  /** 1 for azure nodes, 0 for silver ones. */
  azure: Uint8Array;
  /** Index pairs (a, b) with a < b, each pair listed once. */
  edges: Uint32Array;
  /** Edge indices touching each node, for cascading impulses. */
  adjacency: number[][];
};

const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5));

function seeded(seed: number) {
  let s = seed % 2147483647 || 7;
  return () => (s = (s * 16807) % 2147483647) / 2147483647;
}

export function sphereGraph(
  count: number,
  { neighbours = 3, maxDistance = 0.5, azureShare = 0.16, seed = 11 } = {},
): SphereGraph {
  const n = Math.max(4, Math.floor(count));
  const rnd = seeded(seed);
  const positions = new Float32Array(n * 3);
  const azure = new Uint8Array(n);
  for (let i = 0; i < n; i++) {
    const y = 1 - (i / (n - 1)) * 2;
    const r = Math.sqrt(Math.max(0, 1 - y * y));
    const th = GOLDEN_ANGLE * i;
    const shell = 0.82 + (((i * 2654435761) % 1000) / 1000) * 0.36;
    positions[i * 3] = Math.cos(th) * r * shell;
    positions[i * 3 + 1] = y * shell;
    positions[i * 3 + 2] = Math.sin(th) * r * shell;
    azure[i] = rnd() < azureShare ? 1 : 0;
  }

  const seen = new Set<number>();
  const pairs: number[] = [];
  const dist = new Float64Array(n);
  for (let i = 0; i < n; i++) {
    const ix = positions[i * 3]!;
    const iy = positions[i * 3 + 1]!;
    const iz = positions[i * 3 + 2]!;
    for (let j = 0; j < n; j++) {
      const dx = positions[j * 3]! - ix;
      const dy = positions[j * 3 + 1]! - iy;
      const dz = positions[j * 3 + 2]! - iz;
      dist[j] = i === j ? Infinity : Math.hypot(dx, dy, dz);
    }
    // k nearest by insertion: O(n·k) per node instead of a full sort
    const nearest: number[] = [];
    for (let j = 0; j < n; j++) {
      const d = dist[j]!;
      if (nearest.length === neighbours && d >= dist[nearest[neighbours - 1]!]!)
        continue;
      let at = nearest.length;
      while (at > 0 && dist[nearest[at - 1]!]! > d) at--;
      nearest.splice(at, 0, j);
      if (nearest.length > neighbours) nearest.pop();
    }
    for (const j of nearest) {
      if (dist[j]! > maxDistance) continue;
      const a = Math.min(i, j);
      const b = Math.max(i, j);
      const key = a * n + b;
      if (seen.has(key)) continue;
      seen.add(key);
      pairs.push(a, b);
    }
  }

  const edges = Uint32Array.from(pairs);
  const adjacency: number[][] = Array.from({ length: n }, () => []);
  for (let e = 0; e < edges.length / 2; e++) {
    adjacency[edges[e * 2]!]!.push(e);
    adjacency[edges[e * 2 + 1]!]!.push(e);
  }
  return { count: n, positions, azure, edges, adjacency };
}

export type ProjectedNode = {
  x: number;
  y: number;
  depth: number;
  azure: boolean;
};

/** Orthographic projection after a Y spin and X tilt; depth 0 = back, 1 = front. */
export function projectSphere(
  graph: SphereGraph,
  spin: number,
  tilt = 0.35,
): ProjectedNode[] {
  const cs = Math.cos(spin);
  const ss = Math.sin(spin);
  const ct = Math.cos(tilt);
  const st = Math.sin(tilt);
  const out: ProjectedNode[] = [];
  for (let i = 0; i < graph.count; i++) {
    const x = graph.positions[i * 3]!;
    const y = graph.positions[i * 3 + 1]!;
    const z = graph.positions[i * 3 + 2]!;
    const x1 = x * cs + z * ss;
    const z1 = -x * ss + z * cs;
    const y2 = y * ct - z1 * st;
    const z2 = y * st + z1 * ct;
    out.push({
      x: x1,
      y: y2,
      depth: (z2 / 1.18 + 1) / 2,
      azure: graph.azure[i] === 1,
    });
  }
  return out;
}
