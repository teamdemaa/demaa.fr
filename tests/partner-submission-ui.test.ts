import { readFile } from "node:fs/promises";
import path from "node:path";
import { describe, expect, it } from "vitest";

const root = process.cwd();

async function readSource(relativePath: string) {
  return readFile(path.join(root, relativePath), "utf8");
}

describe("solution proposal UI contract", () => {
  it("exposes one neutral public entry without promising a partnership", async () => {
    const [footer, page, legacyPage, nextConfig, sitemap] = await Promise.all([
      readSource("src/components/Footer.tsx"),
      readSource("src/app/rejoindre-team-demaa/page.tsx"),
      readSource("src/app/rejoindre-le-reseau/page.tsx"),
      readSource("next.config.ts"),
      readSource("src/app/sitemap.ts"),
    ]);

    expect(footer).toContain('{ label: "Rejoindre Team Demaa", href: "/rejoindre-team-demaa" }');
    expect(page).toContain("Rejoindre Team Demaa");
    expect(page).toContain("lorsqu’un besoin correspond à votre expertise");
    expect(page).not.toMatch(/partenaire Demaa|devenir partenaire|partenariat garanti/i);
    expect(legacyPage).toContain('permanentRedirect("/rejoindre-team-demaa")');
    expect(nextConfig).toContain("source: '/rejoindre-le-reseau'");
    expect(nextConfig).toContain("source: '/partenaires'");
    expect(nextConfig.match(/destination: '\/rejoindre-team-demaa'/g)).toHaveLength(2);
    expect(sitemap).toContain("`${base}/rejoindre-team-demaa`");
    expect(sitemap).not.toContain("`${base}/rejoindre-le-reseau`");
  });

  it("uses one shared short form without asking candidates to choose systems", async () => {
    const [form, route] = await Promise.all([
      readSource("src/components/ProviderProfileModal.tsx"),
      readSource("src/app/api/provider-profile-submission/route.ts"),
    ]);

    expect(form).toContain("Vos expertises");
    expect(form).toContain("Pays ou zones couverts");
    expect(form).not.toContain("selectedSystemSlugs");
    expect(route).toContain('channels: { email: false, resend: false, slack: true }');
    expect(form).toContain('role="alert"');
    expect(form).toContain('aria-live="polite"');
  });

  it("loads Firebase-backed pages at request time and retires the legacy dossier", async () => {
    const [networkPage, opportunitiesPage, adminPage, legacyPage] = await Promise.all([
      readSource("src/app/rejoindre-team-demaa/page.tsx"),
      readSource("src/app/opportunites/page.tsx"),
      readSource("src/app/admin/opportunites/page.tsx"),
      readSource("src/app/opportunites/0034/page.tsx"),
    ]);

    for (const source of [networkPage, opportunitiesPage, adminPage]) {
      expect(source).toContain('import { connection } from "next/server"');
      expect(source).toContain("await connection()");
    }
    expect(legacyPage).toContain('permanentRedirect("/opportunites")');
    expect(legacyPage).not.toContain("Cabinet d’expertise comptable");
  });
});
