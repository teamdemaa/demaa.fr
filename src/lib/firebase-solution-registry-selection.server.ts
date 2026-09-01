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
import type { SolutionSection } from "@/lib/solution-registry-dto";

// Emergency editorial circuit breaker for destinations that are present in an
// older remote registry revision but are no longer safe to expose publicly.
// Keep this list narrow and remove an entry after a reviewed replacement URL
// has been published in the registry.
const BLOCKED_EXTERNAL_RESOURCE_SLUGS = new Set(["kiute-pro"]);

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
  options: {
    now?: Date;
    publishedOnly?: boolean;
    publishedOnlySections?: readonly SolutionSection[];
  } = {},
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
    const requiresPublished = options.publishedOnly ||
      options.publishedOnlySections?.includes(placement.section);
    if (
      placement.systemSlug !== systemSlug ||
      placement.editorialStatus !== "selected" ||
      (requiresPublished && placement.status !== "published")
    ) return [];
    const resource = resources.get(placement.resourceSlug);
    if (
      !resource ||
      BLOCKED_EXTERNAL_RESOURCE_SLUGS.has(resource.resourceSlug) ||
      resource.commercialRelationship !== placement.commercialRelationship ||
      (requiresPublished && resource.status !== "published")
    ) return [];
    if (![
      "external_link",
      "detail",
      "system_delivery",
      "referral_form",
    ].includes(resource.interactionMode)) return [];
    const interaction = resource.interactionMode === "system_delivery"
      ? { interactionMode: "system_delivery" as const }
      : resource.interactionMode === "referral_form"
      ? {
          interactionMode: "referral_form" as const,
          referralKey: resource.referralKey,
        }
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

export async function getActivePublicRenderableSolutionSectionsForSystem(
  systemSlug: unknown,
  now = new Date(),
) {
  const revision = await getActiveFirebaseSolutionRegistryRevision();
  // The public UI may surface editorially selected placements through the
  // sanitized DTO. SEO and JSON-LD keep using the published-only selector.
  return selectRenderableSolutionSectionsFromRevision(revision, systemSlug, { now });
}
