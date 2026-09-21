import { existsSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { getArchivedOrganisationContent } from "@/lib/content-catalog";
import {
  ACADEMY_PERMANENT_REDIRECTS,
  ARCHIVED_ACADEMY_DESTINATION,
} from "@/lib/academy-course-routes";
import { getPublishedCopyableModelBySlug } from "@/lib/copyable-model-catalog";
import {
  getPublishedMethods,
  getPublishedPracticeTutorials,
  getPublishedTutorials,
} from "@/lib/tutorial-catalog";

const read = (path: string) => readFileSync(path, "utf8");

describe("Méthodes, Modèles and Outils public journey", () => {
  it("publishes one focused method library with the shared resource navigation", () => {
    const page = read("src/app/(marketing)/tutoriels/page.tsx");
    const hub = read("src/components/TutorialsHub.tsx");
    const library = read("src/components/TutorialLibrary.tsx");

    expect(page).toContain("<TutorialsHub />");
    expect(page).toContain('path: "/tutoriels"');
    expect(hub).toContain('<ResourcesNavigation activeView="tutorials" />');
    expect(hub).toContain("getPublishedMethods");
    expect(hub).not.toContain("getPublishedTutorials");
    expect(hub).toContain("Des méthodes concrètes pour reprendre,");
    expect(hub).toContain("structurer ou vendre");
    expect(hub).toContain("demaa-hero-title block text-dema-forest");
    expect(hub).not.toContain("demaa-hero-title block font-normal");
    expect(hub).not.toContain("étape par étape");
    expect(hub).not.toContain("gagner du temps et faire avancer votre entreprise");
    expect(hub).not.toContain("Tutoriels pratiques");
    expect(hub).not.toContain("modèles Demaa");
    expect(page).not.toContain("modèles Demaa");
    expect(library).toContain("Rechercher une méthode");
    expect(library).toContain("SlidersHorizontal");
    expect(library).toContain('className="demaa-search-control"');
    expect(library).not.toContain("focus:ring-2 focus:ring-dema-forest/20");
    expect(library).toContain('aria-label="Filtrer les méthodes par thème"');
    expect(library).toContain('aria-live="polite"');
    expect(library).not.toContain("<span>Tutoriel</span>");
    expect(library).not.toContain("tutorial.minutes");
    expect(library).not.toContain('role="tablist"');
    expect(library).not.toContain("Modèles prêts à copier");
  });

  it("publishes five concise methods and keeps four Airtable implementations", () => {
    const tutorials = getPublishedTutorials();
    const methods = getPublishedMethods();
    const practiceTutorials = getPublishedPracticeTutorials();

    expect(tutorials).toHaveLength(9);
    expect(methods.map(({ title }) => title)).toEqual([
      "Votre entreprise peut-elle fonctionner un mois sans vous ?",
      "Comment présenter son entreprise à un repreneur en une page ?",
      "Comment obtenir une première estimation réaliste de son entreprise ?",
      "Les 10 questions à poser avant d’étudier une entreprise à reprendre",
      "Que transmettre à un repreneur ?",
    ]);
    expect(methods.every(({ readingMinutes }) => readingMinutes >= 5 && readingMinutes <= 7)).toBe(true);
    expect(methods.every(({ action, sources, cta }) => (
      Number.parseInt(action.duration, 10) <= 30
      && sources.length >= 2
      && cta.href.startsWith("/")
    ))).toBe(true);

    expect(practiceTutorials.map(({ title }) => title)).toEqual([
      "Créer un pipeline commercial dans Airtable",
      "Suivre ses devis et ses relances dans Airtable",
      "Organiser ses projets et missions clients dans Airtable",
      "Planifier ses interventions et chantiers dans Airtable",
    ]);
    expect(practiceTutorials.every(({ tool }) => tool === "Airtable")).toBe(true);
    expect(practiceTutorials.every(({ fields, steps }) => fields.length >= 7 && steps.length === 5)).toBe(true);
    expect(practiceTutorials.map(({ modelSlug }) => modelSlug)).toEqual([
      "suivi-commercial-et-devis",
      "suivi-commercial-et-devis",
      "projets-et-missions-clients",
      "interventions-et-chantiers",
    ]);
    expect(practiceTutorials.every(({ modelSlug }) => (
      getPublishedCopyableModelBySlug(modelSlug) !== null
    ))).toBe(true);
    expect(new Set(tutorials.map(({ slug }) => slug)).size).toBe(tutorials.length);
    expect(new Set(tutorials.map(({ title }) => title)).size).toBe(tutorials.length);

    for (const tutorial of practiceTutorials) {
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
    const firstTutorial = getPublishedTutorials().find((tutorial) => tutorial.format === "practice")!;
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

  it("exposes method and implementation structured data", () => {
    const route = read("src/app/(marketing)/tutoriels/[slug]/page.tsx");

    expect(route).toContain("socialImage:");
    expect(route).toContain("url: tutorial.thumbnail");
    expect(route).toContain('"@type": "BreadcrumbList"');
    expect(route).toContain('"@type": "Article"');
    expect(route).toContain('"@type": "HowTo"');
    expect(route).toContain('inLanguage: "fr-FR"');
    expect(route).toContain('citation: tutorial.sources.map(({ url }) => url)');
    expect(route).toContain('image: `${origin}${tutorial.thumbnail.split("?")[0]}`');
    expect(route).not.toContain("totalTime");
    expect(route).not.toContain("tutorial.minutes");
    expect(route).toContain('replace(/</g, "\\\\u003c")');
  });

  it("uses Solutions as the public entry point for the existing métier catalogue", () => {
    const toolsPage = read("src/app/(marketing)/outils/page.tsx");
    const toolsHub = read("src/components/SystemsHubPage.tsx");
    const visibility = read("src/lib/public-solution-section-visibility.ts");

    expect(toolsPage).toContain('path: "/outils"');
    expect(toolsPage).toContain("<SystemsHubPage enterprises={enterprises} />");
    expect(toolsHub).toContain("<HomeTabsClient");
    expect(toolsHub).not.toContain("ResourcesNavigation");
    expect(toolsHub).not.toContain("ToolsModelsSection");
    expect(toolsHub).not.toContain("getPublishedCopyableModels");
    expect(toolsHub).not.toContain("getEnterpriseCatalog");
    expect(visibility).toContain("filterPublicSolutionSections(sections)");
  });

  it("keeps the former Organisation catalogue accessible through Academy", () => {
    const sitemap = read("src/app/sitemap.ts");
    expect(getArchivedOrganisationContent()).toHaveLength(20);
    expect(existsSync("src/components/OrganiserHub.tsx")).toBe(true);
    expect(existsSync("src/components/OrganiserLibrary.tsx")).toBe(true);
    expect(sitemap).not.toContain("getPublishedOrganisationContent");
    expect(sitemap).not.toContain("getPublicOrganiserContent");
    expect(ACADEMY_PERMANENT_REDIRECTS).toContainEqual({
      source: "/organiser",
      destination: "/academie",
      permanent: true,
    });
    expect(ACADEMY_PERMANENT_REDIRECTS).not.toContainEqual(
      expect.objectContaining({ source: "/organiser/:path*" }),
    );
  });

  it("gives Academy the same searchable entry pattern as Solutions", () => {
    const hub = read("src/components/OrganiserHub.tsx");
    const search = read("src/components/AcademySearchHub.tsx");

    expect(hub).toContain("<AcademySearchHub courses={courses} />");
    expect(hub).toContain("ACADEMY_REFERENCE_ARTWORK");
    expect(hub).toContain("comprendre-chiffre-affaires-benefice-v4.png");
    expect(hub).toContain("fixer-ses-prix-sans-vendre-a-perte-v4.png");
    expect(search).toContain("Organiser et piloter son entreprise,");
    expect(search).toContain("un sujet à la fois.");
    expect(search).toContain('className="demaa-search-shell p-1.5"');
    expect(search).toContain("SlidersHorizontal");
    expect(search).toContain("Rechercher une méthode, un sujet...");
  });
});
