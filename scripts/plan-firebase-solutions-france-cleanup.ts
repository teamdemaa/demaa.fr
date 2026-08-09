import snapshot from "@/lib/firebase-solution-registry.snapshot.generated.json";
import {
  buildFirestoreSolutionRegistryImportPlan,
  buildFirestoreSolutionRegistryRollbackPointer,
} from "@/lib/firebase-solution-registry-firestore-plan";
import {
  buildFranceSolutionsCleanupRevision,
  buildPublishedFranceSolutionsCleanupRevision,
  FRANCE_SOLUTIONS_OFFICIAL_DESTINATIONS,
  FRANCE_SOLUTIONS_REMOVED_RESOURCES,
} from "@/lib/firebase-solution-registry-france-cleanup.server";
import { parseFirebaseSolutionRegistryRevision } from "@/lib/firebase-solution-registry-contract";

if (process.argv.includes("--apply") || process.argv.includes("--write")) {
  throw new Error(
    "This command is dry-run only. It never writes to Firebase or the generated fallback.",
  );
}

const activeRevision = parseFirebaseSolutionRegistryRevision(snapshot);
const published = process.argv.includes("--published");
const candidate = published
  ? buildPublishedFranceSolutionsCleanupRevision()
  : buildFranceSolutionsCleanupRevision();
const plan = buildFirestoreSolutionRegistryImportPlan(candidate);
const rollback = buildFirestoreSolutionRegistryRollbackPointer(activeRevision);

console.log(JSON.stringify({
  mode: published ? "published-dry-run" : "draft-dry-run",
  remoteWritesExecuted: 0,
  activeRevision: {
    revisionId: activeRevision.revisionId,
    sourceFingerprint: activeRevision.sourceFingerprint,
    resources: activeRevision.resources.length,
    placements: activeRevision.placements.length,
  },
  candidate: {
    revisionId: candidate.revisionId,
    revisionStatus: candidate.revisionStatus,
    sourceFingerprint: candidate.sourceFingerprint,
    resources: candidate.resources.length,
    placements: candidate.placements.length,
    correctedOfficialDestinations: FRANCE_SOLUTIONS_OFFICIAL_DESTINATIONS,
    removedResources: FRANCE_SOLUTIONS_REMOVED_RESOURCES,
  },
  firestorePlan: {
    writes: plan.writes.length,
    writeBatches: plan.writeBatches.map((batch) => batch.length),
    activation: plan.activation,
    planFingerprint: plan.planFingerprint,
  },
  rollback,
}, null, 2));
