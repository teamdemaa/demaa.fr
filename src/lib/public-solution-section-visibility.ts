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
 * Public system pages present third-party recommendations only. Canonical
 * Demaa Services keep travelling in the system payload for strict contextual
 * Action aids, but their public destination remains `/services`.
 */
const HIDDEN_RECOMMENDATION_CATEGORY = /\b(?:formation|recrutement)\b/i;

export function filterPublicSystemRecommendationSections(
  sections: readonly RenderableSolutionSectionDto[],
): RenderableSolutionSectionDto[] {
  return filterPublicSolutionSections(sections)
    .filter(({ section }) => section !== "services")
    .map((group) => ({
      ...group,
      placements: group.placements.filter(
        ({ resource }) =>
          !HIDDEN_RECOMMENDATION_CATEGORY.test(resource.displayCategory ?? ""),
      ),
    }));
}
