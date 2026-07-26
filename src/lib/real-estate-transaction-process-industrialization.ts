import {
  composeProcessDraft,
  type IndustrializedContentItem,
  type IndustrializedProcessDefinition,
  type ProcessContentPatch,
  type ProcessDraft,
} from "@/lib/process-industrialization";

export type RealEstateTransactionRole =
  | "compliance"
  | "decisions"
  | "access"
  | "strategy"
  | "team"
  | "payables"
  | "commissions"
  | "portfolio"
  | "qualification"
  | "complaints"
  | "file"
  | "visits"
  | "negotiation";

export type RealEstateTransactionProfile = {
  slug: "agence-immobiliere" | "chasseur-immobilier";
  name: string;
  sourceUrl: string;
  researchSources: readonly string[];
  strategicFocus: string;
  performanceFrame: string;
  urgentDecision: string;
  accessFrame: string;
  teamFrame: string;
  payableFrame: string;
  commissionFrame: string;
  portfolioFrame: string;
  prospectingFrame: string;
  qualificationFrame: string;
  financingFrame: string;
  complaintFrame: string;
  fileFrame: string;
  visitFrame: string;
  negotiationFrame: string;
  complianceFrame: string;
};

const processByRole: Record<RealEstateTransactionRole, string> = {
  compliance:
    "process.immobilier-transaction.conformite-metier.tenir-les-dossiers-et-affichages-en-regle",
  decisions:
    "process.immobilier-transaction.direction.decider-sans-bloquer-les-transactions",
  access:
    "process.immobilier-transaction.direction.donner-acces-a-lessentiel",
  strategy:
    "process.immobilier-transaction.direction.savoir-ou-va-lactivite",
  team:
    "process.immobilier-transaction.equipe.organiser-les-agents-et-remplacements",
  payables:
    "process.immobilier-transaction.finance-admin.payer-a-temps",
  commissions:
    "process.immobilier-transaction.finance-admin.suivre-commissions-et-encaissements",
  portfolio:
    "process.immobilier-transaction.marketing-vente.developper-le-portefeuille-et-les-mandats",
  qualification:
    "process.immobilier-transaction.marketing-vente.qualifier-un-acquereur-ou-un-projet",
  complaints:
    "process.immobilier-transaction.marketing-vente.traiter-une-reclamation-client",
  file:
    "process.immobilier-transaction.operations.constituer-un-dossier-bien-ou-mandat",
  visits:
    "process.immobilier-transaction.operations.organiser-visites-et-retours",
  negotiation:
    "process.immobilier-transaction.operations.suivre-negociation-et-signature",
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
  RealEstateTransactionRole,
  IndustrializedProcessDefinition
> = {
  compliance: def(
    "Maintenir chaque habilitation, affichage, mandat et contrôle réglementaire à jour.",
    "Ouverture, renouvellement, nouveau dossier ou contrôle.",
    "Une activité traçable sans pièce réglementaire manquante.",
    "Responsable conformité",
    "Mensuelle",
  ),
  decisions: def(
    "Arbitrer rapidement sans engager la société au-delà du mandat ou des délégations.",
    "Blocage, offre, incident ou décision hors cadre.",
    "Une décision datée, attribuée et communiquée aux parties utiles.",
    "Dirigeant",
    "À chaque arbitrage",
  ),
  access: def(
    "Donner à chacun les informations nécessaires sans exposer tout le dossier.",
    "Ouverture de dossier, changement d’intervenant ou absence.",
    "Un accès utile, sécurisé et révocable.",
    "Responsable d’agence",
    "À chaque changement",
  ),
  strategy: def(
    "Choisir les segments, zones et dossiers compatibles avec la capacité réelle.",
    "Revue mensuelle ou évolution du marché.",
    "Un portefeuille actif, maîtrisé et rentable.",
    "Dirigeant",
    "Mensuelle",
  ),
  team: def(
    "Répartir les dossiers et assurer la continuité en cas d’absence.",
    "Nouveau mandat, surcharge ou indisponibilité.",
    "Chaque dossier possède un responsable et un relais informé.",
    "Responsable d’agence",
    "Hebdomadaire",
  ),
  payables: def(
    "Payer les dépenses validées au bon dossier et à la bonne échéance.",
    "Réception d’une facture ou échéance.",
    "Des dépenses justifiées, imputées et réglées sans doublon.",
    "Responsable administratif",
    "Hebdomadaire",
  ),
  commissions: def(
    "Suivre honoraires, commissions internes et encaissements jusqu’au rapprochement.",
    "Signature, réalisation de l’opération ou règlement.",
    "Un montant exigible, facturé, encaissé et réparti avec ses preuves.",
    "Responsable administratif",
    "Hebdomadaire",
  ),
  portfolio: def(
    "Alimenter le portefeuille avec des mandats qualifiés et exploitables.",
    "Prospection, recommandation ou nouvelle demande.",
    "Des opportunités suivies jusqu’à la signature ou au refus motivé.",
    "Responsable commercial",
    "Hebdomadaire",
  ),
  qualification: def(
    "Vérifier le besoin, la capacité et le calendrier avant de mobiliser l’équipe.",
    "Nouveau contact ou évolution du projet.",
    "Un projet qualifié avec prochaines étapes et critères explicites.",
    "Conseiller immobilier",
    "À chaque demande",
  ),
  complaints: def(
    "Traiter une insatisfaction à partir des faits et engagements du dossier.",
    "Réclamation orale ou écrite.",
    "Une réponse tracée, une correction et une clôture confirmée.",
    "Responsable d’agence",
    "À chaque réclamation",
  ),
  file: def(
    "Constituer un dossier complet avant diffusion, visite ou engagement.",
    "Nouveau bien, nouveau mandat ou nouvelle recherche.",
    "Un dossier vérifié, daté et immédiatement exploitable.",
    "Conseiller immobilier",
    "À chaque dossier",
  ),
  visits: def(
    "Préparer, réaliser et exploiter chaque visite sans perdre l’information.",
    "Demande de visite ou bien pertinent identifié.",
    "Un retour qualifié et une prochaine action décidée.",
    "Conseiller immobilier",
    "À chaque visite",
  ),
  negotiation: def(
    "Conduire offre, négociation et signature avec une chronologie complète.",
    "Intérêt confirmé ou offre reçue.",
    "Un accord correctement transmis jusqu’à la signature et au suivi notarial.",
    "Conseiller immobilier",
    "À chaque négociation",
  ),
};

const contentByRole: Record<
  RealEstateTransactionRole,
  IndustrializedContentItem[]
> = {
  compliance: [
    item("implementation_action", "Tenir un calendrier des cartes professionnelles, habilitations, assurances, garanties, déclarations et renouvellements"),
    item("implementation_action", "Centraliser les barèmes, affichages, mentions d’annonce, registres et modèles de mandat en vigueur"),
    item("operational_step", "Vérifier avant utilisation que le mandat est écrit, signé, daté, numéroté, encore valable et adapté à la mission"),
    item("operational_step", "Appliquer les contrôles d’identité, de bénéficiaire effectif, de risque et de vigilance LCB-FT prévus pour le dossier"),
    item("recurring_control", "Contrôler chaque mois un échantillon de dossiers, annonces, mandats, habilitations et preuves de vigilance"),
    item("operating_rule", "Suspendre diffusion, visite, négociation ou facturation lorsqu’une pièce obligatoire ou une condition juridique reste incertaine"),
  ],
  decisions: [
    item("implementation_action", "Écrire les décisions délégables avec montant, délai, limite, preuve et personne à prévenir"),
    item("operational_step", "Qualifier le blocage : mandat, prix, financement, document, conformité, disponibilité, conflit ou calendrier"),
    item("operational_step", "Rassembler les faits et l’échéance avant de solliciter l’arbitre compétent"),
    item("operational_step", "Tracer la décision, son auteur, ses conditions et la prochaine action dans le dossier"),
    item("recurring_control", "Revoir chaque semaine les dossiers bloqués, les offres sans réponse et les décisions arrivées trop tard"),
    item("operating_rule", "Ne jamais accepter, refuser ou modifier un engagement au nom d’un client sans pouvoir ou accord traçable"),
  ],
  access: [
    item("implementation_action", "Définir les droits par rôle sur contacts, pièces d’identité, finances, mandats, offres et signatures"),
    item("operational_step", "Créer un dossier unique avec responsable, relais, statut, prochaine action et échéance"),
    item("operational_step", "Partager uniquement les pièces utiles via un accès nominatif et révocable"),
    item("recurring_control", "Retirer sans délai les accès des sortants et contrôler les comptes partagés ou inactifs"),
    item("operating_rule", "Ne pas transmettre une pièce sensible par un canal non approuvé ou à une personne non vérifiée"),
  ],
  strategy: [
    item("implementation_action", "Choisir les zones, segments, types de biens, budgets, clients et niveaux de service prioritaires"),
    item("implementation_action", "Fixer les objectifs de mandats, dossiers actifs, visites, offres, signatures, délai et honoraires"),
    item("operational_step", "Classer le portefeuille par potentiel, urgence, maturité, complexité, charge et probabilité de conclusion"),
    item("recurring_control", "Comparer chaque mois entrées, mandats signés, visites, offres, compromis ou actes, abandons et encaissements"),
    item("recurring_control", "Analyser les pertes par source, zone, prix, financement, qualité du dossier, concurrence et délai de réponse"),
    item("operating_rule", "Limiter les nouveaux dossiers lorsque le suivi, la conformité ou la qualité de réponse ne peuvent plus être garantis"),
  ],
  team: [
    item("implementation_action", "Tenir une matrice par collaborateur avec secteur, compétences, habilitation, capacité, dossiers et relais"),
    item("operational_step", "Affecter chaque dossier selon zone, charge, compétence, relation client et risque de conflit"),
    item("operational_step", "Préparer le remplacement avec synthèse, contacts, engagements, visites, offres, pièces et prochaines échéances"),
    item("recurring_control", "Faire une revue hebdomadaire de charge, dossiers sans action, absences, retards et besoins d’appui"),
    item("operating_rule", "Ne confier aucun acte d’entremise à une personne dont l’habilitation ou le cadre d’intervention n’est pas vérifié"),
  ],
  payables: [
    item("implementation_action", "Créer un échéancier des abonnements, portails, diagnostics, photos, annonces, prestations et dépenses de dossier"),
    item("operational_step", "Rapprocher la facture avec fournisseur, commande, prestation réalisée, dossier et accord prévu"),
    item("operational_step", "Faire valider les dépenses hors budget ou refacturables avant paiement"),
    item("recurring_control", "Contrôler chaque semaine échéances, doublons, avoirs, dépenses sans dossier et prélèvements anormaux"),
    item("operating_rule", "Ne pas payer une prestation contestée ou non identifiable sans arbitrage et trace écrite"),
  ],
  commissions: [
    item("implementation_action", "Créer un suivi par dossier avec mandat, barème applicable, montant prévu, partage, jalon juridique et date probable"),
    item("operational_step", "Vérifier avant facturation que l’opération et les conditions d’exigibilité des honoraires sont effectivement réunies"),
    item("operational_step", "Émettre la facture avec le bon client, dossier, montant, taux de taxe, pièce justificative et échéance"),
    item("operational_step", "Rapprocher encaissement, facture, acte, partage interne ou inter-agence et éventuel avoir"),
    item("recurring_control", "Suivre chaque semaine honoraires attendus, facturés, encaissés, contestés et échus"),
    item("operating_rule", "Ne jamais réclamer d’avance ou de rémunération sans vérifier le mandat, le barème et les conditions légales applicables"),
  ],
  portfolio: [
    item("implementation_action", "Définir les sources de prospection, la zone, le message, la fréquence, le consentement et la preuve de suivi"),
    item("operational_step", "Créer chaque opportunité avec origine, contact, besoin, adresse ou zone, échéance et prochaine relance"),
    item("operational_step", "Qualifier l’intérêt, la décision, la concurrence, le calendrier et les conditions du mandat proposé"),
    item("operational_step", "Présenter la mission, les actions incluses, les limites, le barème et le compte rendu attendu"),
    item("recurring_control", "Relancer selon une séquence datée puis clôturer les refus, doublons et projets abandonnés"),
    item("recurring_control", "Comparer chaque mois contacts, rendez-vous, mandats signés et signatures par source de prospection"),
  ],
  qualification: [
    item("implementation_action", "Créer une fiche de découverte avec identité, projet, critères, budget, financement, calendrier et décideurs"),
    item("operational_step", "Vérifier le besoin réel, les critères indispensables, les compromis possibles et les exclusions"),
    item("operational_step", "Demander les éléments permettant d’apprécier la capacité financière sans collecter de données inutiles"),
    item("operational_step", "Confirmer par écrit périmètre, prochaines étapes, documents attendus et délai de réponse"),
    item("recurring_control", "Requalifier le projet après changement de budget, financement, zone, situation ou calendrier"),
    item("operating_rule", "Ne pas organiser une chaîne de visites tant que budget, décisionnaires et critères prioritaires restent incohérents"),
  ],
  complaints: [
    item("implementation_action", "Centraliser chaque réclamation avec dossier, faits, date, preuve, engagement concerné, responsable et délai"),
    item("operational_step", "Accuser réception et annoncer le délai de vérification sans reconnaître un fait non établi"),
    item("operational_step", "Comparer mandat, échanges, annonce, visite, offre, pièces transmises et obligations applicables"),
    item("operational_step", "Répondre avec faits établis, correction, responsable, délai et voie d’escalade ou de médiation utile"),
    item("recurring_control", "Analyser chaque mois les récurrences par collaborateur, source, étape, type de bien et cause"),
  ],
  file: [
    item("implementation_action", "Créer une checklist documentaire avec pièce, source, date, validité, contrôle, propriétaire et statut"),
    item("operational_step", "Ouvrir le dossier avec identité vérifiée, coordonnées, mandat, objet, interlocuteurs et chronologie"),
    item("operational_step", "Collecter les pièces directement auprès de la source ou tracer leur provenance et leur date"),
    item("operational_step", "Vérifier cohérence des identités, pouvoirs, propriété ou capacité, caractéristiques, prix et documents techniques"),
    item("recurring_control", "Bloquer dans le dossier les pièces manquantes, expirées, illisibles ou contradictoires avec un responsable et une date"),
    item("operating_rule", "Ne pas présenter comme vérifiée une information seulement déclarée ou une pièce dont l’authenticité reste douteuse"),
  ],
  visits: [
    item("implementation_action", "Préparer une fiche de visite avec participants, accès, critères, points à vérifier, sécurité et documents utiles"),
    item("operational_step", "Confirmer rendez-vous, identité du visiteur, disponibilité, adresse, accès et consignes avant le déplacement"),
    item("operational_step", "Présenter les faits connus sans masquer une information défavorable ni inventer une réponse"),
    item("operational_step", "Recueillir immédiatement intérêt, réserves, questions, positionnement et prochaine action"),
    item("recurring_control", "Transmettre le compte rendu au bon interlocuteur et mettre à jour le dossier le jour même"),
    item("operating_rule", "Ne pas remettre de clé, code, document sensible ou accès permanent sans autorisation et traçabilité"),
  ],
  negotiation: [
    item("implementation_action", "Créer une chronologie des offres avec auteur, montant, conditions, durée, pièces, transmission et réponse"),
    item("operational_step", "Vérifier identité, financement, conditions, calendrier et cohérence avant transmission"),
    item("operational_step", "Transmettre l’offre au mandant ou au client concerné sans la déformer et conserver la preuve"),
    item("operational_step", "Tracer chaque contre-proposition, accord, refus, réserve et échéance sans écraser les versions précédentes"),
    item("operational_step", "Préparer la transmission au notaire avec coordonnées, pièces validées, conditions et points restant à lever"),
    item("recurring_control", "Suivre compromis ou avant-contrat, financement, conditions suspensives, signatures, acte et cause des retards"),
  ],
};

const buildCoreDraft = (): ProcessDraft => ({
  definitionsById: Object.fromEntries(
    Object.entries(processByRole).map(([role, processId]) => [
      processId,
      definitionsByRole[role as RealEstateTransactionRole],
    ]),
  ),
  contentByProcessId: Object.fromEntries(
    Object.entries(processByRole).map(([role, processId]) => [
      processId,
      contentByRole[role as RealEstateTransactionRole],
    ]),
  ),
});

const patch = (
  role: RealEstateTransactionRole,
  contentIndex: number,
  label: string,
): ProcessContentPatch => ({
  processId: processByRole[role],
  contentIndex,
  label,
});

const profilePatches = (
  profile: RealEstateTransactionProfile,
): readonly ProcessContentPatch[] => [
  patch("strategy", 0, `Choisir le positionnement du métier : ${profile.strategicFocus}`),
  patch("strategy", 1, `Piloter la performance avec : ${profile.performanceFrame}`),
  patch("decisions", 1, `Qualifier immédiatement les décisions sensibles : ${profile.urgentDecision}`),
  patch("access", 0, `Organiser les accès autour de : ${profile.accessFrame}`),
  patch("team", 0, `Tenir la matrice d’équipe avec : ${profile.teamFrame}`),
  patch("payables", 0, `Prévoir et imputer les dépenses suivantes : ${profile.payableFrame}`),
  patch("commissions", 0, `Suivre les honoraires et commissions avec : ${profile.commissionFrame}`),
  patch("portfolio", 0, `Organiser la prospection autour de : ${profile.prospectingFrame}`),
  patch("portfolio", 3, `Présenter précisément l’offre de service : ${profile.portfolioFrame}`),
  patch("qualification", 0, `Qualifier chaque projet avec : ${profile.qualificationFrame}`),
  patch("qualification", 2, `Vérifier la faisabilité financière avec : ${profile.financingFrame}`),
  patch("complaints", 0, `Tracer les réclamations propres au métier : ${profile.complaintFrame}`),
  patch("file", 0, `Constituer la checklist métier avec : ${profile.fileFrame}`),
  patch("visits", 0, `Préparer chaque visite avec : ${profile.visitFrame}`),
  patch("negotiation", 0, `Conduire l’offre et la négociation avec : ${profile.negotiationFrame}`),
  patch("compliance", 0, `Tenir les échéances et preuves suivantes : ${profile.complianceFrame}`),
];

export const generateRealEstateTransactionCoreDraft = () => buildCoreDraft();

export const generateRealEstateTransactionDraft = (
  profile: RealEstateTransactionProfile,
) =>
  composeProcessDraft(buildCoreDraft(), [
    {
      id: `metier.${profile.slug}`,
      contentPatches: profilePatches(profile),
    },
  ]);

export const realEstateTransactionProfiles = {
  "agence-immobiliere": {
    slug: "agence-immobiliere",
    name: "Agence immobilière professionnelle",
    sourceUrl:
      "https://docs.google.com/spreadsheets/d/1zfDCbfHuHKgIVMwcgdESVl6u8di6g2KIvt6N_MWmWEk/edit",
    researchSources: [
      "https://www.economie.gouv.fr/dgccrf/les-fiches-pratiques/professionnels-de-limmobilier-les-regles-connaitre",
      "https://www.economie.gouv.fr/dgccrf/les-fiches-pratiques-et-les-faq/lagent-immobilier-les-regles-qui-encadrent-la-profession",
      "https://www.cci.fr/offre/obtenir-carte-agent-immobilier",
      "https://www.economie.gouv.fr/tracfin/les-publications-de-tracfin/le-dispositif-lcb-ft-applique-aux-activites-des-professionnels",
    ],
    strategicFocus: "vente, location ou les deux, secteurs couverts, types de biens, mandats exclusifs ou simples, gamme de prix, stock actif et capacité de visite",
    performanceFrame: "estimations, mandats signés, exclusivités, annonces actives, leads, visites, offres, compromis, actes, délai de vente, honoraires et encaissements",
    urgentDecision: "offre proche de l’échéance, baisse de prix, document vendeur manquant, diagnostic expiré, anomalie de propriété, conflit entre offres ou incident de visite",
    accessFrame: "mandat vendeur ou bailleur, titre ou pouvoir, diagnostics, DPE, annonce, clés, contacts acquéreurs ou locataires, offres et dossier notarial",
    teamFrame: "carte ou attestation d’habilitation, secteur, vente ou location, estimation, négociation, dossiers actifs, clés confiées, visites et relais",
    payableFrame: "portails d’annonces, photographe, visite virtuelle, diagnostics autorisés, panneau, publicité, logiciel, inter-cabinet et dépenses validées par bien",
    commissionFrame: "numéro de mandat, barème, prix du bien, charge vendeur ou acquéreur, partage inter-agence, compromis, acte authentique, facture et règlement",
    portfolioFrame: "estimation, mandat de vente ou de location, préparation du bien, diffusion, qualification des contacts, visites, négociation et suivi jusqu’au notaire",
    prospectingFrame: "avis de valeur, propriétaires, bailleurs, recommandations, anciens clients, quartier, partenaires locaux et demandes entrantes",
    qualificationFrame: "achat ou location, composition du foyer, secteurs, type de bien, surface, critères impératifs, budget, apport, financement, calendrier et bien à vendre",
    financingFrame: "budget global, apport, accord ou simulation bancaire, frais d’acquisition, travaux, condition de vente préalable et délai d’obtention",
    complaintFrame: "estimation, mandat, annonce inexacte, honoraires, visite, clé, défaut d’information, offre non transmise, discrimination alléguée ou délai de suivi",
    fileFrame: "identité et pouvoir du vendeur ou bailleur, titre, mandat, caractéristiques, urbanisme utile, diagnostics et DPE, charges, travaux, taxes, clés, prix et annonce",
    visitFrame: "bien, vendeur ou bailleur informé, acquéreur ou locataire qualifié, clés, accès, sécurité, diagnostics disponibles, points sensibles et bon de visite si utilisé",
    negotiationFrame: "offre écrite, identité, prix, financement, conditions suspensives, délais, mobilier éventuel, transmission au vendeur, contre-offre, compromis et notaire",
    complianceFrame: "carte professionnelle, garantie ou attestation de non-détention de fonds, responsabilité civile, déclaration d’établissement, habilitations, registre des mandats, barème, affichages, annonces et vigilance LCB-FT",
  },
  "chasseur-immobilier": {
    slug: "chasseur-immobilier",
    name: "Chasseur immobilier",
    sourceUrl:
      "https://docs.google.com/spreadsheets/d/1cZMEnEP0lNbiHynPy_8aZLBcKjnnfFyc-HNTsHTLsJY/edit",
    researchSources: [
      "https://www.economie.gouv.fr/dgccrf/les-fiches-pratiques/professionnels-de-limmobilier-les-regles-connaitre",
      "https://www.economie.gouv.fr/dgccrf/les-fiches-pratiques-et-les-faq/lagent-immobilier-les-regles-qui-encadrent-la-profession",
      "https://www.cci.fr/offre/obtenir-carte-agent-immobilier",
      "https://www.economie.gouv.fr/tracfin/les-publications-de-tracfin/le-dispositif-lcb-ft-applique-aux-activites-des-professionnels",
    ],
    strategicFocus: "résidence principale, investissement ou pied-à-terre, zones maîtrisées, budgets, niveau d’accompagnement, nombre de recherches actives et capacité de visite",
    performanceFrame: "appels découverte, mandats de recherche signés, recherches actives, biens analysés, shortlists, visites, offres, compromis, actes, délai de recherche et honoraires",
    urgentDecision: "bien très demandé, offre à déposer, financement incertain, défaut ou document contradictoire, conflit d’intérêts, double rémunération ou délai notarial",
    accessFrame: "mandat de recherche, cahier des charges, budget et financement, coordonnées acquéreur, biens sourcés, analyses, comptes rendus, offres et dossier notarial",
    teamFrame: "carte ou attestation d’habilitation, zones maîtrisées, types de biens, analyse financière, visite, négociation, recherches actives et relais",
    payableFrame: "abonnements, outils de veille, déplacements, expert bâtiment, courtier, données, apporteur autorisé et dépenses expressément validées par recherche",
    commissionFrame: "mandat de recherche, barème, charge acquéreur, éventuel partage documenté, prix d’acquisition, acte authentique, facture et règlement",
    portfolioFrame: "cadrage du projet, mandat de recherche, sourcing marché et off-market, présélection, analyse, visites ciblées, offre, négociation et suivi notarial",
    prospectingFrame: "recommandations, anciens clients, partenaires, courtiers, notaires, relocation, contenu local, demandes entrantes et réseau d’agences",
    qualificationFrame: "usage du bien, zones, temps de trajet, type, surface, critères impératifs, rendement éventuel, travaux acceptés, budget, financement et calendrier",
    financingFrame: "enveloppe tout compris, apport, accord ou simulation bancaire, frais d’acquisition, travaux, mobilier, rendement visé et marge de négociation",
    complaintFrame: "biens hors cahier des charges, manque de sourcing, visite inutile, défaut non signalé, conflit d’intérêts, honoraires, offre mal transmise ou suivi insuffisant",
    fileFrame: "identité acquéreur, mandat de recherche, cahier des charges, budget, financement, calendrier, consentements, biens étudiés, analyses, visites, offres et décisions",
    visitFrame: "cahier des charges, fiche du bien, prix au mètre carré, diagnostics disponibles, charges, travaux, environnement, questions techniques, photos autorisées et grille de décision",
    negotiationFrame: "analyse comparative, budget plafond, stratégie d’offre, financement, conditions suspensives, travaux, calendrier, transmission au vendeur ou à son mandataire et notaire",
    complianceFrame: "carte professionnelle ou couverture par le titulaire, habilitations, responsabilité civile, garantie ou non-détention de fonds, registre des mandats de recherche, barème, affichages, conflits d’intérêts et vigilance LCB-FT",
  },
} satisfies Record<string, RealEstateTransactionProfile>;
