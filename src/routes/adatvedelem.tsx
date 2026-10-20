import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/site/Shell";
import { contact } from "@/content/site";

export const Route = createFileRoute("/adatvedelem")({
  head: () => ({
    meta: [
      { title: "Adatvédelmi tájékoztató — GátAi studio" },
      {
        name: "description",
        content:
          "Hogyan kezeli a GátAi studio a kapcsolatfelvétel során megadott adatokat.",
      },
      {
        property: "og:title",
        content: "Adatvédelmi tájékoztató — GátAi studio",
      },
      {
        property: "og:description",
        content: "Adatkezelési alapelvek a GátAi studio weboldalán.",
      },
    ],
  }),
  component: Privacy,
});

function Privacy() {
  return (
    <>
      <PageHeader
        eyebrow="Jogi"
        title="Adatvédelem"
        intro="Vázlat — élesítés előtt jogi ellenőrzés szükséges."
      />
      <section className="mx-auto max-w-3xl px-5 pb-32 md:px-10">
        <div className="prose-block space-y-6 text-muted-foreground">
          <p>
            A kapcsolatfelvételi űrlapon megadott adatokat (név, email,
            projektinformációk) kizárólag a megkeresés megválaszolására
            használom, harmadik félnek nem adom át.
          </p>
          <p>Az oldal nem használ marketing célú sütiket.</p>
          <p>
            Adataid törlését bármikor kérheted:{" "}
            <a
              className="link-underline text-foreground"
              href={`mailto:${contact.email}`}
            >
              {contact.email}
            </a>
          </p>
        </div>
      </section>
    </>
  );
}
