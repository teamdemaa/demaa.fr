import {
  getSectorTaxonomyByPublicLabel,
  getToolDirectorySectorSeoPath,
} from "@/lib/sector-taxonomy";
import { publicSectorLabels, type PublicSectorLabel } from "@/lib/public-sectors";

export type SectorPageHighlight = {
  label: string;
  href: string;
};

export type SectorPageDefinition = {
  slug: string;
  label: PublicSectorLabel;
  title: string;
  description: string;
  intro: string;
  priorities: string[];
  featuredSystemSlugs: string[];
  highlights: SectorPageHighlight[];
};

type SectorPageEditorialDefinition = Omit<SectorPageDefinition, "label" | "slug">;

function getSectorToolDirectoryHref(sectorLabel: PublicSectorLabel): string {
  return getToolDirectorySectorSeoPath(sectorLabel) ?? "/annuaire-outils";
}

function createSectorPageDefinition(
  label: PublicSectorLabel,
  editorial: SectorPageEditorialDefinition,
): SectorPageDefinition {
  const sector = getSectorTaxonomyByPublicLabel(label);

  if (!sector) {
    throw new Error(`Missing sector taxonomy entry for "${label}".`);
  }

  return {
    slug: sector.publicSlug,
    label,
    ...editorial,
  };
}

const SECTOR_PAGE_DEFINITIONS: SectorPageDefinition[] = [
  createSectorPageDefinition("Conseil & services aux entreprises", {
    title: "Systèmes pour le conseil et les services aux entreprises",
    description:
      "Explorez les systèmes, outils, services et ressources utiles pour structurer une activité de conseil ou de services B2B.",
    intro:
      "Une page hub pour retrouver les principaux systèmes à cadrer dans les activités de conseil, support, gestion, délégation et services aux entreprises.",
    priorities: [
      "Cadrer les demandes entrantes, les relances et le suivi commercial.",
      "Structurer les livrables, la production et la marge par mission.",
      "Stabiliser l'administratif, les documents et les routines d'equipe.",
    ],
    featuredSystemSlugs: [
      "cabinet-de-conseil",
      "freelance",
      "daf-externalise",
      "assistant-administratif-externalise",
      "agence-de-recrutement",
      "cabinet-davocat",
      "courtier-credit-assurance",
      "agence-seo",
      "agence-acquisition-paid-ads",
      "cabinet-assurance",
      "cabinet-rh-externalise",
      "bureau-etudes",
      "cabinet-etudes",
      "centre-appels-support-client",
      "centre-affaires-coworking",
      "coach-professionnel",
      "entreprise-de-securite",
      "evenementiel",
      "fleuriste",
      "notaire",
      "societe-domiciliation",
      "societe-recouvrement",
      "studio-branding-design",
    ],
    highlights: [
      { label: "Voir le modele organisation", href: "/modeles-de-documents/systeme-operationnel" },
      { label: "Voir le service organisation", href: "/annuaire-services/organisation-automatisation" },
      { label: "Voir les outils utiles", href: getSectorToolDirectoryHref("Conseil & services aux entreprises") },
    ],
  }),
  createSectorPageDefinition("Tech & Digital", {
    title: "Systèmes pour les activités tech et digitales",
    description:
      "Explorez les systèmes, outils, services et ressources utiles pour structurer une activité tech, digitale ou logicielle.",
    intro:
      "Une vue d'ensemble des systèmes à cadrer pour mieux piloter support, delivery, acquisition, données et exploitation dans les activités tech et digitales.",
    priorities: [
      "Fiabiliser le delivery, le support et le suivi client.",
      "Choisir des outils cohérents pour éviter les doublons et les ruptures.",
      "Structurer acquisition, reporting et pilotage produit sans dispersion.",
    ],
    featuredSystemSlugs: [
      "saas",
      "agence-web",
      "infogerance-informatique",
      "integrateur-crm-erp",
      "creation-de-contenu",
      "cybersecurite-pme",
      "consultant-data-bi",
      "reparation-informatique-mobile",
      "marketplace",
      "media",
      "photographe-videaste",
    ],
    highlights: [
      { label: "Voir le modele organisation", href: "/modeles-de-documents/systeme-operationnel" },
      { label: "Voir les services acquisition", href: "/annuaire-services" },
      { label: "Voir les outils utiles", href: getSectorToolDirectoryHref("Tech & Digital") },
    ],
  }),
  createSectorPageDefinition("BTP & services techniques", {
    title: "Systèmes pour le BTP et les services techniques",
    description:
      "Explorez les systèmes, outils, services et ressources utiles pour structurer une activité BTP, chantier ou technique.",
    intro:
      "Une page hub pour cadrer devis, chantiers, équipes, sécurité, marge et exécution terrain dans le bâtiment et les services techniques.",
    priorities: [
      "Suivre les devis, les chantiers et les priorites terrain sans perte d'information.",
      "Mieux piloter equipes, sous-traitants, fournitures et marges.",
      "Cadrer les urgences, la conformité et les routines d'execution.",
    ],
    featuredSystemSlugs: [
      "batiment",
      "plomberie-chauffage",
      "electricite-generale",
      "renovation-interieur",
      "couvreur",
      "architecte-maitre-oeuvre",
      "carreleur",
      "climatisation",
      "menuiserie-agencement",
      "maconnerie-gros-oeuvre",
      "nettoyage-professionnel",
      "geometre",
      "paysagiste",
      "peintre-en-batiment",
      "pisciniste",
      "serrurier",
    ],
    highlights: [
      { label: "Voir le cours obligations", href: "/cours/maitriser-obligations-tpe" },
      { label: "Voir le previsionnel financier", href: "/modeles-de-documents/suivi-previsionnel-financier" },
      { label: "Voir les outils utiles", href: getSectorToolDirectoryHref("BTP & services techniques") },
      { label: "Voir les partenaires utiles", href: "/annuaire-fournisseurs" },
    ],
  }),
  createSectorPageDefinition("Immobilier", {
    title: "Systèmes pour les activités immobilières",
    description:
      "Explorez les systèmes, outils, services et ressources utiles pour structurer une activité immobilière, locative ou de transaction.",
    intro:
      "Une vue d'ensemble des systèmes à cadrer pour mieux suivre mandats, biens, loyers, incidents, transactions et coordination terrain.",
    priorities: [
      "Structurer le suivi des mandats, biens, visites et transactions.",
      "Clarifier la gestion des incidents, documents et relances locatives.",
      "Garder une lecture exploitable des priorites, marges et arbitrages.",
    ],
    featuredSystemSlugs: [
      "agence-immobiliere",
      "gestion-locative",
      "syndic",
      "chasseur-immobilier",
      "diagnostiqueur-immobilier",
      "investissement-locatif",
      "marchand-de-biens",
    ],
    highlights: [
      { label: "Voir le modele organisation", href: "/modeles-de-documents/systeme-operationnel" },
      { label: "Voir les outils utiles", href: getSectorToolDirectoryHref("Immobilier") },
      { label: "Voir les services utiles", href: "/annuaire-services" },
    ],
  }),
  createSectorPageDefinition("Hébergement & tourisme", {
    title: "Systèmes pour l'hébergement et le tourisme",
    description:
      "Explorez les systèmes, outils, services et ressources utiles pour structurer une activité d'hébergement, de conciergerie ou de voyage.",
    intro:
      "Une page hub pour retrouver les systèmes à cadrer autour des réservations, du planning, du ménage, des voyageurs et de l'exploitation saisonnière.",
    priorities: [
      "Tenir les réservations, la coordination terrain et les incidents sous controle.",
      "Mieux gérer ménage, voyageurs, disponibilites et saisonnalité.",
      "Garder une vision claire des marges, partenaires et routines d'exploitation.",
    ],
    featuredSystemSlugs: [
      "hotel-hebergement-independant",
      "conciergerie-airbnb",
      "agence-de-voyage",
    ],
    highlights: [
      { label: "Voir les outils utiles", href: getSectorToolDirectoryHref("Hébergement & tourisme") },
      { label: "Voir les partenaires utiles", href: "/annuaire-fournisseurs" },
      { label: "Voir les services utiles", href: "/annuaire-services" },
    ],
  }),
  createSectorPageDefinition("Patrimoine", {
    title: "Systèmes pour les activités patrimoniales",
    description:
      "Explorez les systèmes, outils, services et ressources utiles pour structurer une activité de patrimoine, investissement ou conseil patrimonial.",
    intro:
      "Une page hub pour cadrer le suivi client, les arbitrages, la conformité, les recommandations et la lecture financière dans les activités patrimoniales.",
    priorities: [
      "Structurer le suivi client, les recommandations et la conformité.",
      "Garder une lecture claire des arbitrages, encours et décisions financières.",
      "Mieux coordonner partenaires, documents et routines de suivi.",
    ],
    featuredSystemSlugs: [
      "gestionnaire-de-patrimoine",
      "investissement-financier",
      "investissement-entreprise",
      "investissement-immobilier",
    ],
    highlights: [
      { label: "Voir le previsionnel financier", href: "/modeles-de-documents/suivi-previsionnel-financier" },
      { label: "Voir les services finance", href: "/annuaire-services" },
      { label: "Voir les outils utiles", href: getSectorToolDirectoryHref("Patrimoine") },
    ],
  }),
  createSectorPageDefinition("Mobilité & logistique", {
    title: "Systèmes pour la mobilité et la logistique",
    description:
      "Explorez les systèmes, outils, services et ressources utiles pour structurer une activité de transport, mobilité ou livraison.",
    intro:
      "Une page hub pour piloter tournées, chauffeurs, délais, incidents et rentabilité dans les activités de mobilité et de logistique.",
    priorities: [
      "Suivre tournées, réservations, chauffeurs et incidents au quotidien.",
      "Mieux piloter délais, marges et priorités d'exploitation.",
      "Structurer la coordination terrain sans surcharge administrative.",
    ],
    featuredSystemSlugs: [
      "livraison-dernier-kilometre",
      "demenagement",
      "transport-de-marchandise",
      "transport-de-personnes",
      "vtc",
    ],
    highlights: [
      { label: "Voir les outils utiles", href: getSectorToolDirectoryHref("Mobilité & logistique") },
      { label: "Voir les partenaires utiles", href: "/annuaire-fournisseurs" },
      { label: "Voir les services utiles", href: "/annuaire-services" },
    ],
  }),
  createSectorPageDefinition("Restauration", {
    title: "Systèmes pour les activités de restauration",
    description:
      "Explorez les systèmes, outils, services et ressources utiles pour structurer un restaurant, fast-food, traiteur ou food truck.",
    intro:
      "Une page hub pour cadrer service, commandes, stocks, planning, production et marge dans les activités de restauration.",
    priorities: [
      "Tenir service, commandes, production et encaissement sans flottement.",
      "Mieux suivre stocks, achats, equipe et marge.",
      "Structurer les routines de rush, de planning et de qualité d'execution.",
    ],
    featuredSystemSlugs: [
      "restaurant",
      "fast-food",
      "traiteur",
      "dark-kitchen",
      "bar-cafe",
      "food-truck",
    ],
    highlights: [
      { label: "Voir le cours obligations", href: "/cours/maitriser-obligations-tpe" },
      { label: "Voir le cours facture électronique", href: "/cours/facture-electronique" },
      { label: "Voir les outils utiles", href: getSectorToolDirectoryHref("Restauration") },
    ],
  }),
  createSectorPageDefinition("Commerce & retail", {
    title: "Systèmes pour le commerce et le retail",
    description:
      "Explorez les systèmes, outils, services et ressources utiles pour structurer un commerce, une boutique ou une activité e-commerce.",
    intro:
      "Une page hub pour cadrer stock, caisse, commandes, marge, assortiment et suivi client dans les activités de commerce et retail.",
    priorities: [
      "Garder stock, caisse, commandes et assortiment sous controle.",
      "Mieux suivre marge, fournisseurs et priorités de vente.",
      "Structurer le suivi client et les routines du point de vente ou du e-commerce.",
    ],
    featuredSystemSlugs: [
      "boulangerie",
      "commerce-de-detail",
      "boutique-specialisee",
      "e-commerce",
      "commerce-alimentaire",
      "librairie",
      "tabac-presse-point-relais",
    ],
    highlights: [
      { label: "Voir le cours obligations", href: "/cours/maitriser-obligations-tpe" },
      { label: "Voir le cours facture électronique", href: "/cours/facture-electronique" },
      { label: "Voir les outils utiles", href: getSectorToolDirectoryHref("Commerce & retail") },
    ],
  }),
  createSectorPageDefinition("Santé, bien-être & esthétique", {
    title: "Systèmes pour la santé, le bien-être et l'esthétique",
    description:
      "Explorez les systèmes, outils, services et ressources utiles pour structurer un cabinet, une activité de soin, de beauté ou de suivi patient.",
    intro:
      "Une page hub pour cadrer agenda, dossiers, suivi client ou patient, planning, paiements et conformité dans les activités de santé et bien-être.",
    priorities: [
      "Tenir agenda, dossiers, suivis et paiements avec plus de fluidité.",
      "Mieux coordonner équipe, planning et qualité de prise en charge.",
      "Structurer les routines administratives sans alourdir l'activité.",
    ],
    featuredSystemSlugs: [
      "cabinet-medical",
      "cabinet-paramedical",
      "institut-de-beaute",
      "salon-de-coiffure",
      "coach-sportif",
      "psychologue",
      "dentiste",
      "infirmier-liberal",
      "esthetique",
      "opticien",
      "osteopathe",
      "pharmacie",
      "salle-de-sport",
      "veterinaire",
    ],
    highlights: [
      { label: "Voir les outils utiles", href: getSectorToolDirectoryHref("Santé, bien-être & esthétique") },
      { label: "Voir les services utiles", href: "/annuaire-services" },
      { label: "Voir les partenaires utiles", href: "/annuaire-fournisseurs" },
    ],
  }),
  createSectorPageDefinition("Services aux particuliers", {
    title: "Systèmes pour les services aux particuliers",
    description:
      "Explorez les systèmes, outils, services et ressources utiles pour structurer une activité de service récurrent ou terrain auprès des particuliers.",
    intro:
      "Une page hub pour retrouver les systèmes à cadrer autour des plannings, interventions, suivi client, remplacements et exécution terrain.",
    priorities: [
      "Mieux suivre plannings, interventions et remplacements.",
      "Garder demandes, bénéficiaires ou clients et execution terrain alignés.",
      "Structurer les routines administratives et de suivi sans tout porter seul.",
    ],
    featuredSystemSlugs: [
      "services-a-la-personne",
      "aide-a-domicile-menage",
      "pressing",
      "laverie-automatique",
    ],
    highlights: [
      { label: "Voir le modele organisation", href: "/modeles-de-documents/systeme-operationnel" },
      { label: "Voir les services utiles", href: "/annuaire-services" },
      { label: "Voir les outils utiles", href: getSectorToolDirectoryHref("Services aux particuliers") },
    ],
  }),
  createSectorPageDefinition("Éducation & formation", {
    title: "Systèmes pour l'éducation et la formation",
    description:
      "Explorez les systèmes, outils, services et ressources utiles pour structurer un organisme de formation, un CFA ou une offre éducative.",
    intro:
      "Une page hub pour cadrer inscriptions, sessions, apprenants, intervenants, conformité et suivi pédagogique dans l'éducation et la formation.",
    priorities: [
      "Structurer inscriptions, sessions, formateurs et apprenants.",
      "Tenir conformité, preuves et suivi pédagogique sans surcharge.",
      "Mieux coordonner planning, contenus et facturation.",
    ],
    featuredSystemSlugs: [
      "organisme-de-formation",
      "cfa",
      "formation-en-ligne",
      "auto-ecole",
      "creche",
    ],
    highlights: [
      { label: "Voir le cours facture électronique", href: "/cours/facture-electronique" },
      { label: "Voir les outils utiles", href: getSectorToolDirectoryHref("Éducation & formation") },
      { label: "Voir les services utiles", href: "/annuaire-services" },
    ],
  }),
  createSectorPageDefinition("Industrie & production", {
    title: "Systèmes pour l'industrie et la production",
    description:
      "Explorez les systèmes, outils, services et ressources utiles pour structurer une activité de production, atelier ou industrie.",
    intro:
      "Une page hub pour cadrer production, stocks, priorités, délais et exécution dans les activités d'industrie et de production.",
    priorities: [
      "Mieux suivre production, priorités, stocks et délais.",
      "Garder une lecture exploitable des incidents et de l'execution atelier.",
      "Structurer le pilotage sans multiplier les urgences invisibles.",
    ],
    featuredSystemSlugs: [
      "production-industrie",
    ],
    highlights: [
      { label: "Voir le previsionnel financier", href: "/modeles-de-documents/suivi-previsionnel-financier" },
      { label: "Voir les outils utiles", href: getSectorToolDirectoryHref("Industrie & production") },
      { label: "Voir les partenaires utiles", href: "/annuaire-fournisseurs" },
    ],
  }),
  createSectorPageDefinition("Automobile & réparation", {
    title: "Systèmes pour l'automobile et la réparation",
    description:
      "Explorez les systèmes, outils, services et ressources utiles pour structurer un garage, une carrosserie ou une activité de réparation.",
    intro:
      "Une page hub pour cadrer atelier, pièces, rendez-vous, sinistres, facturation et suivi client dans l'automobile et la réparation.",
    priorities: [
      "Suivre atelier, pièces, rendez-vous et facturation sans blocage.",
      "Mieux gérer sinistres, priorités et execution technique.",
      "Structurer le suivi client et les routines de réparation.",
    ],
    featuredSystemSlugs: [
      "garage-automobile",
      "carrosserie",
    ],
    highlights: [
      { label: "Voir le cours facture électronique", href: "/cours/facture-electronique" },
      { label: "Voir les outils utiles", href: getSectorToolDirectoryHref("Automobile & réparation") },
      { label: "Voir les partenaires utiles", href: "/annuaire-fournisseurs" },
    ],
  }),
  createSectorPageDefinition("Associations & événements", {
    title: "Systèmes pour les associations et l'événementiel",
    description:
      "Explorez les systèmes, outils, services et ressources utiles pour structurer une association ou une activité événementielle.",
    intro:
      "Une page hub pour cadrer adhésions, bénévoles, planning, budget, prestataires et exécution dans les associations et l'événementiel.",
    priorities: [
      "Structurer membres, adhésions, prestataires et plannings.",
      "Mieux piloter budget, execution et coordination des événements.",
      "Garder une organisation exploitable sans épuiser l'équipe.",
    ],
    featuredSystemSlugs: [
      "association",
    ],
    highlights: [
      { label: "Voir le modele organisation", href: "/modeles-de-documents/systeme-operationnel" },
      { label: "Voir les services utiles", href: "/annuaire-services" },
      { label: "Voir les outils utiles", href: getSectorToolDirectoryHref("Associations & événements") },
    ],
  }),
];

export const sectorPageDefinitions = SECTOR_PAGE_DEFINITIONS;

export const sectorPageDefinitionsBySlug = Object.fromEntries(
  sectorPageDefinitions.map((definition) => [definition.slug, definition]),
) as Record<string, SectorPageDefinition>;

export const sectorPageDefinitionsByLabel = Object.fromEntries(
  sectorPageDefinitions.map((definition) => [definition.label, definition]),
) as Record<PublicSectorLabel, SectorPageDefinition>;

export function getSectorPageBySlug(slug: string): SectorPageDefinition | null {
  return sectorPageDefinitionsBySlug[slug] ?? null;
}

export function getSectorPageByLabel(label: string): SectorPageDefinition | null {
  if (!publicSectorLabels.includes(label as PublicSectorLabel)) {
    return null;
  }

  return sectorPageDefinitionsByLabel[label as PublicSectorLabel] ?? null;
}
