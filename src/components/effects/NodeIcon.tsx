import type { CSSProperties } from "react";
import { cn } from "@/lib/utils";

/*
 * Service icons drawn as node-and-synapse line art. Lines use pathLength=1 so
 * CSS can draw them with stroke-dashoffset on a view timeline; nodes pop in
 * after their lines. On hover a short impulse runs along the lines.
 */

export type NodeIconName = "web" | "app" | "ai" | "system" | "brand" | "growth";

type Glyph = { lines: string[]; nodes: [number, number, number?][] };

const GLYPHS: Record<NodeIconName, Glyph> = {
  web: {
    lines: ["M6 10H42V38H6Z", "M6 16H42", "M12 26L22 31L33 23L38 29"],
    nodes: [
      [9.5, 13, 1.2],
      [13.5, 13, 1.2],
      [12, 26],
      [22, 31],
      [33, 23, 2.6],
      [38, 29],
    ],
  },
  app: {
    lines: ["M15 5H33V43H15Z", "M19 15L28 19L21 27L29 31", "M22 38H26"],
    nodes: [
      [19, 15],
      [28, 19, 2.6],
      [21, 27],
      [29, 31],
    ],
  },
  ai: {
    lines: [
      "M24 24L24 9",
      "M24 24L37 16.5",
      "M24 24L37 31.5",
      "M24 24L24 39",
      "M24 24L11 31.5",
      "M24 24L11 16.5",
      "M24 9L37 16.5L37 31.5",
      "M24 39L11 31.5L11 16.5",
    ],
    nodes: [
      [24, 24, 3.2],
      [24, 9],
      [37, 16.5],
      [37, 31.5],
      [24, 39],
      [11, 31.5],
      [11, 16.5],
    ],
  },
  system: {
    lines: [
      "M8 12H40",
      "M8 24H40",
      "M8 36H40",
      "M14 12V36",
      "M26 12L34 24L26 36",
    ],
    nodes: [
      [14, 12],
      [26, 12],
      [14, 24],
      [34, 24, 2.6],
      [14, 36],
      [26, 36],
    ],
  },
  brand: {
    lines: ["M24 6L40 24L24 42L8 24Z", "M24 6V42", "M8 24H40"],
    nodes: [
      [24, 6],
      [40, 24],
      [24, 42],
      [8, 24],
      [24, 24, 3],
    ],
  },
  growth: {
    lines: ["M6 42H42", "M6 42V6", "M10 36L19 27L27 31L40 14", "M34 14H40V20"],
    nodes: [
      [10, 36],
      [19, 27],
      [27, 31],
      [40, 14, 2.6],
    ],
  },
};

export function NodeIcon({
  name,
  className,
}: {
  name: NodeIconName;
  className?: string;
}) {
  const glyph = GLYPHS[name];
  return (
    <svg
      viewBox="0 0 48 48"
      className={cn("node-icon", className)}
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      {glyph.lines.map((d, i) => (
        <path
          key={d}
          d={d}
          pathLength={1}
          className="node-icon__line"
          style={{ "--i": i } as CSSProperties}
        />
      ))}
      {glyph.lines.map((d) => (
        <path
          key={`p-${d}`}
          d={d}
          pathLength={1}
          className="node-icon__pulse"
        />
      ))}
      {glyph.nodes.map(([cx, cy, r], i) => (
        <circle
          key={`${cx}-${cy}`}
          cx={cx}
          cy={cy}
          r={r ?? 1.8}
          className={r && r > 2 ? "node-icon__node is-hub" : "node-icon__node"}
          style={{ "--i": i } as CSSProperties}
        />
      ))}
    </svg>
  );
}

/** Icon per service, in the order of `services` in src/content/site.ts. */
export const SERVICE_ICONS: NodeIconName[] = [
  "web",
  "app",
  "ai",
  "system",
  "brand",
  "growth",
];
