import {
  composeProcessDraft,
  type IndustrializedContentItem,
  type IndustrializedProcessDefinition,
  type ProcessContentPatch,
  type ProcessDraft,
} from "@/lib/process-industrialization";

const P = {
  cap: "process.logistique-transport.direction.savoir-ou-va-lactivite",
  decisions:
    "process.logistique-transport.direction.decider-au-quotidien-sans-tout-centraliser",
  visibility:
    "process.logistique-transport.direction.garder-une-visibilite-dexploitation",
  qualify:
    "process.logistique-transport.marketing-vente.prendre-et-qualifier-une-demande-client",
  complaint:
    "process.logistique-transport.marketing-vente.traiter-une-reclamation-client",
  plan:
    "process.logistique-transport.operations.planifier-les-tournees-trajets-ou-missions",
  execute:
    "process.logistique-transport.operations.suivre-lexecution-et-gerer-les-aleas",
  close:
    "process.logistique-transport.operations.cloturer-une-mission-avec-preuve",
  replace: "process.logistique-transport.equipe.remplacer-un-absent",
  profitability:
    "process.logistique-transport.finance-admin.suivre-la-rentabilite",
  cash:
    "process.logistique-transport.finance-admin.payer-et-encaisser-a-temps",
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

export const logisticsFamilyCoreDraft: ProcessDraft = {
  definitionsById: {
    [P.cap]: def(
      "Choisir les clients, zones et services qui doivent porter une activité rentable.",
      "Début de trimestre ou écart important.",
      "Des priorités chiffrées compatibles avec la capacité de transport.",
      "Dirigeant",
      "Trimestrielle",
    ),
    [P.decisions]: def(
      "Déléguer les arbitrages quotidiens sans bloquer l’exploitation.",
      "Retard, absence, incident, surcharge ou demande urgente.",
      "Des décisions rapides prises dans des limites écrites.",
      "Dirigeant ou responsable d’exploitation",
      "Mensuelle",
    ),
    [P.visibility]: def(
      "Voir les missions, moyens, écarts, risques et engagements en cours.",
      "Revue d’exploitation.",
      "Des écarts expliqués et des actions attribuées.",
      "Responsable d’exploitation",
      "Quotidienne",
    ),
    [P.qualify]: def(
      "Transformer une demande en prestation chiffrable et exécutable.",
      "Nouvelle demande ou évolution d’un compte.",
      "Un besoin qualifié avec ses contraintes et responsabilités.",
      "Responsable commercial ou exploitant",
      "À chaque demande",
    ),
    [P.complaint]: def(
      "Résoudre une réclamation et traiter sa cause.",
      "Retard, dommage, absence de preuve ou contestation.",
      "Une réponse tracée et une correction vérifiée.",
      "Responsable d’exploitation",
      "À chaque réclamation",
    ),
    [P.plan]: def(
      "Construire une mission réaliste avec les bons moyens et documents.",
      "Commande confirmée ou planning à réviser.",
      "Une mission affectée, faisable et conforme avant départ.",
      "Exploitant ou planificateur",
      "Quotidienne",
    ),
    [P.execute]: def(
      "Suivre l’exécution et traiter les aléas sans perdre la preuve.",
      "Départ, événement terrain ou écart au plan.",
      "Une prestation maîtrisée avec communication et traçabilité.",
      "Exploitant",
      "À chaque mission",
    ),
    [P.close]: def(
      "Clôturer la prestation avec résultat, réserves et preuves.",
      "Fin de mission.",
      "Un dossier complet permettant facturation et traitement des écarts.",
      "Exploitant ou conducteur",
      "À chaque mission",
    ),
    [P.replace]: def(
      "Maintenir le service en cas d’absence ou d’indisponibilité.",
      "Absence, panne, surcharge ou réaffectation.",
      "Un remplaçant reprend avec les informations et habilitations utiles.",
      "Responsable d’exploitation",
      "À chaque remplacement",
    ),
    [P.profitability]: def(
      "Connaître la marge réelle par client, mission et moyen.",
      "Temps, distance, achat ou revue mensuelle.",
      "Des dérives corrigées avant renouvellement ou nouveau devis.",
      "Dirigeant ou responsable financier",
      "Mensuelle",
    ),
    [P.cash]: def(
      "Facturer, encaisser et payer à partir de pièces complètes.",
      "Mission clôturée, facture reçue ou échéance dépassée.",
      "Une trésorerie suivie avec des dossiers justifiables.",
      "Responsable administratif",
      "Hebdomadaire",
    ),
  },
  contentByProcessId: {
    [P.cap]: [
      item("implementation_action", "Choisir les segments clients, zones, prestations et contrats qui doivent porter la croissance"),
      item("implementation_action", "Fixer des objectifs de chiffre d’affaires, marge, ponctualité, qualité et récurrence"),
      item("operational_step", "Comparer la demande visée aux véhicules, conducteurs, compétences et créneaux disponibles"),
      item("recurring_control", "Comparer chaque mois objectifs, vendu, réalisé, facturé, kilomètres et capacité"),
      item("recurring_control", "Mesurer par segment le taux de service, les incidents, la marge et la fidélisation"),
      item("operating_rule", "Ne pas lancer un service sans volume cible, prix, moyens, risques et preuve de demande"),
    ],
    [P.decisions]: [
      item("implementation_action", "Écrire les décisions déléguées sur priorité, réaffectation, dépense, geste client et sous-traitance"),
      item("operational_step", "Classer chaque arbitrage selon sécurité, client touché, délai, coût et obligation"),
      item("operational_step", "Appliquer la mesure conservatoire autorisée puis informer les personnes concernées"),
      item("operating_rule", "Escalader immédiatement accident, personne en danger, marchandise sensible ou document obligatoire absent"),
      item("recurring_control", "Tracer décision, motif, auteur, heure, impact et résultat obtenu"),
      item("recurring_control", "Revoir chaque mois les décisions inutilement remontées ou prises hors limite"),
    ],
    [P.visibility]: [
      item("implementation_action", "Créer une vue d’exploitation avec missions, moyens, statut, ETA, incident, preuve et marge"),
      item("operational_step", "Identifier les missions à risque avant le premier départ ou la première prise en charge"),
      item("operational_step", "Affecter à chaque écart une action, un responsable et une échéance"),
      item("recurring_control", "Revoir chaque matin absences, véhicules indisponibles, contraintes, retards et priorités"),
      item("recurring_control", "Contrôler en fin de journée missions non clôturées, preuves manquantes et clients non informés"),
      item("operating_rule", "Un statut sans prochaine action ni propriétaire ne peut pas rester ouvert"),
    ],
    [P.qualify]: [
      item("implementation_action", "Créer une trame de qualification avec prestation, lieux, horaires, volumes, contraintes et contact"),
      item("operational_step", "Confirmer le besoin réel, les parties prenantes, le niveau de service et le délai attendu"),
      item("operational_step", "Vérifier accès, dimensions, poids, passagers, manutention, attente et restrictions applicables"),
      item("operational_step", "Identifier les documents, autorisations, assurances et preuves attendus"),
      item("operational_step", "Chiffrer moyens, distance, temps, frais, aléas couverts et options"),
      item("operating_rule", "Ne pas confirmer prix ou horaire tant qu’une inconnue critique n’est pas écrite"),
      item("recurring_control", "Mesurer demandes, devis, signatures, pertes, marge prévue et cause de refus"),
    ],
    [P.complaint]: [
      item("implementation_action", "Créer un registre avec mission, faits, horaires, preuve, impact, réponse et correction"),
      item("operational_step", "Accuser réception et sécuriser immédiatement la personne, le bien ou la suite de service"),
      item("operational_step", "Comparer commande, planning, géolocalisation autorisée, échanges et preuve de clôture"),
      item("operational_step", "Qualifier la responsabilité sans promettre une indemnisation non validée"),
      item("operational_step", "Répondre avec faits établis, solution, délai et interlocuteur"),
      item("recurring_control", "Vérifier après clôture que l’action corrective a été appliquée"),
      item("recurring_control", "Analyser chaque mois retards, dommages, échecs, avis négatifs et causes récurrentes"),
    ],
    [P.plan]: [
      item("implementation_action", "Créer une fiche mission avec client, lieux, horaires, moyen, conducteur, consignes et documents"),
      item("operational_step", "Affecter un moyen et une personne selon capacité, permis, habilitation, repos et disponibilité"),
      item("operational_step", "Calculer trajet, temps réaliste, pauses, chargement, attente et marge de sécurité"),
      item("operational_step", "Vérifier véhicule, équipement, énergie ou carburant, propreté et moyens de communication"),
      item("operational_step", "Préparer ordre de mission, contacts, justificatifs, preuves attendues et procédure d’escalade"),
      item("operating_rule", "Aucun départ si un prérequis critique de sécurité ou de conformité manque"),
      item("recurring_control", "Revoir le planning après chaque aléa et informer toute personne affectée"),
    ],
    [P.execute]: [
      item("implementation_action", "Créer une procédure d’exécution avec départ, points de contrôle, communication et escalade"),
      item("operational_step", "Enregistrer départ, étapes, écarts, arrivée et preuves avec un horodatage exploitable"),
      item("operational_step", "Comparer l’avancement au planning et recalculer l’heure estimée si nécessaire"),
      item("operational_step", "Informer rapidement le client d’un écart significatif avec impact et solution proposée"),
      item("operational_step", "Traiter incident, refus, panne, attente ou impossibilité selon la procédure prévue"),
      item("operating_rule", "Ne jamais compenser un retard par une conduite, une charge ou une manœuvre dangereuse"),
      item("recurring_control", "Contrôler les missions sans mouvement, hors délai ou sans information récente"),
    ],
    [P.close]: [
      item("implementation_action", "Créer une checklist de clôture avec résultat, heure, état, réserves, signature et pièces"),
      item("operational_step", "Faire confirmer la réalisation par la personne autorisée ou enregistrer le motif d’absence"),
      item("operational_step", "Noter précisément réserve, dommage, refus, attente ou prestation partielle"),
      item("operational_step", "Joindre les photos, scans, signatures et documents attendus sans donnée superflue"),
      item("operational_step", "Déclencher retour, nouvelle intervention, enquête ou facturation complémentaire si justifié"),
      item("operating_rule", "Ne jamais transformer une preuve manquante en preuve supposée"),
      item("recurring_control", "Contrôler chaque jour les dossiers non facturables ou incomplets"),
    ],
    [P.replace]: [
      item("implementation_action", "Créer un plan de remplacement avec compétences, documents, moyens, contacts et limites"),
      item("operational_step", "Vérifier permis, carte, habilitation, repos, assurance et connaissance de la mission"),
      item("operational_step", "Transmettre lieux, horaires, contraintes, contacts, preuves et incidents déjà connus"),
      item("operational_step", "Informer client et terrain lorsque le remplacement modifie une information utile"),
      item("operating_rule", "Ne pas affecter une personne ou un véhicule qui ne satisfait pas les exigences de la mission"),
      item("recurring_control", "Contrôler chaque semaine les échéances de permis, cartes, formations et visites"),
      item("recurring_control", "Tester régulièrement la reprise d’une mission prioritaire sans son titulaire"),
    ],
    [P.profitability]: [
      item("implementation_action", "Créer un budget par mission avec prix, temps, distance, énergie, péage, achats et sous-traitance"),
      item("operational_step", "Tracer les kilomètres, temps, attente, frais, incidents et reprises réellement consommés"),
      item("operational_step", "Affecter chaque coût au bon client, contrat, tournée ou mission"),
      item("recurring_control", "Comparer prévu, réalisé, facturé et encaissé par mission et par client"),
      item("recurring_control", "Identifier chaque mois kilomètres à vide, attente, sous-charge, reprise et remise"),
      item("operating_rule", "Traiter une dérive avant de la masquer par du temps non déclaré ou une baisse de sécurité"),
      item("implementation_action", "Mettre à jour les prix lorsque coûts, contraintes ou niveau de service changent durablement"),
    ],
    [P.cash]: [
      item("implementation_action", "Relier chaque facture à une mission, une période, un tarif et une preuve contractuelle"),
      item("operational_step", "Contrôler bon de commande, prix, supplément, preuve et coordonnées avant facturation"),
      item("operational_step", "Émettre la facture dès que les conditions contractuelles sont réunies"),
      item("operational_step", "Valider chaque dépense avec fournisseur, mission, justificatif et accord prévu"),
      item("operational_step", "Relancer avec montant, référence, échéance, pièce et prochaine étape"),
      item("recurring_control", "Revoir chaque semaine à facturer, échus, contestés, fournisseurs et trésorerie à huit semaines"),
      item("operating_rule", "Ne pas payer ni rembourser une dépense sans rattachement et justificatif vérifiable"),
    ],
  },
};

export type LogisticsTradeProfile = {
  slug: string;
  name: string;
  wave: "goods" | "people";
  reviewState: "internal_review_complete";
  growthPriorities: string;
  delegatedDecisions: string;
  visibilityRisks: string;
  qualificationFrame: string;
  criticalChecks: string;
  planningFrame: string;
  assignmentChecks: string;
  executionStandard: string;
  executionTrace: string;
  closingProof: string;
  complaintEvidence: string;
  replacementChecks: string;
  marginRisks: string;
  billingProof: string;
};

const patches = (profile: LogisticsTradeProfile): ProcessContentPatch[] => [
  { processId: P.cap, contentIndex: 0, label: `Choisir les priorités de croissance : ${profile.growthPriorities}` },
  { processId: P.decisions, contentIndex: 0, label: `Déléguer explicitement : ${profile.delegatedDecisions}` },
  { processId: P.visibility, contentIndex: 1, label: `Identifier avant départ les risques suivants : ${profile.visibilityRisks}` },
  { processId: P.qualify, contentIndex: 0, label: `Qualifier chaque demande avec : ${profile.qualificationFrame}` },
  { processId: P.qualify, contentIndex: 2, label: `Vérifier avant chiffrage : ${profile.criticalChecks}` },
  { processId: P.plan, contentIndex: 0, label: `Planifier précisément : ${profile.planningFrame}` },
  { processId: P.plan, contentIndex: 1, label: `Affecter les moyens selon : ${profile.assignmentChecks}` },
  { processId: P.execute, contentIndex: 0, label: `Standardiser l’exécution : ${profile.executionStandard}` },
  { processId: P.execute, contentIndex: 1, label: `Tracer pendant l’exécution : ${profile.executionTrace}` },
  { processId: P.close, contentIndex: 0, label: `Clôturer avec les preuves suivantes : ${profile.closingProof}` },
  { processId: P.complaint, contentIndex: 0, label: `Constituer le dossier de réclamation avec : ${profile.complaintEvidence}` },
  { processId: P.replace, contentIndex: 1, label: `Contrôler avant remplacement : ${profile.replacementChecks}` },
  { processId: P.profitability, contentIndex: 1, label: `Tracer particulièrement les risques de marge : ${profile.marginRisks}` },
  { processId: P.cash, contentIndex: 0, label: `Facturer à partir de : ${profile.billingProof}` },
];

export const generateLogisticsTradeProcessDraft = (
  profile: LogisticsTradeProfile,
) =>
  composeProcessDraft(logisticsFamilyCoreDraft, [
    { id: `metier.${profile.slug}`, contentPatches: patches(profile) },
  ]);

export const logisticsTradeProfiles = {
  demenagement: {
    slug: "demenagement",
    name: "Déménagement professionnel",
    wave: "goods",
    reviewState: "internal_review_complete",
    growthPriorities: "déménagements professionnels rentables, transferts multisites, garde-meubles et contrats récurrents",
    delegatedDecisions: "renfort plafonné, matériel supplémentaire, ajustement d’équipe, protection renforcée et arrêt sécurité",
    visibilityRisks: "accès non confirmé, volume sous-estimé, stationnement, objets sensibles, ascenseur, retard et coactivité",
    qualificationFrame: "adresses, volume, inventaire, étages, accès, ascenseurs, stationnement, dates, objets sensibles et prestations",
    criticalChecks: "visite ou preuves d’accès, volume, manutention spéciale, démontage, emballage, autorisations et valeur déclarée",
    planningFrame: "inventaire, ordre de chargement, protections, équipes, véhicules, stationnement, contacts et séquence des sites",
    assignmentChecks: "volume, charge utile, compétences de manutention, objets lourds, accès, équipements et temps réaliste",
    executionStandard: "état des lieux, protections, inventaire, chargement ordonné, sécurisation, communication et déchargement contrôlé",
    executionTrace: "horaires, inventaire, photos utiles, réserves avant prise en charge, incidents, changements et validation client",
    closingProof: "lettre de voiture ou document applicable, bulletin de livraison, réserves, inventaire, photos et signature",
    complaintEvidence: "déclaration de valeur, inventaire, photos avant-après, lettre de voiture, réserves, chronologie et échanges",
    replacementChecks: "compétence manutention, effectif, véhicule, équipements, accès, consignes et capacité à reprendre l’inventaire",
    marginRisks: "volume sous-estimé, portage, étages, attente, démontage, emballage, objet lourd, stationnement et reprise",
    billingProof: "devis accepté, volume et prestations convenus, lettre de voiture, bulletin de livraison, réserves et suppléments validés",
  },
  "livraison-dernier-kilometre": {
    slug: "livraison-dernier-kilometre",
    name: "Livraison dernier kilomètre",
    wave: "goods",
    reviewState: "internal_review_complete",
    growthPriorities: "tournées denses, comptes récurrents, créneaux rentables, retours maîtrisés et livraison à forte preuve",
    delegatedDecisions: "réordonnancement de tournée, reprogrammation, point relais autorisé, retour dépôt et renfort plafonné",
    visibilityRisks: "volume réel, adresse invalide, créneau serré, accès, colis sensible, destinataire absent et véhicule saturé",
    qualificationFrame: "zones, volumes, dimensions, poids, créneaux, fréquence, adresses, conditions de remise, retours et données",
    criticalChecks: "capacité de tournée, restrictions urbaines, stationnement, scans attendus, contact destinataire et traitement des échecs",
    planningFrame: "ordre des arrêts, fenêtres, capacité véhicule, chargement, scans, contacts, zones et procédure de retour",
    assignmentChecks: "nombre d’arrêts, charge utile, zone, véhicule, permis, connaissance de tournée et temps de pause",
    executionStandard: "scan au départ, chargement par séquence, suivi des arrêts, contact autorisé, remise conforme et gestion d’échec",
    executionTrace: "colis, scan, heure, position utile, motif d’échec, contact, photo autorisée, signature et retour",
    closingProof: "statut de chaque colis, signature ou preuve autorisée, motif d’échec, retour dépôt et anomalies",
    complaintEvidence: "identifiant colis, scans, horodatages, preuve de remise, motif d’échec, échanges et état au retour",
    replacementChecks: "tournée, véhicule, permis, application, accès dépôt, chargement, contacts et procédure de preuve",
    marginRisks: "faible densité, attente, adresse erronée, échec, seconde présentation, retour, kilomètre à vide et pic de volume",
    billingProof: "volumes confiés, statuts de livraison, preuves de remise, échecs contractuels, retours et grille tarifaire",
  },
  "transport-de-marchandise": {
    slug: "transport-de-marchandise",
    name: "Transport de marchandises",
    wave: "goods",
    reviewState: "internal_review_complete",
    growthPriorities: "lignes régulières, affrètement maîtrisé, chargements rentables, comptes industriels et taux de service élevé",
    delegatedDecisions: "itinéraire alternatif, arrêt sécurité, changement de tracteur, affrètement autorisé et information immédiate du client",
    visibilityRisks: "poids ou dimensions, marchandise particulière, chargement, arrimage, restrictions, temps conducteur et document absent",
    qualificationFrame: "nature, poids, dimensions, palettes, lieux, créneaux, manutention, contraintes, valeur, incoterm utile et preuve",
    criticalChecks: "capacité, compatibilité véhicule, charge, arrimage, marchandises réglementées, accès, restrictions et temps réalisable",
    planningFrame: "ordre de transport, véhicule, conducteur, itinéraire, chargement, pauses, carburant, CMR ou document applicable et contacts",
    assignmentChecks: "permis et qualification, temps de conduite et repos applicables, carte conducteur, véhicule, charge et restrictions",
    executionStandard: "contrôle avant départ, chargement et arrimage, documents à bord, suivi ETA, pauses réglementaires et alerte",
    executionTrace: "départ, chargement, poids déclaré, conducteur, véhicule, étapes, temps, incident, ETA et preuve de livraison",
    closingProof: "CMR ou document applicable, réserves, quantités, état, signature, horodatage et justificatifs de frais",
    complaintEvidence: "ordre de transport, CMR, réserves, chronologie, données conducteur-véhicule, preuves d’état et échanges",
    replacementChecks: "permis, qualification, temps de conduite et repos, carte, véhicule, documents, itinéraire et marchandise",
    marginRisks: "kilomètres à vide, attente, péages, carburant, surcharge évitée, affrètement, immobilisation et re-livraison",
    billingProof: "ordre accepté, tarif, CMR ou preuve applicable, réserves, attente et frais supplémentaires validés",
  },
  "transport-de-personnes": {
    slug: "transport-de-personnes",
    name: "Transport de personnes B2B",
    wave: "people",
    reviewState: "internal_review_complete",
    growthPriorities: "navettes entreprises, événements, transferts réguliers, contrats-cadres et services à ponctualité élevée",
    delegatedDecisions: "véhicule de remplacement conforme, réaffectation chauffeur, itinéraire alternatif et information du donneur d’ordre",
    visibilityRisks: "liste passagers, capacité, accessibilité, bagages, point de prise en charge, retard amont et correspondance",
    qualificationFrame: "donneur d’ordre, passagers, horaires, arrêts, capacité, bagages, accessibilité, accueil, retours et niveau de service",
    criticalChecks: "catégorie de transport, capacité, véhicule, conducteur, documents applicables, temps de service et besoins particuliers",
    planningFrame: "feuille de route, passagers, arrêts, contacts, véhicule, conducteur, temps, accueil, correspondances et solution de secours",
    assignmentChecks: "permis et qualification applicables, repos, capacité, accessibilité, bagages, connaissance du trajet et posture de service",
    executionStandard: "contrôle véhicule, arrivée anticipée, identification, prise en charge, comptage, conduite sûre et information",
    executionTrace: "présence, départ, arrêts, arrivée, retard, incident, objet oublié, changement et contact donneur d’ordre",
    closingProof: "feuille de route, passagers pris en charge selon les données autorisées, horaires, incidents et validation client",
    complaintEvidence: "réservation, feuille de route, horaires, conducteur-véhicule, échanges, incident, objets trouvés et actions prises",
    replacementChecks: "permis, qualification et repos applicables, véhicule, capacité, accessibilité, feuille de route et contacts",
    marginRisks: "attente, amplitude, trajet à vide, annulation, véhicule surdimensionné, parking, accueil et changement tardif",
    billingProof: "commande ou contrat, feuille de route, horaires réalisés, prestations, attente et suppléments acceptés",
  },
  vtc: {
    slug: "vtc",
    name: "VTC",
    wave: "people",
    reviewState: "internal_review_complete",
    growthPriorities: "comptes entreprises directs, transferts gares-aéroports, événements, réservations récurrentes et marge hors plateforme",
    delegatedDecisions: "réaffectation d’une réservation, véhicule de remplacement déclaré si nécessaire, itinéraire et geste plafonné",
    visibilityRisks: "réservation non justifiable, vol ou train modifié, zone de prise en charge, attente, véhicule et carte indisponibles",
    qualificationFrame: "réservation préalable, client, passagers, horaire, prise en charge, destination, bagages, vol ou train et prix convenu",
    criticalChecks: "justificatif de réservation, carte professionnelle, véhicule et macaron, assurance, capacité et lieu d’attente autorisé",
    planningFrame: "preuve de réservation, conducteur, véhicule, horaire, suivi vol-train, point de rencontre, contact et prix",
    assignmentChecks: "carte professionnelle, véhicule inscrit ou remplacement déclaré selon le cas, assurance, disponibilité et présentation",
    executionStandard: "contrôle des justificatifs, arrivée anticipée, accueil identifié, prise en charge réservée, conduite sûre et discrétion",
    executionTrace: "réservation, chauffeur, véhicule, arrivée, prise en charge, dépose, attente, incident et prix facturé",
    closingProof: "réservation préalable, horaires, trajet, prix, paiement, incident éventuel et facture ou reçu",
    complaintEvidence: "justificatif de réservation, prix convenu, conducteur, véhicule, horaires, trajet, échanges et action corrective",
    replacementChecks: "carte professionnelle, véhicule autorisé et déclaré si requis, assurance, réservation transmise et présentation client",
    marginRisks: "commission plateforme, attente, approche à vide, annulation, parking, nettoyage, recharge ou carburant et retour sans course",
    billingProof: "réservation préalable, prix convenu, trajet réalisé, attente prévue, paiement et coordonnées de facturation",
  },
} satisfies Record<string, LogisticsTradeProfile>;
