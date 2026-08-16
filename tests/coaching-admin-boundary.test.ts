import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

function source(path: string) {
  return readFileSync(path, "utf8");
}

describe("coaching administration boundary", () => {
  it("keeps the console out of search indexing and public navigation", () => {
    const page = source("src/app/(administration)/admin/coaching/page.tsx");
    const navbar = source("src/components/Navbar.tsx");

    expect(page).toContain("robots: { follow: false, index: false }");
    expect(navbar).not.toContain("/admin/coaching");
  });

  it("documents one dedicated secret without an opportunities fallback", () => {
    const route = source("src/app/api/admin/coaching/route.ts");
    const procedure = source("docs/coaching-admin-access.md");

    expect(route).toContain("process.env.COACHING_ADMIN_SECRET?.trim()");
    expect(route).not.toContain("process.env.OPPORTUNITIES_ADMIN_SECRET");
    expect(procedure).toContain("COACHING_ADMIN_SECRET");
    expect(procedure).toContain("Il n’existe aucun fallback");
  });
});
