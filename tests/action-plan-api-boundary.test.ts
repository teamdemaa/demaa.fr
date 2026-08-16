import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

function source(path: string) {
  return readFileSync(path, "utf8");
}

describe("action plan persistence boundaries", () => {
  it("keeps Firebase persistence server-only and in one canonical collection", () => {
    const storage = source("src/lib/action-plan-storage.server.ts");
    expect(storage.startsWith('import "server-only";')).toBe(true);
    expect(storage).toContain('ACTION_PLANS_COLLECTION = "action_plans"');
    expect(storage).not.toMatch(/localStorage|sessionStorage/);
  });

  it("protects writes with same-origin checks and validates the shared plan contract", () => {
    const collectionRoute = source("src/app/api/action-plans/route.ts");
    const apiContract = source("src/lib/action-plan-api.server.ts");

    expect(collectionRoute).toContain("enforceSameOrigin(request)");
    expect(apiContract).toContain("compatibleActionPlanSchema");
    expect(apiContract).toContain("compatibleActionPlanWorkspaceStateSchema");
    expect(collectionRoute).toContain("noStoreHeaders()");
    const updateRoute = source("src/app/api/action-plans/[id]/route.ts");
    expect(updateRoute).toContain("enforceSameOrigin(request)");
    expect(updateRoute).toContain("expectedRevision");
    expect(updateRoute).toContain("revision_conflict");
    expect(updateRoute).toContain("sourceText: parsed.data.sourceText");
    expect(updateRoute).toContain("generation: parsed.data.generation");
  });

  it("uses one Firebase identity and company-membership plan authorization", () => {
    const collectionRoute = source("src/app/api/action-plans/route.ts");
    const auth = source("src/lib/customer-space-auth.ts");
    const storage = source("src/lib/action-plan-storage.server.ts");
    const planPage = source("src/app/(application)/plans/[id]/page.tsx");

    expect(collectionRoute).toContain("if (!identity)");
    expect(auth).toContain("createSessionCookie");
    expect(auth).toContain("verifySessionCookie(token, true)");
    expect(storage).toContain("owner_uid: uid");
    expect(storage).toContain("getActiveDefaultCompanyIdentity");
    expect(storage).toContain("getActiveDefaultCompanyIdentityInTransaction");
    expect(storage).toContain('.where("company_id", "==", company.companyId)');
    expect(storage).not.toContain('.where("owner_uid", "=="');
    expect(storage).not.toContain("owner_email");
    expect(storage).not.toContain("pending_claim");
    expect(planPage).toContain("getActionPlanWorkspacePageForIdentity");
    expect(planPage).not.toContain("getOwnedActionPlansForIdentity");
  });

  it("registers action plan retention cleanup and documents the exact lifecycle", () => {
    const maintenance = source("src/lib/operational-maintenance.ts");
    const privacy = source("src/app/(marketing)/politique-de-confidentialite/page.tsx");

    expect(maintenance).toContain(
      '{ collection: "action_plans", field: "retention_expires_at"',
    );
    expect(privacy).toContain("30 jours maximum");
    expect(privacy).toContain("jusqu&apos;à 3 ans");
    expect(privacy).toContain("Firebase");
  });
});
