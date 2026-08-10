import "server-only";

import { createHash, randomBytes } from "node:crypto";
import type { ActionPlan } from "@/lib/action-plan-contract";
import { compatibleActionPlanSchema } from "@/lib/action-plan-contract";
import {
  createActionPlanWorkspaceState,
  normalizeActionPlanWorkspaceState,
  type ActionPlanWorkspaceState,
} from "@/lib/action-plan-workspace";
import { normalizeEmail } from "@/lib/email";
import { getAdminFirestore } from "@/lib/firebase-admin";
import { getLeadRetentionExpiry } from "@/lib/operational-maintenance";

export const ACTION_PLANS_COLLECTION = "action_plans";

const PENDING_CLAIM_TTL_MS = 60 * 60 * 1000;
const MAX_SOURCE_TEXT_LENGTH = 12_000;

type ActionPlanStatus = "pending_claim" | "active";

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
  workspace_state?: unknown;
  source_text?: string | null;
  generation?: Partial<ActionPlanGenerationMetadata> | null;
  owner_email?: string | null;
  pending_owner_email?: string | null;
  claim_secret_hash?: string | null;
  claim_link_token_hashes?: string[] | null;
  claim_expires_at?: string | null;
  revision?: number | null;
  created_at?: string | null;
  updated_at?: string | null;
  claimed_at?: string | null;
  retention_expires_at?: string | null;
};

export type StoredActionPlan = {
  id: string;
  plan: ActionPlan;
  workspaceState: ActionPlanWorkspaceState;
  sourceText: string | null;
  generation: ActionPlanGenerationMetadata;
  revision: number;
  createdAt: string;
  updatedAt: string;
};

export type ActionPlanWriteInput = {
  plan: ActionPlan;
  workspaceState?: ActionPlanWorkspaceState;
  sourceText?: string | null;
  generation?: Partial<ActionPlanGenerationMetadata> | null;
};

export type PendingActionPlan = {
  id: string;
  claimSecret: string;
  revision: number;
};

export function hashActionPlanClaimSecret(secret: string) {
  return createHash("sha256").update(secret).digest("hex");
}

function createOpaqueValue(bytes: number) {
  return randomBytes(bytes).toString("base64url");
}

function normalizeSourceText(value?: string | null) {
  if (typeof value !== "string") return null;
  const normalized = value.replace(/\r\n?/g, "\n").trim();
  return normalized ? normalized.slice(0, MAX_SOURCE_TEXT_LENGTH) : null;
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

function serializeWriteInput(input: ActionPlanWriteInput) {
  return {
    plan: input.plan,
    workspace_state:
      input.workspaceState ?? createActionPlanWorkspaceState(input.plan),
    source_text: normalizeSourceText(input.sourceText),
    generation: normalizeGenerationMetadata(input.generation),
  };
}

function parseStoredActionPlan(
  id: string,
  document: ActionPlanDocument | undefined,
): StoredActionPlan | null {
  if (!document || document.status !== "active") return null;

  const parsedPlan = compatibleActionPlanSchema.safeParse(document.plan);
  if (!parsedPlan.success) return null;

  const revision = Number(document.revision);
  if (!Number.isInteger(revision) || revision < 1) return null;

  const createdAt = document.created_at || "";
  const updatedAt = document.updated_at || createdAt;
  if (!createdAt || !updatedAt) return null;

  return {
    id,
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
  const claimSecret = createOpaqueValue(32);
  const now = new Date().toISOString();

  await database.collection(ACTION_PLANS_COLLECTION).doc(id).create({
    schema_version: "2",
    status: "pending_claim",
    ...serializeWriteInput(input),
    owner_email: null,
    pending_owner_email: null,
    claim_secret_hash: hashActionPlanClaimSecret(claimSecret),
    claim_link_token_hashes: [],
    claim_expires_at: getClaimExpiry(),
    revision: 1,
    created_at: now,
    updated_at: now,
    claimed_at: null,
    retention_expires_at: getClaimExpiry(),
  });

  return { id, claimSecret, revision: 1 };
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
    schema_version: "2",
    status: "active",
    ...serializeWriteInput(input),
    owner_email: ownerEmail,
    pending_owner_email: null,
    claim_secret_hash: null,
    claim_link_token_hashes: [],
    claim_expires_at: null,
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

export class ActionPlanRevisionConflictError extends Error {
  constructor() {
    super("action_plan_revision_conflict");
    this.name = "ActionPlanRevisionConflictError";
  }
}

export async function updateOwnedActionPlanWorkspace(
  email: string,
  id: string,
  expectedRevision: number,
  workspaceState: ActionPlanWorkspaceState,
) {
  const database = getAdminFirestore();
  const ownerEmail = normalizeEmail(email);
  const reference = database.collection(ACTION_PLANS_COLLECTION).doc(id);

  return database.runTransaction(async (transaction) => {
    const snapshot = await transaction.get(reference);
    const data = snapshot.data() as ActionPlanDocument | undefined;
    if (
      !snapshot.exists ||
      data?.status !== "active" ||
      normalizeEmail(data.owner_email || "") !== ownerEmail
    ) {
      return null;
    }

    const parsedPlan = compatibleActionPlanSchema.safeParse(data.plan);
    if (!parsedPlan.success) return null;
    const revision = Number(data.revision);
    if (!Number.isInteger(revision) || revision !== expectedRevision) {
      throw new ActionPlanRevisionConflictError();
    }

    const nextRevision = revision + 1;
    const updatedAt = new Date().toISOString();
    const normalizedWorkspace = normalizeActionPlanWorkspaceState(
      parsedPlan.data,
      workspaceState,
    );
    transaction.set(
      reference,
      {
        workspace_state: normalizedWorkspace,
        revision: nextRevision,
        updated_at: updatedAt,
        retention_expires_at: getLeadRetentionExpiry(),
      },
      { merge: true },
    );

    return {
      revision: nextRevision,
      updatedAt,
      workspaceState: normalizedWorkspace,
    };
  });
}
