import "server-only";

import {
  getExpertiseCatalog,
  getSelectedExpertisePlacementsForSystem,
} from "@/lib/provider-network.server";
import type {
  PublishedSolutionPlacementDto,
  PublishedSolutionResourceDto,
} from "@/lib/solution-registry-dto";
import type {
  RenderableSolutionPlacementDto,
  RenderableSolutionSectionDto,
} from "@/lib/system-solutions-ui-dto";

async function getExpertiseContext(systemSlug: string, expertiseId?: string) {
  const [catalog, placements] = await Promise.all([
    getExpertiseCatalog(),
    getSelectedExpertisePlacementsForSystem(systemSlug),
  ]);
  const selected = expertiseId
    ? placements.filter((placement) => placement.expertiseId === expertiseId)
    : placements;
  return {
    byId: new Map(catalog.map((entry) => [entry.expertiseId, entry])),
    placements: selected,
  };
}

export async function getRenderableExpertiseSectionForSystem(
  systemSlug: string,
): Promise<RenderableSolutionSectionDto | null> {
  const { byId, placements } = await getExpertiseContext(systemSlug);
  const rendered: RenderableSolutionPlacementDto[] = placements.flatMap(
    (placement) => {
      const expertise = byId.get(placement.expertiseId);
      if (!expertise || expertise.visibility !== "public") return [];
      return [{
        placementId: placement.expertisePlacementId,
        systemSlug: placement.systemSlug,
        rank: placement.rank,
        section: "services" as const,
        usage: placement.usage,
        fitRationale: placement.fitRationale,
        fitConstraints: [...placement.fitConstraints],
        resource: {
          resourceSlug: expertise.expertiseId,
          resourceType: "expertise" as const,
          name: placement.nameOverride ?? expertise.label,
          description: placement.descriptionOverride ?? expertise.description,
          displayCategory: placement.displayCategory,
          interaction: {
            interactionMode: "referral_form" as const,
            referralKey: expertise.expertiseId,
          },
        },
      }];
    },
  );
  return rendered.length > 0
    ? { section: "services", placements: rendered }
    : null;
}

export async function getExpertiseReferralContext(
  systemSlug: string,
  expertiseId: string,
): Promise<Readonly<{
  placement: PublishedSolutionPlacementDto;
  resource: PublishedSolutionResourceDto;
}> | null> {
  const { byId, placements } = await getExpertiseContext(systemSlug, expertiseId);
  const selected = placements[0];
  const expertise = selected ? byId.get(selected.expertiseId) : null;
  if (!selected || !expertise || expertise.visibility !== "public") return null;

  const resource: PublishedSolutionResourceDto = {
    resourceSlug: expertise.expertiseId,
    resourceType: "expertise",
    name: selected.nameOverride ?? expertise.label,
    description: selected.descriptionOverride ?? expertise.description,
    interaction: {
      interactionMode: "referral_form",
      referralKey: expertise.expertiseId,
    },
    commercialRelationship: "none",
    resourceVersion: "expertise-catalog.v1",
  };
  const placement: PublishedSolutionPlacementDto = {
    placementId: selected.expertisePlacementId,
    systemSlug: selected.systemSlug,
    rank: selected.rank,
    section: "services",
    usage: selected.usage,
    fitRationale: selected.fitRationale,
    fitConstraints: selected.fitConstraints,
    placementVersion: selected.placementVersion,
    resource,
  };
  return { placement, resource };
}
