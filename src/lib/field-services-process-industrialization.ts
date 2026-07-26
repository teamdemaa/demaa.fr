import {
  composeProcessDraft,
  type IndustrializedContentItem,
  type IndustrializedProcessDefinition,
  type ProcessContentPatch,
  type ProcessDraft,
} from "@/lib/process-industrialization";

export type FieldServicesRole =
  | "strategy"
  | "decisions"
  | "replacement"
  | "collections"
  | "profitability"
  | "contract"
  | "complaints"
  | "execution"
  | "planning";

export type FieldServicesProfile = {
  slug: "nettoyage-professionnel" | "entreprise-de-securite";
  name: string;
  sourceUrl: string;
  researchSources: readonly string[];
  priorities: string;
  performanceFrame: string;
  urgentDecision: string;
  protectiveAction: string;
  replacementFrame: string;
  eligibilityProof: string;
  billingFrame: string;
  profitabilityFrame: string;
  contractFrame: string;
  siteSurveyFrame: string;
  complaintFrame: string;
  executionFrame: string;
  qualityProof: string;
  planningFrame: string;
  equipmentFrame: string;
  operatingRule: string;
};

const processByRole: Record<FieldServicesRole, string> = {
  strategy:
    "process.securite-services-terrain.direction.savoir-ou-va-lactivite",
  decisions:
    "process.securite-services-terrain.direction.decider-sans-bloquer-le-terrain",
  replacement:
    "process.securite-services-terrain.equipe.remplacer-un-absent",
  collections:
    "process.securite-services-terrain.finance-admin.se-faire-payer",
  profitability:
    "process.securite-services-terrain.finance-admin.suivre-la-rentabilite-des-contrats",
  contract:
    "process.securite-services-terrain.marketing-vente.prendre-un-nouveau-contrat",
  complaints:
    "process.securite-services-terrain.marketing-vente.traiter-une-reclamation-client",
  execution:
    "process.securite-services-terrain.operations.controler-la-bonne-execution",
  planning:
    "process.securite-services-terrain.operations.planifier-les-interventions-ou-rondes",
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
  FieldServicesRole,
  IndustrializedProcessDefinition
> = {
  strategy: def("Choisir les contrats, sites et niveaux de service compatibles avec la capacité.", "Revue mensuelle ou appel d’offres.", "Un portefeuille rentable et réalisable.", "Dirigeant", "Mensuelle"),
  decisions: def("Arbitrer les incidents terrain sans retarder la protection immédiate.", "Incident, absence, écart ou urgence.", "Une mesure immédiate puis une décision tracée.", "Responsable d’exploitation", "Quotidienne"),
  replacement: def("Remplacer un absent avec une personne compétente et informée.", "Absence prévue ou imprévue.", "Un poste couvert sans improvisation dangereuse.", "Planificateur", "À chaque absence"),
  collections: def("Facturer à partir du contrat et des preuves d’exécution.", "Clôture de période ou prestation ponctuelle.", "Des factures justifiées et des impayés suivis.", "Responsable administratif", "Mensuelle"),
  profitability: def("Mesurer la marge réelle par site et contrat.", "Clôture mensuelle ou dérive de charge.", "Des contrats renégociés avant de devenir structurellement déficitaires.", "Dirigeant", "Mensuelle"),
  contract: def("Accepter seulement un site correctement visité, chiffré et cadré.", "Demande commerciale ou renouvellement.", "Un contrat exploitable par le terrain.", "Commercial", "À chaque proposition"),
  complaints: def("Traiter chaque réclamation à partir des faits et contrôles.", "Insatisfaction, incident ou non-conformité.", "Une réponse, une correction et une prévention tracées.", "Responsable d’exploitation", "À chaque réclamation"),
  execution: def("Vérifier que la prestation réelle correspond aux consignes et au contrat.", "Fin de vacation ou contrôle planifié.", "Des écarts détectés, corrigés et prouvés.", "Chef de secteur", "Quotidienne"),
  planning: def("Construire un planning faisable avec les bonnes personnes et les bons moyens.", "Nouveau contrat, changement ou absence.", "Une intervention couverte, préparée et contrôlable.", "Planificateur", "Hebdomadaire"),
};

const contentByRole: Record<FieldServicesRole, IndustrializedContentItem[]> = {
  strategy: [
    item("implementation_action", "Choisir les types de sites, prestations, zones, horaires et niveaux de service prioritaires"),
    item("implementation_action", "Fixer les objectifs de contrats, heures vendues, couverture, qualité, fidélisation et marge"),
    item("implementation_action", "Cartographier capacité interne, encadrement, matériel, véhicules et partenaires autorisés"),
    item("operational_step", "Classer chaque opportunité selon accès, risque, distance, amplitude, technicité et rentabilité"),
    item("recurring_control", "Comparer chaque mois heures vendues, heures réalisées, absences, incidents, reprises et marge"),
    item("recurring_control", "Identifier les sites fragiles par turnover, réclamations, temps de trajet ou dérive de périmètre"),
    item("operating_rule", "Refuser un contrat dont les moyens, horaires ou responsabilités restent incompatibles avec une exécution sûre"),
    item("operating_rule", "Formaliser tout changement de périmètre avant de mobiliser durablement l’équipe"),
  ],
  decisions: [
    item("implementation_action", "Écrire les décisions délégables avec seuil, délai, preuve et personne à prévenir"),
    item("operational_step", "Qualifier l’alerte selon danger immédiat, personnes, biens, accès, contrat et continuité"),
    item("operational_step", "Sécuriser la situation dans les limites du rôle puis alerter l’interlocuteur compétent"),
    item("operational_step", "Décider maintien, remplacement, arrêt, renfort ou intervention externe"),
    item("operational_step", "Informer le client des faits confirmés, de la mesure prise et de la prochaine étape"),
    item("operating_rule", "Ne jamais demander au terrain de masquer un écart pour préserver un indicateur"),
    item("recurring_control", "Revoir chaque semaine incidents répétés, décisions tardives et escalades contournées"),
    item("recurring_control", "Transformer chaque incident significatif en action attribuée avec date de vérification"),
  ],
  replacement: [
    item("implementation_action", "Tenir une matrice par agent avec compétences, autorisations, sites connus, horaires et mobilité"),
    item("operational_step", "Vérifier avant affectation l’aptitude requise, la disponibilité et les limites individuelles"),
    item("operational_step", "Contacter le remplaçant selon l’ordre prévu sans dépasser les règles de temps de travail"),
    item("operational_step", "Transmettre site, accès, horaires, consignes, risques, matériel et contact utile"),
    item("operational_step", "Informer client et encadrement du remplacement selon le contrat"),
    item("operating_rule", "Ne pas couvrir un poste réglementé ou risqué avec une personne non habilitée"),
    item("recurring_control", "Faire confirmer la prise de poste et les consignes critiques"),
    item("recurring_control", "Analyser chaque mois absences, remplacements tardifs, heures supplémentaires et sites sans doublure"),
  ],
  collections: [
    item("implementation_action", "Créer l’échéancier par contrat avec forfait, heures, prestations ponctuelles, indexation et pièces attendues"),
    item("operational_step", "Rapprocher planning, présence, bons, contrôles, incidents et avenants avant facturation"),
    item("operational_step", "Faire valider les heures ou prestations hors forfait selon le circuit contractuel"),
    item("operational_step", "Émettre la facture avec la référence et la preuve demandées par le client"),
    item("operational_step", "Traiter immédiatement les écarts de quantité, prix, périmètre ou bon de commande"),
    item("recurring_control", "Relancer les impayés selon un calendrier écrit avec propriétaire et prochain contact"),
    item("recurring_control", "Rapprocher chaque semaine factures, avoirs, règlements et contestations"),
    item("operating_rule", "Ne pas compenser une prestation non prévue sans avenant ou accord écrit exploitable"),
  ],
  profitability: [
    item("implementation_action", "Construire une marge par site avec heures payées, trajets, encadrement, matériel, consommables et reprises"),
    item("operational_step", "Imputer chaque heure et dépense au bon site, contrat et motif"),
    item("operational_step", "Valoriser remplacements, formation site, contrôles, déplacements et astreintes réellement nécessaires"),
    item("recurring_control", "Comparer chaque mois budget, réalisé, heures non facturées, absentéisme et achats"),
    item("recurring_control", "Isoler les écarts dus au sous-chiffrage, au périmètre, à l’organisation ou au client"),
    item("operational_step", "Corriger planning, méthode, prix ou périmètre avec une date d’effet mesurable"),
    item("operating_rule", "Ne pas considérer rentable un contrat qui dépend d’heures non déclarées ou de contrôles supprimés"),
    item("recurring_control", "Vérifier après correction que la marge et la qualité se redressent réellement"),
  ],
  contract: [
    item("implementation_action", "Créer une fiche de visite de site avec surfaces ou zones, accès, risques, fréquences, horaires et contraintes"),
    item("operational_step", "Faire la visite avec le décideur ou le référent opérationnel du client"),
    item("operational_step", "Relever précisément tâches, exclusions, niveaux de résultat, preuves et responsabilités"),
    item("operational_step", "Estimer heures, qualification, encadrement, trajet, matériel, consommables et remplacement"),
    item("operational_step", "Vérifier les obligations, autorisations, assurances et clauses propres au site"),
    item("operational_step", "Présenter une offre avec périmètre, planning, moyens, contrôles, gestion des écarts et prix"),
    item("operating_rule", "Ne pas démarrer sans interlocuteurs, accès, consignes d’urgence et validation du périmètre"),
    item("recurring_control", "Faire une revue de démarrage puis corriger le plan avec un écrit partagé"),
  ],
  complaints: [
    item("implementation_action", "Centraliser chaque réclamation avec site, date, faits, preuve, impact, responsable et délai"),
    item("operational_step", "Accuser réception et annoncer la prochaine étape sans reconnaître un fait non vérifié"),
    item("operational_step", "Comparer contrat, planning, consignes, présence, contrôle et témoignages utiles"),
    item("operational_step", "Protéger immédiatement les personnes, biens ou zones affectées si nécessaire"),
    item("operational_step", "Répondre avec faits établis, correction, délai et responsable"),
    item("operational_step", "Faire confirmer la résolution par le client ou le contrôle prévu"),
    item("recurring_control", "Analyser chaque mois récurrences par site, équipe, horaire, tâche et cause"),
    item("operating_rule", "Distinguer l’écart réel, le périmètre non prévu et l’attente client non formalisée"),
  ],
  execution: [
    item("implementation_action", "Créer la grille de contrôle par site avec points critiques, méthode, preuve et niveau attendu"),
    item("operational_step", "Vérifier prise de poste, identité, tenue, matériel, accès et compréhension des consignes"),
    item("operational_step", "Contrôler sur le terrain un échantillon représentatif aux horaires réels"),
    item("operational_step", "Comparer résultat observé, contrat, plan de site et événements de la vacation"),
    item("operational_step", "Tracer présence, actions, anomalies, photos autorisées, main courante ou fiche de contrôle"),
    item("operational_step", "Corriger immédiatement l’écart simple sans créer de nouveau risque"),
    item("operational_step", "Planifier reprise, renfort, formation ou remplacement pour l’écart non corrigeable"),
    item("recurring_control", "Faire vérifier la correction et clôturer avec une preuve"),
    item("recurring_control", "Comparer chaque semaine qualité, incidents, reprises et contrôles non réalisés"),
  ],
  planning: [
    item("implementation_action", "Créer le plan de chaque site avec horaires, zones, tâches, compétences, accès et points de contrôle"),
    item("implementation_action", "Construire les cycles et besoins de couverture à partir du contrat et des contraintes réelles"),
    item("operational_step", "Affecter chaque agent selon compétence, disponibilité, distance, site connu et continuité"),
    item("operational_step", "Réserver matériel, consommables, véhicule, clés, badges et moyens de communication"),
    item("operational_step", "Transmettre le planning et recueillir les indisponibilités avant le délai de verrouillage"),
    item("operational_step", "Préparer les moyens propres au site, aux risques et aux tâches prévues"),
    item("recurring_control", "Contrôler chaque jour postes non pourvus, retards, chevauchements et amplitudes anormales"),
    item("recurring_control", "Mettre à jour le planning réel après absence, remplacement, renfort ou changement client"),
    item("operating_rule", "Ne pas lancer une intervention sans accès, consignes, équipement et responsable identifiés"),
  ],
};

const buildCoreDraft = (): ProcessDraft => ({
  definitionsById: Object.fromEntries(
    Object.entries(processByRole).map(([role, processId]) => [
      processId,
      definitionsByRole[role as FieldServicesRole],
    ]),
  ),
  contentByProcessId: Object.fromEntries(
    Object.entries(processByRole).map(([role, processId]) => [
      processId,
      contentByRole[role as FieldServicesRole],
    ]),
  ),
});

const patch = (
  role: FieldServicesRole,
  contentIndex: number,
  label: string,
): ProcessContentPatch => ({
  processId: processByRole[role],
  contentIndex,
  label,
});

const profilePatches = (
  profile: FieldServicesProfile,
): readonly ProcessContentPatch[] => [
  patch("strategy", 0, `Choisir les priorités de l’activité : ${profile.priorities}`),
  patch("strategy", 1, `Piloter la performance avec : ${profile.performanceFrame}`),
  patch("decisions", 1, `Escalader ou arbitrer sans délai : ${profile.urgentDecision}`),
  patch("decisions", 2, `Appliquer d’abord la mesure suivante : ${profile.protectiveAction}`),
  patch("replacement", 0, `Tenir la matrice de remplacement avec : ${profile.replacementFrame}`),
  patch("replacement", 1, `Vérifier avant toute affectation : ${profile.eligibilityProof}`),
  patch("collections", 0, `Facturer et rapprocher selon : ${profile.billingFrame}`),
  patch("profitability", 0, `Calculer la rentabilité réelle avec : ${profile.profitabilityFrame}`),
  patch("contract", 0, `Visiter et cadrer le nouveau contrat avec : ${profile.contractFrame}`),
  patch("contract", 2, `Relever pendant la visite : ${profile.siteSurveyFrame}`),
  patch("complaints", 0, `Tracer les réclamations propres au métier : ${profile.complaintFrame}`),
  patch("execution", 0, `Construire le contrôle d’exécution autour de : ${profile.executionFrame}`),
  patch("execution", 4, `Conserver comme preuve de qualité : ${profile.qualityProof}`),
  patch("planning", 0, `Construire le plan de site autour de : ${profile.planningFrame}`),
  patch("planning", 5, `Préparer avant intervention : ${profile.equipmentFrame}`),
  patch("planning", 8, `Appliquer la règle métier suivante : ${profile.operatingRule}`),
];

export const generateFieldServicesCoreDraft = () => buildCoreDraft();

export const generateFieldServicesDraft = (profile: FieldServicesProfile) =>
  composeProcessDraft(buildCoreDraft(), [
    {
      id: `metier.${profile.slug}`,
      contentPatches: profilePatches(profile),
    },
  ]);

export const fieldServicesProfiles = {
  "nettoyage-professionnel": {
    slug: "nettoyage-professionnel",
    name: "Nettoyage professionnel",
    sourceUrl:
      "https://docs.google.com/spreadsheets/d/1My7zy6ZHm0Its0iw6kYYFN_eKEgC7ngW30naQOnwslI/edit",
    researchSources: [
      "https://www.inrs.fr/metiers/commerce-service/proprete/proprete-evaluer.html",
      "https://www.inrs.fr/media.html?refINRS=ED+6409",
      "https://www.inrs.fr/dam/inrs/CataloguePapier/ED/TI-ED-152.pdf",
      "https://www.inrs.fr/media.html?refINRS=outil154",
    ],
    priorities: "bureaux, copropriétés, commerces ou sites industriels ciblés, entretien courant, remise en état, vitrerie, horaires, densité géographique et récurrence",
    performanceFrame: "sites couverts, heures vendues et réalisées, absentéisme, contrôles conformes, reprises, consommation produit, accidents et marge",
    urgentDecision: "produit renversé ou mélange dangereux, chute, exposition, matériel défectueux, accès impossible, zone contaminée, agent isolé en difficulté ou absence non couverte",
    protectiveAction: "arrêter la tâche dangereuse, baliser la zone, éloigner les personnes, appliquer la fiche de sécurité et prévenir le responsable du site",
    replacementFrame: "sites connus, techniques maîtrisées, restrictions, horaires, mobilité, habilitations éventuelles, clés, badges et doublures",
    eligibilityProof: "formation au poste, prévention des chutes et TMS, utilisation des produits, FDS et dosages, matériel, EPI, accès et consignes du site",
    billingFrame: "forfait mensuel, fréquence, heures, surfaces, prestations ponctuelles, fournitures, bon d’intervention, contrôle, indexation et avenant",
    profitabilityFrame: "heures de chantier, préparation, trajet, encadrement, remplacement, machine, consommables, EPI, reprises et pertes de produit",
    contractFrame: "surfaces, matériaux, niveaux de salissure, fréquences, horaires, accès, coactivité, stockage, eau, électricité, déchets et résultat attendu",
    siteSurveyFrame: "métrés, sols et surfaces, sanitaires, vitres, points hauts, zones sensibles, déchets, produits autorisés, contraintes clients et risques",
    complaintFrame: "zone non faite, résultat insuffisant, dégradation, oubli de fermeture, consommable manquant, produit inadapté, retard, odeur, trace ou comportement",
    executionFrame: "plan de nettoyage, zones, tâches, fréquences, dosages, code couleur, gestes, matériel, résultat visuel et points critiques",
    qualityProof: "feuille de passage, contrôle contradictoire si prévu, anomalies, photos autorisées, reprise, consommation inhabituelle et validation client",
    planningFrame: "site, surfaces, fréquences, horaires, temps par tâche, coactivité, binômes, trajets, clés, stockage et contrôle",
    equipmentFrame: "chariot, franges, code couleur, aspirateur ou machine vérifiée, produits étiquetés, FDS accessibles, dosage, EPI et signalisation",
    operatingRule: "ne jamais mélanger des produits, utiliser le dosage et la méthode prévus, baliser les sols humides et arrêter tout matériel défectueux",
  },
  "entreprise-de-securite": {
    slug: "entreprise-de-securite",
    name: "Entreprise de sécurité B2B",
    sourceUrl:
      "https://docs.google.com/spreadsheets/d/1_h6xfgC7sbhVMVS-5JJWfSruJw5_UbhGAb39Cp2bGX4/edit",
    researchSources: [
      "https://cnaps.interieur.gouv.fr/Demarches-en-ligne/Vous-etes-un-particulier/Exercer-le-metier-d-agent-de-securite-privee/Exercer-le-metier-d-agent-de-securite-privee",
      "https://cnaps.interieur.gouv.fr/FAQ/DRACAR-ULTIMATE",
      "https://cnaps.interieur.gouv.fr/Publications/Fiches-thematiques/Activites-privees-de-securite-rappel-des-regles-applicables-a-l-intervention-des-agents",
      "https://www.cnaps.interieur.gouv.fr/Demarches-en-ligne/Vous-souhaitez-acheter-une-prestation-de-securite-privee/Vous-souhaitez-acheter-une-prestation-de-securite-privee",
    ],
    priorities: "surveillance humaine, gardiennage, contrôle d’accès, rondes, événementiel ou télésurveillance selon autorisations, sites ciblés, couverture et marge",
    performanceFrame: "postes couverts, prises de service, rondes, anomalies, levées de doute, incidents, contrôles, cartes valides, heures et marge",
    urgentDecision: "intrusion, agression, incendie, objet suspect, carte invalide, agent manquant, consigne illégale, confusion avec les forces publiques ou sous-traitant non autorisé",
    protectiveAction: "protéger et alerter dans les limites de la mission, appeler les services publics compétents, préserver les faits et informer la chaîne prévue",
    replacementFrame: "activité CNAPS autorisée, carte professionnelle, site connu, qualification SSIAP ou cynophile si requise, tenue, horaires, mobilité et doublure",
    eligibilityProof: "carte professionnelle valide pour l’activité, vérification Dracar Ultimate, aptitude et recyclage, contrat, tenue, badge, consignes et autorisation du site",
    billingFrame: "forfait ou heures, vacations, rondes, renforts, majorations, bons, main courante, écarts de planning, sous-traitance déclarée et avenants",
    profitabilityFrame: "heures planifiées et payées, majorations, encadrement, formation site, contrôle, tenue, équipement, véhicule, remplacement et sous-traitance",
    contractFrame: "autorisation d’exercer, activité couverte, analyse des risques, postes, horaires, consignes, moyens, limites d’intervention, contrôles et sous-traitance",
    siteSurveyFrame: "périmètre, accès, flux, risques, zones interdites, rondes, points de contrôle, alarmes, clés, interlocuteurs, secours et preuves attendues",
    complaintFrame: "poste découvert, retard, ronde absente, comportement, consigne non respectée, accès indu, incident mal escaladé, carte ou tenue non conforme",
    executionFrame: "prise de service, identité, carte et badge, tenue, consignes, main courante, rondes, contrôle d’accès, anomalies et fin de vacation",
    qualityProof: "prise et fin de service, main courante, rondes horodatées, anomalies, appels, événements, contrôle hiérarchique et correction",
    planningFrame: "site, poste, activité autorisée, horaires, compétences, carte, consignes, tenue, relève, ronde, pause et contrôle",
    equipmentFrame: "tenue et identification, badge, moyens de communication, PTI-DATI si prévu, clés, registre, lampe, EPI et équipement autorisé",
    operatingRule: "vérifier les cartes professionnelles au moins mensuellement et avant les grands événements, ne jamais affecter un agent sans titre valide ni dépasser les limites de la sécurité privée",
  },
} satisfies Record<string, FieldServicesProfile>;
