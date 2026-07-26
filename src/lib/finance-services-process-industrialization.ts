import {
  composeProcessDraft,
  type IndustrializedContentItem,
  type IndustrializedProcessDefinition,
  type ProcessContentPatch,
  type ProcessDraft,
} from "@/lib/process-industrialization";

export type FinanceServicesRole =
  | "strategy"
  | "decisions"
  | "access"
  | "portfolio"
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
  | "file"
  | "coordination"
  | "tracking"
  | "incident"
  | "compliance";

export type FinanceServicesProfile = {
  slug:
    | "courtier-credit-assurance"
    | "cabinet-assurance"
    | "gestionnaire-de-patrimoine"
    | "societe-recouvrement";
  name: string;
  sourceUrl: string;
  researchSources: readonly string[];
  priorities: string;
  urgentDecision: string;
  criticalAccess: string;
  portfolioUnit: string;
  onboardingProof: string;
  handoffFrame: string;
  qualificationFrame: string;
  sellingFrame: string;
  fileOpeningFrame: string;
  dueDiligenceFrame: string;
  coordinationFrame: string;
  trackingFrame: string;
  incidentFrame: string;
  incidentResponse: string;
  complianceFrame: string;
  clientProof: string;
};

const processByRole: Record<FinanceServicesRole, string> = {
  strategy:
    "process.services-finance-assurance.direction.savoir-ou-va-lactivite",
  decisions:
    "process.services-finance-assurance.direction.decider-sans-bloquer-les-dossiers",
  access:
    "process.services-finance-assurance.direction.donner-acces-a-lessentiel",
  portfolio:
    "process.services-finance-assurance.direction.garder-une-visibilite-sur-le-portefeuille",
  onboarding:
    "process.services-finance-assurance.equipe.integrer-un-nouveau-collaborateur",
  team:
    "process.services-finance-assurance.equipe.organiser-les-portefeuilles-et-remplacements",
  handoff:
    "process.services-finance-assurance.equipe.transmettre-un-dossier-en-cas-dabsence",
  payables: "process.services-finance-assurance.finance-admin.payer-a-temps",
  collections: "process.services-finance-assurance.finance-admin.se-faire-payer",
  profitability:
    "process.services-finance-assurance.finance-admin.suivre-la-rentabilite-du-portefeuille",
  retention:
    "process.services-finance-assurance.marketing-vente.fideliser-les-clients",
  qualification:
    "process.services-finance-assurance.marketing-vente.qualifier-le-besoin-et-le-profil-client",
  complaints:
    "process.services-finance-assurance.marketing-vente.traiter-une-reclamation-client",
  selling:
    "process.services-finance-assurance.marketing-vente.vendre-une-solution-ou-un-contrat",
  file:
    "process.services-finance-assurance.operations.constituer-un-dossier-complet",
  coordination:
    "process.services-finance-assurance.operations.coordonner-partenaires-contrats-ou-placements",
  tracking:
    "process.services-finance-assurance.operations.suivre-les-echeances-commissions-ou-encours",
  incident:
    "process.services-finance-assurance.operations.traiter-un-incident-une-alerte-ou-un-sinistre",
  compliance:
    "process.services-finance-assurance.conformite-metier.securiser-conformite-reglementaire",
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
  FinanceServicesRole,
  IndustrializedProcessDefinition
> = {
  strategy: def("Choisir les segments, solutions et partenaires compatibles avec les statuts et la capacité.", "Revue trimestrielle ou évolution réglementaire.", "Des priorités rentables sans élargissement non maîtrisé du périmètre.", "Dirigeant", "Mensuelle"),
  decisions: def("Arbitrer les dossiers sensibles sans contourner les contrôles.", "Alerte, refus, conflit, incident ou échéance.", "Une décision attribuée, motivée et tracée.", "Responsable de dossier", "Hebdomadaire"),
  access: def("Limiter les accès aux données, extranets et opérations autorisées.", "Arrivée, départ, délégation ou incident.", "Des droits individuels cohérents avec les habilitations.", "Référent numérique", "Mensuelle"),
  portfolio: def("Voir la charge, le risque, la valeur et les prochaines actions du portefeuille.", "Nouvelle demande ou revue de production.", "Un portefeuille arbitrable sans dossier invisible.", "Manager", "Hebdomadaire"),
  onboarding: def("Rendre un collaborateur opérationnel après contrôle de sa capacité et de ses droits.", "Arrivée ou changement de fonction.", "Une prise de poste accompagnée et vérifiée.", "Manager", "À chaque arrivée"),
  team: def("Affecter les dossiers selon compétence, habilitation et disponibilité.", "Planification ou absence.", "Un titulaire et un suppléant pour chaque dossier sensible.", "Manager", "Hebdomadaire"),
  handoff: def("Transmettre l’état utile sans perte d’échéance ni diffusion excessive.", "Absence ou réaffectation.", "Une reprise possible à partir des faits, pièces et décisions.", "Responsable de dossier", "À chaque absence"),
  payables: def("Payer les dépenses et reversements après contrôle.", "Facture ou échéance.", "Un paiement autorisé et rapproché.", "Responsable administratif", "Hebdomadaire"),
  collections: def("Suivre honoraires, commissions et créances à partir des contrats et opérations.", "Échéance de paiement ou bordereau.", "Des encaissements rapprochés et des écarts attribués.", "Responsable administratif", "Hebdomadaire"),
  profitability: def("Mesurer la rentabilité réelle par portefeuille, produit, partenaire et dossier.", "Revue mensuelle.", "Des arbitrages fondés sur temps, coûts, revenus et risque.", "Dirigeant", "Mensuelle"),
  retention: def("Maintenir la solution cohérente avec la situation et les besoins du client.", "Échéance, événement ou revue.", "Une relation suivie et des adaptations justifiées.", "Responsable de portefeuille", "Mensuelle"),
  qualification: def("Recueillir les informations nécessaires avant toute proposition ou action.", "Premier contact ou changement de situation.", "Un profil suffisamment documenté pour poursuivre ou s’abstenir.", "Conseiller", "À chaque demande"),
  complaints: def("Traiter les réclamations avec une chronologie, un responsable et une réponse.", "Insatisfaction ou contestation.", "Une réponse traçable et une cause corrigée.", "Référent réclamations", "À chaque réclamation"),
  selling: def("Présenter une solution cohérente avec le besoin, le statut et les limites du professionnel.", "Profil qualifié.", "Une proposition expliquée, comparée et acceptée.", "Conseiller", "À chaque proposition"),
  file: def("Constituer un dossier complet avant transmission, souscription, conseil ou action.", "Accord du client ou mandat.", "Des pièces validées et une piste de contrôle exploitable.", "Gestionnaire", "À chaque dossier"),
  coordination: def("Coordonner les tiers sans perdre la responsabilité de suivi.", "Dossier transmis ou opération engagée.", "Des demandes, retours et décisions attribués.", "Gestionnaire", "Quotidienne"),
  tracking: def("Suivre les échéances, encours et rémunérations jusqu’à leur résolution.", "Ouverture du dossier ou flux reçu.", "Une prochaine action datée pour chaque élément ouvert.", "Gestionnaire", "Hebdomadaire"),
  incident: def("Qualifier et traiter tout incident, alerte ou sinistre selon son urgence.", "Signalement ou détection.", "Une mesure immédiate, une information et une correction.", "Responsable de dossier", "À chaque incident"),
  compliance: def("Maintenir les statuts, capacités, assurances, vigilances et preuves de conseil.", "Entrée en relation, renouvellement ou contrôle.", "Un exercice conforme et démontrable.", "Référent conformité", "Mensuelle"),
};

const contentByRole: Record<FinanceServicesRole, IndustrializedContentItem[]> = {
  strategy: [
    item("implementation_action", "Choisir les segments clients, besoins, solutions, zones et partenaires prioritaires"),
    item("implementation_action", "Fixer les objectifs de dossiers, revenus, récurrence, délai, qualité et risque"),
    item("recurring_control", "Comparer chaque mois demandes, transformations, portefeuille, incidents, revenus et rentabilité"),
    item("operating_rule", "Ne pas développer une activité sans statut, capacité, assurance, partenaire et contrôle adaptés"),
  ],
  decisions: [
    item("implementation_action", "Écrire les décisions délégables avec seuil, délai, preuve et personne à informer"),
    item("operational_step", "Classer le dossier selon urgence, impact client, conformité, montant, conflit et réversibilité"),
    item("operational_step", "Appliquer la mesure conservatoire autorisée puis faire valider l’action engageante"),
    item("recurring_control", "Revoir chaque mois les décisions tardives, non tracées ou prises hors délégation"),
  ],
  access: [
    item("implementation_action", "Créer un registre des logiciels, extranets, comptes, propriétaires, droits et récupérations"),
    item("operational_step", "Attribuer un accès individuel limité au portefeuille et aux opérations nécessaires"),
    item("operational_step", "Retirer les droits le jour du départ ou du changement d’habilitation"),
    item("recurring_control", "Tester chaque mois doubles authentifications, comptes inactifs, exports et accès anormaux"),
  ],
  portfolio: [
    item("implementation_action", "Créer une vue par dossier avec valeur, étape, risque, échéance, responsable et prochaine action"),
    item("operational_step", "Affecter chaque demande selon compétence, capacité, relation partenaire et niveau de contrôle"),
    item("recurring_control", "Arbitrer chaque semaine dossiers bloqués, relances en retard, risques et tâches sans propriétaire"),
    item("operating_rule", "Ne laisser aucun dossier actif sans date de prochaine action ni responsable"),
  ],
  onboarding: [
    item("implementation_action", "Préparer une checklist d’arrivée avec rôle, statuts, produits, outils, portefeuille et supervision"),
    item("operational_step", "Vérifier identité, contrat, honorabilité, capacité, formation et habilitations nécessaires"),
    item("operational_step", "Faire signer la confidentialité et expliquer les règles de conseil, réclamation et sécurité"),
    item("recurring_control", "Valider après accompagnement les droits, dossiers tests et contrôles réellement maîtrisés"),
  ],
  team: [
    item("implementation_action", "Tenir une matrice compétences, statuts, produits, portefeuilles, titulaires et suppléants"),
    item("operational_step", "Séparer conseil, validation et mouvement sensible lorsque le risque le justifie"),
    item("recurring_control", "Revoir chaque semaine absences, charge, habilitations et échéances sans couverture"),
  ],
  handoff: [
    item("implementation_action", "Créer une fiche de passation avec profil, mandat, pièces, propositions, décisions, flux et échéances"),
    item("operational_step", "Transmettre uniquement les informations nécessaires par les canaux autorisés"),
    item("recurring_control", "Faire confirmer la reprise des urgences, accès et prochaines actions"),
  ],
  payables: [
    item("implementation_action", "Créer un échéancier des fournisseurs, abonnements, reversements, remboursements et validations"),
    item("operational_step", "Comparer facture ou bordereau, contrat, service ou flux reçu, montant et autorisation"),
    item("recurring_control", "Rapprocher chaque semaine doublons, avoirs, paiements, reversements et banque"),
  ],
  collections: [
    item("implementation_action", "Créer un suivi reliant contrat, opération, rémunération, facture, bordereau et règlement"),
    item("operational_step", "Vérifier l’exigibilité et le calcul avant toute facture ou relance"),
    item("operational_step", "Qualifier chaque écart avec partenaire ou client, motif, preuve et prochaine action"),
    item("recurring_control", "Rapprocher chaque semaine créances, commissions, honoraires, encaissements et banque"),
  ],
  profitability: [
    item("implementation_action", "Définir les temps, coûts, revenus et risques attendus par type de dossier"),
    item("operational_step", "Imputer temps, frais, reprises, partenaires et incidents au bon portefeuille"),
    item("recurring_control", "Comparer chaque mois volume, conversion, revenu, coût de service, risque et marge"),
    item("operating_rule", "Revoir le segment, le partenaire ou le prix avant de poursuivre un portefeuille durablement déficitaire"),
  ],
  retention: [
    item("implementation_action", "Planifier les revues clients selon échéance, événements, risque et durée de la relation"),
    item("operational_step", "Actualiser situation, besoins, solution détenue, satisfaction et prochaines décisions"),
    item("recurring_control", "Suivre chaque mois contrats à revoir, clients sans contact, résiliations et attrition"),
  ],
  qualification: [
    item("implementation_action", "Créer une trame de découverte avec identité, besoin, situation, objectifs, contraintes et consentements"),
    item("operational_step", "Recueillir les informations nécessaires sans orienter les réponses ni masquer les risques"),
    item("operational_step", "Vérifier cohérence, complétude, justificatifs et personnes habilitées à décider"),
    item("operating_rule", "S’abstenir de proposer ou d’agir lorsque les informations indispensables manquent"),
  ],
  complaints: [
    item("implementation_action", "Créer un registre avec réclamant, produit ou dossier, faits, pièces, délai, réponse et correction"),
    item("operational_step", "Accuser réception, attribuer le dossier et sécuriser immédiatement les droits ou flux concernés"),
    item("operational_step", "Comparer profil, mandat, conseil, contrat, échanges, mouvements et engagements"),
    item("recurring_control", "Suivre délais, médiation éventuelle, corrections et causes récurrentes"),
  ],
  selling: [
    item("implementation_action", "Créer une trame de proposition avec besoin, solution, garanties ou effets, risques, coûts et rémunération"),
    item("operational_step", "Comparer la solution au profil et expliquer les écarts, limites, exclusions et alternatives"),
    item("operational_step", "Remettre les informations et preuves requises avant l’engagement du client"),
    item("operating_rule", "Ne jamais présenter comme garanti un résultat, un rendement, une acceptation ou un recouvrement incertain"),
  ],
  file: [
    item("implementation_action", "Créer une checklist d’ouverture avec client, bénéficiaires, mandat, besoin, statut et interlocuteurs"),
    item("operational_step", "Vérifier identité, coordonnées, capacité, pouvoirs et cohérence des pièces"),
    item("operational_step", "Réaliser les contrôles de vigilance, conflit, consentement et acceptation applicables"),
    item("operational_step", "Classer questionnaire, justificatifs, propositions, décisions, contrats et preuves de remise"),
    item("recurring_control", "Bloquer la transmission ou l’action tant que les pièces critiques restent absentes"),
  ],
  coordination: [
    item("implementation_action", "Créer un suivi des partenaires avec demande, prérequis, interlocuteur, délai, retour et décision"),
    item("operational_step", "Transmettre uniquement les pièces autorisées et conserver la preuve d’envoi"),
    item("operational_step", "Qualifier chaque retour, demande complémentaire, refus ou condition avant de répondre au client"),
    item("recurring_control", "Relancer chaque semaine les éléments sans réponse et escalader les échéances menacées"),
  ],
  tracking: [
    item("implementation_action", "Créer un échéancier des contrats, opérations, commissions, encours, renouvellements et actions"),
    item("operational_step", "Rapprocher les événements et flux des dossiers, contrats et partenaires concernés"),
    item("recurring_control", "Contrôler chaque semaine écarts, rejets, retards, suspens, renouvellements et commissions"),
    item("operating_rule", "Ne clôturer un élément qu’après preuve du traitement et information des personnes utiles"),
  ],
  incident: [
    item("implementation_action", "Créer un registre des incidents avec détection, impact, urgence, mesure, information et correction"),
    item("operational_step", "Sécuriser immédiatement les fonds, données, droits, délais ou garanties concernés"),
    item("operational_step", "Rassembler faits, documents, mouvements, communications et responsabilités sans altérer les traces"),
    item("operational_step", "Informer le client, le partenaire, l’assureur ou l’autorité lorsque le cadre l’exige"),
    item("recurring_control", "Vérifier la résolution puis analyser chaque mois causes, récurrence et corrections"),
  ],
  compliance: [
    item("implementation_action", "Créer un registre des statuts, immatriculations, assurances, capacités, formations et échéances"),
    item("operational_step", "Actualiser connaissance client, vigilances, consentements et preuves de conseil selon le risque"),
    item("operational_step", "Qualifier tout conflit, anomalie, soupçon ou manquement et appliquer l’escalade prévue"),
    item("recurring_control", "Revoir chaque trimestre contrôles, dossiers échantillonnés, réclamations et plans de correction"),
  ],
};

const buildCoreDraft = (): ProcessDraft => ({
  definitionsById: Object.fromEntries(
    Object.entries(processByRole).map(([role, processId]) => [
      processId,
      definitionsByRole[role as FinanceServicesRole],
    ]),
  ),
  contentByProcessId: Object.fromEntries(
    Object.entries(processByRole).map(([role, processId]) => [
      processId,
      contentByRole[role as FinanceServicesRole],
    ]),
  ),
});

const patch = (
  role: FinanceServicesRole,
  contentIndex: number,
  label: string,
): ProcessContentPatch => ({
  processId: processByRole[role],
  contentIndex,
  label,
});

const profilePatches = (
  profile: FinanceServicesProfile,
): readonly ProcessContentPatch[] => [
  patch("strategy", 0, `Choisir les priorités de l’activité : ${profile.priorities}`),
  patch("decisions", 1, `Escalader ou arbitrer sans délai : ${profile.urgentDecision}`),
  patch("access", 0, `Tenir à jour les accès critiques : ${profile.criticalAccess}`),
  patch("portfolio", 0, `Piloter le portefeuille avec l’unité réelle de travail : ${profile.portfolioUnit}`),
  patch("onboarding", 1, `Vérifier avant toute prise de portefeuille : ${profile.onboardingProof}`),
  patch("handoff", 0, `Organiser la passation avec : ${profile.handoffFrame}`),
  patch("qualification", 0, `Qualifier chaque demande avec : ${profile.qualificationFrame}`),
  patch("selling", 0, `Formaliser la proposition avec : ${profile.sellingFrame}`),
  patch("file", 0, `Ouvrir chaque dossier avec : ${profile.fileOpeningFrame}`),
  patch("file", 2, `Réaliser avant toute action : ${profile.dueDiligenceFrame}`),
  patch("coordination", 0, `Coordonner les tiers et opérations suivants : ${profile.coordinationFrame}`),
  patch("tracking", 0, `Construire l’échéancier autour de : ${profile.trackingFrame}`),
  patch("incident", 0, `Tracer les incidents propres au métier : ${profile.incidentFrame}`),
  patch("incident", 3, `Appliquer la réponse métier suivante : ${profile.incidentResponse}`),
  patch("compliance", 0, `Tenir à jour les obligations propres au métier : ${profile.complianceFrame}`),
  patch("retention", 1, `Conserver comme preuve de suivi client : ${profile.clientProof}`),
];

export const generateFinanceServicesCoreDraft = () => buildCoreDraft();

export const generateFinanceServicesDraft = (profile: FinanceServicesProfile) =>
  composeProcessDraft(buildCoreDraft(), [
    {
      id: `metier.${profile.slug}`,
      contentPatches: profilePatches(profile),
    },
  ]);

const commonSources = [
  "https://www.orias.fr/",
  "https://acpr.banque-france.fr/fr/particuliers/vos-moyens-daction/formuler-une-reclamation",
] as const;

export const financeServicesProfiles = {
  "courtier-credit-assurance": {
    slug: "courtier-credit-assurance",
    name: "Courtier crédit / assurance",
    sourceUrl: "https://docs.google.com/spreadsheets/d/104giaxJw1G1XxzzNqV7iMuTRUn6GRmsZmOYfjf5K3DY/edit",
    researchSources: [
      ...commonSources,
      "https://acpr.banque-france.fr/fr/professionnels/lacpr-vous-accompagne/intermediaires/intermediaires-dassurance",
      "https://acpr.banque-france.fr/fr/nos-missions/proteger-la-clientele",
    ],
    priorities: "crédit immobilier ou professionnel, assurance emprunteur, protection, prescripteurs, partenaires bancaires, délais et taux de transformation",
    urgentDecision: "offre de prêt expirante, condition suspensive, refus partenaire, taux ou garantie incohérent, soupçon LCB-FT, mandat absent ou donnée sensible exposée",
    criticalAccess: "CRM, comparateurs, extranets banques et assureurs, ORIAS, signature, collecte sécurisée, messagerie et suivi des commissions",
    portfolioUnit: "prospects, mandats, simulations, dossiers transmis, accords de principe, offres, contrats, refus, échéances et commissions",
    onboardingProof: "catégorie ORIAS IAS ou IOBSP, capacité, honorabilité, formation, RC professionnelle, mandat, partenaires et supervision",
    handoffFrame: "besoin, profil, mandat, pièces, simulations, partenaires saisis, retours, conditions, assurance, échéances et rémunération",
    qualificationFrame: "projet, montant, apport, revenus, charges, situation professionnelle, patrimoine, délai, garanties, besoins d’assurance et consentements",
    sellingFrame: "mandat ou entrée en relation, besoin, partenaires consultés, hypothèses, coût total, garanties, exclusions, rémunération et prochaines étapes",
    fileOpeningFrame: "emprunteur, co-emprunteur, projet, budget, financement, assurance, revenus, charges, patrimoine, mandat et prescripteur",
    dueDiligenceFrame: "identité, capacité, pouvoirs, ORIAS et mandat applicables, LCB-FT, solvabilité, cohérence des pièces et conflit",
    coordinationFrame: "banques, délégataires, assureurs, notaire, agent immobilier, expert-comptable, prescripteur et client",
    trackingFrame: "mandat, pièces, simulation, dépôt, étude, accord, assurance, édition de l’offre, délai de réflexion, signature, déblocage et commission",
    incidentFrame: "refus non expliqué, erreur de données, offre tardive, condition non levée, double assurance, fraude suspectée, commission manquante et fuite de données",
    incidentResponse: "geler la transmission erronée, informer le client, corriger auprès des partenaires et sécuriser les conditions suspensives",
    complianceFrame: "ORIAS IAS/IOBSP selon activités, capacité, honorabilité, RC et garantie financière applicable, mandats, DDA, devoir de conseil, LCB-FT et réclamations",
    clientProof: "situation actualisée, comparaison expliquée, choix du partenaire, coût, garanties, refus éventuels, décision et échéances",
  },
  "cabinet-assurance": {
    slug: "cabinet-assurance",
    name: "Cabinet d’assurance",
    sourceUrl: "https://docs.google.com/spreadsheets/d/1WRnPcNFpHDrTOgDp4ZhUCII5jmf_XarT_vsCC5oSQfY/edit",
    researchSources: [
      ...commonSources,
      "https://acpr.banque-france.fr/fr/actualites/publication-de-la-recommandation-sur-le-devoir-de-conseil-en-assurance",
      "https://acpr.banque-france.fr/fr/professionnels/lacpr-vous-accompagne/intermediaires/intermediaires-dassurance",
    ],
    priorities: "IARD, prévoyance, santé, assurance-vie selon habilitation, professionnels, renouvellements, sinistres, multi-équipement utile et rétention",
    urgentDecision: "sinistre grave, garantie contestée, échéance de résiliation, impayé avec suspension, inadéquation du contrat, conflit d’intérêts ou réclamation sensible",
    criticalAccess: "logiciel assurance, extranets compagnies, GED, signature, ORIAS, encaissements ou délégations, sinistres et bordereaux de commissions",
    portfolioUnit: "clients, risques, contrats, garanties, primes, avenants, échéances, sinistres, résiliations, réclamations et commissions",
    onboardingProof: "ORIAS et capacité IAS, honorabilité, formation DDA, RC, délégations, produits autorisés, sinistres et devoir de conseil",
    handoffFrame: "client, risques, contrats, garanties, primes, avenants, sinistres, réclamations, échéances, délégations et compagnie",
    qualificationFrame: "identité, activité ou biens, risques à couvrir, contrats existants, sinistralité, budget, exigences et besoins, exclusions critiques et consentements",
    sellingFrame: "exigences et besoins, comparaison, garanties, plafonds, franchises, exclusions, prime, durée, document produit, rémunération et conseil",
    fileOpeningFrame: "souscripteur, assuré, bénéficiaire, risque, antécédents, contrats existants, pièces, exigences et besoins, consentements et compagnie",
    dueDiligenceFrame: "identité, capacité, bénéficiaire effectif si applicable, LCB-FT selon produit, risque, déclarations, doublons et adéquation",
    coordinationFrame: "compagnies, délégataires, experts, réparateurs, gestionnaires santé, bénéficiaires, médiateur et client",
    trackingFrame: "devis, souscription, prise d’effet, prime, avenant, renouvellement, résiliation, sinistre, indemnisation et commission",
    incidentFrame: "sinistre, déclaration tardive, impayé, suspension, résiliation, erreur de garantie, doublon, réclamation, fraude suspectée et données exposées",
    incidentResponse: "ouvrir le sinistre ou la réclamation, préserver les délais, transmettre les pièces, informer sur les garanties et tracer la décision de la compagnie",
    complianceFrame: "ORIAS IAS, capacité et formation DDA, honorabilité, RC, garantie financière applicable, devoir de conseil, document produit, LCB-FT et réclamations",
    clientProof: "exigences et besoins actualisés, adéquation des garanties, évolution du risque, sinistres, coûts, alternatives et décision",
  },
  "gestionnaire-de-patrimoine": {
    slug: "gestionnaire-de-patrimoine",
    name: "Gestionnaire de patrimoine dirigeant",
    sourceUrl: "https://docs.google.com/spreadsheets/d/1nbUUk6kadJ_dLZsKtNqzWNdWaE6cbIfZEPQGvPomGnw/edit",
    researchSources: [
      "https://www.orias.fr/",
      "https://www.amf-france.org/fr/quelles-sont-les-obligations-du-cif-envers-son-client",
      "https://www.amf-france.org/fr/quelles-sont-les-verifications-faire-concernant-votre-intermediaire-financier",
      "https://www.amf-france.org/fr/actualites-publications/actualites/conseillers-en-investissements-financiers-mise-a-jour-de-la-doctrine-sur-les-verifications-dadequation",
    ],
    priorities: "bilan patrimonial, placements, assurance-vie, retraite, prévoyance, transmission, immobilier selon statuts, dirigeants et suivi d’adéquation",
    urgentDecision: "recommandation devenue inadéquate, perte importante, besoin de liquidité, changement familial ou fiscal, soupçon LCB-FT, conflit ou produit non autorisé",
    criticalAccess: "CRM patrimonial, agrégateur, extranets assureurs et plateformes, ORIAS, association CIF, signature, collecte sécurisée et suivi des commissions",
    portfolioUnit: "foyers, entités, actifs, passifs, contrats, allocations, objectifs, horizons, risques, opérations, revues et rémunérations",
    onboardingProof: "statuts CIF/IAS/IOBSP ou immobilier applicables, ORIAS, association, capacité, formation, RC, partenaires et procédures d’adéquation",
    handoffFrame: "situation familiale et professionnelle, actifs, passifs, objectifs, horizon, risque, durabilité, lettre de mission, recommandations et opérations",
    qualificationFrame: "identité, famille, revenus, charges, patrimoine, dettes, fiscalité, objectifs, horizon, connaissances, expérience, pertes supportables, risque et durabilité",
    sellingFrame: "document d’entrée en relation, lettre de mission, situation, objectifs, adéquation, risques, coûts, rémunération, conflits et rapport écrit",
    fileOpeningFrame: "client et bénéficiaires, situation familiale, professionnelle et fiscale, actifs, passifs, flux, objectifs, expérience, risque et mandats",
    dueDiligenceFrame: "identité, bénéficiaire effectif, LCB-FT, statuts applicables, connaissance client, conflit, origine des fonds et capacité à supporter les pertes",
    coordinationFrame: "assureurs, sociétés de gestion, plateformes, banques, notaire, expert-comptable, avocat fiscaliste et client",
    trackingFrame: "entrée en relation, lettre de mission, rapport d’adéquation, souscription, versement, arbitrage, échéance, revue, rachat et rémunération",
    incidentFrame: "ordre non exécuté, erreur d’allocation, perte, frais inattendus, inadéquation, liquidité, réclamation, conflit, fraude suspectée et donnée exposée",
    incidentResponse: "geler toute nouvelle recommandation, vérifier le profil et les preuves, informer le client et le partenaire puis corriger selon le mandat",
    complianceFrame: "ORIAS, CIF et association professionnelle, IAS/IOBSP ou immobilier applicables, RC, compétence, DER, lettre de mission, adéquation, LCB-FT et réclamations",
    clientProof: "profil actualisé, objectifs, horizon, risque, pertes supportables, préférences de durabilité, allocation, coûts, rapport d’adéquation et décision",
  },
  "societe-recouvrement": {
    slug: "societe-recouvrement",
    name: "Société de recouvrement",
    sourceUrl: "https://docs.google.com/spreadsheets/d/1slA137dMdGvUnr4y8qhdWjAqXnN7V1Wet9DsiGkahOA/edit",
    researchSources: [
      "https://www.economie.gouv.fr/dgccrf/les-fiches-pratiques/recouvrement-amiable-de-creances-les-regles-connaitre",
      "https://www.economie.gouv.fr/dgccrf/laction-de-la-dgccrf/les-enquetes/recouvrement-amiable-des-creances-0",
      "https://www.economie.gouv.fr/dgccrf/laction-de-la-dgccrf/les-enquetes/controle-du-recouvrement-de-creances-commerciales-pendant",
      "https://www.legifrance.gouv.fr/codes/section_lc/LEGITEXT000025024948/LEGISCTA000025026224/",
    ],
    priorities: "recouvrement amiable B2B ou B2C, typologie de créances, encours confiés, accords, paiements, contestations, délais et reversements",
    urgentDecision: "créance prescrite ou contestée, paiement direct, débiteur vulnérable, usurpation, procédure collective, menace, frais indus ou confusion avec l’exécution forcée",
    criticalAccess: "logiciel recouvrement, téléphonie enregistrée selon cadre, GED, banque ou compte affecté applicable, portail client, paiements et export des campagnes",
    portfolioUnit: "créanciers, débiteurs, créances, principal, intérêts justifiés, échéances, contacts, contestations, accords, paiements et reversements",
    onboardingProof: "contrat, formation juridique et déontologique, confidentialité, scripts autorisés, gestion des contestations, paiements et supervision",
    handoffFrame: "mandat, créancier, débiteur, origine, pièces, montant, exigibilité, prescription, contacts, contestation, accord, paiement et prochaine action",
    qualificationFrame: "créancier, débiteur, contrat ou facture, preuve de prestation, montant détaillé, échéance, prescription, relances, contestation et procédure existante",
    sellingFrame: "mandat de recouvrement, périmètre amiable, créances acceptées, honoraires, reversements, reporting, données, sortie et passage éventuel au judiciaire",
    fileOpeningFrame: "créancier, débiteur, origine de la dette, contrat, facture, livraison ou prestation, principal, intérêts, échéance, relances et mandat",
    dueDiligenceFrame: "mandat, créance certaine liquide et exigible, identité, pièces, prescription, contestation, procédure collective et absence de titre ou procédure incompatible",
    coordinationFrame: "créancier, débiteur, service comptable, médiateur, mandataire judiciaire, commissaire de justice ou avocat lorsque mandaté",
    trackingFrame: "mise en demeure, contacts, proposition, échéancier, paiement, incident, contestation, clôture, reversement et restitution des pièces",
    incidentFrame: "paiement déjà effectué, identité erronée, contestation fondée, prescription, procédure collective, menace, frais interdits, donnée exposée et encaissement non rapproché",
    incidentResponse: "suspendre les relances contestées, vérifier auprès du créancier, corriger le dossier, rembourser tout indu et distinguer clairement amiable et forcé",
    complianceFrame: "déclaration d’activité et assurance applicables, mandat, CPCE, mentions de mise en demeure, pratiques loyales, frais, données, encaissements et réclamations",
    clientProof: "encours confié, actions réalisées, contestations, accords, paiements, honoraires, reversements, clôtures et dossiers à orienter",
  },
} satisfies Record<string, FinanceServicesProfile>;
