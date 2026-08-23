import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";

import { enterpriseCatalog } from "@/lib/enterprise-annuaire";
import { D091_PILOT_SYSTEM_SLUGS } from "@/lib/curated-tools-candidate-audit";
import {
  validateCuratedSelectionAgainstResearch,
  validateReviewedSolutionCurationResearchManifest,
  validateSolutionCurationResearchManifest,
  type SolutionCurationResearchManifest,
} from "@/lib/solution-curation-research-contract";
import {
  getToolDirectoryItemBySlug,
  getToolDirectorySlug,
  toolDirectory,
} from "@/lib/tool-directory";

async function manifest() {
  return JSON.parse(await readFile(
    new URL(
      "../docs/research/d091-tools/pilot-reviewed-selections.v2.json",
      import.meta.url,
    ),
    "utf8",
  )) as SolutionCurationResearchManifest;
}

describe("D-091 pilot research selections", () => {
  it("keeps five evidence-threshold pilots with canonical tools and complete need coverage", async () => {
    const payload = await manifest();
    const knownSystems = new Set(enterpriseCatalog.map(({ slug }) => slug));
    const knownTools = new Set(toolDirectory.map(getToolDirectorySlug));

    expect(payload.status).toBe("research-candidate");
    expect(payload.selectionPolicy).toBe("evidence-threshold");
    expect(payload.runtimeActivation).toBe(false);
    expect(payload.systems).toHaveLength(5);
    expect(payload.systems.map(({ systemSlug }) => systemSlug)).toEqual(
      D091_PILOT_SYSTEM_SLUGS,
    );
    for (const system of payload.systems) {
      expect(knownSystems.has(system.systemSlug)).toBe(true);
      expect(system.priorityNeeds.length).toBeGreaterThanOrEqual(4);
      expect(system.toolCandidatesByRank.length).toBeGreaterThan(0);
      expect(new Set(system.toolCandidatesByRank.map(({ toolSlug }) => toolSlug)).size)
        .toBe(system.toolCandidatesByRank.length);
      expect(system.compositionRationale.length).toBeGreaterThan(50);
      for (const candidate of system.toolCandidatesByRank) {
        const { toolSlug } = candidate;
        const tool = getToolDirectoryItemBySlug(toolSlug);
        expect(tool, `${system.systemSlug}:${toolSlug}`).toBeDefined();
        expect(tool?.sources?.some((source) => source.startsWith("https://")))
          .toBe(true);
        expect(Date.parse(tool?.lastReviewedAt ?? "")).toBeGreaterThanOrEqual(
          Date.parse("2026-02-22"),
        );
        const reviewed = candidate as typeof candidate & Record<string, unknown>;
        expect(String(reviewed.usage ?? "").length).toBeGreaterThan(20);
        expect(String(reviewed.fitRationale ?? "").length).toBeGreaterThan(30);
        expect(String(reviewed.targetProfile ?? "").length).toBeGreaterThan(30);
        expect(String(reviewed.franceAvailability ?? "").length).toBeGreaterThan(30);
        expect(reviewed.fitConstraints).toEqual(expect.arrayContaining([
          expect.any(String),
        ]));
        expect(String(reviewed.officialSourceUrl ?? "")).toMatch(/^https:\/\//);
        expect(String(reviewed.evidenceClaim ?? "").length).toBeGreaterThan(30);
        expect(Date.parse(String(reviewed.reviewedAt ?? ""))).not.toBeNaN();
      }
    }
    expect(validateSolutionCurationResearchManifest(payload, {
      knownSystemSlugs: knownSystems,
      knownToolSlugs: knownTools,
    })).toEqual([]);
    expect(validateReviewedSolutionCurationResearchManifest(payload, {
      knownSystemSlugs: knownSystems,
      knownToolSlugs: knownTools,
    })).toEqual([]);
  });

  it("does not turn the recruitment example into a list of ten ATS", async () => {
    const recruitment = (await manifest()).systems.find(
      ({ systemSlug }) => systemSlug === "agence-de-recrutement",
    );

    expect(recruitment?.toolCandidatesByRank.map(({ toolSlug }) => toolSlug)).toEqual([
      "nicoka-cabs",
      "recruit-crm",
      "bullhorn",
      "google-workspace",
    ]);
  });

  it("rejects a research pool that could be mistaken for activable runtime data", async () => {
    const payload = await manifest();
    const knownSystems = new Set(enterpriseCatalog.map(({ slug }) => slug));
    const knownTools = new Set(toolDirectory.map(getToolDirectorySlug));

    expect(validateSolutionCurationResearchManifest({
      ...payload,
      runtimeActivation: true,
      activationBlockers: [],
    }, {
      knownSystemSlugs: knownSystems,
      knownToolSlugs: knownTools,
    })).toEqual(expect.arrayContaining([
      "research manifest must never activate runtime data",
      "research manifest requires explicit activation blockers",
    ]));
  });

  it("rejects a Firebase selection that drops a priority need or bypasses reviewed research", async () => {
    const payload = await manifest();
    const recruitment = payload.systems.find(
      ({ systemSlug }) => systemSlug === "agence-de-recrutement",
    );
    if (!recruitment) throw new Error("Recruitment research is missing");

    expect(validateCuratedSelectionAgainstResearch(
      payload,
      new Map([["agence-de-recrutement", ["unknown-tool"]]]),
      ["agence-de-recrutement"],
    )).toEqual(expect.arrayContaining([
      "agence-de-recrutement:unknown-tool: selected tool is absent from reviewed research",
      "agence-de-recrutement: selected tools do not cover priority need candidatures-et-vivier",
      "agence-de-recrutement: selected tools do not cover priority need relation-clients",
      "agence-de-recrutement: selected tools do not cover priority need collaboration-et-documents",
    ]));

    expect(validateCuratedSelectionAgainstResearch(
      payload,
      new Map([[
        "agence-de-recrutement",
        recruitment.toolCandidatesByRank.map(({ toolSlug }) => toolSlug),
      ]]),
      ["agence-de-recrutement"],
    )).toEqual([]);
  });

  it("rejects a Firebase selection whose rank order differs from reviewed research", async () => {
    const payload = await manifest();
    const recruitment = payload.systems.find(
      ({ systemSlug }) => systemSlug === "agence-de-recrutement",
    );
    if (!recruitment) throw new Error("Recruitment research is missing");
    const reviewedTools = recruitment.toolCandidatesByRank.map(({ toolSlug }) => toolSlug);

    expect(validateCuratedSelectionAgainstResearch(
      payload,
      new Map([[
        "agence-de-recrutement",
        [reviewedTools[1]!, reviewedTools[0]!, ...reviewedTools.slice(2)],
      ]]),
      ["agence-de-recrutement"],
    )).toContain(
      "agence-de-recrutement: selected tool order differs from reviewed research",
    );
  });

  it("fails closed when a placement review omits target or France availability", async () => {
    const payload = await manifest();
    const knownSystems = new Set(enterpriseCatalog.map(({ slug }) => slug));
    const knownTools = new Set(toolDirectory.map(getToolDirectorySlug));
    const broken = structuredClone(payload) as unknown as {
      systems: Array<{ toolCandidatesByRank: Array<Record<string, unknown>> }>;
    };
    delete broken.systems[0]!.toolCandidatesByRank[0]!.targetProfile;
    delete broken.systems[0]!.toolCandidatesByRank[0]!.franceAvailability;

    expect(validateReviewedSolutionCurationResearchManifest(broken, {
      knownSystemSlugs: knownSystems,
      knownToolSlugs: knownTools,
    })).toEqual(expect.arrayContaining([
      "systems[0].toolCandidatesByRank[0].targetProfile is too short",
      "systems[0].toolCandidatesByRank[0].franceAvailability is too short",
    ]));
  });
});
