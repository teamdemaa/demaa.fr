import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));
vi.mock("next/cache", () => ({
  unstable_cache: (callback: unknown) => callback,
}));

import { buildExpertisePlacementSeeds } from "@/lib/expertise-placement-seeds";
import { getRenderableExpertiseSectionForSystem } from "@/lib/expertise-solutions.server";
import { getExpertiseReferralDisclosure } from "@/lib/solution-referral-disclosures.server";

describe("expertise placements", () => {
  it("offers one canonical expertise per system without recommending an accountant to accountants", () => {
    const placements = buildExpertisePlacementSeeds();
    expect(placements).toHaveLength(115);
    expect(new Set(placements.map(({ expertisePlacementId }) => expertisePlacementId)).size)
      .toBe(115);
    expect(placements.some(({ systemSlug, expertiseId }) =>
      systemSlug === "cabinet-comptable" && expertiseId === "chartered-accountant"
    )).toBe(false);
    expect(placements).toContainEqual(expect.objectContaining({
      systemSlug: "cabinet-comptable",
      expertiseId: "legal-formalist",
      nameOverride: "Délégation et formalités juridiques",
    }));
  });

  it("renders expertises in a dedicated Prestations section", async () => {
    const restaurant = await getRenderableExpertiseSectionForSystem("restaurant");
    const accountant = await getRenderableExpertiseSectionForSystem("cabinet-comptable");
    expect(restaurant?.section).toBe("services");
    expect(restaurant?.placements[0]?.resource.name).toBe("Expert-comptable");
    expect(accountant?.placements[0]?.resource.name)
      .toBe("Délégation et formalités juridiques");
  });

  it("uses a neutral disclosure without claiming a Demaa partnership", () => {
    const disclosure = getExpertiseReferralDisclosure({
      placementId: "restaurant:chartered-accountant",
      resourceSlug: "chartered-accountant",
      now: new Date("2026-08-08T12:00:00.000Z"),
    });
    expect(disclosure?.commercialRelationship).toBe("none");
    expect(disclosure?.transparency).not.toMatch(/partenaire|affili/i);
  });
});
