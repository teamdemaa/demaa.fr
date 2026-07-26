import {
  composeProcessDraft,
  type IndustrializedContentItem,
  type IndustrializedProcessDefinition,
  type ProcessContentPatch,
  type ProcessDraft,
} from "@/lib/process-industrialization";

const P = {
  cap: "process.conseil-expert.direction.savoir-ou-va-lactivite",
  decisions:
    "process.conseil-expert.direction.decider-sans-tout-reprendre-soi-meme",
  access: "process.conseil-expert.direction.donner-acces-a-lessentiel",
  review:
    "process.conseil-expert.direction.garder-une-visibilite-sur-les-missions",
  opportunities:
    "process.conseil-expert.marketing-vente.developper-les-opportunites",
  sales: "process.conseil-expert.marketing-vente.vendre-une-mission-claire",
  loyalty:
    "process.conseil-expert.marketing-vente.faire-revenir-les-clients",
  complaint:
    "process.conseil-expert.marketing-vente.traiter-une-reclamation-client",
  scope:
    "process.conseil-expert.operations.cadrer-une-mission-ou-une-etude",
  collect:
    "process.conseil-expert.operations.collecter-les-informations-utiles",
  produce:
    "process.conseil-expert.operations.produire-lanalyse-ou-le-livrable",
  restitution:
    "process.conseil-expert.operations.restituer-et-suivre-les-decisions",
  planning:
    "process.conseil-expert.equipe.organiser-les-missions-et-remplacements",
  handover:
    "process.conseil-expert.equipe.transmettre-une-mission-en-cas-dabsence",
  onboarding:
    "process.conseil-expert.equipe.integrer-un-nouvel-employe",
  margin:
    "process.conseil-expert.finance-admin.suivre-la-marge-des-missions",
  expenses: "process.conseil-expert.finance-admin.payer-a-temps",
  collections: "process.conseil-expert.finance-admin.se-faire-payer",
  compliance:
    "process.conseil-expert.conformite-metier.securiser-contrats-et-confidentialite",
} as const;

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

export const consultingFamilyCoreDraft: ProcessDraft = {
  definitionsById: {
    [P.cap]: def("Choisir les offres, clients et capacités qui doivent porter l’activité.", "Début de trimestre ou écart important.", "Des priorités chiffrées compatibles avec la capacité disponible.", "Dirigeant", "Trimestrielle"),
    [P.decisions]: def("Déléguer les arbitrages courants sans perdre le contrôle.", "Nouvelle demande, blocage, dérive ou absence.", "Des décisions prises dans des limites écrites.", "Dirigeant ou responsable de mission", "Mensuelle"),
    [P.access]: def("Donner les bons accès aux bonnes personnes sans exposer les données clients.", "Démarrage, changement d’équipe ou fin de mission.", "Des accès nominatifs, limités et révocables.", "Responsable de mission", "Mensuelle"),
    [P.review]: def("Voir l’avancement, les risques, la charge et la rentabilité des missions.", "Revue de portefeuille.", "Des écarts expliqués et des décisions datées.", "Dirigeant", "Hebdomadaire"),
    [P.opportunities]: def("Créer un flux d’opportunités qualifiées et traçables.", "Revue commerciale.", "Des actions d’acquisition mesurées par source.", "Responsable commercial", "Hebdomadaire"),
    [P.sales]: def("Vendre une mission dont le résultat, le périmètre et les conditions sont compris.", "Premier échange avec un prospect.", "Une proposition rentable sans promesse ambiguë.", "Responsable commercial", "À chaque opportunité"),
    [P.loyalty]: def("Développer les clients existants à partir de besoins réels.", "Jalon, restitution ou évolution du client.", "Des suites utiles proposées au bon moment.", "Responsable de compte", "Mensuelle"),
    [P.complaint]: def("Résoudre une insatisfaction et traiter sa cause.", "Réclamation, retard ou contestation.", "Une réponse tracée et une action corrective vérifiée.", "Responsable de mission", "À chaque réclamation"),
    [P.scope]: def("Transformer la vente en mission exécutable.", "Signature ou demande de démarrage.", "Un cadrage partagé sur résultats, limites et gouvernance.", "Responsable de mission", "À chaque mission"),
    [P.collect]: def("Obtenir des informations complètes, fiables et autorisées.", "Démarrage d’une phase d’analyse.", "Des entrées contrôlées avec les manques identifiés.", "Consultant ou chargé d’étude", "À chaque phase"),
    [P.produce]: def("Produire un livrable exact, utile et reproductible.", "Entrées suffisantes et phase lancée.", "Un livrable contrôlé avant remise.", "Responsable de production", "À chaque livrable"),
    [P.restitution]: def("Faire comprendre les résultats et obtenir des décisions explicites.", "Livrable prêt ou jalon atteint.", "Des décisions, responsables et échéances enregistrés.", "Responsable de mission", "À chaque restitution"),
    [P.planning]: def("Affecter les bonnes compétences sans surcharge ni trou de couverture.", "Nouvelle mission ou revue de charge.", "Un plan de charge réaliste avec solution de remplacement.", "Responsable des opérations", "Hebdomadaire"),
    [P.handover]: def("Permettre la continuité d’une mission en cas d’absence.", "Absence prévue, incident ou réaffectation.", "Un remplaçant reprend avec le contexte utile.", "Responsable de mission", "À chaque transmission"),
    [P.onboarding]: def("Rendre une recrue autonome uniquement sur les activités validées.", "Arrivée d’un collaborateur.", "Des compétences observées et des droits adaptés.", "Manager", "À chaque arrivée"),
    [P.margin]: def("Connaître la marge réelle par mission et corriger les dérives.", "Saisie de temps, achat ou revue mensuelle.", "Des écarts de marge expliqués avant la fin de mission.", "Dirigeant ou responsable financier", "Mensuelle"),
    [P.expenses]: def("Payer les fournisseurs et charges à temps avec une preuve.", "Réception d’une facture.", "Une dépense validée, classée et planifiée.", "Responsable administratif", "Hebdomadaire"),
    [P.collections]: def("Facturer selon les jalons et traiter rapidement les retards.", "Jalon atteint ou échéance dépassée.", "Des créances suivies jusqu’au règlement.", "Responsable administratif", "Hebdomadaire"),
    [P.compliance]: def("Sécuriser contrat, confidentialité, données et responsabilités.", "Avant démarrage ou changement de périmètre.", "Des obligations identifiées et des preuves conservées.", "Référent conformité", "À chaque mission"),
  },
  contentByProcessId: {
    [P.cap]: [
      item("implementation_action", "Choisir les offres, segments clients et canaux qui doivent porter la croissance"),
      item("implementation_action", "Fixer des objectifs de chiffre d’affaires, marge, taux de charge et récurrence"),
      item("recurring_control", "Comparer chaque mois objectifs, signé, produit, facturé et capacité disponible"),
      item("operating_rule", "Ne pas lancer une nouvelle offre sans problème cible, résultat, coût et preuve de demande"),
    ],
    [P.decisions]: [
      item("implementation_action", "Écrire les décisions déléguées sur délai, remise, dépense, méthode et ajustement de planning"),
      item("operational_step", "Classer chaque blocage selon impact client, délai, qualité, marge et conformité"),
      item("operating_rule", "Faire remonter immédiatement risque légal, fuite de données, conflit d’intérêts ou dérive majeure"),
      item("recurring_control", "Revoir chaque mois les décisions remontées inutilement au dirigeant"),
    ],
    [P.access]: [
      item("implementation_action", "Tenir un registre des espaces clients, dossiers, outils, mots de passe et droits"),
      item("operational_step", "Attribuer des accès nominatifs selon la mission et les retirer à la fin du besoin"),
      item("recurring_control", "Contrôler chaque mois comptes partagés, anciens utilisateurs et droits excessifs"),
    ],
    [P.review]: [
      item("implementation_action", "Créer une revue de portefeuille avec statut, prochain jalon, risque, charge et marge"),
      item("operational_step", "Identifier pour chaque mission le prochain résultat observable attendu par le client"),
      item("recurring_control", "Revoir chaque semaine retards, dépendances, arbitrages et charges non planifiées"),
      item("recurring_control", "Attribuer à chaque écart une action, un responsable et une date de contrôle"),
    ],
    [P.opportunities]: [
      item("implementation_action", "Définir les signaux qui caractérisent un prospect réellement qualifié"),
      item("operational_step", "Activer chaque semaine contenus experts, recommandations, partenaires et prospection ciblée"),
      item("operational_step", "Tracer source, besoin, interlocuteur, échéance, valeur et prochaine action dans le CRM"),
      item("recurring_control", "Mesurer chaque mois rendez-vous, propositions, signatures, cycle et marge par source"),
    ],
    [P.sales]: [
      item("implementation_action", "Créer une trame de découverte avec situation, problème, impact, décision et calendrier"),
      item("operational_step", "Qualifier objectifs, parties prenantes, données, contraintes, budget et critères de réussite"),
      item("operational_step", "Rédiger une proposition avec livrables, exclusions, méthode, planning, prix et responsabilités"),
      item("operating_rule", "Ne jamais promettre un résultat dépendant d’une donnée, validation ou action client non sécurisée"),
    ],
    [P.loyalty]: [
      item("implementation_action", "Définir les jalons qui justifient un bilan ou une proposition de suite"),
      item("operational_step", "Préparer le bilan avec résultats obtenus, reste à faire, risques et nouvelles priorités"),
      item("operational_step", "Proposer uniquement une suite reliée à un besoin constaté et chiffré"),
      item("recurring_control", "Suivre chaque trimestre renouvellement, extension, recommandation et perte de clients"),
    ],
    [P.complaint]: [
      item("implementation_action", "Créer un registre avec faits, contrat, preuve, impact, réponse et action corrective"),
      item("operational_step", "Accuser réception, reformuler le désaccord et sécuriser les échéances urgentes"),
      item("operational_step", "Comparer faits, périmètre vendu, validations et livrables avant de décider"),
      item("recurring_control", "Vérifier après clôture que la cause a été corrigée dans le processus concerné"),
    ],
    [P.scope]: [
      item("implementation_action", "Créer une note de cadrage avec objectifs, livrables, exclusions, jalons et gouvernance"),
      item("operational_step", "Nommer décideur, contributeurs, valideurs et interlocuteur opérationnel"),
      item("operational_step", "Confirmer outils, accès, données attendues, calendrier et règles de changement"),
      item("operating_rule", "Aucun travail hors périmètre sans impact délai, prix et responsabilité accepté par écrit"),
    ],
    [P.collect]: [
      item("implementation_action", "Créer une liste de données, pièces, entretiens et validations attendus par phase"),
      item("operational_step", "Attribuer à chaque entrée une source, un propriétaire, une échéance et un niveau de sensibilité"),
      item("operational_step", "Contrôler complétude, période, définition, cohérence et droit d’utilisation avant analyse"),
      item("recurring_control", "Relancer les manques avec leur impact explicite sur le délai et la fiabilité"),
    ],
    [P.produce]: [
      item("implementation_action", "Créer une trame de production avec méthode, hypothèses, preuves et standard de qualité"),
      item("operational_step", "Séparer faits, hypothèses, calculs, interprétations et recommandations"),
      item("operational_step", "Faire relire les points critiques par une personne compétente avant remise"),
      item("recurring_control", "Vérifier version, sources, calculs, cohérence, confidentialité et lisibilité du livrable"),
    ],
    [P.restitution]: [
      item("implementation_action", "Préparer une restitution centrée sur constats, décisions, risques et prochaines actions"),
      item("operational_step", "Adapter le niveau de détail aux décideurs et conserver les preuves en annexe"),
      item("operational_step", "Faire confirmer décisions, responsables, échéances et points restant ouverts"),
      item("recurring_control", "Relancer les actions convenues et signaler rapidement les blocages"),
    ],
    [P.planning]: [
      item("implementation_action", "Créer un plan de charge par mission, compétence, jalon et semaine"),
      item("operational_step", "Affecter une personne uniquement si capacité, compétence et accès sont disponibles"),
      item("operating_rule", "Ne pas masquer une surcharge par des délais irréalistes ou du temps non déclaré"),
      item("recurring_control", "Comparer chaque semaine charge prévue, charge consommée et reste à produire"),
    ],
    [P.handover]: [
      item("implementation_action", "Créer une fiche de transmission avec contexte, contrat, avancement, risques et contacts"),
      item("operational_step", "Partager les dernières versions, décisions, accès et prochaines échéances"),
      item("operational_step", "Faire reformuler au remplaçant le prochain résultat attendu et les points sensibles"),
      item("recurring_control", "Tester chaque trimestre la reprise d’une mission prioritaire sans son titulaire"),
    ],
    [P.onboarding]: [
      item("implementation_action", "Préparer un parcours avec offres, méthodes, sécurité, outils et cas réels"),
      item("operational_step", "Faire produire un livrable test puis une première tâche supervisée"),
      item("recurring_control", "Valider à J+7 et J+30 les activités autorisées et les points à retravailler"),
    ],
    [P.margin]: [
      item("implementation_action", "Créer un budget de mission avec prix, temps, achats, sous-traitance et marge cible"),
      item("operational_step", "Saisir le temps et les coûts avec une catégorie exploitable au moins chaque semaine"),
      item("recurring_control", "Comparer vendu, consommé, reste à faire, facturé et encaissé par mission"),
      item("operating_rule", "Traiter toute dérive avant de compenser silencieusement par du temps non facturé"),
    ],
    [P.expenses]: [
      item("implementation_action", "Créer un calendrier des fournisseurs, abonnements, charges, taxes et échéances"),
      item("operational_step", "Valider chaque facture avec commande, service rendu, mission imputée et conditions convenues"),
      item("operational_step", "Classer facture, justificatif, validation et paiement dans le dossier prévu"),
      item("recurring_control", "Prévoir chaque mois les sorties de trésorerie des huit semaines suivantes"),
    ],
    [P.collections]: [
      item("implementation_action", "Relier chaque échéance de facturation à un jalon ou une date contractuelle"),
      item("operational_step", "Préparer facture et preuves de réalisation avant l’échéance"),
      item("operational_step", "Relancer avec montant, référence, date, pièce et prochaine étape clairement indiqués"),
      item("recurring_control", "Revoir chaque semaine factures à émettre, échues, contestées et promises au paiement"),
    ],
    [P.compliance]: [
      item("implementation_action", "Créer une checklist contrat, confidentialité, données, propriété intellectuelle et assurances"),
      item("operational_step", "Faire signer les engagements nécessaires avant tout accès ou échange sensible"),
      item("operating_rule", "Ne collecter, partager ou conserver que les informations nécessaires et autorisées"),
      item("recurring_control", "Archiver ou supprimer accès, données et versions selon le contrat et la durée prévue"),
    ],
  },
};

export type ConsultingTradeProfile = {
  slug: string;
  name: string;
  growthPriorities: string;
  delegatedDecisions: string;
  criticalAccess: string;
  acquisitionActions: string;
  qualificationChecks: string;
  scopeChecks: string;
  requiredInputs: string;
  productionStandard: string;
  criticalReview: string;
  restitutionStandard: string;
  planningSkills: string;
  handoverContent: string;
  marginRisks: string;
  complianceRisks: string;
  wave: "consulting" | "externalized" | "studies";
  reviewState: "internal_review_complete";
};

const patches = (profile: ConsultingTradeProfile): ProcessContentPatch[] => [
  { processId: P.cap, contentIndex: 0, label: `Choisir les priorités de croissance : ${profile.growthPriorities}` },
  { processId: P.decisions, contentIndex: 0, label: `Déléguer explicitement : ${profile.delegatedDecisions}` },
  { processId: P.access, contentIndex: 0, label: `Sécuriser les accès suivants : ${profile.criticalAccess}` },
  { processId: P.opportunities, contentIndex: 1, label: `Activer les canaux suivants : ${profile.acquisitionActions}` },
  { processId: P.sales, contentIndex: 1, label: `Qualifier la mission avec : ${profile.qualificationChecks}` },
  { processId: P.scope, contentIndex: 0, label: `Cadrer précisément : ${profile.scopeChecks}` },
  { processId: P.collect, contentIndex: 0, label: `Obtenir et contrôler : ${profile.requiredInputs}` },
  { processId: P.produce, contentIndex: 0, label: `Standardiser la production : ${profile.productionStandard}` },
  { processId: P.produce, contentIndex: 2, label: `Faire vérifier avant remise : ${profile.criticalReview}` },
  { processId: P.restitution, contentIndex: 0, label: `Préparer la restitution avec : ${profile.restitutionStandard}` },
  { processId: P.planning, contentIndex: 0, label: `Planifier selon les compétences nécessaires : ${profile.planningSkills}` },
  { processId: P.handover, contentIndex: 0, label: `Transmettre obligatoirement : ${profile.handoverContent}` },
  { processId: P.margin, contentIndex: 1, label: `Tracer particulièrement les risques de marge : ${profile.marginRisks}` },
  { processId: P.compliance, contentIndex: 0, label: `Sécuriser en priorité : ${profile.complianceRisks}` },
];

export const generateConsultingTradeProcessDraft = (
  profile: ConsultingTradeProfile,
) =>
  composeProcessDraft(consultingFamilyCoreDraft, [
    { id: `metier.${profile.slug}`, contentPatches: patches(profile) },
  ]);

export const consultingTradeProfiles = {
  "cabinet-de-conseil": {
    slug: "cabinet-de-conseil", name: "Cabinet de conseil", wave: "consulting", reviewState: "internal_review_complete",
    growthPriorities: "missions à forte valeur, comptes récurrents, offres packagées et recommandations clients",
    delegatedDecisions: "affectation, méthode, atelier, dépense plafonnée, ajustement de jalon et geste client",
    criticalAccess: "CRM, propositions, dossiers clients, bases documentaires, outils d’atelier et espaces de direction",
    acquisitionActions: "contenus experts, recommandations, partenaires, événements dirigeants et prospection de comptes ciblés",
    qualificationChecks: "enjeu de direction, sponsor, décideurs, budget, urgence, données, conduite du changement et succès attendu",
    scopeChecks: "diagnostic, ateliers, analyses, livrables, décisions attendues, exclusions et gouvernance",
    requiredInputs: "entretiens, documents internes, indicateurs, décisions antérieures, contraintes et disponibilité des équipes",
    productionStandard: "hypothèses explicites, analyses sourcées, options comparées, recommandation argumentée et plan d’action",
    criticalReview: "solidité des preuves, faisabilité, cohérence inter-livrables, impact organisationnel et message dirigeant",
    restitutionStandard: "constats hiérarchisés, options, décision demandée, impacts, risques et feuille de route",
    planningSkills: "direction de mission, expertise sectorielle, facilitation, analyse, production et conduite du changement",
    handoverContent: "contrat, sponsor, gouvernance, décisions, versions, risques politiques, jalons et prochaines réunions",
    marginRisks: "avant-vente non cadrée, ateliers ajoutés, reprises, disponibilité senior et changements de périmètre",
    complianceRisks: "NDA, conflits d’intérêts, données stratégiques, propriété des méthodes et recours à la sous-traitance",
  },
  freelance: {
    slug: "freelance", name: "Freelance B2B", wave: "consulting", reviewState: "internal_review_complete",
    growthPriorities: "missions cœur de compétence, forfaits rentables, récurrence, apporteurs et disponibilité maîtrisée",
    delegatedDecisions: "sous-traitance, déplacement, outil, report plafonné et achat nécessaire à la mission",
    criticalAccess: "boîte professionnelle, agenda, CRM, dossiers clients, facturation, outils de production et sauvegardes",
    acquisitionActions: "réseau, recommandations, plateformes sélectionnées, contenus de preuve et prospection directe",
    qualificationChecks: "besoin précis, interlocuteur, budget, délai, livrable, dépendances, charge et conditions de paiement",
    scopeChecks: "résultat, nombre d’allers-retours, réunions, formats, calendrier, exclusions et disponibilité client",
    requiredInputs: "brief, exemples, contenus, accès, interlocuteurs, contraintes techniques et validation attendue",
    productionStandard: "checklist personnelle, jalons courts, versions nommées, sauvegarde et contrôle avant livraison",
    criticalReview: "respect du brief, qualité technique, cohérence, droits d’utilisation et éléments facturables",
    restitutionStandard: "résultat livré, limites, mode d’utilisation, points restant ouverts et prochaine action",
    planningSkills: "production principale, relation client, administration, vente et solution de remplacement externe",
    handoverContent: "brief, contrat, fichiers, accès temporaires, historique des validations, échéance et contact client",
    marginRisks: "temps commercial, réunions gratuites, retours illimités, outils, déplacements et retard de validation",
    complianceRisks: "contrat, acompte, propriété intellectuelle, licences, confidentialité, RGPD et indépendance",
  },
  "consultant-independant": {
    slug: "consultant-independant", name: "Consultant indépendant", wave: "consulting", reviewState: "internal_review_complete",
    growthPriorities: "expertise différenciante, missions de diagnostic, accompagnements récurrents et réseau de prescripteurs",
    delegatedDecisions: "méthode, entretien supplémentaire, report mineur, sous-traitant validé et dépense plafonnée",
    criticalAccess: "CRM, notes d’entretien, données client, modèles d’analyse, outils de restitution et facturation",
    acquisitionActions: "publications expertes, conférences, recommandations, prescripteurs et approche ciblée des décideurs",
    qualificationChecks: "problème, sponsor, décision à éclairer, accès au terrain, budget, échéance et disponibilité des acteurs",
    scopeChecks: "questions d’étude, population interrogée, méthode, livrables, limites, calendrier et décisions attendues",
    requiredInputs: "entretiens, données opérationnelles, procédures, décisions, indicateurs et points de vue contradictoires",
    productionStandard: "faits vérifiés, verbatims anonymisés, hypothèses testées, analyse structurée et recommandations priorisées",
    criticalReview: "biais d’analyse, preuves, faisabilité, confidentialité, cohérence des chiffres et robustesse des conclusions",
    restitutionStandard: "réponse aux questions, preuves, limites, recommandations, arbitrages et plan d’action",
    planningSkills: "diagnostic, entretiens, analyse, facilitation, rédaction et accompagnement du changement",
    handoverContent: "question de mission, interlocuteurs, sources, hypothèses, arbitrages, versions et prochain jalon",
    marginRisks: "collecte prolongée, entretiens supplémentaires, relecture dirigeant, déplacements et suivi non vendu",
    complianceRisks: "NDA, données personnelles, anonymisation, indépendance du jugement et propriété du livrable",
  },
  "coach-professionnel": {
    slug: "coach-professionnel", name: "Coach professionnel", wave: "consulting", reviewState: "internal_review_complete",
    growthPriorities: "programmes entreprises, accompagnements individuels, ateliers collectifs et prescripteurs RH",
    delegatedDecisions: "report de séance, exercice, adaptation de rythme, orientation vers un autre professionnel et arrêt sécurité",
    criticalAccess: "agenda, contrats tripartites, notes protégées, questionnaires, facturation et contacts d’urgence",
    acquisitionActions: "réseau RH, recommandations, contenus pédagogiques, conférences et partenariats de formation",
    qualificationChecks: "demande du coaché, demande du commanditaire, volontariat, objectif, limites, calendrier et indicateurs",
    scopeChecks: "objectifs tripartites, confidentialité, nombre de séances, bilans, exclusions et critères d’arrêt",
    requiredInputs: "contexte, objectifs, contraintes, auto-évaluation, accord du coaché et attentes du commanditaire",
    productionStandard: "préparation de séance, questions, exercices, synthèse personnelle et progression entre séances",
    criticalReview: "respect du cadre, absence de diagnostic médical, limites de compétence, confidentialité et dépendance",
    restitutionStandard: "progression sur objectifs, apprentissages partageables, engagements et suite sans révéler le contenu confidentiel",
    planningSkills: "entretien individuel, facilitation, cadre éthique, écoute, orientation et gestion de situations sensibles",
    handoverContent: "cadre contractuel, objectifs partageables, calendrier, risques, accord du coaché et limites de transmission",
    marginRisks: "reports tardifs, préparation, bilans tripartites, échanges hors séance et déplacements",
    complianceRisks: "confidentialité tripartite, consentement, données sensibles, limites professionnelles et conflit d’intérêts",
  },
  "consultant-data-bi": {
    slug: "consultant-data-bi", name: "Consultant data / BI", wave: "consulting", reviewState: "internal_review_complete",
    growthPriorities: "audits data, tableaux de bord récurrents, automatisations, gouvernance et maintenance",
    delegatedDecisions: "choix technique réversible, correction de données tracée, accès temporaire et report lié à une source",
    criticalAccess: "bases, entrepôts, BI, dépôts de code, secrets, environnements, tickets et documentation",
    acquisitionActions: "cas clients chiffrés, démonstrations, partenaires logiciels, contenus techniques et ciblage des équipes data",
    qualificationChecks: "décision métier, utilisateurs, sources, volumétrie, qualité, fréquence, sécurité, budget et maintenance",
    scopeChecks: "indicateurs, définitions, sources, transformations, droits, environnements, recette et maintenance",
    requiredInputs: "dictionnaire, échantillons, schémas, règles métier, accès, historique, attentes utilisateurs et critères de recette",
    productionStandard: "modèle de données documenté, transformations versionnées, contrôles, tableau de bord et guide d’usage",
    criticalReview: "formules, filtres, doublons, droits, performance, données manquantes et rapprochement avec une source fiable",
    restitutionStandard: "définitions, parcours utilisateur, limites, contrôles, décisions possibles et procédure d’incident",
    planningSkills: "data engineering, modélisation, BI, UX analytique, sécurité, recette et formation",
    handoverContent: "architecture, sources, secrets transmis sûrement, code, dépendances, contrôles, anomalies et calendrier",
    marginRisks: "qualité des données, accès tardifs, changements de définition, volumétrie, licences et maintenance implicite",
    complianceRisks: "RGPD, secrets, habilitations, données de production, sous-traitants, licences et réversibilité",
  },
  "daf-externalise": {
    slug: "daf-externalise", name: "DAF externalisé", wave: "externalized", reviewState: "internal_review_complete",
    growthPriorities: "missions récurrentes, pilotage de trésorerie, reporting dirigeant, financement et amélioration du contrôle interne",
    delegatedDecisions: "classification, relance, demande de pièce, préparation de paiement et alerte de trésorerie",
    criticalAccess: "banques en lecture, comptabilité, facturation, paie, contrats, budgets, Drive financier et coffre-fort",
    acquisitionActions: "réseau experts-comptables, dirigeants, fonds, avocats, contenus financiers et diagnostics de trésorerie",
    qualificationChecks: "enjeu de trésorerie, fiabilité comptable, outils, clôture, équipe, dette, gouvernance et urgence",
    scopeChecks: "reporting, budget, trésorerie, clôture, financement, comités, responsabilités du cabinet comptable et du client",
    requiredInputs: "balances, grands livres, banques, factures, paie, contrats, dettes, budgets et hypothèses dirigeant",
    productionStandard: "rapprochements, contrôles de cohérence, prévisions, scénarios, reporting et journal des hypothèses",
    criticalReview: "trésorerie, cut-off, TVA, paie, dettes, covenants, doublons et rapprochement comptable",
    restitutionStandard: "position de trésorerie, écarts, risques, décisions à prendre, responsables et échéances",
    planningSkills: "comptabilité de gestion, trésorerie, contrôle interne, financement, reporting et communication dirigeant",
    handoverContent: "calendrier financier, accès, soldes, hypothèses, échéances, alertes, décisions et interlocuteurs",
    marginRisks: "données tardives, retraitements, réunions dirigeant, urgences de trésorerie et périmètre comptable flou",
    complianceRisks: "séparation des rôles, accès bancaires, fraude, données de paie, secret professionnel et responsabilité de conseil",
  },
  "office-manager-externalise": {
    slug: "office-manager-externalise", name: "Office manager externalisé", wave: "externalized", reviewState: "internal_review_complete",
    growthPriorities: "forfaits récurrents, coordination fournisseurs, onboarding, gestion de bureau et projets internes",
    delegatedDecisions: "commande plafonnée, intervention fournisseur, organisation interne, remplacement et urgence de site",
    criticalAccess: "locaux, alarmes, fournisseurs, achats, RH, agendas, documents internes et outils collaboratifs",
    acquisitionActions: "réseau dirigeants, espaces de travail, RH externalisées, experts-comptables et contenus organisationnels",
    qualificationChecks: "sites, effectif, présence, fournisseurs, outils, irritants, budget, urgences et niveau d’autonomie",
    scopeChecks: "routines, projets, achats, événements, RH administrative, fournisseurs, présence et limites de décision",
    requiredInputs: "contacts, contrats, abonnements, planning, procédures, budget, accès locaux et règles internes",
    productionStandard: "tickets, checklists, calendrier partagé, commandes tracées, comptes rendus et tableau de suivi",
    criticalReview: "priorité, budget, validation, sécurité du site, données RH et bonne exécution fournisseur",
    restitutionStandard: "actions réalisées, incidents, budget, décisions demandées, échéances et amélioration proposée",
    planningSkills: "coordination, achats, fournisseurs, administration RH, événementiel, sécurité et communication interne",
    handoverContent: "contacts, clés, incidents, commandes, événements, arrivées-départs, budgets et tâches quotidiennes",
    marginRisks: "urgences, présence supplémentaire, événements, déplacements, achats non prévus et disponibilité continue",
    complianceRisks: "clés, sécurité des locaux, données salariés, délégations d’achat, assurances et responsabilité fournisseur",
  },
  "assistant-administratif-externalise": {
    slug: "assistant-administratif-externalise", name: "Assistant administratif externalisé", wave: "externalized", reviewState: "internal_review_complete",
    growthPriorities: "forfaits mensuels, facturation, suivi dossiers, relances, préparation comptable et automatisation",
    delegatedDecisions: "classement, relance, préparation de facture, correction simple, demande de pièce et escalade",
    criticalAccess: "boîte partagée, facturation, dossiers clients, achats, Drive, comptabilité et signatures",
    acquisitionActions: "réseau experts-comptables, TPE, consultants, recommandations et diagnostics administratifs",
    qualificationChecks: "volumes, outils, retards, fréquence, pièces, interlocuteurs, délais et responsabilités",
    scopeChecks: "tâches, volumes inclus, canaux, délais, validations, exceptions, accès et livrables de suivi",
    requiredInputs: "pièces, coordonnées, références, modèles, règles de classement, validations et échéances",
    productionStandard: "nommage, classement, contrôles, statuts, relances, preuve d’envoi et journal des exceptions",
    criticalReview: "destinataire, montant, référence, pièce, doublon, validation et confidentialité avant envoi",
    restitutionStandard: "dossiers traités, pièces manquantes, retards, anomalies, décisions demandées et prochaines échéances",
    planningSkills: "facturation, classement, relance, préparation comptable, outils bureautiques et contrôle documentaire",
    handoverContent: "boîtes, dossiers urgents, pièces manquantes, relances, échéances, validations et contacts",
    marginRisks: "volumes supérieurs, recherches de pièces, corrections répétées, urgences et canaux non cadrés",
    complianceRisks: "mandat, données personnelles, accès comptables, signature, conservation et séparation des clients",
  },
  "secretariat-externalise": {
    slug: "secretariat-externalise", name: "Secrétariat externalisé", wave: "externalized", reviewState: "internal_review_complete",
    growthPriorities: "permanence récurrente, gestion d’agenda, qualification des appels et suivi des messages",
    delegatedDecisions: "prise de rendez-vous, priorisation, rappel, transmission urgente et application d’une consigne écrite",
    criticalAccess: "téléphonie, agendas, boîtes partagées, fichiers contacts, scripts d’appel et dossiers de rendez-vous",
    acquisitionActions: "réseau professions libérales, TPE, centres d’affaires, recommandations et démonstrations de permanence",
    qualificationChecks: "volumes, horaires, motifs, agendas, urgences, script, données collectées et niveau de transfert",
    scopeChecks: "plages horaires, motifs, scripts, règles d’urgence, agendas, comptes rendus et débordement",
    requiredInputs: "consignes, contacts, disponibilités, réponses types, règles d’urgence et informations autorisées",
    productionStandard: "identification, qualification, reformulation, saisie structurée, confirmation et transmission",
    criticalReview: "identité, coordonnées, motif, urgence, consentement, créneau et bon destinataire",
    restitutionStandard: "appels, rendez-vous, messages urgents, demandes perdues, incidents et ajustements de script",
    planningSkills: "accueil téléphonique, agenda, qualification, rédaction, gestion d’urgence et confidentialité",
    handoverContent: "consignes du jour, agendas, appels attendus, urgences, messages ouverts et changements de script",
    marginRisks: "pics d’appels, appels longs, débordement horaire, agendas multiples et comptes rendus détaillés",
    complianceRisks: "identité, secret des correspondances, données de santé éventuelles, enregistrement et consentement",
  },
  "cabinet-qhse-conformite": {
    slug: "cabinet-qhse-conformite", name: "Cabinet QHSE / conformité", wave: "studies", reviewState: "internal_review_complete",
    growthPriorities: "audits, accompagnements de mise en conformité, systèmes de management et contrats récurrents",
    delegatedDecisions: "demande de preuve, classification d’écart, mesure conservatoire et ajustement du plan d’audit",
    criticalAccess: "documents réglementaires, sites, registres, incidents, données salariés et preuves d’audit",
    acquisitionActions: "réseau assureurs, experts-comptables, fédérations, contenus réglementaires et diagnostics ciblés",
    qualificationChecks: "référentiel, sites, risques, historique, échéance, audit attendu, autorités et disponibilité des preuves",
    scopeChecks: "référentiels, entités, sites, échantillonnage, entretiens, preuves, rapport et limites d’assurance",
    requiredInputs: "procédures, registres, évaluations, incidents, formations, contrôles, preuves terrain et exigences applicables",
    productionStandard: "critères, constats factuels, preuves, classification, cause, exigence et action corrective",
    criticalReview: "exactitude réglementaire, traçabilité des preuves, gravité, impartialité et formulation des écarts",
    restitutionStandard: "écarts par criticité, preuves, exigences, risques, actions, responsables et échéances",
    planningSkills: "audit, réglementation, analyse de risques, terrain, entretiens, système de management et restitution",
    handoverContent: "périmètre, référentiel, planning, preuves, écarts, risques critiques, interlocuteurs et obligations de suivi",
    marginRisks: "sites ajoutés, preuves dispersées, déplacements, changements réglementaires et suivi d’actions non prévu",
    complianceRisks: "impartialité, compétence auditeur, confidentialité, preuves sensibles, responsabilité et veille réglementaire",
  },
  "bureau-etudes": {
    slug: "bureau-etudes", name: "Bureau d’études", wave: "studies", reviewState: "internal_review_complete",
    growthPriorities: "études techniques rentables, marchés récurrents, assistance à maîtrise d’ouvrage et spécialités différenciantes",
    delegatedDecisions: "hypothèse réversible, demande de relevé, calcul complémentaire et alerte technique",
    criticalAccess: "plans, maquettes, calculs, logiciels métiers, données site, GED projet et espaces clients",
    acquisitionActions: "prescripteurs, architectes, maîtres d’ouvrage, appels d’offres ciblés et références techniques",
    qualificationChecks: "ouvrage, phase, programme, normes, données disponibles, interfaces, délais et responsabilités",
    scopeChecks: "phase, disciplines, hypothèses, calculs, plans, visas, réunions, formats, interfaces et exclusions",
    requiredInputs: "programme, relevés, plans, données géotechniques, contraintes site, normes, interfaces et décisions",
    productionStandard: "hypothèses numérotées, calculs vérifiables, plans cohérents, indices, nomenclature et note de synthèse",
    criticalReview: "calculs, unités, normes, interfaces, réservations, versions, constructibilité et cohérence plan-note",
    restitutionStandard: "hypothèses, variantes, résultats, limites, interfaces, risques techniques et décisions attendues",
    planningSkills: "calcul, conception, dessin, coordination, réglementation, économie et contrôle technique",
    handoverContent: "programme, hypothèses, plans, calculs, indices, commentaires, interfaces, risques et prochain rendu",
    marginRisks: "relevés manquants, modifications programme, reprises de plans, réunions et interfaces non cadrées",
    complianceRisks: "normes applicables, assurance, responsabilité, signature, propriété des plans et contrôle des calculs",
  },
  "cabinet-etudes": {
    slug: "cabinet-etudes", name: "Cabinet d’études", wave: "studies", reviewState: "internal_review_complete",
    growthPriorities: "études récurrentes, observatoires, enquêtes, évaluations et marchés institutionnels",
    delegatedDecisions: "ajustement d’échantillon documenté, relance, contrôle supplémentaire et anonymisation",
    criticalAccess: "questionnaires, bases répondants, données sources, outils statistiques, verbatims et espaces commanditaires",
    acquisitionActions: "appels d’offres ciblés, partenaires académiques, publications, réseaux institutionnels et références",
    qualificationChecks: "question de recherche, population, méthode, précision attendue, données, calendrier et usage des résultats",
    scopeChecks: "questions, population, échantillon, protocole, collecte, analyses, livrables, comités et limites",
    requiredInputs: "bases, questionnaires existants, documentation, contacts, règles d’échantillonnage et autorisations",
    productionStandard: "protocole documenté, données nettoyées, traitements reproductibles, analyses et limites explicites",
    criticalReview: "biais, échantillon, calculs, significativité, anonymisation, traçabilité et cohérence des conclusions",
    restitutionStandard: "méthode, résultats, limites, enseignements, recommandations et précautions d’interprétation",
    planningSkills: "méthodologie, enquête, collecte, statistique, analyse qualitative, rédaction et restitution",
    handoverContent: "protocole, échantillon, bases, traitements, journal de nettoyage, résultats, limites et calendrier",
    marginRisks: "taux de réponse, collecte prolongée, retraitement, demandes d’analyse et comités supplémentaires",
    complianceRisks: "consentement, anonymisation, RGPD, droits sur les bases, comité éthique et conservation",
  },
} satisfies Record<string, ConsultingTradeProfile>;
