import { ideaModules } from "@/content/site";

export type IdeaModuleId = (typeof ideaModules)[number]["id"];

/** Lower-case and strip Hungarian accents so "Időpont" matches "idopont". */
export function normalise(text: string): string {
  return text.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
}

/** What a plain idea grows into when no keyword matches yet. */
export const DEFAULT_MODULES: readonly IdeaModuleId[] = ["web", "crm", "ai"];

/** Modules that naturally belong next to each other, best match first. */
const AFFINITY: Record<IdeaModuleId, readonly IdeaModuleId[]> = {
  web: ["data", "ai", "crm"],
  app: ["shop", "data", "automation"],
  booking: ["automation", "app", "data"],
  shop: ["automation", "data", "ai"],
  ai: ["docs", "automation", "crm"],
  automation: ["crm", "data", "ai"],
  crm: ["automation", "data", "docs"],
  data: ["automation", "crm", "ai"],
  docs: ["ai", "automation", "crm"],
};

/** Map a free-text idea onto system modules (in catalogue order). */
export function ideaToModules(idea: string): IdeaModuleId[] {
  const text = normalise(idea);
  if (!text.trim()) return [...DEFAULT_MODULES];
  // keywords match at the start of a word, so "ai" does not fire inside "számláim"
  const words = ` ${text.replace(/[^a-z0-9-]+/g, " ")}`;
  const hits = ideaModules
    .filter((m) =>
      m.keywords.some(
        (k) =>
          words.includes(` ${normalise(k)}`) ||
          words.includes(`-${normalise(k)}`),
      ),
    )
    .map((m) => m.id as IdeaModuleId);
  if (!hits.length) return [...DEFAULT_MODULES];
  // every system needs a face: add the website when nothing user-facing matched
  if (!hits.some((id) => id === "web" || id === "app" || id === "shop"))
    hits.unshift("web");
  return ideaModules
    .map((m) => m.id as IdeaModuleId)
    .filter((id) => hits.includes(id));
}

/** The things the visitor did not ask for yet but will want next (max `limit`). */
export function suggestNext(
  active: readonly IdeaModuleId[],
  limit = 2,
): IdeaModuleId[] {
  const score = new Map<IdeaModuleId, number>();
  active.forEach((id) =>
    AFFINITY[id].forEach((next, rank) => {
      if (!active.includes(next))
        score.set(next, (score.get(next) ?? 0) + (3 - rank));
    }),
  );
  return [...score.entries()]
    .sort((a, b) => b[1] - a[1] || order(a[0]) - order(b[0]))
    .slice(0, limit)
    .map(([id]) => id);
}

function order(id: IdeaModuleId) {
  return ideaModules.findIndex((m) => m.id === id);
}
