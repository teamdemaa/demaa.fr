import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";
import {
  getLiveSessionPurchaseDetails,
  getPublicLiveSessionSlot,
  getPublicLiveTrainings,
  PUBLIC_LIVE_CATALOG_VERSION,
} from "@/lib/live-session-catalog";
import {
  getContextualAcademyCaseStudy,
  getContextualAcademyCaseStudyPlacements,
} from "@/lib/academy-case-study-placement";
import { enterpriseCatalog } from "@/lib/enterprise-annuaire";
import { getAllCourseEntries, getCourseEntryBySlug } from "@/lib/course-content";
import { getAcademyContentBySlug } from "@/lib/academy-course-content";

describe("Academy live sessions and contextual cases", () => {
  it("publishes exactly the six validated 2 h themes at 250 € HT without inventing dates", () => {
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
        title: content?.identity.card.title,
      });
    }
  });

  it("orders the Academy sections and removes only the global cases index", async () => {
    const source = await readFile(
      new URL("../src/components/AcademyIndexClient.tsx", import.meta.url),
      "utf8",
    );
    expect(source.indexOf("Cours fondamentaux")).toBeLessThan(source.indexOf("<AcademyLiveTrainingSection"));
    expect(source.indexOf("<AcademyLiveTrainingSection")).toBeLessThan(source.indexOf("Modèles et documents"));
    expect(source).not.toContain("Cas concrets");
  });

  it("hides the two archived presentations from the public course index while preserving direct resolution", () => {
    expect(getAllCourseEntries().map((entry) => entry.slug)).not.toEqual(expect.arrayContaining([
      "obligations-finances-entreprise",
      "facture-electronique",
    ]));
    expect(getCourseEntryBySlug("obligations-finances-entreprise")).not.toBeNull();
    expect(getCourseEntryBySlug("facture-electronique")).not.toBeNull();
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
