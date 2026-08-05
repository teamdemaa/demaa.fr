import "server-only";

import {
  PILOT_SOLUTION_DRAFT_PLACEMENTS,
  PILOT_SOLUTION_DRAFT_RESOURCES,
} from "@/lib/pilot-solution-registry-drafts.server";
import {
  getFamilySystemSolutionSelection,
  getFreshFamilyPricingSummary,
  resolveFamilySolutionCatalogSelection,
  type FamilySolutionSelection,
} from "@/lib/family-solution-selections.server";
import {
  getPublishedSolutionSectionsForSystem,
} from "@/lib/solution-registry.server";
import {
  SOLUTION_SECTIONS,
  validateSolutionPlacement,
  validateSolutionResource,
  type SolutionPlacement,
  type SolutionResource,
} from "@/lib/solution-registry-contract";
import {
  getSolutionResourcePresentation,
  resolveSolutionOfficialDestination,
} from "@/lib/solution-resource-presentation.server";
import type {
  PublishedSolutionPlacementDto,
  SolutionSection,
} from "@/lib/solution-registry-dto";
import type {
  RenderableSolutionPlacementDto,
  RenderableSolutionSectionDto,
} from "@/lib/system-solutions-ui-dto";

function getRenderableSection(
  section: SolutionSection,
  resourceType: PublishedSolutionPlacementDto["resource"]["resourceType"],
): SolutionSection {
  return resourceType === "directory" ? "networks" : section;
}

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
    section: getRenderableSection(placement.section, resource.resourceType),
    usage: placement.usage,
    fitRationale: placement.fitRationale,
    fitConstraints: [...placement.fitConstraints],
    resource: {
      resourceSlug: resource.resourceSlug,
      resourceType: resource.resourceType,
      name: resource.name,
      description: resource.description,
      displayCategory: resource.resourceType === "directory"
        ? "Organisation professionnelle"
        : resource.resourceType === "provider"
        ? "Fournisseur"
        : placement.section === "models"
        ? "Modèle"
        : resource.resourceType === "tool"
        ? "Outil"
        : "Logiciel",
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
  const officialDestination = resolveSolutionOfficialDestination(resource);
  if (!officialDestination) return null;
  const presentation = getSolutionResourcePresentation(resource);
  const interaction = { interactionMode: "external_link", href: officialDestination } as const;
  return {
    placementId: placement.placementId,
    systemSlug: placement.systemSlug,
    rank: placement.rank,
    section: getRenderableSection(placement.section, resource.resourceType),
    usage: placement.usage,
    fitRationale: placement.fitRationale,
    fitConstraints: [...placement.fitConstraints].slice(0, 2),
    resource: {
      resourceSlug: resource.resourceSlug,
      resourceType: resource.resourceType,
      name: resource.name,
      description: resource.description,
      displayCategory: presentation.displayCategory,
      ctaLabel: presentation.ctaLabel,
      indicativePricing: presentation.indicativePricing,
      interaction,
    },
  };
}

type PublishedSolutionSectionInput = Readonly<{
  section: SolutionSection;
  placements: readonly PublishedSolutionPlacementDto[];
}>;

function getFamilyCtaLabel(resourceType: FamilySolutionSelection["resourceType"]) {
  if (resourceType === "provider") return "Voir le fournisseur";
  if (resourceType === "directory") return "Découvrir l’organisation";
  return "Voir l’outil";
}

function toRenderableFamilyPlacement(
  systemSlug: string,
  selection: FamilySolutionSelection,
  now: Date,
): RenderableSolutionPlacementDto | null {
  if (selection.resourceSlug === "levier") return null;

  const resolved = resolveFamilySolutionCatalogSelection(selection);
  if (!resolved) return null;
  const section = getRenderableSection(selection.section, resolved.resourceType);
  return {
    placementId: `family:${systemSlug}:${selection.resourceSlug}:${section}:${selection.rank}`,
    systemSlug,
    rank: selection.rank,
    section,
    usage: selection.ownerBenefit,
    fitRationale: selection.fitRationale,
    fitConstraints: [...selection.checksBeforeChoosing].slice(0, 2),
    resource: {
      resourceSlug: resolved.resourceSlug,
      resourceType: resolved.resourceType,
      name: resolved.name,
      description: resolved.description,
      displayCategory: selection.displayCategory,
      ctaLabel: getFamilyCtaLabel(resolved.resourceType),
      indicativePricing: getFreshFamilyPricingSummary(selection, now),
      interaction: { interactionMode: "external_link", href: resolved.href },
    },
  };
}

function getRenderableFamilySolutionSections(systemSlug: string, now: Date) {
  const system = getFamilySystemSolutionSelection(systemSlug);
  if (!system) return [];
  const publishedSections = getPublishedRenderableSolutionSectionsForSystem(systemSlug);
  const familyPlacements = system.placements
    .filter((placement) => placement.resourceSlug !== "levier")
    .flatMap((placement) => {
      const rendered = toRenderableFamilyPlacement(systemSlug, placement, now);
      return rendered ? [rendered] : [];
    });
  const canonicalPlacements = publishedSections.flatMap(({ placements }) => placements);
  return SOLUTION_SECTIONS.flatMap((section) => {
    const placements = [...familyPlacements, ...canonicalPlacements]
      .filter((placement) => placement.section === section)
      .sort((left, right) => left.rank - right.rank);
    return placements.length > 0 ? [{ section, placements }] : [];
  });
}

export function filterRenderableSolutionSections(
  sections: readonly PublishedSolutionSectionInput[],
): readonly RenderableSolutionSectionDto[] {
  const renderedPlacements = sections.flatMap(({ placements }) =>
    placements.filter(hasSupportedInteraction).map(toRenderablePlacement),
  );
  return SOLUTION_SECTIONS.flatMap((section) => {
    const placements = renderedPlacements.filter((placement) => placement.section === section);
    return placements.length > 0 ? [{ section, placements }] : [];
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
  if (
    typeof systemSlug === "string" &&
    getFamilySystemSolutionSelection(systemSlug)
  ) {
    return getRenderableFamilySolutionSections(systemSlug, now);
  }
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

  return SOLUTION_SECTIONS.flatMap((section) => {
    const published = publishedSections.find((group) => group.section === section)?.placements ?? [];
    const selectedDrafts = draftPlacements.filter((placement) => placement.section === section);
    const placements = [...published, ...selectedDrafts].sort((left, right) => left.rank - right.rank);
    return placements.length > 0 ? [{ section, placements }] : [];
  });
}
