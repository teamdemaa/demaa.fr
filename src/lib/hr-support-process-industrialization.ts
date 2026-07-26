import {
  composeProcessDraft,
  type IndustrializedContentItem,
  type IndustrializedProcessDefinition,
  type ProcessContentPatch,
  type ProcessDraft,
} from "@/lib/process-industrialization";

export type HrSupportRole =
  | "strategy"
  | "decisions"
  | "access"
  | "visibility"
  | "onboarding"
  | "team"
  | "handoff"
  | "payables"
  | "collections"
  | "profitability"
  | "retention"
  | "qualification"
  | "complaints"
  | "selling"
  | "intake"
  | "delays"
  | "traceability"
  | "delivery";

export type HrSupportProfile = {
  slug:
    | "agence-de-recrutement"
    | "cabinet-rh-externalise"
    | "centre-appels-support-client";
  name: string;
  sourceUrl: string;
  researchSources: readonly string[];
  priorities: string;
  urgentDecision: string;
  criticalAccess: string;
  workloadUnit: string;
  onboardingProof: string;
  handoffFrame: string;
  qualificationFrame: string;
  sellingFrame: string;
  intakeFrame: string;
  deliveryFrame: string;
  trackingFrame: string;
  clientEvidence: string;
  retentionFrame: string;
  billingFrame: string;
  riskFrame: string;
  operatingRule: string;
};

const processByRole: Record<HrSupportRole, string> = {
  strategy:
    "process.services-rh-support.direction.savoir-ou-va-lactivite",
  decisions:
    "process.services-rh-support.direction.decider-sans-bloquer-le-quotidien",
  access:
    "process.services-rh-support.direction.donner-acces-a-lessentiel",
  visibility:
    "process.services-rh-support.direction.garder-une-visibilite-sur-les-demandes",
  onboarding:
    "process.services-rh-support.equipe.integrer-un-nouveau-collaborateur",
  team:
    "process.services-rh-support.equipe.organiser-lequipe-et-les-remplacements",
  handoff:
    "process.services-rh-support.equipe.transmettre-un-dossier-en-cas-dabsence",
  payables: "process.services-rh-support.finance-admin.payer-a-temps",
  collections: "process.services-rh-support.finance-admin.se-faire-payer",
  profitability:
    "process.services-rh-support.finance-admin.suivre-la-rentabilite-des-comptes",
  retention:
    "process.services-rh-support.marketing-vente.fideliser-les-comptes",
  qualification:
    "process.services-rh-support.marketing-vente.qualifier-la-demande-client",
  complaints:
    "process.services-rh-support.marketing-vente.traiter-une-reclamation-client",
  selling:
    "process.services-rh-support.marketing-vente.vendre-la-bonne-prestation-de-support",
  intake:
    "process.services-rh-support.operations.prendre-et-qualifier-une-demande",
  delays:
    "process.services-rh-support.operations.suivre-les-delais-et-relances",
  traceability:
    "process.services-rh-support.operations.tracer-les-echanges-et-la-resolution",
  delivery:
    "process.services-rh-support.operations.traiter-le-dossier-ticket-ou-recrutement",
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

const definitionsByRole: Record<HrSupportRole, IndustrializedProcessDefinition> = {
  strategy: def("Choisir les clients, prestations et engagements compatibles avec la capacité.", "Revue mensuelle ou évolution du portefeuille.", "Des priorités commerciales et opérationnelles explicites.", "Dirigeant", "Mensuelle"),
  decisions: def("Arbitrer les urgences sans bloquer la production.", "Écart, risque, conflit ou délai critique.", "Une décision attribuée, datée et traçable.", "Manager", "Hebdomadaire"),
  access: def("Donner à chacun les informations nécessaires sans exposer les données sensibles.", "Arrivée, départ, nouveau compte ou incident.", "Des accès individuels, limités et révocables.", "Référent numérique", "Mensuelle"),
  visibility: def("Voir la charge, les délais, les risques et les prochaines actions.", "Nouvelle demande ou revue de portefeuille.", "Aucune demande active sans responsable ni échéance.", "Manager", "Quotidienne"),
  onboarding: def("Rendre un collaborateur autonome sur son périmètre après vérification.", "Arrivée ou changement de rôle.", "Une prise de poste accompagnée et validée.", "Manager", "À chaque arrivée"),
  team: def("Dimensionner et répartir la capacité selon les compétences et les engagements.", "Planification, pic de charge ou absence.", "Une couverture réaliste des files et portefeuilles.", "Manager", "Hebdomadaire"),
  handoff: def("Transmettre un dossier sans perte de contexte ni diffusion excessive.", "Absence ou réaffectation.", "Une reprise possible à partir des faits utiles.", "Responsable de dossier", "À chaque absence"),
  payables: def("Contrôler et payer les dépenses liées aux missions.", "Facture ou échéance fournisseur.", "Un paiement justifié, approuvé et rapproché.", "Responsable administratif", "Hebdomadaire"),
  collections: def("Facturer et relancer selon le contrat et les preuves de service.", "Jalon, clôture ou échéance.", "Des encaissements rapprochés et des litiges attribués.", "Responsable administratif", "Hebdomadaire"),
  profitability: def("Mesurer la marge réelle par compte, prestation et équipe.", "Clôture mensuelle.", "Des arbitrages fondés sur revenus, charge et reprises.", "Dirigeant", "Mensuelle"),
  retention: def("Renouveler la relation à partir des résultats et besoins réels.", "Revue de compte ou échéance contractuelle.", "Une suite utile, explicitée et planifiée.", "Responsable de compte", "Mensuelle"),
  qualification: def("Transformer une demande floue en périmètre traitable.", "Premier échange ou évolution du besoin.", "Des attentes, contraintes et critères de succès validés.", "Responsable de compte", "À chaque demande"),
  complaints: def("Traiter l’insatisfaction avec faits, délai, réponse et correction.", "Réclamation client, candidat, salarié ou usager.", "Une réponse traçable et une cause suivie.", "Manager", "À chaque réclamation"),
  selling: def("Vendre une prestation avec périmètre, limites, responsabilités et mesure.", "Demande qualifiée.", "Une proposition comparable et exploitable.", "Commercial", "À chaque proposition"),
  intake: def("Enregistrer chaque demande dans la bonne file avec les informations nécessaires.", "Contact entrant ou demande interne.", "Un dossier qualifié et orienté dès la prise en charge.", "Coordinateur", "À chaque demande"),
  delays: def("Piloter les échéances et relances jusqu’à résolution.", "Dossier ouvert ou attente d’un tiers.", "Une prochaine action datée sur chaque dossier.", "Coordinateur", "Quotidienne"),
  traceability: def("Conserver les échanges et preuves utiles dans un historique unique.", "Contact, décision, transfert ou clôture.", "Une chronologie compréhensible et conforme.", "Responsable de dossier", "À chaque interaction"),
  delivery: def("Exécuter la prestation selon le besoin, les règles et le niveau de service convenu.", "Dossier qualifié et attribué.", "Un résultat contrôlé, communiqué et clôturé.", "Responsable de dossier", "À chaque dossier"),
};

const contentByRole: Record<HrSupportRole, IndustrializedContentItem[]> = {
  strategy: [
    item("implementation_action", "Choisir les segments clients, prestations, canaux et niveaux de service prioritaires"),
    item("implementation_action", "Fixer les objectifs de volume, délai, qualité, récurrence, satisfaction et marge"),
    item("recurring_control", "Comparer chaque mois demandes, production, retards, reprises, satisfaction et rentabilité"),
    item("operating_rule", "Ne pas vendre un engagement que la capacité, les compétences ou les outils ne permettent pas de tenir"),
  ],
  decisions: [
    item("implementation_action", "Écrire les décisions délégables avec seuil, délai, preuve et personne à informer"),
    item("operational_step", "Classer chaque alerte selon urgence, impact humain, client, juridique, financier et réputationnel"),
    item("operational_step", "Appliquer la mesure conservatoire autorisée puis escalader l’action engageante"),
    item("recurring_control", "Revoir chaque semaine les décisions tardives, contournées ou non tracées"),
  ],
  access: [
    item("implementation_action", "Tenir le registre des logiciels, comptes, propriétaires, droits et modalités de récupération"),
    item("operational_step", "Attribuer un accès individuel limité aux comptes et données nécessaires"),
    item("operational_step", "Retirer les droits le jour du départ ou du changement de mission"),
    item("recurring_control", "Contrôler chaque mois comptes inactifs, exports, partages externes et accès anormaux"),
  ],
  visibility: [
    item("implementation_action", "Créer une vue par demande avec client, objet, priorité, délai, responsable et prochaine action"),
    item("operational_step", "Affecter la demande selon compétence, charge, continuité et niveau d’habilitation"),
    item("recurring_control", "Arbitrer chaque jour urgences, attentes, retards et demandes sans propriétaire"),
    item("operating_rule", "Ne laisser aucune demande active sans statut ni date de prochaine action"),
  ],
  onboarding: [
    item("implementation_action", "Préparer une checklist d’arrivée avec rôle, clients, méthodes, outils, sécurité et supervision"),
    item("operational_step", "Vérifier contrat, confidentialité, compétences, formations et habilitations nécessaires"),
    item("operational_step", "Faire traiter des cas tests puis des dossiers réels sous contrôle"),
    item("recurring_control", "Valider l’autonomie sur la qualité, la traçabilité et les escalades avant de retirer la supervision"),
  ],
  team: [
    item("implementation_action", "Tenir une matrice compétences, comptes, horaires, titulaires et suppléants"),
    item("operational_step", "Planifier la capacité à partir des volumes prévus, absences et engagements"),
    item("operational_step", "Rééquilibrer les files avant qu’un retard individuel devienne un retard client"),
    item("recurring_control", "Revoir chaque semaine charge, couverture, qualité et besoins de renfort ou formation"),
  ],
  handoff: [
    item("implementation_action", "Créer une fiche de passation avec faits, actions, décisions, pièces, risques et échéances"),
    item("operational_step", "Transmettre uniquement le contexte utile par le canal autorisé"),
    item("operational_step", "Faire reprendre en priorité les échéances et situations sensibles"),
    item("recurring_control", "Faire confirmer le nouveau responsable et la prochaine action"),
  ],
  payables: [
    item("implementation_action", "Centraliser fournisseurs, contrats, commandes, factures, responsables et échéances"),
    item("operational_step", "Rapprocher chaque facture avec la prestation, le contrat ou la commande"),
    item("operational_step", "Faire approuver le paiement selon les seuils avant émission"),
    item("recurring_control", "Contrôler chaque semaine doublons, avoirs, abonnements inutilisés et échéances proches"),
  ],
  collections: [
    item("implementation_action", "Créer l’échéancier de facturation par compte, forfait, volume, jalon et variable"),
    item("operational_step", "Joindre à chaque facture la preuve prévue au contrat"),
    item("operational_step", "Relancer les impayés selon un calendrier écrit et attribuer les contestations"),
    item("recurring_control", "Rapprocher chaque semaine factures, avoirs, règlements et écarts"),
  ],
  profitability: [
    item("implementation_action", "Construire une marge par compte avec revenus, temps, outils, achats, reprises et encadrement"),
    item("operational_step", "Imputer le temps et les coûts au bon compte et au bon type de demande"),
    item("recurring_control", "Comparer chaque mois marge prévue, marge réelle, volume et niveau de service"),
    item("operating_rule", "Renégocier périmètre, prix ou organisation quand les reprises détruisent durablement la marge"),
  ],
  retention: [
    item("implementation_action", "Planifier les revues de compte avant les échéances contractuelles"),
    item("operational_step", "Présenter résultats, incidents, tendances, capacité et actions d’amélioration"),
    item("operational_step", "Valider les priorités et le niveau de service de la période suivante"),
    item("recurring_control", "Suivre renouvellements, extensions utiles, risques de départ et actions promises"),
  ],
  qualification: [
    item("implementation_action", "Créer une trame de découverte avec contexte, volume, urgence, contraintes, données et résultat attendu"),
    item("operational_step", "Identifier décideur, utilisateurs, personnes concernées et validations nécessaires"),
    item("operational_step", "Faire préciser exclusions, dépendances, délai, budget et critères d’acceptation"),
    item("operating_rule", "Suspendre la proposition tant que le besoin ou les responsabilités restent ambigus"),
  ],
  complaints: [
    item("implementation_action", "Centraliser les réclamations avec auteur, objet, faits, pièces, risque, responsable et délai"),
    item("operational_step", "Accuser réception et annoncer la prochaine étape sans promettre l’issue"),
    item("operational_step", "Reconstituer la chronologie, vérifier les preuves et faire valider la réponse sensible"),
    item("recurring_control", "Analyser chaque mois causes, délais, récurrences et corrections réellement appliquées"),
  ],
  selling: [
    item("implementation_action", "Construire une proposition avec périmètre, volumes, canaux, horaires, livrables, limites et prix"),
    item("operational_step", "Définir responsabilités du client, délais de réponse et conditions de changement"),
    item("operational_step", "Faire valider le niveau de service, le reporting, les données et les critères de recette"),
    item("operating_rule", "Formaliser tout élargissement de périmètre avant de l’exécuter"),
  ],
  intake: [
    item("implementation_action", "Créer un formulaire d’entrée avec identité, compte, demande, urgence, pièces et consentements utiles"),
    item("operational_step", "Vérifier que la demande relève du contrat, du bon canal et du bon niveau de priorité"),
    item("operational_step", "Compléter les informations manquantes avant transmission à la production"),
    item("recurring_control", "Mesurer chaque semaine demandes incomplètes, mal routées, dupliquées ou abandonnées"),
  ],
  delays: [
    item("implementation_action", "Créer des échéances par étape avec responsable, relance et seuil d’escalade"),
    item("operational_step", "Relancer le bon interlocuteur en rappelant précisément l’élément attendu"),
    item("operational_step", "Informer avant dépassement le client ou la personne concernée et proposer la suite"),
    item("recurring_control", "Contrôler chaque jour dossiers sans action, attentes anciennes et engagements proches"),
  ],
  traceability: [
    item("implementation_action", "Définir l’historique unique : source, objet, faits, action, auteur, horodatage et pièce"),
    item("operational_step", "Consigner après chaque interaction les faits utiles sans commentaire subjectif inutile"),
    item("operational_step", "Relier décision, message, pièce, validation et résultat au même dossier"),
    item("operating_rule", "Limiter accès, export et conservation selon la finalité et les règles applicables"),
    item("recurring_control", "Échantillonner chaque semaine des dossiers pour vérifier complétude, exactitude et suppression prévue"),
  ],
  delivery: [
    item("implementation_action", "Créer la checklist de traitement avec étapes, scripts, contrôles, preuves et sortie attendue"),
    item("operational_step", "Vérifier le dossier et reformuler l’objectif avant toute action engageante"),
    item("operational_step", "Exécuter la prestation, tracer les écarts et demander la validation nécessaire"),
    item("operational_step", "Communiquer le résultat, les limites et la prochaine action à l’interlocuteur prévu"),
    item("recurring_control", "Clôturer seulement après contrôle des preuves, du statut, de la facturation et de la conservation"),
  ],
};

const buildCoreDraft = (): ProcessDraft => ({
  definitionsById: Object.fromEntries(
    Object.entries(processByRole).map(([role, processId]) => [
      processId,
      definitionsByRole[role as HrSupportRole],
    ]),
  ),
  contentByProcessId: Object.fromEntries(
    Object.entries(processByRole).map(([role, processId]) => [
      processId,
      contentByRole[role as HrSupportRole],
    ]),
  ),
});

const patch = (
  role: HrSupportRole,
  contentIndex: number,
  label: string,
): ProcessContentPatch => ({
  processId: processByRole[role],
  contentIndex,
  label,
});

const profilePatches = (
  profile: HrSupportProfile,
): readonly ProcessContentPatch[] => [
  patch("strategy", 0, `Choisir les priorités de l’activité : ${profile.priorities}`),
  patch("decisions", 1, `Escalader ou arbitrer sans délai : ${profile.urgentDecision}`),
  patch("access", 0, `Tenir à jour les accès critiques : ${profile.criticalAccess}`),
  patch("visibility", 0, `Piloter la charge avec l’unité réelle de travail : ${profile.workloadUnit}`),
  patch("onboarding", 1, `Vérifier avant toute prise de portefeuille : ${profile.onboardingProof}`),
  patch("handoff", 0, `Organiser la passation avec : ${profile.handoffFrame}`),
  patch("qualification", 0, `Qualifier la demande client avec : ${profile.qualificationFrame}`),
  patch("selling", 0, `Formaliser la prestation avec : ${profile.sellingFrame}`),
  patch("intake", 0, `Enregistrer toute demande avec : ${profile.intakeFrame}`),
  patch("delivery", 0, `Construire la checklist métier autour de : ${profile.deliveryFrame}`),
  patch("delays", 0, `Construire l’échéancier autour de : ${profile.trackingFrame}`),
  patch("traceability", 0, `Conserver comme preuve de service : ${profile.clientEvidence}`),
  patch("retention", 1, `Présenter lors de la revue de compte : ${profile.retentionFrame}`),
  patch("collections", 0, `Facturer et rapprocher selon : ${profile.billingFrame}`),
  patch("complaints", 0, `Tracer les incidents propres au métier : ${profile.riskFrame}`),
  patch("traceability", 3, `Appliquer la règle métier suivante : ${profile.operatingRule}`),
];

export const generateHrSupportCoreDraft = () => buildCoreDraft();

export const generateHrSupportDraft = (profile: HrSupportProfile) =>
  composeProcessDraft(buildCoreDraft(), [
    {
      id: `metier.${profile.slug}`,
      contentPatches: profilePatches(profile),
    },
  ]);

const cnilRecruitment =
  "https://www.cnil.fr/fr/le-guide-du-recrutement";
const cnilRetention =
  "https://www.cnil.fr/fr/referentiel-durees-conservation-donnees-rh";

export const hrSupportProfiles = {
  "agence-de-recrutement": {
    slug: "agence-de-recrutement",
    name: "Agence de recrutement",
    sourceUrl:
      "https://docs.google.com/spreadsheets/d/1_leHlVSML48rvchBUCa87ljS2bWq5terVVzFgpfOOuI/edit",
    researchSources: [
      cnilRecruitment,
      cnilRetention,
      "https://www.service-public.fr/particuliers/actualites/A17894?lang=fr",
      "https://travail-emploi.gouv.fr/sites/travail-emploi/files/2025-05/R%C3%A9f%C3%A9rentiel%20de%20formation%20pour%20pr%C3%A9venir%20les%20discriminations%20dans%20l%E2%80%99emploi%20-%20Mai%202025.pdf",
    ],
    priorities: "recrutements au succès, missions au forfait ou récurrentes, métiers ciblés, viviers, délais, taux de présentation, placement et garantie",
    urgentDecision: "candidat divulgué sans base, critère discriminatoire, conflit client, référence sensible, offre retirée, contre-offre, refus tardif ou placement menacé",
    criticalAccess: "ATS, jobboards, CVthèque, sourcing, messagerie, agenda, tests, prise de références, signature et dossiers clients",
    workloadUnit: "missions, postes, candidats sourcés, qualifiés, présentés, entretiens, offres, placements, garanties et honoraires",
    onboardingProof: "méthode d’entretien, critères liés au poste, non-discrimination, information RGPD, ATS, consentements, confidentialité et validation client",
    handoffFrame: "brief, critères, salaire, délai, sourcing, candidats, évaluations, échanges, refus, entretiens, offre et prochaine action",
    qualificationFrame: "poste, missions, compétences indispensables, équipe, localisation, salaire, délai, étapes, décideurs, exclusions et critères de réussite",
    sellingFrame: "brief, stratégie de recherche, livrables, délais, exclusivité éventuelle, honoraires, garantie de remplacement, responsabilités et données",
    intakeFrame: "client, poste, fiche de mission, compétences, salaire, localisation, calendrier, décideurs, canal candidat et base de traitement",
    deliveryFrame: "brief validé, annonce non discriminatoire, sourcing, tri documenté, entretien structuré, présentation, retours, offre et placement",
    trackingFrame: "lancement, sourcing, qualification, présentation, entretien client, décision, offre, prise de poste, garantie et facture",
    clientEvidence: "brief daté, critères liés au poste, origine du candidat, information, évaluations factuelles, consentements utiles, retours et décision",
    retentionFrame: "délais, qualité des candidatures, taux de présentation, entretiens, placements, abandons, garantie et recrutements futurs",
    billingFrame: "acompte, forfait, jalon, succès, prise de poste, période de garantie, remplacement, avoir et encaissement",
    riskFrame: "discrimination, collecte excessive, CV transmis sans cadre, données conservées sans durée, référence irrégulière, conflit et promesse non autorisée",
    operatingRule: "n’utiliser que des critères directement liés au poste, informer le candidat, limiter les accès et appliquer la durée de conservation documentée",
  },
  "cabinet-rh-externalise": {
    slug: "cabinet-rh-externalise",
    name: "Cabinet RH externalisé",
    sourceUrl:
      "https://docs.google.com/spreadsheets/d/1Seyq4ikKcw6HPlcNr1qHCGDU75pe4BKrS3Gv-PouFpg/edit",
    researchSources: [
      cnilRecruitment,
      cnilRetention,
      "https://www.service-public.fr/particuliers/vosdroits/F2210?lang=fr",
      "https://cnil.fr/fr/acces-locaux-controle-des-horaires-au-travail",
    ],
    priorities: "administration du personnel, onboarding, absences, disciplinaire encadré, formation, entretiens, paie en liaison, relations collectives et projets RH",
    urgentDecision: "accident, harcèlement ou discrimination signalée, disciplinaire, rupture, erreur de paie, donnée exposée, échéance sociale ou conflit de rôle",
    criticalAccess: "SIRH, dossiers salariés, paie en consultation selon mission, coffre-fort, médecine du travail, formation, signature et portail client",
    workloadUnit: "clients, salariés, entrées, sorties, contrats, absences, variables, entretiens, formations, alertes, échéances et projets",
    onboardingProof: "périmètre contractuel, règles du client, confidentialité, droit d’accès, SIRH, calendrier social, escalades et limites du conseil",
    handoffFrame: "client, salarié concerné, faits datés, contrat, pièces, échanges, risque, échéance, validation employeur et prochaine action",
    qualificationFrame: "effectif, conventions, sites, outils, pratiques, calendrier, irritants, interlocuteurs, données, risques et responsabilités conservées par l’employeur",
    sellingFrame: "périmètre RH, effectif, volumes, calendrier, livrables, astreintes exclues, responsabilités employeur, données, honoraires et réversibilité",
    intakeFrame: "client, salarié ou population, objet, faits, urgence, échéance, documents, confidentialité, décideur et professionnel à saisir si nécessaire",
    deliveryFrame: "analyse factuelle, vérification du cadre, options, validation employeur, document, communication, mise à jour SIRH et suivi",
    trackingFrame: "entrée, période d’essai, visite, absence, variable, entretien, formation, échéance contractuelle, sortie, contentieux et archivage",
    clientEvidence: "demande, faits, pièces, règle vérifiée, options présentées, validation de l’employeur, document transmis, action et date",
    retentionFrame: "échéances tenues, dossiers incomplets, incidents, charge, conformité documentaire, satisfaction managers et priorités RH",
    billingFrame: "forfait par effectif ou périmètre, prestations hors forfait, projet, urgence, temps validé, facture, avoir et encaissement",
    riskFrame: "donnée salariale exposée, décision prise à la place de l’employeur, échéance manquée, document erroné, alerte sensible ou conflit d’intérêts",
    operatingRule: "faire valider par l’employeur toute décision qui lui appartient, restreindre les accès et appliquer les durées de conservation RH documentées",
  },
  "centre-appels-support-client": {
    slug: "centre-appels-support-client",
    name: "Centre d’appels / support client",
    sourceUrl:
      "https://docs.google.com/spreadsheets/d/1lSqEz4rLXjRAWWo_dYLtCXM5LfTE70TANcKB0b2M0QM/edit",
    researchSources: [
      "https://cnil.fr/fr/lecoute-et-lenregistrement-des-appels-sur-le-lieu-de-travail",
      cnilRetention,
      "https://www.economie.gouv.fr/entreprises/developper-son-entreprise/innover-et-numeriser-son-entreprise/professionnels-comment-respecter-la-reglementation-sur-le-demarchage",
      "https://www.economie.gouv.fr/dgccrf/les-fiches-pratiques/demarchage-telephonique-professionnels-mettez-vous-en-conformite-avec-la-reglementation",
    ],
    priorities: "service client entrant, support multicanal, permanence, débordement, campagnes autorisées, résolution au premier contact, qualité et SLA",
    urgentDecision: "sécurité ou santé, menace, fraude, client vulnérable, incident massif, données exposées, enregistrement contesté ou campagne non conforme",
    criticalAccess: "téléphonie, SVI, CRM, ticketing, email, chat, base de connaissances, enregistrements, planification et tableaux de service",
    workloadUnit: "contacts entrants et sortants, appels offerts, décrochés, abandonnés, tickets, files, SLA, transferts, résolutions et réitérations",
    onboardingProof: "scripts, authentification, confidentialité, outils, base de connaissances, motifs, escalades, enregistrement, qualité et cas sensibles",
    handoffFrame: "client, contact, authentification, motif, faits, actions, promesse, pièces, sentiment, risque, SLA et prochaine action",
    qualificationFrame: "canaux, horaires, volumes, motifs, langues, saisonnalité, authentification, SLA, intégrations, escalades, enregistrement et reporting",
    sellingFrame: "périmètre, prévisions, canaux, amplitude, capacité, SLA, scripts, qualité, données, réversibilité, prix et hors-périmètre",
    intakeFrame: "identité ou référence, canal, motif, authentification nécessaire, urgence, langue, historique, consentement et résultat attendu",
    deliveryFrame: "salutation, information d’enregistrement, authentification, écoute, qualification, réponse, escalade, reformulation et clôture",
    trackingFrame: "prise en charge, première réponse, attente, relance, transfert, résolution, confirmation, réouverture et clôture",
    clientEvidence: "horodatage, canal, motif, authentification, résumé factuel, action, script ou article utilisé, transfert, résultat et satisfaction",
    retentionFrame: "volumes, SLA, abandon, résolution au premier contact, réitérations, qualité, motifs, escalades et actions de fond",
    billingFrame: "forfait, position, heure productive, contact, campagne, palier de volume, débordement, bonus-malus contractuel et encaissement",
    riskFrame: "mauvaise authentification, secret divulgué, promesse non autorisée, appel agressif, enregistrement excessif, pic non couvert ou campagne illicite",
    operatingRule: "enregistrer seulement si nécessaire et proportionné, informer salariés et interlocuteurs, limiter la conservation et prouver le consentement préalable requis pour la prospection B2C à compter du 11 août 2026",
  },
} satisfies Record<string, HrSupportProfile>;
