import { writeFile } from "node:fs/promises";
import { resolve } from "node:path";

import { buildPublishedCatalogEnrichmentRevision } from "@/lib/firebase-solution-registry-catalog-enrichment.server";
import { buildFirestoreSolutionRegistryImportPlan } from "@/lib/firebase-solution-registry-firestore-plan";

const candidate = buildPublishedCatalogEnrichmentRevision();
const plan = buildFirestoreSolutionRegistryImportPlan(candidate);
const restaurant = candidate.placements.filter(
  ({ placement }) => placement.systemSlug === "restaurant",
);

if (process.argv.includes("--write")) {
  await writeFile(
    resolve(
      process.cwd(),
      "src/lib/firebase-solution-registry.catalog-enrichment.snapshot.generated.json",
    ),
    `${JSON.stringify(candidate, null, 2)}\n`,
    "utf8",
  );
}

console.log(JSON.stringify({
  mode: process.argv.includes("--write") ? "generated-fallback-written" : "dry-run",
  revisionId: candidate.revisionId,
  revisionStatus: candidate.revisionStatus,
  resources: candidate.resources.length,
  placements: candidate.placements.length,
  restaurant: Object.fromEntries(
    [...new Set(restaurant.map(({ placement }) => placement.section))].map((section) => [
      section,
      restaurant
        .filter(({ placement }) => placement.section === section)
        .map(({ placement }) => placement.resourceSlug),
    ]),
  ),
  sourceFingerprint: candidate.sourceFingerprint,
  planFingerprint: plan.planFingerprint,
  writes: plan.writes.length,
}, null, 2));
