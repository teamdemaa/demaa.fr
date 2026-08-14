import expertiseSnapshot from "@/lib/expertise-catalog.snapshot.generated.json";
import {
  parseExpertiseCatalogEntry,
  type ExpertiseCatalogEntry,
} from "@/lib/expertise-catalog-contract";
import opportunitySnapshot from "@/lib/opportunities.snapshot.generated.json";
import {
  isPublicOpenOpportunity,
  parseOpportunity,
  type PublicOpportunity,
} from "@/lib/opportunity-contract";

export type PublicOpportunitiesPayload = Readonly<{
  expertises: readonly ExpertiseCatalogEntry[];
  opportunities: readonly PublicOpportunity[];
}>;

function buildPublicOpportunitiesSnapshot(): PublicOpportunitiesPayload {
  const opportunities = opportunitySnapshot
    .map((entry, index) => parseOpportunity(entry, `opportunitySnapshot[${index}]`))
    .filter((opportunity) => isPublicOpenOpportunity(opportunity))
    .sort((left, right) =>
      Date.parse(right.publishedAt ?? "") - Date.parse(left.publishedAt ?? "")
    );
  const expertises = expertiseSnapshot
    .map((entry, index) =>
      parseExpertiseCatalogEntry(entry, `expertiseSnapshot[${index}]`)
    )
    .filter((expertise) => expertise.visibility === "public")
    .sort((left, right) => left.rank - right.rank);

  return { expertises, opportunities };
}

/**
 * Instant, bundled first paint. Firebase remains authoritative and replaces
 * this payload in the background as soon as the public endpoint responds.
 */
export const publicOpportunitiesSnapshot = buildPublicOpportunitiesSnapshot();

export function preserveOpportunityEnrichment(
  remote: readonly PublicOpportunity[],
  bundled: readonly PublicOpportunity[] = publicOpportunitiesSnapshot.opportunities,
) {
  const bundledById = new Map(
    bundled.map((opportunity) => [opportunity.opportunityId, opportunity]),
  );
  return remote.map((opportunity) => {
    const fallback = bundledById.get(opportunity.opportunityId);
    if (!fallback) return opportunity;
    return {
      ...opportunity,
      cadence: opportunity.cadence ?? fallback.cadence,
      companyName: opportunity.companyName ?? fallback.companyName,
      compensation: opportunity.compensation ?? fallback.compensation,
      expectations: opportunity.expectations.length > 0
        ? opportunity.expectations
        : fallback.expectations,
      geography: opportunity.geography ?? fallback.geography,
      startTiming: opportunity.startTiming ?? fallback.startTiming,
      workMode: opportunity.workMode ?? fallback.workMode,
    };
  });
}
