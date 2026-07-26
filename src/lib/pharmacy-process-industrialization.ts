import type {
  IndustrializedContentItem,
  IndustrializedProcessDefinition,
  ProcessDraft,
} from "@/lib/process-industrialization";

export type PharmacyProfile = {
  slug: "pharmacie";
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

const pharmacyProcesses = {
  strategy: "process.pharmacie.direction.savoir-ou-va-lofficine",
  decisions: "process.pharmacie.direction.decider-sans-bloquer-le-comptoir",
  access: "process.pharmacie.direction.donner-acces-a-lessentiel",
  welcome:
    "process.pharmacie.marketing-vente.accueillir-et-orienter-les-clients",
  complaints:
    "process.pharmacie.marketing-vente.traiter-une-reclamation-client",
  dispensing:
    "process.pharmacie.operations.servir-ordonnances-et-demandes-comptoir",
  stock: "process.pharmacie.operations.suivre-stock-commandes-et-ruptures",
  healthMissions:
    "process.pharmacie.operations.piloter-missions-sante-et-tracabilite",
  team: "process.pharmacie.equipe.organiser-lequipe-et-les-remplacements",
  finance:
    "process.pharmacie.finance-admin.suivre-encaissements-et-tiers-payant",
  payables: "process.pharmacie.finance-admin.payer-a-temps",
  compliance:
    "process.pharmacie.conformite-metier.tenir-lofficine-et-les-obligations-en-regle",
} as const;

const pharmacyDefinitions: Record<
  keyof typeof pharmacyProcesses,
  IndustrializedProcessDefinition
> = {
  strategy: def(
    "Piloter l’officine selon les besoins de santé, la qualité de dispensation et son équilibre économique.",
    "Revue d’activité, nouvelle mission, tension de stock, évolution d’équipe ou changement réglementaire.",
    "Des priorités compatibles avec la sécurité des patients, les moyens de l’équipe et la trésorerie.",
    "Pharmacien titulaire",
    "Mensuelle",
  ),
  decisions: def(
    "Arbitrer rapidement les situations sensibles sans interrompre la prise en charge.",
    "Ordonnance douteuse, risque patient, rupture, incident, affluence ou absence.",
    "Une décision pharmaceutique tracée, expliquée et suivie.",
    "Pharmacien responsable présent",
    "À chaque situation",
  ),
  access: def(
    "Protéger les accès aux données de santé, logiciels et moyens critiques de l’officine.",
    "Arrivée, remplacement, changement de rôle, départ ou incident de sécurité.",
    "Chaque accès est nominatif, justifié, limité et révocable.",
    "Pharmacien titulaire",
    "À chaque mouvement",
  ),
  welcome: def(
    "Identifier la demande et orienter le patient vers le bon niveau de prise en charge.",
    "Entrée dans l’officine, demande au comptoir, ordonnance, symptôme ou service de santé.",
    "Le patient est pris en charge avec confidentialité, priorité et interlocuteur adaptés.",
    "Équipe officinale",
    "À chaque patient",
  ),
  complaints: def(
    "Traiter une réclamation ou un incident en sécurisant immédiatement le patient.",
    "Erreur suspectée, produit défectueux, refus, attente, facturation ou insatisfaction.",
    "Le risque est contenu, les faits sont instruits et l’action corrective est vérifiée.",
    "Pharmacien responsable présent",
    "À chaque réclamation",
  ),
  dispensing: def(
    "Réaliser l’acte de dispensation dans son intégralité, de la demande au conseil de bon usage.",
    "Présentation d’une ordonnance, renouvellement ou demande sans prescription.",
    "Le bon produit est délivré au bon patient avec analyse, traçabilité et conseil.",
    "Pharmacien ou personnel habilité sous sa responsabilité",
    "À chaque délivrance",
  ),
  stock: def(
    "Garantir disponibilité, qualité, conservation et traçabilité des produits de santé.",
    "Commande, réception, rangement, rupture, alerte ou retour.",
    "Un stock fiable, conforme et mobilisable sans risque pour le patient.",
    "Référent stock sous responsabilité pharmaceutique",
    "Quotidienne",
  ),
  healthMissions: def(
    "Réaliser les missions de prévention et d’accès aux soins dans leur cadre autorisé.",
    "Vaccination, dépistage, entretien, bilan, téléconsultation ou campagne de santé.",
    "Un acte éligible, consenti, correctement réalisé, tracé et facturé.",
    "Pharmacien formé et habilité",
    "À chaque acte",
  ),
  team: def(
    "Couvrir l’activité avec les diplômes, compétences et responsabilités nécessaires.",
    "Planning, absence, recrutement, remplacement, affluence ou nouvelle mission.",
    "Chaque poste est couvert et chaque acte confié à une personne compétente.",
    "Pharmacien titulaire",
    "Hebdomadaire",
  ),
  finance: def(
    "Rapprocher délivrances, factures, tiers payant et encaissements sans double paiement.",
    "Facturation, télétransmission, retour NOEMIE, rejet, règlement ou clôture.",
    "Chaque flux est justifié, payé ou traité jusqu’à résolution.",
    "Référent facturation",
    "Quotidienne",
  ),
  payables: def(
    "Valider et payer les échéances de l’officine avec leurs pièces.",
    "Facture fournisseur, paie, loyer, cotisation, abonnement ou taxe.",
    "Une dépense reçue, autorisée, rapprochée et réglée une seule fois.",
    "Gestionnaire ou administration",
    "Hebdomadaire",
  ),
  compliance: def(
    "Maintenir l’officine, ses registres, procédures et déclarations en conformité.",
    "Échéance, contrôle, mouvement professionnel, incident ou évolution réglementaire.",
    "Des preuves complètes, intègres et immédiatement présentables.",
    "Pharmacien titulaire",
    "Mensuelle",
  ),
};

const pharmacyContent: Record<
  keyof typeof pharmacyProcesses,
  IndustrializedContentItem[]
> = {
  strategy: [
    item("implementation_action", "Définir les priorités de l’officine par besoins du territoire, typologie de patients, prescriptions, saisonnalité, gardes et missions de santé"),
    item("implementation_action", "Fixer des objectifs de qualité de dispensation, disponibilité, délai d’attente, marge, stock, rejets et trésorerie"),
    item("operational_step", "Évaluer chaque nouvelle gamme ou mission selon utilité sanitaire, compétence, espace, équipement, traçabilité, rémunération et charge"),
    item("recurring_control", "Suivre chaque semaine ordonnances en attente, ruptures critiques, rappels de lots, tension d’équipe et incidents ouverts"),
    item("recurring_control", "Analyser chaque mois chiffre d’affaires, marge, rotation, démarque, stock dormant, tiers payant, honoraires et trésorerie"),
    item("operating_rule", "Ne jamais laisser un objectif commercial influencer l’analyse pharmaceutique, le conseil ou la décision de délivrer"),
  ],
  decisions: [
    item("implementation_action", "Écrire qui arbitre ordonnance non conforme, interaction, refus de délivrance, rupture, substitution, urgence, incident et fermeture temporaire"),
    item("operational_step", "Recueillir patient, demande, ordonnance, traitement connu, risque immédiat, stock et professionnel déjà intervenu"),
    item("operational_step", "Mettre le patient en sécurité puis contacter prescripteur, service de garde, centre compétent ou secours selon la situation"),
    item("operational_step", "Tracer le problème pharmaceutique, les vérifications, la décision, l’auteur, l’heure, les conseils et la suite prévue"),
    item("recurring_control", "Revoir en équipe les refus, erreurs interceptées, appels prescripteurs, ruptures sensibles et décisions récurrentes"),
    item("operating_rule", "La décision finale concernant une dispensation à risque reste sous la responsabilité d’un pharmacien présent"),
  ],
  access: [
    item("implementation_action", "Cartographier les accès au logiciel métier, Dossier Pharmaceutique, messagerie sécurisée, télétransmission, commandes, caisse, vidéosurveillance et banque"),
    item("implementation_action", "Attribuer un compte nominatif avec rôle, droits minimaux, authentification adaptée et date de fin pour chaque professionnel"),
    item("operational_step", "Remettre au nouvel arrivant les accès utiles après vérification du statut, des compétences et des engagements de confidentialité"),
    item("operational_step", "Révoquer le jour du départ comptes, cartes, badges, clés, délégations, signatures et accès distants"),
    item("recurring_control", "Contrôler chaque trimestre comptes partagés, droits excessifs, traces anormales, sauvegardes, mises à jour et prestataires actifs"),
    item("operating_rule", "Ne consulter ni transmettre une donnée de santé sans besoin de prise en charge, base légitime et canal sécurisé"),
  ],
  welcome: [
    item("implementation_action", "Organiser un accueil visible avec file prioritaire, zone de confidentialité, espace de mission et orientation vers le pharmacien"),
    item("operational_step", "Identifier la personne concernée, la nature de la demande, l’urgence apparente, l’ordonnance éventuelle et le besoin de confidentialité"),
    item("operational_step", "Faire intervenir immédiatement le pharmacien pour symptôme grave, population à risque, ordonnance sensible, demande inhabituelle ou doute"),
    item("operational_step", "Pour une demande sans ordonnance, questionner symptômes, durée, traitements, allergies, âge, grossesse et signes d’alerte utiles"),
    item("operational_step", "Orienter vers médecin, garde, urgence ou autre professionnel lorsque la demande dépasse le champ de l’officine"),
    item("operating_rule", "Ne pas annoncer de diagnostic, de disponibilité, de délai ou de prise en charge financière avant vérification"),
  ],
  complaints: [
    item("implementation_action", "Créer un registre des réclamations, erreurs de délivrance, défauts produits, incidents de confidentialité et écarts de facturation"),
    item("operational_step", "Évaluer immédiatement le risque patient et rappeler ou orienter sans attendre lorsqu’une délivrance peut être concernée"),
    item("operational_step", "Isoler produit, ordonnance, facture, images, lot, traces logiciel et témoignages utiles sans modifier les données sources"),
    item("operational_step", "Informer le patient des mesures utiles puis contacter prescripteur, fournisseur, assureur ou autorité selon le cas"),
    item("operational_step", "Analyser cause, barrière défaillante, personnes concernées et action corrective sans chercher un responsable avant les faits"),
    item("recurring_control", "Suivre chaque incident jusqu’à preuve d’efficacité puis partager anonymement l’apprentissage avec l’équipe"),
  ],
  dispensing: [
    item("operational_step", "Vérifier identité du patient, authenticité et validité de l’ordonnance, prescripteur, date, renouvellement et règles particulières"),
    item("operational_step", "Analyser indication connue, posologie, dose, durée, voie, contre-indications, interactions, redondances, allergies et traitements disponibles"),
    item("operational_step", "Consulter et alimenter le Dossier Pharmaceutique selon les droits du patient et tracer toute opposition prévue par le dispositif"),
    item("operational_step", "Contacter le prescripteur et documenter l’échange avant toute adaptation ou refus nécessaire à la sécurité du patient"),
    item("operational_step", "Contrôler avant remise nom, dosage, forme, quantité, substitution, intégrité, péremption, conditions de conservation et concordance avec la facture"),
    item("operational_step", "Expliquer prise, durée, oubli, précautions, effets à surveiller, conservation, conduite à tenir et moment du suivi"),
    item("operating_rule", "Enregistrer immédiatement toute délivrance soumise à inscription obligatoire dans un système intègre, pérenne et éditable"),
  ],
  stock: [
    item("implementation_action", "Définir seuils minimum-maximum, produits critiques, saisonnalité, délai fournisseur, commandes patients et solution en cas de rupture"),
    item("operational_step", "À réception, contrôler fournisseur, référence, quantité, intégrité, lot, péremption, température requise et écart à la commande"),
    item("operational_step", "Ranger par conditions de conservation et péremption la plus proche, avec accès sécurisé pour les produits réglementés"),
    item("operational_step", "Traiter toute alerte de retrait ou rappel en bloquant, recherchant, retirant et traçant exhaustivement les lots concernés"),
    item("operational_step", "Pour une rupture, vérifier alternatives autorisées, disponibilités, commande, information patient et contact prescripteur si nécessaire"),
    item("recurring_control", "Contrôler chaque jour températures, quarantaines, périmés proches, écarts d’inventaire, commandes patients et produits non rangés"),
  ],
  healthMissions: [
    item("implementation_action", "Tenir la matrice des missions proposées avec professionnels habilités, formation, local, matériel, protocole, urgence et facturation"),
    item("operational_step", "Vérifier avant l’acte identité, âge, éligibilité, recommandations en vigueur, contre-indications, prescription éventuelle et consentement"),
    item("operational_step", "Préparer un espace confidentiel, propre et équipé puis vérifier produit, matériel, lot, péremption et conduite d’urgence"),
    item("operational_step", "Réaliser la mission dans la limite de la compétence autorisée et arrêter pour avis médical au moindre critère d’exclusion"),
    item("operational_step", "Tracer acte, résultat utile, produit, lot, date, professionnel, conseil, orientation et transmission sécurisée requise"),
    item("recurring_control", "Rapprocher chaque mois actes réalisés, dossiers complets, consommables, facturation, incidents et formations arrivant à échéance"),
  ],
  team: [
    item("implementation_action", "Tenir pour chaque membre diplôme, inscription ou autorisation utile, contrat, rôle, formations, habilitations et échéances"),
    item("operational_step", "Construire le planning avec présence pharmaceutique, affluence, gardes, comptoir, back-office, stock et missions sur rendez-vous"),
    item("operational_step", "À chaque absence, requalifier les actes maintenus, reportés ou réaffectés selon les professionnels réellement présents"),
    item("operational_step", "Former chaque arrivant au logiciel, dispensation, alertes, chaîne du froid, stupéfiants, confidentialité, tiers payant et incidents"),
    item("recurring_control", "Faire chaque semaine le point sur charge, files, erreurs interceptées, ruptures, compétences manquantes et fatigue"),
    item("operating_rule", "Ne déléguer un acte ou une responsabilité qu’à une personne possédant la qualification et la compétence requises"),
  ],
  finance: [
    item("implementation_action", "Paramétrer caisse et facturation avec droits, régimes, complémentaires, produits, honoraires, missions, substitutions et contrôles de cohérence"),
    item("operational_step", "Avant tiers payant, vérifier identité, droits, carte Vitale, ordonnance, conditions de dispensation et règle applicable à la substitution"),
    item("operational_step", "Télétransmettre une feuille sécurisée sans forçage injustifié puis conserver les retours nécessaires au suivi"),
    item("operational_step", "Qualifier chaque rejet par patient, facture, organisme, motif, pièce manquante, correction, nouvelle transmission et échéance"),
    item("recurring_control", "Rapprocher chaque jour caisse, espèces, cartes, virements, tiers payant, retours, rejets et annulations"),
    item("recurring_control", "Contrôler chaque mois taux de rejets, doubles paiements, créances anciennes, avoirs, écarts de caisse et rémunérations attendues"),
  ],
  payables: [
    item("implementation_action", "Créer le calendrier des grossistes, laboratoires, salaires, cotisations, loyers, assurances, logiciels, énergie, taxes et emprunts"),
    item("operational_step", "Rapprocher facture fournisseur, commande, réception, retours, remises, conditions commerciales et avoirs"),
    item("operational_step", "Bloquer toute facture en doublon, quantité non reçue, prix inattendu ou avoir manquant et ouvrir une contestation tracée"),
    item("operational_step", "Préparer les paiements selon validation, échéance, trésorerie, coordonnées bancaires vérifiées et séparation des rôles"),
    item("recurring_control", "Comparer chaque semaine échéances, prélèvements, trésorerie disponible, encaissements attendus et risques de retard"),
    item("operating_rule", "La personne qui commande ou modifie un fournisseur ne doit pas être seule à valider ses coordonnées et son paiement"),
  ],
  compliance: [
    item("implementation_action", "Centraliser autorisations, inscriptions ordinales, diplômes, remplacements, assurances, gardes, contrats, contrôles et déclarations de l’officine"),
    item("implementation_action", "Tenir des procédures versionnées pour dispensation, stupéfiants, chaîne du froid, retraits-rappels, vigilances, déchets, données et continuité"),
    item("implementation_action", "Tenir le registre des traitements, informations patients, durées, habilitations, sauvegardes, violations et demandes de droits"),
    item("operational_step", "Conserver ordonnances, registres et justificatifs réglementés selon leur durée applicable avec intégrité, double support requis et édition possible"),
    item("operational_step", "Déclarer sans délai utile tout effet indésirable suspecté, défaut qualité ou incident de vigilance par le circuit officiel approprié"),
    item("recurring_control", "Auditer chaque mois ordonnancier, stupéfiants, températures, retraits, périmés, vigilances, accès, incidents et actions correctives"),
    item("operating_rule", "Ne jamais antidater, supprimer, masquer ni reconstituer sans mention une délivrance, un lot, une température, un incident ou un enregistrement obligatoire"),
  ],
};

export const pharmacyProfile: PharmacyProfile = {
  slug: "pharmacie",
  name: "Pharmacie",
  sourceUrl:
    "https://docs.google.com/spreadsheets/d/1zPxMWgBgkpUJx3P1wslGd9kDFMuHJQK7cfkMe5TWcm0/edit",
  researchSources: [
    "https://www.legifrance.gouv.fr/jorf/id/JORFTEXT000053618939",
    "https://www.legifrance.gouv.fr/loda/id/JORFTEXT000033507633/",
    "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000006915544/",
    "https://www.legifrance.gouv.fr/codes/id/LEGISCTA000006198844/",
    "https://www.ordre.pharmacien.fr/je-suis/pharmacien/je-suis-pharmacien-titulaire-d-officine/mon-exercice-professionnel/la-qualite-officine",
    "https://www.ordre.pharmacien.fr/je-suis/pharmacien/je-suis-pharmacien-titulaire-d-officine/mes-publications/mes-autres-publications/recommandation-de-procedure-relative-a-la-gestion-des-retraits-rappels-de-lots-de-medicaments-humains-a-l-officine",
    "https://www.ameli.fr/pharmacien/exercice-professionnel/pratique-tiers-payant/modalites-regles-facturation",
    "https://www.ameli.fr/pharmacien/sante-prevention/vaccination/vaccination-par-pharmacien-officine",
    "https://www.cnil.fr/fr/la-cnil-et-lordre-national-des-pharmaciens-publient-un-guide-rgpd",
  ],
  processCount: 12,
};

export function generatePharmacyDraft(): ProcessDraft {
  return {
    definitionsById: Object.fromEntries(
      Object.entries(pharmacyProcesses).map(([role, processId]) => [
        processId,
        pharmacyDefinitions[role as keyof typeof pharmacyProcesses],
      ]),
    ),
    contentByProcessId: Object.fromEntries(
      Object.entries(pharmacyProcesses).map(([role, processId]) => [
        processId,
        pharmacyContent[role as keyof typeof pharmacyProcesses],
      ]),
    ),
  };
}
