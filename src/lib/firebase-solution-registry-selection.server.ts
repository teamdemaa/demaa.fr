import "server-only";

import {
  getActiveFirebaseSolutionRegistryRevision,
} from "@/lib/firebase-solution-registry.server";
import { SOLUTION_SECTIONS } from "@/lib/solution-registry-contract";
import type { FirebaseSolutionRegistryRevision } from "@/lib/firebase-solution-registry-contract";
import type {
  RenderableSolutionPlacementDto,
  RenderableSolutionSectionDto,
} from "@/lib/system-solutions-ui-dto";
import {
  getPublishedRenderableSolutionSectionsForSystem,
  getRenderableSolutionSectionsForSystem,
} from "@/lib/system-solutions-ui.server";

function isFreshPricing(
  presentation: FirebaseSolutionRegistryRevision["placements"][number]["presentation"],
  now: Date,
) {
  if (!presentation.indicativePricing) return false;
  const capturedAt = Date.parse(presentation.pricingCapturedAt ?? "");
  const expiresAt = Date.parse(presentation.pricingExpiresAt ?? "");
  return Number.isFinite(capturedAt) &&
    Number.isFinite(expiresAt) &&
    capturedAt <= now.getTime() &&
    capturedAt < expiresAt &&
    expiresAt > now.getTime();
}

export function selectRenderableSolutionSectionsFromRevision(
  revision: FirebaseSolutionRegistryRevision,
  systemSlug: unknown,
  options: { now?: Date; publishedOnly?: boolean } = {},
): readonly RenderableSolutionSectionDto[] {
  if (typeof systemSlug !== "string" || !revision.knownSystemSlugs.includes(systemSlug)) {
    return [];
  }
  const now = options.now ?? new Date();
  const resources = new Map(
    revision.resources.map(({ resource }) => [resource.resourceSlug, resource]),
  );
  const placements = revision.placements.flatMap((entry) => {
    const { placement, presentation } = entry;
    if (
      placement.systemSlug !== systemSlug ||
      placement.editorialStatus !== "selected" ||
      (options.publishedOnly && placement.status !== "published")
    ) return [];
    const resource = resources.get(placement.resourceSlug);
    if (
      !resource ||
      resource.commercialRelationship !== placement.commercialRelationship ||
      (options.publishedOnly && resource.status !== "published")
    ) return [];
    if (
      resource.interactionMode === "referral_form" ||
      !["external_link", "detail", "system_delivery"].includes(resource.interactionMode)
    ) return [];
    const interaction = resource.interactionMode === "system_delivery"
      ? { interactionMode: "system_delivery" as const }
      : {
          interactionMode: resource.interactionMode,
          href: presentation.hrefOverride ?? resource.href,
        };
    const renderable: RenderableSolutionPlacementDto = {
      placementId: placement.placementId,
      systemSlug: placement.systemSlug,
      rank: placement.rank,
      section: placement.section,
      usage: placement.usage,
      fitRationale: placement.fitRationale,
      fitConstraints: [...placement.fitConstraints].slice(0, 2),
      resource: {
        resourceSlug: resource.resourceSlug,
        resourceType: resource.resourceType,
        name: presentation.nameOverride ?? resource.name,
        description: presentation.descriptionOverride ?? resource.description,
        displayCategory: presentation.displayCategory,
        ctaLabel: presentation.ctaLabel,
        ...(isFreshPricing(presentation, now)
          ? { indicativePricing: presentation.indicativePricing }
          : {}),
        interaction,
      },
    };
    return [renderable];
  });
  return SOLUTION_SECTIONS.flatMap((section) => {
    const sectionPlacements = placements
      .filter((placement) => placement.section === section)
      .sort((left, right) => left.rank - right.rank);
    return sectionPlacements.length > 0
      ? [{ section, placements: sectionPlacements }]
      : [];
  });
}

export async function getActiveRenderableSolutionSectionsForSystem(
  systemSlug: unknown,
  now = new Date(),
) {
  const revision = await getActiveFirebaseSolutionRegistryRevision();
  return selectRenderableSolutionSectionsFromRevision(revision, systemSlug, { now });
}

export async function getActivePublishedRenderableSolutionSectionsForSystem(
  systemSlug: unknown,
  now = new Date(),
) {
  const revision = await getActiveFirebaseSolutionRegistryRevision();
  return selectRenderableSolutionSectionsFromRevision(revision, systemSlug, {
    now,
    publishedOnly: true,
  });
}

export async function getMigrationSafeRenderableSolutionSectionsForSystem(
  systemSlug: unknown,
  now = new Date(),
) {
  const revision = await getActiveFirebaseSolutionRegistryRevision();
  if (revision.revisionStatus !== "published") {
    return getRenderableSolutionSectionsForSystem(systemSlug, now);
  }
  return selectRenderableSolutionSectionsFromRevision(revision, systemSlug, { now });
}

export async function getMigrationSafePublishedSolutionSectionsForSystem(
  systemSlug: unknown,
  now = new Date(),
) {
  const revision = await getActiveFirebaseSolutionRegistryRevision();
  if (revision.revisionStatus !== "published") {
    return getPublishedRenderableSolutionSectionsForSystem(systemSlug);
  }
  return selectRenderableSolutionSectionsFromRevision(revision, systemSlug, {
    now,
    publishedOnly: true,
  });
}
