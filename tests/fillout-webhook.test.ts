import { describe, expect, it } from "vitest";
import { isValidFilloutWebhookAuthorization } from "../src/lib/fillout-webhook-auth";
import { parseFilloutWebhookSubmission } from "../src/lib/fillout-webhook";

describe("Fillout webhook", () => {
  it("requires the exact bearer secret", () => {
    expect(isValidFilloutWebhookAuthorization("Bearer test-secret", "test-secret")).toBe(true);
    expect(isValidFilloutWebhookAuthorization("Bearer wrong", "test-secret")).toBe(false);
    expect(isValidFilloutWebhookAuthorization(null, "test-secret")).toBe(false);
  });

  it("extracts only contact and attribution data from a submission", () => {
    const submission = parseFilloutWebhookSubmission({
      formId: "sWP6PSPRVLus",
      submissionId: "sub_12345678",
      submissionTime: "2026-07-20T20:00:00.000Z",
      questions: [
        { id: "q1", name: "Prénom", type: "ShortAnswer", value: "Nina" },
        { id: "q2", name: "Nom de famille", type: "ShortAnswer", value: "Martin" },
        { id: "q3", name: "E-mail", type: "EmailInput", value: "NINA@EXAMPLE.COM" },
        { id: "q4", name: "Téléphone", type: "PhoneNumber", value: "+33 6 00 00 00 00" },
        { id: "q5", name: "Besoin détaillé", type: "LongAnswer", value: "Donnée non conservée" },
      ],
      scheduling: [
        { id: "schedule", name: "Rendez-vous", value: { timezone: "Europe/Paris" } },
      ],
      urlParameters: [
        { id: "p1", name: "systemSlug", value: "freelance" },
        { id: "p2", name: "source", value: "Kit opérationnel — Services" },
        { id: "p3", name: "dem_first_source", value: "linkedin" },
        { id: "p4", name: "dem_first_medium", value: "paid_social" },
        { id: "p5", name: "dem_first_campaign", value: "audit-2026" },
        { id: "p6", name: "dem_first_landing", value: "/kit-operationnel/freelance" },
        { id: "p7", name: "dem_last_source", value: "google" },
        { id: "p8", name: "dem_last_medium", value: "organic" },
        { id: "p9", name: "dem_last_landing", value: "/annuaire-services/organisation" },
        { id: "p10", name: "dem_conversion_page", value: "/annuaire-services/organisation" },
        { id: "p11", name: "dem_analytics_allowed", value: "true" },
        { id: "p12", name: "dem_marketing_allowed", value: "false" },
        { id: "p13", name: "dem_analytics_consent", value: "accepted" },
      ],
    });

    expect(submission).not.toBeNull();
    expect(submission?.contact).toEqual({
      email: "nina@example.com",
      firstName: "Nina",
      lastName: "Martin",
      phone: "+33 6 00 00 00 00",
    });
    expect(submission?.systemSlug).toBe("freelance");
    expect(submission?.sourceUrl).toBe("https://demaa.fr/annuaire-services/organisation");
    expect(submission?.attribution.first_source).toMatchObject({
      campaign: "audit-2026",
      medium: "paid_social",
      source: "linkedin",
    });
    expect(submission?.attribution.last_source).toMatchObject({
      medium: "organic",
      source: "google",
    });
    expect(submission?.attribution.consent).toEqual({
      analytics: true,
      marketing: false,
      status: "accepted",
    });
  });

  it("rejects malformed submission identifiers", () => {
    expect(parseFilloutWebhookSubmission({ submissionId: "bad" })).toBeNull();
  });
});
