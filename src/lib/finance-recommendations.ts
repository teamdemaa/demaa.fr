import {
  getDemaaFinanceBySlug,
  type DemaaFinanceItem,
} from "@/lib/finance-catalog";

const DEFAULT_FINANCE_ORDER = [
  "qonto",
  "defacto",
  "karmen",
  "factofrance",
  "bibby-factor",
  "ayvens",
  "arval",
] as const;

const FINANCE_RECOMMENDATIONS_BY_SYSTEM: Record<string, readonly string[]> = {
  "cabinet-comptable": ["qonto", "defacto", "karmen", "factofrance", "arval"],
  "cabinet-de-conseil": ["qonto", "defacto", "karmen", "arval"],
  "daf-externalise": ["qonto", "defacto", "karmen", "factofrance", "arval"],
  freelance: ["qonto"],
  "consultant-independant": ["qonto"],
  saas: ["qonto", "defacto", "karmen", "factofrance"],
  "e-commerce": ["qonto", "defacto", "karmen", "factofrance"],
  "commerce-de-detail": ["qonto", "defacto", "factofrance", "bibby-factor"],
  restaurant: ["qonto", "karmen", "factofrance", "bibby-factor", "ayvens"],
  boulangerie: ["qonto", "karmen", "factofrance", "bibby-factor", "ayvens"],
  traiteur: ["qonto", "karmen", "factofrance", "ayvens", "arval"],
  batiment: ["qonto", "defacto", "ayvens", "karmen", "arval", "bibby-factor"],
  "services-a-la-personne": ["qonto", "ayvens", "arval"],
  "livraison-dernier-kilometre": ["qonto", "karmen", "ayvens", "defacto", "arval", "bibby-factor"],
  "transport-de-marchandise": ["qonto", "karmen", "ayvens", "defacto", "arval", "bibby-factor"],
  "transport-de-personnes": ["qonto", "karmen", "ayvens", "arval"],
  demenagement: ["qonto", "karmen", "ayvens", "arval", "bibby-factor"],
  "auto-ecole": ["qonto", "ayvens", "arval"],
  geometre: ["qonto", "ayvens", "arval"],
  "diagnostiqueur-immobilier": ["qonto", "ayvens", "arval"],
};

const SYSTEMS_WITH_THREE_VISIBLE_FINANCE_RECOMMENDATIONS = new Set([
  "batiment",
  "livraison-dernier-kilometre",
  "transport-de-marchandise",
  "transport-de-personnes",
  "demenagement",
]);

export function getVisibleFinanceRecommendationCountForSystem(systemSlug: string): number {
  return SYSTEMS_WITH_THREE_VISIBLE_FINANCE_RECOMMENDATIONS.has(systemSlug) ? 3 : 2;
}

export function getRecommendedFinanceForSystem(systemSlug: string): DemaaFinanceItem[] {
  const financeSlugs = FINANCE_RECOMMENDATIONS_BY_SYSTEM[systemSlug] ?? DEFAULT_FINANCE_ORDER;

  return Array.from(new Set(financeSlugs))
    .map((slug) => getDemaaFinanceBySlug(slug))
    .filter((item): item is DemaaFinanceItem => Boolean(item))
    .slice(0, 8);
}
