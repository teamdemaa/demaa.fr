import {
  composeProcessDraft,
  type IndustrializedContentItem,
  type IndustrializedProcessDefinition,
  type ProcessContentPatch,
  type ProcessDraft,
} from "@/lib/process-industrialization";

export type HomeSupportRole =
  | "compliance"
  | "decisions"
  | "access"
  | "strategy"
  | "continuity"
  | "payables"
  | "billing"
  | "intake"
  | "complaints"
  | "planning"
  | "equipment"
  | "handover";

export type HomeSupportProfile = {
  slug:
    | "services-a-la-personne"
    | "infirmier-liberal"
    | "aide-a-domicile-menage";
  name: string;
  sourceUrl: string;
  researchSources: readonly string[];
  complianceFrame: string;
  authorizationFrame: string;
  decisionFrame: string;
  accessFrame: string;
  strategyFrame: string;
  continuityFrame: string;
  payableFrame: string;
  billingFrame: string;
  intakeFrame: string;
  complaintFrame: string;
  planningFrame: string;
  scheduleFrame: string;
  equipmentFrame: string;
  incidentFrame: string;
  handoverFrame: string;
  boundaryFrame: string;
};

const processByRole: Record<HomeSupportRole, string> = {
  compliance:
    "process.domicile-accompagnement.conformite-metier.tenir-droits-prescriptions-et-justificatifs-en-regle",
  decisions:
    "process.domicile-accompagnement.direction.decider-sans-bloquer-les-tournees",
  access:
    "process.domicile-accompagnement.direction.donner-acces-a-lessentiel",
  strategy:
    "process.domicile-accompagnement.direction.savoir-ou-va-lactivite",
  continuity:
    "process.domicile-accompagnement.equipe.organiser-remplacements-et-continuite",
  payables: "process.domicile-accompagnement.finance-admin.payer-a-temps",
  billing:
    "process.domicile-accompagnement.finance-admin.suivre-facturation-et-encaissements",
  intake:
    "process.domicile-accompagnement.marketing-vente.accueillir-un-nouveau-beneficiaire-ou-patient",
  complaints:
    "process.domicile-accompagnement.marketing-vente.traiter-une-reclamation-ou-signalement",
  planning:
    "process.domicile-accompagnement.operations.planifier-interventions-tournees-ou-soins",
  equipment:
    "process.domicile-accompagnement.operations.suivre-materiel-et-incidents",
  handover:
    "process.domicile-accompagnement.operations.transmettre-consignes-et-observations",
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
  HomeSupportRole,
  IndustrializedProcessDefinition
> = {
  compliance: def(
    "Maintenir les droits, justificatifs et règles applicables à chaque intervention.",
    "Nouvelle prise en charge, échéance, changement ou contrôle.",
    "Un dossier vérifié avant planification et facturation.",
    "Référent conformité",
    "Mensuelle",
  ),
  decisions: def(
    "Arbitrer les imprévus sans exposer la personne accompagnée ni l’intervenant.",
    "Absence, urgence, refus, danger, erreur ou changement de besoin.",
    "Une mesure immédiate, une décision attribuée et une trace.",
    "Responsable de secteur",
    "Quotidienne",
  ),
  access: def(
    "Donner accès aux seules informations nécessaires à la mission.",
    "Arrivée, départ, remplacement ou changement de bénéficiaire.",
    "Des accès individuels, limités et retirés à temps.",
    "Responsable de secteur",
    "Mensuelle",
  ),
  strategy: def(
    "Choisir des prises en charge compatibles avec la capacité, les compétences et les déplacements.",
    "Revue mensuelle ou nouvelle demande importante.",
    "Un portefeuille soutenable et un niveau de service tenu.",
    "Dirigeant",
    "Mensuelle",
  ),
  continuity: def(
    "Assurer les passages indispensables malgré absences et changements d’équipe.",
    "Planning, absence, congé ou fin de mission.",
    "Un relais compétent avec les informations strictement utiles.",
    "Responsable de secteur",
    "Hebdomadaire",
  ),
  payables: def(
    "Payer les dépenses justifiées et affectées à l’activité.",
    "Facture, note de frais ou échéance.",
    "Une dépense contrôlée et payée une seule fois.",
    "Responsable administratif",
    "Hebdomadaire",
  ),
  billing: def(
    "Facturer ce qui a été autorisé et réellement réalisé.",
    "Validation d’intervention, échéance ou rejet.",
    "Des recettes rapprochées avec les heures, actes, aides et paiements.",
    "Responsable facturation",
    "Hebdomadaire",
  ),
  intake: def(
    "Qualifier une demande avant d’accepter une prise en charge.",
    "Appel, orientation, prescription ou demande familiale.",
    "Un périmètre, un coût et des conditions d’intervention compris.",
    "Responsable d’accueil",
    "À chaque demande",
  ),
  complaints: def(
    "Traiter les réclamations et signalements à partir de faits conservés.",
    "Insatisfaction, incident, danger ou atteinte présumée aux droits.",
    "Une protection immédiate, une réponse et une action corrective.",
    "Responsable qualité",
    "À chaque signalement",
  ),
  planning: def(
    "Construire des tournées réalisables avec les bonnes compétences et le bon temps.",
    "Nouvelle mission, planning, absence ou changement de priorité.",
    "Des passages confirmés avec trajet, marge et solution de secours.",
    "Planificateur",
    "Quotidienne",
  ),
  equipment: def(
    "Maintenir disponibles les équipements, consommables et moyens de déplacement utiles.",
    "Préparation, utilisation, incident ou réassort.",
    "Du matériel vérifié et un incident isolé puis traité.",
    "Référent matériel",
    "Hebdomadaire",
  ),
  handover: def(
    "Transmettre les observations utiles sans perdre l’information ni rompre la confidentialité.",
    "Fin de passage, changement, alerte ou relais.",
    "Une transmission factuelle, datée et adressée à la bonne personne.",
    "Intervenant",
    "À chaque intervention",
  ),
};

const contentByRole: Record<HomeSupportRole, IndustrializedContentItem[]> = {
  compliance: [
    item("implementation_action", "Lister par activité les justificatifs, qualifications, assurances, autorisations, contrats et informations obligatoires"),
    item("operational_step", "Vérifier avant démarrage identité, besoin, cadre d’intervention, financeur éventuel, droits et pièces utiles"),
    item("operational_step", "Attribuer chaque obligation à un responsable avec échéance, preuve et procédure de renouvellement"),
    item("recurring_control", "Contrôler chaque mois dossiers incomplets, justificatifs expirés, changements de situation et actions ouvertes"),
    item("recurring_control", "Conserver une preuve datée des contrôles, informations données et corrections réalisées"),
    item("operating_rule", "Ne pas commencer ni facturer une intervention dont le cadre, l’autorisation ou le justificatif nécessaire reste ambigu"),
  ],
  decisions: [
    item("implementation_action", "Écrire les décisions délégables avec niveau de risque, délai, mesure immédiate et personne à prévenir"),
    item("operational_step", "Qualifier l’événement : danger, santé, refus, absence, accès, erreur, retard, conflit, matériel ou paiement"),
    item("operational_step", "Protéger d’abord la personne et l’intervenant puis appeler le service compétent lorsque la situation l’exige"),
    item("operational_step", "Décider maintien, adaptation, remplacement, report, interruption ou escalade et prévenir les personnes utiles"),
    item("recurring_control", "Revoir chaque jour passages non réalisés, incidents ouverts, personnes à rappeler et décisions en attente"),
    item("operating_rule", "Ne pas demander à un intervenant de dépasser son rôle ou de poursuivre une tâche qu’il estime dangereuse"),
  ],
  access: [
    item("implementation_action", "Tenir le registre des logiciels, téléphones, dossiers, clés, codes, propriétaires, droits et récupérations"),
    item("operational_step", "Donner à chaque personne un accès individuel limité aux missions et informations nécessaires"),
    item("operational_step", "Transmettre une clé ou un code contre trace puis en organiser la restitution ou le changement"),
    item("operational_step", "Retirer les accès le jour d’un départ, d’une fin de mission ou d’un changement de secteur"),
    item("recurring_control", "Tester chaque mois droits, comptes administrateurs, doubles authentifications, sauvegardes et accès physiques"),
    item("operating_rule", "Ne pas conserver une information sensible dans une messagerie, un téléphone ou un carnet personnel non autorisé"),
  ],
  strategy: [
    item("implementation_action", "Choisir publics, prestations, zones, amplitudes, modes d’intervention et niveaux de continuité prioritaires"),
    item("implementation_action", "Fixer objectifs de demandes, heures ou actes, occupation, qualité, délai, trésorerie et marge soutenable"),
    item("operational_step", "Comparer chaque nouvelle demande aux compétences, temps, déplacements, risques et capacité de remplacement"),
    item("recurring_control", "Comparer chaque semaine charge prévue, charge réalisée, absences, kilomètres, passages critiques et heures non couvertes"),
    item("recurring_control", "Comparer chaque mois activité, facturation, rejets, réclamations, accidents, fidélité, trésorerie et marge"),
    item("operating_rule", "Limiter les nouvelles prises en charge lorsque la continuité, la sécurité ou le délai promis ne peuvent plus être tenus"),
  ],
  continuity: [
    item("implementation_action", "Tenir une matrice avec compétences, autorisations, restrictions, disponibilités, zones et relais de chaque intervenant"),
    item("operational_step", "Identifier les passages qui ne peuvent pas être reportés et préparer au moins une solution de remplacement"),
    item("operational_step", "Contacter le remplaçant avec mission, horaire, accès, risques, habitudes utiles et personne à joindre"),
    item("operational_step", "Informer la personne accompagnée ou son contact du changement et confirmer l’identité du remplaçant"),
    item("recurring_control", "Contrôler chaque jour absences, retards, remplacements confirmés et passages restant sans solution"),
    item("operating_rule", "Ne transmettre au remplaçant que les informations nécessaires à la mission et à la sécurité"),
  ],
  payables: [
    item("implementation_action", "Créer l’échéancier des salaires ou honoraires, logiciels, assurances, véhicules, téléphonie, matériel, loyers et taxes"),
    item("operational_step", "Rapprocher commande ou contrat, réception, bénéficiaire ou secteur, facture, avoir et échéance"),
    item("operational_step", "Contrôler les notes de frais avec date, motif, trajet, justificatif, règle applicable et validation"),
    item("recurring_control", "Revoir chaque semaine factures, prélèvements, doublons, litiges, remboursements et trésorerie disponible"),
    item("recurring_control", "Comparer chaque mois dépenses prévues, engagées et payées par catégorie et activité"),
    item("operating_rule", "Ne pas payer une dépense sans fournisseur, motif, réception et affectation identifiables"),
  ],
  billing: [
    item("implementation_action", "Définir les règles de preuve avec contrat ou prescription, intervention, durée ou acte, déplacement, annulation et paiement"),
    item("operational_step", "Rapprocher planning, validation terrain, modification autorisée, tarification, aide éventuelle et reste à facturer"),
    item("operational_step", "Émettre la facture ou télétransmission avec dates, détail, prix, frais, avances et mentions applicables"),
    item("operational_step", "Traiter chaque rejet ou contestation à partir de la pièce manquante, du motif et du délai de correction"),
    item("recurring_control", "Rapprocher chaque semaine réalisé, facturé, transmis, encaissé, rejeté, remboursé et restant dû"),
    item("operating_rule", "Ne pas facturer un temps, un passage, un acte ou un frais qui n’est pas autorisé et prouvé"),
  ],
  intake: [
    item("implementation_action", "Créer une fiche de découverte avec demandeur, personne concernée, besoin, fréquence, lieu, horaires, financement et contact"),
    item("operational_step", "Clarifier les tâches attendues, limites, habitudes utiles, risques du domicile et niveau de continuité"),
    item("operational_step", "Vérifier zone, accès, trajet, compétence, disponibilité, matériel et solution de remplacement"),
    item("operational_step", "Présenter mode d’intervention, prix, frais, contrat, annulation, traitement des données et interlocuteur"),
    item("recurring_control", "Relancer les demandes en attente de pièces ou de décision sans laisser démarrer une mission informelle"),
    item("operating_rule", "Refuser ou réorienter toute demande hors périmètre, sans compétence disponible ou impossible à réaliser en sécurité"),
  ],
  complaints: [
    item("implementation_action", "Créer un registre avec personne, passage, faits, impact, témoins, pièces, mesure immédiate, réponse et correction"),
    item("operational_step", "Accuser réception et protéger immédiatement la personne, l’intervenant, les données ou les éléments de preuve"),
    item("operational_step", "Comparer contrat ou prescription, planning, pointage, transmissions, échanges, facturation et version des personnes"),
    item("operational_step", "Décider vérification terrain, changement d’intervenant, correction, remboursement, déclaration ou signalement adapté"),
    item("recurring_control", "Analyser chaque mois récurrences par domicile, tâche, horaire, intervenant, secteur et cause"),
    item("operating_rule", "Ne pas modifier rétroactivement une transmission ou un pointage : conserver l’original et ajouter une correction datée"),
  ],
  planning: [
    item("implementation_action", "Cartographier bénéficiaires, adresses, fenêtres horaires, durées, compétences, contraintes et priorité de continuité"),
    item("operational_step", "Affecter chaque passage selon compétence, relation de continuité, zone, contrat, temps et charge réelle"),
    item("operational_step", "Construire la tournée avec trajet réaliste, stationnement, pauses, préparation et marge pour aléas"),
    item("operational_step", "Confirmer les passages sensibles et vérifier la disponibilité des clés, documents et matériels"),
    item("operational_step", "Mettre à jour immédiatement annulation, retard, absence, remplacement et nouvelle heure convenue"),
    item("recurring_control", "Contrôler en cours de journée passages commencés, terminés, manqués, en retard et sans retour"),
    item("operating_rule", "Ne pas compresser le temps de trajet, de préparation ou de sécurité pour ajouter un passage irréalisable"),
  ],
  equipment: [
    item("implementation_action", "Inventorier téléphones, véhicules, équipements, consommables, documents, clés et moyens de protection"),
    item("implementation_action", "Définir pour chaque élément responsable, emplacement, quantité, contrôle, entretien, remplacement et secours"),
    item("operational_step", "Préparer avant départ le matériel propre, chargé, complet et adapté aux missions de la tournée"),
    item("operational_step", "Isoler et signaler tout matériel manquant, défectueux, contaminé, périmé ou utilisé dans un incident"),
    item("recurring_control", "Contrôler chaque semaine stock, propreté, maintenance, batteries, véhicule, trousse et documents"),
    item("operating_rule", "Ne pas utiliser un équipement inconnu, défectueux ou non autorisé par la mission"),
  ],
  handover: [
    item("implementation_action", "Créer une trame avec date, heure, présence, faits observés, action réalisée, écart, suite et destinataire"),
    item("operational_step", "Consulter avant le passage les seules consignes à jour nécessaires à la mission"),
    item("operational_step", "Tracer après le passage ce qui a été fait, refusé, modifié, observé et laissé en attente"),
    item("operational_step", "Distinguer clairement fait observé, propos rapporté, action réalisée et appréciation professionnelle"),
    item("operational_step", "Transmettre l’alerte au bon niveau avec degré d’urgence, personne jointe et consigne reçue"),
    item("recurring_control", "Vérifier chaque jour les alertes sans accusé de réception et les suites non documentées"),
    item("operating_rule", "Ne pas partager une information avec la famille, un partenaire ou un collègue sans nécessité et base appropriées"),
  ],
};

const buildCoreDraft = (): ProcessDraft => ({
  definitionsById: Object.fromEntries(
    Object.entries(processByRole).map(([role, id]) => [
      id,
      definitionsByRole[role as HomeSupportRole],
    ]),
  ),
  contentByProcessId: Object.fromEntries(
    Object.entries(processByRole).map(([role, id]) => [
      id,
      contentByRole[role as HomeSupportRole],
    ]),
  ),
});

const patch = (
  role: HomeSupportRole,
  contentIndex: number,
  label: string,
): ProcessContentPatch => ({
  processId: processByRole[role],
  contentIndex,
  label,
});

const profilePatches = (
  profile: HomeSupportProfile,
): readonly ProcessContentPatch[] => [
  patch("compliance", 0, `Sécuriser les obligations propres au métier : ${profile.complianceFrame}`),
  patch("compliance", 1, `Vérifier avant démarrage : ${profile.authorizationFrame}`),
  patch("decisions", 1, `Qualifier immédiatement : ${profile.decisionFrame}`),
  patch("access", 0, `Tenir les accès et moyens critiques : ${profile.accessFrame}`),
  patch("strategy", 0, `Choisir le positionnement : ${profile.strategyFrame}`),
  patch("continuity", 0, `Organiser les relais avec : ${profile.continuityFrame}`),
  patch("payables", 0, `Prévoir et contrôler les dépenses de : ${profile.payableFrame}`),
  patch("billing", 0, `Prouver et facturer selon : ${profile.billingFrame}`),
  patch("intake", 0, `Qualifier la nouvelle demande avec : ${profile.intakeFrame}`),
  patch("complaints", 0, `Tracer les signalements propres au métier : ${profile.complaintFrame}`),
  patch("planning", 0, `Cartographier la tournée avec : ${profile.planningFrame}`),
  patch("planning", 2, `Construire le planning en intégrant : ${profile.scheduleFrame}`),
  patch("equipment", 0, `Inventorier et suivre : ${profile.equipmentFrame}`),
  patch("equipment", 3, `Isoler et traiter les incidents liés à : ${profile.incidentFrame}`),
  patch("handover", 0, `Structurer chaque transmission avec : ${profile.handoverFrame}`),
  patch("handover", 6, `Respecter en permanence cette limite : ${profile.boundaryFrame}`),
];

export const generateHomeSupportCoreDraft = () => buildCoreDraft();

export const generateHomeSupportDraft = (profile: HomeSupportProfile) =>
  composeProcessDraft(buildCoreDraft(), [
    {
      id: `metier.${profile.slug}`,
      contentPatches: profilePatches(profile),
    },
  ]);

const commonSapSources = [
  "https://www.servicesalapersonne.gouv.fr/je-suis-un-organisme-de-sap/organismes-de-services-la-personne-comment-demander-une-declaration-un",
  "https://www.economie.gouv.fr/dgccrf/les-fiches-pratiques/services-la-personne-modes-dintervention-activites-concernees-regles-applicables-et-paiements",
  "https://www.inrs.fr/metiers/sante-aide-personne/aide-domicile.html",
] as const;

export const homeSupportProfiles = {
  "services-a-la-personne": {
    slug: "services-a-la-personne",
    name: "Services à la personne",
    sourceUrl:
      "https://docs.google.com/spreadsheets/d/1Yj9nCqdSAo960DqrZXKLKW3baYq3TQ0Mo3jgBQ-IB10/edit",
    researchSources: [
      ...commonSapSources,
      "https://www.servicesalapersonne.gouv.fr/je-suis-un-organisme-de-sap/les-obligations-reglementaires-des-organismes-de-services-la-personne",
    ],
    complianceFrame: "activités SAP déclarées, mode prestataire, mandataire ou mise à disposition, NOVA, déclaration, agrément ou autorisation selon public, assurance, prix et attestations fiscales",
    authorizationFrame: "activité réellement couverte, public concerné, territoire, mode d’intervention, contrat, devis, qualification annoncée et avantage fiscal présenté sans ambiguïté",
    decisionFrame: "absence sur passage essentiel, bénéficiaire fragile, changement de plan d’aide, intervenant non adapté, dépassement du contrat, accident, clé perdue ou réclamation familiale",
    accessFrame: "logiciel de planning, télégestion, dossiers bénéficiaires, clés et codes, espace NOVA, facturation, paie, téléphones et comptes administrateurs",
    strategyFrame: "panier d’activités SAP, publics, modes d’intervention, territoires, prescripteurs, amplitudes et niveau de continuité selon autorisations et capacité",
    continuityFrame: "activités autorisées, profils intervenants, qualifications, restrictions, disponibilités, secteurs, bénéficiaires habituels et remplaçants validés",
    payableFrame: "salaires, charges, indemnités, véhicules, télégestion, téléphonie, assurances, équipements, formation, recrutement et sous-traitance autorisée",
    billingFrame: "devis et contrat, mode d’intervention, heures validées, plan d’aide, prix HT et TTC, frais annexes annoncés, acompte éventuel et attestation fiscale",
    intakeFrame: "demandeur, bénéficiaire, activité parmi le périmètre SAP, autonomie, financement, plan d’aide, mode d’intervention, fréquence, risques, horaires et contact de confiance",
    complaintFrame: "passage manqué, retard, tâche non prévue, attitude, dommage, confidentialité, facturation, changement d’intervenant, plan d’aide ou avantage fiscal",
    planningFrame: "bénéficiaires, activités, niveau de priorité, autorisations, qualifications, temps contractualisé, secteurs, clés et contacts",
    scheduleFrame: "temps de trajet, télégestion, amplitudes, pauses, continuité des bénéficiaires fragiles, remplacements, réunions et aléas",
    equipmentFrame: "téléphones, véhicules, badges, clés, équipements de protection, aides techniques autorisées, documents, consommables et moyens d’alerte",
    incidentFrame: "accident du travail, chute, exposition, dommage au domicile, clé perdue, rupture de passage, matériel d’aide ou défaut de télégestion",
    handoverFrame: "bénéficiaire, mission, horaire, fait observé, prestation réalisée, refus, écart, alerte, contact joint et suite attendue",
    boundaryFrame: "ne transmettre que le nécessaire, distinguer aide et soin, et ne jamais présenter comme autorisée une activité qui ne l’est pas",
  },
  "infirmier-liberal": {
    slug: "infirmier-liberal",
    name: "Infirmier libéral",
    sourceUrl:
      "https://docs.google.com/spreadsheets/d/1ECvs5fwIspTv5lzV_QhFXhkFK6sTFERebvxmTlaLxhI/edit",
    researchSources: [
      "https://www.ameli.fr/infirmier/exercice-liberal/vie-cabinet/installation-liberal/processus-installation",
      "https://www.ameli.fr/infirmier/exercice-liberal/facturation-remuneration/teletransmission-retour-noemie/teletransmission",
      "https://www.cnil.fr/fr/rgpd-et-professionnels-de-sante-liberaux-ce-que-vous-devez-savoir",
      "https://www.ordre-infirmiers.fr/system/files/inline-files/52640_ONI_FICHE_A4_Refus%20interruption%20soin_web.pdf",
    ],
    complianceFrame: "diplôme, inscription ordinale, conventionnement, assurance, prescriptions, NGAP applicable, carte CPS, logiciel agréé, traçabilité, secret professionnel et données de santé",
    authorizationFrame: "identité et droits, prescription lorsqu’elle est requise, acte prescrit et réalisable, date et durée, matériel, accord du patient, cotation et coordination nécessaires",
    decisionFrame: "urgence clinique, aggravation, refus de soin, prescription ambiguë, rupture de traitement, absence du patient, médicament ou dispositif douteux, exposition au sang ou erreur",
    accessFrame: "logiciel métier, dossier de soins, CPS ou e-CPS, MSSanté, DMP lorsque utilisé, télétransmission, ordonnances, téléphone professionnel et sauvegardes",
    strategyFrame: "types de soins, secteurs, amplitudes, patientèle, coordination, tournées, continuité et charge administrative selon compétences et conventionnement",
    continuityFrame: "compétences cliniques, conventionnement, assurance, disponibilité, secteur, patientèle, accès autorisés, prescriptions et modalités de remplacement",
    payableFrame: "local éventuel, logiciel métier, télétransmission, assurance, véhicule, carburant, matériel de soins, DASRI, maintenance, comptabilité et cotisations",
    billingFrame: "identité et droits, prescription, acte réellement réalisé, cotation NGAP applicable, cumul, majoration, déplacement, justificatif numérisé, FSE et retour NOEMIE",
    intakeFrame: "identité, coordonnées, médecin et prescripteur, prescription, soins demandés, date de début, fréquence, autonomie, accès, risques, matériel, couverture et urgence",
    complaintFrame: "soin, douleur ou réaction, retard, passage manqué, erreur présumée, confidentialité, prescription, transmission, facturation, médicament ou dispositif",
    planningFrame: "patients, actes, prescriptions, horaires cliniques, priorités, contraintes de prise, adresse, accès, matériel, coordination et continuité",
    scheduleFrame: "durée de soin, préparation, hygiène, trajet, urgence, prélèvement ou dépôt éventuel, renouvellement, majoration horaire et marge de sécurité",
    equipmentFrame: "matériel de soin, médicaments ou dispositifs confiés, produits de santé, chaîne du froid lorsque requise, collecteurs DASRI, EPI, téléphone, véhicule et documents",
    incidentFrame: "accident d’exposition au sang, erreur de patient ou de produit, rupture de chaîne du froid, dispositif défectueux, chute, effet indésirable ou donnée exposée",
    handoverFrame: "identité, date et heure, soin réalisé, paramètres et observations pertinents, réaction, refus, produit ou lot utile, action, professionnel contacté et suite",
    boundaryFrame: "respecter secret et besoin d’en connaître, ne modifier aucune trace après coup et ne jamais réaliser un acte hors compétence ou prescription requise",
  },
  "aide-a-domicile-menage": {
    slug: "aide-a-domicile-menage",
    name: "Aide à domicile & ménage",
    sourceUrl:
      "https://docs.google.com/spreadsheets/d/1-372p5VzX-s-sULK5Tppa7AqZ8pH4mCgfJBGAKocpgs/edit",
    researchSources: [
      ...commonSapSources,
      "https://www.inrs.fr/media.html?refINRS=ED+6148",
    ],
    complianceFrame: "prestations exactes d’entretien ou d’aide quotidienne, déclaration SAP si utilisée, assurance, devis, contrat, prix, frais, produits, clés et limites non médicales",
    authorizationFrame: "tâches convenues, état du domicile, présence d’animaux ou tiers, produits et matériel disponibles, accès, durée, fréquence, prix et personne à joindre",
    decisionFrame: "domicile dangereux, produit non identifié, matériel défectueux, charge trop lourde, chute, personne en difficulté, clé absente, tâche hors contrat ou soupçon de maltraitance",
    accessFrame: "agenda, fiches domicile, clés et codes, téléphone, pointage, facturation, produits autorisés, contacts et comptes administrateurs",
    strategyFrame: "ménage courant, entretien du linge et aide quotidienne non médicale selon zones, durées minimales, récurrence, risques des domiciles et marge",
    continuityFrame: "techniques d’entretien, limites de rôle, restrictions physiques, disponibilités, secteurs, habitudes utiles, clés détenues et domiciles connus",
    payableFrame: "salaires ou honoraires, transport, assurance, téléphonie, pointage, équipements de protection, matériel, produits fournis et comptabilité",
    billingFrame: "devis et contrat, heures pointées, tâches prévues, absence ou annulation, frais annoncés, paiements, crédit d’impôt présenté séparément et attestation",
    intakeFrame: "pièces, surfaces, tâches, fréquence, niveau d’encombrement, escaliers, animaux, produits, matériel, accès, stationnement, fragilité de la personne et limites",
    complaintFrame: "tâche non faite, casse, produit utilisé, surface abîmée, retard, clé, comportement, confidentialité, durée pointée, prix ou changement d’intervenant",
    planningFrame: "domiciles, tâches, surfaces, durées, fenêtres horaires, clés, contraintes, allergies déclarées, animaux, étages, matériel et contacts",
    scheduleFrame: "trajet, stationnement, temps d’installation, pauses, charge physique, temps de rangement, remise des clés et marge de retard",
    equipmentFrame: "gants adaptés, chaussures, téléphone, clés, sacs, matériel de ménage fourni ou transporté, produits étiquetés et moyens de déplacement",
    incidentFrame: "chute, coupure, projection, mélange de produits, mal de dos, casse, clé perdue, animal agressif, installation électrique ou logement insalubre",
    handoverFrame: "domicile, arrivée et départ, tâches réalisées, zone non traitée, produit ou matériel manquant, anomalie, dommage, alerte et suite",
    boundaryFrame: "ne pas effectuer de soin, de geste médical, de manutention dangereuse ou de tâche non convenue sans validation adaptée",
  },
} satisfies Record<string, HomeSupportProfile>;
