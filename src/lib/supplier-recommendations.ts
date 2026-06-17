import {
  demaaSuppliers,
  getDemaaSupplierBySlug,
  type DemaaSupplier,
  type DemaaSupplierSlug,
} from "@/lib/supplier-catalog";

type SupplierRecommendationRule = {
  order: readonly string[];
};

const DEFAULT_SUPPLIER_ORDER = [
  "assurance-pro",
  "alan",
  "telephonie-pro",
  "terminal-paiement",
  "protection-juridique",
] satisfies readonly string[];

const SUPPLIER_RECOMMENDATIONS_BY_SYSTEM: Record<string, SupplierRecommendationRule> = {
  batiment: {
    order: [
      "assurance-pro",
      "plateforme-du-batiment",
      "point-p",
      "kiloutou",
      "wurth",
      "rexel",
      "alan",
      "telephonie-pro",
    ],
  },
  btp: {
    order: [
      "assurance-pro",
      "plateforme-du-batiment",
      "point-p",
      "kiloutou",
      "wurth",
      "rexel",
      "alan",
      "telephonie-pro",
    ],
  },
  artisanat: {
    order: [
      "assurance-pro",
      "wurth",
      "kiloutou",
      "alan",
      "telephonie-pro",
      "protection-juridique",
    ],
  },
  restaurant: {
    order: [
      "assurance-pro",
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
      "terminal-paiement",
      "grossiste-alimentaire",
      "fournisseur-boissons",
      "emballages-pro",
      "hygiene-nettoyage",
    ],
  },
  "commerce-de-detail": {
    order: [
      "assurance-pro",
      "terminal-paiement",
      "emballages-pro",
      "energie-pro",
      "telephonie-pro",
      "protection-juridique",
    ],
  },
  "e-commerce": {
    order: [
      "emballages-pro",
      "assurance-pro",
      "telephonie-pro",
      "protection-juridique",
    ],
  },
  "institut-de-beaute": {
    order: [
      "assurance-pro",
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
      "alan",
      "telephonie-pro",
      "protection-juridique",
    ],
  },
  "livraison-dernier-kilometre": {
    order: [
      "assurance-pro",
      "telephonie-pro",
      "alan",
      "protection-juridique",
    ],
  },
  "transport-de-marchandise": {
    order: [
      "assurance-pro",
      "telephonie-pro",
      "alan",
      "protection-juridique",
    ],
  },
  "transport-de-personnes": {
    order: [
      "assurance-pro",
      "telephonie-pro",
      "alan",
      "protection-juridique",
    ],
  },
  "agence-immobiliere": {
    order: [
      "assurance-pro",
      "telephonie-pro",
      "protection-juridique",
      "alan",
    ],
  },
  freelance: {
    order: [
      "assurance-pro",
      "alan",
      "telephonie-pro",
      "protection-juridique",
    ],
  },
  "cabinet-de-conseil": {
    order: [
      "assurance-pro",
      "alan",
      "telephonie-pro",
      "swile",
      "protection-juridique",
    ],
  },
  notaire: {
    order: [
      "assurance-pro",
      "protection-juridique",
      "telephonie-pro",
      "alan",
      "swile",
    ],
  },
  "daf-externalise": {
    order: [
      "assurance-pro",
      "alan",
      "swile",
      "telephonie-pro",
      "protection-juridique",
    ],
  },
  "office-manager-externalise": {
    order: [
      "telephonie-pro",
      "assurance-pro",
      "alan",
      "swile",
      "protection-juridique",
    ],
  },
  "assistant-administratif-externalise": {
    order: [
      "telephonie-pro",
      "assurance-pro",
      "protection-juridique",
      "alan",
    ],
  },
  "secretariat-externalise": {
    order: [
      "telephonie-pro",
      "assurance-pro",
      "alan",
      "protection-juridique",
    ],
  },
  "gestionnaire-paie-independant": {
    order: [
      "assurance-pro",
      "protection-juridique",
      "telephonie-pro",
      "alan",
    ],
  },
  "cabinet-rh-externalise": {
    order: [
      "alan",
      "swile",
      "assurance-pro",
      "telephonie-pro",
      "protection-juridique",
    ],
  },
  "centre-appels-support-client": {
    order: [
      "telephonie-pro",
      "assurance-pro",
      "alan",
      "swile",
      "protection-juridique",
    ],
  },
  "societe-recouvrement": {
    order: [
      "assurance-pro",
      "protection-juridique",
      "telephonie-pro",
      "alan",
    ],
  },
  "societe-domiciliation": {
    order: [
      "assurance-pro",
      "telephonie-pro",
      "protection-juridique",
      "energie-pro",
      "alan",
    ],
  },
  "centre-affaires-coworking": {
    order: [
      "terminal-paiement",
      "energie-pro",
      "telephonie-pro",
      "assurance-pro",
      "hygiene-nettoyage",
      "alan",
    ],
  },
  "cabinet-qhse-conformite": {
    order: [
      "assurance-pro",
      "telephonie-pro",
      "alan",
      "protection-juridique",
    ],
  },
  "bureau-etudes": {
    order: [
      "assurance-pro",
      "telephonie-pro",
      "alan",
      "protection-juridique",
    ],
  },
  "cabinet-etudes": {
    order: [
      "assurance-pro",
      "telephonie-pro",
      "alan",
      "protection-juridique",
    ],
  },
  "infogerance-informatique": {
    order: [
      "telephonie-pro",
      "assurance-pro",
      "alan",
      "swile",
      "protection-juridique",
    ],
  },
  "cybersecurite-pme": {
    order: [
      "assurance-pro",
      "protection-juridique",
      "telephonie-pro",
      "alan",
    ],
  },
  "integrateur-crm-erp": {
    order: [
      "telephonie-pro",
      "assurance-pro",
      "alan",
      "swile",
      "protection-juridique",
    ],
  },
  "consultant-data-bi": {
    order: [
      "telephonie-pro",
      "assurance-pro",
      "alan",
      "swile",
      "protection-juridique",
    ],
  },
  "studio-branding-design": {
    order: [
      "assurance-pro",
      "telephonie-pro",
      "alan",
      "swile",
      "protection-juridique",
    ],
  },
  syndic: {
    order: [
      "assurance-pro",
      "telephonie-pro",
      "energie-pro",
      "protection-juridique",
      "alan",
    ],
  },
  "gestion-locative": {
    order: [
      "assurance-pro",
      "telephonie-pro",
      "energie-pro",
      "protection-juridique",
      "alan",
    ],
  },
  "cabinet-comptable": {
    order: [
      "assurance-pro",
      "alan",
      "swile",
      "telephonie-pro",
      "protection-juridique",
    ],
  },
  "cabinet-davocat": {
    order: [
      "assurance-pro",
      "protection-juridique",
      "alan",
      "telephonie-pro",
    ],
  },
  saas: {
    order: [
      "assurance-pro",
      "alan",
      "swile",
      "telephonie-pro",
    ],
  },
  evenementiel: {
    order: [
      "assurance-pro",
      "kiloutou",
      "fournisseur-boissons",
      "terminal-paiement",
      "telephonie-pro",
      "protection-juridique",
    ],
  },
  "cabinet-assurance": {
    order: [
      "assurance-pro",
      "telephonie-pro",
      "alan",
      "swile",
      "protection-juridique",
    ],
  },
  "agence-seo": {
    order: [
      "assurance-pro",
      "telephonie-pro",
      "alan",
      "swile",
      "protection-juridique",
    ],
  },
  "agence-acquisition-paid-ads": {
    order: [
      "assurance-pro",
      "telephonie-pro",
      "alan",
      "swile",
      "protection-juridique",
    ],
  },
  "diagnostiqueur-immobilier": {
    order: [
      "assurance-pro",
      "telephonie-pro",
      "protection-juridique",
      "alan",
    ],
  },
  geometre: {
    order: [
      "assurance-pro",
      "telephonie-pro",
      "protection-juridique",
      "alan",
    ],
  },
  "architecte-maitre-oeuvre": {
    order: [
      "assurance-pro",
      "telephonie-pro",
      "alan",
      "protection-juridique",
      "kiloutou",
    ],
  },
  "reparation-informatique-mobile": {
    order: [
      "assurance-pro",
      "telephonie-pro",
      "protection-juridique",
      "alan",
    ],
  },
  "nettoyage-professionnel": {
    order: [
      "assurance-pro",
      "hygiene-nettoyage",
      "telephonie-pro",
      "alan",
      "protection-juridique",
    ],
  },
  demenagement: {
    order: [
      "assurance-pro",
      "telephonie-pro",
      "alan",
      "protection-juridique",
    ],
  },
  "auto-ecole": {
    order: [
      "assurance-pro",
      "telephonie-pro",
      "alan",
      "protection-juridique",
    ],
  },
  "gestionnaire-de-patrimoine": {
    order: [
      "assurance-pro",
      "protection-juridique",
      "alan",
      "telephonie-pro",
      "swile",
    ],
  },
  "courtier-credit-assurance": {
    order: [
      "assurance-pro",
      "telephonie-pro",
      "alan",
      "protection-juridique",
    ],
  },
};

export function getRecommendedSuppliersForSystem(systemSlug: string): DemaaSupplier[] {
  const rule = SUPPLIER_RECOMMENDATIONS_BY_SYSTEM[systemSlug];
  const order = [...(rule?.order ?? []), ...DEFAULT_SUPPLIER_ORDER].filter(
    (slug, index, list) => list.indexOf(slug) === index,
  ) as string[];
  const recommended = order
    .map((slug) => getDemaaSupplierBySlug(slug as DemaaSupplierSlug))
    .filter((supplier): supplier is DemaaSupplier => Boolean(supplier));

  return recommended.length ? recommended : [...demaaSuppliers.slice(0, 6)];
}
