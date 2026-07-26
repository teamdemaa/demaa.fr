import {
  composeProcessDraft,
  type IndustrializedContentItem,
  type IndustrializedProcessDefinition,
  type ProcessContentPatch,
  type ProcessDraft,
} from "@/lib/process-industrialization";

const processKeys = [
  "cap",
  "decisions",
  "visibility",
  "acquire",
  "complaint",
  "onboard",
  "operate",
  "incident",
  "replace",
  "profitability",
  "cash",
  "compliance",
] as const;

type PropertyProcessKey = (typeof processKeys)[number];

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

const definitionsByKey: Record<
  PropertyProcessKey,
  IndustrializedProcessDefinition
> = {
  cap: def(
    "Choisir un portefeuille compatible avec la capacité, la rentabilité et le niveau de service promis.",
    "Début de trimestre ou écart important.",
    "Des priorités chiffrées par segment, zone et type de mandat.",
    "Dirigeant",
    "Trimestrielle",
  ),
  decisions: def(
    "Déléguer les arbitrages courants sans exposer le client, l’occupant ou le patrimoine.",
    "Urgence, retard, absence, dépense ou contestation.",
    "Une décision rapide, tracée et prise dans une limite connue.",
    "Dirigeant ou responsable de portefeuille",
    "Mensuelle",
  ),
  visibility: def(
    "Voir les échéances, flux, incidents et engagements de chaque dossier.",
    "Revue d’activité.",
    "Des écarts expliqués avec une action, un responsable et une date.",
    "Responsable de portefeuille",
    "Hebdomadaire",
  ),
  acquire: def(
    "Transformer une opportunité en mandat clair, rentable et exécutable.",
    "Nouveau prospect, bien ou portefeuille.",
    "Un périmètre qualifié et une proposition sans zone grise.",
    "Dirigeant ou responsable commercial",
    "À chaque opportunité",
  ),
  complaint: def(
    "Traiter une réclamation avec les faits, les responsabilités et la correction utiles.",
    "Insatisfaction, contestation, retard ou dommage.",
    "Une réponse tracée et une cause opérationnelle traitée.",
    "Responsable de portefeuille",
    "À chaque réclamation",
  ),
  onboard: def(
    "Ouvrir un dossier complet avant de commencer la gestion.",
    "Mandat signé ou reprise d’un dossier.",
    "Des données, pièces, accès et responsabilités vérifiés.",
    "Gestionnaire",
    "À chaque nouveau dossier",
  ),
  operate: def(
    "Exécuter les opérations récurrentes sans perdre une échéance ni une preuve.",
    "Échéance, demande, arrivée, départ ou décision.",
    "Un dossier à jour et une prochaine action visible.",
    "Gestionnaire",
    "Quotidienne",
  ),
  incident: def(
    "Piloter les événements sensibles jusqu’à leur clôture.",
    "Incident, travaux, impayé, vacance ou urgence.",
    "Une mesure immédiate, un suivi et une preuve de clôture.",
    "Gestionnaire ou responsable de portefeuille",
    "À chaque événement",
  ),
  replace: def(
    "Permettre la reprise d’un portefeuille sans dépendre de son titulaire.",
    "Absence, congé, surcharge ou départ.",
    "Un remplaçant retrouve les priorités, accès et limites de décision.",
    "Responsable d’équipe",
    "À chaque remplacement",
  ),
  profitability: def(
    "Connaître la marge réelle par mandat, bien ou portefeuille.",
    "Saisie de temps, dépense ou clôture mensuelle.",
    "Des dérives détectées avant renouvellement ou nouveau prix.",
    "Dirigeant ou responsable financier",
    "Mensuelle",
  ),
  cash: def(
    "Sécuriser les encaissements, décaissements et honoraires à partir de pièces complètes.",
    "Échéance, facture, appel ou reversement.",
    "Des flux justifiés, rapprochés et relancés à temps.",
    "Responsable administratif",
    "Hebdomadaire",
  ),
  compliance: def(
    "Maintenir les mandats, documents, habilitations et obligations applicables à jour.",
    "Nouveau dossier, échéance ou évolution réglementaire.",
    "Une preuve disponible pour chaque exigence applicable.",
    "Dirigeant ou référent conformité",
    "Mensuelle",
  ),
};

const contentByKey: Record<
  PropertyProcessKey,
  IndustrializedContentItem[]
> = {
  cap: [
    item("implementation_action", "Choisir les segments, zones, mandats et niveaux de service qui doivent porter la croissance"),
    item("implementation_action", "Fixer des objectifs de portefeuille, chiffre d’affaires, marge, qualité et rétention"),
    item("operational_step", "Comparer le portefeuille visé à la capacité réelle des gestionnaires et prestataires"),
    item("recurring_control", "Comparer chaque mois objectifs, entrées, sorties, charge, honoraires et marge"),
    item("recurring_control", "Mesurer par segment la satisfaction, les incidents, le temps consommé et le renouvellement"),
    item("operating_rule", "Ne pas accepter un mandat sans périmètre, prix, capacité et risques identifiés"),
  ],
  decisions: [
    item("implementation_action", "Écrire les décisions déléguées avec seuil financier, urgence, information et escalade"),
    item("operational_step", "Classer l’arbitrage selon sécurité, délai légal ou contractuel, impact et coût"),
    item("operational_step", "Appliquer la mesure conservatoire autorisée puis informer les parties utiles"),
    item("operating_rule", "Escalader immédiatement danger, sinistre majeur, fonds non justifiés ou document obligatoire absent"),
    item("recurring_control", "Tracer décision, motif, auteur, heure, coût et résultat"),
    item("recurring_control", "Revoir chaque mois les décisions remontées inutilement ou prises hors limite"),
  ],
  visibility: [
    item("implementation_action", "Créer une vue portefeuille avec dossier, statut, échéance, incident, flux et prochaine action"),
    item("operational_step", "Identifier les dossiers à risque avant la revue de portefeuille"),
    item("operational_step", "Affecter à chaque écart un responsable et une échéance"),
    item("recurring_control", "Revoir chaque semaine urgences, retards, impayés, travaux et pièces manquantes"),
    item("recurring_control", "Contrôler les dossiers sans mouvement, sans réponse ou sans prochaine action"),
    item("operating_rule", "Un dossier ouvert doit toujours avoir un statut, un propriétaire et une prochaine étape"),
  ],
  acquire: [
    item("implementation_action", "Créer un parcours d’acquisition avec source, qualification, visite, proposition et relance"),
    item("operational_step", "Confirmer l’identité du mandant, son besoin, ses priorités et les décideurs"),
    item("operational_step", "Qualifier le portefeuille, les contraintes, les pièces disponibles et les risques connus"),
    item("operational_step", "Calculer le temps, les prestataires, les frais et la marge attendue"),
    item("operational_step", "Présenter clairement prestations incluses, prestations particulières, exclusions et honoraires"),
    item("operating_rule", "Ne pas promettre une action qui dépend d’une autorisation, d’un vote ou d’une pièce absente"),
    item("recurring_control", "Mesurer prospects, propositions, signatures, pertes, délai de décision et marge prévue"),
  ],
  complaint: [
    item("implementation_action", "Créer un registre avec demandeur, dossier, faits, pièces, impact, réponse et correction"),
    item("operational_step", "Accuser réception et sécuriser immédiatement la personne, le logement ou l’immeuble si nécessaire"),
    item("operational_step", "Comparer mandat, chronologie, échanges, décisions, factures et preuves disponibles"),
    item("operational_step", "Répondre avec faits établis, action, délai et interlocuteur"),
    item("recurring_control", "Vérifier après clôture que la correction annoncée a été exécutée"),
    item("recurring_control", "Analyser chaque mois réclamations, délais, causes récurrentes et dossiers réouverts"),
  ],
  onboard: [
    item("implementation_action", "Créer une checklist de reprise avec mandat, contacts, pièces, accès, contrats et soldes"),
    item("operational_step", "Vérifier le périmètre confié, la date d’effet, les délégations et les honoraires"),
    item("operational_step", "Contrôler les informations et documents indispensables avant la première opération"),
    item("operational_step", "Importer les données en conservant leur source et leur date de vérification"),
    item("operational_step", "Informer les parties des contacts, canaux, délais et procédures utiles"),
    item("operating_rule", "Ne pas déclarer un dossier repris tant qu’une pièce critique ou un accès manque"),
    item("recurring_control", "Contrôler trente jours après la reprise les écarts, doublons, soldes et actions oubliées"),
  ],
  operate: [
    item("implementation_action", "Créer un cycle d’exploitation avec tâches, échéances, modèles, preuves et escalades"),
    item("operational_step", "Préparer l’opération à partir des informations vérifiées du dossier"),
    item("operational_step", "Tracer chaque action importante, son auteur, sa date, sa pièce et sa prochaine étape"),
    item("operational_step", "Informer les parties lorsqu’un délai, un coût ou un résultat change"),
    item("operational_step", "Clôturer l’opération avec résultat, réserve, document et suivi éventuel"),
    item("operating_rule", "Ne pas modifier une donnée sensible ou engager une dépense sans droit identifié"),
    item("recurring_control", "Contrôler chaque semaine les opérations échues, bloquées ou sans justificatif"),
  ],
  incident: [
    item("implementation_action", "Créer une procédure d’incident avec priorité, mesure conservatoire, prestataire et communication"),
    item("operational_step", "Qualifier danger, responsabilité présumée, urgence, accès, assurance et personnes touchées"),
    item("operational_step", "Déclencher la mesure autorisée puis conserver devis, accord, photos et échanges utiles"),
    item("operational_step", "Suivre intervention, délai, coût, réserve et conséquence sur le dossier"),
    item("operational_step", "Confirmer la remise en état ou la décision de poursuite"),
    item("operating_rule", "Une urgence protège d’abord les personnes et le bien sans préjuger du payeur final"),
    item("recurring_control", "Revoir chaque semaine incidents ouverts, délais fournisseurs, dépenses et recours"),
  ],
  replace: [
    item("implementation_action", "Créer une fiche de passation avec portefeuille, urgences, échéances, accès et contacts"),
    item("operational_step", "Vérifier avant remplacement les compétences, habilitations, délégations et limites utiles"),
    item("operational_step", "Transmettre les dossiers sensibles avec faits, pièces et prochaine action"),
    item("operational_step", "Informer les interlocuteurs lorsque le changement affecte le traitement"),
    item("operating_rule", "Ne jamais transmettre un accès nominatif ; créer ou réattribuer un droit traçable"),
    item("recurring_control", "Tester chaque trimestre la reprise d’un dossier prioritaire sans son titulaire"),
  ],
  profitability: [
    item("implementation_action", "Créer un budget par mandat avec honoraires, temps standard, frais, prestataires et exceptions"),
    item("operational_step", "Tracer le temps, les déplacements, reprises, gestes, achats et prestations non facturées"),
    item("operational_step", "Affecter chaque coût et produit au bon dossier et à la bonne période"),
    item("recurring_control", "Comparer chaque mois prévu, réalisé, facturé, encaissé et temps consommé"),
    item("recurring_control", "Identifier les mandats sous-tarifés, surchargés ou durablement déficitaires"),
    item("operating_rule", "Réviser le périmètre ou le prix avant de masquer une dérive par du travail non tracé"),
  ],
  cash: [
    item("implementation_action", "Relier chaque flux à un mandat, une période, un bénéficiaire et une pièce"),
    item("operational_step", "Contrôler montant, autorisation, imputation et coordonnées avant émission ou paiement"),
    item("operational_step", "Rapprocher les mouvements et traiter immédiatement les écarts"),
    item("operational_step", "Relancer avec référence, montant, échéance, pièce et prochaine étape"),
    item("recurring_control", "Revoir chaque semaine à facturer, à encaisser, à reverser, contestés et trésorerie"),
  ],
  compliance: [
    item("implementation_action", "Créer un registre d’échéances pour mandats, assurances, habilitations et documents applicables"),
    item("operational_step", "Vérifier avant action la validité du mandat, du pouvoir et de la pièce requise"),
    item("operational_step", "Conserver la preuve, sa date, sa source et sa durée de validité"),
    item("operating_rule", "Ne pas utiliser une donnée ou un fonds au-delà du mandat et de la finalité autorisés"),
    item("recurring_control", "Auditer chaque mois échéances proches, pièces manquantes, accès et anomalies de conservation"),
  ],
};

export type PropertyOperationsProfile = {
  slug: "syndic" | "gestion-locative" | "conciergerie-airbnb";
  name: string;
  family: "syndic" | "rental" | "concierge";
  reviewState: "internal_review_complete";
  sourceUrl: string;
  processIds: Record<PropertyProcessKey, string>;
  growthPriorities: string;
  delegatedDecisions: string;
  visibilityRisks: string;
  acquisitionFrame: string;
  qualificationFrame: string;
  complaintEvidence: string;
  onboardingFrame: string;
  intakeChecks: string;
  operatingStandard: string;
  operatingTrace: string;
  incidentFrame: string;
  replacementChecks: string;
  marginRisks: string;
  billingProof: string;
  complianceFrame: string;
};

export function generatePropertyOperationsCoreDraft(
  profile: PropertyOperationsProfile,
): ProcessDraft {
  return {
    definitionsById: Object.fromEntries(
      processKeys.map((key) => [profile.processIds[key], definitionsByKey[key]]),
    ),
    contentByProcessId: Object.fromEntries(
      processKeys.map((key) => [
        profile.processIds[key],
        contentByKey[key].map((entry) => ({ ...entry })),
      ]),
    ),
  };
}

const patches = (
  profile: PropertyOperationsProfile,
): ProcessContentPatch[] => [
  { processId: profile.processIds.cap, contentIndex: 0, label: `Choisir les priorités de croissance : ${profile.growthPriorities}` },
  { processId: profile.processIds.decisions, contentIndex: 0, label: `Déléguer explicitement : ${profile.delegatedDecisions}` },
  { processId: profile.processIds.visibility, contentIndex: 1, label: `Identifier les dossiers à risque : ${profile.visibilityRisks}` },
  { processId: profile.processIds.acquire, contentIndex: 0, label: `Développer le portefeuille avec : ${profile.acquisitionFrame}` },
  { processId: profile.processIds.acquire, contentIndex: 2, label: `Qualifier avant proposition : ${profile.qualificationFrame}` },
  { processId: profile.processIds.complaint, contentIndex: 0, label: `Constituer la réclamation avec : ${profile.complaintEvidence}` },
  { processId: profile.processIds.onboard, contentIndex: 0, label: `Ouvrir ou reprendre le dossier avec : ${profile.onboardingFrame}` },
  { processId: profile.processIds.onboard, contentIndex: 2, label: `Contrôler avant démarrage : ${profile.intakeChecks}` },
  { processId: profile.processIds.operate, contentIndex: 0, label: `Standardiser l’exploitation : ${profile.operatingStandard}` },
  { processId: profile.processIds.operate, contentIndex: 2, label: `Tracer dans chaque dossier : ${profile.operatingTrace}` },
  { processId: profile.processIds.incident, contentIndex: 0, label: `Piloter les événements sensibles avec : ${profile.incidentFrame}` },
  { processId: profile.processIds.replace, contentIndex: 1, label: `Contrôler avant remplacement : ${profile.replacementChecks}` },
  { processId: profile.processIds.profitability, contentIndex: 1, label: `Tracer particulièrement les risques de marge : ${profile.marginRisks}` },
  { processId: profile.processIds.cash, contentIndex: 0, label: `Justifier les flux et honoraires avec : ${profile.billingProof}` },
  { processId: profile.processIds.compliance, contentIndex: 0, label: `Tenir à jour les obligations applicables : ${profile.complianceFrame}` },
];

export const generatePropertyOperationsDraft = (
  profile: PropertyOperationsProfile,
) =>
  composeProcessDraft(generatePropertyOperationsCoreDraft(profile), [
    { id: `metier.${profile.slug}`, contentPatches: patches(profile) },
  ]);

export const propertyOperationsProfiles = {
  syndic: {
    slug: "syndic",
    name: "Syndic",
    family: "syndic",
    reviewState: "internal_review_complete",
    sourceUrl: "https://docs.google.com/spreadsheets/d/1kiTjrf6L208UIVptV5XZQbtjCJ8vHA4lpTzJNDdMdvQ/edit",
    processIds: {
      cap: "process.syndic.direction.savoir-ou-va-le-portefeuille-copropriete",
      decisions: "process.syndic.direction.decider-sans-bloquer-lexploitation",
      visibility: "process.syndic.direction.donner-acces-a-lessentiel",
      acquire: "process.syndic.marketing-vente.developper-ou-renouveler-des-mandats",
      complaint: "process.syndic.marketing-vente.traiter-une-reclamation-coproprietaire-ou-occupant",
      onboard: "process.syndic.operations.tenir-la-copropriete-et-ses-lots",
      operate: "process.syndic.operations.preparer-assemblees-generales-et-decisions",
      incident: "process.syndic.operations.suivre-appels-de-fonds-travaux-et-incidents",
      replace: "process.syndic.equipe.organiser-gestionnaires-et-remplacements",
      profitability: "process.syndic.finance-admin.suivre-flux-appels-de-fonds-et-impayes",
      cash: "process.syndic.finance-admin.se-faire-payer",
      compliance: "process.syndic.conformite-metier.tenir-proces-verbaux-contrats-et-obligations-en-regle",
    },
    growthPriorities: "copropriétés adaptées à la capacité, mandats rentables, renouvellements préparés et portefeuilles géographiquement cohérents",
    delegatedDecisions: "mesure conservatoire, devis sous plafond, intervention urgente, relance, information du conseil syndical et escalade",
    visibilityRisks: "assemblée générale proche, impayé, sinistre, travaux votés, contrat à renouveler, pièce réglementaire absente et demande sans réponse",
    acquisitionFrame: "prescripteurs locaux, demandes de conseils syndicaux, diagnostic de reprise, proposition de contrat et calendrier de renouvellement",
    qualificationFrame: "nombre de lots, budget, impayés, travaux, litiges, contrats, sinistres, archives disponibles, fin du mandat actuel et attentes du conseil syndical",
    complaintEvidence: "copropriété, lot, demandeur, règlement, décision d’AG, chronologie, échanges, intervention, facture et réponse",
    onboardingFrame: "règlement et état descriptif, liste des copropriétaires et lots, contrats, comptes, archives, sinistres, travaux, accès et échéances",
    intakeChecks: "mandat et date d’effet, compte séparé et fonds concernés, soldes, registre, fiche synthétique, carnet d’entretien, contrats, assurances et trois derniers procès-verbaux disponibles",
    operatingStandard: "ordre du jour, pièces jointes, convocation, pouvoirs, tenue de l’AG, vote, procès-verbal, notification et exécution des décisions",
    operatingTrace: "question inscrite, devis, résolution, vote, réserve, décision, notification, responsable d’exécution et échéance",
    incidentFrame: "appel de fonds ou impayé, travaux votés, sinistre, urgence technique, devis, autorisation, prestataire, assurance et information des copropriétaires",
    replacementChecks: "portefeuille attribué, prochaines AG, urgences, impayés, travaux, accès, délégations, interlocuteurs et décisions en attente",
    marginRisks: "nombre de lots, AG supplémentaires, sinistres, travaux, impayés, sollicitations, déplacements et prestations particulières",
    billingProof: "contrat de syndic, période, forfait, prestations particulières autorisées, décisions applicables, temps et justificatifs",
    complianceFrame: "carte professionnelle adaptée, RCP, garantie financière selon détention de fonds, mandat, compte séparé, registre national, fiche synthétique, carnet d’entretien et documents accessibles",
  },
  "gestion-locative": {
    slug: "gestion-locative",
    name: "Gestion locative pour investisseurs",
    family: "rental",
    reviewState: "internal_review_complete",
    sourceUrl: "https://docs.google.com/spreadsheets/d/1ti1-lqv0ZXnDf5Rtj0c9_nTi4ydGNM0dqp-pJptmvLs/edit",
    processIds: {
      cap: "process.gestion-locative.direction.savoir-ou-va-lactivite",
      decisions: "process.gestion-locative.direction.decider-sans-bloquer-lexploitation",
      visibility: "process.gestion-locative.direction.donner-acces-a-lessentiel",
      acquire: "process.gestion-locative.marketing-vente.developper-les-mandats-de-gestion",
      complaint: "process.gestion-locative.marketing-vente.traiter-une-reclamation-proprietaire-ou-locataire",
      onboard: "process.gestion-locative.operations.entrer-un-bien-et-preparer-la-mise-en-location",
      operate: "process.gestion-locative.operations.suivre-loyers-quittances-et-incidents",
      incident: "process.gestion-locative.operations.gerer-departs-travaux-et-relocation",
      replace: "process.gestion-locative.equipe.organiser-les-gestionnaires-et-remplacements",
      profitability: "process.gestion-locative.finance-admin.suivre-flux-honoraires-et-encaissements",
      cash: "process.gestion-locative.finance-admin.se-faire-payer",
      compliance: "process.gestion-locative.conformite-metier.tenir-baux-etats-des-lieux-et-obligations-en-regle",
    },
    growthPriorities: "mandats de gestion récurrents, biens dans des zones maîtrisées, propriétaires multi-biens et faible vacance",
    delegatedDecisions: "réparation sous plafond, relance amiable, choix d’un prestataire référencé, replanification d’état des lieux et escalade d’impayé",
    visibilityRisks: "vacance, loyer impayé, bail ou diagnostic à échéance, révision non traitée, dépôt de garantie, travaux, sinistre et demande sans réponse",
    acquisitionFrame: "réseau d’investisseurs et prescripteurs, diagnostic du bien, estimation de gestion, proposition de mandat et relances planifiées",
    qualificationFrame: "propriété, type de location, occupation, décence et performance énergétique applicables, diagnostics, loyer, charges, travaux, assurance, clés et objectif du bailleur",
    complaintEvidence: "bien, bail, état des lieux, demandeur, chronologie, quittances, échanges, intervention, facture, photos utiles et réponse",
    onboardingFrame: "mandat, titre ou pouvoir utile, dossier de diagnostics, bail existant, états des lieux, clés, compteurs, assurances, soldes, locataire et fournisseurs",
    intakeChecks: "carte et mandat applicables, décence, diagnostics valides, loyer et charges, assurance, disponibilité, équipements, documents à annexer et données du candidat strictement nécessaires",
    operatingStandard: "appel et encaissement, quittance, révision applicable, régularisation, demande locataire, maintenance, information bailleur et suivi des impayés",
    operatingTrace: "échéance, somme appelée, somme reçue, ventilation, quittance, relance, incident, accord bailleur, intervention et prochaine action",
    incidentFrame: "préavis, état des lieux de sortie, clés, dépôt de garantie, retenues justifiées, travaux, remise en location, sélection objective et nouveau bail",
    replacementChecks: "biens attribués, encaissements, impayés, départs, entrées, travaux, clés, accès, mandats, plafonds et interlocuteurs",
    marginRisks: "vacance, états des lieux, impayés, sinistres, travaux, déplacements, réclamations, relocation et temps non facturé",
    billingProof: "mandat de gestion, barème accepté, période, loyers ou actes concernés, prestations particulières, facture et compte rendu de gestion",
    complianceFrame: "carte Gestion immobilière, RCP, garantie financière selon détention de fonds, mandat écrit et registre, bail et annexes, états des lieux, diagnostics, données et critères non discriminatoires",
  },
  "conciergerie-airbnb": {
    slug: "conciergerie-airbnb",
    name: "Conciergerie multi-biens",
    family: "concierge",
    reviewState: "internal_review_complete",
    sourceUrl: "https://docs.google.com/spreadsheets/d/1vKm8-1M0ciuk3v3Nih3MRtKDHE6sFKcYqsV7dHpMebY/edit",
    processIds: {
      cap: "process.conciergerie.direction.savoir-ou-va-lactivite",
      decisions: "process.conciergerie.direction.decider-sans-bloquer-lexploitation",
      visibility: "process.conciergerie.direction.donner-acces-a-lessentiel",
      acquire: "process.conciergerie.marketing-vente.developper-les-biens-et-voyageurs",
      complaint: "process.conciergerie.marketing-vente.traiter-un-avis-ou-une-reclamation",
      onboard: "process.conciergerie.operations.gerer-annonces-reservations-et-calendrier",
      operate: "process.conciergerie.operations.organiser-preparation-arrivees-et-departs",
      incident: "process.conciergerie.operations.traiter-maintenance-et-incidents-voyageurs",
      replace: "process.conciergerie.equipe.organiser-equipes-terrain-et-remplacements",
      profitability: "process.conciergerie.finance-admin.suivre-revenus-commissions-et-frais",
      cash: "process.conciergerie.finance-admin.se-faire-payer",
      compliance: "process.conciergerie.conformite-metier.tenir-reglements-acces-et-justificatifs-en-regle",
    },
    growthPriorities: "biens rentables dans des zones denses, propriétaires multi-biens, qualité élevée et saisonnalité maîtrisée",
    delegatedDecisions: "réparation urgente sous plafond, relogement selon procédure, geste voyageur plafonné, renfort ménage et blocage temporaire du calendrier",
    visibilityRisks: "arrivée du jour, ménage non validé, clé ou accès, double réservation, incident, avis négatif, maintenance, stock et obligation locale non confirmée",
    acquisitionFrame: "prescripteurs propriétaires, audit de rentabilité et d’exploitabilité, visite, proposition de service et preuve de qualité opérationnelle",
    qualificationFrame: "adresse, droit du propriétaire, règlement de copropriété, règles municipales, déclaration ou enregistrement, autorisation applicable, capacité, accès, équipements et saisonnalité",
    complaintEvidence: "bien, réservation, voyageur, messages de plateforme, horaires, photos utiles, passage terrain, dépense, solution et réponse publique éventuelle",
    onboardingFrame: "contrat de service, identité du propriétaire, preuve du droit d’exploiter, règles locales, annonce, calendrier, tarifs, accès, inventaire, photos, équipements et contacts",
    intakeChecks: "déclaration ou numéro d’enregistrement applicable, autorisation locale éventuelle, règlement de copropriété, assurance, capacité, sécurité, taxe de séjour, données publiées et procédures d’urgence",
    operatingStandard: "planning des arrivées et départs, ménage, linge, consommables, contrôle qualité, accès, message voyageur et signalement d’anomalie",
    operatingTrace: "réservation, horaires, intervenant, checklist, photos utiles, stock, clé ou code, anomalie, message et validation avant arrivée",
    incidentFrame: "urgence voyageur, panne, dégât, nuisance, accès impossible, ménage non conforme, prestataire, propriétaire, plateforme, assurance et solution de continuité",
    replacementChecks: "planning, zones, accès individuels, checklists, stocks, incidents, prestataires, langues utiles et procédure d’escalade",
    marginRisks: "turnover court, déplacement, linge, consommables, urgence, geste commercial, relogement, saison basse et intervention supplémentaire",
    billingProof: "contrat, réservations ou période, revenus de référence, commission, forfaits, prestations additionnelles, dépenses validées et compte rendu propriétaire",
    complianceFrame: "mandat ou contrat, déclaration et enregistrement applicables, autorisation municipale éventuelle, règlement de copropriété, taxe de séjour, information voyageur, accès, données et justificatifs",
  },
} satisfies Record<string, PropertyOperationsProfile>;
