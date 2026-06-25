import {
  getDemaaTrainingBySlug,
  getTrainingRecommendationGroup,
  type DemaaTraining,
  type DemaaTrainingSlug,
} from "@/lib/training-catalog";

const MAX_TRAININGS_PER_SYSTEM = 5;
const MAX_TRAININGS_PER_GROUP = 4;

export type GroupedRecommendedTrainings = {
  metier: DemaaTraining[];
  transverse: DemaaTraining[];
};

const DEFAULT_TRAINING_ORDER = [
  "formation-organisation-systeme-process",
  "management-equipe-proximite",
  "communication-professionnelle-equipe",
  "documents-obligations-rgpd",
  "qvct-prevention-rh",
  "ia-pour-tpe-pme",
  "cybersecurite-sensibilisation-equipes",
] satisfies DemaaTrainingSlug[];

const TRAINING_RECOMMENDATIONS_BY_SECTOR: Record<string, readonly DemaaTrainingSlug[]> = {
  "Conseil & services aux entreprises": [
    "vente-bpifrance-universite",
    "vendre-grands-comptes-bpifrance",
    "management-bpifrance-universite",
    "leadership-bpifrance-universite",
    "transformation-digitale-bpifrance",
    "ia-bpifrance-universite",
  ],
  "Tech & Digital": [
    "transformation-digitale-bpifrance",
    "ia-bpifrance-universite",
    "cybersecurite-bpifrance-universite",
    "marketing-ia-bpifrance",
    "documents-obligations-rgpd",
  ],
  "BTP & services techniques": [
    "feebat-renove-rge",
    "aipr-chantier",
    "habilitation-electrique-b0-h0v",
    "travail-hauteur-echafaudage",
    "amiante-prevention-chantier",
    "secourisme-sst",
  ],
  Immobilier: [
    "loi-alur-immobilier",
    "snpi-campus-immobilier",
    "universite-copropriete-unis",
    "documents-obligations-rgpd",
    "vente-relation-client-terrain",
    "communication-professionnelle-equipe",
  ],
  "Hébergement & tourisme": [
    "catalogue-hotels-palaces-umih",
    "operateurs-voyage-umih",
    "service-client-hotellerie-tourisme",
    "permis-exploitation",
    "management-bpifrance-universite",
    "marketing-digital-bpifrance",
  ],
  Patrimoine: [
    "anacofi-presentiels-patrimoine",
    "anacofi-elearning-patrimoine",
    "cncgp-formation-patrimoine",
    "cncgp-calendrier-formation",
    "documents-obligations-rgpd",
  ],
  "Mobilité & logistique": [
    "caces-logistique-manutention",
    "lean-amelioration-continue",
    "habilitation-electrique-b0-h0v",
    "secourisme-sst",
    "management-equipe-proximite",
    "communication-professionnelle-equipe",
    "cybersecurite-sensibilisation-equipes",
  ],
  Restauration: [
    "haccp-hygiene-alimentaire",
    "permis-exploitation",
    "management-operationnel-restauration",
    "accueil-relation-client-restauration",
    "bases-cuisine-restauration",
  ],
  "Commerce & retail": [
    "merchandising-vente-magasin",
    "vente-bpifrance-universite",
    "marketing-digital-bpifrance",
    "management-bpifrance-universite",
    "marketing-ia-bpifrance",
  ],
  "Santé, bien-être & esthétique": [
    "esthetique-hygiene-protocoles",
    "documents-obligations-rgpd",
    "vente-relation-client-terrain",
    "communication-professionnelle-equipe",
    "management-equipe-proximite",
  ],
  "Services aux particuliers": [
    "prevention-risques-domicile-iperia",
    "entretien-cadre-vie-iperia",
    "accompagnement-hygiene-confort-iperia",
    "relations-professionnelles-domicile-iperia",
    "management-equipe-proximite",
  ],
  "Éducation & formation": [
    "qualiopi-pour-organismes-formation",
    "reglementation-organismes-formation",
    "certification-professionnelle-centre-inffo",
    "apprentissage-cfa-centre-inffo",
    "communication-professionnelle-equipe",
  ],
  "Industrie & production": [
    "lean-amelioration-continue",
    "caces-logistique-manutention",
    "habilitation-electrique-b0-h0v",
    "secourisme-sst",
    "cybersecurite-sensibilisation-equipes",
    "management-equipe-proximite",
    "communication-professionnelle-equipe",
  ],
  "Automobile & réparation": [
    "maintenance-automobile-mobipolis",
    "risques-vehicules-electriques-mobipolis",
    "service-apres-vente-mobipolis",
    "carrosserie-mobipolis",
    "habilitation-vehicules-electriques",
    "habilitation-electrique-b0-h0v",
  ],
  "Associations & événements": [
    "portail-formation-benevoles",
    "formation-benevoles-associations-gouv",
    "webinaires-mouvement-associatif",
    "subventions-appels-projets-association",
    "communication-professionnelle-equipe",
    "management-equipe-proximite",
  ],
};

const TRAINING_OVERRIDES_BY_SYSTEM: Record<string, readonly DemaaTrainingSlug[]> = {
  "cabinet-de-conseil": [
    "vendre-grands-comptes-bpifrance",
    "vente-bpifrance-universite",
    "management-bpifrance-universite",
    "leadership-bpifrance-universite",
  ],
  "cabinet-comptable": [
    "parcours-profession-comptable-2030",
    "cap-durabilite-cfpc",
    "deontologie-reglementation-cfpc",
    "paie-cabinet-expertise-comptable-cfpc",
    "evaluation-entreprise-cfpc",
  ],
  freelance: [
    "vente-bpifrance-universite",
    "leadership-bpifrance-universite",
    "ia-bpifrance-universite",
  ],
  "cabinet-davocat": [
    "documents-obligations-rgpd",
    "communication-professionnelle-equipe",
    "management-equipe-proximite",
    "qvct-prevention-rh",
  ],
  "agence-marketing": [
    "marketing-ia-bpifrance",
    "marketing-digital-bpifrance",
    "vente-bpifrance-universite",
    "management-bpifrance-universite",
  ],
  "agence-de-recrutement": [
    "vente-bpifrance-universite",
    "prospection-commerciale-b2b",
    "management-bpifrance-universite",
    "qvct-prevention-rh",
  ],
  "courtier-credit-assurance": [
    "vente-bpifrance-universite",
    "prospection-commerciale-b2b",
    "management-bpifrance-universite",
    "documents-obligations-rgpd",
  ],
  evenementiel: [
    "marketing-digital-bpifrance",
    "vente-bpifrance-universite",
    "management-bpifrance-universite",
    "communication-professionnelle-equipe",
  ],
  notaire: [
    "documents-obligations-rgpd",
    "communication-professionnelle-equipe",
    "management-equipe-proximite",
    "leadership-bpifrance-universite",
  ],
  fleuriste: [
    "merchandising-vente-magasin",
    "vente-bpifrance-universite",
    "marketing-digital-bpifrance",
    "management-bpifrance-universite",
  ],
  "consultant-independant": [
    "vente-bpifrance-universite",
    "leadership-bpifrance-universite",
    "ia-bpifrance-universite",
    "prospection-commerciale-b2b",
  ],
  "cabinet-assurance": [
    "vente-bpifrance-universite",
    "prospection-commerciale-b2b",
    "documents-obligations-rgpd",
    "management-bpifrance-universite",
  ],
  "coach-professionnel": [
    "leadership-bpifrance-universite",
    "communication-professionnelle-equipe",
    "vente-bpifrance-universite",
    "marketing-digital-bpifrance",
  ],
  "entreprise-de-securite": [
    "secourisme-sst",
    "management-equipe-proximite",
    "communication-professionnelle-equipe",
    "qvct-prevention-rh",
  ],
  "daf-externalise": [
    "leadership-bpifrance-universite",
    "management-bpifrance-universite",
    "ia-bpifrance-universite",
    "communication-professionnelle-equipe",
  ],
  "office-manager-externalise": [
    "management-equipe-proximite",
    "communication-professionnelle-equipe",
    "documents-obligations-rgpd",
    "qvct-prevention-rh",
  ],
  "assistant-administratif-externalise": [
    "documents-obligations-rgpd",
    "communication-professionnelle-equipe",
    "management-equipe-proximite",
    "qvct-prevention-rh",
  ],
  "secretariat-externalise": [
    "communication-professionnelle-equipe",
    "documents-obligations-rgpd",
    "management-equipe-proximite",
    "qvct-prevention-rh",
  ],
  "cabinet-rh-externalise": [
    "qvct-prevention-rh",
    "management-bpifrance-universite",
    "leadership-bpifrance-universite",
    "prospection-commerciale-b2b",
  ],
  "gestionnaire-paie-independant": [
    "qvct-prevention-rh",
    "documents-obligations-rgpd",
    "management-equipe-proximite",
    "communication-professionnelle-equipe",
  ],
  "centre-appels-support-client": [
    "communication-professionnelle-equipe",
    "management-equipe-proximite",
    "vente-relation-client-terrain",
    "qvct-prevention-rh",
  ],
  "societe-recouvrement": [
    "communication-professionnelle-equipe",
    "vente-bpifrance-universite",
    "management-equipe-proximite",
    "documents-obligations-rgpd",
  ],
  "societe-domiciliation": [
    "documents-obligations-rgpd",
    "vente-bpifrance-universite",
    "management-equipe-proximite",
    "communication-professionnelle-equipe",
  ],
  "centre-affaires-coworking": [
    "vente-relation-client-terrain",
    "marketing-digital-bpifrance",
    "management-bpifrance-universite",
    "communication-professionnelle-equipe",
  ],
  "cabinet-qhse-conformite": [
    "qvct-prevention-rh",
    "management-bpifrance-universite",
    "communication-professionnelle-equipe",
    "documents-obligations-rgpd",
  ],
  "bureau-etudes": [
    "management-equipe-proximite",
    "communication-professionnelle-equipe",
    "documents-obligations-rgpd",
    "lean-amelioration-continue",
  ],
  "cabinet-etudes": [
    "management-equipe-proximite",
    "communication-professionnelle-equipe",
    "documents-obligations-rgpd",
    "leadership-bpifrance-universite",
  ],
  "agence-seo": [
    "marketing-digital-bpifrance",
    "marketing-ia-bpifrance",
    "vente-bpifrance-universite",
    "transformation-digitale-bpifrance",
  ],
  "agence-acquisition-paid-ads": [
    "marketing-digital-bpifrance",
    "marketing-ia-bpifrance",
    "vente-bpifrance-universite",
    "management-bpifrance-universite",
  ],
  "studio-branding-design": [
    "marketing-digital-bpifrance",
    "marketing-ia-bpifrance",
    "vente-bpifrance-universite",
    "leadership-bpifrance-universite",
  ],
  "agence-web": [
    "marketing-ia-bpifrance",
    "transformation-digitale-bpifrance",
    "ia-bpifrance-universite",
    "cybersecurite-bpifrance-universite",
  ],
  saas: [
    "transformation-digitale-bpifrance",
    "ia-bpifrance-universite",
    "cybersecurite-bpifrance-universite",
    "marketing-ia-bpifrance",
  ],
  "reparation-informatique-mobile": [
    "cybersecurite-bpifrance-universite",
    "transformation-digitale-bpifrance",
    "vente-relation-client-terrain",
    "management-equipe-proximite",
  ],
  "photographe-videaste": [
    "marketing-digital-bpifrance",
    "marketing-ia-bpifrance",
    "vente-bpifrance-universite",
    "leadership-bpifrance-universite",
  ],
  "infogerance-informatique": [
    "cybersecurite-bpifrance-universite",
    "transformation-digitale-bpifrance",
    "management-bpifrance-universite",
    "vente-bpifrance-universite",
  ],
  "cybersecurite-pme": [
    "cybersecurite-bpifrance-universite",
    "transformation-digitale-bpifrance",
    "management-bpifrance-universite",
    "vente-bpifrance-universite",
  ],
  "integrateur-crm-erp": [
    "transformation-digitale-bpifrance",
    "ia-bpifrance-universite",
    "management-bpifrance-universite",
    "vente-bpifrance-universite",
  ],
  "consultant-data-bi": [
    "ia-bpifrance-universite",
    "transformation-digitale-bpifrance",
    "cybersecurite-bpifrance-universite",
    "leadership-bpifrance-universite",
  ],
  batiment: [
    "feebat-renove-rge",
    "aipr-chantier",
    "habilitation-electrique-b0-h0v",
    "travail-hauteur-echafaudage",
    "amiante-prevention-chantier",
  ],
  "nettoyage-professionnel": [
    "secourisme-sst",
    "management-equipe-proximite",
    "communication-professionnelle-equipe",
    "qvct-prevention-rh",
    "documents-obligations-rgpd",
  ],
  "architecte-maitre-oeuvre": [
    "feebat-renove-rge",
    "aipr-chantier",
    "management-equipe-proximite",
    "communication-professionnelle-equipe",
    "documents-obligations-rgpd",
  ],
  geometre: [
    "aipr-chantier",
    "management-equipe-proximite",
    "communication-professionnelle-equipe",
    "documents-obligations-rgpd",
    "secourisme-sst",
  ],
  "agence-immobiliere": [
    "loi-alur-immobilier",
    "snpi-campus-immobilier",
    "vente-relation-client-terrain",
    "communication-professionnelle-equipe",
  ],
  "gestion-locative": [
    "loi-alur-immobilier",
    "snpi-campus-immobilier",
    "universite-copropriete-unis",
    "documents-obligations-rgpd",
  ],
  "marchand-de-biens": [
    "loi-alur-immobilier",
    "snpi-campus-immobilier",
    "vente-relation-client-terrain",
    "documents-obligations-rgpd",
  ],
  "diagnostiqueur-immobilier": [
    "loi-alur-immobilier",
    "snpi-campus-immobilier",
    "documents-obligations-rgpd",
    "vente-relation-client-terrain",
  ],
  "chasseur-immobilier": [
    "loi-alur-immobilier",
    "snpi-campus-immobilier",
    "vente-relation-client-terrain",
    "communication-professionnelle-equipe",
  ],
  syndic: [
    "loi-alur-immobilier",
    "universite-copropriete-unis",
    "snpi-campus-immobilier",
    "documents-obligations-rgpd",
  ],
  "gestionnaire-de-patrimoine": [
    "anacofi-presentiels-patrimoine",
    "anacofi-elearning-patrimoine",
    "cncgp-formation-patrimoine",
    "cncgp-calendrier-formation",
  ],
  "hotel-hebergement-independant": [
    "catalogue-hotels-palaces-umih",
    "service-client-hotellerie-tourisme",
    "management-bpifrance-universite",
    "marketing-digital-bpifrance",
  ],
  "conciergerie-airbnb": [
    "service-client-hotellerie-tourisme",
    "marketing-digital-bpifrance",
    "management-bpifrance-universite",
    "catalogue-hotels-palaces-umih",
  ],
  "agence-de-voyage": [
    "operateurs-voyage-umih",
    "vente-bpifrance-universite",
    "marketing-digital-bpifrance",
    "management-bpifrance-universite",
  ],
  "transport-de-marchandise": [
    "caces-logistique-manutention",
    "secourisme-sst",
    "lean-amelioration-continue",
  ],
  "livraison-dernier-kilometre": [
    "caces-logistique-manutention",
    "communication-professionnelle-equipe",
    "management-equipe-proximite",
  ],
  restaurant: [
    "haccp-hygiene-alimentaire",
    "permis-exploitation",
    "management-operationnel-restauration",
    "accueil-relation-client-restauration",
    "bases-cuisine-restauration",
  ],
  "fast-food": [
    "haccp-hygiene-alimentaire",
    "management-operationnel-restauration",
    "accueil-relation-client-restauration",
    "bases-cuisine-restauration",
  ],
  traiteur: [
    "haccp-hygiene-alimentaire",
    "bases-cuisine-restauration",
    "management-operationnel-restauration",
    "accueil-relation-client-restauration",
  ],
  "dark-kitchen": [
    "haccp-hygiene-alimentaire",
    "management-operationnel-restauration",
    "bases-cuisine-restauration",
    "marketing-digital-bpifrance",
  ],
  "bar-cafe": [
    "permis-exploitation",
    "haccp-hygiene-alimentaire",
    "accueil-relation-client-restauration",
    "management-operationnel-restauration",
  ],
  "food-truck": [
    "haccp-hygiene-alimentaire",
    "permis-exploitation",
    "accueil-relation-client-restauration",
    "marketing-digital-bpifrance",
  ],
  "organisme-de-formation": [
    "qualiopi-pour-organismes-formation",
    "reglementation-organismes-formation",
    "certification-professionnelle-centre-inffo",
    "communication-professionnelle-equipe",
  ],
  cfa: [
    "apprentissage-cfa-centre-inffo",
    "qualiopi-pour-organismes-formation",
    "reglementation-organismes-formation",
    "certification-professionnelle-centre-inffo",
  ],
  "formation-en-ligne": [
    "qualiopi-pour-organismes-formation",
    "certification-professionnelle-centre-inffo",
    "marketing-digital-bpifrance",
    "ia-bpifrance-universite",
  ],
  "auto-ecole": [
    "communication-professionnelle-equipe",
    "vente-relation-client-terrain",
    "management-equipe-proximite",
    "documents-obligations-rgpd",
  ],
  association: [
    "portail-formation-benevoles",
    "formation-benevoles-associations-gouv",
    "webinaires-mouvement-associatif",
    "subventions-appels-projets-association",
  ],
  "garage-automobile": [
    "maintenance-automobile-mobipolis",
    "risques-vehicules-electriques-mobipolis",
    "service-apres-vente-mobipolis",
    "habilitation-vehicules-electriques",
  ],
  "production-industrie": [
    "lean-amelioration-continue",
    "habilitation-electrique-b0-h0v",
    "secourisme-sst",
    "management-equipe-proximite",
  ],
  "commerce-de-detail": [
    "merchandising-vente-magasin",
    "vente-bpifrance-universite",
    "management-bpifrance-universite",
  ],
  "boutique-specialisee": [
    "merchandising-vente-magasin",
    "vente-bpifrance-universite",
    "marketing-digital-bpifrance",
  ],
  "e-commerce": [
    "marketing-digital-bpifrance",
    "marketing-ia-bpifrance",
    "transformation-digitale-bpifrance",
    "vente-bpifrance-universite",
  ],
  "commerce-alimentaire": [
    "haccp-hygiene-alimentaire",
    "vente-bpifrance-universite",
    "management-bpifrance-universite",
  ],
  carrosserie: [
    "carrosserie-mobipolis",
    "risques-vehicules-electriques-mobipolis",
    "service-apres-vente-mobipolis",
  ],
  "salon-de-coiffure": [
    "creer-reprendre-salon-coiffure-unec",
    "cqp-manager-salon-coiffure",
    "certificat-cheveux-boucles-crepus-unec",
  ],
  "institut-de-beaute": [
    "head-spa-cnaib",
    "beaute-regard-cnaib",
    "marketing-vente-esthetique-cnaib",
  ],
  esthetique: [
    "head-spa-cnaib",
    "epilation-ipl-laser-cnaib",
    "beaute-regard-cnaib",
  ],
  "cabinet-medical": [
    "recherche-action-dpc-officiel",
    "catalogue-medecin-santeacademie",
    "medecin-liberal-santeacademie",
    "documents-obligations-rgpd",
    "communication-professionnelle-equipe",
    "management-equipe-proximite",
    "qvct-prevention-rh",
  ],
  "cabinet-paramedical": [
    "recherche-action-dpc-officiel",
    "infirmier-liberal-santeacademie",
    "catalogue-soignants-santeacademie",
    "documents-obligations-rgpd",
    "communication-professionnelle-equipe",
    "management-equipe-proximite",
    "qvct-prevention-rh",
  ],
  "salle-de-sport": [
    "bpjeps-af-encp",
    "cqp-if-encp",
    "accueil-gestion-club-sport-encp",
  ],
  "aide-a-domicile-menage": [
    "prevention-risques-domicile-iperia",
    "entretien-cadre-vie-iperia",
    "accompagnement-hygiene-confort-iperia",
    "relations-professionnelles-domicile-iperia",
  ],
  "services-a-la-personne": [
    "prevention-risques-domicile-iperia",
    "relations-professionnelles-domicile-iperia",
    "relation-familles-services-personne",
    "management-equipe-proximite",
  ],
  boulangerie: [
    "haccp-hygiene-alimentaire",
    "merchandising-vente-magasin",
    "vente-bpifrance-universite",
    "management-bpifrance-universite",
  ],
  librairie: [
    "merchandising-vente-magasin",
    "vente-bpifrance-universite",
    "marketing-digital-bpifrance",
    "management-bpifrance-universite",
  ],
  "tabac-presse-point-relais": [
    "merchandising-vente-magasin",
    "vente-bpifrance-universite",
    "management-bpifrance-universite",
    "marketing-digital-bpifrance",
  ],
  "transport-de-personnes": [
    "secourisme-sst",
    "communication-professionnelle-equipe",
    "management-equipe-proximite",
    "documents-obligations-rgpd",
    "cybersecurite-sensibilisation-equipes",
  ],
  vtc: [
    "communication-professionnelle-equipe",
    "vente-relation-client-terrain",
    "documents-obligations-rgpd",
    "management-equipe-proximite",
    "secourisme-sst",
  ],
  demenagement: [
    "secourisme-sst",
    "management-equipe-proximite",
    "communication-professionnelle-equipe",
    "caces-logistique-manutention",
  ],
  "infirmier-liberal": [
    "recherche-action-dpc-officiel",
    "infirmier-liberal-santeacademie",
    "catalogue-soignants-santeacademie",
    "documents-obligations-rgpd",
    "communication-professionnelle-equipe",
  ],
  dentiste: [
    "recherche-action-dpc-officiel",
    "catalogue-medecin-santeacademie",
    "medecin-liberal-santeacademie",
    "documents-obligations-rgpd",
    "management-equipe-proximite",
  ],
  pharmacie: [
    "recherche-action-dpc-officiel",
    "catalogue-medecin-santeacademie",
    "management-equipe-proximite",
    "documents-obligations-rgpd",
    "communication-professionnelle-equipe",
  ],
  veterinaire: [
    "catalogue-medecin-santeacademie",
    "management-equipe-proximite",
    "communication-professionnelle-equipe",
    "documents-obligations-rgpd",
    "cybersecurite-sensibilisation-equipes",
  ],
  opticien: [
    "vente-relation-client-terrain",
    "management-equipe-proximite",
    "communication-professionnelle-equipe",
    "documents-obligations-rgpd",
  ],
  "coach-sportif": [
    "bpjeps-af-encp",
    "cqp-if-encp",
    "accueil-gestion-club-sport-encp",
    "vente-relation-client-terrain",
  ],
  osteopathe: [
    "catalogue-soignants-santeacademie",
    "documents-obligations-rgpd",
    "communication-professionnelle-equipe",
    "management-equipe-proximite",
    "qvct-prevention-rh",
  ],
  psychologue: [
    "catalogue-soignants-santeacademie",
    "documents-obligations-rgpd",
    "communication-professionnelle-equipe",
    "management-equipe-proximite",
    "qvct-prevention-rh",
  ],
};

function getOrderedRecommendedTrainingsForSystem(
  systemSlug: string,
  sectorLabel: string,
): DemaaTraining[] {
  const systemOverrides = TRAINING_OVERRIDES_BY_SYSTEM[systemSlug] ?? [];
  const sectorRecommendations = TRAINING_RECOMMENDATIONS_BY_SECTOR[sectorLabel] ?? DEFAULT_TRAINING_ORDER;
  const pinnedTrainings = ["formation-organisation-systeme-process"] satisfies DemaaTrainingSlug[];
  const sectorTransverseRecommendations = sectorRecommendations.filter((slug) => {
    const training = getDemaaTrainingBySlug(slug);
    return training ? getTrainingRecommendationGroup(training) === "transverse" : false;
  });
  const slugs = systemOverrides.length
    ? [...pinnedTrainings, ...systemOverrides, ...sectorTransverseRecommendations, ...DEFAULT_TRAINING_ORDER]
    : [...pinnedTrainings, ...sectorRecommendations];

  const seen = new Set<string>();
  const trainings: DemaaTraining[] = [];

  for (const slug of slugs) {
    if (seen.has(slug)) continue;
    const training = getDemaaTrainingBySlug(slug);
    if (!training) continue;
    trainings.push(training);
    seen.add(slug);
  }

  return trainings;
}

export function getGroupedRecommendedTrainingsForSystem(
  systemSlug: string,
  sectorLabel: string,
  limitPerGroup = MAX_TRAININGS_PER_GROUP,
): GroupedRecommendedTrainings {
  const grouped: GroupedRecommendedTrainings = {
    metier: [],
    transverse: [],
  };

  for (const training of getOrderedRecommendedTrainingsForSystem(systemSlug, sectorLabel)) {
    const group = getTrainingRecommendationGroup(training);

    if (grouped[group].length >= limitPerGroup) {
      continue;
    }

    grouped[group].push(training);

    if (
      grouped.metier.length >= limitPerGroup &&
      grouped.transverse.length >= limitPerGroup
    ) {
      break;
    }
  }

  return grouped;
}

export function getRecommendedTrainingsForSystem(
  systemSlug: string,
  sectorLabel: string,
  limit = MAX_TRAININGS_PER_SYSTEM,
): DemaaTraining[] {
  const grouped = getGroupedRecommendedTrainingsForSystem(
    systemSlug,
    sectorLabel,
    Math.max(limit, MAX_TRAININGS_PER_GROUP),
  );

  return [...grouped.metier, ...grouped.transverse].slice(0, limit);
}
