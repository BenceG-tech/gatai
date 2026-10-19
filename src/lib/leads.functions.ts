import { createServerFn } from "@tanstack/react-start";
import { LEAD_RATE_LIMIT, LEAD_RATE_WINDOW_MIN, leadSchema, type LeadInput } from "./leads";

export type LeadResult = { ok: true } | { ok: false; error: string };

export const submitLead = createServerFn({ method: "POST" })
  .inputValidator((input: LeadInput) => input)
  .handler(async ({ data }): Promise<LeadResult> => {
    const parsed = leadSchema.safeParse(data);
    if (!parsed.success) {
      // Honeypot hit: pretend nothing special happened, but store nothing.
      if (parsed.error.issues.some((i) => i.path[0] === "website")) return { ok: false, error: "A beküldés nem sikerült." };
      return { ok: false, error: parsed.error.issues[0]?.message ?? "Hibás adatok." };
    }
    const { website: _hp, ...lead } = parsed.data;
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const since = new Date(Date.now() - LEAD_RATE_WINDOW_MIN * 60_000).toISOString();
    const { count, error: countErr } = await supabaseAdmin
      .from("lead_requests")
      .select("id", { count: "exact", head: true })
      .eq("email", lead.email)
      .gte("created_at", since);
    if (countErr) {
      console.error("lead rate check failed", countErr);
      return { ok: false, error: "A szerver most nem érhető el. Próbáld újra később." };
    }
    if ((count ?? 0) >= LEAD_RATE_LIMIT) {
      return { ok: false, error: "Erről a címről már érkezett több kérés. Próbáld újra egy óra múlva." };
    }

    const { error } = await supabaseAdmin.from("lead_requests").insert({
      name: lead.name,
      email: lead.email,
      needs: lead.needs,
      business: lead.business,
      goal: lead.goal ?? null,
      existing: lead.existing ?? null,
      timeline: lead.timeline ?? null,
      budget: lead.budget ?? null,
      consent: true,
    });
    if (error) {
      console.error("lead insert failed", error);
      return { ok: false, error: "A mentés nem sikerült. Próbáld újra később." };
    }
    return { ok: true };
  });
