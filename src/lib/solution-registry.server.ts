import "server-only";

import { enterpriseCatalog } from "@/lib/enterprise-annuaire";
import { deepFreeze, parseSlug } from "@/lib/registry-contract-utils";
import {
  selectPublishedSolutionPlacements,
  selectPublishedSolutionResources,
  validateSolutionRegistries,
} from "@/lib/solution-registry-contract";
import type {
  PublishedSolutionPlacementDto,
  PublishedSolutionResourceDto,
} from "@/lib/solution-registry-dto";

const productSolutionResources: readonly unknown[] = deepFreeze([]);
const productSolutionPlacements: readonly unknown[] = deepFreeze([]);
const knownSystemSlugs = deepFreeze(enterpriseCatalog.map((system) => system.slug));

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
  return (["software", "providers"] as const).flatMap((section) => {
    const sectionPlacements = placements.filter((placement) => placement.section === section);
    return sectionPlacements.length > 0 ? [deepFreeze({ section, placements: sectionPlacements })] : [];
  });
}
