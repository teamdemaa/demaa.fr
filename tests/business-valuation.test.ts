import { describe, expect, it } from "vitest";
import { calculateBusinessValuation, normalizeBusinessValuationInput, type BusinessValuationInput } from "@/lib/business-valuation";

const qualityDefaults = {
  recurrence: "moderate",
  concentration: "moderate",
  autonomy: "moderate",
  dependence: "moderate",
} as const;

describe("business valuation", () => {
  it("cross-checks a cabinet valuation with EBE and revenue", () => {
    const result = calculateBusinessValuation({
      activityId: "cabinet-comptable",
      revenue: 1_000_000,
      ebe: 300_000,
      ...qualityDefaults,
    });

    expect(result.central).toBe(850_000);
    expect(result.low).toBe(725_000);
    expect(result.high).toBe(975_000);
    expect(result.methodLabel).toContain("chiffre d’affaires");
  });

  it("raises the range for a recurring autonomous service business", () => {
    const baseline = calculateBusinessValuation({ activityId: "btp-maintenance", ebe: 200_000, ...qualityDefaults });
    const stronger = calculateBusinessValuation({
      activityId: "btp-maintenance",
      ebe: 200_000,
      recurrence: "very_high",
      concentration: "low",
      autonomy: "very_high",
      dependence: "low",
    });

    expect(stronger.central).toBeGreaterThan(baseline.central);
  });

  it("uses ARR and software metrics for a SaaS business", () => {
    const result = calculateBusinessValuation({
      activityId: "saas-b2b",
      arr: 500_000,
      growth: 35,
      churn: 4,
      grossMargin: 82,
      ...qualityDefaults,
    });

    expect(result.central).toBeGreaterThan(1_250_000);
    expect(result.factors).toContain("Croissance annuelle supérieure ou égale à 30 %");
  });

  it("rejects incomplete or unknown public input", () => {
    expect(normalizeBusinessValuationInput({ activityId: "unknown" })).toBeNull();
    expect(() => calculateBusinessValuation({ activityId: "saas-b2b", ...qualityDefaults } as BusinessValuationInput)).toThrow("revenu annuel récurrent");
  });
});
