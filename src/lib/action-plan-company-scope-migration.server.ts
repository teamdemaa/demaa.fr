import "server-only";

import { createHash } from "node:crypto";
import { getDefaultCompanyIdentity } from "@/lib/company-membership.server";

export const ACTION_PLAN_COMPANY_SCOPE_MIGRATION_VERSION = "d078-v1";

export type ActionPlanCompanyScopeMigrationStatus =
  | "already_scoped"
  | "pending"
  | "conflict"
  | "invalid_scope"
  | "invalid_owner";

export type ActionPlanCompanyScopeMigrationItem = Readonly<{
  id: string;
  status: ActionPlanCompanyScopeMigrationStatus;
  ownerUid: string | null;
  currentCompanyId: string | null;
  expectedCompanyId: string | null;
  createdByUid: string | null;
  updatedByUid: string | null;
}>;

export type ActionPlanCompanyScopeMigrationPlan = Readonly<{
  version: typeof ACTION_PLAN_COMPANY_SCOPE_MIGRATION_VERSION;
  fingerprint: string;
  total: number;
  counts: Readonly<Record<ActionPlanCompanyScopeMigrationStatus, number>>;
  items: readonly ActionPlanCompanyScopeMigrationItem[];
}>;

type Candidate = Readonly<{
  id: string;
  data: Readonly<Record<string, unknown>>;
  company: Readonly<Record<string, unknown>> | null;
  membership: Readonly<Record<string, unknown>> | null;
}>;

function cleanText(value: unknown, maxLength = 160) {
  if (typeof value !== "string") return null;
  const normalized = value.trim();
  return normalized && normalized.length <= maxLength ? normalized : null;
}

function classifyCandidate(candidate: Candidate): ActionPlanCompanyScopeMigrationItem {
  const ownerUid = cleanText(candidate.data.owner_uid);
  const currentCompanyId = cleanText(candidate.data.company_id);
  const createdByUid = cleanText(candidate.data.created_by_uid);
  const updatedByUid = cleanText(candidate.data.updated_by_uid);
  if (!ownerUid) {
    return {
      id: candidate.id,
      status: "invalid_owner",
      ownerUid: null,
      currentCompanyId,
      expectedCompanyId: null,
      createdByUid,
      updatedByUid,
    };
  }

  const expectedCompanyId = getDefaultCompanyIdentity(ownerUid).companyId;
  const hasValidScope = candidate.company?.status === "active"
    && candidate.membership?.status === "active"
    && candidate.membership.company_id === expectedCompanyId
    && candidate.membership.member_uid === ownerUid
    && candidate.membership.role === "owner";
  return {
    id: candidate.id,
    status: !currentCompanyId
      ? "pending"
      : currentCompanyId === expectedCompanyId
        ? hasValidScope
          ? "already_scoped"
          : "invalid_scope"
        : "conflict",
    ownerUid,
    currentCompanyId,
    expectedCompanyId,
    createdByUid,
    updatedByUid,
  };
}

export function buildActionPlanCompanyScopeMigrationPlan(
  candidates: readonly Candidate[],
): ActionPlanCompanyScopeMigrationPlan {
  const items = candidates
    .map(classifyCandidate)
    .sort((left, right) => left.id.localeCompare(right.id));
  const counts = {
    already_scoped: 0,
    pending: 0,
    conflict: 0,
    invalid_scope: 0,
    invalid_owner: 0,
  } satisfies Record<ActionPlanCompanyScopeMigrationStatus, number>;
  for (const item of items) counts[item.status] += 1;

  const fingerprint = createHash("sha256")
    .update(JSON.stringify({
      version: ACTION_PLAN_COMPANY_SCOPE_MIGRATION_VERSION,
      items,
    }))
    .digest("hex");

  return {
    version: ACTION_PLAN_COMPANY_SCOPE_MIGRATION_VERSION,
    fingerprint,
    total: items.length,
    counts,
    items,
  };
}
