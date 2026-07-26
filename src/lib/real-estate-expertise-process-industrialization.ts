import {
  composeProcessDraft,
  type IndustrializedContentItem,
  type IndustrializedProcessDefinition,
  type ProcessContentPatch,
  type ProcessDraft,
} from "@/lib/process-industrialization";

export type RealEstateExpertiseRole =
  | "compliance" | "decisions" | "access" | "strategy" | "team"
  | "payables" | "collections" | "margin" | "qualification"
  | "complaints" | "sales" | "preparation" | "report" | "field";

export type RealEstateExpertiseProfile = {
  slug: "architecte-maitre-oeuvre" | "diagnostiqueur-immobilier" | "geometre";
  name: string;
  sourceUrl: string;
  researchSources: readonly string[];
  strategicFocus: string;
  performanceFrame: string;
  urgentDecision: string;
  accessFrame: string;
  teamFrame: string;
  payableFrame: string;
  billingFrame: string;
  marginFrame: string;
  qualificationFrame: string;
  salesFrame: string;
  complaintFrame: string;
  preparationFrame: string;
  equipmentFrame: string;
  fieldFrame: string;
  reportFrame: string;
  complianceFrame: string;
};

const processByRole: Record<RealEstateExpertiseRole, string> = {
  compliance: "process.immobilier-expertise.conformite-metier.tenir-les-pieces-et-assurances-en-regle",
  decisions: "process.immobilier-expertise.direction.decider-sans-bloquer-les-missions",
  access: "process.immobilier-expertise.direction.donner-acces-a-lessentiel",
  strategy: "process.immobilier-expertise.direction.savoir-ou-va-lactivite",
  team: "process.immobilier-expertise.equipe.organiser-les-missions-et-remplacements",
  payables: "process.immobilier-expertise.finance-admin.payer-a-temps",
  collections: "process.immobilier-expertise.finance-admin.se-faire-payer",
  margin: "process.immobilier-expertise.finance-admin.suivre-la-marge-et-la-facturation",
  qualification: "process.immobilier-expertise.marketing-vente.qualifier-la-mission-et-le-perimetre",
  complaints: "process.immobilier-expertise.marketing-vente.traiter-une-reclamation-client",
  sales: "process.immobilier-expertise.marketing-vente.vendre-une-mission-dexpertise",
  preparation: "process.immobilier-expertise.operations.preparer-la-mission-terrain",
  report: "process.immobilier-expertise.operations.produire-rapport-ou-livrable-final",
  field: "process.immobilier-expertise.operations.realiser-releves-plans-ou-constats",
};

const item = (type: IndustrializedContentItem["type"], label: string): IndustrializedContentItem => ({ type, label });
const def = (
  objective: string, trigger: string, expectedResult: string,
  defaultOwner: string, cadence: string,
): IndustrializedProcessDefinition => ({ objective, trigger, expectedResult, defaultOwner, cadence });

const definitionsByRole: Record<RealEstateExpertiseRole, IndustrializedProcessDefinition> = {
  compliance: def("Maintenir compétences, assurances, indépendance et pièces de mission à jour.", "Nouvelle mission ou échéance.", "Une intervention couverte et traçable.", "Responsable conformité", "Mensuelle"),
  decisions: def("Arbitrer les aléas sans dépasser le périmètre ni masquer une réserve.", "Écart, danger, contradiction ou demande nouvelle.", "Une décision datée et expliquée.", "Responsable de mission", "À chaque arbitrage"),
  access: def("Partager les données utiles avec les bons intervenants.", "Ouverture, transfert ou clôture de mission.", "Des accès maîtrisés et révocables.", "Responsable de mission", "À chaque changement"),
  strategy: def("Choisir les missions compatibles avec les compétences et la capacité.", "Revue mensuelle ou opportunité.", "Un portefeuille maîtrisé et rentable.", "Dirigeant", "Mensuelle"),
  team: def("Affecter une équipe compétente et organiser la continuité.", "Nouvelle mission ou indisponibilité.", "Chaque mission possède un responsable et un relais.", "Responsable planning", "Hebdomadaire"),
  payables: def("Payer les dépenses validées au bon dossier.", "Facture ou échéance.", "Des coûts justifiés et rapprochés.", "Responsable administratif", "Hebdomadaire"),
  collections: def("Facturer les jalons réalisés et suivre les règlements.", "Jalon contractuel ou livraison.", "Des créances justifiées et suivies.", "Responsable administratif", "Hebdomadaire"),
  margin: def("Mesurer temps, sous-traitance, frais et marge par mission.", "Clôture mensuelle ou dérive.", "Une rentabilité réelle et corrigée.", "Dirigeant", "Mensuelle"),
  qualification: def("Cadrer le besoin, le site, le livrable et les limites.", "Nouvelle demande.", "Une mission faisable et chiffrable.", "Responsable commercial", "À chaque demande"),
  complaints: def("Traiter une contestation à partir des faits et du contrat.", "Réclamation ou mise en cause.", "Une réponse et une correction tracées.", "Responsable qualité", "À chaque réclamation"),
  sales: def("Présenter une mission compréhensible, couverte et correctement chiffrée.", "Besoin qualifié.", "Une proposition acceptée sans ambiguïté de périmètre.", "Responsable commercial", "À chaque proposition"),
  preparation: def("Préparer données, accès, matériel et sécurité avant déplacement.", "Mission planifiée.", "Une intervention réalisable sans improvisation.", "Responsable de mission", "À chaque mission"),
  report: def("Produire un livrable vérifié, explicite et archivable.", "Terrain terminé ou jalon atteint.", "Un document cohérent et exploitable.", "Responsable de mission", "À chaque livraison"),
  field: def("Réaliser les observations et mesures selon la méthode prévue.", "Arrivée sur site.", "Des données terrain fiables et traçables.", "Intervenant terrain", "À chaque intervention"),
};

const contentByRole: Record<RealEstateExpertiseRole, IndustrializedContentItem[]> = {
  compliance: [
    item("implementation_action", "Tenir un calendrier des inscriptions, certifications, formations, assurances, matériels contrôlés et renouvellements"),
    item("implementation_action", "Centraliser contrats, attestations, déclarations, méthodes, modèles et règles professionnelles applicables"),
    item("operational_step", "Vérifier avant affectation compétence, autorisation, indépendance, assurance et limites de l’intervenant"),
    item("operational_step", "Rattacher au dossier les pièces en vigueur à la date de la mission"),
    item("recurring_control", "Auditer chaque mois un échantillon de missions, signatures, preuves et archivages"),
    item("operating_rule", "Suspendre toute mission non couverte, hors compétence ou présentant un conflit d’intérêts non résolu"),
  ],
  decisions: [
    item("implementation_action", "Écrire les décisions délégables avec seuil, délai, preuve et personne à prévenir"),
    item("operational_step", "Qualifier l’écart : sécurité, accès, donnée manquante, contradiction, hors périmètre, délai ou coût"),
    item("operational_step", "Sécuriser les personnes et les preuves avant de poursuivre ou d’arrêter"),
    item("operational_step", "Tracer décision, hypothèses, réserve, auteur et conséquence sur le livrable"),
    item("recurring_control", "Revoir chaque semaine blocages, réserves non levées et décisions tardives"),
  ],
  access: [
    item("implementation_action", "Définir les droits sur contrats, identités, plans, photos, mesures, rapports, factures et données sensibles"),
    item("operational_step", "Créer un dossier unique avec responsable, version, statut, prochaine action et échéance"),
    item("operational_step", "Partager les fichiers utiles par accès nominatif et révocable"),
    item("recurring_control", "Retirer les accès des sortants et contrôler les liens publics ou comptes partagés"),
    item("operating_rule", "Ne pas diffuser un plan, une photo ou une donnée sensible sans besoin et destinataire vérifiés"),
  ],
  strategy: [
    item("implementation_action", "Choisir types de missions, zones, clients, tailles de projet, délais et risques acceptés"),
    item("implementation_action", "Fixer objectifs de demandes, propositions, missions, délais, qualité, facturation et marge"),
    item("operational_step", "Classer les opportunités par compétence, charge, accès, responsabilité, complexité et rentabilité"),
    item("recurring_control", "Comparer chaque mois pipeline, production, reprises, retards, encaissements et marge"),
    item("operating_rule", "Refuser une mission que le planning, les compétences ou l’assurance ne permettent pas d’exécuter correctement"),
  ],
  team: [
    item("implementation_action", "Tenir une matrice de compétences, habilitations, matériels maîtrisés, zones et disponibilités"),
    item("operational_step", "Affecter responsable, contrôleur, intervenants, sous-traitants et relais"),
    item("operational_step", "Transmettre périmètre, données, risques, accès, méthode, livrable et échéances"),
    item("recurring_control", "Revoir chaque semaine charge, absences, missions sans relais et contrôles en retard"),
    item("operating_rule", "Ne pas remplacer un professionnel qualifié par une personne non autorisée pour tenir le délai"),
  ],
  payables: [
    item("implementation_action", "Créer l’échéancier des logiciels, matériels, étalonnages, déplacements, sous-traitants et données achetées"),
    item("operational_step", "Rapprocher facture, commande, mission, livrable et validation du responsable"),
    item("operational_step", "Faire valider tout dépassement ou achat hors budget avant paiement"),
    item("recurring_control", "Contrôler doublons, avoirs, prélèvements et dépenses sans dossier"),
    item("operating_rule", "Ne pas payer une prestation critique sans preuve de réalisation exploitable"),
  ],
  collections: [
    item("implementation_action", "Créer l’échéancier contractuel avec acompte, jalons, livrables, frais et solde"),
    item("operational_step", "Faire confirmer que le jalon et les pièces attendues sont livrés"),
    item("operational_step", "Émettre la facture avec mission, période, montant et référence contractuelle"),
    item("recurring_control", "Rapprocher chaque semaine factures, règlements, retenues et contestations"),
    item("operating_rule", "Ne pas facturer un supplément sans demande, périmètre et prix acceptés par écrit"),
  ],
  margin: [
    item("implementation_action", "Construire le budget par mission avec temps, déplacements, données, matériel, sous-traitance et contrôle"),
    item("operational_step", "Imputer chaque heure et dépense au bon dossier, phase et motif"),
    item("recurring_control", "Comparer budget, réalisé, reste à faire, facturé et encaissé"),
    item("operational_step", "Expliquer les écarts dus aux reprises, données manquantes, accès, changement ou sous-chiffrage"),
    item("operational_step", "Réviser prix, méthode, planning ou périmètre avant la prochaine mission comparable"),
    item("operating_rule", "Ne pas considérer rentable une mission dont les reprises ou contrôles ne sont pas comptés"),
  ],
  qualification: [
    item("implementation_action", "Créer une fiche de découverte avec demandeur, objet, site, délai, usage, livrable et décideurs"),
    item("operational_step", "Vérifier propriété ou pouvoir, accès, données disponibles et contraintes connues"),
    item("operational_step", "Distinguer inclusions, exclusions, hypothèses, normes, format et niveau de précision attendu"),
    item("operational_step", "Identifier risques de sécurité, responsabilité, conflit, urgence et dépendances"),
    item("operating_rule", "Ne pas chiffrer définitivement une mission dont l’objet ou le livrable reste ambigu"),
  ],
  complaints: [
    item("implementation_action", "Centraliser chaque réclamation avec mission, faits, preuve, contrat, impact, responsable et délai"),
    item("operational_step", "Accuser réception sans reconnaître un fait non vérifié"),
    item("operational_step", "Comparer contrat, données d’entrée, notes terrain, calculs, versions et livrable"),
    item("operational_step", "Répondre avec faits établis, correction, réserve, délai et assureur si nécessaire"),
    item("recurring_control", "Analyser les récurrences par mission, intervenant, méthode, cause et coût"),
  ],
  sales: [
    item("implementation_action", "Créer une proposition avec contexte, objet, méthode, livrables, limites, planning, honoraires et conditions"),
    item("operational_step", "Expliquer les données à fournir, accès attendus et responsabilités du client"),
    item("operational_step", "Chiffrer terrain, production, contrôle, frais, aléas identifiés et délais"),
    item("operational_step", "Faire accepter par écrit périmètre, prix, échéancier et conditions de modification"),
    item("operating_rule", "Ne pas promettre une conclusion avant les observations, mesures et vérifications nécessaires"),
  ],
  preparation: [
    item("implementation_action", "Créer une checklist avec contrat, adresse, contacts, accès, risques, documents, matériel et méthode"),
    item("operational_step", "Relire l’objet, le livrable, les exclusions et les données déjà disponibles"),
    item("operational_step", "Confirmer rendez-vous, autorisations, occupation du site et conditions d’accès"),
    item("operational_step", "Préparer matériel chargé, vérifié, identifié et adapté à la précision attendue"),
    item("operational_step", "Préparer sécurité, EPI, coactivité, météo et solution de repli"),
    item("operating_rule", "Reporter une intervention si l’accès, la sécurité ou le matériel ne permettent pas une mesure fiable"),
  ],
  report: [
    item("implementation_action", "Créer une trame avec objet, méthode, sources, observations, limites, résultats, réserves et annexes"),
    item("operational_step", "Contrôler cohérence entre notes, photos, mesures, calculs, plans et conclusions"),
    item("operational_step", "Faire une revue technique indépendante selon le niveau de risque"),
    item("operational_step", "Livrer la bonne version au bon destinataire avec preuve et consignes d’usage"),
    item("recurring_control", "Archiver sources, version signée, envoi, corrections et durée de conservation applicable"),
  ],
  field: [
    item("implementation_action", "Définir la méthode de relevé avec points de contrôle, tolérance, preuve et condition d’arrêt"),
    item("operational_step", "Faire un briefing sur objet, risques, accès, référentiel et zones à couvrir"),
    item("operational_step", "Identifier précisément site, locaux, parcelles, ouvrages ou éléments observés"),
    item("operational_step", "Réaliser observations et mesures sans extrapoler ce qui n’a pas été accessible"),
    item("operational_step", "Tracer conditions, anomalies, obstacles, photos autorisées et données manquantes"),
    item("recurring_control", "Vérifier la complétude et sauvegarder les données avant de quitter le site"),
  ],
};

const buildCoreDraft = (): ProcessDraft => ({
  definitionsById: Object.fromEntries(Object.entries(processByRole).map(([role, id]) => [id, definitionsByRole[role as RealEstateExpertiseRole]])),
  contentByProcessId: Object.fromEntries(Object.entries(processByRole).map(([role, id]) => [id, contentByRole[role as RealEstateExpertiseRole]])),
});
const patch = (role: RealEstateExpertiseRole, contentIndex: number, label: string): ProcessContentPatch => ({
  processId: processByRole[role], contentIndex, label,
});
const profilePatches = (p: RealEstateExpertiseProfile): readonly ProcessContentPatch[] => [
  patch("strategy", 0, `Choisir le positionnement métier : ${p.strategicFocus}`),
  patch("strategy", 1, `Piloter la performance avec : ${p.performanceFrame}`),
  patch("decisions", 1, `Qualifier immédiatement : ${p.urgentDecision}`),
  patch("access", 0, `Organiser les accès autour de : ${p.accessFrame}`),
  patch("team", 0, `Tenir la matrice d’équipe avec : ${p.teamFrame}`),
  patch("payables", 0, `Prévoir les dépenses suivantes : ${p.payableFrame}`),
  patch("collections", 0, `Facturer selon : ${p.billingFrame}`),
  patch("margin", 0, `Calculer la marge avec : ${p.marginFrame}`),
  patch("qualification", 0, `Qualifier la mission avec : ${p.qualificationFrame}`),
  patch("sales", 0, `Présenter précisément : ${p.salesFrame}`),
  patch("complaints", 0, `Tracer les réclamations métier : ${p.complaintFrame}`),
  patch("preparation", 0, `Préparer la mission avec : ${p.preparationFrame}`),
  patch("preparation", 3, `Préparer le matériel suivant : ${p.equipmentFrame}`),
  patch("field", 0, `Définir la méthode terrain autour de : ${p.fieldFrame}`),
  patch("report", 0, `Structurer le livrable avec : ${p.reportFrame}`),
  patch("compliance", 0, `Tenir les échéances et preuves suivantes : ${p.complianceFrame}`),
];

export const generateRealEstateExpertiseCoreDraft = () => buildCoreDraft();
export const generateRealEstateExpertiseDraft = (profile: RealEstateExpertiseProfile) =>
  composeProcessDraft(buildCoreDraft(), [{ id: `metier.${profile.slug}`, contentPatches: profilePatches(profile) }]);

export const realEstateExpertiseProfiles = {
  "architecte-maitre-oeuvre": {
    slug: "architecte-maitre-oeuvre", name: "Architecte / maître d’œuvre",
    sourceUrl: "https://docs.google.com/spreadsheets/d/1lIae4RktHVbE5qam-v8xxd7D4FTi9GzjJP1VEhxZkSU/edit",
    researchSources: [
      "https://www.architectes.org/faq/les-exercices-professionnels/droits-et-obligations-des-architectes",
      "https://www.architectes.org/quelles-garanties-vous-offre-larchitecte-91439",
      "https://www.architectes.org/sites/cnoa/files/2024-04/field_media_document/10135-20211216_contrat_moe_mo_privee_professionnelle_modele.pdf",
      "https://www.architectes.org/actualites/code-de-deontologie-des-architectes-independance-formation-conflits-dinterets-ce-qui",
    ],
    strategicFocus: "architecture, maîtrise d’œuvre complète ou partielle, rénovation, extension, marchés privés ou publics, taille de travaux et complexité technique",
    performanceFrame: "missions signées, phases livrées, permis, consultations, visas, réunions, travaux, modifications, honoraires, retards, réserves et marge",
    urgentDecision: "non-conformité, danger chantier, incohérence programme-budget, modification client, erreur de plan, entreprise défaillante ou réserve critique",
    accessFrame: "programme, contrat, relevés, études, plans, autorisations, pièces marchés, visas, comptes rendus, situations, réserves et DOE",
    teamFrame: "architecte inscrit, compétences, assurance déclarée, phases, ingénieries, économie, OPC éventuel, chantier, charge et succession de mission",
    payableFrame: "bureaux d’études, économiste, relevé, impression, maquette, logiciel, déplacement, concours, sous-traitance autorisée et études spécifiques",
    billingFrame: "acompte et honoraires par études, autorisation, conception, consultation, direction des travaux, réception et missions complémentaires acceptées",
    marginFrame: "temps par phase, réunions, modifications, déplacements, partenaires, reprises, chantier, assurance et reste à produire",
    qualificationFrame: "maître d’ouvrage, programme, site, titre, budget travaux, financement, calendrier, urbanisme, études existantes, mission complète ou partielle",
    salesFrame: "programme, faisabilité, mission par phase, obligations réciproques, livrables, exclusions, honoraires, assurances, propriété intellectuelle et modifications",
    complaintFrame: "conception, conseil, budget, délai, permis, plan, visa, suivi de chantier, honoraires, désordre, réception ou propriété intellectuelle",
    preparationFrame: "contrat, phase, plans, décisions, accès, intervenants, sécurité, points de contrôle, réunions précédentes et documents à produire",
    equipmentFrame: "plans à jour, tablette ou carnet, appareil photo autorisé, télémètre, EPI chantier, moyens d’accès et liste de contrôle",
    fieldFrame: "visite de site ou chantier, conformité aux études et marchés, avancement, écarts, ouvrages masqués, sécurité observée, décisions et réserves",
    reportFrame: "phase, programme, hypothèses, plans, prescriptions, estimations, avis, écarts, décisions, responsabilités, réserves et liste des pièces",
    complianceFrame: "inscription et déontologie si titre d’architecte, contrat écrit, déclaration de mission, assurance adaptée au contenu et coût des travaux, indépendance, conflits, autorisations et attestations",
  },
  "diagnostiqueur-immobilier": {
    slug: "diagnostiqueur-immobilier", name: "Diagnostiqueur immobilier",
    sourceUrl: "https://docs.google.com/spreadsheets/d/18MdXVZSoAm5Li3edKZWKwOjDeUKxS7pQJHnVwTY-2L4/edit",
    researchSources: [
      "https://www.service-public.fr/particuliers/actualites/A14608",
      "https://www.service-public.fr/particuliers/vosdroits/F16096",
      "https://www.service-public.fr/particuliers/vosdroits/F37110",
      "https://diagnostiqueurs.din.developpement-durable.gouv.fr/index.action",
    ],
    strategicFocus: "DPE, amiante, plomb, gaz, électricité, termites, mesurage ou audit selon certifications, mentions, bâtiments couverts et zone",
    performanceFrame: "rendez-vous, diagnostics par type, transmissions réglementaires, rapports, délais, reprises, certifications, étalonnages, facturation et marge",
    urgentDecision: "certification ou matériel invalide, conflit d’intérêts, zone inaccessible, danger, donnée propriétaire absente, incohérence bâtiment ou résultat anormal",
    accessFrame: "ordre de mission, identité propriétaire, adresse, année, plans, factures énergie, équipements, accès, photos, mesures, rapports et identifiants de transmission",
    teamFrame: "certification par domaine et mention, échéance, surveillance, assurance, matériels autorisés, zone, capacité, indépendance et relais qualifié",
    payableFrame: "certifications, surveillance, formation, assurance, logiciels, matériel, étalonnage, analyses laboratoire, consommables et déplacements",
    billingFrame: "acompte éventuel puis facture par bien, type de diagnostic, dépendance ou option clairement acceptée et rapport effectivement livré",
    marginFrame: "temps de trajet, terrain, saisie, transmission, matériel, laboratoire, reprises, certification et volume par type de diagnostic",
    qualificationFrame: "vente ou location, type et âge du bâtiment, adresse, surface, dépendances, installations, diagnostics requis, accès, délai et documents disponibles",
    salesFrame: "liste des diagnostics justifiés par le bien et l’opération, conditions d’accès, méthode, limites, délai, prix et absence de conclusion garantie",
    complaintFrame: "surface, classement DPE, élément non contrôlé, erreur d’adresse, accès absent, méthode, indépendance, retard, transmission ou rapport contesté",
    preparationFrame: "ordre de mission, diagnostics requis, certification, adresse, bâtiment, propriétaire, documents, accès à toutes zones, sécurité et transmission attendue",
    equipmentFrame: "appareils requis contrôlés ou étalonnés, logiciels à jour, EPI, prélèvements et emballages si concernés, appareil photo et moyens d’identification",
    fieldFrame: "identification du bien, méthode réglementaire applicable, zones visitées, mesures, justificatifs retenus, éléments non accessibles, anomalies et photographies",
    reportFrame: "identification, certification, assurance, méthode, périmètre, résultats, anomalies, limites, recommandations réglementaires, annexes et preuve de transmission",
    complianceFrame: "certifications et mentions par domaine, surveillance, assurance, indépendance et impartialité, matériel, méthodes en vigueur, transmission DPE à l’Ademe et archivage",
  },
  geometre: {
    slug: "geometre", name: "Géomètre",
    sourceUrl: "https://docs.google.com/spreadsheets/d/191IjC_8GJxbKxQQLiWEJLjbvNF8isfg9QIS9p5UwN5M/edit",
    researchSources: [
      "https://www.geometre-expert.fr/nous-connaitre/la-profession/",
      "https://www.geometre-expert.fr/prestation/foncier/bornage/",
      "https://www.geometre-expert.fr/prestation/topographie/plans-de-batiments/",
      "https://www.geometre-expert.fr/nous-connaitre/nos-instances/",
    ],
    strategicFocus: "topographie, foncier, bornage réservé au géomètre-expert, division, implantation, copropriété, bâtiment, aménagement et types de donneurs d’ordre",
    performanceFrame: "demandes, devis, missions, journées terrain, points relevés, plans, procès-verbaux, contradictions, reprises, délais, facturation et marge",
    urgentDecision: "limite contestée, voisin absent, repère incohérent, précision insuffisante, danger terrain, accès refusé, titre contradictoire ou implantation à risque",
    accessFrame: "commande, titres, plans, cadastre indicatif, archives, coordonnées, autorisations, données terrain, calculs, plans, procès-verbaux et signatures",
    teamFrame: "géomètre-expert inscrit pour missions réservées, techniciens, compétences instruments, habilitations, précision, zones, charge et relais",
    payableFrame: "instruments, contrôles, logiciels, données, archives, déplacements, sous-traitance permise, piquetage, publication et frais administratifs",
    billingFrame: "acompte puis jalons de recherche, terrain, calcul, contradictoire, plan, procès-verbal, dépôt et prestations complémentaires acceptées",
    marginFrame: "recherche, convocations, trajet, terrain, calcul, dessin, contradiction, retours, matérialisation, archivage et matériel",
    qualificationFrame: "demandeur, qualité à agir, parcelles, objet topographique ou foncier, précision, voisinage, titres, urgence, accès, livrable et usage",
    salesFrame: "distinction entre relevé topographique et définition juridique réservée, recherches, terrain, contradictoire, matérialisation, livrables, limites et honoraires",
    complaintFrame: "limite, surface, implantation, précision, repère, voisin non convoqué, plan, délai, accès, dommage ou usage hors périmètre",
    preparationFrame: "commande, titres, cadastre comme indice, archives foncières, points connus, référentiel, riverains, convocations, accès, sécurité et météo",
    equipmentFrame: "station totale, GNSS, niveau ou scanner selon précision, contrôles instrumentaux, batteries, sauvegarde, matérialisation, EPI et signalisation",
    fieldFrame: "référentiel, stations et contrôles, points limites ou détails, tolérances, croquis, photos, obstacles, riverains présents et matérialisation",
    reportFrame: "objet, références, titres et archives, méthode, précision, calculs, plan, limites proposées ou reconnues, contradiction, signatures et réserves",
    complianceFrame: "inscription à l’Ordre pour missions foncières réservées, assurance, formation, indépendance, règles de l’art, procès-verbal contradictoire, archivage et versement des références requises",
  },
} satisfies Record<string, RealEstateExpertiseProfile>;
