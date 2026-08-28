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
import { filterPublicSystemRecommendationSections } from "@/lib/public-solution-section-visibility";
import { composePublicSolutionSectionsForSystem } from "@/lib/canonical-services-system-section.server";
import { loadFirebaseSolutionRegistryRevision } from "@/lib/firebase-solution-registry.server";
import {
  selectRenderableSolutionSectionsFromRevision,
} from "@/lib/firebase-solution-registry-selection.server";
import {
  filterRenderableSolutionSections,
  getPublishedRenderableSolutionSectionsForSystem,
  getRenderableSolutionSectionsForSystem,
} from "@/lib/system-solutions-ui.server";
import { getSolutionResourcePresentation } from "@/lib/solution-resource-presentation.server";
import { getSolutionsUiCopy } from "@/lib/solutions-ui-copy";
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
  it("uses one typed section dictionary and the natural English Services label", () => {
    expect(getSolutionsUiCopy("fr").sectionLabels.services).toBe("Accompagnement");
    expect(getSolutionsUiCopy("en").sectionLabels.services).toBe("Services");
  });

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

  it("inserts Resources after Tools and hides only the Services rail in the Plan", async () => {
    const markup = renderToStaticMarkup(
      createElement(SystemSolutionsTab, {
        sections: publishedSolutionSectionsFixture,
        interstitialAfterSection: "software",
        interstitialContent: createElement(
          "section",
          { "data-test-resources": true },
          "Ressources",
        ),
      }),
    );
    expect(markup.indexOf("Outils")).toBeLessThan(markup.indexOf("Ressources"));
    expect(markup.indexOf("Ressources")).toBeLessThan(markup.indexOf("Fournisseurs"));

    const panelSource = await readSource("src/components/ActionPlanSystemPanel.tsx");
    const aidsSource = await readSource("src/hooks/useActionPlanContextualAids.ts");
    expect(panelSource).toContain('section !== "services" && section !== "models"');
    expect(panelSource).toContain('interstitialAfterSection="software"');
    expect(aidsSource).toContain("solutionSections: payload.solutionSections");
  });

  it("keeps Services out of public system recommendations without removing the payload section", async () => {
    const servicesSection = {
      section: "services" as const,
      placements: [],
    };
    const softwareSection = {
      section: "software" as const,
      placements: [],
    };

    expect(filterPublicSystemRecommendationSections([
      softwareSection,
      servicesSection,
    ])).toEqual([softwareSection]);

    const pageSource = await readSource("src/app/(marketing)/solutions/[slug]/page.tsx");
    const recapSource = await readSource(
      "src/app/(marketing)/systemes/[slug]/recapitulatif/page.tsx",
    );
    const apiSource = await readSource("src/app/api/action-plan/system/[slug]/route.ts");

    expect(pageSource).toContain("filterPublicSystemRecommendationSections");
    expect(recapSource).toContain("filterPublicSystemRecommendationSections");
    expect(apiSource).toContain("composePublicSolutionSectionsForSystem");
    expect(apiSource).not.toContain("filterPublicSystemRecommendationSections");
  });

  it("keeps recruitment and training recommendations out of public métier pages", () => {
    const visiblePlacement = publishedSolutionSectionsFixture[0]!.placements[0]!;
    const hiddenRecruitmentPlacement = {
      ...visiblePlacement,
      placementId: "hidden-recruitment",
      resource: {
        ...visiblePlacement.resource,
        resourceSlug: "hidden-recruitment",
        displayCategory: "Recrutement & alternance",
      },
    };
    const hiddenTrainingPlacement = {
      ...visiblePlacement,
      placementId: "hidden-training",
      resource: {
        ...visiblePlacement.resource,
        resourceSlug: "hidden-training",
        displayCategory: "Formation",
      },
    };

    const [visibleSection] = filterPublicSystemRecommendationSections([
      {
        section: "software",
        placements: [
          visiblePlacement,
          hiddenRecruitmentPlacement,
          hiddenTrainingPlacement,
        ],
      },
    ]);

    expect(visibleSection?.placements).toEqual([visiblePlacement]);
  });

  it("enforces the public exclusions across every métier selection", () => {
    for (const system of enterpriseCatalog) {
      const visibleSections = filterPublicSystemRecommendationSections(
        getRenderableSolutionSectionsForSystem(system.slug),
      );

      expect(visibleSections.map(({ section }) => section)).not.toContain("services");
      expect(
        visibleSections.flatMap(({ placements }) =>
          placements.map(({ resource }) => resource.displayCategory ?? ""),
        ),
      ).not.toEqual(
        expect.arrayContaining([
          expect.stringMatching(/\b(?:formation|recrutement)\b/i),
        ]),
      );
    }
  });

  it("builds the complete public rail sequence for all métiers while keeping SEO published-only", async () => {
    const revision = await loadFirebaseSolutionRegistryRevision({ forceLocal: true });
    const expectedPublicOrder = [
      "software",
      "providers",
      "financing",
      "networks",
      "aids",
    ] as const;

    for (const system of enterpriseCatalog) {
      const selectedSections = selectRenderableSolutionSectionsFromRevision(
        revision,
        system.slug,
      );
      const visibleSections = filterPublicSystemRecommendationSections(
        composePublicSolutionSectionsForSystem(system.slug, selectedSections),
      );
      const renderedSections = visibleSections.filter(({ placements }) => placements.length > 0);
      const visibleSectionNames = renderedSections.map(({ section }) => section);
      const orderedVisibleSectionNames = expectedPublicOrder.filter((section) =>
        visibleSectionNames.includes(section),
      );

      expect(visibleSectionNames).toEqual(orderedVisibleSectionNames);
      const placementIds = renderedSections.flatMap(({ placements }) =>
        placements.map(({ placementId }) => placementId)
      );
      expect(placementIds).toHaveLength(new Set(placementIds).size);
    }

    const systemSlug = "cabinet-comptable";
    const selectedSections = selectRenderableSolutionSectionsFromRevision(
      revision,
      systemSlug,
    );
    const visibleSections = filterPublicSystemRecommendationSections(
      composePublicSolutionSectionsForSystem(systemSlug, selectedSections),
    );
    expect(visibleSections.map(({ section }) => section)).toEqual(expectedPublicOrder);
    expect(
      visibleSections.find(({ section }) => section === "providers")?.placements
        .map(({ resource }) => resource.resourceSlug),
    ).toEqual(["amazon-business"]);
    expect(
      visibleSections.find(({ section }) => section === "networks")?.placements
        .map(({ resource }) => resource.resourceSlug),
    ).toEqual(["ordre-experts-comptables", "croec-regional"]);

    const markup = renderToStaticMarkup(
      createElement(SystemSolutionsTab, { sections: visibleSections }),
    );
    const expectedHeadings = [
      "Outils et logiciels",
      "Fournisseurs",
      "Banque &amp; Financement",
      "Réseaux professionnels",
      "Aides &amp; Subventions",
    ];
    for (const [index, heading] of expectedHeadings.entries()) {
      expect(markup).toContain(heading);
      if (index > 0) {
        expect(markup.indexOf(expectedHeadings[index - 1]!))
          .toBeLessThan(markup.indexOf(heading));
      }
    }
    expect(markup).not.toContain("Financement et aides");

    const publishedSections = selectRenderableSolutionSectionsFromRevision(
      revision,
      systemSlug,
      { publishedOnly: true },
    );
    const publishedSlugs = new Set(
      publishedSections.flatMap(({ placements }) =>
        placements.map(({ resource }) => resource.resourceSlug)
      ),
    );
    const draftEcosystemSlugs = revision.placements
      .filter(({ placement }) =>
        placement.systemSlug === systemSlug &&
        placement.editorialStatus === "selected" &&
        placement.status !== "published" &&
        (placement.section === "providers" || placement.section === "networks")
      )
      .map(({ placement }) => placement.resourceSlug);
    expect(draftEcosystemSlugs.length).toBeGreaterThan(0);
    expect(draftEcosystemSlugs.every((slug) => !publishedSlugs.has(slug))).toBe(true);
  }, 20_000);

  it("shows saved cards first in a dedicated selection rail", () => {
    const placement = publishedSolutionSectionsFixture[0]?.placements[0];
    expect(placement).toBeDefined();

    const markup = renderToStaticMarkup(
      createElement(SystemSolutionsTab, {
        sections: publishedSolutionSectionsFixture,
        selectedPlacementIds: new Set([placement!.placementId]),
        onToggleSelection: () => undefined,
      }),
    );

    expect(markup).toContain("Votre sélection");
    expect(markup).toContain(`aria-label="Retirer ${placement!.resource.name} de votre sélection"`);
    expect(markup.indexOf("Votre sélection")).toBeLessThan(markup.indexOf("Outils"));
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
    expect(resourcesMarkup).not.toContain("Tableau de pilotage opérationnel");
    expect(resourcesMarkup).toContain("Processus métier");
    expect(resourcesMarkup).toContain("Suivi et prévisionnel financier");
    expect(resourcesMarkup).toContain("CRM - suivi commercial");
    expect(guidesMarkup).not.toContain("La facturation électronique");
    expect(guidesMarkup).not.toContain(
      "Maîtriser les obligations et les finances de son entreprise",
    );
    expect(guidesMarkup.match(/Bientôt disponible/g)).toHaveLength(2);
    expect(guidesMarkup.match(/Être informé\(e\)/g)).toHaveLength(2);
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
        const requiredSlugs = [
          ...familySelection.placements
            .filter(({ resourceSlug, editorialStatus }) => (
              resourceSlug !== "levier" && editorialStatus === "selected"
            ))
            .map(({ resourceSlug }) => resourceSlug),
          ...referralSlugs,
          "levier",
        ];
        for (const requiredSlug of requiredSlugs) {
          expect(renderedSlugs).toContain(requiredSlug);
        }
        expect(renderedSlugs).toHaveLength(new Set(renderedSlugs).size);
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
      expect(getVisibleSystemDetailTabs()).toEqual(["process", "solutions"]);
    }
  }, 10_000);

  it("reuses the existing resource classifications across the four rails", () => {
    const placements = enterpriseCatalog.flatMap(({ slug }) =>
      getRenderableSolutionSectionsForSystem(slug).flatMap((section) => section.placements),
    );
    const bySection = Object.groupBy(placements, ({ section }) => section);

    expect(placements.length).toBeGreaterThanOrEqual(603);
    expect(bySection.software?.length).toBeGreaterThanOrEqual(313);
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
      const actualSections = sections.map(({ placements }) =>
        placements.map(({ resource }) => resource.resourceSlug)
      );
      expect(actualSections).toHaveLength(expectedSections.length);
      for (const [index, expectedSlugs] of expectedSections.entries()) {
        expect(actualSections[index].slice(0, expectedSlugs.length)).toEqual(expectedSlugs);
      }
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
    const copySource = await readSource("src/lib/solutions-ui-copy.ts");
    expect(copySource).toContain("Ce que vous y gagnez");
    expect(copySource).toContain("Pourquoi cette solution");
    expect(copySource).toContain("Tarif indicatif");
    expect(copySource).toContain("À vérifier avant de choisir");
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
    const pageSource = await readSource("src/app/(marketing)/solutions/[slug]/page.tsx");
    const detailSource = await readSource("src/components/SystemDetailContent.tsx");
    const solutionsSource = await readSource("src/components/SystemSolutionsTab.tsx");

    expect(pageSource).toContain("getActivePublicRenderableSolutionSectionsForSystem,");
    expect(pageSource).toContain(
      'from "@/lib/firebase-solution-registry-selection.server"',
    );
    expect(pageSource).toContain("solutionSections={visibleSolutionSections}");
    expect(pageSource).toContain("filterPublicSystemRecommendationSections");
    expect(pageSource).toContain("composePublicSolutionSectionsForSystem");
    expect(pageSource).not.toContain("getRenderableExpertiseSectionForSystem");
    expect(pageSource).not.toContain("getMigrationSafe");
    expect(detailSource).not.toMatch(/solution-registry\.(?:server|contract)/);
    expect(solutionsSource).toContain("import type {");
    expect(solutionsSource).toContain('from "@/lib/solution-registry-dto"');
    expect(solutionsSource).not.toMatch(/solution-registry\.(?:server|contract)/);
    expect(solutionsSource).not.toMatch(/SystemEcosystem|system-ecosystem/);
    expect(solutionsSource).toContain('interactionMode === "referral_form"');
    expect(solutionsSource).toContain("SolutionReferralForm");
  });

  it("removes public tab state and keeps Resources out of the métier page", async () => {
    const detailSource = await readSource("src/components/SystemDetailContent.tsx");

    expect(detailSource).not.toContain('url.searchParams.set("tab", tab)');
    expect(detailSource).not.toContain('role="tablist"');
    expect(detailSource).not.toContain("getVisibleSystemDetailTabs()");
    expect(detailSource).not.toContain("requestAnimationFrame");
    expect(detailSource).not.toContain("SystemeTabContent");
    expect(detailSource).not.toContain("solutionsAvailable");
    expect(detailSource).not.toContain("detail: OperationalSystemDetail");
    expect(detailSource).not.toContain("systeme: SystemeDetail | null");
    expect(detailSource).toContain("<SystemSolutionsTab");
    expect(detailSource).not.toContain("<SystemResourcesTab");
    expect(detailSource).toContain("Voir les processus du métier");
    expect(detailSource).toContain("<LeaderDailyRail />");
    expect(detailSource).not.toContain("StructureNewsletterBlock");
  });

  it("presents the leader daily tools as a standard solution rail", async () => {
    const source = await readSource("src/components/LeaderDailyRail.tsx");
    const cardSource = await readSource("src/components/SolutionRailCard.tsx");

    expect(source).toContain("Le quotidien du dirigeant");
    expect(source).not.toContain("Simplifier aussi votre quotidien");
    expect(source).not.toContain("Sélection éditoriale");
    expect(source).toContain("data-leader-daily-card");
    expect(source).toContain("SOLUTION_RAIL_CLASS_NAME");
    expect(source).toContain("SOLUTION_RAIL_CARD_FRAME_CLASS_NAME");
    expect(source).toContain("SOLUTION_RAIL_CARD_INTERACTIVE_CLASS_NAME");
    expect(source).toContain("SolutionRailCardContent");
    expect(cardSource).toContain("lg:auto-cols-[calc((100%_-_3rem)_/_3.5)]");
    expect(cardSource).not.toContain("xl:auto-cols-[calc((100%_-_3rem)_/_4)]");
    expect(source).not.toContain("DirectoryDetailDialogShell");
  });

  it("keeps the daily rail inside the solution kit and only two final next steps", async () => {
    const detailSource = await readSource("src/components/SystemDetailContent.tsx");
    const nextStepsSource = await readSource("src/components/SystemSolutionNextSteps.tsx");

    expect(detailSource.indexOf("<LeaderDailyRail />")).toBeLessThan(
      detailSource.indexOf("<SystemSolutionNextSteps"),
    );
    expect(detailSource).not.toContain("<SystemContextualCaseStudy");
    expect(nextStepsSource.match(/<article/g)).toHaveLength(2);
    expect(nextStepsSource).toContain("Commencer avec une structure prête à copier");
    expect(nextStepsSource).toContain("Voir les modèles adaptés");
    expect(nextStepsSource).toContain(
      "Aucune solution ne correspond à votre fonctionnement ?",
    );
  });

  it("keeps the historical Resources machinery available without exposing it on métier pages", async () => {
    const detailSource = await readSource("src/components/SystemDetailContent.tsx");
    const resourcesSource = await readSource("src/components/SystemResourcesTab.tsx");
    const resourcePreviewSource = await readSource(
      "src/components/SystemResourcePreviewModal.tsx",
    );

    expect(detailSource).not.toContain('setDeliveryModal("system")');
    expect(detailSource).not.toContain("<SystemGuidesRail");
    expect(detailSource).not.toContain("<SystemResourcesTab");
    expect(detailSource).not.toContain("getAvailableSystemTemplatesForSystem(system.slug)");
    expect(detailSource).toContain("Voir les processus du métier");
    expect(detailSource).not.toContain("OperationalSystemCopyRequestModal");
    expect(resourcesSource).not.toContain("OperationalSystemCopyRequestModal");
    expect(resourcesSource).toContain("SystemResourcePreviewModal");
    expect(resourcesSource).toContain("initialResourceSlug");
    expect(resourcesSource).toContain("onResourceSlugChange(resource.resourceSlug)");
    expect(resourcesSource).toContain("onResourceSlugChange(undefined)");
    expect(resourcesSource).toContain("/systemes/${systemSlug}/processus");
    expect(resourcePreviewSource).toContain("/api/systeme-kit/open/${resource.resourceSlug}");
    expect(resourcesSource).toContain("resources: readonly SystemResource[]");
    expect(detailSource).not.toContain("Voir le système");
  });

  it("reuses the accessible modal lifecycle and resets selection on close", async () => {
    const solutionsSource = await readSource("src/components/SystemSolutionsTab.tsx");
    const dialogSource = await readSource("src/components/DirectoryDetailDialogShell.tsx");
    const hookSource = await readSource("src/components/useAccessibleDialog.ts");

    expect(solutionsSource).toContain("DirectoryDetailDialogShell");
    expect(solutionsSource).toContain('resource.interaction.interactionMode === "detail" &&');
    expect(solutionsSource).toContain("!onResourceSlugChange");
    expect(solutionsSource).toContain("onResourceSlugChange(undefined)");
    expect(solutionsSource).toContain("setLocalSelected(null)");
    expect(dialogSource).toContain("useAccessibleDialog({ onClose })");
    expect(dialogSource).toContain("data-dialog-initial-focus");
    expect(hookSource).toContain('event.key === "Escape"');
    expect(hookSource).toContain('event.key !== "Tab"');
    expect(hookSource).toContain("previouslyFocused?.focus()");
  });

  it("keeps compact uniform cards and exposes the next card across breakpoints", async () => {
    const source = await readSource("src/components/SystemSolutionsTab.tsx");
    const cardSource = await readSource("src/components/SolutionRailCard.tsx");
    const detailSource = await readSource("src/components/SystemDetailContent.tsx");

    expect(source).toContain("SOLUTION_RAIL_CLASS_NAME");
    expect(source).toContain("SOLUTION_RAIL_CARD_FRAME_CLASS_NAME");
    expect(source).toContain("SOLUTION_RAIL_CARD_INTERACTIVE_CLASS_NAME");
    expect(source).toContain("SolutionRailCardContent");
    expect(cardSource).toContain("max-w-full");
    expect(cardSource).toContain("min-w-0");
    expect(cardSource).toContain("overflow-x-auto");
    expect(cardSource).toContain("overscroll-x-contain");
    expect(cardSource).toContain("auto-cols-[82%]");
    expect(cardSource).toContain("md:auto-cols-[calc((100%_-_2rem)_/_2.5)]");
    expect(cardSource).toContain("lg:auto-cols-[calc((100%_-_3rem)_/_3.5)]");
    expect(cardSource).not.toContain("xl:auto-cols-[calc((100%_-_3rem)_/_4)]");
    expect(cardSource).toContain("items-stretch");
    expect(cardSource).toContain("h-[15.5rem]");
    expect(cardSource).toContain("group flex h-full w-full");
    expect(detailSource).toContain('embedded ? "mx-auto max-w-[55.2rem]" : "max-w-[67.5rem]"');
    expect(cardSource).not.toContain("sm:p-6");
    expect(cardSource).not.toContain("xl:p-5");
    expect(cardSource).not.toContain("xl:mt-3");
    expect(cardSource).not.toContain("min-h-[15rem]");
    expect(cardSource).not.toContain("md:min-h-[16rem]");
    expect(cardSource).not.toContain("aspect-square");
    expect(cardSource).toContain("line-clamp-2");
    expect(cardSource).not.toContain("line-clamp-3");
    expect(cardSource).not.toContain("mt-auto shrink-0");
    expect(source).not.toContain("Tarif abonné");
    expect(source).not.toContain("Avantage abonné");
    expect(source).not.toMatch(/\bposition\b/);
  });

  it("keeps the W6 SEO and JSON-LD integration gate explicit", async () => {
    const gate = await readSource("docs/system-solutions-ui-w6-integration-gate.md");
    const pageSource = await readSource("src/app/(marketing)/solutions/[slug]/page.tsx");

    expect(gate).toContain("bloqué avant W6");
    expect(gate).toContain("JSON-LD");
    expect(gate).toContain("published-only");
    expect(pageSource).toContain(
      "buildSystemPageJsonLd(data, visiblePublishedSolutionSections)",
    );
  });
});
