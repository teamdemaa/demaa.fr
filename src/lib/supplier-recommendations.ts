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
  "tiimora",
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
      "tiimora",
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
      "tiimora",
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
      "tiimora",
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
      "tiimora",
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
      "tiimora",
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
      "tiimora",
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
      "tiimora",
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
      "tiimora",
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
      "tiimora",
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
      "tiimora",
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
      "tiimora",
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
      "tiimora",
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
      "tiimora",
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
      "tiimora",
      "assurance-pro",
      "qonto",
      "telephonie-pro",
      "protection-juridique",
      "alan",
    ],
  },
  freelance: {
    order: [
      "tiimora",
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
      "tiimora",
      "qonto",
      "assurance-pro",
      "alan",
      "telephonie-pro",
      "swile",
      "protection-juridique",
    ],
  },
  notaire: {
    order: [
      "qonto",
      "assurance-pro",
      "protection-juridique",
      "telephonie-pro",
      "alan",
      "swile",
    ],
  },
  "daf-externalise": {
    order: [
      "qonto",
      "tiimora",
      "assurance-pro",
      "alan",
      "swile",
      "telephonie-pro",
      "protection-juridique",
    ],
  },
  "office-manager-externalise": {
    order: [
      "qonto",
      "telephonie-pro",
      "assurance-pro",
      "alan",
      "swile",
      "protection-juridique",
    ],
  },
  "assistant-administratif-externalise": {
    order: [
      "qonto",
      "shine",
      "telephonie-pro",
      "assurance-pro",
      "protection-juridique",
    ],
  },
  "secretariat-externalise": {
    order: [
      "telephonie-pro",
      "qonto",
      "assurance-pro",
      "alan",
      "protection-juridique",
    ],
  },
  "gestionnaire-paie-independant": {
    order: [
      "tiimora",
      "qonto",
      "shine",
      "assurance-pro",
      "protection-juridique",
      "telephonie-pro",
    ],
  },
  "cabinet-rh-externalise": {
    order: [
      "tiimora",
      "qonto",
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
      "qonto",
      "assurance-pro",
      "alan",
      "swile",
      "protection-juridique",
    ],
  },
  "societe-recouvrement": {
    order: [
      "qonto",
      "assurance-pro",
      "protection-juridique",
      "telephonie-pro",
      "alan",
    ],
  },
  "societe-domiciliation": {
    order: [
      "qonto",
      "assurance-pro",
      "telephonie-pro",
      "protection-juridique",
      "energie-pro",
      "alan",
    ],
  },
  "centre-affaires-coworking": {
    order: [
      "qonto",
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
      "qonto",
      "assurance-pro",
      "telephonie-pro",
      "alan",
      "protection-juridique",
    ],
  },
  "bureau-etudes": {
    order: [
      "qonto",
      "assurance-pro",
      "telephonie-pro",
      "alan",
      "protection-juridique",
    ],
  },
  "cabinet-etudes": {
    order: [
      "qonto",
      "assurance-pro",
      "telephonie-pro",
      "alan",
      "protection-juridique",
    ],
  },
  "infogerance-informatique": {
    order: [
      "qonto",
      "telephonie-pro",
      "assurance-pro",
      "alan",
      "swile",
      "protection-juridique",
    ],
  },
  "cybersecurite-pme": {
    order: [
      "qonto",
      "assurance-pro",
      "protection-juridique",
      "telephonie-pro",
      "alan",
    ],
  },
  "integrateur-crm-erp": {
    order: [
      "qonto",
      "telephonie-pro",
      "assurance-pro",
      "alan",
      "swile",
      "protection-juridique",
    ],
  },
  "consultant-data-bi": {
    order: [
      "qonto",
      "telephonie-pro",
      "assurance-pro",
      "alan",
      "swile",
      "protection-juridique",
    ],
  },
  "studio-branding-design": {
    order: [
      "qonto",
      "assurance-pro",
      "telephonie-pro",
      "alan",
      "swile",
      "protection-juridique",
    ],
  },
  syndic: {
    order: [
      "qonto",
      "assurance-pro",
      "telephonie-pro",
      "energie-pro",
      "protection-juridique",
      "alan",
    ],
  },
  "gestion-locative": {
    order: [
      "qonto",
      "assurance-pro",
      "telephonie-pro",
      "energie-pro",
      "protection-juridique",
      "alan",
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
      "tiimora",
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
      "tiimora",
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
      "tiimora",
      "qonto",
      "assurance-pro",
      "telephonie-pro",
      "alan",
      "swile",
      "protection-juridique",
    ],
  },
  "agence-seo": {
    order: [
      "qonto",
      "assurance-pro",
      "telephonie-pro",
      "alan",
      "swile",
      "protection-juridique",
    ],
  },
  "agence-acquisition-paid-ads": {
    order: [
      "qonto",
      "assurance-pro",
      "telephonie-pro",
      "alan",
      "swile",
      "protection-juridique",
    ],
  },
  "diagnostiqueur-immobilier": {
    order: [
      "qonto",
      "assurance-pro",
      "telephonie-pro",
      "leasing-vehicule",
      "protection-juridique",
      "alan",
    ],
  },
  geometre: {
    order: [
      "qonto",
      "assurance-pro",
      "telephonie-pro",
      "leasing-vehicule",
      "protection-juridique",
      "alan",
    ],
  },
  "architecte-maitre-oeuvre": {
    order: [
      "qonto",
      "assurance-pro",
      "telephonie-pro",
      "alan",
      "protection-juridique",
      "kiloutou",
    ],
  },
  "reparation-informatique-mobile": {
    order: [
      "qonto",
      "assurance-pro",
      "telephonie-pro",
      "leasing-vehicule",
      "protection-juridique",
      "alan",
    ],
  },
  "nettoyage-professionnel": {
    order: [
      "qonto",
      "assurance-pro",
      "hygiene-nettoyage",
      "telephonie-pro",
      "alan",
      "protection-juridique",
    ],
  },
  demenagement: {
    order: [
      "qonto",
      "assurance-pro",
      "leasing-vehicule",
      "telephonie-pro",
      "alan",
      "protection-juridique",
    ],
  },
  "auto-ecole": {
    order: [
      "qonto",
      "assurance-pro",
      "leasing-vehicule",
      "telephonie-pro",
      "alan",
      "protection-juridique",
    ],
  },
  "gestionnaire-de-patrimoine": {
    order: [
      "qonto",
      "assurance-pro",
      "protection-juridique",
      "alan",
      "telephonie-pro",
      "swile",
    ],
  },
  "courtier-credit-assurance": {
    order: [
      "tiimora",
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
