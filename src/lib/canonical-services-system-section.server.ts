import "server-only";

import {
  getCanonicalServices,
  type CanonicalServiceSlug,
} from "@/lib/canonical-service-catalog";
import { getRecommendedAidsForSystem } from "@/lib/aid-recommendations";
import { enterpriseCatalogBySlug } from "@/lib/enterprise-annuaire";
import { getRecommendedFinanceForSystem } from "@/lib/finance-recommendations";
import { filterPublicSolutionSections } from "@/lib/public-solution-section-visibility";
import type { SolutionSection } from "@/lib/solution-registry-dto";
import type {
  RenderableSolutionPlacementDto,
  RenderableSolutionSectionDto,
} from "@/lib/system-solutions-ui-dto";

const SECTION_ORDER: readonly SolutionSection[] = [
  "software",
  "services",
  "providers",
  "financing",
  "aids",
  "models",
  "networks",
];

const ACCOUNTING_FIRM_SYSTEM_SLUGS = new Set(["cabinet-comptable", "expert-comptable"]);

export function getCanonicalServiceSlugsForSystem(
  systemSlug: string,
): readonly CanonicalServiceSlug[] {
  return getCanonicalServices()
    .filter((service) => {
      if (service.slug === "expert-comptable") {
        return !ACCOUNTING_FIRM_SYSTEM_SLUGS.has(systemSlug);
      }
      return true;
    })
    .map((service) => service.slug);
}

function buildFinancePlacements(
  systemSlug: string,
): readonly RenderableSolutionPlacementDto[] {
  return getRecommendedFinanceForSystem(systemSlug).map((item, index) => ({
    placementId: `catalog:${systemSlug}:financing:${item.slug}`,
    systemSlug,
    rank: index + 1,
    section: "financing",
    usage: item.bestFor,
    fitRationale: item.description,
    fitConstraints: [
      "Vérifier les critères d’éligibilité, le coût total et les garanties demandées avant de vous engager.",
    ],
    resource: {
      resourceSlug: `financing-${item.slug}`,
      resourceType: "financing",
      name: item.name,
      description: item.shortDescription,
      displayCategory: item.family,
      ctaLabel: item.cta,
      interaction: { interactionMode: "external_link", href: item.href },
    },
  }));
}

function buildAidPlacements(
  systemSlug: string,
): readonly RenderableSolutionPlacementDto[] {
  const sectorLabel = enterpriseCatalogBySlug[systemSlug]?.sectorLabel;

  return getRecommendedAidsForSystem(systemSlug, sectorLabel).map((item, index) => ({
    placementId: `catalog:${systemSlug}:aids:${item.slug}`,
    systemSlug,
    rank: index + 1,
    section: "aids",
    usage: item.bestFor,
    fitRationale: item.description,
    fitConstraints: [
      "Les conditions et montants peuvent évoluer : confirmer votre situation sur la source officielle.",
    ],
    resource: {
      resourceSlug: `aid-${item.slug}`,
      resourceType: "aid",
      name: item.name,
      description: item.shortDescription,
      displayCategory: item.family,
      ctaLabel: item.cta,
      interaction: { interactionMode: "external_link", href: item.sourceUrl },
    },
  }));
}

function buildCanonicalServicePlacements(
  systemSlug: string,
): readonly RenderableSolutionPlacementDto[] {
  const eligibleSlugs = new Set(getCanonicalServiceSlugsForSystem(systemSlug));
  const services = getCanonicalServices().filter((service) =>
    eligibleSlugs.has(service.slug),
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
      monthlyAccompanimentDiscountEligible: service.monthlyAccompanimentDiscountEligible,
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
    const publicPlacements = group.placements.filter(
      ({ resource }) => resource.resourceSlug !== "juridi-consulting",
    );
    if (publicPlacements.length === 0) continue;
    const placements = placementsBySection.get(group.section) ?? [];
    placements.push(...publicPlacements);
    placementsBySection.set(group.section, placements);
  }
  placementsBySection.set(
    "services",
    [...buildCanonicalServicePlacements(systemSlug)],
  );
  placementsBySection.set("financing", [...buildFinancePlacements(systemSlug)]);
  placementsBySection.set("aids", [...buildAidPlacements(systemSlug)]);

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

/**
 * Builds the public payload and applies visibility last so internally composed
 * sections such as financing or aids cannot be reintroduced after filtering.
 */
export function composePublicSolutionSectionsForSystem(
  systemSlug: string,
  sections: readonly RenderableSolutionSectionDto[],
): readonly RenderableSolutionSectionDto[] {
  return filterPublicSolutionSections(
    composeCanonicalServicesForSystem(systemSlug, sections),
  );
}
