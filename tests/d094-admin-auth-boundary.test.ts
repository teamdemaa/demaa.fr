import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  DEFAULT_ADMIN_RETURN_TO,
  getSafeAdminReturnTo,
} from "@/lib/admin-auth-redirect";

function source(path: string) {
  return readFileSync(path, "utf8");
}

describe("D-094 Team authentication boundary", () => {
  it("accepts only the three existing admin destinations", () => {
    expect(getSafeAdminReturnTo("/admin/coaching")).toBe("/admin/coaching");
    expect(getSafeAdminReturnTo("/admin/demandes")).toBe("/admin/demandes");
    expect(getSafeAdminReturnTo("/admin/opportunites")).toBe("/admin/opportunites");
    expect(getSafeAdminReturnTo("//evil.example")).toBe(DEFAULT_ADMIN_RETURN_TO);
    expect(getSafeAdminReturnTo("/plans")).toBe(DEFAULT_ADMIN_RETURN_TO);
  });

  it("keeps the Team login and both Google/password paths private and non-indexable", () => {
    const page = source("src/app/(administration)/admin/connexion/page.tsx");
    const googlePage = source("src/app/(administration)/admin/auth/google/page.tsx");
    const form = source("src/components/CustomerSpaceAccessForm.tsx");
    const googleButton = source("src/components/GoogleCustomerSignInButton.tsx");

    expect(page).toContain('robots: { follow: false, index: false }');
    expect(googlePage).toContain('robots: { follow: false, index: false }');
    expect(page).toContain('accessKind="admin"');
    expect(form).toContain('accessKind === "admin"');
    expect(form).toContain("signInWithPasswordAndGetIdToken");
    expect(googleButton).toContain("window.location.assign(`/admin/auth/google?");
    expect(googleButton).toContain("window.location.assign(`/auth/google?");
  });

  it("protects existing admin GET and POST handlers with the Team DAL", () => {
    for (const path of [
      "src/app/api/admin/coaching/route.ts",
      "src/app/api/admin/opportunities/route.ts",
    ]) {
      const route = source(path);
      expect(route).toContain("export async function GET");
      expect(route).toContain("export async function POST");
      expect(route).toContain("getCurrentAdminIdentity()");
    }
    expect(source("src/app/api/admin/lead-requests/route.ts"))
      .toContain("getCurrentAdminIdentity()");
  });

  it("never provisions a customer company or membership for Team access", () => {
    const route = source("src/app/api/admin/session/route.ts");
    const dal = source("src/lib/admin-auth.server.ts");
    expect(route).not.toContain("ensureDefaultCompanyForIdentity");
    expect(route).not.toContain("company-membership.server");
    expect(dal).not.toContain("ensureDefaultCompanyForIdentity");
    expect(dal).toContain('ADMIN_SESSION_COOKIE = "demaa_admin_session"');
  });

  it("leaves the legacy customer session route and cookie contract intact", () => {
    const route = source("src/app/api/auth/session/route.ts");
    const customerAuth = source("src/lib/customer-space-auth.ts");
    expect(route).toContain("ensureDefaultCompanyForIdentity(session.identity)");
    expect(route).toContain("CUSTOMER_SPACE_COOKIE");
    expect(customerAuth).toContain('CUSTOMER_SPACE_COOKIE = "demaa_session"');
  });
});
