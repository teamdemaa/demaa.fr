import { existsSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const read = (path: string) => readFileSync(path, "utf8");

describe("Organiser public journey", () => {
  const organiserPage = read("src/app/(marketing)/organiser/page.tsx");
  const organiserHub = read("src/components/OrganiserHub.tsx");
  const organiserLibrary = read("src/components/OrganiserLibrary.tsx");
  const organiserDirectory = read("src/components/AcademyIndexClient.tsx");
  const processPage = read("src/app/(marketing)/organiser/processus/page.tsx");
  const processArticle = read("src/components/AcademyProcessGuideArticle.tsx");
  const videoOverview = read("src/components/CaseVideoOverview.tsx");

  it("publishes one searchable Organiser library grouped by content family", () => {
    const navbar = read("src/components/Navbar.tsx");

    expect(organiserPage).toContain("<OrganiserHub />");
    expect(organiserPage).not.toContain("OrganiserSectionNavigation");
    expect(organiserPage).toContain('path: "/organiser"');
    expect(organiserHub).toContain("Des cas concrets");
    expect(organiserHub).not.toContain("getPublishedCopyableModels");
    expect(organiserHub).toContain("getPublicOrganiserContent().flatMap");
    expect(organiserHub).toContain("getAllPublishedContent().map");
    expect(organiserHub).not.toContain("SOLUTION_RAIL_CLASS_NAME");
    expect(organiserHub).toContain("<OrganiserLibrary");
    expect(organiserHub).not.toContain("MentoratAutomationCta");
    expect(organiserHub).toContain("<StructureNewsletterBlock />");
    expect(organiserLibrary).toContain("Rechercher un processus ou un sujet");
    expect(organiserLibrary).toContain('aria-label="Rechercher dans Organisation"');
    expect(organiserLibrary).not.toContain('aria-label="Rechercher dans Organiser"');
    expect(organiserLibrary).not.toContain("Modèles prêts à copier");
    expect(organiserLibrary).toContain("Voir les modèles à copier");
    expect(organiserLibrary).toContain('href="/modeles?from=organisation"');
    expect(organiserLibrary).toContain('id="cas-concrets"');
    expect(organiserLibrary).not.toContain('aria-labelledby="organiser-models-heading"');
    expect(organiserLibrary).toContain("matchesSearchQuery");
    expect(organiserLibrary).not.toContain("Vidéos pratiques");
    expect(navbar).not.toContain("Diagnostic organisation");
  });

  it("publishes the complete case directory below the Organiser hub", () => {
    expect(processPage).toContain("<AcademyIndexClient");
    expect(processPage).toContain('path: "/organiser/processus"');
    expect(processPage).toContain(
      'backLink={{ href: "/organiser#cas-concrets", label: "← Retour à Organisation" }}',
    );
    expect(organiserDirectory).toContain('href="/diagnostic-organisation"');
    expect(organiserDirectory).toContain("Diagnostic organisation");
    expect(organiserDirectory).toContain("Gratuit · Sans engagement");
    expect(organiserDirectory.indexOf('className="grid grid-cols-1')).toBeLessThan(
      organiserDirectory.indexOf('href="/diagnostic-organisation"'),
    );
  });

  it("prepares every concrete case for a structured video", () => {
    expect(processArticle).toContain("<CaseVideoOverview");
    expect(processArticle).toContain("La situation de l’entreprise");
    expect(processArticle).toContain("Le processus, étape par étape");
    expect(processArticle).toContain('...(relatedModel ? ["Le modèle prêt à copier"] : [])');
    expect(processArticle).toContain("Les outils recommandés");
    expect(processArticle).toContain("La checklist");
    expect(processArticle.indexOf('title="Les outils recommandés"')).toBeLessThan(
      processArticle.indexOf('title="Le modèle prêt à copier"'),
    );
    expect(processArticle).toContain("NumberedSectionHeading");
    expect(processArticle).toContain('href="/organiser#cas-concrets"');
    expect(videoOverview).toContain("Au programme");
    expect(videoOverview).toContain("Vidéo à venir");
    expect(videoOverview).toContain("bg-dema-forest");
    expect(videoOverview).not.toContain("iframe");
  });

  it("keeps the French Organiser routes explicit and free of retired workspaces", () => {
    expect(existsSync("src/app/(marketing)/academie/page.tsx")).toBe(false);
    expect(existsSync("src/app/(marketing)/academie/[slug]/page.tsx")).toBe(false);
    expect(existsSync("src/components/OrganiserLandingPage.tsx")).toBe(false);
    expect(existsSync("src/components/OrganiserWorkspace.tsx")).toBe(false);
    expect(processPage).not.toContain("permanentRedirect");
  });
});
