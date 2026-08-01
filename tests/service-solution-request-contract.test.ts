import { describe, expect, it } from "vitest";
import {
  parseServiceRequestPayload,
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
  it("normalizes the four visible service fields and bounded hidden fields", () => {
    expect(parseServiceRequestPayload({
      ...base,
      serviceSlug: "site-vitrine-prise-contact",
    })).toEqual(expect.objectContaining({
      company: "Atelier Martin",
      email: "maya@atelier-martin.fr",
      firstName: "Maya",
      marketingConsent: false,
      need: "Nous voulons mieux organiser les demandes.",
      serviceSlug: "site-vitrine-prise-contact",
      systemSlug: "batiment",
    }));
  });

  it("requires a system for an external solution referral", () => {
    expect(() => parseSolutionReferralPayload({
      ...base,
      resourceSlug: "partenaire-juridique",
      systemSlug: null,
    })).toThrow("request.systemSlug is required");
  });

  it("rejects telephone and any unknown field", () => {
    expect(() => parseServiceRequestPayload({
      ...base,
      phone: "0612345678",
      serviceSlug: "site-vitrine-prise-contact",
    })).toThrow("unknown fields: phone");
  });

  it("rejects personal email domains for the professional-email contract", () => {
    expect(() => parseServiceRequestPayload({
      ...base,
      email: "maya@gmail.com",
      serviceSlug: "site-vitrine-prise-contact",
    })).toThrow("professional email");
  });

  it("rejects malformed slugs, idempotency keys and consent", () => {
    expect(() => parseServiceRequestPayload({
      ...base,
      serviceSlug: "Site vitrine",
    })).toThrow("lowercase slug");
    expect(() => parseServiceRequestPayload({
      ...base,
      idempotencyKey: "short",
      serviceSlug: "site-vitrine-prise-contact",
    })).toThrow("idempotencyKey is invalid");
    expect(() => parseServiceRequestPayload({
      ...base,
      marketingConsent: "yes",
      serviceSlug: "site-vitrine-prise-contact",
    })).toThrow("marketingConsent must be a boolean");
  });

  it("rejects oversized or unsafe attribution payloads", () => {
    expect(() => parseServiceRequestPayload({
      ...base,
      attribution: { payload: "x".repeat(6100) },
      serviceSlug: "site-vitrine-prise-contact",
    })).toThrow();
    expect(() => parseServiceRequestPayload({
      ...base,
      attribution: new Date(),
      serviceSlug: "site-vitrine-prise-contact",
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
