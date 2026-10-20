import { useId, type ReactNode } from "react";
import {
  AZURE_STOPS,
  BRAND_PALETTES,
  CHROME_STOPS,
  ICON_VIEWBOX,
  LOCKUP_VIEWBOX,
  MONOGRAM_ACCENT,
  MONOGRAM_G,
  MONOGRAM_NODE,
  MONOGRAM_SYNAPSE,
  MONOGRAM_VIEWBOX,
  WORDMARK_PARTS,
  WORDMARK_VIEWBOX,
  type BrandVariant,
} from "@/lib/brand";

/*
 * Inline renderings of the approved vector logo files in public/brand/.
 * Geometry and colours come from src/lib/brand.ts; only the gradient ids are
 * made unique per instance so several logos can live on one page.
 */

type Props = {
  className?: string;
  variant?: BrandVariant;
  /** Hide from assistive tech when a parent element already names the logo. */
  decorative?: boolean;
  title?: string;
};

function useIds() {
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  return {
    chrome: `${uid}-chrome`,
    azure: `${uid}-azure`,
    title: `${uid}-title`,
  };
}

function Gradients({ ids }: { ids: ReturnType<typeof useIds> }) {
  return (
    <defs>
      <linearGradient id={ids.chrome} x1="0" y1="0" x2=".1" y2="1">
        {CHROME_STOPS.map(([o, c]) => (
          <stop key={o} offset={o} stopColor={c} />
        ))}
      </linearGradient>
      <linearGradient id={ids.azure} x1="0" y1="0" x2=".1" y2="1">
        {AZURE_STOPS.map(([o, c]) => (
          <stop key={o} offset={o} stopColor={c} />
        ))}
      </linearGradient>
    </defs>
  );
}

function paint(value: string, ids: ReturnType<typeof useIds>) {
  if (value === "chrome") return `url(#${ids.chrome})`;
  if (value === "azure") return `url(#${ids.azure})`;
  return value;
}

function Frame({
  viewBox,
  className,
  decorative,
  title,
  ids,
  children,
}: {
  viewBox: string;
  className: string | undefined;
  decorative: boolean;
  title: string;
  ids: ReturnType<typeof useIds>;
  children: ReactNode;
}) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox={viewBox}
      className={className}
      role={decorative ? undefined : "img"}
      aria-hidden={decorative || undefined}
      aria-labelledby={decorative ? undefined : ids.title}
      focusable="false"
    >
      {!decorative && <title id={ids.title}>{title}</title>}
      <Gradients ids={ids} />
      {children}
    </svg>
  );
}

function WordmarkShapes({
  variant,
  ids,
}: {
  variant: BrandVariant;
  ids: ReturnType<typeof useIds>;
}) {
  const p = BRAND_PALETTES[variant];
  const base = WORDMARK_PARTS.filter((part) => part.role === "base");
  const ai = WORDMARK_PARTS.filter((part) => part.role === "ai");
  const studio = WORDMARK_PARTS.filter((part) => part.role === "studio");
  return (
    <>
      <g fill={paint(p.base, ids)}>
        {base.map((part) => (
          <path key={part.d} d={part.d} />
        ))}
      </g>
      <g fill={paint(p.ai, ids)} transform={`translate(${ai[0]?.dx ?? 0} 0)`}>
        {ai.map((part) => (
          <path key={part.d} d={part.d} />
        ))}
      </g>
      {studio.map((part) => (
        <path key={part.d} d={part.d} fill={p.studio} />
      ))}
    </>
  );
}

function MonogramShapes({
  variant,
  ids,
  icon = false,
}: {
  variant: BrandVariant;
  ids: ReturnType<typeof useIds>;
  icon?: boolean;
}) {
  const p = BRAND_PALETTES[variant];
  return (
    <>
      <path d={MONOGRAM_G} fill={paint(p.base, ids)} />
      {!icon && (
        <path
          d={MONOGRAM_SYNAPSE}
          stroke={p.spark}
          strokeWidth="4"
          strokeLinecap="round"
        />
      )}
      <circle
        cx={MONOGRAM_NODE.cx}
        cy={MONOGRAM_NODE.cy}
        r={icon ? 11 : 9}
        fill={p.spark}
      />
      <path d={MONOGRAM_ACCENT} fill={paint(p.accent, ids)} />
    </>
  );
}

/** The approved wordmark: chrome GÁT + accent, azure AI, STUDIO underneath. */
export function BrandLogo({
  className,
  variant = "primary",
  decorative = false,
  title = "GátAi studio",
}: Props) {
  const ids = useIds();
  return (
    <Frame
      viewBox={WORDMARK_VIEWBOX}
      className={className}
      decorative={decorative}
      title={title}
      ids={ids}
    >
      <WordmarkShapes variant={variant} ids={ids} />
    </Frame>
  );
}

/** The G monogram with its azure accent and node. */
export function BrandMonogram({
  className,
  variant = "primary",
  decorative = false,
  title = "GátAi monogram",
}: Props) {
  const ids = useIds();
  return (
    <Frame
      viewBox={MONOGRAM_VIEWBOX}
      className={className}
      decorative={decorative}
      title={title}
      ids={ids}
    >
      <MonogramShapes variant={variant} ids={ids} />
    </Frame>
  );
}

/** Horizontal lockup: monogram, divider, wordmark. */
export function BrandLockup({
  className,
  variant = "primary",
  decorative = false,
  title = "GátAi studio",
}: Props) {
  const ids = useIds();
  return (
    <Frame
      viewBox={LOCKUP_VIEWBOX}
      className={className}
      decorative={decorative}
      title={title}
      ids={ids}
    >
      <g transform="translate(0 20) scale(1.05)">
        <MonogramShapes variant={variant} ids={ids} />
      </g>
      <rect
        x="320"
        y="30"
        width="2"
        height="230"
        fill={BRAND_PALETTES[variant].divider}
        opacity=".35"
      />
      <g transform="translate(372 0)">
        <WordmarkShapes variant={variant} ids={ids} />
      </g>
    </Frame>
  );
}

/** App icon / favicon tile. */
export function BrandIcon({
  className,
  variant = "primary",
  decorative = false,
  title = "GátAi ikon",
}: Props) {
  const ids = useIds();
  return (
    <Frame
      viewBox={ICON_VIEWBOX}
      className={className}
      decorative={decorative}
      title={title}
      ids={ids}
    >
      <rect
        width="64"
        height="64"
        rx="14"
        fill={BRAND_PALETTES[variant].tile}
      />
      <g transform="translate(8.5 7) scale(.178)">
        <MonogramShapes variant={variant} ids={ids} icon />
      </g>
    </Frame>
  );
}
