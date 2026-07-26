import {
  composeProcessDraft,
  type IndustrializedContentItem,
  type IndustrializedProcessDefinition,
  type ProcessContentPatch,
  type ProcessDraft,
} from "@/lib/process-industrialization";

type TrainingProcessRole =
  | "cap"
  | "decisions"
  | "access"
  | "visibility"
  | "acquisition"
  | "employers"
  | "sell"
  | "loyalty"
  | "complaint"
  | "design"
  | "dossiers"
  | "plan"
  | "deliver"
  | "track"
  | "platform"
  | "update"
  | "team"
  | "onboard"
  | "profitability"
  | "payables"
  | "receivables"
  | "refunds"
  | "compliance"
  | "obligations"
  | "results";

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
  TrainingProcessRole,
  IndustrializedProcessDefinition
> = {
  cap: def("Choisir les publics, offres et modalités qui doivent porter une activité utile et rentable.", "Début de trimestre ou écart important.", "Des priorités chiffrées compatibles avec la capacité pédagogique.", "Dirigeant", "Trimestrielle"),
  decisions: def("Déléguer les arbitrages courants sans exposer l’apprenant ni bloquer une session.", "Absence, incident, financement, réclamation ou changement de planning.", "Une décision rapide, tracée et prise dans une limite connue.", "Dirigeant ou responsable pédagogique", "Mensuelle"),
  access: def("Maintenir les accès, données et documents indispensables à la continuité.", "Arrivée, départ, incident ou revue des droits.", "Des droits individuels maîtrisés et récupérables.", "Responsable administratif", "Mensuelle"),
  visibility: def("Voir les inscriptions, dossiers, sessions, risques, résultats et flux à temps.", "Revue d’activité.", "Des écarts expliqués avec une action, un responsable et une date.", "Responsable de formation", "Hebdomadaire"),
  acquisition: def("Attirer et qualifier les candidats ou clients qui correspondent à l’offre.", "Nouvelle campagne, demande ou partenariat.", "Une opportunité qualifiée jusqu’à l’inscription.", "Responsable commercial", "Hebdomadaire"),
  employers: def("Développer des employeurs partenaires capables d’accueillir et suivre les apprentis.", "Recherche d’entreprise ou ouverture de promotion.", "Des besoins qualifiés et des mises en relation suivies.", "Responsable relations entreprises", "Hebdomadaire"),
  sell: def("Transformer le besoin en inscription ou convention claire et finançable.", "Demande qualifiée.", "Un engagement complet sans promesse ni pièce manquante.", "Responsable commercial ou admissions", "À chaque demande"),
  loyalty: def("Faire progresser la satisfaction, la recommandation et le renouvellement.", "Fin de séquence, de session ou de parcours.", "Des retours exploitables et des actions de fidélisation tracées.", "Responsable expérience apprenant", "À chaque session"),
  complaint: def("Traiter une réclamation à partir des faits, engagements et preuves.", "Insatisfaction, incident, contestation ou signalement.", "Une réponse tracée et une cause opérationnelle corrigée.", "Référent qualité", "À chaque réclamation"),
  design: def("Construire une formation à partir d’un besoin, d’objectifs et de preuves d’évaluation.", "Création ou révision d’une offre.", "Un parcours réalisable, mesurable et compréhensible.", "Responsable pédagogique", "À chaque création"),
  dossiers: def("Sécuriser les dossiers clients, apprenants et financeurs avant démarrage et clôture.", "Inscription, accord de financement ou fin de formation.", "Un dossier complet, facturable et auditable.", "Responsable administratif", "À chaque dossier"),
  plan: def("Planifier les sessions, ressources et intervenants sans conflit.", "Session confirmée ou planning à réviser.", "Un calendrier faisable communiqué aux parties.", "Coordinateur pédagogique", "Hebdomadaire"),
  deliver: def("Dérouler la formation avec les activités, ressources et adaptations prévues.", "Démarrage ou séance.", "Une réalisation conforme au programme et aux besoins détectés.", "Formateur ou coordinateur", "À chaque session"),
  track: def("Suivre présence, progression, évaluations et sortie du parcours.", "Activité pédagogique ou échéance de parcours.", "Des résultats et preuves disponibles pour chaque apprenant.", "Coordinateur pédagogique", "À chaque session"),
  platform: def("Maintenir la plateforme, les accès et le support nécessaires au parcours en ligne.", "Inscription, publication, incident ou mise à jour.", "Un accès fonctionnel et une continuité de service suivie.", "Responsable plateforme", "Quotidienne"),
  update: def("Maintenir les contenus exacts, actuels et cohérents avec la promesse.", "Retour apprenant, évolution métier ou anomalie.", "Une version publiée, testée et traçable.", "Responsable pédagogique", "Mensuelle"),
  team: def("Organiser formateurs, support et coordination pour absorber la charge.", "Planification, absence ou pic d’activité.", "Des responsabilités, charges et remplacements visibles.", "Responsable d’équipe", "Hebdomadaire"),
  onboard: def("Rendre un nouvel intervenant autonome sans partager des accès ni implicites.", "Arrivée ou remplacement.", "Une prise de poste vérifiée avec les limites utiles.", "Responsable d’équipe", "À chaque arrivée"),
  profitability: def("Connaître la marge réelle par offre, session, promotion ou cohorte.", "Dépense, temps ou clôture mensuelle.", "Des prix et capacités corrigés avant dérive durable.", "Dirigeant ou responsable financier", "Mensuelle"),
  payables: def("Payer intervenants et fournisseurs à partir de prestations justifiées.", "Facture ou échéance.", "Des paiements validés, affectés et rapprochés.", "Responsable administratif", "Hebdomadaire"),
  receivables: def("Facturer et encaisser les clients et financeurs avec des dossiers complets.", "Jalon contractuel ou fin de prestation.", "Des créances suivies sans bloquer les preuves attendues.", "Responsable administratif", "Hebdomadaire"),
  refunds: def("Traiter remboursement, échéancier et litige financier selon les engagements applicables.", "Annulation, rétractation applicable, impayé ou contestation.", "Un mouvement financier justifié et rapproché.", "Responsable administratif", "À chaque dossier"),
  compliance: def("Maintenir les obligations de l’activité et les preuves qualité applicables.", "Échéance, audit, nouvelle offre ou évolution réglementaire.", "Des preuves à jour, retrouvables et cohérentes avec la pratique.", "Référent qualité", "Mensuelle"),
  obligations: def("Assurer les missions et protections propres à l’apprentissage.", "Entrée, difficulté, rupture ou échéance réglementaire.", "Un accompagnement tracé de l’apprenti et de l’employeur.", "Direction du CFA", "Mensuelle"),
  results: def("Publier et expliquer les résultats exigés ou utiles au choix des candidats.", "Clôture de campagne annuelle.", "Des indicateurs calculés, sourcés et accessibles.", "Référent qualité", "Annuelle"),
};

const contentByRole: Record<TrainingProcessRole, IndustrializedContentItem[]> = {
  cap: [
    item("implementation_action", "Choisir les publics, compétences, offres, modalités et territoires qui doivent porter le développement"),
    item("implementation_action", "Fixer des objectifs de chiffre d’affaires, remplissage, réussite, satisfaction et marge"),
    item("operational_step", "Comparer les objectifs à la capacité des formateurs, ressources, outils et financements"),
    item("recurring_control", "Comparer chaque mois demandes, inscriptions, démarrages, abandons, résultats et marge"),
    item("recurring_control", "Mesurer par offre acquisition, remplissage, satisfaction, réussite et réachat"),
    item("operating_rule", "Ne pas ouvrir une offre sans besoin établi, responsable, capacité, prix et résultat attendu"),
  ],
  decisions: [
    item("implementation_action", "Écrire les décisions déléguées avec seuil, délai, information et escalade"),
    item("operational_step", "Classer chaque arbitrage selon apprenant touché, obligation, délai, coût et continuité"),
    item("operational_step", "Appliquer la mesure conservatoire autorisée puis informer les parties utiles"),
    item("operating_rule", "Escalader immédiatement danger, atteinte à une personne, fraude, donnée exposée ou preuve obligatoire absente"),
    item("recurring_control", "Revoir chaque mois les décisions remontées inutilement ou prises hors limite"),
  ],
  access: [
    item("implementation_action", "Créer un registre des outils, comptes, propriétaires, droits, sauvegardes et récupérations"),
    item("operational_step", "Attribuer un accès individuel limité au rôle réellement exercé"),
    item("operational_step", "Retirer ou réattribuer les droits dès un départ ou changement de mission"),
    item("recurring_control", "Tester chaque mois les accès critiques et les procédures de récupération"),
  ],
  visibility: [
    item("implementation_action", "Créer une vue avec candidat, dossier, financement, session, présence, résultat et prochaine action"),
    item("operational_step", "Identifier avant la revue les dossiers, sessions et apprenants à risque"),
    item("operational_step", "Affecter à chaque écart une action, un responsable et une échéance"),
    item("recurring_control", "Revoir chaque semaine pièces, financements, absences, incidents, évaluations et facturation"),
    item("operating_rule", "Un dossier ouvert doit toujours avoir un statut, un propriétaire et une prochaine étape"),
  ],
  acquisition: [
    item("implementation_action", "Créer un plan d’acquisition avec public, besoin, message, canal, budget et page d’arrivée"),
    item("operational_step", "Qualifier objectif, prérequis, disponibilité, financement envisagé et décideurs"),
    item("recurring_control", "Mesurer chaque semaine demandes, rendez-vous, admissibles, inscriptions et coût d’acquisition"),
    item("operating_rule", "Ne pas promettre financement, certification ou résultat avant vérification du dossier"),
    item("recurring_control", "Arrêter ou corriger un canal qui génère durablement des demandes non éligibles"),
  ],
  employers: [
    item("implementation_action", "Créer un fichier employeurs avec métiers, postes, tuteurs, besoins, contacts et historique"),
    item("operational_step", "Qualifier poste, rythme, compétences visées, maître d’apprentissage et calendrier de recrutement"),
    item("operational_step", "Présenter des candidats avec leur accord et suivre chaque mise en relation"),
    item("recurring_control", "Revoir chaque semaine postes ouverts, candidats sans employeur, contrats et relances"),
  ],
  sell: [
    item("implementation_action", "Créer une trame d’entretien avec besoin, objectifs, prérequis, modalités, prix et financement"),
    item("operational_step", "Présenter programme, durée, méthodes, évaluations, accessibilité, délais et conditions"),
    item("operational_step", "Vérifier devis, convention ou contrat, accord, pièces et délai avant confirmation"),
    item("recurring_control", "Mesurer propositions, inscriptions, pertes, délais de décision et causes de refus"),
  ],
  loyalty: [
    item("implementation_action", "Créer un parcours de suivi après formation avec bilan, recommandation et besoin suivant"),
    item("operational_step", "Recueillir séparément la satisfaction à chaud, l’usage et l’impact observé"),
    item("recurring_control", "Analyser chaque mois avis, recommandations, renouvellements et irritants récurrents"),
  ],
  complaint: [
    item("implementation_action", "Créer un registre avec demandeur, parcours, faits, pièces, impact, réponse et correction"),
    item("operational_step", "Accuser réception et sécuriser immédiatement la personne ou la continuité du parcours"),
    item("operational_step", "Comparer engagements, chronologie, présence, échanges, évaluations et preuves disponibles"),
    item("recurring_control", "Vérifier la correction puis analyser chaque mois délais, causes et dossiers réouverts"),
  ],
  design: [
    item("implementation_action", "Formaliser public, besoin, prérequis, objectifs opérationnels et critères de réussite"),
    item("operational_step", "Découper le parcours en séquences, activités, ressources, durées et évaluations"),
    item("operational_step", "Prévoir positionnement, adaptations, accessibilité et accompagnement"),
    item("operational_step", "Faire relire le fond, les consignes, les évaluations et la charge réelle"),
    item("recurring_control", "Réviser après chaque cycle les contenus, résultats, retours et écarts observés"),
  ],
  dossiers: [
    item("implementation_action", "Créer une checklist avec identité, besoin, pièces, accord, convention, financement et preuves"),
    item("operational_step", "Vérifier cohérence des dates, montants, programme, signataires et conditions de prise en charge"),
    item("operational_step", "Relancer chaque pièce manquante avec responsable, date limite et conséquence"),
    item("recurring_control", "Contrôler avant démarrage et clôture que le dossier est réalisable, facturable et archivable"),
  ],
  plan: [
    item("implementation_action", "Créer un planning avec sessions, séquences, formateurs, salles ou classes virtuelles et ressources"),
    item("operational_step", "Vérifier disponibilité, compétence, contrat, équipement et temps de préparation de l’intervenant"),
    item("operational_step", "Envoyer convocations, accès, prérequis, horaires et contacts utiles"),
    item("recurring_control", "Revoir chaque semaine conflits, absences, seuils de maintien et solutions de remplacement"),
  ],
  deliver: [
    item("implementation_action", "Créer une checklist de démarrage avec participants, objectifs, règles, moyens et adaptations"),
    item("operational_step", "Réaliser les activités prévues en conservant les ajustements pédagogiques utiles"),
    item("operational_step", "Traiter absence, difficulté, incident ou décalage sans masquer l’écart au programme"),
    item("recurring_control", "Contrôler à chaque séquence réalisation, participation, compréhension et prochaine étape"),
  ],
  track: [
    item("implementation_action", "Créer un suivi individuel avec présence, activités, évaluations, alertes et accompagnements"),
    item("operational_step", "Enregistrer les preuves de réalisation à partir de l’activité réellement effectuée"),
    item("operational_step", "Déclencher un contact après absence, retard, non-connexion ou échec répété"),
    item("operational_step", "Clôturer avec résultat, attestation ou certificat applicable et suite recommandée"),
    item("recurring_control", "Rapprocher chaque semaine présence, progression, évaluations, alertes et documents de sortie"),
  ],
  platform: [
    item("implementation_action", "Créer un registre des espaces, rôles, intégrations, sauvegardes, incidents et responsables"),
    item("operational_step", "Créer et tester l’accès apprenant avant le démarrage du parcours"),
    item("operational_step", "Qualifier chaque incident par impact, utilisateurs touchés, contournement et délai"),
    item("recurring_control", "Contrôler chaque jour connexions bloquées, paiements, e-mails, classes virtuelles et support"),
    item("operating_rule", "Ne pas clôturer un incident avant test utilisateur et information des personnes touchées"),
  ],
  update: [
    item("implementation_action", "Créer un registre des versions avec auteur, source, date, contrôle et publication"),
    item("operational_step", "Vérifier exactitude, droits d’usage, liens, consignes, quiz et cohérence du parcours"),
    item("operational_step", "Tester la nouvelle version sur ordinateur et mobile avant publication"),
    item("recurring_control", "Revoir chaque mois contenus signalés, statistiques d’échec, liens cassés et mises à jour métier"),
  ],
  team: [
    item("implementation_action", "Créer une vue de charge avec rôle, sessions, dossiers, support, échéances et remplaçant"),
    item("operational_step", "Affecter chaque session, file et contrôle à un titulaire et un suppléant"),
    item("operational_step", "Faire une passation des dossiers sensibles avec faits, pièces et prochaine action"),
    item("recurring_control", "Revoir chaque semaine surcharge, absences, compétences manquantes et renforts"),
  ],
  onboard: [
    item("implementation_action", "Créer un parcours d’intégration avec rôle, outils, procédures, observations et validations"),
    item("operational_step", "Vérifier compétences, pièces contractuelles, posture, accès et limites de décision"),
    item("recurring_control", "Valider l’autonomie sur une situation réelle avant prise en charge complète"),
  ],
  profitability: [
    item("implementation_action", "Créer un budget par offre avec prix, financement, temps, intervenants, outils et frais"),
    item("operational_step", "Affecter heures, achats, sous-traitance, remises et reprises au bon parcours"),
    item("recurring_control", "Comparer chaque mois prévu, réalisé, facturé, encaissé et marge par offre"),
    item("operating_rule", "Réviser prix, format ou capacité avant de masquer une dérive par du temps non tracé"),
  ],
  payables: [
    item("implementation_action", "Créer un échéancier avec fournisseur, intervenant, période, pièce, validation et paiement"),
    item("operational_step", "Comparer facture, contrat, réalisation, temps ou livrable et conditions convenues"),
    item("recurring_control", "Revoir chaque semaine échéances, doublons, litiges, avoirs et trésorerie"),
  ],
  receivables: [
    item("implementation_action", "Relier chaque facture au client ou financeur, au parcours, au jalon et aux preuves"),
    item("operational_step", "Vérifier montant, accord, présence, réalisation et pièces avant émission"),
    item("operational_step", "Relancer avec référence, montant, échéance, pièce manquante et prochaine étape"),
    item("recurring_control", "Revoir chaque semaine à facturer, échus, contestés, rejetés et trésorerie à huit semaines"),
  ],
  refunds: [
    item("implementation_action", "Créer une procédure avec demande, motif, engagement applicable, décision, montant et preuve"),
    item("operational_step", "Distinguer annulation, rétractation applicable, geste commercial, impayé et contestation"),
    item("operational_step", "Rapprocher remboursement, échéancier, paiement d’origine et facture ou avoir"),
    item("recurring_control", "Analyser chaque mois remboursements, litiges, échéanciers rompus et causes"),
  ],
  compliance: [
    item("implementation_action", "Créer un registre avec obligation, périmètre, preuve, propriétaire, échéance et statut"),
    item("operational_step", "Vérifier déclaration d’activité, documents contractuels et règlement intérieur applicables"),
    item("operational_step", "Préparer chaque année les données cohérentes du bilan pédagogique et financier"),
    item("recurring_control", "Auditer preuves d’information, positionnement, réalisation, évaluation, satisfaction et amélioration"),
    item("operating_rule", "Ne jamais présenter Qualiopi comme obligatoire hors de son périmètre de financements applicable"),
  ],
  obligations: [
    item("implementation_action", "Créer un registre des missions CFA avec responsable, preuve, échéance et action"),
    item("operational_step", "Informer l’apprenti de ses droits, devoirs, contacts, aides et règles de sécurité"),
    item("operational_step", "Accompagner difficulté, handicap, rupture ou recherche d’employeur avec des traces datées"),
    item("recurring_control", "Contrôler chaque mois accompagnements, ruptures, alertes sociales et actions employeurs"),
  ],
  results: [
    item("implementation_action", "Définir source, formule, période, population et responsable de chaque indicateur publié"),
    item("operational_step", "Calculer et faire relire les résultats avant leur publication"),
    item("recurring_control", "Vérifier chaque année accessibilité, date de mise à jour et cohérence des résultats"),
  ],
};

type TrainingProcessConfig = {
  role: TrainingProcessRole;
  processId: string;
  contentCount: number;
};

export type TrainingProfile = {
  slug: "organisme-de-formation" | "cfa" | "formation-en-ligne";
  name: string;
  family: "training-provider" | "cfa" | "online-training";
  reviewState: "internal_review_complete";
  sourceUrl: string;
  processes: TrainingProcessConfig[];
  growthPriorities: string;
  delegatedDecisions: string;
  visibilityRisks: string;
  acquisitionFrame: string;
  salesChecks: string;
  complaintEvidence: string;
  designFrame: string;
  planningFrame: string;
  deliveryProof: string;
  progressFrame: string;
  replacementChecks: string;
  marginRisks: string;
  billingProof: string;
  accessFrame: string;
  complianceFrame: string;
};

export function generateTrainingCoreDraft(profile: TrainingProfile): ProcessDraft {
  return {
    definitionsById: Object.fromEntries(
      profile.processes.map(({ role, processId }) => [
        processId,
        { ...definitionsByRole[role] },
      ]),
    ),
    contentByProcessId: Object.fromEntries(
      profile.processes.map(({ role, processId, contentCount }) => {
        const contents = contentByRole[role];

        if (contents.length < contentCount) {
          throw new Error(
            `${profile.slug}: ${role} possède ${contents.length} contenus, ${contentCount} demandés.`,
          );
        }

        return [
          processId,
          contents.slice(0, contentCount).map((entry) => ({ ...entry })),
        ];
      }),
    ),
  };
}

function idFor(profile: TrainingProfile, role: TrainingProcessRole) {
  const processId = profile.processes.find((entry) => entry.role === role)?.processId;

  if (!processId) {
    throw new Error(`${profile.slug}: rôle ${role} absent.`);
  }

  return processId;
}

const patches = (profile: TrainingProfile): ProcessContentPatch[] => [
  { processId: idFor(profile, "cap"), contentIndex: 0, label: `Choisir les priorités de développement : ${profile.growthPriorities}` },
  { processId: idFor(profile, "decisions"), contentIndex: 0, label: `Déléguer explicitement : ${profile.delegatedDecisions}` },
  { processId: idFor(profile, "visibility"), contentIndex: 1, label: `Identifier les risques avant la revue : ${profile.visibilityRisks}` },
  { processId: idFor(profile, "acquisition"), contentIndex: 0, label: `Construire l’acquisition avec : ${profile.acquisitionFrame}` },
  { processId: idFor(profile, profile.slug === "cfa" ? "employers" : "sell"), contentIndex: 1, label: `Vérifier avant engagement : ${profile.salesChecks}` },
  { processId: idFor(profile, "complaint"), contentIndex: 0, label: `Constituer la réclamation avec : ${profile.complaintEvidence}` },
  { processId: idFor(profile, "design"), contentIndex: 0, label: `Concevoir le parcours avec : ${profile.designFrame}` },
  { processId: idFor(profile, profile.slug === "formation-en-ligne" ? "platform" : "plan"), contentIndex: 0, label: `Planifier et sécuriser : ${profile.planningFrame}` },
  { processId: idFor(profile, profile.slug === "formation-en-ligne" ? "platform" : profile.slug === "cfa" ? "deliver" : "dossiers"), contentIndex: 2, label: `Conserver comme preuve : ${profile.deliveryProof}` },
  { processId: idFor(profile, "track"), contentIndex: 0, label: `Suivre chaque parcours avec : ${profile.progressFrame}` },
  { processId: idFor(profile, "team"), contentIndex: 1, label: `Prévoir le remplacement sur : ${profile.replacementChecks}` },
  { processId: idFor(profile, "profitability"), contentIndex: 1, label: `Affecter précisément les risques de marge : ${profile.marginRisks}` },
  { processId: idFor(profile, profile.slug === "formation-en-ligne" ? "refunds" : "receivables"), contentIndex: 0, label: `Justifier chaque facturation avec : ${profile.billingProof}` },
  { processId: idFor(profile, "access"), contentIndex: 0, label: `Tenir à jour les accès critiques : ${profile.accessFrame}` },
  { processId: idFor(profile, "compliance"), contentIndex: 0, label: `Tenir à jour les obligations applicables : ${profile.complianceFrame}` },
];

export const generateTrainingDraft = (profile: TrainingProfile) =>
  composeProcessDraft(generateTrainingCoreDraft(profile), [
    { id: `metier.${profile.slug}`, contentPatches: patches(profile) },
  ]);

export const trainingProfiles = {
  "organisme-de-formation": {
    slug: "organisme-de-formation",
    name: "Organisme de formation",
    family: "training-provider",
    reviewState: "internal_review_complete",
    sourceUrl: "https://docs.google.com/spreadsheets/d/1l6DZlK5M83Y36cCTTJSOJP7cvgccAgZl1vUBeLfPLM0/edit",
    processes: [
      { role: "cap", processId: "process.organisme-formation.direction.savoir-ou-va-lorganisme", contentCount: 6 },
      { role: "decisions", processId: "process.organisme-formation.direction.decider-au-quotidien-sans-tout-centraliser", contentCount: 4 },
      { role: "access", processId: "process.organisme-formation.direction.donner-acces-a-lessentiel", contentCount: 4 },
      { role: "visibility", processId: "process.organisme-formation.direction.garder-une-visibilite-sans-reprendre-la-main", contentCount: 4 },
      { role: "acquisition", processId: "process.organisme-formation.marketing-vente.developper-les-inscriptions", contentCount: 4 },
      { role: "sell", processId: "process.organisme-formation.marketing-vente.vendre-une-formation", contentCount: 4 },
      { role: "loyalty", processId: "process.organisme-formation.marketing-vente.fideliser-apprenants-et-clients", contentCount: 3 },
      { role: "complaint", processId: "process.organisme-formation.marketing-vente.traiter-une-reclamation-apprenant-ou-client", contentCount: 4 },
      { role: "design", processId: "process.organisme-formation.operations.construire-et-mettre-a-jour-une-formation", contentCount: 5 },
      { role: "dossiers", processId: "process.organisme-formation.operations.gerer-dossiers-clients-et-financeurs", contentCount: 4 },
      { role: "plan", processId: "process.organisme-formation.operations.planifier-sessions-formateurs-et-ressources", contentCount: 4 },
      { role: "track", processId: "process.organisme-formation.operations.suivre-presences-evaluations-et-attestations", contentCount: 5 },
      { role: "team", processId: "process.organisme-formation.equipe.gerer-les-formateurs-et-intervenants", contentCount: 4 },
      { role: "onboard", processId: "process.organisme-formation.equipe.integrer-un-nouveau-collaborateur-et-remplacer-un-formateur-absent", contentCount: 3 },
      { role: "profitability", processId: "process.organisme-formation.finance-admin.suivre-lactivite-et-la-marge", contentCount: 4 },
      { role: "payables", processId: "process.organisme-formation.finance-admin.payer-a-temps", contentCount: 3 },
      { role: "receivables", processId: "process.organisme-formation.finance-admin.se-faire-payer", contentCount: 4 },
      { role: "compliance", processId: "process.organisme-formation.conformite-metier.maintenir-la-conformite-qualite", contentCount: 5 },
    ],
    growthPriorities: "formations demandées, clients récurrents, sessions remplies, financements maîtrisés et résultats démontrables",
    delegatedDecisions: "maintien ou report sous critères, adaptation pédagogique, remplacement formateur, relance dossier et geste plafonné",
    visibilityRisks: "convention absente, accord financeur en attente, session sous-remplie, formateur indisponible, présence incomplète et évaluation manquante",
    acquisitionFrame: "entreprises, particuliers, prescripteurs, appels d’offres, OPCO selon le dossier, contenu expert et mesure des inscriptions rentables",
    salesChecks: "besoin, public, prérequis, objectifs, programme, dates, prix, financement envisagé, délai de rétractation applicable et signataire",
    complaintEvidence: "client ou apprenant, convention ou contrat, programme, chronologie, présence, échanges, évaluations, réponse et correction",
    designFrame: "analyse du besoin, public, prérequis, objectifs opérationnels, séquences, méthodes, accessibilité, évaluations et critères de réussite",
    planningFrame: "dates, seuil de maintien, formateur compétent, contrat, salle ou classe virtuelle, matériel, convocations et solution de remplacement",
    deliveryProof: "accord, convention ou contrat, pièces financeur, convocations, réalisation, présence, évaluations, attestation et facture",
    progressFrame: "positionnement, présence, activités, évaluations, difficultés, adaptations, satisfaction et document de sortie",
    replacementChecks: "programme, déroulé, groupe, adaptations, salle ou lien, supports, évaluations, accès et contacts d’urgence",
    marginRisks: "préparation, animation, coordination, location, déplacement, plateforme, sous-traitance, session annulée et reprise non facturée",
    billingProof: "client ou financeur, convention ou contrat, session, participants, réalisation, présence, jalon, montant et pièces attendues",
    accessFrame: "CRM, LMS, fichiers apprenants, plateforme financeur, signatures, évaluations, facturation, sauvegardes et comptes nominatifs",
    complianceFrame: "déclaration d’activité, BPF annuel, documents contractuels, règlement intérieur applicable, information, accessibilité, preuves qualité, Qualiopi selon financements et données",
  },
  cfa: {
    slug: "cfa",
    name: "CFA",
    family: "cfa",
    reviewState: "internal_review_complete",
    sourceUrl: "https://docs.google.com/spreadsheets/d/1vet_NXyKEDM1l4hD-4fiEWjMI5yJi5Qdy88u_BgPm-Y/edit",
    processes: [
      { role: "cap", processId: "process.cfa.direction.savoir-ou-va-le-cfa", contentCount: 4 },
      { role: "decisions", processId: "process.cfa.direction.decider-au-quotidien-sans-le-dirigeant", contentCount: 4 },
      { role: "access", processId: "process.cfa.direction.donner-acces-a-lessentiel", contentCount: 3 },
      { role: "visibility", processId: "process.cfa.direction.garder-une-visibilite-sans-reprendre-la-main", contentCount: 4 },
      { role: "acquisition", processId: "process.cfa.marketing-vente.recruter-des-apprentis", contentCount: 4 },
      { role: "employers", processId: "process.cfa.marketing-vente.developper-les-entreprises-partenaires-employeurs", contentCount: 4 },
      { role: "loyalty", processId: "process.cfa.marketing-vente.fideliser-employeurs-et-apprentis", contentCount: 3 },
      { role: "complaint", processId: "process.cfa.marketing-vente.traiter-une-reclamation-apprenti-ou-employeur", contentCount: 4 },
      { role: "design", processId: "process.cfa.operations.construire-un-contenu-de-formation", contentCount: 4 },
      { role: "deliver", processId: "process.cfa.operations.derouler-une-session-annee-de-formation", contentCount: 4 },
      { role: "plan", processId: "process.cfa.operations.planifier-cours-salles-et-intervenants", contentCount: 4 },
      { role: "track", processId: "process.cfa.operations.suivre-lalternance-employeur-apprenti", contentCount: 4 },
      { role: "team", processId: "process.cfa.equipe.gerer-les-formateurs-et-intervenants", contentCount: 4 },
      { role: "onboard", processId: "process.cfa.equipe.integrer-un-nouveau-collaborateur", contentCount: 3 },
      { role: "profitability", processId: "process.cfa.finance-admin.suivre-largent", contentCount: 4 },
      { role: "payables", processId: "process.cfa.finance-admin.payer-a-temps", contentCount: 3 },
      { role: "receivables", processId: "process.cfa.finance-admin.se-faire-payer-securiser-les-financements", contentCount: 4 },
      { role: "compliance", processId: "process.cfa.conformite-metier.rester-certifie", contentCount: 4 },
      { role: "obligations", processId: "process.cfa.conformite-metier.respecter-les-obligations-specifiques", contentCount: 3 },
      { role: "results", processId: "process.cfa.conformite-metier.publier-et-suivre-les-resultats-obligation-legale", contentCount: 3 },
    ],
    growthPriorities: "filières avec débouchés, candidats admissibles, employeurs actifs, contrats sécurisés et faible taux de rupture",
    delegatedDecisions: "admission sous critères, alerte employeur, adaptation du parcours, remplacement formateur, accompagnement rupture et escalade protection",
    visibilityRisks: "candidat sans employeur, contrat non déposé, financement incomplet, absence répétée, visite entreprise en retard, rupture et échéance de certification",
    acquisitionFrame: "établissements, missions locales, orientation, événements, candidatures, prescripteurs et suivi jusqu’à l’employeur",
    salesChecks: "poste réel, compétences visées, rythme, maître d’apprentissage, conditions d’accueil, calendrier, contrat et interlocuteurs entreprise",
    complaintEvidence: "apprenti, représentant légal si nécessaire, employeur, contrat, planning, livret, visites, absences, échanges, réponse et action",
    designFrame: "référentiel de certification, progression CFA-entreprise, activités, rythme d’alternance, évaluations, adaptations et préparation aux épreuves",
    planningFrame: "calendrier d’alternance, cours, salles, formateurs, visites entreprise, examens, jurys, fermetures et solutions d’absence",
    deliveryProof: "déroulé, présence, travaux, évaluations, adaptations, livret, échanges avec le maître d’apprentissage et actions de soutien",
    progressFrame: "contrat, entreprise, maître d’apprentissage, présence, compétences CFA-entreprise, visites, alertes, rupture et certification",
    replacementChecks: "promotion, référentiel, calendrier, cours, entreprises sensibles, apprentis à risque, visites, accès et procédures de signalement",
    marginRisks: "niveau de prise en charge, participation employeur applicable, durée réelle du contrat, rupture, sous-effectif, formateurs, plateaux et accompagnement",
    billingProof: "contrat d’apprentissage, convention, dépôt, niveau de prise en charge, durée réelle, participation applicable, présence, rupture et échéancier",
    accessFrame: "ERP ou YPAREO équivalent, LMS, contrats, OPCO, livrets, absences, examens, données apprentis, signalements et comptes nominatifs",
    complianceFrame: "déclaration d’activité, BPF, Qualiopi, missions CFA, certification préparée, conventions, contrats, règlement, accessibilité, indicateurs publiés et données",
  },
  "formation-en-ligne": {
    slug: "formation-en-ligne",
    name: "Formation en ligne",
    family: "online-training",
    reviewState: "internal_review_complete",
    sourceUrl: "https://docs.google.com/spreadsheets/d/1PjkyuU2ZP69LrBLg3gqQbiBKO_u27g4ke_Yma3XDxa8/edit",
    processes: [
      { role: "cap", processId: "process.formation-en-ligne.direction.savoir-ou-va-lactivite", contentCount: 6 },
      { role: "decisions", processId: "process.formation-en-ligne.direction.decider-au-quotidien-sans-tout-centraliser", contentCount: 4 },
      { role: "access", processId: "process.formation-en-ligne.direction.donner-acces-a-lessentiel", contentCount: 4 },
      { role: "visibility", processId: "process.formation-en-ligne.direction.garder-une-visibilite-sans-reprendre-la-main", contentCount: 5 },
      { role: "acquisition", processId: "process.formation-en-ligne.marketing-vente.attirer-de-nouveaux-apprenants", contentCount: 5 },
      { role: "sell", processId: "process.formation-en-ligne.marketing-vente.vendre-un-parcours-en-ligne", contentCount: 4 },
      { role: "complaint", processId: "process.formation-en-ligne.marketing-vente.traiter-une-demande-ou-une-reclamation-apprenant", contentCount: 4 },
      { role: "design", processId: "process.formation-en-ligne.operations.creer-et-publier-un-contenu-pedagogique", contentCount: 5 },
      { role: "platform", processId: "process.formation-en-ligne.operations.gerer-la-plateforme-et-les-acces", contentCount: 5 },
      { role: "update", processId: "process.formation-en-ligne.operations.mettre-a-jour-les-contenus", contentCount: 4 },
      { role: "track", processId: "process.formation-en-ligne.operations.suivre-progression-evaluations-et-certificats", contentCount: 5 },
      { role: "team", processId: "process.formation-en-ligne.equipe.coordonner-formateurs-support-et-production", contentCount: 4 },
      { role: "onboard", processId: "process.formation-en-ligne.equipe.integrer-un-nouveau-collaborateur", contentCount: 3 },
      { role: "profitability", processId: "process.formation-en-ligne.finance-admin.suivre-revenus-abonnements-et-marge", contentCount: 4 },
      { role: "payables", processId: "process.formation-en-ligne.finance-admin.payer-a-temps", contentCount: 3 },
      { role: "refunds", processId: "process.formation-en-ligne.finance-admin.gerer-remboursements-et-litiges", contentCount: 4 },
      { role: "compliance", processId: "process.formation-en-ligne.conformite-metier.maintenir-qualite-et-conformite", contentCount: 5 },
    ],
    growthPriorities: "parcours à forte complétion, cohortes rentables, acquisition maîtrisée, réachat et résultats apprenants observables",
    delegatedDecisions: "prolongation d’accès, remboursement sous critères, geste plafonné, déblocage, report de live et suspension d’une campagne",
    visibilityRisks: "accès bloqué, paiement échoué, cohorte inactive, apprenant décrocheur, support en retard, module défectueux et remboursement sensible",
    acquisitionFrame: "contenu, webinaire, e-mail, affiliation, publicité, page d’inscription, consentement applicable et mesure jusqu’à la complétion",
    salesChecks: "public, prérequis, objectifs, contenu, durée moyenne des activités, assistance, évaluations, prix, échéancier et conditions applicables",
    complaintEvidence: "apprenant, commande, CGV ou contrat, paiement, accès, journaux d’activité, tickets, échanges, évaluations et décision",
    designFrame: "objectifs, séquences asynchrones et synchrones, durée moyenne, consignes, assistance technique et pédagogique, évaluations et accessibilité",
    planningFrame: "LMS, rôles, inscriptions, accès, paiements, e-mails, classes virtuelles, sauvegardes, support et procédure d’incident",
    deliveryProof: "création et test d’accès, activité horodatée, progression, assistance fournie, incident, résolution et information apprenant",
    progressFrame: "connexions utiles, activités réalisées, temps indicatif, quiz, travaux, lives, demandes d’aide, alertes et document de sortie",
    replacementChecks: "support, modération, lives, LMS, paiements, incidents, cohortes sensibles, droits d’accès et seuils de remboursement",
    marginRisks: "publicité, affiliation, closing, production, coaching, support, LMS, paiement, remboursement, churn et cohorte sous-remplie",
    billingProof: "commande ou contrat, offre, accès, échéancier, paiement, réalisation, remboursement, avoir et relevé du prestataire",
    accessFrame: "LMS, site, domaine, vidéo, classe virtuelle, CRM, e-mail, paiement, analytics, support, sauvegardes et comptes nominatifs",
    complianceFrame: "information précontractuelle, CGV ou contrat, rétractation applicable, déclaration d’activité et BPF si formation professionnelle, FOAD, assistance, évaluations, Qualiopi selon financements et données",
  },
} satisfies Record<string, TrainingProfile>;
