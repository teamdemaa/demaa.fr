import { readFile } from "node:fs/promises";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import SystemSolutionsTab, {
  SOLUTION_RAIL_DISPLAY_ORDER,
  SOLUTION_UI_WORKING_LABELS,
} from "@/components/SystemSolutionsTab";
import SystemGuidesRail from "@/components/SystemGuidesRail";
import SystemResourcesTab from "@/components/SystemResourcesTab";
import { enterpriseCatalog } from "@/lib/enterprise-annuaire";
import { getSystemResourcesForSystem } from "@/lib/system-resource-catalog";
import {
  getVisibleSystemDetailTabs,
  normalizeSystemDetailTab,
} from "@/lib/system-detail-tabs";
import {
  filterRenderableSolutionSections,
  getPublishedRenderableSolutionSectionsForSystem,
  getRenderableSolutionSectionsForSystem,
} from "@/lib/system-solutions-ui.server";
import { getSolutionResourcePresentation } from "@/lib/solution-resource-presentation.server";
import { PILOT_SOLUTION_DRAFT_RESOURCES } from "@/lib/pilot-solution-registry-drafts.server";
import {
  getFamilySystemSolutionSelection,
} from "@/lib/family-solution-selections.server";
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
    expect(markup).toContain("Fournisseurs");
    expect(markup).not.toMatch(/bientôt|placeholder/i);
  });

  it("keeps Resources out of Solutions and renders them in their own tab", () => {
    const solutionsMarkup = renderToStaticMarkup(
      createElement(SystemSolutionsTab, {
        sections: publishedLevierSolutionSectionsFixture,
      }),
    );
    const scopedResources = getSystemResourcesForSystem("batiment");
    const resourcesMarkup = renderToStaticMarkup(
      createElement(SystemResourcesTab, {
        resources: scopedResources.filter((resource) => resource.format === "template"),
        systemName: "Bâtiment",
        systemSlug: "batiment",
      }),
    );
    const guidesMarkup = renderToStaticMarkup(
      createElement(SystemGuidesRail, {
        resources: scopedResources.filter((resource) => resource.format === "guide"),
        systemSlug: "batiment",
      }),
    );

    expect(solutionsMarkup).not.toContain("Ressources");
    expect(solutionsMarkup).not.toContain("Modèles");
    expect(solutionsMarkup).not.toContain("Levier");
    expect(solutionsMarkup).not.toContain("Tableau de pilotage opérationnel");
    expect(resourcesMarkup).toContain("Tableau de pilotage opérationnel");
    expect(resourcesMarkup).toContain("Récapitulatif du système");
    expect(resourcesMarkup).toContain("Suivi et prévisionnel financier");
    expect(resourcesMarkup).toContain("CRM - suivi commercial");
    expect(guidesMarkup).toContain("La facturation électronique");
    expect(guidesMarkup).toContain(
      "Maîtriser les obligations et les finances de son entreprise",
    );
    expect(guidesMarkup).toContain("Être informé(e)");
    expect(guidesMarkup).toContain("Créer une entreprise du bâtiment");
    expect(guidesMarkup).toContain("Piloter vos chantiers et votre équipe");
    expect(guidesMarkup).not.toContain("Créer et lancer votre activité");
    expect(guidesMarkup).not.toContain("Gérer votre activité au quotidien");
    expect(JSON.stringify(publishedLevierSolutionSectionsFixture)).not.toMatch(
      /https?:\/\/|drive|\.xlsx/i,
    );
  });

  it("renders Levier exactly once in Models on all 115 systems", () => {
    expect(enterpriseCatalog).toHaveLength(115);

    for (const system of enterpriseCatalog) {
      const sections = getRenderableSolutionSectionsForSystem(system.slug);
      expect(JSON.parse(JSON.stringify(sections))).toEqual(sections);
      const familySelection = getFamilySystemSolutionSelection(system.slug);
      if (familySelection) {
        const renderedSlugs = sections.flatMap(({ placements }) =>
          placements.map(({ resource }) => resource.resourceSlug)
        );
        const referralSlugs = ["cabinet-davocat", "notaire"].includes(system.slug)
          ? ["juridi-consulting"]
          : [];
        expect(new Set(renderedSlugs)).toEqual(new Set([
          ...familySelection.placements
            .filter(({ resourceSlug, editorialStatus }) => (
              resourceSlug !== "levier" && editorialStatus === "selected"
            ))
            .map(({ resourceSlug }) => resourceSlug),
          ...referralSlugs,
          "levier",
        ]));
      }
      const levierPlacements = sections.flatMap(({ placements }) => placements)
        .filter(({ resource }) => resource.resourceSlug === "levier");
      expect(levierPlacements).toEqual([
        expect.objectContaining({
          rank: 1,
          section: "models",
          resource: expect.objectContaining({
            resourceSlug: "levier",
            interaction: { interactionMode: "system_delivery" },
          }),
        }),
      ]);
      expect(sections.map(({ section }) => section)).toEqual(
        ["software", "providers", "models", "networks"].filter((section) =>
          sections.some((candidate) => candidate.section === section),
        ),
      );
      const markup = renderToStaticMarkup(
        createElement(SystemSolutionsTab, { sections }),
      );
      if (sections.some(({ section }) => section === "software")) {
        expect(markup).toContain("Outils");
      }
      const visibleRailLabels = SOLUTION_RAIL_DISPLAY_ORDER
        .filter((section) => sections.some((candidate) => candidate.section === section))
        .flatMap((section) => {
          const label = SOLUTION_UI_WORKING_LABELS[section];
          return label ? [label] : [];
        });
      for (const [index, label] of visibleRailLabels.entries()) {
        if (index > 0) {
          expect(markup.indexOf(visibleRailLabels[index - 1]))
            .toBeLessThan(markup.indexOf(label));
        }
      }
      expect(markup).not.toContain('aria-label="Ouvrir Levier"');
      expect(markup).not.toContain('aria-label="Ouvrir Tableau de pilotage opérationnel"');
      expect(markup).not.toContain("Ressources héritées");
      expect(normalizeSystemDetailTab("solutions")).toBe("solutions");
      expect(normalizeSystemDetailTab("outils")).toBe("solutions");
      expect(normalizeSystemDetailTab("ecosysteme")).toBe("solutions");
      expect(getVisibleSystemDetailTabs()).toEqual([
        "process",
        "solutions",
        "resources",
      ]);
    }
  });

  it("reuses the existing resource classifications across the four rails", () => {
    const placements = enterpriseCatalog.flatMap(({ slug }) =>
      getRenderableSolutionSectionsForSystem(slug).flatMap((section) => section.placements),
    );
    const bySection = Object.groupBy(placements, ({ section }) => section);

    expect(placements).toHaveLength(603);
    expect(bySection.software).toHaveLength(313);
    expect(bySection.providers).toHaveLength(85);
    expect(bySection.models).toHaveLength(115);
    expect(bySection.networks).toHaveLength(90);
    expect(bySection.software?.every(({ resource }) => resource.resourceType === "software"))
      .toBe(true);
    expect(bySection.providers?.every(({ resource }) => resource.resourceType === "provider"))
      .toBe(true);
    expect(bySection.models?.every(({ resource }) => resource.resourceSlug === "levier"))
      .toBe(true);
    expect(bySection.networks?.every(({ resource }) => resource.resourceType === "directory"))
      .toBe(true);
  });

  it("renders the five family sentinels in their audited order", () => {
    const expected = {
      "plomberie-chauffage": [
        ["esabora", "obat", "alobees", "kizeo-forms"],
        ["cedeo-pro", "wurth", "plateforme-du-batiment", "kiloutou"],
        ["levier"],
        ["capeb"],
      ],
      restaurant: [
        ["lightspeed", "zenchef", "deliverect"],
        ["transgourmet", "metro-france", "france-boissons", "firplast"],
        ["levier"],
        ["umih"],
      ],
      "commerce-de-detail": [
        ["lightspeed", "hiboutik", "brevo"],
        ["levier"],
      ],
      "agence-immobiliere": [
        ["hektor", "modelo", "zelok", "ubiflow"],
        ["levier"],
        ["fnaim", "unis"],
      ],
      "cabinet-medical": [
        ["weda", "medistory", "doctolib"],
        ["distrimed-medical"],
        ["levier"],
        ["ordre-medecins", "urps"],
      ],
    } as const;

    for (const [systemSlug, expectedSections] of Object.entries(expected)) {
      const sections = getRenderableSolutionSectionsForSystem(systemSlug);
      expect(sections.map(({ placements }) =>
        placements.map(({ resource }) => resource.resourceSlug)
      )).toEqual(expectedSections);
      expect(sections.every(({ placements }) => placements.length <= 5)).toBe(true);
      expect(JSON.stringify(sections)).not.toMatch(
        /commercialRelationship|editorialStatus|publicationBlockers|status|evidenceUrls|reviewedAt|catalogDestination/i,
      );
    }
  });

  it("passes referral_form through the public DTO without commercial metadata", () => {
    const sections = filterRenderableSolutionSections(
      publishedSolutionSectionsWithReferralFixture,
    );
    const placements = sections.flatMap((section) => section.placements);

    expect(placements.map((placement) => placement.resource.name)).toContain(
      "Partenaire Referral",
    );
    expect(placements.map((placement) => placement.resource.interaction.interactionMode)).toEqual([
      "external_link",
      "external_link",
      "detail",
      "referral_form",
    ]);
    expect(JSON.stringify(sections)).not.toMatch(/paid_referral|commercialRelationship/);
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
        ["obat", "costructor", "progbat", "vertuoza"],
        ["point-p", "plateforme-du-batiment", "kiloutou", "wurth"],
        ["levier"],
        ["capeb"],
      ],
      "cabinet-comptable": [
        ["pennylane", "tiimora", "silae"],
        ["juridi-consulting"],
        ["levier"],
        ["ordre-experts-comptables", "croec-regional"],
      ],
      "agence-marketing": [
        ["airtable", "canva", "brevo", "metricool", "chatgpt"],
        ["levier"],
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
      expect(markup).not.toContain('aria-label="Ouvrir Levier"');
      expect(markup).not.toContain('aria-label="Ouvrir Tableau de pilotage opérationnel"');
      const orderedNames = SOLUTION_RAIL_DISPLAY_ORDER.flatMap((section) =>
        sections
          .filter((candidate) => candidate.section === section)
          .flatMap(({ placements }) => placements.map(({ resource }) => resource.name))
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
        /commercialRelationship|editorialStatus|publicationBlockers|status|reviewer|reviewedAt|expiresAt|evidence|ODEMA|owned|affiliate|commercial_partner|paid_referral/i,
      );
    }

    expect(renderToStaticMarkup(createElement(SystemSolutionsTab, {
      sections: getRenderableSolutionSectionsForSystem("batiment"),
    }))).toContain("Fournisseurs");
    expect(renderToStaticMarkup(createElement(SystemSolutionsTab, {
      sections: getRenderableSolutionSectionsForSystem("batiment"),
    }))).toContain("Réseaux professionnels");
    expect(renderToStaticMarkup(createElement(SystemSolutionsTab, {
      sections: getRenderableSolutionSectionsForSystem("cabinet-comptable"),
    }))).toContain("Fournisseurs");
    expect(renderToStaticMarkup(createElement(SystemSolutionsTab, {
      sections: getRenderableSolutionSectionsForSystem("cabinet-comptable"),
    }))).toContain("JuridiConsulting");

    expect(getPublishedRenderableSolutionSectionsForSystem("batiment")[0]?.placements)
      .toHaveLength(1);
  });

  it("uses compact direct modals with resource-specific categories and no internal detail CTA", async () => {
    const sections = getRenderableSolutionSectionsForSystem("batiment");
    const resources = sections.flatMap(({ placements }) => placements.map(({ resource }) => resource));
    const bySlug = new Map(resources.map((resource) => [resource.resourceSlug, resource]));

    expect(bySlug.get("obat")).toMatchObject({
      displayCategory: "Logiciel",
      ctaLabel: "Voir l’outil",
      interaction: { interactionMode: "external_link", href: "https://www.obat.fr/" },
    });
    expect(bySlug.get("costructor")).toMatchObject({
      ctaLabel: "Voir l’outil",
      interaction: { interactionMode: "external_link", href: "https://costructor.co/" },
    });
    for (const resourceSlug of [
      "obat",
      "costructor",
      "progbat",
      "vertuoza",
      "point-p",
      "plateforme-du-batiment",
      "kiloutou",
      "wurth",
      "capeb",
    ]) {
      expect(bySlug.get(resourceSlug)?.indicativePricing).toBeUndefined();
    }
    expect(bySlug.get("point-p")).toMatchObject({
      displayCategory: "Fournisseur de matériaux",
      ctaLabel: "Voir le fournisseur",
    });
    expect(bySlug.get("plateforme-du-batiment")).toMatchObject({
      displayCategory: "Fournisseur réservé aux professionnels",
      ctaLabel: "Voir le fournisseur",
    });
    expect(bySlug.get("kiloutou")).toMatchObject({
      displayCategory: "Location de matériel",
      ctaLabel: "Voir le service de location",
    });
    expect(bySlug.get("wurth")).toMatchObject({
      displayCategory: "Fournisseur d’outillage et de consommables",
      ctaLabel: "Voir le fournisseur",
    });
    expect(bySlug.get("capeb")).toMatchObject({
      displayCategory: "Organisation professionnelle",
      ctaLabel: "Découvrir l’organisation",
    });

    for (const resource of resources.filter(({ resourceSlug }) => resourceSlug !== "levier")) {
      expect(resource.interaction.interactionMode).toBe("external_link");
      if (resource.interaction.interactionMode === "external_link") {
        expect(resource.interaction.href).toMatch(/^https:\/\//);
      }
    }

    const source = await readSource("src/components/SystemSolutionsTab.tsx");
    expect(source).toContain("Ce que vous y gagnez");
    expect(source).toContain("Pourquoi cette solution");
    expect(source).toContain("Tarif indicatif");
    expect(source).toContain("À vérifier avant de choisir");
    expect(source).toContain('rel="noopener noreferrer"');
    expect(source).not.toContain("Voir la fiche");
    expect(source).not.toContain("Usage dans ce système");

    const obat = PILOT_SOLUTION_DRAFT_RESOURCES.find(({ resourceSlug }) => resourceSlug === "obat");
    expect(obat).toBeDefined();
    const presentation = getSolutionResourcePresentation(obat!);
    expect(presentation).toMatchObject({
      pricingReviewedAt: "2026-08-04",
      pricingSource: "https://www.obat.fr/",
    });
    expect(JSON.stringify(sections)).not.toMatch(/pricingReviewedAt|pricingSource/);
  });

  it("keeps the registry server-side and crosses RSC with public DTOs only", async () => {
    const pageSource = await readSource("src/app/kit-operationnel/[slug]/page.tsx");
    const detailSource = await readSource("src/components/SystemDetailContent.tsx");
    const solutionsSource = await readSource("src/components/SystemSolutionsTab.tsx");

    expect(pageSource).toContain("getActiveRenderableSolutionSectionsForSystem,");
    expect(pageSource).toContain(
      'from "@/lib/firebase-solution-registry-selection.server"',
    );
    expect(pageSource).toContain("solutionSections={visibleSolutionSections}");
    expect(pageSource).toContain("filterPublicSolutionSections");
    expect(pageSource).toContain('isPublicSolutionSectionVisible("services")');
    expect(pageSource).not.toContain("getMigrationSafe");
    expect(detailSource).not.toMatch(/solution-registry\.(?:server|contract)/);
    expect(solutionsSource).toContain("import type {");
    expect(solutionsSource).toContain('from "@/lib/solution-registry-dto"');
    expect(solutionsSource).not.toMatch(/solution-registry\.(?:server|contract)/);
    expect(solutionsSource).not.toMatch(/SystemEcosystem|system-ecosystem/);
    expect(solutionsSource).toContain('interactionMode === "referral_form"');
    expect(solutionsSource).toContain("SolutionReferralForm");
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

  it("uses the neutral Resources catalog as the public delivery entry point", async () => {
    const detailSource = await readSource("src/components/SystemDetailContent.tsx");
    const resourcesSource = await readSource("src/components/SystemResourcesTab.tsx");
    const systemModalSource = await readSource(
      "src/components/HistoricalOperationalSystemCopyRequestModal.tsx",
    );

    expect(detailSource).not.toContain('setDeliveryModal("system")');
    expect(detailSource).toContain("<SystemGuidesRail");
    expect(detailSource).toContain("<SystemResourcesTab");
    expect(detailSource).toContain("getSystemResourcesForSystem(system.slug)");
    expect(detailSource).not.toContain("OperationalSystemCopyRequestModal");
    expect(resourcesSource).not.toContain("OperationalSystemCopyRequestModal");
    expect(resourcesSource).toContain("/api/systeme-kit/open/${resource.resourceSlug}");
    expect(resourcesSource).toContain("resources: readonly SystemResource[]");
    expect(detailSource).not.toContain("HistoricalOperationalSystemCopyRequestModal");
    expect(detailSource).not.toContain("Voir le système");
    expect(systemModalSource).toContain("Système opérationnel - {systemName}");
    expect(systemModalSource).toContain("Recevoir ma copie modifiable");
    expect(systemModalSource).toContain('const flowKey = `system-copy:${systemSlug}`');
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
    expect(source).toContain("min-h-[248px]");
    expect(source).toContain("md:aspect-square");
    expect(source).toContain("md:min-h-0");
    expect(source).not.toContain("line-clamp-3");
    expect(source).not.toMatch(/\bposition\b/);
  });

  it("keeps the W6 SEO and JSON-LD integration gate explicit", async () => {
    const gate = await readSource("docs/system-solutions-ui-w6-integration-gate.md");
    const pageSource = await readSource("src/app/kit-operationnel/[slug]/page.tsx");

    expect(gate).toContain("bloqué avant W6");
    expect(gate).toContain("JSON-LD");
    expect(gate).toContain("published-only");
    expect(pageSource).toContain(
      "buildSystemPageJsonLd(data, visiblePublishedSolutionSections)",
    );
  });
});
