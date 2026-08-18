import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";

const readSource = (path: string) => readFile(
  new URL(`../${path}`, import.meta.url),
  "utf8",
);

describe("Opportunities direct-link access", () => {
  it("restores Opportunities in the embedded app tab and on public discovery surfaces", async () => {
    const [navigation, footer, sitemap, page] = await Promise.all([
      readSource("src/components/ActionPlanNavbar.tsx"),
      readSource("src/components/Footer.tsx"),
      readSource("src/app/sitemap.ts"),
      readSource("src/app/(marketing)/opportunites/page.tsx"),
    ]);

    expect(navigation).toContain('{ view: "opportunities", labels: { fr: "Opportunités", en: "Opportunities" }, Icon: BriefcaseBusiness }');
    expect(footer).toContain('{ label: "Opportunités", href: "/opportunites" }');
    expect(sitemap).toContain("`${base}/opportunites`");
    expect(page).toContain("export default async function OpportunitiesPage");
    expect(page).toContain("<PublicOpportunitiesClient");
    expect(page).not.toContain("robots: { index: false, follow: true }");
    expect(await readSource("src/components/PublicOpportunitiesClient.tsx"))
      .toMatch(/\.get\(\s*"opportunity"/);
  });

  it("keeps authentication return flows on the canonical direct route", async () => {
    const [redirects, joinPage] = await Promise.all([
      readSource("src/lib/customer-space-redirect.ts"),
      readSource("src/app/(marketing)/rejoindre-team-demaa/page.tsx"),
    ]);

    expect(redirects).toContain('? "/opportunites"');
    expect(joinPage).toContain(
      'redirect("/opportunites?intent=team-demaa-profile")',
    );
  });
});
