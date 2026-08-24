import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";

import { enterpriseCatalog } from "@/lib/enterprise-annuaire";
import {
  validateReviewedSolutionCurationResearchManifest,
  type ReviewedSolutionCurationResearchManifest,
} from "@/lib/solution-curation-research-contract";
import {
  getToolDirectoryCandidateItemBySlug,
  getToolDirectoryItemBySlug,
  getToolDirectorySlug,
  toolDirectoryCandidatePool,
} from "@/lib/tool-directory";

const RESTAURATION_SYSTEM_SLUGS = [
  "restaurant",
  "fast-food",
  "traiteur",
  "dark-kitchen",
  "boulangerie",
  "bar-cafe",
  "food-truck",
] as const;

async function manifest() {
  return JSON.parse(await readFile(
    new URL(
      "../docs/research/d091-tools/lot1-restauration-reviewed-selections.generated.json",
      import.meta.url,
    ),
    "utf8",
  )) as ReviewedSolutionCurationResearchManifest;
}

describe("D-091 restauration Lot 1", () => {
  it("keeps seven TPE systems reviewed, need-complete and inactive", async () => {
    const payload = await manifest();
    const knownSystems = new Set(enterpriseCatalog.map(({ slug }) => slug));
    const knownTools = new Set(toolDirectoryCandidatePool.map(getToolDirectorySlug));

    expect(payload.runtimeActivation).toBe(false);
    expect(payload.reviewStage).toBe("placement-reviewed");
    expect(payload.systems.map(({ systemSlug }) => systemSlug)).toEqual(
      RESTAURATION_SYSTEM_SLUGS,
    );
    expect(validateReviewedSolutionCurationResearchManifest(payload, {
      knownSystemSlugs: knownSystems,
      knownToolSlugs: knownTools,
    })).toEqual([]);
  });

  it("excludes obvious office tools and keeps evidence-threshold counts", async () => {
    const payload = await manifest();
    const selectedSlugs = payload.systems.flatMap(({ toolCandidatesByRank }) =>
      toolCandidatesByRank.map(({ toolSlug }) => toolSlug)
    );

    expect(selectedSlugs).not.toEqual(expect.arrayContaining([
      "google-workspace",
      "canva",
      "chatgpt",
      "brevo",
      "uber-eats",
    ]));
    for (const system of payload.systems) {
      expect(system.toolCandidatesByRank.length).toBeGreaterThanOrEqual(3);
      expect(system.toolCandidatesByRank.length).toBeLessThanOrEqual(7);
      expect(new Set(system.toolCandidatesByRank.map(({ toolSlug }) => toolSlug)).size)
        .toBe(system.toolCandidatesByRank.length);
    }
  });

  it("keeps new researched tools hidden until a separate Firebase activation", () => {
    for (const slug of ["combo", "traqfood", "melba", "toporder"]) {
      expect(getToolDirectoryCandidateItemBySlug(slug), slug).not.toBeNull();
      expect(getToolDirectoryItemBySlug(slug), slug).toBeNull();
    }
  });

  it("uses complementary tools and preserves alternatives as alternatives", async () => {
    const payload = await manifest();
    const bySystem = new Map(payload.systems.map((system) => [system.systemSlug, system]));

    expect(bySystem.get("boulangerie")?.toolCandidatesByRank.map(({ toolSlug }) => toolSlug))
      .toEqual(["toporder", "melba", "combo", "traqfood"]);
    expect(bySystem.get("food-truck")?.toolCandidatesByRank.map(({ toolSlug }) => toolSlug))
      .toEqual(["nomad", "sumup-caisse", "traqfood"]);
    expect(bySystem.get("restaurant")?.compositionRationale).toContain(
      "alternatives",
    );
    expect(bySystem.get("fast-food")?.compositionRationale).toContain(
      "alternatives",
    );
  });
});
