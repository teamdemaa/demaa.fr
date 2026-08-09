import { isDeepStrictEqual } from "node:util";

import { getApps, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

import { enterpriseCatalog } from "@/lib/enterprise-annuaire";
import {
  FIREBASE_SOLUTION_REGISTRY_ACTIVE_POINTER,
  parseFirebaseSolutionRegistryRevision,
  validateFirebaseSolutionRegistryRevision,
} from "@/lib/firebase-solution-registry-contract";
import { buildFranceSolutionsCleanupRevision } from "@/lib/firebase-solution-registry-france-cleanup.server";
import { buildFirestoreSolutionRegistryImportPlan } from "@/lib/firebase-solution-registry-firestore-plan";
import {
  buildRetiredPlacementMigrationPlan,
  buildRetiredPlacementSnapshot,
  EXPERTISE_PLACEMENTS_COLLECTION,
} from "@/lib/provider-network-placement-retirement";
import activeSnapshot from "@/lib/firebase-solution-registry.snapshot.generated.json";

const EMULATOR_PROJECT_ID = "demo-demaa-solutions";
if (!process.env.FIRESTORE_EMULATOR_HOST) {
  throw new Error("FIRESTORE_EMULATOR_HOST is required; remote Firestore is forbidden.");
}
if (process.env.GCLOUD_PROJECT && process.env.GCLOUD_PROJECT !== EMULATOR_PROJECT_ID) {
  throw new Error("The emulator project ID is not the expected disposable project.");
}
if (getApps().length === 0) initializeApp({ projectId: EMULATOR_PROJECT_ID });
const firestore = getFirestore();

const active = parseFirebaseSolutionRegistryRevision(activeSnapshot);
const pointer = {
  revisionId: active.revisionId,
  sourceFingerprint: active.sourceFingerprint,
};
await firestore.doc(FIREBASE_SOLUTION_REGISTRY_ACTIVE_POINTER).set(pointer);

const candidate = buildFranceSolutionsCleanupRevision();
const plan = buildFirestoreSolutionRegistryImportPlan(candidate);
if (candidate.revisionStatus !== "draft" || plan.activation !== null) {
  throw new Error("The France candidate must remain non-activating DRAFT data.");
}
for (const writes of plan.writeBatches) {
  const batch = firestore.batch();
  for (const write of writes) batch.create(firestore.doc(write.path), write.data);
  await batch.commit();
}
const revisionPath = `solution_registry_revisions/${candidate.revisionId}`;
const [metadata, resources, placements, pointerAfterDraft] = await Promise.all([
  firestore.doc(revisionPath).get(),
  firestore.collection(`${revisionPath}/resources`).get(),
  firestore.collection(`${revisionPath}/placements`).get(),
  firestore.doc(FIREBASE_SOLUTION_REGISTRY_ACTIVE_POINTER).get(),
]);
if (
  !metadata.exists ||
  resources.size !== candidate.resources.length ||
  placements.size !== candidate.placements.length
) {
  throw new Error("The emulator DRAFT revision is incomplete or contains extra documents.");
}
const resourcesById = new Map(resources.docs.map((document) => [document.id, document.data()]));
const placementsById = new Map(placements.docs.map((document) => [document.id, document.data()]));
const imported = parseFirebaseSolutionRegistryRevision({
  ...metadata.data(),
  resources: candidate.resources.map(({ resource }) => resourcesById.get(resource.resourceSlug)),
  placements: candidate.placements.map(({ placement }) => placementsById.get(placement.placementId)),
});
const validationErrors = validateFirebaseSolutionRegistryRevision(imported, {
  expectedSystemSlugs: enterpriseCatalog.map(({ slug }) => slug),
  now: new Date(candidate.createdAt),
});
if (validationErrors.length > 0) {
  throw new Error(`Emulator DRAFT revision is invalid:\n${validationErrors.join("\n")}`);
}
if (!isDeepStrictEqual(pointerAfterDraft.data(), pointer)) {
  throw new Error("The DRAFT emulator import changed the active pointer.");
}

const legacyPlacements = enterpriseCatalog
  .filter(({ slug }) => slug !== "cabinet-comptable")
  .map(({ slug }) => ({
    expertisePlacementId: `${slug}:chartered-accountant`,
    expertiseId: "chartered-accountant",
    systemSlug: slug,
    rank: 1,
    usage: "Confier la comptabilité à un professionnel adapté.",
    fitRationale: "Le besoin dépend du contexte de l’entreprise.",
    fitConstraints: ["Vérifier l’inscription professionnelle."],
    displayCategory: "Prestation réglementée",
    nameOverride: "Expert-comptable",
    descriptionOverride: "Un professionnel pour suivre la comptabilité.",
    visibility: "selected" as const,
    placementVersion: "1.0.0",
  }));
const retirementSnapshot = buildRetiredPlacementSnapshot({
  projectId: EMULATOR_PROJECT_ID,
  capturedAt: "2026-08-09T12:00:00.000Z",
  placements: legacyPlacements,
});
const retirementPlan = buildRetiredPlacementMigrationPlan(retirementSnapshot);
let batch = firestore.batch();
for (const write of retirementPlan.rollbackWrites) {
  batch.create(firestore.doc(write.path), write.data);
}
await batch.commit();
batch = firestore.batch();
for (const deletion of retirementPlan.deletes) {
  batch.delete(firestore.doc(deletion.path));
}
await batch.commit();
const afterRemoval = await firestore
  .collection(EXPERTISE_PLACEMENTS_COLLECTION)
  .where("expertiseId", "==", "chartered-accountant")
  .get();
if (afterRemoval.size !== 0) throw new Error("Emulator removal is incomplete.");
batch = firestore.batch();
for (const write of retirementPlan.rollbackWrites) {
  batch.create(firestore.doc(write.path), write.data);
}
await batch.commit();
const afterRollback = await firestore
  .collection(EXPERTISE_PLACEMENTS_COLLECTION)
  .where("expertiseId", "==", "chartered-accountant")
  .get();
if (afterRollback.size !== 114) throw new Error("Emulator rollback is incomplete.");

console.log(JSON.stringify({
  mode: "firestore-emulator-france-clean-draft",
  projectId: EMULATOR_PROJECT_ID,
  systemsValidated: candidate.knownSystemSlugs.length,
  revisionId: candidate.revisionId,
  revisionStatus: candidate.revisionStatus,
  writesCommitted: plan.writes.length,
  resourcesReadBack: resources.size,
  placementsReadBack: placements.size,
  activePointerChanged: false,
  universalPlacementsDeleted: retirementPlan.deletes.length,
  rollbackPlacementsRestored: afterRollback.size,
  sourceFingerprint: imported.sourceFingerprint,
  planFingerprint: plan.planFingerprint,
  snapshotFingerprint: retirementPlan.snapshotFingerprint,
}, null, 2));
