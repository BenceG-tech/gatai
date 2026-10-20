import { Link } from "@tanstack/react-router";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils";
import { useMagnetic } from "@/hooks/use-pointer-effects";

type BtnProps = {
  to: NonNullable<ComponentProps<typeof Link>["to"]>;
  children: ReactNode;
  variant?: "primary" | "ghost";
  params?: Record<string, string>;
  className?: string;
};

/**
 * Call-to-action link. On fine pointers the button is pulled toward the
 * cursor and its label follows a little further (magnetic effect).
 */
export function MagneticLink({
  to,
  children,
  variant = "primary",
  params,
  className,
}: BtnProps) {
  const ref = useMagnetic<HTMLAnchorElement>(
    variant === "primary" ? 0.3 : 0.22,
  );
  return (
    <Link
      ref={ref}
      {...({ to, params } as { to: "/" })}
      className={cn(
        "btn magnetic",
        variant === "primary" ? "btn--primary" : "btn--ghost",
        className,
      )}
    >
      <span className="btn__label">{children}</span>
      <span className="btn__arrow" aria-hidden="true">
        <svg viewBox="0 0 20 20" fill="none">
          <path d="M3 10H16M11 5L16 10L11 15" />
          <circle cx="3" cy="10" r="1.6" />
        </svg>
      </span>
    </Link>
  );
}

export function Eyebrow({
  n,
  children,
  className,
}: {
  n?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <p className={cn("eyebrow flex items-center gap-3", className)}>
      {n && <span className="text-primary">{n}</span>}
      <span className="eyebrow-line" aria-hidden="true" />
      {children}
    </p>
  );
}

/** Honest placeholder for imagery that has not been supplied yet. */
export function PlaceholderArt({
  label,
  className,
}: {
  label: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "placeholder-art relative flex items-end overflow-hidden",
        className,
      )}
    >
      <span className="eyebrow m-4">Kép helye · {label}</span>
    </div>
  );
}
