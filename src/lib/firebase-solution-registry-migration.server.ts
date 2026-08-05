import "server-only";

import { enterpriseCatalog } from "@/lib/enterprise-annuaire";
import {
  fingerprintFirebaseSolutionRegistryRevision,
  validateFirebaseSolutionRegistryRevision,
  type FirebaseSolutionPlacementEntry,
  type FirebaseSolutionRegistryRevision,
  type FirebaseSolutionResourceEntry,
} from "@/lib/firebase-solution-registry-contract";
import {
  getFamilySystemSolutionSelection,
  getFreshFamilyPricingSummary,
} from "@/lib/family-solution-selections.server";
import { getRenderableSolutionSectionsForSystem } from "@/lib/system-solutions-ui.server";
import type { RenderableSolutionPlacementDto } from "@/lib/system-solutions-ui-dto";

const MIGRATION_TIMESTAMP = "2026-08-05T12:00:00.000Z";
const MIGRATION_EXPIRY = "2027-02-05T12:00:00.000Z";
const MIGRATION_REVISION_ID = "solutions-2026-08-05-v1";
const EMPTY_FINGERPRINT = "0".repeat(64);

function migratedReview(
  placement: RenderableSolutionPlacementDto,
  scope: "resource" | "placement",
) {
  const interaction = placement.resource.interaction;
  const sourceRef = interaction.interactionMode === "system_delivery"
    ? "decision://systems/levier-2026-08-03"
    : interaction.href;
  return {
    evidence: [{
      evidenceId: `firebase-migration-${scope}-${placement.systemSlug}-${placement.resource.resourceSlug}`,
      sourceRef,
      claim: scope === "resource"
        ? `${placement.resource.name} est une ressource actuellement affichée dans les Solutions Demaa.`
        : placement.fitRationale,
      evidenceType: interaction.interactionMode === "system_delivery"
        ? "internal_test" as const
        : "legacy_catalog_reference" as const,
      capturedAt: MIGRATION_TIMESTAMP,
    }],
    reviewer: "Master Demaa",
    reviewedAt: MIGRATION_TIMESTAMP,
    expiresAt: MIGRATION_EXPIRY,
  };
}

function isLevier(placement: RenderableSolutionPlacementDto) {
  return placement.resource.resourceSlug === "levier";
}

function resourceFromPlacement(
  placement: RenderableSolutionPlacementDto,
): FirebaseSolutionResourceEntry {
  const { interaction } = placement.resource;
  const ownedResource = isLevier(placement);
  return {
    resource: {
      ...migratedReview(placement, "resource"),
      resourceSlug: placement.resource.resourceSlug,
      resourceType: placement.resource.resourceType,
      name: placement.resource.name,
      description: placement.resource.description,
      ...interaction,
      commercialRelationship: ownedResource ? "owned" : "unknown",
      status: ownedResource ? "published" : "draft",
      resourceVersion: "firebase.v1",
      publicationBlockers: ownedResource
        ? []
        : ["commercial-relationship-unconfirmed"],
    },
  };
}

function pricingPresentation(
  placement: RenderableSolutionPlacementDto,
  now: Date,
) {
  if (!placement.resource.indicativePricing) return {};
  const familyPlacement = getFamilySystemSolutionSelection(placement.systemSlug)
    ?.placements.find(({ resourceSlug }) => resourceSlug === placement.resource.resourceSlug);
  if (
    !familyPlacement ||
    getFreshFamilyPricingSummary(familyPlacement, now) !== placement.resource.indicativePricing ||
    !familyPlacement.pricingCapturedAt ||
    !familyPlacement.pricingExpiresAt
  ) return {};
  const pricingSource = familyPlacement.evidenceUrls[0]
    ?? familyPlacement.catalogDestination;
  if (!pricingSource) return {};
  return {
    indicativePricing: placement.resource.indicativePricing,
    pricingCapturedAt: familyPlacement.pricingCapturedAt,
    pricingExpiresAt: familyPlacement.pricingExpiresAt,
    pricingSource,
  };
}

function placementEntry(
  placement: RenderableSolutionPlacementDto,
  now: Date,
): FirebaseSolutionPlacementEntry {
  const ownedPlacement = isLevier(placement);
  return {
    placement: {
      ...migratedReview(placement, "placement"),
      placementId: `${placement.systemSlug}:${placement.resource.resourceSlug}:${placement.section}:${placement.rank}`,
      systemSlug: placement.systemSlug,
      resourceSlug: placement.resource.resourceSlug,
      rank: placement.rank,
      section: placement.section,
      usage: placement.usage,
      fitRationale: placement.fitRationale,
      fitConstraints: placement.fitConstraints,
      editorialStatus: "selected",
      commercialRelationship: ownedPlacement ? "owned" : "unknown",
      status: ownedPlacement ? "published" : "draft",
      placementVersion: "firebase.v1",
      publicationBlockers: ownedPlacement
        ? []
        : ["commercial-relationship-unconfirmed"],
    },
    presentation: {
      displayCategory: placement.resource.displayCategory ?? "Solution",
      nameOverride: placement.resource.name,
      ...(placement.resource.interaction.interactionMode === "system_delivery"
        ? {}
        : { hrefOverride: placement.resource.interaction.href }),
      ...(placement.resource.ctaLabel
        ? { ctaLabel: placement.resource.ctaLabel }
        : placement.resource.interaction.interactionMode === "system_delivery"
        ? {}
        : { ctaLabel: "Voir la solution" }),
      descriptionOverride: placement.resource.description,
      ...pricingPresentation(placement, now),
    },
  };
}

export function buildFirebaseSolutionRegistryMigrationRevision(
  now = new Date(MIGRATION_TIMESTAMP),
): FirebaseSolutionRegistryRevision {
  const knownSystemSlugs = enterpriseCatalog.map(({ slug }) => slug);
  const renderedPlacements = knownSystemSlugs.flatMap((systemSlug) =>
    getRenderableSolutionSectionsForSystem(systemSlug, now)
      .flatMap(({ placements }) =>
        placements
          .toSorted((left, right) => left.rank - right.rank)
          .map((placement, index) => ({ ...placement, rank: index + 1 })),
      ),
  );
  const placements = renderedPlacements.map((placement) =>
    placementEntry(placement, now),
  );
  const resourcesBySlug = new Map<string, FirebaseSolutionResourceEntry>();
  for (const placement of renderedPlacements) {
    if (!resourcesBySlug.has(placement.resource.resourceSlug)) {
      resourcesBySlug.set(
        placement.resource.resourceSlug,
        resourceFromPlacement(placement),
      );
    }
  }
  const baseRevision: FirebaseSolutionRegistryRevision = {
    schemaVersion: 1,
    revisionId: MIGRATION_REVISION_ID,
    revisionStatus: "draft",
    createdAt: MIGRATION_TIMESTAMP,
    createdBy: "migration://local-solutions-sources",
    sourceFingerprint: EMPTY_FINGERPRINT,
    knownSystemSlugs,
    resources: [...resourcesBySlug.values()].sort((left, right) =>
      left.resource.resourceSlug.localeCompare(right.resource.resourceSlug),
    ),
    placements,
  };
  const revision = {
    ...baseRevision,
    sourceFingerprint: fingerprintFirebaseSolutionRegistryRevision(baseRevision),
  };
  const errors = validateFirebaseSolutionRegistryRevision(revision, {
    expectedSystemSlugs: knownSystemSlugs,
    now,
  });
  if (errors.length > 0) {
    throw new Error(`Invalid Firebase Solutions migration revision:\n${errors.join("\n")}`);
  }
  return revision;
}
