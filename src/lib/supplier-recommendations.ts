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
  "orus",
  "alan",
  "onoff-business",
  "sumup",
  "insify",
] satisfies readonly string[];

const SUPPLIER_RECOMMENDATIONS_BY_SECTOR: Record<string, SupplierRecommendationRule> = {
  "Conseil & services aux entreprises": {
    order: ["orus", "onoff-business", "alan", "swile", "insify"],
  },
  "Tech & Digital": {
    order: ["onoff-business", "orus", "alan", "swile", "insify"],
  },
  "BTP & services techniques": {
    order: [
      "plateforme-du-batiment",
      "point-p",
      "kiloutou",
      "wurth",
      "rexel",
      "orus",
      "onoff-business",
      "insify",
    ],
  },
  Immobilier: {
    order: ["orus", "onoff-business", "edf-entreprises", "insify", "alan"],
  },
  "Hébergement & tourisme": {
    order: ["edf-entreprises", "bernard", "sumup", "orus", "onoff-business"],
  },
  Patrimoine: {
    order: ["orus", "insify", "onoff-business", "alan", "swile"],
  },
  "Mobilité & logistique": {
    order: ["orus", "onoff-business", "alan", "insify"],
  },
  Restauration: {
    order: [
      "transgourmet",
      "firplast",
      "sumup",
      "france-boissons",
      "bernard",
      "edf-entreprises",
      "orus",
    ],
  },
  "Commerce & retail": {
    order: ["sumup", "raja", "edf-entreprises", "orus", "bernard", "onoff-business"],
  },
  "Santé, bien-être & esthétique": {
    order: ["orus", "onoff-business", "insify", "alan", "sumup", "bernard"],
  },
  "Services aux particuliers": {
    order: ["bernard", "orus", "onoff-business", "sumup", "insify"],
  },
  "Éducation & formation": {
    order: ["onoff-business", "orus", "alan", "swile", "insify"],
  },
  "Industrie & production": {
    order: ["wurth", "kiloutou", "edf-entreprises", "bernard", "orus", "onoff-business"],
  },
  "Automobile & réparation": {
    order: ["autodistribution-pro", "wurth", "kiloutou", "edf-entreprises", "orus", "onoff-business"],
  },
  "Associations & événements": {
    order: ["onoff-business", "orus", "alan", "swile", "insify"],
  },
};

const SUPPLIER_RECOMMENDATIONS_BY_SYSTEM: Record<string, SupplierRecommendationRule> = {
  batiment: {
    order: [
      "plateforme-du-batiment",
      "point-p",
      "kiloutou",
      "orus",
      "wurth",
      "rexel",
      "alan",
      "onoff-business",
    ],
  },
  restaurant: {
    order: [
      "transgourmet",
      "france-boissons",
      "sumup",
      "metro-france",
      "firplast",
      "orus",
      "edf-entreprises",
      "bernard",
      "alan",
      "onoff-business",
    ],
  },
  boulangerie: {
    order: [
      "transgourmet",
      "firplast",
      "sumup",
      "orus",
      "edf-entreprises",
      "bernard",
      "alan",
    ],
  },
  traiteur: {
    order: [
      "transgourmet",
      "firplast",
      "france-boissons",
      "sumup",
      "orus",
      "bernard",
    ],
  },
  "fast-food": {
    order: ["transgourmet", "firplast", "sumup", "bernard", "edf-entreprises", "orus"],
  },
  "dark-kitchen": {
    order: ["transgourmet", "firplast", "bernard", "sumup", "edf-entreprises", "orus"],
  },
  "bar-cafe": {
    order: ["france-boissons", "sumup", "bernard", "transgourmet", "edf-entreprises", "orus"],
  },
  "food-truck": {
    order: ["firplast", "sumup", "transgourmet", "france-boissons", "orus"],
  },
  "commerce-alimentaire": {
    order: ["transgourmet", "sumup", "bernard", "metro-france", "raja", "edf-entreprises", "orus"],
  },
  "commerce-de-detail": {
    order: [
      "sumup",
      "raja",
      "edf-entreprises",
      "orus",
      "onoff-business",
      "insify",
    ],
  },
  "e-commerce": {
    order: [
      "raja",
      "orus",
      "onoff-business",
      "insify",
    ],
  },
  "institut-de-beaute": {
    order: [
      "gouiran-beaute-pro",
      "sumup",
      "bernard",
      "orus",
      "alan",
      "onoff-business",
      "edf-entreprises",
    ],
  },
  "salon-de-coiffure": {
    order: [
      "gouiran-beaute-pro",
      "sumup",
      "bernard",
      "edf-entreprises",
      "orus",
      "alan",
      "onoff-business",
    ],
  },
  "electricite-generale": {
    order: ["rexel", "wurth", "kiloutou", "plateforme-du-batiment", "orus", "onoff-business"],
  },
  "plomberie-chauffage": {
    order: ["cedeo-pro", "wurth", "kiloutou", "plateforme-du-batiment", "point-p", "orus"],
  },
  "menuiserie-agencement": {
    order: ["dispano-bois", "legallais-quincaillerie", "kiloutou", "plateforme-du-batiment", "point-p", "orus"],
  },
  couvreur: {
    order: ["asturienne-toiture", "plateforme-du-batiment", "kiloutou", "point-p", "wurth", "orus"],
  },
  "peintre-en-batiment": {
    order: ["tollens-pro", "plateforme-du-batiment", "kiloutou", "point-p", "wurth", "orus"],
  },
  serrurier: {
    order: ["legallais-quincaillerie", "wurth", "kiloutou", "plateforme-du-batiment", "point-p", "orus"],
  },
  climatisation: {
    order: ["clim-plus", "cedeo-pro", "kiloutou", "rexel", "wurth", "orus"],
  },
  paysagiste: {
    order: ["dispano-bois", "kiloutou", "point-p", "plateforme-du-batiment", "wurth", "orus"],
  },
  "garage-automobile": {
    order: ["autodistribution-pro", "wurth", "kiloutou", "edf-entreprises", "orus", "onoff-business"],
  },
  carrosserie: {
    order: ["autodistribution-pro", "wurth", "kiloutou", "edf-entreprises", "orus", "onoff-business"],
  },
  pressing: {
    order: ["edf-entreprises", "bernard", "sumup", "orus", "onoff-business"],
  },
  "laverie-automatique": {
    order: ["edf-entreprises", "bernard", "sumup", "orus", "onoff-business"],
  },
  "services-a-la-personne": {
    order: [
      "orus",
      "alan",
      "onoff-business",
      "insify",
    ],
  },
  "livraison-dernier-kilometre": {
    order: [
      "orus",
      "onoff-business",
      "alan",
      "insify",
    ],
  },
  "transport-de-marchandise": {
    order: [
      "orus",
      "onoff-business",
      "alan",
      "insify",
    ],
  },
  "transport-de-personnes": {
    order: [
      "orus",
      "onoff-business",
      "alan",
      "insify",
    ],
  },
  "agence-immobiliere": {
    order: [
      "orus",
      "onoff-business",
      "insify",
      "alan",
    ],
  },
  freelance: {
    order: [
      "orus",
      "alan",
      "onoff-business",
      "insify",
    ],
  },
  "cabinet-de-conseil": {
    order: [
      "orus",
      "alan",
      "onoff-business",
      "swile",
      "insify",
    ],
  },
  notaire: {
    order: [
      "orus",
      "insify",
      "onoff-business",
      "alan",
      "swile",
    ],
  },
  "daf-externalise": {
    order: [
      "orus",
      "alan",
      "swile",
      "onoff-business",
      "insify",
    ],
  },
  "office-manager-externalise": {
    order: [
      "onoff-business",
      "orus",
      "alan",
      "swile",
      "insify",
    ],
  },
  "assistant-administratif-externalise": {
    order: [
      "onoff-business",
      "orus",
      "insify",
      "alan",
    ],
  },
  "secretariat-externalise": {
    order: [
      "onoff-business",
      "orus",
      "alan",
      "insify",
    ],
  },
  "gestionnaire-paie-independant": {
    order: [
      "orus",
      "insify",
      "onoff-business",
      "alan",
    ],
  },
  "cabinet-rh-externalise": {
    order: [
      "alan",
      "swile",
      "orus",
      "onoff-business",
      "insify",
    ],
  },
  "centre-appels-support-client": {
    order: [
      "onoff-business",
      "orus",
      "alan",
      "swile",
      "insify",
    ],
  },
  "societe-recouvrement": {
    order: [
      "orus",
      "insify",
      "onoff-business",
      "alan",
    ],
  },
  "centre-affaires-coworking": {
    order: [
      "sumup",
      "edf-entreprises",
      "onoff-business",
      "orus",
      "bernard",
      "alan",
    ],
  },
  "cabinet-qhse-conformite": {
    order: [
      "orus",
      "onoff-business",
      "alan",
      "insify",
    ],
  },
  "bureau-etudes": {
    order: [
      "orus",
      "onoff-business",
      "alan",
      "insify",
    ],
  },
  "cabinet-etudes": {
    order: [
      "orus",
      "onoff-business",
      "alan",
      "insify",
    ],
  },
  "infogerance-informatique": {
    order: [
      "onoff-business",
      "orus",
      "alan",
      "swile",
      "insify",
    ],
  },
  "cybersecurite-pme": {
    order: [
      "orus",
      "insify",
      "onoff-business",
      "alan",
    ],
  },
  "integrateur-crm-erp": {
    order: [
      "onoff-business",
      "orus",
      "alan",
      "swile",
      "insify",
    ],
  },
  "consultant-data-bi": {
    order: [
      "onoff-business",
      "orus",
      "alan",
      "swile",
      "insify",
    ],
  },
  "studio-branding-design": {
    order: [
      "orus",
      "onoff-business",
      "alan",
      "swile",
      "insify",
    ],
  },
  syndic: {
    order: [
      "orus",
      "onoff-business",
      "edf-entreprises",
      "insify",
      "alan",
    ],
  },
  "gestion-locative": {
    order: [
      "orus",
      "onoff-business",
      "edf-entreprises",
      "insify",
      "alan",
    ],
  },
  "cabinet-comptable": {
    order: [
      "orus",
      "alan",
      "swile",
      "onoff-business",
      "insify",
    ],
  },
  esthetique: {
    order: ["gouiran-beaute-pro", "sumup", "bernard", "orus", "alan", "onoff-business"],
  },
  pharmacie: {
    order: ["ocp-repartition", "sumup", "bernard", "orus", "onoff-business", "insify"],
  },
  veterinaire: {
    order: ["centravet", "orus", "sumup", "bernard", "onoff-business", "insify"],
  },
  opticien: {
    order: ["bbgr-optique", "sumup", "orus", "onoff-business", "insify"],
  },
  pisciniste: {
    order: ["scp-france-piscine", "kiloutou", "point-p", "orus", "onoff-business", "insify"],
  },
  fleuriste: {
    order: ["france-fleurs-pro", "raja", "sumup", "orus", "onoff-business"],
  },
  creche: {
    order: ["papouille-creche", "bernard", "orus", "onoff-business", "alan"],
  },
  "cabinet-davocat": {
    order: [
      "orus",
      "insify",
      "alan",
      "onoff-business",
    ],
  },
  saas: {
    order: [
      "orus",
      "alan",
      "swile",
      "onoff-business",
    ],
  },
  evenementiel: {
    order: [
      "kiloutou",
      "france-boissons",
      "sumup",
      "orus",
      "onoff-business",
      "insify",
    ],
  },
  "cabinet-assurance": {
    order: [
      "orus",
      "onoff-business",
      "alan",
      "swile",
      "insify",
    ],
  },
  "agence-seo": {
    order: [
      "orus",
      "onoff-business",
      "alan",
      "swile",
      "insify",
    ],
  },
  "agence-acquisition-paid-ads": {
    order: [
      "orus",
      "onoff-business",
      "alan",
      "swile",
      "insify",
    ],
  },
  "diagnostiqueur-immobilier": {
    order: [
      "orus",
      "onoff-business",
      "insify",
      "alan",
    ],
  },
  geometre: {
    order: [
      "orus",
      "onoff-business",
      "insify",
      "alan",
    ],
  },
  "architecte-maitre-oeuvre": {
    order: [
      "orus",
      "onoff-business",
      "alan",
      "insify",
      "kiloutou",
    ],
  },
  "reparation-informatique-mobile": {
    order: [
      "orus",
      "onoff-business",
      "insify",
      "alan",
    ],
  },
  "nettoyage-professionnel": {
    order: [
      "bernard",
      "orus",
      "onoff-business",
      "alan",
      "insify",
    ],
  },
  demenagement: {
    order: [
      "orus",
      "onoff-business",
      "alan",
      "insify",
    ],
  },
  "auto-ecole": {
    order: [
      "codes-rousseau-pro",
      "orus",
      "onoff-business",
      "alan",
      "insify",
    ],
  },
  "gestionnaire-de-patrimoine": {
    order: [
      "orus",
      "insify",
      "alan",
      "onoff-business",
      "swile",
    ],
  },
  "courtier-credit-assurance": {
    order: [
      "orus",
      "onoff-business",
      "alan",
      "insify",
    ],
  },
  "cabinet-medical": {
    order: ["distrimed-medical", "orus", "onoff-business", "insify", "bernard"],
  },
  "cabinet-paramedical": {
    order: ["distrimed-medical", "orus", "onoff-business", "insify", "bernard"],
  },
  "infirmier-liberal": {
    order: ["distrimed-medical", "orus", "onoff-business", "insify", "bernard"],
  },
  dentiste: {
    order: ["henry-schein-dentaire", "orus", "onoff-business", "distrimed-medical", "insify"],
  },
  osteopathe: {
    order: ["distrimed-medical", "orus", "onoff-business", "insify"],
  },
  "salle-de-sport": {
    order: ["decathlon-pro", "bernard", "sumup", "orus", "edf-entreprises"],
  },
  "coach-sportif": {
    order: ["decathlon-pro", "sumup", "orus", "onoff-business", "insify"],
  },
  "tabac-presse-point-relais": {
    order: ["logista-france", "sumup", "raja", "bernard", "edf-entreprises", "orus"],
  },
  librairie: {
    order: ["dilisco-livres", "sumup", "raja", "bernard", "edf-entreprises", "orus"],
  },
  "hotel-hebergement-independant": {
    order: ["metro-france", "bernard", "france-boissons", "edf-entreprises", "sumup", "orus"],
  },
  "conciergerie-airbnb": {
    order: ["bernard", "onoff-business", "orus", "sumup", "edf-entreprises", "insify"],
  },
  "agence-de-voyage": {
    order: ["onoff-business", "orus", "sumup", "insify", "alan"],
  },
};

export function getRecommendedSuppliersForSystem(
  systemSlug: string,
  sectorLabel?: string,
): DemaaSupplier[] {
  const rule = SUPPLIER_RECOMMENDATIONS_BY_SYSTEM[systemSlug];
  const sectorRule = sectorLabel ? SUPPLIER_RECOMMENDATIONS_BY_SECTOR[sectorLabel] : undefined;
  const order = [
    ...(rule?.order ?? []),
    ...(sectorRule?.order ?? []),
    ...DEFAULT_SUPPLIER_ORDER,
  ].filter(
    (slug, index, list) => list.indexOf(slug) === index,
  ) as string[];
  const recommended = order
    .map((slug) => getDemaaSupplierBySlug(slug as DemaaSupplierSlug))
    .filter((supplier): supplier is DemaaSupplier => Boolean(supplier));

  return recommended.length ? recommended : [...demaaSuppliers.slice(0, 6)];
}
