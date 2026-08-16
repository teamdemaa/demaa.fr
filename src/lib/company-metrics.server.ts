import "server-only";

import type { CustomerSessionIdentity } from "@/lib/customer-space-auth";
import {
  companyMonthlyMetricSchema,
  enumerateCompanyMonths,
  type CompanyMetricWrite,
  type CompanyMonth,
  type CompanyMonthlyMetric,
} from "@/lib/company-pilotage-contract";
import {
  getActiveDefaultCompanyIdentity,
  getActiveDefaultCompanyIdentityInTransaction,
} from "@/lib/company-membership.server";
import { getAdminFirestore } from "@/lib/firebase-admin";

export const COMPANY_MONTHLY_METRICS_COLLECTION = "company_monthly_metrics";

type StoredCompanyMetric = {
  schema_version?: unknown;
  company_id?: unknown;
  period?: unknown;
  revenue_cents?: unknown;
  expenses_cents?: unknown;
  cash_balance_cents?: unknown;
  currency?: unknown;
  revision?: unknown;
  created_by_uid?: unknown;
  updated_by_uid?: unknown;
  created_at?: unknown;
  updated_at?: unknown;
};

export class CompanyMetricRevisionConflictError extends Error {
  constructor(readonly current: CompanyMonthlyMetric | null) {
    super("Company metric revision conflict.");
  }
}

export class CompanyPilotageAccessError extends Error {}

function metricDocumentId(companyId: string, period: CompanyMonth) {
  return `${companyId}__${period}`;
}

function readMetric(document: StoredCompanyMetric | undefined): CompanyMonthlyMetric | null {
  if (!document || document.schema_version !== "1") return null;
  const parsed = companyMonthlyMetricSchema.safeParse({
    period: document.period,
    revenueCents: document.revenue_cents,
    expensesCents: document.expenses_cents,
    cashBalanceCents: document.cash_balance_cents,
    currency: document.currency,
    revision: document.revision,
    createdAt: document.created_at,
    updatedAt: document.updated_at,
  });
  return parsed.success ? parsed.data : null;
}

export async function getCompanyMetricsForIdentity(input: {
  identity: CustomerSessionIdentity;
  from: CompanyMonth;
  to: CompanyMonth;
}) {
  const periods = enumerateCompanyMonths(input.from, input.to);
  const company = await getActiveDefaultCompanyIdentity(input.identity.uid);
  if (!company) throw new CompanyPilotageAccessError("Active company membership required.");
  const database = getAdminFirestore();
  const snapshots = await Promise.all(periods.map((period) =>
    database.collection(COMPANY_MONTHLY_METRICS_COLLECTION)
      .doc(metricDocumentId(company.companyId, period)).get()
  ));
  return snapshots.flatMap((snapshot) => {
    const stored = snapshot.data() as StoredCompanyMetric | undefined;
    if (stored?.company_id !== company.companyId) return [];
    const metric = readMetric(stored);
    return metric ? [metric] : [];
  });
}

export async function putCompanyMetricForIdentity(input: {
  identity: CustomerSessionIdentity;
  period: CompanyMonth;
  metric: CompanyMetricWrite;
  now?: Date;
}) {
  const database = getAdminFirestore();
  const now = (input.now ?? new Date()).toISOString();

  return database.runTransaction(async (transaction) => {
    const company = await getActiveDefaultCompanyIdentityInTransaction(
      transaction,
      input.identity.uid,
    );
    if (!company) throw new CompanyPilotageAccessError("Active company membership required.");
    const reference = database.collection(COMPANY_MONTHLY_METRICS_COLLECTION)
      .doc(metricDocumentId(company.companyId, input.period));
    const snapshot = await transaction.get(reference);
    const currentDocument = snapshot.data() as StoredCompanyMetric | undefined;
    const current = currentDocument?.company_id === company.companyId
      ? readMetric(currentDocument)
      : null;
    const currentRevision = current?.revision ?? 0;
    if (currentRevision !== input.metric.expectedRevision) {
      throw new CompanyMetricRevisionConflictError(current);
    }

    const revision = currentRevision + 1;
    const stored = {
      schema_version: "1",
      company_id: company.companyId,
      period: input.period,
      revenue_cents: input.metric.revenueCents,
      expenses_cents: input.metric.expensesCents,
      cash_balance_cents: input.metric.cashBalanceCents,
      currency: "EUR",
      revision,
      created_by_uid: currentDocument?.created_by_uid ?? input.identity.uid,
      updated_by_uid: input.identity.uid,
      created_at: current?.createdAt ?? now,
      updated_at: now,
    };
    transaction.set(reference, stored);
    return companyMonthlyMetricSchema.parse({
      period: input.period,
      revenueCents: input.metric.revenueCents,
      expensesCents: input.metric.expensesCents,
      cashBalanceCents: input.metric.cashBalanceCents,
      currency: "EUR",
      revision,
      createdAt: stored.created_at,
      updatedAt: now,
    });
  });
}

export async function deleteCompanyMetrics(companyId: string, batchSize = 100) {
  const database = getAdminFirestore();
  let deleted = 0;
  while (true) {
    const snapshot = await database.collection(COMPANY_MONTHLY_METRICS_COLLECTION)
      .where("company_id", "==", companyId)
      .limit(batchSize)
      .get();
    if (snapshot.empty) return deleted;
    const batch = database.batch();
    for (const document of snapshot.docs) batch.delete(document.ref);
    await batch.commit();
    deleted += snapshot.size;
    if (snapshot.size < batchSize) return deleted;
  }
}
