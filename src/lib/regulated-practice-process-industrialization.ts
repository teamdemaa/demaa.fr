import {
  composeProcessDraft,
  type IndustrializedContentItem,
  type IndustrializedProcessDefinition,
  type ProcessContentPatch,
  type ProcessDraft,
} from "@/lib/process-industrialization";

type RegulatedPracticeRole =
  | "strategy"
  | "decisions"
  | "access"
  | "workload"
  | "onboarding"
  | "team"
  | "handoff"
  | "payables"
  | "collections"
  | "profitability"
  | "development"
  | "retention"
  | "complaints"
  | "selling"
  | "deadlines"
  | "openFile"
  | "deliverables"
  | "approvals"
  | "compliance";

export type RegulatedPracticeProfile = {
  slug:
    | "cabinet-comptable"
    | "cabinet-davocat"
    | "notaire"
    | "gestionnaire-paie-independant";
  name: string;
  sourceUrl: string;
  researchSources: readonly string[];
  priorities: string;
  urgentDecision: string;
  criticalAccess: string;
  workloadUnit: string;
  onboardingProof: string;
  handoffFrame: string;
  engagementFrame: string;
  deadlineFrame: string;
  deadlineAlerts: string;
  fileOpeningFrame: string;
  fileDueDiligence: string;
  productionFrame: string;
  controlFrame: string;
  deliveryProof: string;
  approvalFrame: string;
  complianceFrame: string;
};

const processByRole: Record<RegulatedPracticeRole, string> = {
  strategy:
    "process.cabinets-reglementes.direction.savoir-ou-va-le-cabinet",
  decisions:
    "process.cabinets-reglementes.direction.decider-sans-bloquer-les-dossiers",
  access:
    "process.cabinets-reglementes.direction.donner-acces-a-lessentiel",
  workload:
    "process.cabinets-reglementes.direction.garder-une-visibilite-sur-la-charge",
  onboarding:
    "process.cabinets-reglementes.equipe.integrer-un-nouvel-employe",
  team:
    "process.cabinets-reglementes.equipe.organiser-les-collaborateurs-et-remplacements",
  handoff:
    "process.cabinets-reglementes.equipe.transmettre-un-dossier-en-cas-dabsence",
  payables: "process.cabinets-reglementes.finance-admin.payer-a-temps",
  collections: "process.cabinets-reglementes.finance-admin.se-faire-payer",
  profitability:
    "process.cabinets-reglementes.finance-admin.suivre-la-rentabilite-des-dossiers",
  development:
    "process.cabinets-reglementes.marketing-vente.developper-les-dossiers-et-recommandations",
  retention:
    "process.cabinets-reglementes.marketing-vente.fideliser-les-clients-du-cabinet",
  complaints:
    "process.cabinets-reglementes.marketing-vente.traiter-une-reclamation-client",
  selling:
    "process.cabinets-reglementes.marketing-vente.vendre-une-mission-ou-un-accompagnement",
  deadlines:
    "process.cabinets-reglementes.operations.gerer-les-echeances-et-relances",
  openFile:
    "process.cabinets-reglementes.operations.ouvrir-et-tenir-un-dossier-client",
  deliverables:
    "process.cabinets-reglementes.operations.produire-et-controler-les-livrables",
  approvals:
    "process.cabinets-reglementes.operations.tracer-les-validations-et-decisions",
  compliance:
    "process.cabinets-reglementes.conformite-metier.securiser-confidentialite-et-obligations-metier",
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
  RegulatedPracticeRole,
  IndustrializedProcessDefinition
> = {
  strategy: def(
    "Choisir les missions et clients compatibles avec les compétences, la capacité et les obligations du cabinet.",
    "Début de trimestre ou écart important de charge, risque ou rentabilité.",
    "Des priorités explicites et une capacité réservée aux dossiers sensibles.",
    "Dirigeant ou associé",
    "Mensuelle",
  ),
  decisions: def(
    "Faire arbitrer chaque dossier au bon niveau sans dépasser le champ de délégation.",
    "Alerte, blocage, conflit, échéance ou décision engageante.",
    "Une décision datée, attribuée et appliquée avant l’échéance.",
    "Responsable de dossier",
    "Hebdomadaire",
  ),
  access: def(
    "Maintenir des accès individuels, récupérables et limités aux missions autorisées.",
    "Arrivée, départ, incident ou changement de portefeuille.",
    "Des droits cohérents avec le rôle et la confidentialité attendue.",
    "Référent numérique",
    "Mensuelle",
  ),
  workload: def(
    "Voir la charge réelle avant d’accepter, promettre ou réaffecter un dossier.",
    "Nouvelle demande, absence ou revue de portefeuille.",
    "Une charge arbitrée par échéance, complexité, risque et capacité.",
    "Manager",
    "Hebdomadaire",
  ),
  onboarding: def(
    "Rendre un nouvel arrivant opérationnel sans lui ouvrir des droits excessifs.",
    "Contrat ou collaboration confirmé.",
    "Une prise de poste vérifiée, accompagnée et traçable.",
    "Manager",
    "À chaque arrivée",
  ),
  team: def(
    "Affecter les dossiers et contrôles selon compétences, habilitations et disponibilité.",
    "Planification, absence ou surcharge.",
    "Un titulaire et un suppléant identifiés pour chaque dossier sensible.",
    "Manager",
    "Hebdomadaire",
  ),
  handoff: def(
    "Transmettre l’état utile d’un dossier sans perte d’échéance ni diffusion excessive.",
    "Absence planifiée ou indisponibilité soudaine.",
    "Une reprise possible à partir des pièces, décisions et prochaines actions.",
    "Responsable de dossier",
    "À chaque absence",
  ),
  payables: def(
    "Régler les dépenses autorisées après contrôle du service reçu.",
    "Facture ou échéance fournisseur.",
    "Un paiement justifié, approuvé et rapproché.",
    "Responsable administratif",
    "Hebdomadaire",
  ),
  collections: def(
    "Facturer et recouvrer sans ambiguïté sur la mission ni les travaux réalisés.",
    "Jalon réalisé, provision, débours ou échéance contractuelle.",
    "Des créances suivies avec motif, preuve et prochaine action.",
    "Responsable administratif",
    "Hebdomadaire",
  ),
  profitability: def(
    "Comparer le temps et les coûts engagés à la valeur et aux honoraires du dossier.",
    "Revue de portefeuille ou dépassement de budget.",
    "Des missions ajustées, revalorisées ou arrêtées sur des faits.",
    "Dirigeant ou associé",
    "Mensuelle",
  ),
  development: def(
    "Développer les missions auprès des clients et prescripteurs compatibles avec les règles professionnelles.",
    "Revue commerciale ou besoin client identifié.",
    "Des opportunités qualifiées et attribuées sans promesse inadaptée.",
    "Dirigeant ou associé",
    "Hebdomadaire",
  ),
  retention: def(
    "Anticiper les irritants et besoins récurrents des clients actifs.",
    "Revue de portefeuille ou jalon important.",
    "Une relation suivie avec décisions et prochaines échéances explicites.",
    "Responsable de dossier",
    "Mensuelle",
  ),
  complaints: def(
    "Traiter une contestation sur les faits, le contrat et les pièces du dossier.",
    "Réclamation, incident ou demande de restitution.",
    "Une réponse documentée et une correction suivie.",
    "Dirigeant ou associé",
    "À chaque réclamation",
  ),
  selling: def(
    "Qualifier puis formaliser une mission avant de commencer les travaux.",
    "Demande entrante, recommandation ou extension de mission.",
    "Un périmètre, des responsabilités, des honoraires et des limites acceptés.",
    "Dirigeant ou associé",
    "À chaque opportunité",
  ),
  deadlines: def(
    "Piloter les échéances externes et internes à partir de prérequis explicites.",
    "Ouverture de dossier ou réception d’une nouvelle échéance.",
    "Une échéance attribuée, relancée et sécurisée avant son terme.",
    "Responsable de dossier",
    "Quotidienne",
  ),
  openFile: def(
    "Ouvrir un dossier seulement après vérification du client, du mandat et des risques.",
    "Accord de principe du client.",
    "Un dossier unique, complet et autorisé à démarrer.",
    "Responsable de dossier",
    "À chaque dossier",
  ),
  deliverables: def(
    "Produire chaque livrable à partir des pièces validées et d’un contrôle proportionné.",
    "Dossier complet ou jalon de production.",
    "Un livrable exact, relu, versionné et remis au bon destinataire.",
    "Responsable de dossier",
    "À chaque livrable",
  ),
  approvals: def(
    "Conserver qui a validé quoi, sur quelle version et avec quelles réserves.",
    "Décision client, arbitrage interne ou envoi engageant.",
    "Une piste de décision exploitable en cas de reprise ou de contestation.",
    "Responsable de dossier",
    "À chaque validation",
  ),
  compliance: def(
    "Maintenir les obligations professionnelles, de vigilance, de secret et de sécurité.",
    "Entrée en relation, échéance, contrôle ou incident.",
    "Des preuves à jour, attribuées et retrouvables.",
    "Référent conformité",
    "Mensuelle",
  ),
};

const contentByRole: Record<
  RegulatedPracticeRole,
  IndustrializedContentItem[]
> = {
  strategy: [
    item("implementation_action", "Choisir les missions, clients, secteurs et niveaux de complexité prioritaires"),
    item("implementation_action", "Fixer les objectifs de chiffre d’affaires, marge, récurrence, délai et qualité"),
    item("recurring_control", "Comparer chaque mois demandes, missions ouvertes, charge, risques, encaissements et rentabilité"),
    item("operating_rule", "Refuser une mission sans compétence, capacité, indépendance ou organisation de contrôle suffisante"),
  ],
  decisions: [
    item("implementation_action", "Écrire les décisions délégables avec seuil, délai, preuve attendue et personne à informer"),
    item("operational_step", "Qualifier le blocage selon échéance, risque, conflit, engagement financier et conséquence client"),
    item("operational_step", "Appliquer la mesure conservatoire autorisée puis faire valider la décision engageante"),
    item("recurring_control", "Revoir chaque mois les décisions tardives, non tracées ou remontées au mauvais niveau"),
  ],
  access: [
    item("implementation_action", "Créer un registre des logiciels, portails, comptes, propriétaires, droits et procédures de récupération"),
    item("operational_step", "Attribuer un compte individuel limité aux dossiers et fonctions réellement nécessaires"),
    item("operational_step", "Retirer les accès le jour d’un départ ou d’un changement de portefeuille"),
    item("recurring_control", "Tester chaque mois doubles authentifications, sauvegardes, comptes inactifs et accès anormaux"),
  ],
  workload: [
    item("implementation_action", "Créer une vue de charge par responsable, dossier, échéance, complexité et temps restant"),
    item("operational_step", "Affecter chaque nouveau dossier après vérification de la capacité et des compétences disponibles"),
    item("recurring_control", "Arbitrer chaque semaine retards, dossiers bloqués, surcharge et tâches sans propriétaire"),
    item("operating_rule", "Ne pas promettre une date avant d’avoir vérifié pièces attendues, contrôles et capacité"),
  ],
  onboarding: [
    item("implementation_action", "Préparer une checklist d’arrivée avec rôle, portefeuille, outils, règles et parcours de contrôle"),
    item("operational_step", "Vérifier contrat, identité, qualification, assurance ou habilitation utile avant la prise de poste"),
    item("operational_step", "Faire signer les engagements de confidentialité et expliquer les canaux autorisés"),
    item("recurring_control", "Valider après la période d’accompagnement les droits, contrôles et dossiers réellement maîtrisés"),
  ],
  team: [
    item("implementation_action", "Tenir une matrice compétences, habilitations, portefeuilles, titulaires et suppléants"),
    item("operational_step", "Affecter production, revue et validation à des personnes distinctes lorsque le risque le justifie"),
    item("recurring_control", "Revoir chaque semaine absences, remplacements, échéances sensibles et capacité de supervision"),
  ],
  handoff: [
    item("implementation_action", "Créer une fiche de passation avec état, échéances, pièces manquantes, décisions et interlocuteurs"),
    item("operational_step", "Transmettre uniquement les informations nécessaires par les canaux autorisés"),
    item("recurring_control", "Faire confirmer par le suppléant la reprise des actions urgentes et des accès utiles"),
  ],
  payables: [
    item("implementation_action", "Créer un échéancier des fournisseurs, abonnements, débours, commandes et validations"),
    item("operational_step", "Comparer facture, contrat ou commande, service reçu, centre de coût et autorisation"),
    item("recurring_control", "Rapprocher chaque semaine échéances, doublons, avoirs, paiements et banque"),
  ],
  collections: [
    item("implementation_action", "Créer un suivi reliant mission, jalon, honoraires, provisions, débours, facture et règlement"),
    item("operational_step", "Émettre la facture à partir du contrat et des travaux réellement réalisés"),
    item("operational_step", "Qualifier chaque retard avec interlocuteur, motif, preuve et prochaine relance"),
    item("recurring_control", "Revoir chaque semaine créances par âge, dossier, montant, litige et action prévue"),
  ],
  profitability: [
    item("implementation_action", "Définir un budget de temps, coûts externes et marge attendue par type de mission"),
    item("operational_step", "Imputer temps, débours, sous-traitance et reprises au bon dossier"),
    item("recurring_control", "Comparer chaque mois budget, réalisé, facturé, encaissé et reste à produire"),
    item("operating_rule", "Revoir le périmètre ou les honoraires avant de poursuivre un dépassement non prévu"),
  ],
  development: [
    item("implementation_action", "Lister les besoins complémentaires détectables sans nuire au devoir de conseil ni aux règles professionnelles"),
    item("operational_step", "Qualifier besoin, urgence, décideur, périmètre, risque, budget et calendrier"),
    item("operational_step", "Attribuer l’opportunité à une personne compétente et tracer la prochaine action"),
    item("recurring_control", "Revoir chaque semaine recommandations reçues, opportunités sans suite et taux de transformation"),
  ],
  retention: [
    item("implementation_action", "Planifier les revues clients selon les jalons, risques et besoins récurrents"),
    item("operational_step", "Présenter travaux réalisés, points ouverts, prochaines échéances et décisions attendues"),
    item("recurring_control", "Suivre chaque mois retards de réponse, irritants, missions à renouveler et clients à risque"),
  ],
  complaints: [
    item("implementation_action", "Créer un registre avec faits, contrat, pièces, impact, responsable, réponse et correction"),
    item("operational_step", "Accuser réception puis sécuriser l’échéance, les fonds, les droits ou la confidentialité concernés"),
    item("operational_step", "Comparer chronologie, périmètre accepté, versions, validations et échanges avant de répondre"),
    item("recurring_control", "Vérifier la correction puis analyser chaque mois causes, délais et réclamations réouvertes"),
  ],
  selling: [
    item("implementation_action", "Créer une trame d’offre avec contexte, périmètre, exclusions, responsabilités, honoraires et fin de mission"),
    item("operational_step", "Vérifier compétence, indépendance, conflit potentiel, capacité, vigilance et risque d’acceptation"),
    item("operational_step", "Présenter les livrables, prérequis client, délais, honoraires, débours et conditions de révision"),
    item("operating_rule", "Ne commencer aucun travail engageant avant acceptation traçable du cadre applicable"),
  ],
  deadlines: [
    item("implementation_action", "Créer un calendrier par dossier avec échéance, prérequis, responsable, contrôle et preuve d’envoi"),
    item("operational_step", "Calculer la date interne de production et de revue avant la date externe"),
    item("operational_step", "Relancer les pièces manquantes avec conséquence et nouvelle date de décision explicites"),
    item("recurring_control", "Contrôler chaque jour échéances proches, accusés, rejets, retours et actions de sécurisation"),
  ],
  openFile: [
    item("implementation_action", "Créer une checklist d’ouverture avec client, bénéficiaire, mandat, mission, risque et interlocuteurs"),
    item("operational_step", "Vérifier identité, capacité, pouvoirs, coordonnées et cohérence des informations fournies"),
    item("operational_step", "Réaliser les contrôles d’acceptation, de vigilance, d’indépendance et de conflit applicables"),
    item("operational_step", "Créer un dossier unique avec arborescence, droits, responsables, échéances et pièces attendues"),
    item("recurring_control", "Bloquer le démarrage tant que les pièces ou validations critiques restent absentes"),
  ],
  deliverables: [
    item("implementation_action", "Créer une checklist par livrable avec sources, version, contrôles, signataire et destinataire"),
    item("operational_step", "Produire uniquement à partir des pièces validées et signaler toute hypothèse ou information manquante"),
    item("operational_step", "Faire une revue de cohérence, conformité, calcul, forme, délai et confidentialité"),
    item("operational_step", "Envoyer la version approuvée par le canal prévu et conserver la preuve de remise"),
    item("recurring_control", "Rapprocher chaque semaine livrables attendus, produits, rejetés, corrigés et remis"),
  ],
  approvals: [
    item("implementation_action", "Créer une trace de validation avec objet, version, auteur, date, réserves et décision"),
    item("operational_step", "Demander une validation explicite lorsque le choix engage le client ou le professionnel"),
    item("operational_step", "Conserver la version validée et distinguer toute modification ultérieure"),
    item("operating_rule", "Ne jamais reconstituer a posteriori une validation absente ; documenter le constat et la correction"),
  ],
  compliance: [
    item("implementation_action", "Créer un registre des obligations professionnelles, inscriptions, assurances, vigilances et échéances"),
    item("operational_step", "Limiter la collecte, l’accès et la transmission aux informations nécessaires et autorisées"),
    item("operational_step", "Qualifier tout incident de secret, sécurité, fonds ou conflit et appliquer l’escalade prévue"),
    item("recurring_control", "Revoir chaque trimestre preuves, formations, contrôles qualité, procédures et plans de correction"),
  ],
};

const buildCoreDraft = (): ProcessDraft => ({
  definitionsById: Object.fromEntries(
    Object.entries(processByRole).map(([role, processId]) => [
      processId,
      definitionsByRole[role as RegulatedPracticeRole],
    ]),
  ),
  contentByProcessId: Object.fromEntries(
    Object.entries(processByRole).map(([role, processId]) => [
      processId,
      contentByRole[role as RegulatedPracticeRole],
    ]),
  ),
});

const patch = (
  role: RegulatedPracticeRole,
  contentIndex: number,
  label: string,
): ProcessContentPatch => ({
  processId: processByRole[role],
  contentIndex,
  label,
});

const profilePatches = (
  profile: RegulatedPracticeProfile,
): readonly ProcessContentPatch[] => [
  patch("strategy", 0, `Choisir les priorités du cabinet : ${profile.priorities}`),
  patch("decisions", 1, `Escalader ou arbitrer sans délai : ${profile.urgentDecision}`),
  patch("access", 0, `Tenir à jour les accès critiques : ${profile.criticalAccess}`),
  patch("workload", 1, `Affecter la charge à partir de l’unité réelle de production : ${profile.workloadUnit}`),
  patch("onboarding", 1, `Vérifier avant la prise de poste : ${profile.onboardingProof}`),
  patch("handoff", 0, `Organiser la passation avec : ${profile.handoffFrame}`),
  patch("selling", 0, `Formaliser l’entrée en mission avec : ${profile.engagementFrame}`),
  patch("deadlines", 0, `Construire le calendrier métier autour de : ${profile.deadlineFrame}`),
  patch("deadlines", 3, `Contrôler chaque jour les alertes suivantes : ${profile.deadlineAlerts}`),
  patch("openFile", 0, `Ouvrir chaque dossier avec : ${profile.fileOpeningFrame}`),
  patch("openFile", 2, `Réaliser avant acceptation : ${profile.fileDueDiligence}`),
  patch("deliverables", 0, `Préparer la production de : ${profile.productionFrame}`),
  patch("deliverables", 2, `Effectuer avant remise les contrôles suivants : ${profile.controlFrame}`),
  patch("deliverables", 3, `Conserver comme preuve de remise : ${profile.deliveryProof}`),
  patch("approvals", 0, `Tracer chaque validation métier avec : ${profile.approvalFrame}`),
  patch("compliance", 0, `Tenir à jour les obligations propres au métier : ${profile.complianceFrame}`),
];

export const generateRegulatedPracticeCoreDraft = () => buildCoreDraft();

export const generateRegulatedPracticeDraft = (
  profile: RegulatedPracticeProfile,
) =>
  composeProcessDraft(buildCoreDraft(), [
    {
      id: `metier.${profile.slug}`,
      contentPatches: profilePatches(profile),
    },
  ]);

const commonSources = [
  "https://www.cnil.fr/fr/rgpd-par-ou-commencer",
  "https://www.economie.gouv.fr/tracfin",
] as const;

export const regulatedPracticeProfiles = {
  "cabinet-comptable": {
    slug: "cabinet-comptable",
    name: "Cabinet comptable",
    sourceUrl:
      "https://docs.google.com/spreadsheets/d/1Isk2iBJD8xEZPea8i6mVfMGwIBAGvX1vLrfOXeMLzRI/edit",
    researchSources: [
      ...commonSources,
      "https://www.paysdelaloire.experts-comptables.fr/entreprises-et-associations/les-relations-avec-votre-expert-comptable-2/exigez-une-lettre-de-mission/",
      "https://www.experts-comptables.fr/",
    ],
    priorities: "tenue, révision, clôtures, déclarations fiscales, conseil, paie éventuelle, délais et rentabilité par portefeuille",
    urgentDecision: "anomalie comptable significative, échéance fiscale menacée, soupçon LCB-FT, rupture d’indépendance, fraude ou désaccord sur les comptes",
    criticalAccess: "logiciel comptable, collecte, banque, impôts professionnels, téléprocédures, GED, signature et coffre de sauvegarde",
    workloadUnit: "dossiers, volumes d’écritures, déclarations, clôtures, rendez-vous bilan, paies éventuelles et niveau de revue",
    onboardingProof: "diplôme ou parcours, contrat, confidentialité, indépendance, portefeuille test, droits logiciels et seuils de revue",
    handoffFrame: "balance, grand-livre, rapprochements, déclarations, pièces manquantes, points de révision, échéances et questions client",
    engagementFrame: "lettre de mission, répartition des travaux, obligations réciproques, calendrier, honoraires, révision et résiliation",
    deadlineFrame: "TVA, déclarations fiscales, clôture, liasse, comptes annuels, échéances sociales éventuelles et rendez-vous bilan",
    deadlineAlerts: "pièces manquantes, comptes d’attente, rapprochements non soldés, déclaration rejetée, option fiscale à décider et validation client absente",
    fileOpeningFrame: "entité, bénéficiaires effectifs, activité, régime fiscal, exercice, banques, historique, lettre de mission et interlocuteurs",
    fileDueDiligence: "identité, bénéficiaire effectif, LCB-FT, indépendance, reprise des travaux du prédécesseur et acceptation de mission",
    productionFrame: "tenue ou révision, rapprochements, déclarations, dossier de travail, comptes annuels, liasse et restitution",
    controlFrame: "exhaustivité, cut-off, justification des comptes, cohérence TVA-fiscalité-comptes, pièces, supervision et anomalies significatives",
    deliveryProof: "déclaration acceptée, accusé EDI, comptes validés, lettre de présentation ou livrable, échanges et points à suivre",
    approvalFrame: "compte concerné, ajustement proposé, incidence fiscale, version des comptes, validation client et supervision du signataire",
    complianceFrame: "Ordre, assurance, lettre de mission, normes professionnelles, indépendance, secret, LCB-FT, contrôle qualité et formation",
  },
  "cabinet-davocat": {
    slug: "cabinet-davocat",
    name: "Cabinet d’avocat",
    sourceUrl:
      "https://docs.google.com/spreadsheets/d/1suIVepYkVf_fXbusf5_m1Rh1aD7uPGmHkVOqruM7rp8/edit",
    researchSources: [
      ...commonSources,
      "https://cnb.avocat.fr/reglement-interieur-nationalde-la-profession-d-avocat-rin",
      "https://cnb.avocat.fr/rin/titre-premier-des-principes",
    ],
    priorities: "conseil, contentieux, audiences, contrats, consultations, clientèle cible, délais de procédure et rentabilité des dossiers",
    urgentDecision: "délai de recours ou de procédure, conflit d’intérêts, saisie ou mesure urgente, rupture de confidentialité, maniement de fonds ou instruction client risquée",
    criticalAccess: "logiciel cabinet, RPVA ou e-Barreau, Télérecours selon activité, CARPA, messagerie sécurisée, GED, signature et agenda audiences",
    workloadUnit: "dossiers, actes à produire, audiences, délais francs ou calendaires, rendez-vous, diligences et niveau de supervision",
    onboardingProof: "statut, inscription ou contrat, secret professionnel, conflits, règles de correspondance, accès RPVA et supervision",
    handoffFrame: "juridiction, numéro de rôle, parties, stratégie validée, actes et pièces, délais, audience, provisions, CARPA et contacts",
    engagementFrame: "convention d’honoraires, objet, diligences, exclusions, frais et débours, provision, honoraire de résultat éventuel et fin de mission",
    deadlineFrame: "prescription, recours, mise en état, conclusions, communication de pièces, audience, formalités et délais contractuels",
    deadlineAlerts: "acte non signifié, accusé RPVA absent, pièce adverse, conflit nouveau, provision non réglée, instruction client manquante et délai imminent",
    fileOpeningFrame: "client, parties, bénéficiaire, adversaires, juridiction, objet, urgence, documents, convention et avocat responsable",
    fileDueDiligence: "identité, capacité, pouvoirs, conflit d’intérêts, secret, LCB-FT lorsque applicable, compétence et disponibilité",
    productionFrame: "consultation, contrat, mise en demeure, requête, assignation, conclusions, bordereau de pièces et compte rendu",
    controlFrame: "délai, juridiction, parties, demandes, moyens, jurisprudence vérifiée, pièces citées, confidentialité et validation de l’avocat",
    deliveryProof: "dépôt ou envoi RPVA, signification, accusé, bordereau, version adressée au client, compte rendu d’audience et prochaine échéance",
    approvalFrame: "stratégie, offre ou demande, acte et version, pièces communiquées, risque expliqué, instruction client et avocat validateur",
    complianceFrame: "inscription au barreau, assurance, RIN, secret professionnel, conflits d’intérêts, convention d’honoraires, CARPA, LCB-FT applicable et formation",
  },
  notaire: {
    slug: "notaire",
    name: "Notaire",
    sourceUrl:
      "https://docs.google.com/spreadsheets/d/1TgpvP7YteAmHuzKQ7JgPZvQmwuHrg3o72IZ3RJEiEQQ/edit",
    researchSources: [
      ...commonSources,
      "https://www.notaires.fr/fr/profession-notaire/role-du-notaire-et-ses-principaux-domaines-dintervention/lacte-authentique-du-notaire",
      "https://paris.notaires.fr/fr/actualites/les-obligations-du-notaire-dans-la-lutte-contre-le-blanchiment-de-capitaux-et-le-financement-du",
    ],
    priorities: "ventes, successions, famille, actes de société, formalités, signatures, flux de fonds, délais et capacité des pôles",
    urgentDecision: "identité ou capacité douteuse, origine des fonds non justifiée, opposition ou inscription, délai de publicité, consentement incertain ou anomalie comptable client",
    criticalAccess: "logiciel notarial, clé Real, MICEN, Télé@ctes, bases immobilières, comptabilité clients, visioconférence agréée, GED et signature",
    workloadUnit: "dossiers, actes, formalités préalables, pièces d’état civil, signatures, mouvements de fonds, publications et retours du service de publicité foncière",
    onboardingProof: "statut, diplôme ou contrat, secret, délégations, clé ou accès nominatif, comptabilité clients et contrôles de signature",
    handoffFrame: "parties, capacité, pouvoirs, avant-contrat, pièces, formalités, projet d’acte, fonds, date de signature et formalités postérieures",
    engagementFrame: "nature de l’acte, parties, devoir de conseil, pièces, provisions, émoluments ou honoraires, débours, délais et conditions de signature",
    deadlineFrame: "conditions suspensives, purge, état civil, urbanisme, hypothèques, financement, signature, enregistrement et publicité foncière",
    deadlineAlerts: "pièce d’identité expirée, pouvoir absent, origine des fonds non justifiée, état hypothécaire, condition non levée, fonds non reçus ou rejet de publicité",
    fileOpeningFrame: "parties, identité, capacité, situation familiale, pouvoirs, bien ou opération, bénéficiaires, financement, origine des fonds et correspondants",
    fileDueDiligence: "identité, capacité, pouvoirs, bénéficiaire effectif, LCB-FT, origine et destination des fonds, conflit et compétence territoriale ou matérielle",
    productionFrame: "avant-contrat, projet d’acte, annexes, décompte, réquisition, acte authentique électronique, copies et formalités",
    controlFrame: "identité, capacité, consentement, chaîne de propriété, désignation, charges, fiscalité, fonds, annexes, lecture et signature",
    deliveryProof: "acte signé avec clé Real, dépôt MICEN, copie authentique ou attestation, enregistrement, publication, retour et clôture comptable",
    approvalFrame: "projet d’acte, modifications, annexes, décompte, provenance des fonds, accord des parties et notaire instrumentaire",
    complianceFrame: "nomination et assurance, secret, devoir de conseil, LCB-FT, comptabilité clients, clé Real, MICEN, conservation des minutes et inspections",
  },
  "gestionnaire-paie-independant": {
    slug: "gestionnaire-paie-independant",
    name: "Gestionnaire de paie indépendant",
    sourceUrl:
      "https://docs.google.com/spreadsheets/d/1r3kdgK3uxR1bVVw0x9KsXenTxKjDaVZjkWd7d7nHLhk/edit",
    researchSources: [
      "https://www.urssaf.fr/accueil/employeur/gerer-entreprise/declaration-sociale-nominative.html",
      "https://www.urssaf.fr/accueil/employeur/embaucher-gerer-salaries/embaucher/declaration-prealable-embauche.html",
      "https://www.net-entreprises.fr/",
      "https://www.service-public.fr/particuliers/vosdroits/F559",
    ],
    priorities: "portefeuilles de paie, conventions collectives, volumes de bulletins, DSN, entrées-sorties, conseil courant, échéances et rentabilité",
    urgentDecision: "paie bloquée, DSN rejetée, entrée non déclarée, fin de contrat imminente, arrêt ou reprise non signalé, saisie, écart de cotisation ou donnée sensible exposée",
    criticalAccess: "logiciel de paie, DSN net-entreprises, Urssaf, caisses, PASRAU si applicable, coffre bulletins, Silae ou équivalent, GED et banque de conventions",
    workloadUnit: "dossiers, établissements, salariés, bulletins, conventions collectives, événements, entrées-sorties, DSN et corrections",
    onboardingProof: "compétences paie, conventions du portefeuille, confidentialité, calendrier, dossier test, droits logiciels et niveau de contrôle",
    handoffFrame: "calendrier, variables reçues, embauches, absences, arrêts, sorties, contrôles, bulletins, DSN, rejets et questions employeur",
    engagementFrame: "contrat de prestation, responsabilités employeur-prestataire, collecte des variables, calendrier, bulletins, DSN, assistance et exclusions juridiques",
    deadlineFrame: "DPAE, clôture des variables, paie, virements, DSN mensuelle, signalements d’événements, fins de contrat, taxes et régularisations",
    deadlineAlerts: "variable tardive, contrat absent, incohérence salarié, taux non mis à jour, bulletin négatif, DSN ou CRM rejeté, solde de tout compte et délai DPAE",
    fileOpeningFrame: "employeur, établissements, convention collective, organismes, contrats, salariés, calendrier, historique DSN, mandats et contacts",
    fileDueDiligence: "SIRET, convention et accords, contrats, paramètres organismes, reprise DSN, mandats, responsabilités et sécurité des données sociales",
    productionFrame: "DPAE, import des variables, bulletins, états de virement, DSN mensuelle, signalements, documents de sortie et écritures de paie",
    controlFrame: "contrat et convention, temps, absence, brut, assiettes, cotisations, net social, PAS, cumuls, plafonds, DSN et variation inhabituelle",
    deliveryProof: "bulletins déposés dans le coffre, état de contrôle, ordre de virement, certificat DPAE, accusé DSN, CRM, documents de sortie et corrections",
    approvalFrame: "variables reçues, anomalies arbitrées, masse salariale, état de virement, bulletins, DSN, corrections et validation employeur",
    complianceFrame: "contrat de prestation, confidentialité, RGPD, veille sociale, DPAE, bulletin, DSN, conservation, mandat déclaratif et limites du conseil juridique",
  },
} satisfies Record<string, RegulatedPracticeProfile>;
