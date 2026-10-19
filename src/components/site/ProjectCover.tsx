import { useRef } from "react";
import { cn } from "@/lib/utils";
import { statusLabel, type Project } from "@/content/projects";

// Art-directed typographic covers. These are representations, not screenshots —
// every cover is labelled as such until real, approved imagery is supplied.
const motif: Record<string, { mark: string; pattern: "rings" | "grid" | "wave" | "dots" | "arch" }> = {
  "come-get-it": { mark: "CGI", pattern: "rings" },
  "csik-brothers-barbershop": { mark: "CSB", pattern: "grid" },
  dancenow: { mark: "DN", pattern: "wave" },
  "kiscsibe-etterem": { mark: "KC", pattern: "dots" },
  "violexa-cyprus": { mark: "VX", pattern: "arch" },
};

function Pattern({ kind }: { kind: string }) {
  const stroke = "currentColor";
  return (
    <svg viewBox="0 0 400 400" className="absolute inset-0 h-full w-full text-foreground/10" preserveAspectRatio="xMidYMid slice" aria-hidden>
      {kind === "rings" && [60, 110, 160, 210, 260].map((r) => <circle key={r} cx="300" cy="120" r={r} fill="none" stroke={stroke} />)}
      {kind === "grid" && Array.from({ length: 11 }, (_, i) => (
        <g key={i}><line x1={i * 40} y1="0" x2={i * 40} y2="400" stroke={stroke} /><line x1="0" y1={i * 40} x2="400" y2={i * 40} stroke={stroke} /></g>
      ))}
      {kind === "wave" && Array.from({ length: 9 }, (_, i) => (
        <path key={i} d={`M0 ${80 + i * 30} C100 ${20 + i * 30}, 300 ${140 + i * 30}, 400 ${80 + i * 30}`} fill="none" stroke={stroke} />
      ))}
      {kind === "dots" && Array.from({ length: 100 }, (_, i) => <circle key={i} cx={20 + (i % 10) * 40} cy={20 + Math.floor(i / 10) * 40} r="2" fill={stroke} />)}
      {kind === "arch" && [80, 130, 180, 230].map((r) => <path key={r} d={`M${200 - r} 400 A${r} ${r} 0 0 1 ${200 + r} 400`} fill="none" stroke={stroke} />)}
    </svg>
  );
}

export function ProjectCover({ project, className, large }: { project: Project; className?: string; large?: boolean }) {
  const m = motif[project.slug] ?? { mark: project.title.slice(0, 2).toUpperCase(), pattern: "grid" as const };
  const ref = useRef<HTMLDivElement>(null);
  const move = (e: React.PointerEvent) => {
    if (e.pointerType !== "mouse" || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    ref.current.style.setProperty("--mx", String((e.clientX - r.left) / r.width - 0.5));
    ref.current.style.setProperty("--my", String((e.clientY - r.top) / r.height - 0.5));
  };
  return (
    <div
      ref={ref}
      onPointerMove={move}
      onPointerLeave={() => { ref.current?.style.setProperty("--mx", "0"); ref.current?.style.setProperty("--my", "0"); }}
      className={cn("cover-art group/cover relative isolate overflow-hidden", className)}
    >
      <Pattern kind={m.pattern} />
      <div className="cover-glow absolute inset-0 -z-10" />
      <span
        className="cover-mark font-display absolute right-[6%] bottom-[2%] leading-none font-extrabold text-chrome"
        style={{ fontSize: large ? "clamp(6rem, 18vw, 16rem)" : "clamp(4rem, 12vw, 9rem)" }}
        aria-hidden
      >
        {m.mark}
      </span>
      <div className="absolute top-0 left-0 flex w-full items-start justify-between gap-4 p-4 md:p-6">
        <span className="eyebrow">{project.category}</span>
        <StatusChip project={project} />
      </div>
      <span className="eyebrow absolute top-11 left-4 text-[0.6rem] opacity-70 md:top-14 md:left-6">Tipográfiai borító · nem képernyőkép</span>
    </div>
  );
}

export function StatusChip({ project }: { project: Project }) {
  return (
    <span className={cn(
      "inline-flex items-center gap-2 rounded-full border bg-background/60 px-3 py-1 font-mono text-[0.65rem] tracking-[0.14em] uppercase backdrop-blur-sm",
      project.status === "live" ? "text-foreground" : "text-muted-foreground",
    )}>
      <span className={cn("h-1.5 w-1.5 rounded-full", project.status === "live" ? "bg-primary" : project.status === "in-progress" ? "bg-chrome" : "border border-muted-foreground")} />
      {statusLabel[project.status]}
    </span>
  );
}
