import { createFileRoute, Link } from "@tanstack/react-router";
import { NeuralHero } from "@/components/hero/NeuralHero";
import { AIShowcase } from "@/components/site/AIShowcase";
import { Eyebrow, MagneticLink } from "@/components/site/ui";
import { SelectedWork } from "@/components/site/SelectedWork";
import { NeuralSphere } from "@/components/site/NeuralSphereSection";
import { NodeIcon, SERVICE_ICONS } from "@/components/effects/NodeIcon";
import { NeuralMesh } from "@/components/effects/NeuralMesh";
import { NeuralThread } from "@/components/effects/NeuralThread";
import { ImagineDay } from "@/components/site/ImagineDay";
import { IdeaToSystem } from "@/components/site/IdeaToSystem";
import {
  Counter,
  Ink,
  Marquee,
  RevealWords,
  SynapseDivider,
} from "@/components/effects/MotionGraphics";
import { useSpotlightGroup } from "@/hooks/use-pointer-effects";
import { contact, process, services } from "@/content/site";
import { publishedProjects } from "@/content/projects";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "GátAi studio — Ötletből működő valóság." },
      {
        name: "description",
        content:
          "Gátai Bence független digitális stúdiója: weboldalak, alkalmazások, AI-megoldások, automatizáció és üzleti rendszerek Budapestről.",
      },
      {
        property: "og:title",
        content: "GátAi studio — Ötletből működő valóság.",
      },
      {
        property: "og:description",
        content:
          "Design. Technology. Intelligence. Weboldalak, alkalmazások és intelligens rendszerek.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Home,
});

const MARQUEE = [
  "Weboldalak",
  "Alkalmazások",
  "AI automatizáció",
  "Üzleti rendszerek",
  "Márka és design",
  "Digitális stratégia",
];

function Services() {
  const grid = useSpotlightGroup<HTMLUListElement>();
  return (
    <section
      className="section"
      data-formation="grid"
      aria-labelledby="services-title"
    >
      <div className="grid gap-8 md:grid-cols-12 md:items-end">
        <div className="md:col-span-7">
          <Eyebrow n="03">Képességek</Eyebrow>
          <RevealWords
            as="h2"
            text={"Hat terület,\negy működő rendszer."}
            id="services-title"
            accent={["működő"]}
            className="section-title mt-8"
          />
        </div>
        <p className="reveal max-w-md text-muted-foreground md:col-span-4 md:col-start-9">
          Stratégia, design és fejlesztés egy kézben — a weboldaltól az
          AI-ügynökig minden ugyanarra a célra dolgozik: hogy a vállalkozásod
          jobban működjön.
        </p>
      </div>
      <ul
        ref={grid}
        className="spot-grid mt-14 grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
      >
        {services.map((s, i) => (
          <li key={s.n} className="reveal">
            <Link
              to="/szolgaltatasok"
              className="spot-card group"
              data-spotlight
            >
              <div className="flex items-start justify-between">
                <NodeIcon
                  name={SERVICE_ICONS[i] ?? "web"}
                  className="h-14 w-14"
                />
                <span className="eyebrow text-primary">{s.n}</span>
              </div>
              <h3 className="font-display mt-10 text-xl font-semibold md:text-2xl">
                {s.hu}
              </h3>
              <p className="eyebrow mt-2 text-[0.65rem]">{s.title}</p>
              <p className="mt-4 text-sm text-muted-foreground">{s.text}</p>
              <ul
                className="mt-6 flex flex-wrap gap-1.5"
                aria-label={`${s.hu}: részterületek`}
              >
                {s.items.map((item) => (
                  <li key={item} className="tag">
                    {item}
                  </li>
                ))}
              </ul>
              <span className="spot-card__more" aria-hidden="true">
                Részletek →
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

function NeuralCore() {
  const stats = [
    { value: services.length, label: "szakterület egy kézben" },
    { value: process.length, label: "lépés az ötlettől az élesítésig" },
    { value: publishedProjects().length, label: "válogatott projekt" },
    { value: 1, label: "felelős kapcsolattartó" },
  ];
  return (
    <section
      className="section neural-core"
      data-formation="sphere"
      aria-labelledby="core-title"
    >
      <div className="grid items-center gap-12 lg:grid-cols-12">
        <div className="lg:col-span-6">
          <Eyebrow n="05">Neurális mag</Eyebrow>
          <RevealWords
            as="h2"
            text={"Rendszerek, amelyek\nhelyetted dolgoznak."}
            id="core-title"
            accent={["helyetted", "dolgoznak"]}
            className="section-title mt-8"
          />
          <p className="reveal mt-8 max-w-lg text-muted-foreground">
            AI-asszisztensek, dokumentumfeldolgozás és automatizált folyamatok,
            amelyek a meglévő eszközeidhez kapcsolódnak. A gömb ugyanaz a háló,
            amiből a logó felépül: minden csomópont egy lépés, minden impulzus
            egy elvégzett feladat.
          </p>
          <dl className="stats mt-12">
            {stats.map((s) => (
              <div key={s.label} className="stats__item reveal">
                <dt className="sr-only">{s.label}</dt>
                <dd>
                  <Counter value={s.value} className="stats__value" />
                  <span className="stats__label" aria-hidden="true">
                    {s.label}
                  </span>
                </dd>
              </div>
            ))}
          </dl>
        </div>
        <div className="lg:col-span-6">
          <NeuralSphere className="neural-sphere" />
          <p className="eyebrow mt-4 text-center" aria-hidden="true">
            Interaktív · vidd fölé az egeret
          </p>
        </div>
      </div>
    </section>
  );
}

function Process() {
  return (
    <section
      className="section"
      data-formation="line"
      aria-labelledby="process-title"
    >
      <Eyebrow n="08">Hogyan dolgozom</Eyebrow>
      <RevealWords
        as="h2"
        text={"Öt lépés, egy\nfolyamatos impulzus."}
        id="process-title"
        accent={["impulzus"]}
        className="section-title mt-8"
      />
      <ol className="process mt-16">
        {process.map((p) => (
          <li key={p.n} className="process__step">
            <span className="process__node" aria-hidden="true" />
            <span className="process__n font-mono">{p.n}</span>
            <h3 className="font-display mt-4 text-lg font-semibold">{p.t}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{p.d}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}

function Home() {
  return (
    <>
      <NeuralThread />
      <NeuralHero />
      <div className="home-flow">
        <section
          id="studio-intro"
          className="section intro"
          data-formation="drift"
        >
          <div className="grid gap-10 md:grid-cols-12 md:items-end">
            <div className="md:col-span-7">
              <Eyebrow n="01">Gátai Bence független digitális stúdiója</Eyebrow>
              <RevealWords
                as="h1"
                text={"Ötletből.\nMűködő valóság."}
                accent={["valóság"]}
                className="display-title mt-8"
              />
            </div>
            <div className="md:col-span-5">
              <p className="reveal text-lg text-muted-foreground">
                Weboldalakat, alkalmazásokat és intelligens rendszereket
                tervezek és építek — azokat is, amelyekről még nem tudod, hogy
                szükséged van rájuk.
              </p>
              <div className="reveal mt-8 flex flex-wrap gap-3">
                <MagneticLink to="/kapcsolat">Projekt indítása</MagneticLink>
                <MagneticLink to="/munkak" variant="ghost">
                  Munkáim
                </MagneticLink>
              </div>
            </div>
          </div>
          <p className="statement mt-24 md:mt-36">
            <Ink>
              Nem csak jól kinéző weboldalakat építek. Digitális megoldásokat
              hozok létre, amelyek{" "}
            </Ink>
            <Ink tone="azure">valódi értéket teremtenek.</Ink>
          </p>
        </section>

        <Marquee items={MARQUEE} />
        <ImagineDay />

        <SynapseDivider label="03 — Képességek" />
        <Services />

        <SynapseDivider label="04 — Ötlet → rendszer" pulses={3} />
        <IdeaToSystem />

        <SynapseDivider label="05 — Neurális mag" pulses={3} />
        <NeuralCore />

        <section
          className="section pt-0"
          data-formation="flow"
          aria-labelledby="ai-title"
        >
          <Eyebrow n="06">AI a gyakorlatban</Eyebrow>
          <h2
            id="ai-title"
            className="section-title reveal mt-8 mb-14 max-w-4xl"
          >
            Kézi munka helyett{" "}
            <span className="text-primary">automatikus folyamat.</span>
          </h2>
          <AIShowcase />
        </section>

        <SynapseDivider label="07 — Munkák" />
        <div data-formation="constellation">
          <SelectedWork n="07" />
        </div>

        <SynapseDivider label="08 — Folyamat" />
        <Process />

        <section
          className="section"
          data-formation="drift"
          aria-labelledby="founder-title"
        >
          <div className="grid gap-16 md:grid-cols-12">
            <div className="md:col-span-5">
              <div className="reveal border-t pt-8 md:sticky md:top-28">
                <p className="eyebrow">Stúdió-manifesztó</p>
                <p className="font-display mt-8 text-[13vw] leading-[0.86] font-semibold tracking-tight md:text-[6vw]">
                  Egy
                  <br />
                  ember.
                  <br />
                  <span className="text-chrome">Teljes</span>
                  <br />
                  felelősség<span className="text-primary">.</span>
                </p>
                <p className="mt-8 max-w-xs text-sm text-muted-foreground">
                  Független stúdió Budapesten — stratégia, design és fejlesztés
                  egy kézben.
                </p>
              </div>
            </div>
            <div className="md:col-span-6 md:col-start-7">
              <Eyebrow n="09">Az alapító</Eyebrow>
              <RevealWords
                as="h2"
                text="I build the brain behind the business."
                id="founder-title"
                accent={["brain"]}
                className="section-title mt-8"
              />
              <p className="reveal mt-8 text-muted-foreground">
                Gátai Bence vagyok. Üzleti, marketing- és technológiai
                szemlélettel dolgozom: nem csak megtervezem, hogyan néz ki
                valami, hanem azt is, hogyan működik és mit hoz a
                vállalkozásnak.
              </p>
              <ul className="mt-10 space-y-4 border-t pt-8">
                {[
                  [
                    "Munka minősége",
                    "Részletekig kidolgozott design és stabil technológia.",
                  ],
                  ["Gondolkodásmód", "Üzleti cél először, eszköz másodszor."],
                  [
                    "Személyes felelősség",
                    "Egy kapcsolattartó, aki végig érti a projektet.",
                  ],
                ].map(([t, d]) => (
                  <li key={t} className="reveal grid grid-cols-3 gap-4 text-sm">
                    <span className="font-medium">{t}</span>
                    <span className="col-span-2 text-muted-foreground">
                      {d}
                    </span>
                  </li>
                ))}
              </ul>
              <div className="mt-10">
                <MagneticLink to="/rolam" variant="ghost">
                  Bővebben rólam
                </MagneticLink>
              </div>
            </div>
          </div>
        </section>

        <section
          className="final-cta"
          data-formation="converge"
          aria-labelledby="cta-title"
        >
          <NeuralMesh
            className="final-cta__mesh"
            label="Neurális háló, amely a kurzorhoz kapcsolódik"
          />
          <div className="final-cta__inner">
            <p className="eyebrow">Projektindítás</p>
            <RevealWords
              as="h2"
              text={"Építsünk valami\nrendkívülit."}
              id="cta-title"
              accent={["rendkívülit"]}
              className="display-title mx-auto mt-8 max-w-5xl"
            />
            <p className="reveal mx-auto mt-8 max-w-xl text-lg text-muted-foreground">
              Hozd az ötletet — egy mondatban vagy egy teli füzetben.
              Megmutatom, mi lehet belőle, és megépítem úgy, hogy működjön.
            </p>
            <div className="mt-12 flex flex-wrap justify-center gap-3">
              <MagneticLink to="/kapcsolat">
                Beszéljünk a projektedről
              </MagneticLink>
              <MagneticLink to="/szolgaltatasok" variant="ghost">
                Szolgáltatások
              </MagneticLink>
            </div>
            <a
              href={`mailto:${contact.email}`}
              className="link-underline mt-10 inline-block font-mono text-sm text-muted-foreground"
            >
              {contact.email}
            </a>
          </div>
        </section>
      </div>
    </>
  );
}
