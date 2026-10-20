import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader } from "@/components/site/Shell";
import { ProjectCover } from "@/components/site/ProjectCover";
import { publishedProjects } from "@/content/projects";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/munkak/")({
  head: () => ({
    meta: [
      { title: "Munkáim — GátAi studio" },
      {
        name: "description",
        content:
          "Weboldalak, alkalmazások és digitális termékek Gátai Bence stúdiójából — valós státusszal.",
      },
      { property: "og:title", content: "Munkáim — GátAi studio" },
      {
        property: "og:description",
        content: "Válogatott projektek: weboldalak, rendszerek, alkalmazások.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Work,
});

function Work() {
  const all = publishedProjects();
  const cats = ["Összes", ...Array.from(new Set(all.map((p) => p.category)))];
  const [cat, setCat] = useState("Összes");
  const list = cat === "Összes" ? all : all.filter((p) => p.category === cat);
  return (
    <>
      <PageHeader
        eyebrow="Munkáim"
        title={"Válogatott\nmunkák."}
        accent={["munkák"]}
        intro="Ügyfélprojektek és saját termékek. Minden projektnél jelölöm a valós állapotot — éles, fejlesztés alatt vagy koncepció."
      />
      <section className="mx-auto max-w-[1440px] px-5 pb-32 md:px-10">
        <div
          role="group"
          aria-label="Szűrés kategória szerint"
          className="-mx-5 mb-12 flex gap-2 overflow-x-auto px-5 pb-2 md:mx-0 md:flex-wrap md:px-0"
        >
          {cats.map((c) => (
            <button
              key={c}
              type="button"
              aria-pressed={c === cat}
              onClick={() => setCat(c)}
              className={cn("chip shrink-0", c === cat && "is-active")}
            >
              {c}
            </button>
          ))}
        </div>
        <ul className="grid gap-x-8 gap-y-16 md:grid-cols-2">
          {list.map((p, i) => (
            <li
              key={p.slug}
              className={cn("reveal", i % 2 === 1 && "md:mt-24")}
            >
              <Link
                to="/munkak/$slug"
                params={{ slug: p.slug }}
                className="work-card group block"
              >
                <div className="work-card__frame">
                  <ProjectCover project={p} className="aspect-[4/3] w-full" />
                </div>
                <div className="mt-6 flex items-baseline justify-between gap-4">
                  <h2 className="font-display text-2xl font-semibold transition-colors group-hover:text-primary md:text-3xl">
                    {p.title}
                  </h2>
                  <span className="eyebrow shrink-0">{p.year}</span>
                </div>
                <p className="mt-3 max-w-lg text-muted-foreground">
                  {p.summary}
                </p>
              </Link>
            </li>
          ))}
        </ul>
        <p className="mt-24 max-w-xl text-xs text-muted-foreground">
          A projektleírások előzetesek, véglegesítésük folyamatban.
          Képernyőképek és élő linkek csak jóváhagyás után kerülnek fel.
        </p>
      </section>
    </>
  );
}
