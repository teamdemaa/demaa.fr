import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";

import { enterpriseCatalog } from "@/lib/enterprise-annuaire";
import { D091_PILOT_SYSTEM_SLUGS } from "@/lib/curated-tools-candidate-audit";
import {
  validateCuratedSelectionAgainstResearch,
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
      "../docs/research/d091-tools/pilot-selections.v2.json",
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
      for (const { toolSlug } of system.toolCandidatesByRank) {
        const tool = getToolDirectoryItemBySlug(toolSlug);
        expect(tool, `${system.systemSlug}:${toolSlug}`).toBeDefined();
        expect(tool?.sources?.some((source) => source.startsWith("https://")))
          .toBe(true);
        expect(Date.parse(tool?.lastReviewedAt ?? "")).toBeGreaterThanOrEqual(
          Date.parse("2026-02-22"),
        );
      }
    }
    expect(validateSolutionCurationResearchManifest(payload, {
      knownSystemSlugs: knownSystems,
      knownToolSlugs: knownTools,
    })).toEqual([]);
  });

  it("does not turn the recruitment example into a list of ten ATS", async () => {
    const recruitment = (await manifest()).systems.find(
      ({ systemSlug }) => systemSlug === "agence-de-recrutement",
    );

    expect(recruitment?.toolCandidatesByRank.map(({ toolSlug }) => toolSlug)).toEqual([
      "recruitee",
      "teamtailor",
      "hubspot",
      "calendly",
      "typeform",
      "aircall",
      "zoom",
      "google-workspace",
      "n8n",
      "power-bi",
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
      new Map([["agence-de-recrutement", ["recruitee", "unknown-tool"]]]),
      ["agence-de-recrutement"],
    )).toEqual(expect.arrayContaining([
      "agence-de-recrutement:unknown-tool: selected tool is absent from reviewed research",
      "agence-de-recrutement: selected tools do not cover priority need relation-clients",
      "agence-de-recrutement: selected tools do not cover priority need collaboration-et-documents",
      "agence-de-recrutement: selected tools do not cover priority need automatisation-et-reporting",
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
});
