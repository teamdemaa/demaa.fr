import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";

const readSource = (path: string) => readFile(
  new URL(`../${path}`, import.meta.url),
  "utf8",
);

describe("Opportunities direct-link access", () => {
  it("keeps Annonces directly accessible without exposing it in the main navigation", async () => {
    const [navigation, footer, sitemap, page] = await Promise.all([
      readSource("src/components/ActionPlanNavbar.tsx"),
      readSource("src/components/Footer.tsx"),
      readSource("src/app/sitemap.ts"),
      readSource("src/app/(marketing)/opportunites/page.tsx"),
    ]);

    expect(navigation).toContain('{ view: "opportunities", labels: { fr: "Annonces", en: "Opportunities" }, Icon: BriefcaseBusiness }');
    expect(navigation).toContain('"plan",\n  "services"');
    expect(navigation).not.toContain('  "academy",');
    expect(navigation).not.toContain('  "opportunities",');
    expect(footer).toContain('{ label: "Annonces", href: "/opportunites" }');
    expect(sitemap).toContain("`${base}/opportunites`");
    expect(page).toContain("export default async function OpportunitiesPage");
    expect(page).toContain("<PublicOpportunitiesClient");
    expect(page).toContain('initialEmail=""');
    expect(page).not.toContain("CUSTOMER_SPACE_COOKIE");
    expect(page).not.toContain("getIdentityFromCustomerSessionToken");
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
