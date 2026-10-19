import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/site/Shell";
import { contact } from "@/content/site";

export const Route = createFileRoute("/adatvedelem")({
  head: () => ({
    meta: [
      { title: "Adatvédelmi tájékoztató — GátAi studio" },
      { name: "description", content: "Hogyan kezeli a GátAi studio a kapcsolatfelvétel során megadott adatokat." },
      { property: "og:title", content: "Adatvédelmi tájékoztató — GátAi studio" },
      { property: "og:description", content: "Adatkezelési alapelvek a GátAi studio weboldalán." },
    ],
  }),
  component: Privacy,
});

function Privacy() {
  return (
    <>
      <PageHeader eyebrow="Jogi" title="Adatvédelem" intro="Vázlat — élesítés előtt jogi ellenőrzés szükséges." />
      <section className="mx-auto max-w-3xl space-y-6 px-5 pb-32 text-muted-foreground md:px-10">
        <p>A kapcsolatfelvételi űrlapon megadott adatokat (név, email, projektinformációk) kizárólag a megkeresés megválaszolására használom, harmadik félnek nem adom át.</p>
        <p>Az oldal nem használ marketing célú sütiket.</p>
        <p>Adataid törlését bármikor kérheted: <a className="text-foreground" href={`mailto:${contact.email}`}>{contact.email}</a></p>
      </section>
    </>
  );
}
