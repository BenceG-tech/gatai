import { useEffect, useMemo, useRef } from "react";
import { cn } from "@/lib/utils";
import { useCursorEffects } from "@/lib/motion";
import { statusLabel, type Project } from "@/content/projects";

// Art-directed typographic covers. These are representations, not screenshots —
// every cover is labelled as such until real, approved imagery is supplied.
const motif: Record<
  string,
  { mark: string; pattern: "rings" | "grid" | "wave" | "dots" | "arch" }
> = {
  "come-get-it": { mark: "CGI", pattern: "rings" },
  "csik-brothers-barbershop": { mark: "CSB", pattern: "grid" },
  dancenow: { mark: "DN", pattern: "wave" },
  "kiscsibe-etterem": { mark: "KC", pattern: "dots" },
  "violexa-cyprus": { mark: "VX", pattern: "arch" },
};

function Pattern({ kind }: { kind: string }) {
  const stroke = "currentColor";
  return (
    <svg
      viewBox="0 0 400 400"
      className="cover-pattern absolute inset-0 h-full w-full text-foreground/10"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden
    >
      {kind === "rings" &&
        [60, 110, 160, 210, 260].map((r) => (
          <circle key={r} cx="300" cy="120" r={r} fill="none" stroke={stroke} />
        ))}
      {kind === "grid" &&
        Array.from({ length: 11 }, (_, i) => (
          <g key={i}>
            <line x1={i * 40} y1="0" x2={i * 40} y2="400" stroke={stroke} />
            <line x1="0" y1={i * 40} x2="400" y2={i * 40} stroke={stroke} />
          </g>
        ))}
      {kind === "wave" &&
        Array.from({ length: 9 }, (_, i) => (
          <path
            key={i}
            d={`M0 ${80 + i * 30} C100 ${20 + i * 30}, 300 ${140 + i * 30}, 400 ${80 + i * 30}`}
            fill="none"
            stroke={stroke}
          />
        ))}
      {kind === "dots" &&
        Array.from({ length: 100 }, (_, i) => (
          <circle
            key={i}
            cx={20 + (i % 10) * 40}
            cy={20 + Math.floor(i / 10) * 40}
            r="2"
            fill={stroke}
          />
        ))}
      {kind === "arch" &&
        [80, 130, 180, 230].map((r) => (
          <path
            key={r}
            d={`M${200 - r} 400 A${r} ${r} 0 0 1 ${200 + r} 400`}
            fill="none"
            stroke={stroke}
          />
        ))}
    </svg>
  );
}

function hash(text: string) {
  let h = 2166136261;
  for (let i = 0; i < text.length; i++)
    h = Math.imul(h ^ text.charCodeAt(i), 16777619);
  return h >>> 0;
}

/** Deterministic node constellation for a cover (same on server and client). */
function constellation(slug: string, count = 11) {
  let s = (hash(slug) % 2147483646) + 1;
  const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647;
  return Array.from({ length: count }, () => ({
    u: 0.06 + rnd() * 0.88,
    v: 0.16 + rnd() * 0.76,
  }));
}

/**
 * Cover with hover parallax (pattern, glow and monogram move at different
 * depths, the card tilts slightly) and cursor-reactive node connections:
 * nodes near the cursor wire themselves to it. Pointer devices only.
 */
export function ProjectCover({
  project,
  className,
  large,
}: {
  project: Project;
  className?: string;
  large?: boolean;
}) {
  const m = motif[project.slug] ?? {
    mark: project.title.slice(0, 2).toUpperCase(),
    pattern: "grid" as const,
  };
  const ref = useRef<HTMLDivElement>(null);
  const linesRef = useRef<SVGGElement>(null);
  const nodes = useMemo(() => constellation(project.slug), [project.slug]);
  const enabled = useCursorEffects();

  useEffect(() => {
    const el = ref.current;
    const group = linesRef.current;
    if (!el || !group || !enabled) return;
    const lines = Array.from(group.querySelectorAll<SVGLineElement>("line"));
    const dots = Array.from(el.querySelectorAll<HTMLElement>(".cover-node"));
    let rect: DOMRect | null = null;
    let raf = 0;
    let cx = 0;
    let cy = 0;
    let on = false;
    const paint = () => {
      raf = 0;
      if (!rect) return;
      const mx = on ? cx / rect.width - 0.5 : 0;
      const my = on ? cy / rect.height - 0.5 : 0;
      el.style.setProperty("--mx", mx.toFixed(3));
      el.style.setProperty("--my", my.toFixed(3));
      const reach = Math.max(140, rect.width * 0.32);
      nodes.forEach((n, i) => {
        const x = n.u * rect!.width;
        const y = n.v * rect!.height;
        const d = Math.hypot(x - cx, y - cy);
        const k = on ? Math.max(0, 1 - d / reach) : 0;
        const line = lines[i];
        if (line) {
          line.setAttribute("x1", String((cx / rect!.width) * 1000));
          line.setAttribute("y1", String((cy / rect!.height) * 1000));
          line.style.opacity = (k * 0.85).toFixed(3);
        }
        dots[i]?.style.setProperty("--k", k.toFixed(3));
      });
    };
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(paint);
    };
    const enter = () => {
      rect = el.getBoundingClientRect();
    };
    const move = (event: PointerEvent) => {
      if (event.pointerType === "touch") return;
      rect ??= el.getBoundingClientRect();
      cx = event.clientX - rect.left;
      cy = event.clientY - rect.top;
      on = true;
      schedule();
    };
    const leave = () => {
      on = false;
      schedule();
      rect = null;
    };
    el.addEventListener("pointerenter", enter);
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerleave", leave);
    return () => {
      cancelAnimationFrame(raf);
      el.removeEventListener("pointerenter", enter);
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerleave", leave);
    };
  }, [enabled, nodes]);

  return (
    <div
      ref={ref}
      className={cn(
        "cover-art group/cover relative isolate overflow-hidden",
        className,
      )}
    >
      <div className="cover-layer cover-layer--deep">
        <Pattern kind={m.pattern} />
      </div>
      <div className="cover-glow absolute inset-0 -z-10" />
      <svg
        className="cover-links"
        viewBox="0 0 1000 1000"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <g className="cover-links__static">
          {nodes.slice(1).map((n, i) => (
            <line
              key={i}
              x1={nodes[i]!.u * 1000}
              y1={nodes[i]!.v * 1000}
              x2={n.u * 1000}
              y2={n.v * 1000}
            />
          ))}
        </g>
        <g ref={linesRef} className="cover-links__live">
          {nodes.map((n, i) => (
            <line
              key={i}
              x1={n.u * 1000}
              y1={n.v * 1000}
              x2={n.u * 1000}
              y2={n.v * 1000}
            />
          ))}
        </g>
      </svg>
      {nodes.map((n, i) => (
        <span
          key={i}
          className={i % 4 === 0 ? "cover-node is-azure" : "cover-node"}
          style={{ left: `${n.u * 100}%`, top: `${n.v * 100}%` }}
          aria-hidden="true"
        />
      ))}
      <span
        className="cover-mark font-display absolute right-[6%] bottom-[2%] leading-none font-semibold text-chrome"
        style={{
          fontSize: large
            ? "clamp(6rem, 18vw, 16rem)"
            : "clamp(4rem, 12vw, 9rem)",
        }}
        aria-hidden
      >
        {m.mark}
      </span>
      <div className="absolute top-0 left-0 flex w-full items-start justify-between gap-4 p-4 md:p-6">
        <span className="eyebrow">{project.category}</span>
        <StatusChip project={project} />
      </div>
      <span className="eyebrow absolute top-11 left-4 text-[0.6rem] opacity-70 md:top-14 md:left-6">
        Tipográfiai borító · nem képernyőkép
      </span>
    </div>
  );
}

export function StatusChip({ project }: { project: Project }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full border bg-background/70 px-3 py-1 font-mono text-[0.65rem] tracking-[0.14em] uppercase backdrop-blur-sm",
        project.status === "live" ? "text-foreground" : "text-muted-foreground",
      )}
    >
      <span
        className={cn(
          "h-1.5 w-1.5 rounded-full",
          project.status === "live"
            ? "bg-primary shadow-[0_0_8px_var(--primary)]"
            : project.status === "in-progress"
              ? "bg-chrome"
              : "border border-muted-foreground",
        )}
      />
      {statusLabel[project.status]}
    </span>
  );
}
