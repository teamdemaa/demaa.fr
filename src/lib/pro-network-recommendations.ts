import {
  demaaProNetworks,
  getDemaaProNetworkBySlug,
  type DemaaProNetwork,
  type DemaaProNetworkSlug,
} from "@/lib/pro-network-catalog";
import rawEnterpriseAnnuaire from "@/lib/enterprise-annuaire.json";

type ProNetworkRecommendationRule = {
  order: readonly DemaaProNetworkSlug[];
};

type EnterpriseAnnuairePayload = {
  enterprises: Array<{
    slug: string;
    sectorLabel: string;
  }>;
};

const enterpriseCatalogBySlug = Object.fromEntries(
  (rawEnterpriseAnnuaire as EnterpriseAnnuairePayload).enterprises.map((enterprise) => [
    enterprise.slug,
    enterprise,
  ]),
) as Record<string, { slug: string; sectorLabel: string }>;

const MAX_PRO_NETWORKS_PER_SYSTEM = 5;

const DEFAULT_PRO_NETWORK_ORDER = [
  "cci-locale",
  "cpme-locale",
  "bni",
  "banques-professionnelles",
  "medef-local",
] satisfies DemaaProNetworkSlug[];

const PRO_NETWORK_RECOMMENDATIONS_BY_SECTOR: Record<string, ProNetworkRecommendationRule> = {
  "Conseil & services aux entreprises": {
    order: [
      "cci-locale",
      "cpme-locale",
      "medef-local",
      "bni",
      "banques-professionnelles",
    ],
  },
  "Tech & Digital": {
    order: [
      "french-tech",
      "numeum",
      "france-digitale",
      "cci-locale",
      "bni",
    ],
  },
  "BTP & services techniques": {
    order: [
      "capeb",
      "ffb",
      "qualibat",
      "cma",
      "cci-locale",
    ],
  },
  Immobilier: {
    order: [
      "fnaim",
      "unis",
      "notaires",
      "banques-professionnelles",
      "cci-locale",
    ],
  },
  "Hébergement & tourisme": {
    order: [
      "offices-tourisme",
      "atout-france",
      "umih",
      "cci-locale",
      "bni",
    ],
  },
  Patrimoine: {
    order: [
      "cncgp",
      "anacofi",
      "notaires",
      "banques-professionnelles",
      "cci-locale",
    ],
  },
  "Mobilité & logistique": {
    order: [
      "fntr",
      "otre",
      "cci-locale",
      "bni",
      "banques-professionnelles",
    ],
  },
  Restauration: {
    order: [
      "umih",
      "ghr",
      "cci-locale",
      "bni",
      "salons-commerce-restauration",
    ],
  },
  "Commerce & retail": {
    order: [
      "union-commercants-locaux",
      "cci-locale",
      "cma",
      "bni",
      "salons-commerce-restauration",
    ],
  },
  "Santé, bien-être & esthétique": {
    order: [
      "urps",
      "cci-locale",
      "bni",
      "cpme-locale",
      "medef-local",
    ],
  },
  "Services aux particuliers": {
    order: [
      "fesp",
      "cci-locale",
      "cma",
      "bni",
      "cpme-locale",
    ],
  },
  "Éducation & formation": {
    order: [
      "acteurs-competence",
      "edtech-france",
      "cci-locale",
      "bni",
      "cpme-locale",
    ],
  },
  "Industrie & production": {
    order: [
      "french-fab",
      "medef-local",
      "cpme-locale",
      "cci-locale",
      "bni",
    ],
  },
  "Automobile & réparation": {
    order: [
      "mobilians",
      "reseaux-assureurs-auto",
      "cci-locale",
      "cma",
      "bni",
    ],
  },
  "Associations & événements": {
    order: [
      "mouvement-associatif",
      "france-benevolat",
      "ess-france",
      "cci-locale",
      "bni",
    ],
  },
};

const PRO_NETWORK_OVERRIDES_BY_SYSTEM: Record<string, ProNetworkRecommendationRule> = {
  "cabinet-comptable": {
    order: [
      "ordre-experts-comptables",
      "croec-regional",
      "tiimora",
      "banques-professionnelles",
      "avocats-affaires",
    ],
  },
  "cabinet-davocat": {
    order: [
      "avocats-affaires",
      "medef-local",
      "cci-locale",
    ],
  },
  notaire: {
    order: [
      "notaires",
      "banques-professionnelles",
      "avocats-affaires",
    ],
  },
  "courtier-credit-assurance": {
    order: [
      "tiimora",
      "banques-professionnelles",
      "notaires",
      "cci-locale",
    ],
  },
  "agence-de-recrutement": {
    order: [
      "medef-local",
      "cpme-locale",
      "cci-locale",
      "bni",
    ],
  },
  "centre-affaires-coworking": {
    order: [
      "cci-locale",
      "bni",
      "cpme-locale",
      "medef-local",
    ],
  },
  "bureau-etudes": {
    order: [
      "ffb",
      "cci-locale",
      "medef-local",
    ],
  },
  "cabinet-etudes": {
    order: [
      "medef-local",
      "cci-locale",
      "bni",
    ],
  },
  freelance: {
    order: [
      "tiimora",
      "bni",
      "cci-locale",
      "cpme-locale",
    ],
  },
  "consultant-independant": {
    order: [
      "tiimora",
      "bni",
      "cci-locale",
      "cpme-locale",
    ],
  },
  "agence-marketing": {
    order: [
      "cci-locale",
      "bni",
      "french-tech",
      "numeum",
    ],
  },
  "agence-seo": {
    order: [
      "french-tech",
      "numeum",
      "cci-locale",
      "bni",
    ],
  },
  "agence-acquisition-paid-ads": {
    order: [
      "french-tech",
      "numeum",
      "cci-locale",
      "bni",
    ],
  },
  "studio-branding-design": {
    order: [
      "french-tech",
      "cci-locale",
      "bni",
    ],
  },
  "agence-web": {
    order: [
      "french-tech",
      "numeum",
      "france-digitale",
      "cci-locale",
    ],
  },
  saas: {
    order: [
      "french-tech",
      "france-digitale",
      "numeum",
      "cci-locale",
    ],
  },
  marketplace: {
    order: [
      "france-digitale",
      "french-tech",
      "numeum",
      "cci-locale",
    ],
  },
  media: {
    order: [
      "french-tech",
      "cci-locale",
      "bni",
    ],
  },
  "creation-de-contenu": {
    order: [
      "french-tech",
      "cci-locale",
      "bni",
    ],
  },
  "photographe-videaste": {
    order: [
      "cci-locale",
      "bni",
      "union-commercants-locaux",
    ],
  },
  "reparation-informatique-mobile": {
    order: [
      "cci-locale",
      "cma",
      "bni",
    ],
  },
  "infogerance-informatique": {
    order: [
      "numeum",
      "french-tech",
      "cci-locale",
    ],
  },
  "cybersecurite-pme": {
    order: [
      "numeum",
      "french-tech",
      "medef-local",
      "cci-locale",
    ],
  },
  "integrateur-crm-erp": {
    order: [
      "numeum",
      "french-tech",
      "cci-locale",
    ],
  },
  "consultant-data-bi": {
    order: [
      "numeum",
      "french-tech",
      "cci-locale",
    ],
  },
  batiment: {
    order: [
      "capeb",
      "ffb",
      "qualibat",
      "architectes-locaux",
      "maitres-oeuvre",
    ],
  },
  "architecte-maitre-oeuvre": {
    order: [
      "architectes-locaux",
      "maitres-oeuvre",
      "ffb",
      "cci-locale",
    ],
  },
  geometre: {
    order: [
      "architectes-locaux",
      "maitres-oeuvre",
      "cci-locale",
      "notaires",
    ],
  },
  "diagnostiqueur-immobilier": {
    order: [
      "notaires",
      "fnaim",
      "unis",
      "agences-immobilieres-locales",
    ],
  },
  paysagiste: {
    order: [
      "cma",
      "cci-locale",
      "architectes-locaux",
      "agences-immobilieres-locales",
    ],
  },
  "nettoyage-professionnel": {
    order: [
      "cci-locale",
      "bni",
      "medef-local",
    ],
  },
  "agence-immobiliere": {
    order: [
      "fnaim",
      "unis",
      "notaires",
      "banques-professionnelles",
      "cci-locale",
    ],
  },
  syndic: {
    order: [
      "unis",
      "fnaim",
      "notaires",
      "agences-immobilieres-locales",
    ],
  },
  "gestion-locative": {
    order: [
      "unis",
      "fnaim",
      "notaires",
      "agences-immobilieres-locales",
    ],
  },
  "marchand-de-biens": {
    order: [
      "notaires",
      "banques-professionnelles",
      "fnaim",
      "cci-locale",
    ],
  },
  "investissement-locatif": {
    order: [
      "notaires",
      "banques-professionnelles",
      "fnaim",
      "cncgp",
    ],
  },
  "chasseur-immobilier": {
    order: [
      "fnaim",
      "notaires",
      "agences-immobilieres-locales",
      "cci-locale",
    ],
  },
  "investissement-immobilier": {
    order: [
      "notaires",
      "cncgp",
      "anacofi",
      "banques-professionnelles",
    ],
  },
  "investissement-financier": {
    order: [
      "cncgp",
      "anacofi",
      "banques-professionnelles",
      "notaires",
    ],
  },
  "investissement-entreprise": {
    order: [
      "anacofi",
      "cncgp",
      "banques-professionnelles",
      "medef-local",
    ],
  },
  "gestionnaire-de-patrimoine": {
    order: [
      "cncgp",
      "anacofi",
      "notaires",
      "banques-professionnelles",
    ],
  },
  restaurant: {
    order: [
      "umih",
      "ghr",
      "cci-locale",
      "salons-commerce-restauration",
      "bni",
    ],
  },
  "fast-food": {
    order: [
      "umih",
      "cci-locale",
      "salons-commerce-restauration",
      "union-commercants-locaux",
    ],
  },
  "dark-kitchen": {
    order: [
      "cci-locale",
      "salons-commerce-restauration",
      "bni",
      "umih",
    ],
  },
  "bar-cafe": {
    order: [
      "umih",
      "ghr",
      "cci-locale",
      "bni",
    ],
  },
  "food-truck": {
    order: [
      "cci-locale",
      "cma",
      "umih",
      "salons-commerce-restauration",
    ],
  },
  boulangerie: {
    order: [
      "cma",
      "cci-locale",
      "union-commercants-locaux",
      "salons-commerce-restauration",
    ],
  },
  "commerce-de-detail": {
    order: [
      "union-commercants-locaux",
      "cci-locale",
      "bni",
      "salons-commerce-restauration",
    ],
  },
  "commerce-alimentaire": {
    order: [
      "union-commercants-locaux",
      "cci-locale",
      "salons-commerce-restauration",
      "bni",
    ],
  },
  "boutique-specialisee": {
    order: [
      "union-commercants-locaux",
      "cci-locale",
      "bni",
      "salons-commerce-restauration",
    ],
  },
  librairie: {
    order: [
      "union-commercants-locaux",
      "cci-locale",
      "bni",
    ],
  },
  "tabac-presse-point-relais": {
    order: [
      "union-commercants-locaux",
      "cci-locale",
      "bni",
    ],
  },
  "e-commerce": {
    order: [
      "france-digitale",
      "french-tech",
      "cci-locale",
      "salons-commerce-restauration",
    ],
  },
  "cabinet-medical": {
    order: [
      "ordre-medecins",
      "urps",
      "cci-locale",
    ],
  },
  "cabinet-paramedical": {
    order: [
      "urps",
      "cci-locale",
      "bni",
    ],
  },
  "infirmier-liberal": {
    order: [
      "ordre-infirmiers",
      "urps",
      "cci-locale",
    ],
  },
  dentiste: {
    order: [
      "ordre-dentistes",
      "urps",
      "cci-locale",
    ],
  },
  pharmacie: {
    order: [
      "ordre-pharmaciens",
      "urps",
      "cci-locale",
    ],
  },
  veterinaire: {
    order: [
      "ordre-veterinaires",
      "cci-locale",
      "bni",
    ],
  },
  psychologue: {
    order: [
      "urps",
      "cci-locale",
      "bni",
    ],
  },
  osteopathe: {
    order: [
      "urps",
      "cci-locale",
      "bni",
    ],
  },
  "institut-de-beaute": {
    order: [
      "cci-locale",
      "union-commercants-locaux",
      "bni",
    ],
  },
  "salon-de-coiffure": {
    order: [
      "cma",
      "union-commercants-locaux",
      "cci-locale",
      "bni",
    ],
  },
  esthetique: {
    order: [
      "cci-locale",
      "union-commercants-locaux",
      "bni",
    ],
  },
  "salle-de-sport": {
    order: [
      "cci-locale",
      "bni",
      "union-commercants-locaux",
    ],
  },
  "coach-sportif": {
    order: [
      "bni",
      "cci-locale",
      "union-commercants-locaux",
    ],
  },
  "services-a-la-personne": {
    order: [
      "fesp",
      "cci-locale",
      "cma",
      "bni",
    ],
  },
  "aide-a-domicile-menage": {
    order: [
      "fesp",
      "cci-locale",
      "cpme-locale",
    ],
  },
  pressing: {
    order: [
      "cma",
      "cci-locale",
      "union-commercants-locaux",
    ],
  },
  "laverie-automatique": {
    order: [
      "cci-locale",
      "union-commercants-locaux",
      "bni",
    ],
  },
  "organisme-de-formation": {
    order: [
      "acteurs-competence",
      "edtech-france",
      "cci-locale",
    ],
  },
  cfa: {
    order: [
      "acteurs-competence",
      "cci-locale",
      "cpme-locale",
    ],
  },
  "formation-en-ligne": {
    order: [
      "edtech-france",
      "acteurs-competence",
      "french-tech",
    ],
  },
  "auto-ecole": {
    order: [
      "mobilians",
      "cci-locale",
      "cma",
    ],
  },
  creche: {
    order: [
      "cci-locale",
      "cpme-locale",
      "bni",
    ],
  },
  "conciergerie-airbnb": {
    order: [
      "offices-tourisme",
      "cci-locale",
      "bni",
    ],
  },
  "hotel-hebergement-independant": {
    order: [
      "umih",
      "offices-tourisme",
      "atout-france",
      "cci-locale",
    ],
  },
  "agence-de-voyage": {
    order: [
      "offices-tourisme",
      "atout-france",
      "cci-locale",
      "bni",
    ],
  },
  demenagement: {
    order: [
      "cci-locale",
      "bni",
      "otre",
    ],
  },
  "livraison-dernier-kilometre": {
    order: [
      "otre",
      "fntr",
      "cci-locale",
      "bni",
    ],
  },
  "transport-de-marchandise": {
    order: [
      "fntr",
      "otre",
      "cci-locale",
      "banques-professionnelles",
    ],
  },
  "transport-de-personnes": {
    order: [
      "otre",
      "cci-locale",
      "banques-professionnelles",
      "bni",
    ],
  },
  vtc: {
    order: [
      "otre",
      "cci-locale",
      "bni",
      "banques-professionnelles",
    ],
  },
  "production-industrie": {
    order: [
      "french-fab",
      "medef-local",
      "cpme-locale",
      "cci-locale",
    ],
  },
  "garage-automobile": {
    order: [
      "mobilians",
      "reseaux-assureurs-auto",
      "cci-locale",
      "cma",
    ],
  },
  carrosserie: {
    order: [
      "mobilians",
      "reseaux-assureurs-auto",
      "cci-locale",
      "cma",
    ],
  },
  association: {
    order: [
      "mouvement-associatif",
      "france-benevolat",
      "ess-france",
      "cci-locale",
    ],
  },
};

function uniqueOrderedNetworks(slugs: DemaaProNetworkSlug[]): DemaaProNetwork[] {
  const seen = new Set<string>();

  return slugs
    .filter((slug) => {
      if (seen.has(slug)) {
        return false;
      }

      seen.add(slug);
      return true;
    })
    .map((slug) => getDemaaProNetworkBySlug(slug))
    .filter((network): network is DemaaProNetwork => Boolean(network))
    .slice(0, MAX_PRO_NETWORKS_PER_SYSTEM);
}

export function getRecommendedProNetworksForSystem(systemSlug: string): DemaaProNetwork[] {
  const enterprise = enterpriseCatalogBySlug[systemSlug];
  const sectorOrder = enterprise
    ? PRO_NETWORK_RECOMMENDATIONS_BY_SECTOR[enterprise.sectorLabel]?.order ?? []
    : [];
  const overrideOrder = PRO_NETWORK_OVERRIDES_BY_SYSTEM[systemSlug]?.order ?? [];
  const mergedOrder = [
    ...overrideOrder,
    ...sectorOrder,
    ...DEFAULT_PRO_NETWORK_ORDER,
  ] as DemaaProNetworkSlug[];

  const recommendedNetworks = uniqueOrderedNetworks(mergedOrder);

  if (recommendedNetworks.length) {
    return recommendedNetworks;
  }

  return [...demaaProNetworks].slice(0, MAX_PRO_NETWORKS_PER_SYSTEM);
}
