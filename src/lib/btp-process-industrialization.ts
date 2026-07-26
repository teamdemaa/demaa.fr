import {
  plumbingPilotContentByProcessId,
  plumbingPilotProcessDefinitionsById,
} from "@/lib/plumbing-process-pilot";
import {
  composeProcessDraft,
  type ProcessContentPatch,
  type ProcessDraft,
  type ProcessLayer,
} from "@/lib/process-industrialization";

const PROCESS = {
  direction: "process.btp.direction.savoir-ou-va-lentreprise",
  decisions:
    "process.btp.direction.decider-au-quotidien-sans-le-dirigeant",
  acquisition:
    "process.btp.marketing-vente.attirer-et-vendre-un-chantier",
  loyalty: "process.btp.marketing-vente.faire-revenir-les-clients",
  complaint:
    "process.btp.marketing-vente.traiter-une-reclamation-ou-un-litige-client",
  progress: "process.btp.operations.suivre-lavancement-dun-chantier",
  startAndClose:
    "process.btp.operations.demarrer-et-cloturer-un-chantier",
  recurringWork:
    "process.btp.operations.tenir-chaque-corps-de-metier",
  delay: "process.btp.operations.gerer-un-retard-ou-un-imprevu",
  team:
    "process.btp.equipe.organiser-les-equipes-remplacer-un-absent",
  onboarding: "process.btp.equipe.integrer-un-nouvel-employe",
  profitability: "process.btp.finance-admin.suivre-la-rentabilite",
  compliance:
    "process.btp.conformite-metier.securite-et-couverture-assurance",
  supplies:
    "process.btp.materiel-approvisionnement.materiel-et-fournisseurs",
} as const;

const plumbingDraft: ProcessDraft = {
  definitionsById: plumbingPilotProcessDefinitionsById,
  contentByProcessId: plumbingPilotContentByProcessId,
};

const btpCoreLayer: ProcessLayer = {
  id: "famille.btp.core",
  contentPatches: [
    {
      processId: PROCESS.direction,
      contentIndex: 0,
      label:
        "Choisir les chantiers prioritaires : dépannage, rénovation, maintenance ou travaux planifiés",
    },
    {
      processId: PROCESS.decisions,
      contentIndex: 0,
      label:
        "Lister ce que l’intervenant peut décider seul : achat urgent, remplacement d’un consommable ou geste commercial",
    },
    {
      processId: PROCESS.decisions,
      contentIndex: 2,
      label:
        "Définir les situations à remonter immédiatement : danger, non-conformité, retard important ou conflit client",
    },
    {
      processId: PROCESS.acquisition,
      contentIndex: 2,
      label:
        "Lancer des campagnes Google Ads locales sur les recherches rentables : dépannage urgent, devis travaux ou maintenance",
    },
    {
      processId: PROCESS.loyalty,
      contentIndex: 2,
      label:
        "Programmer les rappels utiles : entretien, visite périodique, fin de garantie ou contrôle",
    },
    {
      processId: PROCESS.startAndClose,
      contentIndex: 2,
      label:
        "Réaliser les essais, les contrôles et la remise en service avant de quitter les lieux",
    },
    {
      processId: PROCESS.recurringWork,
      contentIndex: 0,
      label:
        "Créer une checklist par intervention récurrente : dépannage, installation, rénovation, maintenance ou SAV",
    },
    {
      processId: PROCESS.recurringWork,
      contentIndex: 2,
      label:
        "Exiger les photos des points sensibles avant fermeture, raccordement définitif ou mise en service",
    },
    {
      processId: PROCESS.team,
      contentIndex: 1,
      label:
        "Vérifier les habilitations, autorisations et compétences spécifiques avant d’affecter une intervention",
    },
    {
      processId: PROCESS.compliance,
      contentIndex: 0,
      label:
        "Vérifier les attestations décennale, responsabilité civile et qualifications professionnelles avant leur échéance",
    },
    {
      processId: PROCESS.supplies,
      contentIndex: 0,
      label:
        "Définir un stock minimum pour les consommables, fixations, protections et pièces courantes",
    },
  ],
};

export const btpFamilyCoreDraft = composeProcessDraft(plumbingDraft, [
  btpCoreLayer,
]);

export type BtpTradeProfile = {
  slug: string;
  name: string;
  reviewState: "draft" | "internal_review_complete";
  priorityWork: string;
  autonomousDecisions: string;
  immediateEscalations: string;
  localSearches: string;
  maintenanceReminders: string;
  commissioningChecks: string;
  recurringInterventions: string;
  sensitiveProofs: string;
  assignmentChecks: string;
  complianceChecks: string;
  criticalStock: string;
  extraContentPatches?: readonly ProcessContentPatch[];
};

function profilePatches(profile: BtpTradeProfile): ProcessContentPatch[] {
  return [
    {
      processId: PROCESS.direction,
      contentIndex: 0,
      label: `Choisir les chantiers prioritaires : ${profile.priorityWork}`,
    },
    {
      processId: PROCESS.decisions,
      contentIndex: 0,
      label: `Lister ce que l’intervenant peut décider seul : ${profile.autonomousDecisions}`,
    },
    {
      processId: PROCESS.decisions,
      contentIndex: 2,
      label: `Définir les situations à remonter immédiatement : ${profile.immediateEscalations}`,
    },
    {
      processId: PROCESS.acquisition,
      contentIndex: 2,
      label: `Lancer des campagnes Google Ads locales sur les recherches rentables : ${profile.localSearches}`,
    },
    {
      processId: PROCESS.loyalty,
      contentIndex: 2,
      label: `Programmer les rappels utiles : ${profile.maintenanceReminders}`,
    },
    {
      processId: PROCESS.startAndClose,
      contentIndex: 2,
      label: `Réaliser avant le départ : ${profile.commissioningChecks}`,
    },
    {
      processId: PROCESS.recurringWork,
      contentIndex: 0,
      label: `Créer une checklist par intervention récurrente : ${profile.recurringInterventions}`,
    },
    {
      processId: PROCESS.recurringWork,
      contentIndex: 2,
      label: `Exiger les preuves et photos suivantes : ${profile.sensitiveProofs}`,
    },
    {
      processId: PROCESS.team,
      contentIndex: 1,
      label: `Vérifier avant d’affecter une intervention : ${profile.assignmentChecks}`,
    },
    {
      processId: PROCESS.compliance,
      contentIndex: 0,
      label: `Contrôler avant échéance : ${profile.complianceChecks}`,
    },
    {
      processId: PROCESS.supplies,
      contentIndex: 0,
      label: `Définir un stock minimum pour : ${profile.criticalStock}`,
    },
    ...(profile.extraContentPatches ?? []),
  ];
}

export function generateBtpTradeProcessDraft(
  profile: BtpTradeProfile,
): ProcessDraft {
  return composeProcessDraft(btpFamilyCoreDraft, [
    {
      id: `metier.${profile.slug}`,
      contentPatches: profilePatches(profile),
    },
  ]);
}

export const btpTradeProfiles = {
  "electricite-generale": {
    slug: "electricite-generale",
    name: "Électricité générale",
    reviewState: "internal_review_complete",
    priorityWork:
      "dépannage électrique, mise aux normes, remplacement de tableau ou borne de recharge",
    autonomousDecisions:
      "remplacement d’un disjoncteur équivalent, achat de petit matériel ou mise en sécurité provisoire",
    immediateEscalations:
      "départ de feu, risque d’électrocution, tableau dangereux, absence de terre ou client sans autorisation de travaux",
    localSearches:
      "électricien urgence, panne électrique, mise aux normes tableau ou installation de borne",
    maintenanceReminders:
      "test des différentiels, contrôle du tableau, maintenance de borne ou vérification d’éclairage de sécurité",
    commissioningChecks:
      "absence de tension, continuité, isolement, terre, différentiels, repérage du tableau et remise sous tension",
    recurringInterventions:
      "recherche de panne, tableau électrique, prise, éclairage, VMC ou borne de recharge",
    sensitiveProofs:
      "cheminement des gaines avant rebouchage, repérage des conducteurs, mesures et tableau avant fermeture",
    assignmentChecks:
      "habilitation électrique adaptée, compétence IRVE si nécessaire et matériel de consignation disponible",
    complianceChecks:
      "décennale, responsabilité civile, habilitations électriques, qualification IRVE et attestations Consuel concernées",
    criticalStock:
      "disjoncteurs, interrupteurs différentiels, gaines, câbles, boîtes, connecteurs et consommables de repérage",
    extraContentPatches: [
      {
        processId: PROCESS.acquisition,
        contentIndex: 3,
        label:
          "Qualifier la demande avec l’adresse, la coupure totale ou partielle, les circuits concernés, une photo du tableau, l’urgence et les contraintes d’accès",
      },
      {
        processId: PROCESS.acquisition,
        contentIndex: 4,
        label:
          "Envoyer un devis séparant déplacement, diagnostic, matériel et main-d’œuvre, puis relancer à J+2 et J+7",
      },
      {
        processId: PROCESS.progress,
        contentIndex: 1,
        label:
          "Noter après chaque passage les circuits traités, mesures réalisées, protections remplacées et travaux restant à faire",
      },
      {
        processId: PROCESS.startAndClose,
        contentIndex: 0,
        label:
          "Vérifier avant départ l’autorisation d’intervention, les plans disponibles, la possibilité de mise hors tension et le matériel de consignation",
      },
      {
        processId: PROCESS.startAndClose,
        contentIndex: 3,
        label:
          "Remettre au client le tableau repéré, les résultats de contrôle, les consignes de remise sous tension et les attestations requises",
      },
      {
        processId: PROCESS.delay,
        contentIndex: 0,
        label:
          "Qualifier l’imprévu : circuit non repéré, alimentation impossible à couper, matériel incompatible, câble inaccessible ou pièce indisponible",
      },
      {
        processId: PROCESS.onboarding,
        contentIndex: 2,
        label:
          "Prévoir des interventions en binôme sur la recherche de panne, les tableaux, la consignation et les bornes de recharge",
      },
      {
        processId: PROCESS.profitability,
        contentIndex: 2,
        label:
          "Repérer les écarts de marge liés au temps de diagnostic, au métrage de câble, aux percements, aux protections ajoutées ou aux déplacements",
      },
    ],
  },
  climatisation: {
    slug: "climatisation",
    name: "Climatisation",
    reviewState: "internal_review_complete",
    priorityWork:
      "dépannage, entretien, installation monosplit ou multisplit et pompe à chaleur",
    autonomousDecisions:
      "nettoyage approfondi, remplacement d’un filtre ou condensateur prévu au barème et commande d’un consommable",
    immediateEscalations:
      "fuite de fluide, défaut d’étanchéité, risque électrique, support instable ou absence d’attestation requise",
    localSearches:
      "dépannage climatisation, entretien clim, installation multisplit ou pompe à chaleur",
    maintenanceReminders:
      "nettoyage des filtres, contrôle des condensats, recherche de fuite et entretien annuel",
    commissioningChecks:
      "épreuve d’étanchéité, tirage au vide, relevés de pression et température, évacuation des condensats et mise en service",
    recurringInterventions:
      "entretien, recherche de panne, pose monosplit, pose multisplit, pompe à chaleur ou remplacement de carte",
    sensitiveProofs:
      "liaisons frigorifiques avant goulotte, supportage, évacuation des condensats, relevés de mise en service et plaque signalétique",
    assignmentChecks:
      "attestation d’aptitude fluides frigorigènes, habilitation électrique et outillage de récupération disponible",
    complianceChecks:
      "décennale, responsabilité civile, attestation de capacité fluides frigorigènes et registre des mouvements de fluide",
    criticalStock:
      "filtres, raccords frigorifiques, cuivre, isolant, tuyaux de condensats, supports et consommables d’étanchéité",
    extraContentPatches: [
      {
        processId: PROCESS.acquisition,
        contentIndex: 3,
        label:
          "Qualifier la demande avec la surface, le nombre de pièces, la marque, le modèle, le code erreur, des photos et l’historique d’entretien",
      },
      {
        processId: PROCESS.acquisition,
        contentIndex: 4,
        label:
          "Envoyer un devis séparant diagnostic, équipement, liaisons, mise en service et éventuelle récupération de fluide, puis relancer à J+2 et J+7",
      },
      {
        processId: PROCESS.progress,
        contentIndex: 1,
        label:
          "Noter après chaque passage les pressions, températures, quantités de fluide, pièces remplacées et actions restant à faire",
      },
      {
        processId: PROCESS.startAndClose,
        contentIndex: 0,
        label:
          "Vérifier avant départ les plaques signalétiques, l’accès aux unités, l’alimentation électrique, l’évacuation des condensats et le fluide concerné",
      },
      {
        processId: PROCESS.startAndClose,
        contentIndex: 3,
        label:
          "Transmettre la fiche d’intervention, les relevés de mise en service, les réglages, les consignes d’entretien et les documents liés au fluide",
      },
      {
        processId: PROCESS.delay,
        contentIndex: 0,
        label:
          "Qualifier l’imprévu : fuite détectée, carte indisponible, accès impossible, support instable, évacuation bouchée ou puissance électrique insuffisante",
      },
      {
        processId: PROCESS.onboarding,
        contentIndex: 2,
        label:
          "Prévoir des interventions en binôme sur l’entretien, la recherche de fuite, le tirage au vide, la récupération et la mise en service",
      },
      {
        processId: PROCESS.profitability,
        contentIndex: 2,
        label:
          "Repérer les écarts de marge liés au temps de diagnostic, aux liaisons supplémentaires, au fluide, au levage, à l’accès ou aux reprises électriques",
      },
    ],
  },
  serrurier: {
    slug: "serrurier",
    name: "Serrurerie",
    reviewState: "internal_review_complete",
    priorityWork:
      "ouverture urgente, remplacement de cylindre, sécurisation après effraction ou pose de porte blindée",
    autonomousDecisions:
      "ouverture non destructive, remplacement d’un cylindre équivalent ou sécurisation provisoire dans le barème autorisé",
    immediateEscalations:
      "doute sur l’identité ou l’autorisation du demandeur, effraction en cours, porte coupe-feu non conforme ou litige d’occupation",
    localSearches:
      "serrurier urgence, ouverture de porte, serrure bloquée ou porte blindée",
    maintenanceReminders:
      "graissage, contrôle de ferme-porte, vérification de contrôle d’accès et remplacement préventif d’un cylindre usé",
    commissioningChecks:
      "ouverture et fermeture répétées, jeu de la porte, verrouillage de tous les points, remise des clés et explication au client",
    recurringInterventions:
      "porte claquée, porte verrouillée, cylindre, serrure multipoints, ferme-porte ou contrôle d’accès",
    sensitiveProofs:
      "justificatif d’autorisation, état avant intervention, références posées, points d’ancrage et fonctionnement final",
    assignmentChecks:
      "procédure de contrôle d’identité, compétence sur la serrure concernée et autorisation de travail en hauteur si nécessaire",
    complianceChecks:
      "responsabilité civile, décennale selon les travaux, conformité des portes coupe-feu et certifications A2P annoncées",
    criticalStock:
      "cylindres, serrures, gâches, rosaces, plaques de protection, visserie, lubrifiants et solutions de fermeture provisoire",
    extraContentPatches: [
      {
        processId: PROCESS.acquisition,
        contentIndex: 3,
        label:
          "Qualifier la demande avec l’adresse, la situation de la porte, le type de serrure, des photos et l’identité ou l’autorisation de l’occupant",
      },
      {
        processId: PROCESS.acquisition,
        contentIndex: 4,
        label:
          "Communiquer avant le déplacement les tarifs, majorations et limites du diagnostic, puis faire accepter un document précontractuel détaillé avant les travaux",
      },
      {
        processId: PROCESS.complaint,
        contentIndex: 0,
        label:
          "Regrouper l’autorisation d’intervention, le document précontractuel accepté, les photos, les références posées et la facture",
      },
      {
        processId: PROCESS.progress,
        contentIndex: 1,
        label:
          "Noter la méthode d’ouverture, les éléments déposés, les références remplacées, les clés remises et les travaux restant à faire",
      },
      {
        processId: PROCESS.startAndClose,
        contentIndex: 0,
        label:
          "Vérifier avant toute ouverture l’identité du demandeur et son autorisation à accéder au local, puis conserver uniquement la preuve nécessaire",
      },
      {
        processId: PROCESS.startAndClose,
        contentIndex: 3,
        label:
          "Tester tous les points de verrouillage, remettre les clés, expliquer l’usage, transmettre les références posées et faire réceptionner l’intervention",
      },
      {
        processId: PROCESS.delay,
        contentIndex: 0,
        label:
          "Qualifier l’imprévu : serrure non identifiée, porte déformée, pièce indisponible, accès contesté ou ouverture non destructive impossible",
      },
      {
        processId: PROCESS.onboarding,
        contentIndex: 2,
        label:
          "Prévoir des interventions en binôme sur l’ouverture non destructive, les serrures multipoints, les portes blindées et le contrôle d’accès",
      },
      {
        processId: PROCESS.profitability,
        contentIndex: 2,
        label:
          "Repérer les écarts de marge liés au temps d’ouverture, aux déplacements urgents, à la majoration horaire, aux pièces rares ou aux reprises de porte",
      },
    ],
  },
  "renovation-interieur": {
    slug: "renovation-interieur",
    name: "Rénovation intérieure",
    reviewState: "internal_review_complete",
    priorityWork:
      "rénovation complète d’appartement, redistribution des pièces, cuisine ou remise en état locative",
    autonomousDecisions:
      "ajustement d’une finition, remplacement d’un consommable équivalent ou protection complémentaire dans le budget autorisé",
    immediateEscalations:
      "suspicion d’amiante ou de plomb, mur potentiellement porteur, réseau dangereux, support dégradé ou demande hors devis",
    localSearches:
      "rénovation appartement, entreprise rénovation intérieure, rénovation cuisine ou travaux tous corps d’état",
    maintenanceReminders:
      "levée des réserves, contrôle des joints et finitions, visite de parfait achèvement ou retouche programmée",
    commissioningChecks:
      "contrôle des finitions, essai des équipements posés, nettoyage, retrait des protections et réception avec réserves",
    recurringInterventions:
      "préparation et dépose, cloisons, revêtements de sol, peinture, cuisine ou finitions",
    sensitiveProofs:
      "état initial, supports avant recouvrement, réseaux avant fermeture, étanchéité des zones concernées et pièces terminées",
    assignmentChecks:
      "compétence du lot confié, habilitation adaptée en cas d’intervention électrique, formation amiante si nécessaire et moyens de protection disponibles",
    complianceChecks:
      "responsabilité civile, décennale pour les travaux couverts, qualification RGE annoncée, repérages avant travaux et traçabilité des déchets",
    criticalStock:
      "protections, adhésifs, abrasifs, fixations, produits de jointoiement, consommables de finition et sacs à déchets",
    extraContentPatches: [
      {
        processId: PROCESS.acquisition,
        contentIndex: 3,
        label:
          "Qualifier la demande avec l’adresse, les surfaces, les pièces concernées, l’occupation du logement, des photos, les diagnostics disponibles, le budget et le délai",
      },
      {
        processId: PROCESS.acquisition,
        contentIndex: 4,
        label:
          "Envoyer un devis détaillé par lot avec préparations, fournitures, protections, déchets, exclusions et règles de travaux supplémentaires",
      },
      {
        processId: PROCESS.progress,
        contentIndex: 1,
        label:
          "Noter après chaque passage les lots terminés, les supports découverts, les ouvrages cachés photographiés et les décisions client en attente",
      },
      {
        processId: PROCESS.startAndClose,
        contentIndex: 0,
        label:
          "Vérifier avant démarrage les diagnostics, plans, autorisations, accès, protections, coupures de réseaux et conditions de stockage",
      },
      {
        processId: PROCESS.startAndClose,
        contentIndex: 3,
        label:
          "Faire la réception pièce par pièce, tracer les réserves, remettre les références et notices puis programmer les reprises",
      },
      {
        processId: PROCESS.delay,
        contentIndex: 0,
        label:
          "Qualifier l’imprévu : matériau suspect, support dégradé, réseau découvert, livraison en retard, décision client manquante ou intervention d’un autre lot",
      },
      {
        processId: PROCESS.onboarding,
        contentIndex: 2,
        label:
          "Prévoir des interventions en binôme sur les protections, la dépose, la coordination des lots, les ouvrages cachés et la levée des réserves",
      },
      {
        processId: PROCESS.profitability,
        contentIndex: 2,
        label:
          "Repérer les écarts de marge liés aux préparations supplémentaires, déchets, reprises, temps d’attente, petites fournitures ou modifications client",
      },
    ],
  },
  "menuiserie-agencement": {
    slug: "menuiserie-agencement",
    name: "Menuiserie et agencement",
    reviewState: "internal_review_complete",
    priorityWork:
      "agencement sur mesure, cuisine, placards, menuiseries extérieures ou pose de portes",
    autonomousDecisions:
      "réglage de quincaillerie, remplacement d’une fixation équivalente ou reprise légère de finition dans la tolérance prévue",
    immediateEscalations:
      "cotes incompatibles, support non porteur, présence suspecte d’amiante ou de plomb, vitrage endommagé ou fixation impossible",
    localSearches:
      "menuisier sur mesure, pose de cuisine, agencement intérieur, fenêtre ou porte d’entrée",
    maintenanceReminders:
      "réglage des ouvrants, contrôle des joints, entretien des finitions ou reprise de quincaillerie",
    commissioningChecks:
      "contrôle des cotes, niveaux, aplombs, fixations, jeux, ouverture et fermeture, joints puis nettoyage",
    recurringInterventions:
      "prise de cotes, fabrication, pose de cuisine, placard, porte, fenêtre ou agencement sur mesure",
    sensitiveProofs:
      "cotes validées, état du support, fixations avant habillage, calage, joints périphériques et fonctionnement final",
    assignmentChecks:
      "maîtrise des machines utilisées, aspiration disponible, autorisation de travail en hauteur et moyens de manutention adaptés",
    complianceChecks:
      "responsabilité civile, décennale selon les travaux, qualification RGE annoncée, protections des machines et contrôle de l’aspiration des poussières de bois",
    criticalStock:
      "quincaillerie, fixations, cales, colles, joints, abrasifs, protections, consommables de finition et pièces d’ajustement",
    extraContentPatches: [
      {
        processId: PROCESS.acquisition,
        contentIndex: 3,
        label:
          "Qualifier la demande avec les dimensions, plans, photos du support, usage attendu, matériaux, finition, quincaillerie, accès et délai",
      },
      {
        processId: PROCESS.acquisition,
        contentIndex: 4,
        label:
          "Envoyer un devis distinguant prise de cotes, fabrication, matériaux, quincaillerie, finition, livraison, pose et exclusions",
      },
      {
        processId: PROCESS.progress,
        contentIndex: 1,
        label:
          "Noter les éléments débités, assemblés, finis, livrés et posés ainsi que les quincailleries ou validations restant à obtenir",
      },
      {
        processId: PROCESS.startAndClose,
        contentIndex: 0,
        label:
          "Valider avant fabrication les cotes finales, le sens d’ouverture, les supports, les finitions, les accès de livraison et l’accord client",
      },
      {
        processId: PROCESS.startAndClose,
        contentIndex: 3,
        label:
          "Tester chaque ouvrant et équipement, remettre les clés et références, expliquer l’entretien puis faire réceptionner la pose",
      },
      {
        processId: PROCESS.delay,
        contentIndex: 0,
        label:
          "Qualifier l’imprévu : cote erronée, support hors aplomb, quincaillerie manquante, finition non validée, dommage de transport ou accès impossible",
      },
      {
        processId: PROCESS.onboarding,
        contentIndex: 2,
        label:
          "Prévoir du travail en binôme sur la prise de cotes, les machines, l’assemblage, la manutention, la pose et les réglages",
      },
      {
        processId: PROCESS.profitability,
        contentIndex: 2,
        label:
          "Repérer les écarts de marge liés aux chutes, reprises d’atelier, quincailleries oubliées, finitions, livraisons ou temps de réglage",
      },
    ],
  },
  "maconnerie-gros-oeuvre": {
    slug: "maconnerie-gros-oeuvre",
    name: "Maçonnerie et gros œuvre",
    reviewState: "internal_review_complete",
    priorityWork:
      "fondations, dalle, mur porteur, extension, ouverture structurelle ou reprise de maçonnerie",
    autonomousDecisions:
      "protection provisoire, ajustement d’un consommable conforme ou reprise mineure sans modifier les plans ni la structure",
    immediateEscalations:
      "sol instable, fissure active, réseau non repéré, écart aux plans, défaut de ferraillage, intempérie sévère ou risque d’effondrement",
    localSearches:
      "maçon, entreprise de maçonnerie, extension maison, dalle béton ou ouverture mur porteur",
    maintenanceReminders:
      "cure du béton, contrôle des fissures, retrait programmé des étais, levée des réserves ou reprise de joints",
    commissioningChecks:
      "contrôle des dimensions, niveaux, aplombs, ferraillages visibles, cure, nettoyage et réception des ouvrages",
    recurringInterventions:
      "fondations, dalle, élévation de murs, coffrage, ouverture, scellement ou reprise structurelle",
    sensitiveProofs:
      "implantation, fond de fouille, ferraillage avant coulage, réseaux incorporés, étapes de coulage et dimensions finales",
    assignmentChecks:
      "compétence en coffrage et ferraillage, autorisation de conduite ou d’élingage requise, protection antichute et prévention des poussières",
    complianceChecks:
      "responsabilité civile, décennale, plans ou étude pour les ouvrages structurels, protections collectives et prévention de l’exposition à la silice",
    criticalStock:
      "ciment, mortier, armatures, blocs, éléments de coffrage, fixations, cales, produits de cure et consommables de protection",
    extraContentPatches: [
      {
        processId: PROCESS.acquisition,
        contentIndex: 3,
        label:
          "Qualifier la demande avec les plans, dimensions, étude disponible, nature du sol, accès des engins, réseaux connus, photos et délai",
      },
      {
        processId: PROCESS.acquisition,
        contentIndex: 4,
        label:
          "Envoyer un devis distinguant terrassement, coffrage, armatures, béton, maçonnerie, levage, évacuation, reprises et exclusions structurelles",
      },
      {
        processId: PROCESS.progress,
        contentIndex: 1,
        label:
          "Noter les implantations, niveaux, quantités, ferraillages, coulages, temps de cure, contrôles et ouvrages restant à réaliser",
      },
      {
        processId: PROCESS.startAndClose,
        contentIndex: 0,
        label:
          "Vérifier avant démarrage les plans et études, l’implantation, les réseaux, l’accès, les protections collectives, la météo et les livraisons",
      },
      {
        processId: PROCESS.startAndClose,
        contentIndex: 3,
        label:
          "Contrôler dimensions, niveaux et aplombs, regrouper les photos des ouvrages cachés, faire réceptionner et tracer les réserves",
      },
      {
        processId: PROCESS.delay,
        contentIndex: 0,
        label:
          "Qualifier l’imprévu : sol différent, réseau découvert, intempérie, erreur d’implantation, béton retardé, ferraillage non conforme ou engin indisponible",
      },
      {
        processId: PROCESS.onboarding,
        contentIndex: 2,
        label:
          "Prévoir du travail en binôme sur l’implantation, le coffrage, le ferraillage, le coulage, l’élingage et les protections collectives",
      },
      {
        processId: PROCESS.profitability,
        contentIndex: 2,
        label:
          "Repérer les écarts de marge liés aux volumes, rotations d’engins, pompage, reprises, temps de cure, ferraillage ou évacuation des déblais",
      },
    ],
  },
  batiment: {
    slug: "batiment",
    name: "Entreprise générale du bâtiment",
    reviewState: "internal_review_complete",
    priorityWork:
      "rénovation complète, extension, remise en état, coordination de plusieurs lots ou marché d’entretien",
    autonomousDecisions:
      "ajustement de planning sans impact client, achat d’un consommable équivalent ou protection provisoire dans le budget autorisé",
    immediateEscalations:
      "risque structurel, suspicion d’amiante ou de plomb, réseau dangereux, sous-traitant défaillant, écart important au devis ou retard critique",
    localSearches:
      "entreprise générale bâtiment, rénovation maison, rénovation appartement ou extension maison",
    maintenanceReminders:
      "levée des réserves, visite de parfait achèvement, contrôle des reprises ou échéance de garantie",
    commissioningChecks:
      "contrôle croisé des lots, essais des équipements, nettoyage, dossier de fin de chantier et réception avec réserves",
    recurringInterventions:
      "visite technique, préparation, coordination des lots, contrôle qualité, réception ou intervention de garantie",
    sensitiveProofs:
      "état initial, supports et réseaux avant fermeture, ouvrages cachés, contrôles de chaque lot et état final",
    assignmentChecks:
      "compétence du lot confié, habilitations nécessaires, capacité du sous-traitant et moyens de protection adaptés",
    complianceChecks:
      "responsabilité civile, décennale par activité déclarée, attestations des sous-traitants, repérages avant travaux et qualifications annoncées",
    criticalStock:
      "protections, fixations, consommables de balisage, produits de rebouchage, petit outillage, nettoyage et solutions de mise en sécurité",
    extraContentPatches: [
      {
        processId: PROCESS.acquisition,
        contentIndex: 3,
        label:
          "Qualifier la demande avec les surfaces, lots concernés, plans, diagnostics, occupation des lieux, accès, photos, budget et calendrier souhaité",
      },
      {
        processId: PROCESS.acquisition,
        contentIndex: 4,
        label:
          "Envoyer un devis détaillé par lot indiquant sous-traitance, protections, déchets, délais, exclusions et traitement des travaux supplémentaires",
      },
      {
        processId: PROCESS.progress,
        contentIndex: 1,
        label:
          "Noter l’avancement de chaque lot, les ouvrages cachés photographiés, les interfaces à contrôler et les validations client en attente",
      },
      {
        processId: PROCESS.startAndClose,
        contentIndex: 0,
        label:
          "Vérifier avant démarrage les diagnostics, autorisations, attestations des intervenants, accès, installations de chantier, protections et planning des lots",
      },
      {
        processId: PROCESS.startAndClose,
        contentIndex: 3,
        label:
          "Organiser la réception par lot, centraliser essais, notices et attestations, tracer les réserves puis programmer leur levée",
      },
      {
        processId: PROCESS.delay,
        contentIndex: 0,
        label:
          "Qualifier l’imprévu : support découvert, diagnostic manquant, sous-traitant absent, livraison en retard, interface de lots ou décision client bloquante",
      },
      {
        processId: PROCESS.onboarding,
        contentIndex: 2,
        label:
          "Prévoir du travail en binôme sur la préparation, la coordination des lots, les contrôles d’interface, la réception et la levée des réserves",
      },
      {
        processId: PROCESS.profitability,
        contentIndex: 2,
        label:
          "Repérer les écarts de marge par lot : reprises, temps d’attente, sous-traitance, déchets, petites fournitures, modifications et défauts de coordination",
      },
    ],
  },
  paysagiste: {
    slug: "paysagiste",
    name: "Paysagisme",
    reviewState: "internal_review_complete",
    priorityWork:
      "création de jardin, entretien récurrent, élagage, clôture, arrosage ou aménagement extérieur",
    autonomousDecisions:
      "remplacement d’un végétal équivalent, ajustement d’une taille ou achat d’un consommable dans le budget autorisé",
    immediateEscalations:
      "réseau enterré non repéré, arbre instable, nid protégé, accès dangereux, voisinage conflictuel ou utilisation non autorisée d’un produit",
    localSearches:
      "paysagiste, entretien jardin, création jardin, élagage ou pose de clôture",
    maintenanceReminders:
      "taille saisonnière, tonte, fertilisation, contrôle d’arrosage, hivernage ou remplacement sous garantie",
    commissioningChecks:
      "contrôle des niveaux et pentes, arrosage, stabilité des plantations, fixation des ouvrages, nettoyage et consignes d’entretien",
    recurringInterventions:
      "tonte, taille, plantation, arrosage, clôture, terrasse légère ou entretien saisonnier",
    sensitiveProofs:
      "état initial, réseaux repérés, implantation, préparation du sol, ouvrages avant remblai et résultat final",
    assignmentChecks:
      "autorisation de conduite nécessaire, compétence d’élagage, moyens antichute et certificat adapté si des produits phytopharmaceutiques sont utilisés",
    complianceChecks:
      "responsabilité civile, assurance adaptée aux ouvrages réalisés, contrôles du matériel, Certiphyto et agrément lorsque l’activité les exige",
    criticalStock:
      "liens, tuteurs, raccords d’arrosage, lames, fils, carburants autorisés, paillage, protections et consommables de balisage",
    extraContentPatches: [
      {
        processId: PROCESS.acquisition,
        contentIndex: 3,
        label:
          "Qualifier la demande avec la surface, l’accès, la nature du sol, les réseaux connus, les végétaux existants, le point d’eau, des photos et l’entretien attendu",
      },
      {
        processId: PROCESS.acquisition,
        contentIndex: 4,
        label:
          "Envoyer un devis distinguant préparation, terrassement, végétaux, fournitures, arrosage, évacuation, entretien et conditions de remplacement",
      },
      {
        processId: PROCESS.progress,
        contentIndex: 1,
        label:
          "Noter les zones préparées, végétaux plantés, réseaux posés, matériaux utilisés, arrosages réalisés et travaux restant à faire",
      },
      {
        processId: PROCESS.startAndClose,
        contentIndex: 0,
        label:
          "Vérifier avant départ les réseaux repérés, l’accès des engins, la météo, les végétaux livrés, le point d’eau, le balisage et les protections",
      },
      {
        processId: PROCESS.startAndClose,
        contentIndex: 3,
        label:
          "Tester l’arrosage, contrôler niveaux et stabilité, remettre le plan de plantation et expliquer au client l’arrosage et l’entretien",
      },
      {
        processId: PROCESS.delay,
        contentIndex: 0,
        label:
          "Qualifier l’imprévu : réseau découvert, sol impraticable, arbre instable, météo défavorable, végétal indisponible, accès bloqué ou restriction d’arrosage",
      },
      {
        processId: PROCESS.onboarding,
        contentIndex: 2,
        label:
          "Prévoir du travail en binôme sur les engins, l’élagage, l’implantation, les réseaux d’arrosage et l’usage réglementé de produits",
      },
      {
        processId: PROCESS.profitability,
        contentIndex: 2,
        label:
          "Repérer les écarts de marge liés aux rotations d’engins, évacuations, pertes de végétaux, arrosage, reprises de sol ou temps de déplacement",
      },
    ],
  },
  pisciniste: {
    slug: "pisciniste",
    name: "Pisciniste",
    reviewState: "internal_review_complete",
    priorityWork:
      "construction de bassin, rénovation, mise en route, entretien, hivernage ou dépannage de filtration",
    autonomousDecisions:
      "réglage de filtration, remplacement d’un consommable équivalent ou traitement correctif prévu au protocole",
    immediateEscalations:
      "fuite structurelle, risque électrique, eau dangereuse, terrassement instable, local technique inondé ou dosage chimique incertain",
    localSearches:
      "pisciniste, construction piscine, rénovation piscine, entretien piscine ou dépannage filtration",
    maintenanceReminders:
      "analyse de l’eau, nettoyage du filtre, mise en route, hivernage, contrôle de couverture ou visite annuelle",
    commissioningChecks:
      "étanchéité, circulation, pression, filtration, protections électriques, dispositifs de sécurité, qualité de l’eau et explication au client",
    recurringInterventions:
      "mise en route, analyse et traitement de l’eau, filtration, recherche de fuite, hivernage ou rénovation de revêtement",
    sensitiveProofs:
      "implantation, terrassement, ferraillage avant coulage, réseaux hydrauliques avant remblai, local technique et essais finaux",
    assignmentChecks:
      "compétence hydraulique, habilitation adaptée pour l’électricité, sécurité du terrassement et maîtrise des produits de traitement",
    complianceChecks:
      "responsabilité civile, décennale pour les ouvrages couverts, conformité des travaux électriques, dispositifs de sécurité et stockage des produits",
    criticalStock:
      "joints, raccords, vannes, colles, paniers, manomètres, consommables d’analyse, produits de traitement et pièces de filtration",
    extraContentPatches: [
      {
        processId: PROCESS.acquisition,
        contentIndex: 3,
        label:
          "Qualifier la demande avec dimensions, structure, accès, terrain, équipements, local technique, alimentation, photos, usage et budget",
      },
      {
        processId: PROCESS.acquisition,
        contentIndex: 4,
        label:
          "Envoyer un devis distinguant terrassement, structure, étanchéité, hydraulique, équipements, électricité, sécurité, mise en service et entretien",
      },
      {
        processId: PROCESS.progress,
        contentIndex: 1,
        label:
          "Noter les étapes de terrassement, structure, réseaux, étanchéité, remblai, équipements, remplissage, traitement et essais",
      },
      {
        processId: PROCESS.startAndClose,
        contentIndex: 0,
        label:
          "Vérifier avant démarrage implantation, accès, réseaux, autorisations disponibles, sécurité du terrassement, livraisons et alimentation du local technique",
      },
      {
        processId: PROCESS.startAndClose,
        contentIndex: 3,
        label:
          "Remettre les réglages, analyses, notices, garanties et consignes de sécurité, puis former le client à la filtration et au traitement",
      },
      {
        processId: PROCESS.delay,
        contentIndex: 0,
        label:
          "Qualifier l’imprévu : sol instable, eau dans la fouille, réseau découvert, fuite, équipement incompatible, livraison retardée ou valeur d’eau dangereuse",
      },
      {
        processId: PROCESS.onboarding,
        contentIndex: 2,
        label:
          "Prévoir du travail en binôme sur l’hydraulique, l’étanchéité, le local technique, la mise en service, l’analyse et le dosage des produits",
      },
      {
        processId: PROCESS.profitability,
        contentIndex: 2,
        label:
          "Repérer les écarts de marge liés au terrassement, pompage, remblai, métrés hydrauliques, équipements, levage, fuites ou reprises d’étanchéité",
      },
    ],
  },
  couvreur: {
    slug: "couvreur",
    name: "Couverture",
    reviewState: "internal_review_complete",
    priorityWork:
      "recherche de fuite, réparation urgente, réfection de toiture, zinguerie, isolation ou entretien",
    autonomousDecisions:
      "mise hors d’eau provisoire, remplacement d’un élément équivalent ou fixation complémentaire prévue au protocole",
    immediateEscalations:
      "risque de chute, charpente instable, amiante suspectée, intempérie, ligne électrique proche ou infiltration structurelle",
    localSearches:
      "couvreur, fuite toiture urgence, réparation toiture, zinguerie ou réfection couverture",
    maintenanceReminders:
      "inspection de toiture, nettoyage des évacuations, contrôle des solins, vérification après tempête ou levée des réserves",
    commissioningChecks:
      "alignement et fixation, étanchéité des pénétrations, évacuation des eaux, nettoyage des gouttières et contrôle depuis les combles",
    recurringInterventions:
      "recherche de fuite, remplacement d’éléments, zinguerie, solins, gouttières, isolation ou entretien",
    sensitiveProofs:
      "protections collectives, état du support, écran et liteaux avant couverture, fixations, solins et évacuations terminées",
    assignmentChecks:
      "formation au travail en hauteur, moyens d’accès, protections antichute, aptitude au port du harnais et conditions météo compatibles",
    complianceChecks:
      "responsabilité civile, décennale, vérification des échafaudages et protections, qualification annoncée et procédure amiante si nécessaire",
    criticalStock:
      "crochets, vis, liteaux, membranes, bandes d’étanchéité, éléments de zinguerie, bâches et consommables antichute",
    extraContentPatches: [
      {
        processId: PROCESS.acquisition,
        contentIndex: 3,
        label:
          "Qualifier la demande avec le type de toiture, la pente, la surface, l’accès, l’âge, les zones d’infiltration et des photos extérieures et intérieures",
      },
      {
        processId: PROCESS.acquisition,
        contentIndex: 4,
        label:
          "Envoyer un devis distinguant accès et échafaudage, dépose, support, écran, couverture, zinguerie, isolation, évacuation et mise hors d’eau",
      },
      {
        processId: PROCESS.progress,
        contentIndex: 1,
        label:
          "Noter les zones déposées, supports découverts, écrans et liteaux posés, éléments remplacés, solins traités et surfaces restant à couvrir",
      },
      {
        processId: PROCESS.startAndClose,
        contentIndex: 0,
        label:
          "Vérifier avant démarrage la météo, les accès, échafaudages et protections, les lignes électriques proches, les matériaux et la solution de bâchage",
      },
      {
        processId: PROCESS.startAndClose,
        contentIndex: 3,
        label:
          "Contrôler fixations, solins, faîtage et évacuations, inspecter depuis les combles, nettoyer puis remettre les consignes d’entretien",
      },
      {
        processId: PROCESS.delay,
        contentIndex: 0,
        label:
          "Qualifier l’imprévu : vent ou pluie, support pourri, matériau suspect, élément incompatible, accès dangereux, ligne proche ou livraison retardée",
      },
      {
        processId: PROCESS.onboarding,
        contentIndex: 2,
        label:
          "Prévoir du travail en binôme sur les accès, protections antichute, bâchage, recherche de fuite, zinguerie et détails d’étanchéité",
      },
      {
        processId: PROCESS.profitability,
        contentIndex: 2,
        label:
          "Repérer les écarts de marge liés aux accès, échafaudages, supports cachés, chutes, zinguerie, bâchages, intempéries ou manutentions",
      },
    ],
  },
  "peintre-en-batiment": {
    slug: "peintre-en-batiment",
    name: "Peinture en bâtiment",
    reviewState: "internal_review_complete",
    priorityWork:
      "remise en peinture, préparation de supports, ravalement, dégâts des eaux ou finition de rénovation",
    autonomousDecisions:
      "reprise locale, ajustement d’une sous-couche ou remplacement d’un consommable équivalent après contrôle du support",
    immediateEscalations:
      "support humide, peinture au plomb suspectée, fissure active, ventilation insuffisante, teinte non validée ou travail hors devis",
    localSearches:
      "peintre bâtiment, peinture appartement, ravalement façade ou remise en état après dégâts des eaux",
    maintenanceReminders:
      "retouche après séchage, contrôle de tenue, reprise de réserve ou entretien d’une finition extérieure",
    commissioningChecks:
      "uniformité de teinte et d’aspect, absence de coulure, limites nettes, séchage, retrait des protections et nettoyage",
    recurringInterventions:
      "diagnostic du support, préparation, impression, peinture murs et plafonds, boiseries, façade ou retouche",
    sensitiveProofs:
      "état initial, mesure d’humidité, préparation du support, référence de teinte, couches appliquées et résultat en lumière normale",
    assignmentChecks:
      "maîtrise du produit appliqué, ventilation disponible, protection respiratoire adaptée et autorisation de travail en hauteur si nécessaire",
    complianceChecks:
      "responsabilité civile, décennale selon les travaux, fiches de données de sécurité, prévention du plomb et contrôle des moyens d’accès",
    criticalStock:
      "bâches, adhésifs, abrasifs, enduits, impressions, rouleaux, manchons, filtres, solvants autorisés et consommables de nettoyage",
    extraContentPatches: [
      {
        processId: PROCESS.acquisition,
        contentIndex: 3,
        label:
          "Qualifier la demande avec les surfaces, l’état et l’humidité des supports, le revêtement existant, l’occupation, l’accès, les teintes et des photos",
      },
      {
        processId: PROCESS.acquisition,
        contentIndex: 4,
        label:
          "Envoyer un devis distinguant protections, préparation, réparations, impression, nombre de couches, produits, accès et exclusions",
      },
      {
        processId: PROCESS.progress,
        contentIndex: 1,
        label:
          "Noter les zones protégées et préparées, produits et teintes utilisés, couches appliquées, temps de séchage et retouches restantes",
      },
      {
        processId: PROCESS.startAndClose,
        contentIndex: 0,
        label:
          "Vérifier avant démarrage l’humidité, les diagnostics disponibles, la teinte validée, la compatibilité des produits, la ventilation et les protections",
      },
      {
        processId: PROCESS.startAndClose,
        contentIndex: 3,
        label:
          "Contrôler l’aspect en lumière normale, réaliser les retouches, retirer les protections, nettoyer et remettre les références de produits et teintes",
      },
      {
        processId: PROCESS.delay,
        contentIndex: 0,
        label:
          "Qualifier l’imprévu : support humide, ancienne peinture instable, matériau suspect, teinte différente, séchage lent, accès indisponible ou poussière d’un autre lot",
      },
      {
        processId: PROCESS.onboarding,
        contentIndex: 2,
        label:
          "Prévoir du travail en binôme sur le diagnostic du support, les protections, la préparation, les mélanges, la pulvérisation et le travail en hauteur",
      },
      {
        processId: PROCESS.profitability,
        contentIndex: 2,
        label:
          "Repérer les écarts de marge liés à la préparation, au rendement du support, au nombre de couches, aux masquages, retouches, accès ou changements de teinte",
      },
    ],
  },
  carreleur: {
    slug: "carreleur",
    name: "Carrelage",
    reviewState: "internal_review_complete",
    priorityWork:
      "pose de sol, faïence, douche, terrasse, rénovation ou reprise après décollement",
    autonomousDecisions:
      "ajustement d’un calepinage secondaire, remplacement d’un consommable équivalent ou reprise locale dans la tolérance prévue",
    immediateEscalations:
      "support fissuré, humidité, pente impossible, étanchéité absente, différence de bain, réseau non repéré ou cote incompatible",
    localSearches:
      "carreleur, pose carrelage, rénovation carrelage, faïence ou carrelage terrasse",
    maintenanceReminders:
      "contrôle des joints, reprise de réserve, séchage avant mise en service ou vérification d’une zone extérieure",
    commissioningChecks:
      "planéité, alignement, largeur des joints, pentes, coupes, étanchéité des zones concernées, nettoyage et protection",
    recurringInterventions:
      "contrôle du support, calepinage, préparation, pose au sol, faïence, joints ou reprise",
    sensitiveProofs:
      "support et humidité, système d’étanchéité avant pose, calepinage validé, encollage, pentes et résultat final",
    assignmentChecks:
      "maîtrise du système de pose, prévention des poussières de découpe, moyens de manutention et compétence d’étanchéité si nécessaire",
    complianceChecks:
      "responsabilité civile, décennale selon les travaux, conformité du système d’étanchéité, prévention de la silice et fiches techniques des produits",
    criticalStock:
      "colles, primaires, croisillons, cales, joints, profilés, disques, systèmes d’étanchéité et consommables de protection",
    extraContentPatches: [
      {
        processId: PROCESS.acquisition,
        contentIndex: 3,
        label:
          "Qualifier la demande avec les surfaces, le support, l’humidité, le format, le calepinage, les pentes, l’étanchéité attendue et des photos",
      },
      {
        processId: PROCESS.acquisition,
        contentIndex: 4,
        label:
          "Envoyer un devis distinguant préparation, ragréage, étanchéité, fourniture, pose, coupes, profilés, joints, plinthes et exclusions",
      },
      {
        processId: PROCESS.progress,
        contentIndex: 1,
        label:
          "Noter les supports préparés, zones étanchées, références et bains utilisés, surfaces posées, joints réalisés et coupes restantes",
      },
      {
        processId: PROCESS.startAndClose,
        contentIndex: 0,
        label:
          "Vérifier avant pose planéité, humidité, stabilité, pentes, lots de carreaux, calepinage validé, passages de réseaux et temps de séchage disponibles",
      },
      {
        processId: PROCESS.startAndClose,
        contentIndex: 3,
        label:
          "Contrôler planéité, alignement, pentes, joints et évacuations, nettoyer, protéger puis indiquer le délai avant circulation ou mise en eau",
      },
      {
        processId: PROCESS.delay,
        contentIndex: 0,
        label:
          "Qualifier l’imprévu : support fissuré ou humide, pente insuffisante, différence de bain, carreau manquant, réseau découvert ou séchage incomplet",
      },
      {
        processId: PROCESS.onboarding,
        contentIndex: 2,
        label:
          "Prévoir du travail en binôme sur le contrôle du support, le calepinage, l’étanchéité, les grands formats, les coupes et les pentes",
      },
      {
        processId: PROCESS.profitability,
        contentIndex: 2,
        label:
          "Repérer les écarts de marge liés à la préparation, aux coupes, chutes, grands formats, manutention, reprises d’étanchéité ou temps de jointoiement",
      },
    ],
  },
} satisfies Record<string, BtpTradeProfile>;
