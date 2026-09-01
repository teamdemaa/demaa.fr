import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

import { getAdminFirestore } from "@/lib/firebase-admin";
import { FIREBASE_SOLUTION_REGISTRY_ACTIVE_POINTER } from "@/lib/firebase-solution-registry-contract";
import {
  fetchActiveFirebaseSolutionRegistryRevisionFromFirestore,
  fetchFirebaseSolutionRegistryRevisionByIdFromFirestore,
} from "@/lib/firebase-solution-registry.server";

function argument(prefix: string) {
  return process.argv.find((entry) => entry.startsWith(prefix))?.slice(prefix.length);
}

if (!process.argv.includes("--rollback")) {
  throw new Error("Firebase rollback requires --rollback.");
}
const artifact = JSON.parse(await readFile(fileURLToPath(new URL(
  "../docs/research/d091-tools/firebase-only-comparison-candidate.generated.json",
  import.meta.url,
)), "utf8"));
const current = {
  revisionId: artifact.candidateRevision.revisionId as string,
  sourceFingerprint: artifact.candidateRevision.sourceFingerprint as string,
};
const confirmedTargetRevision = argument("--confirm-target-revision=");
const confirmedTargetFingerprint = argument("--confirm-target-fingerprint=");
if (!confirmedTargetRevision || !confirmedTargetFingerprint) {
  throw new Error("Rollback target pointer must be confirmed exactly.");
}
const target = {
  revisionId: confirmedTargetRevision,
  sourceFingerprint: confirmedTargetFingerprint,
};
const projectId = process.env.FIREBASE_PROJECT_ID;
if (
  argument("--confirm-project=") !== projectId ||
  argument("--confirm-current-revision=") !== current.revisionId ||
  argument("--confirm-current-fingerprint=") !== current.sourceFingerprint
) {
  throw new Error("Rollback project, current pointer and target pointer must be confirmed exactly.");
}

const database = getAdminFirestore();
const targetRevision = await fetchFirebaseSolutionRegistryRevisionByIdFromFirestore(
  target.revisionId,
  database,
);
if (
  targetRevision.revisionStatus !== "published" ||
  targetRevision.sourceFingerprint !== target.sourceFingerprint
) {
  throw new Error("Rollback target is missing, unpublished or has another fingerprint.");
}
const pointerReference = database.doc(FIREBASE_SOLUTION_REGISTRY_ACTIVE_POINTER);
await database.runTransaction(async (transaction) => {
  const snapshot = await transaction.get(pointerReference);
  const pointer = snapshot.data();
  if (
    !snapshot.exists ||
    !pointer ||
    pointer.revisionId !== current.revisionId ||
    pointer.sourceFingerprint !== current.sourceFingerprint
  ) {
    throw new Error("Firebase active pointer changed before rollback.");
  }
  transaction.update(pointerReference, target);
});
const active = await fetchActiveFirebaseSolutionRegistryRevisionFromFirestore(database);
if (
  active.revisionId !== target.revisionId ||
  active.sourceFingerprint !== target.sourceFingerprint
) {
  throw new Error("Firebase rollback read-back does not match the sealed target.");
}
console.log(JSON.stringify({
  mode: "firebase-only-candidate-rolled-back",
  projectId,
  previousPointer: current,
  activePointer: target,
}, null, 2));
