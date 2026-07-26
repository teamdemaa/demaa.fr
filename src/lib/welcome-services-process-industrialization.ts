import {
  composeProcessDraft,
  type IndustrializedContentItem,
  type IndustrializedProcessDefinition,
  type ProcessContentPatch,
  type ProcessDraft,
} from "@/lib/process-industrialization";

export type WelcomeServicesRole =
  | "compliance"
  | "decisions"
  | "access"
  | "strategy"
  | "team"
  | "payables"
  | "finance"
  | "qualification"
  | "complaints"
  | "sales"
  | "reservations"
  | "dossier"
  | "incidents";

export type WelcomeServicesProfile = {
  slug: "agence-de-voyage" | "centre-affaires-coworking";
  name: string;
  sourceUrl: string;
  researchSources: readonly string[];
  complianceFrame: string;
  contractFrame: string;
  decisionFrame: string;
  accessFrame: string;
  strategyFrame: string;
  teamFrame: string;
  payableFrame: string;
  financeFrame: string;
  qualificationFrame: string;
  complaintFrame: string;
  salesFrame: string;
  reservationFrame: string;
  confirmationFrame: string;
  dossierFrame: string;
  closureFrame: string;
  incidentFrame: string;
};

const processByRole: Record<WelcomeServicesRole, string> = {
  compliance:
    "process.accueil-membres.conformite-metier.securiser-contrats-et-obligations-daccueil",
  decisions:
    "process.accueil-membres.direction.decider-sans-bloquer-lexploitation",
  access:
    "process.accueil-membres.direction.donner-acces-a-lessentiel",
  strategy:
    "process.accueil-membres.direction.savoir-ou-va-lactivite",
  team:
    "process.accueil-membres.equipe.organiser-laccueil-et-les-remplacements",
  payables: "process.accueil-membres.finance-admin.payer-a-temps",
  finance:
    "process.accueil-membres.finance-admin.suivre-encaissements-et-abonnements",
  qualification:
    "process.accueil-membres.marketing-vente.qualifier-un-besoin-ou-une-reservation",
  complaints:
    "process.accueil-membres.marketing-vente.traiter-une-reclamation-client",
  sales:
    "process.accueil-membres.marketing-vente.vendre-un-contrat-service-ou-sejour",
  reservations:
    "process.accueil-membres.operations.gerer-reservations-courrier-ou-services",
  dossier:
    "process.accueil-membres.operations.ouvrir-et-tenir-un-dossier-client-ou-membre",
  incidents:
    "process.accueil-membres.operations.traiter-incidents-et-renouvellements",
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
  WelcomeServicesRole,
  IndustrializedProcessDefinition
> = {
  compliance: def(
    "Maintenir les autorisations, contrats, informations et preuves nécessaires à l’accueil et aux services vendus.",
    "Ouverture, nouvelle offre, nouveau partenaire, échéance ou contrôle.",
    "Une activité exercée dans son périmètre avec des documents à jour.",
    "Référent conformité",
    "Mensuelle",
  ),
  decisions: def(
    "Arbitrer rapidement un écart de service, de capacité ou de sécurité.",
    "Indisponibilité, incident, demande exceptionnelle, retard ou conflit.",
    "Une mesure immédiate, une décision attribuée et une trace.",
    "Responsable d’exploitation",
    "Quotidienne",
  ),
  access: def(
    "Limiter l’accès aux outils, données, locaux et moyens critiques selon le rôle.",
    "Arrivée, départ, remplacement, dossier sensible ou changement d’outil.",
    "Des accès nominatifs, contrôlés et retirés à temps.",
    "Dirigeant",
    "Mensuelle",
  ),
  strategy: def(
    "Aligner offres, capacité, demande, qualité et marge.",
    "Revue mensuelle, nouvelle offre ou variation importante de la demande.",
    "Des priorités mesurables compatibles avec les moyens disponibles.",
    "Dirigeant",
    "Mensuelle",
  ),
  team: def(
    "Assurer l’accueil, la vente et l’exploitation avec les compétences et relais nécessaires.",
    "Planning, absence, pic d’activité ou nouveau service.",
    "Chaque fonction critique est couverte avec des consignes accessibles.",
    "Responsable d’exploitation",
    "Hebdomadaire",
  ),
  payables: def(
    "Payer les dépenses justifiées sans manquer une échéance critique.",
    "Facture, contrat, prélèvement, remboursement ou litige.",
    "Une dépense contrôlée, affectée et réglée une seule fois.",
    "Responsable administratif",
    "Hebdomadaire",
  ),
  finance: def(
    "Rapprocher ventes, services, encaissements, coûts et marge.",
    "Clôture, impayé, remboursement, avoir ou revue d’activité.",
    "Des revenus et coûts expliqués par offre ou dossier.",
    "Responsable financier",
    "Hebdomadaire",
  ),
  qualification: def(
    "Comprendre le besoin avant de proposer une disponibilité et un prix.",
    "Demande entrante, visite, devis ou renouvellement.",
    "Une demande qualifiée avec une prochaine action réaliste.",
    "Responsable commercial",
    "À chaque demande",
  ),
  complaints: def(
    "Traiter une réclamation à partir du contrat, des faits et des preuves.",
    "Insatisfaction, contestation, défaut de service ou incident.",
    "Une réponse écrite, une correction et une prévention tracées.",
    "Responsable d’exploitation",
    "À chaque réclamation",
  ),
  sales: def(
    "Faire accepter une offre dont le contenu, le prix et les conditions sont compris.",
    "Proposition, devis, contrat, abonnement ou renouvellement.",
    "Un accord explicite sans promesse ni frais cachés.",
    "Responsable commercial",
    "À chaque vente",
  ),
  reservations: def(
    "Réserver et confirmer une ressource ou un service sans conflit ni information manquante.",
    "Option, réservation, demande de service ou changement.",
    "Une réservation confirmée avec toutes les dépendances vérifiées.",
    "Responsable réservation",
    "Quotidienne",
  ),
  dossier: def(
    "Centraliser les informations, documents, paiements et actions utiles à chaque relation.",
    "Nouvelle vente, modification, événement ou échéance.",
    "Un dossier à jour, compréhensible et transmissible.",
    "Responsable de dossier",
    "À chaque changement",
  ),
  incidents: def(
    "Sécuriser les personnes et rétablir le service lors d’un incident ou d’un changement.",
    "Panne, annulation, danger, erreur, absence ou renouvellement.",
    "Une solution communiquée, exécutée et clôturée avec preuve.",
    "Responsable d’exploitation",
    "À chaque incident",
  ),
};

const contentByRole: Record<WelcomeServicesRole, IndustrializedContentItem[]> = {
  compliance: [
    item("implementation_action", "Cartographier activités, offres, lieux, partenaires, autorisations, assurances, contrats, informations obligatoires, registres et échéances"),
    item("operational_step", "Vérifier avant chaque vente le périmètre exercé, les documents applicables, l’identité des parties et les informations à transmettre"),
    item("implementation_action", "Versionner conditions, contrats, formulaires, règlements, mentions, procédures et preuves de remise ou d’acceptation"),
    item("operational_step", "Identifier les données personnelles réellement nécessaires, leurs accès, leur durée de conservation et leur mode de suppression"),
    item("recurring_control", "Contrôler chaque mois échéances, attestations, contrats, affichages, dossiers incomplets, incidents et corrections ouvertes"),
    item("operating_rule", "Ne jamais vendre un service hors du périmètre autorisé ni masquer une limite, une condition ou une responsabilité connue"),
  ],
  decisions: [
    item("implementation_action", "Écrire la matrice d’arbitrage avec type d’écart, seuil, mesure immédiate, décideur, délai, solution et preuve attendue"),
    item("operational_step", "Qualifier l’écart : sécurité, capacité, disponibilité, identité, paiement, partenaire, donnée, contrat, qualité ou délai"),
    item("operational_step", "Sécuriser la personne, la ressource et les informations avant de rechercher une solution commerciale"),
    item("recurring_control", "Revoir chaque jour demandes bloquées, incidents ouverts, décisions attendues, promesses faites et délais dépassés"),
    item("operating_rule", "Ne pas confirmer une solution dont la disponibilité, le coût, le pouvoir de décision ou les conditions ne sont pas vérifiés"),
  ],
  access: [
    item("implementation_action", "Tenir le registre des accès aux outils, données clients, paiements, réservations, documents, locaux, clés, badges et comptes administrateurs"),
    item("operational_step", "Attribuer un compte ou moyen d’accès nominatif limité aux dossiers, fonctions, zones et périodes nécessaires"),
    item("operational_step", "Transmettre une information sensible par un canal autorisé en vérifiant le destinataire"),
    item("operational_step", "Retirer les droits le jour d’un départ, d’une fin de relation ou d’un changement de rôle"),
    item("recurring_control", "Tester chaque mois droits, doubles authentifications, sauvegardes, journaux, clés, badges et procédures de récupération"),
  ],
  strategy: [
    item("implementation_action", "Définir clientèles, offres, zones, canaux, capacités, prix, saisonnalité, partenaires et niveau de service prioritaires"),
    item("implementation_action", "Fixer objectifs de demandes, visites, devis, ventes, occupation, fidélisation, satisfaction, chiffre et marge"),
    item("operational_step", "Comparer toute nouvelle offre à la demande, aux compétences, à la capacité, aux obligations et au coût complet"),
    item("recurring_control", "Comparer chaque semaine demandes, disponibilités, ventes, annulations, capacité restante et charge de l’équipe"),
    item("recurring_control", "Comparer chaque mois chiffre, encaissements, coûts, utilisation, rétention, incidents, satisfaction et marge par offre"),
    item("operating_rule", "Ne pas développer une offre lorsque la capacité, la sécurité, la qualité ou la marge minimale ne peuvent pas être tenues"),
  ],
  team: [
    item("implementation_action", "Cartographier accueil, vente, exploitation, administration, compétences, horaires, responsabilités, contacts critiques et remplaçants"),
    item("operational_step", "Construire le planning selon demandes, échéances, pics, ouvertures, compétences et présence minimale"),
    item("operational_step", "Préparer chaque remplacement avec accès, priorités, dossiers sensibles, incidents, limites et personne à joindre"),
    item("operational_step", "Faire un point court sur arrivées, départs, réservations, urgences, impayés, pannes et décisions attendues"),
    item("recurring_control", "Contrôler chaque semaine absences, relais, surcharge, dossiers sans responsable, compétences manquantes et amplitudes"),
    item("operating_rule", "Ne pas laisser une fonction critique sans personne désignée ni consigne de reprise accessible"),
  ],
  payables: [
    item("implementation_action", "Créer l’échéancier des locaux, fournisseurs, logiciels, assurances, énergie, maintenance, prestations, remboursements et taxes"),
    item("operational_step", "Rapprocher contrat ou commande, service reçu, facture, avoir, responsable, centre de coût et échéance"),
    item("operational_step", "Faire valider tout écart de quantité, prix, devise, période, qualité ou service avant paiement"),
    item("recurring_control", "Revoir chaque semaine factures, prélèvements, doublons, litiges, remboursements attendus et trésorerie"),
    item("operating_rule", "Ne pas payer une dépense sans besoin, réception, justificatif, affectation et bénéficiaire vérifiables"),
  ],
  finance: [
    item("implementation_action", "Définir pour chaque offre les preuves de vente, service, prix, remise, acompte, solde, annulation, avoir, remboursement et coût direct"),
    item("operational_step", "Rapprocher contrats ou dossiers, services confirmés, factures, encaissements, rejets, avoirs et remboursements"),
    item("operational_step", "Relancer un impayé avec montant, échéance, pièces, historique et solution prévue au contrat"),
    item("recurring_control", "Contrôler chaque semaine sommes attendues, reçues, rejetées, remboursées, contestées et non affectées"),
    item("recurring_control", "Calculer chaque mois chiffre, coût direct, occupation ou volume, temps, incidents et marge par offre"),
    item("operating_rule", "Ne pas reconnaître un revenu ou une marge tant que le service, le paiement et les coûts associés ne sont pas rapprochés"),
  ],
  qualification: [
    item("implementation_action", "Créer la fiche de qualification avec identité, besoin, dates, capacité, budget, contraintes, décideur, urgence et prochaine action"),
    item("operational_step", "Répondre rapidement en confirmant la compréhension du besoin et les informations encore nécessaires"),
    item("operational_step", "Vérifier la disponibilité réelle, les dépendances, le prix complet et le délai avant de proposer"),
    item("operational_step", "Orienter vers l’offre compatible ou refuser clairement lorsque le besoin ne peut pas être tenu"),
    item("recurring_control", "Mesurer chaque semaine demandes, délais de réponse, visites ou échanges, devis, ventes, refus et motifs"),
    item("operating_rule", "Ne pas collecter une donnée sensible ou un justificatif avant d’avoir défini sa nécessité, son accès et sa conservation"),
  ],
  complaints: [
    item("implementation_action", "Tenir le registre des réclamations avec client, contrat, service, faits, impact, pièces, réponse, correction et recours"),
    item("operational_step", "Accuser réception, sécuriser la situation, préserver les preuves et annoncer le canal et le délai de traitement"),
    item("operational_step", "Comparer la demande au contrat, aux informations remises, aux confirmations, aux paiements et aux événements"),
    item("recurring_control", "Analyser chaque mois causes, délais, coûts, récurrences, partenaires ou ressources concernés et prévention"),
    item("operating_rule", "Ne pas minimiser un risque pour une personne, une perte de service, une contestation de paiement ou un défaut d’information"),
  ],
  sales: [
    item("implementation_action", "Décrire chaque offre avec contenu, périmètre, disponibilité, prix total, taxes, paiement, durée, modifications, annulation et exclusions"),
    item("operational_step", "Présenter les options en distinguant ce qui est inclus, facultatif, soumis à disponibilité ou facturé séparément"),
    item("operational_step", "Faire relire les informations essentielles puis obtenir l’accord et les signatures nécessaires sur un support durable"),
    item("operational_step", "Créer le dossier dès l’accord avec version de l’offre, contrat, parties, échéances et responsable"),
    item("recurring_control", "Contrôler chaque semaine devis expirés, contrats non signés, acomptes manquants et promesses sans confirmation"),
    item("operating_rule", "Ne pas annoncer un prix incomplet, une disponibilité non tenue, un résultat garanti ou une condition inaccessible avant la vente"),
  ],
  reservations: [
    item("implementation_action", "Cartographier les ressources et services réservables avec capacité, calendrier, dépendances, délais, prix et responsables"),
    item("operational_step", "Poser une option ou bloquer une ressource avec référence, bénéficiaire, période, quantité, expiration et conditions"),
    item("operational_step", "Vérifier avant confirmation les identités, dates, horaires, capacité, prix, paiement, dépendances et demandes acceptées"),
    item("operational_step", "Envoyer une confirmation unique avec références, contenu, accès ou déroulé, contacts, conditions et prochaine échéance"),
    item("recurring_control", "Revoir chaque jour options expirantes, doubles réservations, confirmations manquantes, changements et soldes attendus"),
    item("operating_rule", "Ne jamais considérer une option, un devis ou une demande transmise comme une réservation définitivement confirmée"),
  ],
  dossier: [
    item("implementation_action", "Créer un dossier unique avec identité, coordonnées, offre, contrat, réservations, paiements, documents, échanges et actions"),
    item("operational_step", "Nommer un responsable et afficher statut, prochaine action, échéance, blocage et personne à contacter"),
    item("operational_step", "Classer chaque nouvelle pièce ou confirmation dans la bonne version en évitant les copies contradictoires"),
    item("operational_step", "Mettre à jour le dossier après tout changement de date, service, personne, prix, paiement, accès ou condition"),
    item("recurring_control", "Contrôler les dossiers arrivant à échéance pour repérer documents, paiements, confirmations et actions manquants"),
    item("operating_rule", "Ne pas clôturer un dossier avant d’avoir rapproché le service, les paiements, les pièces et les éventuelles suites"),
  ],
  incidents: [
    item("implementation_action", "Créer les scénarios d’incident avec signal, mesure immédiate, responsable, contacts, solution, communication et preuve de clôture"),
    item("operational_step", "Qualifier gravité, personnes concernées, service affecté, risque, délai, responsabilité et marge de décision"),
    item("operational_step", "Sécuriser les personnes, isoler la ressource ou suspendre la prestation lorsque la situation l’exige"),
    item("operational_step", "Proposer une solution vérifiée, expliquer ses conséquences et obtenir l’accord requis avant exécution"),
    item("recurring_control", "Suivre chaque jour incidents ouverts, personnes à rappeler, actions partenaires, remboursements et délais"),
    item("operating_rule", "Clôturer uniquement après rétablissement ou solution, information des parties, mise à jour du dossier et action préventive"),
  ],
};

const buildCoreDraft = (): ProcessDraft => ({
  definitionsById: Object.fromEntries(
    Object.entries(processByRole).map(([role, id]) => [
      id,
      definitionsByRole[role as WelcomeServicesRole],
    ]),
  ),
  contentByProcessId: Object.fromEntries(
    Object.entries(processByRole).map(([role, id]) => [
      id,
      contentByRole[role as WelcomeServicesRole],
    ]),
  ),
});

const patch = (
  role: WelcomeServicesRole,
  contentIndex: number,
  label: string,
): ProcessContentPatch => ({
  processId: processByRole[role],
  contentIndex,
  label,
});

const profilePatches = (
  profile: WelcomeServicesProfile,
): readonly ProcessContentPatch[] => [
  patch("compliance", 0, `Sécuriser le cadre applicable : ${profile.complianceFrame}`),
  patch("compliance", 1, `Vérifier avant toute vente ou activation : ${profile.contractFrame}`),
  patch("decisions", 1, `Qualifier immédiatement : ${profile.decisionFrame}`),
  patch("access", 0, `Tenir les accès critiques : ${profile.accessFrame}`),
  patch("strategy", 0, `Choisir le positionnement : ${profile.strategyFrame}`),
  patch("team", 0, `Organiser l’équipe et les relais avec : ${profile.teamFrame}`),
  patch("payables", 0, `Prévoir et contrôler les dépenses de : ${profile.payableFrame}`),
  patch("finance", 0, `Prouver les revenus et coûts selon : ${profile.financeFrame}`),
  patch("qualification", 0, `Qualifier chaque demande avec : ${profile.qualificationFrame}`),
  patch("complaints", 0, `Tracer les réclamations portant sur : ${profile.complaintFrame}`),
  patch("sales", 0, `Décrire l’offre et le contrat avec : ${profile.salesFrame}`),
  patch("reservations", 0, `Cartographier les réservations de : ${profile.reservationFrame}`),
  patch("reservations", 2, `Contrôler avant confirmation : ${profile.confirmationFrame}`),
  patch("dossier", 0, `Ouvrir le dossier avec : ${profile.dossierFrame}`),
  patch("dossier", 3, `Mettre à jour et préparer la clôture avec : ${profile.closureFrame}`),
  patch("incidents", 0, `Préparer les scénarios critiques : ${profile.incidentFrame}`),
];

export const generateWelcomeServicesCoreDraft = () => buildCoreDraft();

export const generateWelcomeServicesDraft = (
  profile: WelcomeServicesProfile,
) =>
  composeProcessDraft(buildCoreDraft(), [
    {
      id: `metier.${profile.slug}`,
      contentPatches: profilePatches(profile),
    },
  ]);

export const welcomeServicesProfiles = {
  "agence-de-voyage": {
    slug: "agence-de-voyage",
    name: "Agence de voyage",
    sourceUrl:
      "https://docs.google.com/spreadsheets/d/1tycv2ymbAUj0uR-2KQwdDkL1n3IvyBwedX5OtZ6lslw/edit",
    researchSources: [
      "https://www.atout-france.fr/fr/immatriculation-des-operateurs-de-voyages-et-de-sejour",
      "https://registre-operateurs-de-voyages.atout-france.fr/web/rovs/garantie-financiere/assurance-rcp",
      "https://www.economie.gouv.fr/dgccrf/les-fiches-pratiques/voyages-et-sejours-forfait-les-points-verifier",
      "https://www.legifrance.gouv.fr/codes/id/LEGISCTA000006107988/",
      "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000036464065/2022-03-30",
    ],
    complianceFrame: "immatriculation Atout France, garantie financière, RCP spécifique, attestations annuelles, conditions de vente, formulaires, contrats fournisseurs, médiation et preuves d’information",
    contractFrame: "formulaire précontractuel, caractéristiques du voyage, organisateur et détaillant, prix total, paiement, annulation, assurances, frontières, formalités et exigences particulières acceptées",
    decisionFrame: "indisponibilité fournisseur, changement de prix ou horaire, destination à risque, document voyageur manquant, groupe insuffisant, impayé, annulation ou besoin d’assistance",
    accessFrame: "outil de réservation ou GDS, CRM, portails fournisseurs, dossiers voyageurs, paiements, assurances, contacts d’urgence, messagerie et comptes administrateurs",
    strategyFrame: "destinations, clientèles, forfaits ou prestations sèches, groupes, panier, fournisseurs, saisonnalité, canaux, capacité de suivi et marge par dossier",
    teamFrame: "conseil, vente, billetterie, production, suivi dossier, SAV, astreinte, langues, destinations maîtrisées, fournisseurs et relais identifiés",
    payableFrame: "compagnies, hébergeurs, réceptifs, transferts, activités, assurances, frais de réservation, devises, remboursements et échéances fournisseurs",
    financeFrame: "dossier vendu, acompte et solde client, paiements fournisseurs, commissions, frais, avoirs, remboursements, change et marge dossier",
    qualificationFrame: "destination, dates, flexibilité, voyageurs, budget, départ, transport, hébergement, rythme, accessibilité, nationalité ou résidence utile aux formalités et exigences particulières",
    complaintFrame: "information précontractuelle, non-conformité, retard, annulation, transport, hébergement, transfert, activité, prix, assistance, remboursement ou fournisseur",
    salesFrame: "destination, itinéraire, dates, nuitées, transport, hébergement, prestations, organisateur, prix total, échéancier, annulation, assurances, formalités et assistance",
    reservationFrame: "vols, trains, hébergements, transferts, locations, activités, assurances, options, contingents, chambres et prestations spéciales",
    confirmationFrame: "noms exacts, dates, horaires, correspondances, catégories, quantités, références, prix, conditions, échéances, exigences acceptées et statut fournisseur",
    dossierFrame: "identité exacte des voyageurs, coordonnées, contrat, formulaire, paiements, formalités, assurances, confirmations, références, vouchers et contacts d’assistance",
    closureFrame: "modifications, documents manquants, solde, carnet de voyage, convocations, contacts, retours voyageurs, remboursements, réclamation et marge finale",
    incidentFrame: "annulation ou retard, correspondance manquée, refus fournisseur, hébergement indisponible, maladie ou accident, document de voyage, assistance, rapatriement et remboursement",
  },
  "centre-affaires-coworking": {
    slug: "centre-affaires-coworking",
    name: "Centre d’affaires / coworking",
    sourceUrl:
      "https://docs.google.com/spreadsheets/d/1V3-r8Plyn-ITiSXY_uObFE6nyEEW2MosIvIziX_lKrg/edit",
    researchSources: [
      "https://entreprendre.service-public.fr/vosdroits/F2160?quest0=0",
      "https://entreprendre.service-public.fr/vosdroits/F37412",
      "https://entreprendre.service-public.fr/vosdroits/F31684",
      "https://www.economie.gouv.fr/dgccrf/laction-de-la-dgccrf/les-enquetes/enquete-sur-le-marche-du-coworking-un-secteur",
      "https://www.cnil.fr/fr/acces-locaux-controle-des-horaires-au-travail",
      "https://cnil.fr/fr/RGPD-exemple-information-acces-aux-locaux-professionnels-par-badge",
    ],
    complianceFrame: "bail et usages autorisés, assurance, obligations ERP, registre de sécurité, accessibilité, contrôles, règlement, contrats, RGPD, badges et agrément préfectoral lorsque la domiciliation est proposée",
    contractFrame: "client et utilisateurs, espace, capacité, durée, horaires, services inclus, prix, dépôt, préavis, règlement, visiteurs et contrat de domiciliation distinct lorsque nécessaire",
    decisionFrame: "zone dangereuse, capacité dépassée, badge perdu, intrusion, panne réseau, conflit de salle, comportement, nuisance, colis sensible, impayé ou service indisponible",
    accessFrame: "bâtiment, zones, badges, clés, Wi-Fi membre et invité, réservations, alarme, imprimantes, casiers, vidéosurveillance éventuelle et comptes administrateurs",
    strategyFrame: "postes nomades ou dédiés, bureaux, salles, événementiel, domiciliation, services, capacités, amplitudes, occupation, rétention et marge par espace",
    teamFrame: "accueil, communauté, vente, exploitation, courrier, sécurité, nettoyage, maintenance, ouverture, fermeture, astreinte et prestataires de secours",
    payableFrame: "loyer, charges, énergie, internet, nettoyage, sécurité, maintenance, café, consommables, mobilier, logiciel, prestataires et travaux",
    financeFrame: "abonnement, bureau, poste, salle, domiciliation, option, dépôt, crédit, remise, consommation, impayé, coût du site, occupation et marge par espace",
    qualificationFrame: "entreprise, effectif, fréquence, dates, durée, confidentialité, visiteurs, accessibilité, équipements, salle, adresse, courrier, budget et décisionnaire",
    complaintFrame: "accès, bruit, propreté, Wi-Fi, température, équipement, salle, facturation, sécurité, confidentialité, courrier, colis, domiciliation ou résiliation",
    salesFrame: "espace, capacité, accès, horaires, services inclus, équipements, prix, dépôt, durée, préavis, règlement, visiteurs, courrier et conditions de domiciliation",
    reservationFrame: "postes, bureaux, salles, phone boxes, équipements, événements, accueil visiteurs, parking, prestations et créneaux de maintenance",
    confirmationFrame: "site, espace, date, horaire, capacité, configuration, équipement, accès, responsable, visiteurs, prix, remise en état et conflit de planning",
    dossierFrame: "entreprise, utilisateurs autorisés, contacts, contrat, justificatifs nécessaires, facturation, dépôt, badges, clés, accès, domiciliation, courrier et consignes",
    closureFrame: "utilisateurs, accès, badges, clés, état des lieux, factures, dépôt, courrier, adresse domiciliée, préavis, restitution et suppression des droits",
    incidentFrame: "incendie ou évacuation, accident, intrusion, badge perdu, panne réseau ou énergie, fuite, équipement dangereux, capacité, conflit, courrier ou colis",
  },
} satisfies Record<string, WelcomeServicesProfile>;
