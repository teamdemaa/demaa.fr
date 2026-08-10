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
    expect(apiContract).toContain("actionPlanSchema");
    expect(collectionRoute).toContain("noStoreHeaders()");
  });

  it("binds pending plans to the verified magic-link identity", () => {
    const magicRoute = source("src/app/api/customer-space/magic-link/route.ts");
    const auth = source("src/lib/customer-space-auth.ts");
    const database = source("src/lib/generations-db.ts");

    expect(magicRoute).toContain("actionPlanClaimSecret");
    expect(auth).toContain("claimSecretHash: hashToken");
    expect(database).toContain('status: "active"');
    expect(database).toContain("claim_link_token_hashes");
    expect(database).toContain("owner_email: email");
  });

  it("registers action plan retention cleanup and documents the exact lifecycle", () => {
    const maintenance = source("src/lib/operational-maintenance.ts");
    const privacy = source("src/app/politique-de-confidentialite/page.tsx");

    expect(maintenance).toContain(
      '{ collection: "action_plans", field: "retention_expires_at"',
    );
    expect(privacy).toContain("une heure maximum");
    expect(privacy).toContain("jusqu&apos;à 3 ans");
    expect(privacy).toContain("ni localStorage ni sessionStorage");
  });
});
