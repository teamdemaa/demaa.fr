import "server-only";

import { enterpriseCatalog } from "@/lib/enterprise-annuaire";
import {
  LEVIER_PLACEMENT_SYSTEM_SLUGS,
  LEVIER_SOLUTION_PLACEMENTS,
  LEVIER_SOLUTION_RESOURCE,
} from "@/lib/levier-solution-registry.server";
import {
  PILOT_SOLUTION_DRAFT_PLACEMENTS,
  PILOT_SOLUTION_DRAFT_RESOURCES,
} from "@/lib/pilot-solution-registry-drafts.server";
import { deepFreeze, parseSlug } from "@/lib/registry-contract-utils";
import {
  SOLUTION_SECTIONS,
  selectPublishedSolutionPlacements,
  selectPublishedSolutionResources,
  validateSolutionRegistries,
} from "@/lib/solution-registry-contract";
import type {
  PublishedSolutionPlacementDto,
  PublishedSolutionResourceDto,
} from "@/lib/solution-registry-dto";

const productSolutionResources: readonly unknown[] = deepFreeze([
  LEVIER_SOLUTION_RESOURCE,
  ...PILOT_SOLUTION_DRAFT_RESOURCES,
]);
const productSolutionPlacements: readonly unknown[] = deepFreeze([
  ...LEVIER_SOLUTION_PLACEMENTS,
  ...PILOT_SOLUTION_DRAFT_PLACEMENTS,
]);
const knownSystemSlugs = deepFreeze(enterpriseCatalog.map((system) => system.slug));

if (
  LEVIER_PLACEMENT_SYSTEM_SLUGS.length !== knownSystemSlugs.length ||
  LEVIER_PLACEMENT_SYSTEM_SLUGS.some(
    (systemSlug, index) => systemSlug !== knownSystemSlugs[index],
  )
) {
  throw new Error("Levier placements must explicitly match all published systems.");
}

const registryErrors = validateSolutionRegistries({
  knownSystemSlugs,
  resources: productSolutionResources,
  placements: productSolutionPlacements,
});
if (registryErrors.length > 0) throw new Error(`Invalid Solutions registries:\n${registryErrors.join("\n")}`);

export function getPublishedSolutionResources(now = new Date()): readonly PublishedSolutionResourceDto[] {
  return selectPublishedSolutionResources({ resources: productSolutionResources }, now);
}

export function getPublishedSolutionResourceBySlug(slug: unknown, now = new Date()): PublishedSolutionResourceDto | null {
  let parsedSlug: string;
  try {
    parsedSlug = parseSlug(slug, "solutionResourceSlug");
  } catch {
    return null;
  }
  return getPublishedSolutionResources(now).find((resource) => resource.resourceSlug === parsedSlug) ?? null;
}

export function getPublishedSolutionPlacementsForSystem(
  systemSlug: unknown,
  now = new Date(),
): readonly PublishedSolutionPlacementDto[] {
  return selectPublishedSolutionPlacements({
    systemSlug,
    knownSystemSlugs,
    resources: productSolutionResources,
    placements: productSolutionPlacements,
  }, now);
}

export function getPublishedSolutionSectionsForSystem(systemSlug: unknown, now = new Date()) {
  const placements = getPublishedSolutionPlacementsForSystem(systemSlug, now);
  return SOLUTION_SECTIONS.flatMap((section) => {
    const sectionPlacements = placements.filter((placement) => placement.section === section);
    return sectionPlacements.length > 0 ? [deepFreeze({ section, placements: sectionPlacements })] : [];
  });
}
