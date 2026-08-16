import "server-only";

import { createHash, randomUUID } from "node:crypto";
import { normalizeEmail } from "@/lib/email";
import { getAdminFirestore } from "@/lib/firebase-admin";
import { getLeadRetentionExpiry } from "@/lib/operational-maintenance";
import type {
  CoachingAccess,
  CoachingRecommendation,
  CoachingRecommendationStatus,
  CoachingConversationSummary,
  CoachingFreeStatus,
  CoachingMessage,
} from "@/lib/coaching-conversation";
import {
  getExternalRecommendationBySlug,
  isValidExternalRecommendationNeed,
} from "@/lib/external-recommendation-catalog.server";

const COLLECTION = "coaching_conversations";
const ACCESS_COLLECTION = "customer_coaching_access";
const MAX_MESSAGES = 200;
const MAX_RECOMMENDATIONS = 50;

type StoredCoachingMessage = {
  author?: unknown;
  body?: unknown;
  created_at?: unknown;
  id?: unknown;
};

type StoredCoachingConversation = {
  created_at?: unknown;
  customer_email?: unknown;
  owner_uid?: unknown;
  messages?: unknown;
  recommendations?: unknown;
  updated_at?: unknown;
  locale_code?: unknown;
  market_code?: unknown;
  country_code?: unknown;
  source?: unknown;
};

type StoredCoachingRecommendation = {
  created_at?: unknown;
  created_by?: unknown;
  id?: unknown;
  message_id?: unknown;
  need_key?: unknown;
  owner_uid?: unknown;
  requested_at?: unknown;
  resource_slug?: unknown;
  resource_snapshot?: unknown;
  resource_version?: unknown;
  source?: unknown;
  status?: unknown;
  system_slug?: unknown;
};

type StoredRecommendationSnapshot = {
  category?: unknown;
  connection_process?: unknown;
  description?: unknown;
  included?: unknown;
  limits?: unknown;
  name?: unknown;
  need_label?: unknown;
};

type StoredCoachingAccess = {
  free_status?: unknown;
  opened_at?: unknown;
};


function cleanText(value: unknown, maxLength: number) {
  return typeof value === "string"
    ? value.replace(/\r\n?/g, "\n").trim().slice(0, maxLength)
    : "";
}
function parseMessage(value: unknown): CoachingMessage | null {
  const candidate = value as StoredCoachingMessage | null;
  const author = candidate?.author;
  const body = cleanText(candidate?.body, 2_000);
  const createdAt = cleanText(candidate?.created_at, 40);
  const id = cleanText(candidate?.id, 100);

  if (
    (author !== "customer" && author !== "specialist")
    || !body
    || !createdAt
    || !id
  ) return null;

  return { author, body, createdAt, id };
}

function parseMessages(value: unknown) {
  if (!Array.isArray(value)) return [];
  return value
    .map(parseMessage)
    .filter((message): message is CoachingMessage => Boolean(message))
    .sort((left, right) => Date.parse(left.createdAt) - Date.parse(right.createdAt));
}

function serializeMessage(message: CoachingMessage) {
  return {
    author: message.author,
    body: message.body,
    created_at: message.createdAt,
    id: message.id,
  };
}

function cleanStringList(value: unknown, maximum = 6) {
  return Array.isArray(value)
    ? value.map((item) => cleanText(item, 300)).filter(Boolean).slice(0, maximum)
    : [];
}

function parseRecommendationStatus(value: unknown): CoachingRecommendationStatus {
  return value === "requested"
    || value === "connected"
    || value === "closed"
    || value === "withdrawn"
    ? value
    : "recommended";
}

function parseRecommendation(value: unknown): CoachingRecommendation | null {
  const candidate = value as StoredCoachingRecommendation | null;
  const snapshot = candidate?.resource_snapshot as StoredRecommendationSnapshot | undefined;
  const id = cleanText(candidate?.id, 100);
  const messageId = cleanText(candidate?.message_id, 100);
  const name = cleanText(snapshot?.name, 160);
  const category = cleanText(snapshot?.category, 160);
  const description = cleanText(snapshot?.description, 500);
  const connectionProcess = cleanText(snapshot?.connection_process, 800);
  const createdAt = cleanText(candidate?.created_at, 40);
  const resourceVersion = cleanText(candidate?.resource_version, 40);
  if (!id || !messageId || !name || !category || !description || !createdAt || !resourceVersion) {
    return null;
  }
  return {
    category,
    connectionProcess,
    createdAt,
    description,
    id,
    included: cleanStringList(snapshot?.included),
    limits: cleanStringList(snapshot?.limits),
    messageId,
    name,
    needKey: cleanText(candidate?.need_key, 40) || null,
    needLabel: cleanText(snapshot?.need_label, 80) || null,
    requestedAt: cleanText(candidate?.requested_at, 40) || null,
    resourceVersion,
    status: parseRecommendationStatus(candidate?.status),
  };
}

function parseRecommendations(value: unknown) {
  if (!Array.isArray(value)) return [];
  return value
    .map(parseRecommendation)
    .filter((item): item is CoachingRecommendation => Boolean(item))
    .sort((left, right) => Date.parse(left.createdAt) - Date.parse(right.createdAt));
}

function buildStoredRecommendation(input: {
  messageId: string;
  needKey?: string | null;
  ownerUid: string;
  resourceSlug: string;
  systemSlug?: string | null;
}) {
  const resource = getExternalRecommendationBySlug(input.resourceSlug);
  if (!resource || !resource.active || !isValidExternalRecommendationNeed(resource, input.needKey)) {
    throw new Error("Invalid external recommendation.");
  }
  const need = resource.needs.find((candidate) => candidate.key === input.needKey) ?? null;
  const now = new Date().toISOString();
  return {
    created_at: now,
    created_by: "team_demaa",
    id: randomUUID(),
    message_id: input.messageId,
    need_key: need?.key ?? null,
    owner_uid: input.ownerUid,
    requested_at: null,
    resource_slug: resource.slug,
    resource_snapshot: {
      category: resource.category,
      connection_process: resource.connectionProcess,
      description: resource.description,
      included: resource.included,
      limits: resource.limits,
      name: resource.name,
      need_label: need?.label ?? null,
    },
    resource_version: resource.version,
    source: "clarification_admin",
    status: "recommended" as const,
    system_slug: cleanText(input.systemSlug, 120) || null,
  };
}

function buildConversationId(uid: string) {
  return createHash("sha256").update(`coaching-conversation:${uid}`).digest("hex");
}

function buildCustomerMessageId(idempotencyKey: string) {
  return createHash("sha256")
    .update(`coaching-message:${idempotencyKey}`)
    .digest("hex");
}

function parseFreeStatus(value: unknown): CoachingFreeStatus {
  return value === "open" || value === "completed" ? value : "available";
}

function buildAccess(value: StoredCoachingAccess | undefined): CoachingAccess {
  const freeStatus = parseFreeStatus(value?.free_status);
  return {
    canSend: freeStatus !== "completed",
    freeStatus,
  };
}

export async function getCustomerCoachingMessages(uid: string) {
  const conversationId = buildConversationId(uid);
  const snapshot = await getAdminFirestore()
    .collection(COLLECTION)
    .doc(conversationId)
    .get();
  const data = snapshot.data() as StoredCoachingConversation | undefined;
  return parseMessages(data?.messages);
}

export async function getCustomerCoachingState(uid: string) {
  const normalizedUid = cleanText(uid, 160);
  const database = getAdminFirestore();
  const [conversationSnapshot, accessSnapshot] = await Promise.all([
    database.collection(COLLECTION).doc(buildConversationId(normalizedUid)).get(),
    database.collection(ACCESS_COLLECTION).doc(normalizedUid).get(),
  ]);
  const conversation = conversationSnapshot.data() as StoredCoachingConversation | undefined;
  return {
    access: buildAccess(accessSnapshot.data() as StoredCoachingAccess | undefined),
    messages: parseMessages(conversation?.messages),
    recommendations: parseRecommendations(conversation?.recommendations),
  } as const;
}

export function appendCustomerCoachingMessage(input: {
  body: string;
  email: string;
  idempotencyKey: string;
  uid: string;
  localeCode?: "fr" | "en";
  marketCode?: string;
  countryCode?: string | null;
  source?: string;
}) {
  const database = getAdminFirestore();
  const normalizedUid = cleanText(input.uid, 160);
  const conversationReference = database
    .collection(COLLECTION)
    .doc(buildConversationId(normalizedUid));
  const accessReference = database.collection(ACCESS_COLLECTION).doc(normalizedUid);
  const messageId = buildCustomerMessageId(input.idempotencyKey);

  return database.runTransaction(async (transaction) => {
    const conversationSnapshot = await transaction.get(conversationReference);
    const accessSnapshot = await transaction.get(accessReference);
    const existing = conversationSnapshot.data() as StoredCoachingConversation | undefined;
    const messages = parseMessages(existing?.messages);
    const duplicate = messages.find((message) => message.id === messageId);
    const access = buildAccess(accessSnapshot.data() as StoredCoachingAccess | undefined);
    if (duplicate) {
      return { access, allowed: true, created: false, message: duplicate } as const;
    }
    if (!access.canSend) return { access, allowed: false } as const;

    const now = new Date().toISOString();
    const message: CoachingMessage = {
      author: "customer",
      body: cleanText(input.body, 2_000),
      createdAt: now,
      id: messageId,
    };
    transaction.set(conversationReference, {
      created_at: typeof existing?.created_at === "string" ? existing.created_at : now,
      customer_email: normalizeEmail(input.email),
      locale_code: input.localeCode ?? "fr",
      market_code: cleanText(input.marketCode, 40) || "fr-fr",
      country_code: cleanText(input.countryCode, 2) || null,
      source: cleanText(input.source, 80) || "echange",
      owner_uid: normalizedUid,
      messages: [...messages, message].slice(-MAX_MESSAGES).map(serializeMessage),
      retention_expires_at: getLeadRetentionExpiry(),
      updated_at: now,
    });
    if (access.freeStatus === "available") {
      transaction.set(accessReference, {
        free_status: "open",
        opened_at: now,
        updated_at: now,
      }, { merge: true });
    }
    return {
      access: access.freeStatus === "available"
        ? { ...access, freeStatus: "open" as const }
        : access,
      allowed: true,
      created: true,
      message,
    } as const;
  });
}

export async function getCoachingConversationForAdmin(conversationId: string) {
  const database = getAdminFirestore();
  const snapshot = await database
    .collection(COLLECTION)
    .doc(conversationId)
    .get();
  if (!snapshot.exists) return null;
  const data = snapshot.data() as StoredCoachingConversation | undefined;
  const customerEmail = cleanText(data?.customer_email, 320).toLowerCase();
  if (!customerEmail) return null;
  const ownerUid = cleanText(data?.owner_uid, 160);
  const accessSnapshot = ownerUid
    ? await database.collection(ACCESS_COLLECTION).doc(ownerUid).get()
    : null;
  return {
    freeStatus: parseFreeStatus(accessSnapshot?.data()?.free_status),
    customerEmail,
    id: snapshot.id,
    messages: parseMessages(data?.messages),
    openedAt: cleanText(accessSnapshot?.data()?.opened_at, 40) || null,
    recommendations: parseRecommendations(data?.recommendations),
    ownerUid,
    localeCode: cleanText(data?.locale_code, 10) === "en" ? "en" : "fr",
    marketCode: cleanText(data?.market_code, 40) || "fr-fr",
    countryCode: cleanText(data?.country_code, 2) || null,
    source: cleanText(data?.source, 80) || "echange",
  } as const;
}

export async function getCoachingConversationSummaries(limit = 100) {
  const snapshot = await getAdminFirestore()
    .collection(COLLECTION)
    .orderBy("updated_at", "desc")
    .limit(limit)
    .get();

  return (await Promise.all(snapshot.docs.map(async (document) => {
    const data = document.data() as StoredCoachingConversation;
    const messages = parseMessages(data.messages);
    const lastMessage = messages.at(-1);
    const customerEmail = cleanText(data.customer_email, 320).toLowerCase();
    const updatedAt = cleanText(data.updated_at, 40);
    if (!customerEmail || !updatedAt || !lastMessage) return null;
    const ownerUid = cleanText(data.owner_uid, 160);
    const accessSnapshot = ownerUid
      ? await getAdminFirestore().collection(ACCESS_COLLECTION).doc(ownerUid).get()
      : null;
    const storedAccess = accessSnapshot?.data() as StoredCoachingAccess | undefined;
    return {
      customerEmail,
      freeStatus: parseFreeStatus(storedAccess?.free_status),
      id: document.id,
      lastMessage: lastMessage.body,
      openedAt: cleanText(storedAccess?.opened_at, 40) || null,
      updatedAt,
      localeCode: cleanText(data.locale_code, 10) === "en" ? "en" : "fr",
      marketCode: cleanText(data.market_code, 40) || "fr-fr",
      countryCode: cleanText(data.country_code, 2) || null,
      source: cleanText(data.source, 80) || "echange",
    } satisfies CoachingConversationSummary;
  }))).filter((value): value is CoachingConversationSummary => Boolean(value));
}

export async function appendSpecialistCoachingMessage(input: {
  body: string;
  completeFreeClarification?: boolean;
  conversationId: string;
  recommendation?: Readonly<{
    needKey?: string | null;
    resourceSlug: string;
    systemSlug?: string | null;
  }> | null;
}) {
  const database = getAdminFirestore();
  const conversationReference = database.collection(COLLECTION).doc(input.conversationId);
  return database.runTransaction(async (transaction) => {
    const snapshot = await transaction.get(conversationReference);
    if (!snapshot.exists) return null;
    const existing = snapshot.data() as StoredCoachingConversation | undefined;
    const ownerUid = cleanText(existing?.owner_uid, 160);
    if (!ownerUid) return null;
    const accessReference = database.collection(ACCESS_COLLECTION).doc(ownerUid);
    const accessSnapshot = await transaction.get(accessReference);
    const now = new Date().toISOString();
    const message: CoachingMessage = {
      author: "specialist",
      body: cleanText(input.body, 2_000),
      createdAt: now,
      id: randomUUID(),
    };
    const existingRecommendations = Array.isArray(existing?.recommendations)
      ? existing.recommendations
      : [];
    const recommendation = input.recommendation
      ? buildStoredRecommendation({
          messageId: message.id,
          needKey: input.recommendation.needKey,
          ownerUid,
          resourceSlug: input.recommendation.resourceSlug,
          systemSlug: input.recommendation.systemSlug,
        })
      : null;
    transaction.set(conversationReference, {
      created_at: typeof existing?.created_at === "string" ? existing.created_at : now,
      customer_email: cleanText(existing?.customer_email, 320).toLowerCase(),
      locale_code: cleanText(existing?.locale_code, 10) === "en" ? "en" : "fr",
      market_code: cleanText(existing?.market_code, 40) || "fr-fr",
      country_code: cleanText(existing?.country_code, 2) || null,
      source: cleanText(existing?.source, 80) || "echange",
      owner_uid: ownerUid,
      messages: [...parseMessages(existing?.messages), message]
        .slice(-MAX_MESSAGES)
        .map(serializeMessage),
      recommendations: recommendation
        ? [...existingRecommendations, recommendation].slice(-MAX_RECOMMENDATIONS)
        : existingRecommendations,
      retention_expires_at: getLeadRetentionExpiry(),
      updated_at: now,
    });
    const previousStatus = parseFreeStatus(accessSnapshot.data()?.free_status);
    const freeStatus = input.completeFreeClarification ? "completed" : previousStatus;
    if (input.completeFreeClarification) {
      transaction.set(accessReference, {
        completed_at: now,
        completed_by: "team_demaa",
        free_status: "completed",
        updated_at: now,
      }, { merge: true });
    }
    return {
      created: true,
      freeStatus,
      message,
      recommendation: recommendation ? parseRecommendation(recommendation) : null,
    } as const;
  });
}

export async function requestCoachingRecommendation(input: {
  recommendationId: string;
  uid: string;
}) {
  const uid = cleanText(input.uid, 160);
  const recommendationId = cleanText(input.recommendationId, 100);
  if (!uid || !recommendationId) return null;
  const database = getAdminFirestore();
  const conversationReference = database.collection(COLLECTION).doc(buildConversationId(uid));
  return database.runTransaction(async (transaction) => {
    const snapshot = await transaction.get(conversationReference);
    if (!snapshot.exists) return null;
    const existing = snapshot.data() as StoredCoachingConversation | undefined;
    if (cleanText(existing?.owner_uid, 160) !== uid) return null;
    const stored = Array.isArray(existing?.recommendations)
      ? existing.recommendations as StoredCoachingRecommendation[]
      : [];
    const index = stored.findIndex((item) => cleanText(item.id, 100) === recommendationId);
    if (index < 0) return null;
    const current = stored[index];
    const resource = getExternalRecommendationBySlug(current.resource_slug);
    if (!resource || !resource.active || parseRecommendationStatus(current.status) === "withdrawn") {
      return { available: false as const };
    }
    const parsed = parseRecommendation(current);
    if (!parsed) return null;
    if (parsed.status === "requested" || parsed.status === "connected" || parsed.status === "closed") {
      return { available: true as const, created: false, recommendation: parsed };
    }
    const now = new Date().toISOString();
    const next = stored.map((item, itemIndex) => itemIndex === index
      ? { ...item, requested_at: now, status: "requested" }
      : item);
    transaction.set(conversationReference, {
      recommendations: next,
      updated_at: now,
    }, { merge: true });
    return {
      available: true as const,
      created: true,
      recommendation: parseRecommendation(next[index]) as CoachingRecommendation,
    };
  });
}

export async function reopenFreeCoachingClarification(conversationId: string) {
  const database = getAdminFirestore();
  const conversationReference = database.collection(COLLECTION).doc(conversationId);
  return database.runTransaction(async (transaction) => {
    const conversationSnapshot = await transaction.get(conversationReference);
    if (!conversationSnapshot.exists) return null;
    const data = conversationSnapshot.data() as StoredCoachingConversation | undefined;
    const ownerUid = cleanText(data?.owner_uid, 160);
    if (!ownerUid) return null;
    const accessReference = database.collection(ACCESS_COLLECTION).doc(ownerUid);
    const accessSnapshot = await transaction.get(accessReference);
    const previousStatus = parseFreeStatus(accessSnapshot.data()?.free_status);
    if (previousStatus !== "completed") {
      return {
        freeStatus: previousStatus,
        openedAt: cleanText(accessSnapshot.data()?.opened_at, 40) || null,
        previousStatus,
        reopened: false as const,
      };
    }
    const now = new Date().toISOString();
    transaction.set(accessReference, {
      completed_at: null,
      completed_by: null,
      free_status: "open",
      reopened_at: now,
      reopened_by: "team_demaa",
      updated_at: now,
    }, { merge: true });
    return {
      freeStatus: "open" as const,
      openedAt: cleanText(accessSnapshot.data()?.opened_at, 40) || null,
      previousStatus,
      reopened: true as const,
    };
  });
}
