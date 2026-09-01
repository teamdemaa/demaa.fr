import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { isDeepStrictEqual } from "node:util";

import { getAdminFirestore } from "@/lib/firebase-admin";
import {
  FIREBASE_SOLUTION_REGISTRY_ACTIVE_POINTER,
  parseFirebaseSolutionRegistryRevision,
} from "@/lib/firebase-solution-registry-contract";
import { buildFirestoreSolutionRegistryImportPlan } from "@/lib/firebase-solution-registry-firestore-plan";
import {
  fetchActiveFirebaseSolutionRegistryRevisionFromFirestore,
  fetchFirebaseSolutionRegistryRevisionByIdFromFirestore,
} from "@/lib/firebase-solution-registry.server";
import { FIREBASE_TOOL_COMPARISON_REVISIONS_COLLECTION } from "@/lib/firebase-tool-comparison-contract";

function argument(prefix: string) {
  return process.argv.find((entry) => entry.startsWith(prefix))?.slice(prefix.length);
}

if (!process.argv.includes("--activate")) {
  throw new Error("Firebase activation requires --activate.");
}

const artifactPath = fileURLToPath(new URL(
  "../docs/research/d091-tools/firebase-only-comparison-candidate.generated.json",
  import.meta.url,
));
const artifact = JSON.parse(await readFile(artifactPath, "utf8"));
const candidate = parseFirebaseSolutionRegistryRevision(artifact.candidateRevision);
const registryPlan = buildFirestoreSolutionRegistryImportPlan(candidate);
const currentRevision = argument("--confirm-current-revision=");
const currentFingerprint = argument("--confirm-current-fingerprint=");
if (!currentRevision || !currentFingerprint) {
  throw new Error("The currently active Firebase revision must be confirmed exactly.");
}
const current = {
  revisionId: currentRevision,
  sourceFingerprint: currentFingerprint,
};
const configuredProject = process.env.FIREBASE_PROJECT_ID;

if (argument("--confirm-project=") !== configuredProject) {
  throw new Error(`Configured Firebase project must be confirmed exactly: ${configuredProject}.`);
}
if (
  argument("--confirm-candidate-fingerprint=") !== candidate.sourceFingerprint ||
  argument("--confirm-registry-plan=") !== registryPlan.planFingerprint ||
  argument("--confirm-comparisons-plan=") !==
    artifact.candidateComparisonPlan.planFingerprint
) {
  throw new Error("The sealed candidate fingerprints were not confirmed exactly.");
}

const database = getAdminFirestore();
const stagedCandidate = await fetchFirebaseSolutionRegistryRevisionByIdFromFirestore(
  candidate.revisionId,
  database,
);
if (!isDeepStrictEqual(stagedCandidate, candidate)) {
  throw new Error("The staged candidate differs from the sealed local artifact.");
}
const comparisonRoot = database
  .collection(FIREBASE_TOOL_COMPARISON_REVISIONS_COLLECTION)
  .doc(candidate.sourceFingerprint);
const [comparisonMetadata, comparisonSystems] = await Promise.all([
  comparisonRoot.get(),
  comparisonRoot.collection("systems").get(),
]);
if (
  !comparisonMetadata.exists ||
  comparisonMetadata.data()?.registryRevisionId !== candidate.revisionId ||
  comparisonMetadata.data()?.registryFingerprint !== candidate.sourceFingerprint ||
  comparisonSystems.size !== artifact.candidateComparisonPlan.writes.length - 1
) {
  throw new Error("The staged candidate comparisons are incomplete or bound incorrectly.");
}

const pointerReference = database.doc(FIREBASE_SOLUTION_REGISTRY_ACTIVE_POINTER);
await database.runTransaction(async (transaction) => {
  const pointerSnapshot = await transaction.get(pointerReference);
  if (!pointerSnapshot.exists) throw new Error("Firebase active pointer is missing.");
  const pointer = pointerSnapshot.data();
  if (
    !pointer ||
    pointer.revisionId !== current.revisionId ||
    pointer.sourceFingerprint !== current.sourceFingerprint
  ) {
    throw new Error("Firebase active pointer changed before activation.");
  }
  transaction.update(pointerReference, {
    revisionId: candidate.revisionId,
    sourceFingerprint: candidate.sourceFingerprint,
  });
});

const active = await fetchActiveFirebaseSolutionRegistryRevisionFromFirestore(database);
if (!isDeepStrictEqual(active, candidate)) {
  throw new Error("Firebase active read-back differs from the sealed candidate.");
}

console.log(JSON.stringify({
  mode: "firebase-only-candidate-activated",
  projectId: configuredProject,
  previousPointer: current,
  activePointer: {
    revisionId: active.revisionId,
    sourceFingerprint: active.sourceFingerprint,
  },
  resources: active.resources.length,
  placements: active.placements.length,
  comparisonDocuments: comparisonSystems.size,
  rollbackPointer: current,
}, null, 2));
