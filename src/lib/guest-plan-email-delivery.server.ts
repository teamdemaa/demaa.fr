import "server-only";

import { createHash, randomBytes } from "node:crypto";
import { getActionPlanActions } from "@/lib/action-plan-view-model";
import type { StoredGuestActionPlan } from "@/lib/guest-action-plan-generation.server";
import { getAdminFirestore } from "@/lib/firebase-admin";
import {
  sendTransactionalEmail,
  TransactionalEmailProviderError,
} from "@/lib/transactional-email.server";

export const GUEST_PLAN_EMAIL_DELIVERIES_COLLECTION = "guest_plan_email_deliveries";
const DELIVERY_LEASE_MS = 5 * 60 * 1_000;
const DELIVERY_RETENTION_MS = 90 * 24 * 60 * 60 * 1_000;
const MAX_DELIVERY_ATTEMPTS = 4;

type DeliveryDocument = {
  guest_generation_id?: string;
  email?: string;
  request_fingerprint?: string;
  status?: "pending" | "processing" | "sent" | "failed";
  attempt_count?: number;
  lease_owner?: string | null;
  lease_expires_at?: string | null;
  last_error_code?: string | null;
  created_at?: string;
  updated_at?: string;
  sent_at?: string | null;
  retention_expires_at?: string;
};

export class GuestPlanEmailIdempotencyConflictError extends Error {
  constructor() {
    super("guest_plan_email_idempotency_conflict");
    this.name = "GuestPlanEmailIdempotencyConflictError";
  }
}

function hash(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

function documentId(idempotencyKey: string) {
  return hash(`guest-plan-email:${idempotencyKey.trim()}`);
}

function fingerprint(generationId: string, email: string) {
  return hash(`guest-plan-email-request:${generationId}:${email.toLowerCase()}`);
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function renderPlan(plan: StoredGuestActionPlan) {
  const actions = getActionPlanActions(plan.plan);
  const text = [
    plan.title,
    "",
    ...actions.flatMap((action, index) => [
      `${index + 1}. ${action.title}`,
      action.objective,
      ...action.steps.map((step) => `- ${step}`),
      ...(action.support ? ["", action.support.label, action.support.content] : []),
      "",
    ]),
    "Ce plan a été généré par Demaa à partir des informations fournies. Vérifiez les éléments importants avant de les appliquer.",
  ].join("\n");
  const html = `
    <h1 style="font-family:Arial,sans-serif;font-size:24px;color:#17231d;">${escapeHtml(plan.title)}</h1>
    ${actions.map((action, index) => `
      <section style="font-family:Arial,sans-serif;margin:28px 0;color:#17231d;">
        <h2 style="font-size:18px;">${index + 1}. ${escapeHtml(action.title)}</h2>
        <p>${escapeHtml(action.objective)}</p>
        <ul>${action.steps.map((step) => `<li style="margin:8px 0;">${escapeHtml(step)}</li>`).join("")}</ul>
        ${action.support ? `<h3 style="font-size:16px;">${escapeHtml(action.support.label)}</h3><p style="white-space:pre-wrap;">${escapeHtml(action.support.content)}</p>` : ""}
      </section>
    `).join("")}
    <p style="font-family:Arial,sans-serif;color:#657068;font-size:13px;">Ce plan a été généré par Demaa à partir des informations fournies. Vérifiez les éléments importants avant de les appliquer.</p>
  `;
  return { html, text };
}

export async function prepareGuestPlanEmailDelivery(input: {
  email: string;
  generationId: string;
  idempotencyKey: string;
  now?: Date;
}) {
  const database = getAdminFirestore();
  const now = input.now ?? new Date();
  const nowIso = now.toISOString();
  const reference = database
    .collection(GUEST_PLAN_EMAIL_DELIVERIES_COLLECTION)
    .doc(documentId(input.idempotencyKey));
  return database.runTransaction(async (transaction) => {
    const snapshot = await transaction.get(reference);
    const existing = snapshot.data() as DeliveryDocument | undefined;
    const requestFingerprint = fingerprint(input.generationId, input.email);
    if (snapshot.exists) {
      if (existing?.request_fingerprint !== requestFingerprint) {
        throw new GuestPlanEmailIdempotencyConflictError();
      }
      return { created: false, id: reference.id, status: existing?.status ?? "failed" };
    }
    const retentionExpiresAt = new Date(now.getTime() + DELIVERY_RETENTION_MS).toISOString();
    transaction.create(reference, {
      guest_generation_id: input.generationId,
      email: input.email.toLowerCase(),
      request_fingerprint: requestFingerprint,
      status: "pending",
      attempt_count: 0,
      lease_owner: null,
      lease_expires_at: null,
      last_error_code: null,
      created_at: nowIso,
      updated_at: nowIso,
      sent_at: null,
      retention_expires_at: retentionExpiresAt,
    });
    return { created: true, id: reference.id, status: "pending" as const };
  });
}

async function claimDelivery(deliveryId: string, now = new Date()) {
  const database = getAdminFirestore();
  const reference = database.collection(GUEST_PLAN_EMAIL_DELIVERIES_COLLECTION).doc(deliveryId);
  return database.runTransaction(async (transaction) => {
    const snapshot = await transaction.get(reference);
    const existing = snapshot.data() as DeliveryDocument | undefined;
    if (!existing) return null;
    if (existing.status === "sent") return { kind: "sent" as const };
    const attempts = Number(existing.attempt_count) || 0;
    if (attempts >= MAX_DELIVERY_ATTEMPTS) return { kind: "exhausted" as const };
    const leaseExpiresAt = Date.parse(existing.lease_expires_at ?? "");
    if (existing.status === "processing" && Number.isFinite(leaseExpiresAt) && leaseExpiresAt > now.getTime()) {
      return { kind: "processing" as const };
    }
    const leaseOwner = randomBytes(18).toString("base64url");
    transaction.update(reference, {
      status: "processing",
      attempt_count: attempts + 1,
      lease_owner: leaseOwner,
      lease_expires_at: new Date(now.getTime() + DELIVERY_LEASE_MS).toISOString(),
      last_error_code: null,
      updated_at: now.toISOString(),
    });
    return {
      kind: "claimed" as const,
      email: existing.email ?? "",
      leaseOwner,
    };
  });
}

async function finishDelivery(input: {
  deliveryId: string;
  errorCode?: string;
  leaseOwner: string;
  success: boolean;
  now?: Date;
}) {
  const database = getAdminFirestore();
  const reference = database.collection(GUEST_PLAN_EMAIL_DELIVERIES_COLLECTION).doc(input.deliveryId);
  const now = input.now ?? new Date();
  await database.runTransaction(async (transaction) => {
    const snapshot = await transaction.get(reference);
    const existing = snapshot.data() as DeliveryDocument | undefined;
    if (!existing || existing.lease_owner !== input.leaseOwner) return;
    transaction.update(reference, {
      status: input.success ? "sent" : "failed",
      lease_owner: null,
      lease_expires_at: null,
      last_error_code: input.success ? null : input.errorCode?.slice(0, 80) || "email_failed",
      sent_at: input.success ? now.toISOString() : null,
      updated_at: now.toISOString(),
    });
  });
}

export async function deliverGuestPlanEmail(input: {
  deliveryId: string;
  plan: StoredGuestActionPlan;
}) {
  const claim = await claimDelivery(input.deliveryId);
  if (!claim || claim.kind === "exhausted") return { status: "failed" as const };
  if (claim.kind === "sent") return { status: "sent" as const };
  if (claim.kind === "processing") return { status: "processing" as const };
  const rendered = renderPlan(input.plan);
  try {
    await sendTransactionalEmail({
      html: rendered.html,
      idempotencyKey: `guest-plan-${input.deliveryId}`,
      subject: `Votre plan d’action Demaa - ${input.plan.title}`.slice(0, 180),
      text: rendered.text,
      to: claim.email,
    });
    await finishDelivery({
      deliveryId: input.deliveryId,
      leaseOwner: claim.leaseOwner,
      success: true,
    });
    return { status: "sent" as const };
  } catch (error) {
    await finishDelivery({
      deliveryId: input.deliveryId,
      errorCode: error instanceof TransactionalEmailProviderError ? error.code : "email_failed",
      leaseOwner: claim.leaseOwner,
      success: false,
    });
    return { status: "failed" as const };
  }
}
