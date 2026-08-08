import "server-only";

import { createHash, randomUUID } from "node:crypto";
import { getAdminFirestore } from "@/lib/firebase-admin";
import type { LeadAttributionPayload, LeadAttributionRecord } from "@/lib/lead-attribution";
import {
  hashRequestSnapshot,
  type buildServiceRequestSnapshot,
  type buildSolutionReferralSnapshot,
} from "@/lib/service-request-snapshots.server";

export const SERVICE_REQUEST_COLLECTION = "service_requests";
export const SOLUTION_REFERRAL_COLLECTION = "solution_referrals";
export const MAX_REQUEST_DELIVERY_ATTEMPTS = 4;
const DELIVERY_LEASE_MS = 5 * 60 * 1000;
const DELIVERY_CHANNELS = ["customer_email", "internal_email", "slack", "marketing_sync"] as const;

export type RequestDeliveryChannel = (typeof DELIVERY_CHANNELS)[number];
export type RequestDeliveryStatus =
  | "exhausted"
  | "failed"
  | "pending"
  | "processing"
  | "sent"
  | "skipped";
export type RequestDeliveryState = Readonly<{
  attempt_count: number;
  attempted_at?: string | null;
  last_error_code?: string | null;
  lease_expires_at?: string | null;
  lease_owner?: string | null;
  next_attempt_at?: string | null;
  status: RequestDeliveryStatus;
}>;

type RequestContact = Readonly<{
  company: string;
  email: string;
  first_name: string;
}>;

export type MarketingConsentSnapshot = Readonly<{
  captured_at: string;
  granted: true;
  text: string;
  version: string;
}>;

type BaseStoredRequest = Readonly<{
  attribution: LeadAttributionRecord;
  contact: RequestContact;
  created_at: string;
  delivery_due_at: string | null;
  idempotency_key_hash: string;
  marketing_consent: MarketingConsentSnapshot | null;
  need: string;
  notification_status: Readonly<Record<RequestDeliveryChannel, RequestDeliveryState>>;
  request_fingerprint: string;
  retention_expires_at: string;
  system_slug: string | null;
  updated_at: string;
}>;

export type StoredServiceRequest = BaseStoredRequest & Readonly<{
  request_type: "service_request";
  service: ReturnType<typeof buildServiceRequestSnapshot>;
}>;

export type StoredSolutionReferral = BaseStoredRequest & Readonly<{
  request_type: "solution_referral";
  solution: ReturnType<typeof buildSolutionReferralSnapshot>;
  system_slug: string;
}>;

export type StoredServiceSolutionRequest = StoredServiceRequest | StoredSolutionReferral;

export type ServiceRequestStorageInput = Readonly<{
  attribution: LeadAttributionRecord;
  company: string;
  email: string;
  firstName: string;
  fingerprintAttribution?: LeadAttributionPayload;
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
  fingerprintAttribution?: LeadAttributionPayload;
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

export class RequestIdempotencyConflictError extends Error {
  constructor() {
    super("Idempotency key already belongs to a different request.");
    this.name = "RequestIdempotencyConflictError";
  }
}

function requestRetentionExpiry(now: Date) {
  const expiry = new Date(now);
  expiry.setUTCFullYear(expiry.getUTCFullYear() + 3);
  return expiry.toISOString();
}

function idempotencyDocumentId(requestType: string, idempotencyKey: string) {
  return createHash("sha256").update(`${requestType}:${idempotencyKey}`).digest("hex");
}

function initialDeliveryState(marketingConsent: MarketingConsentSnapshot | null, now: string) {
  return {
    customer_email: {
      attempt_count: 0,
      next_attempt_at: now,
      status: "pending" as const,
    },
    internal_email: {
      attempt_count: 0,
      next_attempt_at: now,
      status: "pending" as const,
    },
    slack: {
      attempt_count: 0,
      next_attempt_at: now,
      status: "pending" as const,
    },
    marketing_sync: marketingConsent
      ? { attempt_count: 0, next_attempt_at: now, status: "pending" as const }
      : { attempt_count: 0, next_attempt_at: null, status: "skipped" as const },
  };
}

function requestFingerprint(input: {
  attribution?: LeadAttributionPayload;
  company: string;
  email: string;
  firstName: string;
  marketingConsentGranted: boolean;
  need: string;
  requestType: "service_request" | "solution_referral";
  snapshot: unknown;
  systemSlug: string | null;
}) {
  return hashRequestSnapshot({
    attribution: input.attribution ?? null,
    contact: {
      company: input.company,
      email: input.email,
      first_name: input.firstName,
    },
    marketing_consent: input.marketingConsentGranted,
    need: input.need,
    request_type: input.requestType,
    snapshot: input.snapshot,
    system_slug: input.systemSlug,
  });
}

async function createRequest<TRecord extends BaseStoredRequest>(input: {
  collection: string;
  documentId: string;
  record: TRecord;
}): Promise<CreatedRequest<TRecord>> {
  const database = getAdminFirestore();
  const document = database.collection(input.collection).doc(input.documentId);
  const result = await database.runTransaction(async (transaction) => {
    const snapshot = await transaction.get(document);
    if (snapshot.exists) {
      const existing = snapshot.data() as TRecord;
      if (existing.request_fingerprint !== input.record.request_fingerprint) {
        throw new RequestIdempotencyConflictError();
      }
      return { created: false, record: existing };
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
  const request_fingerprint = requestFingerprint({
    attribution: input.fingerprintAttribution,
    company: input.company,
    email: input.email,
    firstName: input.firstName,
    marketingConsentGranted: input.marketingConsent?.granted === true,
    need: input.need,
    requestType: "service_request",
    snapshot: input.service,
    systemSlug: input.systemSlug,
  });
  const record: StoredServiceRequest = {
    attribution: input.attribution,
    contact: { company: input.company, email: input.email, first_name: input.firstName },
    created_at: timestamp,
    delivery_due_at: timestamp,
    idempotency_key_hash: idempotencyDocumentId("service_request", input.idempotencyKey),
    marketing_consent: input.marketingConsent,
    need: input.need,
    notification_status: initialDeliveryState(input.marketingConsent, timestamp),
    request_fingerprint,
    request_type: "service_request",
    retention_expires_at: requestRetentionExpiry(now),
    service: input.service,
    system_slug: input.systemSlug,
    updated_at: timestamp,
  };
  return createRequest({
    collection: SERVICE_REQUEST_COLLECTION,
    documentId: record.idempotency_key_hash,
    record,
  });
}

export async function createSolutionReferral(
  input: SolutionReferralStorageInput,
): Promise<CreatedRequest<StoredSolutionReferral>> {
  const now = new Date();
  const timestamp = now.toISOString();
  const request_fingerprint = requestFingerprint({
    attribution: input.fingerprintAttribution,
    company: input.company,
    email: input.email,
    firstName: input.firstName,
    marketingConsentGranted: input.marketingConsent?.granted === true,
    need: input.need,
    requestType: "solution_referral",
    snapshot: input.solution,
    systemSlug: input.systemSlug,
  });
  const record: StoredSolutionReferral = {
    attribution: input.attribution,
    contact: { company: input.company, email: input.email, first_name: input.firstName },
    created_at: timestamp,
    delivery_due_at: timestamp,
    idempotency_key_hash: idempotencyDocumentId("solution_referral", input.idempotencyKey),
    marketing_consent: input.marketingConsent,
    need: input.need,
    notification_status: initialDeliveryState(input.marketingConsent, timestamp),
    request_fingerprint,
    request_type: "solution_referral",
    retention_expires_at: requestRetentionExpiry(now),
    solution: input.solution,
    system_slug: input.systemSlug,
    updated_at: timestamp,
  };
  return createRequest({
    collection: SOLUTION_REFERRAL_COLLECTION,
    documentId: record.idempotency_key_hash,
    record,
  });
}

function dueAtForState(state: RequestDeliveryState) {
  if (state.status === "pending" || state.status === "failed") {
    return Date.parse(state.next_attempt_at ?? "");
  }
  if (state.status === "processing") return Date.parse(state.lease_expires_at ?? "");
  return Number.NaN;
}

function nextDeliveryDueAt(states: StoredServiceSolutionRequest["notification_status"]) {
  const due = DELIVERY_CHANNELS
    .map((channel) => dueAtForState(states[channel]))
    .filter(Number.isFinite);
  return due.length > 0 ? new Date(Math.min(...due)).toISOString() : null;
}

function retryDelayMs(attemptCount: number) {
  return Math.min(24 * 60 * 60 * 1000, 15 * 60 * 1000 * 2 ** Math.max(0, attemptCount - 1));
}

async function getDueRequests<T extends StoredServiceSolutionRequest>(
  collection: string,
  now: Date,
  limit: number,
) {
  const snapshot = await getAdminFirestore()
    .collection(collection)
    .where("delivery_due_at", "<=", now.toISOString())
    .orderBy("delivery_due_at", "asc")
    .limit(limit)
    .get();
  return snapshot.docs.map((document) => ({ id: document.id, record: document.data() as T }));
}

export function getDueServiceRequests(now = new Date(), limit = 30) {
  return getDueRequests<StoredServiceRequest>(SERVICE_REQUEST_COLLECTION, now, limit);
}

export function getDueSolutionReferrals(now = new Date(), limit = 30) {
  return getDueRequests<StoredSolutionReferral>(SOLUTION_REFERRAL_COLLECTION, now, limit);
}

async function claimRequestDelivery<T extends StoredServiceSolutionRequest>(input: {
  collection: string;
  now?: Date;
  requestId: string;
  workerId?: string;
}) {
  const now = input.now ?? new Date();
  const nowMs = now.getTime();
  const workerId = input.workerId ?? randomUUID();
  const document = getAdminFirestore().collection(input.collection).doc(input.requestId);
  return getAdminFirestore().runTransaction(async (transaction) => {
    const snapshot = await transaction.get(document);
    const record = snapshot.data() as T | undefined;
    if (!record) return null;
    const channel = DELIVERY_CHANNELS.find((candidate) => {
      const state = record.notification_status[candidate];
      const dueAt = dueAtForState(state);
      return (
        (state.status === "pending" || state.status === "failed" || state.status === "processing")
        && state.attempt_count < MAX_REQUEST_DELIVERY_ATTEMPTS
        && Number.isFinite(dueAt)
        && dueAt <= nowMs
      );
    });
    if (!channel) return null;
    const previous = record.notification_status[channel];
    const claimed: RequestDeliveryState = {
      ...previous,
      attempt_count: previous.attempt_count + 1,
      attempted_at: now.toISOString(),
      last_error_code: null,
      lease_expires_at: new Date(nowMs + DELIVERY_LEASE_MS).toISOString(),
      lease_owner: workerId,
      next_attempt_at: null,
      status: "processing",
    };
    const states = { ...record.notification_status, [channel]: claimed };
    transaction.update(document, {
      delivery_due_at: nextDeliveryDueAt(states),
      [`notification_status.${channel}`]: claimed,
      updated_at: now.toISOString(),
    });
    return { channel, record, requestId: input.requestId, workerId };
  });
}

export function claimServiceRequestDelivery(input: Omit<Parameters<typeof claimRequestDelivery<StoredServiceRequest>>[0], "collection">) {
  return claimRequestDelivery<StoredServiceRequest>({ ...input, collection: SERVICE_REQUEST_COLLECTION });
}

export function claimSolutionReferralDelivery(input: Omit<Parameters<typeof claimRequestDelivery<StoredSolutionReferral>>[0], "collection">) {
  return claimRequestDelivery<StoredSolutionReferral>({ ...input, collection: SOLUTION_REFERRAL_COLLECTION });
}

async function completeRequestDelivery(input: {
  collection: string;
  channel: RequestDeliveryChannel;
  errorCode?: string;
  now?: Date;
  requestId: string;
  success: boolean;
  workerId: string;
}) {
  const now = input.now ?? new Date();
  const document = getAdminFirestore().collection(input.collection).doc(input.requestId);
  return getAdminFirestore().runTransaction(async (transaction) => {
    const snapshot = await transaction.get(document);
    const record = snapshot.data() as StoredServiceSolutionRequest | undefined;
    const previous = record?.notification_status[input.channel];
    if (!record || !previous || previous.status !== "processing" || previous.lease_owner !== input.workerId) {
      return false;
    }
    const exhausted = !input.success && previous.attempt_count >= MAX_REQUEST_DELIVERY_ATTEMPTS;
    const completed: RequestDeliveryState = {
      ...previous,
      last_error_code: input.success ? null : (input.errorCode ?? "delivery_failed").slice(0, 80),
      lease_expires_at: null,
      lease_owner: null,
      next_attempt_at: input.success || exhausted
        ? null
        : new Date(now.getTime() + retryDelayMs(previous.attempt_count)).toISOString(),
      status: input.success ? "sent" : exhausted ? "exhausted" : "failed",
    };
    const states = { ...record.notification_status, [input.channel]: completed };
    transaction.update(document, {
      delivery_due_at: nextDeliveryDueAt(states),
      [`notification_status.${input.channel}`]: completed,
      updated_at: now.toISOString(),
    });
    return true;
  });
}

export function completeServiceRequestDelivery(input: Omit<Parameters<typeof completeRequestDelivery>[0], "collection">) {
  return completeRequestDelivery({ ...input, collection: SERVICE_REQUEST_COLLECTION });
}

export function completeSolutionReferralDelivery(input: Omit<Parameters<typeof completeRequestDelivery>[0], "collection">) {
  return completeRequestDelivery({ ...input, collection: SOLUTION_REFERRAL_COLLECTION });
}
