import {
  composeProcessDraft,
  type IndustrializedContentItem,
  type IndustrializedProcessDefinition,
  type ProcessContentPatch,
  type ProcessDraft,
} from "@/lib/process-industrialization";

export type InvestmentRole =
  | "compliance"
  | "decisions"
  | "access"
  | "strategy"
  | "team"
  | "collections"
  | "finance"
  | "sourcing"
  | "complaints"
  | "analysis"
  | "reporting"
  | "tracking";

export type InvestmentProfile = {
  slug: "investissement-entreprise" | "investissement-financier";
  name: string;
  sourceUrl: string;
  researchSources: readonly string[];
  complianceFrame: string;
  entryFrame: string;
  decisionFrame: string;
  accessFrame: string;
  strategyFrame: string;
  teamFrame: string;
  collectionFrame: string;
  financeFrame: string;
  sourcingFrame: string;
  complaintFrame: string;
  analysisFrame: string;
  verificationFrame: string;
  reportingFrame: string;
  performanceFrame: string;
  trackingFrame: string;
  boundaryFrame: string;
};

const processByRole: Record<InvestmentRole, string> = {
  compliance:
    "process.investissement-financier.conformite-metier.securiser-conformite-et-documentation",
  decisions:
    "process.investissement-financier.direction.decider-sans-bloquer-les-arbitrages",
  access:
    "process.investissement-financier.direction.donner-acces-a-lessentiel",
  strategy:
    "process.investissement-financier.direction.savoir-ou-va-le-portefeuille",
  team:
    "process.investissement-financier.equipe.organiser-analyses-et-remplacements",
  collections:
    "process.investissement-financier.finance-admin.se-faire-payer",
  finance:
    "process.investissement-financier.finance-admin.suivre-encours-frais-et-revenus",
  sourcing:
    "process.investissement-financier.marketing-vente.sourcer-opportunites-et-investisseurs",
  complaints:
    "process.investissement-financier.marketing-vente.traiter-une-reclamation-investisseur-ou-partenaire",
  analysis:
    "process.investissement-financier.operations.analyser-risque-allocation-ou-due-diligence",
  reporting:
    "process.investissement-financier.operations.piloter-reporting-et-performance",
  tracking:
    "process.investissement-financier.operations.suivre-decisions-dinvestissement",
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
  InvestmentRole,
  IndustrializedProcessDefinition
> = {
  compliance: def(
    "Conserver les autorisations, contrôles et documents qui permettent de justifier chaque activité et chaque engagement.",
    "Entrée en relation, nouvelle opération, changement réglementaire, contrôle ou échéance.",
    "Un dossier complet, daté, approuvé et retrouvable.",
    "Référent conformité",
    "Mensuelle",
  ),
  decisions: def(
    "Arbitrer une opportunité ou un risque sans perdre les faits, les limites ni les validations.",
    "Écart de risque, donnée manquante, conflit, changement de valeur ou décision urgente.",
    "Une décision attribuée, motivée, limitée et tracée.",
    "Responsable investissement",
    "À chaque arbitrage",
  ),
  access: def(
    "Donner accès aux données sensibles uniquement aux personnes qui en ont besoin.",
    "Arrivée, départ, mandat, opération ou changement d’outil.",
    "Des droits nominatifs, limités et retirés à temps.",
    "Dirigeant",
    "Mensuelle",
  ),
  strategy: def(
    "Maintenir un portefeuille cohérent avec le mandat, les moyens, les risques et l’horizon retenus.",
    "Revue du portefeuille, nouvelle opportunité ou changement majeur.",
    "Des priorités explicites et des limites mesurables.",
    "Dirigeant",
    "Mensuelle",
  ),
  team: def(
    "Affecter chaque analyse à une personne compétente avec un relais identifié.",
    "Nouvelle opération, absence, surcharge ou besoin d’expertise.",
    "Une couverture claire des analyses, validations et échéances.",
    "Responsable investissement",
    "Hebdomadaire",
  ),
  collections: def(
    "Encaisser les sommes dues avec une origine, un calcul et une échéance vérifiables.",
    "Échéance, avis de paiement, retard, contestation ou rapprochement.",
    "Un encaissement rapproché ou une anomalie attribuée.",
    "Responsable administratif",
    "Hebdomadaire",
  ),
  finance: def(
    "Expliquer les encours, flux, frais, revenus et engagements du portefeuille.",
    "Clôture, mouvement, facture, valorisation ou revue de trésorerie.",
    "Une vision financière rapprochée et utilisable pour décider.",
    "Responsable financier",
    "Mensuelle",
  ),
  sourcing: def(
    "Qualifier les opportunités et relations utiles avant de mobiliser l’équipe.",
    "Nouveau contact, recommandation, partenaire ou opportunité.",
    "Un flux priorisé avec origine, critères et prochaine action.",
    "Responsable développement",
    "Hebdomadaire",
  ),
  complaints: def(
    "Traiter toute contestation à partir du mandat, des faits et des preuves conservées.",
    "Réclamation, désaccord, incident d’information ou conflit.",
    "Une réponse écrite, une correction et une prévention tracées.",
    "Référent conformité",
    "À chaque réclamation",
  ),
  analysis: def(
    "Vérifier les faits, les risques, les coûts et les scénarios avant toute recommandation ou décision.",
    "Nouvelle opportunité, changement important ou revue périodique.",
    "Une analyse sourcée avec hypothèses, limites et recommandation.",
    "Analyste responsable",
    "À chaque analyse",
  ),
  reporting: def(
    "Mesurer la performance et les risques sans masquer les flux, coûts ni hypothèses.",
    "Clôture, comité, revue client ou événement significatif.",
    "Un reporting cohérent, explicable et rapproché.",
    "Responsable investissement",
    "Mensuelle",
  ),
  tracking: def(
    "Faire avancer chaque décision jusqu’à sa réalisation ou son abandon documenté.",
    "Validation, signature, condition, mouvement ou action de suivi.",
    "Un statut fiable, une prochaine action et un responsable.",
    "Responsable investissement",
    "Hebdomadaire",
  ),
};

const contentByRole: Record<InvestmentRole, IndustrializedContentItem[]> = {
  compliance: [
    item("implementation_action", "Cartographier activités, entités, mandats, délégations, obligations, responsables, registres, assurances et échéances de contrôle"),
    item("operational_step", "Ouvrir chaque relation ou opération avec identité, qualité des parties, objet, périmètre, documents attendus, validations et date de revue"),
    item("operational_step", "Identifier les conflits d’intérêts, liens capitalistiques, rémunérations, avantages et restrictions avant toute décision"),
    item("implementation_action", "Classer contrats, accords, rapports, décisions, preuves d’information, signatures et versions dans un dossier horodaté"),
    item("recurring_control", "Contrôler chaque mois échéances, dossiers incomplets, validations manquantes, conflits ouverts et actions correctives"),
    item("operating_rule", "Ne jamais présenter une activité, un engagement ou une autorisation au-delà du périmètre effectivement détenu et documenté"),
  ],
  decisions: [
    item("implementation_action", "Écrire la matrice d’arbitrage avec nature du risque, seuil, mesure conservatoire, décideur, délai et preuve attendue"),
    item("operational_step", "Qualifier l’écart en distinguant donnée manquante, risque, coût, liquidité, valorisation, conflit, conformité, financement ou exécution"),
    item("operational_step", "Réunir faits, source, hypothèse, scénario central, scénario défavorable, exposition maximale et options de sortie"),
    item("operational_step", "Décider poursuite, condition, réduction, suspension, escalade ou abandon avec motif et responsable"),
    item("recurring_control", "Revoir chaque semaine décisions en attente, conditions non levées, risques ouverts et délais dépassés"),
    item("operating_rule", "Ne pas transformer une hypothèse, une promesse ou une information non vérifiée en fait acquis"),
  ],
  access: [
    item("implementation_action", "Tenir le registre des accès aux dossiers, signatures, comptes, mouvements, contrats, reportings, messageries et outils administrateurs"),
    item("operational_step", "Attribuer un compte nominatif limité au mandat, aux dossiers et aux fonctions nécessaires"),
    item("operational_step", "Protéger les exports, pièces d’identité, données financières, accords confidentiels et documents de décision"),
    item("operational_step", "Retirer les droits le jour d’un départ, d’une fin de mandat ou d’un changement de rôle"),
    item("recurring_control", "Tester chaque mois droits, double authentification, sauvegardes, journaux et récupération des comptes"),
    item("operating_rule", "Ne pas partager un dossier sensible par un compte personnel, un lien public ou un accès collectif non traçable"),
  ],
  strategy: [
    item("implementation_action", "Définir mandat, univers, exclusions, horizon, liquidité, rendement attendu, perte acceptable, concentration et besoins de trésorerie"),
    item("implementation_action", "Fixer objectifs de sourcing, analyses, décisions, déploiement, suivi, revenus, risques et sorties"),
    item("operational_step", "Comparer chaque opportunité au mandat, à la capacité d’analyse, aux expositions existantes et aux contraintes de liquidité"),
    item("recurring_control", "Comparer chaque mois allocation réelle, concentration, risques, engagements, réserves et marge de manœuvre"),
    item("recurring_control", "Réviser chaque trimestre hypothèses de marché, scénarios défavorables, priorités et limites"),
    item("operating_rule", "Ne pas poursuivre une opportunité hors mandat sans décision explicite, analyse des conséquences et autorisation nécessaire"),
  ],
  team: [
    item("implementation_action", "Cartographier analystes, décideurs, signataires, experts, compétences, indépendance, disponibilités et remplaçants"),
    item("operational_step", "Affecter un responsable, un relecteur, les expertises nécessaires, les livrables et les échéances à chaque dossier"),
    item("operational_step", "Transmettre faits connus, documents, hypothèses, points bloquants, confidentialité et format de conclusion attendu"),
    item("operational_step", "Organiser un relais avec accès, historique, prochaines actions et limites de décision en cas d’absence"),
    item("recurring_control", "Contrôler chaque semaine charge, conflits, dossiers sans relecture, compétences manquantes et échéances à risque"),
    item("operating_rule", "Ne pas confier une analyse ou une validation à une personne qui n’a ni la compétence, ni l’indépendance, ni les informations nécessaires"),
  ],
  collections: [
    item("implementation_action", "Tenir l’échéancier des revenus attendus avec origine contractuelle, base de calcul, justificatif, débiteur, compte et date"),
    item("operational_step", "Émettre ou collecter l’avis nécessaire avec période, montant, taxe, coordonnées bancaires et référence du contrat"),
    item("operational_step", "Rapprocher chaque encaissement avec l’échéance, le relevé, la pièce, l’entité et le traitement comptable"),
    item("operational_step", "Relancer un retard avec montant, preuve, historique, interlocuteur et prochaine date"),
    item("recurring_control", "Contrôler chaque semaine sommes attendues, reçues, partielles, contestées, annulées et non affectées"),
    item("operating_rule", "Ne pas réclamer, percevoir ou conserver une somme dont la nature, le bénéficiaire et le fondement ne sont pas documentés"),
  ],
  finance: [
    item("implementation_action", "Construire le suivi financier avec positions, engagements, appels, décaissements, encaissements, frais, revenus, réserves et trésorerie"),
    item("operational_step", "Rapprocher chaque mouvement avec ordre, contrat, relevé, date de valeur, montant, devise, frais et contrepartie"),
    item("operational_step", "Expliquer les écarts entre prévision, engagement, mouvement réalisé, comptabilité et reporting"),
    item("recurring_control", "Contrôler chaque mois encours, flux, frais, revenus, engagements résiduels, trésorerie et pièces manquantes"),
    item("recurring_control", "Calculer les revenus et coûts par activité, dossier ou relation sans mélanger flux bruts et marge"),
    item("operating_rule", "Ne pas présenter un revenu, un encours ou une disponibilité tant que le mouvement et son traitement ne sont pas rapprochés"),
  ],
  sourcing: [
    item("implementation_action", "Définir sources, partenaires, critères d’entrée, informations minimales, motif de refus et responsable de qualification"),
    item("operational_step", "Enregistrer origine, interlocuteur, besoin ou opportunité, montant, calendrier, documents disponibles et prochaine action"),
    item("operational_step", "Qualifier l’adéquation au mandat avant de demander des documents sensibles ou de mobiliser un expert"),
    item("operational_step", "Refuser ou mettre en attente avec motif clair lorsque le périmètre, les données ou la disponibilité ne conviennent pas"),
    item("recurring_control", "Mesurer chaque semaine opportunités reçues, qualifiées, analysées, refusées, décidées et réalisées par source"),
    item("operating_rule", "Ne pas rémunérer, promouvoir ou privilégier une source sans cadre, transparence et contrôle du conflit d’intérêts"),
  ],
  complaints: [
    item("implementation_action", "Tenir le registre des réclamations avec partie, relation, objet, faits, impact, pièces, accusé, responsable, réponse et correction"),
    item("operational_step", "Accuser réception, sécuriser la situation, préserver les preuves et annoncer le canal et le délai de traitement"),
    item("operational_step", "Comparer la demande aux documents, décisions, informations transmises, coûts, flux, signatures et événements"),
    item("operational_step", "Répondre par écrit avec faits retenus, position, action, recours ou interlocuteur et date de suivi"),
    item("recurring_control", "Analyser chaque mois causes, délais, montants, récurrences, partenaires concernés et actions préventives"),
    item("operating_rule", "Ne pas supprimer, réécrire ou antidater un élément utile au traitement d’une contestation"),
  ],
  analysis: [
    item("implementation_action", "Définir la grille d’analyse avec périmètre, documents, critères, méthodes, seuils, scénarios, experts et décision attendue"),
    item("operational_step", "Vérifier identité, capacité, droits, détention, objectifs, contraintes, horizon, liquidité et conflits pertinents"),
    item("operational_step", "Analyser données financières, risques, coûts, conditions, dépendances, concentration, liquidité et scénarios défavorables"),
    item("operational_step", "Tester les hypothèses sensibles avec source, date, méthode, scénario central, scénario dégradé et seuil de rupture"),
    item("operational_step", "Lister éléments confirmés, non confirmés, incohérences, réserves, conditions et expertises complémentaires"),
    item("recurring_control", "Faire relire calculs, sources, limites, recommandation et conclusion par une personne identifiée"),
    item("operating_rule", "Ne pas conclure avant d’avoir distingué les documents reçus, les faits vérifiés, les estimations et les informations manquantes"),
  ],
  reporting: [
    item("implementation_action", "Construire un reporting avec périmètre, positions, flux, valorisations, risques, coûts, événements, décisions et source de chaque chiffre"),
    item("operational_step", "Rapprocher les données du reporting avec comptes, relevés, contrats, mouvements et reportings sous-jacents"),
    item("operational_step", "Calculer la performance avec méthode, période, apports, retraits, frais, revenus, valorisation et comparaison pertinente"),
    item("operational_step", "Expliquer séparément performance, flux, évolution de valeur, coûts, change, concentration et événements exceptionnels"),
    item("operational_step", "Mettre en évidence écarts au mandat, seuils franchis, hypothèses anciennes et décisions attendues"),
    item("recurring_control", "Contrôler cohérence, date, périmètre, doublons, signes, unités, sources et commentaires avant diffusion"),
    item("operating_rule", "Ne pas agréger des performances ou valorisations calculées sur des périmètres, dates ou méthodes incompatibles"),
  ],
  tracking: [
    item("implementation_action", "Tenir le registre des décisions avec dossier, recommandation, décideur, date, conditions, montant, pièces, statut et prochaine action"),
    item("operational_step", "Passer chaque dossier par les statuts qualifié, analysé, relu, décidé, conditionné, signé, réalisé, suivi ou abandonné"),
    item("operational_step", "Attribuer chaque condition ou action à une personne avec preuve attendue et échéance"),
    item("operational_step", "Rapprocher décision, documents signés, mouvement réel et position enregistrée avant de fermer l’exécution"),
    item("recurring_control", "Revoir chaque semaine signatures, conditions, mouvements, actions, échéances et écarts entre décision et réalisation"),
    item("operating_rule", "Suspendre l’engagement lorsque les validations, conditions, documents ou pouvoirs nécessaires ne sont pas réunis"),
  ],
};

const buildCoreDraft = (): ProcessDraft => ({
  definitionsById: Object.fromEntries(
    Object.entries(processByRole).map(([role, id]) => [
      id,
      definitionsByRole[role as InvestmentRole],
    ]),
  ),
  contentByProcessId: Object.fromEntries(
    Object.entries(processByRole).map(([role, id]) => [
      id,
      contentByRole[role as InvestmentRole],
    ]),
  ),
});

const patch = (
  role: InvestmentRole,
  contentIndex: number,
  label: string,
): ProcessContentPatch => ({
  processId: processByRole[role],
  contentIndex,
  label,
});

const profilePatches = (
  profile: InvestmentProfile,
): readonly ProcessContentPatch[] => [
  patch("compliance", 0, `Sécuriser le cadre applicable : ${profile.complianceFrame}`),
  patch("compliance", 1, `Ouvrir le dossier avec : ${profile.entryFrame}`),
  patch("decisions", 1, `Qualifier immédiatement : ${profile.decisionFrame}`),
  patch("access", 0, `Tenir les accès critiques : ${profile.accessFrame}`),
  patch("strategy", 0, `Définir le mandat et les limites : ${profile.strategyFrame}`),
  patch("team", 0, `Organiser les analyses et relais avec : ${profile.teamFrame}`),
  patch("collections", 0, `Suivre les sommes dues au titre de : ${profile.collectionFrame}`),
  patch("finance", 0, `Piloter les flux et engagements de : ${profile.financeFrame}`),
  patch("sourcing", 0, `Qualifier les relations et opportunités venant de : ${profile.sourcingFrame}`),
  patch("complaints", 0, `Tracer les contestations portant sur : ${profile.complaintFrame}`),
  patch("analysis", 0, `Construire l’analyse avec : ${profile.analysisFrame}`),
  patch("analysis", 2, `Vérifier concrètement : ${profile.verificationFrame}`),
  patch("reporting", 0, `Construire le reporting autour de : ${profile.reportingFrame}`),
  patch("reporting", 2, `Calculer et expliquer : ${profile.performanceFrame}`),
  patch("tracking", 0, `Suivre de bout en bout : ${profile.trackingFrame}`),
  patch("tracking", 5, `Fixer la limite d’engagement : ${profile.boundaryFrame}`),
];

export const generateInvestmentCoreDraft = () => buildCoreDraft();

export const generateInvestmentDraft = (profile: InvestmentProfile) =>
  composeProcessDraft(buildCoreDraft(), [
    {
      id: `metier.${profile.slug}`,
      contentPatches: profilePatches(profile),
    },
  ]);

export const investmentProfiles = {
  "investissement-entreprise": {
    slug: "investissement-entreprise",
    name: "Investissement entreprise",
    sourceUrl:
      "https://docs.google.com/spreadsheets/d/1Zsi4S9eEBuwfVxM_EgcDLAxykFo3FkRnDg5lNr1ij8U/edit",
    researchSources: [
      "https://bpifrance-creation.fr/entrepreneur/temoignage-invite/reprise-dentreprise-lettre-dintention",
      "https://bpifrance-creation.fr/moments-de-vie/audit-dacquisition-a-quoi-sert-lettre-dintention",
      "https://bpifrance-creation.fr/moment-de-vie/reprise-dentreprise-quest-ce-que-garantie-dactif-passif",
      "https://bpifrance-creation.fr/encyclopedie/reprendre-entreprise-etapes/negocier-conclure/protocole-daccord-reprise-dentreprise",
      "https://bpifrance-creation.fr/encyclopedie/reprendre-entreprise-etapes/negocier-conclure/negocier-cedant-conclure-loperation",
    ],
    complianceFrame: "véhicule d’investissement, statuts, pouvoirs, délégations, conflits, confidentialité, autorisations, financement, approbations et documents de transaction",
    entryFrame: "NDA signé, identité et pouvoirs des parties, cap table, comptes, contrats, fiscalité, social, litiges, autorisations et data room structurée",
    decisionFrame: "écart à la thèse, données incohérentes, valorisation, financement, condition suspensive, conflit, risque réglementaire ou dépendance critique",
    accessFrame: "deal room, data room, cap table, banque, modèles financiers, documents de comité, pactes, reportings de participations et comptes administrateurs",
    strategyFrame: "secteurs, taille, stade, ticket, géographie, contrôle ou minoritaire, durée de détention, rendement, perte maximale, concentration et réserve de suivi",
    teamFrame: "deal lead, comité, signataires, juriste, fiscaliste, expert financier, social, commercial, opérationnel, IT et relais désignés",
    collectionFrame: "dividendes, remboursement et intérêts de compte courant, management fees prévus au contrat, produit de cession et complément de prix",
    financeFrame: "capital engagé, montants déployés, réserves, follow-on, frais, valorisations, dette nette, distributions, trésorerie et exposition par participation",
    sourcingFrame: "dirigeants, cédants, conseils M&A, banques, experts-comptables, avocats, fonds, réseaux professionnels et associés",
    complaintFrame: "droits d’information, gouvernance, confidentialité, engagements, pacte, calendrier, conflit, paiement ou exécution d’une décision",
    analysisFrame: "thèse, modèle économique, marché, équipe, comptes, dette, fiscalité, social, juridique, contrats, opérations, IT, valorisation et plan de création de valeur",
    verificationFrame: "documents sources, pont entre comptes et modèle, qualité du chiffre et de la marge, BFR, dette nette, cap table, contrats clés, litiges et scénarios central et défavorable",
    reportingFrame: "KPI opérationnels, chiffre, marge, trésorerie, runway, budget-réel, dette, covenants, gouvernance, risques et plan d’actions de chaque participation",
    performanceFrame: "valeur d’entrée, apports, distributions, dilution, dette nette, méthode de valorisation, multiple, rendement et scénarios de sortie",
    trackingFrame: "NDA, data room, lettre d’intention, due diligence, note d’investissement, comité, conditions suspensives, pacte, financement, closing et actions post-closing",
    boundaryFrame: "aucun engagement avant pouvoirs, comité, financement, conditions, documents juridiques et signatures requis",
  },
  "investissement-financier": {
    slug: "investissement-financier",
    name: "Investissement financier",
    sourceUrl:
      "https://docs.google.com/spreadsheets/d/1Hg3ITz6FJ48Ux9t79acME_wCoZC2gVMqHGGq4hbHGpY/edit",
    researchSources: [
      "https://www.amf-france.org/fr/quelles-sont-les-obligations-du-cif-envers-son-client",
      "https://www.amf-france.org/fr/espace-epargnants/savoir-bien-investir/choisir-un-professionnel/conseillers-en-investissements-financiers",
      "https://www.amf-france.org/fr/eli/fr/aai/amf/rg/20260101/notes",
      "https://www.amf-france.org/fr/eli/fr/aai/amf/rg/livre/3/titre/1_1/chapitre/4/section/1/sous-section/2/notes",
      "https://www.amf-france.org/fr/actualites-publications/actualites/lamf-instaure-une-nouvelle-methodologie-de-controle-sur-pieces-des-conseillers-en-investissements",
      "https://www.orias.fr/static/communications/rapports/Rapport_annuel_2024.pdf",
    ],
    complianceFrame: "statut CIF et activités réellement autorisées, immatriculation ORIAS, association professionnelle, RCP, compétences, conventions partenaires, conflits, rémunérations et réclamations",
    entryFrame: "information sur le statut, identité et KYC, situation financière, connaissances, expérience, objectifs, horizon, risque, préférences de durabilité applicables et lettre de mission",
    decisionFrame: "information client manquante, produit inadéquat, concentration, illiquidité, coûts, conflit, anomalie partenaire, ordre non confirmé ou changement de situation",
    accessFrame: "CRM, KYC, agrégation patrimoniale, plateformes partenaires, signature électronique, documents produits, reportings clients et comptes administrateurs",
    strategyFrame: "segments clients, activités autorisées, univers de produits et partenaires, modèle d’honoraires, capacité de suivi, risque, liquidité et conformité",
    teamFrame: "statut, compétences vérifiées, habilitations, portefeuilles clients, contrôles, supervision, absences et relais autorisés",
    collectionFrame: "honoraires prévus par lettre de mission et facture, rémunérations partenaires et rétrocommissions prévues par convention, relevés, corrections et reprises",
    financeFrame: "encours conseillés, souscriptions, rachats, apports, retraits, honoraires, frais produits, rémunérations partenaires, coûts internes et marge",
    sourcingFrame: "clients, recommandations, prescripteurs, partenaires, experts-comptables, avocats, réseaux professionnels et demandes entrantes qualifiées",
    complaintFrame: "adéquation du conseil, information, coûts, performance attendue, souscription, exécution, délai, partenaire, confidentialité ou suivi",
    analysisFrame: "connaissance client, situation financière, objectifs, horizon, risque, liquidité, capacité de perte, expérience, durabilité applicable et univers autorisé",
    verificationFrame: "informations client à jour, documentation produit, risques, liquidité, frais et rémunérations, conflits, diversification, scénario défavorable et adéquation",
    reportingFrame: "portefeuille client, allocation, mouvements, risque, liquidité, concentration, coûts, performance, recommandations et actions à suivre",
    performanceFrame: "apports, retraits, revenus, variation de valeur, frais, période, méthode, performance nette, risque et comparaison cohérente",
    trackingFrame: "lettre de mission, KYC, analyse, déclaration d’adéquation écrite, accord client, signature, souscription, confirmation partenaire, mouvement réel et revue périodique",
    boundaryFrame: "aucun conseil sans informations suffisantes ni hors statut ; aucun ordre ou maniement de fonds au-delà des activités expressément permises",
  },
} satisfies Record<string, InvestmentProfile>;
