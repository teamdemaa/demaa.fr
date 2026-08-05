import type { SystemKitPreview } from "@/lib/system-kit-previews";

export const SYSTEM_RESOURCE_SLUGS = [
  "tableau-pilotage-operationnel",
  "suivi-previsionnel-financier",
  "crm-suivi-commercial",
  "guide-facturation-electronique",
  "guide-obligations-fiscales-sociales-comptables",
] as const;

export type SystemResourceSlug = (typeof SYSTEM_RESOURCE_SLUGS)[number];

export type SystemResource = Readonly<{
  description: string;
  deliveryLabel: string;
  formatLabel: string;
  preview: SystemKitPreview;
  previewDisclosure: string;
  rank: number;
  resourceSlug: SystemResourceSlug;
  successDescription: string;
  title: string;
}>;

export const SYSTEM_RESOURCES: readonly SystemResource[] = Object.freeze([
  {
    description: "Un tableau simple pour suivre les priorités, les actions et les résultats de votre activité.",
    deliveryLabel: "Recevoir le tableau",
    formatLabel: "Tableau de pilotage",
    preview: {
      alt: "Aperçu du tableau de pilotage opérationnel avec des données d’exemple",
      height: 933,
      src: "/images/levier/levier-tableau-de-bord-preview.webp",
      width: 1400,
    },
    previewDisclosure: "Aperçu avec des données d’exemple. Votre copie sera vierge et prête à compléter.",
    rank: 1,
    resourceSlug: "tableau-pilotage-operationnel",
    successDescription: "Vous y trouverez le lien pour créer votre copie personnelle. Pensez à vérifier vos courriers indésirables.",
    title: "Tableau de pilotage opérationnel",
  },
  {
    description: "Un modèle pour suivre votre trésorerie, projeter les mois à venir et décider plus tôt.",
    deliveryLabel: "Recevoir le modèle",
    formatLabel: "Modèle financier",
    preview: {
      alt: "Aperçu du modèle de suivi et prévisionnel financier",
      height: 1890,
      src: "/images/academy/budget-1.png",
      width: 3360,
    },
    previewDisclosure: "Aperçu du modèle. Le lien reçu vous permettra de créer votre propre copie.",
    rank: 2,
    resourceSlug: "suivi-previsionnel-financier",
    successDescription: "Vous y trouverez le lien vers le modèle financier. Pensez à vérifier vos courriers indésirables.",
    title: "Suivi et prévisionnel financier",
  },
  {
    description: "Une base CRM pour centraliser les prospects, organiser les relances et suivre les opportunités.",
    deliveryLabel: "Recevoir le CRM",
    formatLabel: "Modèle CRM",
    preview: {
      alt: "Aperçu du modèle CRM de suivi commercial",
      height: 1890,
      src: "/images/academy/organisation-1.png",
      width: 3360,
    },
    previewDisclosure: "Aperçu de la structure CRM. Le lien reçu vous permettra d’utiliser le modèle Airtable.",
    rank: 3,
    resourceSlug: "crm-suivi-commercial",
    successDescription: "Vous y trouverez le lien vers le modèle CRM. Pensez à vérifier vos courriers indésirables.",
    title: "CRM - suivi commercial",
  },
  {
    description: "Un guide pratique pour comprendre la réforme et préparer votre organisation.",
    deliveryLabel: "Recevoir le guide",
    formatLabel: "Guide pratique",
    preview: {
      alt: "Aperçu du guide de la facturation électronique",
      height: 1755,
      src: "/images/courses/facturation-electronique/01.png",
      width: 3120,
    },
    previewDisclosure: "Aperçu du guide. Le document complet inclut le support et une checklist opérationnelle.",
    rank: 4,
    resourceSlug: "guide-facturation-electronique",
    successDescription: "Vous y trouverez le lien de téléchargement du guide. Pensez à vérifier vos courriers indésirables.",
    title: "Guide de la facturation électronique",
  },
  {
    description: "Un repère synthétique pour clarifier les principales obligations de votre entreprise.",
    deliveryLabel: "Recevoir le guide",
    formatLabel: "Guide pratique",
    preview: {
      alt: "Aperçu du guide des obligations fiscales, sociales et comptables",
      height: 1755,
      src: "/images/courses/obligations-finances/01.png",
      width: 3120,
    },
    previewDisclosure: "Aperçu du guide. Vérifiez toujours les règles applicables à votre situation avec le professionnel compétent.",
    rank: 5,
    resourceSlug: "guide-obligations-fiscales-sociales-comptables",
    successDescription: "Vous y trouverez le lien de téléchargement du guide. Pensez à vérifier vos courriers indésirables.",
    title: "Guide des obligations fiscales, sociales et comptables",
  },
]);

export function getSystemResource(resourceSlug: string): SystemResource | null {
  return SYSTEM_RESOURCES.find((resource) => resource.resourceSlug === resourceSlug) ?? null;
}
