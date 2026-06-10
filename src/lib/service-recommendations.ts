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
  "expert-comptable",
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
  "cabinet-d-avocat": {
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
      "expert-comptable",
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
      "expert-comptable",
      "site-web",
      "marketing-vente",
      "structuration-automatisation",
      "assistant-polyvalent",
      "previsionnel-financier",
    ],
  },
  saas: {
    order: [
      "expert-comptable",
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
      "expert-comptable",
      "site-web",
      "publicite-google",
      "structuration-automatisation",
      "assistant-polyvalent",
      "previsionnel-financier",
    ],
  },
  artisanat: {
    order: [
      "expert-comptable",
      "site-web",
      "publicite-google",
      "structuration-automatisation",
      "assistant-polyvalent",
      "montage-video",
    ],
  },
  restaurant: {
    order: [
      "expert-comptable",
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
      "expert-comptable",
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
      "expert-comptable",
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
      "expert-comptable",
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
      "expert-comptable",
      "site-web",
      "publicite-google",
      "publicite-facebook-instagram",
      "assistant-polyvalent",
      "structuration-automatisation",
    ],
  },
  "institut-de-beaute": {
    order: [
      "expert-comptable",
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
      "expert-comptable",
      "site-web",
      "publicite-google",
      "publicite-facebook-instagram",
      "assistant-polyvalent",
      "montage-video",
    ],
  },
  "salle-de-sport": {
    order: [
      "expert-comptable",
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
      "expert-comptable",
      "site-web",
      "publicite-google",
      "structuration-automatisation",
      "assistant-polyvalent",
      "audit-conformite-fiscale",
    ],
  },
  "organisme-de-formation": {
    order: [
      "expert-comptable",
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
      "expert-comptable",
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
      "expert-comptable",
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
      "expert-comptable",
      "site-web",
      "montage-video",
      "publicite-facebook-instagram",
      "marketing-vente",
      "assistant-polyvalent",
    ],
  },
  "creation-de-contenu": {
    order: [
      "expert-comptable",
      "montage-video",
      "marketing-vente",
      "site-web",
      "publicite-tiktok",
      "assistant-polyvalent",
    ],
  },
  coaching: {
    order: [
      "expert-comptable",
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
      "expert-comptable",
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
      "expert-comptable",
      "site-web",
      "publicite-google",
      "structuration-automatisation",
      "assistant-polyvalent",
      "marketing-vente",
    ],
  },
  "garage-automobile": {
    order: [
      "expert-comptable",
      "site-web",
      "publicite-google",
      "structuration-automatisation",
      "assistant-polyvalent",
      "audit-conformite-fiscale",
    ],
  },
  "reparation-telephonique": {
    order: [
      "expert-comptable",
      "site-web",
      "publicite-google",
      "publicite-facebook-instagram",
      "assistant-polyvalent",
      "structuration-automatisation",
    ],
  },
  "transport-de-marchandise": {
    order: [
      "expert-comptable",
      "previsionnel-financier",
      "structuration-automatisation",
      "assistant-polyvalent",
      "site-web",
      "publicite-google",
    ],
  },
  "transport-de-personnes": {
    order: [
      "expert-comptable",
      "site-web",
      "publicite-google",
      "structuration-automatisation",
      "assistant-polyvalent",
      "previsionnel-financier",
    ],
  },
  demenagement: {
    order: [
      "expert-comptable",
      "site-web",
      "publicite-google",
      "structuration-automatisation",
      "assistant-polyvalent",
      "previsionnel-financier",
    ],
  },
  "livraison-dernier-kilometre": {
    order: [
      "expert-comptable",
      "previsionnel-financier",
      "structuration-automatisation",
      "assistant-polyvalent",
      "site-web",
    ],
  },
  "industrie-production": {
    order: [
      "expert-comptable",
      "previsionnel-financier",
      "structuration-automatisation",
      "assistant-polyvalent",
      "audit-conformite-fiscale",
      "site-web",
    ],
  },
  marketplace: {
    order: [
      "expert-comptable",
      "previsionnel-financier",
      "marketing-vente",
      "structuration-automatisation",
      "assistant-polyvalent",
      "publicite-google",
      "audit-conformite-fiscale",
    ],
  },
  "location-de-materiel": {
    order: [
      "expert-comptable",
      "site-web",
      "publicite-google",
      "structuration-automatisation",
      "assistant-polyvalent",
      "previsionnel-financier",
    ],
  },
  "securite-privee": {
    order: [
      "expert-comptable",
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
