import { beforeEach, describe, expect, it, vi } from "vitest";
vi.mock("server-only", () => ({}));

type Document = Record<string, unknown>;
const firestore = vi.hoisted(() => {
  const documents = new Map<string, Document>();
  function snapshot(path: string) { const value = documents.get(path); return { id: path.split("/").at(-1)!, exists: Boolean(value), data: () => value, ref: reference(path) }; }
  function makeQuery(prefix: string, filters: [string, unknown][] = [], ordered = false, afterPath: string | null = null) {
    return {
      where(field: string, _operator: string, value: unknown) { return makeQuery(prefix, [...filters, [field, value]], ordered, afterPath); },
      orderBy() { return makeQuery(prefix, filters, true, afterPath); },
      startAfter(cursor: { ref: { path: string } }) { return makeQuery(prefix, filters, ordered, cursor.ref.path); },
      limit(count: number) { return { async get() { let entries = [...documents.entries()].filter(([path, doc]) => path.startsWith(`${prefix}/`) && path.slice(prefix.length + 1).split("/").length === 1 && filters.every(([field, value]) => doc[field] === value)); if (ordered) entries.sort((a, b) => String(b[1].created_at).localeCompare(String(a[1].created_at))); if (afterPath) entries = entries.slice(entries.findIndex(([path]) => path === afterPath) + 1); const docs = entries.slice(0, count).map(([path]) => snapshot(path)); return { docs, empty: docs.length === 0, size: docs.length }; } }; },
    };
  }
  function reference(path: string): { path: string; id: string; get(): Promise<ReturnType<typeof snapshot>>; set(value: Document): Promise<void>; collection(name: string): ReturnType<typeof collection> } {
    return { path, id: path.split("/").at(-1)!, async get() { return snapshot(path); }, async set(value) { documents.set(path, structuredClone(value)); }, collection(name) { return collection(`${path}/${name}`); } };
  }
  function collection(path: string) { return { ...makeQuery(path), doc(id: string) { return reference(`${path}/${id}`); } }; }
  const database = {
    collection,
    async runTransaction<T>(operation: (transaction: { get(ref: ReturnType<typeof reference>): Promise<ReturnType<typeof snapshot>>; set(ref: ReturnType<typeof reference>, value: Document): void }) => Promise<T>) { const writes: { ref: ReturnType<typeof reference>; value: Document }[] = []; const result = await operation({ get: async (ref) => snapshot(ref.path), set: (ref, value) => writes.push({ ref, value }) }); for (const write of writes) documents.set(write.ref.path, structuredClone(write.value)); return result; },
    async recursiveDelete(ref: ReturnType<typeof reference>) { for (const path of [...documents.keys()]) if (path === ref.path || path.startsWith(`${ref.path}/`)) documents.delete(path); },
  };
  return { database, documents };
});

vi.mock("@/lib/firebase-admin", () => ({ getAdminFirestore: () => firestore.database }));
vi.mock("@/lib/company-membership.server", () => ({
  getActiveDefaultCompanyIdentity: async (uid: string) => uid === "inactive" ? null : { companyId: `cmp_${uid}`, membershipId: `m_${uid}` },
  getActiveDefaultCompanyIdentityInTransaction: async (_transaction: unknown, uid: string) => uid === "inactive" ? null : { companyId: `cmp_${uid}`, membershipId: `m_${uid}` },
}));

import { EMPTY_COMPANY_STRATEGY_ANSWERS } from "@/lib/company-pilotage-contract";
import { CompanyStrategyArchivedError, createNextCompanyStrategyCycleForIdentity, getCompanyStrategyHistoryForIdentity, initializeCompanyStrategyForIdentity, updateCompanyStrategyForIdentity } from "@/lib/company-strategy.server";
const identity = (uid: string) => ({ uid, email: `${uid}@example.com`, provider: "password" as const });

describe("company strategy storage", () => {
  beforeEach(() => firestore.documents.clear());

  it("initializes exactly one empty three-month cycle idempotently", async () => {
    const now = new Date("2026-07-31T22:30:00.000Z");
    const first = await initializeCompanyStrategyForIdentity({ identity: identity("owner"), now });
    const second = await initializeCompanyStrategyForIdentity({ identity: identity("owner"), now: new Date("2026-08-10T00:00:00.000Z") });
    expect(second).toEqual(first);
    expect(first).toMatchObject({ status: "active", startMonth: "2026-08", endMonth: "2026-10", answers: EMPTY_COMPANY_STRATEGY_ANSWERS, revision: 1 });
    expect(Object.keys(first.answers)).toHaveLength(12);
    expect([...firestore.documents.keys()].filter((path) => path.includes("/cycles/"))).toHaveLength(1);
  });

  it("updates one pillar, rejects stale revisions and keeps the current draft", async () => {
    const cycle = await initializeCompanyStrategyForIdentity({ identity: identity("owner") });
    const updated = await updateCompanyStrategyForIdentity({ identity: identity("owner"), cycleId: cycle.id, update: { expectedRevision: 1, pillar: "alignment", answers: { alignment_1: "Liberté", alignment_2: "Résultats" } } });
    expect(updated).toMatchObject({ revision: 2, answers: { alignment_1: "Liberté", alignment_2: "Résultats", offer_1: "" } });
    await expect(updateCompanyStrategyForIdentity({ identity: identity("owner"), cycleId: cycle.id, update: { expectedRevision: 1, pillar: "offer", answers: { offer_1: "Offre" } } })).rejects.toMatchObject({ current: { revision: 2, answers: { alignment_1: "Liberté" } } });
  });

  it("archives atomically, creates an empty successor and makes archives immutable", async () => {
    const cycle = await initializeCompanyStrategyForIdentity({ identity: identity("owner"), now: new Date("2026-08-16T10:00:00.000Z") });
    const next = await createNextCompanyStrategyCycleForIdentity({ identity: identity("owner"), expectedRevision: 1, now: new Date("2026-08-20T10:00:00.000Z") });
    expect(next).toMatchObject({ status: "active", answers: EMPTY_COMPANY_STRATEGY_ANSWERS });
    const archived = firestore.documents.get(`company_strategies/cmp_owner/cycles/${cycle.id}`);
    expect(archived).toMatchObject({ status: "archived", archived_at: "2026-08-20T10:00:00.000Z" });
    await expect(updateCompanyStrategyForIdentity({ identity: identity("owner"), cycleId: cycle.id, update: { expectedRevision: 1, pillar: "promotion", answers: { promotion_1: "Non" } } })).rejects.toBeInstanceOf(CompanyStrategyArchivedError);
    const history = await getCompanyStrategyHistoryForIdentity({ identity: identity("owner") });
    expect(history.cycles.map(({ id }) => id)).toEqual([cycle.id]);
  });

  it("paginates more than ten archives in descending creation order", async () => {
    let active = await initializeCompanyStrategyForIdentity({
      identity: identity("owner"),
      now: new Date("2026-08-01T10:00:00.000Z"),
    });
    const archivedIds: string[] = [];

    for (let index = 0; index < 12; index += 1) {
      archivedIds.push(active.id);
      const next = await createNextCompanyStrategyCycleForIdentity({
        identity: identity("owner"),
        expectedRevision: active.revision,
        now: new Date(`2026-08-${String(index + 2).padStart(2, "0")}T10:00:00.000Z`),
      });
      if (!next) throw new Error("Expected the next company strategy cycle.");
      active = next;
    }

    const expectedDescendingIds = [...archivedIds].reverse();
    const firstPage = await getCompanyStrategyHistoryForIdentity({
      identity: identity("owner"),
    });
    expect(firstPage.cycles).toHaveLength(10);
    expect(firstPage.cycles.map(({ id }) => id)).toEqual(expectedDescendingIds.slice(0, 10));
    expect(firstPage.nextCursor).toBe(expectedDescendingIds[9]);

    const secondPage = await getCompanyStrategyHistoryForIdentity({
      identity: identity("owner"),
      cursor: firstPage.nextCursor ?? undefined,
    });
    expect(secondPage.cycles.map(({ id }) => id)).toEqual(expectedDescendingIds.slice(10));
    expect(secondPage.nextCursor).toBeNull();

    const allArchives = [...firstPage.cycles, ...secondPage.cycles];
    expect(allArchives).toHaveLength(12);
    expect(allArchives.every(({ startMonth, endMonth }) => startMonth === "2026-08" && endMonth === "2026-10")).toBe(true);
    expect(new Set(allArchives.map(({ createdAt }) => createdAt)).size).toBe(12);
    expect(allArchives.map(({ createdAt }) => createdAt)).toEqual(
      allArchives.map(({ createdAt }) => createdAt).toSorted().reverse(),
    );
  });
});
