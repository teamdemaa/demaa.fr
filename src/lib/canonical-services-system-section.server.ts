import "server-only";

import { getCanonicalServices } from "@/lib/canonical-service-catalog";
import type { SolutionSection } from "@/lib/solution-registry-dto";
import type {
  RenderableSolutionPlacementDto,
  RenderableSolutionSectionDto,
} from "@/lib/system-solutions-ui-dto";

const SECTION_ORDER: readonly SolutionSection[] = [
  "software",
  "services",
  "providers",
  "models",
  "networks",
];

function buildCanonicalServicePlacements(
  systemSlug: string,
): readonly RenderableSolutionPlacementDto[] {
  const services = getCanonicalServices().filter(
    (service) =>
      !(systemSlug === "cabinet-comptable" && service.slug === "expert-comptable"),
  );

  return services.map((service, index) => ({
    placementId: `render:${systemSlug}:service:${service.slug}`,
    systemSlug,
    rank: index + 1,
    section: "services",
    usage: service.result,
    fitRationale: service.summary,
    fitConstraints: service.conditions.slice(0, 2),
    resource: {
      resourceSlug: service.slug,
      resourceType: "provider",
      name: service.name,
      description: service.summary,
      displayCategory: service.eyebrow,
      ctaLabel: "Voir le service",
      indicativePricing: service.pricing.label,
      interaction: {
        interactionMode: "detail",
        href: `/services/${service.slug}?systemSlug=${encodeURIComponent(systemSlug)}&source=solutions-systeme`,
      },
    },
  }));
}
/**
 * Composes universal Demaa services at render time only. Existing registry
 * placements in `services` are deliberately replaced so no Firebase write or
 * legacy expert-comptable referral can create a duplicate card.
 */
export function composeCanonicalServicesForSystem(
  systemSlug: string,
  visibleSections: readonly RenderableSolutionSectionDto[],
): readonly RenderableSolutionSectionDto[] {
  const placementsBySection = new Map<
    SolutionSection,
    RenderableSolutionPlacementDto[]
  >();

  for (const group of visibleSections) {
    if (group.section === "services") continue;
    const placements = placementsBySection.get(group.section) ?? [];
    placements.push(...group.placements);
    placementsBySection.set(group.section, placements);
  }
  placementsBySection.set(
    "services",
    [...buildCanonicalServicePlacements(systemSlug)],
  );

  return SECTION_ORDER.flatMap((section) => {
    const placements = placementsBySection.get(section) ?? [];
    return placements.length > 0
      ? [{
          section,
          placements: placements.toSorted((left, right) => left.rank - right.rank),
        }]
      : [];
  });
}
