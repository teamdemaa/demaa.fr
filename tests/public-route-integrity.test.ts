import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";

async function readSource(path: string) {
  return readFile(new URL(`../${path}`, import.meta.url), "utf8");
}

describe("public route integrity", () => {
  it("keeps every sector hub link on an active public route", async () => {
    const [sectorPages, sectorPage, academyRoutes, validator] = await Promise.all([
      readSource("src/lib/sector-pages.ts"),
      readSource("src/app/(marketing)/secteurs/[slug]/page.tsx"),
      readSource("src/lib/academy-course-routes.ts"),
      readSource("scripts/validate-sector-editorial-links.mjs"),
    ]);

    expect(sectorPages).not.toContain('href: "/annuaire-services"');
    expect(sectorPages).not.toContain('href: "/organisation"');
    expect(sectorPages).not.toContain('href: "/structuration"');
    expect(sectorPages).toContain('href: "/solutions"');
    expect(sectorPages).toContain('href: "/automatisation"');
    expect(sectorPages).not.toContain('href: "/application-metier"');
    expect(sectorPages).not.toContain('href: "/systemes"');
    expect(sectorPages).not.toContain('href: "/services"');
    expect(validator).toContain('"/solutions"');
    expect(validator).toContain('"/automatisation"');
    expect(validator).not.toContain('"/application-metier"');
    expect(validator).not.toContain('"/systemes"');
    expect(validator).not.toContain('"/services"');
    expect(validator).not.toContain('"/organisation"');
    expect(sectorPage).toContain('href="/solutions"');
    expect(sectorPage).not.toContain('href="/systemes"');
    expect(academyRoutes).toContain(
      'source: "/cours/obligations-finances-entreprise",\n    destination: "/solutions"',
    );
  });

  it("publishes Automatisation and keeps Application métier out of the sitemap", async () => {
    const sitemap = await readSource("src/app/sitemap.ts");

    expect(sitemap).toContain('`${base}/automatisation`');
    expect(sitemap).not.toContain('`${base}/application-metier`');
    expect(sitemap).toContain('`${base}/solutions`');
    expect(sitemap).toContain('`${base}/organiser`');
    expect(sitemap).toContain('`${base}/organiser/processus`');
    expect(sitemap).not.toContain('`${base}/services`');
    expect(sitemap).not.toContain('`${base}/sur-mesure`');
    expect(sitemap).not.toContain("annuaire-recrutement");
    expect(sitemap).not.toContain("annuaire-formations");
    expect(sitemap).not.toContain('`${base}/systemes`');
  });

  it("returns retained service details to the public automation offer", async () => {
    const servicePage = await readSource(
      "src/app/(marketing)/services/[slug]/page.tsx",
    );

    expect(servicePage).toContain('href="/automatisation"');
    expect(servicePage).not.toContain('href="/services"');
    expect(servicePage).toContain("Retour à l’automatisation");
  });

  it("delivers live-session métier resources through the canonical Solutions routes", async () => {
    const liveSessionAssets = await readSource("src/lib/live-session-assets.ts");

    expect(liveSessionAssets).toContain('href: `/solutions/${system.slug}`');
    expect(liveSessionAssets).not.toContain('href: `/systemes/${system.slug}`');
  });

  it("uses canonical Solutions links from retained operational and hidden legacy screens", async () => {
    const sources = await Promise.all([
      readSource("src/app/(marketing)/annuaire-recrutement/page.tsx"),
      readSource("src/app/(marketing)/annuaire-recrutement/[slug]/page.tsx"),
      readSource("src/app/(marketing)/annuaire-formations/page.tsx"),
      readSource("src/app/(marketing)/annuaire-formations/[slug]/page.tsx"),
      readSource("src/app/(marketing)/suivi-kits/page.tsx"),
    ]);

    for (const source of sources) {
      expect(source).not.toContain('href: `/systemes/${encodeURIComponent(returnEnterprise.slug)}`');
      expect(source).not.toContain('href={`/systemes/${row.kitSlug}`}');
    }
  });

  it("does not reintroduce the retired callback flow", async () => {
    const systemContract = await readSource("tests/system-ux-contract.test.ts");

    expect(systemContract).toContain("OrganisationCallbackRequestButton");
    await expect(
      readSource("src/components/OrganisationCallbackRequestButton.tsx"),
    ).rejects.toThrow();
    await expect(
      readSource("src/app/api/organisation-callback-request/route.ts"),
    ).rejects.toThrow();
  });
});
