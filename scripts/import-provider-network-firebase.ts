import { isDeepStrictEqual } from "node:util";
import { Firestore } from "firebase-admin/firestore";
import { GoogleAuth, Impersonated, OAuth2Client } from "google-auth-library";
import { getAdminFirestore } from "@/lib/firebase-admin";
import { buildProviderNetworkImportPlan } from "@/lib/provider-network-import-plan";

const PRODUCTION_PROJECT_ID = "demaa-dde32";
const argument = (prefix: string) =>
  process.argv.find((entry) => entry.startsWith(prefix))?.slice(prefix.length);
const target = argument("--target=") ?? "preview";
const isProduction = target === "production";
if (target !== "preview" && !isProduction) {
  throw new Error("La cible doit être preview ou production.");
}

const projectId = process.env.FIREBASE_PROJECT_ID ?? "";
const importServiceAccount =
  process.env.FIREBASE_IMPORT_IMPERSONATE_SERVICE_ACCOUNT?.trim() ?? "";
const importAccessToken =
  process.env.FIREBASE_IMPORT_ACCESS_TOKEN?.trim() ?? "";
const expectedProjectId = isProduction
  ? process.env.FIREBASE_PROVIDER_NETWORK_PRODUCTION_PROJECT_ID
  : process.env.FIREBASE_PROVIDER_NETWORK_PREVIEW_PROJECT_ID;
const confirmedProjectId = argument("--confirm-project=");
const confirmedPlan = argument("--confirm-plan=");
const applyGate = isProduction
  ? process.argv.includes("--apply-provider-network-production")
  : process.argv.includes("--apply-provider-network-preview");

const {
  expertisePlacements,
  planFingerprint,
  writes,
} = buildProviderNetworkImportPlan();

if (
  !applyGate
  || !expectedProjectId
  || projectId !== expectedProjectId
  || confirmedProjectId !== projectId
  || confirmedPlan !== planFingerprint
) {
  throw new Error(
    `Projet, empreinte et autorisation d’écriture Firebase doivent être confirmés explicitement. ${JSON.stringify({
      applyGate,
      confirmedPlanMatches: confirmedPlan === planFingerprint,
      confirmedProjectMatches: confirmedProjectId === projectId,
      expectedProjectMatches: expectedProjectId === projectId,
      hasExpectedProject: Boolean(expectedProjectId),
      target,
    })}`,
  );
}
if (isProduction && projectId !== PRODUCTION_PROJECT_ID) {
  throw new Error("La cible Production n’est pas le projet Demaa canonique.");
}
if (!isProduction && (!/(preview|staging|test|e2e)/i.test(projectId) || projectId === PRODUCTION_PROJECT_ID)) {
  throw new Error("La cible Preview n’est pas suffisamment isolée de Production.");
}

const importAuth = importAccessToken
  ? (() => {
      const auth = new OAuth2Client();
      auth.setCredentials({ access_token: importAccessToken });
      return auth;
    })()
  : importServiceAccount
    ? new Impersonated({
        sourceClient: await new GoogleAuth({
          scopes: ["https://www.googleapis.com/auth/cloud-platform"],
        }).getClient(),
        targetPrincipal: importServiceAccount,
        targetScopes: ["https://www.googleapis.com/auth/datastore"],
        lifetime: 600,
      })
    : null;
const firestore = importAuth
  ? new Firestore({
      auth: importAuth,
      preferRest: true,
      projectId,
    })
  : getAdminFirestore();
const missing: typeof writes = [];
for (const write of writes) {
  const snapshot = await firestore.doc(write.path).get();
  if (!snapshot.exists) {
    missing.push(write);
  } else if (!isDeepStrictEqual(snapshot.data(), write.data)) {
    throw new Error(`Le document ${write.path} existe déjà avec un contenu différent.`);
  }
}

for (let start = 0; start < missing.length; start += 400) {
  const batch = firestore.batch();
  for (const write of missing.slice(start, start + 400)) {
    batch.create(firestore.doc(write.path), write.data);
  }
  await batch.commit();
}

console.log(JSON.stringify({
  created: missing.length,
  expertisePlacementCount: expertisePlacements.length,
  mode: `firebase-${target}`,
  planFingerprint,
  projectId,
  unchanged: writes.length - missing.length,
  writeCount: writes.length,
}, null, 2));
