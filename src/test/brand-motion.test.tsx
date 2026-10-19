import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Hero3D } from "@/components/site/Hero3D";

vi.mock("@/components/three/LiquidScene", () => ({ default: () => <div data-testid="logo-3d" /> }));

describe("scroll logo accessibility", () => {
  let host: HTMLDivElement;
  let root: Root;
  let change: (() => void) | undefined;
  let reduce = false;
  const observer = class {
    observe() {}
    disconnect() {}
  };
  beforeEach(() => {
    reduce = false;
    Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(
      {} as WebGLRenderingContext,
    );
    vi.stubGlobal("IntersectionObserver", observer);
    vi.stubGlobal("ResizeObserver", observer);
    vi.stubGlobal(
      "requestAnimationFrame",
      vi.fn(() => 1),
    );
    vi.stubGlobal("cancelAnimationFrame", vi.fn());
    vi.stubGlobal("matchMedia", () => ({
      get matches() {
        return reduce;
      },
      addEventListener: (_: string, handler: () => void) => {
        change = handler;
      },
      removeEventListener: vi.fn(),
    }));
    host = document.createElement("div");
    document.body.append(host);
    root = createRoot(host);
  });
  afterEach(async () => {
    await act(async () => root.unmount());
    host.remove();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });
  it("shows the approved complete logo without initializing WebGL for reduced motion", async () => {
    reduce = true;
    await act(async () => root.render(<Hero3D />));
    expect(HTMLCanvasElement.prototype.getContext).not.toHaveBeenCalled();
    expect(host.querySelector(".logo-story")?.getAttribute("data-motion")).toBe("false");
    expect(host.querySelector("img")?.getAttribute("src")).toBe("/brand/gatai-approved.svg");
    expect(host.querySelector("button")).toBeNull();
  });
  it("unmounts the scene immediately when reduced motion is enabled, and can restore it", async () => {
    await act(async () => root.render(<Hero3D />));
    expect(host.querySelector('[data-testid="logo-3d"]')).not.toBeNull();
    reduce = true;
    await act(async () => change?.());
    expect(host.querySelector('[data-testid="logo-3d"]')).toBeNull();
    expect(host.querySelector("img")).not.toBeNull();
    reduce = false;
    await act(async () => change?.());
    expect(host.querySelector('[data-testid="logo-3d"]')).not.toBeNull();
  });
  it("lets the visitor disable and re-enable motion without losing the logo or content link", async () => {
    await act(async () => root.render(<Hero3D />));
    await act(async () => host.querySelector("button")!.click());
    expect(host.querySelector(".logo-story")?.getAttribute("data-motion")).toBe("false");
    expect(host.querySelector('a[href="#studio-intro"]')).not.toBeNull();
    expect(host.querySelector("img")).not.toBeNull();
    await act(async () => host.querySelector("button")!.click());
    expect(host.querySelector(".logo-story")?.getAttribute("data-motion")).toBe("true");
  });
});
