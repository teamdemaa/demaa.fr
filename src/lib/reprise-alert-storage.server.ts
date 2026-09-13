import "server-only";

import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { getAdminFirestore } from "@/lib/firebase-admin";
import { buildLeadIdempotencyHash } from "@/lib/lead-idempotency";
import type { RepriseAlertCriteria } from "@/lib/reprise-alerts";
import type { RepriseOpportunityCategory, RepriseOpportunityRegion } from "@/lib/reprise-opportunities";

const ALERTS_COLLECTION = "reprise_alerts";
const DELIVERIES_COLLECTION = "reprise_alert_deliveries";

type StoredRepriseAlert = {
  access_token_hash: string;
  created_at: string;
  criteria: {
    budget_max: number | null;
    categories: RepriseOpportunityCategory[];
    include_missing: boolean;
    query: string;
    regions: RepriseOpportunityRegion[];
    revenue_min: number | null;
  };
  email: string;
  status: "active" | "deleted";
  updated_at: string;
};

export type RepriseAlertRecord = Readonly<{
  createdAt: string;
  criteria: RepriseAlertCriteria;
  email: string;
  id: string;
}>;

function hash(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

function getAccessSecret() {
  const secret = process.env.REPRISE_ALERT_TOKEN_SECRET?.trim();
  if (secret) return secret;
  if (process.env.NODE_ENV !== "production") return "demaa-reprise-alert-local-development";
  throw new Error("Reprise alert access secret is not configured.");
}

export function getRepriseAlertAccessToken(alertId: string) {
  return createHmac("sha256", getAccessSecret())
    .update(`reprise-alert:${alertId}`)
    .digest("base64url");
}

function tokenMatches(token: string, expectedHash: string) {
  const actual = Buffer.from(hash(token), "utf8");
  const expected = Buffer.from(expectedHash, "utf8");
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

function serializeCriteria(criteria: RepriseAlertCriteria): StoredRepriseAlert["criteria"] {
  return {
    budget_max: criteria.budgetMax,
    categories: [...criteria.categories],
    include_missing: criteria.includeMissing,
    query: criteria.query,
    regions: [...criteria.regions],
    revenue_min: criteria.revenueMin,
  };
}

function deserializeCriteria(criteria: StoredRepriseAlert["criteria"]): RepriseAlertCriteria {
  return {
    budgetMax: criteria.budget_max,
    categories: criteria.categories,
    includeMissing: criteria.include_missing,
    query: criteria.query,
    regions: criteria.regions,
    revenueMin: criteria.revenue_min,
  };
}

function toRecord(id: string, data: StoredRepriseAlert): RepriseAlertRecord {
  return {
    createdAt: data.created_at,
    criteria: deserializeCriteria(data.criteria),
    email: data.email,
    id,
  };
}

export async function createRepriseAlert(input: {
  criteria: RepriseAlertCriteria;
  email: string;
  idempotencyKey: string;
}) {
  const database = getAdminFirestore();
  const id = buildLeadIdempotencyHash("reprise_alert", input.idempotencyKey);
  const accessToken = getRepriseAlertAccessToken(id);
  const ref = database.collection(ALERTS_COLLECTION).doc(id);
  const now = new Date().toISOString();
  const created = await database.runTransaction(async (transaction) => {
    const snapshot = await transaction.get(ref);
    if (snapshot.exists) return false;
    transaction.create(ref, {
      access_token_hash: hash(accessToken),
      created_at: now,
      criteria: serializeCriteria(input.criteria),
      email: input.email,
      status: "active",
      updated_at: now,
    } satisfies StoredRepriseAlert);
    return true;
  });
  return { accessToken, created, id };
}

export async function getRepriseAlertByAccess(id: string, accessToken: string) {
  const snapshot = await getAdminFirestore().collection(ALERTS_COLLECTION).doc(id).get();
  if (!snapshot.exists) return null;
  const data = snapshot.data() as StoredRepriseAlert;
  if (data.status !== "active" || !tokenMatches(accessToken, data.access_token_hash)) return null;
  return toRecord(snapshot.id, data);
}

export async function updateRepriseAlert(input: {
  accessToken: string;
  criteria: RepriseAlertCriteria;
  id: string;
}) {
  const database = getAdminFirestore();
  const ref = database.collection(ALERTS_COLLECTION).doc(input.id);
  return database.runTransaction(async (transaction) => {
    const snapshot = await transaction.get(ref);
    if (!snapshot.exists) return false;
    const data = snapshot.data() as StoredRepriseAlert;
    if (data.status !== "active" || !tokenMatches(input.accessToken, data.access_token_hash)) return false;
    transaction.update(ref, {
      criteria: serializeCriteria(input.criteria),
      updated_at: new Date().toISOString(),
    });
    return true;
  });
}

export async function deleteRepriseAlert(id: string, accessToken: string) {
  const database = getAdminFirestore();
  const ref = database.collection(ALERTS_COLLECTION).doc(id);
  return database.runTransaction(async (transaction) => {
    const snapshot = await transaction.get(ref);
    if (!snapshot.exists) return false;
    const data = snapshot.data() as StoredRepriseAlert;
    if (data.status !== "active" || !tokenMatches(accessToken, data.access_token_hash)) return false;
    transaction.delete(ref);
    return true;
  });
}

export async function listActiveRepriseAlerts(limit = 500) {
  const snapshot = await getAdminFirestore()
    .collection(ALERTS_COLLECTION)
    .where("status", "==", "active")
    .limit(limit)
    .get();
  return snapshot.docs.map((document) => toRecord(document.id, document.data() as StoredRepriseAlert));
}

async function claimDelivery(input: {
  alertId: string;
  deliveryKey: string;
  kind: "internal_notification" | "opportunity_match" | "subscriber_confirmation";
  opportunityId?: string;
}) {
  const database = getAdminFirestore();
  const id = hash(`${input.alertId}:${input.deliveryKey}`);
  const ref = database.collection(DELIVERIES_COLLECTION).doc(id);
  const now = new Date();
  return database.runTransaction(async (transaction) => {
    const snapshot = await transaction.get(ref);
    const existing = snapshot.data();
    if (existing?.status === "sent") return null;
    const claimedAt = typeof existing?.claimed_at === "string" ? Date.parse(existing.claimed_at) : 0;
    if (existing?.status === "sending" && claimedAt > now.getTime() - 30 * 60 * 1000) return null;
    transaction.set(ref, {
      alert_id: input.alertId,
      attempt_count: (Number(existing?.attempt_count) || 0) + 1,
      claimed_at: now.toISOString(),
      delivery_kind: input.kind,
      opportunity_id: input.opportunityId ?? null,
      status: "sending",
      updated_at: now.toISOString(),
    }, { merge: true });
    return { deliveryId: id };
  });
}

export async function claimRepriseAlertCreationDelivery(
  alertId: string,
  channel: "internal_notification" | "subscriber_confirmation",
) {
  return claimDelivery({ alertId, deliveryKey: channel, kind: channel });
}

export async function claimRepriseAlertDelivery(alertId: string, opportunityId: string) {
  return claimDelivery({
    alertId,
    deliveryKey: `opportunity:${opportunityId}`,
    kind: "opportunity_match",
    opportunityId,
  });
}

export async function completeRepriseAlertDelivery(input: {
  deliveryId: string;
  error?: string;
  success: boolean;
}) {
  const now = new Date().toISOString();
  await getAdminFirestore().collection(DELIVERIES_COLLECTION).doc(input.deliveryId).set({
    error: input.error?.slice(0, 120) ?? null,
    sent_at: input.success ? now : null,
    status: input.success ? "sent" : "failed",
    updated_at: now,
  }, { merge: true });
}
