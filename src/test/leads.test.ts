import { describe, expect, it } from "vitest";
import { leadSchema } from "@/lib/leads";

const base = { name: "Teszt Elek", email: "teszt@example.com", consent: true as const };

describe("lead validation", () => {
  it("accepts a minimal valid lead", () => {
    expect(leadSchema.safeParse(base).success).toBe(true);
  });
  it("rejects a lead without consent", () => {
    expect(leadSchema.safeParse({ ...base, consent: false }).success).toBe(false);
  });
  it("rejects when the honeypot is filled", () => {
    expect(leadSchema.safeParse({ ...base, website: "spam.com" }).success).toBe(false);
  });
  it("rejects an invalid email", () => {
    expect(leadSchema.safeParse({ ...base, email: "nem-email" }).success).toBe(false);
  });
  it("rejects business text over 1000 characters", () => {
    expect(leadSchema.safeParse({ ...base, business: "x".repeat(1001) }).success).toBe(false);
  });
});
