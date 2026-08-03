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
  it("keeps the staged Levier seed fail-closed before the final asset handoff", () => {
    expect(getPublishedSolutionResources()).toEqual([]);
    expect(getPublishedSolutionResourceBySlug("qonto")).toBeNull();
    expect(getPublishedSolutionResourceBySlug("unknown-resource")).toBeNull();
    expect(getPublishedSolutionResourceBySlug(42)).toBeNull();
    expect(getPublishedSolutionPlacementsForSystem("batiment")).toEqual([]);
    expect(getPublishedSolutionPlacementsForSystem("unknown-system")).toEqual([]);
    expect(getPublishedSolutionPlacementsForSystem(null)).toEqual([]);
    expect(getPublishedSolutionSectionsForSystem("batiment")).toEqual([]);
    expect(getPublishedSolutionSectionsForSystem({})).toEqual([]);

    expect(LEVIER_SOLUTION_RESOURCE).toMatchObject({
      resourceSlug: "levier",
      resourceType: "tool",
      interactionMode: "system_delivery",
      status: "draft",
      publicationBlockers: ["Levier.xlsx final non remis"],
    });
    expect(LEVIER_SOLUTION_PLACEMENTS).toHaveLength(115);
    expect(LEVIER_PLACEMENT_SYSTEM_SLUGS).toEqual(
      enterpriseCatalog.map(({ slug }) => slug),
    );
    expect(LEVIER_SOLUTION_PLACEMENTS.every((placement) =>
      placement.rank === 1 &&
      placement.status === "draft" &&
      placement.publicationBlockers.length === 1
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
