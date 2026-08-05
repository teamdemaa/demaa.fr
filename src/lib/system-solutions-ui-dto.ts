import type {
  SolutionInteractionDto,
  SolutionResourceType,
  SolutionSection,
} from "@/lib/solution-registry-dto";

export type SupportedSolutionInteractionDto = SolutionInteractionDto;

export type RenderableSolutionResourceDto = Readonly<{
  resourceSlug: string;
  resourceType: SolutionResourceType;
  name: string;
  description: string;
  displayCategory?: string;
  ctaLabel?: string;
  indicativePricing?: string;
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
