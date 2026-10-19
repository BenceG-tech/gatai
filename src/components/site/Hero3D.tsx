import { Component, lazy, Suspense, useEffect, useRef, useState, type ReactNode } from "react";
import { CHAPTERS, chapterProgress } from "@/lib/chapters";

const LiquidScene = lazy(() =>
  import("@/components/three/LiquidScene").catch(
    () =>
      new Promise<typeof import("@/components/three/LiquidScene")>((resolve, reject) =>
        setTimeout(() => import("@/components/three/LiquidScene").then(resolve, reject), 800),
      ),
  ),
);

class SceneBoundary extends Component<
  { children: ReactNode; onFail: () => void },
  { failed: boolean }
> {
  override state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  override componentDidCatch(error: unknown) {
    console.warn("Logo scene unavailable; showing the approved logo", error);
    this.props.onFail();
  }
  override render() {
    return this.state.failed ? <LogoPoster /> : this.props.children;
  }
}

function hasWebGL() {
  try {
    const canvas = document.createElement("canvas");
    return !!(canvas.getContext("webgl2") || canvas.getContext("webgl"));
  } catch {
    return false;
  }
}

function LogoPoster() {
  return (
    <div className="logo-story__poster">
      <img
        src="/brand/gatai-approved.svg"
        alt="GátAi studio — króm és azúr logó"
        width="1824"
        height="862"
      />
    </div>
  );
}

/** A pinned scroll story, measured from chapter anchors rather than page length. */
export function Hero3D() {
  const root = useRef<HTMLElement>(null);
  const caption = useRef<HTMLSpanElement>(null);
  const meter = useRef<HTMLSpanElement>(null);
  const progress = useRef(0);
  const requestFrame = useRef<(() => void) | null>(null);
  const [mode, setMode] = useState<"pending" | "full" | "lite" | "static">("pending");
  const [disabled, setDisabled] = useState(false);
  const [lost, setLost] = useState(false);
  const [active, setActive] = useState(true);
  const motion = (mode === "full" || mode === "lite") && !disabled && !lost;

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    let supported: boolean | null = null;
    const sync = () => {
      if (media.matches) {
        setMode("static");
        return;
      }
      supported ??= hasWebGL();
      setMode(
        !supported
          ? "static"
          : window.innerWidth < 768 || (navigator.hardwareConcurrency ?? 8) <= 4
            ? "lite"
            : "full",
      );
    };
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    const section = root.current;
    if (!section || !motion) return;
    let tops: number[] = [];
    let vh = window.innerHeight;
    let raf = 0;
    let inView = true;
    const update = () => {
      raf = 0;
      const p = chapterProgress(tops, window.scrollY, vh);
      progress.current = p;
      section.dataset["progress"] = p.toFixed(3);
      if (meter.current) meter.current.style.transform = `scaleX(${p / 4})`;
      if (caption.current)
        caption.current.textContent =
          p < 0.5
            ? "GátAi studio"
            : p < 1.65
              ? "Formából lehetőség."
              : p < 2.6
                ? "Kapcsolódó intelligencia."
                : p < 3.7
                  ? "Minden összeáll."
                  : "GátAi studio";
      requestFrame.current?.();
    };
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    const measure = () => {
      vh = window.innerHeight;
      tops = CHAPTERS.map((chapter) => {
        const el = section.querySelector<HTMLElement>(`[data-chapter="${chapter}"]`);
        return el ? el.getBoundingClientRect().top + window.scrollY : NaN;
      });
      schedule();
    };
    const visibility = () => setActive(inView && !document.hidden);
    const observer = new IntersectionObserver(([entry]) => {
      inView = entry?.isIntersecting ?? true;
      visibility();
    });
    observer.observe(section);
    const resize = new ResizeObserver(measure);
    resize.observe(section);
    measure();
    visibility();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", measure);
    document.addEventListener("visibilitychange", visibility);
    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
      resize.disconnect();
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", measure);
      document.removeEventListener("visibilitychange", visibility);
    };
  }, [motion]);

  return (
    <section
      ref={root}
      className="logo-story"
      data-motion={motion}
      data-progress="0"
      aria-label="GátAi studio logóanimáció"
    >
      {CHAPTERS.map((chapter) => (
        <span
          key={chapter}
          className="logo-story__anchor"
          data-chapter={chapter}
          style={{ top: chapter === 0 ? 0 : `${60 + chapter * 60}svh` }}
          aria-hidden="true"
        />
      ))}
      <div className="logo-story__pin">
        <p className="sr-only">
          A króm GÁT rendezett elemekre nyílik szét. Az azúr AI és a STUDIO végig olvasható marad,
          majd a teljes logó visszaépül.
        </p>
        <div className="logo-story__canvas" aria-hidden={motion || undefined}>
          {motion ? (
            <SceneBoundary onFail={() => setLost(true)}>
              <Suspense fallback={<LogoPoster />}>
                <LiquidScene
                  progress={progress}
                  requestFrame={requestFrame}
                  active={active}
                  lite={mode === "lite"}
                  onContextLost={() => setLost(true)}
                />
              </Suspense>
            </SceneBoundary>
          ) : (
            <LogoPoster />
          )}
        </div>
        <div className="logo-story__topline">
          <span>Design. Technology. Intelligence.</span>
          <a href="#studio-intro">Tovább az oldalra ↗</a>
        </div>
        <div className="logo-story__bottom">
          <span ref={caption}>GátAi studio</span>
          <div className="logo-story__controls">
            {motion && <span className="logo-story__scroll">Görgess tovább ↓</span>}
            {mode !== "pending" && mode !== "static" && !lost && (
              <button
                type="button"
                onClick={() => {
                  if (!disabled && root.current)
                    window.scrollTo({
                      top: root.current.getBoundingClientRect().top + window.scrollY,
                      behavior: "instant",
                    });
                  setDisabled((value) => !value);
                }}
              >
                {disabled ? "Animáció bekapcsolása" : "Animáció kikapcsolása"}
              </button>
            )}
          </div>
        </div>
        {motion && (
          <div className="logo-story__meter" aria-hidden="true">
            <span ref={meter} />
          </div>
        )}
      </div>
    </section>
  );
}
