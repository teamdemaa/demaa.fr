import {
  composeProcessDraft,
  type IndustrializedContentItem,
  type IndustrializedProcessDefinition,
  type ProcessContentPatch,
  type ProcessDraft,
} from "@/lib/process-industrialization";

export type HealthBeautyRole =
  | "compliance"
  | "hygiene"
  | "decisions"
  | "access"
  | "visibility"
  | "strategy"
  | "onboarding"
  | "planning"
  | "payables"
  | "finance"
  | "acquisition"
  | "appointments"
  | "complaints"
  | "offer"
  | "openClose"
  | "service";

export type HealthBeautyProfile = {
  slug: "institut-de-beaute" | "salon-de-coiffure" | "esthetique";
  name: string;
  sourceUrl: string;
  researchSources: readonly string[];
  complianceFrame: string;
  hygieneFrame: string;
  decisionFrame: string;
  accessFrame: string;
  visibilityFrame: string;
  strategicFrame: string;
  onboardingFrame: string;
  planningFrame: string;
  payableFrame: string;
  financeFrame: string;
  acquisitionFrame: string;
  appointmentFrame: string;
  complaintFrame: string;
  offerFrame: string;
  openCloseFrame: string;
  serviceFrame: string;
};

const processByRole: Record<HealthBeautyRole, string> = {
  compliance:
    "process.sante-bien-etre.conformite-metier.etre-couvert-et-en-regle",
  hygiene:
    "process.sante-bien-etre.conformite-metier.respecter-lhygiene",
  decisions:
    "process.sante-bien-etre.direction.decider-au-quotidien-sans-le-dirigeant",
  access:
    "process.sante-bien-etre.direction.donner-acces-a-lessentiel",
  visibility:
    "process.sante-bien-etre.direction.garder-une-visibilite-sans-reprendre-la-main",
  strategy:
    "process.sante-bien-etre.direction.savoir-ou-va-lentreprise",
  onboarding:
    "process.sante-bien-etre.equipe.integrer-un-nouvel-employe",
  planning:
    "process.sante-bien-etre.equipe.organiser-les-equipes-remplacer-un-absent",
  payables: "process.sante-bien-etre.finance-admin.payer-a-temps",
  finance: "process.sante-bien-etre.finance-admin.suivre-largent",
  acquisition:
    "process.sante-bien-etre.marketing-vente.attirer-les-clients",
  appointments:
    "process.sante-bien-etre.marketing-vente.gerer-les-rendez-vous-fideliser",
  complaints:
    "process.sante-bien-etre.marketing-vente.traiter-une-reclamation-client",
  offer:
    "process.sante-bien-etre.marketing-vente.vendre-offre-de-prestation-claire",
  openClose:
    "process.sante-bien-etre.operations.ouvrir-et-fermer-letablissement",
  service:
    "process.sante-bien-etre.operations.standardiser-une-prestation",
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
  HealthBeautyRole,
  IndustrializedProcessDefinition
> = {
  compliance: def(
    "Maintenir les qualifications, assurances et informations obligatoires adaptées aux prestations proposées.",
    "Ouverture, nouvelle prestation, arrivée, échéance ou contrôle.",
    "Des preuves à jour et un périmètre d’activité maîtrisé.",
    "Dirigeant",
    "Mensuelle",
  ),
  hygiene: def(
    "Prévenir les contaminations et expositions liées aux personnes, produits, outils et surfaces.",
    "Ouverture, changement de client, incident ou fin de journée.",
    "Un poste propre, du matériel traité et des produits utilisables.",
    "Responsable de prestation",
    "À chaque prestation",
  ),
  decisions: def(
    "Permettre les arbitrages courants sans exposer le client, l’équipe ou l’entreprise.",
    "Retard, absence, réaction, matériel défaillant ou demande inhabituelle.",
    "Une décision prise dans une limite connue et une alerte tracée.",
    "Responsable présent",
    "Quotidienne",
  ),
  access: def(
    "Donner à chacun les accès nécessaires sans exposer les données clientes ni les comptes critiques.",
    "Arrivée, départ, remplacement ou changement d’outil.",
    "Des accès individuels, limités et récupérables.",
    "Dirigeant",
    "Mensuelle",
  ),
  visibility: def(
    "Suivre l’activité sans reprendre les tâches déjà attribuées.",
    "Revue d’activité ou alerte sur un indicateur.",
    "Des écarts visibles avec un responsable et une prochaine action.",
    "Dirigeant",
    "Hebdomadaire",
  ),
  strategy: def(
    "Choisir les prestations, capacités et clientèles qui rendent l’activité durable.",
    "Revue mensuelle ou évolution importante de la demande.",
    "Une offre rentable compatible avec les compétences et les ressources.",
    "Dirigeant",
    "Mensuelle",
  ),
  onboarding: def(
    "Rendre une nouvelle personne autonome sans raccourci sur l’hygiène, la sécurité ou la relation client.",
    "Arrivée, changement de poste ou nouvelle prestation.",
    "Des compétences observées et des accès validés.",
    "Dirigeant ou référent",
    "À chaque arrivée",
  ),
  planning: def(
    "Construire un planning réalisable et assurer la continuité en cas d’absence.",
    "Ouverture du planning, absence ou surcharge.",
    "Des rendez-vous affectés aux bonnes compétences et ressources.",
    "Responsable planning",
    "Quotidienne",
  ),
  payables: def(
    "Payer les fournisseurs à partir de commandes et livraisons vérifiées.",
    "Facture, échéance ou litige fournisseur.",
    "Une dépense justifiée, affectée et payée une seule fois.",
    "Responsable administratif",
    "Hebdomadaire",
  ),
  finance: def(
    "Suivre les recettes, dépenses, marges et besoins de trésorerie.",
    "Clôture de caisse, revue hebdomadaire ou alerte.",
    "Des flux rapprochés et des décisions prises sur des données réelles.",
    "Dirigeant",
    "Hebdomadaire",
  ),
  acquisition: def(
    "Attirer des clientes compatibles avec le positionnement et la capacité disponibles.",
    "Plan mensuel ou créneau à remplir.",
    "Des demandes qualifiées, mesurées par canal.",
    "Responsable commercial",
    "Hebdomadaire",
  ),
  appointments: def(
    "Transformer la demande en rendez-vous préparé puis en relation suivie.",
    "Nouvelle demande, confirmation, annulation ou fin de prestation.",
    "Un agenda fiable avec les informations utiles et une relance appropriée.",
    "Accueil ou praticien",
    "Quotidienne",
  ),
  complaints: def(
    "Traiter les insatisfactions et réactions à partir de faits conservés.",
    "Réclamation, réaction ou contestation.",
    "Une réponse rapide, une mesure adaptée et une prévention.",
    "Dirigeant",
    "À chaque réclamation",
  ),
  offer: def(
    "Présenter une prestation compréhensible avec prix, contenu, limites et conditions.",
    "Création, vente ou modification d’une offre.",
    "Un accord éclairé sans promesse ambiguë.",
    "Responsable de prestation",
    "À chaque vente",
  ),
  openClose: def(
    "Ouvrir et fermer l’activité avec des locaux, outils, produits et encaissements maîtrisés.",
    "Début ou fin de journée.",
    "Un espace prêt à recevoir puis sécurisé et rapproché.",
    "Responsable d’ouverture",
    "Quotidienne",
  ),
  service: def(
    "Réaliser chaque prestation selon un protocole constant et traçable.",
    "Rendez-vous confirmé.",
    "Une prestation adaptée, contrôlée et clôturée avec des conseils utiles.",
    "Professionnel réalisant la prestation",
    "À chaque prestation",
  ),
};

const contentByRole: Record<HealthBeautyRole, IndustrializedContentItem[]> = {
  compliance: [
    item("implementation_action", "Lister les prestations avec qualification, formation, assurance, information client et restriction applicables"),
    item("operational_step", "Vérifier avant lancement qu’une personne qualifiée contrôle réellement la prestation concernée"),
    item("recurring_control", "Revoir chaque mois diplômes, attestations, RC professionnelle, affichages, contrats et échéances"),
    item("operating_rule", "Ne jamais réaliser un acte médical, thérapeutique ou hors du champ autorisé de l’activité"),
  ],
  hygiene: [
    item("implementation_action", "Écrire un plan d’hygiène par zone, outil et prestation avec produit, dilution, temps de contact et fréquence"),
    item("operational_step", "Séparer avant chaque cliente le matériel propre, utilisé, à désinfecter et à usage unique"),
    item("operational_step", "Nettoyer puis désinfecter les surfaces et outils selon leur usage et les instructions des produits"),
    item("recurring_control", "Contrôler chaque semaine dates, étiquetage, stockage, fiches de données de sécurité, linge et déchets"),
    item("operating_rule", "Jeter le consommable à usage unique et isoler tout produit ou matériel contaminé, périmé ou mal identifié"),
  ],
  decisions: [
    item("implementation_action", "Définir les décisions autorisées avec seuil de remise, retard, remplacement, incident et personne à prévenir"),
    item("operational_step", "Qualifier l’écart : sécurité, réaction, hygiène, compétence, matériel, planning, paiement ou insatisfaction"),
    item("operational_step", "Suspendre la prestation et appliquer la mesure conservatoire lorsque la sécurité ou une contre-indication est possible"),
    item("recurring_control", "Revoir chaque jour les rendez-vous déplacés, gestes interrompus, produits isolés et clientes à rappeler"),
    item("operating_rule", "Ne pas improviser un geste, un produit ou une promesse pour éviter une annulation"),
  ],
  access: [
    item("implementation_action", "Tenir le registre des comptes d’agenda, caisse, messagerie, réseaux, fichiers clientes et administrateurs"),
    item("operational_step", "Attribuer des comptes individuels limités aux rendez-vous, données et fonctions nécessaires"),
    item("operational_step", "Retirer le jour même les accès d’une personne qui part et transférer les éléments utiles"),
    item("recurring_control", "Tester chaque mois récupération, double authentification, sauvegarde et droits des comptes critiques"),
  ],
  visibility: [
    item("implementation_action", "Créer un tableau court avec rendez-vous, occupation, panier, ventes, annulations, retours, caisse et trésorerie"),
    item("operational_step", "Attribuer à chaque écart un responsable, une action et une date de revue"),
    item("recurring_control", "Lire chaque semaine les indicateurs et ouvrir seulement les dossiers présentant une anomalie"),
    item("operating_rule", "Ne pas reprendre une tâche déléguée lorsque l’indicateur est au vert et la preuve disponible"),
  ],
  strategy: [
    item("implementation_action", "Choisir les prestations, clientèles, gammes de prix, horaires et zones qui doivent porter l’activité"),
    item("operational_step", "Comparer la demande aux compétences, temps, postes, équipements et contraintes d’hygiène disponibles"),
    item("operational_step", "Classer les prestations selon demande, panier, marge, récurrence, risque et capacité"),
    item("recurring_control", "Comparer chaque mois rendez-vous, occupation, panier, ventes additionnelles, retours, marge et trésorerie"),
    item("operating_rule", "Ne pas ajouter une prestation avant d’avoir validé compétence, protocole, coût, durée, information et capacité"),
  ],
  onboarding: [
    item("implementation_action", "Créer un parcours avec accueil client, hygiène, poste, protocole, produits, caisse, incidents et limites"),
    item("operational_step", "Faire observer puis réaliser chaque prestation sous contrôle avant autonomie"),
    item("recurring_control", "Valider sur une grille les compétences, temps, qualité, hygiène, conseil et traçabilité"),
    item("operating_rule", "Ne pas ouvrir l’agenda autonome avant validation des gestes et situations à risque"),
  ],
  planning: [
    item("implementation_action", "Tenir une matrice des compétences, horaires, postes, équipements et prestations autorisées"),
    item("operational_step", "Affecter chaque rendez-vous selon durée réelle, compétence, ressource, préparation et remise en état"),
    item("operational_step", "Préparer les remplacements avec clientes à prévenir, accès, fiches utiles et prestations transférables"),
    item("recurring_control", "Contrôler chaque jour absences, retards, doubles réservations, temps de rotation et pauses"),
    item("operating_rule", "Ne pas déplacer une cliente vers une personne non validée pour la prestation réservée"),
  ],
  payables: [
    item("implementation_action", "Créer le calendrier des loyers, logiciels, énergie, produits, linge, maintenance, assurances et taxes"),
    item("operational_step", "Rapprocher commande, réception, quantité, lot éventuel, facture, avoir et échéance"),
    item("recurring_control", "Contrôler chaque semaine factures en attente, prélèvements, doublons, litiges et trésorerie disponible"),
    item("operating_rule", "Ne pas payer une facture sans fournisseur identifié, réception vérifiée et affectation connue"),
  ],
  finance: [
    item("implementation_action", "Définir les comptes de caisse, banque, cartes cadeaux, acomptes, forfaits, produits et prestations"),
    item("operational_step", "Rapprocher chaque jour agenda, prestations réalisées, ventes, remises, moyens de paiement et caisse"),
    item("operational_step", "Calculer par prestation chiffre d’affaires, temps, consommables, commission éventuelle et marge"),
    item("recurring_control", "Suivre chaque semaine impayés, acomptes, avoirs, cartes cadeaux, charges à venir et solde disponible"),
    item("operating_rule", "Ne pas enregistrer un forfait encaissé comme entièrement consommé avant la réalisation des séances"),
  ],
  acquisition: [
    item("implementation_action", "Choisir deux canaux principaux et définir pour chacun offre, cible, zone, preuve, budget et appel à l’action"),
    item("operational_step", "Mettre à jour fiche Google Business Profile, horaires, prestations, photos réelles et prise de rendez-vous"),
    item("operational_step", "Publier des preuves autorisées : résultat réaliste, avis, expertise, équipe, lieu et protocole"),
    item("recurring_control", "Mesurer chaque semaine demandes, rendez-vous pris, présence, panier et coût par canal"),
    item("operating_rule", "Ne pas utiliser de photo cliente, d’allégation médicale ou de résultat garanti sans base et autorisation adaptées"),
  ],
  appointments: [
    item("implementation_action", "Créer la trame de réservation avec prestation, durée, professionnel, contre-indications à vérifier, prix et conditions"),
    item("operational_step", "Confirmer date, lieu, préparation, acompte éventuel, retard, annulation et moyen de contact"),
    item("operational_step", "Envoyer un rappel puis réaffecter rapidement les créneaux annulés selon la liste d’attente"),
    item("operational_step", "Clôturer avec paiement, prochaine échéance utile, conseil d’entretien et demande d’avis non forcée"),
    item("recurring_control", "Analyser chaque semaine annulations, absences, retards, reprogrammations et taux de retour"),
  ],
  complaints: [
    item("implementation_action", "Créer un registre avec cliente, prestation, professionnel, produit ou appareil, faits, photos autorisées et réponse"),
    item("operational_step", "Accuser réception, arrêter l’usage concerné et orienter vers un professionnel de santé si les signes le justifient"),
    item("operational_step", "Comparer fiche cliente, protocole, produits, lots, réglages, conseils et échanges avant décision"),
    item("recurring_control", "Analyser chaque mois les récurrences et corriger protocole, formation, produit, matériel ou information"),
  ],
  offer: [
    item("implementation_action", "Créer une fiche par prestation avec objectif esthétique, contenu, durée, prix TTC, limites, entretien et conditions"),
    item("operational_step", "Vérifier le besoin, l’historique utile, les attentes, sensibilités et contre-indications sans poser de diagnostic"),
    item("operational_step", "Présenter les options, résultats réalistes, entretien, coût total et prestations supplémentaires avant accord"),
    item("recurring_control", "Comparer chaque mois offres vues, vendues, réalisées, reprogrammées, remboursées et marge"),
    item("operating_rule", "Ne pas vendre une cure, un forfait ou un produit si l’adéquation, les limites et le coût total restent ambigus"),
  ],
  openClose: [
    item("implementation_action", "Créer les checklists d’ouverture et fermeture avec locaux, agenda, caisse, produits, appareils, linge et sécurité"),
    item("operational_step", "À l’ouverture, vérifier propreté, eau, ventilation, éclairage, matériel, consommables et premiers rendez-vous"),
    item("operational_step", "Préparer les postes dans l’ordre du planning sans laisser accessibles les données ou produits sensibles"),
    item("operational_step", "À la fermeture, traiter matériel et linge, isoler déchets, arrêter appareils, sécuriser produits et locaux"),
    item("recurring_control", "Rapprocher la caisse et transmettre les incidents, ruptures, maintenances et rappels du lendemain"),
  ],
  service: [
    item("implementation_action", "Écrire une fiche par prestation avec préparation, étapes, temps, produits, matériel, contrôles et conseils"),
    item("operational_step", "Accueillir, confirmer la prestation et vérifier attentes, historique utile, état observable et points d’alerte"),
    item("operational_step", "Préparer le poste et tracer les produits, références, lots ou réglages utiles à la sécurité et au suivi"),
    item("operational_step", "Réaliser le protocole en observant confort, réaction, temps, résultat et nécessité d’arrêter"),
    item("operating_rule", "Clôturer avec contrôle, traçabilité, conseils adaptés et orientation si une anomalie dépasse le champ esthétique"),
  ],
};

const buildCoreDraft = (): ProcessDraft => ({
  definitionsById: Object.fromEntries(
    Object.entries(processByRole).map(([role, id]) => [
      id,
      definitionsByRole[role as HealthBeautyRole],
    ]),
  ),
  contentByProcessId: Object.fromEntries(
    Object.entries(processByRole).map(([role, id]) => [
      id,
      contentByRole[role as HealthBeautyRole],
    ]),
  ),
});

const patch = (
  role: HealthBeautyRole,
  contentIndex: number,
  label: string,
): ProcessContentPatch => ({
  processId: processByRole[role],
  contentIndex,
  label,
});

const profilePatches = (
  profile: HealthBeautyProfile,
): readonly ProcessContentPatch[] => [
  patch("compliance", 0, `Sécuriser le périmètre professionnel : ${profile.complianceFrame}`),
  patch("hygiene", 0, `Construire le plan d’hygiène autour de : ${profile.hygieneFrame}`),
  patch("decisions", 1, `Qualifier les alertes métier : ${profile.decisionFrame}`),
  patch("access", 0, `Tenir les accès indispensables : ${profile.accessFrame}`),
  patch("visibility", 0, `Piloter l’activité avec : ${profile.visibilityFrame}`),
  patch("strategy", 0, `Choisir le positionnement : ${profile.strategicFrame}`),
  patch("onboarding", 0, `Former chaque nouvelle personne à : ${profile.onboardingFrame}`),
  patch("planning", 0, `Planifier les ressources suivantes : ${profile.planningFrame}`),
  patch("payables", 0, `Prévoir et contrôler les dépenses de : ${profile.payableFrame}`),
  patch("finance", 2, `Calculer la rentabilité avec : ${profile.financeFrame}`),
  patch("acquisition", 0, `Construire l’acquisition autour de : ${profile.acquisitionFrame}`),
  patch("appointments", 0, `Qualifier les rendez-vous avec : ${profile.appointmentFrame}`),
  patch("complaints", 0, `Documenter les incidents propres au métier : ${profile.complaintFrame}`),
  patch("offer", 0, `Présenter clairement l’offre : ${profile.offerFrame}`),
  patch("openClose", 0, `Ouvrir et fermer en contrôlant : ${profile.openCloseFrame}`),
  patch("service", 0, `Standardiser la prestation avec : ${profile.serviceFrame}`),
];

export const generateHealthBeautyCoreDraft = () => buildCoreDraft();

export const generateHealthBeautyDraft = (profile: HealthBeautyProfile) =>
  composeProcessDraft(buildCoreDraft(), [
    {
      id: `metier.${profile.slug}`,
      contentPatches: profilePatches(profile),
    },
  ]);

const commonResearchSources = [
  "https://www.economie.gouv.fr/dgccrf/les-fiches-pratiques/faq-encadrement-des-soins-esthetiques-et-de-la-coiffure",
  "https://www.economie.gouv.fr/dgccrf/les-fiches-pratiques/ticket-de-caisse-et-de-carte-bancaire",
  "https://www.inrs.fr/actualites/TutoPrev-Accueil-nouveaux-embauches.html",
] as const;

export const healthBeautyProfiles = {
  "institut-de-beaute": {
    slug: "institut-de-beaute",
    name: "Institut de beauté",
    sourceUrl:
      "https://docs.google.com/spreadsheets/d/13lUrOhMHJ8bF4wNyBNEiFL9EiC5qHJNu83M3ak8B6Js/edit",
    researchSources: [
      ...commonResearchSources,
      "https://www.inrs.fr/metiers/commerce-service/soins-esthetiques.html",
    ],
    complianceFrame: "qualification esthétique, contrôle effectif, assurance, affichage des prix, appareils utilisés, information préalable et actes exclus",
    hygieneFrame: "cabines, tables, linge, spatules, pinces, appareils, zones humides, produits cosmétiques, cire et déchets",
    decisionFrame: "réaction cutanée, contre-indication déclarée, appareil défaillant, cabine indisponible, produit douteux, retard de cure ou demande hors champ",
    accessFrame: "agenda multi-cabines, caisse, fichier clientes, cartes cadeaux, cures, appareils, stocks, réseaux et comptes administrateurs",
    visibilityFrame: "occupation des cabines, rendez-vous, panier, cures vendues et consommées, ventes produits, annulations, retours, marge et caisse",
    strategicFrame: "soins visage et corps, épilation, onglerie ou appareils autorisés selon qualifications, cabines, équipe, récurrence et marge",
    onboardingFrame: "accueil, préparation cabine, hygiène, diagnostic esthétique non médical, protocoles, appareils autorisés, conseil produit et conduite à tenir",
    planningFrame: "esthéticiennes, cabines, tables, appareils, temps de nettoyage, cures, pauses et prestations incompatibles en parallèle",
    payableFrame: "loyer, agenda, linge, cosmétiques, cire, consommables, appareils, maintenance, cartes cadeaux et assurance",
    financeFrame: "temps cabine, esthéticienne, dose produit, consommables, appareil, linge, commission, cure consommée et vente complémentaire",
    acquisitionFrame: "Google Business Profile, avis, résultats réalistes autorisés, partenariats locaux, cures saisonnières et remplissage des cabines",
    appointmentFrame: "soin réservé, zone, durée, cabine, professionnelle, cure, appareil éventuel, préparation, contre-indications à vérifier et acompte",
    complaintFrame: "réaction, brûlure, douleur, résultat, produit et lot, appareil et réglage, cabine, hygiène, cure, prix ou conseil",
    offerFrame: "zone, objectif esthétique, étapes, durée, prix TTC, nombre de séances, consommables, entretien, limites et contre-indications",
    openCloseFrame: "cabines, linge propre et sale, chauffe-cire, appareils, ventilation, eau, caisse, cartes cadeaux, stocks et déchets",
    serviceFrame: "fiche cliente, observation de la peau, contre-indications, cabine, produits et lots, appareil et réglages, confort, résultat et conseils",
  },
  "salon-de-coiffure": {
    slug: "salon-de-coiffure",
    name: "Salon de coiffure",
    sourceUrl:
      "https://docs.google.com/spreadsheets/d/12tXehH0mQLIim6mFjhXAeLXVg_CHNOhz0Faizjxs9hc/edit",
    researchSources: [
      ...commonResearchSources,
      "https://www.inrs.fr/metiers/commerce-service/coiffure/coiffure-risques.html",
    ],
    complianceFrame: "qualification de coiffure adaptée au lieu d’exercice, contrôle effectif du salon, assurance, prix intérieurs et extérieurs, ventes et sécurité des produits",
    hygieneFrame: "fauteuils, bacs, peignes, brosses, ciseaux, tondeuses, rasoirs, serviettes, capes, bols, pinceaux, produits techniques et cheveux",
    decisionFrame: "cuir chevelu anormal, allergie connue, test requis par le produit, formule incertaine, casse, bac ou appareil défaillant, retard ou résultat technique imprévu",
    accessFrame: "agenda par coiffeur et fauteuil, caisse, fichier clientes, fiches techniques, formules couleur, stock, réseaux et comptes administrateurs",
    visibilityFrame: "occupation fauteuils et bacs, heures vendues, panier, couleur, revente, annulations, retouches, marge par service et caisse",
    strategicFrame: "coupe, coiffage, couleur, balayage, texture, barber ou événementiel selon équipe, technicité, fauteuils, bacs et temps",
    onboardingFrame: "accueil, diagnostic capillaire non médical, shampoing, coupe, technique, colorimétrie, produits, ergonomie, hygiène et formule cliente",
    planningFrame: "coiffeurs, compétences techniques, fauteuils, bacs, temps de pose, assistance, pauses, nettoyage et enchaînement des services",
    payableFrame: "loyer, agenda, linge, colorations, oxydants, shampoings, gants, consommables, matériel, affûtage, maintenance et assurance",
    financeFrame: "temps coiffeur et assistant, fauteuil, bac, dose couleur, oxydant, consommables, remise, commission, retouche et revente",
    acquisitionFrame: "Google Business Profile, résultats autorisés, avis, recommandation, réseaux locaux, offres de découverte et créneaux techniques disponibles",
    appointmentFrame: "service, longueur et densité, historique technique utile, résultat attendu, durée, coiffeur, test ou diagnostic préalable, budget et acompte",
    complaintFrame: "coupe, teinte, reflet, couverture, casse, irritation, tache, formule, produit et lot, temps de pose, retard, prix ou conseil",
    offerFrame: "diagnostic, service principal, longueur ou dose, technique, soin, coiffage, prix TTC ou fourchette justifiée, durée, entretien et supplément accepté",
    openCloseFrame: "fauteuils, bacs, linge, outils de coupe, appareils chauffants, ventilation, produits techniques, caisse, stock et déchets",
    serviceFrame: "diagnostic cheveux et cuir chevelu, historique technique, formule et dosage, test selon notice, temps de pose, rinçage, contrôle et conseil",
  },
  esthetique: {
    slug: "esthetique",
    name: "Esthétique",
    sourceUrl:
      "https://docs.google.com/spreadsheets/d/1QHzhE2hKTHhO1_mpwRVf_P-O3pOabEEAfhPpCEDNsxA/edit",
    researchSources: [
      ...commonResearchSources,
      "https://www.inrs.fr/metiers/commerce-service/soins-esthetiques.html",
    ],
    complianceFrame: "qualification esthétique personnelle, assurance couvrant les déplacements, prix et frais annoncés, matériel transporté, information client et actes exclus",
    hygieneFrame: "mallette propre, contenants fermés, linge emballé, consommables, pinces, surfaces du domicile, eau disponible, séparation propre-sale et déchets rapportés",
    decisionFrame: "domicile inadapté, hygiène insuffisante, animal ou enfant dans la zone, réaction cutanée, produit renversé, matériel abîmé, retard de trajet ou demande hors champ",
    accessFrame: "agenda mobile, itinéraires, paiement, fichier clientes, documents de consentement, stock transporté, messagerie et téléphone professionnel",
    visibilityFrame: "temps de déplacement, kilomètres, rendez-vous, panier, annulations, clientes récurrentes, consommables, marge par tournée et encaissements",
    strategicFrame: "prestations esthétiques réalisables seule en cabine légère ou à domicile selon qualification, temps de trajet, matériel, hygiène et rentabilité",
    onboardingFrame: "préparation de tournée, installation au domicile, séparation propre-sale, ergonomie, protocole, encaissement mobile, incident et départ",
    planningFrame: "professionnelle, zones géographiques, temps de trajet, pauses, mallette, stock embarqué, linge, batterie, stationnement et marge de retard",
    payableFrame: "véhicule ou transport, assurance, réservation, paiement mobile, cosmétiques, linge, consommables, mallette, appareil portable et entretien",
    financeFrame: "temps de prestation et trajet, kilomètres, stationnement, dose produit, consommables, linge, paiement, annulation et retour à vide",
    acquisitionFrame: "Google Business Profile de zone de service, bouche-à-oreille, avis, partenaires locaux, réseaux géolocalisés et tournées regroupées",
    appointmentFrame: "adresse et accès, prestation, zone, conditions du lieu, durée, trajet, installation, eau ou prise nécessaire, préparation et acompte",
    complaintFrame: "lieu, installation, hygiène disponible, réaction, produit et lot, matériel portable, temps, déplacement, prix ou objet oublié",
    offerFrame: "prestation, zone desservie, durée, matériel fourni, conditions du lieu, prix TTC, frais de déplacement, annulation, limites et entretien",
    openCloseFrame: "planning de tournée, itinéraire, mallette, linge emballé, consommables, batteries, paiement mobile, nettoyage au retour et stock",
    serviceFrame: "validation du lieu, installation propre, fiche cliente, contre-indications, produits et lots, matériel portable, rangement propre-sale et conseils",
  },
} satisfies Record<string, HealthBeautyProfile>;
