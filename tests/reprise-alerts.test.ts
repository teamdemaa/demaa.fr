import { describe, expect, it } from "vitest";
import {
  getRepriseAlertMatches,
  matchesRepriseAlert,
  parseRepriseAlertCriteria,
} from "@/lib/reprise-alerts";
import { repriseOpportunities, repriseOpportunityRegions } from "@/lib/reprise-opportunities";

describe("alertes de reprise", () => {
  it("provides normalized publication and financial data for every opportunity", () => {
    expect(repriseOpportunities).toHaveLength(26);
    for (const opportunity of repriseOpportunities) {
      expect(repriseOpportunityRegions).toContain(opportunity.region);
      expect(Number.isFinite(Date.parse(opportunity.publishedAt))).toBe(true);
      if (opportunity.revenue) expect(opportunity.revenueMin ?? opportunity.revenueMax).toBeTypeOf("number");
      if (opportunity.askingPrice) expect(opportunity.askingPriceMin ?? opportunity.askingPriceMax).toBeTypeOf("number");
    }
  });

  it("matches deterministic category, region, keyword and amount criteria", () => {
    const criteria = parseRepriseAlertCriteria({
      budgetMax: 200_000,
      categories: ["Services terrain"],
      includeMissing: false,
      query: "rénovation sols",
      regions: ["Provence-Alpes-Côte d’Azur"],
      revenueMin: 1_000_000,
    });
    expect(criteria).not.toBeNull();
    const matches = getRepriseAlertMatches(repriseOpportunities, criteria!);
    expect(matches.map((opportunity) => opportunity.id)).toEqual(["sols-murs-alpes-maritimes"]);
  });

  it("includes missing numeric data only when requested", () => {
    const opportunity = repriseOpportunities.find((item) => item.id === "logiciels-crm-sage-ebp")!;
    const strict = parseRepriseAlertCriteria({ budgetMax: 500_000, categories: [], includeMissing: false, query: "", regions: [], revenueMin: null })!;
    expect(matchesRepriseAlert(opportunity, strict)).toBe(false);
    expect(matchesRepriseAlert(opportunity, { ...strict, includeMissing: true })).toBe(true);
  });

  it("rejects unknown regions and invalid amounts", () => {
    expect(parseRepriseAlertCriteria({ categories: [], regions: ["Atlantide"] })).toBeNull();
    expect(parseRepriseAlertCriteria({ budgetMax: -1, categories: [], regions: [] })).toBeNull();
  });
});
