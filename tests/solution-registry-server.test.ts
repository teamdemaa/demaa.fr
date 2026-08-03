import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import {
  getPublishedSolutionPlacementsForSystem,
  getPublishedSolutionResourceBySlug,
  getPublishedSolutionResources,
  getPublishedSolutionSectionsForSystem,
} from "@/lib/solution-registry.server";
import {
  LEVIER_PLACEMENT_SYSTEM_SLUGS,
  LEVIER_SOLUTION_PLACEMENTS,
  LEVIER_SOLUTION_RESOURCE,
} from "@/lib/levier-solution-registry.server";
import { enterpriseCatalog } from "@/lib/enterprise-annuaire";

describe("server-only product Solutions registries", () => {
  it("publishes Levier first on every system after the reviewed asset handoff", () => {
    expect(getPublishedSolutionResources()).toEqual([
      expect.objectContaining({
        resourceSlug: "levier",
        resourceType: "tool",
        name: "Levier",
        interaction: { interactionMode: "system_delivery" },
      }),
    ]);
    expect(getPublishedSolutionResourceBySlug("qonto")).toBeNull();
    expect(getPublishedSolutionResourceBySlug("unknown-resource")).toBeNull();
    expect(getPublishedSolutionResourceBySlug(42)).toBeNull();
    expect(getPublishedSolutionPlacementsForSystem("batiment")).toEqual([
      expect.objectContaining({
        rank: 1,
        resource: expect.objectContaining({
          resourceSlug: "levier",
          interaction: { interactionMode: "system_delivery" },
        }),
      }),
    ]);
    expect(getPublishedSolutionPlacementsForSystem("unknown-system")).toEqual([]);
    expect(getPublishedSolutionPlacementsForSystem(null)).toEqual([]);
    expect(getPublishedSolutionSectionsForSystem("batiment")).toEqual([
      expect.objectContaining({
        section: "software",
        placements: [expect.objectContaining({
          rank: 1,
          resource: expect.objectContaining({ resourceSlug: "levier" }),
        })],
      }),
    ]);
    expect(getPublishedSolutionSectionsForSystem({})).toEqual([]);

    expect(LEVIER_SOLUTION_RESOURCE).toMatchObject({
      resourceSlug: "levier",
      resourceType: "tool",
      interactionMode: "system_delivery",
      status: "published",
      publicationBlockers: [],
    });
    expect(LEVIER_SOLUTION_PLACEMENTS).toHaveLength(115);
    expect(LEVIER_PLACEMENT_SYSTEM_SLUGS).toEqual(
      enterpriseCatalog.map(({ slug }) => slug),
    );
    expect(LEVIER_SOLUTION_PLACEMENTS.every((placement) =>
      placement.rank === 1 &&
      placement.status === "published" &&
      placement.publicationBlockers.length === 0
    )).toBe(true);
  });

  it("does not embed migration candidates in the product registry", () => {
    const path = fileURLToPath(new URL("../src/lib/solution-registry.server.ts", import.meta.url));
    const source = readFileSync(path, "utf8");
    expect(source).not.toMatch(/qonto|plateforme-du-batiment|capeb/i);
    expect(source).toContain("LEVIER_SOLUTION_RESOURCE");
    expect(source).toContain("LEVIER_SOLUTION_PLACEMENTS");
  });
});
