import type {
  IndustrializedContentItem,
  IndustrializedProcessDefinition,
  ProcessDraft,
} from "@/lib/process-industrialization";

export type TextileCareProfile = {
  slug: "laverie-automatique" | "pressing";
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

const laundromatProcesses = {
  compliance:
    "process.laverie-automatique.conformite-metier.tenir-controles-et-affichages-en-regle",
  decisions:
    "process.laverie-automatique.direction.decider-sans-bloquer-lexploitation",
  strategy:
    "process.laverie-automatique.direction.savoir-ou-va-lactivite",
  team:
    "process.laverie-automatique.equipe.organiser-interventions-et-remplacements",
  payables: "process.laverie-automatique.finance-admin.payer-a-temps",
  finance:
    "process.laverie-automatique.finance-admin.suivre-encaissements-et-rentabilite",
  information:
    "process.laverie-automatique.marketing-vente.informer-et-rassurer-les-clients",
  complaints:
    "process.laverie-automatique.marketing-vente.traiter-un-incident-ou-une-reclamation-client",
  maintenance:
    "process.laverie-automatique.operations.gerer-paiements-pannes-et-maintenance",
  cleanliness:
    "process.laverie-automatique.operations.maintenir-proprete-et-securite",
  monitoring:
    "process.laverie-automatique.operations.surveiller-machines-et-consommables",
} as const;

const laundromatDefinitions: Record<
  keyof typeof laundromatProcesses,
  IndustrializedProcessDefinition
> = {
  compliance: def(
    "Tenir les déclarations de conformité, contrôles hebdomadaires, affichages et preuves de sécurité de la laverie.",
    "Ouverture, installation d’une machine, contrôle hebdomadaire, changement de tarif ou incident.",
    "Des machines utilisables en sécurité et des informations visibles par le public.",
    "Exploitant",
    "Hebdomadaire",
  ),
  decisions: def(
    "Arbitrer rapidement panne, danger, fermeture, remboursement ou remplacement.",
    "Alerte machine, défaut de sécurité, fuite, panne de paiement ou réclamation.",
    "Une mesure immédiate, une décision attribuée et une trace.",
    "Exploitant",
    "À chaque alerte",
  ),
  strategy: def(
    "Adapter parc, horaires, tarifs et capacité à la fréquentation et aux coûts.",
    "Revue mensuelle, nouvelle machine ou variation importante de l’activité.",
    "Une laverie disponible, lisible et rentable.",
    "Exploitant",
    "Mensuelle",
  ),
  team: def(
    "Coordonner rondes, nettoyage, maintenance et astreinte sans laisser le site sans relais.",
    "Planning, absence, panne, alerte ou intervention technique.",
    "Chaque intervention critique a un responsable et un remplaçant.",
    "Exploitant",
    "Hebdomadaire",
  ),
  payables: def(
    "Payer les charges et prestataires justifiés sans manquer une échéance critique.",
    "Facture, contrat, prélèvement, intervention ou litige.",
    "Une dépense contrôlée et affectée au bon site ou équipement.",
    "Responsable administratif",
    "Hebdomadaire",
  ),
  finance: def(
    "Rapprocher paiements machines, remboursements, coûts et rentabilité du parc.",
    "Clôture, écart de caisse, panne de paiement ou facture importante.",
    "Des encaissements expliqués et une marge suivie par machine ou service.",
    "Exploitant",
    "Hebdomadaire",
  ),
  information: def(
    "Donner au client les tarifs, consignes, disponibilités et moyens d’assistance utiles.",
    "Ouverture, changement de tarif, panne, fermeture ou question client.",
    "Une information visible, exacte et à jour sur place et en ligne.",
    "Exploitant",
    "À chaque changement",
  ),
  complaints: def(
    "Traiter remboursement, linge bloqué, dommage ou objet oublié à partir de faits vérifiés.",
    "Appel, message, avis, incident ou contestation de paiement.",
    "Une réponse, une décision et une action corrective tracées.",
    "Exploitant",
    "À chaque réclamation",
  ),
  maintenance: def(
    "Diagnostiquer et remettre en service les équipements sans exposer les utilisateurs.",
    "Code erreur, arrêt, bruit, fuite, chauffe, porte, paiement ou signalement.",
    "Une machine isolée, réparée, testée puis remise en service.",
    "Technicien référent",
    "À chaque panne",
  ),
  cleanliness: def(
    "Maintenir un local propre, dégagé et sûr pendant toute l’amplitude d’ouverture.",
    "Ronde, salissure, fuite, déchet, dégradation ou alerte sécurité.",
    "Un site accueillant sans danger ni obstacle.",
    "Prestataire de ronde",
    "Quotidienne",
  ),
  monitoring: def(
    "Surveiller disponibilité, cycles, consommables et anomalies avant la rupture de service.",
    "Ronde, alerte distante, baisse d’usage ou seuil de stock.",
    "Un parc disponible avec les consommables nécessaires.",
    "Exploitant",
    "Quotidienne",
  ),
};

const laundromatContent: Record<
  keyof typeof laundromatProcesses,
  IndustrializedContentItem[]
> = {
  compliance: [
    item("implementation_action", "Inventorier lave-linge, essoreuses, séchoirs, chauffe-eau, centrale de paiement, distributeurs, numéros de série et déclarations de conformité"),
    item("implementation_action", "Créer le registre hebdomadaire des dispositifs de verrouillage, arrêt complet, porte ou couvercle et observations par machine"),
    item("operational_step", "Tester chaque semaine qu’aucun cycle ne démarre porte ouverte et qu’aucune porte ne s’ouvre avant l’arrêt des parties mobiles"),
    item("implementation_action", "Afficher à l’extérieur et à l’intérieur tous les prix, suppléments, consignes obligatoires, avertissements, logo de surveillance parentale et téléphone d’assistance"),
    item("operational_step", "Conserver contrats, contrôles, interventions, assurances, conformité électrique ou gaz, sécurité incendie et documents du local"),
    item("recurring_control", "Contrôler chaque mois affichages, registre, déclarations machine, moyens de secours, éclairage, ventilation, évacuations et corrections"),
    item("operating_rule", "Condamner immédiatement toute machine dont le verrouillage, l’arrêt, la température, l’alimentation ou la stabilité présente un doute"),
  ],
  decisions: [
    item("implementation_action", "Écrire les seuils d’arrêt pour fuite, odeur, fumée, surchauffe, vibration, porte, tambour, alimentation, paiement et dégradation"),
    item("operational_step", "Qualifier l’alerte avec site, machine, heure, cycle, paiement, code erreur, danger, client présent et preuve disponible"),
    item("operational_step", "Couper, baliser, fermer la machine ou le local et prévenir les secours lorsque la sécurité l’exige"),
    item("operational_step", "Décider dépannage à distance, intervention, remboursement, transfert vers une autre machine, fermeture ou remplacement"),
    item("recurring_control", "Revoir chaque jour machines isolées, clients à rappeler, remboursements, interventions et délais de remise en service"),
    item("operating_rule", "Ne jamais demander à un client de forcer une porte, démonter un élément ou poursuivre un cycle manifestement anormal"),
  ],
  strategy: [
    item("implementation_action", "Cartographier zone, clientèle, amplitudes, capacités de lavage et séchage, formats de machines, services, concurrence et saisonnalité"),
    item("implementation_action", "Fixer objectifs de fréquentation, cycles, panier, disponibilité, délai de dépannage, consommation, satisfaction et marge"),
    item("operational_step", "Comparer tout ajout ou remplacement de machine aux usages, arrivées électriques, eau, évacuation, ventilation, espace et maintenance"),
    item("recurring_control", "Comparer chaque semaine cycles, files d’attente, indisponibilités, remboursements et capacité restante par tranche horaire"),
    item("recurring_control", "Comparer chaque mois chiffre, énergie, eau, maintenance, lessive, loyer, incidents et marge par machine"),
    item("operational_step", "Planifier renouvellement des machines à partir des pannes, coûts, pièces, rendement, consommation et manque à gagner"),
    item("operating_rule", "Ne pas augmenter l’amplitude ou le parc si les rondes, l’assistance, la sécurité et la maintenance ne suivent pas"),
  ],
  team: [
    item("implementation_action", "Tenir la liste des responsables de ronde, nettoyage, remboursement, paiement, technique, ouverture, fermeture et urgence"),
    item("operational_step", "Planifier les rondes selon affluence, incidents, réassort, propreté, collecte et contraintes du site"),
    item("operational_step", "Transmettre au remplaçant codes autorisés, machines isolées, remboursements, stocks, contacts et limites d’intervention"),
    item("operational_step", "Vérifier avant intervention les compétences électriques, gaz, plomberie ou froid réellement nécessaires"),
    item("recurring_control", "Contrôler chaque semaine rondes réalisées, alertes sans réponse, prestataires indisponibles et astreintes non couvertes"),
    item("implementation_action", "Formaliser l’accueil indirect : décroché téléphonique, délai de rappel, message de fermeture et solution de remboursement"),
    item("operating_rule", "Ne pas donner un accès technique, une clé ou un code d’alarme à un intervenant non identifié et non autorisé"),
  ],
  payables: [
    item("implementation_action", "Créer l’échéancier du loyer, énergie, eau, télécom, assurance, maintenance, nettoyage, monétique, consommables et taxes"),
    item("operational_step", "Rapprocher contrat, machine ou site, intervention reçue, facture, pièce remplacée, garantie et échéance"),
    item("operational_step", "Contrôler les factures d’énergie et d’eau avec index, période, tarifs et évolution des cycles"),
    item("recurring_control", "Revoir chaque semaine factures, prélèvements, doublons, litiges prestataires et trésorerie disponible"),
    item("recurring_control", "Vérifier chaque mois abonnements inutilisés, contrats reconduits, pièces sous garantie et coûts de dépannage récurrents"),
    item("operating_rule", "Ne pas payer une intervention sans machine identifiée, diagnostic, action réalisée, test de sortie et justificatif"),
  ],
  finance: [
    item("implementation_action", "Référencer chaque machine et moyen de paiement avec tarif, cycle, identifiant monétique, compte, commission et preuve de vente"),
    item("operational_step", "Rapprocher espèces, carte, application ou jetons avec cycles lancés, relevés, commissions, collectes et dépôts"),
    item("operational_step", "Tracer chaque remboursement avec client, machine, heure, paiement initial, motif, preuve, montant et mode de restitution"),
    item("recurring_control", "Contrôler chaque semaine écarts entre cycles, encaissements, centrale de paiement, caisse, remboursements et banque"),
    item("recurring_control", "Calculer chaque mois chiffre, eau, énergie, lessive, maintenance, commissions et marge par machine"),
    item("operational_step", "Identifier perte de revenu liée aux pannes avec durée, cycles habituels, solution et date de remise en service"),
    item("operating_rule", "Ne pas valider un chiffre de laverie sans rapprocher les différents moyens de paiement et les machines actives"),
  ],
  information: [
    item("implementation_action", "Afficher horaires, accès, tarifs TTC, durée indicative, capacité, produits inclus, suppléments, consignes et téléphone joignable"),
    item("operational_step", "Signaler sur la machine et les canaux utiles toute indisponibilité avec alternative et délai réaliste"),
    item("operational_step", "Expliquer choix de capacité, dosage, température, tri, surcharge, vidage des poches et récupération rapide du linge"),
    item("implementation_action", "Tenir à jour fiche Google, téléphone, horaires exceptionnels, photos, services et réponses aux questions fréquentes"),
    item("recurring_control", "Vérifier chaque semaine lisibilité des prix, avertissements, numéros, modes d’emploi et autocollants machine"),
    item("recurring_control", "Analyser avis, appels et messages pour repérer machine, créneau, paiement ou consigne mal compris"),
    item("operating_rule", "Ne pas annoncer une machine disponible, un produit inclus ou un remboursement automatique si le dispositif ne le permet pas"),
  ],
  complaints: [
    item("implementation_action", "Créer le registre des incidents clients avec machine, cycle, heure, paiement, linge, faits, preuve, réponse et correction"),
    item("operational_step", "Accuser réception et demander uniquement les éléments nécessaires : référence paiement, photo, machine, heure et problème"),
    item("operational_step", "Comparer journal machine, centrale de paiement, vidéo si légalement disponible, ronde et intervention avant décision"),
    item("operational_step", "Répondre avec remboursement, refus motivé, récupération du linge, objet trouvé, assistance ou autre solution vérifiée"),
    item("recurring_control", "Analyser chaque mois réclamations par machine, paiement, cycle, horaire, cause, coût et récidive"),
    item("operating_rule", "Ne pas exposer publiquement les données, images, moyens de paiement ou habitudes d’un utilisateur dans une réponse à un avis"),
  ],
  maintenance: [
    item("implementation_action", "Créer la fiche technique de chaque lave-linge, séchoir, monnayeur et distributeur avec notices, garanties, pièces et contacts"),
    item("operational_step", "Isoler l’équipement et relever code erreur, symptômes, odeur, bruit, fuite, température, cycle, charge et dernier entretien"),
    item("operational_step", "Diagnostiquer alimentation, arrivée d’eau, évacuation, filtre, verrouillage, tambour, chauffe, ventilation ou paiement selon habilitation"),
    item("operational_step", "Déclencher le prestataire avec machine, urgence, pièces probables, accès, créneau et personne de contact"),
    item("operational_step", "Tester à vide puis en cycle contrôlé la sécurité, l’étanchéité, la chauffe, l’essorage, l’arrêt et le paiement"),
    item("recurring_control", "Revoir chaque mois pannes répétées, durée d’arrêt, coûts, pièces, garanties et décisions de remplacement"),
    item("operating_rule", "Ne remettre une machine en service qu’après test documenté et retrait complet du balisage d’indisponibilité"),
  ],
  cleanliness: [
    item("implementation_action", "Définir une ronde avec sols, portes, hublots, joints, bacs, filtres, tables, sièges, distributeurs, poubelles et sanitaires éventuels"),
    item("operational_step", "Retirer déchets et résidus sans mélanger objets trouvés, linge abandonné et produits dangereux"),
    item("operational_step", "Traiter immédiatement eau au sol, verre, aiguille, prise endommagée, issue encombrée, odeur ou dégradation"),
    item("operational_step", "Nettoyer les surfaces selon le produit, le dosage, le temps d’action et les précautions compatibles avec les machines"),
    item("recurring_control", "Tracer chaque ronde avec heure, état, photos utiles, anomalies, consommables, action et escalade"),
    item("recurring_control", "Contrôler périodiquement ventilation, éclairage, extincteurs, issues, signalétique et accessibilité du local"),
    item("operating_rule", "Ne pas laisser une zone glissante, une issue bloquée ou un équipement électrique exposé accessible au public"),
  ],
  monitoring: [
    item("implementation_action", "Créer le tableau de parc avec statut, dernier cycle, encaissement, alerte, nettoyage, maintenance et stock associé"),
    item("operational_step", "Vérifier à chaque ronde disponibilité, porte, tambour, filtre, odeur, fuite, chauffe, paiement et propreté de chaque machine"),
    item("operational_step", "Contrôler lessive, assouplissant, sacs, jetons, rouleaux, produits de nettoyage et pièces courantes selon seuils"),
    item("operational_step", "Comparer alertes distantes, cycles enregistrés et état réel avant de déclarer une machine disponible"),
    item("recurring_control", "Suivre chaque jour machines actives, isolées, en attente de pièce, en test et remises en service"),
    item("recurring_control", "Mesurer chaque semaine taux de disponibilité, pannes, temps moyen de reprise, ruptures et réassorts"),
    item("operating_rule", "Ne pas masquer une alerte récurrente par une simple remise à zéro sans diagnostic et action documentés"),
  ],
};

const pressingProcesses = {
  compliance:
    "process.pressing.conformite-metier.securiser-machines-produits-et-tracabilite",
  decisions: "process.pressing.direction.decider-sans-bloquer-latelier",
  strategy: "process.pressing.direction.savoir-ou-va-lactivite",
  team: "process.pressing.equipe.organiser-lequipe-et-les-remplacements",
  payables: "process.pressing.finance-admin.payer-a-temps",
  collections: "process.pressing.finance-admin.se-faire-payer",
  finance: "process.pressing.finance-admin.suivre-caisse-paniers-et-marge",
  loyalty: "process.pressing.marketing-vente.fideliser-les-clients",
  complaints:
    "process.pressing.marketing-vente.traiter-une-reclamation-client",
  deposit: "process.pressing.operations.enregistrer-le-depot-client",
  delivery: "process.pressing.operations.restituer-et-tracer-la-livraison",
  treatment: "process.pressing.operations.traiter-et-controler-les-pieces",
} as const;

const pressingDefinitions: Record<
  keyof typeof pressingProcesses,
  IndustrializedProcessDefinition
> = {
  compliance: def(
    "Sécuriser produits, procédés, machines, déchets, prix et traçabilité du pressing.",
    "Ouverture, nouveau produit, nouvelle machine, contrôle ou incident.",
    "Un atelier conforme avec des risques et preuves maîtrisés.",
    "Référent sécurité",
    "Mensuelle",
  ),
  decisions: def(
    "Arbitrer faisabilité, traitement, retard, reprise ou litige sans bloquer l’atelier.",
    "Doute textile, tache, surcharge, panne, retard ou contestation.",
    "Une décision motivée, attribuée et communiquée.",
    "Responsable d’atelier",
    "Quotidienne",
  ),
  strategy: def(
    "Choisir les prestations et capacités compatibles avec le parc, l’équipe et la marge.",
    "Revue mensuelle, nouveau service ou évolution de la demande.",
    "Un atelier chargé de manière soutenable et rentable.",
    "Dirigeant",
    "Mensuelle",
  ),
  team: def(
    "Organiser accueil, diagnostic, détachage, nettoyage, finition et restitution avec des relais compétents.",
    "Planning, absence, pic de dépôts ou nouvelle technique.",
    "Chaque poste critique est couvert avec des consignes comprises.",
    "Responsable d’atelier",
    "Hebdomadaire",
  ),
  payables: def(
    "Payer les produits, charges et prestataires justifiés à la bonne échéance.",
    "Facture, contrat, livraison, prélèvement ou litige.",
    "Une dépense contrôlée et affectée au bon usage.",
    "Responsable administratif",
    "Hebdomadaire",
  ),
  collections: def(
    "Encaisser les prestations et récupérer les sommes dues avec une preuve claire.",
    "Dépôt, acompte, retrait, compte professionnel ou impayé.",
    "Un paiement rapproché ou une relance documentée.",
    "Responsable accueil",
    "Quotidienne",
  ),
  finance: def(
    "Suivre caisse, panier, coûts de traitement et marge par prestation.",
    "Clôture caisse, remise, remboursement ou revue d’activité.",
    "Des revenus expliqués par ticket et type de traitement.",
    "Dirigeant",
    "Hebdomadaire",
  ),
  loyalty: def(
    "Faire revenir les clients grâce à une qualité, un délai et une communication fiables.",
    "Restitution, campagne locale, client inactif ou demande professionnelle.",
    "Une relation suivie sans sollicitation excessive.",
    "Responsable commercial",
    "Hebdomadaire",
  ),
  complaints: def(
    "Traiter retard, tache, dommage, perte ou désaccord à partir du dépôt tracé.",
    "Réclamation, anomalie avant restitution ou contestation.",
    "Une réponse factuelle, une solution et une prévention.",
    "Responsable d’atelier",
    "À chaque réclamation",
  ),
  deposit: def(
    "Identifier chaque pièce, son état, ses risques et le traitement convenu avant prise en charge.",
    "Dépôt client, collecte ou commande professionnelle.",
    "Un ticket complet reliant client, pièces, état, prix et délai.",
    "Responsable accueil",
    "À chaque dépôt",
  ),
  delivery: def(
    "Restituer les bonnes pièces, contrôlées, payées et traçables.",
    "Fin de traitement, retrait, livraison ou pièce non récupérée.",
    "Une remise vérifiée avec preuve et dossier clôturé.",
    "Responsable accueil",
    "À chaque restitution",
  ),
  treatment: def(
    "Traiter chaque textile avec le procédé adapté puis contrôler le résultat.",
    "Pièce acceptée, tache, étiquette, lot ou reprise.",
    "Une pièce nettoyée, finie et contrôlée selon les consignes.",
    "Responsable d’atelier",
    "À chaque pièce",
  ),
};

const pressingContent: Record<
  keyof typeof pressingProcesses,
  IndustrializedContentItem[]
> = {
  compliance: [
    item("implementation_action", "Inventorier machines, procédés, solvants, lessives, détachants, FDS, protections, ventilation, contrôles, maintenance et déchets du pressing"),
    item("implementation_action", "Vérifier le classement et les prescriptions ICPE applicables aux procédés utilisant des solvants ainsi que les déclarations ou contrôles requis"),
    item("operational_step", "Évaluer les risques par poste : réception, tri, détachage, chargement, déchargement, repassage, finition, stockage et déchets"),
    item("implementation_action", "Afficher prix TTC, suppléments, délais, conditions, médiateur et informations client de façon visible avant le dépôt"),
    item("operational_step", "Tenir registres des produits, consommations, entretiens, contrôles, incidents, déchets dangereux et prestataires autorisés"),
    item("recurring_control", "Contrôler chaque mois ventilation, fuites, stockages, FDS, EPI, moyens incendie, étiquetage, déchets et actions ouvertes"),
    item("operating_rule", "Ne jamais utiliser un produit ou procédé non évalué, non identifié ou incompatible avec la machine, le textile et les protections disponibles"),
  ],
  decisions: [
    item("implementation_action", "Écrire les seuils d’acceptation, réserve, essai, sous-traitance, refus, reprise, indemnisation et arrêt d’une machine"),
    item("operational_step", "Qualifier la décision avec matière, couleur, garniture, tache, étiquette, usure, valeur déclarée, procédé, délai et risque"),
    item("operational_step", "Isoler une pièce ou un lot en cas de transfert de couleur, odeur, dommage, mélange, erreur d’étiquette ou résultat incertain"),
    item("operational_step", "Arbitrer traitement alternatif, test discret, délai supplémentaire, sous-traitance, retour en l’état ou refus motivé"),
    item("recurring_control", "Revoir chaque jour pièces bloquées, retards, reprises, clients à prévenir, litiges et machines indisponibles"),
    item("operating_rule", "Ne pas lancer un traitement risqué sans réserve expliquée, accord utile et identification durable de la pièce"),
  ],
  strategy: [
    item("implementation_action", "Choisir clientèles, services, textiles acceptés, procédés, délais, sous-traitance, collecte, livraison et zone prioritaires"),
    item("implementation_action", "Fixer objectifs de dépôts, panier, délai tenu, reprises, fidélisation, chiffre, productivité et marge"),
    item("operational_step", "Comparer toute nouvelle prestation aux machines, produits, compétences, capacité, risques, délai et coût complet"),
    item("recurring_control", "Comparer chaque semaine dépôts, charge par poste, retards, pièces prêtes, reprises et capacité restante"),
    item("recurring_control", "Comparer chaque mois chiffre, panier, consommations, temps, sous-traitance, litiges et marge par prestation"),
    item("operating_rule", "Ne pas promettre un délai ou accepter un textile si le procédé, la capacité ou le niveau de risque ne sont pas maîtrisés"),
  ],
  team: [
    item("implementation_action", "Cartographier accueil, diagnostic textile, détachage, nettoyage, repassage, finition, contrôle, caisse et remplaçants"),
    item("operational_step", "Planifier la charge selon volumes, procédés, urgences, temps machine, séchage, finition et délais promis"),
    item("operational_step", "Vérifier les compétences et consignes avant d’affecter un salarié à un produit, une machine ou un textile sensible"),
    item("operational_step", "Transmettre au remplaçant pièces à risque, réserves, lots, retards, réglages interdits et personnes à joindre"),
    item("recurring_control", "Contrôler chaque semaine absences, surcharge, postes non couverts, formation, EPI et écarts aux consignes"),
    item("operating_rule", "Ne pas laisser une personne non formée modifier un dosage, un programme, une température ou un réglage de sécurité"),
  ],
  payables: [
    item("implementation_action", "Créer l’échéancier du loyer, énergie, eau, produits, emballages, machines, maintenance, déchets, assurance, logiciel et sous-traitance"),
    item("operational_step", "Rapprocher commande, lot reçu, FDS, quantité, facture, avoir, affectation et échéance"),
    item("operational_step", "Contrôler les factures de sous-traitance avec pièces confiées, service, retour, qualité, perte et délai"),
    item("recurring_control", "Revoir chaque semaine factures, prélèvements, doublons, litiges, crédits fournisseurs et trésorerie"),
    item("recurring_control", "Comparer chaque mois prix, consommation réelle, pertes, stock et coût par cycle ou prestation"),
    item("operating_rule", "Ne pas payer un produit, une pièce ou une intervention sans réception, compatibilité, quantité et usage identifiables"),
  ],
  collections: [
    item("implementation_action", "Définir les règles de paiement au dépôt, à la restitution, sur compte professionnel, par acompte et pour les suppléments acceptés"),
    item("operational_step", "Relier ticket, client, pièces, prestations, remise, acompte, solde et moyen de paiement"),
    item("operational_step", "Vérifier le règlement ou l’autorisation prévue avant restitution ou livraison des pièces"),
    item("operational_step", "Relancer un compte professionnel avec factures, bons de dépôt, restitutions, échéance et interlocuteur"),
    item("recurring_control", "Contrôler chaque jour soldes, impayés, remboursements, avoirs, écarts et pièces retenues en attente"),
    item("operating_rule", "Ne pas ajouter un supplément non annoncé ni réclamer un montant qui ne correspond pas au ticket et au service accepté"),
  ],
  finance: [
    item("implementation_action", "Paramétrer la caisse avec prestations, catégories de pièces, suppléments, remises, taxes, reprises, remboursements et sous-traitance"),
    item("operational_step", "Rapprocher tickets, dépôts, restitutions, espèces, carte, comptes clients, avoirs et banque"),
    item("operational_step", "Tracer chaque remboursement ou geste avec pièce, ticket, motif, décision, montant et mode de règlement"),
    item("recurring_control", "Contrôler chaque jour caisse théorique, caisse réelle, annulations, remises, tickets ouverts et paiements différés"),
    item("recurring_control", "Calculer chaque mois chiffre, panier, produit, énergie, temps, reprise, sous-traitance et marge par prestation"),
    item("operating_rule", "Ne pas mesurer la rentabilité du pressing sur le chiffre seul sans intégrer temps atelier, produits, reprises et sous-traitance"),
  ],
  loyalty: [
    item("implementation_action", "Définir les segments particuliers, professionnels, hôtellerie, restauration, cérémonies et services récurrents pertinents"),
    item("operational_step", "Informer le client dès qu’une pièce est prête, retardée ou nécessite son accord sur une nouvelle option"),
    item("operational_step", "Demander un avis après une restitution conforme et répondre aux retours avec le numéro de ticket en interne"),
    item("operational_step", "Relancer les pièces prêtes non retirées avec date, horaires, montant et moyen de contact choisi"),
    item("recurring_control", "Mesurer chaque mois retour client, fréquence, panier, avis, reprises, inactifs et origine des nouveaux dépôts"),
    item("operating_rule", "Ne pas utiliser les coordonnées du ticket pour des campagnes non prévues sans base légale ni possibilité simple d’opposition"),
  ],
  complaints: [
    item("implementation_action", "Créer le registre des litiges avec ticket, pièce, état au dépôt, réserve, traitement, contrôles, photos, réponse et solution"),
    item("operational_step", "Accuser réception et isoler la pièce, les étiquettes, les produits et les données machine utiles à l’analyse"),
    item("operational_step", "Comparer état initial, composition, entretien, tache, programme, lot, opérateur, contrôle final et conditions de remise"),
    item("operational_step", "Décider reprise, expertise, réparation, remboursement, indemnisation, refus motivé ou médiation avec preuve écrite"),
    item("recurring_control", "Analyser chaque mois dommages, pertes, retards et reprises par textile, procédé, machine, opérateur et cause"),
    item("operating_rule", "Ne pas modifier le ticket, la réserve, une photo ou la traçabilité après l’ouverture d’un litige"),
  ],
  deposit: [
    item("implementation_action", "Créer le ticket de dépôt avec client, contact, nombre de pièces, identifiant unique, prestation, prix, délai et paiement"),
    item("operational_step", "Examiner chaque pièce à la lumière avec matière, couleur, doublure, ornements, fermeture, poches, usure, déchirure et taches"),
    item("operational_step", "Lire composition et symboles d’entretien puis signaler toute absence, incohérence ou restriction"),
    item("operational_step", "Photographier uniquement les zones utiles et noter réserves, objets retirés, valeur particulière déclarée et demande client"),
    item("operational_step", "Étiqueter chaque pièce sans l’endommager et vérifier la correspondance avec le ticket avant séparation du client"),
    item("recurring_control", "Contrôler chaque dépôt sensible ou volumineux avec un second regard avant mise en production"),
    item("operating_rule", "Refuser ou soumettre à accord explicite toute pièce dont l’identification, l’état ou le traitement raisonnable ne peut pas être sécurisé"),
  ],
  delivery: [
    item("implementation_action", "Organiser la zone des pièces prêtes par ticket, date, client, paiement, livraison et conditions de conservation"),
    item("operational_step", "Vérifier identité ou justificatif de retrait, ticket, nombre de pièces, étiquettes, qualité, housses et accessoires"),
    item("operational_step", "Présenter au client les réserves restantes, reprises effectuées, conseils utiles et montant encore dû"),
    item("operational_step", "Tracer retrait ou livraison avec date, personne, pièces remises, paiement et éventuelle observation"),
    item("recurring_control", "Relancer les pièces non retirées selon une cadence documentée et surveiller saturation ou durée de stockage"),
    item("operating_rule", "Ne pas remettre une pièce sans correspondance certaine entre client, ticket, étiquette et paiement prévu"),
  ],
  treatment: [
    item("implementation_action", "Définir les gammes par textile et tache avec pré-brossage, détachage, nettoyage à sec, aquanettoyage, lavage, séchage, repassage et finition"),
    item("operational_step", "Trier les pièces par procédé, couleur, fragilité, niveau de salissure, compatibilité et risque de transfert"),
    item("operational_step", "Choisir produit, dosage, programme, température, action mécanique et charge selon étiquette, test et procédure"),
    item("operational_step", "Tracer machine, cycle, opérateur, produit, lot et anomalie pour les pièces nécessitant un suivi renforcé"),
    item("recurring_control", "Contrôler avant mise à disposition taches, odeur, couleur, forme, repassage, boutons, fermetures, étiquette et nombre de pièces"),
    item("operating_rule", "Mettre toute pièce non conforme en reprise ou décision, jamais directement en zone de restitution"),
  ],
};

function draftFrom<
  T extends Record<string, string>,
>(
  processes: T,
  definitions: Record<keyof T, IndustrializedProcessDefinition>,
  content: Record<keyof T, IndustrializedContentItem[]>,
): ProcessDraft {
  return {
    definitionsById: Object.fromEntries(
      Object.entries(processes).map(([role, processId]) => [
        processId,
        definitions[role as keyof T],
      ]),
    ),
    contentByProcessId: Object.fromEntries(
      Object.entries(processes).map(([role, processId]) => [
        processId,
        content[role as keyof T],
      ]),
    ),
  };
}

export const textileCareProfiles = {
  "laverie-automatique": {
    slug: "laverie-automatique",
    name: "Laverie automatique",
    sourceUrl:
      "https://docs.google.com/spreadsheets/d/10OtpjlnwgKjctMNtyZ4dKEw2BXz36Em-BCdd9jyCSmc/edit",
    researchSources: [
      "https://www.economie.gouv.fr/dgccrf/les-fiches-pratiques/laverie-automatique",
      "https://www.economie.gouv.fr/dgccrf/les-fiches-pratiques/linformation-sur-les-prix",
      "https://www.legifrance.gouv.fr/loda/id/JORFTEXT000025582566",
      "https://www.legifrance.gouv.fr/loda/id/JORFTEXT000000863040",
      "https://entreprendre.service-public.fr/vosdroits/F31684",
    ],
    processCount: 11,
  },
  pressing: {
    slug: "pressing",
    name: "Pressing",
    sourceUrl:
      "https://docs.google.com/spreadsheets/d/1yUD0mdaRj3DpVmPhgmCWVTWNmqo2AP3-NfSt4OaLfGI/edit",
    researchSources: [
      "https://www.legifrance.gouv.fr/loda/id/JORFTEXT000021030687/",
      "https://www.legifrance.gouv.fr/circulaire/id/37393",
      "https://www.inrs.fr/media.html?refINRS=ED+6308",
      "https://www.inrs.fr/media.html?refINRS=FAS+2",
      "https://www.economie.gouv.fr/dgccrf/les-fiches-pratiques/linformation-sur-les-prix",
      "https://www.economie.gouv.fr/dgccrf/les-fiches-pratiques/comment-regler-un-litige-de-la-consommation",
      "https://entreprendre.service-public.fr/vosdroits/F37825",
    ],
    processCount: 12,
  },
} satisfies Record<string, TextileCareProfile>;

export function generateTextileCareDraft(
  profile: TextileCareProfile,
): ProcessDraft {
  if (profile.slug === "laverie-automatique") {
    return draftFrom(
      laundromatProcesses,
      laundromatDefinitions,
      laundromatContent,
    );
  }

  return draftFrom(pressingProcesses, pressingDefinitions, pressingContent);
}
