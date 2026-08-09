import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));
vi.mock("next/cache", () => ({
  unstable_cache: (callback: unknown) => callback,
}));

import {
  assertNoRetiredUniversalExpertisePlacements,
  buildExpertisePlacementSeeds,
} from "@/lib/expertise-placement-seeds";
import { getRenderableExpertiseSectionForSystem } from "@/lib/expertise-solutions.server";
import { getExpertiseReferralDisclosure } from "@/lib/solution-referral-disclosures.server";

describe("expertise placements", () => {
  it("seeds only the relevant cabinet-specific legal formalist", () => {
    const placements = buildExpertisePlacementSeeds();
    expect(placements).toHaveLength(1);
    expect(new Set(placements.map(({ expertisePlacementId }) => expertisePlacementId)).size)
      .toBe(1);
    expect(placements.some(({ expertiseId }) =>
      expertiseId === "chartered-accountant"
    )).toBe(false);
    expect(placements).toContainEqual(expect.objectContaining({
      systemSlug: "cabinet-comptable",
      expertiseId: "legal-formalist",
      nameOverride: "Délégation et formalités juridiques",
    }));
  });

  it("renders Prestations only where an explicit relevant placement exists", async () => {
    const restaurant = await getRenderableExpertiseSectionForSystem("restaurant");
    const accountant = await getRenderableExpertiseSectionForSystem("cabinet-comptable");
    expect(restaurant).toBeNull();
    expect(accountant?.placements[0]?.resource.name)
      .toBe("Délégation et formalités juridiques");
  });

  it("fails closed if a future import tries to reseed the retired universal placement", () => {
    const placement = {
      ...buildExpertisePlacementSeeds()[0],
      expertisePlacementId: "restaurant:chartered-accountant",
      expertiseId: "chartered-accountant",
      systemSlug: "restaurant",
    };
    expect(() => assertNoRetiredUniversalExpertisePlacements([placement]))
      .toThrow("ne doit jamais recréer");
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
