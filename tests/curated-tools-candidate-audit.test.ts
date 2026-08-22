import { describe, expect, it } from "vitest";

import {
  buildStableSoftwarePlacementId,
  validateCuratedToolsCandidateRevision,
} from "@/lib/curated-tools-candidate-audit";
import {
  fingerprintFirebaseSolutionRegistryRevision,
  type FirebaseSolutionRegistryRevision,
} from "@/lib/firebase-solution-registry-contract";

const NOW = "2026-08-22T00:00:00.000Z";
const EXPIRES = "2027-08-22T00:00:00.000Z";

function review(id: string) {
  return {
    evidence: [{
      evidenceId: `evidence-${id}`,
      sourceRef: `https://example.com/${id}`,
      claim: `Official product information for ${id}.`,
      evidenceType: "official_product_page" as const,
      capturedAt: NOW,
    }],
    reviewer: "D-091 review",
    reviewedAt: NOW,
    expiresAt: EXPIRES,
  };
}

function revision(input?: {
  legacyFirstId?: string;
  statuses?: "draft" | "published";
}) {
  const status = input?.statuses ?? "published";
  const resources = Array.from({ length: 10 }, (_, index) => ({
    resource: {
      resourceSlug: `tool-${index + 1}`,
      resourceType: "software" as const,
      name: `Tool ${index + 1}`,
      description: `A complete official description for tool ${index + 1}.`,
      interactionMode: "external_link" as const,
      href: `https://example.com/tool-${index + 1}`,
      commercialRelationship: "none" as const,
      status,
      resourceVersion: "d091.v1",
      publicationBlockers: status === "published" ? [] : ["review-required"],
      ...review(`resource-${index + 1}`),
    },
  }));
  const placements = resources.map(({ resource }, index) => ({
    placement: {
      placementId: index === 0 && input?.legacyFirstId
        ? input.legacyFirstId
        : buildStableSoftwarePlacementId({
            systemSlug: "test-system",
            resourceSlug: resource.resourceSlug,
          }),
      systemSlug: "test-system",
      resourceSlug: resource.resourceSlug,
      rank: index + 1,
      section: "software" as const,
      usage: `Utiliser Tool ${index + 1} pour couvrir une étape opérationnelle prioritaire.`,
      fitRationale: `Tool ${index + 1} répond à un besoin documenté du système métier testé.`,
      fitConstraints: ["Vérifier les intégrations avec les outils déjà utilisés."],
      editorialStatus: "selected" as const,
      commercialRelationship: "none" as const,
      status,
      placementVersion: "d091.v1",
      publicationBlockers: status === "published" ? [] : ["review-required"],
      ...review(`placement-${index + 1}`),
    },
    presentation: {
      displayCategory: `Catégorie ${index + 1}`,
      ctaLabel: "Découvrir",
    },
  }));
  const withoutFingerprint = {
    schemaVersion: 1 as const,
    revisionId: "d091-test",
    revisionStatus: "draft" as const,
    createdAt: NOW,
    createdBy: "tests",
    sourceFingerprint: "0".repeat(64),
    knownSystemSlugs: ["test-system"],
    resources,
    placements,
  };
  return {
    ...withoutFingerprint,
    sourceFingerprint: fingerprintFirebaseSolutionRegistryRevision(withoutFingerprint),
  } satisfies FirebaseSolutionRegistryRevision;
}

describe("D-091 curated tools candidate audit", () => {
  it("accepts ten published, evidenced and rank-stable tools", () => {
    const candidate = revision();
    expect(validateCuratedToolsCandidateRevision(candidate, {
      activeToolSlugs: new Set(candidate.resources.map(({ resource }) => resource.resourceSlug)),
      expectedSystemSlugs: ["test-system"],
    })).toEqual([]);
  });

  it("fails closed for draft entries and incomplete coverage", () => {
    const candidate = revision({ statuses: "draft" });
    candidate.placements.pop();
    const errors = validateCuratedToolsCandidateRevision(candidate, {
      expectedSystemSlugs: ["test-system"],
    });

    expect(errors).toEqual(expect.arrayContaining([
      expect.stringContaining("expected exactly ten"),
      expect.stringContaining("placement is not publication-ready"),
      expect.stringContaining("resource is not publication-ready"),
    ]));
  });

  it("preserves a retained legacy placement ID even when its rank changes", () => {
    const active = revision({ legacyFirstId: "test-system:tool-1:software:1" });
    const candidate = revision();
    candidate.placements[0]!.placement.placementId = "test-system:tool-1:software:2";

    expect(validateCuratedToolsCandidateRevision(candidate, {
      activeRevision: active,
      expectedSystemSlugs: ["test-system"],
    })).toContain("test-system:tool-1:software: retained placement ID changed");
  });
});
