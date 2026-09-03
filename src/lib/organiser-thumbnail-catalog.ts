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
  | "work-order-to-invoice"
  | "urgent-workflow"
  | "task-consolidation"
  | "meeting-decisions"
  | "team-autonomy"
  | "document-search"
  | "recurring-reporting"
  | "team-followup"
  | "dossier-progress"
  | "client-request"
  | "shared-method"
  | "business-continuity"
  | "resilient-planning"
  | "duplicate-entry"
  | "knowledge-transfer"
  | "useful-dashboard"
  | "employee-onboarding";

export type OrganiserThumbnailDefinition = Readonly<{
  fontSize: number;
  illustration: OrganiserThumbnailIllustration;
  lines: readonly [string, string?, string?];
  secondary?: string;
  slug: string;
}>;

const ORGANISER_THUMBNAILS: readonly OrganiserThumbnailDefinition[] = [
  {
    slug: "preparer-devis-propositions-commerciales",
    lines: ["Mes devis prennent", "trop de temps"],
    illustration: "renovation-quotes",
    fontSize: 82,
  },
  {
    slug: "construire-grille-tarifaire-claire",
    lines: ["Quel tarif", "appliquer ?"],
    illustration: "useful-dashboard",
    fontSize: 92,
  },
  {
    slug: "relancer-devis-propositions",
    lines: ["Mes devis restent", "sans réponse"],
    illustration: "team-followup",
    fontSize: 84,
  },
  {
    slug: "facturer-suivre-reglements",
    lines: ["Je facture", "trop tard"],
    illustration: "work-order-to-invoice",
    fontSize: 94,
  },
  {
    slug: "gerer-les-urgences-sans-subir",
    lines: ["Toujours dans", "l’urgence ?"],
    illustration: "urgent-workflow",
    fontSize: 94,
  },
  {
    slug: "rassembler-les-taches-dispersees",
    lines: ["Mes tâches sont", "partout"],
    illustration: "task-consolidation",
    fontSize: 88,
  },
  {
    slug: "transformer-reunions-en-actions",
    lines: ["Et maintenant,", "qui fait quoi ?"],
    illustration: "meeting-decisions",
    fontSize: 82,
  },
  {
    slug: "rendre-equipe-autonome-decisions",
    lines: ["Tout remonte", "jusqu’à moi"],
    illustration: "team-autonomy",
    fontSize: 88,
  },
  {
    slug: "retrouver-informations-documents",
    lines: ["Où est encore", "ce document ?"],
    illustration: "document-search",
    fontSize: 84,
  },
  {
    slug: "automatiser-reporting-recurrent",
    lines: ["Encore le même", "reporting"],
    illustration: "recurring-reporting",
    fontSize: 88,
  },
  {
    slug: "organiser-relances-equipe",
    lines: ["Je dois relancer", "tout le monde"],
    illustration: "team-followup",
    fontSize: 84,
  },
  {
    slug: "suivre-avancement-dossiers",
    lines: ["Où en sont", "les dossiers ?"],
    illustration: "dossier-progress",
    fontSize: 90,
  },
  {
    slug: "suivre-demandes-clients",
    lines: ["Les demandes clients", "se perdent"],
    illustration: "client-request",
    fontSize: 78,
  },
  {
    slug: "creer-methode-travail-commune",
    lines: ["Chacun travaille", "à sa façon"],
    illustration: "shared-method",
    fontSize: 82,
  },
  {
    slug: "organiser-entreprise-sans-dirigeant",
    lines: ["Sans moi,", "tout s’arrête"],
    illustration: "business-continuity",
    fontSize: 92,
  },
  {
    slug: "organiser-planning-equipe-imprevus",
    lines: ["Le planning change", "tout le temps"],
    illustration: "resilient-planning",
    fontSize: 78,
  },
  {
    slug: "supprimer-doubles-saisies",
    lines: ["On saisit trois fois", "la même chose"],
    illustration: "duplicate-entry",
    fontSize: 76,
  },
  {
    slug: "documenter-savoir-faire-equipe",
    lines: ["Le savoir reste", "dans les têtes"],
    illustration: "knowledge-transfer",
    fontSize: 82,
  },
  {
    slug: "construire-tableau-de-bord-utile",
    lines: ["Je découvre les", "problèmes trop tard"],
    illustration: "useful-dashboard",
    fontSize: 76,
  },
  {
    slug: "structurer-integration-salarie",
    lines: ["Les nouveaux mettent", "trop longtemps", "à comprendre"],
    illustration: "employee-onboarding",
    fontSize: 70,
  },
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
