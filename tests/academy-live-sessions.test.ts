import { access, readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";
import {
  getLiveSessionPurchaseDetails,
  getPublicLiveSessionSlot,
  getPublicLiveTrainings,
  getVisibleAcademyLiveTrainings,
  PUBLIC_LIVE_CATALOG_VERSION,
} from "@/lib/live-session-catalog";
import {
  getContextualAcademyCaseStudy,
  getContextualAcademyCaseStudyPlacements,
  getVisibleContextualAcademyCaseStudy,
} from "@/lib/academy-case-study-placement";
import { PUBLIC_EDITORIAL_VISIBILITY } from "@/lib/public-editorial-visibility";
import { enterpriseCatalog } from "@/lib/enterprise-annuaire";
import { getAcademyContentBySlug } from "@/lib/academy-course-content";

describe("Academy live sessions and contextual cases", () => {
  it("preserves exactly the six validated 2 h themes at 250 € HT without inventing dates", () => {
    const trainings = getPublicLiveTrainings();
    expect(trainings.map((training) => training.title)).toEqual([
      "Être visible sur Google",
      "Trouver des clients",
      "Communiquer sur les réseaux sociaux",
      "Vendre et convaincre",
      "Utiliser les outils numériques et l’IA",
      "Maîtriser la gestion financière et le cadre légal de son entreprise",
    ]);
    for (const training of trainings) {
      expect(training).toMatchObject({
        duration: "2 h",
        publicationStatus: "published",
        catalogVersion: PUBLIC_LIVE_CATALOG_VERSION,
        scheduleValidationStatus: "pending",
        unitAmount: 250_00,
        validationStatus: "validated",
      });
      expect(training.slots).toEqual([]);
    }
    expect(getPublicLiveSessionSlot("etre-visible-sur-google", "unvalidated-slot")).toBeNull();
  });

  it("hides live trainings from the public Academy through a reversible gate", () => {
    expect(PUBLIC_EDITORIAL_VISIBILITY.academyLiveTrainings).toBe(false);
    expect(PUBLIC_EDITORIAL_VISIBILITY.academyTutorials).toBe(false);
    expect(getVisibleAcademyLiveTrainings()).toEqual([]);
  });

  it("preserves historical Stripe purchase decoding without exposing it in registration", () => {
    expect(getLiveSessionPurchaseDetails(
      "session-direct-obligations-finances-entreprise-2026-08-18-1000--systeme-cabinet-comptable",
    )).toMatchObject({
      sourceSystemSlug: "cabinet-comptable",
      training: { duration: "2 h 30", unitAmount: 149_00 },
    });
  });

  it("uses only the six explicitly validated contextual mappings", () => {
    expect(getContextualAcademyCaseStudyPlacements()).toEqual([
      { systemSlug: "cabinet-de-conseil", contentSlug: "cabinet-conseil-acquisition" },
      { systemSlug: "reparation-informatique-mobile", contentSlug: "maintenance-informatique-acquisition" },
      { systemSlug: "agence-de-recrutement", contentSlug: "cabinet-recrutement-acquisition" },
      { systemSlug: "nettoyage-professionnel", contentSlug: "nettoyage-professionnel-acquisition" },
      { systemSlug: "organisme-de-formation", contentSlug: "formation-b2b-acquisition" },
      { systemSlug: "bureau-etudes", contentSlug: "bureau-etudes-acquisition" },
    ]);
    expect(enterpriseCatalog.filter((system) => getContextualAcademyCaseStudy(system.slug))).toHaveLength(6);
    expect(getContextualAcademyCaseStudy("infogerance-informatique")).toBeNull();
    expect(getContextualAcademyCaseStudy("formation-en-ligne")).toBeNull();
    expect(getContextualAcademyCaseStudy("cabinet-etudes")).toBeNull();
    for (const placement of getContextualAcademyCaseStudyPlacements()) {
      const content = getAcademyContentBySlug(placement.contentSlug);
      const contextual = getContextualAcademyCaseStudy(placement.systemSlug);
      expect(contextual).toMatchObject({
        contentSlug: content?.identity.slug,
        promise: content?.identity.promise,
      });
      expect(contextual?.title).not.toContain("—");
    }
  });

  it("hides contextual case-study placements from public system resources", () => {
    expect(PUBLIC_EDITORIAL_VISIBILITY.systemContextualCaseStudies).toBe(false);
    for (const placement of getContextualAcademyCaseStudyPlacements()) {
      expect(getVisibleContextualAcademyCaseStudy(placement.systemSlug)).toBeNull();
    }
  });

  it("shows only Courses while keeping Tutorials and Webinars dormant", async () => {
    const [clientSource, pageSource] = await Promise.all([
      readFile(
        new URL("../src/components/AcademyIndexClient.tsx", import.meta.url),
        "utf8",
      ),
      readFile(new URL("../src/app/(marketing)/academie/page.tsx", import.meta.url), "utf8"),
    ]);
    expect(clientSource).not.toContain("Cours fondamentaux");
    expect(clientSource).not.toContain("<AcademyLiveTrainingSection");
    expect(clientSource).toContain('label: "Tutoriels"');
    expect(clientSource).toContain('label: "Cours"');
    expect(clientSource).toContain("visible: PUBLIC_EDITORIAL_VISIBILITY.academyTutorials");
    expect(clientSource).toContain('{ id: "courses", label: "Cours", visible: true }');
    expect(clientSource).not.toContain('label: "Ateliers"');
    expect(clientSource).not.toContain('label: "Cas concrets"');
    expect(clientSource).not.toContain("WEBINARS_ACADEMY_SECTION");
    expect(clientSource).toContain("const academySections = VISIBLE_ACADEMY_SECTIONS");
    expect(clientSource).toContain("const hasSectionNavigation = academySections.length > 1");
    expect(clientSource).toContain("{hasSectionNavigation ? (");
    expect(clientSource).toContain("VISIBLE_ACADEMY_SECTIONS[0].id");
    expect(clientSource).not.toContain("Les premiers ateliers arrivent bientôt.");
    expect(clientSource).not.toContain("overflow-x-auto");
    expect(clientSource).toContain('role="tablist"');
    expect(clientSource).toContain('role="tab"');
    expect(clientSource).toContain('aria-selected={activeSection === section.id}');
    expect(clientSource).toContain('aria-controls={`academy-panel-${section.id}`}');
    expect(clientSource).toContain("onKeyDown={(event) => {");
    expect(clientSource).toContain("const nextSection = getNextAcademySection(");
    expect(clientSource).toContain(
      ': { "aria-label": localeCode === "en" ? "Courses" : "Cours" })',
    );
    expect(clientSource).not.toContain('activeSection === "live"');
    expect(clientSource).not.toContain("Modèles et documents");
    expect(pageSource).not.toContain("getVisibleAcademyLiveTrainings()");
  });

  it("does not present published case studies as fictitious", () => {
    for (const content of [
      "cabinet-conseil-acquisition",
      "formation-b2b-acquisition",
      "maintenance-informatique-acquisition",
      "bureau-etudes-acquisition",
      "nettoyage-professionnel-acquisition",
      "cabinet-recrutement-acquisition",
    ].map((slug) => getAcademyContentBySlug(slug))) {
      expect(content).not.toBeNull();
      expect(JSON.stringify(content)).not.toMatch(/fictif|fictive/i);
    }
  });

  it("does not restore the retired public course catalog", async () => {
    await expect(
      access(new URL("../src/lib/course-content.ts", import.meta.url)),
    ).rejects.toThrow();
  });

  it("keeps the new registration path independent from Stripe checkout", async () => {
    const sources = await Promise.all([
      "../src/app/api/academy-live-registration/route.ts",
      "../src/components/AcademyLiveRegistrationModal.tsx",
      "../src/components/AcademyLiveTrainingSection.tsx",
    ].map((path) => readFile(new URL(path, import.meta.url), "utf8")));
    expect(sources.join("\n")).not.toMatch(/stripe|checkout|payment-intent/i);
  });
});
