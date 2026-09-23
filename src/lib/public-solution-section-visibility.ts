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

// Staging-only category layout for the DEMAA Solutions migration. Callers must
// first use the published-only registry selector; visibility alone is not an
// editorial approval. Services belong to the separate Specialists journey,
// and models are taught in Academy rather than listed as standalone offers.
const PREVIEW_SOLUTION_SECTIONS = new Set<SolutionSection>([
  "software",
  "providers",
  "financing",
  "aids",
  "networks",
]);

export function filterSolutionsPreviewSections(
  sections: readonly RenderableSolutionSectionDto[],
): RenderableSolutionSectionDto[] {
  return sections
    .filter(({ section }) => PREVIEW_SOLUTION_SECTIONS.has(section))
    .map((group) => ({
      ...group,
      placements: group.section === "software"
        ? group.placements.filter(({ resource }) =>
            !HIDDEN_RECOMMENDATION_CATEGORY.test(resource.displayCategory ?? "")
          )
        : group.placements,
    }))
    .filter(({ placements }) => placements.length > 0);
}
