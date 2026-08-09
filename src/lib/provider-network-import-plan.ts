import { createHash } from "node:crypto";
import expertiseSnapshot from "@/lib/expertise-catalog.snapshot.generated.json";
import opportunitySnapshot from "@/lib/opportunities.snapshot.generated.json";
import {
  assertNoRetiredUniversalExpertisePlacements,
  buildExpertisePlacementSeeds,
} from "@/lib/expertise-placement-seeds";
import { parseExpertiseCatalogEntry } from "@/lib/expertise-catalog-contract";
import { parseOpportunity } from "@/lib/opportunity-contract";

export function buildProviderNetworkImportPlan() {
  const expertises = expertiseSnapshot.map((entry, index) =>
    parseExpertiseCatalogEntry(entry, `expertise[${index}]`)
  );
  const opportunities = opportunitySnapshot.map((entry, index) =>
    parseOpportunity(entry, `opportunity[${index}]`)
  );
  const expertisePlacements = buildExpertisePlacementSeeds();
  assertNoRetiredUniversalExpertisePlacements(expertisePlacements);
  const writes = [
    ...expertises.map((data) => ({
      path: `expertise_catalog/${data.expertiseId}`,
      data,
    })),
    ...opportunities.map((data) => ({
      path: `opportunities/${data.opportunityId}`,
      data,
    })),
    ...expertisePlacements.map((data) => ({
      path: `expertise_placements/${data.expertisePlacementId}`,
      data,
    })),
  ];
  const planFingerprint = createHash("sha256")
    .update(JSON.stringify(writes))
    .digest("hex");

  return {
    expertises,
    expertisePlacements,
    opportunities,
    planFingerprint,
    writes,
  };
}
