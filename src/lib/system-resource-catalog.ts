import type { SystemKitPreview } from "@/lib/system-kit-previews";

export const SYSTEM_RESOURCE_SLUGS = [
  "tableau-pilotage-operationnel",
  "suivi-previsionnel-financier",
  "crm-suivi-commercial",
  "guide-obligations-fiscales-sociales-comptables",
  "guide-facturation-electronique",
  "guide-comment-ouvrir-un-restaurant",
  "guide-comment-gerer-un-restaurant",
] as const;

export type SystemResourceSlug = (typeof SYSTEM_RESOURCE_SLUGS)[number];

export type SystemResource = Readonly<{
  availability: "available" | "coming-soon";
  description: string;
  deliveryLabel?: string;
  format: "guide" | "template";
  formatLabel: string;
  preview: SystemKitPreview;
  previewDisclosure?: string;
  rank: number;
  readingMinutes?: number;
  resourceSlug: SystemResourceSlug;
  successDescription?: string;
  systemSlugs?: readonly string[];
  tagline?: string;
  title: string;
}>;

export const SYSTEM_RESOURCES: readonly SystemResource[] = Object.freeze([
  {
    availability: "available",
    description: "Un tableau simple pour suivre les priorités, les actions et les résultats de votre activité.",
    format: "template",
    formatLabel: "Tableau de pilotage",
    preview: {
      alt: "Aperçu du tableau de pilotage opérationnel avec des données d’exemple",
      height: 933,
      src: "/images/levier/levier-tableau-de-bord-preview.webp",
      width: 1400,
    },
    previewDisclosure:
      "Aperçu avec des données d’exemple. Votre copie sera vierge",
    rank: 1,
    resourceSlug: "tableau-pilotage-operationnel",
    title: "Tableau de pilotage opérationnel",
  },
  {
    availability: "available",
    description: "Un modèle pour suivre votre trésorerie, projeter les mois à venir et décider plus tôt.",
    format: "template",
    formatLabel: "Modèle financier",
    preview: {
      alt: "Aperçu du modèle de suivi et prévisionnel financier",
      height: 1890,
      src: "/images/academy/budget-1.png",
      width: 3360,
    },
    rank: 2,
    resourceSlug: "suivi-previsionnel-financier",
    title: "Suivi et prévisionnel financier",
  },
  {
    availability: "available",
    description: "Une base CRM pour centraliser les prospects, organiser les relances et suivre les opportunités.",
    format: "template",
    formatLabel: "Modèle CRM",
    preview: {
      alt: "Aperçu du modèle CRM de suivi commercial",
      height: 1890,
      src: "/images/academy/organisation-1.png",
      width: 3360,
    },
    rank: 3,
    resourceSlug: "crm-suivi-commercial",
    title: "CRM : suivi commercial",
  },
  {
    availability: "available",
    description: "La présentation d’origine pour comprendre les principales obligations et les finances de votre entreprise.",
    format: "guide",
    formatLabel: "Présentation",
    preview: {
      alt: "Aperçu de la présentation sur les obligations et les finances de l’entreprise",
      height: 1755,
      src: "/images/courses/obligations-finances/01.png",
      width: 3120,
    },
    rank: 1,
    readingMinutes: 2,
    resourceSlug: "guide-obligations-fiscales-sociales-comptables",
    tagline: "Naviguer dans la complexité",
    title: "Maîtriser les obligations et les finances de son entreprise",
  },
  {
    availability: "available",
    description: "La présentation d’origine pour comprendre ce que la réforme change pour votre entreprise.",
    format: "guide",
    formatLabel: "Présentation",
    preview: {
      alt: "Aperçu de la présentation sur la facturation électronique",
      height: 1755,
      src: "/images/courses/facturation-electronique/01.png",
      width: 3120,
    },
    rank: 2,
    readingMinutes: 3,
    resourceSlug: "guide-facturation-electronique",
    tagline: "Ce qui va vraiment changer pour votre entreprise",
    title: "La facturation électronique",
  },
  {
    availability: "coming-soon",
    description: "Un guide pratique pour ouvrir un restaurant : du concept au premier service.",
    format: "guide",
    formatLabel: "Présentation",
    preview: { alt: "Guide restaurant bientôt disponible", height: 1755, src: "/images/courses/obligations-finances/01.png", width: 3120 },
    rank: 3,
    resourceSlug: "guide-comment-ouvrir-un-restaurant",
    systemSlugs: ["restaurant"],
    tagline: "De l’idée au premier service",
    title: "Comment ouvrir un restaurant ?",
  },
  {
    availability: "coming-soon",
    description: "Un guide pratique pour gérer un restaurant : ventes, marge, équipe et stocks.",
    format: "guide",
    formatLabel: "Présentation",
    preview: { alt: "Guide restaurant bientôt disponible", height: 1755, src: "/images/courses/obligations-finances/01.png", width: 3120 },
    rank: 4,
    resourceSlug: "guide-comment-gerer-un-restaurant",
    systemSlugs: ["restaurant"],
    tagline: "Tenir la marge, service après service",
    title: "Comment gérer un restaurant ?",
  },
]);

export function getSystemResource(resourceSlug: string): SystemResource | null {
  return SYSTEM_RESOURCES.find((resource) => resource.resourceSlug === resourceSlug) ?? null;
}

export function getSystemResourcesForSystem(systemSlug: string): readonly SystemResource[] {
  return SYSTEM_RESOURCES.filter((resource) =>
    !resource.systemSlugs || resource.systemSlugs.includes(systemSlug),
  );
}
