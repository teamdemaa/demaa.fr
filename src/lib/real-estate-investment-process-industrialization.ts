import {
  composeProcessDraft,
  type IndustrializedContentItem,
  type IndustrializedProcessDefinition,
  type ProcessContentPatch,
  type ProcessDraft,
} from "@/lib/process-industrialization";

export type RealEstateInvestmentRole =
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
  | "portfolio"
  | "project";

export type RealEstateInvestmentProfile = {
  slug:
    | "marchand-de-biens"
    | "investissement-locatif"
    | "investissement-immobilier";
  name: string;
  sourceUrl: string;
  researchSources: readonly string[];
  strategicFocus: string;
  performanceFrame: string;
  decisionFrame: string;
  accessFrame: string;
  partnerFrame: string;
  collectionFrame: string;
  treasuryFrame: string;
  profitabilityFrame: string;
  sourcingFrame: string;
  qualificationFrame: string;
  complaintFrame: string;
  analysisFrame: string;
  diligenceFrame: string;
  projectFrame: string;
  operatingFrame: string;
  complianceFrame: string;
};

const processByRole: Record<RealEstateInvestmentRole, string> = {
  compliance:
    "process.investissement-immobilier.conformite-metier.tenir-les-pieces-actes-et-diagnostics-en-regle",
  decisions:
    "process.investissement-immobilier.direction.decider-sans-bloquer-les-arbitrages",
  access:
    "process.investissement-immobilier.direction.donner-acces-a-lessentiel",
  strategy:
    "process.investissement-immobilier.direction.savoir-ou-va-le-portefeuille",
  team:
    "process.investissement-immobilier.equipe.organiser-partenaires-et-remplacements",
  collections:
    "process.investissement-immobilier.finance-admin.se-faire-payer",
  finance:
    "process.investissement-immobilier.finance-admin.suivre-tresorerie-rendement-et-marge",
  sourcing:
    "process.investissement-immobilier.marketing-vente.sourcer-des-opportunites",
  complaints:
    "process.investissement-immobilier.marketing-vente.traiter-un-litige-ou-une-reclamation",
  analysis:
    "process.investissement-immobilier.operations.analyser-la-rentabilite-et-le-montage",
  portfolio:
    "process.investissement-immobilier.operations.piloter-exploitation-revente-ou-arbitrage",
  project:
    "process.investissement-immobilier.operations.suivre-acquisition-travaux-ou-mise-en-location",
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
  RealEstateInvestmentRole,
  IndustrializedProcessDefinition
> = {
  compliance: def("Maintenir les actes, diagnostics, déclarations et preuves à jour.", "Acquisition, travaux, exploitation, location ou cession.", "Un dossier conforme et vérifiable par actif.", "Responsable administratif", "Mensuelle"),
  decisions: def("Arbitrer rapidement sans dépasser les pouvoirs ni le risque accepté.", "Offre, dépassement, incident ou changement d’hypothèse.", "Une décision chiffrée, datée et communiquée.", "Dirigeant", "À chaque arbitrage"),
  access: def("Partager l’essentiel sans exposer inutilement les données sensibles.", "Ouverture de projet, nouvel intervenant ou remplacement.", "Des accès nominatifs, utiles et révocables.", "Responsable de projet", "À chaque changement"),
  strategy: def("Orienter le portefeuille selon les objectifs et la capacité financière.", "Revue mensuelle ou nouvelle opportunité.", "Des investissements cohérents entre eux et finançables.", "Dirigeant", "Mensuelle"),
  team: def("Coordonner partenaires et relais avec des responsabilités explicites.", "Nouveau projet, absence ou changement d’intervenant.", "Chaque action possède un responsable et un remplaçant.", "Responsable de projet", "Hebdomadaire"),
  collections: def("Encaisser chaque somme attendue et traiter immédiatement les écarts.", "Échéance, appel de fonds, facture ou cession.", "Des encaissements rapprochés et des retards suivis.", "Responsable administratif", "Hebdomadaire"),
  finance: def("Piloter trésorerie, rendement et marge à partir des flux réels.", "Clôture mensuelle ou dérive budgétaire.", "Une visibilité fiable sur le besoin de cash et la performance.", "Dirigeant", "Mensuelle"),
  sourcing: def("Détecter et qualifier des opportunités compatibles avec la stratégie.", "Prospection ou opportunité entrante.", "Un pipeline priorisé avec prochaine action.", "Responsable acquisition", "Hebdomadaire"),
  complaints: def("Traiter les litiges à partir des faits, contrats et responsabilités.", "Réclamation, désordre, retard ou désaccord.", "Une réponse, une correction et une clôture tracées.", "Responsable de projet", "À chaque litige"),
  analysis: def("Tester la rentabilité et le montage avant tout engagement.", "Nouvelle opportunité ou hypothèse modifiée.", "Une décision fondée sur plusieurs scénarios réalistes.", "Responsable investissement", "À chaque opportunité"),
  portfolio: def("Piloter chaque actif jusqu’à conservation, revente ou arbitrage.", "Revue d’actif ou événement significatif.", "Une action décidée sur chaque actif sous-performant.", "Asset manager", "Mensuelle"),
  project: def("Suivre acquisition, travaux et mise en exploitation sans perdre les dépendances.", "Offre acceptée ou projet lancé.", "Un projet livré avec coûts, délais et réserves maîtrisés.", "Responsable de projet", "Hebdomadaire"),
};

const contentByRole: Record<
  RealEstateInvestmentRole,
  IndustrializedContentItem[]
> = {
  compliance: [
    item("implementation_action", "Créer une checklist par actif avec acte, identité, financement, urbanisme, copropriété, assurances, diagnostics, fiscalité et échéances"),
    item("implementation_action", "Tenir un calendrier des déclarations, taxes, assurances, diagnostics, contrôles, autorisations et renouvellements"),
    item("operational_step", "Vérifier avant engagement la propriété, les pouvoirs, les servitudes, l’urbanisme, l’occupation et les restrictions connues"),
    item("operational_step", "Classer chaque pièce avec source, date, validité, contrôle réalisé et personne responsable"),
    item("recurring_control", "Contrôler chaque mois les pièces expirées, manquantes, contradictoires ou non rattachées à un actif"),
    item("recurring_control", "Faire valider par le professionnel compétent toute hypothèse juridique, fiscale ou technique déterminante"),
    item("operating_rule", "Suspendre signature, travaux, location ou cession lorsqu’une condition obligatoire reste non vérifiée"),
  ],
  decisions: [
    item("implementation_action", "Définir les décisions délégables avec seuil de prix, budget, délai, rendement, preuve et signataire"),
    item("operational_step", "Qualifier l’arbitrage : offre, financement, travaux, conformité, exploitation, trésorerie ou sortie"),
    item("operational_step", "Comparer scénario prévu, scénario révisé, coût d’attente et option de repli"),
    item("operational_step", "Tracer décision, hypothèses, auteur, conditions, échéance et prochaine vérification"),
    item("recurring_control", "Revoir chaque semaine les décisions en attente qui bloquent une signature, un chantier ou un encaissement"),
    item("operating_rule", "Ne jamais engager une dépense, une offre ou une garantie au-delà des pouvoirs et seuils documentés"),
  ],
  access: [
    item("implementation_action", "Définir les droits par rôle sur pièces d’identité, banque, actes, devis, locataires, acquéreurs et fiscalité"),
    item("operational_step", "Créer un dossier unique par actif avec responsable, statut, budget, risques, prochaine action et échéance"),
    item("operational_step", "Donner aux partenaires uniquement les pièces utiles via un accès nominatif et révocable"),
    item("recurring_control", "Retirer les accès des intervenants sortants et contrôler les comptes partagés ou inactifs"),
    item("operating_rule", "Ne pas transmettre une pièce sensible par un canal non approuvé ou sans destinataire vérifié"),
  ],
  strategy: [
    item("implementation_action", "Choisir zones, actifs, enveloppes, niveaux de risque, horizons, modes d’exploitation et sorties prioritaires"),
    item("implementation_action", "Fixer les limites de concentration, endettement, travaux, vacance, durée et trésorerie minimale"),
    item("operational_step", "Classer les actifs et opportunités par rendement, risque, liquidité, charge de gestion et potentiel de création de valeur"),
    item("recurring_control", "Comparer chaque mois acquisitions, valeur, dette, cash, rendement, marge, vacance, travaux et sorties"),
    item("recurring_control", "Tester l’exposition à une baisse de prix, une hausse de coût, un retard, une vacance ou un refinancement plus cher"),
    item("operating_rule", "Refuser une nouvelle opération si elle rend le portefeuille dépendant d’une hypothèse unique ou d’un cash non sécurisé"),
  ],
  team: [
    item("implementation_action", "Tenir une matrice des notaires, courtiers, banques, artisans, maîtres d’œuvre, gestionnaires, experts et relais"),
    item("operational_step", "Attribuer chaque action avec livrable, budget, délai, accès, validation et remplaçant"),
    item("operational_step", "Vérifier assurance, qualification, indépendance et périmètre avant de confier une mission critique"),
    item("recurring_control", "Faire une revue hebdomadaire des retards, dépendances, absences, validations et partenaires sans réponse"),
    item("operating_rule", "Ne pas confondre conseil, validation technique et décision d’investissement dans la répartition des responsabilités"),
  ],
  collections: [
    item("implementation_action", "Créer l’échéancier par actif avec débiteur, montant, justificatif, date, compte bancaire et relance"),
    item("operational_step", "Émettre ou collecter l’avis, la facture, l’appel ou le décompte correspondant à la somme attendue"),
    item("operational_step", "Rapprocher chaque encaissement avec actif, période, tiers, facture ou acte"),
    item("operational_step", "Qualifier immédiatement retard, paiement partiel, retenue, contestation ou erreur d’affectation"),
    item("recurring_control", "Relancer selon une séquence datée avec responsable, prochain contact et voie d’escalade"),
    item("operating_rule", "Ne pas considérer une somme comme acquise avant son encaissement et son rapprochement effectif"),
  ],
  finance: [
    item("implementation_action", "Construire un plan de trésorerie par actif avec acquisition, dette, travaux, charges, recettes, fiscalité et sortie"),
    item("implementation_action", "Séparer budget engagé, commandé, facturé, payé, restant à engager et provision pour aléas"),
    item("operational_step", "Imputer chaque flux au bon actif, poste, phase et régime comptable ou fiscal validé"),
    item("recurring_control", "Rapprocher chaque semaine banque, échéances de dette, factures, encaissements et appels de fonds"),
    item("recurring_control", "Recalculer chaque mois rendement brut, rendement net, cash-flow, marge, dette et trésorerie disponible"),
    item("operational_step", "Expliquer chaque écart par prix, délai, vacance, travaux, financement, charge ou fiscalité"),
    item("operating_rule", "Conserver une réserve de trésorerie distincte des recettes futures non sécurisées"),
  ],
  sourcing: [
    item("implementation_action", "Définir les canaux, zones, critères d’entrée, informations minimales et délai de réponse"),
    item("operational_step", "Enregistrer chaque opportunité avec source, vendeur, adresse, prix, situation, occupation et prochaine action"),
    item("operational_step", "Écarter rapidement les dossiers hors stratégie, incomplets, non finançables ou incompatibles avec le risque accepté"),
    item("operational_step", "Qualifier vendeur, calendrier, concurrence, négociabilité, contraintes et accès aux documents"),
    item("recurring_control", "Relancer les opportunités prioritaires puis clôturer refus, doublons et dossiers sans accès aux pièces"),
    item("recurring_control", "Comparer chaque mois opportunités, analyses, offres, acquisitions et performance par source"),
  ],
  complaints: [
    item("implementation_action", "Centraliser chaque litige avec actif, faits, contrat, preuve, impact, assureur éventuel, responsable et délai"),
    item("operational_step", "Accuser réception et protéger immédiatement personnes, bâtiment ou preuve si nécessaire"),
    item("operational_step", "Comparer acte, bail, devis, procès-verbal, échanges, photos, réserves, obligations et responsabilités"),
    item("operational_step", "Répondre avec faits établis, mesure conservatoire, correction, délai et voie d’escalade"),
    item("recurring_control", "Analyser les récurrences par actif, partenaire, lot, cause, coût et délai de résolution"),
  ],
  analysis: [
    item("implementation_action", "Créer un modèle d’analyse avec prix, frais, financement, travaux, charges, recettes, fiscalité, délai et sortie"),
    item("operational_step", "Vérifier les surfaces, l’état, l’occupation, les règles d’urbanisme, la copropriété, les diagnostics et les travaux"),
    item("operational_step", "Chiffrer acquisition, frais, portage, travaux, imprévus, exploitation, commercialisation et sortie"),
    item("operational_step", "Construire un scénario central, prudent et dégradé avec hypothèses explicitement sourcées"),
    item("operational_step", "Tester besoin de trésorerie maximal, sensibilité au délai, seuil de rentabilité et plan de repli"),
    item("recurring_control", "Faire relire les hypothèses déterminantes par notaire, comptable, banque ou technicien compétent"),
    item("operating_rule", "Ne jamais décider sur le rendement brut ou la marge affichée sans intégrer tous les flux et le temps"),
  ],
  portfolio: [
    item("implementation_action", "Créer une fiche par actif avec valeur, dette, trésorerie, rendement, risques, travaux, occupation et stratégie de sortie"),
    item("operational_step", "Comparer performance réelle au plan initial et à la meilleure alternative disponible"),
    item("operational_step", "Détecter sous-performance, vacance, dérive de travaux, dette coûteuse, risque réglementaire ou immobilisation excessive"),
    item("operational_step", "Décider conserver, corriger, refinancer, rénover, louer, vendre ou arrêter avec un responsable et une date"),
    item("recurring_control", "Mettre à jour chaque mois valorisation prudente, dette, cash-flow, engagements et calendrier"),
    item("recurring_control", "Vérifier après arbitrage que la performance et le risque évoluent comme prévu"),
    item("operating_rule", "Ne pas retarder une décision uniquement pour éviter de reconnaître une perte ou un scénario devenu irréaliste"),
  ],
  project: [
    item("implementation_action", "Construire le planning de l’offre à la livraison avec conditions, financement, acte, études, travaux, contrôles et exploitation"),
    item("operational_step", "Lever chaque condition avec pièce, responsable, date cible, dépendance et conséquence en cas d’échec"),
    item("operational_step", "Valider devis, assurance, autorisation, plan, budget et calendrier avant démarrage des travaux"),
    item("operational_step", "Suivre avancement, décisions, commandes, factures, aléas, réserves et preuves de conformité"),
    item("operational_step", "Organiser réception, levée des réserves, remise des documents et mise en service"),
    item("recurring_control", "Mettre à jour chaque semaine délai final, coût à terminaison, cash nécessaire et chemin critique"),
    item("operating_rule", "Ne pas masquer un retard ou un dépassement : recalculer immédiatement la rentabilité et la stratégie de sortie"),
  ],
};

const buildCoreDraft = (): ProcessDraft => ({
  definitionsById: Object.fromEntries(
    Object.entries(processByRole).map(([role, processId]) => [
      processId,
      definitionsByRole[role as RealEstateInvestmentRole],
    ]),
  ),
  contentByProcessId: Object.fromEntries(
    Object.entries(processByRole).map(([role, processId]) => [
      processId,
      contentByRole[role as RealEstateInvestmentRole],
    ]),
  ),
});

const patch = (
  role: RealEstateInvestmentRole,
  contentIndex: number,
  label: string,
): ProcessContentPatch => ({
  processId: processByRole[role],
  contentIndex,
  label,
});

const profilePatches = (
  profile: RealEstateInvestmentProfile,
): readonly ProcessContentPatch[] => [
  patch("strategy", 0, `Choisir la stratégie métier : ${profile.strategicFocus}`),
  patch("strategy", 3, `Piloter le portefeuille avec : ${profile.performanceFrame}`),
  patch("decisions", 1, `Arbitrer sans délai : ${profile.decisionFrame}`),
  patch("access", 0, `Organiser les accès autour de : ${profile.accessFrame}`),
  patch("team", 0, `Tenir le réseau de partenaires avec : ${profile.partnerFrame}`),
  patch("collections", 0, `Suivre les encaissements propres au modèle : ${profile.collectionFrame}`),
  patch("finance", 0, `Construire la trésorerie avec : ${profile.treasuryFrame}`),
  patch("finance", 4, `Mesurer la performance avec : ${profile.profitabilityFrame}`),
  patch("sourcing", 0, `Organiser le sourcing autour de : ${profile.sourcingFrame}`),
  patch("sourcing", 2, `Écarter ou prioriser selon : ${profile.qualificationFrame}`),
  patch("complaints", 0, `Tracer les litiges propres au métier : ${profile.complaintFrame}`),
  patch("analysis", 0, `Construire l’analyse d’investissement avec : ${profile.analysisFrame}`),
  patch("analysis", 1, `Réaliser la diligence métier sur : ${profile.diligenceFrame}`),
  patch("project", 0, `Planifier l’opération autour de : ${profile.projectFrame}`),
  patch("portfolio", 0, `Piloter chaque actif avec : ${profile.operatingFrame}`),
  patch("compliance", 0, `Tenir les pièces et échéances suivantes : ${profile.complianceFrame}`),
];

export const generateRealEstateInvestmentCoreDraft = () => buildCoreDraft();

export const generateRealEstateInvestmentDraft = (
  profile: RealEstateInvestmentProfile,
) =>
  composeProcessDraft(buildCoreDraft(), [
    {
      id: `metier.${profile.slug}`,
      contentPatches: profilePatches(profile),
    },
  ]);

const commonSources = [
  "https://www.anil.org/votre-besoin/acheter/investissement-locatif/precautions-et-verifications/",
  "https://www.service-public.fr/particuliers/vosdroits/F35978/0_1?idFicheParent=F2042",
  "https://www.service-public.fr/particuliers/vosdroits/F37110",
] as const;

export const realEstateInvestmentProfiles = {
  "marchand-de-biens": {
    slug: "marchand-de-biens",
    name: "Marchand de biens",
    sourceUrl:
      "https://docs.google.com/spreadsheets/d/1DlKJa1T24K-GWg2r7JjkiiVrHmUslWvh5wNdCNPmiVk/edit",
    researchSources: [
      "https://bofip.impots.gouv.fr/bofip/3290-PGP.html/identifiant=BOI-ENR-DMTOI-10-50-20140429",
      "https://bofip.impots.gouv.fr/bofip/2487-PGP.html/identifiant=BOI-TVA-IMM-10-20-10-20200513",
      ...commonSources,
    ],
    strategicFocus: "achat-revente, division, rénovation ou changement d’usage maîtrisé, zones liquides, durée de portage, marge minimale et capacité travaux",
    performanceFrame: "opportunités, offres, stocks, portage, budget engagé, coût à terminaison, prix de sortie, marge révisée, délai de revente et cash immobilisé",
    decisionFrame: "prix d’offre, engagement de revendre, urbanisme, modification de programme, dépassement travaux, TVA, baisse du prix de sortie ou vente en bloc",
    accessFrame: "actes, engagement fiscal, financement, urbanisme, plans, devis, chantier, factures, diagnostics, commercialisation, offres et acquéreurs",
    partnerFrame: "notaire, expert-comptable, fiscaliste, banque, architecte ou maître d’œuvre, géomètre, diagnostiqueur, entreprises, agent de vente et relais chantier",
    collectionFrame: "acompte prévu à l’acte, prix de cession, retenue, séquestre, remboursement, assurance et produit de revente effectivement disponible",
    treasuryFrame: "prix d’achat, droits, intérêts de portage, travaux, honoraires, TVA selon traitement validé, commercialisation, taxes, aléas et prix de cession",
    profitabilityFrame: "marge sur coût total, marge après financement et fiscalité validée, coût mensuel de portage, cash maximal, prix plancher et délai de revente",
    sourcingFrame: "notaires, agents, enchères, successions, immeubles à restructurer, foncier, ventes discrètes, apporteurs documentés et prospection directe conforme",
    qualificationFrame: "décote réelle, titre, occupation, urbanisme, division, copropriété, travaux, financement, délai, liquidité de sortie et marge prudente",
    complaintFrame: "vice ou information contestée, désordre travaux, voisinage, copropriété, retard, réserve, facture, acquéreur, diagnostic ou garantie",
    analysisFrame: "prix, droits, régime fiscal à valider, financement, portage, travaux par lot, aléas, commercialisation, prix de sortie prudent, TVA et marge",
    diligenceFrame: "titre, engagement de revendre, urbanisme, division, préemption, servitudes, occupation, copropriété, structure, pollution, diagnostics et demande de sortie",
    projectFrame: "offre, financement, acte, engagement de revendre, autorisations, études, curage, travaux, réception, diagnostics, commercialisation et acte de cession",
    operatingFrame: "stock, date d’achat, délai de revente, budget, coût à terminaison, cash immobilisé, commercialisation, offres, prix plancher et scénario de sortie",
    complianceFrame: "acte d’achat, engagement de revendre et échéance, traitement TVA validé par opération, urbanisme, assurances chantier, devis, factures, diagnostics, audit énergétique si requis et acte de cession",
  },
  "investissement-locatif": {
    slug: "investissement-locatif",
    name: "Investissement locatif",
    sourceUrl:
      "https://docs.google.com/spreadsheets/d/1OxOTfr34g07cvQKv62h3MlfVIdl5jRNWq0t8qY5doz0/edit",
    researchSources: [
      "https://www.impots.gouv.fr/particulier/location-meublee",
      "https://www.anil.org/votre-projet/vous-etes-proprietaire/bailleur/location-vide/",
      ...commonSources,
    ],
    strategicFocus: "location nue ou meublée, longue durée ou autre usage autorisé, zones locatives, typologies, niveau de travaux, rendement net et effort de gestion",
    performanceFrame: "loyers quittancés et encaissés, vacance, impayés, charges, travaux, DPE, rendement net, cash-flow, dette, sinistres et valeur",
    decisionFrame: "candidat, loyer, travaux de décence, impayé, sinistre, renouvellement, congé, arbitrage du bail ou changement de mode de location",
    accessFrame: "acte, financement, bail, identité locataire, état des lieux, dépôt, assurance, diagnostics, quittances, charges, sinistres, travaux et fiscalité",
    partnerFrame: "notaire, banque, expert-comptable, gestionnaire, agence, diagnostiqueur, artisan, assurance, syndic et relais pour les urgences locatives",
    collectionFrame: "loyer, charges récupérables justifiées, dépôt traité séparément, indemnité, assurance, aide au logement éventuelle et régularisation",
    treasuryFrame: "apport, dette, loyer prudent, vacance, charges non récupérables, copropriété, taxe foncière, assurance, gestion, entretien, travaux et fiscalité validée",
    profitabilityFrame: "rendement brut et net, cash-flow avant et après fiscalité validée, vacance, impayés, coût des travaux, dette et valeur de revente",
    sourcingFrame: "annonces, agences, notaires, réseau local, ventes occupées, immeubles, copropriétés et biens compatibles avec la demande locative",
    qualificationFrame: "demande locative, loyer réaliste et règles locales, DPE et décence, charges, copropriété, travaux, financement, vacance et revente",
    complaintFrame: "décence, chauffage, humidité, panne, charges, quittance, dépôt, voisinage, sinistre, délai d’intervention ou désaccord de sortie",
    analysisFrame: "prix, frais, financement, loyer hors charges prudent, vacance, charges récupérables ou non, entretien, travaux, fiscalité validée et revente",
    diligenceFrame: "titre, copropriété, procès-verbaux, charges, travaux votés, taxe foncière, DPE, décence, encadrement éventuel, bail existant, impayés et demande locative",
    projectFrame: "offre, financement, acte, travaux de décence et énergie, diagnostics, ameublement éventuel, assurance, annonce, dossier locataire, bail et état des lieux",
    operatingFrame: "bail, échéances, loyer, encaissement, indexation autorisée, charges, dépôt, assurance, demandes locataire, travaux, vacance, rendement et arbitrage",
    complianceFrame: "acte, bail et annexes, DPE et diagnostics, décence énergétique, état des lieux, assurance, dépôt, quittances, charges, règles de loyer, déclarations et fiscalité nue ou meublée validée",
  },
  "investissement-immobilier": {
    slug: "investissement-immobilier",
    name: "Investissement immobilier",
    sourceUrl:
      "https://docs.google.com/spreadsheets/d/1QmesN9bz3WNgf8ubrpRmuC670lBd-sNR_x9nya9MYJw/edit",
    researchSources: [
      "https://www.service-public.fr/particuliers/vosdroits/F10864",
      "https://entreprendre.service-public.fr/vosdroits/F10029",
      ...commonSources,
    ],
    strategicFocus: "constitution et allocation d’un portefeuille immobilier, détention directe ou structurée avec conseil, rendement, valorisation, liquidité, dette et horizon",
    performanceFrame: "valeur prudente, dette, ratio de financement, cash-flow, rendement net, vacance, travaux, concentration, liquidité et performance par actif",
    decisionFrame: "acquisition, allocation de cash, structure à valider, refinancement, gros travaux, changement d’exploitation, cession partielle ou arbitrage",
    accessFrame: "structure de détention, associés, actes, dette, comptes, valorisations, baux, travaux, fiscalité, reporting et décisions d’arbitrage",
    partnerFrame: "notaire, expert-comptable, avocat ou fiscaliste, banques, courtier, gestionnaires, experts en valorisation, techniciens et relais par actif",
    collectionFrame: "revenus des actifs, distributions, remboursements, produits de cession, indemnités et flux intragroupe correctement justifiés",
    treasuryFrame: "cash par structure et actif, dette, covenants éventuels, recettes, charges, travaux, fiscalité validée, distributions, refinancements et cessions",
    profitabilityFrame: "rendement net, cash-flow, évolution de valeur prudente, coût de dette, concentration, liquidité, performance consolidée et performance par actif",
    sourcingFrame: "notaires, agents, banques, réseaux professionnels, opérateurs, ventes de gré à gré et opportunités compatibles avec l’allocation cible",
    qualificationFrame: "qualité de l’actif, revenus, locataires, travaux, structure, dette, fiscalité à valider, concentration, liquidité et scénarios de sortie",
    complaintFrame: "associé, locataire, gestionnaire, fournisseur, voisinage, copropriété, banque, travaux, valorisation ou répartition d’un flux",
    analysisFrame: "prix, valeur, revenus, vacance, charges, travaux, dette, fiscalité validée, structure, horizon, liquidité et scénarios de sortie",
    diligenceFrame: "titre, structure de détention, associés, urbanisme, occupation, baux, copropriété, technique, environnement, dette, fiscalité, contentieux et valorisation",
    projectFrame: "offre, validation du montage, financement, acte, reprise des contrats, travaux, gouvernance, reporting et intégration dans le portefeuille",
    operatingFrame: "valeur, dette, cash-flow, rendement, concentration, risques, travaux, occupation, échéances, gouvernance, refinancement et scénario d’arbitrage",
    complianceFrame: "actes, structure et pouvoirs, conventions, financements, baux, assurances, diagnostics, déclarations, comptabilité, fiscalité validée et pièces de cession conservées",
  },
} satisfies Record<string, RealEstateInvestmentProfile>;
