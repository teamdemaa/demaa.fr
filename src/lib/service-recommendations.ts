import {
  getDemaaServiceBySlug,
  type DemaaService,
  type DemaaServiceSlug,
} from "@/lib/service-catalog";

type ServiceRecommendationRule = {
  order: readonly DemaaServiceSlug[];
};

const UNIVERSAL_SERVICE_SLUGS: readonly DemaaServiceSlug[] = [];

const DEFAULT_SERVICE_ORDER = [
  "site-web",
  "marketing-vente",
  "previsionnel-financier",
] satisfies DemaaServiceSlug[];

const MAX_SERVICES_PER_SYSTEM = 4;
const NON_RECOMMENDED_SERVICE_SLUGS = new Set<DemaaServiceSlug>([
  "assistante-facturation",
  "organisation-automatisation",
]);

const SERVICE_RECOMMENDATIONS_BY_SYSTEM: Record<string, ServiceRecommendationRule> = {
  "cabinet-comptable": {
    order: [
      "site-web",
      "marketing-vente",
      "organisation-automatisation",
      "assistante-facturation",
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
      "assistante-facturation",
      "montage-video",
    ],
  },
  "cabinet-de-conseil": {
    order: [
      "marketing-vente",
      "site-web",
      "organisation-automatisation",
      "assistante-facturation",
      "montage-video",
      "publicite-google",
    ],
  },
  notaire: {
    order: [
      "site-web",
      "organisation-automatisation",
      "assistante-facturation",
      "marketing-vente",
      "audit-conformite-fiscale",
    ],
  },
  "daf-externalise": {
    order: [
      "previsionnel-financier",
      "organisation-automatisation",
      "assistante-facturation",
      "site-web",
      "marketing-vente",
      "audit-conformite-fiscale",
    ],
  },
  "office-manager-externalise": {
    order: [
      "organisation-automatisation",
      "assistante-facturation",
      "site-web",
      "marketing-vente",
      "previsionnel-financier",
    ],
  },
  "assistant-administratif-externalise": {
    order: [
      "assistante-facturation",
      "organisation-automatisation",
      "site-web",
      "marketing-vente",
      "audit-conformite-fiscale",
    ],
  },
  "secretariat-externalise": {
    order: [
      "assistante-facturation",
      "organisation-automatisation",
      "site-web",
      "marketing-vente",
      "publicite-google",
    ],
  },
  "gestionnaire-paie-independant": {
    order: [
      "organisation-automatisation",
      "assistante-facturation",
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
      "assistante-facturation",
      "previsionnel-financier",
    ],
  },
  "centre-appels-support-client": {
    order: [
      "organisation-automatisation",
      "marketing-vente",
      "assistante-facturation",
      "site-web",
      "previsionnel-financier",
    ],
  },
  "societe-recouvrement": {
    order: [
      "organisation-automatisation",
      "site-web",
      "marketing-vente",
      "assistante-facturation",
      "audit-conformite-fiscale",
    ],
  },
  "centre-affaires-coworking": {
    order: [
      "site-web",
      "marketing-vente",
      "publicite-google",
      "organisation-automatisation",
      "assistante-facturation",
    ],
  },
  "cabinet-qhse-conformite": {
    order: [
      "site-web",
      "marketing-vente",
      "organisation-automatisation",
      "assistante-facturation",
      "audit-conformite-fiscale",
    ],
  },
  "bureau-etudes": {
    order: [
      "site-web",
      "marketing-vente",
      "organisation-automatisation",
      "assistante-facturation",
      "previsionnel-financier",
    ],
  },
  "cabinet-etudes": {
    order: [
      "site-web",
      "marketing-vente",
      "organisation-automatisation",
      "assistante-facturation",
      "previsionnel-financier",
    ],
  },
  "infogerance-informatique": {
    order: [
      "organisation-automatisation",
      "site-web",
      "marketing-vente",
      "assistante-facturation",
      "previsionnel-financier",
    ],
  },
  "cybersecurite-pme": {
    order: [
      "site-web",
      "marketing-vente",
      "organisation-automatisation",
      "assistante-facturation",
      "audit-conformite-fiscale",
    ],
  },
  "integrateur-crm-erp": {
    order: [
      "organisation-automatisation",
      "marketing-vente",
      "site-web",
      "assistante-facturation",
      "previsionnel-financier",
    ],
  },
  "consultant-data-bi": {
    order: [
      "organisation-automatisation",
      "marketing-vente",
      "site-web",
      "assistante-facturation",
      "previsionnel-financier",
    ],
  },
  "studio-branding-design": {
    order: [
      "marketing-vente",
      "site-web",
      "montage-video",
      "organisation-automatisation",
      "assistante-facturation",
    ],
  },
  syndic: {
    order: [
      "organisation-automatisation",
      "site-web",
      "assistante-facturation",
      "marketing-vente",
      "audit-conformite-fiscale",
    ],
  },
  "gestion-locative": {
    order: [
      "organisation-automatisation",
      "site-web",
      "assistante-facturation",
      "marketing-vente",
      "audit-conformite-fiscale",
    ],
  },
  freelance: {
    order: [
      "site-web",
      "marketing-vente",
      "organisation-automatisation",
      "assistante-facturation",
      "previsionnel-financier",
    ],
  },
  saas: {
    order: [
      "previsionnel-financier",
      "marketing-vente",
      "organisation-automatisation",
      "assistante-facturation",
      "publicite-google",
      "montage-video",
    ],
  },
  btp: {
    order: [
      "site-web",
      "publicite-google",
      "organisation-automatisation",
      "assistante-facturation",
      "previsionnel-financier",
    ],
  },
  artisanat: {
    order: [
      "site-web",
      "publicite-google",
      "organisation-automatisation",
      "assistante-facturation",
      "montage-video",
    ],
  },
  restaurant: {
    order: [
      "site-web",
      "publicite-google",
      "publicite-facebook-instagram",
      "organisation-automatisation",
      "assistante-facturation",
      "montage-video",
      "audit-conformite-fiscale",
    ],
  },
  boulangerie: {
    order: [
      "site-web",
      "publicite-google",
      "publicite-facebook-instagram",
      "assistante-facturation",
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
      "assistante-facturation",
    ],
  },
  "e-commerce": {
    order: [
      "marketing-vente",
      "publicite-facebook-instagram",
      "publicite-tiktok",
      "organisation-automatisation",
      "assistante-facturation",
      "previsionnel-financier",
      "audit-conformite-fiscale",
    ],
  },
  "commerce-de-detail": {
    order: [
      "site-web",
      "publicite-google",
      "publicite-facebook-instagram",
      "assistante-facturation",
      "organisation-automatisation",
    ],
  },
  "institut-de-beaute": {
    order: [
      "site-web",
      "publicite-google",
      "publicite-facebook-instagram",
      "montage-video",
      "assistante-facturation",
      "organisation-automatisation",
    ],
  },
  "salon-de-coiffure": {
    order: [
      "site-web",
      "publicite-google",
      "publicite-facebook-instagram",
      "assistante-facturation",
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
      "assistante-facturation",
    ],
  },
  "services-a-la-personne": {
    order: [
      "site-web",
      "publicite-google",
      "organisation-automatisation",
      "assistante-facturation",
      "audit-conformite-fiscale",
    ],
  },
  "organisme-de-formation": {
    order: [
      "site-web",
      "organisation-automatisation",
      "marketing-vente",
      "assistante-facturation",
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
      "assistante-facturation",
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
      "assistante-facturation",
    ],
  },
  "photographe-videaste": {
    order: [
      "site-web",
      "montage-video",
      "publicite-facebook-instagram",
      "marketing-vente",
      "assistante-facturation",
    ],
  },
  "creation-de-contenu": {
    order: [
      "montage-video",
      "marketing-vente",
      "site-web",
      "publicite-tiktok",
      "assistante-facturation",
    ],
  },
  "coach-professionnel": {
    order: [
      "marketing-vente",
      "site-web",
      "publicite-facebook-instagram",
      "montage-video",
      "organisation-automatisation",
      "assistante-facturation",
    ],
  },
  "agence-seo": {
    order: [
      "marketing-vente",
      "site-web",
      "organisation-automatisation",
      "assistante-facturation",
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
      "assistante-facturation",
    ],
  },
  "diagnostiqueur-immobilier": {
    order: [
      "site-web",
      "publicite-google",
      "organisation-automatisation",
      "assistante-facturation",
      "audit-conformite-fiscale",
    ],
  },
  geometre: {
    order: [
      "site-web",
      "organisation-automatisation",
      "marketing-vente",
      "assistante-facturation",
      "previsionnel-financier",
    ],
  },
  "architecte-maitre-oeuvre": {
    order: [
      "site-web",
      "marketing-vente",
      "organisation-automatisation",
      "assistante-facturation",
      "previsionnel-financier",
    ],
  },
  "courtier-credit-assurance": {
    order: [
      "marketing-vente",
      "site-web",
      "organisation-automatisation",
      "assistante-facturation",
      "previsionnel-financier",
    ],
  },
  "auto-ecole": {
    order: [
      "site-web",
      "marketing-vente",
      "publicite-google",
      "organisation-automatisation",
      "assistante-facturation",
    ],
  },
  "gestionnaire-de-patrimoine": {
    order: [
      "marketing-vente",
      "site-web",
      "organisation-automatisation",
      "assistante-facturation",
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
      "assistante-facturation",
    ],
  },
  "nettoyage-professionnel": {
    order: [
      "site-web",
      "publicite-google",
      "organisation-automatisation",
      "assistante-facturation",
      "marketing-vente",
    ],
  },
  "garage-automobile": {
    order: [
      "site-web",
      "publicite-google",
      "organisation-automatisation",
      "assistante-facturation",
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
      "assistante-facturation",
    ],
  },
  "reparation-informatique-mobile": {
    order: [
      "site-web",
      "publicite-google",
      "publicite-facebook-instagram",
      "assistante-facturation",
      "organisation-automatisation",
    ],
  },
  "transport-de-marchandise": {
    order: [
      "previsionnel-financier",
      "organisation-automatisation",
      "assistante-facturation",
      "site-web",
      "publicite-google",
    ],
  },
  "transport-de-personnes": {
    order: [
      "site-web",
      "publicite-google",
      "organisation-automatisation",
      "assistante-facturation",
      "previsionnel-financier",
    ],
  },
  demenagement: {
    order: [
      "site-web",
      "publicite-google",
      "organisation-automatisation",
      "assistante-facturation",
      "previsionnel-financier",
    ],
  },
  "livraison-dernier-kilometre": {
    order: [
      "previsionnel-financier",
      "organisation-automatisation",
      "assistante-facturation",
      "site-web",
    ],
  },
  "production-industrie": {
    order: [
      "previsionnel-financier",
      "organisation-automatisation",
      "assistante-facturation",
      "audit-conformite-fiscale",
      "site-web",
    ],
  },
  marketplace: {
    order: [
      "previsionnel-financier",
      "marketing-vente",
      "organisation-automatisation",
      "assistante-facturation",
      "publicite-google",
      "audit-conformite-fiscale",
    ],
  },
  "entreprise-de-securite": {
    order: [
      "site-web",
      "publicite-google",
      "organisation-automatisation",
      "assistante-facturation",
    ],
  },
};

export function getRecommendedServicesForSystem(systemSlug: string): DemaaService[] {
  const rule = SERVICE_RECOMMENDATIONS_BY_SYSTEM[systemSlug];
  const dedupedOrder = (rule?.order ?? DEFAULT_SERVICE_ORDER).filter(
    (slug, index, list) =>
      list.indexOf(slug) === index && !NON_RECOMMENDED_SERVICE_SLUGS.has(slug)
  );
  const specificServiceSlugs = dedupedOrder.filter(
    (slug) => !UNIVERSAL_SERVICE_SLUGS.includes(slug)
  );
  const universalServiceSlugs = UNIVERSAL_SERVICE_SLUGS.filter(
    (slug) =>
      dedupedOrder.includes(slug) ||
      (!rule && DEFAULT_SERVICE_ORDER.includes(slug))
  );
  const recommended = [...universalServiceSlugs, ...specificServiceSlugs]
    .slice(0, MAX_SERVICES_PER_SYSTEM)
    .map((slug) => getDemaaServiceBySlug(slug))
    .filter((service): service is DemaaService => Boolean(service));

  if (recommended.length) {
    return recommended;
  }

  return DEFAULT_SERVICE_ORDER
    .filter((slug) => !NON_RECOMMENDED_SERVICE_SLUGS.has(slug))
    .slice(0, MAX_SERVICES_PER_SYSTEM)
    .map((slug) => getDemaaServiceBySlug(slug))
    .filter((service): service is DemaaService => Boolean(service));
}
