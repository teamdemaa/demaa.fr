import { describe, expect, it } from "vitest";
import { getDemaaServiceBySlug } from "@/lib/service-catalog";

describe("services displayed in operational kits", () => {
  it("keeps the strategic session free and without a paid-service promise", () => {
    const service = getDemaaServiceBySlug("organisation-automatisation");

    expect(service).toMatchObject({
      name: "Session stratégique offerte avec un spécialiste",
      duration: "30 minutes",
      price: "Offerte",
    });
    expect(service?.description).toContain("sans engagement");
  });

  it("uses the validated structure and accounting offers", () => {
    expect(getDemaaServiceBySlug("organisation-equipes")).toMatchObject({
      name: "Structuration & pilotage",
      duration: "1 mois",
      price: "1 500 € HT",
    });
    expect(getDemaaServiceBySlug("expert-comptable")).toMatchObject({
      name: "Expert-comptable",
      duration: "Suivi mensuel",
      price: "À partir de 250 € HT / mois",
    });
  });
});
