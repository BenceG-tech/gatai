import { describe, expect, it } from "vitest";
import { chapterProgress } from "@/lib/chapters";

const vh = 1000;
const tops = [0, 1000, 2000, 4000, 6000];

describe("chapterProgress", () => {
  it("starts at chapter 0 at the top of the page", () => {
    expect(chapterProgress(tops, 0, vh)).toBe(0);
  });
  it("reaches chapter 2 exactly when its section top hits 60% of the viewport", () => {
    expect(chapterProgress(tops, 2000 - 600, vh)).toBe(2);
  });
  it("interpolates halfway between chapters 2 and 3", () => {
    expect(chapterProgress(tops, 3000 - 600, vh)).toBeCloseTo(2.5);
  });
  it("clamps to 4 past the last chapter", () => {
    expect(chapterProgress(tops, 99999, vh)).toBe(4);
  });
});
