import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/site/Shell";
import { MagneticLink } from "@/components/site/ui";
import { services } from "@/content/site";

export const Route = createFileRoute("/szolgaltatasok")({
  head: () => ({
    meta: [
      { title: "Szolgáltatások — GátAi studio" },
      { name: "description", content: "Weboldalak, alkalmazások, AI automatizáció, belső üzleti rendszerek, márkadesign és digitális stratégia." },
      { property: "og:title", content: "Szolgáltatások — GátAi studio" },
      { property: "og:description", content: "Hat terület, egy cél: hogy a vállalkozásod kitűnjön és hatékonyabban működjön." },
    ],
  }),
  component: Services,
});

function Services() {
  return (
    <>
      <PageHeader eyebrow="Szolgáltatások" title={<>Design.<br />Technology.<br /><span className="text-chrome">Intelligence.</span></>} intro="Nem mindenhez értek — ahhoz értek, ami egy vállalkozás digitális működéséhez kell." />
      <section className="mx-auto max-w-[1440px] px-5 pb-32 md:px-10">
        {services.map((s) => (
          <div key={s.n} className="reveal grid gap-6 border-t py-12 md:grid-cols-12 md:py-16">
            <span className="eyebrow text-primary md:col-span-1">{s.n}</span>
            <div className="md:col-span-6">
              <h2 className="font-display text-3xl font-bold md:text-5xl">{s.title}</h2>
              <p className="mt-2 text-muted-foreground">{s.hu}</p>
            </div>
            <div className="md:col-span-4 md:col-start-9">
              <p>{s.text}</p>
              <ul className="mt-6 space-y-2 text-sm text-muted-foreground">
                {s.items.map((i) => <li key={i} className="border-b pb-2">{i}</li>)}
              </ul>
            </div>
          </div>
        ))}
        <div className="mt-16"><MagneticLink to="/kapcsolat">Kérj ajánlatot</MagneticLink></div>
      </section>
    </>
  );
}
