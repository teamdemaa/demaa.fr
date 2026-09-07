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

  it("speaks to TPE leaders about a shared business need and keeps public terms out", async () => {
    const [landing, form, projects] = await Promise.all([
      readSource("src/components/DemaaStudioLandingPage.tsx"),
      readSource("src/components/StudioInterestForm.tsx"),
      readSource("src/lib/demaa-studio-projects.ts"),
    ]);

    expect(landing).toContain("Demaa Studio");
    expect(landing).toContain("Construisons le logiciel dont");
    expect(landing).toContain("Le point de départ n’est pas nécessairement une idée de logiciel");
    expect(landing).toContain("Vous apportez le métier. Nous construisons le produit avec vous");
    expect(landing).toContain("Nous validons avant de construire");
    expect(landing).toContain("aides et financements publics susceptibles de soutenir");
    expect(landing).toContain("L’éligibilité et l’obtention dépendent du projet");
    expect(landing).toContain("Échangeons sur un besoin métier");
    expect(landing).toContain("<StudioInterestForm />");
    expect(form).toContain('fetch("/api/studio-interest"');
    expect(form).toContain("Quel besoin reste mal couvert dans votre métier ?");
    expect(form).toContain("D’autres entreprises sont-elles concernées ?");
    expect(landing).not.toContain("Rejoindre Team Demaa");
    expect(landing).not.toContain("Un premier échange pour comprendre votre métier");
    expect(landing).not.toContain("Sparkles");
    expect(landing).not.toContain("30 %");
    expect(landing).not.toContain("25 %");
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
