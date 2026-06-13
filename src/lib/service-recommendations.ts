import {
  demaaServices,
  getDemaaServiceBySlug,
  type DemaaService,
  type DemaaServiceSlug,
} from "@/lib/service-catalog";

type ServiceRecommendationRule = {
  order: readonly DemaaServiceSlug[];
};

const DEFAULT_SERVICE_ORDER = [
  "site-web",
  "marketing-vente",
  "structuration-automatisation",
  "assistant-polyvalent",
  "publicite-google",
] satisfies DemaaServiceSlug[];

const SERVICE_RECOMMENDATIONS_BY_SYSTEM: Record<string, ServiceRecommendationRule> = {
  "cabinet-comptable": {
    order: [
      "site-web",
      "marketing-vente",
      "structuration-automatisation",
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
      "structuration-automatisation",
      "assistant-polyvalent",
      "montage-video",
    ],
  },
  "cabinet-de-conseil": {
    order: [
      "marketing-vente",
      "site-web",
      "structuration-automatisation",
      "assistant-polyvalent",
      "montage-video",
      "publicite-google",
    ],
  },
  freelance: {
    order: [
      "site-web",
      "marketing-vente",
      "structuration-automatisation",
      "assistant-polyvalent",
      "previsionnel-financier",
    ],
  },
  saas: {
    order: [
      "previsionnel-financier",
      "marketing-vente",
      "structuration-automatisation",
      "assistant-polyvalent",
      "publicite-google",
      "montage-video",
    ],
  },
  btp: {
    order: [
      "site-web",
      "publicite-google",
      "structuration-automatisation",
      "assistant-polyvalent",
      "previsionnel-financier",
    ],
  },
  artisanat: {
    order: [
      "site-web",
      "publicite-google",
      "structuration-automatisation",
      "assistant-polyvalent",
      "montage-video",
    ],
  },
  restaurant: {
    order: [
      "site-web",
      "publicite-google",
      "publicite-facebook-instagram",
      "structuration-automatisation",
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
      "structuration-automatisation",
    ],
  },
  traiteur: {
    order: [
      "site-web",
      "publicite-google",
      "montage-video",
      "marketing-vente",
      "structuration-automatisation",
      "assistant-polyvalent",
    ],
  },
  "e-commerce": {
    order: [
      "marketing-vente",
      "publicite-facebook-instagram",
      "publicite-tiktok",
      "structuration-automatisation",
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
      "structuration-automatisation",
    ],
  },
  "institut-de-beaute": {
    order: [
      "site-web",
      "publicite-google",
      "publicite-facebook-instagram",
      "montage-video",
      "assistant-polyvalent",
      "structuration-automatisation",
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
      "structuration-automatisation",
      "assistant-polyvalent",
    ],
  },
  "services-a-la-personne": {
    order: [
      "site-web",
      "publicite-google",
      "structuration-automatisation",
      "assistant-polyvalent",
      "audit-conformite-fiscale",
    ],
  },
  "organisme-de-formation": {
    order: [
      "site-web",
      "structuration-automatisation",
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
      "structuration-automatisation",
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
      "structuration-automatisation",
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
      "structuration-automatisation",
      "assistant-polyvalent",
    ],
  },
  "agence-immobiliere": {
    order: [
      "site-web",
      "publicite-google",
      "montage-video",
      "marketing-vente",
      "structuration-automatisation",
      "assistant-polyvalent",
    ],
  },
  "nettoyage-professionnel": {
    order: [
      "site-web",
      "publicite-google",
      "structuration-automatisation",
      "assistant-polyvalent",
      "marketing-vente",
    ],
  },
  "garage-automobile": {
    order: [
      "site-web",
      "publicite-google",
      "structuration-automatisation",
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
      "structuration-automatisation",
      "assistant-polyvalent",
    ],
  },
  "reparation-informatique-mobile": {
    order: [
      "site-web",
      "publicite-google",
      "publicite-facebook-instagram",
      "assistant-polyvalent",
      "structuration-automatisation",
    ],
  },
  "transport-de-marchandise": {
    order: [
      "previsionnel-financier",
      "structuration-automatisation",
      "assistant-polyvalent",
      "site-web",
      "publicite-google",
    ],
  },
  "transport-de-personnes": {
    order: [
      "site-web",
      "publicite-google",
      "structuration-automatisation",
      "assistant-polyvalent",
      "previsionnel-financier",
    ],
  },
  demenagement: {
    order: [
      "site-web",
      "publicite-google",
      "structuration-automatisation",
      "assistant-polyvalent",
      "previsionnel-financier",
    ],
  },
  "livraison-dernier-kilometre": {
    order: [
      "previsionnel-financier",
      "structuration-automatisation",
      "assistant-polyvalent",
      "site-web",
    ],
  },
  "production-industrie": {
    order: [
      "previsionnel-financier",
      "structuration-automatisation",
      "assistant-polyvalent",
      "audit-conformite-fiscale",
      "site-web",
    ],
  },
  marketplace: {
    order: [
      "previsionnel-financier",
      "marketing-vente",
      "structuration-automatisation",
      "assistant-polyvalent",
      "publicite-google",
      "audit-conformite-fiscale",
    ],
  },
  "entreprise-de-securite": {
    order: [
      "site-web",
      "publicite-google",
      "structuration-automatisation",
      "assistant-polyvalent",
    ],
  },
};

export function getRecommendedServicesForSystem(systemSlug: string): DemaaService[] {
  const rule = SERVICE_RECOMMENDATIONS_BY_SYSTEM[systemSlug];
  const order = [
    "structuration-automatisation",
    ...(rule?.order ?? DEFAULT_SERVICE_ORDER),
  ].filter((slug, index, list) => list.indexOf(slug) === index);
  const recommended = order
    .map((slug) => getDemaaServiceBySlug(slug))
    .filter((service): service is DemaaService => Boolean(service));

  return recommended.length ? recommended : [...demaaServices.slice(0, 6)];
}
