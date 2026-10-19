import { useId } from "react";
import { letters, studioPaths } from "@/lib/brand-geometry";

type Variant = "primary" | "flat" | "mono" | "light";
type Props = { className?: string; variant?: Variant; decorative?: boolean; sheen?: boolean };
/** Website placements use the approved artwork, with identical kerning and chrome. */
export function BrandLogo({
  className = "",
  variant = "primary",
  decorative = false,
  sheen = false,
}: Props) {
  const uid = useId().replace(/:/g, "");
  if (variant === "primary" || variant === "flat")
    return (
      <svg
        className={className}
        viewBox="218 195 1375 435"
        role={decorative ? undefined : "img"}
        aria-hidden={decorative || undefined}
        aria-labelledby={decorative ? undefined : `${uid}-title`}
        xmlns="http://www.w3.org/2000/svg"
        style={{ mixBlendMode: "screen" }}
      >
        {!decorative && <title id={`${uid}-title`}>GátAi studio</title>}
        <image href="/brand/gatai-approved.svg" width="1824" height="862" />
      </svg>
    );
  const silver = variant === "light" ? "#08090D" : "#DFE2E8";
  const azure = variant === "mono" ? "#DFE2E8" : "#2F9BFF";
  return (
    <svg
      className={className}
      viewBox="-12 -12 868 270"
      role={decorative ? undefined : "img"}
      aria-hidden={decorative || undefined}
      aria-labelledby={decorative ? undefined : `${uid}-title`}
      xmlns="http://www.w3.org/2000/svg"
    >
      {!decorative && <title id={`${uid}-title`}>GátAi studio</title>}
      <defs>
        <linearGradient id={`${uid}-silver`} x1="0" y1="0" x2=".12" y2="1">
          <stop offset="0" stopColor="#F6F8FF" />
          <stop offset=".32" stopColor="#CCD3DF" />
          <stop offset=".48" stopColor="#F6F8FF" />
          <stop offset=".6" stopColor="#A9B3C3" />
          <stop offset=".82" stopColor="#E5E9F0" />
          <stop offset="1" stopColor="#BEC6D4" />
        </linearGradient>
        <linearGradient id={`${uid}-azure`} x1="0" y1="0" x2=".2" y2="1">
          <stop stopColor="#69C6FF" />
          <stop offset=".48" stopColor="#2F9BFF" />
          <stop offset="1" stopColor="#1379DE" />
        </linearGradient>
        {sheen && (
          <>
            <linearGradient id={`${uid}-sheen`}>
              <stop stopColor="#FFFFFF" stopOpacity="0" />
              <stop offset=".5" stopColor="#FFFFFF" stopOpacity=".75" />
              <stop offset="1" stopColor="#FFFFFF" stopOpacity="0" />
            </linearGradient>
            <clipPath id={`${uid}-clip`}>
              {letters.map((l) => (
                <path key={l.id} d={l.d} transform={`translate(${l.shift} 0)`} />
              ))}
            </clipPath>
          </>
        )}
      </defs>
      {letters.map((l) => (
        <path
          key={l.id}
          data-part={l.id}
          d={l.d}
          transform={`translate(${l.shift} 0)`}
          fill={l.tone === "silver" ? silver : azure}
        />
      ))}
      <g
        data-part="studio"
        transform="translate(28.64 0) scale(.88 1)"
        fill="none"
        stroke={variant === "light" ? "#08090D" : "#DDE3EE"}
        strokeWidth="3.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {studioPaths.map((d, i) => (
          <path key={i} d={d} />
        ))}
      </g>
      {sheen && (
        <g clipPath={`url(#${uid}-clip)`} aria-hidden="true">
          <g data-part="sheen" opacity="0">
            <path d="M-220-20H-110L-190 200H-300Z" fill={`url(#${uid}-sheen)`} />
          </g>
        </g>
      )}
    </svg>
  );
}
