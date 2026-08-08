import { isDeepStrictEqual } from "node:util";
import expertiseSnapshot from "@/lib/expertise-catalog.snapshot.generated.json";
import opportunitySnapshot from "@/lib/opportunities.snapshot.generated.json";
import { buildExpertisePlacementSeeds } from "@/lib/expertise-placement-seeds";
import { parseExpertiseCatalogEntry } from "@/lib/expertise-catalog-contract";
import { getAdminFirestore } from "@/lib/firebase-admin";
import { parseOpportunity } from "@/lib/opportunity-contract";

const PRODUCTION_PROJECT_ID = "demaa-dde32";
const argument = (prefix: string) =>
  process.argv.find((entry) => entry.startsWith(prefix))?.slice(prefix.length);
const target = argument("--target=") ?? "preview";
const isProduction = target === "production";
if (target !== "preview" && !isProduction) {
  throw new Error("La cible doit être preview ou production.");
}

const projectId = process.env.FIREBASE_PROJECT_ID ?? "";
const expectedProjectId = isProduction
  ? process.env.FIREBASE_PROVIDER_NETWORK_PRODUCTION_PROJECT_ID
  : process.env.FIREBASE_PROVIDER_NETWORK_PREVIEW_PROJECT_ID;
const confirmedProjectId = argument("--confirm-project=");
const confirmedPlan = argument("--confirm-plan=");
const applyGate = isProduction
  ? process.argv.includes("--apply-provider-network-production")
  : process.argv.includes("--apply-provider-network-preview");

const expertises = expertiseSnapshot.map((entry, index) =>
  parseExpertiseCatalogEntry(entry, `expertise[${index}]`)
);
const opportunities = opportunitySnapshot.map((entry, index) =>
  parseOpportunity(entry, `opportunity[${index}]`)
);
const expertisePlacements = buildExpertisePlacementSeeds();
const writes = [
  ...expertises.map((data) => ({ path: `expertise_catalog/${data.expertiseId}`, data })),
  ...opportunities.map((data) => ({ path: `opportunities/${data.opportunityId}`, data })),
  ...expertisePlacements.map((data) => ({
    path: `expertise_placements/${data.expertisePlacementId}`,
    data,
  })),
];
const { createHash } = await import("node:crypto");
const planFingerprint = createHash("sha256")
  .update(JSON.stringify(writes))
  .digest("hex");

if (
  !applyGate
  || !expectedProjectId
  || projectId !== expectedProjectId
  || confirmedProjectId !== projectId
  || confirmedPlan !== planFingerprint
) {
  throw new Error(
    "Projet, empreinte et autorisation d’écriture Firebase doivent être confirmés explicitement.",
  );
}
if (isProduction && projectId !== PRODUCTION_PROJECT_ID) {
  throw new Error("La cible Production n’est pas le projet Demaa canonique.");
}
if (!isProduction && (!/(preview|staging|test|e2e)/i.test(projectId) || projectId === PRODUCTION_PROJECT_ID)) {
  throw new Error("La cible Preview n’est pas suffisamment isolée de Production.");
}

const firestore = getAdminFirestore();
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
