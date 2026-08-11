import { access, readFile } from "node:fs/promises";
import path from "node:path";
import { describe, expect, it } from "vitest";

const root = process.cwd();

async function readSource(relativePath: string) {
  return readFile(path.join(root, relativePath), "utf8");
}

describe("solution proposal UI contract", () => {
  it("exposes one neutral public entry without promising a partnership", async () => {
    const [footer, page, nextConfig, sitemap] = await Promise.all([
      readSource("src/components/Footer.tsx"),
      readSource("src/app/rejoindre-team-demaa/page.tsx"),
      readSource("next.config.ts"),
      readSource("src/app/sitemap.ts"),
    ]);

    expect(footer).toContain('{ label: "Rejoindre Team Demaa", href: "/rejoindre-team-demaa" }');
    expect(page).toContain("Rejoindre Team Demaa");
    expect(page).toContain("lorsqu’un besoin correspond à votre expertise");
    expect(page).not.toMatch(/partenaire Demaa|devenir partenaire|partenariat garanti/i);
    await expect(
      access(path.join(root, "src/app/rejoindre-le-reseau/page.tsx")),
    ).rejects.toThrow();
    await expect(
      access(path.join(root, "src/app/partenaires/page.tsx")),
    ).rejects.toThrow();
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

  it("loads Firebase-backed pages at request time", async () => {
    const [networkPage, opportunitiesPage, adminPage] = await Promise.all([
      readSource("src/app/rejoindre-team-demaa/page.tsx"),
      readSource("src/app/opportunites/page.tsx"),
      readSource("src/app/admin/opportunites/page.tsx"),
    ]);

    for (const source of [networkPage, opportunitiesPage, adminPage]) {
      expect(source).toContain('import { connection } from "next/server"');
      expect(source).toContain("await connection()");
    }
  });

  it("separates immediate opportunities from the permanent Team Demaa profile", async () => {
    const [page, catalog, modal, panel] = await Promise.all([
      readSource("src/app/opportunites/page.tsx"),
      readSource("src/components/PublicOpportunitiesClient.tsx"),
      readSource("src/components/ProviderProfileModal.tsx"),
      readSource("src/components/OpportunitiesPanel.tsx"),
    ]);

    expect(page).toContain("Découvrez les opportunités actuellement disponibles.");
    expect(catalog).toContain("Voir l’opportunité");
    expect(catalog).toContain("Rejoindre Team Demaa");
    expect(modal).toContain("Manifester mon intérêt");
    expect(modal).toContain("initialEmail");
    expect(panel).toContain('fetch("/api/opportunities"');
    expect([page, catalog, modal, panel].join("\n")).not.toMatch(
      /freelance|Demaa recruteur/i,
    );
  });
});
