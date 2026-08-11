import "server-only";

import { createHash, randomUUID } from "node:crypto";
import { normalizeEmail } from "@/lib/email";
import { getAdminFirestore } from "@/lib/firebase-admin";
import { getLeadRetentionExpiry } from "@/lib/operational-maintenance";
import type {
  CoachingConversationSummary,
  CoachingMessage,
  CoachingMessageAuthor,
} from "@/lib/coaching-conversation";

const COLLECTION = "coaching_conversations";
const MAX_MESSAGES = 200;

type StoredCoachingMessage = {
  author?: unknown;
  body?: unknown;
  created_at?: unknown;
  id?: unknown;
};

type StoredCoachingConversation = {
  created_at?: unknown;
  customer_email?: unknown;
  messages?: unknown;
  updated_at?: unknown;
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

function buildConversationId(email: string) {
  return createHash("sha256").update(normalizeEmail(email)).digest("hex");
}

function buildCustomerMessageId(idempotencyKey: string) {
  return createHash("sha256")
    .update(`coaching-message:${idempotencyKey}`)
    .digest("hex");
}

async function appendMessage(input: {
  author: CoachingMessageAuthor;
  body: string;
  conversationId: string;
  customerEmail?: string;
  messageId: string;
}) {
  const database = getAdminFirestore();
  const reference = database.collection(COLLECTION).doc(input.conversationId);

  return database.runTransaction(async (transaction) => {
    const snapshot = await transaction.get(reference);
    const existing = snapshot.data() as StoredCoachingConversation | undefined;
    const messages = parseMessages(existing?.messages);
    const duplicate = messages.find((message) => message.id === input.messageId);
    if (duplicate) return { created: false, message: duplicate } as const;

    const now = new Date().toISOString();
    const message: CoachingMessage = {
      author: input.author,
      body: cleanText(input.body, 2_000),
      createdAt: now,
      id: input.messageId,
    };
    const nextMessages = [...messages, message]
      .slice(-MAX_MESSAGES)
      .map(serializeMessage);

    transaction.set(reference, {
      created_at: typeof existing?.created_at === "string" ? existing.created_at : now,
      customer_email: input.customerEmail
        ? normalizeEmail(input.customerEmail)
        : cleanText(existing?.customer_email, 320).toLowerCase(),
      messages: nextMessages,
      retention_expires_at: getLeadRetentionExpiry(),
      updated_at: now,
    });

    return { created: true, message } as const;
  });
}

export async function getCustomerCoachingMessages(email: string) {
  const conversationId = buildConversationId(email);
  const snapshot = await getAdminFirestore()
    .collection(COLLECTION)
    .doc(conversationId)
    .get();
  const data = snapshot.data() as StoredCoachingConversation | undefined;
  return parseMessages(data?.messages);
}

export function appendCustomerCoachingMessage(input: {
  body: string;
  email: string;
  idempotencyKey: string;
}) {
  return appendMessage({
    author: "customer",
    body: input.body,
    conversationId: buildConversationId(input.email),
    customerEmail: input.email,
    messageId: buildCustomerMessageId(input.idempotencyKey),
  });
}

export async function getCoachingConversationForAdmin(conversationId: string) {
  const snapshot = await getAdminFirestore()
    .collection(COLLECTION)
    .doc(conversationId)
    .get();
  if (!snapshot.exists) return null;
  const data = snapshot.data() as StoredCoachingConversation | undefined;
  const customerEmail = cleanText(data?.customer_email, 320).toLowerCase();
  if (!customerEmail) return null;
  return {
    customerEmail,
    id: snapshot.id,
    messages: parseMessages(data?.messages),
  } as const;
}

export async function getCoachingConversationSummaries(limit = 100) {
  const snapshot = await getAdminFirestore()
    .collection(COLLECTION)
    .orderBy("updated_at", "desc")
    .limit(limit)
    .get();

  return snapshot.docs.flatMap((document) => {
    const data = document.data() as StoredCoachingConversation;
    const messages = parseMessages(data.messages);
    const lastMessage = messages.at(-1);
    const customerEmail = cleanText(data.customer_email, 320).toLowerCase();
    const updatedAt = cleanText(data.updated_at, 40);
    if (!customerEmail || !updatedAt || !lastMessage) return [];
    return [{
      customerEmail,
      id: document.id,
      lastMessage: lastMessage.body,
      updatedAt,
    } satisfies CoachingConversationSummary];
  });
}

export async function appendSpecialistCoachingMessage(input: {
  body: string;
  conversationId: string;
}) {
  const conversation = await getCoachingConversationForAdmin(input.conversationId);
  if (!conversation) return null;

  return appendMessage({
    author: "specialist",
    body: input.body,
    conversationId: input.conversationId,
    messageId: randomUUID(),
  });
}
