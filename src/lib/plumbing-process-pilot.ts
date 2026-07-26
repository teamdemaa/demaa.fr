export const plumbingPilotContentTypes = [
  "implementation_action",
  "operational_step",
  "operating_rule",
  "recurring_control",
] as const;

export type PlumbingPilotContentType =
  (typeof plumbingPilotContentTypes)[number];

export type PlumbingPilotContentItem = {
  type: PlumbingPilotContentType;
  label: string;
};

export type PlumbingPilotProcessDefinition = {
  objective: string;
  trigger: string;
  expectedResult: string;
  defaultOwner: string;
  cadence: string;
};

function content(
  type: PlumbingPilotContentType,
  label: string,
): PlumbingPilotContentItem {
  return { type, label };
}

export const plumbingPilotProcessDefinitionsById: Record<
  string,
  PlumbingPilotProcessDefinition
> = {
  "process.btp.direction.savoir-ou-va-lentreprise": {
    objective:
      "Choisir les prestations, les zones et les objectifs qui doivent concentrer les moyens de l’entreprise.",
    trigger:
      "Revue annuelle, changement important d’activité ou écart durable entre les objectifs et les résultats.",
    expectedResult:
      "Des priorités commerciales explicites, des chantiers à accepter ou refuser et des objectifs mensuels mesurables.",
    defaultOwner: "Dirigeant",
    cadence: "Cadrage annuel, suivi mensuel",
  },
  "process.btp.direction.decider-au-quotidien-sans-le-dirigeant": {
    objective:
      "Permettre à l’équipe de traiter les décisions courantes sans attendre systématiquement le dirigeant.",
    trigger:
      "Décision récurrente, indisponibilité du dirigeant ou nouveau niveau de délégation.",
    expectedResult:
      "Des seuils de décision, des cas d’escalade et un remplaçant clairement identifiés.",
    defaultOwner: "Dirigeant",
    cadence: "Mise à jour trimestrielle et à chaque changement d’équipe",
  },
  "process.btp.direction.donner-acces-a-lessentiel": {
    objective:
      "Donner aux bonnes personnes les informations et accès indispensables, sans exposer les données inutiles.",
    trigger:
      "Arrivée ou départ d’un collaborateur, changement d’outil, changement de mot de passe ou incident d’accès.",
    expectedResult:
      "Une liste d’accès à jour, des droits adaptés aux postes et une solution de secours sécurisée.",
    defaultOwner: "Dirigeant ou responsable administratif",
    cadence: "Contrôle trimestriel et à chaque mouvement d’équipe",
  },
  "process.btp.direction.garder-une-visibilite-sans-reprendre-la-main": {
    objective:
      "Donner au dirigeant une vision courte de l’activité sans reprendre lui-même toutes les opérations.",
    trigger: "Clôture du mois ou point de pilotage programmé.",
    expectedResult:
      "Les écarts importants sont identifiés et trois actions prioritaires maximum sont décidées.",
    defaultOwner: "Dirigeant",
    cadence: "Mensuelle",
  },
  "process.btp.marketing-vente.attirer-et-vendre-un-chantier": {
    objective:
      "Transformer les demandes pertinentes de la zone d’intervention en devis qualifiés puis en chantiers signés.",
    trigger:
      "Nouvelle demande entrante ou lancement d’une action d’acquisition locale.",
    expectedResult:
      "La demande est qualifiée et chaque devis aboutit à une signature, un refus ou une relance tracée.",
    defaultOwner: "Dirigeant ou responsable commercial",
    cadence: "À chaque demande, revue hebdomadaire des devis",
  },
  "process.btp.marketing-vente.faire-revenir-les-clients": {
    objective:
      "Obtenir des avis, recommandations et interventions récurrentes après un chantier correctement réalisé.",
    trigger:
      "Fin d’intervention, fin de garantie ou prochaine échéance d’entretien.",
    expectedResult:
      "La fiche client est à jour et la prochaine sollicitation utile est programmée.",
    defaultOwner: "Responsable administratif ou commercial",
    cadence: "Après chaque intervention, revue mensuelle",
  },
  "process.btp.marketing-vente.traiter-une-reclamation-ou-un-litige-client": {
    objective:
      "Traiter chaque désaccord avec des faits, un responsable et une réponse écrite.",
    trigger:
      "Réclamation orale ou écrite, réserve à la réception, demande de reprise ou contestation de facture.",
    expectedResult:
      "La cause, la décision, le délai et la clôture sont documentés avec les pièces justificatives.",
    defaultOwner: "Dirigeant ou responsable de chantier",
    cadence: "À chaque réclamation",
  },
  "process.btp.operations.suivre-lavancement-dun-chantier": {
    objective:
      "Maintenir un état fiable de chaque chantier entre la préparation et la réception.",
    trigger:
      "Devis accepté, passage d’un technicien, blocage, modification demandée ou fin d’intervention.",
    expectedResult:
      "Le statut, les travaux réalisés, le reste à faire, les photos et la prochaine date sont connus.",
    defaultOwner: "Responsable de chantier ou technicien référent",
    cadence: "Après chaque intervention, contrôle quotidien",
  },
  "process.btp.operations.demarrer-et-cloturer-un-chantier": {
    objective:
      "Éviter les départs incomplets et les fins de chantier sans essais, réception ou documents.",
    trigger: "Préparation du premier passage et dernière intervention prévue.",
    expectedResult:
      "Le chantier démarre avec les bonnes informations et se clôture avec essais, preuves, réception et facturation prête.",
    defaultOwner: "Responsable de chantier ou technicien référent",
    cadence: "À chaque ouverture et clôture de chantier",
  },
  "process.btp.operations.tenir-chaque-corps-de-metier": {
    objective:
      "Standardiser les interventions récurrentes et réduire les erreurs de pose ou de contrôle.",
    trigger:
      "Intervention récurrente, nouvelle prestation, non-conformité ou erreur répétée.",
    expectedResult:
      "Une checklist exploitable précise les étapes, pièces, outils, contrôles, preuves et règles de sécurité.",
    defaultOwner: "Référent technique",
    cadence: "Utilisation à chaque intervention, revue trimestrielle",
  },
  "process.btp.operations.gerer-un-retard-ou-un-imprevu": {
    objective:
      "Réagir rapidement à un aléa en protégeant le client, le planning et la marge.",
    trigger:
      "Pièce manquante, panne, absence, erreur, retard ou demande supplémentaire.",
    expectedResult:
      "Le problème est qualifié, le client informé, le planning corrigé et la cause tracée.",
    defaultOwner: "Responsable de chantier ou dirigeant",
    cadence: "À chaque aléa, revue mensuelle des causes",
  },
  "process.btp.equipe.organiser-les-equipes-remplacer-un-absent": {
    objective:
      "Affecter les bonnes compétences aux interventions et maintenir le planning en cas d’absence.",
    trigger:
      "Préparation de la semaine, changement de planning, urgence ou indisponibilité d’un intervenant.",
    expectedResult:
      "Chaque intervention a un responsable compétent, les consignes sont transmises et une solution de remplacement existe.",
    defaultOwner: "Dirigeant ou responsable de planning",
    cadence: "Planification hebdomadaire, ajustement quotidien",
  },
  "process.btp.equipe.integrer-un-nouvel-employe": {
    objective:
      "Amener un nouvel employé à intervenir seul uniquement après validation de ses moyens et compétences.",
    trigger:
      "Contrat signé, arrivée d’un salarié, intérimaire ou apprenti.",
    expectedResult:
      "Les équipements, accès, règles, périodes en binôme et compétences validées sont tracés.",
    defaultOwner: "Dirigeant ou responsable d’équipe",
    cadence: "À chaque arrivée",
  },
  "process.btp.finance-admin.suivre-la-rentabilite": {
    objective:
      "Connaître la marge réelle de chaque chantier et corriger les prix ou temps standards.",
    trigger:
      "Création d’un chantier, saisie d’un achat ou d’une heure, puis clôture du chantier.",
    expectedResult:
      "Les coûts réels sont rapprochés du devis et les écarts expliqués avant les prochains devis.",
    defaultOwner: "Dirigeant ou responsable administratif",
    cadence: "À chaque chantier, synthèse mensuelle",
  },
  "process.btp.finance-admin.payer-a-temps": {
    objective:
      "Anticiper les sorties d’argent et transmettre les justificatifs nécessaires sans retard.",
    trigger:
      "Réception d’une facture, nouvelle échéance ou préparation du dossier comptable mensuel.",
    expectedResult:
      "Les paiements sont planifiés, rattachés aux bons chantiers et visibles dans la trésorerie à venir.",
    defaultOwner: "Responsable administratif",
    cadence: "Contrôle hebdomadaire, transmission mensuelle",
  },
  "process.btp.finance-admin.se-faire-payer": {
    objective:
      "Facturer au bon moment et réduire les retards d’encaissement.",
    trigger:
      "Acceptation d’un devis, étape facturable, réception du chantier ou facture échue.",
    expectedResult:
      "Acomptes, situations, soldes, paiements et relances sont émis et tracés jusqu’à l’encaissement.",
    defaultOwner: "Responsable administratif ou dirigeant",
    cadence: "À chaque échéance, contrôle hebdomadaire",
  },
  "process.btp.conformite-metier.securite-et-couverture-assurance": {
    objective:
      "Maintenir les justificatifs, protections et contrôles nécessaires aux interventions de l’entreprise.",
    trigger:
      "Échéance d’une attestation, arrivée d’un salarié, incident ou préparation d’un chantier sensible.",
    expectedResult:
      "Les documents, habilitations, équipements de protection et preuves de contrôle sont disponibles et à jour.",
    defaultOwner: "Dirigeant ou référent sécurité",
    cadence: "Contrôle mensuel et avant chaque chantier sensible",
  },
  "process.btp.materiel-approvisionnement.materiel-et-fournisseurs": {
    objective:
      "Disposer des pièces et outils nécessaires sans surstock, perte de matériel ou livraison non contrôlée.",
    trigger:
      "Atteinte d’un seuil de stock, préparation d’un chantier, commande, livraison ou anomalie fournisseur.",
    expectedResult:
      "Le stock critique, l’affectation des outils, les commandes et la qualité des fournisseurs sont suivis.",
    defaultOwner: "Responsable technique ou achats",
    cadence: "Contrôle des livraisons, revue hebdomadaire des stocks",
  },
};

/**
 * Miroir éditorial du pilote Plomberie validé et synchronisé dans le
 * référentiel Google Sheet.
 *
 * L'export historique `plumbingPilotStepsByProcessId` est conservé en bas du
 * fichier afin que l'interface actuelle continue d'afficher exactement les
 * mêmes 74 libellés.
 */
export const plumbingPilotContentByProcessId: Record<
  string,
  PlumbingPilotContentItem[]
> = {
  "process.btp.direction.savoir-ou-va-lentreprise": [
    content(
      "implementation_action",
      "Choisir les chantiers prioritaires : dépannage urgent, rénovation, chaudière ou entretien",
    ),
    content(
      "operating_rule",
      "Définir la zone d’intervention, le panier minimum et les chantiers à refuser",
    ),
    content(
      "recurring_control",
      "Fixer les objectifs mensuels : chiffre d’affaires, marge, devis signés et semaines de planning remplies",
    ),
    content(
      "recurring_control",
      "Suivre chaque semaine les urgences, les devis en attente et la charge des équipes",
    ),
  ],
  "process.btp.direction.decider-au-quotidien-sans-le-dirigeant": [
    content(
      "implementation_action",
      "Lister ce que le technicien peut décider seul : achat urgent, remplacement d’une pièce ou geste commercial",
    ),
    content(
      "operating_rule",
      "Fixer un montant maximum d’achat et de remise sans validation du dirigeant",
    ),
    content(
      "operating_rule",
      "Définir les situations à remonter immédiatement : fuite importante, risque gaz, retard ou conflit client",
    ),
    content(
      "implementation_action",
      "Nommer la personne qui tranche lorsque le dirigeant est sur un chantier ou indisponible",
    ),
  ],
  "process.btp.direction.donner-acces-a-lessentiel": [
    content(
      "implementation_action",
      "Centraliser les accès au planning, aux devis, aux factures et aux dossiers clients",
    ),
    content(
      "recurring_control",
      "Tenir une liste à jour des fournisseurs, assurances, sous-traitants et contacts d’urgence",
    ),
    content(
      "operating_rule",
      "Donner à chaque salarié uniquement les accès nécessaires à son poste",
    ),
    content(
      "implementation_action",
      "Prévoir un accès de secours sécurisé en cas d’absence du dirigeant",
    ),
  ],
  "process.btp.direction.garder-une-visibilite-sans-reprendre-la-main": [
    content(
      "recurring_control",
      "Comparer chaque mois le chiffre facturé, encaissé et restant à facturer",
    ),
    content(
      "recurring_control",
      "Contrôler le taux de devis signés et les devis sans réponse depuis plus de 7 jours",
    ),
    content(
      "recurring_control",
      "Repérer les chantiers en retard, les reprises SAV et les marges anormalement faibles",
    ),
    content(
      "recurring_control",
      "Décider de trois actions maximum à réaliser avant le point suivant",
    ),
  ],
  "process.btp.marketing-vente.attirer-et-vendre-un-chantier": [
    content(
      "implementation_action",
      "Créer et optimiser la fiche Google Business Profile : zone, horaires, téléphone, services et photos",
    ),
    content(
      "implementation_action",
      "Mettre en ligne un site clair avec les prestations, les zones desservies et un bouton Appeler / Demander un devis",
    ),
    content(
      "implementation_action",
      "Lancer des campagnes Google Ads locales sur les recherches rentables : urgence plomberie, fuite ou chauffe-eau",
    ),
    content(
      "operational_step",
      "Qualifier chaque demande avec l’adresse, l’urgence, des photos, le type d’installation et le délai souhaité",
    ),
    content(
      "operational_step",
      "Envoyer un devis lisible avec acompte et relancer automatiquement à J+2 puis J+7",
    ),
  ],
  "process.btp.marketing-vente.faire-revenir-les-clients": [
    content(
      "operational_step",
      "Envoyer après chaque intervention un SMS avec le lien direct vers l’avis Google",
    ),
    content(
      "operational_step",
      "Enregistrer l’équipement posé, la date d’intervention et la fin de garantie dans la fiche client",
    ),
    content(
      "operational_step",
      "Programmer les rappels d’entretien : chaudière, chauffe-eau, détartrage ou contrôle annuel",
    ),
    content(
      "recurring_control",
      "Recontacter les clients satisfaits avant leur prochaine échéance et demander une recommandation",
    ),
  ],
  "process.btp.marketing-vente.traiter-une-reclamation-ou-un-litige-client": [
    content(
      "operational_step",
      "Regrouper le devis signé, les photos, la facture et le compte-rendu d’intervention",
    ),
    content(
      "operational_step",
      "Accuser réception de la réclamation sous 24 heures avec un responsable et un délai de réponse",
    ),
    content(
      "operational_step",
      "Planifier un diagnostic sur place et noter précisément la cause, la responsabilité et la solution",
    ),
    content(
      "operational_step",
      "Clôturer par écrit : reprise, remplacement, geste commercial ou refus motivé",
    ),
  ],
  "process.btp.operations.suivre-lavancement-dun-chantier": [
    content(
      "operational_step",
      "Mettre chaque chantier en statut : à préparer, en cours, bloqué, à réceptionner ou terminé",
    ),
    content(
      "operational_step",
      "Noter après chaque passage les travaux réalisés, les pièces posées et ce qu’il reste à faire",
    ),
    content(
      "operational_step",
      "Ajouter les photos avant/après et signaler immédiatement un blocage ou un travail supplémentaire",
    ),
    content(
      "operational_step",
      "Confirmer au client la prochaine intervention et la date prévisionnelle de fin",
    ),
  ],
  "process.btp.operations.demarrer-et-cloturer-un-chantier": [
    content(
      "operational_step",
      "Vérifier avant départ l’adresse, le contact client, le devis signé, l’acompte et les contraintes d’accès",
    ),
    content(
      "operational_step",
      "Préparer les pièces, l’outillage, les protections et les documents techniques nécessaires",
    ),
    content(
      "operational_step",
      "Faire les essais d’étanchéité, de pression ou de remise en service avant de quitter les lieux",
    ),
    content(
      "operational_step",
      "Obtenir la réception du client, prendre les photos finales et transmettre facture, garanties et consignes",
    ),
  ],
  "process.btp.operations.tenir-chaque-corps-de-metier": [
    content(
      "implementation_action",
      "Créer une checklist par intervention récurrente : fuite, chauffe-eau, chaudière, sanitaire ou salle de bain",
    ),
    content(
      "implementation_action",
      "Indiquer pour chaque intervention les outils, pièces, contrôles et règles de sécurité obligatoires",
    ),
    content(
      "operating_rule",
      "Exiger les photos des points sensibles avant fermeture d’une cloison ou remise en eau",
    ),
    content(
      "recurring_control",
      "Contrôler un échantillon de chantiers et corriger la checklist après chaque erreur récurrente",
    ),
  ],
  "process.btp.operations.gerer-un-retard-ou-un-imprevu": [
    content(
      "operational_step",
      "Qualifier immédiatement le problème : pièce manquante, panne, absence, erreur de pose ou demande supplémentaire",
    ),
    content(
      "operational_step",
      "Prévenir le client avec une nouvelle date et une explication claire avant qu’il ne relance",
    ),
    content(
      "operational_step",
      "Réserver la pièce, déplacer un technicien ou replanifier les autres interventions",
    ),
    content(
      "operational_step",
      "Noter le coût, le retard et la cause pour éviter que le même incident se reproduise",
    ),
  ],
  "process.btp.equipe.organiser-les-equipes-remplacer-un-absent": [
    content(
      "recurring_control",
      "Construire le planning hebdomadaire avec adresse, durée, technicien, compétence et matériel nécessaire",
    ),
    content(
      "operational_step",
      "Vérifier les habilitations gaz, électriques ou spécifiques avant d’affecter une intervention",
    ),
    content(
      "implementation_action",
      "Tenir une liste de remplaçants, intérimaires et sous-traitants joignables en urgence",
    ),
    content(
      "recurring_control",
      "Envoyer chaque matin les changements de planning et les consignes prioritaires à l’équipe",
    ),
  ],
  "process.btp.equipe.integrer-un-nouvel-employe": [
    content(
      "operational_step",
      "Préparer avant son arrivée le contrat, les EPI, la tenue, le téléphone et les accès au planning",
    ),
    content(
      "operational_step",
      "Présenter les règles de sécurité, le rangement du véhicule et la gestion des photos clients",
    ),
    content(
      "operational_step",
      "Prévoir plusieurs interventions en binôme sur les prestations les plus fréquentes",
    ),
    content(
      "operational_step",
      "Valider avec une checklist ce qu’il peut réaliser seul avant de lui affecter un chantier",
    ),
  ],
  "process.btp.finance-admin.suivre-la-rentabilite": [
    content(
      "operational_step",
      "Créer une fiche par chantier avec devis, achats, heures prévues, heures réalisées et sous-traitance",
    ),
    content(
      "operational_step",
      "Comparer à la fin du chantier la marge prévue avec la marge réellement obtenue",
    ),
    content(
      "operational_step",
      "Repérer les écarts : temps dépassé, pièce oubliée, déplacement supplémentaire ou remise excessive",
    ),
    content(
      "recurring_control",
      "Mettre à jour les prix et les temps standards sur les prochains devis",
    ),
  ],
  "process.btp.finance-admin.payer-a-temps": [
    content(
      "implementation_action",
      "Centraliser les échéances fournisseurs, salaires, TVA, assurances, véhicules et abonnements",
    ),
    content(
      "recurring_control",
      "Contrôler chaque semaine le solde bancaire et les décaissements des 30 prochains jours",
    ),
    content(
      "operational_step",
      "Faire correspondre chaque facture fournisseur au chantier concerné avant paiement",
    ),
    content(
      "recurring_control",
      "Transmettre au comptable les factures d’achat et de vente dans un dossier mensuel unique",
    ),
  ],
  "process.btp.finance-admin.se-faire-payer": [
    content(
      "operating_rule",
      "Demander l’acompte avant de commander les pièces ou de bloquer une date de chantier",
    ),
    content(
      "operational_step",
      "Émettre les situations intermédiaires pour les chantiers longs et la facture finale dès la réception",
    ),
    content(
      "recurring_control",
      "Vérifier chaque semaine les factures échues et les paiements reçus",
    ),
    content(
      "operational_step",
      "Relancer par email puis téléphone à J+3, J+10 et J+20 et tracer chaque échange",
    ),
  ],
  "process.btp.conformite-metier.securite-et-couverture-assurance": [
    content(
      "recurring_control",
      "Vérifier les attestations décennale, responsabilité civile et qualifications gaz avant leur échéance",
    ),
    content(
      "recurring_control",
      "Tenir à jour le DUERP, les habilitations et le registre des incidents ou presque-accidents",
    ),
    content(
      "recurring_control",
      "Contrôler dans chaque véhicule les EPI, extincteur, trousse de secours et matériel de consignation",
    ),
    content(
      "operating_rule",
      "Conserver les preuves de contrôle, photos et signatures nécessaires pour chaque chantier sensible",
    ),
  ],
  "process.btp.materiel-approvisionnement.materiel-et-fournisseurs": [
    content(
      "operating_rule",
      "Définir un stock minimum pour les raccords, joints, vannes, flexibles et consommables courants",
    ),
    content(
      "implementation_action",
      "Créer une alerte de réapprovisionnement dès que le stock minimum est atteint",
    ),
    content(
      "implementation_action",
      "Affecter chaque outil et appareil de mesure à un véhicule ou à un technicien",
    ),
    content(
      "recurring_control",
      "Comparer les prix, délais et taux d’erreur des fournisseurs principaux et de secours",
    ),
    content(
      "operational_step",
      "Contrôler chaque livraison : référence, quantité, état et chantier de destination",
    ),
  ],
};

export const plumbingPilotStepsByProcessId: Record<string, string[]> =
  Object.fromEntries(
    Object.entries(plumbingPilotContentByProcessId).map(
      ([processId, items]) => [
        processId,
        items.map((item) => item.label),
      ],
    ),
  );
