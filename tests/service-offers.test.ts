import { describe, expect, it } from "vitest";
import { getDemaaServiceBySlug } from "@/lib/service-catalog";

describe("services displayed in operational kits", () => {
  it("keeps the strategic session free and without a paid-service promise", () => {
    const service = getDemaaServiceBySlug("organisation-automatisation");

    expect(service).toMatchObject({
      name: "Appel découverte gratuit",
      duration: "30 minutes",
      price: "Gratuit",
    });
    expect(service?.description).toContain("sans engagement");
  });

  it("presents the custom system as a delivered solution rather than consulting", () => {
    expect(getDemaaServiceBySlug("organisation-equipes")).toMatchObject({
      name: "Système opérationnel clé en main",
      duration: "Selon le périmètre",
      price: "Sur devis",
    });
    expect(
      getDemaaServiceBySlug("organisation-equipes")?.description,
    ).toContain("mettons en place");
    expect(
      getDemaaServiceBySlug("organisation-equipes")?.deliverables,
    ).toContain("Mise en place dans votre environnement");
  });

  it("keeps the validated accounting offer", () => {
    expect(getDemaaServiceBySlug("expert-comptable")).toMatchObject({
      name: "Trouver un expert-comptable",
      duration: "Mise en relation",
      price: "Gratuit",
    });
    expect(
      getDemaaServiceBySlug("expert-comptable")?.deliverables,
    ).toContain("Jusqu’à 3 cabinets adaptés");
  });
});
