export type ProjectStatus = "live" | "in-progress" | "concept";

export interface Project {
  title: string;
  slug: string;
  category: string;
  type: string;
  year: string;
  summary: string;
  caseStudy: { challenge: string; approach: string; delivered: string[] };
  cover?: string;
  gallery?: string[];
  video?: string;
  technologies: string[];
  status: ProjectStatus;
  externalUrl?: string;
  featured: boolean;
  published: boolean;
  seo: { title: string; description: string };
}

export const statusLabel: Record<ProjectStatus, string> = {
  live: "Éles",
  "in-progress": "Fejlesztés alatt",
  concept: "Koncepció",
};

// Edit this list to update the portfolio. Only `published: true` items are shown.
// Status values and details are drafts — confirm before going live.
export const projects: Project[] = [
  {
    title: "Come Get It",
    slug: "come-get-it",
    category: "Mobilalkalmazás",
    type: "Saját digitális termék",
    year: "2025—",
    summary: "Vendéglátóhely-felfedező alkalmazás előfizetéses modellel, gamificationnel és lojalitásrendszerrel.",
    caseStudy: {
      challenge: "Egy olyan termék, amely egyszerre ad okot a felhasználónak új helyek kipróbálására és visszatérő vendéget hoz a partnereknek.",
      approach: "Termékstratégia, előfizetéses üzleti modell, játékosított lojalitás és két külön felület: felhasználói app és partneradmin.",
      delivered: ["Product design és UX/UI", "Előfizetéses modell", "Gamification és lojalitás", "Felhasználói és partneradmin-rendszer"],
    },
    technologies: ["Mobile app", "Admin dashboard", "Product strategy"],
    status: "in-progress",
    featured: true,
    published: true,
    seo: { title: "Come Get It — mobilalkalmazás", description: "Vendéglátóhely-felfedező app előfizetéssel és lojalitásrendszerrel." },
  },
  {
    title: "Csík Brothers Barbershop",
    slug: "csik-brothers-barbershop",
    category: "Weboldal + rendszer",
    type: "Ügyfélprojekt",
    year: "2025",
    summary: "Prémium weboldal online időpontfoglalással és több munkatársat kezelő adminrendszerrel.",
    caseStudy: {
      challenge: "A foglalások és a csapat beosztásának kezelése telefonról és papírról egy digitális rendszerbe.",
      approach: "Karakteres, mobilra optimalizált márkaoldal, mögötte saját foglalási és munkatárs-kezelő admin.",
      delivered: ["Prémium weboldal", "Online időpontfoglalás", "Többfelhasználós admin", "Helyi SEO"],
    },
    technologies: ["Web", "Booking system", "Admin", "Local SEO"],
    status: "live",
    featured: true,
    published: true,
    seo: { title: "Csík Brothers Barbershop — weboldal és foglalás", description: "Prémium barbershop weboldal online foglalással és adminrendszerrel." },
  },
  {
    title: "DanceNow",
    slug: "dancenow",
    category: "Platform",
    type: "Ökoszisztéma-koncepció",
    year: "2025",
    summary: "Tánceseményekre épülő mobilalkalmazás és webes ökoszisztéma eseménykezeléssel és jegyfoglalással.",
    caseStudy: {
      challenge: "A táncközösség eseményei szétszórtan, több csatornán élnek.",
      approach: "Egy közös platform koncepciója: eseménykezelés, jegyfoglalás és kapcsolódó webes felületek.",
      delivered: ["Mobilalkalmazás-koncepció", "Eseménykezelés", "Jegyfoglalási flow", "Platform UX/UI"],
    },
    technologies: ["Mobile app", "Events", "Ticketing", "UX/UI"],
    status: "concept",
    featured: true,
    published: true,
    seo: { title: "DanceNow — tánc ökoszisztéma", description: "Mobilalkalmazás és webes platform tánceseményekhez." },
  },
  {
    title: "Kiscsibe Étterem",
    slug: "kiscsibe-etterem",
    category: "Weboldal",
    type: "Ügyfélprojekt",
    year: "2024",
    summary: "Vendéglátóipari weboldal üzleti célú tartalomstruktúrával.",
    caseStudy: {
      challenge: "Egyértelmű, gyors digitális megjelenés, ami a vendégeket a lényeghez vezeti.",
      approach: "Letisztult tartalomstruktúra és mobilbarát felület.",
      delivered: ["Weboldal", "Digitális megjelenés", "Tartalomstruktúra"],
    },
    technologies: ["Web", "Content"],
    status: "live",
    featured: false,
    published: true,
    seo: { title: "Kiscsibe Étterem — weboldal", description: "Vendéglátóipari weboldal üzleti tartalomstruktúrával." },
  },
  {
    title: "Violexa Cyprus",
    slug: "violexa-cyprus",
    category: "Ingatlan",
    type: "Ügyfélprojekt",
    year: "2025",
    summary: "Digitális ingatlanos megjelenés, webes és márkakommunikációs megoldások.",
    caseStudy: {
      challenge: "Nemzetközi közönségnek szóló, bizalmat építő ingatlanos megjelenés.",
      approach: "Részletek pontosítás alatt.",
      delivered: ["Webes megjelenés", "Márkakommunikáció"],
    },
    technologies: ["Web", "Brand"],
    status: "in-progress",
    featured: false,
    published: true,
    seo: { title: "Violexa Cyprus — ingatlanos megjelenés", description: "Digitális ingatlanos megjelenés Cipruson." },
  },
];

export const publishedProjects = () => projects.filter((p) => p.published);
export const getProject = (slug: string) => publishedProjects().find((p) => p.slug === slug);
