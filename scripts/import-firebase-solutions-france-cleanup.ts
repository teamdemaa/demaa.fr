import { isDeepStrictEqual } from "node:util";

import { Firestore } from "firebase-admin/firestore";
import { GoogleAuth, Impersonated, OAuth2Client } from "google-auth-library";

import { getAdminFirestore } from "@/lib/firebase-admin";
import {
  FIREBASE_SOLUTION_REGISTRY_ACTIVE_POINTER,
  parseFirebaseSolutionRegistryRevision,
  validateFirebaseSolutionRegistryRevision,
} from "@/lib/firebase-solution-registry-contract";
import { resolveFirebaseSolutionDraftImportTarget } from "@/lib/firebase-solution-registry-draft-import-gate";
import { buildFranceSolutionsCleanupRevision } from "@/lib/firebase-solution-registry-france-cleanup.server";
import { buildFirestoreSolutionRegistryImportPlan } from "@/lib/firebase-solution-registry-firestore-plan";

const argument = (prefix: string) =>
  process.argv.find((entry) => entry.startsWith(prefix))?.slice(prefix.length);
const chunk = <T>(items: readonly T[], size: number) =>
  Array.from(
    { length: Math.ceil(items.length / size) },
    (_, index) => items.slice(index * size, (index + 1) * size),
  );

if (process.env.FIRESTORE_EMULATOR_HOST) {
  throw new Error("The remote draft importer refuses Firestore Emulator mode.");
}
const target = resolveFirebaseSolutionDraftImportTarget({
  arguments_: process.argv.slice(2),
  environment: process.env,
});
const revision = buildFranceSolutionsCleanupRevision();
const plan = buildFirestoreSolutionRegistryImportPlan(revision);
if (revision.revisionStatus !== "draft" || plan.activation !== null) {
  throw new Error("This importer accepts only a non-activating DRAFT revision.");
}
if (argument("--confirm-plan=") !== plan.planFingerprint) {
  throw new Error("The exact DRAFT plan fingerprint must be confirmed.");
}
if (argument("--confirm-revision=") !== revision.sourceFingerprint) {
  throw new Error("The exact DRAFT revision fingerprint must be confirmed.");
}

const auth = target.accessToken
  ? (() => {
      const client = new OAuth2Client();
      client.setCredentials({ access_token: target.accessToken });
      return client;
    })()
  : target.impersonatedServiceAccount
    ? new Impersonated({
        sourceClient: await new GoogleAuth({
          scopes: ["https://www.googleapis.com/auth/cloud-platform"],
        }).getClient(),
        targetPrincipal: target.impersonatedServiceAccount,
        targetScopes: ["https://www.googleapis.com/auth/datastore"],
        lifetime: 600,
      })
    : null;
const firestore = auth
  ? new Firestore({ auth, preferRest: true, projectId: target.projectId })
  : getAdminFirestore();

const activeReference = firestore.doc(FIREBASE_SOLUTION_REGISTRY_ACTIVE_POINTER);
const pointerBefore = await activeReference.get();
if (!pointerBefore.exists) throw new Error("The active pointer must exist before DRAFT import.");
const pointerData = pointerBefore.data();
if (
  pointerData?.revisionId !== argument("--confirm-current-revision=") ||
  pointerData?.sourceFingerprint !== argument("--confirm-current-fingerprint=")
) {
  throw new Error("The active pointer revision and fingerprint must be confirmed exactly.");
}
const pointerUpdateTime = pointerBefore.updateTime?.toDate().toISOString() ?? null;

const missingWrites = [] as typeof plan.writes[number][];
for (const group of chunk(plan.writes, 100)) {
  const snapshots = await firestore.getAll(
    ...group.map(({ path }) => firestore.doc(path)),
  );
  for (let index = 0; index < group.length; index += 1) {
    const expected = group[index];
    const snapshot = snapshots[index];
    if (!snapshot.exists) missingWrites.push(expected);
    else if (!isDeepStrictEqual(snapshot.data(), expected.data)) {
      throw new Error(`${target.targetLabel} contains conflicting DRAFT document ${expected.path}.`);
    }
  }
}
for (const group of chunk(missingWrites, 400)) {
  const batch = firestore.batch();
  for (const write of group) batch.create(firestore.doc(write.path), write.data);
  await batch.commit();
}

const revisionPath = `solution_registry_revisions/${revision.revisionId}`;
const [metadata, resources, placements, pointerAfter] = await Promise.all([
  firestore.doc(revisionPath).get(),
  firestore.collection(`${revisionPath}/resources`).get(),
  firestore.collection(`${revisionPath}/placements`).get(),
  activeReference.get(),
]);
if (!metadata.exists) throw new Error("Imported DRAFT metadata is missing.");
if (
  resources.size !== revision.resources.length ||
  placements.size !== revision.placements.length
) {
  throw new Error("Imported DRAFT collections contain missing or unexpected documents.");
}
const resourcesBySlug = new Map(resources.docs.map((document) => [document.id, document.data()]));
const placementsById = new Map(placements.docs.map((document) => [document.id, document.data()]));
const importedRevision = parseFirebaseSolutionRegistryRevision({
  ...metadata.data(),
  resources: revision.resources.map(({ resource }) => resourcesBySlug.get(resource.resourceSlug)),
  placements: revision.placements.map(({ placement }) => placementsById.get(placement.placementId)),
});
const validationErrors = validateFirebaseSolutionRegistryRevision(importedRevision, {
  expectedSystemSlugs: revision.knownSystemSlugs,
  now: new Date(revision.createdAt),
});
if (validationErrors.length > 0) {
  throw new Error(`Imported DRAFT revision is invalid:\n${validationErrors.join("\n")}`);
}
if (importedRevision.sourceFingerprint !== revision.sourceFingerprint) {
  throw new Error("Imported DRAFT fingerprint differs from the sealed candidate.");
}
const pointerAfterUpdateTime = pointerAfter.updateTime?.toDate().toISOString() ?? null;
if (
  !pointerAfter.exists ||
  !isDeepStrictEqual(pointerAfter.data(), pointerData) ||
  pointerAfterUpdateTime !== pointerUpdateTime
) {
  throw new Error("The active pointer changed during the DRAFT import.");
}

console.log(JSON.stringify({
  mode: `firebase-${target.target}-draft-revision`,
  projectId: target.projectId,
  revisionId: revision.revisionId,
  revisionStatus: revision.revisionStatus,
  plannedWrites: plan.writes.length,
  writesCreated: missingWrites.length,
  resourcesReadBack: resources.size,
  placementsReadBack: placements.size,
  activePointerChanged: false,
  activePointer: pointerData,
  sourceFingerprint: importedRevision.sourceFingerprint,
  planFingerprint: plan.planFingerprint,
}, null, 2));
