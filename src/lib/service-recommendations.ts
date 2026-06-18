import {
  getDemaaServiceBySlug,
  type DemaaService,
  type DemaaServiceSlug,
} from "@/lib/service-catalog";

type ServiceRecommendationRule = {
  order: readonly DemaaServiceSlug[];
};

const SYSTEM_VISIBLE_SERVICE_SLUGS = [
  "organisation-automatisation",
  "assistant-polyvalent",
] satisfies DemaaServiceSlug[];

const DEFAULT_SERVICE_ORDER = [
  "organisation-automatisation",
  "assistant-polyvalent",
] satisfies DemaaServiceSlug[];

const SERVICE_RECOMMENDATIONS_BY_SYSTEM: Record<string, ServiceRecommendationRule> = {
  "cabinet-comptable": {
    order: [
      "site-web",
      "marketing-vente",
      "organisation-automatisation",
      "assistant-polyvalent",
      "montage-video",
      "publicite-google",
    ],
  },
  "cabinet-davocat": {
    order: [
      "site-web",
      "publicite-google",
      "marketing-vente",
      "organisation-automatisation",
      "assistant-polyvalent",
      "montage-video",
    ],
  },
  "cabinet-de-conseil": {
    order: [
      "marketing-vente",
      "site-web",
      "organisation-automatisation",
      "assistant-polyvalent",
      "montage-video",
      "publicite-google",
    ],
  },
  notaire: {
    order: [
      "site-web",
      "organisation-automatisation",
      "assistant-polyvalent",
      "marketing-vente",
      "audit-conformite-fiscale",
    ],
  },
  "daf-externalise": {
    order: [
      "previsionnel-financier",
      "organisation-automatisation",
      "assistant-polyvalent",
      "site-web",
      "marketing-vente",
      "audit-conformite-fiscale",
    ],
  },
  "office-manager-externalise": {
    order: [
      "organisation-automatisation",
      "assistant-polyvalent",
      "site-web",
      "marketing-vente",
      "previsionnel-financier",
    ],
  },
  "assistant-administratif-externalise": {
    order: [
      "assistant-polyvalent",
      "organisation-automatisation",
      "site-web",
      "marketing-vente",
      "audit-conformite-fiscale",
    ],
  },
  "secretariat-externalise": {
    order: [
      "assistant-polyvalent",
      "organisation-automatisation",
      "site-web",
      "marketing-vente",
      "publicite-google",
    ],
  },
  "gestionnaire-paie-independant": {
    order: [
      "organisation-automatisation",
      "assistant-polyvalent",
      "audit-conformite-fiscale",
      "previsionnel-financier",
      "site-web",
    ],
  },
  "cabinet-rh-externalise": {
    order: [
      "marketing-vente",
      "site-web",
      "organisation-automatisation",
      "assistant-polyvalent",
      "previsionnel-financier",
    ],
  },
  "centre-appels-support-client": {
    order: [
      "organisation-automatisation",
      "marketing-vente",
      "assistant-polyvalent",
      "site-web",
      "previsionnel-financier",
    ],
  },
  "societe-recouvrement": {
    order: [
      "organisation-automatisation",
      "site-web",
      "marketing-vente",
      "assistant-polyvalent",
      "audit-conformite-fiscale",
    ],
  },
  "societe-domiciliation": {
    order: [
      "organisation-automatisation",
      "site-web",
      "marketing-vente",
      "assistant-polyvalent",
      "audit-conformite-fiscale",
    ],
  },
  "centre-affaires-coworking": {
    order: [
      "site-web",
      "marketing-vente",
      "publicite-google",
      "organisation-automatisation",
      "assistant-polyvalent",
    ],
  },
  "cabinet-qhse-conformite": {
    order: [
      "site-web",
      "marketing-vente",
      "organisation-automatisation",
      "assistant-polyvalent",
      "audit-conformite-fiscale",
    ],
  },
  "bureau-etudes": {
    order: [
      "site-web",
      "marketing-vente",
      "organisation-automatisation",
      "assistant-polyvalent",
      "previsionnel-financier",
    ],
  },
  "cabinet-etudes": {
    order: [
      "site-web",
      "marketing-vente",
      "organisation-automatisation",
      "assistant-polyvalent",
      "previsionnel-financier",
    ],
  },
  "infogerance-informatique": {
    order: [
      "organisation-automatisation",
      "site-web",
      "marketing-vente",
      "assistant-polyvalent",
      "previsionnel-financier",
    ],
  },
  "cybersecurite-pme": {
    order: [
      "site-web",
      "marketing-vente",
      "organisation-automatisation",
      "assistant-polyvalent",
      "audit-conformite-fiscale",
    ],
  },
  "integrateur-crm-erp": {
    order: [
      "organisation-automatisation",
      "marketing-vente",
      "site-web",
      "assistant-polyvalent",
      "previsionnel-financier",
    ],
  },
  "consultant-data-bi": {
    order: [
      "organisation-automatisation",
      "marketing-vente",
      "site-web",
      "assistant-polyvalent",
      "previsionnel-financier",
    ],
  },
  "studio-branding-design": {
    order: [
      "marketing-vente",
      "site-web",
      "montage-video",
      "organisation-automatisation",
      "assistant-polyvalent",
    ],
  },
  syndic: {
    order: [
      "organisation-automatisation",
      "site-web",
      "assistant-polyvalent",
      "marketing-vente",
      "audit-conformite-fiscale",
    ],
  },
  "gestion-locative": {
    order: [
      "organisation-automatisation",
      "site-web",
      "assistant-polyvalent",
      "marketing-vente",
      "audit-conformite-fiscale",
    ],
  },
  freelance: {
    order: [
      "site-web",
      "marketing-vente",
      "organisation-automatisation",
      "assistant-polyvalent",
      "previsionnel-financier",
    ],
  },
  saas: {
    order: [
      "previsionnel-financier",
      "marketing-vente",
      "organisation-automatisation",
      "assistant-polyvalent",
      "publicite-google",
      "montage-video",
    ],
  },
  btp: {
    order: [
      "site-web",
      "publicite-google",
      "organisation-automatisation",
      "assistant-polyvalent",
      "previsionnel-financier",
    ],
  },
  artisanat: {
    order: [
      "site-web",
      "publicite-google",
      "organisation-automatisation",
      "assistant-polyvalent",
      "montage-video",
    ],
  },
  restaurant: {
    order: [
      "site-web",
      "publicite-google",
      "publicite-facebook-instagram",
      "organisation-automatisation",
      "assistant-polyvalent",
      "montage-video",
      "audit-conformite-fiscale",
    ],
  },
  boulangerie: {
    order: [
      "site-web",
      "publicite-google",
      "publicite-facebook-instagram",
      "assistant-polyvalent",
      "montage-video",
      "organisation-automatisation",
    ],
  },
  traiteur: {
    order: [
      "site-web",
      "publicite-google",
      "montage-video",
      "marketing-vente",
      "organisation-automatisation",
      "assistant-polyvalent",
    ],
  },
  "e-commerce": {
    order: [
      "marketing-vente",
      "publicite-facebook-instagram",
      "publicite-tiktok",
      "organisation-automatisation",
      "assistant-polyvalent",
      "previsionnel-financier",
      "audit-conformite-fiscale",
    ],
  },
  "commerce-de-detail": {
    order: [
      "site-web",
      "publicite-google",
      "publicite-facebook-instagram",
      "assistant-polyvalent",
      "organisation-automatisation",
    ],
  },
  "institut-de-beaute": {
    order: [
      "site-web",
      "publicite-google",
      "publicite-facebook-instagram",
      "montage-video",
      "assistant-polyvalent",
      "organisation-automatisation",
    ],
  },
  "salon-de-coiffure": {
    order: [
      "site-web",
      "publicite-google",
      "publicite-facebook-instagram",
      "assistant-polyvalent",
      "montage-video",
    ],
  },
  "salle-de-sport": {
    order: [
      "site-web",
      "marketing-vente",
      "publicite-facebook-instagram",
      "montage-video",
      "organisation-automatisation",
      "assistant-polyvalent",
    ],
  },
  "services-a-la-personne": {
    order: [
      "site-web",
      "publicite-google",
      "organisation-automatisation",
      "assistant-polyvalent",
      "audit-conformite-fiscale",
    ],
  },
  "organisme-de-formation": {
    order: [
      "site-web",
      "organisation-automatisation",
      "marketing-vente",
      "assistant-polyvalent",
      "audit-conformite-fiscale",
      "montage-video",
    ],
  },
  "formation-en-ligne": {
    order: [
      "marketing-vente",
      "montage-video",
      "publicite-facebook-instagram",
      "organisation-automatisation",
      "assistant-polyvalent",
      "site-web",
    ],
  },
  evenementiel: {
    order: [
      "site-web",
      "montage-video",
      "publicite-facebook-instagram",
      "marketing-vente",
      "organisation-automatisation",
      "assistant-polyvalent",
    ],
  },
  "photographe-videaste": {
    order: [
      "site-web",
      "montage-video",
      "publicite-facebook-instagram",
      "marketing-vente",
      "assistant-polyvalent",
    ],
  },
  "creation-de-contenu": {
    order: [
      "montage-video",
      "marketing-vente",
      "site-web",
      "publicite-tiktok",
      "assistant-polyvalent",
    ],
  },
  "coach-professionnel": {
    order: [
      "marketing-vente",
      "site-web",
      "publicite-facebook-instagram",
      "montage-video",
      "organisation-automatisation",
      "assistant-polyvalent",
    ],
  },
  "agence-seo": {
    order: [
      "marketing-vente",
      "site-web",
      "organisation-automatisation",
      "assistant-polyvalent",
      "publicite-google",
      "montage-video",
    ],
  },
  "agence-acquisition-paid-ads": {
    order: [
      "marketing-vente",
      "publicite-google",
      "publicite-facebook-instagram",
      "publicite-tiktok",
      "organisation-automatisation",
      "assistant-polyvalent",
    ],
  },
  "diagnostiqueur-immobilier": {
    order: [
      "site-web",
      "publicite-google",
      "organisation-automatisation",
      "assistant-polyvalent",
      "audit-conformite-fiscale",
    ],
  },
  geometre: {
    order: [
      "site-web",
      "organisation-automatisation",
      "marketing-vente",
      "assistant-polyvalent",
      "previsionnel-financier",
    ],
  },
  "architecte-maitre-oeuvre": {
    order: [
      "site-web",
      "marketing-vente",
      "organisation-automatisation",
      "assistant-polyvalent",
      "previsionnel-financier",
    ],
  },
  "courtier-credit-assurance": {
    order: [
      "marketing-vente",
      "site-web",
      "organisation-automatisation",
      "assistant-polyvalent",
      "previsionnel-financier",
    ],
  },
  "auto-ecole": {
    order: [
      "site-web",
      "marketing-vente",
      "publicite-google",
      "organisation-automatisation",
      "assistant-polyvalent",
    ],
  },
  "gestionnaire-de-patrimoine": {
    order: [
      "marketing-vente",
      "site-web",
      "organisation-automatisation",
      "assistant-polyvalent",
      "previsionnel-financier",
    ],
  },
  "agence-immobiliere": {
    order: [
      "site-web",
      "publicite-google",
      "montage-video",
      "marketing-vente",
      "organisation-automatisation",
      "assistant-polyvalent",
    ],
  },
  "nettoyage-professionnel": {
    order: [
      "site-web",
      "publicite-google",
      "organisation-automatisation",
      "assistant-polyvalent",
      "marketing-vente",
    ],
  },
  "garage-automobile": {
    order: [
      "site-web",
      "publicite-google",
      "organisation-automatisation",
      "assistant-polyvalent",
      "audit-conformite-fiscale",
    ],
  },
  "coach-sportif": {
    order: [
      "marketing-vente",
      "site-web",
      "publicite-facebook-instagram",
      "montage-video",
      "organisation-automatisation",
      "assistant-polyvalent",
    ],
  },
  "reparation-informatique-mobile": {
    order: [
      "site-web",
      "publicite-google",
      "publicite-facebook-instagram",
      "assistant-polyvalent",
      "organisation-automatisation",
    ],
  },
  "transport-de-marchandise": {
    order: [
      "previsionnel-financier",
      "organisation-automatisation",
      "assistant-polyvalent",
      "site-web",
      "publicite-google",
    ],
  },
  "transport-de-personnes": {
    order: [
      "site-web",
      "publicite-google",
      "organisation-automatisation",
      "assistant-polyvalent",
      "previsionnel-financier",
    ],
  },
  demenagement: {
    order: [
      "site-web",
      "publicite-google",
      "organisation-automatisation",
      "assistant-polyvalent",
      "previsionnel-financier",
    ],
  },
  "livraison-dernier-kilometre": {
    order: [
      "previsionnel-financier",
      "organisation-automatisation",
      "assistant-polyvalent",
      "site-web",
    ],
  },
  "production-industrie": {
    order: [
      "previsionnel-financier",
      "organisation-automatisation",
      "assistant-polyvalent",
      "audit-conformite-fiscale",
      "site-web",
    ],
  },
  marketplace: {
    order: [
      "previsionnel-financier",
      "marketing-vente",
      "organisation-automatisation",
      "assistant-polyvalent",
      "publicite-google",
      "audit-conformite-fiscale",
    ],
  },
  "entreprise-de-securite": {
    order: [
      "site-web",
      "publicite-google",
      "organisation-automatisation",
      "assistant-polyvalent",
    ],
  },
};

export function getRecommendedServicesForSystem(systemSlug: string): DemaaService[] {
  const rule = SERVICE_RECOMMENDATIONS_BY_SYSTEM[systemSlug];
  const order = (rule?.order ?? DEFAULT_SERVICE_ORDER).filter(
    (slug, index, list) =>
      SYSTEM_VISIBLE_SERVICE_SLUGS.includes(slug) && list.indexOf(slug) === index
  );
  const recommended = order
    .map((slug) => getDemaaServiceBySlug(slug))
    .filter((service): service is DemaaService => Boolean(service));

  if (recommended.length) {
    return recommended;
  }

  return SYSTEM_VISIBLE_SERVICE_SLUGS
    .map((slug) => getDemaaServiceBySlug(slug))
    .filter((service): service is DemaaService => Boolean(service));
}
