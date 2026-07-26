import {
  composeProcessDraft,
  type IndustrializedContentItem,
  type IndustrializedProcessDefinition,
  type ProcessContentPatch,
  type ProcessDraft,
} from "@/lib/process-industrialization";

const P = {
  cap: "process.fast-food.direction.savoir-ou-va-lentreprise",
  decisions:
    "process.fast-food.direction.decider-au-quotidien-sans-le-dirigeant",
  access: "process.fast-food.direction.donner-acces-a-lessentiel",
  review:
    "process.fast-food.direction.garder-une-visibilite-sans-reprendre-la-main",
  acquisition:
    "process.fast-food.marketing-vente.attirer-de-nouveaux-clients",
  sales: "process.fast-food.marketing-vente.vendre-offre-claire",
  loyalty:
    "process.fast-food.marketing-vente.faire-revenir-les-clients",
  complaint:
    "process.fast-food.marketing-vente.traiter-une-reclamation-client",
  opening:
    "process.fast-food.operations.ouvrir-et-fermer-le-point-de-vente",
  recipes:
    "process.fast-food.operations.preparer-les-plats-de-facon-identique",
  stations:
    "process.fast-food.operations.tenir-chaque-poste-de-travail",
  stock: "process.fast-food.operations.ne-jamais-manquer-de-stock",
  quality:
    "process.fast-food.operations.verifier-la-qualite-en-continu",
  team:
    "process.fast-food.equipe.organiser-les-equipes-remplacer-un-absent",
  onboarding:
    "process.fast-food.equipe.integrer-un-nouvel-employe",
  cash:
    "process.fast-food.finance-admin.suivre-largent-et-les-encaissements",
  expenses: "process.fast-food.finance-admin.payer-a-temps",
  hygiene:
    "process.fast-food.conformite-metier.respecter-lhygiene-alimentaire",
  nonConformity:
    "process.fast-food.conformite-metier.traiter-une-non-conformite-hygiene",
  maintenance:
    "process.fast-food.materiel-approvisionnement.eviter-larret-par-panne",
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

export const fastFoodFamilyCoreDraft: ProcessDraft = {
  definitionsById: {
    [P.cap]: def(
      "Fixer les priorités de vente, marge et capacité de production.",
      "Début de trimestre ou écart important.",
      "Des objectifs chiffrés compatibles avec la capacité réelle.",
      "Dirigeant",
      "Trimestrielle",
    ),
    [P.decisions]: def(
      "Permettre à l’équipe de décider pendant le service sans attendre le dirigeant.",
      "Incident client, rupture, absence ou panne.",
      "Des décisions rapides prises dans des limites écrites.",
      "Dirigeant ou responsable d’exploitation",
      "Mensuelle",
    ),
    [P.access]: def(
      "Sécuriser les clés, alarmes, caisses et comptes de commande.",
      "Arrivée, départ ou changement de poste.",
      "Des accès nominatifs, limités et récupérables.",
      "Responsable d’exploitation",
      "Mensuelle",
    ),
    [P.review]: def(
      "Piloter ventes, marge, qualité, équipe et gaspillage.",
      "Point de gestion.",
      "Des écarts expliqués et des actions datées.",
      "Dirigeant",
      "Mensuelle",
    ),
    [P.acquisition]: def(
      "Attirer des clients sur les canaux réellement rentables.",
      "Préparation du calendrier commercial.",
      "Des campagnes locales mesurées par canal.",
      "Responsable commercial",
      "Mensuelle",
    ),
    [P.sales]: def(
      "Transformer une demande en commande exacte et rentable.",
      "Commande sur place, à emporter, en ligne ou par téléphone.",
      "Une commande comprise, confirmée et transmise sans erreur.",
      "Responsable de prise de commande",
      "Quotidienne",
    ),
    [P.loyalty]: def(
      "Faire revenir les clients sans sollicitation excessive.",
      "Commande terminée ou événement client utile.",
      "Des relances consenties qui génèrent des retours.",
      "Responsable commercial",
      "Mensuelle",
    ),
    [P.complaint]: def(
      "Résoudre une erreur ou insatisfaction de façon constante.",
      "Réclamation, avis négatif ou erreur de commande.",
      "Une solution tracée et une cause traitée.",
      "Responsable de service",
      "À chaque réclamation",
    ),
    [P.opening]: def(
      "Ouvrir et fermer le site sans oubli critique.",
      "Début et fin d’exploitation.",
      "Un site prêt, propre, approvisionné et sécurisé.",
      "Responsable d’ouverture ou fermeture",
      "Quotidienne",
    ),
    [P.recipes]: def(
      "Produire chaque recette avec le même coût, grammage et résultat.",
      "Chaque préparation ou changement de carte.",
      "Une production reproductible avec une marge maîtrisée.",
      "Responsable de production",
      "Quotidienne",
    ),
    [P.stations]: def(
      "Standardiser la tenue de chaque poste avant, pendant et après le service.",
      "Prise de poste ou remplacement.",
      "Un poste transmissible sans baisse de sécurité ni de qualité.",
      "Responsable de service",
      "Quotidienne",
    ),
    [P.stock]: def(
      "Éviter rupture, surstock et perte de denrées.",
      "Réception, inventaire ou seuil atteint.",
      "Les produits utiles sont disponibles et tournent correctement.",
      "Responsable des stocks",
      "Hebdomadaire",
    ),
    [P.quality]: def(
      "Détecter les écarts avant qu’ils n’atteignent le client.",
      "Préparation, service et fin de service.",
      "Des produits conformes et des écarts corrigés immédiatement.",
      "Responsable de service",
      "Quotidienne",
    ),
    [P.team]: def(
      "Couvrir les postes nécessaires selon les volumes prévus.",
      "Construction du planning, pic ou absence.",
      "Un planning réalisable avec des remplaçants identifiés.",
      "Responsable d’exploitation",
      "Hebdomadaire",
    ),
    [P.onboarding]: def(
      "Rendre une recrue autonome uniquement sur les postes validés.",
      "Arrivée d’un salarié.",
      "Des compétences observées et autorisées par poste.",
      "Manager",
      "À chaque arrivée",
    ),
    [P.cash]: def(
      "Sécuriser les encaissements et connaître la marge réelle.",
      "Clôture de caisse et fin de période.",
      "Des ventes rapprochées et des écarts expliqués.",
      "Dirigeant ou responsable administratif",
      "Quotidienne",
    ),
    [P.expenses]: def(
      "Anticiper fournisseurs, salaires, loyers, taxes et plateformes.",
      "Nouvelle facture ou revue de trésorerie.",
      "Aucune échéance critique oubliée.",
      "Responsable administratif",
      "Mensuelle",
    ),
    [P.hygiene]: def(
      "Appliquer le plan de maîtrise sanitaire à chaque étape.",
      "Réception, stockage, préparation, service et nettoyage.",
      "Des denrées sûres avec des preuves conservées.",
      "Référent hygiène",
      "Quotidienne",
    ),
    [P.nonConformity]: def(
      "Isoler et traiter toute non-conformité alimentaire.",
      "Température, allergène, lot, nettoyage ou produit non conforme.",
      "Le risque est bloqué, documenté et corrigé.",
      "Référent hygiène",
      "À chaque non-conformité",
    ),
    [P.maintenance]: def(
      "Prévenir l’arrêt d’un équipement critique.",
      "Anomalie, échéance d’entretien ou contrôle d’ouverture.",
      "Un équipement entretenu avec une solution de secours connue.",
      "Responsable d’exploitation",
      "Mensuelle",
    ),
  },
  contentByProcessId: {
    [P.cap]: [
      item("implementation_action", "Choisir les offres, canaux et créneaux qui doivent porter la croissance"),
      item("implementation_action", "Fixer des objectifs de chiffre d’affaires, marge brute, ticket moyen et volume"),
      item("recurring_control", "Comparer chaque mois objectifs, ventes, coût matière et capacité utilisée"),
      item("operating_rule", "Ne pas ajouter une offre sans prix de revient, temps de production et seuil de vente"),
    ],
    [P.decisions]: [
      item("implementation_action", "Écrire les limites de remboursement, geste client, achat urgent et retrait produit"),
      item("operational_step", "Classer l’incident selon son impact client, hygiène, production, équipe et caisse"),
      item("operating_rule", "Faire remonter immédiatement risque sanitaire, accident, fraude ou arrêt complet"),
    ],
    [P.access]: [
      item("implementation_action", "Tenir un registre des clés, alarmes, caisses, plateformes et comptes fournisseurs"),
      item("operational_step", "Attribuer les accès selon le poste et retirer ceux d’un salarié le jour de son départ"),
      item("recurring_control", "Tester chaque mois les contacts d’urgence et la récupération des comptes critiques"),
    ],
    [P.review]: [
      item("implementation_action", "Créer un tableau mensuel avec ventes, coût matière, masse salariale, pertes et avis"),
      item("operational_step", "Séparer les résultats par canal, créneau et famille de produits"),
      item("recurring_control", "Identifier chaque mois les trois écarts qui coûtent le plus"),
      item("recurring_control", "Attribuer à chaque correction un responsable, une date et un indicateur"),
    ],
    [P.acquisition]: [
      item("implementation_action", "Construire un calendrier local avec saisons, événements et périodes creuses"),
      item("operational_step", "Maintenir Google Business Profile avec horaires, carte, photos et lien de commande exacts"),
      item("operational_step", "Publier chaque offre avec canal, cible, capacité disponible et durée"),
      item("recurring_control", "Mesurer chaque mois commandes et marge réellement attribuables à chaque canal"),
    ],
    [P.sales]: [
      item("implementation_action", "Créer une carte lisible avec prix, options, suppléments et allergènes accessibles"),
      item("operational_step", "Confirmer produit, quantité, cuisson, options, allergènes, heure et mode de remise"),
      item("operational_step", "Répéter la commande et transmettre une information unique à la production"),
      item("recurring_control", "Suivre chaque semaine ticket moyen, annulations, erreurs et temps d’attente"),
    ],
    [P.loyalty]: [
      item("implementation_action", "Définir les événements utiles de relance et recueillir le consentement"),
      item("operational_step", "Envoyer une offre ciblée selon fréquence, préférence ou date pertinente"),
      item("recurring_control", "Mesurer retours, désabonnements et marge générée par les campagnes"),
    ],
    [P.complaint]: [
      item("implementation_action", "Créer un registre avec commande, canal, erreur, preuve, solution et responsable"),
      item("operational_step", "Écouter, vérifier le ticket et sécuriser d’abord tout risque allergène ou sanitaire"),
      item("operational_step", "Appliquer la solution prévue puis confirmer sa clôture au client"),
      item("recurring_control", "Analyser chaque semaine les causes répétées par produit, poste et canal"),
    ],
    [P.opening]: [
      item("implementation_action", "Créer des checklists d’ouverture et de fermeture signées"),
      item("operational_step", "Contrôler températures, propreté, caisse, équipements, livraisons et mise en place"),
      item("operational_step", "À la fermeture, enregistrer pertes, nettoyer, couper, sécuriser et signaler les anomalies"),
      item("recurring_control", "Corriger chaque semaine les oublis récurrents dans les checklists"),
    ],
    [P.recipes]: [
      item("implementation_action", "Créer une fiche technique par produit avec ingrédients, grammages, rendement et coût"),
      item("operational_step", "Préparer avec les ustensiles de mesure et l’ordre de montage prévus"),
      item("operating_rule", "Aucune substitution d’ingrédient ou modification de portion sans validation et mise à jour"),
      item("recurring_control", "Peser chaque semaine un échantillon et comparer portion, aspect et coût cible"),
    ],
    [P.stations]: [
      item("implementation_action", "Créer une fiche pour chaque poste critique avant, pendant et après le service"),
      item("operational_step", "Préparer le poste avec quantités, matériel, étiquetage et produits de secours"),
      item("operational_step", "Transmettre ruptures, commandes en attente et anomalies au changement d’équipe"),
      item("recurring_control", "Observer chaque semaine un poste en situation et corriger un écart"),
    ],
    [P.stock]: [
      item("implementation_action", "Définir stock minimum, maximum et délai fournisseur pour chaque produit critique"),
      item("operational_step", "Contrôler à réception quantité, lot, DLC, état et température avant acceptation"),
      item("operational_step", "Ranger en appliquant FEFO, séparation des denrées et étiquetage d’ouverture"),
      item("recurring_control", "Contrôler chaque semaine ruptures, surstocks, pertes et commandes en retard"),
    ],
    [P.quality]: [
      item("implementation_action", "Définir les critères visibles de conformité par produit et canal"),
      item("operational_step", "Contrôler avant remise aspect, température, quantité, emballage et contenu de commande"),
      item("operating_rule", "Refaire ou retirer tout produit qui ne respecte pas le standard"),
      item("recurring_control", "Faire un contrôle surprise par semaine et enregistrer les écarts"),
    ],
    [P.team]: [
      item("implementation_action", "Définir effectif minimum et compétences requises par volume et créneau"),
      item("operational_step", "Construire le planning avec préparation, service, nettoyage, pauses et fermeture"),
      item("operating_rule", "Ne jamais laisser seul sur un poste critique un salarié non validé"),
      item("recurring_control", "Vérifier chaque semaine heures, absences, remplacements et créneaux sous-couverts"),
    ],
    [P.onboarding]: [
      item("implementation_action", "Préparer un parcours avec hygiène, sécurité, fiches techniques et postes"),
      item("operational_step", "Faire pratiquer chaque poste sous supervision avant toute autonomie"),
      item("recurring_control", "Valider à J+7 et J+30 les postes autorisés et les écarts à retravailler"),
    ],
    [P.cash]: [
      item("implementation_action", "Définir fonds de caisse, moyens de paiement, annulations et seuils d’écart"),
      item("operational_step", "Rapprocher caisse, terminal, plateformes, bons, remboursements et commandes annulées"),
      item("operational_step", "Documenter chaque écart avec date, poste, montant, contrôle et responsable"),
      item("recurring_control", "Contrôler quotidiennement les écarts et mensuellement la marge après commissions"),
    ],
    [P.expenses]: [
      item("implementation_action", "Créer un calendrier des fournisseurs, loyers, salaires, taxes et abonnements"),
      item("operational_step", "Valider chaque facture avec commande, réception, avoir et conditions convenues"),
      item("recurring_control", "Prévoir chaque mois les sorties de trésorerie des huit semaines suivantes"),
    ],
    [P.hygiene]: [
      item("implementation_action", "Formaliser réception, températures, refroidissement, allergènes, nettoyage et traçabilité"),
      item("operational_step", "Enregistrer les contrôles prévus avec date, valeur, lot et personne responsable"),
      item("operating_rule", "Séparer mains, matériel et zones propres ou sales selon le plan de maîtrise sanitaire"),
      item("recurring_control", "Auditer chaque mois les enregistrements et corriger toute preuve manquante"),
    ],
    [P.nonConformity]: [
      item("implementation_action", "Créer une fiche de non-conformité avec produit, lot, risque et décision"),
      item("operational_step", "Isoler, identifier et bloquer immédiatement le produit ou la zone concernée"),
      item("operational_step", "Rechercher la cause, décider retrait, destruction ou remise en conformité et conserver la preuve"),
      item("recurring_control", "Vérifier après correction que le même écart ne réapparaît pas"),
    ],
    [P.maintenance]: [
      item("implementation_action", "Lister les équipements critiques, échéances, prestataires et solutions de secours"),
      item("operational_step", "Mettre hors service, signaler et protéger toute machine présentant un danger"),
      item("recurring_control", "Tester et entretenir les équipements selon le calendrier du fabricant"),
    ],
  },
};

export type FastFoodTradeProfile = {
  slug: string;
  name: string;
  growthPriorities: string;
  delegatedDecisions: string;
  accessPoints: string;
  acquisitionActions: string;
  orderChecks: string;
  openingChecks: string;
  recipeStandards: string;
  criticalStations: string;
  criticalStock: string;
  qualityChecks: string;
  teamSkills: string;
  cashRisks: string;
  hygieneRisks: string;
  criticalEquipment: string;
  reviewState: "internal_review_complete";
};

const patches = (profile: FastFoodTradeProfile): ProcessContentPatch[] => [
  { processId: P.cap, contentIndex: 0, label: `Choisir les priorités de croissance : ${profile.growthPriorities}` },
  { processId: P.decisions, contentIndex: 0, label: `Déléguer explicitement : ${profile.delegatedDecisions}` },
  { processId: P.access, contentIndex: 0, label: `Sécuriser les accès suivants : ${profile.accessPoints}` },
  { processId: P.acquisition, contentIndex: 1, label: `Mettre en œuvre les actions locales suivantes : ${profile.acquisitionActions}` },
  { processId: P.sales, contentIndex: 1, label: `Confirmer chaque commande avec : ${profile.orderChecks}` },
  { processId: P.opening, contentIndex: 1, label: `Contrôler à l’ouverture : ${profile.openingChecks}` },
  { processId: P.recipes, contentIndex: 0, label: `Standardiser précisément : ${profile.recipeStandards}` },
  { processId: P.stations, contentIndex: 0, label: `Créer une fiche pour les postes critiques : ${profile.criticalStations}` },
  { processId: P.stock, contentIndex: 0, label: `Définir les seuils et délais pour : ${profile.criticalStock}` },
  { processId: P.quality, contentIndex: 1, label: `Contrôler avant remise : ${profile.qualityChecks}` },
  { processId: P.team, contentIndex: 0, label: `Planifier selon les compétences nécessaires : ${profile.teamSkills}` },
  { processId: P.cash, contentIndex: 1, label: `Rapprocher particulièrement : ${profile.cashRisks}` },
  { processId: P.hygiene, contentIndex: 0, label: `Formaliser les contrôles propres à : ${profile.hygieneRisks}` },
  { processId: P.maintenance, contentIndex: 0, label: `Planifier l’entretien et le secours pour : ${profile.criticalEquipment}` },
];

export const generateFastFoodTradeProcessDraft = (
  profile: FastFoodTradeProfile,
) =>
  composeProcessDraft(fastFoodFamilyCoreDraft, [
    { id: `metier.${profile.slug}`, contentPatches: patches(profile) },
  ]);

export const fastFoodTradeProfiles = {
  restaurant: {
    slug: "restaurant",
    name: "Restaurant",
    reviewState: "internal_review_complete",
    growthPriorities: "services rentables, réservation directe, groupes, vente additionnelle et privatisation",
    delegatedDecisions: "changement de table, geste plafonné, refus d’un plat, achat urgent et fermeture d’une réservation",
    accessPoints: "caisse, réservations, clés, alarme, cave, commandes fournisseurs et avis clients",
    acquisitionActions: "Google Business Profile, réservation directe, photos des plats, prescripteurs locaux et événements",
    orderChecks: "table, nombre de couverts, cuisson, allergènes, ordre d’envoi et demandes particulières",
    openingChecks: "réservations, plan de salle, caisse, chambres froides, mise en place cuisine, cave et briefing",
    recipeStandards: "fiches techniques, dressage, portions, cuissons, allergènes et ordre d’envoi de la carte",
    criticalStations: "réservation, accueil, salle, bar, passe, cuisine, plonge, caisse et fermeture",
    criticalStock: "produits frais, vins, boissons, pain, produits d’entretien et références de la carte",
    qualityChecks: "table, plat, cuisson, dressage, température, allergènes et synchronisation des convives",
    teamSkills: "accueil, conseil, prise de commande, service, bar, passe, cuisine, encaissement et fermeture",
    cashRisks: "tables ouvertes, offerts, annulations, pourboires, titres-restaurant, cartes et réservations prépayées",
    hygieneRisks: "liaison chaude et froide, préparations anticipées, allergènes, refroidissement, plonge et salle",
    criticalEquipment: "fours, plaques, froid, extraction, lave-vaisselle, caisse et terminal de réservation",
  },
  "fast-food": {
    slug: "fast-food",
    name: "Fast-food",
    reviewState: "internal_review_complete",
    growthPriorities: "débit aux heures de pointe, vente directe, menus rentables, click and collect et fidélité",
    delegatedDecisions: "remake, remboursement plafonné, rupture produit, ouverture d’un poste et appel d’un renfort",
    accessPoints: "caisse, bornes, livraison, commande en ligne, cuisine, clés, alarme et stocks sensibles",
    acquisitionActions: "Google Business Profile, commande directe, offres locales, réseaux sociaux et fidélité mobile",
    orderChecks: "canal, menu, taille, suppléments, retrait, allergènes, numéro et heure promise",
    openingChecks: "huiles, températures, bornes, caisse, écrans cuisine, mise en place, emballages et plateformes",
    recipeStandards: "grammages, temps de cuisson, montage, maintien chaud, sauces, emballage et temps maximum",
    criticalStations: "caisse, borne, assemblage, cuisson, friture, expédition, livraison, nettoyage et fermeture",
    criticalStock: "protéines, pains, pommes de terre, sauces, boissons, emballages, huiles et produits d’hygiène",
    qualityChecks: "numéro, composition, quantité, température, emballage, sauces, boissons et délai",
    teamSkills: "prise de commande, assemblage, cuisson, friture, expédition, caisse, nettoyage et gestion du rush",
    cashRisks: "bornes, caisse, agrégateurs, annulations, remakes, codes promotionnels et remboursements",
    hygieneRisks: "friture, maintien chaud, préparations rapides, allergènes, écrans tactiles et flux continu",
    criticalEquipment: "friteuses, grills, froid, maintien chaud, extraction, bornes, caisse et écrans cuisine",
  },
  traiteur: {
    slug: "traiteur",
    name: "Traiteur événementiel B2B",
    reviewState: "internal_review_complete",
    growthPriorities: "contrats entreprises, événements récurrents, menus standardisés, livraison et location de matériel",
    delegatedDecisions: "ajustement de quantité plafonné, remplacement produit, achat urgent et gestion d’un retard",
    accessPoints: "planning événements, dossiers clients, cuisine, véhicules, commandes fournisseurs et acomptes",
    acquisitionActions: "prescripteurs événementiels, lieux, agences, référencement local, dégustations et appels d’offres",
    orderChecks: "client, lieu, accès, horaires, convives, menu, allergènes, matériel, personnel et conditions de reprise",
    openingChecks: "planning, fiches événement, production, chambres froides, véhicules, matériel et horaires de départ",
    recipeStandards: "rendements par convive, conditionnement, refroidissement, remise en température et dressage sur site",
    criticalStations: "devis, planification, production, conditionnement, chargement, livraison, service et retour matériel",
    criticalStock: "matières par événement, contenants, consommables, nappage, matériel loué et produits de secours",
    qualityChecks: "quantités, étiquetage, température, matériel, ordre de chargement, feuille de route et preuve de livraison",
    teamSkills: "production en volume, conditionnement, chargement, conduite, installation, service et démontage",
    cashRisks: "acomptes, soldes, extras, heures supplémentaires, casse, location et achats dédiés à un événement",
    hygieneRisks: "production anticipée, refroidissement, transport, remise en température, buffet et retour de denrées",
    criticalEquipment: "cellule de refroidissement, froid, fours, véhicules, caissons isothermes et matériel événementiel",
  },
  "dark-kitchen": {
    slug: "dark-kitchen",
    name: "Dark kitchen",
    reviewState: "internal_review_complete",
    growthPriorities: "marques rentables, vente directe, zones de livraison, temps de préparation et note plateformes",
    delegatedDecisions: "mise hors ligne d’un produit, fermeture d’un canal, remake, remboursement et limitation de zone",
    accessPoints: "agrégateurs, menu manager, caisse, écrans cuisine, marques virtuelles, stocks et avis clients",
    acquisitionActions: "référencement des plateformes, commande directe, visuels de menu, promotions géolocalisées et retargeting",
    orderChecks: "marque, plateforme, numéro, composition, allergènes, retrait livreur et heure de départ",
    openingChecks: "statut des plateformes, menus, ruptures, écrans cuisine, imprimantes, froid, mise en place et emballages",
    recipeStandards: "recettes par marque, grammages, emballage, temps cible et tenue du produit pendant la livraison",
    criticalStations: "réception digitale, production multi-marques, assemblage, contrôle, dispatch livreur et support client",
    criticalStock: "ingrédients partagés, emballages par marque, scellés, consommables et produits à forte rotation",
    qualityChecks: "marque, numéro, composition, scellé, température, emballage, boisson et heure de départ",
    teamSkills: "pilotage multi-canaux, production multi-marques, contrôle, dispatch, gestion des ruptures et support",
    cashRisks: "commissions, promotions cofinancées, remboursements, commandes annulées, écarts plateforme et vente directe",
    hygieneRisks: "coactivité des marques, allergènes, attente livreur, maintien en température et traçabilité digitale",
    criticalEquipment: "écrans cuisine, imprimantes, froid, cuisson, maintien, réseau internet et agrégateur de commandes",
  },
  boulangerie: {
    slug: "boulangerie",
    name: "Boulangerie",
    reviewState: "internal_review_complete",
    growthPriorities: "pain quotidien, snacking, pâtisserie, commandes, ventes entreprises et réduction des invendus",
    delegatedDecisions: "remise anti-gaspillage, retrait produit, relance d’une cuisson, commande urgente et remboursement",
    accessPoints: "laboratoire, fournil, caisse, clés, alarmes, commandes, recettes et chambres de fermentation",
    acquisitionActions: "Google Business Profile, vitrines, commandes de fêtes, partenariats bureaux et offres anti-gaspillage",
    orderChecks: "produit, quantité, personnalisation, allergènes, date, heure de retrait, acompte et emballage",
    openingChecks: "cuissons, températures, vitrines, prix, caisse, commandes réservées, pains spéciaux et snacking",
    recipeStandards: "pétrissage, pointage, façonnage, fermentation, cuisson, rendement, refroidissement et présentation",
    criticalStations: "pétrissage, façonnage, cuisson, pâtisserie, snacking, vente, préparation de commande et fermeture",
    criticalStock: "farines, levures, beurre, œufs, garnitures, emballages, produits de nettoyage et combustibles",
    qualityChecks: "cuisson, poids, aspect, fraîcheur, étiquetage, allergènes, commande réservée et emballage",
    teamSkills: "production boulangère, pâtisserie, cuisson, snacking, vente, caisse, commandes et nettoyage",
    cashRisks: "invendus, remises, offerts, commandes avec acompte, titres-restaurant et écarts de caisse",
    hygieneRisks: "farines et poussières, œufs, crèmes, refroidissement, allergènes, vitrines et snacking",
    criticalEquipment: "pétrins, fours, chambres de pousse, froid, laminoir, trancheuse, vitrines et caisse",
  },
  "bar-cafe": {
    slug: "bar-cafe",
    name: "Café",
    reviewState: "internal_review_complete",
    growthPriorities: "petit-déjeuner, déjeuner, boissons à marge, événements, terrasse et clientèle récurrente",
    delegatedDecisions: "offert plafonné, refus de service, remboursement, gestion d’un client difficile et appel sécurité",
    accessPoints: "caisse, clés, alarme, cave, terrasse, musique, réservations, commandes et stocks sensibles",
    acquisitionActions: "Google Business Profile, programmation d’événements, partenariats de quartier, terrasse et fidélité",
    orderChecks: "table, produit, taille, lait, allergènes, formule, mode de paiement et ordre de service",
    openingChecks: "machine à café, caisse, terrasse, froid, glaçons, cave, réservations, sanitaires et mise en place",
    recipeStandards: "dosages café, boissons, cocktails simples, snacking, verrerie, températures et présentation",
    criticalStations: "bar, café, salle, terrasse, caisse, snacking, plonge, sanitaires et fermeture",
    criticalStock: "café, lait, boissons, fûts, bouteilles, glaçons, verrerie, snacking et produits d’entretien",
    qualityChecks: "commande, dosage, température, verrerie, présentation, table, ticket et délai",
    teamSkills: "barista, service, bar, terrasse, caisse, contrôle d’âge, gestion des clients et fermeture",
    cashRisks: "tables ouvertes, offerts, pourboires, happy hour, tickets annulés, espèces et consommation équipe",
    hygieneRisks: "lait, machine à café, glaçons, fruits, snacking, verrerie, sanitaires et nuisibles",
    criticalEquipment: "machine à café, moulins, lave-verres, froid, tireuses, machine à glaçons, caisse et terrasse",
  },
  "food-truck": {
    slug: "food-truck",
    name: "Food truck",
    reviewState: "internal_review_complete",
    growthPriorities: "emplacements rentables, privatisations, événements, précommande et carte courte à forte marge",
    delegatedDecisions: "annulation d’un emplacement, rupture produit, limitation de carte, achat urgent et arrêt sécurité",
    accessPoints: "véhicule, clés, caisse, gaz, emplacements, autorisations, commande en ligne et planning événements",
    acquisitionActions: "planning d’emplacements, Google Business Profile, réseaux sociaux, entreprises et organisateurs",
    orderChecks: "emplacement, canal, numéro, composition, allergènes, heure de retrait et disponibilité réelle",
    openingChecks: "véhicule, gaz, électricité, eau, froid, caisse, autorisations, mise en place et sécurité du site",
    recipeStandards: "carte courte, grammages, cuisson, assemblage, emballage et temps cible dans un espace réduit",
    criticalStations: "conduite, installation, énergie, prise de commande, cuisson, assemblage, remise et repli",
    criticalStock: "produits de la carte, eau, gaz, énergie, emballages, consommables, monnaie et produits de secours",
    qualityChecks: "numéro, composition, température, emballage, délai, stabilité du poste et sécurité de remise",
    teamSkills: "conduite, installation, gaz, électricité, cuisson, caisse, rush, nettoyage et repli",
    cashRisks: "emplacements, événements, acomptes, caisse mobile, terminal, annulations et frais de déplacement",
    hygieneRisks: "eau potable, eaux usées, froid mobile, espace réduit, allergènes, déchets et nettoyage hors site",
    criticalEquipment: "véhicule, groupe électrique, gaz, froid, eau, cuisson, extraction, caisse mobile et extincteurs",
  },
} satisfies Record<string, FastFoodTradeProfile>;
