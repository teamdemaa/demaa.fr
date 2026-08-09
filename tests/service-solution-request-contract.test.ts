import { describe, expect, it } from "vitest";
import {
  parseSolutionReferralPayload,
} from "@/lib/service-solution-request-contract";

const base = {
  attribution: { version: 1 },
  company: "  Atelier Martin  ",
  email: " MAYA@ATELIER-MARTIN.FR ",
  firstName: "  Maya  ",
  idempotencyKey: "web:service:12345678",
  marketingConsent: false,
  need: "  Nous voulons mieux organiser les demandes.  ",
  systemSlug: "batiment",
};

describe("service and solution request contracts", () => {
  it("requires a system for an external solution referral", () => {
    expect(() => parseSolutionReferralPayload({
      ...base,
      resourceSlug: "partenaire-juridique",
      systemSlug: null,
    })).toThrow("request.systemSlug is required");
  });

  it("rejects telephone and any unknown field", () => {
    expect(() => parseSolutionReferralPayload({
      ...base,
      phone: "0612345678",
      resourceSlug: "partenaire-juridique",
    })).toThrow("unknown fields: phone");
  });

  it("accepts any valid contact email without an arbitrary provider denylist", () => {
    expect(parseSolutionReferralPayload({
      ...base,
      email: "maya@gmail.com",
      resourceSlug: "partenaire-juridique",
    }).email).toBe("maya@gmail.com");
  });

  it("rejects malformed slugs, idempotency keys and consent", () => {
    expect(() => parseSolutionReferralPayload({
      ...base,
      idempotencyKey: "short",
      resourceSlug: "partenaire-juridique",
    })).toThrow("idempotencyKey is invalid");
    expect(() => parseSolutionReferralPayload({
      ...base,
      marketingConsent: "yes",
      resourceSlug: "partenaire-juridique",
    })).toThrow("marketingConsent must be a boolean");
  });

  it("rejects oversized or unsafe attribution payloads", () => {
    expect(() => parseSolutionReferralPayload({
      ...base,
      attribution: { payload: "x".repeat(6100) },
      resourceSlug: "partenaire-juridique",
    })).toThrow();
    expect(() => parseSolutionReferralPayload({
      ...base,
      attribution: new Date(),
      resourceSlug: "partenaire-juridique",
    })).toThrow("JSON data only");
  });

  it("keeps marketing consent false when it is omitted", () => {
    const withoutConsent = Object.fromEntries(
      Object.entries(base).filter(([key]) => key !== "marketingConsent"),
    );
    expect(parseSolutionReferralPayload({
      ...withoutConsent,
      resourceSlug: "partenaire-juridique",
    }).marketingConsent).toBe(false);
  });
});
