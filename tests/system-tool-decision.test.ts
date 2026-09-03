import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import {
  buildSystemToolDecision,
  getSystemToolRoleLabel,
  selectComparableToolColumns,
} from "@/lib/system-tool-decision";
import snapshot from "@/lib/firebase-solution-registry.catalog-enrichment.snapshot.generated.json";
import { parseFirebaseSolutionRegistryRevision } from "@/lib/firebase-solution-registry-contract";
import { selectRenderableSolutionSectionsFromRevision } from "@/lib/firebase-solution-registry-selection.server";
import type { RenderableSolutionPlacementDto } from "@/lib/system-solutions-ui-dto";
import type { ToolProcessComparisonView } from "@/lib/tool-process-comparison-contract";

function placement(
  systemSlug: string,
  resourceSlug: string,
  displayCategory = "Logiciel",
): RenderableSolutionPlacementDto {
  return {
    fitConstraints: [],
    fitRationale: "Adapté au métier.",
    placementId: `${systemSlug}:${resourceSlug}`,
    rank: 1,
    resource: {
      description: `Description de ${resourceSlug}`,
      displayCategory,
      interaction: {
        href: `https://example.com/${resourceSlug}`,
        interactionMode: "external_link",
      },
      name: resourceSlug,
      resourceSlug,
      resourceType: "software",
    },
    section: "software",
    systemSlug,
    usage: "Usage métier",
  };
}

describe("system tool decision", () => {
  it("classifies every visible tool exactly once in the synced registry", () => {
    const revision = parseFirebaseSolutionRegistryRevision(snapshot);

    for (const systemSlug of revision.knownSystemSlugs) {
      const software = selectRenderableSolutionSectionsFromRevision(
        revision,
        systemSlug,
      ).find(({ section }) => section === "software");
      if (!software) continue;

      const decision = buildSystemToolDecision(systemSlug, software.placements);
      const classified = [
        ...decision.comparable,
        ...decision.complementary,
        ...decision.unclassified,
      ].map(({ resource }) => resource.resourceSlug);
      const visible = software.placements.map(
        ({ resource }) => resource.resourceSlug,
      );

      expect(new Set(classified).size, systemSlug).toBe(classified.length);
      expect(classified.toSorted(), systemSlug).toEqual(visible.toSorted());
    }
  });

  it("separates law-firm management software from legal research", () => {
    const decision = buildSystemToolDecision("cabinet-davocat", [
      placement("cabinet-davocat", "doctrine", "Recherche juridique & IA"),
      placement("cabinet-davocat", "jarvis-legal", "Gestion du cabinet"),
      placement("cabinet-davocat", "kleos", "Gestion du cabinet"),
      placement("cabinet-davocat", "secib", "Gestion du cabinet"),
    ]);

    expect(decision.comparable.map(({ resource }) => resource.resourceSlug)).toEqual([
      "kleos",
      "secib",
      "jarvis-legal",
    ]);
    expect(decision.complementary.map(({ resource }) => resource.resourceSlug)).toEqual([
      "doctrine",
    ]);
    expect(decision.unclassified).toEqual([]);
  });

  it("does not compare restaurant delivery and loyalty tools with cash registers", () => {
    const slugs = [
      "lightspeed",
      "zenchef",
      "deliverect",
      "l-addition",
      "revya",
      "uber-eats",
    ];
    const decision = buildSystemToolDecision(
      "restaurant",
      slugs.map((slug) => placement("restaurant", slug, "Logiciel")),
    );

    expect(decision.comparable.map(({ resource }) => resource.resourceSlug)).toEqual([
      "lightspeed",
      "l-addition",
    ]);
    expect(decision.complementary.map(({ resource }) => resource.resourceSlug)).toEqual([
      "zenchef",
      "deliverect",
      "revya",
      "uber-eats",
    ]);
    expect(getSystemToolRoleLabel("restaurant", "zenchef")).toBe(
      "Réservations & relation client",
    );
  });

  it("removes complementary columns from an existing comparison", () => {
    const comparison: ToolProcessComparisonView = {
      features: [
        {
          cells: [
            { evidenceIds: ["a"], status: "covered" },
            { evidenceIds: [], status: "not_documented" },
            { evidenceIds: ["c"], status: "covered" },
          ],
          featureId: "cash-register",
          label: "Caisse",
        },
      ],
      reviewedAt: "2026-09-01",
      systemName: "Restaurant",
      systemSlug: "restaurant",
      tools: [
        { name: "Lightspeed", positioning: "Caisse", resourceSlug: "lightspeed" },
        { name: "Zenchef", positioning: "Réservation", resourceSlug: "zenchef" },
        { name: "L’Addition", positioning: "Caisse", resourceSlug: "l-addition" },
      ],
    };
    const direct = [
      placement("restaurant", "lightspeed"),
      placement("restaurant", "l-addition"),
    ];

    const filtered = selectComparableToolColumns(comparison, direct);
    expect(filtered?.tools.map(({ resourceSlug }) => resourceSlug)).toEqual([
      "lightspeed",
      "l-addition",
    ]);
    expect(filtered?.features[0].cells).toHaveLength(2);
  });
});
