import "server-only";

import { createHash, randomBytes } from "node:crypto";
import type { PersistableActionPlan } from "@/lib/action-plan-contract";
import { compatibleActionPlanSchema } from "@/lib/action-plan-contract";
import { isBlankManualActionPlan } from "@/lib/action-plan-manual";
import {
  createActionPlanWorkspaceState,
  normalizeActionPlanWorkspaceState,
  type ActionPlanWorkspaceState,
} from "@/lib/action-plan-workspace";
import {
  ensureDefaultCompanyForIdentity,
  getActiveDefaultCompanyIdentity,
  getActiveDefaultCompanyIdentityInTransaction,
} from "@/lib/company-membership.server";
import type { CustomerSessionIdentity } from "@/lib/customer-space-auth";
import { getAdminFirestore } from "@/lib/firebase-admin";
import { getLeadRetentionExpiry } from "@/lib/operational-maintenance";

export const ACTION_PLANS_COLLECTION = "action_plans";

export type ActionPlanStatus = "generating" | "active" | "failed" | "deleted";

const ACTION_PLAN_GENERATION_LEASE_MS = 3 * 60 * 1_000;
export const MAX_ACTION_PLAN_GENERATION_ATTEMPTS = 3;

type ActionPlanGenerationMetadata = {
  model: string | null;
  inputTokens: number | null;
  outputTokens: number | null;
  totalTokens: number | null;
  durationMs: number | null;
  requestCount: number | null;
  repairCount: number | null;
};

type ActionPlanDocument = {
  schema_version?: string | null;
  status?: ActionPlanStatus | null;
  plan?: unknown;
  title?: string | null;
  workspace_state?: unknown;
  source_text?: string | null;
  generation?: Partial<ActionPlanGenerationMetadata> | null;
  company_id?: string | null;
  owner_uid?: string | null;
  created_by_uid?: string | null;
  updated_by_uid?: string | null;
  revision?: number | null;
  created_at?: string | null;
  updated_at?: string | null;
  retention_expires_at?: string | null;
  request_fingerprint?: string | null;
  attempt_count?: number | null;
  generation_started_at?: string | null;
  generation_target_title?: string | null;
  lease_owner?: string | null;
  lease_expires_at?: string | null;
  next_retry_at?: string | null;
  last_error_code?: string | null;
};

export type StoredActionPlan = {
  id: string;
  title: string;
  plan: PersistableActionPlan;
  workspaceState: ActionPlanWorkspaceState;
  sourceText: string | null;
  generation: ActionPlanGenerationMetadata;
  revision: number;
  createdAt: string;
  updatedAt: string;
};

export type ActionPlanIndexEntry = {
  id: string;
  status: "active" | "failed" | "generating";
  title: string;
  updatedAt: string;
};

export type ActionPlanWriteInput = {
  plan: PersistableActionPlan;
  title?: string | null;
  workspaceState?: ActionPlanWorkspaceState;
  sourceText?: string | null;
  generation?: Partial<ActionPlanGenerationMetadata> | null;
};

export type ActionPlanGenerationState =
  | { status: "generating"; id: string; attemptCount: number; leaseExpiresAt: string }
  | { status: "active"; id: string; actionPlan: StoredActionPlan }
  | { status: "failed"; id: string; attemptCount: number; canRetry: boolean };

export type ActionPlanWorkspacePageData = {
  generationState: ActionPlanGenerationState | null;
  plans: ActionPlanIndexEntry[];
};

export type ActionPlanGenerationClaim = {
  id: string;
  leaseOwner: string;
  situation: string;
  title?: string;
};

export type ActionPlanGenerationStartResult =
  | { kind: "claimed"; claim: ActionPlanGenerationClaim }
  | { kind: "existing"; state: ActionPlanGenerationState };

export class ActionPlanGenerationRequestConflictError extends Error {
  constructor() {
    super("action_plan_generation_request_conflict");
    this.name = "ActionPlanGenerationRequestConflictError";
  }
}

const MAX_SOURCE_TEXT_LENGTH = 12_000;

function createActionPlanId() {
  return randomBytes(18).toString("base64url");
}

function digest(value: string) {
  return createHash("sha256").update(value).digest("base64url");
}

export function buildActionPlanGenerationId(uid: string, requestId: string) {
  return `apl_${digest(`action-plan-generation:${uid.trim()}:${requestId.trim()}`).slice(0, 40)}`;
}

export function buildActionPlanGenerationFingerprint(situation: string) {
  return digest(`action-plan-situation:${normalizeSourceText(situation) ?? ""}`);
}

function normalizeSourceText(value?: string | null) {
  if (typeof value !== "string") return null;
  const normalized = value.replace(/\r\n?/g, "\n").trim();
  return normalized ? normalized.slice(0, MAX_SOURCE_TEXT_LENGTH) : null;
}

function normalizeActionPlanTitle(value?: string | null) {
  if (typeof value !== "string") return "Plan principal";
  const normalized = value.replace(/\s+/g, " ").trim().slice(0, 120);
  return normalized || "Plan principal";
}

function normalizeTokenCount(value: unknown) {
  return typeof value === "number" && Number.isInteger(value) && value >= 0
    ? value
    : null;
}

function normalizeGenerationMetadata(
  value?: Partial<ActionPlanGenerationMetadata> | null,
): ActionPlanGenerationMetadata {
  const model = typeof value?.model === "string" ? value.model.trim().slice(0, 120) : "";
  return {
    model: model || null,
    inputTokens: normalizeTokenCount(value?.inputTokens),
    outputTokens: normalizeTokenCount(value?.outputTokens),
    totalTokens: normalizeTokenCount(value?.totalTokens),
    durationMs: normalizeTokenCount(value?.durationMs),
    requestCount: normalizeTokenCount(value?.requestCount),
    repairCount: normalizeTokenCount(value?.repairCount),
  };
}

function serializeWriteInput(input: ActionPlanWriteInput) {
  return {
    plan: input.plan,
    title: normalizeActionPlanTitle(input.title),
    workspace_state: input.workspaceState ?? createActionPlanWorkspaceState(input.plan),
    source_text: normalizeSourceText(input.sourceText),
    generation: normalizeGenerationMetadata(input.generation),
  };
}

function getPersistedSchemaVersion(plan: PersistableActionPlan) {
  if (plan.version === "4") return "4";
  return plan.version === "3" ? "3" : "2";
}

function parseStoredActionPlan(
  id: string,
  document: ActionPlanDocument | undefined,
): StoredActionPlan | null {
  if (!document || document.status !== "active") return null;
  const parsedPlan = compatibleActionPlanSchema.safeParse(document.plan);
  if (!parsedPlan.success) return null;

  const revision = Number(document.revision);
  const createdAt = document.created_at || "";
  const updatedAt = document.updated_at || createdAt;
  if (!Number.isInteger(revision) || revision < 1 || !createdAt || !updatedAt) return null;

  return {
    id,
    title: normalizeActionPlanTitle(document.title),
    plan: parsedPlan.data,
    workspaceState: normalizeActionPlanWorkspaceState(
      parsedPlan.data,
      document.workspace_state,
    ),
    sourceText: normalizeSourceText(document.source_text),
    generation: normalizeGenerationMetadata(document.generation),
    revision,
    createdAt,
    updatedAt,
  };
}

function belongsToCompany(
  document: ActionPlanDocument | undefined,
  companyId: string,
) {
  return Boolean(
    companyId
    && document?.company_id?.trim() === companyId,
  );
}

function isActivePlanForCompany(
  document: ActionPlanDocument | undefined,
  companyId: string,
) {
  return document?.status === "active" && belongsToCompany(document, companyId);
}

function normalizeAttemptCount(value: unknown) {
  return typeof value === "number" && Number.isInteger(value) && value >= 0
    ? value
    : 0;
}

function getGenerationRetentionExpiry(now: Date) {
  return new Date(now.getTime() + 30 * 24 * 60 * 60 * 1_000).toISOString();
}

function parseGenerationState(
  id: string,
  document: ActionPlanDocument | undefined,
): ActionPlanGenerationState | null {
  if (!document) return null;
  const attemptCount = normalizeAttemptCount(document.attempt_count);
  if (document.status === "active") {
    const actionPlan = parseStoredActionPlan(id, document);
    return actionPlan ? { status: "active", id, actionPlan } : null;
  }
  if (document.status === "generating" && document.lease_expires_at) {
    return {
      status: "generating",
      id,
      attemptCount,
      leaseExpiresAt: document.lease_expires_at,
    };
  }
  if (document.status === "failed") {
    return {
      status: "failed",
      id,
      attemptCount,
      canRetry: attemptCount < MAX_ACTION_PLAN_GENERATION_ATTEMPTS,
    };
  }
  return null;
}

function parseActionPlanIndexEntry(
  id: string,
  data: ActionPlanDocument | undefined,
): ActionPlanIndexEntry | null {
  if (!data || data.status === "deleted") return null;
  if (data.status === "active") {
    const plan = parseStoredActionPlan(id, data);
    return plan ? {
      id: plan.id,
      status: "active",
      title: plan.title,
      updatedAt: plan.updatedAt,
    } : null;
  }
  if (data.status !== "generating" && data.status !== "failed") return null;
  const updatedAt = typeof data.updated_at === "string"
    ? data.updated_at
    : typeof data.created_at === "string"
      ? data.created_at
      : "";
  return {
    id,
    status: data.status,
    title: normalizeActionPlanTitle(data.title),
    updatedAt,
  };
}

function parseActionPlanIndex(
  documents: readonly {
    id: string;
    data(): unknown;
  }[],
) {
  return documents
    .map((document) => parseActionPlanIndexEntry(
      document.id,
      document.data() as ActionPlanDocument | undefined,
    ))
    .filter((entry): entry is ActionPlanIndexEntry => Boolean(entry))
    .sort((left, right) => Date.parse(right.updatedAt) - Date.parse(left.updatedAt));
}

export async function beginActionPlanGeneration(input: {
  identity: CustomerSessionIdentity;
  requestId: string;
  situation: string;
  now?: Date;
}): Promise<ActionPlanGenerationStartResult> {
  const uid = input.identity.uid.trim();
  const requestId = input.requestId.trim();
  const situation = normalizeSourceText(input.situation);
  if (!uid || !/^[A-Za-z0-9:_-]{16,160}$/.test(requestId) || !situation) {
    throw new Error("A valid generation request is required.");
  }

  const company = await ensureDefaultCompanyForIdentity(input.identity);
  const database = getAdminFirestore();
  const id = buildActionPlanGenerationId(uid, requestId);
  const reference = database.collection(ACTION_PLANS_COLLECTION).doc(id);
  const fingerprint = buildActionPlanGenerationFingerprint(situation);
  const now = input.now ?? new Date();
  const nowIso = now.toISOString();

  return database.runTransaction(async (transaction) => {
    const snapshot = await transaction.get(reference);
    const existing = snapshot.data() as ActionPlanDocument | undefined;
    const previousAttemptCount = normalizeAttemptCount(existing?.attempt_count);

    if (snapshot.exists) {
      if (
        !belongsToCompany(existing, company.companyId)
        || existing?.owner_uid !== uid
        || existing.request_fingerprint !== fingerprint
        || existing.status === "deleted"
      ) {
        throw new ActionPlanGenerationRequestConflictError();
      }

      if (existing.status === "active") {
        const state = parseGenerationState(id, existing);
        if (!state) throw new Error("The stored action plan is invalid.");
        return { kind: "existing", state };
      }

      const leaseExpiresAt = Date.parse(existing.lease_expires_at ?? "");
      if (
        existing.status === "generating"
        && existing.lease_owner
        && Number.isFinite(leaseExpiresAt)
        && leaseExpiresAt > now.getTime()
      ) {
        const state = parseGenerationState(id, existing);
        if (!state) throw new Error("The action plan generation state is invalid.");
        return { kind: "existing", state };
      }

      if (previousAttemptCount >= MAX_ACTION_PLAN_GENERATION_ATTEMPTS) {
        return {
          kind: "existing",
          state: {
            status: "failed",
            id,
            attemptCount: previousAttemptCount,
            canRetry: false,
          },
        };
      }
    }

    const attemptCount = previousAttemptCount + 1;
    const leaseOwner = randomBytes(18).toString("base64url");
    const leaseExpiresAt = new Date(
      now.getTime() + ACTION_PLAN_GENERATION_LEASE_MS,
    ).toISOString();
    transaction.set(reference, {
      schema_version: "generation-1",
      status: "generating",
      plan: null,
      title: "Plan en cours de création",
      workspace_state: null,
      source_text: situation,
      generation: null,
      company_id: company.companyId,
      owner_uid: uid,
      created_by_uid: uid,
      updated_by_uid: uid,
      revision: 0,
      created_at: existing?.created_at || nowIso,
      updated_at: nowIso,
      retention_expires_at: getGenerationRetentionExpiry(now),
      request_fingerprint: fingerprint,
      attempt_count: attemptCount,
      generation_started_at: nowIso,
      generation_target_title: null,
      lease_owner: leaseOwner,
      lease_expires_at: leaseExpiresAt,
      next_retry_at: null,
      last_error_code: null,
    });

    return {
      kind: "claimed",
      claim: { id, leaseOwner, situation },
    };
  });
}

export async function resumeActionPlanGenerationForAccess(input: {
  identity: CustomerSessionIdentity;
  id: string;
  now?: Date;
}): Promise<ActionPlanGenerationStartResult | null> {
  const uid = input.identity.uid.trim();
  if (!uid) return null;

  const database = getAdminFirestore();
  const reference = database.collection(ACTION_PLANS_COLLECTION).doc(input.id);
  const now = input.now ?? new Date();
  const nowIso = now.toISOString();

  return database.runTransaction(async (transaction) => {
    const [company, snapshot] = await Promise.all([
      getActiveDefaultCompanyIdentityInTransaction(transaction, uid),
      transaction.get(reference),
    ]);
    const existing = snapshot.data() as ActionPlanDocument | undefined;
    if (
      !company
      || !snapshot.exists
      || !existing
      || !belongsToCompany(existing, company.companyId)
      || existing.status === "deleted"
    ) {
      return null;
    }

    if (existing.status === "active") {
      const state = parseGenerationState(input.id, existing);
      return state ? { kind: "existing", state } : null;
    }

    const situation = normalizeSourceText(existing.source_text);
    if (
      !situation
      || existing.request_fingerprint !== buildActionPlanGenerationFingerprint(situation)
    ) {
      return null;
    }

    const previousAttemptCount = normalizeAttemptCount(existing.attempt_count);
    const leaseExpiresAt = Date.parse(existing.lease_expires_at ?? "");
    if (
      existing.status === "generating"
      && existing.lease_owner
      && Number.isFinite(leaseExpiresAt)
      && leaseExpiresAt > now.getTime()
    ) {
      const state = parseGenerationState(input.id, existing);
      return state ? { kind: "existing", state } : null;
    }

    if (previousAttemptCount >= MAX_ACTION_PLAN_GENERATION_ATTEMPTS) {
      return {
        kind: "existing",
        state: {
          status: "failed",
          id: input.id,
          attemptCount: previousAttemptCount,
          canRetry: false,
        },
      };
    }

    const attemptCount = previousAttemptCount + 1;
    const leaseOwner = randomBytes(18).toString("base64url");
    const nextLeaseExpiresAt = new Date(
      now.getTime() + ACTION_PLAN_GENERATION_LEASE_MS,
    ).toISOString();
    transaction.set(reference, {
      ...existing,
      status: "generating",
      updated_by_uid: uid,
      updated_at: nowIso,
      retention_expires_at: getGenerationRetentionExpiry(now),
      attempt_count: attemptCount,
      generation_started_at: nowIso,
      lease_owner: leaseOwner,
      lease_expires_at: nextLeaseExpiresAt,
      next_retry_at: null,
      last_error_code: null,
    });

    return {
      kind: "claimed",
      claim: {
        id: input.id,
        leaseOwner,
        situation,
        ...(existing.generation_target_title
          ? { title: normalizeActionPlanTitle(existing.generation_target_title) }
          : {}),
      },
    };
  });
}

export async function beginExistingBlankActionPlanGeneration(input: {
  identity: CustomerSessionIdentity;
  id: string;
  expectedRevision: number;
  situation: string;
  now?: Date;
}): Promise<ActionPlanGenerationStartResult | null> {
  const uid = input.identity.uid.trim();
  const situation = normalizeSourceText(input.situation);
  if (!uid || !situation) throw new Error("A valid generation request is required.");

  const database = getAdminFirestore();
  const reference = database.collection(ACTION_PLANS_COLLECTION).doc(input.id);
  const now = input.now ?? new Date();
  const nowIso = now.toISOString();
  const fingerprint = buildActionPlanGenerationFingerprint(situation);

  return database.runTransaction(async (transaction) => {
    const [company, snapshot] = await Promise.all([
      getActiveDefaultCompanyIdentityInTransaction(transaction, uid),
      transaction.get(reference),
    ]);
    const existing = snapshot.data() as ActionPlanDocument | undefined;
    if (
      !company
      || !snapshot.exists
      || !existing
      || !belongsToCompany(existing, company.companyId)
      || existing.status === "deleted"
    ) return null;

    if (existing.request_fingerprint === fingerprint) {
      const existingState = parseGenerationState(input.id, existing);
      if (existingState) return { kind: "existing", state: existingState };
    }

    if (existing.status !== "active") {
      throw new ActionPlanGenerationRequestConflictError();
    }
    const parsedPlan = compatibleActionPlanSchema.safeParse(existing.plan);
    if (!parsedPlan.success) return null;
    const workspace = normalizeActionPlanWorkspaceState(
      parsedPlan.data,
      existing.workspace_state,
    );
    if (!isBlankManualActionPlan(parsedPlan.data, workspace)) {
      throw new InvalidActionPlanMutationError();
    }

    const revision = Number(existing.revision);
    if (!Number.isInteger(revision) || revision !== input.expectedRevision) {
      throw new ActionPlanRevisionConflictError();
    }

    const leaseOwner = randomBytes(18).toString("base64url");
    const leaseExpiresAt = new Date(
      now.getTime() + ACTION_PLAN_GENERATION_LEASE_MS,
    ).toISOString();
    const title = normalizeActionPlanTitle(existing.title);
    transaction.set(reference, {
      ...existing,
      status: "generating",
      source_text: situation,
      generation: null,
      updated_by_uid: uid,
      updated_at: nowIso,
      retention_expires_at: getGenerationRetentionExpiry(now),
      request_fingerprint: fingerprint,
      attempt_count: 1,
      generation_started_at: nowIso,
      generation_target_title: title,
      lease_owner: leaseOwner,
      lease_expires_at: leaseExpiresAt,
      next_retry_at: null,
      last_error_code: null,
    });

    return {
      kind: "claimed",
      claim: { id: input.id, leaseOwner, situation, title },
    };
  });
}

export async function completeActionPlanGeneration(input: {
  identity: CustomerSessionIdentity;
  claim: ActionPlanGenerationClaim;
  plan: PersistableActionPlan;
  generation?: Partial<ActionPlanGenerationMetadata> | null;
  now?: Date;
}) {
  const uid = input.identity.uid.trim();
  const database = getAdminFirestore();
  const reference = database.collection(ACTION_PLANS_COLLECTION).doc(input.claim.id);
  const now = (input.now ?? new Date()).toISOString();

  return database.runTransaction(async (transaction) => {
    const [company, snapshot] = await Promise.all([
      getActiveDefaultCompanyIdentityInTransaction(transaction, uid),
      transaction.get(reference),
    ]);
    const document = snapshot.data() as ActionPlanDocument | undefined;
    if (
      !company
      || !snapshot.exists
      || !belongsToCompany(document, company.companyId)
      || document?.status !== "generating"
      || document.lease_owner !== input.claim.leaseOwner
    ) {
      return null;
    }

    const serialized = serializeWriteInput({
      plan: input.plan,
      title: input.claim.title,
      sourceText: input.claim.situation,
      generation: input.generation,
    });
    const nextDocument: ActionPlanDocument = {
      ...document,
      ...serialized,
      schema_version: getPersistedSchemaVersion(input.plan),
      status: "active",
      updated_by_uid: uid,
      revision: 1,
      updated_at: now,
      retention_expires_at: getLeadRetentionExpiry(),
      generation_target_title: null,
      lease_owner: null,
      lease_expires_at: null,
      next_retry_at: null,
      last_error_code: null,
    };
    transaction.set(reference, nextDocument);
    return parseStoredActionPlan(input.claim.id, nextDocument);
  });
}

export async function failActionPlanGeneration(input: {
  identity: CustomerSessionIdentity;
  claim: ActionPlanGenerationClaim;
  errorCode: string;
  now?: Date;
}) {
  const uid = input.identity.uid.trim();
  const database = getAdminFirestore();
  const reference = database.collection(ACTION_PLANS_COLLECTION).doc(input.claim.id);
  const now = (input.now ?? new Date()).toISOString();

  return database.runTransaction(async (transaction) => {
    const [company, snapshot] = await Promise.all([
      getActiveDefaultCompanyIdentityInTransaction(transaction, uid),
      transaction.get(reference),
    ]);
    const document = snapshot.data() as ActionPlanDocument | undefined;
    if (
      !company
      || !snapshot.exists
      || !belongsToCompany(document, company.companyId)
      || document?.status !== "generating"
      || document.lease_owner !== input.claim.leaseOwner
    ) {
      return null;
    }

    const attemptCount = normalizeAttemptCount(document.attempt_count);
    const nextDocument: ActionPlanDocument = {
      ...document,
      status: "failed",
      updated_by_uid: uid,
      updated_at: now,
      lease_owner: null,
      lease_expires_at: null,
      next_retry_at: attemptCount < MAX_ACTION_PLAN_GENERATION_ATTEMPTS ? now : null,
      last_error_code: input.errorCode.trim().slice(0, 80) || "generation_failed",
    };
    transaction.set(reference, nextDocument);
    return parseGenerationState(input.claim.id, nextDocument);
  });
}

export async function getActionPlanGenerationForAccess(input: {
  id: string;
  uid: string;
}) {
  const company = await getActiveDefaultCompanyIdentity(input.uid);
  if (!company) return null;
  const snapshot = await getAdminFirestore()
    .collection(ACTION_PLANS_COLLECTION)
    .doc(input.id)
    .get();
  const document = snapshot.data() as ActionPlanDocument | undefined;
  if (!snapshot.exists || !belongsToCompany(document, company.companyId)) return null;
  return parseGenerationState(snapshot.id, document);
}

export async function createOwnedActionPlanForIdentity(
  identity: CustomerSessionIdentity,
  input: ActionPlanWriteInput,
): Promise<StoredActionPlan> {
  const uid = identity.uid.trim();
  if (!uid) throw new Error("A Firebase UID is required.");

  const database = getAdminFirestore();
  const company = await ensureDefaultCompanyForIdentity(identity);
  const id = createActionPlanId();
  const now = new Date().toISOString();
  const document: ActionPlanDocument = {
    schema_version: getPersistedSchemaVersion(input.plan),
    status: "active",
    ...serializeWriteInput(input),
    company_id: company.companyId,
    owner_uid: uid,
    created_by_uid: uid,
    updated_by_uid: uid,
    revision: 1,
    created_at: now,
    updated_at: now,
    retention_expires_at: getLeadRetentionExpiry(),
  };

  await database.collection(ACTION_PLANS_COLLECTION).doc(id).create(document);
  const stored = parseStoredActionPlan(id, document);
  if (!stored) throw new Error("Unable to parse the action plan after creation.");
  return stored;
}

export async function getOwnedActionPlansForIdentity(identity: CustomerSessionIdentity) {
  const company = await getActiveDefaultCompanyIdentity(identity.uid);
  if (!company) throw new Error("The active company context is unavailable.");

  const snapshot = await getAdminFirestore()
    .collection(ACTION_PLANS_COLLECTION)
    .where("company_id", "==", company.companyId)
    .get();

  return snapshot.docs
    .map((document) => parseStoredActionPlan(
      document.id,
      document.data() as ActionPlanDocument | undefined,
    ))
    .filter((plan): plan is StoredActionPlan => Boolean(plan))
    .sort((left, right) => Date.parse(right.updatedAt) - Date.parse(left.updatedAt));
}

export async function getActionPlanIndexForIdentity(
  identity: CustomerSessionIdentity,
): Promise<ActionPlanIndexEntry[]> {
  const company = await getActiveDefaultCompanyIdentity(identity.uid);
  if (!company) throw new Error("The active company context is unavailable.");

  const snapshot = await getAdminFirestore()
    .collection(ACTION_PLANS_COLLECTION)
    .where("company_id", "==", company.companyId)
    .get();

  return parseActionPlanIndex(snapshot.docs);
}

export async function getActionPlanWorkspacePageForIdentity(
  identity: CustomerSessionIdentity,
  id: string,
): Promise<ActionPlanWorkspacePageData> {
  const company = await getActiveDefaultCompanyIdentity(identity.uid);
  if (!company) return { generationState: null, plans: [] };

  const collection = getAdminFirestore().collection(ACTION_PLANS_COLLECTION);
  const [planSnapshot, indexSnapshot] = await Promise.all([
    collection.doc(id).get(),
    collection.where("company_id", "==", company.companyId).get(),
  ]);
  const document = planSnapshot.data() as ActionPlanDocument | undefined;
  const generationState = planSnapshot.exists
    && belongsToCompany(document, company.companyId)
    ? parseGenerationState(planSnapshot.id, document)
    : null;

  return {
    generationState,
    plans: parseActionPlanIndex(indexSnapshot.docs),
  };
}

export async function getActionPlanForAccess(input: { id: string; uid: string }) {
  const company = await getActiveDefaultCompanyIdentity(input.uid);
  if (!company) return null;
  const snapshot = await getAdminFirestore()
    .collection(ACTION_PLANS_COLLECTION)
    .doc(input.id)
    .get();
  const data = snapshot.data() as ActionPlanDocument | undefined;
  if (!snapshot.exists || !isActivePlanForCompany(data, company.companyId)) return null;
  return parseStoredActionPlan(snapshot.id, data);
}

export class ActionPlanRevisionConflictError extends Error {
  constructor() {
    super("action_plan_revision_conflict");
    this.name = "ActionPlanRevisionConflictError";
  }
}

export class InvalidActionPlanMutationError extends Error {
  constructor() {
    super("invalid_action_plan_mutation");
    this.name = "InvalidActionPlanMutationError";
  }
}

function preserveRetiredWorkspaceStrategyFields(
  storedValue: unknown,
  nextValue: ActionPlanWorkspaceState,
) {
  const persisted = structuredClone(nextValue) as Record<string, unknown>;
  if (!storedValue || typeof storedValue !== "object" || Array.isArray(storedValue)) {
    return persisted;
  }
  const stored = storedValue as Record<string, unknown>;
  if ("strategyOverrides" in stored) persisted.strategyOverrides = stored.strategyOverrides;
  if (Array.isArray(stored.addedActions) && Array.isArray(persisted.addedActions)) {
    const pillars = new Map(stored.addedActions.flatMap((action) => {
      if (!action || typeof action !== "object" || Array.isArray(action)) return [];
      const record = action as Record<string, unknown>;
      return typeof record.id === "string" && "strategyPillar" in record
        ? [[record.id, record.strategyPillar] as const]
        : [];
    }));
    persisted.addedActions = persisted.addedActions.map((action) => {
      if (!action || typeof action !== "object" || Array.isArray(action)) return action;
      const record = action as Record<string, unknown>;
      return typeof record.id === "string" && pillars.has(record.id)
        ? { ...record, strategyPillar: pillars.get(record.id) }
        : record;
    });
  }
  return persisted;
}

function preserveRetiredManualStrategyFields(
  storedValue: unknown,
  nextValue: PersistableActionPlan,
) {
  if (nextValue.version !== "manual" || !storedValue || typeof storedValue !== "object" || Array.isArray(storedValue)) {
    return nextValue;
  }
  const stored = storedValue as Record<string, unknown>;
  const persisted = structuredClone(nextValue) as Record<string, unknown>;
  if ("strategy" in stored) persisted.strategy = stored.strategy;
  if (Array.isArray(stored.weeklyActions) && Array.isArray(persisted.weeklyActions)) {
    const pillars = new Map(stored.weeklyActions.flatMap((action) => {
      if (!action || typeof action !== "object" || Array.isArray(action)) return [];
      const record = action as Record<string, unknown>;
      return typeof record.id === "string" && "strategyPillar" in record
        ? [[record.id, record.strategyPillar] as const]
        : [];
    }));
    persisted.weeklyActions = persisted.weeklyActions.map((action) => {
      if (!action || typeof action !== "object" || Array.isArray(action)) return action;
      const record = action as Record<string, unknown>;
      return typeof record.id === "string" && pillars.has(record.id)
        ? { ...record, strategyPillar: pillars.get(record.id) }
        : record;
    });
  }
  return persisted;
}

export async function updateActionPlanWorkspaceForAccess(input: {
  uid: string;
  generation?: Partial<ActionPlanGenerationMetadata> | null;
  id: string;
  expectedRevision: number;
  plan?: PersistableActionPlan;
  sourceText?: string | null;
  title?: string;
  workspaceState: ActionPlanWorkspaceState;
}) {
  const database = getAdminFirestore();
  const reference = database.collection(ACTION_PLANS_COLLECTION).doc(input.id);

  return database.runTransaction(async (transaction) => {
    const [company, snapshot] = await Promise.all([
      getActiveDefaultCompanyIdentityInTransaction(transaction, input.uid),
      transaction.get(reference),
    ]);
    const data = snapshot.data() as ActionPlanDocument | undefined;
    if (
      !company
      || !snapshot.exists
      || !isActivePlanForCompany(data, company.companyId)
      || !data
    ) {
      return null;
    }

    const parsedPlan = compatibleActionPlanSchema.safeParse(data.plan);
    if (!parsedPlan.success) return null;
    const storedWorkspace = normalizeActionPlanWorkspaceState(
      parsedPlan.data,
      data.workspace_state,
    );
    const nextPlan = input.plan ?? parsedPlan.data;
    const nextTitle = input.title === undefined
      ? normalizeActionPlanTitle(data.title)
      : normalizeActionPlanTitle(input.title);
    if (input.plan) {
      const keepsManualVersion =
        parsedPlan.data.version === "manual" && input.plan.version === "manual";
      const generatesFromBlankManual =
        parsedPlan.data.version === "manual"
        && input.plan.version === "4"
        && isBlankManualActionPlan(parsedPlan.data, storedWorkspace);
      if (!keepsManualVersion && !generatesFromBlankManual) {
        throw new InvalidActionPlanMutationError();
      }
    }

    const revision = Number(data.revision);
    if (!Number.isInteger(revision) || revision !== input.expectedRevision) {
      throw new ActionPlanRevisionConflictError();
    }

    const nextRevision = revision + 1;
    const updatedAt = new Date().toISOString();
    const normalizedWorkspace = normalizeActionPlanWorkspaceState(
      nextPlan,
      input.workspaceState,
    );
    const persistedWorkspace = preserveRetiredWorkspaceStrategyFields(
      data.workspace_state,
      normalizedWorkspace,
    );
    transaction.set(reference, {
      ...(input.plan ? {
        plan: preserveRetiredManualStrategyFields(data.plan, nextPlan),
        schema_version: getPersistedSchemaVersion(nextPlan),
      } : {}),
      ...(input.sourceText !== undefined
        ? { source_text: normalizeSourceText(input.sourceText) }
        : {}),
      ...(input.generation !== undefined
        ? { generation: normalizeGenerationMetadata(input.generation) }
        : {}),
      ...(input.title !== undefined ? { title: nextTitle } : {}),
      workspace_state: persistedWorkspace,
      revision: nextRevision,
      updated_by_uid: input.uid,
      retention_expires_at: getLeadRetentionExpiry(),
      updated_at: updatedAt,
    }, { merge: true });

    return {
      revision: nextRevision,
      updatedAt,
      workspaceState: normalizedWorkspace,
      title: nextTitle,
    };
  });
}

export async function deleteActionPlanForAccess(input: {
  uid: string;
  id: string;
  expectedRevision: number;
}) {
  const database = getAdminFirestore();
  const reference = database.collection(ACTION_PLANS_COLLECTION).doc(input.id);

  return database.runTransaction(async (transaction) => {
    const [company, snapshot] = await Promise.all([
      getActiveDefaultCompanyIdentityInTransaction(transaction, input.uid),
      transaction.get(reference),
    ]);
    const data = snapshot.data() as ActionPlanDocument | undefined;
    if (
      !company
      || !snapshot.exists
      || !isActivePlanForCompany(data, company.companyId)
      || !data
    ) {
      return null;
    }

    const revision = Number(data.revision);
    if (!Number.isInteger(revision) || revision !== input.expectedRevision) {
      throw new ActionPlanRevisionConflictError();
    }

    const now = new Date().toISOString();
    transaction.set(reference, {
      status: "deleted",
      revision: revision + 1,
      updated_by_uid: input.uid,
      retention_expires_at: getLeadRetentionExpiry(),
      updated_at: now,
    }, { merge: true });

    return { deletedAt: now, revision: revision + 1 };
  });
}
