import { useEffect, useRef, useState } from "react";
import { BrandLogo } from "@/components/site/BrandLogo";
import { CHAPTERS, chapterProgress } from "@/lib/chapters";
import {
  setMotionToggle,
  useMotionAllowed,
  useReducedMotion,
} from "@/lib/motion";
import {
  HERO_CHAPTERS,
  PHASE_LABELS,
  neuralPhase,
  timelineFromChapter,
  type NeuralPhase,
} from "@/lib/neural-timeline";
import { createNeuralLogo, type NeuralLogo } from "./neural-logo-engine";

const PHASES: NeuralPhase[] = [
  "fire",
  "settle",
  "matte",
  "sphere",
  "snap",
  "logo",
];

/** The complete approved logo, shown for reduced motion, the motion toggle and before hydration. */
function LogoPoster({ pending }: { pending: boolean }) {
  return (
    <div
      className={
        pending ? "neural-hero__poster is-pending" : "neural-hero__poster"
      }
    >
      <BrandLogo
        className="neural-hero__poster-logo"
        title="GátAi studio logó"
      />
    </div>
  );
}

/**
 * Home hero: the approved neural logo animation on a pinned, scroll-scrubbed
 * stage. Scroll position is measured from `data-chapter` anchors (see
 * src/lib/chapters.ts) and mapped onto the 0..1 animation timeline, so the
 * story runs forward and backward with the scroll.
 */
export function NeuralHero() {
  const root = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const meter = useRef<HTMLSpanElement>(null);
  const allowed = useMotionAllowed();
  const reduced = useReducedMotion();
  const [failed, setFailed] = useState(false);
  const [phase, setPhase] = useState<NeuralPhase>("fire");
  const mode =
    allowed === null ? "pending" : allowed && !failed ? "motion" : "static";

  useEffect(() => {
    const section = root.current;
    const pin = stage.current;
    const canvas = canvasRef.current;
    if (mode !== "motion" || !section || !pin || !canvas) return;

    let engine: NeuralLogo;
    try {
      engine = createNeuralLogo(canvas, {
        mobile: Math.min(window.innerWidth, window.innerHeight) < 700,
        onPhase: setPhase,
      });
    } catch (error) {
      console.warn("Neural logo unavailable; showing the static logo", error);
      setFailed(true);
      return;
    }

    let tops: number[] = [];
    let vh = window.innerHeight;
    let raf = 0;
    let inView = true;
    const current = () =>
      timelineFromChapter(chapterProgress(tops, window.scrollY, vh));
    const publish = (p: number) => {
      section.dataset["progress"] = p.toFixed(3);
      section.style.setProperty("--p", p.toFixed(4));
      if (meter.current) meter.current.style.transform = `scaleX(${p})`;
    };
    const update = () => {
      raf = 0;
      const p = current();
      engine.setTarget(p);
      publish(p);
    };
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    const measure = () => {
      vh = window.innerHeight;
      tops = CHAPTERS.map((chapter) => {
        const el = section.querySelector<HTMLElement>(
          `[data-chapter="${chapter}"]`,
        );
        return el ? el.getBoundingClientRect().top + window.scrollY : NaN;
      });
      schedule();
    };
    const sync = () => engine.setActive(inView && !document.hidden);
    const onPointer = (event: PointerEvent) => {
      if (event.pointerType === "touch") return;
      engine.pointer(event.clientX, event.clientY);
    };
    const onLeave = () => engine.pointerLeave();

    measure();
    const start = current();
    engine.jumpTo(start);
    publish(start);
    setPhase(neuralPhase(start));

    const visibility = new IntersectionObserver(([entry]) => {
      inView = entry?.isIntersecting ?? true;
      sync();
    });
    visibility.observe(section);
    const sizes = new ResizeObserver(() => {
      engine.resize();
      measure();
    });
    sizes.observe(canvas);
    sizes.observe(section);
    sync();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", measure);
    document.addEventListener("visibilitychange", sync);
    pin.addEventListener("pointermove", onPointer);
    pin.addEventListener("pointerleave", onLeave);
    return () => {
      cancelAnimationFrame(raf);
      visibility.disconnect();
      sizes.disconnect();
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", measure);
      document.removeEventListener("visibilitychange", sync);
      pin.removeEventListener("pointermove", onPointer);
      pin.removeEventListener("pointerleave", onLeave);
      engine.destroy();
    };
  }, [mode]);

  const toggleMotion = () => {
    if (mode === "motion" && root.current)
      window.scrollTo({
        top: root.current.getBoundingClientRect().top + window.scrollY,
        behavior: "instant",
      });
    setFailed(false);
    setMotionToggle(mode !== "motion");
  };

  const index = PHASES.indexOf(phase) + 1;

  return (
    <section
      ref={root}
      className="neural-hero"
      data-motion={mode === "motion"}
      data-mode={mode}
      data-progress="0"
      aria-label="GátAi studio — neurális logóanimáció"
    >
      {CHAPTERS.map((chapter) => (
        <span
          key={chapter}
          className="neural-hero__anchor"
          data-chapter={chapter}
          style={{
            top:
              chapter === 0
                ? 0
                : `calc(var(--hero-span) * ${chapter / HERO_CHAPTERS} + 60svh)`,
          }}
          aria-hidden="true"
        />
      ))}
      <div
        ref={stage}
        className="neural-hero__pin"
        data-cursor={mode === "motion" ? "neuron" : undefined}
      >
        <p className="sr-only">
          Egy agy formájú neurális háló tüzel, a csomópontjai a betűk
          körvonalára rendeződnek, a GÁTAI felirat egy neurális gömbbé robban,
          majd visszaáll, és egy fénysáv végigfutva felgyújtja a króm és azúr
          GátAi studio logót.
        </p>
        {mode === "static" ? (
          <LogoPoster pending={false} />
        ) : (
          <>
            {mode === "pending" && <LogoPoster pending />}
            <canvas
              ref={canvasRef}
              className="neural-hero__canvas"
              role="img"
              aria-label="Animált neurális háló, amely a GátAi studio logóvá áll össze"
            />
          </>
        )}

        <div className="neural-hero__topline">
          <span>Design. Technology. Intelligence.</span>
          <a href="#studio-intro">Tovább az oldalra ↓</a>
        </div>

        <div className="neural-hero__hud">
          <p className="neural-hero__phase" aria-hidden="true">
            {mode === "motion" ? (
              <>
                <span className="neural-hero__phase-index">
                  {String(index).padStart(2, "0")} /{" "}
                  {String(PHASES.length).padStart(2, "0")}
                </span>
                <span>{PHASE_LABELS[phase]}</span>
              </>
            ) : (
              <span>GátAi studio — Budapest</span>
            )}
          </p>
          <div className="neural-hero__controls">
            {mode === "motion" && (
              <span className="neural-hero__scroll" aria-hidden="true">
                Görgess <i />
              </span>
            )}
            {mode !== "pending" && !reduced && (
              <button type="button" onClick={toggleMotion}>
                {mode === "motion"
                  ? "Animáció kikapcsolása"
                  : "Animáció bekapcsolása"}
              </button>
            )}
          </div>
        </div>
        {mode === "motion" && (
          <div className="neural-hero__meter" aria-hidden="true">
            <span ref={meter} />
          </div>
        )}
      </div>
    </section>
  );
}
