import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/site/Shell";
import { MagneticLink } from "@/components/site/ui";
import { NodeIcon, SERVICE_ICONS } from "@/components/effects/NodeIcon";
import { Marquee } from "@/components/effects/MotionGraphics";
import { useSpotlightGroup } from "@/hooks/use-pointer-effects";
import { process, services } from "@/content/site";

export const Route = createFileRoute("/szolgaltatasok")({
  head: () => ({
    meta: [
      { title: "Szolgáltatások — GátAi studio" },
      {
        name: "description",
        content:
          "Weboldalak, alkalmazások, AI automatizáció, belső üzleti rendszerek, márkadesign és digitális stratégia.",
      },
      { property: "og:title", content: "Szolgáltatások — GátAi studio" },
      {
        property: "og:description",
        content:
          "Hat terület, egy cél: hogy a vállalkozásod kitűnjön és hatékonyabban működjön.",
      },
    ],
  }),
  component: Services,
});

function Services() {
  const list = useSpotlightGroup<HTMLDivElement>();
  return (
    <>
      <PageHeader
        eyebrow="Szolgáltatások"
        title={"Design.\nTechnology.\nIntelligence."}
        accent={["Intelligence"]}
        intro="Nem mindenhez értek — ahhoz értek, ami egy vállalkozás digitális működéséhez kell."
      />
      <section className="mx-auto max-w-[1440px] px-5 pb-24 md:px-10">
        <div ref={list} className="spot-grid grid gap-3">
          {services.map((s, i) => (
            <article
              key={s.n}
              className="spot-card spot-card--row reveal"
              data-spotlight
            >
              <div className="grid gap-8 md:grid-cols-12 md:items-start">
                <div className="flex items-center gap-5 md:col-span-1 md:flex-col md:items-start">
                  <span className="eyebrow text-primary">{s.n}</span>
                </div>
                <div className="md:col-span-6">
                  <NodeIcon
                    name={SERVICE_ICONS[i] ?? "web"}
                    className="mb-6 h-14 w-14"
                  />
                  <h2 className="font-display text-3xl font-semibold md:text-5xl">
                    {s.hu}
                  </h2>
                  <p className="eyebrow mt-3">{s.title}</p>
                </div>
                <div className="md:col-span-4 md:col-start-9">
                  <p className="text-lg">{s.text}</p>
                  <ul className="mt-6 space-y-2 text-sm text-muted-foreground">
                    {s.items.map((item) => (
                      <li key={item} className="service-item">
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
      <Marquee items={services.map((s) => s.hu)} />
      <section className="mx-auto max-w-[1440px] px-5 py-24 md:px-10 md:py-32">
        <p className="eyebrow">Folyamat</p>
        <ol className="process mt-12">
          {process.map((p) => (
            <li key={p.n} className="process__step">
              <span className="process__node" aria-hidden="true" />
              <span className="process__n font-mono">{p.n}</span>
              <h2 className="font-display mt-4 text-lg font-semibold">{p.t}</h2>
              <p className="mt-2 text-sm text-muted-foreground">{p.d}</p>
            </li>
          ))}
        </ol>
        <div className="mt-20">
          <MagneticLink to="/kapcsolat">Kérj ajánlatot</MagneticLink>
        </div>
      </section>
    </>
  );
}
