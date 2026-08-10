import { getApps, initializeApp } from "firebase-admin/app";
import { FieldPath, getFirestore } from "firebase-admin/firestore";

import {
  FIREBASE_SOLUTION_REGISTRY_ACTIVE_POINTER,
  FIREBASE_SOLUTION_REGISTRY_REVISIONS_COLLECTION,
  parseFirebaseSolutionRegistryRevision,
  validateFirebaseSolutionRegistryRevision,
  type FirebaseSolutionPlacementEntry,
  type FirebaseSolutionResourceEntry,
} from "@/lib/firebase-solution-registry-contract";
import { buildFirebaseSolutionRegistryMigrationRevision } from "@/lib/firebase-solution-registry-migration.server";
import { buildPublishedFranceSolutionsCleanupRevision } from "@/lib/firebase-solution-registry-france-cleanup.server";
import { buildPublishedProfessionalSuppliersRevision } from "@/lib/firebase-solution-registry-professional-suppliers.server";
import { buildPublishedPrelaunchCloseoutRevision } from "@/lib/firebase-solution-registry-prelaunch-closeout.server";
import { buildPublishedSupplierExpansionRevision } from "@/lib/firebase-solution-registry-supplier-expansion.server";
import { buildFirestoreSolutionRegistryImportPlan } from "@/lib/firebase-solution-registry-firestore-plan";

const EMULATOR_PROJECT_ID = "demo-demaa-solutions";
const SOLUTION_SECTIONS = ["software", "services", "providers", "models", "networks"] as const;

if (!process.env.FIRESTORE_EMULATOR_HOST) {
  throw new Error("FIRESTORE_EMULATOR_HOST is required; remote Firestore is forbidden.");
}
if (process.env.GCLOUD_PROJECT && process.env.GCLOUD_PROJECT !== EMULATOR_PROJECT_ID) {
  throw new Error("The emulator project ID is not the expected disposable project.");
}

const revisionSource = process.argv.find((argument) => argument.startsWith("--revision="))
  ?.slice("--revision=".length) ?? "migration";
if (!["migration", "france-cleanup", "professional-suppliers", "prelaunch-closeout", "supplier-expansion"].includes(revisionSource)) {
  throw new Error(
    "Emulator revision must be migration, france-cleanup, professional-suppliers, prelaunch-closeout or supplier-expansion.",
  );
}
const revision = revisionSource === "supplier-expansion"
  ? buildPublishedSupplierExpansionRevision()
  : revisionSource === "prelaunch-closeout"
  ? buildPublishedPrelaunchCloseoutRevision()
  : revisionSource === "professional-suppliers"
  ? buildPublishedProfessionalSuppliersRevision()
  : revisionSource === "france-cleanup"
    ? buildPublishedFranceSolutionsCleanupRevision()
    : buildFirebaseSolutionRegistryMigrationRevision();
const plan = buildFirestoreSolutionRegistryImportPlan(revision);
if (plan.revisionStatus !== "published" || !plan.activation) {
  throw new Error("Emulator verification requires a complete active revision plan.");
}

if (getApps().length === 0) initializeApp({ projectId: EMULATOR_PROJECT_ID });
const firestore = getFirestore();

for (const writeBatch of plan.writeBatches) {
  const batch = firestore.batch();
  for (const write of writeBatch) {
    batch.set(firestore.doc(write.path), write.data);
  }
  await batch.commit();
}
await firestore.doc(plan.activation.path).set(plan.activation.data);

const [pointerSnapshot, metadataSnapshot, resourcesSnapshot, placementsSnapshot] =
  await Promise.all([
    firestore.doc(FIREBASE_SOLUTION_REGISTRY_ACTIVE_POINTER).get(),
    firestore
      .collection(FIREBASE_SOLUTION_REGISTRY_REVISIONS_COLLECTION)
      .doc(revision.revisionId)
      .get(),
    firestore
      .collection(FIREBASE_SOLUTION_REGISTRY_REVISIONS_COLLECTION)
      .doc(revision.revisionId)
      .collection("resources")
      .orderBy(FieldPath.documentId())
      .get(),
    firestore
      .collection(FIREBASE_SOLUTION_REGISTRY_REVISIONS_COLLECTION)
      .doc(revision.revisionId)
      .collection("placements")
      .get(),
  ]);

if (
  !pointerSnapshot.exists ||
  pointerSnapshot.get("revisionId") !== revision.revisionId ||
  pointerSnapshot.get("sourceFingerprint") !== revision.sourceFingerprint
) {
  throw new Error("The active pointer does not match the sealed revision.");
}
if (!metadataSnapshot.exists) throw new Error("Imported revision metadata is missing.");

const systemOrder = new Map(
  revision.knownSystemSlugs.map((systemSlug, index) => [systemSlug, index]),
);
const sectionOrder = new Map(
  SOLUTION_SECTIONS.map((section, index) => [section, index]),
);
const resources = resourcesSnapshot.docs.map((document) =>
  document.data() as FirebaseSolutionResourceEntry,
);
const placements = placementsSnapshot.docs
  .map((document) => document.data() as FirebaseSolutionPlacementEntry)
  .sort((left, right) => {
    const systemDifference =
      (systemOrder.get(left.placement.systemSlug) ?? Number.MAX_SAFE_INTEGER) -
      (systemOrder.get(right.placement.systemSlug) ?? Number.MAX_SAFE_INTEGER);
    if (systemDifference !== 0) return systemDifference;
    const sectionDifference =
      (sectionOrder.get(left.placement.section) ?? Number.MAX_SAFE_INTEGER) -
      (sectionOrder.get(right.placement.section) ?? Number.MAX_SAFE_INTEGER);
    return sectionDifference || left.placement.rank - right.placement.rank;
  });

const importedRevision = parseFirebaseSolutionRegistryRevision({
  ...metadataSnapshot.data(),
  resources,
  placements,
});
const validationErrors = validateFirebaseSolutionRegistryRevision(importedRevision, {
  expectedSystemSlugs: revision.knownSystemSlugs,
  now: new Date(revision.createdAt),
});
if (validationErrors.length > 0) {
  throw new Error(`Imported revision is invalid:\n${validationErrors.join("\n")}`);
}
if (importedRevision.sourceFingerprint !== revision.sourceFingerprint) {
  throw new Error("Imported revision fingerprint differs from the sealed snapshot.");
}

console.log(JSON.stringify({
  mode: "firestore-emulator",
  revisionSource,
  projectId: EMULATOR_PROJECT_ID,
  revisionId: revision.revisionId,
  revisionStatus: revision.revisionStatus,
  writesCommitted: plan.writes.length,
  resourcesReadBack: resources.length,
  placementsReadBack: placements.length,
  activePointerExists: pointerSnapshot.exists,
  sourceFingerprint: importedRevision.sourceFingerprint,
  planFingerprint: plan.planFingerprint,
}, null, 2));
