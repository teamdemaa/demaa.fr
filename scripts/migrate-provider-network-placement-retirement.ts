import { readFile, writeFile } from "node:fs/promises";
import { isDeepStrictEqual } from "node:util";

import { Firestore } from "firebase-admin/firestore";
import { GoogleAuth, Impersonated, OAuth2Client } from "google-auth-library";

import { getAdminFirestore } from "@/lib/firebase-admin";
import {
  buildRetiredPlacementMigrationPlan,
  buildRetiredPlacementSnapshot,
  expectedRetiredUniversalPlacementIds,
  EXPERTISE_PLACEMENTS_COLLECTION,
  parseRetiredPlacementSnapshot,
} from "@/lib/provider-network-placement-retirement";
import { resolvePlacementRetirementGate } from "@/lib/provider-network-placement-retirement-gate";

const argument = (prefix: string) =>
  process.argv.find((entry) => entry.startsWith(prefix))?.slice(prefix.length);
const snapshotOutput = argument("--capture-snapshot=");
const snapshotInput = argument("--snapshot=");
const remove = process.argv.includes("--remove");
const rollback = process.argv.includes("--rollback");

if ([Boolean(snapshotOutput), remove, rollback].filter(Boolean).length !== 1) {
  throw new Error("Choisir exactement un mode : --capture-snapshot, --remove ou --rollback.");
}
if ((remove || rollback) && !snapshotInput) {
  throw new Error("--snapshot=<fichier> est obligatoire pour modifier Firebase.");
}

const mode = snapshotOutput ? "snapshot" : remove ? "remove" : "rollback";
const gate = resolvePlacementRetirementGate({
  arguments_: process.argv.slice(2),
  environment: process.env,
  mode,
});
const auth = gate.accessToken
  ? (() => {
      const client = new OAuth2Client();
      client.setCredentials({ access_token: gate.accessToken });
      return client;
    })()
  : gate.impersonatedServiceAccount
    ? new Impersonated({
        sourceClient: await new GoogleAuth({
          scopes: ["https://www.googleapis.com/auth/cloud-platform"],
        }).getClient(),
        targetPrincipal: gate.impersonatedServiceAccount,
        targetScopes: ["https://www.googleapis.com/auth/datastore"],
        lifetime: 600,
      })
    : null;
const firestore = auth
  ? new Firestore({ auth, preferRest: true, projectId: gate.projectId })
  : getAdminFirestore();

async function readRetiredDocuments() {
  const result = await firestore
    .collection(EXPERTISE_PLACEMENTS_COLLECTION)
    .where("expertiseId", "==", "chartered-accountant")
    .get();
  return result.docs;
}

if (snapshotOutput) {
  const documents = await readRetiredDocuments();
  const snapshot = buildRetiredPlacementSnapshot({
    projectId: gate.projectId,
    capturedAt: new Date().toISOString(),
    placements: documents.map((document) => document.data()),
  });
  await writeFile(snapshotOutput, `${JSON.stringify(snapshot, null, 2)}\n`, {
    encoding: "utf8",
    flag: "wx",
  });
  console.log(JSON.stringify({
    mode: `firebase-${gate.target}-snapshot-only`,
    projectId: gate.projectId,
    placementCount: snapshot.documents.length,
    snapshotFingerprint: snapshot.snapshotFingerprint,
    snapshotOutput,
    writesExecuted: 0,
  }, null, 2));
  process.exit(0);
}

const snapshot = parseRetiredPlacementSnapshot(
  JSON.parse(await readFile(snapshotInput as string, "utf8")),
);
if (snapshot.projectId !== gate.projectId) {
  throw new Error("Le snapshot de rollback ne correspond pas au projet confirmé.");
}
const confirmedSnapshot = argument("--confirm-snapshot=");
if (confirmedSnapshot !== snapshot.snapshotFingerprint) {
  throw new Error("Le fingerprint exact du snapshot doit être confirmé.");
}
const plan = buildRetiredPlacementMigrationPlan(snapshot);

if (remove) {
  const remoteDocuments = await readRetiredDocuments();
  const remoteSnapshot = buildRetiredPlacementSnapshot({
    projectId: gate.projectId,
    capturedAt: snapshot.capturedAt,
    placements: remoteDocuments.map((document) => document.data()),
  });
  if (!isDeepStrictEqual(remoteSnapshot.documents, snapshot.documents)) {
    throw new Error("Les placements Firebase ont changé depuis le snapshot ; suppression refusée.");
  }
  const byId = new Map(remoteDocuments.map((document) => [document.id, document]));
  const batch = firestore.batch();
  for (const { path } of plan.deletes) {
    const id = path.slice(`${EXPERTISE_PLACEMENTS_COLLECTION}/`.length);
    const document = byId.get(id);
    if (!document) throw new Error(`Placement attendu absent : ${path}`);
    batch.delete(document.ref, { lastUpdateTime: document.updateTime });
  }
  await batch.commit();
  const remaining = await readRetiredDocuments();
  if (remaining.length !== 0) {
    throw new Error("Des placements universels subsistent après la suppression.");
  }
  console.log(JSON.stringify({
    mode: `firebase-${gate.target}-remove`,
    projectId: gate.projectId,
    deleted: plan.deletes.length,
    remaining: remaining.length,
    rollbackWrites: plan.rollbackWrites.length,
    snapshotFingerprint: plan.snapshotFingerprint,
  }, null, 2));
} else {
  const existing = await readRetiredDocuments();
  if (existing.length !== 0) {
    throw new Error("Rollback refusé : des placements chartered-accountant existent déjà.");
  }
  const batch = firestore.batch();
  for (const write of plan.rollbackWrites) {
    batch.create(firestore.doc(write.path), write.data);
  }
  await batch.commit();
  const restored = await readRetiredDocuments();
  const restoredIds = restored.map(({ id }) => id).sort();
  if (!isDeepStrictEqual(restoredIds, expectedRetiredUniversalPlacementIds())) {
    throw new Error("Le rollback relu est incomplet.");
  }
  console.log(JSON.stringify({
    mode: `firebase-${gate.target}-rollback`,
    projectId: gate.projectId,
    restored: restored.length,
    snapshotFingerprint: plan.snapshotFingerprint,
  }, null, 2));
}
