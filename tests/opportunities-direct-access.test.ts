import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";

const readSource = (path: string) => readFile(
  new URL(`../${path}`, import.meta.url),
  "utf8",
);

describe("legacy Opportunities retirement", () => {
  it("redirects the old public page to Reprendre and removes it from the sitemap", async () => {
    const [page, sitemap, route] = await Promise.all([
      readSource("src/app/(marketing)/opportunites/page.tsx"),
      readSource("src/app/sitemap.ts"),
      readSource("src/app/api/opportunities/route.ts"),
    ]);

    expect(page).toContain('permanentRedirect("/a-reprendre")');
    expect(page).not.toContain("PublicOpportunitiesClient");
    expect(sitemap).not.toContain("`${base}/opportunites`");
    expect(route).toContain("status: 404");
  });

  it("redirects historical Team Demaa entry points to Reprendre", async () => {
    const [redirects, joinPage] = await Promise.all([
      readSource("next.config.ts"),
      readSource("src/app/(marketing)/rejoindre-team-demaa/page.tsx"),
    ]);

    expect(redirects).toContain("destination: '/a-reprendre'");
    expect(joinPage).toContain('permanentRedirect("/a-reprendre")');
  });
});
