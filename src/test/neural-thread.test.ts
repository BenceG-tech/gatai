import { describe, expect, it } from "vitest";
import {
  FORMATIONS,
  formationTargets,
  handoff,
  isFormation,
} from "@/lib/neural-thread";

describe("neural thread formations", () => {
  it("lays out every formation deterministically and on (or near) the screen", () => {
    for (const f of FORMATIONS) {
      for (const [w, h] of [
        [1440, 900],
        [390, 844],
      ] as const) {
        const a = formationTargets(f, 120, w, h);
        expect(Array.from(formationTargets(f, 120, w, h))).toEqual(
          Array.from(a),
        );
        for (let i = 0; i < 120; i++) {
          const x = a[i * 2]!;
          const y = a[i * 2 + 1]!;
          expect(Number.isFinite(x) && Number.isFinite(y)).toBe(true);
          expect(x).toBeGreaterThan(-0.15 * w);
          expect(x).toBeLessThan(1.15 * w);
          expect(y).toBeGreaterThan(-0.1 * h);
          expect(y).toBeLessThan(1.1 * h);
        }
      }
    }
  });

  it("gives each section a visibly different shape", () => {
    const spread = (f: (typeof FORMATIONS)[number]) => {
      const a = formationTargets(f, 100, 1000, 1000);
      let minY = Infinity;
      let maxY = -Infinity;
      for (let i = 0; i < 100; i++) {
        minY = Math.min(minY, a[i * 2 + 1]!);
        maxY = Math.max(maxY, a[i * 2 + 1]!);
      }
      return maxY - minY;
    };
    expect(spread("logo")).toBeLessThan(200);
    expect(spread("converge")).toBeLessThan(450);
    expect(spread("drift")).toBeGreaterThan(800);
  });

  it("only validates known formation names", () => {
    expect(isFormation("sphere")).toBe(true);
    expect(isFormation("tornado")).toBe(false);
    expect(isFormation(undefined)).toBe(false);
  });

  it("hands off from the hero as it scrolls away", () => {
    expect(handoff(900, 900)).toBe(0);
    expect(handoff(2000, 900)).toBe(0);
    expect(handoff(0, 900)).toBe(1);
    const mid = handoff(650, 900);
    expect(mid).toBeGreaterThan(0);
    expect(mid).toBeLessThan(1);
    expect(handoff(Number.NaN, 900)).toBe(1);
  });
});
