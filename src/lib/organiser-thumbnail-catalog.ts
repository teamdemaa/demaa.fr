export const ORGANISER_THUMBNAIL_COLORS = {
  background: "#F1F3F0",
  border: "#ECEEED",
  forest: "#315F46",
  muted: "#6F756E",
} as const;

export const ORGANISER_THUMBNAIL_SIZE = {
  height: 720,
  width: 1280,
} as const;

export type OrganiserThumbnailIllustration =
  | "accounting-requests"
  | "agency-mission"
  | "business-app-profitability"
  | "carpentry-project"
  | "electronic-invoice"
  | "excel-to-software"
  | "garage-customer-journey"
  | "multichannel-inbox"
  | "plumbing-workflow"
  | "recurring-cleaning"
  | "renovation-quotes"
  | "restaurant-stock"
  | "software-choice"
  | "technician-planning"
  | "training-administration"
  | "work-order-to-invoice";

export type OrganiserThumbnailDefinition = Readonly<{
  fontSize: number;
  illustration: OrganiserThumbnailIllustration;
  lines: readonly [string, string?, string?];
  secondary?: string;
  slug: string;
}>;

const ORGANISER_THUMBNAILS: readonly OrganiserThumbnailDefinition[] = [
  {
    slug: "facturation-electronique",
    lines: ["Facturation électronique :", "l’essentiel"],
    secondary: "2026 → 2027",
    illustration: "electronic-invoice",
    fontSize: 82,
  },
  {
    slug: "organiser-entreprise-plomberie",
    lines: ["Comment organiser une", "entreprise de", "plomberie"],
    illustration: "plumbing-workflow",
    fontSize: 75,
  },
  {
    slug: "demandes-clients-cabinet-comptable",
    lines: ["Comment organiser les", "demandes clients d’un", "cabinet comptable"],
    illustration: "accounting-requests",
    fontSize: 72,
  },
  {
    slug: "organiser-demandes-devis-renovation",
    lines: ["Comment organiser les", "demandes de devis d’une", "entreprise de rénovation"],
    illustration: "renovation-quotes",
    fontSize: 67,
  },
  {
    slug: "organiser-chantier-menuiserie",
    lines: ["Comment organiser un", "chantier de menuiserie"],
    illustration: "carpentry-project",
    fontSize: 80,
  },
  {
    slug: "organiser-interventions-nettoyage",
    lines: ["Comment organiser les", "interventions récurrentes", "d’une société de nettoyage"],
    illustration: "recurring-cleaning",
    fontSize: 66,
  },
  {
    slug: "organiser-parcours-client-garage",
    lines: ["Comment organiser", "le parcours client", "d’un garage"],
    illustration: "garage-customer-journey",
    fontSize: 70,
  },
  {
    slug: "organiser-commandes-stocks-restaurant",
    lines: ["Comment organiser les", "commandes et les stocks", "d’un restaurant"],
    illustration: "restaurant-stock",
    fontSize: 70,
  },
  {
    slug: "organiser-suivi-administratif-formation",
    lines: ["Comment organiser le", "suivi administratif d’un", "organisme de formation"],
    illustration: "training-administration",
    fontSize: 68,
  },
  {
    slug: "organiser-mission-agence",
    lines: ["Comment organiser", "une mission", "d’agence"],
    illustration: "agency-mission",
    fontSize: 76,
  },
  {
    slug: "centraliser-demandes-telephone-sms-whatsapp",
    lines: ["Comment centraliser les", "demandes reçues par téléphone,", "SMS et WhatsApp ?"],
    illustration: "multichannel-inbox",
    fontSize: 60,
  },
  {
    slug: "organiser-planning-plusieurs-techniciens",
    lines: ["Comment organiser le", "planning de plusieurs", "techniciens ?"],
    illustration: "technician-planning",
    fontSize: 74,
  },
  {
    slug: "bon-intervention-facture-sans-ressaisie",
    lines: ["Comment passer d’un bon", "d’intervention à la facture", "sans ressaisie ?"],
    illustration: "work-order-to-invoice",
    fontSize: 68,
  },
  {
    slug: "quel-logiciel-quand-excel-ne-suffit-plus",
    lines: ["Quel logiciel choisir", "quand Excel ne suffit plus ?"],
    illustration: "excel-to-software",
    fontSize: 74,
  },
  {
    slug: "rentabilite-application-metier",
    lines: ["À partir de quand", "une application métier", "devient-elle rentable ?"],
    illustration: "business-app-profitability",
    fontSize: 65,
  },
  {
    slug: "logiciel-existant-ou-application-metier",
    lines: ["Faut-il choisir un logiciel", "existant ou construire", "son propre outil ?"],
    illustration: "software-choice",
    fontSize: 68,
  },
] as const;

const organiserThumbnailBySlug = new Map(
  ORGANISER_THUMBNAILS.map((thumbnail) => [thumbnail.slug, thumbnail]),
);

export function getAllOrganiserThumbnails() {
  return ORGANISER_THUMBNAILS;
}

export function getOrganiserThumbnail(slug: string) {
  return organiserThumbnailBySlug.get(slug) ?? null;
}

export function getOrganiserThumbnailPath(slug: string) {
  return getOrganiserThumbnail(slug)
    ? `/images/organiser/thumbnails/${slug}.png`
    : null;
}
