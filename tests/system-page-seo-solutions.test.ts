import { readFile } from "node:fs/promises";
import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import {
  enterpriseCatalog,
  enterpriseCatalogBySlug,
  enterpriseToSystem,
  type EnterpriseDefinition,
} from "@/lib/enterprise-annuaire";
import { buildSystemeDetail } from "@/lib/systeme-catalog";
import {
  buildSystemPageJsonLd,
  buildSystemPageMetadata,
  type SystemDetailPageData,
} from "@/lib/system-detail-page";
import {
  publishedLevierSolutionSectionsFixture,
  publishedSolutionSectionsFixture,
} from "./fixtures/published-solution-sections";

function buildPageData(enterprise: EnterpriseDefinition): SystemDetailPageData {
  const system = enterpriseToSystem(enterprise);
  return {
    enterprise,
    system,
    detail: {
      slug: system.slug,
      sectorLabel: enterprise.sectorLabel,
      imageTitle: enterprise.imageTitle,
      imageSubtitle: enterprise.imageSubtitle,
      systeme: buildSystemeDetail(enterprise),
      businessModelId: enterprise.businessModelId,
      businessVariant: enterprise.businessVariant,
      businessBlocks: enterprise.businessBlocks ?? [],
      businessSignals: enterprise.businessSignals,
      tools: [
        {
          slug: "legacy-private-tool",
          name: "Legacy Outil Fantôme",
          type: "Logiciel historique",
          usage: "Ne doit jamais apparaître dans le SEO.",
        },
      ],
    },
  };
}

const processOnlyData = buildPageData(enterpriseCatalogBySlug["e-commerce"]);
const publishedSolutionsData = buildPageData(
  enterpriseCatalogBySlug["cabinet-comptable"],
);

function itemList(jsonLd: ReturnType<typeof buildSystemPageJsonLd>) {
  return jsonLd.find((item) => item["@type"] === "ItemList");
}

function toolItemList(jsonLd: ReturnType<typeof buildSystemPageJsonLd>) {
  return jsonLd.find((item) =>
    item["@type"] === "ItemList" && item.name?.startsWith("Outils recommandés")
  );
}

describe("system page SEO published Solutions boundary", () => {
  it("describes Solutions and Organisation without mixing in the Models catalogue", () => {
    const metadata = buildSystemPageMetadata(processOnlyData, []);
    const jsonLd = buildSystemPageJsonLd(processOnlyData, []);
    const exposed = JSON.stringify({ metadata, jsonLd });
    const { system } = processOnlyData;

    expect(metadata.title).toBe(
      `Solutions pour ${system.name} : outils, aides et réseaux | Demaa`,
    );
    expect(metadata.description).toContain("process");
    expect(metadata.keywords).toEqual(expect.arrayContaining([
      system.name,
      `système métier ${system.name.toLowerCase()}`,
      `process ${system.name.toLowerCase()}`,
      `solutions entreprise ${system.name.toLowerCase()}`,
    ]));
    expect(itemList(jsonLd)?.name).toBe(
      `Organisation et solutions pour ${system.name}`,
    );
    expect(exposed).not.toMatch(/Suivi et prévisionnel financier|CRM - suivi commercial/);
    expect(exposed).not.toMatch(/Legacy Outil Fantôme|annuaire-outils|écosystème/i);
    expect(exposed).not.toMatch(
      /La facturation électronique|Maîtriser les obligations et les finances de son entreprise/,
    );
  });

  it("keeps all 115 empty-registry pages free of historical Models and Resources", () => {
    expect(enterpriseCatalog).toHaveLength(115);

    for (const currentEnterprise of enterpriseCatalog) {
      const currentData = buildPageData(currentEnterprise);
      const metadata = buildSystemPageMetadata(currentData, []);
      const jsonLd = buildSystemPageJsonLd(currentData, []);
      const exposed = JSON.stringify({ metadata, jsonLd });

      expect(metadata.title).toBe(
        `Solutions pour ${currentData.system.name} : outils, aides et réseaux | Demaa`,
      );
      expect(metadata.description).toMatch(/process/i);
      expect(exposed).not.toMatch(
        /Legacy Outil Fantôme|annuaire-outils|écosystème|Solutions publiées|Levier/i,
      );
      expect(exposed).not.toContain("Tableau de pilotage opérationnel");
      expect(exposed).not.toContain("Suivi et prévisionnel financier");
      expect(exposed).not.toContain("CRM - suivi commercial");
    }
  });

  it("uses the Solutions title and only renderable published resources", () => {
    const metadata = buildSystemPageMetadata(
      publishedSolutionsData,
      publishedSolutionSectionsFixture,
    );
    const jsonLd = buildSystemPageJsonLd(
      publishedSolutionsData,
      publishedSolutionSectionsFixture,
    );
    const exposed = JSON.stringify({ metadata, jsonLd });
    const { system } = publishedSolutionsData;

    expect(metadata.title).toBe(
      `Solutions pour ${system.name} : outils, aides et réseaux | Demaa`,
    );
    expect(metadata.description).toContain("3 Solutions publiées");
    expect(metadata.description).toContain("Qonto, Demaa Pilotage, Prestataire Facturation");
    expect(metadata.keywords).toEqual(expect.arrayContaining([
      `solutions ${system.name.toLowerCase()}`,
      "Qonto",
      "Demaa Pilotage",
      "Prestataire Facturation",
    ]));
    expect(itemList(jsonLd)?.name).toBe(
      `Organisation et solutions pour ${system.name}`,
    );
    expect(exposed).toContain("https://qonto.com/fr");
    expect(exposed).toContain("https://demaa.co/solutions/prestataire-facturation");
    expect(exposed).not.toMatch(
      /Legacy Outil Fantôme|Partenaire Referral|annuaire-outils|écosystème/i,
    );
    const generalList = itemList(jsonLd);
    expect(generalList?.itemListElement).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: "Prestataire Facturation" }),
      ]),
    );
    expect(generalList?.itemListElement).not.toContainEqual(
      expect.objectContaining({ name: "Qonto" }),
    );
    expect(generalList?.itemListElement).not.toContainEqual(
      expect.objectContaining({ name: "Demaa Pilotage" }),
    );
    const tools = toolItemList(jsonLd);
    expect(tools?.itemListElement).toEqual([
      expect.objectContaining({ name: "Qonto", position: 1 }),
      expect.objectContaining({ name: "Demaa Pilotage", position: 2 }),
    ]);
    expect(tools?.itemListElement).not.toContainEqual(
      expect.objectContaining({ name: "Prestataire Facturation" }),
    );
  });

  it("keeps every curated tool in JSON-LD instead of applying a display quota", () => {
    const template = publishedSolutionSectionsFixture[0]!.placements[0]!;
    const variableToolSelection = [{
      section: "software" as const,
      placements: Array.from({ length: 12 }, (_, index) => ({
        ...template,
        placementId: `cabinet-comptable:tool-${index + 1}:software`,
        rank: index + 1,
        resource: {
          ...template.resource,
          resourceSlug: `tool-${index + 1}`,
          name: `Tool ${index + 1}`,
        },
      })),
    }];

    const tools = toolItemList(buildSystemPageJsonLd(
      publishedSolutionsData,
      variableToolSelection,
    ));

    expect(tools?.itemListElement).toHaveLength(12);
    if (!tools?.itemListElement) throw new Error("ItemList Outils JSON-LD manquant");
    expect(tools.itemListElement.at(-1)).toEqual(
      expect.objectContaining({ name: "Tool 12", position: 12 }),
    );
  });

  it("feeds metadata and JSON-LD from the same server-only selector", async () => {
    const pageSource = await readFile(
      new URL("../src/app/(marketing)/solutions/[slug]/page.tsx", import.meta.url),
      "utf8",
    );
    const detailSource = await readFile(
      new URL("../src/lib/system-detail-page.ts", import.meta.url),
      "utf8",
    );

    expect(pageSource.match(/getActivePublicRenderableSolutionSectionsForSystem\(slug\)/g)).toHaveLength(1);
    expect(pageSource.match(/getActivePublishedRenderableSolutionSectionsForSystem\(slug\)/g))
      .toHaveLength(2);
    expect(pageSource).toContain("buildSystemPageMetadata(");
    expect(pageSource).toContain(
      "filterPublicSystemRecommendationSections(solutionSections)",
    );
    expect(pageSource).toContain(
      "buildSystemPageJsonLd(data, visiblePublishedSolutionSections)",
    );
    expect(pageSource).toContain("composePublicSolutionSectionsForSystem(");
    expect(pageSource).not.toContain("composeCanonicalServicesForSystem(");
    expect(pageSource).toContain('JSON.stringify(jsonLd).replace(/</g, "\\\\u003c")');
    expect(detailSource).not.toContain("data.detail.tools");
  });

  it("filters historical Models and Resources from Solutions SEO", () => {
    const metadata = buildSystemPageMetadata(
      publishedSolutionsData,
      publishedLevierSolutionSectionsFixture,
    );
    const jsonLd = buildSystemPageJsonLd(
      publishedSolutionsData,
      publishedLevierSolutionSectionsFixture,
    );
    const exposed = JSON.stringify({ metadata, jsonLd });

    expect(metadata.description).not.toContain("ressources pratiques");
    expect(exposed).not.toMatch(/Google Drive|docs\.google|private-assets/);
    expect(exposed).not.toContain("Levier");
    const list = itemList(jsonLd);
    expect(list?.itemListElement).not.toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: "CRM - suivi commercial" }),
      ]),
    );
    if (!list?.itemListElement) throw new Error("ItemList JSON-LD manquant");
    expect(list.itemListElement.find((item) => item.name === "CRM - suivi commercial")).toBeUndefined();
  });
});
