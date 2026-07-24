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

  it("uses the validated structure and accounting offers", () => {
    expect(getDemaaServiceBySlug("organisation-equipes")).toMatchObject({
      name: "Accompagnement structuration & pilotage",
      duration: "3 mois · point tous les 15 jours",
      price: "500 € HT / mois",
    });
    expect(getDemaaServiceBySlug("expert-comptable")).toMatchObject({
      name: "Expert-comptable",
      duration: "Suivi mensuel",
      price: "À partir de 250 € HT / mois",
    });
  });
});
