import visibility from "@/lib/public-solution-section-visibility.json";
import type { SolutionSection } from "@/lib/solution-registry-dto";
import type { RenderableSolutionSectionDto } from "@/lib/system-solutions-ui-dto";

export const PUBLIC_SOLUTION_SECTION_VISIBILITY: Readonly<
  Record<SolutionSection, boolean>
> = visibility;

export function isPublicSolutionSectionVisible(section: SolutionSection): boolean {
  return PUBLIC_SOLUTION_SECTION_VISIBILITY[section];
}

export function filterPublicSolutionSections<
  T extends Readonly<{ section: SolutionSection }>,
>(sections: readonly T[]): T[] {
  return sections.filter(({ section }) => isPublicSolutionSectionVisible(section));
}

/**
 * Public métier pages expose each selected solution family. Recruitment and
 * training are excluded until their editorial catalogue is ready.
 */
const HIDDEN_RECOMMENDATION_CATEGORY = /\b(?:formation|recrutement)\b/i;

export function filterPublicSystemRecommendationSections(
  sections: readonly RenderableSolutionSectionDto[],
): RenderableSolutionSectionDto[] {
  return filterPublicSolutionSections(sections)
    .map((group) => ({
      ...group,
      placements: group.placements.filter(
        ({ resource }) =>
          !HIDDEN_RECOMMENDATION_CATEGORY.test(resource.displayCategory ?? ""),
      ),
    }));
}
