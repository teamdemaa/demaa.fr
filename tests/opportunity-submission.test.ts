import { describe, expect, it } from "vitest";
import { parseOpportunitySubmissionFields } from "@/lib/opportunity-submission";
import {
  preserveOpportunityEnrichment,
  publicOpportunitiesSnapshot,
} from "@/lib/public-opportunities-snapshot";
import type { PublicOpportunity } from "@/lib/opportunity-contract";

const opportunity: PublicOpportunity = {
  cadence: "3 mois",
  category: "Produit",
  companyName: null,
  compensation: "Budget à convenir",
  createdAt: "2026-08-08T00:00:00.000Z",
  expertiseId: null,
  expiresAt: null,
  expectations: ["Cadrer le besoin"],
  geography: "France",
  ingestionMode: null,
  opportunityId: "produit-test",
  opportunityType: "mission",
  publishedAt: "2026-08-08T00:00:00.000Z",
  sourceKind: null,
  sourceName: null,
  sourcePublishedAt: null,
  sourceRemovedAt: null,
  sourceUrl: null,
  startTiming: "Septembre",
  status: "open",
  summary: "Construire une première version testable avec un périmètre clairement défini.",
  title: "Construire une première version",
  verifiedAt: null,
  workMode: "remote",
};

describe("opportunity submission", () => {
  it("bundles the complete public expertise catalog for Team Demaa", () => {
    expect(publicOpportunitiesSnapshot.expertises).toHaveLength(23);
    expect(
      publicOpportunitiesSnapshot.expertises.every(
        (expertise) => expertise.visibility === "public",
      ),
    ).toBe(true);
  });

  it("normalizes the complete public draft without inventing optional data", () => {
    expect(parseOpportunitySubmissionFields({
      cadence: " 3 mois ",
      category: "Produit",
      compensation: "",
      expectations: "Cadrer le besoin\nTester la version",
      geography: "France",
      opportunityType: "mission",
      startTiming: "Septembre",
      summary: opportunity.summary,
      title: opportunity.title,
      workMode: "remote",
    })).toEqual(expect.objectContaining({
      cadence: "3 mois",
      compensation: null,
      expectations: ["Cadrer le besoin", "Tester la version"],
      geography: "France",
      startTiming: "Septembre",
      workMode: "remote",
    }));
  });

  it("rejects incomplete submissions", () => {
    expect(parseOpportunitySubmissionFields({ title: "Court" })).toBeNull();
  });

  it("does not let a less complete remote record erase bundled enrichment", () => {
    const [merged] = preserveOpportunityEnrichment([
      { ...opportunity, cadence: null, expectations: [], startTiming: null },
    ], [opportunity]);
    expect(merged.cadence).toBe("3 mois");
    expect(merged.expectations).toEqual(["Cadrer le besoin"]);
    expect(merged.startTiming).toBe("Septembre");
  });
});
