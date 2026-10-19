import { Link } from "@tanstack/react-router";
import { useEffect, useRef, type ReactNode, type ComponentProps } from "react";
import { cn } from "@/lib/utils";

export function MaskTitle({ lines, className, as: Tag = "h1" }: { lines: ReactNode[]; className?: string; as?: "h1" | "h2" }) {
  const ref = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let cancelled = false;
    import("gsap").then(({ gsap }) => {
      if (cancelled) return;
      const spans = el.querySelectorAll(".mask-line > span");
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return void gsap.set(spans, { yPercent: 0 });
      const io = new IntersectionObserver(([e]) => {
        if (!e?.isIntersecting) return;
        gsap.fromTo(spans, { yPercent: 110 }, { yPercent: 0, duration: 1.1, stagger: 0.09, ease: "expo.out" });
        io.disconnect();
      });
      io.observe(el);
    });
    return () => { cancelled = true; };
  }, []);
  return (
    <Tag ref={ref} className={cn("font-display", className)}>
      {lines.map((l, i) => (
        <span key={i} className="mask-line"><span>{l}</span></span>
      ))}
    </Tag>
  );
}

type BtnProps = { to: NonNullable<ComponentProps<typeof Link>["to"]>; children: ReactNode; variant?: "primary" | "ghost"; params?: Record<string, string> };

export function MagneticLink({ to, children, variant = "primary", params }: BtnProps) {
  const ref = useRef<HTMLAnchorElement>(null);
  const move = (e: React.MouseEvent) => {
    const el = ref.current!;
    const r = el.getBoundingClientRect();
    el.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * 0.25}px, ${(e.clientY - r.top - r.height / 2) * 0.35}px)`;
  };
  return (
    <Link
      ref={ref}
      {...({ to, params } as { to: "/" })}
      onMouseMove={move}
      onMouseLeave={() => ref.current && (ref.current.style.transform = "")}
      className={cn(
        "group inline-flex items-center gap-3 rounded-full px-6 py-4 text-sm font-medium transition-[transform,background-color,color] duration-300 ease-out",
        variant === "primary"
          ? "bg-primary text-primary-foreground hover:bg-foreground"
          : "border border-input text-foreground hover:border-foreground",
      )}
    >
      {children}
      <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
    </Link>
  );
}

export function Eyebrow({ n, children }: { n?: string; children: ReactNode }) {
  return (
    <p className="eyebrow flex items-center gap-3">
      {n && <span className="text-primary">{n}</span>}
      <span className="h-px w-8 bg-border" />
      {children}
    </p>
  );
}

export function PlaceholderArt({ label, className }: { label: string; className?: string }) {
  return (
    <div className={cn("placeholder-art relative flex items-end overflow-hidden", className)}>
      <span className="eyebrow m-4">Kép helye · {label}</span>
    </div>
  );
}
