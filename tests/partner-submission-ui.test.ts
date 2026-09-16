import { readFile } from "node:fs/promises";
import path from "node:path";
import { describe, expect, it } from "vitest";

const root = process.cwd();

async function readSource(relativePath: string) {
  return readFile(path.join(root, relativePath), "utf8");
}

describe("legacy opportunities retirement", () => {
  it("redirects former public Team Demaa entry points to Reprendre", async () => {
    const [page, nextConfig, sitemap] = await Promise.all([
      readSource("src/app/(marketing)/rejoindre-team-demaa/page.tsx"),
      readSource("next.config.ts"),
      readSource("src/app/sitemap.ts"),
    ]);

    expect(page).toContain('permanentRedirect("/a-reprendre")');
    expect(nextConfig).not.toContain("/opportunites?intent=team-demaa-profile");
    expect(sitemap).not.toContain("`${base}/rejoindre-team-demaa`");
  });

  it("keeps opportunity management behind the administration boundary", async () => {
    const [admin, route] = await Promise.all([
      readSource("src/components/OpportunityAdminClient.tsx"),
      readSource("src/app/api/admin/opportunities/route.ts"),
    ]);

    expect(admin).toContain("Modifier l’annonce");
    expect(route).toContain("getCurrentAdminIdentity");
    expect(route).toContain("updateOpportunity");
  });
});
