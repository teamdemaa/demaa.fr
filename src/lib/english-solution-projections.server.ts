import "server-only";

import type { InternationalContext } from "@/lib/international-context";
import type { RenderableSolutionSectionDto } from "@/lib/system-solutions-ui-dto";
import { projectToolSolutionSectionForContext } from "@/lib/tool-solution-internationalization.server";

/**
 * Keeps the current English Solutions boundary while delegating Tools to the
 * canonical-slug publication layer. Services arrive already localized by the
 * shared service resolver and are deliberately preserved unchanged here.
 */
export function projectEnglishSolutionSections(
  sections: readonly RenderableSolutionSectionDto[],
  context: Pick<InternationalContext, "localeCode" | "marketCode">,
): RenderableSolutionSectionDto[] {
  return sections.flatMap((section) => {
    if (section.section === "services") return [section];
    const projected = projectToolSolutionSectionForContext(
      section,
      context,
    );
    return projected ? [projected] : [];
  });
}
