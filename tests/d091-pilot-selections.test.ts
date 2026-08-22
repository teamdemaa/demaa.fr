import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";

import { enterpriseCatalog } from "@/lib/enterprise-annuaire";
import { getToolDirectoryItemBySlug } from "@/lib/tool-directory";

type PilotManifest = {
  status: string;
  systems: Array<{
    priorityNeeds: string[];
    systemSlug: string;
    toolSlugsByRank: string[];
  }>;
};

async function manifest() {
  return JSON.parse(await readFile(
    new URL(
      "../docs/research/d091-tools/pilot-selections.v1.json",
      import.meta.url,
    ),
    "utf8",
  )) as PilotManifest;
}

describe("D-091 pilot research selections", () => {
  it("keeps five non-sector-specific pilots with ten unique canonical tools", async () => {
    const payload = await manifest();
    const knownSystems = new Set(enterpriseCatalog.map(({ slug }) => slug));

    expect(payload.status).toBe("research-candidate");
    expect(payload.systems).toHaveLength(5);
    for (const system of payload.systems) {
      expect(knownSystems.has(system.systemSlug)).toBe(true);
      expect(system.priorityNeeds.length).toBeGreaterThanOrEqual(4);
      expect(system.toolSlugsByRank).toHaveLength(10);
      expect(new Set(system.toolSlugsByRank).size).toBe(10);
      for (const toolSlug of system.toolSlugsByRank) {
        expect(getToolDirectoryItemBySlug(toolSlug), `${system.systemSlug}:${toolSlug}`)
          .toBeDefined();
      }
    }
  });

  it("does not turn the recruitment example into a list of ten ATS", async () => {
    const recruitment = (await manifest()).systems.find(
      ({ systemSlug }) => systemSlug === "agence-de-recrutement",
    );

    expect(recruitment?.toolSlugsByRank).toEqual([
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
});
