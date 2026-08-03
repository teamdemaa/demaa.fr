import "server-only";

import type {
  SolutionPlacement,
  SolutionResource,
} from "@/lib/solution-registry-contract";
const PILOT_REVIEW = {
  reviewer: "Master Demaa",
  reviewedAt: "2026-08-03T20:00:00.000Z",
  expiresAt: "2027-02-03T00:00:00.000Z",
} as const;

const THIRD_PARTY_BLOCKERS = ["commercial-relationship-unconfirmed"] as const;

type DraftResourceInput = Readonly<{
  resourceSlug: string;
  resourceType: "software" | "provider" | "directory";
  name: string;
  description: string;
  href: string;
  officialSource: string;
  capturedAt: string;
  claim: string;
  publicationBlockers?: readonly string[];
}>;

function draftResource(input: DraftResourceInput): SolutionResource {
  return {
    ...PILOT_REVIEW,
    evidence: [{
      evidenceId: `pilot-${input.resourceSlug}-official-2026`,
      sourceRef: input.officialSource,
      claim: input.claim,
      evidenceType: "official_product_page",
      capturedAt: input.capturedAt,
    }],
    resourceSlug: input.resourceSlug,
    resourceType: input.resourceType,
    name: input.name,
    description: input.description,
    interactionMode: "detail",
    href: input.href,
    commercialRelationship: "unknown",
    status: "draft",
    resourceVersion: "pilot.v1",
    publicationBlockers: input.publicationBlockers ?? THIRD_PARTY_BLOCKERS,
  };
}

type DraftPlacementInput = Readonly<{
  systemSlug: "batiment" | "cabinet-comptable" | "agence-marketing";
  resourceSlug: string;
  rank: number;
  section: "software" | "providers";
  usage: string;
  fitRationale: string;
  fitConstraints: readonly string[];
  publicationBlockers?: readonly string[];
}>;

function draftPlacement(input: DraftPlacementInput): SolutionPlacement {
  return {
    ...PILOT_REVIEW,
    evidence: [{
      evidenceId: `pilot-${input.systemSlug}-${input.resourceSlug}-fit-2026`,
      sourceRef: `audit://solutions-pilots/${input.systemSlug}/${input.resourceSlug}`,
      claim: input.fitRationale,
      evidenceType: "internal_test",
      capturedAt: "2026-08-03T19:00:00.000Z",
    }],
    placementId: `${input.systemSlug}:${input.resourceSlug}:${input.section}:${input.rank}`,
    systemSlug: input.systemSlug,
    resourceSlug: input.resourceSlug,
    rank: input.rank,
    section: input.section,
    usage: input.usage,
    fitRationale: input.fitRationale,
    fitConstraints: input.fitConstraints,
    commercialRelationship: "unknown",
    status: "draft",
    placementVersion: "pilot.v1",
    publicationBlockers: input.publicationBlockers ?? THIRD_PARTY_BLOCKERS,
  };
}

export const PILOT_SOLUTION_DRAFT_RESOURCES: readonly SolutionResource[] = [
  draftResource({
    resourceSlug: "obat",
    resourceType: "software",
    name: "Obat",
    description: "Devis, facturation et suivi commercial conçus pour les professionnels du bâtiment.",
    href: "/annuaire-outils/obat",
    officialSource: "https://www.obat.fr/",
    capturedAt: "2026-07-02T00:00:00.000Z",
    claim: "La page officielle présente Obat comme une solution de gestion pour les professionnels du bâtiment.",
  }),
  draftResource({
    resourceSlug: "fieldwire",
    resourceType: "software",
    name: "Fieldwire",
    description: "Plans, tâches, réserves, photos et rapports pour coordonner le chantier et le bureau.",
    href: "/annuaire-outils/fieldwire",
    officialSource: "https://www.fieldwire.com/fr/",
    capturedAt: "2026-07-02T00:00:00.000Z",
    claim: "La page officielle documente les fonctions de suivi et de coordination de chantier de Fieldwire.",
  }),
  draftResource({
    resourceSlug: "graneet",
    resourceType: "software",
    name: "Graneet",
    description: "ERP BTP pour suivre chiffrage, achats, situations, main-d’œuvre et marges chantier.",
    href: "/annuaire-outils/graneet",
    officialSource: "https://www.graneet.fr/",
    capturedAt: "2026-07-02T00:00:00.000Z",
    claim: "La page officielle présente Graneet comme un ERP de gestion et de pilotage financier pour le BTP.",
  }),
  draftResource({
    resourceSlug: "point-p",
    resourceType: "provider",
    name: "Point.P",
    description: "Matériaux de construction, négoce bâtiment et livraison chantier.",
    href: "/annuaire-fournisseurs/point-p",
    officialSource: "https://www.pointp.fr/",
    capturedAt: "2026-08-03T00:00:00.000Z",
    claim: "Le site officiel présente l’offre de matériaux et services de Point.P pour les professionnels du bâtiment.",
  }),
  draftResource({
    resourceSlug: "kiloutou",
    resourceType: "provider",
    name: "Kiloutou",
    description: "Location de matériel et d’équipements pour les besoins ponctuels des chantiers.",
    href: "/annuaire-fournisseurs/kiloutou",
    officialSource: "https://www.kiloutou.fr/",
    capturedAt: "2026-08-03T00:00:00.000Z",
    claim: "Le site officiel présente les matériels professionnels proposés à la location par Kiloutou.",
  }),
  draftResource({
    resourceSlug: "capeb",
    resourceType: "directory",
    name: "CAPEB",
    description: "Organisation professionnelle de référence pour l’artisanat du bâtiment.",
    href: "/annuaire-reseaux-pro/capeb",
    officialSource: "https://www.capeb.fr/",
    capturedAt: "2026-08-03T00:00:00.000Z",
    claim: "Le site officiel décrit l’accompagnement et la représentation proposés par la CAPEB aux artisans du bâtiment.",
  }),
  draftResource({
    resourceSlug: "tiimora",
    resourceType: "software",
    name: "Tiimora",
    description: "Application pour centraliser clients, demandes, documents, signatures et suivis du cabinet.",
    href: "/annuaire-outils/tiimora",
    officialSource: "https://app.tiimora.com/",
    capturedAt: "2026-07-09T00:00:00.000Z",
    claim: "L’application officielle Tiimora est accessible ; son adéquation précise aux cabinets reste à valider avant publication.",
  }),
  draftResource({
    resourceSlug: "pennylane",
    resourceType: "software",
    name: "Pennylane",
    description: "Production comptable, gestion financière, achats, facturation et trésorerie.",
    href: "/annuaire-outils/pennylane",
    officialSource: "https://www.pennylane.com/",
    capturedAt: "2026-07-02T00:00:00.000Z",
    claim: "La page officielle présente les fonctions comptables et financières proposées par Pennylane.",
  }),
  draftResource({
    resourceSlug: "silae",
    resourceType: "software",
    name: "Silae",
    description: "Solution de paie et de gestion RH destinée notamment aux cabinets et équipes sociales.",
    href: "/annuaire-outils/silae",
    officialSource: "https://www.silae.fr/",
    capturedAt: "2026-07-02T00:00:00.000Z",
    claim: "La page officielle présente les fonctions de paie et de gestion RH de Silae.",
  }),
  draftResource({
    resourceSlug: "airtable",
    resourceType: "software",
    name: "Airtable",
    description: "Base collaborative pour structurer les projets, contenus, campagnes et opérations d’une agence.",
    href: "/annuaire-outils/airtable",
    officialSource: "https://www.airtable.com/",
    capturedAt: "2026-07-02T00:00:00.000Z",
    claim: "La page officielle documente les bases, vues, formulaires, automatisations et interfaces Airtable.",
  }),
  draftResource({
    resourceSlug: "canva",
    resourceType: "software",
    name: "Canva",
    description: "Création collaborative de visuels, présentations, documents et supports marketing.",
    href: "/annuaire-outils/canva",
    officialSource: "https://www.canva.com/",
    capturedAt: "2026-07-02T00:00:00.000Z",
    claim: "La page officielle présente les fonctions de création et de collaboration de Canva.",
  }),
  draftResource({
    resourceSlug: "brevo",
    resourceType: "software",
    name: "Brevo",
    description: "E-mailing, SMS, automatisation marketing et CRM pour gérer les campagnes et les relances.",
    href: "/annuaire-outils/brevo",
    officialSource: "https://www.brevo.com/fr/",
    capturedAt: "2026-07-02T00:00:00.000Z",
    claim: "La page officielle présente les fonctions d’e-mailing, SMS, automatisation et CRM de Brevo.",
  }),
  draftResource({
    resourceSlug: "metricool",
    resourceType: "software",
    name: "Metricool",
    description: "Planification, analyse et reporting des réseaux sociaux et campagnes digitales.",
    href: "/annuaire-outils/metricool",
    officialSource: "https://metricool.com/fr/",
    capturedAt: "2026-07-02T00:00:00.000Z",
    claim: "La page officielle présente les fonctions de planification, analyse et reporting de Metricool.",
  }),
  draftResource({
    resourceSlug: "chatgpt",
    resourceType: "software",
    name: "ChatGPT",
    description: "Assistant IA pour rédiger, structurer, analyser et accélérer les travaux de l’agence.",
    href: "/annuaire-outils/chatgpt",
    officialSource: "https://chatgpt.com/overview/",
    capturedAt: "2026-07-02T00:00:00.000Z",
    claim: "La page officielle présente les fonctions de rédaction, recherche, analyse de fichiers et collaboration de ChatGPT.",
  }),
];

export const PILOT_SOLUTION_DRAFT_PLACEMENTS: readonly SolutionPlacement[] = [
  draftPlacement({
    systemSlug: "batiment",
    resourceSlug: "obat",
    rank: 2,
    section: "software",
    usage: "Préparer les devis, facturer les chantiers et suivre le cycle commercial.",
    fitRationale: "Obat couvre le besoin de gestion commerciale quotidien d’une entreprise du bâtiment.",
    fitConstraints: ["Vérifier les fonctions et intégrations nécessaires avant choix.", "Ne remplace pas un ERP chantier complet."],
  }),
  draftPlacement({
    systemSlug: "batiment",
    resourceSlug: "fieldwire",
    rank: 3,
    section: "software",
    usage: "Partager plans, tâches, réserves, photos et rapports avec les équipes terrain.",
    fitRationale: "Fieldwire répond au besoin de coordination opérationnelle entre chantier et bureau.",
    fitConstraints: ["Nécessite une adoption par les équipes terrain.", "Ne couvre pas le pilotage financier complet."],
  }),
  draftPlacement({
    systemSlug: "batiment",
    resourceSlug: "graneet",
    rank: 4,
    section: "software",
    usage: "Piloter les achats, situations, coûts, main-d’œuvre et marges par chantier.",
    fitRationale: "Graneet correspond aux entreprises BTP qui ont besoin d’un pilotage de rentabilité plus structuré.",
    fitConstraints: ["Dimensionnement et accompagnement de déploiement à valider.", "Peut être disproportionné pour une très petite structure."],
  }),
  draftPlacement({
    systemSlug: "batiment",
    resourceSlug: "point-p",
    rank: 1,
    section: "providers",
    usage: "S’approvisionner en matériaux et organiser les livraisons chantier.",
    fitRationale: "Point.P constitue une option concrète de négoce généraliste pour les besoins récurrents du BTP.",
    fitConstraints: ["Disponibilité, tarifs et conditions varient selon l’agence et le compte professionnel."],
  }),
  draftPlacement({
    systemSlug: "batiment",
    resourceSlug: "kiloutou",
    rank: 2,
    section: "providers",
    usage: "Louer le matériel utile ponctuellement plutôt que l’acheter sans usage régulier.",
    fitRationale: "Kiloutou répond aux besoins variables d’équipement et de matériel de chantier.",
    fitConstraints: ["Comparer coût total, disponibilité, transport, assurance et durée de location."],
  }),
  draftPlacement({
    systemSlug: "batiment",
    resourceSlug: "capeb",
    rank: 3,
    section: "providers",
    usage: "Accéder à un réseau métier, de la veille et un accompagnement adapté à l’artisanat du bâtiment.",
    fitRationale: "La CAPEB apporte un point d’appui professionnel distinct d’un fournisseur commercial.",
    fitConstraints: ["Services et conditions d’adhésion à vérifier auprès de la CAPEB locale."],
  }),
  draftPlacement({
    systemSlug: "cabinet-comptable",
    resourceSlug: "tiimora",
    rank: 2,
    section: "software",
    usage: "Centraliser les clients, demandes, documents, signatures et suivis du cabinet.",
    fitRationale: "Tiimora est conçu pour structurer les échanges et la production d’un cabinet comptable.",
    fitConstraints: ["Valider les modules, droits d’accès et intégrations nécessaires au cabinet."],
  }),
  draftPlacement({
    systemSlug: "cabinet-comptable",
    resourceSlug: "pennylane",
    rank: 3,
    section: "software",
    usage: "Gérer la production comptable et partager les données financières avec les clients.",
    fitRationale: "Pennylane couvre le socle comptable et financier attendu dans de nombreux cabinets.",
    fitConstraints: ["Valider les modules, migrations, intégrations et conditions adaptés au cabinet.", "Ne couvre pas à lui seul tous les besoins sociaux."],
  }),
  draftPlacement({
    systemSlug: "cabinet-comptable",
    resourceSlug: "silae",
    rank: 4,
    section: "software",
    usage: "Produire la paie et structurer les opérations sociales du cabinet.",
    fitRationale: "Silae répond au besoin spécialisé de paie et de gestion sociale.",
    fitConstraints: ["Vérifier le modèle d’accès, la formation et le périmètre des modules retenus."],
  }),
  draftPlacement({
    systemSlug: "agence-marketing",
    resourceSlug: "airtable",
    rank: 2,
    section: "software",
    usage: "Structurer les projets, calendriers éditoriaux, campagnes, livrables et validations.",
    fitRationale: "Airtable offre un socle flexible pour coordonner les opérations d’une agence sans imposer ClickUp.",
    fitConstraints: ["Définir une gouvernance des bases, droits et automatisations.", "Éviter une architecture trop complexe à maintenir."],
  }),
  draftPlacement({
    systemSlug: "agence-marketing",
    resourceSlug: "canva",
    rank: 3,
    section: "software",
    usage: "Produire et décliner rapidement les supports visuels des clients.",
    fitRationale: "Canva facilite une production visuelle collaborative et répétable.",
    fitConstraints: ["Ne remplace pas une direction artistique ou une identité de marque complète."],
  }),
  draftPlacement({
    systemSlug: "agence-marketing",
    resourceSlug: "brevo",
    rank: 4,
    section: "software",
    usage: "Gérer les campagnes e-mail, SMS, automatisations simples et relances CRM.",
    fitRationale: "Brevo couvre un besoin fréquent d’activation et de suivi marketing pour les clients d’une agence.",
    fitConstraints: ["Vérifier volumes, consentement, délivrabilité et niveau d’automatisation requis."],
  }),
  draftPlacement({
    systemSlug: "agence-marketing",
    resourceSlug: "metricool",
    rank: 5,
    section: "software",
    usage: "Planifier les publications et consolider l’analyse et le reporting social media.",
    fitRationale: "Metricool répond au besoin de planification et de mesure multi-réseaux d’une agence.",
    fitConstraints: ["Ne remplace pas la stratégie, la création des contenus ni la validation client."],
  }),
  draftPlacement({
    systemSlug: "agence-marketing",
    resourceSlug: "chatgpt",
    rank: 6,
    section: "software",
    usage: "Préparer des angles, synthèses, brouillons et analyses avec validation humaine.",
    fitRationale: "ChatGPT peut accélérer les tâches de recherche, structuration et rédaction d’une agence.",
    fitConstraints: ["Ne pas transmettre de données clients sensibles sans cadre adapté.", "Faire vérifier les faits, droits, ton et livrables par une personne responsable."],
  }),
];

export type PilotSolutionUnmetNeed = Readonly<{
  needId: string;
  systemSlug: "batiment" | "cabinet-comptable";
  label: string;
  status: "unmet";
  resourceSlug: null;
  commercialRelationship: "unknown";
  publicationBlockers: readonly string[];
}>;

export const PILOT_SOLUTION_UNMET_NEEDS: readonly PilotSolutionUnmetNeed[] = [
  {
    needId: "need:batiment:reponse-appels-offres",
    systemSlug: "batiment",
    label: "Réponse aux appels d’offres",
    status: "unmet",
    resourceSlug: null,
    commercialRelationship: "unknown",
    publicationBlockers: [
      "provider-unidentified",
      "commercial-relationship-unconfirmed",
    ],
  },
  {
    needId: "need:cabinet-comptable:delegation-juridique",
    systemSlug: "cabinet-comptable",
    label: "Délégation juridique pour le cabinet",
    status: "unmet",
    resourceSlug: null,
    commercialRelationship: "unknown",
    publicationBlockers: [
      "provider-unidentified",
      "commercial-relationship-unconfirmed",
      "regulated-scope-review-required",
    ],
  },
];
