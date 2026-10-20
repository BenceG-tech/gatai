import { describe, expect, it } from "vitest";
import { ideaModules, ideaPresets } from "@/content/site";
import {
  DEFAULT_MODULES,
  ideaToModules,
  normalise,
  suggestNext,
} from "@/lib/idea-system";

describe("idea → system", () => {
  it("normalises Hungarian accents", () => {
    expect(normalise("Időpontfoglalás ÜGYFÉL")).toBe("idopontfoglalas ugyfel");
  });

  it("maps ideas onto the matching modules", () => {
    expect(
      ideaToModules("Időpontfoglalás és AI-válaszok a szalonomnak"),
    ).toEqual(["web", "booking", "ai"]);
    expect(
      ideaToModules("CRM az ajánlatkéréseinkhez, automatikus e-mailekkel"),
    ).toEqual(expect.arrayContaining(["automation", "crm"]));
    expect(ideaToModules("webshop kártyás fizetéssel")).toContain("shop");
  });

  it("does not fire short keywords inside other words", () => {
    // "számláim" contains "ai" but is not about AI
    expect(ideaToModules("rendezni a számláim")).not.toContain("ai");
  });

  it("falls back to a sensible starter system", () => {
    expect(ideaToModules("")).toEqual([...DEFAULT_MODULES]);
    expect(ideaToModules("valami egészen más")).toEqual([...DEFAULT_MODULES]);
  });

  it("always gives every preset a face and at least two modules", () => {
    for (const preset of ideaPresets) {
      const mods = ideaToModules(preset);
      expect(mods.length).toBeGreaterThanOrEqual(2);
      expect(mods.some((m) => m === "web" || m === "app" || m === "shop")).toBe(
        true,
      );
    }
  });

  it("suggests what the visitor has not asked for yet", () => {
    const active = ideaToModules("foglalás a szalonomnak");
    const next = suggestNext(active);
    expect(next).toHaveLength(2);
    for (const id of next) expect(active).not.toContain(id);
    expect(suggestNext(ideaModules.map((m) => m.id))).toEqual([]);
  });
});
