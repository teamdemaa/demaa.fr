import type {
  IndustrializedContentItem,
  IndustrializedProcessDefinition,
  ProcessDraft,
} from "@/lib/process-industrialization";

export type HospitalityEventsProfile = {
  slug: "evenementiel" | "hotel-hebergement-independant";
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

const eventProcesses = {
  compliance:
    "process.event-prestataires.conformite-metier.securiser-contrats-et-assurances",
  decisions:
    "process.event-prestataires.direction.decider-sans-bloquer-les-evenements",
  access:
    "process.event-prestataires.direction.donner-acces-a-lessentiel",
  strategy:
    "process.event-prestataires.direction.savoir-ou-va-lactivite",
  team:
    "process.event-prestataires.equipe.organiser-lequipe-et-les-remplacements",
  payables: "process.event-prestataires.finance-admin.se-faire-payer",
  finance:
    "process.event-prestataires.finance-admin.suivre-marge-acomptes-et-reglements",
  qualification:
    "process.event-prestataires.marketing-vente.qualifier-le-brief-et-le-budget",
  complaints:
    "process.event-prestataires.marketing-vente.traiter-une-reclamation-client",
  sales:
    "process.event-prestataires.marketing-vente.vendre-une-prestation-evenementielle",
  closure:
    "process.event-prestataires.operations.cloturer-faire-le-bilan-et-relancer",
  dayOf:
    "process.event-prestataires.operations.piloter-le-jour-j-et-les-imprevus",
  preparation:
    "process.event-prestataires.operations.preparer-planning-prestataires-et-logistique",
} as const;

const eventDefinitions: Record<
  keyof typeof eventProcesses,
  IndustrializedProcessDefinition
> = {
  compliance: def(
    "Sécuriser le contrat, le lieu, les assurances, les autorisations et les intervenants de chaque événement.",
    "Nouveau dossier, changement de lieu, public, programme, installation ou prestataire.",
    "Un dossier autorisé, assuré et exploitable avec les preuves disponibles.",
    "Chef de projet événementiel",
    "À chaque événement",
  ),
  decisions: def(
    "Arbitrer les écarts de budget, délai, qualité et sécurité sans bloquer la production.",
    "Alerte, retard, indisponibilité, demande client ou incident.",
    "Une mesure immédiate, une décision attribuée et une trace.",
    "Directeur de production",
    "À chaque alerte",
  ),
  access: def(
    "Donner à chaque intervenant uniquement les accès, informations et contacts nécessaires.",
    "Démarrage, arrivée d’un prestataire, remplacement ou changement de site.",
    "Des accès nominatifs, limités et retirés à temps.",
    "Chef de projet événementiel",
    "À chaque événement",
  ),
  strategy: def(
    "Choisir les formats, clients et capacités qui soutiennent une activité événementielle rentable.",
    "Revue mensuelle, saison, nouvelle offre ou variation de charge.",
    "Un portefeuille compatible avec l’équipe, les partenaires et la marge attendue.",
    "Dirigeant",
    "Mensuelle",
  ),
  team: def(
    "Couvrir chaque fonction avant, pendant et après l’événement avec un relais identifié.",
    "Planning, absence, nouveau prestataire, changement de programme ou pic de charge.",
    "Une équipe briefée avec des responsabilités et remplacements clairs.",
    "Directeur de production",
    "À chaque événement",
  ),
  payables: def(
    "Encaisser les sommes dues selon les jalons contractuels sans laisser démarrer un dossier non sécurisé.",
    "Signature, acompte, jalon, solde, supplément ou retard de paiement.",
    "Des encaissements suivis et des relances fondées sur les pièces contractuelles.",
    "Responsable administratif",
    "Hebdomadaire",
  ),
  finance: def(
    "Piloter budget engagé, reste à engager, trésorerie et marge finale par événement.",
    "Devis accepté, commande, facture, changement, clôture ou revue de portefeuille.",
    "Une marge prévisionnelle et réelle expliquée par dossier.",
    "Chef de projet événementiel",
    "Hebdomadaire",
  ),
  qualification: def(
    "Transformer une demande en brief complet, faisable et chiffrable.",
    "Demande entrante, appel découverte, visite ou modification majeure.",
    "Un brief validé avec budget, contraintes et décideurs identifiés.",
    "Responsable commercial",
    "À chaque demande",
  ),
  complaints: def(
    "Traiter une réclamation à partir du contrat, du déroulé et des preuves du projet.",
    "Insatisfaction, contestation, dommage, retard ou écart de prestation.",
    "Une réponse écrite, une solution et une prévention tracées.",
    "Chef de projet événementiel",
    "À chaque réclamation",
  ),
  sales: def(
    "Faire accepter un périmètre événementiel précis, réalisable et correctement protégé.",
    "Proposition, négociation, changement de périmètre ou signature.",
    "Un contrat signé avec prix, livrables, exclusions et conditions compris.",
    "Responsable commercial",
    "À chaque vente",
  ),
  closure: def(
    "Clore opérationnellement et financièrement l’événement puis exploiter le retour client.",
    "Fin de démontage, livraison finale ou réception des dernières factures.",
    "Un dossier soldé, analysé et prêt pour la relance.",
    "Chef de projet événementiel",
    "À chaque événement",
  ),
  dayOf: def(
    "Coordonner le jour J, protéger le public et tenir les horaires malgré les imprévus.",
    "Ouverture du site, arrivée des équipes, exploitation ou incident.",
    "Un événement maîtrisé avec décisions et incidents tracés.",
    "Directeur de production",
    "Jour J",
  ),
  preparation: def(
    "Construire un rétroplanning qui relie lieu, prestataires, logistique, technique et validations.",
    "Signature, visite technique, modification ou approche d’un jalon.",
    "Toutes les dépendances critiques sont confirmées avant l’ouverture.",
    "Chef de projet événementiel",
    "À chaque événement",
  ),
};

const eventContent: Record<
  keyof typeof eventProcesses,
  IndustrializedContentItem[]
> = {
  compliance: [
    item("implementation_action", "Créer le dossier conformité par événement avec contrat client, assurance responsabilité civile, lieu, jauge, horaires, plans, risques et contacts"),
    item("operational_step", "Vérifier avec le lieu les règles ERP, issues, capacité, accessibilité, sécurité incendie, installations autorisées et responsabilités respectives"),
    item("operational_step", "Identifier et obtenir à temps les déclarations ou autorisations nécessaires pour voie publique, mairie, préfecture, musique, débit de boissons ou installation temporaire"),
    item("operational_step", "Collecter pour chaque prestataire critique devis signé, assurance, qualifications, plan d’intervention, contacts et sous-traitants déclarés"),
    item("recurring_control", "Contrôler avant montage que les versions valides des plans, attestations, autorisations, consignes et contrats sont accessibles hors ligne"),
    item("operating_rule", "Ne pas ouvrir au public tant qu’une exigence bloquante de capacité, sécurité, assurance ou autorisation reste sans preuve"),
  ],
  decisions: [
    item("implementation_action", "Définir les seuils d’escalade pour surcoût, retard, réduction de jauge, météo, panne, indisponibilité, danger et demande hors périmètre"),
    item("operational_step", "Qualifier chaque alerte avec impact public, sécurité, programme, client, budget, dépendances, heure limite et options disponibles"),
    item("operational_step", "Décider maintien, adaptation, remplacement, report, annulation ou arrêt partiel et nommer le responsable d’exécution"),
    item("operational_step", "Notifier immédiatement les personnes touchées avec décision, motif utile, nouvelle consigne et prochaine vérification"),
    item("recurring_control", "Revoir chaque jour les décisions ouvertes, hypothèses, surcoûts, validations client et mesures de repli"),
    item("operating_rule", "Ne jamais accepter oralement un changement qui modifie prix, délai, sécurité, jauge ou responsabilité sans confirmation écrite"),
  ],
  access: [
    item("implementation_action", "Créer la matrice des accès par rôle : dossier client, budget, fichiers techniques, badges, clés, zones, stockage et contacts sensibles"),
    item("operational_step", "Partager à chaque intervenant la version utile du conducteur, du plan, des horaires et des consignes sans exposer les données inutiles"),
    item("operational_step", "Attribuer badges, clés, codes et droits nominatifs avec heure d’activation, zone autorisée et restitution attendue"),
    item("recurring_control", "Contrôler avant ouverture les accès manquants, comptes partagés, documents obsolètes et personnes non annoncées"),
    item("operating_rule", "Retirer après démontage les accès numériques et physiques temporaires et ne pas réutiliser un badge non attribué"),
  ],
  strategy: [
    item("implementation_action", "Segmenter l’activité par format, client, taille, complexité, saison, zone, délai de préparation et niveau de sous-traitance"),
    item("implementation_action", "Fixer des objectifs de chiffre, marge, acompte encaissé, taux de transformation, respect budget, ponctualité, satisfaction et réachat"),
    item("operational_step", "Calculer la capacité simultanée selon chefs de projet, production, partenaires fiables, matériel et trésorerie mobilisable"),
    item("recurring_control", "Comparer chaque mois demandes, ventes, charge, incidents, marge et satisfaction par type d’événement"),
    item("operational_step", "Ajuster offres, prix planchers, zones servies, partenaires et délais minimum à partir des résultats observés"),
    item("operating_rule", "Ne pas vendre plus d’événements simultanés que la capacité de pilotage et les solutions de remplacement réellement disponibles"),
  ],
  team: [
    item("implementation_action", "Créer un organigramme par événement avec client, direction de production, régie, accueil, sécurité, technique, prestataires et remplaçants"),
    item("operational_step", "Construire les horaires individuels de montage, briefing, exploitation, pauses, relève et démontage"),
    item("operational_step", "Briefer chaque rôle sur mission, zone, livrable, limite de décision, risque principal, contact et solution de repli"),
    item("operational_step", "Vérifier compétences, habilitations, équipements et repos nécessaires avant d’affecter une tâche sensible"),
    item("recurring_control", "Contrôler à chaque jalon les absences, doubles affectations, fonctions non couvertes et prestataires sans interlocuteur"),
    item("operating_rule", "Ne pas confier accueil sensible, contrôle, sécurité, technique ou montage à une personne non formée ou non autorisée"),
  ],
  payables: [
    item("implementation_action", "Créer l’échéancier client avec acompte, jalons, solde, suppléments, pièces attendues et responsable de relance"),
    item("operational_step", "Émettre facture ou appel de fonds dès le jalon atteint et rapprocher le paiement du bon événement"),
    item("operational_step", "Relancer avant la date de blocage en rappelant contrat, montant, échéance et conséquence opérationnelle prévue"),
    item("recurring_control", "Contrôler chaque semaine acomptes non reçus, factures échues, avoirs, litiges et événements exposés"),
    item("operating_rule", "Ne pas engager les dépenses irréversibles prévues comme conditionnelles avant réception de l’acompte ou validation écrite autorisée"),
  ],
  finance: [
    item("implementation_action", "Créer un budget par événement avec vendu, options, achats, personnel, transport, location, sécurité, droits, imprévus et marge cible"),
    item("operational_step", "Enregistrer chaque devis fournisseur accepté comme engagement avant réception de la facture"),
    item("operational_step", "Mettre à jour après chaque changement le vendu, engagé, reste à engager, encaissements et marge prévisionnelle"),
    item("operational_step", "Faire valider tout dépassement avec cause, montant, solution de compensation et décision client ou interne"),
    item("recurring_control", "Comparer chaque semaine budget initial, dernier budget, trésorerie, factures manquantes et marge à risque"),
    item("operating_rule", "Ne pas présenter une marge finale tant que prestations, heures, transports, locations et suppléments ne sont pas rapprochés"),
  ],
  qualification: [
    item("implementation_action", "Créer le brief avec objectif, public, date, horaires, lieu, jauge, format, contenu, expérience attendue, budget et décideur"),
    item("operational_step", "Qualifier accès, montage, technique, restauration, sécurité, accessibilité, captation, musique, hébergement, transport et contraintes du site"),
    item("operational_step", "Identifier critères de choix, validations, personnes consultées, date de décision et processus d’achat du client"),
    item("operational_step", "Réaliser une visite ou demander plans, photos, règlement technique et contacts lorsque le lieu influence la faisabilité"),
    item("recurring_control", "Relire le brief avec production avant chiffrage pour repérer hypothèses, informations manquantes et risques non budgétés"),
    item("operating_rule", "Ne pas annoncer un prix ferme ou une disponibilité garantie tant que les dépendances critiques du brief ne sont pas qualifiées"),
  ],
  complaints: [
    item("implementation_action", "Créer le registre des réclamations avec événement, contrat, faits, chronologie, preuves, impact, demande et responsable de réponse"),
    item("operational_step", "Accuser réception, protéger les preuves et vérifier conducteur, messages, photos, feuilles de présence, livraisons et décisions"),
    item("operational_step", "Comparer la prestation réalisée au périmètre accepté, aux changements validés et aux responsabilités des parties"),
    item("operational_step", "Proposer reprise, correctif, geste, avoir, indemnisation, refus motivé ou médiation avec une réponse écrite"),
    item("operating_rule", "Ne jamais reconnaître une faute, promettre un remboursement ou altérer une preuve avant analyse et niveau d’autorisation approprié"),
  ],
  sales: [
    item("implementation_action", "Structurer l’offre avec concept, livrables, quantités, planning, responsabilités, hypothèses, exclusions et options"),
    item("operational_step", "Chiffrer achats, temps, logistique, technique, sécurité, droits, aléas et marge avant de fixer le prix"),
    item("operational_step", "Présenter le devis avec prix total, taxes, validité, paiement, annulation, report, modification, force majeure et propriété des livrables"),
    item("operational_step", "Vérifier avant signature la disponibilité du lieu, des ressources critiques et des prestataires déterminants"),
    item("recurring_control", "Relire tout contrat client qui déplace une responsabilité, impose une pénalité ou contredit le devis opérationnel"),
    item("operating_rule", "Ne démarrer la préparation qu’avec périmètre accepté, signataire autorisé et acompte conforme aux conditions convenues"),
  ],
  closure: [
    item("implementation_action", "Créer la checklist de clôture avec démontage, restitutions, livrables, preuves, factures, heures, incidents et remerciements"),
    item("operational_step", "Faire constater les restitutions du lieu et du matériel avec réserves, dommages, photos et signatures utiles"),
    item("operational_step", "Rapprocher budget, temps, achats, suppléments, encaissements et factures manquantes avant solde"),
    item("recurring_control", "Conduire un débrief client et interne sur objectifs, satisfaction, écarts, causes et actions à réutiliser"),
    item("operating_rule", "Ne pas archiver le dossier tant que le solde, les litiges, les restitutions et les actions correctives restent sans responsable"),
  ],
  dayOf: [
    item("implementation_action", "Installer le poste de commandement avec conducteur minute, plans, contacts, radios, clés, météo, secours et solutions de repli"),
    item("operational_step", "Faire l’ouverture technique et sécurité avec site, régie, accueil et prestataires avant l’arrivée du public"),
    item("operational_step", "Pointer intervenants, livraisons, équipements et zones puis traiter immédiatement toute absence ou non-conformité"),
    item("operational_step", "Piloter chaque séquence avec heure réelle, responsable, top départ, dépendance suivante et information au client"),
    item("operational_step", "Tracer incident, décision, personne prévenue, action, heure de résolution et impact dans la main courante"),
    item("operating_rule", "Donner priorité à la sécurité du public et des équipes sur le programme, l’esthétique ou la promesse commerciale"),
  ],
  preparation: [
    item("implementation_action", "Construire le rétroplanning depuis l’ouverture avec validations client, commandes, autorisations, contenus, essais, montage et démontage"),
    item("operational_step", "Transformer chaque livrable en tâche avec responsable, date, dépendance, preuve attendue et point de validation"),
    item("operational_step", "Confirmer par écrit à chaque prestataire périmètre, horaires, accès, contact, matériel, puissance, livraison, reprise et plan de repli"),
    item("operational_step", "Préparer flux public, accréditations, signalétique, vestiaire, restauration, déchets, transport, stockage et accessibilité"),
    item("recurring_control", "Tenir une revue de préparation à J-30, J-15, J-7, J-2 et avant ouverture selon la taille du projet"),
    item("operating_rule", "Ne pas considérer une dépendance comme sécurisée sur une intention orale : exiger confirmation, preuve ou alternative activable"),
  ],
};

const hotelProcesses = {
  decisions:
    "process.hebergement.direction.decider-sans-reprendre-toutes-les-operations",
  strategy: "process.hebergement.direction.savoir-ou-va-lactivite",
  team:
    "process.hebergement.equipe.remplacer-un-absent-et-transmettre-les-consignes",
  payables: "process.hebergement.finance-admin.payer-a-temps",
  finance:
    "process.hebergement.finance-admin.suivre-le-chiffre-et-les-encaissements",
  reservations:
    "process.hebergement.marketing-vente.gerer-les-reservations-et-la-relation-client",
  complaints:
    "process.hebergement.marketing-vente.traiter-un-avis-negatif-ou-une-reclamation",
  stays:
    "process.hebergement.operations.organiser-arrivees-departs-et-menage",
  incidents:
    "process.hebergement.operations.traiter-un-incident-sur-site",
} as const;

const hotelDefinitions: Record<
  keyof typeof hotelProcesses,
  IndustrializedProcessDefinition
> = {
  decisions: def(
    "Arbitrer disponibilité, surbooking, sécurité, geste et remise en service sans reprendre chaque tâche.",
    "Écart de chambre, absence, panne, plainte, urgence ou demande exceptionnelle.",
    "Une mesure immédiate, une décision attribuée et une trace.",
    "Responsable d’hébergement",
    "Quotidienne",
  ),
  strategy: def(
    "Aligner positionnement, canaux, prix, capacité, qualité et investissements.",
    "Revue mensuelle, saison, événement local ou variation de demande.",
    "Un hébergement rentable avec une expérience cohérente.",
    "Dirigeant",
    "Mensuelle",
  ),
  team: def(
    "Couvrir réception, hébergement, ménage et astreinte avec une transmission fiable.",
    "Planning, relève, absence, forte occupation ou incident.",
    "Chaque service critique dispose d’un titulaire, d’un relais et de consignes à jour.",
    "Responsable d’hébergement",
    "Quotidienne",
  ),
  payables: def(
    "Payer fournisseurs, abonnements et charges justifiés à la bonne échéance.",
    "Facture, livraison, contrat, prélèvement, avoir ou litige.",
    "Une dépense contrôlée, affectée et réglée une seule fois.",
    "Responsable administratif",
    "Hebdomadaire",
  ),
  finance: def(
    "Rapprocher réservations, nuitées, taxes, extras, encaissements, commissions et remboursements.",
    "Clôture quotidienne, versement plateforme, écart, annulation ou fin de mois.",
    "Un chiffre et une trésorerie expliqués par date et canal.",
    "Responsable administratif",
    "Quotidienne",
  ),
  reservations: def(
    "Vendre et confirmer une chambre disponible avec prix et conditions compris.",
    "Demande, réservation, modification, annulation ou arrivée prochaine.",
    "Une réservation exacte et confirmée sur tous les canaux.",
    "Réception",
    "À chaque réservation",
  ),
  complaints: def(
    "Traiter un avis ou une réclamation à partir du séjour et de preuves vérifiées.",
    "Insatisfaction sur place, message, avis, contestation ou dommage.",
    "Une réponse, une solution et une prévention tracées.",
    "Responsable d’hébergement",
    "À chaque réclamation",
  ),
  stays: def(
    "Synchroniser chambres, arrivées, départs, ménage, paiements et informations voyageurs.",
    "Clôture de nuit, départ, fin de ménage, arrivée ou prolongation.",
    "Une chambre prête, un client attendu et un statut fiable.",
    "Réception",
    "Quotidienne",
  ),
  incidents: def(
    "Protéger les personnes, isoler le risque et rétablir le service après un incident sur site.",
    "Alarme, accident, panne, fuite, nuisance, intrusion ou problème de chambre.",
    "Un incident maîtrisé, documenté et suivi jusqu’à clôture.",
    "Responsable d’hébergement",
    "À chaque incident",
  ),
};

const hotelContent: Record<
  keyof typeof hotelProcesses,
  IndustrializedContentItem[]
> = {
  decisions: [
    item("implementation_action", "Définir les seuils de décision pour surbooking, chambre hors service, relogement, remboursement, geste, panne, nuisance et sécurité"),
    item("operational_step", "Qualifier l’alerte avec client, chambre, réservation, heure, sécurité, disponibilité, preuve et solution immédiate possible"),
    item("operational_step", "Protéger le client puis décider changement de chambre, intervention, relogement, compensation, fermeture de zone ou appel aux secours"),
    item("operational_step", "Attribuer l’action à la réception, au ménage, à la maintenance ou à l’astreinte avec délai et retour attendu"),
    item("operational_step", "Mettre à jour le PMS, le statut de chambre, la réservation et les consignes de relève après chaque décision"),
    item("recurring_control", "Revoir à chaque relève chambres bloquées, clients à rappeler, gestes en attente, incidents et décisions non clôturées"),
    item("recurring_control", "Analyser chaque semaine les décisions exceptionnelles, leurs coûts, leurs causes et les procédures à corriger"),
    item("operating_rule", "Ne jamais attribuer une chambre non contrôlée, dangereuse, occupée ou déclarée hors service pour résoudre une urgence commerciale"),
  ],
  strategy: [
    item("implementation_action", "Cartographier clientèle, saisons, événements locaux, types de chambres, capacités, services, concurrence et canaux de réservation"),
    item("implementation_action", "Fixer les objectifs d’occupation, prix moyen, revenu par chambre disponible, part directe, annulation, satisfaction et marge"),
    item("operational_step", "Construire le calendrier tarifaire par période, demande, type de chambre, durée, conditions et restrictions de vente"),
    item("operational_step", "Comparer vente directe et plateformes sur volume, commission, prix net, annulation, paiement et dépendance commerciale"),
    item("recurring_control", "Prévoir chaque semaine occupation, arrivées, départs, groupes, disponibilité réelle et besoin de personnel"),
    item("recurring_control", "Comparer chaque mois chiffre, occupation, prix, commissions, coûts, incidents, avis et rentabilité par canal"),
    item("operational_step", "Prioriser rénovation, literie, équipements, sécurité et maintenance à partir des pannes, avis, contrôles et manque à gagner"),
    item("operating_rule", "Ne pas ouvrir de capacité ou de canal supplémentaire si disponibilité, ménage, accueil et maintenance ne peuvent pas suivre"),
  ],
  team: [
    item("implementation_action", "Lister les fonctions critiques par plage horaire : réception, clôture, petit-déjeuner, ménage, maintenance, sécurité et astreinte"),
    item("implementation_action", "Nommer pour chaque fonction un titulaire, un remplaçant, un contact d’urgence et les limites de décision"),
    item("operational_step", "Préparer la relève avec occupation, arrivées, départs, chambres à contrôler, demandes, encaissements et incidents ouverts"),
    item("operational_step", "Transmettre au remplaçant les accès autorisés, priorités, clients sensibles, chambres bloquées et prestataires attendus"),
    item("operational_step", "Réaffecter chambres et tâches dès une absence en protégeant accueil, propreté, sécurité et délais promis"),
    item("recurring_control", "Contrôler chaque jour trous de planning, doubles affectations, heures, pauses, astreinte et compétences manquantes"),
    item("recurring_control", "Tester régulièrement les connaissances sur PMS, paiement, évacuation, fiche de police, confidentialité et gestion de conflit"),
    item("operating_rule", "Retirer immédiatement clés, badges, codes et comptes d’une personne qui quitte sa fonction ou termine son remplacement"),
  ],
  payables: [
    item("implementation_action", "Créer le registre fournisseurs avec contrat, fréquence, échéance, coordonnées, prélèvement, site et responsable de validation"),
    item("operational_step", "Rattacher chaque facture à la livraison, au bon d’intervention, au contrat ou à la période réellement servie"),
    item("operational_step", "Vérifier quantité, prix, chambre ou zone, taxe, avoir et absence de doublon avant validation"),
    item("operational_step", "Signaler immédiatement une anomalie au fournisseur et conserver la facture en litige avec preuve de contestation"),
    item("recurring_control", "Préparer chaque semaine les paiements dus avec trésorerie disponible, priorité et validation requise"),
    item("recurring_control", "Contrôler mensuellement abonnements inutilisés, hausses, contrats renouvelés, consommations et économies possibles"),
    item("operational_step", "Classer facture, preuve de service, validation et paiement dans la période comptable correcte"),
    item("operating_rule", "Ne pas payer sur une simple relance sans retrouver facture, prestation, bénéficiaire et validation correspondante"),
  ],
  finance: [
    item("implementation_action", "Paramétrer les familles de revenus : chambre, petit-déjeuner, taxe de séjour, extras, annulation, no-show, avoir et remboursement"),
    item("implementation_action", "Documenter pour chaque canal commission, calendrier de versement, moyen de paiement, retenues et référence de rapprochement"),
    item("operational_step", "Clôturer la journée en rapprochant PMS, factures, espèces, terminal bancaire, liens de paiement et mouvements exceptionnels"),
    item("operational_step", "Contrôler chaque versement de plateforme réservation par réservation avec commission, taxe, remboursement et écart"),
    item("operational_step", "Traiter annulation, no-show, arrhes, acompte, avoir et remboursement selon les conditions confirmées au client"),
    item("recurring_control", "Comparer chaque semaine chiffre produit, encaissé, restant dû, commissions et trésorerie attendue"),
    item("recurring_control", "Comparer chaque mois occupation, prix moyen, revenu net, coûts variables, énergie, ménage et marge"),
    item("operating_rule", "Ne pas corriger un écart de caisse ou de versement par une écriture sans réservation, motif et pièce justificative"),
  ],
  reservations: [
    item("implementation_action", "Paramétrer dans le PMS chambres, capacités, équipements, tarifs, taxes, services, conditions, stocks et canaux ouverts"),
    item("operational_step", "Qualifier dates, nombre et âge des voyageurs, besoins, accessibilité, animal, véhicule, arrivée tardive et facturation"),
    item("operational_step", "Vérifier la disponibilité réelle puis annoncer le prix total, prestations incluses, suppléments et conditions d’annulation"),
    item("operational_step", "Distinguer clairement arrhes, acompte, garantie bancaire et paiement afin d’appliquer la conséquence contractuelle prévue"),
    item("operational_step", "Envoyer sur support durable la confirmation avec établissement, séjour, chambre, prix, taxes, services, paiement et conditions"),
    item("operational_step", "Synchroniser immédiatement toute création, modification ou annulation dans le PMS et les canaux concernés"),
    item("recurring_control", "Contrôler chaque jour doublons, surbooking, cartes invalides, demandes non confirmées, restrictions et arrivées sans garantie"),
    item("operating_rule", "Ne pas promettre un type de chambre, un équipement, une vue ou un horaire non réservé explicitement dans le dossier"),
  ],
  complaints: [
    item("implementation_action", "Créer le registre des avis et réclamations avec séjour, chambre, canal, faits, preuves, demande, réponse et action corrective"),
    item("operational_step", "Accuser réception et résoudre d’abord le besoin immédiat : sécurité, propreté, bruit, équipement, accès ou facturation"),
    item("operational_step", "Vérifier PMS, état de chambre, contrôle ménage, intervention, échanges, paiement et conditions communiquées"),
    item("operational_step", "Décider correction, changement, relogement, geste, remboursement, refus motivé ou médiation selon faits et autorisation"),
    item("operational_step", "Répondre par écrit avec faits utiles, solution, délai et coordonnées du médiateur lorsque la situation le requiert"),
    item("recurring_control", "Analyser chaque semaine avis, notes, motifs, chambres, équipements et équipes pour repérer les récurrences"),
    item("recurring_control", "Vérifier que chaque action corrective décidée possède responsable, échéance et preuve de réalisation"),
    item("operating_rule", "Ne jamais publier de donnée personnelle ni contester agressivement un avis ; répondre sur le service et poursuivre l’échange en privé"),
  ],
  stays: [
    item("implementation_action", "Créer le tableau quotidien avec arrivées, départs, recouches, chambres libres, hors service, priorités et demandes particulières"),
    item("operational_step", "À chaque départ, clôturer extras, taxe de séjour, paiement, facture, clé, dommage éventuel et objet signalé"),
    item("operational_step", "Faire le ménage selon la séquence définie puis signaler immédiatement dommage, oubli, panne, manque ou risque sanitaire"),
    item("operational_step", "Contrôler chambre, salle d’eau, linge, équipements, sécurité, température et demande client avant statut prête"),
    item("operational_step", "À l’arrivée, vérifier réservation et identité, faire remplir la fiche de police lorsqu’elle est requise puis remettre accès et informations"),
    item("operational_step", "Informer le client sur horaires, petit-déjeuner, internet, règles, urgence, services payants et modalités de départ"),
    item("operational_step", "Tracer pendant le séjour demande, incident, intervention, changement de chambre et information à transmettre à la relève"),
    item("recurring_control", "Rapprocher plusieurs fois par jour statuts PMS, réalité terrain, clés, chambres prêtes et clients déjà présents"),
    item("operating_rule", "Ne pas marquer une chambre prête sur la seule fin du ménage : le contrôle final et les demandes spécifiques doivent être validés"),
  ],
  incidents: [
    item("implementation_action", "Créer la procédure d’incident avec urgence, incendie, accident, fuite, électricité, gaz, ascenseur, intrusion, nuisance et panne critique"),
    item("implementation_action", "Tenir à jour registre de sécurité, plans, consignes, numéros de secours, coupures, moyens d’extinction et contacts techniques"),
    item("operational_step", "Protéger les personnes, alerter les secours si nécessaire, isoler la zone et empêcher toute nouvelle attribution"),
    item("operational_step", "Qualifier l’incident avec lieu, heure, personnes, symptômes, équipement, photos utiles, mesures prises et témoins"),
    item("operational_step", "Informer les clients concernés avec consigne claire puis organiser assistance, changement de chambre ou relogement"),
    item("operational_step", "Déclencher le prestataire compétent et conserver diagnostic, intervention, pièces, test et autorisation de remise en service"),
    item("recurring_control", "Vérifier jusqu’à clôture état des personnes, chambre bloquée, déclaration, assurance, travaux et information aux relèves"),
    item("recurring_control", "Analyser chaque mois incidents, presque-accidents, alarmes, pannes et nuisances pour supprimer les causes récurrentes"),
    item("operating_rule", "Ne jamais rouvrir une chambre, une installation ou une zone sans contrôle documenté lorsque la sécurité a été engagée"),
  ],
};

function draftFrom<T extends Record<string, string>>(
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

export const hospitalityEventsProfiles = {
  evenementiel: {
    slug: "evenementiel",
    name: "Événementiel professionnel",
    sourceUrl:
      "https://docs.google.com/spreadsheets/d/1YH8HpXkEABajxTFjfjd7A5x_3MNAgM6R4eE92ZmhtwA/edit",
    researchSources: [
      "https://www.service-public.fr/particuliers/vosdroits/R51537",
      "https://entreprendre.service-public.fr/vosdroits/F31684",
      "https://entreprendre.service-public.fr/vosdroits/F3094",
      "https://entreprendre.service-public.fr/vosdroits/F33527",
      "https://entreprendre.service-public.fr/vosdroits/F24270",
      "https://travail-emploi.gouv.fr/sites/travail-emploi/files/files-spip/pdf/guide-des-grands-evenements-sportifs-2023.pdf",
    ],
    processCount: 13,
  },
  "hotel-hebergement-independant": {
    slug: "hotel-hebergement-independant",
    name: "Hôtel & hébergement indépendant",
    sourceUrl:
      "https://docs.google.com/spreadsheets/d/1IpG7ky_M2vOcn4ByC38fgBuaZniUeaEyapDK4n2HrCU/edit",
    researchSources: [
      "https://www.economie.gouv.fr/dgccrf/les-fiches-pratiques/hotels-droits-et-obligations-des-professionnels",
      "https://www.economie.gouv.fr/dgccrf/laction-de-la-dgccrf/les-enquetes-et-les-controles/reservation-hoteliere-en-ligne-que-faut-il-verifier",
      "https://www.economie.gouv.fr/dgccrf/les-fiches-pratiques/linformation-sur-les-prix",
      "https://www.economie.gouv.fr/dgccrf/les-fiches-pratiques/la-mediation-de-la-consommation-ce-que-vous-devez-savoir",
      "https://entreprendre.service-public.fr/vosdroits/R71162",
      "https://entreprendre.service-public.fr/vosdroits/F31684",
    ],
    processCount: 9,
  },
} satisfies Record<string, HospitalityEventsProfile>;

export function generateHospitalityEventsDraft(
  profile: HospitalityEventsProfile,
): ProcessDraft {
  if (profile.slug === "evenementiel") {
    return draftFrom(eventProcesses, eventDefinitions, eventContent);
  }

  return draftFrom(hotelProcesses, hotelDefinitions, hotelContent);
}
