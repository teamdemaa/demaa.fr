import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const mocks = vi.hoisted(() => ({ send: vi.fn() }));

vi.mock("@/lib/transactional-email.server", () => ({ sendTransactionalEmail: mocks.send }));

import {
  sendRepriseAlertConfirmation,
  sendRepriseOpportunityMatch,
} from "@/lib/reprise-alert-emails.server";
import { repriseOpportunities } from "@/lib/reprise-opportunities";

const criteria = {
  budgetMax: 500_000,
  categories: ["Services terrain"],
  includeMissing: true,
  query: "maintenance",
  regions: ["Provence-Alpes-Côte d’Azur"],
  revenueMin: 300_000,
} as const;

describe("reprise alert emails", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.send.mockResolvedValue(undefined);
  });

  it("includes direct opportunity links in the confirmation email", async () => {
    const opportunity = repriseOpportunities[0];
    await sendRepriseAlertConfirmation({
      accessToken: "secure-token",
      alertId: "alert-1",
      baseUrl: "https://sini.example",
      criteria,
      currentMatches: [opportunity],
      email: "alex@example.com",
    });

    const email = mocks.send.mock.calls[0][0];
    const opportunityUrl = `https://sini.example/a-reprendre/${opportunity.id}`;
    expect(email.subject).toContain("1 correspondance");
    expect(email.html).toContain(`href="${opportunityUrl}"`);
    expect(email.html).toContain("Voir la fiche de l’entreprise");
    expect(email.text).toContain(`Voir la fiche : ${opportunityUrl}`);
    expect(email.html).toContain("Gérer mon alerte");
    expect(email.html).toContain("sini · Alerte de reprise");
    expect(email.html).not.toContain("Demaa");
    expect(email.text).toContain("https://sini.example");
    expect(email.text).not.toContain("demaa.fr");
  });

  it("includes a prominent button and a visible fallback URL in each match email", async () => {
    const opportunity = repriseOpportunities[0];
    await sendRepriseOpportunityMatch({
      accessToken: "secure-token",
      alertId: "alert-1",
      baseUrl: "https://sini.example",
      email: "alex@example.com",
      opportunity,
    });

    const email = mocks.send.mock.calls[0][0];
    const opportunityUrl = `https://sini.example/a-reprendre/${opportunity.id}`;
    expect(email.subject).toBe(`Nouvelle entreprise à reprendre · ${opportunity.activity}`);
    expect(email.html).toContain(`href="${opportunityUrl}"`);
    expect(email.html).toContain(`>${opportunityUrl}</a>`);
    expect(email.html).toContain("Voir la fiche de l’entreprise");
    expect(email.text).toContain(`Voir la fiche de l’entreprise : ${opportunityUrl}`);
    expect(email.text).toContain("Modifier mon alerte");
    expect(email.text).toContain("Supprimer mon alerte");
    expect(email.html).toContain("sini · Alerte de reprise");
  });
});
