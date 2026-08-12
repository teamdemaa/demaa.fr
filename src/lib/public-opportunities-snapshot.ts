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
  const referencedExpertiseIds = new Set(
    opportunities.flatMap((opportunity) =>
      opportunity.expertiseId ? [opportunity.expertiseId] : []
    ),
  );
  const expertises = expertiseSnapshot
    .map((entry, index) =>
      parseExpertiseCatalogEntry(entry, `expertiseSnapshot[${index}]`)
    )
    .filter((expertise) =>
      expertise.visibility === "public"
      && referencedExpertiseIds.has(expertise.expertiseId)
    )
    .sort((left, right) => left.rank - right.rank);

  return { expertises, opportunities };
}

/**
 * Instant, bundled first paint. Firebase remains authoritative and replaces
 * this payload in the background as soon as the public endpoint responds.
 */
export const publicOpportunitiesSnapshot = buildPublicOpportunitiesSnapshot();
