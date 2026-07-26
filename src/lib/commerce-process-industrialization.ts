import {
  composeProcessDraft,
  type IndustrializedContentItem,
  type IndustrializedProcessDefinition,
  type ProcessContentPatch,
  type ProcessDraft,
} from "@/lib/process-industrialization";

const P = {
  cap: "process.commerce.direction.savoir-ou-va-lentreprise",
  decisions: "process.commerce.direction.decider-au-quotidien-sans-le-dirigeant",
  access: "process.commerce.direction.donner-acces-a-lessentiel",
  review: "process.commerce.direction.garder-une-visibilite-sans-reprendre-la-main",
  acquisition: "process.commerce.marketing-vente.attirer-de-nouveaux-clients",
  sales: "process.commerce.marketing-vente.vendre-mise-en-avant-argumentaire",
  loyalty: "process.commerce.marketing-vente.faire-revenir-les-clients",
  complaint: "process.commerce.marketing-vente.traiter-une-reclamation-ou-un-retour-client",
  opening: "process.commerce.operations.ouvrir-et-fermer-la-boutique",
  stations: "process.commerce.operations.tenir-chaque-poste",
  merchandising: "process.commerce.operations.soigner-la-presentation",
  stock: "process.commerce.operations.ne-jamais-manquer-de-stock",
  inventory: "process.commerce.operations.faire-linventaire",
  team: "process.commerce.equipe.organiser-les-equipes-remplacer-un-absent",
  onboarding: "process.commerce.equipe.integrer-un-nouvel-employe",
  cash: "process.commerce.finance-admin.suivre-largent-et-les-encaissements",
  expenses: "process.commerce.finance-admin.payer-a-temps",
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

export const commerceFamilyCoreDraft: ProcessDraft = {
  definitionsById: {
    [P.cap]: def("Fixer les priorités commerciales et financières du point de vente.", "Début de trimestre ou écart important.", "Des objectifs chiffrés par activité et période.", "Dirigeant", "Trimestrielle"),
    [P.decisions]: def("Permettre à l’équipe de décider sans attendre le dirigeant.", "Remise, retour, rupture, incident ou absence.", "Des limites de décision écrites et appliquées.", "Dirigeant ou responsable boutique", "Mensuelle"),
    [P.access]: def("Sécuriser les accès, clés et moyens de paiement.", "Arrivée, départ ou changement d’outil.", "Des accès nominatifs et récupérables.", "Responsable boutique", "Mensuelle"),
    [P.review]: def("Piloter ventes, marge, stock, clients et équipe sans reprendre chaque tâche.", "Point de gestion mensuel.", "Des écarts expliqués et des actions datées.", "Dirigeant", "Mensuelle"),
    [P.acquisition]: def("Attirer de nouveaux clients autour du point de vente.", "Préparation du calendrier commercial.", "Des actions locales mesurées et répétables.", "Responsable boutique", "Mensuelle"),
    [P.sales]: def("Transformer une visite ou demande en achat adapté.", "Entrée client, demande web ou commande spéciale.", "Une vente conseillée, tracée et sans promesse floue.", "Vendeur conseil", "Quotidienne"),
    [P.loyalty]: def("Faire revenir les clients au bon moment.", "Achat, livraison ou temps fort à venir.", "Des relances utiles et consenties.", "Responsable boutique", "Mensuelle"),
    [P.complaint]: def("Traiter retours et réclamations de façon constante.", "Retour, défaut, erreur ou insatisfaction.", "Une décision justifiée et une clôture tracée.", "Responsable boutique", "À chaque réclamation"),
    [P.opening]: def("Ouvrir et fermer le point de vente sans oubli critique.", "Début et fin de journée.", "Boutique prête, sécurisée et caisse contrôlée.", "Responsable d’ouverture ou fermeture", "Quotidienne"),
    [P.stations]: def("Standardiser les gestes de chaque poste.", "Prise de poste ou changement d’affectation.", "Une qualité constante même avec un remplaçant.", "Responsable boutique", "Quotidienne"),
    [P.merchandising]: def("Rendre l’offre lisible, attractive et conforme.", "Nouvelle collection, livraison ou temps fort.", "Des produits propres, étiquetés et faciles à choisir.", "Responsable merchandising", "Hebdomadaire"),
    [P.stock]: def("Déclencher le réassort avant la rupture ou le surstock.", "Vente, réception ou seuil atteint.", "Un stock disponible avec une rotation maîtrisée.", "Responsable stock", "Hebdomadaire"),
    [P.inventory]: def("Fiabiliser les quantités et expliquer les écarts.", "Inventaire tournant ou annuel.", "Un stock corrigé avec des causes d’écart identifiées.", "Responsable stock", "Mensuelle"),
    [P.team]: def("Couvrir les horaires et postes critiques.", "Construction du planning ou absence.", "Un planning conforme avec un remplaçant identifié.", "Responsable boutique", "Hebdomadaire"),
    [P.onboarding]: def("Rendre une nouvelle recrue autonome et sûre.", "Arrivée d’un salarié.", "Les postes critiques sont validés en situation.", "Manager", "À chaque arrivée"),
    [P.cash]: def("Sécuriser encaissements, marge et pièces comptables.", "Clôture de caisse et fin de période.", "Des écarts détectés, expliqués et transmis.", "Dirigeant ou responsable administratif", "Quotidienne"),
    [P.expenses]: def("Anticiper fournisseurs, loyers, taxes et abonnements.", "Nouvelle facture ou revue mensuelle.", "Aucune échéance critique oubliée.", "Responsable administratif", "Mensuelle"),
  },
  contentByProcessId: {
    [P.cap]: [
      item("implementation_action", "Choisir les catégories, services et temps forts qui doivent porter la croissance"),
      item("implementation_action", "Fixer des objectifs de chiffre d’affaires, marge, panier moyen et rotation"),
      item("recurring_control", "Comparer chaque mois les objectifs au réalisé par catégorie et canal"),
      item("operating_rule", "Ne pas augmenter les achats sans objectif de vente, marge et délai d’écoulement"),
    ],
    [P.decisions]: [
      item("implementation_action", "Écrire les limites de remise, remboursement, avoir et achat que l’équipe peut décider"),
      item("operational_step", "Classer chaque incident selon son impact client, sécurité, caisse et stock"),
      item("operating_rule", "Faire remonter immédiatement danger, fraude, litige majeur ou écart de caisse inexpliqué"),
      item("recurring_control", "Revoir chaque mois les décisions remontées inutilement au dirigeant"),
    ],
    [P.access]: [
      item("implementation_action", "Tenir un registre des clés, badges, alarmes, caisses, comptes et terminaux"),
      item("operational_step", "Attribuer des accès nominatifs selon le poste réellement tenu"),
      item("operational_step", "Retirer clés et accès le jour du départ ou du changement de fonction"),
      item("recurring_control", "Tester chaque mois alarme, récupération des comptes et contacts d’urgence"),
    ],
    [P.review]: [
      item("implementation_action", "Créer un tableau mensuel réunissant ventes, marge, stock, caisse, avis et masse salariale"),
      item("operational_step", "Expliquer les trois écarts principaux avant de choisir les actions"),
      item("recurring_control", "Suivre les ruptures, stocks dormants, démarques et réclamations récurrentes"),
      item("recurring_control", "Attribuer à chaque action un responsable et une date de contrôle"),
    ],
    [P.acquisition]: [
      item("implementation_action", "Construire un calendrier local avec saisons, événements et temps forts commerciaux"),
      item("operational_step", "Mettre à jour horaires, photos, catégories et avis sur Google Business Profile"),
      item("operational_step", "Diffuser chaque offre avec une cible, une durée, un stock disponible et un appel à l’action"),
      item("recurring_control", "Mesurer chaque mois trafic, nouveaux clients et ventes attribuables à chaque action"),
    ],
    [P.sales]: [
      item("implementation_action", "Créer un argumentaire court par catégorie avec besoin, preuve, différence et objection"),
      item("operational_step", "Qualifier le besoin, l’usage, le budget, le délai et les contraintes avant de conseiller"),
      item("operational_step", "Vérifier disponibilité, prix, conditions et délai avant de promettre au client"),
      item("operational_step", "Proposer un complément réellement utile et noter les commandes ou réservations à suivre"),
      item("recurring_control", "Observer chaque semaine transformation, panier moyen, ventes complémentaires et demandes perdues"),
    ],
    [P.loyalty]: [
      item("implementation_action", "Définir les événements qui justifient une relance client"),
      item("operational_step", "Collecter les coordonnées et le consentement avec un usage clairement annoncé"),
      item("operational_step", "Relancer avec une information utile : disponibilité, entretien, nouveauté ou temps fort"),
      item("recurring_control", "Mesurer retours, désabonnements et chiffre généré par les relances"),
    ],
    [P.complaint]: [
      item("implementation_action", "Créer un registre des retours avec produit, motif, preuve, décision et responsable"),
      item("operational_step", "Écouter, vérifier le ticket ou dossier et photographier le défaut lorsque c’est utile"),
      item("operational_step", "Appliquer la garantie, l’échange, l’avoir ou le refus prévu puis l’expliquer par écrit"),
      item("operating_rule", "Isoler immédiatement tout produit potentiellement dangereux ou rappelé"),
    ],
    [P.opening]: [
      item("implementation_action", "Créer une checklist d’ouverture et une checklist de fermeture signées"),
      item("operational_step", "À l’ouverture, contrôler accès, alarme, caisse, propreté, températures et priorités du jour"),
      item("operational_step", "À la fermeture, compter, ranger, sécuriser les produits sensibles et signaler les incidents"),
      item("recurring_control", "Vérifier chaque semaine les oublis récurrents et corriger les checklists"),
    ],
    [P.stations]: [
      item("implementation_action", "Créer une fiche simple pour chaque poste critique de la boutique"),
      item("operational_step", "Décrire la prise de poste, les contrôles, les gestes interdits et la fin de poste"),
      item("operational_step", "Faire exécuter le poste par un remplaçant avec la fiche avant de le laisser seul"),
      item("operating_rule", "Aucune correction de stock, annulation ou remboursement sans motif traçable"),
      item("recurring_control", "Observer chaque semaine un poste et noter un écart à corriger"),
    ],
    [P.merchandising]: [
      item("implementation_action", "Définir un standard de vitrine, rayon, étiquette et zone promotionnelle"),
      item("operational_step", "Présenter les produits par besoin client et non uniquement par ordre fournisseur"),
      item("operational_step", "Retirer immédiatement produit abîmé, périmé, mal étiqueté ou non conforme"),
      item("recurring_control", "Photographier chaque semaine les zones clés et corriger les écarts au standard"),
    ],
    [P.stock]: [
      item("implementation_action", "Définir stock minimum, stock maximum et délai fournisseur pour les références critiques"),
      item("operational_step", "Enregistrer chaque réception avec quantité, état, prix et écart au bon de livraison"),
      item("operational_step", "Déclencher le réassort selon ventes, délai, saison et stock déjà commandé"),
      item("operational_step", "Traiter séparément retours, produits réservés, défectueux et stock en transit"),
      item("recurring_control", "Contrôler chaque semaine ruptures, surstocks, rotation lente et commandes en retard"),
    ],
    [P.inventory]: [
      item("implementation_action", "Planifier des inventaires tournants par zone et un inventaire complet"),
      item("operational_step", "Geler les mouvements de la zone, compter à deux si le produit est sensible et enregistrer l’écart"),
      item("operational_step", "Recompter les écarts importants avant toute correction informatique"),
      item("recurring_control", "Classer les écarts par cause : réception, caisse, casse, vol, retour ou erreur de saisie"),
    ],
    [P.team]: [
      item("implementation_action", "Définir l’effectif minimum et les compétences nécessaires par créneau"),
      item("operational_step", "Construire le planning avec ouverture, fermeture, pauses, livraisons et pics d’affluence"),
      item("operating_rule", "Un salarié ne tient seul un poste critique qu’après validation de sa compétence"),
      item("recurring_control", "Vérifier chaque semaine heures, absences, remplacements et créneaux sous-couverts"),
    ],
    [P.onboarding]: [
      item("implementation_action", "Préparer un parcours d’intégration par poste avec règles, fiches et démonstrations"),
      item("operational_step", "Faire pratiquer accueil, vente, caisse, stock et fermeture sous supervision"),
      item("recurring_control", "Valider à J+7 et J+30 les postes autorisés et les points à retravailler"),
    ],
    [P.cash]: [
      item("implementation_action", "Définir fonds de caisse, moyens de paiement, justificatifs et seuils d’écart"),
      item("operational_step", "Compter la caisse hors vue du public et rapprocher espèces, cartes, avoirs et ventes"),
      item("operational_step", "Documenter tout écart avec date, poste, montant, vérifications et responsable"),
      item("operational_step", "Déposer ou sécuriser les espèces selon un seuil et une procédure connus"),
      item("operational_step", "Rapprocher achats, factures, avoirs fournisseurs et réceptions"),
      item("recurring_control", "Contrôler chaque jour les écarts de caisse et chaque mois la marge réelle"),
      item("recurring_control", "Préparer chaque mois les pièces complètes pour le cabinet comptable"),
      item("operating_rule", "Ne jamais corriger une vente ou un stock pour masquer un écart"),
    ],
    [P.expenses]: [
      item("implementation_action", "Créer un calendrier des loyers, fournisseurs, taxes, assurances et abonnements"),
      item("operational_step", "Valider chaque facture avec commande, réception et conditions convenues"),
      item("recurring_control", "Prévoir chaque mois les sorties de trésorerie des huit semaines suivantes"),
      item("recurring_control", "Revoir chaque trimestre abonnements, contrats et fournisseurs devenus inutiles"),
    ],
  },
};

export type CommerceTradeProfile = {
  slug: string;
  name: string;
  priorityCategories: string;
  delegatedDecisions: string;
  acquisitionActions: string;
  salesQualification: string;
  openingChecks: string;
  criticalStations: string;
  merchandisingStandard: string;
  criticalStock: string;
  inventoryRisks: string;
  teamSkills: string;
  cashRisks: string;
  complianceChecks: string;
  reviewState: "internal_review_complete";
};

const patches = (p: CommerceTradeProfile): ProcessContentPatch[] => [
  { processId: P.cap, contentIndex: 0, label: `Choisir les priorités de croissance : ${p.priorityCategories}` },
  { processId: P.decisions, contentIndex: 0, label: `Déléguer explicitement : ${p.delegatedDecisions}` },
  { processId: P.acquisition, contentIndex: 1, label: `Mettre en œuvre les actions locales suivantes : ${p.acquisitionActions}` },
  { processId: P.sales, contentIndex: 1, label: `Qualifier la vente avec : ${p.salesQualification}` },
  { processId: P.opening, contentIndex: 1, label: `Contrôler à l’ouverture : ${p.openingChecks}` },
  { processId: P.stations, contentIndex: 0, label: `Créer une fiche pour les postes critiques : ${p.criticalStations}` },
  { processId: P.merchandising, contentIndex: 0, label: `Définir le standard de présentation : ${p.merchandisingStandard}` },
  { processId: P.stock, contentIndex: 0, label: `Définir les seuils et délais pour : ${p.criticalStock}` },
  { processId: P.inventory, contentIndex: 3, label: `Expliquer en priorité les écarts liés à : ${p.inventoryRisks}` },
  { processId: P.team, contentIndex: 0, label: `Planifier selon les compétences nécessaires : ${p.teamSkills}` },
  { processId: P.cash, contentIndex: 2, label: `Tracer particulièrement les risques suivants : ${p.cashRisks}` },
  { processId: P.expenses, contentIndex: 1, label: `Vérifier avant paiement : ${p.complianceChecks}` },
];

export const generateCommerceTradeProcessDraft = (
  profile: CommerceTradeProfile,
) =>
  composeProcessDraft(commerceFamilyCoreDraft, [
    { id: `metier.${profile.slug}`, contentPatches: patches(profile) },
  ]);

export const commerceTradeProfiles = {
  "commerce-de-detail": {
    slug: "commerce-de-detail", name: "Commerce de détail", reviewState: "internal_review_complete",
    priorityCategories: "rayons rentables, services additionnels, ventes B2B et temps forts saisonniers",
    delegatedDecisions: "remise encadrée, échange, commande spéciale, réassort courant et geste client plafonné",
    acquisitionActions: "Google Business Profile, vitrines, partenariats locaux, événements et publications produits",
    salesQualification: "usage, préférence, budget, délai, disponibilité, garantie et possibilité de commande",
    openingChecks: "caisse, alarmes, propreté, commandes à préparer, rayons sensibles et livraisons attendues",
    criticalStations: "caisse, conseil, réception, mise en rayon, préparation de commande et fermeture",
    merchandisingStandard: "vitrine, univers produit, prix, promotions, produits complémentaires et circulation",
    criticalStock: "meilleures ventes, produits d’appel, consommables, réservations et références à long délai",
    inventoryRisks: "erreur de réception, casse, vol, retour, réservation et correction de caisse",
    teamSkills: "conseil produit, caisse, stock, retours, commandes spéciales, ouverture et fermeture",
    cashRisks: "annulations, remises, avoirs, retours sans justificatif, écarts espèces et ventes B2B",
    complianceChecks: "bon de commande, réception, prix convenu, garantie, conformité produit et échéance",
  },
  "commerce-alimentaire": {
    slug: "commerce-alimentaire", name: "Commerce alimentaire", reviewState: "internal_review_complete",
    priorityCategories: "produits frais, paniers récurrents, commandes professionnelles et gammes à faible perte",
    delegatedDecisions: "retrait produit, remise anti-gaspillage, réassort frais, refus de livraison et remboursement plafonné",
    acquisitionActions: "Google Business Profile, arrivages, producteurs locaux, dégustations et offres anti-gaspillage",
    salesQualification: "besoin, quantité, allergènes, date de consommation, conservation, budget et retrait",
    openingChecks: "températures, DLC, propreté, caisse, chambres froides, arrivages et produits à démarquer",
    criticalStations: "réception, contrôle froid, mise en rayon, caisse, préparation, nettoyage et fermeture",
    merchandisingStandard: "rotation FEFO, prix, origine, allergènes, fraîcheur, promotions et séparation des produits",
    criticalStock: "produits frais, références quotidiennes, emballages, étiquettes et consommables d’hygiène",
    inventoryRisks: "casse, perte, DLC, démarque, variation de poids, réception et retrait sanitaire",
    teamSkills: "hygiène, chaîne du froid, allergènes, réception, caisse, rotation et nettoyage",
    cashRisks: "démarque non enregistrée, produits jetés, remises, écarts de poids et commandes professionnelles",
    complianceChecks: "températures, traçabilité, DLC, lot, allergènes, facture et conformité de la livraison",
  },
  "boutique-specialisee": {
    slug: "boutique-specialisee", name: "Boutique spécialisée", reviewState: "internal_review_complete",
    priorityCategories: "gammes expertes, nouveautés, services premium, clients fidèles et commandes spéciales",
    delegatedDecisions: "réservation, commande, remise plafonnée, échange, SAV courant et réassort best-seller",
    acquisitionActions: "Google Business Profile, démonstrations, événements de marque, prescripteurs et contenus experts",
    salesQualification: "usage, niveau d’exigence, préférence, budget, délai, compatibilité et service attendu",
    openingChecks: "caisse, commandes, rendez-vous, produits premium, vitrines et demandes SAV",
    criticalStations: "conseil expert, caisse, commande, réception, SAV, merchandising et fermeture",
    merchandisingStandard: "univers de besoin, démonstration, nouveautés, preuves, prix et produits complémentaires",
    criticalStock: "best-sellers, pièces ou accessoires compatibles, consommables et commandes clients",
    inventoryRisks: "produit de démonstration, réservation, SAV, vol, retour fournisseur et erreur de variante",
    teamSkills: "expertise produit, découverte du besoin, démonstration, commande, SAV et caisse",
    cashRisks: "acomptes, réservations, remises, reprises, avoirs, SAV payant et commandes non retirées",
    complianceChecks: "référence, variante, garantie, numéro de série, facture, conformité et conditions de retour",
  },
  "tabac-presse-point-relais": {
    slug: "tabac-presse-point-relais", name: "Tabac / presse / point relais", reviewState: "internal_review_complete",
    priorityCategories: "flux tabac-presse, colis, jeux, services de proximité et ventes complémentaires",
    delegatedDecisions: "incident colis simple, retour presse, réassort, refus d’identité non conforme et geste plafonné",
    acquisitionActions: "horaires Google à jour, signalétique relais, services disponibles et partenariats de quartier",
    salesQualification: "service demandé, identité, numéro de colis, délai, restriction d’âge et moyen de paiement",
    openingChecks: "caisse, coffre, stock sensible, presse, terminaux, colis entrants et zone de retrait",
    criticalStations: "caisse, tabac, presse, jeux, réception colis, remise colis, retours et fermeture",
    merchandisingStandard: "signalétique réglementaire, flux de file, presse du jour, services et produits complémentaires",
    criticalStock: "tabac, titres demandés, consommables terminaux, emballages et colis sous garde",
    inventoryRisks: "stock réglementé, retours presse, erreur de remise colis, vol, terminal et écart de commission",
    teamSkills: "contrôle d’âge, caisse, jeux, presse, identité, scan colis, incident relais et sécurité",
    cashRisks: "jeux, commissions, espèces, annulations terminal, colis contre remboursement et stock tabac",
    complianceChecks: "bordereau, identité, restrictions d’âge, quantité, commission, règlement et obligations d’affichage",
  },
  opticien: {
    slug: "opticien", name: "Opticien", reviewState: "internal_review_complete",
    priorityCategories: "équipement optique, renouvellement, solaire, lentilles, ajustage et suivi client",
    delegatedDecisions: "ajustage, reprise mineure, commande standard, SAV garantie et geste plafonné",
    acquisitionActions: "Google Business Profile, rappels de renouvellement, partenaires santé et vitrines saisonnières",
    salesQualification: "ordonnance, correction, usage, équipement actuel, budget, prise en charge, délai et préférences",
    openingChecks: "rendez-vous, dossiers mutuelle, commandes labo, remises clients, montures réservées et caisse",
    criticalStations: "accueil, prise de mesure, conseil, devis, commande labo, contrôle montage, remise et SAV",
    merchandisingStandard: "collections par usage, prix, prise en charge lisible, solaire, nouveautés et accessoires",
    criticalStock: "montures à rotation, consommables atelier, lentilles, accessoires et commandes client",
    inventoryRisks: "monture réservée, commande labo, prêt, casse atelier, garantie et erreur de référence",
    teamSkills: "ordonnance, mesures, conseil, tiers payant, montage, contrôle, ajustage et confidentialité",
    cashRisks: "tiers payant, acompte, reste à charge, remboursement organisme, annulation et dossier incomplet",
    complianceChecks: "ordonnance, devis normalisé, prise en charge, référence, mesure, traçabilité et facture",
  },
  fleuriste: {
    slug: "fleuriste", name: "Fleuriste événementiel B2B", reviewState: "internal_review_complete",
    priorityCategories: "bouquets, abonnements entreprises, mariages, événements, deuil et livraisons",
    delegatedDecisions: "substitution équivalente, achat urgent, remise anti-perte, ajustement composition et relivraison plafonnée",
    acquisitionActions: "Google Business Profile, Instagram, photos de réalisations, lieux partenaires et offres entreprises",
    salesQualification: "occasion, style, couleurs, budget, volumes, saison, lieu, livraison, installation et démontage",
    openingChecks: "fraîcheur, températures, arrivages, commandes du jour, tournées, atelier et caisse",
    criticalStations: "réception fleurs, préparation, boutique, devis événement, atelier, livraison et fermeture",
    merchandisingStandard: "fraîcheur, niveaux de prix, saison, compositions prêtes, entretien et photos de référence",
    criticalStock: "fleurs de base, feuillages, contenants, emballages, mousse, rubans et consommables événement",
    inventoryRisks: "perte fraîche, substitution, casse contenant, prélèvement atelier, événement et livraison",
    teamSkills: "soin des fleurs, composition, vente, devis, préparation événement, chargement et livraison",
    cashRisks: "acomptes événement, achats dédiés, pertes, livraisons, heures d’installation et solde final",
    complianceChecks: "devis, acompte, quantités, saisonnalité, livraison, installation, reprise matériel et facture",
  },
  librairie: {
    slug: "librairie", name: "Librairie", reviewState: "internal_review_complete",
    priorityCategories: "sélections, commandes clients, scolaire, collectivités, animations et cartes cadeaux",
    delegatedDecisions: "commande client, retour distributeur, réservation, remise autorisée et geste plafonné",
    acquisitionActions: "Google Business Profile, vitrines thématiques, dédicaces, clubs, écoles et recommandations sociales",
    salesQualification: "lecteur, sujet, âge, usage, budget, disponibilité, date souhaitée et alternative acceptable",
    openingChecks: "caisse, réservations, commandes arrivées, retours, événements, vitrines et retraits clients",
    criticalStations: "conseil, caisse, commande, réception, mise en rayon, retours, animation et fermeture",
    merchandisingStandard: "tables thématiques, nouveautés, fonds, coups de cœur, prix, signalétique et circulation",
    criticalStock: "meilleures ventes, scolaire, commandes clients, événements, papeterie et cartes cadeaux",
    inventoryRisks: "office, retour distributeur, réservation, exemplaire abîmé, service presse et erreur ISBN",
    teamSkills: "conseil, recherche bibliographique, commande, réception, retours, caisse et animation",
    cashRisks: "avoirs distributeurs, commandes collectivités, remises, cartes cadeaux, réservations et retours",
    complianceChecks: "ISBN, quantité, remise légale, bon de commande, réception, retour distributeur et facture",
  },
} satisfies Record<string, CommerceTradeProfile>;
