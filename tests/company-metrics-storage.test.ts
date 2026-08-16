import { beforeEach, describe, expect, it, vi } from "vitest";
vi.mock("server-only", () => ({}));

type Document = Record<string, unknown>;
const firestore = vi.hoisted(() => {
  const documents = new Map<string, Document>();
  function snapshot(path: string) { const value = documents.get(path); return { id: path.split("/").at(-1)!, exists: Boolean(value), data: () => value, ref: reference(path) }; }
  function reference(path: string): { path: string; get(): Promise<ReturnType<typeof snapshot>>; set(value: Document): Promise<void> } { return { path, async get() { return snapshot(path); }, async set(value) { documents.set(path, structuredClone(value)); } }; }
  const database = {
    collection(name: string) { return { doc(id: string) { return reference(`${name}/${id}`); }, where(field: string, _op: string, value: unknown) { return { limit(count: number) { return { async get() { const docs = [...documents.entries()].filter(([path, doc]) => path.startsWith(`${name}/`) && doc[field] === value).slice(0, count).map(([path]) => snapshot(path)); return { docs, empty: docs.length === 0, size: docs.length }; } }; } }; } }; },
    async runTransaction<T>(operation: (transaction: { get(ref: ReturnType<typeof reference>): Promise<ReturnType<typeof snapshot>>; set(ref: ReturnType<typeof reference>, value: Document): void }) => Promise<T>) { const writes: { ref: ReturnType<typeof reference>; value: Document }[] = []; const result = await operation({ get: async (ref) => snapshot(ref.path), set: (ref, value) => writes.push({ ref, value }) }); for (const write of writes) documents.set(write.ref.path, structuredClone(write.value)); return result; },
    batch() { const deletes: string[] = []; return { delete(ref: ReturnType<typeof reference>) { deletes.push(ref.path); }, async commit() { deletes.forEach((path) => documents.delete(path)); } }; },
  };
  return { database, documents };
});

vi.mock("@/lib/firebase-admin", () => ({ getAdminFirestore: () => firestore.database }));
vi.mock("@/lib/company-membership.server", () => ({
  getActiveDefaultCompanyIdentity: async (uid: string) => uid === "inactive" ? null : { companyId: `cmp_${uid}`, membershipId: `m_${uid}` },
  getActiveDefaultCompanyIdentityInTransaction: async (_transaction: unknown, uid: string) => uid === "inactive" ? null : { companyId: `cmp_${uid}`, membershipId: `m_${uid}` },
}));

import { CompanyPilotageAccessError, getCompanyMetricsForIdentity, putCompanyMetricForIdentity } from "@/lib/company-metrics.server";

const identity = (uid: string) => ({ uid, email: `${uid}@example.com`, provider: "password" as const });

describe("company metric storage", () => {
  beforeEach(() => firestore.documents.clear());

  it("creates and updates exactly one company month with audit fields", async () => {
    const created = await putCompanyMetricForIdentity({ identity: identity("owner"), period: "2026-08", metric: { expectedRevision: 0, revenueCents: 10000, expensesCents: 4000, cashBalanceCents: -500 }, now: new Date("2026-08-16T10:00:00.000Z") });
    expect(created.revision).toBe(1);
    const stored = firestore.documents.get("company_monthly_metrics/cmp_owner__2026-08");
    expect(Object.keys(stored!).sort()).toEqual(["cash_balance_cents", "company_id", "created_at", "created_by_uid", "currency", "expenses_cents", "period", "revenue_cents", "revision", "schema_version", "updated_at", "updated_by_uid"].sort());
    expect(stored).toMatchObject({ company_id: "cmp_owner", currency: "EUR", revision: 1, created_by_uid: "owner", updated_by_uid: "owner" });
    const updated = await putCompanyMetricForIdentity({ identity: identity("owner"), period: "2026-08", metric: { expectedRevision: 1, revenueCents: 12000, expensesCents: 4000, cashBalanceCents: 500 }, now: new Date("2026-08-17T10:00:00.000Z") });
    expect(updated.revision).toBe(2);
    expect(firestore.documents.get("company_monthly_metrics/cmp_owner__2026-08")).toMatchObject({ created_at: "2026-08-16T10:00:00.000Z", updated_at: "2026-08-17T10:00:00.000Z", revenue_cents: 12000 });
  });

  it("returns the current month on revision conflict", async () => {
    await putCompanyMetricForIdentity({ identity: identity("owner"), period: "2026-08", metric: { expectedRevision: 0, revenueCents: null, expensesCents: null, cashBalanceCents: null } });
    await expect(putCompanyMetricForIdentity({ identity: identity("owner"), period: "2026-08", metric: { expectedRevision: 0, revenueCents: 1, expensesCents: 1, cashBalanceCents: 1 } })).rejects.toMatchObject({ current: { revision: 1 } });
  });

  it("isolates companies and refuses inactive membership", async () => {
    await putCompanyMetricForIdentity({ identity: identity("other"), period: "2026-08", metric: { expectedRevision: 0, revenueCents: 900, expensesCents: 100, cashBalanceCents: 500 } });
    await expect(getCompanyMetricsForIdentity({ identity: identity("owner"), from: "2026-08", to: "2026-08" })).resolves.toEqual([]);
    await expect(getCompanyMetricsForIdentity({ identity: identity("inactive"), from: "2026-08", to: "2026-08" })).rejects.toBeInstanceOf(CompanyPilotageAccessError);
  });
});
