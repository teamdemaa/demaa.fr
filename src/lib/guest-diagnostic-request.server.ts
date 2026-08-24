import "server-only";

import { createHash } from "node:crypto";
import { getActionPlanActions } from "@/lib/action-plan-view-model";
import type { StoredGuestActionPlan } from "@/lib/guest-action-plan-generation.server";
import { getAdminFirestore } from "@/lib/firebase-admin";
import { resolveLeadAttribution } from "@/lib/lead-attribution-server";
import { resolveLeadContext } from "@/lib/lead-context";
import { submitLeadRequest } from "@/lib/lead-notifications";

export const GUEST_DIAGNOSTIC_IDEMPOTENCY_COLLECTION = "guest_diagnostic_idempotency";
const RETENTION_MS = 3 * 365 * 24 * 60 * 60 * 1_000;

export class GuestDiagnosticIdempotencyConflictError extends Error {
  constructor() {
    super("guest_diagnostic_idempotency_conflict");
    this.name = "GuestDiagnosticIdempotencyConflictError";
  }
}

function hash(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

function planFields(plan: StoredGuestActionPlan) {
  return [
    { label: "Plan", value: plan.title },
    { label: "Situation", value: plan.sourceText },
    ...getActionPlanActions(plan.plan).map((action, index) => ({
      label: `Action ${index + 1} - ${action.title}`,
      value: [
        action.objective,
        ...action.steps.map((step) => `- ${step}`),
        ...(action.support ? ["", action.support.label, action.support.content] : []),
      ].join("\n"),
    })),
    { label: "Référence du plan temporaire", value: plan.id },
  ];
}

async function reserveIdempotency(input: {
  email: string;
  generationId: string | null;
  idempotencyKey: string;
  message: string | null;
  phone: string | null;
  situation: string | null;
  now?: Date;
}) {
  const database = getAdminFirestore();
  const now = input.now ?? new Date();
  const id = hash(`guest-diagnostic:${input.idempotencyKey}`);
  const reference = database.collection(GUEST_DIAGNOSTIC_IDEMPOTENCY_COLLECTION).doc(id);
  const requestFingerprint = hash(JSON.stringify({
    email: input.email.toLowerCase(),
    generationId: input.generationId,
    message: input.message,
    phone: input.phone,
    situation: input.situation,
  }));
  return database.runTransaction(async (transaction) => {
    const snapshot = await transaction.get(reference);
    const existing = snapshot.data() as {
      lead_id?: string | null;
      request_fingerprint?: string;
    } | undefined;
    if (snapshot.exists) {
      if (existing?.request_fingerprint !== requestFingerprint) {
        throw new GuestDiagnosticIdempotencyConflictError();
      }
      return { id, leadId: existing?.lead_id ?? null };
    }
    transaction.create(reference, {
      request_fingerprint: requestFingerprint,
      lead_id: null,
      created_at: now.toISOString(),
      updated_at: now.toISOString(),
      retention_expires_at: new Date(now.getTime() + RETENTION_MS).toISOString(),
    });
    return { id, leadId: null };
  });
}

export async function submitGuestDiagnosticRequest(input: {
  attribution: unknown;
  email: string;
  idempotencyKey: string;
  message: string | null;
  phone: string | null;
  plan?: StoredGuestActionPlan | null;
  request: Request;
  situation?: string | null;
}) {
  const situation = input.situation?.trim() || null;
  const reservation = await reserveIdempotency({
    email: input.email,
    generationId: input.plan?.id ?? null,
    idempotencyKey: input.idempotencyKey,
    message: input.message,
    phone: input.phone,
    situation,
  });
  if (reservation.leadId) return { duplicate: true, leadId: reservation.leadId };

  const context = await resolveLeadContext({
    source: "Diagnostic Demaa",
    sourceUrl: input.request.headers.get("referer"),
    systemSlug: input.plan?.plan.systemId,
  });
  if (!context) throw new Error("guest_diagnostic_context_unavailable");
  const submittedAt = new Date().toISOString();
  const lead = await submitLeadRequest({
    attribution: resolveLeadAttribution(input.request, input.attribution),
    channels: { email: true, resend: false, slack: false },
    contact: { email: input.email, phone: input.phone },
    consents: [{
      capturedAt: submittedAt,
      granted: true,
      purpose: "diagnostic_contact",
      text: "J’accepte que l’équipe Demaa me contacte par e-mail au sujet de ce diagnostic.",
      version: "guest-diagnostic-contact-v1",
    }],
    context,
    emoji: "🧭",
    fields: [
      ...(input.message ? [{ label: "Message complémentaire", value: input.message }] : []),
      ...(situation && !input.plan ? [{ label: "Situation saisie", value: situation }] : []),
      ...(input.plan ? planFields(input.plan) : []),
    ],
    idempotencyKey: `guest-diagnostic:${reservation.id}`,
    requestType: "guest_plan_diagnostic",
    title: input.plan ? `Diagnostic demandé - ${input.plan.title}` : "Diagnostic demandé",
  });

  await getAdminFirestore()
    .collection(GUEST_DIAGNOSTIC_IDEMPOTENCY_COLLECTION)
    .doc(reservation.id)
    .set({ lead_id: lead.leadId, updated_at: new Date().toISOString() }, { merge: true });
  return { duplicate: lead.duplicate, leadId: lead.leadId };
}
