import "server-only";

import { getAdminFirestore } from "@/lib/firebase-admin";

export function getLeadRetentionExpiry(now = Date.now()) {
  const expiry = new Date(now);
  expiry.setUTCFullYear(expiry.getUTCFullYear() + 3);
  return expiry.toISOString();
}

async function deleteBefore(input: {
  collection: string;
  field: string;
  limit: number;
  value: string;
}) {
  const database = getAdminFirestore();
  const snapshot = await database
    .collection(input.collection)
    .where(input.field, "<=", input.value)
    .limit(input.limit)
    .get();

  if (snapshot.empty) return 0;

  const batch = database.batch();
  for (const document of snapshot.docs) batch.delete(document.ref);
  await batch.commit();
  return snapshot.size;
}

export async function cleanupExpiredOperationalData(limitPerCollection = 50) {
  const now = new Date().toISOString();
  const cutoff = new Date();
  cutoff.setUTCFullYear(cutoff.getUTCFullYear() - 3);
  const leadCutoff = cutoff.toISOString();
  const operations = [
    { collection: "lead_requests", field: "retention_expires_at", limit: limitPerCollection, value: now },
    { collection: "lead_requests", field: "updated_at", limit: limitPerCollection, value: leadCutoff },
    { collection: "system_kit_sequences", field: "retention_expires_at", limit: limitPerCollection, value: now },
    { collection: "system_kit_sequences", field: "updated_at", limit: limitPerCollection, value: leadCutoff },
    { collection: "api_rate_limits", field: "expires_at", limit: limitPerCollection, value: now },
    { collection: "customer_magic_links", field: "expires_at", limit: limitPerCollection, value: now },
    { collection: "customer_sessions", field: "expires_at", limit: limitPerCollection, value: now },
  ];
  const results: number[] = [];

  for (const operation of operations) {
    results.push(await deleteBefore(operation));
  }

  return {
    deleted: results.reduce((total, count) => total + count, 0),
    operations: operations.length,
  };
}
