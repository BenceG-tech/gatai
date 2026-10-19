import { describe, expect, it } from "vitest";
import { logoStory, logoBoundary, movableLogoRegion, networkTarget } from "@/lib/logo-story";

describe("identity-preserving scroll choreography", () => {
  it("returns every fragment to its exact opening position", () => {
    expect(logoStory(4)).toEqual(logoStory(0));
    expect(logoStory(0)).toEqual({ spread: 0, network: 0, intact: true });
    expect(logoStory(2)).toEqual({ spread: 1, network: 1, intact: false });
  });
  it("keeps both AI letters and the STUDIO row out of the disassembly", () => {
    for (let v = 0; v <= 1; v += 0.05)
      expect(movableLogoRegion(logoBoundary(v) + 0.01, v)).toBe(false);
    expect(movableLogoRegion(0.65, 0.66)).toBe(true); // The T's overhanging right arm.
    for (let u = 0; u <= 1; u += 0.01) expect(movableLogoRegion(u, 0.35)).toBe(false);
    expect(movableLogoRegion(0.3, 0.6)).toBe(true);
  });
  it("scrubs reversibly with bounded poses and repeatable network paths", () => {
    const forward = Array.from({ length: 401 }, (_, i) => logoStory(i / 100));
    for (let i = 400; i >= 0; i--) {
      expect(logoStory(i / 100)).toEqual(forward[i]);
      expect(forward[i]!.spread).toBeGreaterThanOrEqual(0);
      expect(forward[i]!.spread).toBeLessThanOrEqual(1);
    }
    expect(logoStory(NaN)).toEqual(logoStory(0));
    expect(logoStory(-100)).toEqual(logoStory(0));
    expect(logoStory(100)).toEqual(logoStory(4));
    expect(networkTarget(-2, 1, 17)).toEqual(networkTarget(-2, 1, 17));
    expect(networkTarget(-2, 1, 17)[2]).toBeLessThan(0);
  });
});
