import "server-only";

import { createHash, randomBytes, timingSafeEqual } from "node:crypto";
import type { PersistableActionPlan } from "@/lib/action-plan-contract";
import { compatibleActionPlanSchema } from "@/lib/action-plan-contract";
import {
  createActionPlanWorkspaceState,
  normalizeActionPlanWorkspaceState,
  type ActionPlanWorkspaceState,
} from "@/lib/action-plan-workspace";
import {
  normalizeActionPlanLocaleContext,
  type ActionPlanContentLocaleCode,
  type ActionPlanCreationMarketCode,
} from "@/lib/action-plan-localization";
import { getAdminFirestore } from "@/lib/firebase-admin";

export const GUEST_ACTION_PLAN_GENERATIONS_COLLECTION = "guest_action_plan_generations";
export const GUEST_ACTION_PLAN_TTL_MS = 24 * 60 * 60 * 1_000;
export const MAX_GUEST_ACTION_PLAN_GENERATION_ATTEMPTS = 3;

const GUEST_GENERATION_LEASE_MS = 3 * 60 * 1_000;
const MAX_SOURCE_TEXT_LENGTH = 4_000;

type GenerationMetadata = {
  model: string | null;
  inputTokens: number | null;
  outputTokens: number | null;
  totalTokens: number | null;
  durationMs: number | null;
  requestCount: number | null;
  repairCount: number | null;
};

type GuestGenerationDocument = {
  schema_version?: string | null;
  status?: "generating" | "active" | "failed" | null;
  access_key_hash?: string | null;
  request_fingerprint?: string | null;
  source_text?: string | null;
  title?: string | null;
  plan?: unknown;
  workspace_state?: unknown;
  generation?: Partial<GenerationMetadata> | null;
  revision?: number | null;
  attempt_count?: number | null;
  lease_owner?: string | null;
  lease_expires_at?: string | null;
  last_error_code?: string | null;
  content_locale_code?: ActionPlanContentLocaleCode | null;
  market_code_at_creation?: ActionPlanCreationMarketCode | null;
  created_at?: string | null;
  updated_at?: string | null;
  expires_at?: string | null;
};

type StorageDependencies = {
  database?: ReturnType<typeof getAdminFirestore>;
};

export type StoredGuestActionPlan = {
  id: string;
  title: string;
  plan: PersistableActionPlan;
  workspaceState: ActionPlanWorkspaceState;
  sourceText: string;
  generation: GenerationMetadata;
  revision: number;
  contentLocaleCode: ActionPlanContentLocaleCode;
  marketCodeAtCreation: ActionPlanCreationMarketCode;
  createdAt: string;
  updatedAt: string;
  expiresAt: string;
};

export type GuestActionPlanGenerationState =
  | {
    status: "generating";
    id: string;
    attemptCount: number;
    leaseExpiresAt: string;
    expiresAt: string;
  }
  | {
    status: "active";
    id: string;
    actionPlan: StoredGuestActionPlan;
    expiresAt: string;
  }
  | {
    status: "failed";
    id: string;
    attemptCount: number;
    canRetry: boolean;
    expiresAt: string;
  };

export type GuestActionPlanGenerationClaim = {
  id: string;
  leaseOwner: string;
  situation: string;
  contentLocaleCode: ActionPlanContentLocaleCode;
  marketCodeAtCreation: ActionPlanCreationMarketCode;
};

export type GuestActionPlanGenerationStartResult =
  | { kind: "claimed"; claim: GuestActionPlanGenerationClaim }
  | { kind: "existing"; state: GuestActionPlanGenerationState };

export class GuestActionPlanGenerationConflictError extends Error {
  constructor() {
    super("guest_action_plan_generation_conflict");
    this.name = "GuestActionPlanGenerationConflictError";
  }
}

export class GuestActionPlanGenerationExpiredError extends Error {
  constructor() {
    super("guest_action_plan_generation_expired");
    this.name = "GuestActionPlanGenerationExpiredError";
  }
}

function digest(value: string) {
  return createHash("sha256").update(value).digest("base64url");
}

export function buildGuestActionPlanGenerationId(requestId: string) {
  return `gpl_${digest(`guest-action-plan:${requestId.trim()}`).slice(0, 40)}`;
}

export function hashGuestActionPlanAccessKey(accessKey: string) {
  return digest(`guest-action-plan-access:${accessKey.trim()}`);
}

function hasAccess(document: GuestGenerationDocument | undefined, accessKey: string) {
  const stored = document?.access_key_hash;
  const candidate = hashGuestActionPlanAccessKey(accessKey);
  if (!stored || stored.length !== candidate.length) return false;
  return timingSafeEqual(Buffer.from(stored), Buffer.from(candidate));
}

function normalizeSourceText(value: unknown) {
  if (typeof value !== "string") return null;
  const normalized = value.replace(/\r\n?/g, "\n").trim();
  return normalized ? normalized.slice(0, MAX_SOURCE_TEXT_LENGTH) : null;
}

function normalizeTitle(value: unknown, localeCode: ActionPlanContentLocaleCode) {
  if (typeof value === "string") {
    const normalized = value.replace(/\s+/g, " ").trim().slice(0, 120);
    if (normalized) return normalized;
  }
  return localeCode === "en" ? "Action plan" : "Plan d’action";
}

function normalizeCount(value: unknown) {
  return typeof value === "number" && Number.isInteger(value) && value >= 0
    ? value
    : null;
}

function normalizeGeneration(value: GuestGenerationDocument["generation"]): GenerationMetadata {
  const model = typeof value?.model === "string" ? value.model.trim().slice(0, 120) : "";
  return {
    model: model || null,
    inputTokens: normalizeCount(value?.inputTokens),
    outputTokens: normalizeCount(value?.outputTokens),
    totalTokens: normalizeCount(value?.totalTokens),
    durationMs: normalizeCount(value?.durationMs),
    requestCount: normalizeCount(value?.requestCount),
    repairCount: normalizeCount(value?.repairCount),
  };
}

function normalizeAttemptCount(value: unknown) {
  return typeof value === "number" && Number.isInteger(value) && value >= 0 ? value : 0;
}

function isExpired(document: GuestGenerationDocument | undefined, now: Date) {
  const expiresAt = Date.parse(document?.expires_at ?? "");
  return !Number.isFinite(expiresAt) || expiresAt <= now.getTime();
}

function fingerprint(
  situation: string,
  context: {
    contentLocaleCode: ActionPlanContentLocaleCode;
    marketCodeAtCreation: ActionPlanCreationMarketCode;
  },
) {
  return digest([
    "guest-action-plan-situation",
    context.contentLocaleCode,
    context.marketCodeAtCreation,
    situation,
  ].join(":"));
}

function parseStoredPlan(
  id: string,
  document: GuestGenerationDocument | undefined,
): StoredGuestActionPlan | null {
  if (!document || document.status !== "active") return null;
  const parsedPlan = compatibleActionPlanSchema.safeParse(document.plan);
  if (!parsedPlan.success) return null;
  const revision = Number(document.revision);
  const sourceText = normalizeSourceText(document.source_text);
  const createdAt = document.created_at ?? "";
  const updatedAt = document.updated_at ?? "";
  const expiresAt = document.expires_at ?? "";
  if (
    !Number.isInteger(revision)
    || revision < 1
    || !sourceText
    || !createdAt
    || !updatedAt
    || !expiresAt
  ) return null;
  const locale = normalizeActionPlanLocaleContext({
    contentLocaleCode: document.content_locale_code,
    marketCodeAtCreation: document.market_code_at_creation,
  });
  return {
    id,
    title: normalizeTitle(document.title, locale.contentLocaleCode),
    plan: parsedPlan.data,
    workspaceState: normalizeActionPlanWorkspaceState(
      parsedPlan.data,
      document.workspace_state,
    ),
    sourceText,
    generation: normalizeGeneration(document.generation),
    revision,
    ...locale,
    createdAt,
    updatedAt,
    expiresAt,
  };
}

function parseState(
  id: string,
  document: GuestGenerationDocument | undefined,
): GuestActionPlanGenerationState | null {
  const expiresAt = document?.expires_at ?? "";
  if (!document || !expiresAt) return null;
  const attemptCount = normalizeAttemptCount(document.attempt_count);
  if (document.status === "active") {
    const actionPlan = parseStoredPlan(id, document);
    return actionPlan ? { status: "active", id, actionPlan, expiresAt } : null;
  }
  if (document.status === "generating" && document.lease_expires_at) {
    return {
      status: "generating",
      id,
      attemptCount,
      leaseExpiresAt: document.lease_expires_at,
      expiresAt,
    };
  }
  if (document.status === "failed") {
    return {
      status: "failed",
      id,
      attemptCount,
      canRetry: attemptCount < MAX_GUEST_ACTION_PLAN_GENERATION_ATTEMPTS,
      expiresAt,
    };
  }
  return null;
}

function assertInput(requestId: string, accessKey: string, situation: unknown) {
  const normalizedRequestId = requestId.trim();
  const normalizedAccessKey = accessKey.trim();
  const normalizedSituation = normalizeSourceText(situation);
  if (
    !/^[A-Za-z0-9:_-]{16,160}$/.test(normalizedRequestId)
    || !/^[A-Za-z0-9_-]{43,86}$/.test(normalizedAccessKey)
    || !normalizedSituation
  ) throw new Error("A valid guest generation request is required.");
  return { normalizedRequestId, normalizedAccessKey, normalizedSituation };
}

export async function beginGuestActionPlanGeneration(input: {
  requestId: string;
  accessKey: string;
  situation: string;
  contentLocaleCode: ActionPlanContentLocaleCode;
  marketCodeAtCreation: ActionPlanCreationMarketCode;
  now?: Date;
}, dependencies: StorageDependencies = {}): Promise<GuestActionPlanGenerationStartResult> {
  const { normalizedRequestId, normalizedAccessKey, normalizedSituation } = assertInput(
    input.requestId,
    input.accessKey,
    input.situation,
  );
  const locale = normalizeActionPlanLocaleContext(input);
  const id = buildGuestActionPlanGenerationId(normalizedRequestId);
  const database = dependencies.database ?? getAdminFirestore();
  const reference = database.collection(GUEST_ACTION_PLAN_GENERATIONS_COLLECTION).doc(id);
  const now = input.now ?? new Date();
  const nowIso = now.toISOString();
  const requestFingerprint = fingerprint(normalizedSituation, locale);

  return database.runTransaction(async (transaction) => {
    const snapshot = await transaction.get(reference);
    const existing = snapshot.data() as GuestGenerationDocument | undefined;
    if (snapshot.exists) {
      if (
        !hasAccess(existing, normalizedAccessKey)
        || existing?.request_fingerprint !== requestFingerprint
      ) throw new GuestActionPlanGenerationConflictError();
      if (isExpired(existing, now)) throw new GuestActionPlanGenerationExpiredError();
      if (existing?.status === "active") {
        const state = parseState(id, existing);
        if (!state) throw new Error("The stored guest action plan is invalid.");
        return { kind: "existing", state };
      }
      const leaseExpiresAt = Date.parse(existing?.lease_expires_at ?? "");
      if (
        existing?.status === "generating"
        && existing.lease_owner
        && Number.isFinite(leaseExpiresAt)
        && leaseExpiresAt > now.getTime()
      ) {
        const state = parseState(id, existing);
        if (!state) throw new Error("The guest generation state is invalid.");
        return { kind: "existing", state };
      }
      if (normalizeAttemptCount(existing?.attempt_count) >= MAX_GUEST_ACTION_PLAN_GENERATION_ATTEMPTS) {
        const state = parseState(id, existing);
        if (!state) throw new Error("The guest generation state is invalid.");
        return { kind: "existing", state };
      }
    }

    const leaseOwner = randomBytes(18).toString("base64url");
    const leaseExpiresAt = new Date(now.getTime() + GUEST_GENERATION_LEASE_MS).toISOString();
    const expiresAt = existing?.expires_at
      ?? new Date(now.getTime() + GUEST_ACTION_PLAN_TTL_MS).toISOString();
    const attemptCount = normalizeAttemptCount(existing?.attempt_count) + 1;
    const nextDocument: GuestGenerationDocument = {
      schema_version: "guest-generation-1",
      status: "generating",
      access_key_hash: hashGuestActionPlanAccessKey(normalizedAccessKey),
      request_fingerprint: requestFingerprint,
      source_text: normalizedSituation,
      title: locale.contentLocaleCode === "en" ? "Plan being created" : "Plan en cours de création",
      plan: null,
      workspace_state: null,
      generation: null,
      revision: 0,
      attempt_count: attemptCount,
      lease_owner: leaseOwner,
      lease_expires_at: leaseExpiresAt,
      last_error_code: null,
      content_locale_code: locale.contentLocaleCode,
      market_code_at_creation: locale.marketCodeAtCreation,
      created_at: existing?.created_at ?? nowIso,
      updated_at: nowIso,
      expires_at: expiresAt,
    };
    transaction.set(reference, nextDocument);
    return {
      kind: "claimed",
      claim: { id, leaseOwner, situation: normalizedSituation, ...locale },
    };
  });
}

export async function getGuestActionPlanGenerationForAccess(input: {
  id: string;
  accessKey: string;
  now?: Date;
}, dependencies: StorageDependencies = {}) {
  const snapshot = await (dependencies.database ?? getAdminFirestore())
    .collection(GUEST_ACTION_PLAN_GENERATIONS_COLLECTION)
    .doc(input.id)
    .get();
  const document = snapshot.data() as GuestGenerationDocument | undefined;
  const now = input.now ?? new Date();
  if (!snapshot.exists || !hasAccess(document, input.accessKey) || isExpired(document, now)) return null;
  return parseState(snapshot.id, document);
}

export async function resumeGuestActionPlanGeneration(input: {
  id: string;
  accessKey: string;
  now?: Date;
}, dependencies: StorageDependencies = {}): Promise<GuestActionPlanGenerationStartResult | null> {
  const database = dependencies.database ?? getAdminFirestore();
  const reference = database.collection(GUEST_ACTION_PLAN_GENERATIONS_COLLECTION).doc(input.id);
  const now = input.now ?? new Date();
  const nowIso = now.toISOString();
  return database.runTransaction(async (transaction) => {
    const snapshot = await transaction.get(reference);
    const existing = snapshot.data() as GuestGenerationDocument | undefined;
    if (!snapshot.exists || !hasAccess(existing, input.accessKey) || isExpired(existing, now)) return null;
    if (existing?.status === "active") {
      const state = parseState(input.id, existing);
      return state ? { kind: "existing", state } : null;
    }
    const situation = normalizeSourceText(existing?.source_text);
    if (!situation) return null;
    const leaseExpiresAt = Date.parse(existing?.lease_expires_at ?? "");
    if (
      existing?.status === "generating"
      && existing.lease_owner
      && Number.isFinite(leaseExpiresAt)
      && leaseExpiresAt > now.getTime()
    ) {
      const state = parseState(input.id, existing);
      return state ? { kind: "existing", state } : null;
    }
    const attemptCount = normalizeAttemptCount(existing?.attempt_count);
    if (attemptCount >= MAX_GUEST_ACTION_PLAN_GENERATION_ATTEMPTS) {
      const state = parseState(input.id, existing);
      return state ? { kind: "existing", state } : null;
    }
    const locale = normalizeActionPlanLocaleContext({
      contentLocaleCode: existing?.content_locale_code,
      marketCodeAtCreation: existing?.market_code_at_creation,
    });
    const leaseOwner = randomBytes(18).toString("base64url");
    const nextLeaseExpiresAt = new Date(now.getTime() + GUEST_GENERATION_LEASE_MS).toISOString();
    const nextDocument: GuestGenerationDocument = {
      ...existing,
      status: "generating",
      attempt_count: attemptCount + 1,
      lease_owner: leaseOwner,
      lease_expires_at: nextLeaseExpiresAt,
      last_error_code: null,
      updated_at: nowIso,
    };
    transaction.set(reference, nextDocument);
    return {
      kind: "claimed",
      claim: { id: input.id, leaseOwner, situation, ...locale },
    };
  });
}

export async function completeGuestActionPlanGeneration(input: {
  claim: GuestActionPlanGenerationClaim;
  title?: string;
  plan: PersistableActionPlan;
  generation?: Partial<GenerationMetadata> | null;
  now?: Date;
}, dependencies: StorageDependencies = {}) {
  const database = dependencies.database ?? getAdminFirestore();
  const reference = database.collection(GUEST_ACTION_PLAN_GENERATIONS_COLLECTION).doc(input.claim.id);
  const now = input.now ?? new Date();
  return database.runTransaction(async (transaction) => {
    const snapshot = await transaction.get(reference);
    const existing = snapshot.data() as GuestGenerationDocument | undefined;
    if (
      !snapshot.exists
      || existing?.status !== "generating"
      || existing.lease_owner !== input.claim.leaseOwner
      || isExpired(existing, now)
    ) return null;
    const nextDocument: GuestGenerationDocument = {
      ...existing,
      schema_version: input.plan.version,
      status: "active",
      title: normalizeTitle(input.title, input.claim.contentLocaleCode),
      plan: input.plan,
      workspace_state: createActionPlanWorkspaceState(input.plan),
      generation: normalizeGeneration(input.generation),
      revision: 1,
      lease_owner: null,
      lease_expires_at: null,
      last_error_code: null,
      updated_at: now.toISOString(),
    };
    transaction.set(reference, nextDocument);
    return parseStoredPlan(input.claim.id, nextDocument);
  });
}

export async function failGuestActionPlanGeneration(input: {
  claim: GuestActionPlanGenerationClaim;
  errorCode: string;
  now?: Date;
}, dependencies: StorageDependencies = {}) {
  const database = dependencies.database ?? getAdminFirestore();
  const reference = database.collection(GUEST_ACTION_PLAN_GENERATIONS_COLLECTION).doc(input.claim.id);
  const now = input.now ?? new Date();
  return database.runTransaction(async (transaction) => {
    const snapshot = await transaction.get(reference);
    const existing = snapshot.data() as GuestGenerationDocument | undefined;
    if (
      !snapshot.exists
      || existing?.status !== "generating"
      || existing.lease_owner !== input.claim.leaseOwner
      || isExpired(existing, now)
    ) return null;
    const nextDocument: GuestGenerationDocument = {
      ...existing,
      status: "failed",
      lease_owner: null,
      lease_expires_at: null,
      last_error_code: input.errorCode.trim().slice(0, 80) || "generation_failed",
      updated_at: now.toISOString(),
    };
    transaction.set(reference, nextDocument);
    return parseState(input.claim.id, nextDocument);
  });
}
