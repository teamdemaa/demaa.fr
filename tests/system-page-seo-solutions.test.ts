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

describe("system page SEO published Solutions boundary", () => {
  it("describes Process only when the published registry is empty", () => {
    const metadata = buildSystemPageMetadata(processOnlyData, []);
    const jsonLd = buildSystemPageJsonLd(processOnlyData, []);
    const exposed = JSON.stringify({ metadata, jsonLd });
    const { system } = processOnlyData;

    expect(metadata.title).toBe(
      `Système opérationnel ${system.name} : Process | Demaa`,
    );
    expect(metadata.description).toContain("process");
    expect(metadata.keywords).toEqual([
      system.name,
      `système opérationnel ${system.name.toLowerCase()}`,
      `process ${system.name.toLowerCase()}`,
      `modèle entreprise ${system.name.toLowerCase()}`,
    ]);
    expect(itemList(jsonLd)?.name).toBe(
      `Process du système opérationnel ${system.name}`,
    );
    expect(exposed).not.toMatch(/Legacy Outil Fantôme|\boutils?\b|annuaire-outils|écosystème/i);
    expect(exposed).not.toMatch(/Process et Solutions|solutions e-commerce/i);
  });

  it("keeps all 115 empty-registry pages free of historical SEO resources", () => {
    expect(enterpriseCatalog).toHaveLength(115);

    for (const currentEnterprise of enterpriseCatalog) {
      const currentData = buildPageData(currentEnterprise);
      const metadata = buildSystemPageMetadata(currentData, []);
      const jsonLd = buildSystemPageJsonLd(currentData, []);
      const exposed = JSON.stringify({ metadata, jsonLd });

      expect(metadata.title).toBe(
        `Système opérationnel ${currentData.system.name} : Process | Demaa`,
      );
      expect(metadata.description).toMatch(/process/i);
      expect(exposed).not.toMatch(
        /Legacy Outil Fantôme|\boutils?\b|annuaire-outils|écosystème|Process et Solutions|Solutions publiées/i,
      );
    }
  });

  it("uses Process et Solutions and only renderable published resources", () => {
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
      `Système opérationnel ${system.name} : Process et Solutions | Demaa`,
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
      `Process et Solutions du système opérationnel ${system.name}`,
    );
    expect(exposed).toContain("https://qonto.com/fr");
    expect(exposed).toContain("https://demaa.fr/solutions/prestataire-facturation");
    expect(exposed).not.toMatch(
      /Legacy Outil Fantôme|Partenaire Referral|\boutils?\b|annuaire-outils|écosystème/i,
    );
  });

  it("feeds metadata and JSON-LD from the same server-only selector", async () => {
    const pageSource = await readFile(
      new URL("../src/app/kit-operationnel/[slug]/page.tsx", import.meta.url),
      "utf8",
    );
    const detailSource = await readFile(
      new URL("../src/lib/system-detail-page.ts", import.meta.url),
      "utf8",
    );

    expect(pageSource.match(/getRenderableSolutionSectionsForSystem\(slug\)/g)).toHaveLength(1);
    expect(pageSource.match(/getPublishedRenderableSolutionSectionsForSystem\(slug\)/g))
      .toHaveLength(2);
    expect(pageSource).toContain("buildSystemPageMetadata(data, solutionSections)");
    expect(pageSource).toContain(
      "buildSystemPageJsonLd(data, publishedSolutionSections)",
    );
    expect(pageSource).toContain('JSON.stringify(jsonLd).replace(/</g, "\\\\u003c")');
    expect(detailSource).not.toContain("data.detail.tools");
  });

  it("describes Levier without publishing an asset or Drive URL", () => {
    const metadata = buildSystemPageMetadata(
      publishedSolutionsData,
      publishedLevierSolutionSectionsFixture,
    );
    const jsonLd = buildSystemPageJsonLd(
      publishedSolutionsData,
      publishedLevierSolutionSectionsFixture,
    );
    const exposed = JSON.stringify({ metadata, jsonLd });

    expect(metadata.description).toContain(
      "Recevez gratuitement par e-mail Levier, le tableau de pilotage opérationnel à copier dans Google Sheets.",
    );
    expect(exposed).not.toMatch(/Google Drive|docs\.google|private-assets/);
    const list = itemList(jsonLd);
    expect(list?.itemListElement).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: "Levier" }),
      ]),
    );
    if (!list?.itemListElement) throw new Error("ItemList JSON-LD manquant");
    const levierItem = list.itemListElement.find(
      (item) => item.name === "Levier",
    );
    expect(levierItem).not.toHaveProperty("url");
  });
});
