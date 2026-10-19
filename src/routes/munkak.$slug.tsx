import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ProjectCover, StatusChip } from "@/components/site/ProjectCover";
import { MagneticLink } from "@/components/site/ui";
import { getProject, publishedProjects } from "@/content/projects";

export const Route = createFileRoute("/munkak/$slug")({
  loader: ({ params }) => {
    const project = getProject(params.slug);
    if (!project) throw notFound();
    const all = publishedProjects();
    const next = all[(all.findIndex((p) => p.slug === project.slug) + 1) % all.length]!;
    return { project, next };
  },
  head: ({ loaderData }) => {
    if (!loaderData) return { meta: [{ title: "Projekt nem található — GátAi studio" }, { name: "robots", content: "noindex" }] };
    const { seo } = loaderData.project;
    return {
      meta: [
        { title: `${seo.title} — GátAi studio` },
        { name: "description", content: seo.description },
        { property: "og:title", content: `${seo.title} — GátAi studio` },
        { property: "og:description", content: seo.description },
        { property: "og:type", content: "article" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  notFoundComponent: () => (
    <section className="mx-auto max-w-[1440px] px-5 pt-48 pb-32 md:px-10">
      <h1 className="font-display text-5xl font-bold">Ez a projekt nem található.</h1>
      <Link to="/munkak" className="eyebrow mt-8 inline-block text-foreground hover:text-primary">← Összes munka</Link>
    </section>
  ),
  component: ProjectPage,
});

function ProjectPage() {
  const { project: p, next } = Route.useLoaderData();
  return (
    <article>
      <header className="mx-auto max-w-[1440px] px-5 pt-32 md:px-10 md:pt-44">
        <Link to="/munkak" className="eyebrow hover:text-foreground">← Munkáim</Link>
        <div className="mt-10 grid gap-10 md:grid-cols-12 md:items-end">
          <h1 className="font-display reveal text-5xl leading-[0.9] font-extrabold md:col-span-8 md:text-8xl">{p.title}</h1>
          <dl className="grid grid-cols-2 gap-6 text-sm md:col-span-4">
            <div><dt className="eyebrow">Típus</dt><dd className="mt-1">{p.type}</dd></div>
            <div><dt className="eyebrow">Év</dt><dd className="mt-1">{p.year}</dd></div>
            <div><dt className="eyebrow">Kategória</dt><dd className="mt-1">{p.category}</dd></div>
            <div><dt className="eyebrow">Állapot</dt><dd className="mt-1"><StatusChip project={p} /></dd></div>
          </dl>
        </div>
        <p className="reveal mt-10 max-w-2xl text-xl text-muted-foreground md:text-2xl">{p.summary}</p>
      </header>

      <div className="mx-auto mt-16 max-w-[1440px] px-5 md:px-10">
        <ProjectCover project={p} large className="aspect-[4/3] w-full md:aspect-[21/9]" />
      </div>

      <section className="mx-auto grid max-w-[1440px] gap-16 px-5 py-24 md:grid-cols-12 md:px-10 md:py-36">
        <div className="md:col-span-4">
          <p className="eyebrow text-primary">01 · Kihívás</p>
          <p className="font-display reveal mt-6 text-2xl leading-tight font-semibold md:text-3xl">{p.caseStudy.challenge}</p>
        </div>
        <div className="md:col-span-4 md:col-start-6">
          <p className="eyebrow text-primary">02 · Megközelítés</p>
          <p className="reveal mt-6 text-lg text-muted-foreground">{p.caseStudy.approach}</p>
        </div>
        <div className="md:col-span-3 md:col-start-10">
          <p className="eyebrow text-primary">03 · Mit készítettem</p>
          <ul className="mt-6 divide-y border-y">
            {p.caseStudy.delivered.map((d) => <li key={d} className="py-3 text-sm">{d}</li>)}
          </ul>
        </div>
      </section>

      <section className="mx-auto max-w-[1440px] border-t px-5 py-16 md:px-10">
        <p className="eyebrow">Technológiák és területek</p>
        <ul className="mt-6 flex flex-wrap gap-2">
          {p.technologies.map((t) => <li key={t} className="rounded-full border px-4 py-2 text-sm">{t}</li>)}
        </ul>
        <p className="mt-10 max-w-xl text-xs text-muted-foreground">
          A leírás előzetes; képernyőképek, eredmények és élő link csak a megrendelő jóváhagyása után kerülnek fel.
        </p>
      </section>

      <section className="mx-auto max-w-[1440px] px-5 pb-24 md:px-10">
        <div className="flex flex-col gap-10 border-t pt-16 md:flex-row md:items-end md:justify-between">
          <Link to="/munkak/$slug" params={{ slug: next.slug }} className="group">
            <p className="eyebrow">Következő projekt</p>
            <p className="font-display mt-4 text-4xl font-bold transition-colors group-hover:text-primary md:text-7xl">{next.title} →</p>
          </Link>
          <MagneticLink to="/kapcsolat">Hasonló projektet terveznél?</MagneticLink>
        </div>
      </section>
    </article>
  );
}
