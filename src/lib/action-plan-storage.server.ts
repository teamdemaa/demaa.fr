import "server-only";

import { randomBytes } from "node:crypto";
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

type ActionPlanStatus = "active" | "deleted";

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
  company_id?: string | null;
  owner_uid?: string | null;
  created_by_uid?: string | null;
  updated_by_uid?: string | null;
  revision?: number | null;
  created_at?: string | null;
  updated_at?: string | null;
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

const MAX_SOURCE_TEXT_LENGTH = 12_000;

function createActionPlanId() {
  return randomBytes(18).toString("base64url");
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
    document?.status === "active"
    && companyId
    && document.company_id?.trim() === companyId,
  );
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
  if (!company) return [];

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

export async function getActionPlanForAccess(input: { id: string; uid: string }) {
  const company = await getActiveDefaultCompanyIdentity(input.uid);
  if (!company) return null;
  const snapshot = await getAdminFirestore()
    .collection(ACTION_PLANS_COLLECTION)
    .doc(input.id)
    .get();
  const data = snapshot.data() as ActionPlanDocument | undefined;
  if (!snapshot.exists || !belongsToCompany(data, company.companyId)) return null;
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
      || !belongsToCompany(data, company.companyId)
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
    transaction.set(reference, {
      ...(input.plan ? {
        plan: nextPlan,
        schema_version: getPersistedSchemaVersion(nextPlan),
      } : {}),
      ...(input.sourceText !== undefined
        ? { source_text: normalizeSourceText(input.sourceText) }
        : {}),
      ...(input.generation !== undefined
        ? { generation: normalizeGenerationMetadata(input.generation) }
        : {}),
      ...(input.title !== undefined ? { title: nextTitle } : {}),
      workspace_state: normalizedWorkspace,
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
      || !belongsToCompany(data, company.companyId)
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
