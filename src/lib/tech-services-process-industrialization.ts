import {
  composeProcessDraft,
  type IndustrializedContentItem,
  type IndustrializedProcessDefinition,
  type ProcessContentPatch,
  type ProcessDraft,
} from "@/lib/process-industrialization";

const P = {
  cap: "process.services-tech-b2b.direction.savoir-ou-va-lactivite",
  decisions: "process.services-tech-b2b.direction.decider-sans-bloquer-la-production",
  access: "process.services-tech-b2b.direction.donner-acces-a-lessentiel",
  review: "process.services-tech-b2b.direction.garder-une-visibilite-sur-le-parc-ou-les-projets",
  qualification: "process.services-tech-b2b.marketing-vente.qualifier-le-besoin-technique",
  sales: "process.services-tech-b2b.marketing-vente.vendre-une-prestation-ou-un-abonnement",
  loyalty: "process.services-tech-b2b.marketing-vente.fideliser-les-comptes-clients",
  complaint: "process.services-tech-b2b.marketing-vente.traiter-une-reclamation-client",
  scope: "process.services-tech-b2b.operations.cadrer-un-parc-un-projet-ou-une-intervention",
  deploy: "process.services-tech-b2b.operations.deployer-parametrer-ou-intervenir",
  support: "process.services-tech-b2b.operations.suivre-incidents-maintenance-et-support",
  documentation: "process.services-tech-b2b.operations.documenter-et-securiser-les-acces",
  planning: "process.services-tech-b2b.equipe.organiser-lequipe-et-les-astreintes",
  handover: "process.services-tech-b2b.equipe.transmettre-un-dossier-en-cas-dabsence",
  onboarding: "process.services-tech-b2b.equipe.integrer-un-nouveau-collaborateur",
  margin: "process.services-tech-b2b.finance-admin.suivre-la-marge-projet-ou-recurrente",
  expenses: "process.services-tech-b2b.finance-admin.payer-a-temps",
  collections: "process.services-tech-b2b.finance-admin.se-faire-payer",
  compliance: "process.services-tech-b2b.conformite-metier.securiser-contrats-donnees-et-continuite",
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

export const techServicesFamilyCoreDraft: ProcessDraft = {
  definitionsById: {
    [P.cap]: def("Choisir les offres, clients et capacités qui doivent porter l’activité.", "Début de trimestre ou écart important.", "Des priorités chiffrées compatibles avec la capacité technique.", "Dirigeant", "Trimestrielle"),
    [P.decisions]: def("Déléguer les arbitrages courants sans bloquer la production.", "Incident, changement, dérive ou absence.", "Des décisions rapides prises dans des limites écrites.", "Dirigeant ou responsable technique", "Mensuelle"),
    [P.access]: def("Donner les bons accès sans exposer les systèmes ni les données.", "Arrivée, mission, changement de rôle ou départ.", "Des accès nominatifs, limités et révocables.", "Responsable technique", "Mensuelle"),
    [P.review]: def("Voir l’état des parcs, projets, incidents, engagements et risques.", "Revue opérationnelle.", "Des écarts expliqués et des décisions datées.", "Dirigeant", "Hebdomadaire"),
    [P.qualification]: def("Confirmer le besoin, l’environnement et les contraintes avant de proposer.", "Nouvelle demande commerciale.", "Un besoin technique qualifié avec ses risques.", "Avant-vente technique", "À chaque opportunité"),
    [P.sales]: def("Vendre un périmètre exécutable, rentable et compris.", "Besoin qualifié.", "Une offre sans ambiguïté sur résultat, limites et responsabilités.", "Responsable commercial", "À chaque opportunité"),
    [P.loyalty]: def("Conserver les comptes utiles et détecter les besoins réels.", "Revue de service, échéance ou évolution client.", "Des renouvellements justifiés et anticipés.", "Responsable de compte", "Mensuelle"),
    [P.complaint]: def("Résoudre l’insatisfaction et corriger sa cause.", "Réclamation, indisponibilité ou contestation.", "Une réponse tracée et une correction vérifiée.", "Responsable de service", "À chaque réclamation"),
    [P.scope]: def("Transformer la vente en parc, projet ou intervention exécutable.", "Signature ou autorisation de démarrage.", "Un cadrage validé avec prérequis et responsabilités.", "Chef de projet ou responsable technique", "À chaque dossier"),
    [P.deploy]: def("Exécuter un changement technique de manière contrôlée.", "Dossier cadré et prérequis disponibles.", "Un résultat testé, documenté et réversible.", "Technicien ou ingénieur", "À chaque intervention"),
    [P.support]: def("Qualifier, traiter et suivre incidents, demandes et maintenance.", "Ticket, alerte ou échéance de maintenance.", "Un service rétabli ou une demande clôturée avec preuve.", "Support technique", "Quotidienne"),
    [P.documentation]: def("Conserver une documentation exploitable et des accès sécurisés.", "Mise en service, modification ou clôture.", "Un dossier à jour qu’un tiers autorisé peut reprendre.", "Responsable technique", "À chaque changement"),
    [P.planning]: def("Affecter les compétences et assurer la couverture utile.", "Nouvelle charge, incident ou absence.", "Un planning réaliste avec escalade et remplacement.", "Responsable des opérations", "Hebdomadaire"),
    [P.handover]: def("Permettre la reprise d’un dossier sans dépendre de son titulaire.", "Absence, astreinte ou réaffectation.", "Un remplaçant connaît l’état, les risques et la prochaine action.", "Responsable technique", "À chaque transmission"),
    [P.onboarding]: def("Rendre une recrue autonome uniquement sur un périmètre validé.", "Arrivée d’un collaborateur.", "Des compétences observées et des droits adaptés.", "Manager technique", "À chaque arrivée"),
    [P.margin]: def("Connaître la marge réelle par projet, intervention ou abonnement.", "Temps, achat, consommation ou revue mensuelle.", "Des dérives détectées avant de devenir irréversibles.", "Dirigeant ou responsable financier", "Mensuelle"),
    [P.expenses]: def("Payer fournisseurs, licences et sous-traitants à temps avec preuve.", "Réception d’une facture.", "Une dépense validée, imputée et planifiée.", "Responsable administratif", "Hebdomadaire"),
    [P.collections]: def("Facturer selon le contrat et traiter les retards.", "Jalon, période d’abonnement ou échéance dépassée.", "Des créances suivies jusqu’au règlement.", "Responsable administratif", "Hebdomadaire"),
    [P.compliance]: def("Sécuriser contrats, données, continuité et responsabilités.", "Avant démarrage ou changement sensible.", "Des obligations identifiées avec leurs preuves.", "Référent conformité ou sécurité", "À chaque dossier"),
  },
  contentByProcessId: {
    [P.cap]: [
      item("implementation_action", "Choisir les offres, segments clients et modes de facturation qui doivent porter la croissance"),
      item("implementation_action", "Fixer des objectifs de chiffre d’affaires, marge, récurrence, capacité et qualité de service"),
      item("recurring_control", "Comparer chaque mois objectifs, signé, livré, facturé, charge et capacité disponible"),
      item("operating_rule", "Ne pas lancer une offre sans cible, résultat, prérequis, coût de support et preuve de demande"),
    ],
    [P.decisions]: [
      item("implementation_action", "Écrire les décisions déléguées sur priorité, dépense, remise, changement, accès et escalade"),
      item("operational_step", "Classer chaque arbitrage selon impact client, sécurité, disponibilité, délai et marge"),
      item("operating_rule", "Escalader immédiatement tout risque majeur de sécurité, données, continuité ou engagement contractuel"),
      item("recurring_control", "Revoir chaque mois les décisions inutilement remontées et les limites devenues inadaptées"),
    ],
    [P.access]: [
      item("implementation_action", "Tenir un registre des comptes, rôles, secrets, équipements et propriétaires"),
      item("operational_step", "Attribuer des accès nominatifs et minimaux puis les retirer dès la fin du besoin"),
      item("recurring_control", "Contrôler chaque mois comptes partagés, droits privilégiés, comptes dormants et secrets anciens"),
    ],
    [P.review]: [
      item("implementation_action", "Créer une revue avec statut, prochain jalon, incident, risque, charge, engagement et marge"),
      item("operational_step", "Identifier pour chaque parc ou projet le prochain résultat observable attendu"),
      item("recurring_control", "Revoir chaque semaine retards, incidents ouverts, changements, dépendances et surcharge"),
      item("recurring_control", "Attribuer à chaque écart une action, un responsable, une échéance et une preuve de clôture"),
    ],
    [P.qualification]: [
      item("implementation_action", "Créer une trame de découverte technique reliée au problème métier"),
      item("operational_step", "Qualifier utilisateurs, environnement, dépendances, volumes, contraintes, délai et décideurs"),
      item("operational_step", "Recueillir les preuves disponibles sans demander d’accès inutile ou non autorisé"),
      item("operating_rule", "Ne pas chiffrer définitivement tant que les inconnues critiques et leurs hypothèses ne sont pas écrites"),
    ],
    [P.sales]: [
      item("implementation_action", "Créer une proposition avec résultat, périmètre, exclusions, prérequis, service et prix"),
      item("operational_step", "Décrire responsabilités client-prestataire, critères d’acceptation et procédure de changement"),
      item("operational_step", "Relier chaque prix aux volumes, licences, charge, astreinte, risque et niveau de service"),
      item("operating_rule", "Ne jamais promettre délai ou disponibilité dépendant d’un prérequis client non sécurisé"),
    ],
    [P.loyalty]: [
      item("implementation_action", "Définir les revues, alertes et échéances qui justifient un point de service"),
      item("operational_step", "Présenter usage, incidents, résultats, risques, capacité et actions restant ouvertes"),
      item("operational_step", "Proposer uniquement une évolution reliée à un besoin observé et chiffré"),
      item("recurring_control", "Suivre renouvellement, extension, réduction, churn, recommandation et cause de départ"),
    ],
    [P.complaint]: [
      item("implementation_action", "Créer un registre avec faits, horodatage, contrat, preuve, impact, réponse et correction"),
      item("operational_step", "Accuser réception, reformuler l’impact et sécuriser les mesures urgentes"),
      item("operational_step", "Comparer journaux, changements, engagements, validations et responsabilités avant de conclure"),
      item("recurring_control", "Vérifier après clôture que la cause a été corrigée dans le processus ou le produit"),
    ],
    [P.scope]: [
      item("implementation_action", "Créer un dossier avec environnement, périmètre, prérequis, dépendances, risques et acceptation"),
      item("operational_step", "Nommer décideur, référent technique, utilisateurs concernés, valideur et contact d’urgence"),
      item("operational_step", "Confirmer accès, données, sauvegardes, fenêtre, test, retour arrière et communication"),
      item("operating_rule", "Aucun changement hors périmètre sans impact délai, coût, sécurité et responsabilité accepté"),
    ],
    [P.deploy]: [
      item("implementation_action", "Créer une procédure d’exécution avec précontrôles, étapes, tests et retour arrière"),
      item("operational_step", "Enregistrer version, configuration, équipement, intervenant, heure et preuve avant changement"),
      item("operational_step", "Exécuter dans la fenêtre autorisée puis tester le résultat avec le critère prévu"),
      item("recurring_control", "Faire valider la mise en service et documenter anomalie, correction ou retour arrière"),
    ],
    [P.support]: [
      item("implementation_action", "Créer une file unique avec priorité, impact, urgence, propriétaire, SLA et statut"),
      item("operational_step", "Qualifier symptôme, utilisateurs touchés, début, environnement, changement récent et preuve"),
      item("operational_step", "Rétablir le service, traiter la cause ou escalader avec toutes les informations utiles"),
      item("recurring_control", "Revoir chaque semaine tickets anciens, récurrents, hors SLA, réouverts et sans propriétaire"),
    ],
    [P.documentation]: [
      item("implementation_action", "Créer un dossier standard avec architecture, configuration, procédures, contacts et historique"),
      item("operational_step", "Mettre à jour documentation, inventaire et accès à chaque modification validée"),
      item("operational_step", "Stocker les secrets dans un coffre et partager seulement le droit nécessaire"),
      item("recurring_control", "Tester régulièrement qu’une personne autorisée peut retrouver et appliquer la procédure"),
    ],
    [P.planning]: [
      item("implementation_action", "Créer un plan de charge par compétence, projet, support, maintenance et astreinte"),
      item("operational_step", "Affecter une personne seulement si compétence, capacité, accès et relais sont disponibles"),
      item("operating_rule", "Ne pas masquer une surcharge par des délais irréalistes ou des interventions non tracées"),
      item("recurring_control", "Comparer chaque semaine charge prévue, tickets entrants, urgences, reste à faire et couverture"),
    ],
    [P.handover]: [
      item("implementation_action", "Créer une fiche avec contexte, architecture, statut, risques, accès et prochaine action"),
      item("operational_step", "Partager tickets, changements, versions, décisions, contacts et échéances à jour"),
      item("operational_step", "Faire reformuler au remplaçant le risque principal et la prochaine action sûre"),
      item("recurring_control", "Tester chaque trimestre la reprise d’un dossier critique sans son titulaire"),
    ],
    [P.onboarding]: [
      item("implementation_action", "Préparer un parcours avec offres, environnements, sécurité, outils et cas réels"),
      item("operational_step", "Faire traiter un cas test puis une première tâche supervisée avec droit limité"),
      item("recurring_control", "Valider à J+7 et J+30 compétences, qualité, autonomie et accès conservés"),
    ],
    [P.margin]: [
      item("implementation_action", "Créer un budget avec prix, temps, licences, matériel, cloud, sous-traitance et marge cible"),
      item("operational_step", "Saisir temps, achats et consommations avec une catégorie exploitable chaque semaine"),
      item("recurring_control", "Comparer vendu, consommé, reste à faire, facturé et encaissé par dossier ou compte"),
      item("operating_rule", "Traiter toute dérive avant de la compenser par du temps gratuit ou une baisse de qualité"),
    ],
    [P.expenses]: [
      item("implementation_action", "Créer un calendrier des licences, matériels, cloud, fournisseurs, taxes et renouvellements"),
      item("operational_step", "Valider chaque facture avec commande, service rendu, compte client et conditions convenues"),
      item("operational_step", "Classer facture, justificatif, validation, période et paiement dans le dossier prévu"),
      item("recurring_control", "Prévoir chaque mois les sorties et renouvellements des huit semaines suivantes"),
    ],
    [P.collections]: [
      item("implementation_action", "Relier chaque facture à une période, un jalon, un volume ou une acceptation contractuelle"),
      item("operational_step", "Préparer facture, bon de commande, relevé et preuve avant l’échéance"),
      item("operational_step", "Relancer avec montant, référence, date, pièce et prochaine étape clairement indiqués"),
      item("recurring_control", "Revoir chaque semaine factures à émettre, échues, contestées et promises au paiement"),
    ],
    [P.compliance]: [
      item("implementation_action", "Créer une checklist contrat, données, sécurité, sous-traitants, assurance et continuité"),
      item("operational_step", "Faire signer les autorisations et engagements nécessaires avant tout accès sensible"),
      item("operating_rule", "Ne collecter, utiliser, partager ou conserver que les données nécessaires et autorisées"),
      item("recurring_control", "Tester sauvegarde, restauration, contacts d’urgence, révocation et preuves selon la criticité"),
    ],
  },
};

export type TechServicesTradeProfile = {
  slug: string;
  name: string;
  growthPriorities: string;
  delegatedDecisions: string;
  criticalAccess: string;
  qualificationChecks: string;
  salesScope: string;
  scopeChecks: string;
  deploymentStandard: string;
  incidentPriority: string;
  documentationStandard: string;
  planningSkills: string;
  handoverContent: string;
  marginRisks: string;
  complianceRisks: string;
  wave: "managed" | "product";
  reviewState: "internal_review_complete";
};

const patches = (profile: TechServicesTradeProfile): ProcessContentPatch[] => [
  { processId: P.cap, contentIndex: 0, label: `Choisir les priorités de croissance : ${profile.growthPriorities}` },
  { processId: P.decisions, contentIndex: 0, label: `Déléguer explicitement : ${profile.delegatedDecisions}` },
  { processId: P.access, contentIndex: 0, label: `Sécuriser les accès suivants : ${profile.criticalAccess}` },
  { processId: P.qualification, contentIndex: 1, label: `Qualifier techniquement avec : ${profile.qualificationChecks}` },
  { processId: P.sales, contentIndex: 0, label: `Décrire précisément dans l’offre : ${profile.salesScope}` },
  { processId: P.scope, contentIndex: 0, label: `Cadrer précisément : ${profile.scopeChecks}` },
  { processId: P.deploy, contentIndex: 0, label: `Standardiser l’exécution : ${profile.deploymentStandard}` },
  { processId: P.support, contentIndex: 0, label: `Prioriser et suivre : ${profile.incidentPriority}` },
  { processId: P.documentation, contentIndex: 0, label: `Documenter systématiquement : ${profile.documentationStandard}` },
  { processId: P.planning, contentIndex: 0, label: `Planifier selon les compétences nécessaires : ${profile.planningSkills}` },
  { processId: P.handover, contentIndex: 0, label: `Transmettre obligatoirement : ${profile.handoverContent}` },
  { processId: P.margin, contentIndex: 1, label: `Tracer particulièrement les risques de marge : ${profile.marginRisks}` },
  { processId: P.collections, contentIndex: 0, label: `Facturer et relancer selon : ${profile.salesScope}` },
  { processId: P.compliance, contentIndex: 0, label: `Sécuriser en priorité : ${profile.complianceRisks}` },
];

export const generateTechServicesTradeProcessDraft = (
  profile: TechServicesTradeProfile,
) =>
  composeProcessDraft(techServicesFamilyCoreDraft, [
    { id: `metier.${profile.slug}`, contentPatches: patches(profile) },
  ]);

export const techServicesTradeProfiles = {
  "cybersecurite-pme": {
    slug: "cybersecurite-pme", name: "Cybersécurité PME", wave: "managed", reviewState: "internal_review_complete",
    growthPriorities: "audits ciblés, remédiation, supervision, sensibilisation et contrats récurrents de sécurité",
    delegatedDecisions: "qualification d’alerte, mesure conservatoire, isolement autorisé, collecte de preuve et escalade",
    criticalAccess: "coffre de secrets, consoles EDR, SIEM, annuaire, pare-feu, sauvegardes et comptes privilégiés",
    qualificationChecks: "actifs critiques, exposition, identités, sauvegardes, incidents, obligations, périmètre et autorisations",
    salesScope: "actifs couverts, règles d’engagement, profondeur des tests, livrables, remédiation, SLA et exclusions",
    scopeChecks: "inventaire des actifs, fenêtres de test, adresses autorisées, contacts d’urgence, preuves et arrêt immédiat",
    deploymentStandard: "autorisation écrite, précontrôles, collecte horodatée, limitation d’impact, validation et remédiation",
    incidentPriority: "impact métier, actifs critiques, propagation, compromission d’identité, données exposées et preuve disponible",
    documentationStandard: "actifs, vulnérabilités, faux positifs, preuves, criticité, remédiations, acceptations de risque et secrets",
    planningSkills: "analyse de vulnérabilité, réponse à incident, systèmes, réseau, identité, cloud et conformité",
    handoverContent: "chronologie, périmètre, indicateurs, preuves, mesures prises, secrets révoqués, risques et contacts d’urgence",
    marginRisks: "périmètre découvert tardivement, actifs non inventoriés, preuves dispersées, urgence et remédiation non cadrée",
    complianceRisks: "règles d’engagement, habilitation, chaîne de preuve, données personnelles, notification, rétention et continuité",
  },
  "infogerance-informatique": {
    slug: "infogerance-informatique", name: "Infogérance informatique", wave: "managed", reviewState: "internal_review_complete",
    growthPriorities: "parcs standardisés, contrats managés, supervision, sauvegarde, cybersécurité et projets récurrents",
    delegatedDecisions: "priorité P1 à P4, redémarrage autorisé, changement standard, remplacement plafonné et escalade éditeur",
    criticalAccess: "RMM, annuaire, pare-feu, sauvegardes, Microsoft 365, coffre client, supervision et comptes administrateurs",
    qualificationChecks: "inventaire, utilisateurs, sites, criticité, contrats, obsolescence, sauvegardes, réseau et historique d’incidents",
    salesScope: "actifs couverts, horaires, SLA, maintenance, licences, sauvegarde, projets inclus, astreinte et exclusions",
    scopeChecks: "inventaire initial, versions, dépendances, contrats tiers, sauvegardes, accès, responsabilités et plan de reprise",
    deploymentStandard: "ticket approuvé, sauvegarde vérifiée, fenêtre de changement, procédure, test, communication et rollback",
    incidentPriority: "P1 à P4 selon utilisateurs touchés, service critique, contournement, sécurité, urgence et engagement SLA",
    documentationStandard: "inventaire, réseau, licences, configurations, sauvegardes, procédures, contrats, contacts et coffre de secrets",
    planningSkills: "support N1-N3, systèmes, réseau, Microsoft 365, sauvegarde, sécurité, projets et relation éditeur",
    handoverContent: "tickets P1-P2, changements prévus, alertes, sauvegardes, commandes, accès, contacts et engagements SLA",
    marginRisks: "parc non standard, dette technique, tickets hors forfait, déplacements, astreinte, licences et incidents récurrents",
    complianceRisks: "accès administrateurs, journalisation, sous-traitants, sauvegardes, restauration, données client et réversibilité",
  },
  "integrateur-crm-erp": {
    slug: "integrateur-crm-erp", name: "Intégrateur CRM / ERP", wave: "product", reviewState: "internal_review_complete",
    growthPriorities: "cadrages, intégrations verticales, migrations, support applicatif et contrats d’évolution",
    delegatedDecisions: "paramétrage réversible, demande de donnée, correction en sandbox, escalade éditeur et changement mineur",
    criticalAccess: "sandbox, production, API, bases de données, ETL, comptes éditeur, dépôt de code et secrets d’intégration",
    qualificationChecks: "processus cibles, utilisateurs, données, interfaces, volumes, écarts standard, calendrier et sponsor",
    salesScope: "ateliers, paramétrage, reprises de données, interfaces, tests, formation, bascule, support et demandes de changement",
    scopeChecks: "processus, exigences, écarts, données, interfaces, rôles, critères UAT, cutover, rollback et adoption",
    deploymentStandard: "configuration en sandbox, versionnement, migration test, UAT signé, sauvegarde, cutover et retour arrière",
    incidentPriority: "blocage métier, utilisateurs touchés, données incohérentes, interface arrêtée, contournement et échéance",
    documentationStandard: "processus, paramétrages, rôles, mappings de données, interfaces, tests, versions et procédures de support",
    planningSkills: "analyse métier, paramétrage, migration, API, développement, tests, formation et conduite du changement",
    handoverContent: "décisions, backlog, paramétrages, scripts, mappings, résultats UAT, anomalies, accès et plan de bascule",
    marginRisks: "exigences tardives, qualité des données, interfaces inconnues, reprises UAT, formation et changements hors périmètre",
    complianceRisks: "données personnelles, habilitations, licences, sous-traitants, journalisation, réversibilité et conservation",
  },
  "reparation-informatique-mobile": {
    slug: "reparation-informatique-mobile", name: "Maintenance informatique B2B", wave: "product", reviewState: "internal_review_complete",
    growthPriorities: "diagnostics payants, réparations rapides, contrats B2B, reconditionnement et vente d’accessoires utiles",
    delegatedDecisions: "diagnostic, commande plafonnée, remplacement équivalent, refus sécurité et appel client avant dépassement",
    criticalAccess: "outil de tickets, stock, fournisseurs, bancs de test, mots de passe temporaires et zone de stockage sécurisée",
    qualificationChecks: "modèle, numéro de série, état, panne, choc ou liquide, données, sauvegarde, urgence et garantie",
    salesScope: "diagnostic, pièce, main-d’œuvre, délai estimé, données, autorisation, garantie, imprévus et appareil non réparable",
    scopeChecks: "identité, appareil, numéro de série, photos, état, accessoires confiés, panne, données et autorisation écrite",
    deploymentStandard: "protection ESD, diagnostic tracé, devis autorisé, pièce vérifiée, réparation, tests et remise documentée",
    incidentPriority: "risque batterie ou électrique, perte de données, appareil professionnel bloquant, garantie et délai promis",
    documentationStandard: "fiche d’entrée, photos, série, diagnostic, devis, consentement données, pièces, tests, garantie et remise",
    planningSkills: "diagnostic matériel, microsoudure selon habilitation, logiciel, sauvegarde, tests, accueil et gestion de stock",
    handoverContent: "appareils présents, état, diagnostic, autorisation, pièces attendues, données sensibles, tests et délai client",
    marginRisks: "diagnostic long, pièce incorrecte, panne cachée, données, reprise sous garantie et appareil abandonné",
    complianceRisks: "chaîne de garde, consentement, accès aux données, effacement, déchets DEEE, batteries, sécurité et garantie",
  },
  saas: {
    slug: "saas", name: "SaaS B2B", wave: "product", reviewState: "internal_review_complete",
    growthPriorities: "ARR et MRR rentables, onboarding rapide, usage actif, expansion des comptes et réduction du churn",
    delegatedDecisions: "priorité de bug, hotfix encadré, geste plafonné, rollback, limitation de fonctionnalité et escalade sécurité",
    criticalAccess: "cloud, production, base clients, dépôt de code, CI/CD, observabilité, paiement et coffre de secrets",
    qualificationChecks: "ICP, utilisateurs, problème, usage, intégrations, données, sécurité, budget, décision et calendrier",
    salesScope: "plan, utilisateurs, limites d’usage, onboarding, support, disponibilité, intégrations, données, facturation et résiliation",
    scopeChecks: "tenant, rôles, données, imports, intégrations, configuration, critères d’activation, support et responsabilités",
    deploymentStandard: "revue de code, tests automatiques, migration contrôlée, déploiement progressif, observabilité et rollback",
    incidentPriority: "indisponibilité, comptes touchés, perte ou exposition de données, paiement, contournement et engagement de service",
    documentationStandard: "architecture, services, runbooks, API, schémas de données, changements, alertes, accès et procédures de reprise",
    planningSkills: "produit, développement, QA, SRE, support, sécurité, data, onboarding et customer success",
    handoverContent: "incidents, déploiements, alertes, métriques, comptes sensibles, migrations, secrets, risques et astreinte",
    marginRisks: "coûts cloud, support excessif, développements spécifiques, impayés, faible usage, churn et dette technique",
    complianceRisks: "DPA, RGPD, localisation, sous-traitants, contrôle d’accès, sauvegarde, restauration, incident et portabilité",
  },
} satisfies Record<string, TechServicesTradeProfile>;
