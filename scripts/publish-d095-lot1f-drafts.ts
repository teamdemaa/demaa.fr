import { getAdminFirestore } from "@/lib/firebase-admin";
import { parseOpportunity } from "@/lib/opportunity-contract";
import { OPPORTUNITIES_COLLECTION } from "@/lib/provider-network.server";

const PRODUCTION_PROJECT_ID = "demaa-dde32";
const projectId = process.env.FIREBASE_PROJECT_ID ?? "";
const confirmedProjectId = (
  process.argv.find((entry) => entry.startsWith("--confirm-project="))
    ?.slice("--confirm-project=".length) ?? ""
);
const applyGate = process.argv.includes("--apply-d095-lot1f-publish");

if (!applyGate || projectId !== PRODUCTION_PROJECT_ID || confirmedProjectId !== projectId) {
  throw new Error(
    `Confirmation explicite requise. ${JSON.stringify({ applyGate, confirmedProjectId, projectId })}`,
  );
}

const ids = [
  "salon-de-beaute-a-reprendre-au-teich-20dfcd",
  "bar-restaurant-a-reprendre-a-bordeaux-c0248a",
  "association-d-aide-a-domicile-a-reprendre-en-gironde-7d30aa",
];

const firestore = getAdminFirestore();
const now = new Date().toISOString();
const results: unknown[] = [];

for (const id of ids) {
  const reference = firestore.collection(OPPORTUNITIES_COLLECTION).doc(id);
  const snapshot = await reference.get();
  if (!snapshot.exists) throw new Error(`${id} introuvable`);
  const existing = snapshot.data();
  // Validated by parseOpportunity's fail-closed publish gate before writing.
  const opportunity = parseOpportunity({ ...existing, publishedAt: now, status: "open" });
  await reference.set({ ...opportunity, updatedAt: now }, { merge: true });
  results.push({ id, status: opportunity.status, publishedAt: opportunity.publishedAt });
}

console.log(JSON.stringify(results, null, 2));
