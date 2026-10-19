import { createFileRoute, Link } from "@tanstack/react-router";
import { Hero3D } from "@/components/site/Hero3D";
import { AIShowcase } from "@/components/site/AIShowcase";
import { Eyebrow, MagneticLink } from "@/components/site/ui";
import { SelectedWork } from "@/components/site/SelectedWork";
import { process, services } from "@/content/site";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "GátAi studio — Ötletből működő valóság." },
      { name: "description", content: "Gátai Bence független kreatív technológiai stúdiója: weboldalak, alkalmazások, AI-megoldások és üzleti rendszerek Budapestről." },
      { property: "og:title", content: "GátAi studio — Ötletből működő valóság." },
      { property: "og:description", content: "Design. Technology. Intelligence. Weboldalak, alkalmazások és intelligens rendszerek." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Home,
});

const section = "relative mx-auto max-w-[1440px] px-5 py-24 md:px-10 md:py-40";

function Home() {
  return (
    <>
      <Hero3D />
      <div className="relative z-10">
        {/* The content follows the complete logo story. */}
        <section id="studio-intro" className="signature-hero">
          <div className="signature-hero__content">
            <div>
              <p className="signature-hero__intro">Gátai Bence független digitális stúdiója</p>
              <h1 className="signature-hero__title">Ötletből.<br />Működő valóság.</h1>
            </div>
            <div className="signature-hero__offer">
              <p>Weboldalakat, alkalmazásokat és intelligens rendszereket tervezek és építek — a vállalkozásod működésére szabva.</p>
              <div className="mt-7 flex flex-wrap gap-3">
                <MagneticLink to="/kapcsolat">Projekt indítása</MagneticLink>
                <MagneticLink to="/munkak" variant="ghost">Munkáim</MagneticLink>
              </div>
            </div>
          </div>
        </section>

        {/* Intro */}
        <section className={`${section} scrim`} data-text>
          <Eyebrow n="01">Amit létrehozok</Eyebrow>
          <p className="reveal font-display mt-10 max-w-5xl text-3xl font-semibold leading-[1.1] md:text-6xl">
            Nem csak jól kinéző weboldalakat építek. Digitális megoldásokat hozok létre, amelyek{" "}
            <span className="text-muted-foreground">valódi értéket teremtenek.</span>
          </p>
          <p className="reveal mt-10 max-w-md text-muted-foreground">
            Stratégiai gondolkodás, egyedi design és intelligens technológia — hogy a vállalkozásod kitűnjön és hatékonyabban működjön.
          </p>
        </section>

        {/* Selected work — sits over the GÁTAI letters beat */}
        <SelectedWork />

        {/* Capabilities */}
        <section className={`${section} scrim`} data-text>
          <Eyebrow n="03">Képességek</Eyebrow>
          <div className="mt-12 grid border-t md:grid-cols-3">
            {services.map((s) => (
              <Link key={s.n} to="/szolgaltatasok" className="group reveal border-b p-6 transition-colors hover:bg-card md:border-r md:p-10 md:[&:nth-child(3n)]:border-r-0">
                <span className="eyebrow text-primary">{s.n}</span>
                <h3 className="font-display mt-10 text-xl font-bold md:text-2xl">{s.title}</h3>
                <p className="mt-3 text-sm text-muted-foreground">{s.text}</p>
              </Link>
            ))}
          </div>
        </section>

        {/* AI — network beat */}
        <section className={`${section} scrim`} data-text>
          <Eyebrow n="04">AI & Automation</Eyebrow>
          <h2 className="font-display reveal mt-8 mb-14 max-w-4xl text-4xl font-bold leading-[0.95] md:text-7xl">
            Rendszerek, amelyek <span className="text-chrome">helyetted dolgoznak.</span>
          </h2>
          <AIShowcase />
        </section>

        {/* Process */}
        <section className={`${section} scrim`} data-text>
          <Eyebrow n="05">Hogyan dolgozom</Eyebrow>
          <div className="mt-12 grid gap-px md:grid-cols-5">
            {process.map((p) => (
              <div key={p.n} className="reveal border-t pt-6 md:pr-6">
                <span className="font-display text-5xl font-bold text-muted-foreground/40">{p.n}</span>
                <h3 className="mt-6 text-lg font-semibold">{p.t}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{p.d}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Why + founder */}
        <section className={`${section} scrim`} data-text>
          <div className="grid gap-16 md:grid-cols-12">
            <div className="md:col-span-5">
              <div className="reveal sticky top-28 border-t pt-8">
                <p className="eyebrow">Stúdió-manifesztó</p>
                <p className="font-display mt-8 text-[13vw] leading-[0.82] font-extrabold md:text-[6.5vw]">
                  Egy<br />ember.<br /><span className="text-chrome">Teljes</span><br />felelősség<span className="text-primary">.</span>
                </p>
                <p className="mt-8 max-w-xs text-sm text-muted-foreground">Független stúdió Budapesten — stratégia, design és fejlesztés egy kézben.</p>
              </div>
            </div>
            <div className="md:col-span-6 md:col-start-7">
              <Eyebrow n="06">Az alapító</Eyebrow>
              <h2 className="font-display reveal mt-8 text-4xl font-bold leading-[0.95] md:text-6xl">
                I build the brain behind the business.
              </h2>
              <p className="reveal mt-8 text-muted-foreground">
                Gátai Bence vagyok. Üzleti, marketing- és technológiai szemlélettel dolgozom: nem csak megtervezem, hogyan néz ki valami, hanem azt is, hogyan működik és mit hoz a vállalkozásnak.
              </p>
              <ul className="mt-10 space-y-4 border-t pt-8">
                {[
                  ["Munka minősége", "Részletekig kidolgozott design és stabil technológia."],
                  ["Gondolkodásmód", "Üzleti cél először, eszköz másodszor."],
                  ["Személyes felelősség", "Egy kapcsolattartó, aki végig érti a projektet."],
                ].map(([t, d]) => (
                  <li key={t} className="reveal grid grid-cols-3 gap-4 text-sm">
                    <span className="font-medium">{t}</span>
                    <span className="col-span-2 text-muted-foreground">{d}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-10"><MagneticLink to="/rolam" variant="ghost">Bővebben rólam</MagneticLink></div>
            </div>
          </div>
        </section>

        {/* CTA — final G beat */}
        <section className={`${section} scrim text-center`} data-text>
          <p className="eyebrow">Projektindítás</p>
          <h2 className="font-display reveal mx-auto mt-8 max-w-5xl text-5xl font-extrabold leading-[0.9] md:text-8xl">
            Építsünk valami <span className="text-primary">rendkívülit.</span>
          </h2>
          <div className="mt-12 flex flex-wrap justify-center gap-3">
            <MagneticLink to="/kapcsolat">Beszéljünk a projektedről</MagneticLink>
            <MagneticLink to="/szolgaltatasok" variant="ghost">Szolgáltatások</MagneticLink>
          </div>
        </section>
      </div>
    </>
  );
}
