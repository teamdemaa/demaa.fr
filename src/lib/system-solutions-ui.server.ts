import "server-only";

import {
  PILOT_SOLUTION_DRAFT_PLACEMENTS,
  PILOT_SOLUTION_DRAFT_RESOURCES,
} from "@/lib/pilot-solution-registry-drafts.server";
import { getPublishedSolutionSectionsForSystem } from "@/lib/solution-registry.server";
import {
  validateSolutionPlacement,
  validateSolutionResource,
  type SolutionPlacement,
  type SolutionResource,
} from "@/lib/solution-registry-contract";
import type {
  PublishedSolutionPlacementDto,
  SolutionSection,
} from "@/lib/solution-registry-dto";
import type {
  RenderableSolutionPlacementDto,
  RenderableSolutionSectionDto,
} from "@/lib/system-solutions-ui-dto";

function hasSupportedInteraction(
  placement: PublishedSolutionPlacementDto,
) {
  return (
    placement.resource.interaction.interactionMode === "external_link" ||
    placement.resource.interaction.interactionMode === "detail" ||
    placement.resource.interaction.interactionMode === "system_delivery"
  );
}

function toRenderablePlacement(
  placement: PublishedSolutionPlacementDto,
): RenderableSolutionPlacementDto {
  const { resource } = placement;
  const { interaction } = resource;
  if (interaction.interactionMode === "referral_form") {
    throw new TypeError("Unsupported published Solution interaction");
  }
  return {
    placementId: placement.placementId,
    systemSlug: placement.systemSlug,
    rank: placement.rank,
    section: placement.section,
    usage: placement.usage,
    fitRationale: placement.fitRationale,
    fitConstraints: [...placement.fitConstraints],
    resource: {
      resourceSlug: resource.resourceSlug,
      resourceType: resource.resourceType,
      name: resource.name,
      description: resource.description,
      interaction,
    },
  };
}

function hasSupportedDraftInteraction(resource: SolutionResource) {
  return (
    resource.interactionMode === "external_link" ||
    resource.interactionMode === "detail" ||
    resource.interactionMode === "system_delivery"
  );
}

function isEditoriallySelectedDraftResource(
  resource: SolutionResource,
  now: Date,
) {
  return (
    resource.status === "draft" &&
    resource.commercialRelationship === "unknown" &&
    resource.publicationBlockers.length === 1 &&
    resource.publicationBlockers[0] === "commercial-relationship-unconfirmed" &&
    validateSolutionResource(resource, now).length === 0 &&
    hasSupportedDraftInteraction(resource)
  );
}

function isEditoriallySelectedDraftPlacement(
  placement: SolutionPlacement,
  now: Date,
) {
  return (
    placement.status === "draft" &&
    placement.commercialRelationship === "unknown" &&
    placement.publicationBlockers.length === 1 &&
    placement.publicationBlockers[0] === "commercial-relationship-unconfirmed" &&
    validateSolutionPlacement(placement, now).length === 0
  );
}

function toRenderableDraftPlacement(
  placement: SolutionPlacement,
  resource: SolutionResource,
): RenderableSolutionPlacementDto | null {
  if (!hasSupportedDraftInteraction(resource)) return null;
  const interaction = resource.interactionMode === "system_delivery"
    ? { interactionMode: resource.interactionMode } as const
    : { interactionMode: resource.interactionMode, href: resource.href } as const;
  return {
    placementId: placement.placementId,
    systemSlug: placement.systemSlug,
    rank: placement.rank,
    section: placement.section,
    usage: placement.usage,
    fitRationale: placement.fitRationale,
    fitConstraints: [...placement.fitConstraints],
    resource: {
      resourceSlug: resource.resourceSlug,
      resourceType: resource.resourceType,
      name: resource.name,
      description: resource.description,
      interaction,
    },
  };
}

type PublishedSolutionSectionInput = Readonly<{
  section: SolutionSection;
  placements: readonly PublishedSolutionPlacementDto[];
}>;

export function filterRenderableSolutionSections(
  sections: readonly PublishedSolutionSectionInput[],
): readonly RenderableSolutionSectionDto[] {
  return sections.flatMap((section) => {
    const placements = section.placements
      .filter(hasSupportedInteraction)
      .map(toRenderablePlacement);
    return placements.length > 0 ? [{ section: section.section, placements }] : [];
  });
}

export function getPublishedRenderableSolutionSectionsForSystem(systemSlug: unknown) {
  return filterRenderableSolutionSections(
    getPublishedSolutionSectionsForSystem(systemSlug),
  );
}

export function getRenderableSolutionSectionsForSystem(
  systemSlug: unknown,
  now = new Date(),
) {
  const publishedSections = getPublishedRenderableSolutionSectionsForSystem(systemSlug);
  if (typeof systemSlug !== "string") return publishedSections;

  const draftResources = new Map(
    PILOT_SOLUTION_DRAFT_RESOURCES
      .filter((resource) => isEditoriallySelectedDraftResource(resource, now))
      .map((resource) => [resource.resourceSlug, resource]),
  );
  const draftPlacements = PILOT_SOLUTION_DRAFT_PLACEMENTS.flatMap((placement) => {
    if (
      placement.systemSlug !== systemSlug ||
      !isEditoriallySelectedDraftPlacement(placement, now)
    ) return [];
    const resource = draftResources.get(placement.resourceSlug);
    if (!resource || resource.commercialRelationship !== placement.commercialRelationship) {
      return [];
    }
    const rendered = toRenderableDraftPlacement(placement, resource);
    return rendered ? [rendered] : [];
  });

  return (["software", "providers"] as const).flatMap((section) => {
    const published = publishedSections.find((group) => group.section === section)?.placements ?? [];
    const selectedDrafts = draftPlacements.filter((placement) => placement.section === section);
    const placements = [...published, ...selectedDrafts].sort((left, right) => left.rank - right.rank);
    return placements.length > 0 ? [{ section, placements }] : [];
  });
}
