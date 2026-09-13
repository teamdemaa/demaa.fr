import type {
  RepriseOpportunity,
  RepriseOpportunityCategory,
  RepriseOpportunityRegion,
} from "@/lib/reprise-opportunities";
import {
  repriseOpportunityCategories,
  repriseOpportunityRegions,
} from "@/lib/reprise-opportunities";

export type RepriseAlertCriteria = Readonly<{
  budgetMax: number | null;
  categories: readonly RepriseOpportunityCategory[];
  includeMissing: boolean;
  query: string;
  regions: readonly RepriseOpportunityRegion[];
  revenueMin: number | null;
}>;

export const emptyRepriseAlertCriteria: RepriseAlertCriteria = {
  budgetMax: null,
  categories: [],
  includeMissing: true,
  query: "",
  regions: [],
  revenueMin: null,
};

function optionalAmount(value: unknown) {
  if (value === null || value === undefined || value === "") return null;
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) && parsed >= 0 && parsed <= 1_000_000_000
    ? Math.round(parsed)
    : undefined;
}

export function parseRepriseAlertCriteria(value: unknown): RepriseAlertCriteria | null {
  if (!value || typeof value !== "object") return null;
  const input = value as Record<string, unknown>;
  const query = typeof input.query === "string" ? input.query.trim().slice(0, 120) : "";
  const categories = Array.isArray(input.categories) ? input.categories : [];
  const regions = Array.isArray(input.regions) ? input.regions : [];
  const budgetMax = optionalAmount(input.budgetMax);
  const revenueMin = optionalAmount(input.revenueMin);
  if (
    budgetMax === undefined
    || revenueMin === undefined
    || categories.length > repriseOpportunityCategories.length
    || regions.length > repriseOpportunityRegions.length
    || !categories.every((category) => repriseOpportunityCategories.includes(category as RepriseOpportunityCategory))
    || !regions.every((region) => repriseOpportunityRegions.includes(region as RepriseOpportunityRegion))
  ) return null;

  return {
    budgetMax,
    categories: [...new Set(categories)] as RepriseOpportunityCategory[],
    includeMissing: input.includeMissing !== false,
    query,
    regions: [...new Set(regions)] as RepriseOpportunityRegion[],
    revenueMin,
  };
}

function normalizeForSearch(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("fr")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

export function matchesRepriseAlert(
  opportunity: RepriseOpportunity,
  criteria: RepriseAlertCriteria,
) {
  if (criteria.categories.length > 0 && !criteria.categories.includes(opportunity.category)) {
    return false;
  }
  if (criteria.regions.length > 0 && !criteria.regions.includes(opportunity.region)) {
    return false;
  }

  const queryTokens = normalizeForSearch(criteria.query).split(" ").filter(Boolean);
  if (queryTokens.length > 0) {
    const haystack = normalizeForSearch([
      opportunity.activity,
      opportunity.category,
      opportunity.location,
      opportunity.region,
      ...opportunity.highlights,
    ].join(" "));
    if (!queryTokens.every((token) => haystack.includes(token))) return false;
  }

  if (criteria.budgetMax !== null) {
    if (opportunity.askingPriceMin === undefined) return criteria.includeMissing;
    if (opportunity.askingPriceMin > criteria.budgetMax) return false;
  }
  if (criteria.revenueMin !== null) {
    if (opportunity.revenueMax === undefined && opportunity.revenueMin === undefined) {
      return criteria.includeMissing;
    }
    const maximumKnownRevenue = opportunity.revenueMax ?? opportunity.revenueMin ?? 0;
    if (maximumKnownRevenue < criteria.revenueMin) return false;
  }

  return true;
}

export function getRepriseAlertMatches(
  opportunities: readonly RepriseOpportunity[],
  criteria: RepriseAlertCriteria,
) {
  return opportunities.filter((opportunity) => matchesRepriseAlert(opportunity, criteria));
}
