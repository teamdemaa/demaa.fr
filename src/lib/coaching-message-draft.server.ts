import "server-only";

import { createHash, randomBytes } from "node:crypto";
import { isCoachingMessageDraftToken } from "@/lib/coaching-message-draft";
import { isValidEmail, normalizeEmail } from "@/lib/email";
import { getAdminFirestore } from "@/lib/firebase-admin";

const COLLECTION = "coaching_message_drafts";
export const COACHING_MESSAGE_DRAFT_TTL_MS = 60 * 60 * 1000;

type StoredCoachingMessageDraft = {
  body?: unknown;
  claimed_at?: unknown;
  claimed_email?: unknown;
  created_at?: unknown;
  delivery_idempotency_key?: unknown;
  expires_at?: unknown;
  sent_at?: unknown;
  updated_at?: unknown;
};

export type ClaimedCoachingMessageDraft = Readonly<{
  alreadySent: boolean;
  body: string;
  idempotencyKey: string;
}>;

function hashDraftToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

function cleanStoredText(value: unknown, maxLength: number) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

function parseClaimedDraft(
  value: StoredCoachingMessageDraft | undefined,
): ClaimedCoachingMessageDraft | null {
  const body = cleanStoredText(value?.body, 2_000);
  const idempotencyKey = cleanStoredText(
    value?.delivery_idempotency_key,
    220,
  );
  if (!body || !/^[A-Za-z0-9:_-]{8,220}$/.test(idempotencyKey)) return null;

  return {
    alreadySent: typeof value?.sent_at === "string" && Boolean(value.sent_at),
    body,
    idempotencyKey,
  };
}

export async function createPendingCoachingMessageDraft(input: {
  body: string;
}) {
  const body = input.body.replace(/\r\n?/g, "\n").trim().slice(0, 2_000);
  if (body.length < 2) {
    throw new Error("A coaching message draft requires at least two characters.");
  }

  const draftToken = randomBytes(32).toString("base64url");
  const tokenHash = hashDraftToken(draftToken);
  const now = new Date().toISOString();
  const expiresAt = new Date(
    Date.now() + COACHING_MESSAGE_DRAFT_TTL_MS,
  ).toISOString();

  await getAdminFirestore().collection(COLLECTION).doc(tokenHash).create({
    body,
    claimed_at: null,
    claimed_email: null,
    created_at: now,
    delivery_idempotency_key: `coaching:draft:${tokenHash}`,
    expires_at: expiresAt,
    sent_at: null,
    updated_at: now,
  });

  return { draftToken, expiresAt } as const;
}

export async function claimPendingCoachingMessageDraft(input: {
  draftToken: string;
  email: string;
}): Promise<ClaimedCoachingMessageDraft | null> {
  if (!isCoachingMessageDraftToken(input.draftToken)) return null;
  const email = normalizeEmail(input.email);
  if (!isValidEmail(email)) return null;

  const database = getAdminFirestore();
  const reference = database
    .collection(COLLECTION)
    .doc(hashDraftToken(input.draftToken));

  return database.runTransaction(async (transaction) => {
    const snapshot = await transaction.get(reference);
    const stored = snapshot.data() as StoredCoachingMessageDraft | undefined;
    if (!snapshot.exists || !stored) return null;

    const expiresAt = Date.parse(cleanStoredText(stored.expires_at, 40));
    if (!Number.isFinite(expiresAt) || expiresAt < Date.now()) return null;

    const claimedEmail = normalizeEmail(
      cleanStoredText(stored.claimed_email, 320),
    );
    if (claimedEmail && claimedEmail !== email) return null;

    const parsed = parseClaimedDraft(stored);
    if (!parsed) return null;

    if (!claimedEmail) {
      const now = new Date().toISOString();
      transaction.set(
        reference,
        {
          claimed_at: now,
          claimed_email: email,
          updated_at: now,
        },
        { merge: true },
      );
    }

    return parsed;
  });
}

export async function markCoachingMessageDraftSent(input: {
  draftToken: string;
  email: string;
}) {
  if (!isCoachingMessageDraftToken(input.draftToken)) return false;
  const email = normalizeEmail(input.email);
  if (!isValidEmail(email)) return false;

  const database = getAdminFirestore();
  const reference = database
    .collection(COLLECTION)
    .doc(hashDraftToken(input.draftToken));

  return database.runTransaction(async (transaction) => {
    const snapshot = await transaction.get(reference);
    const stored = snapshot.data() as StoredCoachingMessageDraft | undefined;
    if (
      !snapshot.exists
      || !stored
      || normalizeEmail(cleanStoredText(stored.claimed_email, 320)) !== email
    ) {
      return false;
    }

    if (typeof stored.sent_at === "string" && stored.sent_at) return true;

    const now = new Date().toISOString();
    transaction.set(
      reference,
      { sent_at: now, updated_at: now },
      { merge: true },
    );
    return true;
  });
}
