import {
  composeProcessDraft,
  type IndustrializedContentItem,
  type IndustrializedProcessDefinition,
  type ProcessContentPatch,
  type ProcessDraft,
} from "@/lib/process-industrialization";

type HealthPracticeRole =
  | "cap"
  | "decisions"
  | "access"
  | "appointments"
  | "complaints"
  | "records"
  | "care"
  | "equipment"
  | "team"
  | "billing"
  | "payables"
  | "compliance";

export type HealthPracticeProfile = {
  slug:
    | "cabinet-medical"
    | "cabinet-paramedical"
    | "dentiste"
    | "veterinaire"
    | "osteopathe"
    | "psychologue";
  name: string;
  sourceUrl: string;
  researchSources: readonly string[];
  strategyPriorities: string;
  urgentDecision: string;
  accessFrame: string;
  appointmentQualification: string;
  noShowFrame: string;
  complaintEvidence: string;
  dossierFrame: string;
  dossierProof: string;
  consultationFrame: string;
  alertFrame: string;
  materialFrame: string;
  traceabilityFrame: string;
  billingFrame: string;
  complianceFrame: string;
  rightsFrame: string;
};

const processByRole: Record<HealthPracticeRole, string> = {
  cap: "process.sante-cabinet.direction.savoir-ou-va-lactivite",
  decisions:
    "process.sante-cabinet.direction.decider-sans-bloquer-les-consultations",
  access: "process.sante-cabinet.direction.donner-acces-a-lessentiel",
  appointments:
    "process.sante-cabinet.marketing-vente.organiser-prise-de-rendez-vous-et-accueil",
  complaints:
    "process.sante-cabinet.marketing-vente.traiter-une-reclamation-ou-un-signalement",
  records:
    "process.sante-cabinet.operations.tenir-dossier-consentements-et-documents",
  care: "process.sante-cabinet.operations.derouler-consultation-soin-ou-suivi",
  equipment:
    "process.sante-cabinet.operations.gerer-materiel-sterilisation-ou-stock-medical",
  team:
    "process.sante-cabinet.equipe.organiser-praticiens-et-remplacements",
  billing:
    "process.sante-cabinet.finance-admin.suivre-facturation-et-encaissements",
  payables: "process.sante-cabinet.finance-admin.payer-a-temps",
  compliance:
    "process.sante-cabinet.conformite-metier.securiser-confidentialite-et-obligations-sante",
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
  HealthPracticeRole,
  IndustrializedProcessDefinition
> = {
  cap: def(
    "Choisir les activités, capacités et coopérations qui permettent une prise en charge utile et soutenable.",
    "Début de trimestre ou écart important de charge, délai ou trésorerie.",
    "Des priorités compatibles avec les compétences, locaux et obligations du cabinet.",
    "Titulaire ou direction du cabinet",
    "Mensuelle",
  ),
  decisions: def(
    "Déléguer les arbitrages non cliniques sans retarder une prise en charge sensible.",
    "Absence, urgence, incident, réclamation ou rupture de capacité.",
    "Une décision rapide, tracée et prise dans une limite connue.",
    "Praticien responsable",
    "Mensuelle",
  ),
  access: def(
    "Maintenir des accès individuels et proportionnés aux données et outils du cabinet.",
    "Arrivée, départ, incident ou revue des habilitations.",
    "Des accès récupérables sans exposition inutile des informations sensibles.",
    "Référent administratif ou numérique",
    "Mensuelle",
  ),
  appointments: def(
    "Orienter chaque demande vers le bon délai, le bon professionnel et le bon format.",
    "Appel, demande en ligne, orientation ou annulation.",
    "Un rendez-vous qualifié avec les consignes utiles et sans collecte excessive.",
    "Accueil ou secrétariat",
    "Quotidienne",
  ),
  complaints: def(
    "Traiter une réclamation ou un signalement à partir des faits et des documents disponibles.",
    "Insatisfaction, incident, demande de dossier ou atteinte présumée aux droits.",
    "Une réponse tracée, une mesure immédiate et une cause corrigée.",
    "Praticien responsable",
    "À chaque signalement",
  ),
  records: def(
    "Constituer un dossier utile à la prise en charge, accessible aux seules personnes autorisées.",
    "Première venue, nouvel élément, transmission ou demande d’accès.",
    "Un dossier exact, daté, retrouvable et transmissible selon les règles applicables.",
    "Praticien",
    "À chaque dossier",
  ),
  care: def(
    "Dérouler chaque consultation ou soin avec préparation, traçabilité et suite explicite.",
    "Rendez-vous confirmé ou besoin non programmé.",
    "Une prise en charge réalisée dans le champ de compétence avec continuité organisée.",
    "Praticien",
    "À chaque consultation",
  ),
  equipment: def(
    "Maintenir les équipements, consommables et zones de travail sûrs et disponibles.",
    "Ouverture, utilisation, réassort, entretien ou incident.",
    "Du matériel utilisable avec une traçabilité proportionnée au risque.",
    "Référent matériel ou hygiène",
    "Hebdomadaire",
  ),
  team: def(
    "Répartir les rendez-vous, dossiers et responsabilités sans rupture de confidentialité ni de continuité.",
    "Planning, absence, arrivée ou surcharge.",
    "Une charge visible et une passation limitée aux informations nécessaires.",
    "Titulaire ou coordinateur",
    "Hebdomadaire",
  ),
  billing: def(
    "Facturer les actes et prestations à partir de ce qui a réellement été réalisé.",
    "Fin de prise en charge, télétransmission ou échéance.",
    "Des recettes rapprochées avec les actes, rejets et restes à recouvrer.",
    "Accueil ou responsable administratif",
    "Hebdomadaire",
  ),
  payables: def(
    "Régler les fournisseurs à partir de commandes, livraisons et contrats contrôlés.",
    "Facture ou échéance.",
    "Des dépenses justifiées, affectées et rapprochées.",
    "Responsable administratif",
    "Hebdomadaire",
  ),
  compliance: def(
    "Maintenir les preuves de qualification, assurance, confidentialité et sécurité applicables au cabinet.",
    "Échéance, contrôle, incident ou évolution de l’activité.",
    "Des obligations attribuées, à jour et retrouvables.",
    "Titulaire ou référent conformité",
    "Mensuelle",
  ),
};

const contentByRole: Record<
  HealthPracticeRole,
  IndustrializedContentItem[]
> = {
  cap: [
    item("implementation_action", "Choisir les prises en charge, publics, amplitudes et coopérations qui doivent porter l’activité"),
    item("implementation_action", "Fixer des objectifs de délai de rendez-vous, activité, qualité, trésorerie et charge soutenable"),
    item("operational_step", "Comparer les objectifs aux compétences, locaux, équipements et temps administratif disponibles"),
    item("recurring_control", "Comparer chaque mois demandes, rendez-vous, annulations, actes réalisés, suivis et encaissements"),
    item("recurring_control", "Mesurer par activité délai, occupation, continuité, incidents, impayés et temps non facturable"),
    item("operating_rule", "Ne pas développer une activité sans compétence, capacité, organisation de continuité et cadre applicable"),
  ],
  decisions: [
    item("implementation_action", "Écrire les décisions délégables avec seuil, délai, information et personne à prévenir"),
    item("operational_step", "Classer chaque arbitrage selon risque immédiat, rupture de suivi, confidentialité, délai et capacité"),
    item("operational_step", "Appliquer la mesure conservatoire autorisée puis informer les personnes utiles"),
    item("operating_rule", "Réserver au praticien les décisions cliniques, prescriptions, diagnostics, orientations et informations de santé"),
    item("recurring_control", "Revoir chaque mois les décisions remontées inutilement ou prises hors limite"),
  ],
  access: [
    item("implementation_action", "Créer un registre des logiciels, messageries, comptes, propriétaires, droits, sauvegardes et récupérations"),
    item("operational_step", "Attribuer un accès individuel limité au rôle et aux dossiers réellement nécessaires"),
    item("operational_step", "Séparer les droits administratifs, financiers et cliniques dans les outils qui le permettent"),
    item("operational_step", "Retirer ou réattribuer les droits le jour d’un départ ou changement de mission"),
    item("recurring_control", "Tester chaque mois les accès critiques, doubles authentifications, sauvegardes et restauration"),
  ],
  appointments: [
    item("implementation_action", "Créer une trame d’accueil avec identité utile, motif formulé par la personne, délai, professionnel et consignes"),
    item("operational_step", "Qualifier la demande sans demander au secrétariat de poser un diagnostic"),
    item("operational_step", "Orienter les situations urgentes ou hors périmètre selon une procédure validée par le praticien"),
    item("operational_step", "Confirmer date, lieu, durée, documents utiles, tarif applicable et modalités d’annulation"),
    item("recurring_control", "Rappeler les rendez-vous selon un délai adapté et réaffecter rapidement les créneaux libérés"),
    item("recurring_control", "Mesurer chaque semaine demandes non servies, délais, annulations, absences et motifs d’orientation"),
  ],
  complaints: [
    item("implementation_action", "Créer un registre séparé avec demandeur, faits, impact, pièces, mesure immédiate, réponse et correction"),
    item("operational_step", "Accuser réception et sécuriser immédiatement la personne, la confidentialité ou la continuité"),
    item("operational_step", "Comparer chronologie, dossier, échanges, facturation et engagements avant de répondre"),
    item("operating_rule", "Ne jamais modifier rétrospectivement une trace d’origine ; ajouter une correction datée et attribuée"),
    item("recurring_control", "Vérifier la correction puis analyser chaque mois délais, causes et signalements réouverts"),
  ],
  records: [
    item("implementation_action", "Créer une structure de dossier avec identité, contexte, informations utiles, actes, documents et correspondants"),
    item("operational_step", "Vérifier l’identité et les coordonnées avant création ou fusion d’un dossier"),
    item("operational_step", "Dater, attribuer et distinguer information reçue, observation, décision et document transmis"),
    item("operational_step", "Recueillir l’information et l’accord requis avec un support adapté à la situation"),
    item("operational_step", "Classer comptes rendus, prescriptions ou recommandations, résultats, devis et consentements au bon endroit"),
    item("operational_step", "Transmettre uniquement au destinataire autorisé par un canal adapté à la sensibilité"),
    item("recurring_control", "Auditer chaque mois un échantillon de dossiers incomplets, doublons, pièces mal classées et accès anormaux"),
  ],
  care: [
    item("implementation_action", "Créer une checklist de consultation avec préparation, vérifications, réalisation, trace et suite"),
    item("operational_step", "Vérifier identité, motif, éléments nouveaux, alertes connues et documents reçus"),
    item("operational_step", "Informer sur la prise en charge proposée, ses limites, alternatives utiles et conditions financières"),
    item("operational_step", "Réaliser uniquement les actes relevant du champ de compétence et des conditions réunies"),
    item("operational_step", "Tracer constat utile, acte, matériel ou produit concerné, incident et décision de suivi"),
    item("operational_step", "Donner les consignes de suite, signes d’alerte, contact et prochain rendez-vous si nécessaire"),
    item("recurring_control", "Rapprocher chaque semaine suivis attendus, résultats reçus, orientations et rendez-vous non programmés"),
  ],
  equipment: [
    item("implementation_action", "Créer une fiche par équipement ou famille de consommables avec responsable, contrôle, entretien et stock"),
    item("operational_step", "Contrôler avant utilisation intégrité, propreté, fonctionnement, date et conditions de conservation"),
    item("operational_step", "Isoler immédiatement tout produit ou équipement périmé, endommagé, rappelé ou non conforme"),
    item("operational_step", "Déclarer panne, exposition ou incident avec personnes concernées, lot, action et remise en service"),
    item("recurring_control", "Revoir chaque semaine seuils, péremptions, commandes, maintenance et indisponibilités"),
    item("recurring_control", "Rapprocher les consommables ou dispositifs sensibles des prises en charge concernées"),
    item("operating_rule", "Ne remettre en service un équipement critique qu’après contrôle documenté"),
  ],
  team: [
    item("implementation_action", "Créer une vue de charge avec professionnels, compétences, rendez-vous, tâches, absences et remplaçants"),
    item("operational_step", "Affecter chaque file, contrôle et tâche sensible à un titulaire et un suppléant"),
    item("operational_step", "Faire une passation limitée aux informations nécessaires à la continuité de la prise en charge"),
    item("operational_step", "Vérifier diplôme, inscription, assurance, contrat et droits avant toute prise de poste"),
    item("recurring_control", "Revoir chaque semaine surcharge, délais, absences, besoins de remplacement et tâches sans propriétaire"),
    item("operating_rule", "Ne jamais partager un compte professionnel ni transmettre un dossier entier par simple commodité"),
  ],
  billing: [
    item("implementation_action", "Créer un suivi reliant prise en charge, acte ou prestation, tarif, payeur, règlement et rejet"),
    item("operational_step", "Vérifier identité, droit applicable, acte réalisé, cotation ou libellé, montant et justificatif"),
    item("operational_step", "Émettre ou télétransmettre à partir des données validées sans antidater ni facturer un acte non réalisé"),
    item("operational_step", "Qualifier chaque rejet ou impayé avec motif, pièce, interlocuteur et prochaine action"),
    item("recurring_control", "Rapprocher chaque semaine agenda, actes, factures, télétransmissions, règlements et banque"),
    item("recurring_control", "Suivre les créances par âge, payeur, motif de blocage et date de relance"),
    item("operating_rule", "Corriger une erreur par une opération traçable sans effacer la pièce d’origine"),
  ],
  payables: [
    item("implementation_action", "Créer un échéancier avec fournisseur, contrat, commande, livraison, validation et paiement"),
    item("operational_step", "Comparer facture, produit ou prestation reçue, tarif convenu et centre de coût"),
    item("operational_step", "Traiter écart, avoir, retour ou litige avant mise en paiement"),
    item("recurring_control", "Revoir chaque semaine échéances, doublons, abonnements, contrats et trésorerie"),
    item("operating_rule", "Séparer autant que possible commande, validation de réception et paiement"),
  ],
  compliance: [
    item("implementation_action", "Créer un registre des diplômes, inscriptions, assurances, contrats, locaux, données et échéances"),
    item("implementation_action", "Créer le registre des traitements et l’information remise aux personnes concernées"),
    item("operational_step", "Vérifier les qualifications, inscriptions et assurances avant exercice ou remplacement"),
    item("operational_step", "Limiter la collecte, les habilitations et les transmissions aux informations nécessaires"),
    item("operational_step", "Qualifier tout incident de confidentialité ou de sécurité et appliquer la procédure de notification"),
    item("recurring_control", "Contrôler sauvegardes, mises à jour, comptes inactifs, accès inhabituels et contrats des prestataires"),
    item("recurring_control", "Revoir chaque trimestre affichages, honoraires, médiation, accessibilité et documents professionnels"),
    item("operating_rule", "Conserver les preuves selon leur finalité et supprimer ou archiver à l’issue de la durée définie"),
  ],
};

const buildCoreDraft = (): ProcessDraft => ({
  definitionsById: Object.fromEntries(
    Object.entries(processByRole).map(([role, processId]) => [
      processId,
      definitionsByRole[role as HealthPracticeRole],
    ]),
  ),
  contentByProcessId: Object.fromEntries(
    Object.entries(processByRole).map(([role, processId]) => [
      processId,
      contentByRole[role as HealthPracticeRole],
    ]),
  ),
});

const patch = (
  role: HealthPracticeRole,
  contentIndex: number,
  label: string,
): ProcessContentPatch => ({
  processId: processByRole[role],
  contentIndex,
  label,
});

const profilePatches = (
  profile: HealthPracticeProfile,
): readonly ProcessContentPatch[] => [
  patch("cap", 0, `Choisir les priorités du cabinet : ${profile.strategyPriorities}`),
  patch("cap", 3, `Comparer chaque mois les indicateurs propres à l’activité : ${profile.strategyPriorities}`),
  patch("decisions", 1, `Escalader ou arbitrer sans délai : ${profile.urgentDecision}`),
  patch("access", 0, `Tenir à jour les accès critiques : ${profile.accessFrame}`),
  patch("appointments", 1, `Qualifier à l’accueil : ${profile.appointmentQualification}`),
  patch("appointments", 4, `Réduire les rendez-vous perdus avec : ${profile.noShowFrame}`),
  patch("complaints", 2, `Rassembler avant de répondre : ${profile.complaintEvidence}`),
  patch("records", 0, `Structurer chaque dossier avec : ${profile.dossierFrame}`),
  patch("records", 4, `Classer comme preuves de prise en charge : ${profile.dossierProof}`),
  patch("care", 0, `Préparer chaque prise en charge avec : ${profile.consultationFrame}`),
  patch("care", 3, `Arrêter ou orienter la prise en charge dans les situations suivantes : ${profile.alertFrame}`),
  patch("equipment", 0, `Suivre le matériel et les produits suivants : ${profile.materialFrame}`),
  patch("equipment", 5, `Assurer la traçabilité opérationnelle de : ${profile.traceabilityFrame}`),
  patch("billing", 1, `Vérifier avant facturation : ${profile.billingFrame}`),
  patch("compliance", 0, `Tenir à jour les obligations propres au métier : ${profile.complianceFrame} ; droits et information : ${profile.rightsFrame}`),
];

export const generateHealthPracticeCoreDraft = () => buildCoreDraft();

export const generateHealthPracticeDraft = (profile: HealthPracticeProfile) =>
  composeProcessDraft(buildCoreDraft(), [
    {
      id: `metier.${profile.slug}`,
      contentPatches: profilePatches(profile),
    },
  ]);

const commonSources = [
  "https://www.cnil.fr/fr/rgpd-et-professionnels-de-sante-liberaux-ce-que-vous-devez-savoir",
  "https://www.cnil.fr/fr/donnees-de-sante-la-cnil-rappelle-les-mesures-de-securite-et-de-confidentialite-pour-lacces-au",
  "https://esante.gouv.fr/produits-services/referentiel-pro-sante-connect",
] as const;

export const healthPracticeProfiles = {
  "cabinet-medical": {
    slug: "cabinet-medical",
    name: "Cabinet médical",
    sourceUrl:
      "https://docs.google.com/spreadsheets/d/1HzReMu8X7ZjS6EVWdq2JliD6FGqrHTvcYMQeHcOPwOA/edit",
    researchSources: [...commonSources, "https://www.ameli.fr/medecin/exercice-liberal"],
    strategyPriorities: "motifs dominants, patients chroniques, prévention, soins non programmés, délais et coordination",
    urgentDecision: "symptôme potentiellement urgent, résultat critique, rupture de traitement, patient vulnérable ou continuité impossible",
    accessFrame: "logiciel métier, DMP ou Mon espace santé selon usage, MSSanté, CPS ou e-CPS, téléservices Assurance Maladie et sauvegardes",
    appointmentQualification: "motif exprimé, niveau d’urgence selon consignes médicales, nouveau patient, suivi, examen reçu et besoin d’accessibilité",
    noShowFrame: "rappel, consignes de préparation, liste d’attente, suivi des absences répétées et créneaux de soins non programmés",
    complaintEvidence: "dossier médical, rendez-vous, prescriptions, résultats, courriers, facturation et échanges sécurisés",
    dossierFrame: "antécédents utiles, traitements, allergies, correspondants, résultats, prescriptions, prévention et décisions partagées",
    dossierProof: "compte rendu, résultat reçu et analysé, ordonnance, courrier d’orientation, information et suivi attendu",
    consultationFrame: "motif, antécédents utiles, traitements, constantes ou examen pertinent, décision et continuité",
    alertFrame: "urgence vitale ou potentielle, résultat critique, besoin hors compétence, examen nécessaire ou absence de continuité sûre",
    materialFrame: "dispositifs de diagnostic, trousse d’urgence, vaccins ou produits détenus, consommables, chaîne du froid si applicable et DASRI",
    traceabilityFrame: "lot ou péremption utile, température si applicable, maintenance, désinfection, administration et élimination",
    billingFrame: "identité, droits, parcours de soins, acte réellement effectué, cotation, tiers payant et pièces de télétransmission",
    complianceFrame: "inscription ordinale et RPPS, assurance, DPC, secret médical, prescriptions, certificats, téléservices et sécurité numérique",
    rightsFrame: "information loyale, consentement, accès au dossier, personne de confiance lorsque pertinente et continuité des soins",
  },
  "cabinet-paramedical": {
    slug: "cabinet-paramedical",
    name: "Cabinet paramédical",
    sourceUrl:
      "https://docs.google.com/spreadsheets/d/1NZ_dSNk0pW_K2uu2pTKjC_PJWTodkbOaEEy6xd9iuqo/edit",
    researchSources: [...commonSources, "https://www.ameli.fr/exercice-coordonne/exercice-professionnel/facturation-remuneration/teletransmission-retour-noemie/teletransmission"],
    strategyPriorities: "bilans, prises en charge prescrites ou directes selon profession, séances, domicile, délais et coordination",
    urgentDecision: "aggravation, signe d’alerte, prescription incohérente ou expirée, risque de chute, situation hors champ ou rupture de suivi",
    accessFrame: "logiciel métier, agenda, dossier, MSSanté selon éligibilité, CPS ou e-CPS, télétransmission et portail de la profession",
    appointmentQualification: "profession concernée, motif, prescription si requise, domicile ou cabinet, mobilité, série de séances et disponibilité",
    noShowFrame: "rappels de série, confirmation du domicile, règle d’annulation, liste d’attente et reprogrammation cohérente du parcours",
    complaintEvidence: "prescription, bilan, plan de soins, séances réalisées, transmissions, facturation et échanges",
    dossierFrame: "prescription si applicable, bilan initial, objectifs, plan de prise en charge, séances, mesures de progression et transmissions",
    dossierProof: "bilan, prescription, séance datée, évaluation, compte rendu au prescripteur et document de fin de prise en charge",
    consultationFrame: "prescription ou accès direct applicable, bilan, objectif de séance, précautions, réalisation et réévaluation",
    alertFrame: "aggravation, signe hors champ, contre-indication, absence d’évolution attendue ou besoin d’avis médical",
    materialFrame: "matériel de bilan et de rééducation, dispositifs réutilisables, consommables, protections et produits de désinfection",
    traceabilityFrame: "nettoyage, entretien, prêt éventuel, consommables, incident, mesure de progression et dispositif utilisé",
    billingFrame: "prescription si nécessaire, droits, séance réalisée, cotation NGAP applicable, déplacement, tiers payant et rejet",
    complianceFrame: "diplôme, RPPS ou enregistrement applicable, assurance, champ d’exercice, prescription, DPC selon profession et convention",
    rightsFrame: "information, consentement, secret professionnel, accès au dossier et coordination proportionnée",
  },
  dentiste: {
    slug: "dentiste",
    name: "Dentiste",
    sourceUrl:
      "https://docs.google.com/spreadsheets/d/11tvnSwsahyiWhv5OXZSyJF9R2HKv6XUIjSF11VnLaf8/edit",
    researchSources: [
      ...commonSources,
      "https://www.has-sante.fr/jcms/c_272424/fr/sterilisation-des-dispositifs-medicaux-la-conduite-des-cycles-de-sterilisation",
      "https://www.ordre-chirurgiens-dentistes.fr/actualites/quel-acces-au-dossier-medical/",
    ],
    strategyPriorities: "urgences dentaires, soins conservateurs, prévention, prothèse, chirurgie, délais et occupation du fauteuil",
    urgentDecision: "douleur aiguë, traumatisme, infection, saignement, risque médical, dispositif défectueux ou incident d’asepsie",
    accessFrame: "logiciel dentaire, imagerie, agenda, DMP et MSSanté selon usage, CPS ou e-CPS, télétransmission et sauvegardes",
    appointmentQualification: "urgence, douleur, gonflement, traumatisme, acte prévu, risque médical signalé, durée du fauteuil et besoin d’imagerie",
    noShowFrame: "rappel du rendez-vous long, confirmation de devis, liste d’attente, consignes préopératoires et suivi des plans interrompus",
    complaintEvidence: "odontogramme, radiographies, devis, consentement, traçabilité dispositif, actes, prothèse, facturation et échanges",
    dossierFrame: "questionnaire médical, odontogramme, imagerie, diagnostic, plan de traitement, devis, consentements et dispositifs",
    dossierProof: "radiographie, devis signé, consentement, lot ou fiche du dispositif sur mesure, compte rendu opératoire et ordonnance",
    consultationFrame: "questionnaire médical actualisé, motif, examen, imagerie utile, plan, devis ou consentement et acte prévu",
    alertFrame: "urgence médicale, contre-indication, risque infectieux non maîtrisé, matériel non stérile ou acte dépassant les conditions réunies",
    materialFrame: "instruments, autoclave, tests, imagerie, fauteuil, aspiration, dispositifs sur mesure, médicaments d’urgence et DASRI",
    traceabilityFrame: "cycle de stérilisation, charge, sachet ou lot, tests, maintenance, dispositif médical sur mesure et patient concerné",
    billingFrame: "acte CCAM, devis applicable, panier ou alternative présentée, dispositif, télétransmission, règlement et reste à charge",
    complianceFrame: "Ordre et RPPS, assurance, DPC, radioprotection applicable, stérilisation, DASRI, dispositifs, honoraires et dossier dentaire",
    rightsFrame: "information sur alternatives et honoraires, consentement, accès au dossier, secret médical et médiation",
  },
  veterinaire: {
    slug: "veterinaire",
    name: "Vétérinaire",
    sourceUrl:
      "https://docs.google.com/spreadsheets/d/1j_wmlcr-rdxvQ9ObNNHZQtIEKyfeUOWRA46Qw8G-SSA/edit",
    researchSources: [
      "https://www.veterinaire.fr/je-suis-veterinaire/mon-exercice-professionnel/les-fiches-professionnelles/declarer-ses-modalites-de-continuite-et-de-permanence-des-soins",
      "https://www.veterinaire.fr/je-suis-veterinaire/mon-exercice-professionnel/les-fiches-professionnelles/animaux-de-compagnie-la-delivrance-lexecution-de-lordonnance",
      "https://www.veterinaire.fr/la-profession-veterinaire/la-reglementation-professionnelle/code-de-deontologie/exercice-exercice-de-la-medecine-r242-43-77",
    ],
    strategyPriorities: "consultations, chirurgie, prévention, urgences, espèces prises en charge, hospitalisation et continuité des soins",
    urgentDecision: "détresse animale, intoxication, traumatisme, douleur aiguë, zoonose suspectée, rupture de permanence ou médicament à risque",
    accessFrame: "logiciel clinique, dossier animal-détenteur, agenda, laboratoire, imagerie, commandes, registre médicaments et extranet ordinal",
    appointmentQualification: "espèce, animal, détenteur, motif, urgence, poids si utile, vétérinaire traitant, déplacement et contexte sanitaire",
    noShowFrame: "rappel vaccinal ou suivi, confirmation de chirurgie, consignes de jeûne, liste d’attente et continuité hors horaires",
    complaintEvidence: "animal, détenteur, contrat de soins, examen, consentement, devis, ordonnance, délivrance, hospitalisation et échanges",
    dossierFrame: "animal, identification, détenteur, antécédents, poids, examen, diagnostic, prescription, consentement et continuité",
    dossierProof: "compte rendu, résultats, ordonnance remise, médicaments délivrés, consentement, hospitalisation et sortie",
    consultationFrame: "animal et détenteur, motif, antécédents, examen clinique, hypothèses, consentement, prescription et suivi",
    alertFrame: "urgence, souffrance, zoonose ou danger sanitaire suspecté, examen impossible, espèce non prise en charge ou continuité non assurée",
    materialFrame: "médicaments vétérinaires, vaccins, chaîne du froid, blocs et anesthésie, imagerie, analyseurs, hospitalisation et DASRI",
    traceabilityFrame: "ordonnance, délivrance, lot, registre ou double, température, anesthésie, implant, hospitalisation et animal concerné",
    billingFrame: "animal et détenteur, acte, devis accepté, médicament délivré, hospitalisation, acompte, assurance éventuelle et règlement",
    complianceFrame: "Ordre, DPE, assurance, code de déontologie, conditions générales de fonctionnement, pharmacie vétérinaire et déclarations",
    rightsFrame: "consentement éclairé du détenteur, ordonnance remise, information tarifaire, confidentialité et permanence/continuité affichées",
  },
  osteopathe: {
    slug: "osteopathe",
    name: "Ostéopathe",
    sourceUrl:
      "https://docs.google.com/spreadsheets/d/1AcTNuGmolQ59U1P-A28gMrTBdK6NJt4_3SxUJd73PPk/edit",
    researchSources: [
      ...commonSources,
      "https://www.legifrance.gouv.fr/loda/id/JORFTEXT000000462001",
      "https://sante.gouv.fr/soins-et-maladies/qualite-securite-et-pertinence-des-soins/securite-des-prises-en-charge/article/les-pratiques-de-soins-non-conventionnelles",
    ],
    strategyPriorities: "premières consultations, suivis justifiés, délais, prescripteurs ou partenaires, recommandations et charge physique",
    urgentDecision: "drapeau rouge, symptôme organique suspecté, aggravation, traumatisme récent, nourrisson ou manipulation soumise à condition",
    accessFrame: "agenda, dossier, facturation, messagerie, téléconsultation non clinique éventuelle, sauvegardes et accès au local",
    appointmentQualification: "motif, âge, grossesse, traumatisme, symptômes d’alerte, examens déjà réalisés, professionnel de santé consulté et accessibilité",
    noShowFrame: "rappel, consignes pratiques, règle d’annulation, liste d’attente et absence de programmation automatique de séances inutiles",
    complaintEvidence: "motif, anamnèse, information, consentement, techniques réalisées, conseils, orientation, facture et échanges",
    dossierFrame: "motif, antécédents utiles, drapeaux rouges, examen fonctionnel, information, consentement, techniques et orientation",
    dossierProof: "anamnèse, contrôles de sécurité, accord, manipulations ou mobilisations, conseils, orientation et facture",
    consultationFrame: "motif, symptômes, antécédents utiles, recherche de drapeaux rouges, examen fonctionnel et information",
    alertFrame: "symptôme nécessitant diagnostic médical, persistance ou aggravation, pathologie organique suspectée, acte interdit ou certificat médical requis",
    materialFrame: "table, linge, protections, produits d’hygiène, matériel administratif et trousse de premiers secours",
    traceabilityFrame: "nettoyage de la table, changement du linge, lot de produit si incident, entretien et anomalie du matériel",
    billingFrame: "consultation réalisée, tarif annoncé, facture nominative, moyen de paiement et justificatif destiné à la complémentaire",
    complianceFrame: "titre autorisé, diplôme et enregistrement, assurance, actes permis, limites, orientation médicale et information professionnelle",
    rightsFrame: "information claire, consentement, confidentialité, accès aux informations et absence de promesse de guérison",
  },
  psychologue: {
    slug: "psychologue",
    name: "Psychologue",
    sourceUrl:
      "https://docs.google.com/spreadsheets/d/1U-_ZhRGgZ4fe3qSaRbaN5dhzfiLRaoPPLX4_Du6tdiM/edit",
    researchSources: [
      ...commonSources,
      "https://www.ameli.fr/psychologue/exercice-professionnel/psychologue-mon-soutien-psy-faq",
      "https://sante.gouv.fr/ministere/formulaires/formulaires-sante-10497/article/professions-de-sante-assistants-de-service-social-psychologues-et-usagers-de",
    ],
    strategyPriorities: "premiers entretiens, suivis, bilans, dispositifs conventionnés éventuels, délais, supervision et charge émotionnelle",
    urgentDecision: "risque suicidaire ou de violence, danger pour un mineur ou une personne vulnérable, décompensation, rupture de cadre ou hors compétence",
    accessFrame: "agenda, dossier, notes professionnelles séparées si nécessaire, téléconsultation, facturation, messagerie et sauvegardes",
    appointmentQualification: "demande, âge, urgence exprimée, cadre individuel ou institutionnel, langue, présentiel ou distance et dispositif éventuel",
    noShowFrame: "rappel discret, cadre d’annulation expliqué, reprise de contact adaptée, liste d’attente et vigilance après rupture inattendue",
    complaintEvidence: "cadre présenté, consentement, rendez-vous, documents remis, faits, facturation, échanges et mesure de protection",
    dossierFrame: "demande, cadre, consentement, éléments strictement nécessaires, objectifs, séances, évaluations ou orientations",
    dossierProof: "cadre accepté, séance, outil utilisé si nécessaire, synthèse communicable distincte des notes personnelles et orientation",
    consultationFrame: "demande, cadre, consentement, sécurité immédiate, objectifs, limites et modalités de contact",
    alertFrame: "danger immédiat, risque suicidaire, violence, maltraitance, besoin médical ou psychiatrique, conflit d’intérêts ou hors compétence",
    materialFrame: "tests et protocoles autorisés, supports d’évaluation, matériel de téléconsultation, documents d’information et rangement sécurisé",
    traceabilityFrame: "version et conditions d’utilisation des tests, accès, restitution, incident, matériel prêté et destruction sécurisée",
    billingFrame: "séance réalisée, tarif annoncé, facture ou feuille de soins du dispositif applicable, absence non facturable selon convention et règlement",
    complianceFrame: "titre de psychologue, diplôme enregistré et RPPS applicable, assurance, secret professionnel, données, tests et convention éventuelle",
    rightsFrame: "consentement libre, confidentialité, cadre, accès aux informations, libre choix et orientation en cas de besoin",
  },
} satisfies Record<string, HealthPracticeProfile>;
