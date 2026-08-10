import { writeFile } from "node:fs/promises";
import { resolve } from "node:path";

import { buildFirestoreSolutionRegistryImportPlan } from "@/lib/firebase-solution-registry-firestore-plan";
import { buildPublishedSupplierExpansionRevision } from "@/lib/firebase-solution-registry-supplier-expansion.server";

const candidate = buildPublishedSupplierExpansionRevision();
const plan = buildFirestoreSolutionRegistryImportPlan(candidate);
const supplierPlacements = candidate.placements.filter(
  ({ placement }) => placement.placementVersion === "supplier-expansion.v1",
);

if (process.argv.includes("--write")) {
  await writeFile(
    resolve(process.cwd(), "src/lib/firebase-solution-registry.snapshot.generated.json"),
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
  supplierSystems: [...new Set(
    supplierPlacements.map(({ placement }) => placement.systemSlug),
  )],
  supplierPlacements: supplierPlacements.map(({ placement }) => ({
    systemSlug: placement.systemSlug,
    resourceSlug: placement.resourceSlug,
    rank: placement.rank,
  })),
  sourceFingerprint: candidate.sourceFingerprint,
  planFingerprint: plan.planFingerprint,
  writes: plan.writes.length,
}, null, 2));
