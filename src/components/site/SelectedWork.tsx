import { Link } from "@tanstack/react-router";
import { publishedProjects } from "@/content/projects";
import { RevealWords } from "@/components/effects/MotionGraphics";
import { ProjectCover } from "./ProjectCover";
import { Eyebrow, MagneticLink } from "./ui";
import { cn } from "@/lib/utils";

// Asymmetric editorial layout: one hero project, then offset pairs.
const layout = [
  {
    wrap: "md:col-span-12",
    cover: "aspect-[4/3] md:aspect-[21/9]",
    large: true,
  },
  { wrap: "md:col-span-7", cover: "aspect-[4/3]" },
  { wrap: "md:col-span-4 md:col-start-9 md:mt-40", cover: "aspect-[3/4]" },
  { wrap: "md:col-span-5 md:col-start-2", cover: "aspect-square" },
  { wrap: "md:col-span-5 md:col-start-8 md:mt-24", cover: "aspect-[4/3]" },
];

export function SelectedWork({ n = "05" }: { n?: string }) {
  const featured = publishedProjects().filter((p) => p.featured);
  const list = [
    ...featured,
    ...publishedProjects().filter((p) => !p.featured),
  ].slice(0, 5);
  return (
    <section className="section">
      <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
        <div>
          <Eyebrow n={n}>Válogatott munkák</Eyebrow>
          <RevealWords
            text={"Valódi projektek,\nvalós állapottal."}
            accent={["valós", "állapottal"]}
            className="section-title mt-8 max-w-4xl"
          />
        </div>
        <MagneticLink to="/munkak" variant="ghost">
          Összes munka
        </MagneticLink>
      </div>
      <ul className="mt-16 grid gap-x-8 gap-y-16 md:mt-24 md:grid-cols-12 md:gap-y-24">
        {list.map((p, i) => {
          const l = layout[i]!;
          return (
            <li key={p.slug} className={cn("reveal", l.wrap)}>
              <Link
                to="/munkak/$slug"
                params={{ slug: p.slug }}
                className="work-card group block rounded-[4px] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
              >
                <div className="work-card__frame">
                  <ProjectCover
                    project={p}
                    large={!!l.large}
                    className={cn("w-full", l.cover)}
                  />
                </div>
                <div className="mt-6 grid gap-3 md:grid-cols-[auto_1fr] md:gap-8">
                  <span className="eyebrow text-primary">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <h3 className="font-display text-2xl font-semibold transition-colors group-hover:text-primary md:text-4xl">
                      {p.title}
                    </h3>
                    <p className="mt-2 max-w-xl text-muted-foreground">
                      {p.summary}
                    </p>
                    <p className="eyebrow mt-4">
                      {p.type} · {p.year}
                    </p>
                  </div>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
