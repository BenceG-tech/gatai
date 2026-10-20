import { ClientOnly } from "@tanstack/react-router";
import {
  Component,
  lazy,
  Suspense,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { projectSphere, sphereGraph } from "@/lib/neural-sphere";
import { useFinePointer, useMotionAllowed } from "@/lib/motion";
import { useInView, usePageVisible } from "@/hooks/use-pointer-effects";
import type { SpherePointer } from "@/components/three/NeuralSphereScene";

const NeuralSphereScene = lazy(
  () => import("@/components/three/NeuralSphereScene"),
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
    console.warn(
      "Neural sphere unavailable; keeping the static drawing",
      error,
    );
    this.props.onFail();
  }
  override render() {
    return this.state.failed ? null : this.props.children;
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

/** Server-rendered drawing of the same sphere graph: fallback and loading state. */
export function SphereFallback({ className }: { className?: string }) {
  const { nodes, lines } = useMemo(() => {
    const graph = sphereGraph(180, { neighbours: 3, maxDistance: 0.6 });
    const projected = projectSphere(graph, 0.6);
    const lines: {
      x1: number;
      y1: number;
      x2: number;
      y2: number;
      o: number;
      azure: boolean;
    }[] = [];
    for (let e = 0; e < graph.edges.length / 2; e++) {
      const a = projected[graph.edges[e * 2]!]!;
      const b = projected[graph.edges[e * 2 + 1]!]!;
      lines.push({
        x1: a.x,
        y1: a.y,
        x2: b.x,
        y2: b.y,
        o: 0.08 + ((a.depth + b.depth) / 2) * 0.32,
        azure: a.azure && b.azure,
      });
    }
    return { nodes: projected, lines };
  }, []);
  const s = 200;
  return (
    <svg viewBox="-260 -260 520 520" className={className} aria-hidden="true">
      <defs>
        <radialGradient id="sphere-core">
          <stop offset="0" stopColor="#2F9BFF" stopOpacity=".35" />
          <stop offset=".45" stopColor="#2F9BFF" stopOpacity=".08" />
          <stop offset="1" stopColor="#2F9BFF" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle r="250" fill="url(#sphere-core)" />
      {lines.map((l, i) => (
        <line
          key={i}
          x1={l.x1 * s}
          y1={l.y1 * s}
          x2={l.x2 * s}
          y2={l.y2 * s}
          stroke={l.azure ? "#2F9BFF" : "#BFE4FF"}
          strokeOpacity={l.o}
          strokeWidth="1"
        />
      ))}
      {nodes.map((n, i) => (
        <circle
          key={i}
          cx={n.x * s}
          cy={n.y * s}
          r={1.2 + n.depth * 1.8}
          fill={n.azure ? "#2F9BFF" : "#DFE5EE"}
          fillOpacity={0.25 + n.depth * 0.7}
        />
      ))}
    </svg>
  );
}

/**
 * The interactive neural sphere. Three.js loads lazily on the client behind
 * ClientOnly; reduced motion, the motion toggle, missing WebGL or a lost
 * context keep the static drawing.
 */
export function NeuralSphere({ className }: { className?: string }) {
  const allowed = useMotionAllowed();
  const fine = useFinePointer();
  const visible = usePageVisible();
  const [wrap, inView] = useInView<HTMLDivElement>("160px");
  const progress = useRef(0);
  const pointer = useRef<SpherePointer>({ x: 0, y: 0, active: false });
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const [webgl, setWebgl] = useState<boolean | null>(null);
  const [lite, setLite] = useState(false);
  const [seen, setSeen] = useState(false);

  // Load three.js only once the section approaches the viewport.
  useEffect(() => {
    if (inView) setSeen(true);
  }, [inView]);

  useEffect(() => {
    setWebgl(hasWebGL());
    setLite(
      window.innerWidth < 768 || (navigator.hardwareConcurrency ?? 8) <= 4,
    );
  }, []);

  useEffect(() => {
    const el = wrap.current;
    if (!el || !allowed) return;
    let raf = 0;
    const update = () => {
      raf = 0;
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight;
      progress.current = Math.max(
        0,
        Math.min(1, (vh - r.top) / (vh + r.height)),
      );
    };
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    const move = (event: PointerEvent) => {
      if (event.pointerType === "touch" || !fine) return;
      const r = el.getBoundingClientRect();
      const x = (event.clientX - (r.left + r.width / 2)) / (r.width / 2);
      const y = (event.clientY - (r.top + r.height / 2)) / (r.height / 2);
      pointer.current = {
        x: Math.max(-1, Math.min(1, x)),
        y: Math.max(-1, Math.min(1, y)),
        active: Math.abs(x) < 1.6 && Math.abs(y) < 1.6,
      };
    };
    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("pointermove", move, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("pointermove", move);
    };
  }, [allowed, fine, wrap]);

  const live = allowed === true && webgl === true && !failed && seen;
  return (
    <div
      ref={wrap}
      className={className}
      data-ready={live && ready ? "true" : "false"}
    >
      <SphereFallback className="neural-sphere__fallback" />
      {live && (
        <ClientOnly fallback={null}>
          <div className="neural-sphere__canvas">
            <SceneBoundary onFail={() => setFailed(true)}>
              <Suspense fallback={null}>
                <NeuralSphereScene
                  progress={progress}
                  pointer={pointer}
                  active={inView && visible}
                  lite={lite}
                  onReady={() => setReady(true)}
                  onContextLost={() => setFailed(true)}
                />
              </Suspense>
            </SceneBoundary>
          </div>
        </ClientOnly>
      )}
    </div>
  );
}
