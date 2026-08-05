import snapshot from "@/lib/firebase-solution-registry.snapshot.generated.json";
import { parseFirebaseSolutionRegistryRevision } from "@/lib/firebase-solution-registry-contract";
import { buildFirestoreSolutionRegistryImportPlan } from "@/lib/firebase-solution-registry-firestore-plan";

if (process.argv.includes("--apply")) {
  throw new Error(
    "This command is dry-run only. Firebase writes require a separate reviewed Preview gate.",
  );
}

const plan = buildFirestoreSolutionRegistryImportPlan(
  parseFirebaseSolutionRegistryRevision(snapshot),
);

console.log(JSON.stringify({
  mode: "dry-run",
  revisionId: plan.revisionId,
  revisionStatus: plan.revisionStatus,
  writes: plan.writes.length,
  batches: plan.writeBatches.map((batch) => batch.length),
  activationPlanned: Boolean(plan.activation),
  planFingerprint: plan.planFingerprint,
}, null, 2));
