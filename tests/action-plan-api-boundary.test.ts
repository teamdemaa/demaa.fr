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

  it("keeps the temporary plan credential in an HttpOnly cookie", () => {
    const collectionRoute = source("src/app/api/action-plans/route.ts");
    const magicRoute = source("src/app/api/customer-space/magic-link/route.ts");
    const auth = source("src/lib/customer-space-auth.ts");
    const storage = source("src/lib/action-plan-storage.server.ts");
    const database = source("src/lib/generations-db.ts");
    const consumeRoute = source("src/app/api/customer-space/consume/route.ts");
    const planPage = source("src/app/plans/[id]/page.tsx");

    expect(collectionRoute).toContain("ACTION_PLAN_ACCESS_COOKIE");
    expect(collectionRoute).not.toContain("actionPlanClaimSecret");
    expect(storage).toContain("httpOnly: true");
    expect(storage).toContain('sameSite: "lax"');
    expect(storage).toContain('process.env.VERCEL_ENV === "preview"');
    expect(magicRoute).toContain("temporaryAccessToken");
    expect(auth).toContain("temporaryAccessTokenHash");
    expect(database).toContain('status: "active"');
    expect(database).toContain("claim_link_token_hashes");
    expect(database).toContain("owner_email: email");
    expect(consumeRoute).toContain("response.cookies.delete(ACTION_PLAN_ACCESS_COOKIE)");
    expect(planPage).toContain("getActionPlanForAccess");
  });

  it("registers action plan retention cleanup and documents the exact lifecycle", () => {
    const maintenance = source("src/lib/operational-maintenance.ts");
    const privacy = source("src/app/politique-de-confidentialite/page.tsx");

    expect(maintenance).toContain(
      '{ collection: "action_plans", field: "retention_expires_at"',
    );
    expect(privacy).toContain("30 jours maximum");
    expect(privacy).toContain("jusqu&apos;à 3 ans");
    expect(privacy).toContain("uniquement sous forme hachée");
  });
});
