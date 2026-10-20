import type { CSSProperties, ElementType, ReactNode } from "react";
import { cn } from "@/lib/utils";

/*
 * CSS-driven motion graphics. Everything here renders identically on the
 * server and the client; the motion itself comes from CSS scroll timelines
 * (`animation-timeline: view()`) and keyframes in src/styles.css, so there is
 * no JS class toggling and nothing to hydrate. Reduced motion and the site's
 * motion toggle (`html[data-motion="off"]`) show the final state.
 */

type DividerProps = {
  /** Mono label at the left, e.g. "02 — Képességek". */
  label?: string;
  className?: string;
  /** Number of travelling impulses. */
  pulses?: number;
};

// Node positions (percent of the width) and the direction of their short branch.
const DIVIDER_NODES = [
  { at: 6, branch: -1 },
  { at: 19, branch: 1 },
  { at: 31, branch: 0 },
  { at: 47, branch: -1 },
  { at: 58, branch: 1 },
  { at: 72, branch: 0 },
  { at: 86, branch: -1 },
  { at: 95, branch: 1 },
];

/** Section divider drawn as a synapse line with nodes and travelling impulses. */
export function SynapseDivider({ label, className, pulses = 2 }: DividerProps) {
  return (
    <div className={cn("synapse", className)} aria-hidden="true">
      {label && <span className="synapse__label">{label}</span>}
      <div className="synapse__line">
        <svg
          className="synapse__svg"
          viewBox="0 0 1000 40"
          preserveAspectRatio="none"
        >
          <path className="synapse__axon" d="M0 20H1000" pathLength={1} />
          {DIVIDER_NODES.filter((n) => n.branch !== 0).map((n) => (
            <path
              key={n.at}
              className="synapse__branch"
              d={`M${n.at * 10} 20L${n.at * 10 + 18} ${20 + n.branch * 16}`}
              pathLength={1}
            />
          ))}
        </svg>
        {DIVIDER_NODES.map((n, i) => (
          <span
            key={n.at}
            className="synapse__node"
            style={{ left: `${n.at}%`, "--i": i } as CSSProperties}
          />
        ))}
        {Array.from({ length: pulses }, (_, i) => (
          <span
            key={i}
            className="synapse__pulse"
            style={{ "--delay": `${-i * (6 / pulses)}s` } as CSSProperties}
          >
            <i />
          </span>
        ))}
      </div>
    </div>
  );
}

/** Infinite marquee; the second copy is decorative. Pauses on hover. */
export function Marquee({
  items,
  className,
}: {
  items: readonly string[];
  className?: string;
}) {
  return (
    <div className={cn("marquee", className)}>
      <div className="marquee__track">
        {[0, 1].map((copy) => (
          <ul
            key={copy}
            className="marquee__list"
            aria-hidden={copy === 1 || undefined}
          >
            {items.map((item, i) => (
              <li key={item} className={i % 2 ? "is-outline" : undefined}>
                <span>{item}</span>
                <i className="marquee__node" />
              </li>
            ))}
          </ul>
        ))}
      </div>
    </div>
  );
}

/**
 * Number that counts up as it scrolls into view (CSS @property counter).
 * Screen readers get the plain value; browsers without scroll timelines show
 * the final number.
 */
export function Counter({
  value,
  pad = 2,
  suffix,
  className,
}: {
  value: number;
  pad?: number;
  suffix?: string;
  className?: string;
}) {
  return (
    <span className={cn("counter", className)}>
      <span className="sr-only">
        {value}
        {suffix}
      </span>
      <span
        className={
          pad >= 2 ? "counter__value counter__value--pad" : "counter__value"
        }
        style={{ "--to": value } as CSSProperties}
        aria-hidden="true"
      />
      {suffix && (
        <span className="counter__suffix" aria-hidden="true">
          {suffix}
        </span>
      )}
    </span>
  );
}

/** Heading whose words rise in one after another as it enters the viewport. */
export function RevealWords({
  text,
  as: Tag = "h2",
  className,
  accent,
  id,
}: {
  text: string;
  as?: ElementType;
  className?: string;
  id?: string;
  /** Words (exact match, without punctuation) rendered in azure. */
  accent?: readonly string[] | undefined;
}) {
  // "\n" marks a deliberate line break.
  const lines = text.split("\n").map((line) => line.trim().split(/\s+/));
  let index = 0;
  return (
    <Tag id={id} className={cn("reveal-words", className)}>
      {lines.map((words, l) => (
        <span key={l}>
          {l > 0 && <br />}
          {words.map((word, w) => {
            const i = index++;
            return (
              <span key={`${word}-${i}`}>
                <span className="rw" style={{ "--i": i } as CSSProperties}>
                  <span
                    className={
                      accent?.includes(word.replace(/[.,!?:]/g, ""))
                        ? "rw-accent"
                        : undefined
                    }
                  >
                    {word}
                  </span>
                </span>
                {w < words.length - 1 ? " " : ""}
              </span>
            );
          })}
          {l < lines.length - 1 ? " " : ""}
        </span>
      ))}
    </Tag>
  );
}

/** Inline text that fills with colour line by line as it scrolls through the viewport. */
export function Ink({
  children,
  tone = "ice",
}: {
  children: ReactNode;
  tone?: "ice" | "azure" | "chrome";
}) {
  return <span className={`ink ink--${tone}`}>{children}</span>;
}
