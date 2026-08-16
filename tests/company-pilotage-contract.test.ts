import { describe, expect, it } from "vitest";
import {
  EMPTY_COMPANY_STRATEGY_ANSWERS,
  companyMetricWriteSchema,
  companyStrategyAnswersSchema,
  enumerateCompanyMonths,
  getCompanyMetricResult,
  getCurrentCompanyMonth,
  mergeCompanyStrategyAnswers,
  summarizeCompanyMetrics,
  type CompanyMonth,
  type CompanyMonthlyMetric,
} from "@/lib/company-pilotage-contract";

function metric(period: CompanyMonth, revenue: number | null, expenses: number | null, cash: number | null): CompanyMonthlyMetric {
  return { period, revenueCents: revenue, expensesCents: expenses, cashBalanceCents: cash, currency: "EUR", revision: 1, createdAt: "2026-08-01T00:00:00.000Z", updatedAt: "2026-08-01T00:00:00.000Z" };
}

describe("company Pilotage contract", () => {
  it.each([
    ["2026-08", "2026-08", 1],
    ["2026-06", "2026-08", 3],
    ["2026-03", "2026-08", 6],
    ["2025-11", "2026-08", 10],
    ["2025-09", "2026-08", 12],
  ])("enumerates inclusive periods %s to %s", (from, to, count) => {
    expect(enumerateCompanyMonths(from as CompanyMonth, to as CompanyMonth)).toHaveLength(count);
  });

  it("bounds periods and validates monetary rules", () => {
    expect(() => enumerateCompanyMonths("2024-01", "2026-08")).toThrow("24 mois");
    expect(companyMetricWriteSchema.safeParse({ expectedRevision: 0, revenueCents: -1, expensesCents: 0, cashBalanceCents: -100 }).success).toBe(false);
    expect(companyMetricWriteSchema.safeParse({ expectedRevision: 0, revenueCents: 1, expensesCents: 0, cashBalanceCents: -100 }).success).toBe(true);
  });

  it("never sums cash and hides unreliable totals", () => {
    const periods = enumerateCompanyMonths("2026-06", "2026-08");
    const complete = [metric("2026-06", 1000, 300, 500), metric("2026-07", 2000, 600, 900), metric("2026-08", 3000, 700, -200)];
    expect(summarizeCompanyMetrics(periods, complete)).toEqual({ monthCount: 3, completedMonthCount: 3, revenueCents: 6000, expensesCents: 1600, resultCents: 4400, cashBalanceCents: -200 });
    expect(getCompanyMetricResult(complete[0]!)).toBe(700);
    expect(summarizeCompanyMetrics(periods, complete.slice(0, 2))).toMatchObject({ completedMonthCount: 2, revenueCents: null, expensesCents: null, resultCents: null, cashBalanceCents: 900 });
  });

  it("uses Europe/Paris at a UTC month boundary", () => {
    expect(getCurrentCompanyMonth(new Date("2026-07-31T22:30:00.000Z"))).toBe("2026-08");
  });

  it("requires exactly twelve bounded answers and merges only non-overlapping edits", () => {
    expect(companyStrategyAnswersSchema.safeParse(EMPTY_COMPANY_STRATEGY_ANSWERS).success).toBe(true);
    expect(companyStrategyAnswersSchema.safeParse({ ...EMPTY_COMPANY_STRATEGY_ANSWERS, extra: "non" }).success).toBe(false);
    expect(companyStrategyAnswersSchema.safeParse({ ...EMPTY_COMPANY_STRATEGY_ANSWERS, alignment_1: "x".repeat(501) }).success).toBe(false);
    const base = { ...EMPTY_COMPANY_STRATEGY_ANSWERS };
    const local = { ...base, alignment_1: "Local", offer_1: "Offre locale" };
    const remote = { ...base, alignment_1: "Distant", positioning_1: "Client distant" };
    expect(mergeCompanyStrategyAnswers({ base, local, remote })).toEqual({
      merged: { ...remote, alignment_1: "Local", offer_1: "Offre locale" },
      conflicts: ["alignment_1"],
    });
  });
});
