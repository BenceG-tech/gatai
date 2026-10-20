import { useEffect, useRef } from "react";
import { useCursorEffects } from "@/lib/motion";

/**
 * Subtle desktop cursor accent: a soft azure glow plus a small node ring that
 * widens over interactive elements. The native cursor stays. Hidden on touch
 * and coarse pointers, with reduced motion and when motion is switched off.
 * Over the hero (`data-cursor="neuron"`) it steps aside for the canvas neuron.
 */
export function CursorGlow() {
  const enabled = useCursorEffects();
  const root = useRef<HTMLDivElement>(null);
  const halo = useRef<HTMLSpanElement>(null);
  const ring = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = root.current;
    const haloEl = halo.current;
    const ringEl = ring.current;
    if (!enabled || !el || !haloEl || !ringEl) return;
    let raf = 0;
    let tx = -400;
    let ty = -400;
    const h = { x: tx, y: ty };
    const r = { x: tx, y: ty };
    let shown = false;
    const tick = () => {
      h.x += (tx - h.x) * 0.12;
      h.y += (ty - h.y) * 0.12;
      r.x += (tx - r.x) * 0.32;
      r.y += (ty - r.y) * 0.32;
      haloEl.style.transform = `translate3d(${h.x.toFixed(1)}px, ${h.y.toFixed(1)}px, 0)`;
      ringEl.style.transform = `translate3d(${r.x.toFixed(1)}px, ${r.y.toFixed(1)}px, 0)`;
      const settled = Math.abs(tx - h.x) + Math.abs(ty - h.y) < 0.3;
      raf = settled ? 0 : requestAnimationFrame(tick);
    };
    const move = (event: PointerEvent) => {
      if (event.pointerType === "touch") return;
      tx = event.clientX;
      ty = event.clientY;
      if (!shown) {
        shown = true;
        h.x = r.x = tx;
        h.y = r.y = ty;
        el.dataset["visible"] = "true";
      }
      if (!raf) raf = requestAnimationFrame(tick);
    };
    const over = (event: PointerEvent) => {
      const target = event.target instanceof Element ? event.target : null;
      el.dataset["mode"] = target?.closest('[data-cursor="neuron"]')
        ? "neuron"
        : target?.closest(
              "a, button, [role='tab'], input, textarea, label, [data-cursor='link']",
            )
          ? "link"
          : "idle";
    };
    const hide = () => {
      shown = false;
      el.dataset["visible"] = "false";
    };
    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("pointerover", over, { passive: true });
    document.documentElement.addEventListener("pointerleave", hide);
    window.addEventListener("blur", hide);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerover", over);
      document.documentElement.removeEventListener("pointerleave", hide);
      window.removeEventListener("blur", hide);
    };
  }, [enabled]);

  if (!enabled) return null;
  return (
    <div
      ref={root}
      className="cursor-glow"
      data-visible="false"
      data-mode="idle"
      aria-hidden="true"
    >
      <span ref={halo} className="cursor-glow__halo" />
      <span ref={ring} className="cursor-glow__ring" />
    </div>
  );
}
