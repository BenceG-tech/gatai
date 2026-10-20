import {
  useDeferredValue,
  useId,
  useMemo,
  useState,
  type CSSProperties,
} from "react";
import { Eyebrow, MagneticLink } from "@/components/site/ui";
import { RevealWords } from "@/components/effects/MotionGraphics";
import { ideaModules, ideaPresets } from "@/content/site";
import {
  ideaToModules,
  suggestNext,
  type IdeaModuleId,
} from "@/lib/idea-system";

/*
 * "Ötlet → rendszer": the visitor types (or picks) an idea and watches it wire
 * itself into a system map. Deterministic keyword matching, no network calls,
 * nothing is stored. SVG + CSS transitions draw the synapses, CSS dash pulses
 * run along the active ones, and suggested modules ("amire még nem gondoltál")
 * breathe in azure.
 */

const SHORT: Record<IdeaModuleId, string> = {
  web: "Weboldal",
  app: "App",
  booking: "Foglalás",
  shop: "Webshop",
  ai: "AI-asszisztens",
  automation: "Automatizálás",
  crm: "Admin · CRM",
  data: "Dashboard",
  docs: "Dokumentumok",
};

const VB = { w: 640, h: 440, cx: 320, cy: 220, rx: 250, ry: 160 };
const POINTS = ideaModules.map((m, i) => {
  const a = -Math.PI / 2 + (i / ideaModules.length) * Math.PI * 2;
  const x = VB.cx + Math.cos(a) * VB.rx;
  const y = VB.cy + Math.sin(a) * VB.ry;
  // gentle curve: control point pulled off the straight line
  const mx = (VB.cx + x) / 2 + Math.sin(a) * 26;
  const my = (VB.cy + y) / 2 - Math.cos(a) * 26;
  return {
    id: m.id as IdeaModuleId,
    label: SHORT[m.id as IdeaModuleId],
    x,
    y,
    d: `M${VB.cx} ${VB.cy}Q${mx.toFixed(1)} ${my.toFixed(1)} ${x.toFixed(1)} ${y.toFixed(1)}`,
    above: y < VB.cy - 20,
  };
});

export function IdeaToSystem() {
  const [idea, setIdea] = useState<string>(ideaPresets[0]);
  const deferred = useDeferredValue(idea);
  const inputId = useId();
  const active = useMemo(() => ideaToModules(deferred), [deferred]);
  const next = useMemo(() => suggestNext(active), [active]);
  const ring = POINTS.filter((p) => active.includes(p.id));
  const byId = (id: IdeaModuleId) => ideaModules.find((m) => m.id === id)!;

  return (
    <section
      className="section idea"
      data-formation="drift"
      aria-labelledby="idea-title"
    >
      <div className="grid gap-8 md:grid-cols-12 md:items-end">
        <div className="md:col-span-8">
          <Eyebrow n="04">Ötlet → rendszer</Eyebrow>
          <RevealWords
            as="h2"
            text={"Mondd el, mit építenél.\nMegmutatom, mivé nőhet."}
            id="idea-title"
            accent={["mivé", "nőhet."]}
            className="section-title mt-8"
          />
        </div>
        <p className="reveal max-w-sm text-muted-foreground md:col-span-4">
          Írd be egy mondatban. A háló összeköti a darabokat — és megmutatja azt
          is, amire még nem gondoltál.
        </p>
      </div>

      <div className="idea__stage mt-14">
        <div className="idea__console">
          <label htmlFor={inputId} className="eyebrow">
            Mit építenél, ha bármit lehetne?
          </label>
          <div className="idea__field">
            <span className="idea__caret font-mono" aria-hidden="true">
              &gt;
            </span>
            <input
              id={inputId}
              value={idea}
              maxLength={140}
              autoComplete="off"
              spellCheck={false}
              onChange={(e) => setIdea(e.target.value)}
              placeholder="pl. időpontfoglalás és AI-válaszok a szalonomnak"
            />
          </div>
          <div className="mt-4 flex flex-wrap gap-2" aria-label="Példák">
            {ideaPresets.map((p) => (
              <button
                key={p}
                type="button"
                className={idea === p ? "chip is-active" : "chip"}
                aria-pressed={idea === p}
                onClick={() => setIdea(p)}
              >
                {p}
              </button>
            ))}
          </div>

          <div className="idea__plan" aria-live="polite">
            <p className="eyebrow mt-10">
              Rendszerterv · {active.length} modul
            </p>
            <ol className="mt-4 space-y-3">
              {active.map((id, i) => (
                <li
                  key={id}
                  className="idea__item"
                  style={{ "--i": i } as CSSProperties}
                >
                  <span className="idea__dot" aria-hidden="true" />
                  <span>
                    <strong className="font-medium text-foreground">
                      {byId(id).label}.
                    </strong>{" "}
                    <span className="text-muted-foreground">
                      {byId(id).pitch}
                    </span>
                  </span>
                </li>
              ))}
            </ol>
            {next.length > 0 && (
              <>
                <p className="eyebrow mt-8 text-primary">
                  Amire még nem gondoltál
                </p>
                <ul className="mt-4 space-y-3">
                  {next.map((id) => (
                    <li key={id} className="idea__item idea__item--next">
                      <span className="idea__dot" aria-hidden="true" />
                      <span className="text-muted-foreground">
                        {byId(id).nudge}
                      </span>
                    </li>
                  ))}
                </ul>
              </>
            )}
            <div className="mt-10 flex flex-wrap items-center gap-4">
              <MagneticLink to="/kapcsolat">Ezt építsük meg</MagneticLink>
              <span className="font-mono text-xs text-muted-foreground">
                Az első beszélgetés ingyenes.
              </span>
            </div>
          </div>
        </div>

        <figure className="idea__map" aria-hidden="true">
          <svg viewBox={`0 0 ${VB.w} ${VB.h}`} fill="none">
            <defs>
              <radialGradient id="idea-core">
                <stop offset="0" stopColor="#7FD0FF" />
                <stop offset=".45" stopColor="#2F9BFF" />
                <stop offset="1" stopColor="#2F9BFF" stopOpacity="0" />
              </radialGradient>
            </defs>
            <ellipse
              cx={VB.cx}
              cy={VB.cy}
              rx={VB.rx}
              ry={VB.ry}
              className="idea-map__orbit"
            />
            {ring.length > 1 &&
              ring.map((p, i) => {
                const q = ring[(i + 1) % ring.length]!;
                if (ring.length === 2 && i === 1) return null;
                return (
                  <line
                    key={`${p.id}-${q.id}`}
                    x1={p.x}
                    y1={p.y}
                    x2={q.x}
                    y2={q.y}
                    className="idea-map__ring"
                  />
                );
              })}
            {POINTS.map((p, i) => {
              const on = active.includes(p.id);
              const hint = next.includes(p.id);
              const state = on ? "is-on" : hint ? "is-next" : "";
              return (
                <g
                  key={p.id}
                  className={`idea-map__module ${state}`}
                  style={{ "--i": active.indexOf(p.id) } as CSSProperties}
                >
                  <path d={p.d} pathLength={1} className="idea-map__edge" />
                  <path
                    d={p.d}
                    pathLength={1}
                    className="idea-map__pulse"
                    style={{ animationDelay: `${(i * 0.37) % 2}s` }}
                  />
                  <circle cx={p.x} cy={p.y} r="16" className="idea-map__halo" />
                  <circle cx={p.x} cy={p.y} r="6" className="idea-map__node" />
                  <text
                    x={p.x}
                    y={p.y + (p.above ? -24 : 34)}
                    textAnchor="middle"
                    className="idea-map__label"
                  >
                    {p.label}
                  </text>
                </g>
              );
            })}
            <circle
              cx={VB.cx}
              cy={VB.cy}
              r="46"
              fill="url(#idea-core)"
              className="idea-map__core-glow"
            />
            <circle cx={VB.cx} cy={VB.cy} r="11" className="idea-map__core" />
            <text
              x={VB.cx}
              y={VB.cy + 34}
              textAnchor="middle"
              className="idea-map__core-label"
            >
              ÖTLET
            </text>
          </svg>
        </figure>
      </div>
    </section>
  );
}
