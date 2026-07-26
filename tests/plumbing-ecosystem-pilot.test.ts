import { describe, expect, it } from "vitest";

import { plumbingPilotEcosystemRecommendations } from "../src/lib/plumbing-ecosystem-pilot";

const allowedCategories = new Set([
  "Outil métier",
  "Professionnel",
  "Fournisseur",
  "Formalité",
  "Banque / assurance / financement",
  "Accompagnement",
]);

describe("plumbing ecosystem pilot", () => {
  it("propose un écosystème court et exploitable", () => {
    expect(plumbingPilotEcosystemRecommendations).toHaveLength(13);
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

  it("présente la mise en place clé en main comme une prestation sur devis", () => {
    const turnkeySystem = plumbingPilotEcosystemRecommendations.filter(
      (recommendation) =>
        recommendation.category === "Accompagnement" &&
        recommendation.need === "Mettre en place le système dans l’entreprise",
    );

    expect(turnkeySystem).toHaveLength(1);
    expect(turnkeySystem[0].name).toBe("Système opérationnel clé en main");
    expect(turnkeySystem[0].cost).toBe("Sur devis");
    expect(turnkeySystem[0].recommendation).toContain("adapter les process");
    expect(turnkeySystem[0].recommendation).toContain("mettre le système en place");
    expect(turnkeySystem[0].note).toContain("Premier échange offert");
    expect(turnkeySystem[0].note).toContain("devis");
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
      url: "https://demaa.fr/annuaire-experts-comptables/cabinets/em2a-expertise",
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
