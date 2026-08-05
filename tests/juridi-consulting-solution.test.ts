import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import {
  JURIDI_CONSULTING_SOLUTION_PLACEMENTS,
  JURIDI_CONSULTING_SOLUTION_RESOURCE,
} from "@/lib/juridi-consulting-solution.server";
import {
  getPublishedSolutionPlacementsForSystem,
  getPublishedSolutionResourceBySlug,
} from "@/lib/solution-registry.server";
import {
  validateSolutionPlacement,
  validateSolutionResource,
} from "@/lib/solution-registry-contract";

const now = new Date("2026-08-05T12:00:00.000Z");

describe("JuridiConsulting solution", () => {
  it("publishes one reviewed referral resource without a commercial relationship", () => {
    expect(validateSolutionResource(JURIDI_CONSULTING_SOLUTION_RESOURCE, now)).toEqual([]);
    expect(getPublishedSolutionResourceBySlug("juridi-consulting", now)).toMatchObject({
      commercialRelationship: "none",
      interaction: {
        interactionMode: "referral_form",
        referralKey: "juridi-consulting",
      },
      resourceType: "provider",
    });
  });

  it("places the same resource in the three professional systems", () => {
    expect(JURIDI_CONSULTING_SOLUTION_PLACEMENTS.map(({ systemSlug }) => systemSlug))
      .toEqual(["cabinet-comptable", "cabinet-davocat", "notaire"]);
    for (const placement of JURIDI_CONSULTING_SOLUTION_PLACEMENTS) {
      expect(validateSolutionPlacement(placement, now)).toEqual([]);
      expect(getPublishedSolutionPlacementsForSystem(placement.systemSlug, now))
        .toContainEqual(expect.objectContaining({
          placementId: placement.placementId,
          resource: expect.objectContaining({ resourceSlug: "juridi-consulting" }),
          section: "providers",
        }));
    }
  });
});
