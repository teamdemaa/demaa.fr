import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { isDeepStrictEqual } from "node:util";

import { getAdminFirestore } from "@/lib/firebase-admin";
import {
  buildFirestoreSolutionRegistryImportPlan,
  type FirestoreSolutionRegistryWrite,
} from "@/lib/firebase-solution-registry-firestore-plan";
import {
  FIREBASE_SOLUTION_REGISTRY_ACTIVE_POINTER,
  parseFirebaseSolutionRegistryRevision,
} from "@/lib/firebase-solution-registry-contract";
import type {
  FirebaseToolComparisonImportPlan,
  FirebaseToolComparisonWrite,
} from "@/lib/firebase-tool-comparison-firestore-plan";

type CandidateArtifact = Readonly<{
  candidateRevision: unknown;
  candidateComparisonPlan: FirebaseToolComparisonImportPlan;
}>;

function argument(prefix: string) {
  return process.argv.find((entry) => entry.startsWith(prefix))?.slice(prefix.length);
}

function chunks<T>(items: readonly T[], size = 400) {
  return Array.from(
    { length: Math.ceil(items.length / size) },
    (_, index) => items.slice(index * size, (index + 1) * size),
  );
}

if (!process.argv.includes("--stage")) {
  throw new Error("Firebase staging requires --stage.");
}

const artifactPath = fileURLToPath(new URL(
  "../docs/research/d091-tools/firebase-only-comparison-candidate.generated.json",
  import.meta.url,
));
const artifact = JSON.parse(await readFile(artifactPath, "utf8")) as CandidateArtifact;
const candidateRevision = parseFirebaseSolutionRegistryRevision(
  artifact.candidateRevision,
);
const registryPlan = buildFirestoreSolutionRegistryImportPlan(candidateRevision);

const confirmedCurrentRevision = argument("--confirm-current-revision=");
const confirmedCurrentFingerprint = argument("--confirm-current-fingerprint=");
if (!confirmedCurrentRevision || !confirmedCurrentFingerprint) {
  throw new Error("The current Firebase pointer must be confirmed exactly.");
}
if (argument("--confirm-candidate-fingerprint=") !== candidateRevision.sourceFingerprint) {
  throw new Error("Candidate revision fingerprint confirmation does not match.");
}
if (argument("--confirm-registry-plan=") !== registryPlan.planFingerprint) {
  throw new Error("Candidate registry plan fingerprint confirmation does not match.");
}
if (
  argument("--confirm-candidate-comparisons-plan=") !==
    artifact.candidateComparisonPlan.planFingerprint
) {
  throw new Error("Candidate comparison plan fingerprint confirmation does not match.");
}

const database = getAdminFirestore();
const configuredProject = process.env.FIREBASE_PROJECT_ID;
const confirmedProject = argument("--confirm-project=");
if (!confirmedProject || configuredProject !== confirmedProject) {
  throw new Error(
    `Firebase project must be confirmed exactly; configured project is ${configuredProject ?? "missing"}.`,
  );
}
const pointerSnapshot = await database.doc(FIREBASE_SOLUTION_REGISTRY_ACTIVE_POINTER).get();
if (!pointerSnapshot.exists) throw new Error("Firebase active pointer is missing.");
const pointer = pointerSnapshot.data();
if (
  pointer?.revisionId !== confirmedCurrentRevision ||
  pointer?.sourceFingerprint !== confirmedCurrentFingerprint
) {
  throw new Error("Firebase active pointer does not match the explicit staging confirmation.");
}

const writes: readonly (FirestoreSolutionRegistryWrite | FirebaseToolComparisonWrite)[] = [
  ...registryPlan.writes,
  ...artifact.candidateComparisonPlan.writes,
];
const paths = writes.map(({ path }) => path);
if (new Set(paths).size !== paths.length) {
  throw new Error("Staging plans contain duplicate Firestore paths.");
}

const missing: typeof writes[number][] = [];
for (const group of chunks(writes, 250)) {
  const snapshots = await database.getAll(...group.map(({ path }) => database.doc(path)));
  snapshots.forEach((snapshot, index) => {
    const expected = group[index];
    if (!snapshot.exists) {
      missing.push(expected);
    } else if (!isDeepStrictEqual(snapshot.data(), expected.data)) {
      throw new Error(`${expected.path}: immutable Firebase document conflicts with the sealed plan.`);
    }
  });
}

for (const group of chunks(missing)) {
  const batch = database.batch();
  for (const write of group) batch.create(database.doc(write.path), write.data);
  await batch.commit();
}

for (const group of chunks(writes, 250)) {
  const snapshots = await database.getAll(...group.map(({ path }) => database.doc(path)));
  snapshots.forEach((snapshot, index) => {
    const expected = group[index];
    if (!snapshot.exists || !isDeepStrictEqual(snapshot.data(), expected.data)) {
      throw new Error(`${expected.path}: Firebase read-back differs from the sealed plan.`);
    }
  });
}

const pointerAfter = (await database.doc(FIREBASE_SOLUTION_REGISTRY_ACTIVE_POINTER).get()).data();
if (!isDeepStrictEqual(pointerAfter, pointer)) {
  throw new Error("Staging unexpectedly changed the active Firebase pointer.");
}

console.log(JSON.stringify({
  mode: "firebase-only-candidate-staged-not-activated",
  projectId: configuredProject,
  currentActiveRevision: pointer,
  candidateRevisionId: candidateRevision.revisionId,
  candidateFingerprint: candidateRevision.sourceFingerprint,
  registryPlanFingerprint: registryPlan.planFingerprint,
  candidateComparisonPlanFingerprint: artifact.candidateComparisonPlan.planFingerprint,
  plannedWrites: writes.length,
  createdWrites: missing.length,
  activePointerChanged: false,
}, null, 2));
