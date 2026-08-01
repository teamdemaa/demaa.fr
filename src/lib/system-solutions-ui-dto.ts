import type {
  PublishedSolutionPlacementDto,
  PublishedSolutionResourceDto,
  SolutionInteractionDto,
  SolutionSection,
} from "@/lib/solution-registry-dto";

export type SupportedSolutionInteractionDto = Exclude<
  SolutionInteractionDto,
  Readonly<{ interactionMode: "referral_form"; referralKey: string }>
>;

export type RenderableSolutionResourceDto = Omit<
  PublishedSolutionResourceDto,
  "interaction"
> & Readonly<{
  interaction: SupportedSolutionInteractionDto;
}>;

export type RenderableSolutionPlacementDto = Omit<
  PublishedSolutionPlacementDto,
  "resource"
> & Readonly<{
  resource: RenderableSolutionResourceDto;
}>;

export type RenderableSolutionSectionDto = Readonly<{
  section: SolutionSection;
  placements: readonly RenderableSolutionPlacementDto[];
}>;
