import { describe, expect, it } from "vitest";
import type { CompanyMonthlyMetric } from "@/lib/company-pilotage-contract";
import { getCompanyMetricEntryDraft } from "@/lib/company-metric-entry";

const august: CompanyMonthlyMetric = {
  period: "2026-08",
  revenueCents: 125050,
  expensesCents: 5049,
  cashBalanceCents: -990,
  currency: "EUR",
  revision: 4,
  createdAt: "2026-08-01T10:00:00.000Z",
  updatedAt: "2026-08-16T10:00:00.000Z",
};

describe("company metric entry month changes", () => {
  const metricsByPeriod = new Map([[august.period, august]]);

  it("loads all values and the revision of an existing selected month", () => {
    expect(getCompanyMetricEntryDraft("2026-08", metricsByPeriod)).toEqual({
      period: "2026-08",
      revenue: "1250,50",
      expenses: "50,49",
      cash: "-9,90",
      expectedRevision: 4,
    });
  });

  it("clears copied values and resets the revision for an absent selected month", () => {
    expect(getCompanyMetricEntryDraft("2026-09", metricsByPeriod)).toEqual({
      period: "2026-09",
      revenue: "",
      expenses: "",
      cash: "",
      expectedRevision: 0,
    });
  });
});
