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

describe("server-only product Solutions registries", () => {
  it("contains zero published or draft product seeds", () => {
    expect(getPublishedSolutionResources()).toEqual([]);
    expect(getPublishedSolutionResourceBySlug("qonto")).toBeNull();
    expect(getPublishedSolutionResourceBySlug("unknown-resource")).toBeNull();
    expect(getPublishedSolutionResourceBySlug(42)).toBeNull();
    expect(getPublishedSolutionPlacementsForSystem("batiment")).toEqual([]);
    expect(getPublishedSolutionPlacementsForSystem("unknown-system")).toEqual([]);
    expect(getPublishedSolutionPlacementsForSystem(null)).toEqual([]);
    expect(getPublishedSolutionSectionsForSystem("batiment")).toEqual([]);
    expect(getPublishedSolutionSectionsForSystem({})).toEqual([]);
  });

  it("does not embed migration candidates in the product registry", () => {
    const path = fileURLToPath(new URL("../src/lib/solution-registry.server.ts", import.meta.url));
    const source = readFileSync(path, "utf8");
    expect(source).not.toMatch(/qonto|plateforme-du-batiment|capeb/i);
    expect(source).toContain("productSolutionResources: readonly unknown[] = deepFreeze([])");
    expect(source).toContain("productSolutionPlacements: readonly unknown[] = deepFreeze([])");
  });
});
