import type { BusinessModelBlock } from "@/lib/business-models";

export type BusinessBlockChecklist = {
  title: string;
  checklist: string[];
};

const TERM_ACTIONS: Array<[RegExp, string[]]> = [
  [/demande|prospect|client|admission|inscription|rendez-vous|réservation/i, [
    "Qualifier la demande entrante",
    "Vérifier besoin, urgence, lieu et contraintes",
    "Confirmer la prochaine étape avec le client",
  ]],
  [/devis|chiffrage|tarif|prix|estimation/i, [
    "Chiffrer le besoin avec les bons coûts",
    "Faire valider le devis ou l'accord client",
    "Relancer les dossiers ouverts",
  ]],
  [/chantier|travaux|intervention|terrain|pose|réparation|atelier/i, [
    "Planifier les interventions",
    "Suivre l'avancement réel",
    "Tracer photos, décisions et points bloquants",
  ]],
  [/planning|session|cours|tournée|trajet|leçon|agenda|créneau/i, [
    "Bloquer les dates et ressources nécessaires",
    "Confirmer les disponibilités",
    "Mettre à jour le planning en cas d'imprévu",
  ]],
  [/matériau|stock|fournisseur|pièce|produit|réassort|commande/i, [
    "Lister les besoins à commander",
    "Vérifier disponibilité, prix et délais",
    "Rattacher les achats au bon dossier",
  ]],
  [/qualité|conformité|réserve|réception|preuve|qualiopi|haccp|hygiène|sécurité|traçabilité|confidentialité/i, [
    "Vérifier les points obligatoires",
    "Traiter les écarts ou réserves",
    "Archiver les preuves utiles",
  ]],
  [/facturation|paiement|caisse|marge|rentabilité|honoraire|commission|budget|trésorerie|encaissement|loyer|opco/i, [
    "Suivre ce qui est signé, facturé et encaissé",
    "Comparer le prévu avec le réel",
    "Relancer les montants en attente",
  ]],
  [/équipe|intervenant|sous-traitant|prestataire|chauffeur|agent|moniteur|coach|praticien|bénévole|extra/i, [
    "Attribuer les responsabilités",
    "Partager consignes, accès et priorités",
    "Suivre charge, absences et remplacements",
  ]],
  [/dossier|pièce|document|mandat|contrat|convention|acte|bail/i, [
    "Collecter les pièces nécessaires",
    "Vérifier les informations manquantes",
    "Classer la version utile",
  ]],
  [/suivi|accompagnement|relation|satisfaction|avis|sav|incident|litige|retour/i, [
    "Suivre les points ouverts",
    "Informer le client au bon moment",
    "Clôturer avec une trace claire",
  ]],
  [/offre|carte|catalogue|gamme|programme|prestation|produit|positionnement|spécialité/i, [
    "Clarifier ce qui est vendu",
    "Mettre à jour prix, conditions et limites",
    "Identifier les offres à pousser ou arrêter",
  ]],
  [/visibilité|acquisition|fidélisation|conversion|vitrine|événement|communauté/i, [
    "Identifier les canaux qui apportent des demandes",
    "Suivre les contacts à relancer",
    "Mesurer les demandes transformées",
  ]],
];

const FALLBACK_ACTIONS = [
  "Décrire le point métier à clarifier",
  "Identifier la prochaine action utile",
  "Attribuer un responsable",
  "Suivre les points ouverts",
  "Garder une trace exploitable",
];

const SPECIFIC_ACTIONS: Array<[RegExp, string[]]> = [
  [/offre & pédagogie|offre & référentiels|offre de soins|offre de prise en charge|offres & outils web/i, [
    "Clarifier l'offre, les limites et les conditions",
    "Mettre à jour tarifs, formats ou spécialités",
    "Identifier les offres à développer ou arrêter",
    "Préparer les éléments à montrer au client",
    "Vérifier que l'offre reste alignée avec la demande",
  ]],
  [/rendez-vous & accueil|rendez-vous & orientation|patients & prescriptions/i, [
    "Qualifier la demande patient",
    "Vérifier motif, urgence et informations utiles",
    "Orienter vers le bon créneau ou praticien",
    "Confirmer rendez-vous et consignes",
    "Gérer absence, retard ou report",
  ]],
  [/dossiers patients|bilans & dossiers|dossiers animaux/i, [
    "Créer ou mettre à jour le dossier",
    "Collecter les informations utiles",
    "Vérifier consentements, prescriptions ou antécédents",
    "Classer les comptes rendus importants",
    "Garder une trace conforme et accessible",
  ]],
  [/consultations & suivi|séances & suivi|soins & transmissions/i, [
    "Préparer la consultation ou séance",
    "Noter actes, décisions et suite à donner",
    "Planifier le suivi si nécessaire",
    "Transmettre les informations utiles",
    "Clôturer les points ouverts",
  ]],
  [/bénéficiaires & contrats|clients & contrats/i, [
    "Qualifier besoin, domicile et contraintes",
    "Valider contrat, fréquence et consignes",
    "Collecter les informations utiles",
    "Confirmer démarrage et modalités",
    "Garder une trace claire des engagements",
  ]],
  [/plans d’intervention|consignes domicile/i, [
    "Décrire les tâches à réaliser",
    "Préciser horaires, accès et consignes",
    "Identifier points de vigilance ou fragilités",
    "Partager le plan avec l'intervenant",
    "Mettre à jour après retour terrain",
  ]],
  [/présences & transmissions|présences & qualité/i, [
    "Suivre présences et heures réalisées",
    "Collecter les transmissions importantes",
    "Repérer absence, retard ou incident",
    "Prévenir famille ou client si nécessaire",
    "Clôturer les alertes ouvertes",
  ]],
  [/opco & pilotage/i, [
    "Suivre prises en charge et montants attendus",
    "Vérifier factures, échéances et accords OPCO",
    "Repérer dossiers non facturés ou en attente",
    "Relancer financeurs ou entreprises",
    "Mettre à jour le reste à encaisser",
  ]],
  [/pièces & fournisseurs/i, [
    "Lister les pièces nécessaires",
    "Vérifier disponibilité, prix et délais",
    "Commander ou réserver les pièces",
    "Rattacher chaque achat au bon dossier",
    "Suivre retards, garanties et retours fournisseur",
  ]],
  [/production|fabrication|création|rédaction|campagnes|éditoriale|contenu|fournées/i, [
    "Planifier les tâches à produire",
    "Préparer brief, matières ou contenus nécessaires",
    "Suivre avancement, validations et retours",
    "Contrôler qualité avant livraison ou diffusion",
    "Archiver la version validée",
  ]],
  [/reporting|performance|usage|progression|réussite|engagement|audience/i, [
    "Suivre les indicateurs utiles",
    "Repérer écarts, retards ou signaux faibles",
    "Partager une synthèse claire",
    "Décider les actions correctives",
    "Conserver l'historique de suivi",
  ]],
  [/livrables|restitution|rapports|plans & livrables|postproduction|livraison/i, [
    "Lister les livrables attendus",
    "Vérifier contenu, format et niveau de finition",
    "Faire valider avant envoi final",
    "Livrer au bon canal",
    "Archiver fichiers et retours client",
  ]],
  [/sourcing|recherche & analyse|analyse société|sourcing biens|sourcing candidats|sourcing actifs/i, [
    "Définir les critères de recherche",
    "Qualifier les opportunités ou profils",
    "Comparer intérêt, risques et priorités",
    "Documenter les décisions",
    "Suivre les prochaines relances",
  ]],
  [/réseau|partenaires|prescripteurs|apporteurs|co-investisseurs|prestataires/i, [
    "Identifier les partenaires utiles",
    "Clarifier rôle, attentes et périmètre",
    "Suivre introductions, demandes et retours",
    "Relancer les partenaires actifs",
    "Mesurer ce que le réseau apporte vraiment",
  ]],
  [/maintenance|pannes|machines|véhicule & entretien|matériel & lieux|local & machines/i, [
    "Lister équipements et points sensibles",
    "Planifier entretien ou vérifications",
    "Suivre pannes, incidents et indisponibilités",
    "Déclencher prestataire ou réparation",
    "Archiver coûts et interventions",
  ]],
  [/brief|cadrage mission|cahiers des charges|consignes de poste|brief acquéreur/i, [
    "Clarifier besoin, contexte et contraintes",
    "Lister informations ou accès manquants",
    "Valider périmètre, priorités et livrables",
    "Partager les consignes aux personnes concernées",
    "Tracer les changements décidés",
  ]],
  [/accueil & séjour|expérience passagers|accueil & conseil|conseil & vente|conseil & fidélité/i, [
    "Préparer l'accueil et les informations utiles",
    "Identifier attentes, questions ou irritants",
    "Apporter le conseil adapté",
    "Suivre satisfaction et retours",
    "Déclencher la suite commerciale ou opérationnelle",
  ]],
  [/ordonnances|actes|formalités|signatures|déclarations|attestations|fluides|permis/i, [
    "Vérifier les pièces ou obligations attendues",
    "Préparer les documents à produire",
    "Contrôler cohérence et échéances",
    "Faire signer ou transmettre au bon interlocuteur",
    "Archiver la preuve utile",
  ]],
  [/copropriétaires|propriétaires|locataires|baux|états des lieux|location|occupation/i, [
    "Centraliser les informations du dossier",
    "Suivre demandes, décisions et échéances",
    "Préparer documents ou échanges nécessaires",
    "Relancer les parties concernées",
    "Garder une trace exploitable",
  ]],
  [/entretiens & shortlists|placements & garanties/i, [
    "Préparer les profils ou candidats à évaluer",
    "Conduire entretiens et validations",
    "Partager shortlist ou décision client",
    "Suivre placement, intégration et garantie",
    "Relancer les dossiers en attente",
  ]],
  [/acheteurs & support|annonceurs & abonnés|acquéreurs & visites|commercialisation/i, [
    "Qualifier les demandes et attentes",
    "Préparer les informations à transmettre",
    "Organiser visites, échanges ou supports",
    "Suivre retours, objections et décisions",
    "Relancer les contacts à potentiel",
  ]],
  [/passages & contrôles|ménage & check-in|service bar|mise en service|tri & traitement/i, [
    "Préparer le passage ou l'intervention",
    "Vérifier consignes, matériel et accès",
    "Réaliser le contrôle qualité",
    "Signaler incident ou reprise nécessaire",
    "Clôturer avec une trace claire",
  ]],
  [/analyse & financement|objectifs & profil risque|souscriptions & arbitrages|banques & assureurs/i, [
    "Collecter les informations financières utiles",
    "Analyser risques, objectifs et contraintes",
    "Comparer options ou scénarios",
    "Préparer la décision ou le dossier",
    "Suivre arbitrages, accords et échéances",
  ]],
  [/menu & formules|presse & tabac|colis & point relais|fleurs & arrivages|couleurs & fournitures|végétaux & fournitures|achats & corps d’état/i, [
    "Lister les références, fournitures ou besoins",
    "Vérifier disponibilité, prix et délais",
    "Préparer commandes ou mises en avant",
    "Suivre ruptures, pertes ou écarts",
    "Adapter selon saison, chantier ou demande",
  ]],
  [/plateforme & accès/i, [
    "Créer ou vérifier les accès",
    "Contrôler parcours, modules et droits",
    "Suivre problèmes de connexion ou support",
    "Mettre à jour contenus et paramètres",
    "Archiver demandes et corrections",
  ]],
  [/diagnostic appareil|diagnostics & relevés|urgences & diagnostics toiture|visites & analyse/i, [
    "Préparer les informations ou outils nécessaires",
    "Réaliser diagnostic, relevé ou analyse",
    "Documenter constats, photos et mesures",
    "Identifier suite à donner ou devis",
    "Partager le résultat au client",
  ]],
  [/consultation entreprises/i, [
    "Préparer le dossier de consultation",
    "Identifier entreprises ou lots concernés",
    "Suivre retours, devis et questions",
    "Comparer offres et risques",
    "Tracer la décision retenue",
  ]],
  [/offices & domaines|mission & projets|projet d’accueil/i, [
    "Clarifier mission, périmètre et priorités",
    "Définir publics, domaines ou projets suivis",
    "Mettre à jour règles, offres ou engagements",
    "Partager les éléments structurants à l'équipe",
    "Revoir régulièrement ce qui doit évoluer",
  ]],
  [/prise de vue & tournage/i, [
    "Préparer lieux, matériel et autorisations",
    "Confirmer planning et personnes présentes",
    "Suivre prises réalisées et plans manquants",
    "Sauvegarder fichiers au bon endroit",
    "Préparer la suite postproduction",
  ]],
  [/séances & continuité|transmissions & santé/i, [
    "Préparer la séance ou transmission",
    "Noter les informations importantes",
    "Suivre évolution, alerte ou point sensible",
    "Planifier la prochaine étape",
    "Conserver une trace confidentielle et utile",
  ]],
  [/assortiment & prix|sélection & rayons|sélection & cave|rayons & produits frais|activités & services/i, [
    "Définir les gammes et produits à mettre en avant",
    "Mettre à jour prix, marges et conditions",
    "Identifier les références à pousser ou arrêter",
    "Vérifier cohérence vitrine, rayons et stock",
    "Préparer les temps forts commerciaux",
  ]],
  [/vente & caisse|caisse & panier moyen|caisse & pertes|caisse & marge rayon|caisse & écarts/i, [
    "Suivre ventes, encaissements et écarts de caisse",
    "Contrôler panier moyen et produits vendus",
    "Repérer remises, pertes ou anomalies",
    "Rapprocher caisse, tickets et paiements",
    "Identifier les leviers de marge",
  ]],
  [/cadrage & maquettes/i, [
    "Recueillir objectifs, contenus et contraintes client",
    "Valider arborescence, parcours et maquettes",
    "Lister les contenus ou accès manquants",
    "Faire confirmer le périmètre avant production",
    "Tracer les demandes de changement",
  ]],
  [/développement & recette/i, [
    "Planifier les tâches de production",
    "Suivre intégration, contenus et fonctionnalités",
    "Tester les parcours importants",
    "Corriger les retours avant mise en ligne",
    "Obtenir la validation client",
  ]],
  [/maintenance & support|activation & support|clients & support/i, [
    "Centraliser demandes support et incidents",
    "Prioriser urgences, bugs et petites évolutions",
    "Informer le client de l'avancement",
    "Clôturer avec une trace claire",
    "Repérer les demandes récurrentes à industrialiser",
  ]],
  [/commercial & admissions|candidats & admissions|inscriptions élèves|acquisition & inscriptions/i, [
    "Qualifier la demande entrante",
    "Identifier profil, objectif et prérequis",
    "Vérifier financement ou prise en charge possible",
    "Envoyer programme, devis ou dossier d'inscription",
    "Relancer les dossiers chauds",
  ]],
  [/dossiers & financements|entreprises & contrats/i, [
    "Collecter les pièces nécessaires",
    "Vérifier OPCO, CPF ou financement entreprise",
    "Préparer convention, contrat ou dossier OPCO",
    "Suivre accords, refus et pièces manquantes",
    "Garder les preuves utiles",
  ]],
  [/sessions & accompagnement|alternance & suivi apprentis/i, [
    "Planifier dates, salles ou visios",
    "Confirmer formateurs, intervenants et apprenants",
    "Envoyer convocations et accès",
    "Suivre présence, émargements et progression",
    "Traiter absences, reports ou abandons",
  ]],
  [/demandes? chantier|demandes?, .*devis|urgences?, .*devis|dépannages?, .*devis|projets? client.*devis/i, [
    "Qualifier la demande client",
    "Vérifier urgence, adresse, accès et contraintes",
    "Récupérer photos, plans ou mesures utiles",
    "Planifier une visite si nécessaire",
    "Chiffrer main-d'œuvre, matériaux et marge",
    "Envoyer le devis",
    "Relancer les devis ouverts",
  ]],
  [/planning chantier|planning interventions|planning atelier|planning carrosserie|planning météo/i, [
    "Prioriser les dossiers ou interventions signés",
    "Bloquer les dates et ressources nécessaires",
    "Confirmer équipe, matériel et client",
    "Anticiper dépendances, météo ou accès",
    "Mettre à jour le planning en cas d'imprévu",
  ]],
  [/cabines? & planning|planning fauteuils|planning prestations/i, [
    "Organiser les créneaux par durée de prestation",
    "Affecter cabines, fauteuils ou praticiennes",
    "Confirmer les rendez-vous",
    "Limiter les trous dans le planning",
    "Gérer annulations et no-show",
  ]],
  [/produits? & matériel|produits? & stock/i, [
    "Suivre produits cabine, revente et consommables",
    "Vérifier seuils, ruptures et péremptions",
    "Commander au bon moment",
    "Contrôler les écarts entre usage et stock",
    "Identifier les produits à pousser",
  ]],
  [/cuisine & service/i, [
    "Préparer la mise en place avant le service",
    "Coordonner cuisine et salle",
    "Suivre temps d'attente et incidents",
    "Adapter les priorités pendant le rush",
    "Clôturer les retours importants après service",
  ]],
  [/stocks? & fournisseurs|matières? & réassort|matériaux? & fournisseurs|matériel & fournisseurs/i, [
    "Lister les besoins par activité ou chantier",
    "Vérifier disponibilité, prix et délais",
    "Commander au bon moment",
    "Suivre livraisons, ruptures et écarts",
    "Rattacher les achats au bon dossier",
  ]],
  [/courses? & planning|tournées? & zones|planning flotte|planning trajets/i, [
    "Planifier trajets, tournées ou zones",
    "Confirmer véhicules et conducteurs",
    "Limiter les temps morts et kilomètres inutiles",
    "Suivre retards, incidents et changements",
    "Mettre à jour le client ou le donneur d'ordre",
  ]],
  [/clients? & rendez-vous atelier|clients?, atelier & sinistres|demandes? & tickets réparation/i, [
    "Qualifier la demande ou le sinistre",
    "Créer le dossier atelier",
    "Établir diagnostic, devis ou accord",
    "Commander les pièces nécessaires",
    "Informer le client sur délai et restitution",
  ]],
];

const PRIORITY_ACTIONS: Array<[RegExp, string[]]> = [
  [/visibilit|acquisition|vitrine|diffusion|fréquentation|réservation|fidélisation|contenu|audience|communauté/i, [
    "Publier les offres ou prestations à montrer",
    "Mettre à jour Google, réseaux sociaux ou canaux utiles",
    "Collecter et afficher les avis clients",
    "Qualifier les demandes entrantes",
    "Transformer les demandes en rendez-vous ou commandes",
    "Relancer les clients à potentiel",
  ]],
  [/facturation|paiement|caisse|marge|rentabilité|honoraire|commission|budget|trésorerie|encaissement|loyer|opco|coût|revenu|abonnement|prime|émolument|frais|valorisation|rendement/i, [
    "Suivre ce qui est signé, facturé et encaissé",
    "Comparer le prévu avec le réel",
    "Repérer les montants non facturés",
    "Relancer les paiements en attente",
    "Mettre à jour la marge ou le reste à encaisser",
  ]],
  [/équipe|intervenant|sous-traitant|prestataire|chauffeur|agent|moniteur|coach|praticien|bénévole|extra|clerc|apporteur|renfort|remplacement|habilitations/i, [
    "Attribuer les responsabilités",
    "Confirmer disponibilités et compétences",
    "Partager consignes, accès et priorités",
    "Suivre charge, absences et remplacements",
    "Clarifier qui décide en cas de blocage",
  ]],
  [/qualité|conformité|réserve|réception|preuve|qualiopi|haccp|hygiène|sécurité|traçabilité|confidentialité|agrément|norme|licence|obligation/i, [
    "Vérifier les points obligatoires",
    "Identifier les écarts ou réserves",
    "Planifier les corrections",
    "Faire valider la conformité",
    "Archiver les preuves utiles",
  ]],
];

function uniqueItems(items: string[]) {
  return [...new Set(items.map((item) => item.trim()).filter(Boolean))];
}

export function buildChecklistForBusinessBlock(block: BusinessModelBlock): string[] {
  const specific = SPECIFIC_ACTIONS.find(([pattern]) => pattern.test(block.title));

  if (specific) {
    return specific[1];
  }

  const priority = PRIORITY_ACTIONS.find(([pattern]) => pattern.test(block.title));

  if (priority) {
    return priority[1];
  }

  const actions = TERM_ACTIONS.flatMap(([pattern, items]) => (
    pattern.test(block.title) ? items : []
  ));

  return uniqueItems(actions.length ? actions : FALLBACK_ACTIONS).slice(0, 7);
}

export function buildBusinessBlockChecklists(blocks: BusinessModelBlock[]): BusinessBlockChecklist[] {
  return blocks.map((block) => ({
    title: block.title,
    checklist: buildChecklistForBusinessBlock(block),
  }));
}
