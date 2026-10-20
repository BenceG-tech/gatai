import { describe, expect, it } from "vitest";
import {
  PHASE_LABELS,
  T,
  approach,
  ease,
  neuralPhase,
  seg,
  stageState,
  timelineFromChapter,
} from "@/lib/neural-timeline";

describe("neural logo timeline", () => {
  it("keeps the approved phase boundaries in order", () => {
    const marks = [
      T.settle[0],
      T.settle[1],
      T.matte[1],
      T.shake[1],
      T.boom[1],
      T.hold,
      T.snap[1],
      T.wave[1],
    ];
    for (let i = 1; i < marks.length; i++)
      expect(marks[i]!).toBeGreaterThanOrEqual(marks[i - 1]!);
    expect(T.matte[1]).toBe(T.shake[0]);
    expect(T.shake[1]).toBe(T.boom[0]);
    expect(T.snap[1]).toBe(T.wave[0]);
  });

  it("names the phase for every timeline value", () => {
    expect(neuralPhase(0)).toBe("fire");
    expect(neuralPhase(0.3)).toBe("settle");
    expect(neuralPhase(0.5)).toBe("matte");
    expect(neuralPhase(0.6)).toBe("sphere");
    expect(neuralPhase(0.7)).toBe("snap");
    expect(neuralPhase(0.8)).toBe("logo");
    expect(neuralPhase(1)).toBe("logo");
    for (const phase of Object.values(PHASE_LABELS))
      expect(phase.length).toBeGreaterThan(5);
  });

  it("explodes into the sphere and snaps back", () => {
    expect(stageState(0.5).blend).toBe(0);
    expect(stageState(0.65).blend).toBeGreaterThan(0.95);
    expect(stageState(T.snap[1]).blend).toBe(0);
    expect(stageState(0.9).blend).toBe(0);
  });

  it("completes the full logo (with STUDIO) exactly when the beam exits", () => {
    expect(stageState(T.wave[0]).wave).toBe(0);
    expect(stageState(0.78).wave).toBeGreaterThan(0);
    expect(stageState(0.78).complete).toBe(false);
    expect(stageState(T.wave[1]).wave).toBe(1);
    expect(stageState(T.wave[1]).complete).toBe(true);
    // the beam front leaves the wordmark (≈850 logo units) when the wave ends
    expect(stageState(T.wave[1]).waveX).toBeGreaterThan(850);
  });

  it("is a pure function of p, so scrolling backward replays the same frames", () => {
    const forward = Array.from({ length: 1001 }, (_, i) =>
      stageState(i / 1000),
    );
    for (let i = 1000; i >= 0; i--)
      expect(stageState(i / 1000)).toEqual(forward[i]);
    expect(stageState(NaN)).toEqual(stageState(0));
    expect(stageState(-3)).toEqual(stageState(0));
    expect(stageState(7)).toEqual(stageState(1));
  });

  it("maps scroll chapters 0..4 onto the 0..1 timeline", () => {
    expect(timelineFromChapter(0)).toBe(0);
    expect(timelineFromChapter(2)).toBe(0.5);
    expect(timelineFromChapter(4)).toBe(1);
    expect(timelineFromChapter(9)).toBe(1);
    expect(timelineFromChapter(Number.NaN)).toBe(0);
  });

  it("eases and clamps like the prototype", () => {
    expect(seg(0.5, 0.4, 0.6)).toBeCloseTo(0.5);
    expect(seg(0, 0.4, 0.6)).toBe(0);
    expect(seg(1, 0.4, 0.6)).toBe(1);
    expect(ease(0)).toBe(0);
    expect(ease(0.5)).toBeCloseTo(0.5);
    expect(ease(1)).toBe(1);
  });

  it("glides toward the scroll target and settles exactly on it", () => {
    let p = 0;
    for (let i = 0; i < 120; i++) p = approach(p, 0.8, 16);
    expect(p).toBe(0.8);
    for (let i = 0; i < 120; i++) p = approach(p, 0.2, 16);
    expect(p).toBe(0.2);
    expect(approach(0.3, 0.6, 0)).toBe(0.3);
  });
});
