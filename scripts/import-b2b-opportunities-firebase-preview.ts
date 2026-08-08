import { createHash } from "node:crypto";
import { getAdminFirestore } from "@/lib/firebase-admin";
import { INITIAL_B2B_OPPORTUNITIES } from "@/lib/b2b-opportunities-contract";
import { B2B_OPPORTUNITIES_COLLECTION } from "@/lib/b2b-opportunities.server";

if (process.env.FIRESTORE_EMULATOR_HOST) {
  throw new Error("The Preview importer refuses Firestore Emulator mode.");
}

const previewProjectId = process.env.FIREBASE_SOLUTION_REGISTRY_PREVIEW_PROJECT_ID;
const projectId = process.env.FIREBASE_PROJECT_ID;
if (!previewProjectId || projectId !== previewProjectId || !/(preview|staging|test|e2e)/i.test(previewProjectId)) {
  throw new Error("Firebase Preview project identity is not explicitly configured.");
}

const fingerprint = createHash("sha256")
  .update(JSON.stringify(INITIAL_B2B_OPPORTUNITIES))
  .digest("hex");
if (!process.argv.includes("--apply-preview") || !process.argv.includes(`--confirm-plan=${fingerprint}`)) {
  throw new Error("Preview import requires --apply-preview and the exact --confirm-plan fingerprint.");
}

const database = getAdminFirestore();
const collection = database.collection(B2B_OPPORTUNITIES_COLLECTION);
const now = new Date().toISOString();
let created = 0;
let unchanged = 0;

for (const opportunity of INITIAL_B2B_OPPORTUNITIES) {
  const reference = collection.doc(opportunity.slug);
  const existing = await reference.get();
  const expected = { ...opportunity };
  if (existing.exists) {
    const actual = existing.data();
    if (Object.entries(expected).some(([key, value]) => actual?.[key] !== value)) {
      throw new Error(`Preview contains a conflicting opportunity: ${opportunity.slug}`);
    }
    unchanged += 1;
    continue;
  }
  await reference.create({ ...expected, createdAt: now, updatedAt: now });
  created += 1;
}

for (const opportunity of INITIAL_B2B_OPPORTUNITIES) {
  const readBack = await collection.doc(opportunity.slug).get();
  if (!readBack.exists || readBack.data()?.status !== "published") {
    throw new Error(`Preview read-back failed for ${opportunity.slug}`);
  }
}

console.log(JSON.stringify({ collection: B2B_OPPORTUNITIES_COLLECTION, created, fingerprint, unchanged }, null, 2));
