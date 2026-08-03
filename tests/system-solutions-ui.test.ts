import { readFile } from "node:fs/promises";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import SystemSolutionsTab from "@/components/SystemSolutionsTab";
import { enterpriseCatalog } from "@/lib/enterprise-annuaire";
import {
  getVisibleSystemDetailTabs,
  normalizeSystemDetailTab,
} from "@/lib/system-detail-tabs";
import {
  filterRenderableSolutionSections,
  getPublishedRenderableSolutionSectionsForSystem,
  getRenderableSolutionSectionsForSystem,
} from "@/lib/system-solutions-ui.server";
import {
  publishedLevierSolutionSectionsFixture,
  publishedSolutionSectionsFixture,
  publishedSolutionSectionsWithReferralFixture,
} from "./fixtures/published-solution-sections";

async function readSource(path: string) {
  return readFile(new URL(`../${path}`, import.meta.url), "utf8");
}

describe("system Solutions UI", () => {
  it("shows the validated empty state and hides empty section rails", () => {
    expect(
      renderToStaticMarkup(createElement(SystemSolutionsTab, { sections: [] })),
    ).toContain(
      "Nous vérifions encore les solutions les plus pertinentes pour ce métier.",
    );

    const markup = renderToStaticMarkup(
      createElement(SystemSolutionsTab, {
        sections: publishedSolutionSectionsFixture,
      }),
    );
    expect(markup).toContain("Outils");
    expect(markup).toContain("Qonto");
    expect(markup).toContain("Prestataires et fournisseurs");
    expect(markup).not.toMatch(/en cours|bientôt|à venir|placeholder/i);
  });

  it("renders Levier as the first universal tool card without a public asset URL", () => {
    const markup = renderToStaticMarkup(
      createElement(SystemSolutionsTab, {
        sections: publishedLevierSolutionSectionsFixture,
      }),
    );

    expect(markup).toContain("Outils");
    expect(markup).toContain("Levier");
    expect(markup).toContain("Tableau de pilotage opérationnel");
    expect(markup).toContain("Ouvrir Levier");
    expect(markup).not.toMatch(/Outil Demaa|Modèle|Service/);
    expect(JSON.stringify(publishedLevierSolutionSectionsFixture)).not.toMatch(
      /https?:\/\/|drive|\.xlsx/i,
    );
  });

  it("publishes Levier first in Solutions on all 115 systems", () => {
    expect(enterpriseCatalog).toHaveLength(115);

    for (const system of enterpriseCatalog) {
      const sections = getRenderableSolutionSectionsForSystem(system.slug);
      expect(JSON.parse(JSON.stringify(sections))).toEqual(sections);
      expect(
        sections[0]?.placements[0],
      ).toMatchObject({
        rank: 1,
        resource: {
          resourceSlug: "levier",
          interaction: { interactionMode: "system_delivery" },
        },
      });
      const markup = renderToStaticMarkup(
        createElement(SystemSolutionsTab, { sections }),
      );
      expect(markup).toContain("Levier");
      expect(markup).toContain("Tableau de pilotage opérationnel");
      expect(normalizeSystemDetailTab("solutions")).toBe("solutions");
      expect(normalizeSystemDetailTab("outils")).toBe("solutions");
      expect(normalizeSystemDetailTab("ecosysteme")).toBe("solutions");
      expect(getVisibleSystemDetailTabs()).toEqual([
        "process",
        "solutions",
      ]);
    }
  });

  it("filters referral_form on the server before the RSC boundary", () => {
    const sections = filterRenderableSolutionSections(
      publishedSolutionSectionsWithReferralFixture,
    );
    const placements = sections.flatMap((section) => section.placements);

    expect(placements.map((placement) => placement.resource.name)).not.toContain(
      "Partenaire Referral",
    );
    expect(placements.map((placement) => placement.resource.interaction.interactionMode)).toEqual([
      "external_link",
      "external_link",
      "detail",
    ]);
    expect(JSON.stringify(sections)).not.toContain("referral_form");
  });

  it("never exposes commercial relationship claims in the client UI", async () => {
    const markup = renderToStaticMarkup(
      createElement(SystemSolutionsTab, {
        sections: publishedSolutionSectionsFixture,
      }),
    );

    expect(markup).not.toMatch(/proposée directement|commission|rémunér|partenariat/i);
    const source = await readSource("src/components/SystemSolutionsTab.tsx");
    expect(source).not.toMatch(/commercialRelationship|ODEMA|rémunér|affiliate/i);
  });

  it("shows the selected pilot resources by relevance without exposing review fields", () => {
    const expected = {
      batiment: [
        ["levier", "obat", "fieldwire", "graneet"],
        ["point-p", "kiloutou", "capeb"],
      ],
      "cabinet-comptable": [
        ["levier", "tiimora", "pennylane", "silae"],
      ],
      "agence-marketing": [
        ["levier", "airtable", "canva", "brevo", "metricool", "chatgpt"],
      ],
    } as const;

    for (const [systemSlug, sectionSlugs] of Object.entries(expected)) {
      const sections = getRenderableSolutionSectionsForSystem(systemSlug);
      expect(sections.map(({ placements }) =>
        placements.map(({ resource }) => resource.resourceSlug)
      )).toEqual(sectionSlugs);
      const markup = renderToStaticMarkup(
        createElement(SystemSolutionsTab, { sections }),
      );
      expect(markup).toContain("Outils");
      expect(markup).toContain('aria-label="Ouvrir Levier"');
      const orderedNames = sections.flatMap(({ placements }) =>
        placements.map(({ resource }) => resource.name)
      );
      for (const [index, name] of orderedNames.entries()) {
        expect(markup).toContain(`aria-label="Ouvrir ${name}"`);
        if (index > 0) {
          expect(markup.indexOf(`aria-label="Ouvrir ${orderedNames[index - 1]}"`))
            .toBeLessThan(markup.indexOf(`aria-label="Ouvrir ${name}"`));
        }
      }
      const serialized = JSON.stringify(sections);
      expect(serialized).not.toMatch(
        /commercialRelationship|publicationBlockers|status|reviewer|reviewedAt|expiresAt|evidence|ODEMA|owned|affiliate|commercial_partner|paid_referral/i,
      );
    }

    expect(renderToStaticMarkup(createElement(SystemSolutionsTab, {
      sections: getRenderableSolutionSectionsForSystem("batiment"),
    }))).toContain("Prestataires et fournisseurs");
    expect(renderToStaticMarkup(createElement(SystemSolutionsTab, {
      sections: getRenderableSolutionSectionsForSystem("cabinet-comptable"),
    }))).not.toContain("Prestataires et fournisseurs");

    expect(getPublishedRenderableSolutionSectionsForSystem("batiment")[0]?.placements)
      .toHaveLength(1);
  });

  it("keeps the registry server-side and crosses RSC with public DTOs only", async () => {
    const pageSource = await readSource("src/app/kit-operationnel/[slug]/page.tsx");
    const detailSource = await readSource("src/components/SystemDetailContent.tsx");
    const solutionsSource = await readSource("src/components/SystemSolutionsTab.tsx");

    expect(pageSource).toContain("getRenderableSolutionSectionsForSystem,");
    expect(pageSource).toContain(
      'from "@/lib/system-solutions-ui.server"',
    );
    expect(pageSource).toContain("solutionSections={solutionSections}");
    expect(detailSource).not.toMatch(/solution-registry\.(?:server|contract)/);
    expect(solutionsSource).toContain("import type {");
    expect(solutionsSource).toContain('from "@/lib/solution-registry-dto"');
    expect(solutionsSource).not.toMatch(/solution-registry\.(?:server|contract)/);
    expect(solutionsSource).not.toMatch(/SystemEcosystem|system-ecosystem/);
    expect(solutionsSource).not.toContain('interactionMode === "referral_form"');
  });

  it("preserves query reset and keyboard focus contracts", async () => {
    const detailSource = await readSource("src/components/SystemDetailContent.tsx");

    expect(detailSource).toContain('url.searchParams.set("tab", tab)');
    expect(detailSource).toContain('url.searchParams.delete("service")');
    expect(detailSource).not.toContain("solutionsAvailable");
    expect(detailSource).toContain("getVisibleSystemDetailTabs()");
    expect(detailSource).toContain("requestAnimationFrame");
    expect(detailSource).toContain("?.focus()");
    expect(detailSource).toContain('activeTab === "solutions"');
    expect(detailSource).not.toContain(
      'solutionsAvailable && activeTab === "solutions"',
    );
    expect(detailSource).not.toMatch(/activeTab === "(?:outils|ecosysteme)"/);
    expect(detailSource).not.toContain("detail: OperationalSystemDetail");
    expect(detailSource).toContain("systeme: SystemeDetail | null");
  });

  it("reuses the accessible modal lifecycle and resets selection on close", async () => {
    const solutionsSource = await readSource("src/components/SystemSolutionsTab.tsx");
    const dialogSource = await readSource("src/components/DirectoryDetailDialogShell.tsx");
    const hookSource = await readSource("src/components/useAccessibleDialog.ts");

    expect(solutionsSource).toContain("DirectoryDetailDialogShell");
    expect(solutionsSource).toContain("setSelected(null)");
    expect(dialogSource).toContain("useAccessibleDialog({ onClose })");
    expect(dialogSource).toContain("data-dialog-initial-focus");
    expect(hookSource).toContain('event.key === "Escape"');
    expect(hookSource).toContain('event.key !== "Tab"');
    expect(hookSource).toContain("previouslyFocused?.focus()");
  });

  it("keeps the D012 rail constrained without page-level horizontal overflow", async () => {
    const source = await readSource("src/components/SystemSolutionsTab.tsx");

    expect(source).toContain("max-w-full");
    expect(source).toContain("min-w-0");
    expect(source).toContain("overflow-x-auto");
    expect(source).toContain("overscroll-x-contain");
    expect(source).toContain("auto-cols-[82%]");
    expect(source).toContain("md:auto-cols-[calc((100%_-_2rem)_/_3)]");
    expect(source).not.toMatch(/\bposition\b/);
  });

  it("keeps the W6 SEO and JSON-LD integration gate explicit", async () => {
    const gate = await readSource("docs/system-solutions-ui-w6-integration-gate.md");
    const pageSource = await readSource("src/app/kit-operationnel/[slug]/page.tsx");

    expect(gate).toContain("bloqué avant W6");
    expect(gate).toContain("JSON-LD");
    expect(gate).toContain("published-only");
    expect(pageSource).toContain(
      "buildSystemPageJsonLd(data, publishedSolutionSections)",
    );
  });
});
