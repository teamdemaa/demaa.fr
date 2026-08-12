import "server-only";

import { createHash, randomBytes, timingSafeEqual } from "node:crypto";
import type { PersistableActionPlan } from "@/lib/action-plan-contract";
import { compatibleActionPlanSchema } from "@/lib/action-plan-contract";
import { isBlankManualActionPlan } from "@/lib/action-plan-manual";
import {
  createActionPlanWorkspaceState,
  normalizeActionPlanWorkspaceState,
  type ActionPlanWorkspaceState,
} from "@/lib/action-plan-workspace";
import { normalizeEmail } from "@/lib/email";
import { getAdminFirestore } from "@/lib/firebase-admin";
import { getLeadRetentionExpiry } from "@/lib/operational-maintenance";

export const ACTION_PLANS_COLLECTION = "action_plans";
export const ACTION_PLAN_ACCESS_COOKIE = "demaa_action_plan_access";

const PENDING_CLAIM_TTL_MS = 30 * 24 * 60 * 60 * 1000;
const MAX_SOURCE_TEXT_LENGTH = 12_000;

type ActionPlanStatus = "pending_claim" | "active" | "deleted";

type ActionPlanGenerationMetadata = {
  model: string | null;
  inputTokens: number | null;
  outputTokens: number | null;
  totalTokens: number | null;
};

type ActionPlanDocument = {
  schema_version?: string | null;
  status?: ActionPlanStatus | null;
  plan?: unknown;
  title?: string | null;
  workspace_state?: unknown;
  source_text?: string | null;
  generation?: Partial<ActionPlanGenerationMetadata> | null;
  owner_email?: string | null;
  pending_owner_email?: string | null;
  claim_secret_hash?: string | null;
  claim_link_token_hashes?: string[] | null;
  claim_expires_at?: string | null;
  temporary_access_token_hash?: string | null;
  temporary_access_expires_at?: string | null;
  revision?: number | null;
  created_at?: string | null;
  updated_at?: string | null;
  claimed_at?: string | null;
  retention_expires_at?: string | null;
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

export type ActionPlanWriteInput = {
  plan: PersistableActionPlan;
  title?: string | null;
  workspaceState?: ActionPlanWorkspaceState;
  sourceText?: string | null;
  generation?: Partial<ActionPlanGenerationMetadata> | null;
};

export type PendingActionPlan = {
  id: string;
  temporaryAccessToken: string;
  revision: number;
};

export function hashActionPlanClaimSecret(secret: string) {
  return createHash("sha256").update(secret).digest("hex");
}

export const hashActionPlanAccessToken = hashActionPlanClaimSecret;

export function getActionPlanAccessCookieOptions() {
  return {
    httpOnly: true,
    maxAge: PENDING_CLAIM_TTL_MS / 1000,
    path: "/",
    sameSite: "lax" as const,
    secure:
      process.env.NODE_ENV === "production" ||
      process.env.VERCEL_ENV === "preview" ||
      process.env.VERCEL_ENV === "production",
  };
}

function createOpaqueValue(bytes: number) {
  return randomBytes(bytes).toString("base64url");
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
  };
}

function getClaimExpiry(now = Date.now()) {
  return new Date(now + PENDING_CLAIM_TTL_MS).toISOString();
}

function safeHashEquals(left: string | null | undefined, right: string) {
  if (!left || left.length !== right.length) return false;
  return timingSafeEqual(Buffer.from(left), Buffer.from(right));
}

function hasValidTemporaryAccess(
  document: ActionPlanDocument | undefined,
  temporaryAccessToken?: string | null,
) {
  if (!document || document.status !== "pending_claim" || !temporaryAccessToken) {
    return false;
  }

  const expiresAt = Date.parse(document.temporary_access_expires_at || "");
  return (
    Number.isFinite(expiresAt) &&
    expiresAt >= Date.now() &&
    safeHashEquals(
      document.temporary_access_token_hash,
      hashActionPlanAccessToken(temporaryAccessToken),
    )
  );
}

function serializeWriteInput(input: ActionPlanWriteInput) {
  return {
    plan: input.plan,
    title: normalizeActionPlanTitle(input.title),
    workspace_state:
      input.workspaceState ?? createActionPlanWorkspaceState(input.plan),
    source_text: normalizeSourceText(input.sourceText),
    generation: normalizeGenerationMetadata(input.generation),
  };
}

function getPersistedSchemaVersion(plan: PersistableActionPlan) {
  return plan.version === "3" ? "3" : "2";
}

function parseStoredActionPlan(
  id: string,
  document: ActionPlanDocument | undefined,
  allowedStatus: ActionPlanStatus = "active",
): StoredActionPlan | null {
  if (!document || document.status !== allowedStatus) return null;

  const parsedPlan = compatibleActionPlanSchema.safeParse(document.plan);
  if (!parsedPlan.success) return null;

  const revision = Number(document.revision);
  if (!Number.isInteger(revision) || revision < 1) return null;

  const createdAt = document.created_at || "";
  const updatedAt = document.updated_at || createdAt;
  if (!createdAt || !updatedAt) return null;

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

export async function createPendingActionPlan(
  input: ActionPlanWriteInput,
): Promise<PendingActionPlan> {
  const database = getAdminFirestore();
  const id = createOpaqueValue(18);
  const temporaryAccessToken = createOpaqueValue(32);
  const now = new Date().toISOString();
  const temporaryAccessExpiresAt = getClaimExpiry();

  await database.collection(ACTION_PLANS_COLLECTION).doc(id).create({
    schema_version: getPersistedSchemaVersion(input.plan),
    status: "pending_claim",
    ...serializeWriteInput(input),
    owner_email: null,
    pending_owner_email: null,
    claim_secret_hash: null,
    claim_link_token_hashes: [],
    claim_expires_at: temporaryAccessExpiresAt,
    temporary_access_token_hash: hashActionPlanAccessToken(temporaryAccessToken),
    temporary_access_expires_at: temporaryAccessExpiresAt,
    revision: 1,
    created_at: now,
    updated_at: now,
    claimed_at: null,
    retention_expires_at: temporaryAccessExpiresAt,
  });

  return { id, temporaryAccessToken, revision: 1 };
}

export async function createOwnedActionPlan(
  email: string,
  input: ActionPlanWriteInput,
): Promise<StoredActionPlan> {
  const database = getAdminFirestore();
  const id = createOpaqueValue(18);
  const now = new Date().toISOString();
  const ownerEmail = normalizeEmail(email);

  const document: ActionPlanDocument = {
    schema_version: getPersistedSchemaVersion(input.plan),
    status: "active",
    ...serializeWriteInput(input),
    owner_email: ownerEmail,
    pending_owner_email: null,
    claim_secret_hash: null,
    claim_link_token_hashes: [],
    claim_expires_at: null,
    temporary_access_token_hash: null,
    temporary_access_expires_at: null,
    revision: 1,
    created_at: now,
    updated_at: now,
    claimed_at: now,
    retention_expires_at: getLeadRetentionExpiry(),
  };

  await database.collection(ACTION_PLANS_COLLECTION).doc(id).create(document);

  const stored = parseStoredActionPlan(id, document);
  if (!stored) throw new Error("Unable to parse the action plan after creation.");
  return stored;
}

export async function claimPendingActionPlanWithAccessToken(input: {
  email: string;
  id: string;
  temporaryAccessToken: string;
}) {
  const database = getAdminFirestore();
  const reference = database.collection(ACTION_PLANS_COLLECTION).doc(input.id);
  const ownerEmail = normalizeEmail(input.email);

  if (!ownerEmail || !input.temporaryAccessToken) return false;

  return database.runTransaction(async (transaction) => {
    const snapshot = await transaction.get(reference);
    const document = snapshot.data() as ActionPlanDocument | undefined;

    if (!snapshot.exists || !hasValidTemporaryAccess(document, input.temporaryAccessToken)) {
      return false;
    }

    const pendingOwner = normalizeEmail(document?.pending_owner_email || "");
    if (pendingOwner && pendingOwner !== ownerEmail) return false;

    const claimExpiresAt = Date.parse(document?.claim_expires_at || "");
    if (!Number.isFinite(claimExpiresAt) || claimExpiresAt < Date.now()) {
      return false;
    }

    const now = new Date().toISOString();
    transaction.set(
      reference,
      {
        status: "active",
        owner_email: ownerEmail,
        pending_owner_email: null,
        claim_secret_hash: null,
        claim_link_token_hashes: [],
        claim_expires_at: null,
        temporary_access_token_hash: null,
        temporary_access_expires_at: null,
        claimed_at: now,
        retention_expires_at: getLeadRetentionExpiry(),
        updated_at: now,
      },
      { merge: true },
    );

    return true;
  });
}

export async function getOwnedActionPlans(email: string) {
  const database = getAdminFirestore();
  const ownerEmail = normalizeEmail(email);
  const snapshot = await database
    .collection(ACTION_PLANS_COLLECTION)
    .where("owner_email", "==", ownerEmail)
    .get();

  return snapshot.docs
    .map((document) =>
      parseStoredActionPlan(
        document.id,
        document.data() as ActionPlanDocument | undefined,
      ),
    )
    .filter((plan): plan is StoredActionPlan => Boolean(plan))
    .sort((left, right) => Date.parse(right.updatedAt) - Date.parse(left.updatedAt));
}

export async function getOwnedActionPlan(email: string, id: string) {
  const database = getAdminFirestore();
  const document = await database.collection(ACTION_PLANS_COLLECTION).doc(id).get();
  const data = document.data() as ActionPlanDocument | undefined;

  if (
    !document.exists ||
    normalizeEmail(data?.owner_email || "") !== normalizeEmail(email)
  ) {
    return null;
  }

  return parseStoredActionPlan(document.id, data);
}

export async function getActionPlanForAccess(input: {
  email?: string | null;
  id: string;
  temporaryAccessToken?: string | null;
}) {
  const database = getAdminFirestore();
  const snapshot = await database
    .collection(ACTION_PLANS_COLLECTION)
    .doc(input.id)
    .get();
  const data = snapshot.data() as ActionPlanDocument | undefined;
  if (!snapshot.exists || !data) return null;

  if (
    data.status === "active" &&
    input.email &&
    normalizeEmail(data.owner_email || "") === normalizeEmail(input.email)
  ) {
    return parseStoredActionPlan(snapshot.id, data);
  }

  if (hasValidTemporaryAccess(data, input.temporaryAccessToken)) {
    return parseStoredActionPlan(snapshot.id, data, "pending_claim");
  }

  return null;
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

export async function updateOwnedActionPlanWorkspace(
  email: string,
  id: string,
  expectedRevision: number,
  workspaceState: ActionPlanWorkspaceState,
) {
  return updateActionPlanWorkspaceForAccess({
    email,
    id,
    expectedRevision,
    workspaceState,
  });
}

export async function updateActionPlanWorkspaceForAccess(input: {
  email?: string | null;
  generation?: Partial<ActionPlanGenerationMetadata> | null;
  id: string;
  expectedRevision: number;
  plan?: PersistableActionPlan;
  sourceText?: string | null;
  title?: string;
  temporaryAccessToken?: string | null;
  workspaceState: ActionPlanWorkspaceState;
}) {
  const database = getAdminFirestore();
  const ownerEmail = normalizeEmail(input.email || "");
  const reference = database.collection(ACTION_PLANS_COLLECTION).doc(input.id);

  return database.runTransaction(async (transaction) => {
    const snapshot = await transaction.get(reference);
    const data = snapshot.data() as ActionPlanDocument | undefined;
    const hasOwnedAccess = Boolean(
      snapshot.exists &&
        data?.status === "active" &&
        ownerEmail &&
        normalizeEmail(data.owner_email || "") === ownerEmail,
    );
    const hasTemporaryAccess =
      snapshot.exists &&
      hasValidTemporaryAccess(data, input.temporaryAccessToken);
    if (!hasOwnedAccess && !hasTemporaryAccess) {
      return null;
    }
    if (!data) return null;

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
        && input.plan.version === "3"
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
    transaction.set(
      reference,
      {
        ...(input.plan
          ? {
              plan: nextPlan,
              schema_version: getPersistedSchemaVersion(nextPlan),
            }
          : {}),
        ...(input.sourceText !== undefined
          ? { source_text: normalizeSourceText(input.sourceText) }
          : {}),
        ...(input.generation !== undefined
          ? { generation: normalizeGenerationMetadata(input.generation) }
          : {}),
        ...(input.title !== undefined ? { title: nextTitle } : {}),
        workspace_state: normalizedWorkspace,
        revision: nextRevision,
        updated_at: updatedAt,
        ...(hasOwnedAccess
          ? { retention_expires_at: getLeadRetentionExpiry() }
          : {}),
      },
      { merge: true },
    );

    return {
      revision: nextRevision,
      updatedAt,
      workspaceState: normalizedWorkspace,
      title: nextTitle,
    };
  });
}

export async function deleteActionPlanForAccess(input: {
  email?: string | null;
  id: string;
  expectedRevision: number;
  temporaryAccessToken?: string | null;
}) {
  const database = getAdminFirestore();
  const ownerEmail = normalizeEmail(input.email || "");
  const reference = database.collection(ACTION_PLANS_COLLECTION).doc(input.id);

  return database.runTransaction(async (transaction) => {
    const snapshot = await transaction.get(reference);
    const data = snapshot.data() as ActionPlanDocument | undefined;
    const hasOwnedAccess = Boolean(
      snapshot.exists &&
        data?.status === "active" &&
        ownerEmail &&
        normalizeEmail(data.owner_email || "") === ownerEmail,
    );
    const hasTemporaryAccess =
      snapshot.exists && hasValidTemporaryAccess(data, input.temporaryAccessToken);

    if (!hasOwnedAccess && !hasTemporaryAccess) return null;
    if (!data) return null;

    const revision = Number(data.revision);
    if (!Number.isInteger(revision) || revision !== input.expectedRevision) {
      throw new ActionPlanRevisionConflictError();
    }

    const now = new Date().toISOString();
    transaction.set(
      reference,
      {
        status: "deleted",
        revision: revision + 1,
        updated_at: now,
        retention_expires_at: getClaimExpiry(),
        temporary_access_token_hash: null,
        temporary_access_expires_at: null,
      },
      { merge: true },
    );

    return { deletedAt: now, revision: revision + 1 };
  });
}
