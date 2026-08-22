import { describe, expect, it } from "vitest";

import {
  buildStableSoftwarePlacementId,
  validateCuratedEcosystemCandidateRevision,
  validateCuratedToolsCandidateRevision,
} from "@/lib/curated-tools-candidate-audit";
import {
  fingerprintFirebaseSolutionRegistryRevision,
  validateFirebaseSolutionRegistryRevision,
  type FirebaseSolutionRegistryRevision,
} from "@/lib/firebase-solution-registry-contract";
import type {
  SolutionPlacement,
  SolutionResource,
} from "@/lib/solution-registry-contract";

type Mutable<T> = { -readonly [Key in keyof T]: T[Key] };

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
  count?: number;
  legacyFirstId?: string;
  statuses?: "draft" | "published";
}) {
  const status = input?.statuses ?? "published";
  const softwareResources = Array.from({ length: input?.count ?? 7 }, (_, index) => ({
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
  const softwarePlacements = softwareResources.map(({ resource }, index) => ({
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
  const levierResource = {
    resource: {
      resourceSlug: "levier",
      resourceType: "tool" as const,
      name: "Levier",
      description: "Ressource opérationnelle Demaa utilisée par le système métier.",
      interactionMode: "system_delivery" as const,
      commercialRelationship: "owned" as const,
      status: "published" as const,
      resourceVersion: "d091.v1",
      publicationBlockers: [],
      ...review("resource-levier"),
    },
  };
  const levierPlacement = {
    placement: {
      placementId: "test-system:levier:models:1",
      systemSlug: "test-system",
      resourceSlug: "levier",
      rank: 1,
      section: "models" as const,
      usage: "Utiliser Levier pour structurer le suivi opérationnel du système.",
      fitRationale: "Levier constitue la ressource opérationnelle canonique de ce système métier.",
      fitConstraints: ["Adapter le contenu à la situation réelle de l'entreprise."],
      editorialStatus: "selected" as const,
      commercialRelationship: "owned" as const,
      status: "published" as const,
      placementVersion: "d091.v1",
      publicationBlockers: [],
      ...review("placement-levier"),
    },
    presentation: {
      displayCategory: "Ressource",
    },
  };
  const resources = [...softwareResources, levierResource];
  const placements = [...softwarePlacements, levierPlacement];
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
  it("accepts a variable non-empty selection of published, evidenced and rank-stable tools", () => {
    const candidate = revision();
    expect(validateFirebaseSolutionRegistryRevision(candidate, {
      expectedSystemSlugs: ["test-system"],
      now: new Date(NOW),
    })).toEqual([]);
    expect(validateCuratedToolsCandidateRevision(candidate, {
      activeToolSlugs: new Set(candidate.resources.map(({ resource }) => resource.resourceSlug)),
      auditSystemSlugs: ["test-system"],
      expectedCatalogSystemSlugs: ["test-system"],
    })).toEqual([]);
  });

  it("fails closed for draft entries and hidden research candidates", () => {
    const candidate = revision({ statuses: "draft" });
    (candidate.placements[0]!.placement as Mutable<SolutionPlacement>)
      .editorialStatus = "hidden";
    const errors = validateCuratedToolsCandidateRevision(candidate, {
      auditSystemSlugs: ["test-system"],
      expectedCatalogSystemSlugs: ["test-system"],
    });

    expect(errors).toEqual(expect.arrayContaining([
      expect.stringContaining("non-empty final software selection"),
      expect.stringContaining("placement is not publication-ready"),
      expect.stringContaining("resource is not publication-ready"),
    ]));
  });

  it("accepts more than ten selected tools without treating the technical guard as a target", () => {
    const candidate = revision({ count: 12 });

    expect(validateFirebaseSolutionRegistryRevision(candidate, {
      expectedSystemSlugs: ["test-system"],
      now: new Date(NOW),
    })).toEqual([]);
    expect(validateCuratedToolsCandidateRevision(candidate, {
      auditSystemSlugs: ["test-system"],
      expectedCatalogSystemSlugs: ["test-system"],
    })).toEqual([]);
  });

  it("keeps a high technical payload guard without imposing an editorial quota", () => {
    const candidate = revision({ count: 51 });

    expect(validateFirebaseSolutionRegistryRevision(candidate, {
      expectedSystemSlugs: ["test-system"],
      now: new Date(NOW),
    })).toContain(
      "test-system:software must not exceed 50 placements",
    );
  });

  it("does not broaden the technical payload guard for non-tool sections", () => {
    const candidate = revision({ count: 11 });
    candidate.placements.slice(0, 11).forEach(({ placement }, index) => {
      (placement as Mutable<SolutionPlacement>).section = "providers";
      (placement as Mutable<SolutionPlacement>).placementId =
        `test-system:tool-${index + 1}:providers`;
      (candidate.resources[index]!.resource as Mutable<SolutionResource>).resourceType =
        "provider";
    });
    candidate.sourceFingerprint = fingerprintFirebaseSolutionRegistryRevision({
      ...candidate,
      sourceFingerprint: "0".repeat(64),
    });

    expect(validateFirebaseSolutionRegistryRevision(candidate, {
      expectedSystemSlugs: ["test-system"],
      now: new Date(NOW),
    })).toContain("test-system:providers must not exceed 10 placements");
  });

  it("preserves a retained legacy placement ID even when its rank changes", () => {
    const active = revision({ legacyFirstId: "test-system:tool-1:software:1" });
    const candidate = revision();
    candidate.placements[0]!.placement.placementId = "test-system:tool-1:software:2";

    expect(validateCuratedToolsCandidateRevision(candidate, {
      activeRevision: active,
      auditSystemSlugs: ["test-system"],
      expectedCatalogSystemSlugs: ["test-system"],
    })).toContain("test-system:tool-1:software: retained placement ID changed");
  });

  it("does not confuse a technical catalogue scope with the editorial audit scope", () => {
    const candidate = revision({ count: 4 });

    expect(validateCuratedToolsCandidateRevision(candidate, {
      auditSystemSlugs: ["test-system"],
      expectedCatalogSystemSlugs: ["test-system"],
    })).toEqual([]);
  });

  it("allows an empty provider or network section", () => {
    expect(validateCuratedEcosystemCandidateRevision(revision(), {
      auditSystemSlugs: ["test-system"],
    })).toEqual([]);
  });

  it("fails closed when a provider candidate is hidden or unpublished", () => {
    const candidate = revision({ count: 2 });
    const providerEntry = candidate.placements[0]!;
    const providerPlacement = providerEntry.placement as Mutable<SolutionPlacement>;
    const providerResource = candidate.resources[0]!.resource as Mutable<SolutionResource>;
    providerPlacement.section = "providers";
    providerPlacement.placementId = "test-system:tool-1:providers";
    providerPlacement.editorialStatus = "hidden";
    providerPlacement.status = "draft";
    providerPlacement.publicationBlockers = ["review-required"];
    providerResource.resourceType = "provider";
    providerResource.status = "draft";
    providerResource.publicationBlockers = ["review-required"];

    expect(validateCuratedEcosystemCandidateRevision(candidate, {
      auditSystemSlugs: ["test-system"],
    })).toEqual(expect.arrayContaining([
      "test-system:providers: final selection contains hidden entries",
      "test-system:tool-1:providers: placement is not publication-ready",
      "test-system:tool-1:providers: resource is not publication-ready",
    ]));
  });
});
