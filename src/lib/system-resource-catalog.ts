import type { SystemKitPreview } from "@/lib/system-kit-previews";
import { enterpriseCatalogBySlug } from "@/lib/enterprise-annuaire";

export const SYSTEM_RESOURCE_SLUGS = [
  "recapitulatif-systeme",
  "tableau-pilotage-operationnel",
  "suivi-previsionnel-financier",
  "crm-suivi-commercial",
  "guide-obligations-fiscales-sociales-comptables",
  "guide-facturation-electronique",
] as const;

type AvailableSystemResourceSlug = (typeof SYSTEM_RESOURCE_SLUGS)[number];
type PlannedGuideKind = "lancer" | "gerer";

export type SystemResourceSlug =
  | AvailableSystemResourceSlug
  | `guide-${string}-${PlannedGuideKind}`;

export type SystemResourceFormat = "template" | "guide";
export type SystemResourceAvailability = "available" | "coming-soon";

export type SystemResource = Readonly<{
  availability: SystemResourceAvailability;
  deliveryLabel?: string;
  description: string;
  format: SystemResourceFormat;
  formatLabel: string;
  preview?: SystemKitPreview;
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
    description: "Tous les process, solutions et ressources de ce métier réunis dans un récapitulatif facile à consulter.",
    deliveryLabel: "Recevoir le récapitulatif",
    format: "template",
    formatLabel: "Récapitulatif",
    rank: 0,
    resourceSlug: "recapitulatif-systeme",
    successDescription: "Le lien vers votre récapitulatif vient de vous être envoyé. Pensez à vérifier vos courriers indésirables.",
    title: "Récapitulatif du système",
  },
  {
    availability: "available",
    description: "Un tableau simple pour suivre les priorités, les actions et les résultats de votre activité.",
    deliveryLabel: "Recevoir le tableau",
    format: "template",
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
    availability: "available",
    description: "Un modèle pour suivre votre trésorerie, projeter les mois à venir et décider plus tôt.",
    deliveryLabel: "Recevoir le modèle",
    format: "template",
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
    availability: "available",
    description: "Une base CRM pour centraliser les prospects, organiser les relances et suivre les opportunités.",
    deliveryLabel: "Recevoir le CRM",
    format: "template",
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
    availability: "available",
    description: "La présentation d’origine pour comprendre les principales obligations et les finances de votre entreprise.",
    deliveryLabel: "Recevoir la présentation",
    format: "guide",
    formatLabel: "Présentation",
    preview: {
      alt: "Aperçu de la présentation sur les obligations et les finances de l’entreprise",
      height: 1755,
      src: "/images/courses/obligations-finances/01.png",
      width: 3120,
    },
    previewDisclosure: "Aperçu de la présentation. Le document reçu reprend les diapositives d’origine.",
    rank: 1,
    readingMinutes: 2,
    resourceSlug: "guide-obligations-fiscales-sociales-comptables",
    successDescription: "Vous y trouverez le lien de téléchargement de la présentation. Pensez à vérifier vos courriers indésirables.",
    tagline: "Naviguer dans la complexité",
    title: "Maîtriser les obligations et les finances de son entreprise",
  },
  {
    availability: "available",
    description: "La présentation d’origine pour comprendre ce que la réforme change pour votre entreprise.",
    deliveryLabel: "Recevoir la présentation",
    format: "guide",
    formatLabel: "Présentation",
    preview: {
      alt: "Aperçu de la présentation sur la facturation électronique",
      height: 1755,
      src: "/images/courses/facturation-electronique/01.png",
      width: 3120,
    },
    previewDisclosure: "Aperçu de la présentation. Le document reçu reprend les diapositives d’origine.",
    rank: 2,
    readingMinutes: 3,
    resourceSlug: "guide-facturation-electronique",
    successDescription: "Vous y trouverez le lien de téléchargement de la présentation. Pensez à vérifier vos courriers indésirables.",
    tagline: "Ce qui va vraiment changer pour votre entreprise",
    title: "La facturation électronique",
  },
]);

type PlannedGuideCopy = readonly [title: string, tagline: string];
type PlannedGuidePair = Readonly<Record<PlannedGuideKind, PlannedGuideCopy>>;

/**
 * Les deux guides annoncés sur chaque système. Cette liste est volontairement
 * éditoriale : les titres ne sont pas construits à partir du nom du métier,
 * afin d'éviter les formulations mécaniques ou grammaticalement incorrectes.
 */
const PLANNED_GUIDE_COPY: Readonly<Record<string, PlannedGuidePair>> = {
  "cabinet-comptable": { lancer: ["Créer un cabinet comptable", "Poser une offre et une organisation solides"], gerer: ["Piloter un cabinet comptable", "Clients, production, équipe et rentabilité"] },
  "cabinet-davocat": { lancer: ["Ouvrir un cabinet d’avocat", "Poser le cadre de votre exercice"], gerer: ["Organiser un cabinet d’avocat", "Dossiers, échéances et priorités sous contrôle"] },
  "cabinet-de-conseil": { lancer: ["Lancer un cabinet de conseil", "Positionnement, missions et premiers clients"], gerer: ["Piloter un cabinet de conseil", "Missions, développement et rentabilité"] },
  "agence-marketing": { lancer: ["Lancer une agence marketing", "Une offre claire pour vos premiers clients"], gerer: ["Gérer une agence marketing", "Prospects, campagnes, livrables et marges"] },
  freelance: { lancer: ["Lancer votre activité de freelance B2B", "Trouver votre place et vos premiers clients"], gerer: ["Organiser votre activité de freelance", "Missions, clients et temps sous contrôle"] },
  "agence-de-recrutement": { lancer: ["Créer une agence de recrutement", "Une offre et une méthode de recrutement claires"], gerer: ["Piloter une agence de recrutement", "Mandats, candidats et suivi client"] },
  "agence-web": { lancer: ["Lancer une agence web", "Définir une offre qui se vend"], gerer: ["Gérer une agence web", "Projets, équipe, clients et rentabilité"] },
  "creation-de-contenu": { lancer: ["Lancer une activité de création de contenu", "Choisir une offre et trouver vos clients"], gerer: ["Organiser votre activité de création de contenu", "Production, planning et relations clients"] },
  marketplace: { lancer: ["Lancer une marketplace", "Construire une offre utile aux deux côtés"], gerer: ["Piloter une marketplace", "Offre, utilisateurs et qualité du service"] },
  media: { lancer: ["Lancer un média", "Trouver un angle et une audience"], gerer: ["Gérer un média", "Contenus, audience et revenus"] },
  saas: { lancer: ["Lancer un SaaS", "Partir d’un problème client concret"], gerer: ["Piloter un SaaS", "Produit, clients et croissance durable"] },
  batiment: { lancer: ["Créer une entreprise du bâtiment", "Poser une offre, des prix et une organisation"], gerer: ["Piloter vos chantiers et votre équipe", "Devis, planning, chantiers et trésorerie"] },
  "nettoyage-professionnel": { lancer: ["Créer une entreprise de nettoyage", "Construire une offre adaptée à votre zone"], gerer: ["Organiser vos équipes et vos prestations", "Planning, qualité et suivi des clients"] },
  "agence-immobiliere": { lancer: ["Créer une agence immobilière", "Définir votre zone, votre offre et vos méthodes"], gerer: ["Piloter une agence immobilière", "Mandats, visites et suivi commercial"] },
  syndic: { lancer: ["Lancer une activité de syndic", "Construire un cadre de gestion fiable"], gerer: ["Piloter une activité de syndic", "Immeubles, échéances et relations copropriétaires"] },
  "gestion-locative": { lancer: ["Lancer une activité de gestion locative", "Poser un service clair pour les propriétaires"], gerer: ["Piloter la gestion de vos biens", "Locations, interventions et suivi des propriétaires"] },
  "marchand-de-biens": { lancer: ["Lancer une activité de marchand de biens", "Évaluer vos opérations avant de vous engager"], gerer: ["Piloter vos opérations immobilières", "Acquisitions, travaux, ventes et trésorerie"] },
  "investissement-locatif": { lancer: ["Démarrer dans l’investissement locatif", "Choisir vos premiers projets avec méthode"], gerer: ["Piloter vos locations", "Revenus, charges et décisions d’investissement"] },
  "conciergerie-airbnb": { lancer: ["Lancer une conciergerie", "Construire une offre claire pour les propriétaires"], gerer: ["Piloter une conciergerie", "Réservations, équipes et qualité de séjour"] },
  "investissement-immobilier": { lancer: ["Structurer vos investissements immobiliers", "Choisir vos projets et votre stratégie"], gerer: ["Piloter vos investissements immobiliers", "Suivre vos biens, vos rendements et vos décisions"] },
  "investissement-financier": { lancer: ["Démarrer votre stratégie d’investissement financier", "Définir un cadre avant d’investir"], gerer: ["Piloter vos investissements financiers", "Suivre vos choix et votre allocation"] },
  "investissement-entreprise": { lancer: ["Investir dans des entreprises", "Préparer vos premières décisions d’investissement"], gerer: ["Piloter vos participations", "Suivre vos investissements dans la durée"] },
  demenagement: { lancer: ["Créer une entreprise de déménagement", "Construire une offre et votre première organisation"], gerer: ["Organiser vos équipes et déménagements", "Planning, matériel et qualité de service"] },
  "livraison-dernier-kilometre": { lancer: ["Lancer une activité de livraison du dernier kilomètre", "Définir votre offre et votre zone de service"], gerer: ["Organiser vos tournées de livraison", "Courses, chauffeurs et qualité de service"] },
  "transport-de-marchandise": { lancer: ["Créer une entreprise de transport de marchandises", "Préparer une offre et une exploitation viables"], gerer: ["Gérer vos transports et vos tournées", "Clients, chauffeurs, véhicules et rentabilité"] },
  "transport-de-personnes": { lancer: ["Lancer une activité de transport de personnes", "Construire un service fiable et rentable"], gerer: ["Organiser vos trajets et vos chauffeurs", "Planning, clients et qualité de service"] },
  restaurant: { lancer: ["Ouvrir un restaurant", "Du besoin client au premier service"], gerer: ["Gérer un restaurant au quotidien", "Ventes, marge, équipe et stocks"] },
  "fast-food": { lancer: ["Ouvrir un fast-food", "Construire une offre simple et rentable"], gerer: ["Gérer un fast-food", "Service, équipe, stocks et marge"] },
  traiteur: { lancer: ["Créer une activité de traiteur", "Construire une offre adaptée à vos événements"], gerer: ["Organiser vos prestations de traiteur", "Commandes, production et service"] },
  "dark-kitchen": { lancer: ["Lancer une dark kitchen", "Trouver une offre qui répond à une demande réelle"], gerer: ["Piloter une dark kitchen", "Commandes, production et rentabilité"] },
  boulangerie: { lancer: ["Ouvrir une boulangerie", "Préparer une offre et un point de vente viables"], gerer: ["Gérer une boulangerie", "Production, vente, équipe et marge"] },
  "commerce-de-detail": { lancer: ["Ouvrir un commerce de détail", "Choisir une offre et un emplacement cohérents"], gerer: ["Piloter votre commerce au quotidien", "Ventes, stocks, équipe et clients"] },
  "e-commerce": { lancer: ["Lancer une boutique en ligne", "Choisir une offre qui répond à une demande réelle"], gerer: ["Piloter votre e-commerce", "Commandes, acquisition et rentabilité"] },
  "institut-de-beaute": { lancer: ["Ouvrir un institut de beauté", "Définir une offre et une expérience client claires"], gerer: ["Gérer un institut de beauté", "Planning, prestations, équipe et fidélisation"] },
  "salon-de-coiffure": { lancer: ["Ouvrir un salon de coiffure", "Préparer une offre et un salon qui vous ressemble"], gerer: ["Gérer un salon de coiffure", "Planning, équipe, ventes et fidélisation"] },
  esthetique: { lancer: ["Lancer une activité d’esthétique", "Construire une offre claire pour vos clientes"], gerer: ["Organiser votre activité d’esthétique", "Rendez-vous, prestations et suivi client"] },
  "services-a-la-personne": { lancer: ["Créer une entreprise de services à la personne", "Poser une offre et une organisation de départ"], gerer: ["Organiser vos interventions et vos équipes", "Planning, qualité et suivi des bénéficiaires"] },
  "organisme-de-formation": { lancer: ["Créer un organisme de formation", "Construire une offre et un parcours pédagogique utiles"], gerer: ["Piloter un organisme de formation", "Sessions, apprenants, formateurs et qualité"] },
  cfa: { lancer: ["Créer un CFA", "Préparer une offre de formation structurée"], gerer: ["Piloter un CFA", "Apprenants, formateurs et organisation quotidienne"] },
  "formation-en-ligne": { lancer: ["Lancer une formation en ligne", "Construire un programme utile et vendable"], gerer: ["Piloter votre activité de formation en ligne", "Contenus, apprenants et ventes"] },
  "production-industrie": { lancer: ["Créer une activité de production", "Préparer une offre et une organisation viables"], gerer: ["Piloter votre production et vos équipes", "Commandes, qualité, délais et marge"] },
  "plomberie-chauffage": { lancer: ["Lancer votre entreprise de plomberie et chauffage", "Poser une offre et une organisation solides"], gerer: ["Gérer vos interventions et vos chantiers", "Devis, planning, clients et trésorerie"] },
  "electricite-generale": { lancer: ["Lancer votre entreprise d’électricité", "Construire une offre et vos méthodes de départ"], gerer: ["Organiser vos chantiers et interventions", "Planning, équipes, clients et suivi"] },
  "renovation-interieur": { lancer: ["Créer une entreprise de rénovation intérieure", "Choisir vos prestations et votre organisation"], gerer: ["Piloter vos chantiers de rénovation", "Devis, planning, équipe et rentabilité"] },
  "menuiserie-agencement": { lancer: ["Créer une entreprise de menuiserie", "Structurer une offre entre atelier et chantier"], gerer: ["Organiser vos ateliers et chantiers", "Commandes, fabrication, pose et planning"] },
  "maconnerie-gros-oeuvre": { lancer: ["Créer une entreprise de maçonnerie", "Préparer vos offres, vos prix et votre organisation"], gerer: ["Piloter vos chantiers et votre équipe", "Planning, avancement et rentabilité"] },
  paysagiste: { lancer: ["Créer une entreprise de paysagisme", "Construire une offre adaptée à votre territoire"], gerer: ["Organiser vos équipes et vos chantiers", "Planning, matériel et qualité de service"] },
  "garage-automobile": { lancer: ["Ouvrir un garage automobile", "Préparer une offre et un atelier viables"], gerer: ["Gérer un garage automobile", "Atelier, planning, clients et rentabilité"] },
  carrosserie: { lancer: ["Ouvrir une carrosserie", "Structurer votre offre et votre atelier"], gerer: ["Organiser votre carrosserie", "Dossiers, planning, production et clients"] },
  "commerce-alimentaire": { lancer: ["Ouvrir un commerce alimentaire", "Construire une offre et un point de vente cohérents"], gerer: ["Gérer un commerce alimentaire", "Ventes, stocks, équipe et marge"] },
  "boutique-specialisee": { lancer: ["Ouvrir une boutique spécialisée", "Choisir une offre et une expérience client fortes"], gerer: ["Piloter votre boutique au quotidien", "Ventes, stocks, équipe et fidélisation"] },
  "tabac-presse-point-relais": { lancer: ["Ouvrir un tabac, presse et point relais", "Préparer une activité de proximité structurée"], gerer: ["Gérer un tabac, presse et point relais", "Flux clients, stocks et services du quotidien"] },
  "bar-cafe": { lancer: ["Ouvrir un café", "Construire une offre et un lieu qui attirent"], gerer: ["Gérer un café", "Service, équipe, stocks et rentabilité"] },
  "hotel-hebergement-independant": { lancer: ["Ouvrir un hôtel indépendant", "Préparer une offre, un lieu et une expérience clairs"], gerer: ["Piloter un hôtel indépendant", "Réservations, équipe, qualité et rentabilité"] },
  "cabinet-medical": { lancer: ["Ouvrir un cabinet médical", "Préparer votre installation avec méthode"], gerer: ["Organiser un cabinet médical", "Patients, planning et fonctionnement quotidien"] },
  "cabinet-paramedical": { lancer: ["Ouvrir un cabinet paramédical", "Préparer une installation adaptée à votre exercice"], gerer: ["Organiser un cabinet paramédical", "Patients, planning et coordination"] },
  "infirmier-liberal": { lancer: ["Lancer une activité d’infirmier libéral", "Préparer votre installation et votre organisation"], gerer: ["Organiser votre activité d’infirmier libéral", "Tournées, patients et suivi administratif"] },
  "aide-a-domicile-menage": { lancer: ["Créer une entreprise d’aide à domicile", "Construire une offre et une organisation de départ"], gerer: ["Organiser vos interventions à domicile", "Planning, équipes et qualité de service"] },
  "reparation-informatique-mobile": { lancer: ["Créer une entreprise de maintenance informatique", "Définir une offre de service claire"], gerer: ["Piloter vos interventions et votre support", "Tickets, clients, équipe et qualité"] },
  "architecte-maitre-oeuvre": { lancer: ["Lancer une activité d’architecte ou de maîtrise d’œuvre", "Construire une offre et votre méthode de projet"], gerer: ["Piloter vos projets et vos chantiers", "Études, clients, intervenants et délais"] },
  "courtier-credit-assurance": { lancer: ["Créer un cabinet de courtage", "Définir votre offre et vos méthodes de conseil"], gerer: ["Piloter un cabinet de courtage", "Dossiers, partenaires et suivi client"] },
  "auto-ecole": { lancer: ["Créer un centre de formation à la conduite", "Préparer une offre et une organisation solides"], gerer: ["Organiser vos élèves et votre planning", "Leçons, moniteurs et suivi administratif"] },
  "photographe-videaste": { lancer: ["Lancer une activité de photographe ou vidéaste", "Construire une offre qui répond à une demande réelle"], gerer: ["Organiser vos projets et productions", "Briefs, planning, livraisons et clients"] },
  evenementiel: { lancer: ["Créer une agence événementielle", "Définir une offre et vos méthodes de projet"], gerer: ["Piloter vos événements et vos équipes", "Briefs, prestataires, planning et qualité"] },
  "salle-de-sport": { lancer: ["Ouvrir une salle de sport", "Préparer une offre, un lieu et une expérience claire"], gerer: ["Gérer une salle de sport", "Adhérents, équipe, planning et fidélisation"] },
  dentiste: { lancer: ["Ouvrir un cabinet dentaire", "Préparer votre installation avec méthode"], gerer: ["Organiser un cabinet dentaire", "Patients, planning, équipe et suivi"] },
  pharmacie: { lancer: ["Reprendre ou ouvrir une pharmacie", "Préparer un projet et une organisation viables"], gerer: ["Piloter une pharmacie", "Équipe, stocks, patients et rentabilité"] },
  notaire: { lancer: ["Ouvrir un office notarial", "Préparer votre installation et votre organisation"], gerer: ["Organiser un office notarial", "Dossiers, échéances, équipe et clients"] },
  veterinaire: { lancer: ["Ouvrir un cabinet vétérinaire", "Préparer une installation adaptée à votre activité"], gerer: ["Gérer un cabinet vétérinaire", "Rendez-vous, équipe, soins et suivi client"] },
  "agence-de-voyage": { lancer: ["Créer une agence de voyages", "Construire une offre et une expérience client forte"], gerer: ["Piloter une agence de voyages", "Demandes, réservations et suivi client"] },
  opticien: { lancer: ["Ouvrir un magasin d’optique", "Préparer une offre, un magasin et un parcours client"], gerer: ["Gérer un magasin d’optique", "Ventes, stocks, équipe et suivi client"] },
  pisciniste: { lancer: ["Créer une entreprise de piscine", "Structurer une offre entre chantiers et entretien"], gerer: ["Organiser vos chantiers et entretiens", "Planning, équipes, clients et matériel"] },
  "diagnostiqueur-immobilier": { lancer: ["Créer une activité de diagnostic immobilier", "Définir une offre et votre organisation terrain"], gerer: ["Piloter vos missions de diagnostic", "Rendez-vous, rapports et suivi client"] },
  fleuriste: { lancer: ["Lancer une activité de fleuriste événementiel", "Construire une offre pour les événements"], gerer: ["Organiser vos commandes et événements", "Création, livraison et suivi client"] },
  pressing: { lancer: ["Ouvrir un pressing", "Préparer une offre et une organisation de proximité"], gerer: ["Gérer un pressing", "Dépôts, production, équipe et clients"] },
  "food-truck": { lancer: ["Lancer un food truck", "Trouver une offre, une zone et un rythme viables"], gerer: ["Organiser un food truck", "Service, stocks, emplacements et marge"] },
  "consultant-independant": { lancer: ["Lancer une activité de conseil indépendant", "Choisir une offre claire et vos premiers clients"], gerer: ["Organiser votre activité de conseil", "Missions, clients, temps et revenus"] },
  "cabinet-assurance": { lancer: ["Créer un cabinet d’assurance", "Définir votre offre et vos méthodes de conseil"], gerer: ["Piloter un cabinet d’assurance", "Clients, contrats, équipe et suivi"] },
  vtc: { lancer: ["Lancer une activité de VTC", "Préparer un service et une organisation viables"], gerer: ["Organiser vos courses et votre activité", "Planning, clients, véhicules et rentabilité"] },
  "coach-professionnel": { lancer: ["Lancer une activité de coach professionnel", "Construire une offre claire pour vos clients"], gerer: ["Piloter une activité de coaching", "Clients, séances, suivi et développement"] },
  "coach-sportif": { lancer: ["Lancer une activité de coach sportif", "Définir une offre et un accompagnement utiles"], gerer: ["Organiser vos séances et vos clients", "Planning, suivi et fidélisation"] },
  "laverie-automatique": { lancer: ["Ouvrir une laverie automatique", "Préparer un lieu et une offre de proximité"], gerer: ["Gérer une laverie automatique", "Équipements, clients et suivi du site"] },
  "entreprise-de-securite": { lancer: ["Créer une entreprise de sécurité", "Construire une offre et une organisation fiables"], gerer: ["Organiser vos missions et vos équipes", "Planning, agents, clients et qualité"] },
  association: { lancer: ["Créer et structurer une association", "Poser un projet, une équipe et un cadre clair"], gerer: ["Piloter une association", "Projets, équipe, budget et suivi"] },
  couvreur: { lancer: ["Créer une entreprise de couverture", "Préparer une offre et vos méthodes de chantier"], gerer: ["Piloter vos chantiers de couverture", "Devis, planning, équipe et qualité"] },
  "peintre-en-batiment": { lancer: ["Créer une entreprise de peinture", "Construire une offre et une organisation de départ"], gerer: ["Organiser vos chantiers de peinture", "Devis, planning, clients et qualité"] },
  carreleur: { lancer: ["Créer une entreprise de carrelage", "Définir une offre et vos méthodes de chantier"], gerer: ["Gérer vos chantiers de carrelage", "Devis, planning, pose et suivi client"] },
  climatisation: { lancer: ["Lancer une entreprise de climatisation", "Préparer une offre et votre organisation terrain"], gerer: ["Gérer vos installations et interventions", "Devis, planning, clients et maintenance"] },
  serrurier: { lancer: ["Créer une entreprise de serrurerie", "Construire une offre entre dépannage et chantier"], gerer: ["Organiser vos dépannages et chantiers", "Urgences, planning, clients et suivi"] },
  librairie: { lancer: ["Ouvrir une librairie", "Préparer une offre, un lieu et une communauté"], gerer: ["Gérer une librairie", "Ventes, stocks, événements et clients"] },
  osteopathe: { lancer: ["Ouvrir un cabinet d’ostéopathie", "Préparer votre installation et votre organisation"], gerer: ["Organiser un cabinet d’ostéopathie", "Rendez-vous, patients et suivi quotidien"] },
  psychologue: { lancer: ["Ouvrir un cabinet de psychologie", "Préparer votre installation et votre cadre de travail"], gerer: ["Organiser un cabinet de psychologie", "Rendez-vous, patients et suivi quotidien"] },
  creche: { lancer: ["Ouvrir une crèche", "Préparer un accueil, une équipe et une organisation fiables"], gerer: ["Piloter une crèche", "Équipe, enfants, parents et organisation quotidienne"] },
  "gestionnaire-de-patrimoine": { lancer: ["Lancer une activité de gestion de patrimoine", "Définir votre offre et votre méthode de conseil"], gerer: ["Piloter une activité de gestion de patrimoine", "Clients, dossiers et suivi dans la durée"] },
  "chasseur-immobilier": { lancer: ["Lancer une activité de chasseur immobilier", "Construire une offre utile aux acheteurs"], gerer: ["Organiser vos recherches et vos clients", "Mandats, visites et suivi des dossiers"] },
  geometre: { lancer: ["Créer un cabinet de géomètre", "Définir une offre et votre organisation terrain"], gerer: ["Piloter vos missions de géomètre", "Relevés, projets, équipe et livraisons"] },
  "daf-externalise": { lancer: ["Lancer une activité de DAF externalisé", "Construire une offre claire pour les dirigeants"], gerer: ["Piloter votre activité de DAF externalisé", "Missions, clients, planning et rentabilité"] },
  "office-manager-externalise": { lancer: ["Lancer une activité d’office manager externalisé", "Définir une offre utile aux entreprises"], gerer: ["Organiser vos missions d’office manager", "Clients, priorités et suivi quotidien"] },
  "assistant-administratif-externalise": { lancer: ["Lancer une activité d’assistant administratif", "Construire une offre et votre organisation de départ"], gerer: ["Organiser vos missions administratives", "Clients, priorités et suivi des demandes"] },
  "secretariat-externalise": { lancer: ["Lancer une activité de secrétariat externalisé", "Définir une offre claire pour vos clients"], gerer: ["Organiser vos missions de secrétariat", "Demandes, planning et suivi des clients"] },
  "gestionnaire-paie-independant": { lancer: ["Lancer une activité de gestionnaire de paie", "Construire une offre et vos méthodes de travail"], gerer: ["Piloter vos missions de paie", "Échéances, dossiers et suivi client"] },
  "cabinet-rh-externalise": { lancer: ["Créer un cabinet RH", "Définir une offre claire pour les entreprises"], gerer: ["Piloter un cabinet RH", "Missions, clients, équipe et suivi"] },
  "centre-appels-support-client": { lancer: ["Créer un centre d’appels", "Préparer une offre, une équipe et des méthodes"], gerer: ["Organiser votre centre d’appels", "Flux, équipe, qualité et suivi client"] },
  "societe-recouvrement": { lancer: ["Créer une société de recouvrement", "Définir une offre et un cadre de traitement clair"], gerer: ["Piloter votre activité de recouvrement", "Dossiers, échéances et suivi client"] },
  "centre-affaires-coworking": { lancer: ["Ouvrir un centre d’affaires ou un coworking", "Préparer une offre et un lieu utiles aux entreprises"], gerer: ["Piloter un centre d’affaires", "Espaces, clients, équipe et services"] },
  "cabinet-qhse-conformite": { lancer: ["Créer un cabinet QHSE", "Construire une offre claire pour vos clients"], gerer: ["Piloter vos missions QHSE", "Dossiers, échéances et suivi client"] },
  "bureau-etudes": { lancer: ["Créer un bureau d’études", "Définir une offre et une méthode de projet"], gerer: ["Piloter un bureau d’études", "Études, projets, équipe et délais"] },
  "cabinet-etudes": { lancer: ["Créer un cabinet d’études", "Construire une offre et vos méthodes de mission"], gerer: ["Piloter un cabinet d’études", "Projets, équipe, clients et livraisons"] },
  "infogerance-informatique": { lancer: ["Créer une activité d’infogérance", "Définir une offre de service claire"], gerer: ["Organiser votre activité d’infogérance", "Parc clients, support, équipe et qualité"] },
  "cybersecurite-pme": { lancer: ["Créer une activité de cybersécurité", "Construire une offre utile aux PME"], gerer: ["Piloter vos missions de cybersécurité", "Clients, priorités, livraisons et suivi"] },
  "integrateur-crm-erp": { lancer: ["Créer une activité d’intégration CRM ou ERP", "Définir une offre et une méthode de projet"], gerer: ["Piloter vos projets d’intégration", "Besoins, projets, équipe et livraisons"] },
  "consultant-data-bi": { lancer: ["Lancer une activité de conseil data et BI", "Construire une offre claire pour vos clients"], gerer: ["Piloter vos missions data et BI", "Projets, clients, priorités et livraisons"] },
  "agence-seo": { lancer: ["Lancer une agence SEO", "Définir une offre et une méthode qui inspirent confiance"], gerer: ["Piloter une agence SEO", "Clients, production, résultats et rentabilité"] },
  "agence-acquisition-paid-ads": { lancer: ["Lancer une agence d’acquisition", "Construire une offre claire et mesurable"], gerer: ["Piloter une agence d’acquisition", "Campagnes, clients, résultats et marges"] },
  "studio-branding-design": { lancer: ["Créer un studio de branding et design", "Définir une offre et une signature claire"], gerer: ["Piloter un studio de branding et design", "Projets, équipe, clients et rentabilité"] },
};

function assertPlannedGuidesCoverEverySystem() {
  const knownSystemSlugs = new Set(Object.keys(enterpriseCatalogBySlug));
  const missing = [...knownSystemSlugs].filter((slug) => !PLANNED_GUIDE_COPY[slug]);
  const unknown = Object.keys(PLANNED_GUIDE_COPY).filter((slug) => !knownSystemSlugs.has(slug));

  if (missing.length || unknown.length) {
    throw new Error(
      `Planned guide copy must cover exactly every system (missing: ${missing.join(", ") || "none"}; unknown: ${unknown.join(", ") || "none"}).`,
    );
  }
}

assertPlannedGuidesCoverEverySystem();

function getPlannedGuideResource(
  systemSlug: string,
  kind: PlannedGuideKind,
): SystemResource | null {
  const enterprise = enterpriseCatalogBySlug[systemSlug];
  if (!enterprise) return null;

  const copy = PLANNED_GUIDE_COPY[systemSlug]?.[kind];
  if (!copy) return null;

  const [title, tagline] = copy;
  const action = title.charAt(0).toLocaleLowerCase("fr-FR") + title.slice(1);

  return {
    availability: "coming-soon",
    description:
      kind === "lancer"
        ? `Un guide pratique pour ${action} : les choix et les repères essentiels avant de vous lancer.`
        : `Un guide pratique pour ${action} : les repères pour suivre l’activité et garder le cap au quotidien.`,
    format: "guide",
    formatLabel: "Guide",
    rank: kind === "lancer" ? 3 : 4,
    resourceSlug: `guide-${systemSlug}-${kind}`,
    systemSlugs: [systemSlug],
    tagline,
    title,
  };
}

export function getSystemResource(resourceSlug: string): SystemResource | null {
  const staticResource = SYSTEM_RESOURCES.find(
    (resource) => resource.resourceSlug === resourceSlug,
  );
  if (staticResource) return staticResource;

  const match = resourceSlug.match(/^guide-([a-z0-9-]+)-(lancer|gerer)$/);
  return match ? getPlannedGuideResource(match[1], match[2] as PlannedGuideKind) : null;
}

export function getSystemResourcesForSystem(systemSlug: string): readonly SystemResource[] {
  const sharedResources = SYSTEM_RESOURCES.filter(
    (resource) => !resource.systemSlugs || resource.systemSlugs.includes(systemSlug),
  );
  const plannedGuides = (["lancer", "gerer"] as const)
    .map((kind) => getPlannedGuideResource(systemSlug, kind))
    .filter((resource): resource is SystemResource => resource !== null);

  return [...sharedResources, ...plannedGuides];
}
