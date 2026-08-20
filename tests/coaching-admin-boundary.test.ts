import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

function source(path: string) {
  return readFileSync(path, "utf8");
}

describe("coaching administration boundary", () => {
  it("keeps the console out of search indexing and public navigation", () => {
    const page = source("src/app/(french)/(administration)/admin/coaching/page.tsx");
    const navbar = source("src/components/Navbar.tsx");

    expect(page).toContain("robots: { follow: false, index: false }");
    expect(navbar).not.toContain("/admin/coaching");
  });

  it("documents the shared admin session, not a per-console secret", () => {
    const route = source("src/app/api/admin/coaching/route.ts");
    const procedure = source("docs/coaching-admin-access.md");

    expect(route).toContain("getCurrentAdminIdentity()");
    expect(route).not.toContain("ADMIN_SECRET");
    expect(procedure).toContain("DEMAA_ADMIN_EMAILS");
    expect(procedure).toContain("DEMAA_ADMIN_UIDS");
    expect(procedure).toContain("getCurrentAdminIdentity");
  });
});
