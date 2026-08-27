import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";

async function readSource(path: string) {
  return readFile(new URL(`../${path}`, import.meta.url), "utf8");
}

describe("Demaa Studio page", () => {
  it("is a footer-only marketing destination with canonical metadata", async () => {
    const [page, footer, navbar, sitemap] = await Promise.all([
      readSource("src/app/(marketing)/studio/page.tsx"),
      readSource("src/components/Footer.tsx"),
      readSource("src/components/ActionPlanNavbar.tsx"),
      readSource("src/app/sitemap.ts"),
    ]);

    expect(page).toContain('path: "/studio"');
    expect(page).toContain("buildPublicPageMetadata");
    expect(footer).toContain('{ label: "Demaa Studio", href: "/studio" }');
    expect(navbar).not.toContain('labels: { fr: "Demaa Studio"');
    expect(sitemap).toContain("`${base}/studio`");
  });

  it("uses the approved structure and only the three verified public projects", async () => {
    const [landing, projects] = await Promise.all([
      readSource("src/components/DemaaStudioLandingPage.tsx"),
      readSource("src/lib/demaa-studio-projects.ts"),
    ]);

    expect(landing).toContain("Demaa Studio");
    expect(landing).toContain("Notre avantage terrain");
    expect(landing).toContain("Les projets");
    expect(landing).toContain("Rejoindre Demaa Studio");
    expect(landing).toContain("Rejoindre Team Demaa");
    expect(landing).not.toContain("Tester un projet");
    expect(landing).not.toContain("mailto:");
    expect(landing).toContain("DEMAA_STUDIO_PROJECTS.map");
    expect(projects).toContain('name: "Tiimora"');
    expect(projects).toContain('name: "Oryka"');
    expect(projects).toContain('name: "Revyo"');
    expect(projects).not.toContain("Tendera");
    expect(projects).toContain("Projet actif · Équipe constituée");
    expect(projects.match(/Version en ligne/g)).toHaveLength(2);
  });
});
