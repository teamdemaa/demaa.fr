import "server-only";

import { getPublishedSolutionSectionsForSystem } from "@/lib/solution-registry.server";
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
): placement is RenderableSolutionPlacementDto {
  return (
    placement.resource.interaction.interactionMode === "external_link" ||
    placement.resource.interaction.interactionMode === "detail"
  );
}

type PublishedSolutionSectionInput = Readonly<{
  section: SolutionSection;
  placements: readonly PublishedSolutionPlacementDto[];
}>;

export function filterRenderableSolutionSections(
  sections: readonly PublishedSolutionSectionInput[],
): readonly RenderableSolutionSectionDto[] {
  return sections.flatMap((section) => {
    const placements = section.placements.filter(hasSupportedInteraction);
    return placements.length > 0 ? [{ section: section.section, placements }] : [];
  });
}

export function getRenderableSolutionSectionsForSystem(systemSlug: unknown) {
  return filterRenderableSolutionSections(
    getPublishedSolutionSectionsForSystem(systemSlug),
  );
}
