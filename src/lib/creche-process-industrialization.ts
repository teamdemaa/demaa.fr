import type {
  IndustrializedContentItem,
  IndustrializedProcessDefinition,
  ProcessDraft,
} from "@/lib/process-industrialization";

export type CrecheProfile = {
  slug: "creche";
  name: string;
  sourceUrl: string;
  researchSources: readonly string[];
  processCount: number;
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

const crecheProcesses = {
  strategy: "process.petite-enfance.direction.savoir-ou-va-la-structure",
  decisions:
    "process.petite-enfance.direction.decider-sans-bloquer-laccueil",
  access: "process.petite-enfance.direction.donner-acces-a-lessentiel",
  admissions:
    "process.petite-enfance.marketing-vente.gerer-preinscriptions-et-familles",
  complaints:
    "process.petite-enfance.marketing-vente.traiter-une-reclamation-ou-un-signalement",
  attendance:
    "process.petite-enfance.operations.organiser-accueil-presences-et-transmissions",
  care: "process.petite-enfance.operations.suivre-repas-soins-et-securite",
  activities:
    "process.petite-enfance.operations.preparer-activites-et-continuite",
  team: "process.petite-enfance.equipe.organiser-lequipe-et-les-remplacements",
  billing:
    "process.petite-enfance.finance-admin.suivre-contrats-facturation-et-aides",
  payables: "process.petite-enfance.finance-admin.payer-a-temps",
  compliance:
    "process.petite-enfance.conformite-metier.tenir-agrements-protocoles-et-obligations-en-regle",
} as const;

const crecheDefinitions: Record<
  keyof typeof crecheProcesses,
  IndustrializedProcessDefinition
> = {
  strategy: def(
    "Piloter capacité, qualité d’accueil, équipe et équilibre économique à partir des besoins réels des enfants.",
    "Préparation budgétaire, évolution de fréquentation, contrôle, incident ou changement réglementaire.",
    "Des priorités réalistes, financées et compatibles avec la qualité et la sécurité de l’accueil.",
    "Gestionnaire ou direction",
    "Mensuelle",
  ),
  decisions: def(
    "Prendre rapidement les décisions qui sécurisent l’accueil sans dépasser les délégations.",
    "Absence, dépassement de capacité, problème de santé, incident, conflit ou demande inhabituelle.",
    "Une décision compétente, tracée, communiquée et réévaluée si nécessaire.",
    "Direction",
    "À chaque situation",
  ),
  access: def(
    "Donner à chacun les seuls accès et informations nécessaires à son rôle.",
    "Arrivée, remplacement, changement de fonction, départ ou incident d’accès.",
    "Les informations critiques sont disponibles, protégées et retirées dès qu’elles ne sont plus utiles.",
    "Direction",
    "À chaque mouvement",
  ),
  admissions: def(
    "Transformer une demande familiale en accueil confirmé, adapté et administrativement complet.",
    "Préinscription, place disponible, admission ou évolution du besoin d’accueil.",
    "Un contrat cohérent avec la capacité, le besoin de l’enfant et les règles de la structure.",
    "Direction ou administration",
    "À chaque demande",
  ),
  complaints: def(
    "Traiter toute réclamation ou alerte sans minimisation, représailles ni perte d’information.",
    "Mécontentement, conflit, suspicion de danger, événement indésirable ou signalement.",
    "La situation est sécurisée, instruite, orientée et suivie jusqu’à clôture.",
    "Direction ou référent désigné",
    "À chaque signalement",
  ),
  attendance: def(
    "Organiser chaque journée selon les enfants réellement présents et transmettre l’essentiel aux familles.",
    "Ouverture, arrivée, départ, absence, changement d’horaire ou relève d’équipe.",
    "Chaque enfant est accueilli, compté, confié et suivi sans rupture d’information.",
    "Responsable de section",
    "Quotidienne",
  ),
  care: def(
    "Réaliser repas, sommeil, changes et soins autorisés dans un cadre individualisé, hygiénique et traçable.",
    "Accueil quotidien, repas, change, sommeil, symptôme, traitement ou incident.",
    "Les besoins de l’enfant sont respectés et toute anomalie reçoit la réponse prévue par le protocole.",
    "Équipe encadrante",
    "Quotidienne",
  ),
  activities: def(
    "Préparer des temps d’éveil adaptés et maintenir un accueil sûr malgré les aléas.",
    "Programmation, sortie, absence, panne, intempérie ou indisponibilité d’un espace.",
    "Une activité adaptée peut se tenir ou être remplacée sans compromettre l’encadrement.",
    "Responsable pédagogique",
    "Hebdomadaire",
  ),
  team: def(
    "Couvrir les horaires avec les qualifications, ratios et temps de fonction nécessaires.",
    "Planning, absence, recrutement, remplacement, formation ou variation de présence.",
    "La structure reste conforme et chaque professionnel sait où, quand et avec qui intervenir.",
    "Direction",
    "Quotidienne",
  ),
  billing: def(
    "Faire correspondre contrat, présence, tarification, aides et facturation.",
    "Admission, avenant, clôture mensuelle, absence facturable, aide ou impayé.",
    "Une facture explicable, justifiée et rapprochée des encaissements.",
    "Administration",
    "Mensuelle",
  ),
  payables: def(
    "Acheter et payer à temps ce qui est nécessaire à l’accueil.",
    "Commande, livraison, facture, abonnement, paie ou échéance.",
    "Une dépense autorisée, reçue, justifiée et payée une seule fois.",
    "Gestionnaire ou administration",
    "Hebdomadaire",
  ),
  compliance: def(
    "Maintenir autorisation, projet, protocoles, registres et preuves au niveau attendu par les autorités.",
    "Échéance, modification, contrôle PMI, incident, recrutement ou changement réglementaire.",
    "Un dossier conforme, à jour et immédiatement présentable.",
    "Gestionnaire ou direction",
    "Mensuelle",
  ),
};

const crecheContent: Record<
  keyof typeof crecheProcesses,
  IndustrializedContentItem[]
> = {
  strategy: [
    item("implementation_action", "Fixer capacité autorisée, amplitude, âges accueillis, modalités d’accueil et règles de dépassement à partir de l’autorisation en vigueur"),
    item("implementation_action", "Définir des objectifs mensuels de taux d’occupation, continuité d’accueil, stabilité d’équipe, satisfaction familles et trésorerie"),
    item("operational_step", "Comparer les demandes des familles aux places, âges, horaires, adaptations et ressources réellement disponibles"),
    item("recurring_control", "Suivre chaque mois présences facturables, absences, capacité inutilisée, masse salariale, achats, aides et trésorerie"),
    item("recurring_control", "Revoir chaque trimestre les pratiques au regard du projet d’établissement, de la charte et du référentiel national de qualité"),
    item("operating_rule", "Ne jamais augmenter le remplissage au détriment des ratios, des qualifications, des locaux autorisés ou des besoins individuels"),
  ],
  decisions: [
    item("implementation_action", "Écrire qui décide pour refus d’accueil, appel médical, fermeture de section, remplacement, sortie, dépense urgente et information d’une autorité"),
    item("operational_step", "Qualifier la situation avec enfant concerné, faits, heure, personnes présentes, risque immédiat, protocole applicable et décision attendue"),
    item("operational_step", "Sécuriser d’abord les enfants puis appeler selon le protocole la direction, la famille, le professionnel de santé ou les secours"),
    item("operational_step", "Tracer décision, auteur, heure, consignes, personnes informées, pièces et contrôle à effectuer"),
    item("recurring_control", "Reprendre en réunion les décisions inhabituelles, incidents répétés, délais et mesures correctives non terminées"),
    item("operating_rule", "Un professionnel ne déroge pas seul à une prescription, un PAI, un protocole, une capacité ou une règle d’encadrement"),
  ],
  access: [
    item("implementation_action", "Créer une matrice des accès aux dossiers enfants, contacts d’urgence, PAI, planning, facturation, vidéosurveillance éventuelle, clés et outils numériques"),
    item("implementation_action", "Centraliser les versions à jour des contacts d’urgence, protocoles, plans d’évacuation et mise en sûreté dans un emplacement connu de l’équipe"),
    item("operational_step", "Attribuer chaque accès nominativement selon fonction, section, durée et niveau de confidentialité"),
    item("operational_step", "À chaque arrivée ou remplacement, remettre les accès utiles et faire confirmer la lecture des consignes critiques"),
    item("recurring_control", "Contrôler chaque mois comptes partagés, anciens salariés, droits excessifs, documents imprimés et données laissées visibles"),
    item("operating_rule", "Ne transmettre une information sur un enfant ou une famille qu’à une personne autorisée qui en a besoin pour sa mission"),
  ],
  admissions: [
    item("implementation_action", "Tenir une liste de préinscriptions avec date souhaitée, âge, jours, horaires, besoins particuliers, coordonnées et statut de réponse"),
    item("operational_step", "Qualifier la demande avec autorité parentale, personnes autorisées, habitudes, santé, alimentation, sommeil, handicap éventuel et contraintes familiales"),
    item("operational_step", "Vérifier avant proposition la place par tranche d’âge, le planning d’équipe, les ratios, l’adaptation possible et le financement applicable"),
    item("operational_step", "Remettre règlement de fonctionnement, projet d’établissement, tarif, pièces attendues, période d’adaptation et modalités d’absence ou de rupture"),
    item("operational_step", "Contrôler avant le premier accueil contrat signé, contacts, autorisations, vaccinations ou justificatifs requis, ordonnance et PAI si nécessaire"),
    item("recurring_control", "Relancer chaque semaine dossiers incomplets, réponses à donner, places à confirmer et familles en attente"),
  ],
  complaints: [
    item("implementation_action", "Mettre à disposition un canal identifié pour réclamation familiale, événement indésirable, suspicion de maltraitance ou alerte professionnelle"),
    item("operational_step", "Accuser réception puis distinguer mécontentement, urgence, danger pour l’enfant, accident, maltraitance et fait nécessitant une déclaration"),
    item("operational_step", "Protéger immédiatement l’enfant et les preuves, sans confrontation improvisée ni diffusion inutile"),
    item("operational_step", "Recueillir séparément faits, dates, heures, témoins, transmissions, documents et actions déjà réalisées"),
    item("operational_step", "Activer le circuit prévu vers direction, référent Santé et Accueil inclusif, PMI, cellule départementale ou secours selon la situation"),
    item("recurring_control", "Suivre jusqu’à clôture réponse à la famille, déclaration, mesure corrective, responsable, échéance et vérification de non-récidive"),
  ],
  attendance: [
    item("implementation_action", "Créer le registre quotidien avec enfant, heure d’arrivée, heure de départ, adulte accompagnant et professionnel qui prend le relais"),
    item("operational_step", "À l’arrivée, confirmer identité, personne autorisée, état inhabituel, sommeil, repas, traitement éventuel et information importante"),
    item("operational_step", "Mettre à jour en temps réel enfants présents par espace et professionnels effectivement auprès d’eux"),
    item("operational_step", "À chaque relève, transmettre oralement et par écrit les seules informations utiles sur repas, sommeil, change, humeur, soin et incident"),
    item("operational_step", "Au départ, vérifier la personne autorisée puis transmettre les faits de la journée sans exposer les données d’un autre enfant"),
    item("recurring_control", "Rapprocher chaque fin de journée registre, planning, anomalies d’horaires, oublis de pointage et événements à suivre"),
  ],
  care: [
    item("implementation_action", "Créer une fiche individuelle à jour pour alimentation, allergies, sommeil, change, confort, PAI, contacts et conduites autorisées"),
    item("operational_step", "Préparer et servir les repas en vérifiant enfant, régime, allergène, texture, température, conservation et traçabilité utile"),
    item("operational_step", "Tracer repas, hydratation, sommeil, changes, selles inhabituelles, température mesurée et information transmise selon les règles internes"),
    item("operational_step", "Avant tout soin ou médicament, vérifier protocole, ordonnance, autorisation écrite, produit fourni, identité, modalités et explication préalable"),
    item("operational_step", "Inscrire immédiatement chaque soin ou traitement dans le registre avec enfant, date, heure, professionnel, médicament et posologie prescrite"),
    item("operational_step", "En cas de symptôme ou accident, appliquer le protocole sans diagnostic improvisé puis informer les interlocuteurs prévus"),
    item("recurring_control", "Contrôler chaque jour températures de conservation requises, dates, étiquetage, stocks d’hygiène, trousses et médicaments individuels"),
  ],
  activities: [
    item("implementation_action", "Planifier des activités adaptées à l’âge, au développement, aux besoins observés, à l’inclusion et au projet pédagogique"),
    item("operational_step", "Préparer espace, matériel, effectif, professionnel responsable, risques, nettoyage et solution de repli avant l’activité"),
    item("operational_step", "Pour toute sortie, établir liste des enfants, autorisations, trajet, contacts, trousse, rôles et encadrement requis"),
    item("operational_step", "Adapter ou arrêter l’activité dès qu’un enfant montre fatigue, inconfort, retrait, surstimulation ou besoin de soin"),
    item("implementation_action", "Préparer pour absence, panne, chaleur, froid ou indisponibilité d’espace une activité et une organisation de remplacement sûres"),
    item("operating_rule", "Ne pas exposer les enfants de moins de trois ans à un écran, même en fond sonore, pendant l’accueil"),
  ],
  team: [
    item("implementation_action", "Tenir pour chaque salarié et intervenant fonction, diplôme, expérience, contrat, visite requise, honorabilité, formations et échéances"),
    item("operational_step", "Construire le planning à partir des enfants prévus, des amplitudes, des ratios choisis, des qualifications et des temps dédiés hors encadrement"),
    item("operational_step", "Recalculer à chaque absence enfants présents, professionnels auprès d’eux, présence minimale et solution de remplacement"),
    item("operational_step", "Accueillir chaque remplaçant avec section, enfants, PAI utiles, protocoles, urgences, transmissions, accès et limites de fonction"),
    item("recurring_control", "Contrôler quotidiennement que le nombre et la qualification des professionnels présents correspondent à l’accueil réel"),
    item("recurring_control", "Programmer formations, analyse de pratiques, exercices, réunions, référent Santé et Accueil inclusif et suivi des actions convenues"),
  ],
  billing: [
    item("implementation_action", "Paramétrer chaque contrat avec période, jours, horaires, volume, tarif, ressources retenues, aides, adaptation, absences et préavis"),
    item("operational_step", "Rapprocher avant facturation contrat, avenants, présences, absences, fermetures, heures complémentaires et justificatifs"),
    item("operational_step", "Émettre une facture lisible avec période, quantité, tarif, déductions, aides, régularisation, paiement et contact de contestation"),
    item("operational_step", "Traiter tout écart en corrigeant la donnée source puis en émettant avoir ou régularisation traçable"),
    item("recurring_control", "Rapprocher chaque mois factures, encaissements, impayés, aides attendues, données déclarées et compte bancaire"),
    item("operating_rule", "Ne pas modifier rétroactivement un contrat, une présence ou une ressource sans pièce, motif et validation conservés"),
  ],
  payables: [
    item("implementation_action", "Définir seuils de commande et validation pour repas, couches, hygiène, jeux, entretien, maintenance, formation et remplacement"),
    item("operational_step", "Vérifier avant commande besoin, stock, budget, fournisseur, conformité du produit, délai et personne qui réceptionne"),
    item("operational_step", "À réception, contrôler quantité, état, lot ou péremption utile, stockage, bon de livraison et écart au devis"),
    item("operational_step", "Rattacher chaque facture à la commande et à la réception avant validation du paiement"),
    item("recurring_control", "Préparer chaque semaine paie, fournisseurs, loyers, assurances, organismes sociaux et contrats arrivant à échéance"),
    item("operating_rule", "La personne qui commande ou bénéficie d’une dépense ne doit pas être seule à la valider et à la payer"),
  ],
  compliance: [
    item("implementation_action", "Centraliser autorisation départementale, avis requis, projet d’établissement, règlement, assurance, plans, conventions et échanges PMI"),
    item("implementation_action", "Tenir à jour les protocoles urgences, hygiène, épidémie, soins, maltraitance, sorties, mise en sûreté et continuité"),
    item("implementation_action", "Formaliser l’intervention du référent Santé et Accueil inclusif, ses heures, actions, conseils, PAI suivis et échanges utiles"),
    item("operational_step", "Déclarer sans délai à l’autorité compétente tout décès ou accident d’un enfant ayant entraîné une hospitalisation et conserver la preuve"),
    item("operational_step", "Préparer chaque modification de capacité, locaux, gestionnaire, direction ou fonctionnement avec les demandes et délais applicables"),
    item("recurring_control", "Auditer chaque mois dossiers enfants, registres, ratios, qualifications, honorabilité, protocoles, exercices, incidents et actions correctives"),
    item("operating_rule", "Ne jamais antidater, reconstituer sans mention ni masquer une présence, un soin, un incident, une plainte ou une preuve réglementaire"),
  ],
};

export const crecheProfile: CrecheProfile = {
  slug: "creche",
  name: "Crèche",
  sourceUrl:
    "https://docs.google.com/spreadsheets/d/154J4Mb0tkJRZbSmV6qc-mF6lZUFUYqeHZvVnbBwVQbc/edit",
  researchSources: [
    "https://www.legifrance.gouv.fr/codes/section_lc/LEGITEXT000006072665/LEGISCTA000006178555/",
    "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000051418530/",
    "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000043991519/",
    "https://solidarites.gouv.fr/mode-daccueil-du-jeune-enfant-outils-et-ressources",
    "https://solidarites.gouv.fr/tout-savoir-sur-le-referentiel-national-de-la-qualite-daccueil-du-jeune-enfant",
    "https://solidarites.gouv.fr/charte-nationale-pour-laccueil-du-jeune-enfant",
    "https://solidarites.gouv.fr/guide-surete-dans-les-etablissements-daccueil-du-jeune-enfant",
    "https://www.cnil.fr/fr/cnil-direct/question/creches-jardins-denfants-ecoles-maternelles-et-elementaires-que-faire",
  ],
  processCount: 12,
};

export function generateCrecheDraft(): ProcessDraft {
  return {
    definitionsById: Object.fromEntries(
      Object.entries(crecheProcesses).map(([role, processId]) => [
        processId,
        crecheDefinitions[role as keyof typeof crecheProcesses],
      ]),
    ),
    contentByProcessId: Object.fromEntries(
      Object.entries(crecheProcesses).map(([role, processId]) => [
        processId,
        crecheContent[role as keyof typeof crecheProcesses],
      ]),
    ),
  };
}
