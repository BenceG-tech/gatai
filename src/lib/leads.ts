import { z } from "zod";

const opt = z.string().trim().max(100).optional().nullable();

/** Shared validation for lead requests — used by the server function and tests. */
export const leadSchema = z.object({
  name: z.string().trim().min(1, "Add meg a neved.").max(100),
  email: z.string().trim().toLowerCase().email("Érvényes email címet adj meg.").max(255),
  needs: z.array(z.string().trim().min(1).max(60)).max(8).default([]),
  business: z.string().trim().max(1000).default(""),
  goal: opt,
  existing: opt,
  timeline: opt,
  budget: opt,
  consent: z.literal(true, { errorMap: () => ({ message: "Az adatkezelés elfogadása szükséges." }) }),
  // Honeypot: real visitors never see or fill this field.
  website: z.string().max(0).optional().default(""),
});

export type LeadInput = z.input<typeof leadSchema>;

/** Max submissions per email address within the rate window. */
export const LEAD_RATE_LIMIT = 3;
export const LEAD_RATE_WINDOW_MIN = 60;
