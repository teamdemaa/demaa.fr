import { describe, expect, it } from "vitest";
import {
  getAcademyCaseStudies,
  getAcademyFundamentals,
} from "@/lib/academy-course-content";
import { PUBLIC_EDITORIAL_VISIBILITY } from "@/lib/public-editorial-visibility";

describe("Academy content sections", () => {
  it("publishes only the fifteen process guides in Organiser while preserving historical content", () => {
    const fundamentals = getAcademyFundamentals();
    const caseStudies = getAcademyCaseStudies();
    const processGuides = caseStudies.filter((content) => content.processGuide);
    const historicalCases = caseStudies.filter((content) => !content.processGuide);

    expect(PUBLIC_EDITORIAL_VISIBILITY.academyTutorials).toBe(true);
    expect(PUBLIC_EDITORIAL_VISIBILITY.academyFormations).toBe(false);
    expect(caseStudies).toHaveLength(21);
    expect(processGuides).toHaveLength(15);
    expect(historicalCases).toHaveLength(6);
    expect(fundamentals).toHaveLength(8);
    expect(caseStudies.every((content) => content.kind === "case-study")).toBe(true);
    expect(fundamentals.every((content) => content.kind === "course")).toBe(true);
  });

  it("preserves the five historical formation themes outside the public Organiser index", () => {
    const categoriesBySlug = Object.fromEntries(
      getAcademyFundamentals().map((content) => [
        content.identity.slug,
        content.identity.category,
      ]),
    );

    expect(categoriesBySlug).toEqual({
      "comprendre-chiffre-affaires-benefice": "Finances et trésorerie",
      "construire-offre-facile-a-acheter": "Prix et offre",
      "construire-systeme-marketing-vente": "Marketing et ventes",
      "deleguer-sans-perdre-le-controle": "Délégation",
      "fixer-ses-prix-sans-vendre-a-perte": "Prix et offre",
      "livrer-prestation-sans-tout-reinventer": "Réalisation des prestations",
      "piloter-sa-tresorerie": "Finances et trésorerie",
      "transformer-demande-en-client": "Marketing et ventes",
    });
  });
});
