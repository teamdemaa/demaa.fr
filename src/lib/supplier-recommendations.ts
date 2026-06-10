import {
  demaaSuppliers,
  getDemaaSupplierBySlug,
  type DemaaSupplier,
  type DemaaSupplierSlug,
} from "@/lib/supplier-catalog";

type SupplierRecommendationRule = {
  order: readonly DemaaSupplierSlug[];
};

const DEFAULT_SUPPLIER_ORDER = [
  "assurance-pro",
  "qonto",
  "alan",
  "telephonie-pro",
  "terminal-paiement",
  "protection-juridique",
] satisfies DemaaSupplierSlug[];

const SUPPLIER_RECOMMENDATIONS_BY_SYSTEM: Record<string, SupplierRecommendationRule> = {
  batiment: {
    order: [
      "assurance-pro",
      "qonto",
      "plateforme-du-batiment",
      "point-p",
      "kiloutou",
      "wurth",
      "rexel",
      "leasing-vehicule",
      "alan",
      "telephonie-pro",
    ],
  },
  btp: {
    order: [
      "assurance-pro",
      "qonto",
      "plateforme-du-batiment",
      "point-p",
      "kiloutou",
      "wurth",
      "rexel",
      "leasing-vehicule",
      "alan",
      "telephonie-pro",
    ],
  },
  artisanat: {
    order: [
      "assurance-pro",
      "qonto",
      "wurth",
      "kiloutou",
      "leasing-vehicule",
      "alan",
      "telephonie-pro",
      "protection-juridique",
    ],
  },
  restaurant: {
    order: [
      "assurance-pro",
      "qonto",
      "terminal-paiement",
      "grossiste-alimentaire",
      "fournisseur-boissons",
      "emballages-pro",
      "energie-pro",
      "hygiene-nettoyage",
      "alan",
      "telephonie-pro",
    ],
  },
  boulangerie: {
    order: [
      "assurance-pro",
      "qonto",
      "terminal-paiement",
      "grossiste-alimentaire",
      "emballages-pro",
      "energie-pro",
      "hygiene-nettoyage",
      "alan",
    ],
  },
  traiteur: {
    order: [
      "assurance-pro",
      "qonto",
      "terminal-paiement",
      "grossiste-alimentaire",
      "fournisseur-boissons",
      "emballages-pro",
      "leasing-vehicule",
      "hygiene-nettoyage",
    ],
  },
  "commerce-de-detail": {
    order: [
      "assurance-pro",
      "qonto",
      "terminal-paiement",
      "emballages-pro",
      "energie-pro",
      "telephonie-pro",
      "protection-juridique",
    ],
  },
  "e-commerce": {
    order: [
      "qonto",
      "revolut-business",
      "wise-business",
      "emballages-pro",
      "assurance-pro",
      "telephonie-pro",
      "protection-juridique",
    ],
  },
  "institut-de-beaute": {
    order: [
      "assurance-pro",
      "qonto",
      "terminal-paiement",
      "hygiene-nettoyage",
      "alan",
      "telephonie-pro",
      "energie-pro",
    ],
  },
  "salon-de-coiffure": {
    order: [
      "assurance-pro",
      "qonto",
      "terminal-paiement",
      "hygiene-nettoyage",
      "energie-pro",
      "alan",
      "telephonie-pro",
    ],
  },
  "services-a-la-personne": {
    order: [
      "assurance-pro",
      "qonto",
      "leasing-vehicule",
      "alan",
      "telephonie-pro",
      "protection-juridique",
    ],
  },
  "livraison-dernier-kilometre": {
    order: [
      "assurance-pro",
      "qonto",
      "leasing-vehicule",
      "telephonie-pro",
      "alan",
      "protection-juridique",
    ],
  },
  "transport-de-marchandise": {
    order: [
      "assurance-pro",
      "qonto",
      "leasing-vehicule",
      "telephonie-pro",
      "alan",
      "protection-juridique",
    ],
  },
  "transport-de-personnes": {
    order: [
      "assurance-pro",
      "qonto",
      "leasing-vehicule",
      "telephonie-pro",
      "alan",
      "protection-juridique",
    ],
  },
  "agence-immobiliere": {
    order: [
      "assurance-pro",
      "qonto",
      "telephonie-pro",
      "protection-juridique",
      "alan",
    ],
  },
  freelance: {
    order: [
      "qonto",
      "shine",
      "assurance-pro",
      "alan",
      "telephonie-pro",
      "protection-juridique",
    ],
  },
  "cabinet-de-conseil": {
    order: [
      "qonto",
      "assurance-pro",
      "alan",
      "telephonie-pro",
      "swile",
      "protection-juridique",
    ],
  },
  "cabinet-comptable": {
    order: [
      "qonto",
      "assurance-pro",
      "alan",
      "swile",
      "telephonie-pro",
      "protection-juridique",
    ],
  },
  "cabinet-davocat": {
    order: [
      "qonto",
      "assurance-pro",
      "protection-juridique",
      "alan",
      "telephonie-pro",
    ],
  },
  saas: {
    order: [
      "qonto",
      "revolut-business",
      "wise-business",
      "assurance-pro",
      "alan",
      "swile",
      "telephonie-pro",
    ],
  },
  evenementiel: {
    order: [
      "assurance-pro",
      "qonto",
      "kiloutou",
      "fournisseur-boissons",
      "terminal-paiement",
      "telephonie-pro",
      "protection-juridique",
    ],
  },
  "cabinet-assurance": {
    order: [
      "qonto",
      "assurance-pro",
      "telephonie-pro",
      "alan",
      "swile",
      "protection-juridique",
    ],
  },
  "courtier-credit-assurance": {
    order: [
      "qonto",
      "assurance-pro",
      "telephonie-pro",
      "alan",
      "protection-juridique",
    ],
  },
};

export function getRecommendedSuppliersForSystem(systemSlug: string): DemaaSupplier[] {
  const rule = SUPPLIER_RECOMMENDATIONS_BY_SYSTEM[systemSlug];
  const order = (rule?.order ?? DEFAULT_SUPPLIER_ORDER).filter(
    (slug, index, list) => list.indexOf(slug) === index,
  );
  const recommended = order
    .map((slug) => getDemaaSupplierBySlug(slug))
    .filter((supplier): supplier is DemaaSupplier => Boolean(supplier));

  return recommended.length ? recommended : [...demaaSuppliers.slice(0, 6)];
}
