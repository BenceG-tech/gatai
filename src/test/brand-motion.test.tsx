import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { NeuralHero } from "@/components/hero/NeuralHero";
import { setMotionToggle } from "@/lib/motion";

const engine = {
  setTarget: vi.fn(),
  jumpTo: vi.fn(),
  pointer: vi.fn(),
  pointerLeave: vi.fn(),
  setActive: vi.fn(),
  resize: vi.fn(),
  destroy: vi.fn(),
  progress: 0,
};
const createNeuralLogo = vi.fn((..._args: unknown[]) => engine);
vi.mock("@/components/hero/neural-logo-engine", () => ({
  createNeuralLogo: (...args: unknown[]) => createNeuralLogo(...args),
}));

describe("neural hero accessibility", () => {
  let host: HTMLDivElement;
  let root: Root;
  let change: (() => void) | undefined;
  let reduce = false;
  const observer = class {
    observe() {}
    disconnect() {}
  };
  const hero = () => host.querySelector(".neural-hero");
  beforeEach(() => {
    reduce = false;
    createNeuralLogo.mockClear();
    engine.destroy.mockClear();
    Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
    vi.stubGlobal("IntersectionObserver", observer);
    vi.stubGlobal("ResizeObserver", observer);
    vi.stubGlobal(
      "requestAnimationFrame",
      vi.fn(() => 1),
    );
    vi.stubGlobal("cancelAnimationFrame", vi.fn());
    vi.stubGlobal("matchMedia", (query: string) => ({
      get matches() {
        return query.includes("reduce") ? reduce : false;
      },
      addEventListener: (_: string, handler: () => void) => {
        change = handler;
      },
      removeEventListener: vi.fn(),
    }));
    setMotionToggle(true);
    host = document.createElement("div");
    document.body.append(host);
    root = createRoot(host);
  });
  afterEach(async () => {
    await act(async () => root.unmount());
    host.remove();
    vi.unstubAllGlobals();
  });

  it("shows the complete static logo without starting the animation for reduced motion", async () => {
    reduce = true;
    await act(async () => root.render(<NeuralHero />));
    expect(createNeuralLogo).not.toHaveBeenCalled();
    expect(hero()?.getAttribute("data-motion")).toBe("false");
    expect(host.querySelector("canvas")).toBeNull();
    expect(
      host.querySelector('.neural-hero__poster svg[role="img"]'),
    ).not.toBeNull();
    // The OS setting wins: no toggle is offered.
    expect(host.querySelector("button")).toBeNull();
  });

  it("stops the animation as soon as reduced motion is enabled, and can restore it", async () => {
    await act(async () => root.render(<NeuralHero />));
    expect(createNeuralLogo).toHaveBeenCalledTimes(1);
    expect(host.querySelector("canvas")).not.toBeNull();
    reduce = true;
    await act(async () => change?.());
    expect(engine.destroy).toHaveBeenCalled();
    expect(host.querySelector("canvas")).toBeNull();
    expect(host.querySelector(".neural-hero__poster")).not.toBeNull();
    reduce = false;
    await act(async () => change?.());
    expect(host.querySelector("canvas")).not.toBeNull();
  });

  it("lets the visitor disable and re-enable motion without losing the logo or content link", async () => {
    await act(async () => root.render(<NeuralHero />));
    await act(async () => host.querySelector("button")!.click());
    expect(hero()?.getAttribute("data-motion")).toBe("false");
    expect(document.documentElement.dataset["motion"]).toBe("off");
    expect(host.querySelector('a[href="#studio-intro"]')).not.toBeNull();
    expect(host.querySelector(".neural-hero__poster svg")).not.toBeNull();
    await act(async () => host.querySelector("button")!.click());
    expect(hero()?.getAttribute("data-motion")).toBe("true");
    expect(document.documentElement.dataset["motion"]).toBe("on");
  });

  it("keeps the canvas labelled for assistive technology", async () => {
    await act(async () => root.render(<NeuralHero />));
    const canvas = host.querySelector("canvas");
    expect(canvas?.getAttribute("role")).toBe("img");
    expect(canvas?.getAttribute("aria-label")).toMatch(/GátAi studio/);
    expect(host.querySelectorAll("[data-chapter]")).toHaveLength(5);
  });
});
