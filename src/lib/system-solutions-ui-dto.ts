import type {
  SolutionInteractionDto,
  SolutionResourceType,
  SolutionSection,
} from "@/lib/solution-registry-dto";
import type { CanonicalService } from "@/lib/canonical-service-contract";

export type SupportedSolutionInteractionDto = SolutionInteractionDto;

export type RenderableSolutionResourceDto = Readonly<{
  resourceSlug: string;
  resourceType: SolutionResourceType;
  name: string;
  description: string;
  displayCategory?: string;
  ctaLabel?: string;
  indicativePricing?: string;
  serviceDetails?: CanonicalService;
  interaction: SupportedSolutionInteractionDto;
}>;

export type RenderableSolutionPlacementDto = Readonly<{
  placementId: string;
  systemSlug: string;
  rank: number;
  section: SolutionSection;
  usage: string;
  fitRationale: string;
  fitConstraints: readonly string[];
  resource: RenderableSolutionResourceDto;
}>;

export type RenderableSolutionSectionDto = Readonly<{
  section: SolutionSection;
  placements: readonly RenderableSolutionPlacementDto[];
}>;

export function mergeRenderableSolutionSections(
  sections: readonly RenderableSolutionSectionDto[],
): RenderableSolutionSectionDto[] {
  const bySection = new Map<
    RenderableSolutionSectionDto["section"],
    RenderableSolutionSectionDto["placements"][number][]
  >();

  for (const group of sections) {
    const placements = bySection.get(group.section) ?? [];
    placements.push(...group.placements);
    bySection.set(group.section, placements);
  }

  return [...bySection.entries()].map(([section, placements]) => ({
    section,
    placements: placements.toSorted((left, right) => left.rank - right.rank),
  }));
}
