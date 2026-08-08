import { describe, expect, it } from "vitest";

import { plumbingPilotEcosystemRecommendations } from "../src/lib/plumbing-ecosystem-pilot";

const allowedCategories = new Set([
  "Outil métier",
  "Professionnel",
  "Fournisseur",
  "Banque / assurance / financement",
]);

describe("plumbing ecosystem pilot", () => {
  it("propose un écosystème court et exploitable", () => {
    expect(plumbingPilotEcosystemRecommendations).toHaveLength(9);
    expect(
      new Set(
        plumbingPilotEcosystemRecommendations.map(
          (recommendation) => recommendation.need,
        ),
      ).size,
    ).toBe(plumbingPilotEcosystemRecommendations.length);
  });

  it("utilise uniquement les catégories et statuts du classeur", () => {
    for (const recommendation of plumbingPilotEcosystemRecommendations) {
      expect(allowedCategories.has(recommendation.category)).toBe(true);
      expect(["À comparer", "À étudier"]).toContain(
        recommendation.initialStatus,
      );
    }
  });

  it("fournit un lien HTTPS et une consigne concrète pour chaque besoin", () => {
    for (const recommendation of plumbingPilotEcosystemRecommendations) {
      expect(recommendation.url).toMatch(/^https:\/\//);
      expect(recommendation.name.length).toBeGreaterThan(2);
      expect(recommendation.recommendation.length).toBeGreaterThan(45);
      expect(recommendation.note.length).toBeGreaterThan(35);
      expect(
        [
          recommendation.category,
          recommendation.name,
          recommendation.recommendation,
          recommendation.note,
        ].join(" "),
      ).not.toMatch(/\bDemaa\b/i);
    }
  });

  it("ne contient aucune prestation humaine Demaa", () => {
    expect(
      plumbingPilotEcosystemRecommendations.some(
        (recommendation) =>
          recommendation.url.includes("/annuaire-services/"),
      ),
    ).toBe(false);
  });

  it("reprend les fournisseurs critiques déjà recommandés pour la plomberie", () => {
    const suppliers = plumbingPilotEcosystemRecommendations
      .filter((recommendation) => recommendation.category === "Fournisseur")
      .map((recommendation) => recommendation.name);

    expect(suppliers).toEqual(["CEDEO", "Würth", "Kiloutou"]);
  });

  it("recommande exclusivement EM2A Expertise pour l’expertise comptable", () => {
    const accountingRecommendations =
      plumbingPilotEcosystemRecommendations.filter(
        (recommendation) =>
          recommendation.category === "Professionnel" &&
          recommendation.need.includes("Comptabilité"),
      );

    expect(accountingRecommendations).toHaveLength(1);
    expect(accountingRecommendations[0]).toMatchObject({
      name: "EM2A Expertise",
      cost: "Sur devis",
      url: "https://demaa.co/annuaire-experts-comptables/cabinets/em2a-expertise",
    });
  });

  it("évite de faire croire que les trois outils métier doivent être cumulés", () => {
    const softwareRecommendations =
      plumbingPilotEcosystemRecommendations.filter(
        (recommendation) =>
          recommendation.category === "Outil métier" &&
          recommendation.cost !== "Gratuit",
      );

    expect(softwareRecommendations).toHaveLength(3);
    expect(
      softwareRecommendations.every(
        (recommendation) =>
          recommendation.initialStatus === "À comparer",
      ),
    ).toBe(true);
    expect(
      softwareRecommendations.some((recommendation) =>
        recommendation.note.toLowerCase().includes("ne pas cumuler"),
      ),
    ).toBe(true);
  });
});
