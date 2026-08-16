import type {
  CompanyMonth,
  CompanyMonthlyMetric,
} from "@/lib/company-pilotage-contract";

export type CompanyMetricEntryDraft = Readonly<{
  period: CompanyMonth;
  revenue: string;
  expenses: string;
  cash: string;
  expectedRevision: number;
}>;

export function companyMetricCentsToInput(value: number | null | undefined) {
  return value == null ? "" : (value / 100).toFixed(2).replace(".", ",");
}

export function getCompanyMetricEntryDraft(
  period: CompanyMonth,
  metricsByPeriod: ReadonlyMap<CompanyMonth, CompanyMonthlyMetric>,
): CompanyMetricEntryDraft {
  const matchingMetric = metricsByPeriod.get(period);
  return {
    period,
    revenue: companyMetricCentsToInput(matchingMetric?.revenueCents),
    expenses: companyMetricCentsToInput(matchingMetric?.expensesCents),
    cash: companyMetricCentsToInput(matchingMetric?.cashBalanceCents),
    expectedRevision: matchingMetric?.revision ?? 0,
  };
}
