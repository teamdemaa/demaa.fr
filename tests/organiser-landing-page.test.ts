import { existsSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { getArchivedOrganisationContent } from "@/lib/content-catalog";
import {
  ACADEMY_PERMANENT_REDIRECTS,
  ARCHIVED_ACADEMY_DESTINATION,
} from "@/lib/academy-course-routes";
import { getPublishedCopyableModelBySlug } from "@/lib/copyable-model-catalog";
import { getPublishedTutorials } from "@/lib/tutorial-catalog";

const read = (path: string) => readFileSync(path, "utf8");

describe("Outils and Tutoriels public journey", () => {
  it("publishes one focused tutorial library without internal tabs", () => {
    const page = read("src/app/(marketing)/tutoriels/page.tsx");
    const hub = read("src/components/TutorialsHub.tsx");
    const library = read("src/components/TutorialLibrary.tsx");

    expect(page).toContain("<TutorialsHub />");
    expect(page).toContain('path: "/tutoriels"');
    expect(hub).toContain("Mieux utiliser ses outils");
    expect(hub).toContain("étape par étape");
    expect(library).toContain("Rechercher un tutoriel");
    expect(library).toContain("SlidersHorizontal");
    expect(library).toContain('aria-label="Filtrer les tutoriels par thème"');
    expect(library).toContain('aria-live="polite"');
    expect(library).toContain("Tutoriel");
    expect(library).not.toContain('role="tablist"');
    expect(library).not.toContain("Modèles prêts à copier");
  });

  it("launches four real Airtable tutorials linked to existing Demaa models", () => {
    const tutorials = getPublishedTutorials();
    expect(tutorials).toHaveLength(4);
    expect(tutorials.map(({ title }) => title)).toEqual([
      "Créer un pipeline commercial dans Airtable",
      "Suivre ses devis et ses relances dans Airtable",
      "Organiser ses projets et missions clients dans Airtable",
      "Planifier ses interventions et chantiers dans Airtable",
    ]);
    expect(tutorials.every(({ tool }) => tool === "Airtable")).toBe(true);
    expect(tutorials.every(({ fields, steps }) => fields.length >= 7 && steps.length === 5)).toBe(true);
    expect(tutorials.map(({ modelSlug }) => modelSlug)).toEqual([
      "suivi-commercial-et-devis",
      "suivi-commercial-et-devis",
      "projets-et-missions-clients",
      "interventions-et-chantiers",
    ]);
    expect(tutorials.every(({ modelSlug }) => (
      getPublishedCopyableModelBySlug(modelSlug) !== null
    ))).toBe(true);
    expect(new Set(tutorials.map(({ slug }) => slug)).size).toBe(tutorials.length);
    expect(new Set(tutorials.map(({ title }) => title)).size).toBe(tutorials.length);

    for (const tutorial of tutorials) {
      expect(Date.parse(tutorial.publishedAt)).not.toBeNaN();
      expect(Date.parse(tutorial.updatedAt)).not.toBeNaN();
      expect(Date.parse(tutorial.updatedAt)).toBeGreaterThanOrEqual(
        Date.parse(tutorial.publishedAt),
      );
      expect(existsSync(`public${tutorial.thumbnail.split("?")[0]}`)).toBe(true);
      for (const step of tutorial.steps) {
        if (step.screenshot) {
          expect(existsSync(`public${step.screenshot.src}`)).toBe(true);
        }
      }
    }
  });

  it("uses official Demaa thumbnails and real screenshots only where they explain a key step", () => {
    const firstTutorial = getPublishedTutorials()[0]!;
    const article = read("src/components/TutorialArticle.tsx");
    const thumbnailCatalog = read("src/lib/organiser-thumbnail-catalog.ts");

    expect(firstTutorial.steps.filter(({ screenshot }) => screenshot)).toHaveLength(2);
    expect(existsSync("public/images/tutoriels/creer-pipeline-commercial-airtable/opportunites.png")).toBe(true);
    expect(existsSync("public/images/tutoriels/creer-pipeline-commercial-airtable/pipeline.png")).toBe(true);
    expect(thumbnailCatalog).toContain('slug: "creer-pipeline-commercial-airtable"');
    expect(article).toContain("<CopyableTutorialTable");
    expect(article).toContain("Copier le modèle");
    expect(article).toContain("step.screenshot");
  });

  it("exposes tutorial-specific sharing metadata and complete structured data", () => {
    const route = read("src/app/(marketing)/tutoriels/[slug]/page.tsx");

    expect(route).toContain("socialImage:");
    expect(route).toContain("url: tutorial.thumbnail");
    expect(route).toContain('"@type": "BreadcrumbList"');
    expect(route).toContain('"@type": "HowTo"');
    expect(route).toContain('inLanguage: "fr-FR"');
    expect(route).toContain("image: `${origin}${thumbnailPath}`");
    expect(route).toContain('replace(/</g, "\\\\u003c")');
  });

  it("keeps Outils limited to software and copyable models", () => {
    const toolsPage = read("src/app/(marketing)/outils/page.tsx");
    const toolsHub = read("src/components/SystemsHubPage.tsx");
    const visibility = read("src/lib/public-solution-section-visibility.ts");

    expect(toolsPage).toContain('path: "/outils"');
    expect(toolsPage).toContain("<SystemsHubPage enterprises={enterprises} />");
    expect(toolsHub).toContain("<HomeTabsClient");
    expect(toolsHub).toContain("<ToolsModelsSection");
    expect(toolsHub).not.toContain("getEnterpriseCatalog");
    expect(visibility).toContain('section === "software"');
  });

  it("archives the former Organisation catalogue while preserving its source", () => {
    const sitemap = read("src/app/sitemap.ts");
    expect(getArchivedOrganisationContent()).toHaveLength(20);
    expect(existsSync("src/components/OrganiserHub.tsx")).toBe(true);
    expect(existsSync("src/components/OrganiserLibrary.tsx")).toBe(true);
    expect(sitemap).not.toContain("getPublishedOrganisationContent");
    expect(sitemap).not.toContain("getPublicOrganiserContent");
    expect(ACADEMY_PERMANENT_REDIRECTS).toContainEqual({
      source: "/organiser",
      destination: ARCHIVED_ACADEMY_DESTINATION,
      permanent: true,
    });
    expect(ACADEMY_PERMANENT_REDIRECTS).toContainEqual({
      source: "/organiser/:path*",
      destination: ARCHIVED_ACADEMY_DESTINATION,
      permanent: true,
    });
  });
});
