import { describe, expect, it } from "vitest";

import {
  getToolDirectoryItemBySlug,
} from "@/lib/tool-directory";
import {
  getCuratedToolRecommendationsForSystem,
} from "@/lib/system-tool-recommendations";
import {
  selectRenderableSolutionSectionsFromRevision,
} from "@/lib/firebase-solution-registry-selection.server";
import { buildFirebaseSolutionRegistryMigrationRevision } from "@/lib/firebase-solution-registry-migration.server";

describe("French tool directory stabilization", () => {
  it("keeps verified Maliora and Nomad destinations available", () => {
    expect(getToolDirectoryItemBySlug("maliora")?.url).toBe(
      "https://www.maliora.fr/logiciel-coach-sportif",
    );
    expect(getToolDirectoryItemBySlug("nomad")?.url).toBe(
      "https://www.nomadcaisse.fr/",
    );
  });

  it("hides Kiute Pro while its public HTTPS destination is invalid", () => {
    expect(getToolDirectoryItemBySlug("kiute-pro")).toBeNull();
    expect(getCuratedToolRecommendationsForSystem("institut-de-beaute"))
      .not.toContain("kiute-pro");
    expect(getCuratedToolRecommendationsForSystem("salon-de-coiffure"))
      .not.toContain("kiute-pro");
  });

  it("blocks Kiute Pro even when an older registry revision still contains it", () => {
    const revision = buildFirebaseSolutionRegistryMigrationRevision(
      new Date("2026-08-20T10:00:00.000Z"),
    );
    const sections = selectRenderableSolutionSectionsFromRevision(
      revision,
      "institut-de-beaute",
      { now: new Date("2026-08-20T10:00:00.000Z") },
    );

    expect(sections.flatMap(({ placements }) => placements)
      .some(({ resource }) => resource.resourceSlug === "kiute-pro"))
      .toBe(false);
  });
});
