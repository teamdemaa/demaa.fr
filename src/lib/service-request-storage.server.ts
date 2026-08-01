import "server-only";

import { createHash } from "node:crypto";
import { getAdminFirestore } from "@/lib/firebase-admin";
import type { LeadAttributionRecord } from "@/lib/lead-attribution";
import type { PublishedServiceOfferDto } from "@/lib/service-catalog-v2-dto";
import type { PublishedSolutionPlacementDto } from "@/lib/solution-registry-dto";

export const SERVICE_REQUEST_COLLECTION = "service_requests";
export const SOLUTION_REFERRAL_COLLECTION = "solution_referrals";

export type RequestDeliveryChannel =
  | "customer_email"
  | "internal_email"
  | "marketing_sync";
export type RequestDeliveryStatus = "failed" | "pending" | "sent" | "skipped";
export type RequestDeliveryState = Readonly<{
  attempted_at?: string;
  attempt_count: number;
  error?: string | null;
  status: RequestDeliveryStatus;
}>;

type RequestContact = Readonly<{
  company: string;
  email: string;
  first_name: string;
}>;

type MarketingConsentSnapshot = Readonly<{
  captured_at: string;
  granted: true;
  text: string;
  version: string;
}>;

type BaseStoredRequest = Readonly<{
  attribution: LeadAttributionRecord;
  contact: RequestContact;
  created_at: string;
  idempotency_key_hash: string;
  marketing_consent: MarketingConsentSnapshot | null;
  need: string;
  notification_status: Readonly<Record<RequestDeliveryChannel, RequestDeliveryState>>;
  retention_expires_at: string;
  system_slug: string | null;
  updated_at: string;
}>;

export type StoredServiceRequest = BaseStoredRequest & Readonly<{
  request_type: "service_request";
  service: Readonly<{
    billing_party: "Demaa" | "ODEMA";
    contracting_party: "Demaa" | "ODEMA";
    offer_version: string;
    operator_type: "demaa" | "odema";
    pricing: PublishedServiceOfferDto["pricing"];
    service_name: string;
    service_slug: string;
    transparency: string;
  }>;
}>;

export type StoredSolutionReferral = BaseStoredRequest & Readonly<{
  request_type: "solution_referral";
  solution: Readonly<{
    billing_party: string;
    commercial_relationship: PublishedSolutionPlacementDto["resource"]["commercialRelationship"];
    contracting_party: string;
    placement_id: string;
    placement_version: string;
    resource_name: string;
    resource_slug: string;
    resource_version: string;
    section: PublishedSolutionPlacementDto["section"];
    transparency: string;
  }>;
}>;

export type ServiceRequestStorageInput = Readonly<{
  attribution: LeadAttributionRecord;
  company: string;
  email: string;
  firstName: string;
  idempotencyKey: string;
  marketingConsent: MarketingConsentSnapshot | null;
  need: string;
  service: StoredServiceRequest["service"];
  systemSlug: string | null;
}>;

export type SolutionReferralStorageInput = Readonly<{
  attribution: LeadAttributionRecord;
  company: string;
  email: string;
  firstName: string;
  idempotencyKey: string;
  marketingConsent: MarketingConsentSnapshot | null;
  need: string;
  solution: StoredSolutionReferral["solution"];
  systemSlug: string;
}>;

type CreatedRequest<TRecord> = Readonly<{
  created: boolean;
  id: string;
  record: TRecord;
}>;

function requestRetentionExpiry(now: Date) {
  const expiry = new Date(now);
  expiry.setUTCFullYear(expiry.getUTCFullYear() + 3);
  return expiry.toISOString();
}

function idempotencyDocumentId(input: {
  email: string;
  idempotencyKey: string;
  requestType: "service_request" | "solution_referral";
  systemSlug: string | null;
  targetSlug: string;
}) {
  return createHash("sha256")
    .update([
      input.requestType,
      input.idempotencyKey,
      input.email,
      input.systemSlug ?? "global",
      input.targetSlug,
    ].join(":"))
    .digest("hex");
}

function initialDeliveryState(marketingConsent: MarketingConsentSnapshot | null) {
  return {
    customer_email: { attempt_count: 0, status: "pending" as const },
    internal_email: { attempt_count: 0, status: "pending" as const },
    marketing_sync: {
      attempt_count: 0,
      status: marketingConsent ? "pending" as const : "skipped" as const,
    },
  };
}

async function createRequest<TRecord>(input: {
  collection: string;
  documentId: string;
  record: TRecord;
}): Promise<CreatedRequest<TRecord>> {
  const database = getAdminFirestore();
  const document = database.collection(input.collection).doc(input.documentId);
  const result = await database.runTransaction(async (transaction) => {
    const snapshot = await transaction.get(document);
    if (snapshot.exists) {
      return { created: false, record: snapshot.data() as TRecord };
    }
    transaction.create(document, input.record as Record<string, unknown>);
    return { created: true, record: input.record };
  });
  return { ...result, id: document.id };
}

export async function createServiceRequest(
  input: ServiceRequestStorageInput,
): Promise<CreatedRequest<StoredServiceRequest>> {
  const now = new Date();
  const timestamp = now.toISOString();
  const documentId = idempotencyDocumentId({
    email: input.email,
    idempotencyKey: input.idempotencyKey,
    requestType: "service_request",
    systemSlug: input.systemSlug,
    targetSlug: input.service.service_slug,
  });
  const record: StoredServiceRequest = {
    attribution: input.attribution,
    contact: {
      company: input.company,
      email: input.email,
      first_name: input.firstName,
    },
    created_at: timestamp,
    idempotency_key_hash: documentId,
    marketing_consent: input.marketingConsent,
    need: input.need,
    notification_status: initialDeliveryState(input.marketingConsent),
    request_type: "service_request",
    retention_expires_at: requestRetentionExpiry(now),
    service: input.service,
    system_slug: input.systemSlug,
    updated_at: timestamp,
  };
  return createRequest({
    collection: SERVICE_REQUEST_COLLECTION,
    documentId,
    record,
  });
}

export async function createSolutionReferral(
  input: SolutionReferralStorageInput,
): Promise<CreatedRequest<StoredSolutionReferral>> {
  const now = new Date();
  const timestamp = now.toISOString();
  const documentId = idempotencyDocumentId({
    email: input.email,
    idempotencyKey: input.idempotencyKey,
    requestType: "solution_referral",
    systemSlug: input.systemSlug,
    targetSlug: input.solution.resource_slug,
  });
  const record: StoredSolutionReferral = {
    attribution: input.attribution,
    contact: {
      company: input.company,
      email: input.email,
      first_name: input.firstName,
    },
    created_at: timestamp,
    idempotency_key_hash: documentId,
    marketing_consent: input.marketingConsent,
    need: input.need,
    notification_status: initialDeliveryState(input.marketingConsent),
    request_type: "solution_referral",
    retention_expires_at: requestRetentionExpiry(now),
    solution: input.solution,
    system_slug: input.systemSlug,
    updated_at: timestamp,
  };
  return createRequest({
    collection: SOLUTION_REFERRAL_COLLECTION,
    documentId,
    record,
  });
}

async function updateDeliveryState(input: {
  channel: RequestDeliveryChannel;
  collection: string;
  error?: string | null;
  requestId: string;
  status: Exclude<RequestDeliveryStatus, "pending">;
}) {
  const database = getAdminFirestore();
  const document = database.collection(input.collection).doc(input.requestId);
  const timestamp = new Date().toISOString();
  await database.runTransaction(async (transaction) => {
    const snapshot = await transaction.get(document);
    const record = snapshot.data() as BaseStoredRequest | undefined;
    const previousAttempts = record?.notification_status[input.channel]?.attempt_count ?? 0;
    transaction.update(document, {
      [`notification_status.${input.channel}.attempt_count`]: previousAttempts + 1,
      [`notification_status.${input.channel}.attempted_at`]: timestamp,
      [`notification_status.${input.channel}.error`]: input.error?.slice(0, 500) || null,
      [`notification_status.${input.channel}.status`]: input.status,
      updated_at: timestamp,
    });
  });
}

export function updateServiceRequestDeliveryState(input: Omit<Parameters<typeof updateDeliveryState>[0], "collection">) {
  return updateDeliveryState({ ...input, collection: SERVICE_REQUEST_COLLECTION });
}

export function updateSolutionReferralDeliveryState(input: Omit<Parameters<typeof updateDeliveryState>[0], "collection">) {
  return updateDeliveryState({ ...input, collection: SOLUTION_REFERRAL_COLLECTION });
}
