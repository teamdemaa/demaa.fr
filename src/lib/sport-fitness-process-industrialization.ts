import {
  composeProcessDraft,
  type IndustrializedContentItem,
  type IndustrializedProcessDefinition,
  type ProcessContentPatch,
  type ProcessDraft,
} from "@/lib/process-industrialization";

export type SportFitnessRole =
  | "compliance"
  | "decisions"
  | "access"
  | "strategy"
  | "team"
  | "payables"
  | "finance"
  | "acquisition"
  | "complaints"
  | "sales"
  | "maintenance"
  | "planning"
  | "progress";

export type SportFitnessProfile = {
  slug: "coach-sportif" | "salle-de-sport";
  name: string;
  sourceUrl: string;
  researchSources: readonly string[];
  complianceFrame: string;
  qualificationFrame: string;
  decisionFrame: string;
  accessFrame: string;
  strategyFrame: string;
  teamFrame: string;
  payableFrame: string;
  financeFrame: string;
  acquisitionFrame: string;
  complaintFrame: string;
  salesFrame: string;
  maintenanceFrame: string;
  incidentFrame: string;
  planningFrame: string;
  sessionFrame: string;
  progressFrame: string;
};

const processByRole: Record<SportFitnessRole, string> = {
  compliance:
    "process.sport-accompagnement.conformite-metier.tenir-consignes-assurances-et-affichages-en-regle",
  decisions:
    "process.sport-accompagnement.direction.decider-sans-bloquer-les-seances",
  access:
    "process.sport-accompagnement.direction.donner-acces-a-lessentiel",
  strategy:
    "process.sport-accompagnement.direction.savoir-ou-va-lactivite",
  team:
    "process.sport-accompagnement.equipe.organiser-coachs-et-remplacements",
  payables: "process.sport-accompagnement.finance-admin.payer-a-temps",
  finance:
    "process.sport-accompagnement.finance-admin.suivre-abonnements-paiements-et-marge",
  acquisition:
    "process.sport-accompagnement.marketing-vente.attirer-de-nouveaux-adherents-ou-clients",
  complaints:
    "process.sport-accompagnement.marketing-vente.traiter-une-reclamation-client",
  sales:
    "process.sport-accompagnement.marketing-vente.vendre-un-abonnement-ou-accompagnement",
  maintenance:
    "process.sport-accompagnement.operations.entretenir-equipements-et-locaux",
  planning:
    "process.sport-accompagnement.operations.planifier-cours-seances-ou-programmes",
  progress:
    "process.sport-accompagnement.operations.suivre-progression-et-assiduite",
};

const item = (
  type: IndustrializedContentItem["type"],
  label: string,
): IndustrializedContentItem => ({ type, label });

const def = (
  objective: string,
  trigger: string,
  expectedResult: string,
  defaultOwner: string,
  cadence: string,
): IndustrializedProcessDefinition => ({
  objective,
  trigger,
  expectedResult,
  defaultOwner,
  cadence,
});

const definitionsByRole: Record<
  SportFitnessRole,
  IndustrializedProcessDefinition
> = {
  compliance: def(
    "Maintenir les qualifications, assurances, affichages et moyens de secours adaptés aux activités proposées.",
    "Ouverture, nouvelle activité, arrivée d’un coach, échéance ou incident.",
    "Une pratique encadrée dans le périmètre autorisé avec des preuves accessibles.",
    "Référent conformité",
    "Mensuelle",
  ),
  decisions: def(
    "Arbitrer rapidement une séance, un accès ou un incident sans exposer le pratiquant.",
    "Douleur, malaise, matériel défaillant, absence, surcharge ou conflit.",
    "Une mesure immédiate, une décision attribuée et une trace.",
    "Responsable présent",
    "Quotidienne",
  ),
  access: def(
    "Donner accès aux outils et données strictement nécessaires à chaque rôle.",
    "Arrivée, départ, remplacement ou changement d’outil.",
    "Des accès individuels, limités, contrôlés et retirés à temps.",
    "Dirigeant",
    "Mensuelle",
  ),
  strategy: def(
    "Choisir des offres et capacités compatibles avec les compétences, les espaces et la demande.",
    "Revue mensuelle ou évolution importante de l’activité.",
    "Une activité soutenable avec des priorités mesurables.",
    "Dirigeant",
    "Mensuelle",
  ),
  team: def(
    "Assurer chaque créneau avec une personne disponible et qualifiée pour l’activité.",
    "Planning, absence, arrivée ou nouvelle discipline.",
    "Un remplacement validé et des consignes comprises.",
    "Responsable planning",
    "Hebdomadaire",
  ),
  payables: def(
    "Payer les dépenses justifiées et utiles à l’activité.",
    "Facture, note de frais, échéance ou litige.",
    "Une dépense contrôlée, affectée et payée une seule fois.",
    "Responsable administratif",
    "Hebdomadaire",
  ),
  finance: def(
    "Rapprocher ventes, séances, abonnements, paiements et coûts réels.",
    "Clôture, rejet de paiement ou revue d’activité.",
    "Des revenus expliqués et une marge suivie par offre.",
    "Dirigeant",
    "Hebdomadaire",
  ),
  acquisition: def(
    "Attirer des prospects compatibles avec les offres et créneaux disponibles.",
    "Plan commercial, baisse de remplissage ou nouveau créneau.",
    "Des demandes qualifiées avec une origine mesurable.",
    "Responsable commercial",
    "Hebdomadaire",
  ),
  complaints: def(
    "Traiter une réclamation ou un incident à partir de faits conservés.",
    "Insatisfaction, contestation, dommage, douleur ou accident.",
    "Une réponse, une correction et une prévention tracées.",
    "Dirigeant",
    "À chaque réclamation",
  ),
  sales: def(
    "Vendre une formule dont le contenu, le prix et les conditions sont compris.",
    "Demande d’essai, devis, inscription ou renouvellement.",
    "Un accord éclairé avec les informations nécessaires à la pratique.",
    "Responsable commercial",
    "À chaque vente",
  ),
  maintenance: def(
    "Maintenir les équipements et espaces propres, disponibles et sûrs.",
    "Ouverture, contrôle, panne, nettoyage ou incident.",
    "Un défaut isolé, signalé et corrigé avant réutilisation.",
    "Référent matériel",
    "Quotidienne",
  ),
  planning: def(
    "Planifier des séances réalisables avec la bonne capacité, le bon coach et le bon matériel.",
    "Ouverture du planning, réservation, absence ou changement.",
    "Des créneaux confirmés sans conflit de ressource.",
    "Responsable planning",
    "Quotidienne",
  ),
  progress: def(
    "Suivre l’assiduité et la progression sans promettre un résultat ni collecter des données inutiles.",
    "Fin de séance, bilan ou baisse d’engagement.",
    "Des ajustements factuels et une prochaine étape comprise.",
    "Coach référent",
    "À chaque séance",
  ),
};

const contentByRole: Record<SportFitnessRole, IndustrializedContentItem[]> = {
  compliance: [
    item("implementation_action", "Lister activités, lieux, intervenants, qualifications, cartes professionnelles, assurances, affichages et règles de sécurité applicables"),
    item("operational_step", "Vérifier avant toute intervention rémunérée le diplôme, les prérogatives, la carte professionnelle et sa période de validité"),
    item("implementation_action", "Rendre visibles dans l’établissement les diplômes et cartes requis, l’assurance, les consignes de sécurité, les secours et les informations de signalement applicables"),
    item("operational_step", "Maintenir une trousse de secours, un moyen d’alerte et les coordonnées nécessaires pour déclencher rapidement les secours"),
    item("recurring_control", "Contrôler chaque mois échéances, affichages, qualifications, assurance, procédures d’urgence et corrections ouvertes"),
    item("operating_rule", "Ne jamais encadrer contre rémunération hors des prérogatives détenues ni maintenir une pratique lorsque les conditions de sécurité ne sont pas réunies"),
  ],
  decisions: [
    item("implementation_action", "Écrire les décisions autorisées avec seuil d’arrêt, mesure immédiate, personne à prévenir et délai de réponse"),
    item("operational_step", "Qualifier l’événement : douleur, malaise, chute, comportement, surcharge, absence, accès, équipement, météo ou paiement"),
    item("operational_step", "Arrêter l’exercice, sécuriser la zone et appeler les secours lorsque les signes ou circonstances l’exigent"),
    item("operational_step", "Décider reprise adaptée, changement, report, remboursement, exclusion temporaire, déclaration ou escalade"),
    item("recurring_control", "Revoir chaque jour incidents, matériels isolés, séances interrompues, clients à rappeler et décisions en attente"),
  ],
  access: [
    item("implementation_action", "Tenir le registre des accès à la réservation, CRM, paiement, programmes, mesures, messagerie, locaux et comptes administrateurs"),
    item("operational_step", "Attribuer un compte individuel limité aux fonctions, clients, créneaux et données nécessaires"),
    item("operational_step", "Retirer les accès le jour d’un départ, d’une fin de mission ou d’un changement de rôle"),
    item("recurring_control", "Tester chaque mois droits, doubles authentifications, sauvegardes, récupération des comptes et accès physiques"),
    item("operating_rule", "Ne pas conserver une information de santé, une mesure, une photo ou un échange client dans un outil personnel non autorisé"),
  ],
  strategy: [
    item("implementation_action", "Choisir clientèles, disciplines, formats, zones, horaires, capacités et niveaux d’accompagnement prioritaires"),
    item("implementation_action", "Fixer objectifs de prospects, essais, ventes, assiduité, renouvellements, chiffre, satisfaction et marge"),
    item("operational_step", "Comparer chaque nouvelle offre aux qualifications, espaces, équipements, temps, sécurité et demande disponible"),
    item("recurring_control", "Comparer chaque semaine demandes, essais, remplissage, annulations, créneaux sous-utilisés et capacité restante"),
    item("recurring_control", "Comparer chaque mois chiffre, encaissements, rétention, coûts, incidents, satisfaction, trésorerie et marge par offre"),
    item("operating_rule", "Ne pas ouvrir davantage de créneaux ou d’offres lorsque l’encadrement, la sécurité ou la rentabilité minimale ne peuvent pas être tenus"),
  ],
  team: [
    item("implementation_action", "Tenir une matrice avec disciplines, diplômes, cartes professionnelles, prérogatives, disponibilités, restrictions et remplaçants"),
    item("operational_step", "Construire le planning d’accueil et d’encadrement selon affluence, capacité, compétences et temps de préparation"),
    item("operational_step", "Vérifier avant remplacement la qualification exacte, l’assurance, la disponibilité et les limites de l’intervenant"),
    item("operational_step", "Transmettre au remplaçant groupe, niveau, objectif, matériel, consignes, incidents connus et personne à joindre"),
    item("recurring_control", "Contrôler chaque semaine absences, remplacements confirmés, créneaux non couverts, dépassements et repos"),
    item("operating_rule", "Ne pas affecter un coach à une activité que son diplôme ou sa carte professionnelle ne lui permet pas d’encadrer"),
  ],
  payables: [
    item("implementation_action", "Créer l’échéancier des locaux, équipements, logiciels, assurances, énergie, nettoyage, communication, intervenants et taxes"),
    item("operational_step", "Rapprocher commande ou contrat, réception, facture, avoir, responsable et échéance"),
    item("operational_step", "Contrôler les notes de frais avec date, motif, trajet, justificatif et validation"),
    item("recurring_control", "Revoir chaque semaine factures, prélèvements, doublons, litiges et trésorerie disponible"),
    item("operating_rule", "Ne pas payer un achat, une location ou une prestation sans besoin, réception et affectation identifiables"),
  ],
  finance: [
    item("implementation_action", "Définir par formule la preuve attendue : contrat, séance ou période, prix, remise, annulation, suspension, prélèvement et remboursement"),
    item("operational_step", "Rapprocher ventes, inscriptions, séances réalisées, échéances, encaissements, rejets, avoirs et remboursements"),
    item("operational_step", "Relancer un impayé avec montant, motif, échéance, historique et solution prévue au contrat"),
    item("recurring_control", "Contrôler chaque semaine paiements attendus, reçus, rejetés, contestés et encore à traiter"),
    item("recurring_control", "Calculer chaque mois revenu, coût direct, temps, occupation, rétention et marge par offre"),
    item("operating_rule", "Ne pas maintenir un prélèvement, une dette ou une prestation lorsque le contrat et les pièces ne permettent pas de l’expliquer"),
  ],
  acquisition: [
    item("implementation_action", "Choisir les canaux locaux adaptés avec cible, offre, zone, budget, capacité et mesure des demandes"),
    item("operational_step", "Tenir à jour fiche Google, site, horaires, photos, tarifs d’appel et moyens de réservation"),
    item("operational_step", "Qualifier chaque demande avec objectif, niveau, disponibilité, lieu, format, budget et date de démarrage"),
    item("operational_step", "Proposer un essai ou un échange adapté puis confirmer lieu, horaire, tenue, matériel et conditions"),
    item("recurring_control", "Mesurer chaque semaine demandes, rendez-vous, essais, ventes, coût et chiffre attribué par canal"),
    item("operating_rule", "Ne pas publier une promesse de transformation garantie, un prix incomplet ou une capacité d’accueil indisponible"),
  ],
  complaints: [
    item("implementation_action", "Créer un registre avec client, contrat, séance, faits, impact, pièces, mesure immédiate, réponse et correction"),
    item("operational_step", "Accuser réception, sécuriser la personne ou le matériel et conserver les éléments utiles"),
    item("operational_step", "Comparer réservation, contrat, consignes, présence, programme, équipement, échanges et paiements"),
    item("recurring_control", "Analyser chaque mois les récurrences par offre, coach, créneau, équipement, canal et cause"),
    item("operating_rule", "Ne pas minimiser une douleur, un accident, une violence signalée ou une contestation contractuelle"),
  ],
  sales: [
    item("implementation_action", "Décrire chaque offre avec public, contenu, durée, fréquence, prix total, engagement, limites, annulation, suspension et résiliation"),
    item("operational_step", "Qualifier objectif, expérience, contraintes déclarées, disponibilités, préférences et niveau d’autonomie"),
    item("operational_step", "Présenter la formule, les frais, les conditions, le règlement intérieur, les données utilisées et l’interlocuteur"),
    item("operational_step", "Remettre le contrat et les informations nécessaires puis enregistrer l’accord et le moyen de paiement"),
    item("recurring_control", "Relancer essais et propositions avec une prochaine action datée, puis clôturer les refus et demandes sans suite"),
    item("operating_rule", "Ne pas poser de diagnostic, garantir un résultat physique ou masquer une durée d’engagement, un frais ou une condition de sortie"),
  ],
  maintenance: [
    item("implementation_action", "Inventorier équipements, zones, notices, contrôles, nettoyages, responsables, pièces, échéances et solutions de secours"),
    item("operational_step", "Inspecter avant usage stabilité, fixations, câbles, surfaces, réglages, propreté et zone de circulation"),
    item("operational_step", "Nettoyer et ranger le matériel selon son usage, les produits autorisés et la fréquence prévue"),
    item("operational_step", "Isoler immédiatement tout équipement ou espace défectueux avec signalement visible et interdiction d’usage"),
    item("recurring_control", "Contrôler chaque semaine registre d’entretien, défauts ouverts, stocks, secours, ventilation, éclairage et issues"),
    item("operating_rule", "Ne jamais remettre en service un équipement sans contrôle documenté lorsque le défaut peut affecter la sécurité"),
  ],
  planning: [
    item("implementation_action", "Cartographier créneaux, lieux, capacités, clients, niveaux, coachs, équipements, temps de préparation et contraintes"),
    item("operational_step", "Affecter chaque séance selon objectif, niveau, capacité, qualification, espace et matériel disponible"),
    item("operational_step", "Construire la séance avec accueil, préparation, progression, récupération, rangement et marge pour aléas"),
    item("operational_step", "Confirmer réservation, lieu, heure, accès, tenue, matériel et règle d’annulation"),
    item("recurring_control", "Contrôler chaque jour absences, listes d’attente, doublons, capacités dépassées, remplacements et salles indisponibles"),
    item("operating_rule", "Ne pas surcharger un groupe, raccourcir une séquence de sécurité ou planifier deux usages incompatibles de la même ressource"),
  ],
  progress: [
    item("implementation_action", "Créer un suivi minimal avec objectif, point de départ, assiduité, exercices, charge, ressenti, adaptation et prochaine étape"),
    item("operational_step", "Noter après la séance présence, contenu réalisé, difficulté, ressenti, incident et ajustement convenu"),
    item("operational_step", "Comparer régulièrement progression observée, assiduité, récupération déclarée et objectif initial"),
    item("operational_step", "Adapter durée, intensité, exercice ou fréquence dans les limites de compétence et orienter si nécessaire"),
    item("recurring_control", "Repérer chaque semaine absences répétées, stagnation, douleur signalée, baisse d’engagement et renouvellement proche"),
    item("operating_rule", "Ne collecter une donnée ou une mesure que si elle est utile, expliquée, protégée et compatible avec le rôle du coach"),
  ],
};

const buildCoreDraft = (): ProcessDraft => ({
  definitionsById: Object.fromEntries(
    Object.entries(processByRole).map(([role, id]) => [
      id,
      definitionsByRole[role as SportFitnessRole],
    ]),
  ),
  contentByProcessId: Object.fromEntries(
    Object.entries(processByRole).map(([role, id]) => [
      id,
      contentByRole[role as SportFitnessRole],
    ]),
  ),
});

const patch = (
  role: SportFitnessRole,
  contentIndex: number,
  label: string,
): ProcessContentPatch => ({
  processId: processByRole[role],
  contentIndex,
  label,
});

const profilePatches = (
  profile: SportFitnessProfile,
): readonly ProcessContentPatch[] => [
  patch("compliance", 0, `Sécuriser le cadre professionnel : ${profile.complianceFrame}`),
  patch("compliance", 1, `Vérifier chaque intervenant avec : ${profile.qualificationFrame}`),
  patch("decisions", 1, `Qualifier immédiatement : ${profile.decisionFrame}`),
  patch("access", 0, `Tenir les accès critiques : ${profile.accessFrame}`),
  patch("strategy", 0, `Choisir le positionnement : ${profile.strategyFrame}`),
  patch("team", 0, `Organiser l’équipe et les relais avec : ${profile.teamFrame}`),
  patch("payables", 0, `Prévoir et contrôler les dépenses de : ${profile.payableFrame}`),
  patch("finance", 0, `Prouver les revenus selon : ${profile.financeFrame}`),
  patch("acquisition", 0, `Activer les canaux adaptés : ${profile.acquisitionFrame}`),
  patch("complaints", 0, `Tracer les réclamations propres au métier : ${profile.complaintFrame}`),
  patch("sales", 0, `Décrire l’offre avec : ${profile.salesFrame}`),
  patch("maintenance", 0, `Inventorier et entretenir : ${profile.maintenanceFrame}`),
  patch("maintenance", 3, `Isoler et traiter immédiatement : ${profile.incidentFrame}`),
  patch("planning", 0, `Cartographier le planning avec : ${profile.planningFrame}`),
  patch("planning", 2, `Construire chaque séance en intégrant : ${profile.sessionFrame}`),
  patch("progress", 0, `Suivre uniquement les éléments utiles : ${profile.progressFrame}`),
];

export const generateSportFitnessCoreDraft = () => buildCoreDraft();

export const generateSportFitnessDraft = (profile: SportFitnessProfile) =>
  composeProcessDraft(buildCoreDraft(), [
    {
      id: `metier.${profile.slug}`,
      contentPatches: profilePatches(profile),
    },
  ]);

const commonSportSources = [
  "https://www.sports.gouv.fr/educateurs-sportifs",
  "https://www.sports.gouv.fr/declarer-un-incident-ou-accident-corporel-grave-engendre-par-l-activite-3047",
  "https://www.sports.gouv.fr/affichage-obligatoire-sur-la-cellule-signal-sports-9993",
  "https://www.cnil.fr/fr/acteurs-et-secteurs/sport-amateur-professionnel-et-de-haut-niveau",
] as const;

export const sportFitnessProfiles = {
  "coach-sportif": {
    slug: "coach-sportif",
    name: "Coach sportif",
    sourceUrl:
      "https://docs.google.com/spreadsheets/d/14iLpwdOMg7kevNVFDv5VB9ECjK4XzSrBeY5UWOW9nXU/edit",
    researchSources: [
      ...commonSportSources,
      "https://www.sports.gouv.fr/se-declarer-educateur-sportif",
    ],
    complianceFrame: "disciplines réellement encadrées, diplôme donnant les prérogatives correspondantes, carte professionnelle à jour, assurance, lieux autorisés, sécurité, secours et information des clients",
    qualificationFrame: "diplôme ou titre reconnu, prérogatives exactes, carte professionnelle vérifiable et valide, assurance, statut du remplaçant et restrictions éventuelles",
    decisionFrame: "douleur ou malaise, exercice mal exécuté, charge inadaptée, matériel mobile défectueux, météo, lieu dangereux, retard, absence ou demande hors compétence",
    accessFrame: "agenda, CRM, paiement, programmes, bilans, mesures consenties, photos autorisées, messagerie, stockage et comptes administrateurs",
    strategyFrame: "coaching individuel, petits groupes ou entreprises, disciplines, niveaux, rayon de déplacement, lieux partenaires, horaires, capacité et marge par formule",
    teamFrame: "disciplines, prérogatives, cartes professionnelles, assurances, disponibilités, zones, clients suivis et remplaçants ou sous-traitants validés",
    payableFrame: "location de salle, déplacements, logiciel, assurance, communication, petit matériel, formation, comptabilité et interventions de remplaçants",
    financeFrame: "devis ou contrat, forfait acheté, séances planifiées et réalisées, annulations, reports, acomptes, paiements, temps de déplacement et marge",
    acquisitionFrame: "fiche Google, site, réseaux avec preuves réelles, recommandations clients, entreprises, clubs, résidences et lieux partenaires dans la zone servie",
    complaintFrame: "douleur ou blessure déclarée, exercice, niveau d’intensité, promesse de résultat, retard, annulation, lieu, confidentialité, forfait ou remboursement",
    salesFrame: "objectif, niveau, contraintes déclarées, format, lieu, fréquence, nombre de séances, durée, prix total, annulation, report, limite du coaching et orientation si nécessaire",
    maintenanceFrame: "élastiques, haltères, tapis, sangles, petits appareils, chronomètre, téléphone, trousse de secours, sacs, véhicule et matériel du lieu partenaire",
    incidentFrame: "équipement cassé, surface glissante, lieu non autorisé, météo dangereuse, malaise, douleur, chute, perte de matériel ou exposition de données",
    planningFrame: "clients, objectifs, niveaux, adresses, trajets, lieux partenaires, disponibilités, matériel, durée, contraintes et temps de préparation",
    sessionFrame: "accueil, vérification du contexte, échauffement, démonstration, technique, progression, intensité, récupération, rangement et débrief",
    progressFrame: "objectif, assiduité, exercices, charge, répétitions, ressenti d’effort, récupération déclarée, mesure consentie, adaptation et prochaine séance",
  },
  "salle-de-sport": {
    slug: "salle-de-sport",
    name: "Salle de sport",
    sourceUrl:
      "https://docs.google.com/spreadsheets/d/1UyZaofCW0J6o0R9hyj4afJye4MYmnzBxNfvXHwN0e8Y/edit",
    researchSources: [
      ...commonSportSources,
      "https://www.economie.gouv.fr/dgccrf/les-fiches-pratiques/ladhesion-une-salle-de-sport-ou-de-remise-en-forme",
      "https://www.legifrance.gouv.fr/codes/section_lc/LEGITEXT000006071318/LEGISCTA000006167091/2023-07-22",
    ],
    complianceFrame: "statut d’EAPS, assurance, diplômes et cartes professionnelles visibles, règles d’hygiène et de sécurité, tableau des secours, trousse, affichage Signal-Sports, obligations ERP et information consommateur",
    qualificationFrame: "discipline enseignée, diplôme et prérogatives, carte professionnelle ou attestation de stagiaire, validité, assurance et affichage au public",
    decisionFrame: "accident, malaise, machine défectueuse, sol glissant, affluence excessive, coach absent, comportement dangereux, accès frauduleux ou violence signalée",
    accessFrame: "contrôle d’accès, CRM adhérents, caisse, prélèvements SEPA, réservations, planning, vidéosurveillance si utilisée, vestiaires, alarmes et comptes administrateurs",
    strategyFrame: "abonnements, accès libre, cours collectifs et coaching, zones, amplitudes, capacité, affluence, équipements, masse salariale, rétention et marge",
    teamFrame: "accueil, plateau, cours, disciplines, diplômes, cartes professionnelles, amplitudes, pauses, ouvertures, fermetures et remplaçants validés",
    payableFrame: "loyer, énergie, équipements achetés ou loués, maintenance, logiciel, assurance, nettoyage, sécurité, musique, consommables et prestataires",
    financeFrame: "contrat d’adhésion, frais annoncés, période d’engagement, prélèvements, rejets, suspension, résiliation, reconduction, coaching additionnel et remboursement",
    acquisitionFrame: "fiche Google, site, réseaux, offres d’essai, visites, parrainage, entreprises locales, partenaires de quartier et campagnes selon capacité réelle",
    complaintFrame: "accès, propreté, machine, cours annulé, affluence, comportement, accident, prélèvement, engagement, suspension, résiliation ou frais non compris",
    salesFrame: "services inclus, accès et horaires, prix total et frais, durée, reconduction, conditions de suspension et résiliation, règlement intérieur, médiateur et rétractation à distance",
    maintenanceFrame: "machines cardio et musculation, câbles, charges, bancs, sols, miroirs, ventilation, douches, vestiaires, casiers, éclairage, issues, secours et défibrillateur lorsqu’il est installé",
    incidentFrame: "machine ou câble défectueux, charge mal rangée, sol humide, ventilation insuffisante, issue obstruée, vestiaire dangereux, accident ou intrusion",
    planningFrame: "cours, coachs, diplômes, salles, jauges, matériel, ouverture, accueil, nettoyage, maintenance, listes d’attente et pics d’affluence",
    sessionFrame: "ouverture de la zone, contrôle du matériel, accueil, capacité, présence du coach, déroulé, surveillance, rangement, nettoyage et fermeture",
    progressFrame: "fréquentation, assiduité, cours utilisés, coaching réservé, satisfaction, suspension, renouvellement, résiliation et données de performance réellement consenties",
  },
} satisfies Record<string, SportFitnessProfile>;
