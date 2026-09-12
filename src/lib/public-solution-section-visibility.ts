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
 * Public métier pages now focus on tools and software. The other sections stay
 * in the registry and in private action-plan payloads so they can be repackaged
 * later without losing the curated data.
 */
const HIDDEN_RECOMMENDATION_CATEGORY = /\b(?:formation|recrutement)\b/i;

export function filterPublicSystemRecommendationSections(
  sections: readonly RenderableSolutionSectionDto[],
): RenderableSolutionSectionDto[] {
  return filterPublicSolutionSections(sections)
    .filter(({ section }) => section === "software")
    .map((group) => ({
      ...group,
      placements: group.placements.filter(
        ({ resource }) =>
          !HIDDEN_RECOMMENDATION_CATEGORY.test(resource.displayCategory ?? ""),
      ),
    }));
}
