import { writeFile } from "node:fs/promises";
import { resolve } from "node:path";

import { buildFirestoreSolutionRegistryImportPlan } from "@/lib/firebase-solution-registry-firestore-plan";
import { buildPublishedProfessionalSuppliersRevision } from "@/lib/firebase-solution-registry-professional-suppliers.server";

const candidate = buildPublishedProfessionalSuppliersRevision();
const plan = buildFirestoreSolutionRegistryImportPlan(candidate);

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
  supplierPlacements: candidate.placements.filter(
    ({ placement }) =>
      ["cabinet-comptable", "cabinet-de-conseil"].includes(placement.systemSlug) &&
      placement.section === "providers",
  ).map(({ placement }) => ({
    systemSlug: placement.systemSlug,
    resourceSlug: placement.resourceSlug,
    rank: placement.rank,
  })),
  sourceFingerprint: candidate.sourceFingerprint,
  planFingerprint: plan.planFingerprint,
  writes: plan.writes.length,
}, null, 2));
