import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/site/Shell";
import { MagneticLink, PlaceholderArt } from "@/components/site/ui";

export const Route = createFileRoute("/rolam")({
  head: () => ({
    meta: [
      { title: "Rólam — Gátai Bence | GátAi studio" },
      { name: "description", content: "Gátai Bence: üzleti, marketing- és technológiai szemlélet egy kézben. Független kreatív technológiai stúdió Budapesten." },
      { property: "og:title", content: "Rólam — Gátai Bence" },
      { property: "og:description", content: "I build the brain behind the business." },
    ],
  }),
  component: About,
});

function About() {
  return (
    <>
      <PageHeader eyebrow="Rólam / Stúdió" title={<>I build the brain<br /><span className="text-chrome">behind the business.</span></>} />
      <section className="mx-auto grid max-w-[1440px] gap-16 px-5 pb-32 md:grid-cols-12 md:px-10">
        <PlaceholderArt label="Portré" className="reveal aspect-[4/5] md:col-span-5" />
        <div className="space-y-8 text-lg md:col-span-6 md:col-start-7">
          <p className="reveal">Gátai Bence vagyok, a GátAi studio alapítója. Weboldalakat, alkalmazásokat, üzleti rendszereket, AI-megoldásokat és automatizációkat építek.</p>
          <p className="reveal text-muted-foreground">Az üzleti és marketing oldalt ugyanúgy értem, mint a technológiát. Ezért nem csak azt kérdezem, hogyan nézzen ki valami — hanem azt is, mit kell elérnie.</p>
          <p className="reveal text-muted-foreground">Jelenleg egyedül dolgozom, közvetlen kapcsolatban az ügyfeleimmel. A GátAi studio úgy épül, hogy idővel egy nagyobb stúdióvá nőhessen.</p>
          <div className="reveal grid grid-cols-2 gap-6 border-t pt-8 text-sm">
            <div><p className="eyebrow mb-2">Bázis</p>Budapest</div>
            <div><p className="eyebrow mb-2">Nyelvek</p>Magyar · English</div>
            <div><p className="eyebrow mb-2">Fókusz</p>Web · App · AI · Rendszerek</div>
            <div><p className="eyebrow mb-2">Ügyfelek</p>Magyarország → nemzetközi</div>
          </div>
          <MagneticLink to="/kapcsolat">Dolgozzunk együtt</MagneticLink>
        </div>
      </section>
    </>
  );
}
