import { useEffect, useRef, useState, type RefObject } from "react";
import { useCursorEffects } from "@/lib/motion";

/*
 * Small pointer effects shared across the site. All of them:
 * - run only for fine pointers with motion allowed (see src/lib/motion.ts),
 * - write CSS custom properties instead of React state (no re-renders),
 * - batch work into requestAnimationFrame and stop when idle.
 */

/** Magnetic pull toward the cursor; exposes --mag-x / --mag-y on the element. */
export function useMagnetic<T extends HTMLElement>(
  strength = 0.28,
): RefObject<T | null> {
  const ref = useRef<T>(null);
  const enabled = useCursorEffects();
  useEffect(() => {
    const el = ref.current;
    if (!el || !enabled) return;
    let raf = 0;
    let x = 0;
    let y = 0;
    let tx = 0;
    let ty = 0;
    let rect: DOMRect | null = null;
    const tick = () => {
      x += (tx - x) * 0.2;
      y += (ty - y) * 0.2;
      el.style.setProperty("--mag-x", `${x.toFixed(2)}px`);
      el.style.setProperty("--mag-y", `${y.toFixed(2)}px`);
      raf =
        Math.abs(tx - x) + Math.abs(ty - y) > 0.05
          ? requestAnimationFrame(tick)
          : 0;
    };
    const kick = () => {
      if (!raf) raf = requestAnimationFrame(tick);
    };
    const enter = () => {
      rect = el.getBoundingClientRect();
    };
    const move = (event: PointerEvent) => {
      if (event.pointerType === "touch") return;
      rect ??= el.getBoundingClientRect();
      tx = (event.clientX - rect.left - rect.width / 2) * strength;
      ty = (event.clientY - rect.top - rect.height / 2) * strength;
      kick();
    };
    const leave = () => {
      rect = null;
      tx = ty = 0;
      kick();
    };
    el.addEventListener("pointerenter", enter);
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerleave", leave);
    return () => {
      cancelAnimationFrame(raf);
      el.removeEventListener("pointerenter", enter);
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerleave", leave);
      el.style.removeProperty("--mag-x");
      el.style.removeProperty("--mag-y");
    };
  }, [enabled, strength]);
  return ref;
}

/**
 * Pointer-follow spotlight for a group of cards. Every `[data-spotlight]`
 * child receives --spot-x / --spot-y relative to itself, so the border glow
 * also bleeds into neighbouring cards, plus --spot-o for fade in/out.
 */
export function useSpotlightGroup<
  T extends HTMLElement,
>(): RefObject<T | null> {
  const ref = useRef<T>(null);
  const enabled = useCursorEffects();
  useEffect(() => {
    const root = ref.current;
    if (!root || !enabled) return;
    let raf = 0;
    let px = 0;
    let py = 0;
    let cards: { el: HTMLElement; rect: DOMRect }[] = [];
    const measure = () => {
      cards = Array.from(
        root.querySelectorAll<HTMLElement>("[data-spotlight]"),
      ).map((el) => ({
        el,
        rect: el.getBoundingClientRect(),
      }));
    };
    const paint = () => {
      raf = 0;
      for (const { el, rect } of cards) {
        el.style.setProperty("--spot-x", `${(px - rect.left).toFixed(1)}px`);
        el.style.setProperty("--spot-y", `${(py - rect.top).toFixed(1)}px`);
      }
    };
    const enter = () => {
      measure();
      root.style.setProperty("--spot-o", "1");
    };
    const move = (event: PointerEvent) => {
      if (event.pointerType === "touch") return;
      if (!cards.length) measure();
      px = event.clientX;
      py = event.clientY;
      if (!raf) raf = requestAnimationFrame(paint);
    };
    const leave = () => {
      root.style.setProperty("--spot-o", "0");
      cards = [];
    };
    const invalidate = () => {
      if (cards.length) measure();
    };
    root.addEventListener("pointerenter", enter);
    root.addEventListener("pointermove", move);
    root.addEventListener("pointerleave", leave);
    window.addEventListener("scroll", invalidate, { passive: true });
    window.addEventListener("resize", invalidate);
    return () => {
      cancelAnimationFrame(raf);
      root.removeEventListener("pointerenter", enter);
      root.removeEventListener("pointermove", move);
      root.removeEventListener("pointerleave", leave);
      window.removeEventListener("scroll", invalidate);
      window.removeEventListener("resize", invalidate);
    };
  }, [enabled]);
  return ref;
}

/** True while the element is within (or near) the viewport. */
export function useInView<T extends Element>(
  rootMargin = "120px",
): [RefObject<T | null>, boolean] {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(
      ([entry]) => setInView(!!entry?.isIntersecting),
      {
        rootMargin,
      },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [rootMargin]);
  return [ref, inView];
}

/** Document visibility (pauses canvases in background tabs). */
export function usePageVisible(): boolean {
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    const sync = () => setVisible(!document.hidden);
    sync();
    document.addEventListener("visibilitychange", sync);
    return () => document.removeEventListener("visibilitychange", sync);
  }, []);
  return visible;
}
