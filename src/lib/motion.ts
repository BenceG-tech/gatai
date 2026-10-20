import { useSyncExternalStore } from "react";

/*
 * Site-wide motion preference.
 *
 * Motion is allowed only when the OS does not ask for reduced motion AND the
 * visitor has not switched animations off with the site's own toggle (stored
 * per browser). The resolved state is mirrored to <html data-motion="on|off">
 * after hydration so plain CSS effects can follow the same switch.
 */

const STORAGE_KEY = "gatai:motion";
const REDUCE_QUERY = "(prefers-reduced-motion: reduce)";
const FINE_QUERY = "(hover: hover) and (pointer: fine)";

type Listener = () => void;
const listeners = new Set<Listener>();

function readToggle(): boolean {
  try {
    return window.localStorage.getItem(STORAGE_KEY) !== "off";
  } catch {
    return true;
  }
}

let toggle: boolean | null = null;

function reduceQuery(): MediaQueryList | null {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function")
    return null;
  return window.matchMedia(REDUCE_QUERY);
}

export function prefersReducedMotion(): boolean {
  return reduceQuery()?.matches ?? false;
}

/** The visitor's own switch (independent of the OS setting). */
export function motionToggle(): boolean {
  if (typeof window === "undefined") return true;
  toggle ??= readToggle();
  return toggle;
}

export function motionAllowed(): boolean {
  return motionToggle() && !prefersReducedMotion();
}

function sync() {
  if (typeof document !== "undefined")
    document.documentElement.dataset["motion"] = motionAllowed() ? "on" : "off";
  listeners.forEach((listener) => listener());
}

export function setMotionToggle(on: boolean) {
  toggle = on;
  try {
    window.localStorage.setItem(STORAGE_KEY, on ? "on" : "off");
  } catch {
    // Storage can be unavailable (private mode); the in-memory value still applies.
  }
  sync();
}

function subscribe(listener: Listener) {
  listeners.add(listener);
  const media = reduceQuery();
  media?.addEventListener?.("change", sync);
  return () => {
    listeners.delete(listener);
    media?.removeEventListener?.("change", sync);
  };
}

/** Call once on the client (Shell) to publish the state to CSS. */
export function publishMotionState() {
  sync();
}

/** `null` until hydrated, so server and first client render agree. */
export function useMotionAllowed(): boolean | null {
  return useSyncExternalStore<boolean | null>(
    subscribe,
    motionAllowed,
    () => null,
  );
}

export function useMotionToggle(): boolean {
  return useSyncExternalStore(subscribe, motionToggle, () => true);
}

export function useReducedMotion(): boolean {
  return useSyncExternalStore(subscribe, prefersReducedMotion, () => false);
}

function subscribeFine(listener: Listener) {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function")
    return () => {};
  const media = window.matchMedia(FINE_QUERY);
  media.addEventListener?.("change", listener);
  return () => media.removeEventListener?.("change", listener);
}

/** True on devices with a precise hovering pointer (mouse, trackpad, pen). */
export function hasFinePointer(): boolean {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function")
    return false;
  return window.matchMedia(FINE_QUERY).matches;
}

export function useFinePointer(): boolean {
  return useSyncExternalStore(subscribeFine, hasFinePointer, () => false);
}

/** Cursor effects run only for fine pointers with motion allowed. */
export function useCursorEffects(): boolean {
  const motion = useMotionAllowed();
  const fine = useFinePointer();
  return motion === true && fine;
}
