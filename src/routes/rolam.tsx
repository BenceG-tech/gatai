import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/site/Shell";
import { MagneticLink } from "@/components/site/ui";
import { BrandMonogram } from "@/components/site/BrandLogo";
import { Ink } from "@/components/effects/MotionGraphics";
import { NeuralMesh } from "@/components/effects/NeuralMesh";

export const Route = createFileRoute("/rolam")({
  head: () => ({
    meta: [
      { title: "Rólam — Gátai Bence | GátAi studio" },
      {
        name: "description",
        content:
          "Gátai Bence: üzleti, marketing- és technológiai szemlélet egy kézben. Független kreatív technológiai stúdió Budapesten.",
      },
      { property: "og:title", content: "Rólam — Gátai Bence" },
      {
        property: "og:description",
        content: "I build the brain behind the business.",
      },
    ],
  }),
  component: About,
});

function About() {
  return (
    <>
      <PageHeader
        eyebrow="Rólam / Stúdió"
        title={"I build the brain\nbehind the business."}
        accent={["brain"]}
      />
      <section className="mx-auto grid max-w-[1440px] gap-16 px-5 pb-32 md:grid-cols-12 md:px-10">
        <figure className="portrait reveal md:col-span-5">
          <NeuralMesh
            className="portrait__mesh"
            density={0.8}
            label="Neurális háló a portré helyén"
          />
          <BrandMonogram decorative className="portrait__mark" />
          <figcaption className="eyebrow portrait__caption">
            Kép helye · Portré
          </figcaption>
        </figure>
        <div className="space-y-8 text-lg md:col-span-6 md:col-start-7">
          <p className="statement statement--sm">
            <Ink>
              Gátai Bence vagyok, a GátAi studio alapítója. Weboldalakat,
              alkalmazásokat, üzleti rendszereket,{" "}
            </Ink>
            <Ink tone="azure">AI-megoldásokat és automatizációkat</Ink>
            <Ink> építek.</Ink>
          </p>
          <p className="reveal text-muted-foreground">
            Az üzleti és marketing oldalt ugyanúgy értem, mint a technológiát.
            Ezért nem csak azt kérdezem, hogyan nézzen ki valami — hanem azt is,
            mit kell elérnie.
          </p>
          <p className="reveal text-muted-foreground">
            Jelenleg egyedül dolgozom, közvetlen kapcsolatban az ügyfeleimmel. A
            GátAi studio úgy épül, hogy idővel egy nagyobb stúdióvá nőhessen.
          </p>
          <dl className="reveal grid grid-cols-2 gap-6 border-t pt-8 text-sm">
            <div>
              <dt className="eyebrow mb-2">Bázis</dt>
              <dd>Budapest</dd>
            </div>
            <div>
              <dt className="eyebrow mb-2">Nyelvek</dt>
              <dd>Magyar · English</dd>
            </div>
            <div>
              <dt className="eyebrow mb-2">Fókusz</dt>
              <dd>Web · App · AI · Rendszerek</dd>
            </div>
            <div>
              <dt className="eyebrow mb-2">Ügyfelek</dt>
              <dd>Magyarország → nemzetközi</dd>
            </div>
          </dl>
          <MagneticLink to="/kapcsolat">Dolgozzunk együtt</MagneticLink>
        </div>
      </section>
    </>
  );
}
