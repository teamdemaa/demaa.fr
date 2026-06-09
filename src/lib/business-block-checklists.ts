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
  "Lister les informations à vérifier",
  "Définir la prochaine action",
  "Attribuer un responsable",
  "Suivre les points ouverts",
  "Garder une trace exploitable",
];

const SPECIFIC_ACTIONS: Array<[RegExp, string[]]> = [
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
    "Prioriser les chantiers ou interventions signés",
    "Bloquer les dates d'intervention",
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
