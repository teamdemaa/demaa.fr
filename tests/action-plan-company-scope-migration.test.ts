import { describe, expect, it } from "vitest";

import {
  buildActionPlanCompanyScopeMigrationPlan,
} from "@/lib/action-plan-company-scope-migration.server";
import { getDefaultCompanyIdentity } from "@/lib/company-membership.server";

describe("D-078 action plan company-scope migration plan", () => {
  it("separates scoped, pending, conflicting and ownerless documents", () => {
    const identity = getDefaultCompanyIdentity("owner-uid");
    const expectedCompanyId = identity.companyId;
    const activeScope = {
      company: { status: "active" },
      membership: {
        status: "active",
        company_id: expectedCompanyId,
        member_uid: "owner-uid",
        role: "owner",
      },
    };
    const plan = buildActionPlanCompanyScopeMigrationPlan([
      {
        id: "scoped",
        data: { owner_uid: "owner-uid", company_id: expectedCompanyId },
        ...activeScope,
      },
      { id: "pending", data: { owner_uid: "owner-uid" }, ...activeScope },
      {
        id: "conflict",
        data: { owner_uid: "owner-uid", company_id: "cmp_foreign" },
        ...activeScope,
      },
      { id: "ownerless", data: {}, company: null, membership: null },
    ]);

    expect(plan.counts).toEqual({
      already_scoped: 1,
      pending: 1,
      conflict: 1,
      invalid_scope: 0,
      invalid_owner: 1,
    });
    expect(plan.items.find((item) => item.id === "pending")).toMatchObject({
      expectedCompanyId,
      ownerUid: "owner-uid",
      status: "pending",
    });
  });

  it("rejects a matching company ID without an active matching owner membership", () => {
    const identity = getDefaultCompanyIdentity("owner-uid");
    const candidates = [
      { company: null, membership: null },
      { company: { status: "archived" }, membership: null },
      {
        company: { status: "active" },
        membership: {
          status: "suspended",
          company_id: identity.companyId,
          member_uid: "owner-uid",
          role: "owner",
        },
      },
    ].map((scope, index) => ({
      id: `invalid-${index}`,
      data: { owner_uid: "owner-uid", company_id: identity.companyId },
      ...scope,
    }));

    const plan = buildActionPlanCompanyScopeMigrationPlan(candidates);

    expect(plan.counts.invalid_scope).toBe(3);
    expect(plan.items.every((item) => item.status === "invalid_scope")).toBe(true);
  });

  it("produces a stable fingerprint independent of query order", () => {
    const first = buildActionPlanCompanyScopeMigrationPlan([
      { id: "b", data: { owner_uid: "uid-b" }, company: null, membership: null },
      { id: "a", data: { owner_uid: "uid-a" }, company: null, membership: null },
    ]);
    const second = buildActionPlanCompanyScopeMigrationPlan([
      { id: "a", data: { owner_uid: "uid-a" }, company: null, membership: null },
      { id: "b", data: { owner_uid: "uid-b" }, company: null, membership: null },
    ]);
    expect(second.fingerprint).toBe(first.fingerprint);
    expect(second.items.map((item) => item.id)).toEqual(["a", "b"]);
  });
});
