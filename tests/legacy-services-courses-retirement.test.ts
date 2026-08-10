import { existsSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const retiredPaths = [
  "src/app/api/service-request/route.ts",
  "src/app/annuaire-services/[slug]/page.tsx",
  "src/app/cours/[slug]/page.tsx",
  "src/app/cours/page.tsx",
  "src/app/marketing-ethique/page.tsx",
  "src/app/systeme-marketing/page.tsx",
  "src/components/EthicalMarketingLandingPage.tsx",
  "src/components/ServicesMarketplace.tsx",
  "src/lib/course-content.ts",
  "src/lib/service-catalog-v2.ts",
  "src/lib/service-catalog.ts",
  "src/lib/service-recommendations.ts",
] as const;

function source(path: string) {
  return readFileSync(path, "utf8");
}

describe("legacy Services and Courses retirement", () => {
  it("physically removes superseded runtime sources", () => {
    for (const path of retiredPaths) expect(existsSync(path), path).toBe(false);
  });

  it("keeps permanent redirects for historical public URLs", () => {
    const redirects = source("next.config.ts");
    for (const route of [
      "/cours",
      "/systeme-marketing",
      "/marketing-ethique",
      "/annuaire-services/expert-comptable",
      "/annuaire-services/marketing-vente",
      "/annuaire-services/marketing-externalise",
      "/annuaire-services/assistante-facturation",
      "/annuaire-services/assistance-facturation",
    ]) {
      expect(redirects).toContain(route);
    }
  });

  it("does not expose redirected Courses entries in the sitemap", () => {
    const sitemap = source("src/app/sitemap.ts");
    expect(sitemap).not.toMatch(/from ["']@\/lib\/course-content["']/);
    expect(sitemap).not.toContain("courseContentEntries");
  });

  it("prevents superseded marketing prices from returning in public marketing modules", () => {
    const publicMarketing = [
      source("src/lib/canonical-service-catalog.ts"),
      source("src/components/CanonicalServiceDetails.tsx"),
      source("src/components/ServicesCatalog.tsx"),
      source("src/components/ServicesLandingPage.tsx"),
      source("src/app/services/page.tsx"),
    ].join("\n");

    expect(publicMarketing).not.toMatch(/750\s*€/);
    expect(publicMarketing).not.toMatch(/2\s*000\s*€/);
    expect(publicMarketing).not.toMatch(/service-catalog-v2|services-page-catalog/);
    expect(publicMarketing).toContain("550 € HT");
    expect(publicMarketing).not.toContain("950 € HT / mois");
  });
});
