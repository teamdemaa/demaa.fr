import {
  getDemaaFinanceBySlug,
  type DemaaFinanceItem,
} from "@/lib/finance-catalog";

const DEFAULT_FINANCE_ORDER = [
  "defacto",
  "karmen",
  "qonto",
  "factofrance",
  "bibby-factor",
  "ayvens",
  "arval",
] as const;

const FINANCE_RECOMMENDATIONS_BY_SYSTEM: Record<string, readonly string[]> = {
  "cabinet-comptable": ["defacto", "karmen", "qonto", "factofrance", "arval"],
  "cabinet-de-conseil": ["defacto", "karmen", "qonto", "arval"],
  "daf-externalise": ["defacto", "karmen", "qonto", "factofrance", "arval"],
  freelance: ["qonto"],
  "consultant-independant": ["qonto"],
  saas: ["defacto", "karmen", "qonto", "factofrance"],
  "e-commerce": ["defacto", "karmen", "qonto", "factofrance"],
  "commerce-de-detail": ["defacto", "qonto", "factofrance", "bibby-factor"],
  restaurant: ["qonto", "karmen", "factofrance", "bibby-factor", "ayvens"],
  boulangerie: ["qonto", "karmen", "factofrance", "bibby-factor", "ayvens"],
  traiteur: ["qonto", "karmen", "factofrance", "ayvens", "arval"],
  batiment: ["defacto", "karmen", "ayvens", "arval", "bibby-factor", "qonto"],
  btp: ["defacto", "karmen", "ayvens", "arval", "bibby-factor", "qonto"],
  artisanat: ["qonto", "defacto", "ayvens", "arval", "bibby-factor"],
  "services-a-la-personne": ["qonto", "ayvens", "arval"],
  "livraison-dernier-kilometre": ["karmen", "defacto", "ayvens", "arval", "bibby-factor"],
  "transport-de-marchandise": ["karmen", "defacto", "ayvens", "arval", "bibby-factor"],
  "transport-de-personnes": ["karmen", "ayvens", "arval", "qonto"],
  demenagement: ["karmen", "ayvens", "arval", "qonto", "bibby-factor"],
  "auto-ecole": ["qonto", "ayvens", "arval"],
  geometre: ["qonto", "ayvens", "arval"],
  "diagnostiqueur-immobilier": ["qonto", "ayvens", "arval"],
};

export function getRecommendedFinanceForSystem(systemSlug: string): DemaaFinanceItem[] {
  const financeSlugs = FINANCE_RECOMMENDATIONS_BY_SYSTEM[systemSlug] ?? DEFAULT_FINANCE_ORDER;

  return Array.from(new Set(financeSlugs))
    .map((slug) => getDemaaFinanceBySlug(slug))
    .filter((item): item is DemaaFinanceItem => Boolean(item))
    .slice(0, 8);
}
