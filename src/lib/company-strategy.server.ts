import "server-only";

import { randomUUID } from "node:crypto";
import type { CustomerSessionIdentity } from "@/lib/customer-space-auth";
import {
  EMPTY_COMPANY_STRATEGY_ANSWERS,
  companyStrategyCycleSchema,
  getCurrentCompanyMonth,
  shiftCompanyMonth,
  type CompanyStrategyAnswers,
  type CompanyStrategyCycle,
  type CompanyStrategyUpdate,
} from "@/lib/company-pilotage-contract";
import {
  getActiveDefaultCompanyIdentity,
  getActiveDefaultCompanyIdentityInTransaction,
} from "@/lib/company-membership.server";
import { getAdminFirestore } from "@/lib/firebase-admin";
import { CompanyPilotageAccessError } from "@/lib/company-metrics.server";

export const COMPANY_STRATEGIES_COLLECTION = "company_strategies";
export const COMPANY_STRATEGY_CYCLES_COLLECTION = "cycles";

type StrategyRootDocument = {
  schema_version?: unknown;
  company_id?: unknown;
  active_cycle_id?: unknown;
  created_at?: unknown;
  updated_at?: unknown;
};

type StrategyCycleDocument = {
  schema_version?: unknown;
  company_id?: unknown;
  status?: unknown;
  start_month?: unknown;
  end_month?: unknown;
  answers?: unknown;
  revision?: unknown;
  created_by_uid?: unknown;
  updated_by_uid?: unknown;
  created_at?: unknown;
  updated_at?: unknown;
  archived_at?: unknown;
};

export class CompanyStrategyRevisionConflictError extends Error {
  constructor(readonly current: CompanyStrategyCycle) {
    super("Company strategy revision conflict.");
  }
}

export class CompanyStrategyArchivedError extends Error {}

function parseCycle(id: string, document: StrategyCycleDocument | undefined) {
  if (!document || document.schema_version !== "1") return null;
  const parsed = companyStrategyCycleSchema.safeParse({
    id,
    status: document.status,
    startMonth: document.start_month,
    endMonth: document.end_month,
    answers: document.answers,
    revision: document.revision,
    createdAt: document.created_at,
    updatedAt: document.updated_at,
    archivedAt: document.archived_at ?? null,
  });
  return parsed.success ? parsed.data : null;
}

function cycleReference(companyId: string, cycleId: string) {
  return getAdminFirestore().collection(COMPANY_STRATEGIES_COLLECTION)
    .doc(companyId).collection(COMPANY_STRATEGY_CYCLES_COLLECTION).doc(cycleId);
}

function buildNewCycleDocument(input: {
  companyId: string;
  uid: string;
  now: Date;
}): StrategyCycleDocument {
  const createdAt = input.now.toISOString();
  const startMonth = getCurrentCompanyMonth(input.now);
  return {
    schema_version: "1",
    company_id: input.companyId,
    status: "active",
    start_month: startMonth,
    end_month: shiftCompanyMonth(startMonth, 2),
    answers: { ...EMPTY_COMPANY_STRATEGY_ANSWERS },
    revision: 1,
    created_by_uid: input.uid,
    updated_by_uid: input.uid,
    created_at: createdAt,
    updated_at: createdAt,
    archived_at: null,
  };
}

export async function getCurrentCompanyStrategyForIdentity(identity: CustomerSessionIdentity) {
  const company = await getActiveDefaultCompanyIdentity(identity.uid);
  if (!company) throw new CompanyPilotageAccessError("Active company membership required.");
  const rootSnapshot = await getAdminFirestore().collection(COMPANY_STRATEGIES_COLLECTION)
    .doc(company.companyId).get();
  const root = rootSnapshot.data() as StrategyRootDocument | undefined;
  if (root?.company_id !== company.companyId || typeof root.active_cycle_id !== "string") {
    return null;
  }
  const cycleSnapshot = await cycleReference(company.companyId, root.active_cycle_id).get();
  return parseCycle(cycleSnapshot.id, cycleSnapshot.data() as StrategyCycleDocument | undefined);
}

export async function initializeCompanyStrategyForIdentity(input: {
  identity: CustomerSessionIdentity;
  now?: Date;
}) {
  const database = getAdminFirestore();
  const cycleId = `cycle_${randomUUID()}`;
  const now = input.now ?? new Date();
  return database.runTransaction(async (transaction) => {
    const company = await getActiveDefaultCompanyIdentityInTransaction(transaction, input.identity.uid);
    if (!company) throw new CompanyPilotageAccessError("Active company membership required.");
    const rootReference = database.collection(COMPANY_STRATEGIES_COLLECTION).doc(company.companyId);
    const rootSnapshot = await transaction.get(rootReference);
    const root = rootSnapshot.data() as StrategyRootDocument | undefined;
    if (rootSnapshot.exists && root?.company_id !== company.companyId) {
      throw new CompanyPilotageAccessError("Invalid company strategy owner.");
    }
    if (typeof root?.active_cycle_id === "string") {
      const existingSnapshot = await transaction.get(cycleReference(company.companyId, root.active_cycle_id));
      const existing = parseCycle(existingSnapshot.id, existingSnapshot.data() as StrategyCycleDocument | undefined);
      if (existing) return existing;
    }
    const document = buildNewCycleDocument({ companyId: company.companyId, uid: input.identity.uid, now });
    const reference = cycleReference(company.companyId, cycleId);
    transaction.set(reference, document);
    transaction.set(rootReference, {
      schema_version: "1",
      company_id: company.companyId,
      active_cycle_id: cycleId,
      created_at: typeof root?.created_at === "string" ? root.created_at : now.toISOString(),
      updated_at: now.toISOString(),
    });
    return companyStrategyCycleSchema.parse({
      id: cycleId,
      status: "active",
      startMonth: document.start_month,
      endMonth: document.end_month,
      answers: document.answers,
      revision: 1,
      createdAt: document.created_at,
      updatedAt: document.updated_at,
      archivedAt: null,
    });
  });
}

export async function updateCompanyStrategyForIdentity(input: {
  identity: CustomerSessionIdentity;
  cycleId: string;
  update: CompanyStrategyUpdate;
  now?: Date;
}) {
  const database = getAdminFirestore();
  const now = (input.now ?? new Date()).toISOString();
  return database.runTransaction(async (transaction) => {
    const company = await getActiveDefaultCompanyIdentityInTransaction(transaction, input.identity.uid);
    if (!company) throw new CompanyPilotageAccessError("Active company membership required.");
    const rootReference = database.collection(COMPANY_STRATEGIES_COLLECTION).doc(company.companyId);
    const cycleRef = cycleReference(company.companyId, input.cycleId);
    const [rootSnapshot, cycleSnapshot] = await Promise.all([
      transaction.get(rootReference),
      transaction.get(cycleRef),
    ]);
    const root = rootSnapshot.data() as StrategyRootDocument | undefined;
    const stored = cycleSnapshot.data() as StrategyCycleDocument | undefined;
    const current = parseCycle(cycleSnapshot.id, stored);
    if (!current || stored?.company_id !== company.companyId) return null;
    if (current.status !== "active" || root?.active_cycle_id !== input.cycleId) {
      throw new CompanyStrategyArchivedError("Archived cycles are immutable.");
    }
    if (current.revision !== input.update.expectedRevision) {
      throw new CompanyStrategyRevisionConflictError(current);
    }
    const answers: CompanyStrategyAnswers = { ...current.answers, ...input.update.answers };
    const revision = current.revision + 1;
    transaction.set(cycleRef, {
      ...stored,
      answers,
      revision,
      updated_by_uid: input.identity.uid,
      updated_at: now,
    });
    return { ...current, answers, revision, updatedAt: now };
  });
}

export async function createNextCompanyStrategyCycleForIdentity(input: {
  identity: CustomerSessionIdentity;
  expectedRevision: number;
  now?: Date;
}) {
  const database = getAdminFirestore();
  const cycleId = `cycle_${randomUUID()}`;
  const nowDate = input.now ?? new Date();
  const now = nowDate.toISOString();
  return database.runTransaction(async (transaction) => {
    const company = await getActiveDefaultCompanyIdentityInTransaction(transaction, input.identity.uid);
    if (!company) throw new CompanyPilotageAccessError("Active company membership required.");
    const rootReference = database.collection(COMPANY_STRATEGIES_COLLECTION).doc(company.companyId);
    const rootSnapshot = await transaction.get(rootReference);
    const root = rootSnapshot.data() as StrategyRootDocument | undefined;
    if (root?.company_id !== company.companyId || typeof root.active_cycle_id !== "string") return null;
    const activeReference = cycleReference(company.companyId, root.active_cycle_id);
    const activeSnapshot = await transaction.get(activeReference);
    const activeStored = activeSnapshot.data() as StrategyCycleDocument | undefined;
    const active = parseCycle(activeSnapshot.id, activeStored);
    if (!active || active.status !== "active") return null;
    if (active.revision !== input.expectedRevision) {
      throw new CompanyStrategyRevisionConflictError(active);
    }
    const nextDocument = buildNewCycleDocument({ companyId: company.companyId, uid: input.identity.uid, now: nowDate });
    transaction.set(activeReference, {
      ...activeStored,
      status: "archived",
      updated_by_uid: input.identity.uid,
      updated_at: now,
      archived_at: now,
    });
    transaction.set(cycleReference(company.companyId, cycleId), nextDocument);
    transaction.set(rootReference, { ...root, active_cycle_id: cycleId, updated_at: now });
    return companyStrategyCycleSchema.parse({
      id: cycleId,
      status: "active",
      startMonth: nextDocument.start_month,
      endMonth: nextDocument.end_month,
      answers: nextDocument.answers,
      revision: 1,
      createdAt: nextDocument.created_at,
      updatedAt: nextDocument.updated_at,
      archivedAt: null,
    });
  });
}

export async function getCompanyStrategyHistoryForIdentity(input: {
  identity: CustomerSessionIdentity;
  cursor?: string;
  limit?: number;
}) {
  const company = await getActiveDefaultCompanyIdentity(input.identity.uid);
  if (!company) throw new CompanyPilotageAccessError("Active company membership required.");
  const pageSize = Math.min(Math.max(input.limit ?? 10, 1), 10);
  const collection = getAdminFirestore().collection(COMPANY_STRATEGIES_COLLECTION)
    .doc(company.companyId).collection(COMPANY_STRATEGY_CYCLES_COLLECTION);
  let query = collection.orderBy("created_at", "desc");
  if (input.cursor) {
    const cursor = await collection.doc(input.cursor).get();
    if (!cursor.exists || cursor.data()?.company_id !== company.companyId || cursor.data()?.status !== "archived") {
      return { cycles: [], nextCursor: null };
    }
    query = query.startAfter(cursor);
  }
  // A company has at most one active cycle. Reading one extra slot avoids a
  // composite status/date index while preserving pages of ten archives.
  const snapshot = await query.limit(pageSize + 2).get();
  const archivedDocuments = snapshot.docs.filter((document) => document.data().status === "archived");
  const cycles = archivedDocuments.slice(0, pageSize).flatMap((document) => {
    const cycle = parseCycle(document.id, document.data() as StrategyCycleDocument);
    return cycle ? [cycle] : [];
  });
  return {
    cycles,
    nextCursor: archivedDocuments.length > pageSize ? cycles.at(-1)?.id ?? null : null,
  };
}

export async function deleteCompanyStrategy(companyId: string) {
  const database = getAdminFirestore();
  const root = database.collection(COMPANY_STRATEGIES_COLLECTION).doc(companyId);
  await database.recursiveDelete(root);
}
