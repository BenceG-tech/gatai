import { describe, expect, it } from "vitest";
import { projectSphere, sphereGraph } from "@/lib/neural-sphere";

describe("neural sphere graph", () => {
  const graph = sphereGraph(240);

  it("is deterministic, so the server fallback matches the 3D scene", () => {
    const again = sphereGraph(240);
    expect(Array.from(again.positions)).toEqual(Array.from(graph.positions));
    expect(Array.from(again.edges)).toEqual(Array.from(graph.edges));
  });

  it("keeps every node on the ragged shell of the explosion sphere", () => {
    for (let i = 0; i < graph.count; i++) {
      const r = Math.hypot(
        graph.positions[i * 3]!,
        graph.positions[i * 3 + 1]!,
        graph.positions[i * 3 + 2]!,
      );
      expect(r).toBeGreaterThanOrEqual(0.82 * 0.999);
      expect(r).toBeLessThanOrEqual(1.18 * 1.001);
    }
  });

  it("wires unique, valid synapses and connects almost every node", () => {
    const seen = new Set<string>();
    for (let e = 0; e < graph.edges.length / 2; e++) {
      const a = graph.edges[e * 2]!;
      const b = graph.edges[e * 2 + 1]!;
      expect(a).toBeLessThan(b);
      expect(b).toBeLessThan(graph.count);
      seen.add(`${a}-${b}`);
    }
    expect(seen.size).toBe(graph.edges.length / 2);
    const connected = graph.adjacency.filter((list) => list.length > 0).length;
    expect(connected / graph.count).toBeGreaterThan(0.95);
    const azure = graph.azure.reduce((sum, v) => sum + v, 0);
    expect(azure).toBeGreaterThan(0);
    expect(azure).toBeLessThan(graph.count / 3);
  });

  it("projects with depth in 0..1", () => {
    for (const node of projectSphere(graph, 0.6)) {
      expect(node.depth).toBeGreaterThanOrEqual(0);
      expect(node.depth).toBeLessThanOrEqual(1);
    }
  });
});
