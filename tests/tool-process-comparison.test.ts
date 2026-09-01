import { describe, expect, it } from "vitest";
import { enterpriseCatalogBySlug } from "@/lib/enterprise-annuaire";
import { enterpriseCatalog } from "@/lib/enterprise-annuaire";
import {
  isReviewedGenericToolComparisonSystem,
  REVIEWED_GENERIC_TOOL_COMPARISON_SYSTEM_SLUGS,
  TOOL_CAPABILITY_COMPARISON_REVIEWS,
} from "@/lib/tool-capability-comparison-data";
import {
  getGenericToolComparisonFeatures,
  isKnownToolComparisonCapabilityId,
} from "@/lib/tool-feature-comparison-catalog";
import { TOOL_PROCESS_COMPARISON_REVIEWS } from "@/lib/tool-process-comparison-data";
import { getToolDirectoryItemBySlug } from "@/lib/tool-directory";
import { getCuratedToolRecommendationsForSystem } from "@/lib/system-tool-recommendations";
import {
  auditToolComparisonViewQuality,
  auditToolProcessComparisonReview,
  buildToolProcessComparisonView,
} from "@/lib/tool-process-comparison.server";
import type { RenderableSolutionSectionDto } from "@/lib/system-solutions-ui-dto";

function softwareSection(
  systemSlug: string,
  tools: readonly { slug: string; name: string }[],
): RenderableSolutionSectionDto[] {
  return [
    {
      section: "software",
      placements: tools.map((tool, index) => ({
        placementId: `${systemSlug}:${tool.slug}`,
        systemSlug,
        rank: index + 1,
        section: "software",
        usage: "Test",
        fitRationale: "Test",
        fitConstraints: [],
        resource: {
          resourceSlug: tool.slug,
          resourceType: "software",
          name: tool.name,
          description: "Test",
          interaction: {
            interactionMode: "external_link",
            href: "https://example.com",
          },
        },
      })),
    },
  ];
}

describe("tool process comparison", () => {
  it("keeps review keys and evidence identifiers unique", () => {
    const genericSlugs = TOOL_CAPABILITY_COMPARISON_REVIEWS.map(
      (review) => review.resourceSlug,
    );
    expect(new Set(genericSlugs).size).toBe(genericSlugs.length);

    const manualKeys = TOOL_PROCESS_COMPARISON_REVIEWS.map(
      (review) => `${review.systemSlug}::${review.resourceSlug}`,
    );
    expect(new Set(manualKeys).size).toBe(manualKeys.length);

    for (const review of [
      ...TOOL_CAPABILITY_COMPARISON_REVIEWS,
      ...TOOL_PROCESS_COMPARISON_REVIEWS,
    ]) {
      const evidenceIds = review.evidence.map((evidence) => evidence.evidenceId);
      expect(new Set(evidenceIds).size, review.resourceSlug).toBe(
        evidenceIds.length,
      );
    }
  });

  it("only uses canonical atomic capability identifiers", () => {
    for (const review of TOOL_CAPABILITY_COMPARISON_REVIEWS) {
      for (const capabilityId of Object.keys(review.capabilities)) {
        expect(
          isKnownToolComparisonCapabilityId(capabilityId),
          `${review.resourceSlug}/${capabilityId}`,
        ).toBe(true);
      }
    }
  });

  it("links each positive cabinet cell to a focused evidence subset", () => {
    for (const review of TOOL_PROCESS_COMPARISON_REVIEWS) {
      for (const [featureId, feature] of Object.entries(review.features)) {
        if (feature.status === "not_documented") {
          expect(feature.evidenceIds, `${review.resourceSlug}/${featureId}`).toEqual([]);
          continue;
        }
        expect(feature.evidenceIds.length, `${review.resourceSlug}/${featureId}`).toBeGreaterThan(0);
        expect(feature.evidenceIds.length, `${review.resourceSlug}/${featureId}`).toBeLessThanOrEqual(
          review.evidence.length,
        );
      }
    }

    const tiimora = TOOL_PROCESS_COMPARISON_REVIEWS.find(
      (review) => review.resourceSlug === "tiimora",
    );
    expect(
      tiimora?.features["accounting.engagement-signature"].evidenceIds,
    ).toEqual(["cabinet-comptable-tiimora-official"]);
    expect(
      tiimora?.features["accounting.client-requests"].evidenceIds,
    ).toEqual(["cabinet-comptable-tiimora-requests"]);
  });

  it("defines a 15-feature profile for every generic system", () => {
    for (const enterprise of enterpriseCatalog) {
      if (enterprise.slug === "cabinet-comptable") continue;

      const features = getGenericToolComparisonFeatures(enterprise.slug);
      expect(features, enterprise.slug).toHaveLength(15);
      expect(
        new Set(features?.map((feature) => feature.featureId)).size,
        enterprise.slug,
      ).toBe(15);
      expect(
        features?.every(
          (feature) =>
            feature.label.trim() &&
            feature.description.trim() &&
            feature.matchTerms.length > 0,
        ),
        enterprise.slug,
      ).toBe(true);
    }
  });

  it("keeps an internal draft for every unreviewed generic system", () => {
    for (const enterprise of enterpriseCatalog) {
      if (
        enterprise.slug === "cabinet-comptable" ||
        isReviewedGenericToolComparisonSystem(enterprise.slug)
      ) {
        continue;
      }

      const candidateSlugs = [
        ...(getCuratedToolRecommendationsForSystem(enterprise.slug) ?? []),
        ...(enterprise.toolRefs ?? []).map((reference) => reference.slug),
      ];
      const tools = [...new Set(candidateSlugs)]
        .map((reference) => {
          const tool = getToolDirectoryItemBySlug(reference);
          return tool
            ? { slug: reference, name: tool.name }
            : null;
        })
        .filter((tool): tool is { slug: string; name: string } => Boolean(tool))
        .slice(0, 2);

      expect(tools, enterprise.slug).toHaveLength(2);
      const sections = softwareSection(enterprise.slug, tools);
      expect(
        auditToolProcessComparisonReview({ enterprise, sections }),
        enterprise.slug,
      ).toEqual([]);

      const comparison = buildToolProcessComparisonView({
        enterprise,
        systemName: enterprise.name,
        sections,
        enforceQuality: false,
      });
      expect(comparison?.features, enterprise.slug).toHaveLength(15);
      expect(comparison?.tools, enterprise.slug).toHaveLength(2);
      expect(
        buildToolProcessComparisonView({
          enterprise,
          systemName: enterprise.name,
          sections,
        }),
        enterprise.slug,
      ).toBeNull();
    }
  });

  it("builds a flat building feature comparison", () => {
    const enterprise = enterpriseCatalogBySlug.batiment;
    const sections = softwareSection("batiment", [
      { slug: "obat", name: "Obat" },
      { slug: "costructor", name: "Costructor" },
      { slug: "progbat", name: "ProGBat" },
      { slug: "vertuoza", name: "Vertuoza" },
    ]);

    expect(
      auditToolProcessComparisonReview({ enterprise, sections }),
    ).toEqual([]);
    const comparison = buildToolProcessComparisonView({
      enterprise,
      systemName: "Bâtiment",
      sections,
    });

    expect(comparison?.tools).toHaveLength(4);
    expect(comparison?.features).toHaveLength(15);
    expect(comparison).not.toHaveProperty("processes");
    expect(comparison?.features[0].label).toBe("Clients et prospects");
    expect(comparison?.tools.map((tool) => tool.positioning)).toEqual([
      "Devis & suivi de chantier",
      "Gestion BTP",
      "Gestion BTP tout-en-un",
      "Pilotage de chantier",
    ]);
    const progbatIndex = comparison?.tools.findIndex(
      (tool) => tool.resourceSlug === "progbat",
    );
    expect(
      comparison?.features.filter(
        (feature) =>
          feature.cells[progbatIndex!].status !== "not_documented",
      ).length,
    ).toBeGreaterThanOrEqual(8);
    comparison?.tools.forEach((_, toolIndex) => {
      expect(
        comparison.features.filter(
          (feature) =>
            feature.cells[toolIndex].status !== "not_documented",
        ).length,
      ).toBeGreaterThanOrEqual(3);
    });
  });

  it("supports the six production accounting tools", () => {
    const enterprise = enterpriseCatalogBySlug["cabinet-comptable"];
    const sections = softwareSection("cabinet-comptable", [
      { slug: "pennylane", name: "Pennylane" },
      { slug: "tiimora", name: "Tiimora" },
      { slug: "sage-generation-experts", name: "Sage Génération Experts" },
      { slug: "cegid-loop", name: "Cegid Loop" },
      { slug: "inqom-expert", name: "Inqom Expert" },
      { slug: "silae", name: "Silae" },
    ]);

    const comparison = buildToolProcessComparisonView({
      enterprise,
      systemName: "Cabinet comptable",
      sections,
    });

    expect(comparison?.tools).toHaveLength(6);
    expect(comparison?.features).toHaveLength(15);
    expect(comparison).not.toHaveProperty("processes");

    expect(comparison?.tools[1].positioning).toBe("Relation client");
    expect(comparison?.features[0].label).toBe("Production comptable");
    expect(comparison?.features[0].description).toContain("production des comptes");

    const production = comparison?.features.find(
      (feature) => feature.label === "Production comptable",
    );
    const payroll = comparison?.features.find(
      (feature) => feature.label === "Collecte des variables de paie",
    );
    const requests = comparison?.features.find(
      (feature) => feature.label === "Gestion des demandes clients",
    );
    const emailAutomation = comparison?.features.find(
      (feature) => feature.label === "Automatisation des e-mails et relances",
    );
    const legal = comparison?.features.find(
      (feature) => feature.label === "Gestion des demandes juridiques",
    );
    expect(production?.cells[1].status).toBe("not_documented");
    expect(payroll?.cells[5].status).toBe("covered");
    expect(requests?.cells[0].status).toBe("configurable");
    expect(requests?.cells[1].status).toBe("covered");
    expect(emailAutomation?.cells[1].status).toBe("covered");
    expect(legal?.cells[1].status).toBe("configurable");
    expect(legal?.cells[1].note).toContain("module juridique dédié");
  });

  it("fails closed when an active tool is not reviewed", () => {
    const enterprise = enterpriseCatalogBySlug.batiment;
    const sections = softwareSection("batiment", [
      { slug: "obat", name: "Obat" },
      { slug: "outil-inconnu", name: "Outil inconnu" },
    ]);

    expect(
      buildToolProcessComparisonView({
        enterprise,
        systemName: "Bâtiment",
        sections,
      }),
    ).toBeNull();
  });

  it("does not publish a comparison that is too sparse to help a decision", () => {
    const enterprise = enterpriseCatalogBySlug["agence-marketing"];
    const sections = softwareSection("agence-marketing", [
      { slug: "brevo", name: "Brevo" },
      { slug: "notion", name: "Notion" },
    ]);

    expect(
      buildToolProcessComparisonView({
        enterprise,
        systemName: enterprise.name,
        sections,
      }),
    ).toBeNull();

    const candidate = buildToolProcessComparisonView({
      enterprise,
      systemName: enterprise.name,
      sections,
      enforceQuality: false,
    });
    const payments = candidate?.features.find(
      (feature) => feature.label === "Paiements et encaissements",
    );
    expect(payments?.cells[0].status).toBe("not_documented");
  });

  it("does not publish an unreviewed system even when its lexical draft scores well", () => {
    const enterprise = enterpriseCatalogBySlug["cybersecurite-pme"];
    const tools = (getCuratedToolRecommendationsForSystem(enterprise.slug) ?? [])
      .map((slug) => {
        const tool = getToolDirectoryItemBySlug(slug);
        return tool ? { slug, name: tool.name } : null;
      })
      .filter((tool): tool is { slug: string; name: string } => Boolean(tool));
    const sections = softwareSection(enterprise.slug, tools);
    const draft = buildToolProcessComparisonView({
      enterprise,
      systemName: enterprise.name,
      sections,
      enforceQuality: false,
    });

    expect(draft).not.toBeNull();
    expect(auditToolComparisonViewQuality(draft!)).toEqual([]);
    expect(
      buildToolProcessComparisonView({
        enterprise,
        systemName: enterprise.name,
        sections,
      }),
    ).toBeNull();
  });

  it("adds one reviewed métier recommendation when only one tool is visible", () => {
    const enterprise = enterpriseCatalogBySlug["gestionnaire-paie-independant"];
    const sections = softwareSection("gestionnaire-paie-independant", [
      { slug: "silae", name: "Silae" },
    ]);

    const comparison = buildToolProcessComparisonView({
      enterprise,
      systemName: enterprise.name,
      sections,
    });

    expect(comparison?.tools.map((tool) => tool.resourceSlug)).toEqual([
      "silae",
      "payfit",
    ]);
    expect(comparison?.features).toHaveLength(15);
    expect(comparison?.features.slice(0, 7).map((feature) => feature.label)).toEqual([
      "Production des bulletins de paie",
      "Collecte et saisie des variables de paie",
      "DSN et déclarations sociales",
      "Contrôles et alertes de paie",
      "Mises à jour légales et conventionnelles",
      "Gestion multi-dossiers cabinet",
      "Écritures comptables de paie",
    ]);
  });

  it("publishes the restaurant comparison after its core tools are documented", () => {
    const enterprise = enterpriseCatalogBySlug.restaurant;
    const sections = softwareSection("restaurant", [
      { slug: "lightspeed", name: "Lightspeed" },
      { slug: "zenchef", name: "Zenchef" },
      { slug: "l-addition", name: "L’Addition" },
      { slug: "revya", name: "Revya" },
      { slug: "deliverect", name: "Deliverect" },
      { slug: "uber-eats", name: "Uber Eats" },
    ]);

    const comparison = buildToolProcessComparisonView({
      enterprise,
      systemName: enterprise.name,
      sections,
    });

    expect(comparison?.tools).toHaveLength(6);
    expect(comparison?.features).toHaveLength(15);
    expect(
      auditToolProcessComparisonReview({ enterprise, sections }),
    ).toEqual([]);

    const pos = comparison?.features.find(
      (feature) => feature.label === "Caisse et point de vente",
    );
    const deliverectIndex = comparison?.tools.findIndex(
      (tool) => tool.resourceSlug === "deliverect",
    );
    expect(pos?.cells[deliverectIndex!].status).toBe("not_documented");

    const zenchefIndex = comparison?.tools.findIndex(
      (tool) => tool.resourceSlug === "zenchef",
    );
    expect(
      comparison?.features.filter(
        (feature) =>
          feature.cells[zenchefIndex!].status !== "not_documented",
      ).length,
    ).toBeGreaterThanOrEqual(3);
  });

  it("only enables the three evidence-reviewed generic pilots", () => {
    expect(REVIEWED_GENERIC_TOOL_COMPARISON_SYSTEM_SLUGS).toEqual([
      "batiment",
      "restaurant",
      "gestionnaire-paie-independant",
    ]);
  });
});
