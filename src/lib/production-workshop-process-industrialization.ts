import {
  composeProcessDraft,
  type IndustrializedContentItem,
  type IndustrializedProcessDefinition,
  type ProcessContentPatch,
  type ProcessDraft,
} from "@/lib/process-industrialization";

export type ProductionWorkshopRole =
  | "decisions"
  | "strategy"
  | "team"
  | "collections"
  | "margin"
  | "quote"
  | "complaints"
  | "maintenance"
  | "supply"
  | "quality"
  | "order";

export type ProductionWorkshopProfile = {
  slug: "production-industrie" | "garage-automobile" | "carrosserie";
  name: string;
  sourceUrl: string;
  researchSources: readonly string[];
  strategicFocus: string;
  performanceFrame: string;
  urgentDecision: string;
  safetyFrame: string;
  teamFrame: string;
  competencyFrame: string;
  billingFrame: string;
  marginFrame: string;
  qualificationFrame: string;
  quoteFrame: string;
  complaintFrame: string;
  maintenanceFrame: string;
  equipmentFrame: string;
  supplyFrame: string;
  qualityFrame: string;
  orderFrame: string;
};

const processByRole: Record<ProductionWorkshopRole, string> = {
  decisions:
    "process.production-atelier.direction.decider-sans-bloquer-latelier",
  strategy:
    "process.production-atelier.direction.savoir-ou-va-lactivite",
  team:
    "process.production-atelier.equipe.organiser-les-postes-remplacer-un-absent-et-transmettre-les-consignes",
  collections:
    "process.production-atelier.finance-admin.se-faire-payer",
  margin:
    "process.production-atelier.finance-admin.suivre-la-marge",
  quote:
    "process.production-atelier.marketing-vente.qualifier-un-besoin-et-etablir-un-devis",
  complaints:
    "process.production-atelier.marketing-vente.traiter-une-reclamation-client",
  maintenance:
    "process.production-atelier.materiel-approvisionnement.entretenir-les-equipements-critiques",
  supply:
    "process.production-atelier.operations.eviter-la-rupture-de-pieces-ou-matieres",
  quality:
    "process.production-atelier.operations.garantir-la-qualite-de-sortie",
  order:
    "process.production-atelier.operations.ouvrir-suivre-et-cloturer-un-ordre-de-fabrication-ou-dintervention",
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
  ProductionWorkshopRole,
  IndustrializedProcessDefinition
> = {
  decisions: def("Arbitrer les aléas sans exposer les personnes ni la qualité.", "Panne, écart, retard ou demande nouvelle.", "Une mesure immédiate et une décision tracée.", "Responsable d’atelier", "Quotidienne"),
  strategy: def("Choisir les activités compatibles avec la capacité de l’atelier.", "Revue mensuelle ou nouvelle demande.", "Une charge rentable et réalisable.", "Dirigeant", "Mensuelle"),
  team: def("Affecter les bonnes compétences et assurer la continuité des postes.", "Planning, absence ou changement de priorité.", "Des postes couverts avec des consignes comprises.", "Responsable d’atelier", "Quotidienne"),
  collections: def("Facturer les travaux autorisés et rapprocher les encaissements.", "Fin de prestation ou jalon.", "Une facture justifiée et un règlement suivi.", "Responsable administratif", "Hebdomadaire"),
  margin: def("Mesurer la marge réelle par ordre.", "Clôture ou dérive de coût.", "Des écarts expliqués et corrigés.", "Dirigeant", "Hebdomadaire"),
  quote: def("Transformer un besoin qualifié en prix, délai et périmètre acceptables.", "Demande client.", "Un devis exploitable par l’atelier.", "Chargé d’affaires", "À chaque demande"),
  complaints: def("Traiter une réclamation à partir de la traçabilité de l’ordre.", "Retour, défaut ou contestation.", "Une réponse, une correction et une prévention.", "Responsable qualité", "À chaque réclamation"),
  maintenance: def("Maintenir les équipements critiques disponibles et sûrs.", "Échéance, anomalie ou panne.", "Un équipement contrôlé avant remise en service.", "Responsable maintenance", "Selon échéance"),
  supply: def("Disposer des bonnes pièces et matières au moment prévu.", "Nouvel ordre ou seuil de stock.", "Une production sans rupture ni substitution sauvage.", "Approvisionneur", "Quotidienne"),
  quality: def("Libérer uniquement une sortie conforme et traçable.", "Fin d’opération ou point de contrôle.", "Un produit ou véhicule contrôlé avant remise.", "Contrôleur qualité", "À chaque ordre"),
  order: def("Piloter chaque ordre de l’ouverture à la clôture.", "Devis ou commande accepté.", "Un dossier complet avec travaux, temps, pièces et validations.", "Responsable d’atelier", "À chaque ordre"),
};

const contentByRole: Record<ProductionWorkshopRole, IndustrializedContentItem[]> = {
  decisions: [
    item("implementation_action", "Définir les décisions délégables avec seuil de coût, délai, sécurité, qualité et personne à prévenir"),
    item("operational_step", "Qualifier l’alerte : danger, panne, matière, qualité, délai, demande client ou capacité"),
    item("operational_step", "Arrêter et sécuriser immédiatement l’équipement, le poste ou le produit lorsqu’un danger est possible"),
    item("operational_step", "Évaluer impact sur personnes, ordres en cours, délai, coût, stock et client"),
    item("operational_step", "Décider reprise, isolement, maintenance, remplacement, sous-traitance, replanification ou arrêt"),
    item("recurring_control", "Revoir chaque jour les ordres bloqués, décisions en attente et mesures provisoires"),
    item("operating_rule", "Ne jamais contourner une protection, un contrôle ou une consigne pour tenir le planning"),
  ],
  strategy: [
    item("implementation_action", "Choisir familles de travaux, clients, volumes, niveaux de technicité, délais et zones prioritaires"),
    item("implementation_action", "Fixer objectifs de commandes, charge, délai, qualité, reprises, disponibilité, chiffre d’affaires et marge"),
    item("operational_step", "Cartographier postes, compétences, équipements, goulots, capacités horaires et partenaires autorisés"),
    item("operational_step", "Classer chaque demande selon valeur, urgence, charge, risque, approvisionnement et rentabilité"),
    item("recurring_control", "Comparer chaque semaine charge vendue, charge disponible, retards, encours et saturation des goulots"),
    item("recurring_control", "Comparer chaque mois ventes, production, rebuts, reprises, pannes, accidents, encaissements et marge"),
    item("operating_rule", "Limiter les nouveaux engagements lorsque sécurité, qualité ou délai ne peuvent plus être tenus"),
  ],
  team: [
    item("implementation_action", "Tenir une matrice par personne avec poste, compétences, autorisations, restrictions, horaires et relais"),
    item("operational_step", "Affecter chaque ordre selon compétence, charge, équipement, risque et continuité"),
    item("operational_step", "Faire un briefing avec ordre, méthode, risques, contrôle, matière, outillage et délai"),
    item("operational_step", "Préparer le remplacement avec état réel, pièces, réglages, anomalies et prochaine étape"),
    item("recurring_control", "Vérifier chaque début de poste les absences, postes critiques et compétences manquantes"),
    item("recurring_control", "Faire confirmer la compréhension des consignes nouvelles ou critiques"),
    item("operating_rule", "Ne pas affecter une personne non formée ou non autorisée à une opération à risque"),
  ],
  collections: [
    item("implementation_action", "Créer l’échéancier avec acompte, jalons, solde, pièces justificatives et conditions de règlement"),
    item("operational_step", "Rapprocher devis ou commande, ordre réel, travaux autorisés, pièces, temps et livraison"),
    item("operational_step", "Faire accepter par écrit tout supplément avant de l’exécuter hors urgence de sécurité"),
    item("operational_step", "Émettre la facture avec références, quantités, prix, taxes, acompte et échéance"),
    item("recurring_control", "Rapprocher chaque semaine factures, avoirs, règlements, retenues et contestations"),
    item("operating_rule", "Ne pas clôturer administrativement un ordre tant que les écarts de facturation restent inexpliqués"),
  ],
  margin: [
    item("implementation_action", "Construire le coût prévu avec heures, pièces, matières, consommables, énergie, sous-traitance et frais"),
    item("operational_step", "Imputer chaque temps, sortie de stock, achat, perte et sous-traitance au bon ordre"),
    item("operational_step", "Calculer coût réel, chiffre facturable, marge brute et coût des reprises"),
    item("recurring_control", "Comparer chaque semaine prévu, engagé, réalisé, reste à faire, facturé et encaissé"),
    item("recurring_control", "Isoler les écarts dus au devis, rendement, rebut, panne, attente, achat urgent ou modification"),
    item("operational_step", "Corriger prix, gamme, approvisionnement, planning ou méthode pour les prochains ordres"),
    item("operating_rule", "Ne pas masquer les heures d’attente, de reprise ou de contrôle dans la rentabilité"),
  ],
  quote: [
    item("implementation_action", "Créer une fiche de découverte avec client, objet, quantité, état, usage, délai, budget et décideur"),
    item("operational_step", "Inspecter ou documenter l’existant avant de promettre une méthode ou un résultat"),
    item("operational_step", "Définir inclusions, exclusions, pièces ou matières, tolérances, contrôles et conditions d’accès"),
    item("operational_step", "Vérifier capacité, compétence, équipement, approvisionnement, sous-traitance et délai réaliste"),
    item("operational_step", "Chiffrer main-d’œuvre, pièces, matières, consommables, frais, aléas identifiés et marge"),
    item("operational_step", "Présenter prix, délai, validité, paiement, garantie applicable et gestion des travaux supplémentaires"),
    item("operating_rule", "Ne pas promettre un prix ferme lorsque le diagnostic ou le démontage conditionne encore le périmètre"),
  ],
  complaints: [
    item("implementation_action", "Centraliser chaque réclamation avec ordre, lot, faits, preuve, impact, responsable et délai"),
    item("operational_step", "Accuser réception et protéger immédiatement personnes, produit ou preuve si nécessaire"),
    item("operational_step", "Comparer demande, devis, ordre, traçabilité, contrôles, pièces, mesures et livraison"),
    item("operational_step", "Décider expertise, reprise, remplacement, avoir, refus motivé ou déclaration d’assurance"),
    item("recurring_control", "Analyser chaque mois récurrences par opération, poste, matière, fournisseur et cause"),
    item("operating_rule", "Ne pas effacer une donnée ou remplacer une pièce avant d’avoir préservé les éléments utiles à l’analyse"),
  ],
  maintenance: [
    item("implementation_action", "Inventorier les équipements avec criticité, responsable, notice, contrôle, maintenance et pièces de sécurité"),
    item("implementation_action", "Créer le plan préventif selon constructeur, usage, risque, réglementation et historique"),
    item("operational_step", "Signaler et isoler tout équipement présentant bruit, fuite, défaut, protection absente ou mesure incohérente"),
    item("operational_step", "Préparer l’intervention avec arrêt, consignation, énergie résiduelle, accès et pièces"),
    item("operational_step", "Réaliser ou faire réaliser la maintenance par une personne compétente et autorisée"),
    item("recurring_control", "Tester sécurités et fonctionnement puis tracer la remise en service"),
    item("operating_rule", "Interdire l’usage d’un équipement condamné, non contrôlé ou remis en service sans essai"),
  ],
  supply: [
    item("implementation_action", "Créer les références avec désignation, spécification, fournisseur approuvé, délai, seuil et emplacement"),
    item("implementation_action", "Définir stocks minimums selon consommation, criticité, délai fournisseur et solution de secours"),
    item("operational_step", "Réserver pièces et matières à l’ouverture de l’ordre puis identifier les manquants"),
    item("operational_step", "Commander avec référence, quantité, qualité, délai, prix et ordre concerné"),
    item("operational_step", "Contrôler à réception quantité, référence, lot, état, conformité et documents"),
    item("recurring_control", "Comparer stock physique, stock système, réservations, rebuts et commandes en retard"),
    item("operating_rule", "Ne jamais substituer une pièce ou matière sans validation technique et traçabilité"),
  ],
  quality: [
    item("implementation_action", "Définir les contrôles d’entrée, en cours et de sortie avec critère, moyen, preuve et responsable"),
    item("operational_step", "Vérifier référence de l’ordre, identité du produit, version, pièces ou matières avant contrôle"),
    item("operational_step", "Réaliser les mesures, essais et inspections prévus avec un moyen adapté"),
    item("operational_step", "Isoler toute non-conformité et décider retouche, reprise, dérogation autorisée ou rebut"),
    item("recurring_control", "Faire signer ou tracer la libération avant emballage, livraison ou restitution"),
    item("operating_rule", "Ne pas libérer une sortie lorsque le contrôle critique manque ou reste ambigu"),
  ],
  order: [
    item("implementation_action", "Créer un ordre unique avec client, objet, version, périmètre, délai, budget, responsable et statut"),
    item("operational_step", "Joindre devis ou commande accepté, données d’entrée, méthode, pièces et critères qualité"),
    item("operational_step", "Planifier les opérations selon dépendances, postes, compétences, équipements et approvisionnements"),
    item("operational_step", "Tracer début, fin, temps, pièces, matières, mesures, anomalies et décisions à chaque étape"),
    item("recurring_control", "Mettre à jour quotidiennement avancement, reste à faire, blocages, coût et date prévue"),
    item("operational_step", "Contrôler la sortie, préparer documents, informer le client et organiser la remise"),
    item("operating_rule", "Clôturer seulement après contrôle, traçabilité, facturation préparée et éléments confiés restitués"),
  ],
};

const buildCoreDraft = (): ProcessDraft => ({
  definitionsById: Object.fromEntries(
    Object.entries(processByRole).map(([role, id]) => [
      id,
      definitionsByRole[role as ProductionWorkshopRole],
    ]),
  ),
  contentByProcessId: Object.fromEntries(
    Object.entries(processByRole).map(([role, id]) => [
      id,
      contentByRole[role as ProductionWorkshopRole],
    ]),
  ),
});

const patch = (
  role: ProductionWorkshopRole,
  contentIndex: number,
  label: string,
): ProcessContentPatch => ({
  processId: processByRole[role],
  contentIndex,
  label,
});

const profilePatches = (
  profile: ProductionWorkshopProfile,
): readonly ProcessContentPatch[] => [
  patch("strategy", 0, `Choisir le positionnement de l’atelier : ${profile.strategicFocus}`),
  patch("strategy", 1, `Piloter la performance avec : ${profile.performanceFrame}`),
  patch("decisions", 1, `Qualifier immédiatement les alertes métier : ${profile.urgentDecision}`),
  patch("decisions", 2, `Appliquer d’abord la mesure de sécurité suivante : ${profile.safetyFrame}`),
  patch("team", 0, `Tenir la matrice d’équipe avec : ${profile.teamFrame}`),
  patch("team", 2, `Vérifier avant intervention : ${profile.competencyFrame}`),
  patch("collections", 0, `Facturer selon : ${profile.billingFrame}`),
  patch("margin", 0, `Calculer la marge réelle avec : ${profile.marginFrame}`),
  patch("quote", 0, `Qualifier chaque demande avec : ${profile.qualificationFrame}`),
  patch("quote", 2, `Définir précisément dans le devis : ${profile.quoteFrame}`),
  patch("complaints", 0, `Tracer les réclamations propres au métier : ${profile.complaintFrame}`),
  patch("maintenance", 0, `Inventorier et entretenir : ${profile.maintenanceFrame}`),
  patch("maintenance", 3, `Sécuriser les interventions sur : ${profile.equipmentFrame}`),
  patch("supply", 0, `Référencer et approvisionner : ${profile.supplyFrame}`),
  patch("quality", 0, `Construire le contrôle qualité autour de : ${profile.qualityFrame}`),
  patch("order", 0, `Ouvrir chaque ordre avec : ${profile.orderFrame}`),
];

export const generateProductionWorkshopCoreDraft = () => buildCoreDraft();

export const generateProductionWorkshopDraft = (
  profile: ProductionWorkshopProfile,
) =>
  composeProcessDraft(buildCoreDraft(), [
    {
      id: `metier.${profile.slug}`,
      contentPatches: profilePatches(profile),
    },
  ]);

export const productionWorkshopProfiles = {
  "production-industrie": {
    slug: "production-industrie",
    name: "Production & Industrie",
    sourceUrl:
      "https://docs.google.com/spreadsheets/d/1Wsv6O2uFwscJI_d9SlcnS0anKX5xwpLN3Vpg3Bq4ytY/edit",
    researchSources: [
      "https://www.inrs.fr/risques/maintenance/definitions.html",
      "https://www.inrs.fr/dam/inrs/CataloguePapier/ED/TI-ED-123.pdf",
      "https://www.inrs.fr/dms/inrs/GenerationPDF/accueil/demarche/conception-utilisation-equipements-travail/Machines%20%3A%20remise%20en%20service%20apr%C3%A8s%20une%20p%C3%A9riode%20d%27arr%C3%AAt.pdf",
      "https://www.inrs.fr/risques/machines/ce-qu-il-faut-retenir.html",
    ],
    strategicFocus: "familles de produits, petites ou moyennes séries, fabrication à la commande ou sur stock, procédés maîtrisés, capacité et exigences clients",
    performanceFrame: "commandes, charge, TRS ou disponibilité utile, cadence, encours, rendement matière, rebuts, retouches, retards, accidents et marge",
    urgentDecision: "machine dangereuse, dérive de réglage, matière non conforme, lot mélangé, contrôle hors tolérance, rupture, panne ou retard client",
    safetyFrame: "arrêter la ligne ou le poste, isoler le lot, consigner l’équipement si nécessaire et prévenir production, maintenance et qualité",
    teamFrame: "postes, compétences, autorisations, réglages maîtrisés, contrôle, manutention, maintenance premier niveau, équipes et polyvalence",
    competencyFrame: "gamme et version, risques du poste, protection machine, outillage, matière, paramètres, critères qualité et procédure d’arrêt",
    billingFrame: "acompte, jalons, quantités produites ou livrées, outillage, matière, emballage, transport, rebut imputable et solde contractuel",
    marginFrame: "matières, temps machine, main-d’œuvre, réglage, énergie, outillage, sous-traitance, contrôle, rebut, retouche et logistique",
    qualificationFrame: "plan ou cahier des charges, version, quantité, matière, tolérances, procédé, contrôle, traçabilité, emballage et délai",
    quoteFrame: "référence, version, quantité, matière, gamme, tolérances, échantillon, contrôle, conditionnement, délai et règles de modification",
    complaintFrame: "lot, référence, version, quantité, défaut, mesure, traçabilité matière, emballage, transport, retard ou répétition",
    maintenanceFrame: "machines de production, protections, arrêts, aspiration, levage, manutention, métrologie, outillages et utilités critiques",
    equipmentFrame: "énergies électriques, pneumatiques, hydrauliques, mécaniques ou thermiques, consignation, accès et remise en service",
    supplyFrame: "matières par spécification et lot, composants, consommables, emballages, pièces d’usure et fournisseurs approuvés",
    qualityFrame: "contrôle matière, première pièce, paramètres procédé, autocontrôle, échantillonnage, mesures finales, lot, non-conformité et libération",
    orderFrame: "commande, référence et version, quantité, gamme, matière et lot, postes, contrôles, conditionnement, délai et responsable",
  },
  "garage-automobile": {
    slug: "garage-automobile",
    name: "Garage automobile",
    sourceUrl:
      "https://docs.google.com/spreadsheets/d/13oKctvU0UGzTiRQ0zciPZw3rjXQD-89B8pLlUC6xxj4/edit",
    researchSources: [
      "https://www.inrs.fr/metiers/commerce-service/garage/garage-solutions",
      "https://www.inrs.fr/metiers/commerce-service/garage/garage-fiches-de-poste.html",
      "https://www.service-public.fr/particuliers/actualites/A17832",
      "https://www.inrs.fr/dam/inrs/CataloguePapier/ED/TI-ED-6282.pdf",
    ],
    strategicFocus: "entretien, mécanique, diagnostic électronique, pneumatiques ou vitrage selon compétences, marques, véhicules, équipements et délai",
    performanceFrame: "rendez-vous, entrées atelier, heures vendues et produites, disponibilité ponts, pièces, devis acceptés, délais, retours, panier, marge et encaissements",
    urgentDecision: "véhicule dangereux, mauvaise identification, panne non prévue, vis grippée, pièce indisponible, batterie haute tension, fuite, essai impossible ou supplément",
    safetyFrame: "immobiliser le véhicule, sécuriser clés et zone, utiliser les points de levage et la procédure énergétique adaptée, puis prévenir le client",
    teamFrame: "mécanique, diagnostic, électricité, climatisation, pneus, vitrage, habilitation électrique éventuelle, essais, permis et relais",
    competencyFrame: "VIN et véhicule, ordre de réparation, symptômes, données constructeur, levage, énergies, outillage, couple de serrage et essai prévu",
    billingFrame: "ordre accepté, diagnostic, main-d’œuvre, pièces, fluides, consommables, forfaits, travaux supplémentaires autorisés, remises et acompte",
    marginFrame: "heures technicien, temps barémé et réel, pièces, remises fournisseur, consommables, sous-traitance, immobilisation du pont et retour atelier",
    qualificationFrame: "immatriculation et VIN, kilométrage, symptômes, voyant, historique, usage, urgence, disponibilité, garantie et autorisation de diagnostic",
    quoteFrame: "diagnostic inclus ou séparé, opérations, pièces neuves ou alternatives autorisées, main-d’œuvre, fluides, délai, essai et supplément conditionnel",
    complaintFrame: "panne persistante, nouveau symptôme, bruit, fuite, voyant, pièce, délai, prix, dommage, essai, entretien ou garantie contestée",
    maintenanceFrame: "ponts élévateurs, fosses, compresseur, extraction des gaz, équilibreuse, démonte-pneu, climatisation, diagnostic et outillage",
    equipmentFrame: "véhicule levé, batterie et haute tension éventuelle, pression, carburant, fluides, pièces en mouvement, fosse et essai moteur",
    supplyFrame: "pièces par VIN et monte, fluides et normes, pneumatiques, consommables, pièces de sécurité, consignes, retours et pièces remplacées",
    qualityFrame: "identité véhicule, travaux commandés, couples et niveaux, absence de fuite, effacement justifié, essai, voyants, propreté et restitution des pièces demandées",
    orderFrame: "client, véhicule, VIN, kilométrage, carburant ou charge, état d’entrée, symptômes, travaux autorisés, clés, délai et responsable",
  },
  carrosserie: {
    slug: "carrosserie",
    name: "Carrosserie",
    sourceUrl:
      "https://docs.google.com/spreadsheets/d/1tI7i3OZEsF0XxYm_v_Q87Yx5scmHGhRVUdNgjaZu8oI/edit",
    researchSources: [
      "https://www.inrs.fr/media.html?refINRS=ED+6406",
      "https://www.inrs.fr/metiers/commerce-service/garage/garage-solutions",
      "https://www.inrs.fr/risques/solvants/ce-qu-il-faut-retenir",
      "https://www.inrs.fr/dam/inrs/CataloguePapier/ED/TI-ED-6282.pdf",
    ],
    strategicFocus: "tôlerie, remplacement d’éléments, réparation plastique, préparation et peinture selon véhicules, agréments, cabine, technicité et capacité",
    performanceFrame: "expertises, accords, entrées, temps tôlerie et peinture, cabine, pièces, véhicules prêts, retards, retouches, colorimétrie, panier et marge",
    urgentDecision: "dommage structurel, élément de sécurité, chiffrage incomplet, pièce indisponible, teinte incertaine, produit chimique, ventilation, incendie ou supplément expert",
    safetyFrame: "arrêter meulage, soudage ou pulvérisation, isoler les énergies et produits, vérifier aspiration ou cabine et prévenir le responsable",
    teamFrame: "démontage-remontage, tôlerie, soudage, aluminium éventuel, plastique, préparation, colorimétrie, peinture, ADAS éventuel et relais",
    competencyFrame: "véhicule et dossier, méthode constructeur, structure, énergies, produits et FDS, ventilation, EPI, teinte, temps d’évaporation et contrôle",
    billingFrame: "devis ou expertise accepté, pièces, temps barémés, ingrédients peinture, petites fournitures, sous-traitance, suppléments autorisés et franchise",
    marginFrame: "temps démontage, tôlerie, préparation, peinture et remontage, pièces, ingrédients, cabine, énergie, sous-traitance, retouche et immobilisation",
    qualificationFrame: "véhicule et VIN, sinistre, assureur ou paiement direct, photos, zones touchées, roulabilité, structure, ADAS, délai et véhicule de remplacement",
    quoteFrame: "démontage conditionnel, réparation ou remplacement, pièces, tôlerie, préparation, peinture, raccords, calibrage éventuel, délai et suppléments après dépose",
    complaintFrame: "teinte, grain, poussière, coulure, alignement, jeu, bruit, capteur, élément manquant, dommage, délai ou facturation",
    maintenanceFrame: "cabine et ventilation, aire de préparation, aspiration, filtres, mélange, pistolets, pont, soudage, redressage et appareils de mesure",
    equipmentFrame: "produits chimiques et FDS, isocyanates et solvants, incendie-explosion, aspiration, cabine, soudage, batterie et poussières",
    supplyFrame: "pièces de carrosserie par VIN, agrafes et fixations, mastics, apprêts, bases, vernis, durcisseurs, solvants, abrasifs et EPI",
    qualityFrame: "géométrie et alignement, fixations, protection anticorrosion, préparation, teinte, aspect, épaisseur, remontage, fonctions, propreté et essai",
    orderFrame: "client, véhicule, VIN, sinistre, assureur, état photographié, dommages visibles, démontage autorisé, expertise, délai et responsable",
  },
} satisfies Record<string, ProductionWorkshopProfile>;
