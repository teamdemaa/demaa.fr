import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("client-only", () => ({}));

import SolutionReferralForm, {
  buildSolutionReferralPayload,
  submitSolutionReferral,
  validateSolutionReferralFields,
} from "@/components/SolutionReferralForm";

const fields = {
  firstName: " Maya ",
  email: " MAYA@CABINET-MARTIN.FR ",
  company: " Cabinet Martin ",
  need: " Déléguer les formalités de création. ",
};

describe("solution referral form", () => {
  it("renders exactly four simple fields without phone or newsletter", () => {
    const markup = renderToStaticMarkup(createElement(SolutionReferralForm, {
      resourceName: "JuridiConsulting",
      resourceSlug: "juridi-consulting",
      systemSlug: "cabinet-comptable",
    }));

    expect(markup.match(/<(?:input|textarea)\b/g)).toHaveLength(4);
    expect(markup).toContain("Prénom");
    expect(markup).toContain("E-mail professionnel");
    expect(markup).toContain("Cabinet ou entreprise");
    expect(markup).toContain("Votre besoin");
    expect(markup).not.toMatch(/Téléphone|newsletter|volume|marque blanche/i);
  });

  it("builds only the server contract fields", () => {
    expect(validateSolutionReferralFields(fields)).toEqual({});
    expect(buildSolutionReferralPayload(fields, {
      idempotencyKey: "web:solution:12345678",
      resourceSlug: "juridi-consulting",
      systemSlug: "cabinet-comptable",
    })).toEqual({
      company: "Cabinet Martin",
      email: "maya@cabinet-martin.fr",
      firstName: "Maya",
      idempotencyKey: "web:solution:12345678",
      marketingConsent: false,
      need: "Déléguer les formalités de création.",
      resourceSlug: "juridi-consulting",
      systemSlug: "cabinet-comptable",
    });
  });

  it("accepts only the strict 202 JSON response", async () => {
    const payload = buildSolutionReferralPayload(fields, {
      idempotencyKey: "web:solution:12345678",
      resourceSlug: "juridi-consulting",
      systemSlug: "cabinet-comptable",
    });
    await expect(submitSolutionReferral(
      payload,
      async () => Response.json({ ok: true }, { status: 202 }),
    )).resolves.toBeUndefined();
    await expect(submitSolutionReferral(
      payload,
      async () => Response.json({ ok: true, extra: true }, { status: 202 }),
    )).rejects.toThrow("solution referral failed");
  });
});
