import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

type StoredDocument = Record<string, unknown>;

const firestore = vi.hoisted(() => {
  const documents = new Map<string, StoredDocument>();
  function snapshot(path: string) {
    const data = documents.get(path);
    return { exists: Boolean(data), data: () => data };
  }
  function reference(path: string) {
    return {
      path,
      async get() { return snapshot(path); },
      async set(value: StoredDocument) { documents.set(path, structuredClone(value)); },
    };
  }
  const database = {
    collection(name: string) {
      return { doc(id: string) { return reference(`${name}/${id}`); } };
    },
    async runTransaction<T>(operation: (transaction: {
      get(ref: ReturnType<typeof reference>): Promise<ReturnType<typeof snapshot>>;
      set(ref: ReturnType<typeof reference>, value: StoredDocument): void;
    }) => Promise<T>) {
      const writes: Array<{ ref: ReturnType<typeof reference>; value: StoredDocument }> = [];
      const result = await operation({
        get: async (ref) => snapshot(ref.path),
        set: (ref, value) => writes.push({ ref, value }),
      });
      for (const write of writes) await write.ref.set(write.value);
      return result;
    },
  };
  return { database, documents };
});

vi.mock("@/lib/firebase-admin", () => ({ getAdminFirestore: () => firestore.database }));

import {
  buildCompanyMembershipId,
  buildDefaultCompanyId,
  ensureDefaultCompanyForIdentity,
  getActiveDefaultCompanyIdentity,
  hasActiveCompanyMembership,
  readCompanyInternationalContext,
} from "@/lib/company-membership.server";

function identity(uid: string) {
  return { email: `${uid}@example.com`, provider: "password" as const, uid };
}

describe("company membership foundation", () => {
  beforeEach(() => firestore.documents.clear());

  it("creates one unnamed company and owner membership idempotently", async () => {
    const first = await ensureDefaultCompanyForIdentity(identity("owner-uid"));
    const second = await ensureDefaultCompanyForIdentity(identity("owner-uid"));

    expect(second).toEqual(first);
    expect(firestore.documents).toHaveLength(2);
    expect(firestore.documents.get(`companies/${first.companyId}`)).toMatchObject({
      country_code: null,
      currency_code: "EUR",
      display_name: null,
      market_code: "fr-fr",
      status: "active",
      created_by_uid: "owner-uid",
    });
    expect(firestore.documents.get(`company_memberships/${first.membershipId}`)).toMatchObject({
      company_id: first.companyId,
      member_uid: "owner-uid",
      role: "owner",
      status: "active",
    });
  });

  it("uses opaque deterministic identifiers without the Firebase UID", () => {
    const companyId = buildDefaultCompanyId("private-firebase-uid");
    const membershipId = buildCompanyMembershipId(companyId, "private-firebase-uid");
    expect(companyId).not.toContain("private-firebase-uid");
    expect(membershipId).not.toContain("private-firebase-uid");
    expect(companyId).toBe(buildDefaultCompanyId("private-firebase-uid"));
  });

  it("keeps company market, country, and currency independent from interface language", () => {
    expect(readCompanyInternationalContext(undefined)).toEqual({
      countryCode: null,
      currencyCode: "EUR",
      marketCode: "fr-fr",
    });
    expect(readCompanyInternationalContext({
      country_code: "GB",
      currency_code: "EUR",
      market_code: "global-en-beta",
    })).toEqual({
      countryCode: "GB",
      currencyCode: "EUR",
      marketCode: "global-en-beta",
    });
  });

  it("refuses another UID and a suspended membership", async () => {
    const company = await ensureDefaultCompanyForIdentity(identity("owner-uid"));
    await expect(hasActiveCompanyMembership({
      companyId: company.companyId,
      uid: "other-uid",
    })).resolves.toBe(false);

    const membershipPath = `company_memberships/${company.membershipId}`;
    firestore.documents.set(membershipPath, {
      ...firestore.documents.get(membershipPath),
      status: "suspended",
    });
    await expect(hasActiveCompanyMembership({
      companyId: company.companyId,
      uid: "owner-uid",
    })).resolves.toBe(false);
    await expect(getActiveDefaultCompanyIdentity("owner-uid")).resolves.toBeNull();
  });

  it("does not reactivate an archived company or suspended membership", async () => {
    const company = await ensureDefaultCompanyForIdentity(identity("owner-uid"));
    const companyPath = `companies/${company.companyId}`;
    firestore.documents.set(companyPath, {
      ...firestore.documents.get(companyPath),
      status: "archived",
    });
    await expect(ensureDefaultCompanyForIdentity(identity("owner-uid")))
      .rejects.toThrow("not active");
  });

  it("resolves only an active default company for the authenticated UID", async () => {
    const company = await ensureDefaultCompanyForIdentity(identity("owner-uid"));
    await expect(getActiveDefaultCompanyIdentity("owner-uid")).resolves.toEqual(company);
    await expect(getActiveDefaultCompanyIdentity("other-uid")).resolves.toBeNull();
  });
});
