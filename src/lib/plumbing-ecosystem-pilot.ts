const EM2A_FIRM_NAME = "EM2A Expertise";
const EM2A_PROFILE_URL =
  "https://demaa.co/annuaire-experts-comptables/cabinets/em2a-expertise";

export type PlumbingPilotEcosystemRecommendation = {
  category:
    | "Outil métier"
    | "Professionnel"
    | "Fournisseur"
    | "Banque / assurance / financement";
  need: string;
  name: string;
  recommendation: string;
  initialStatus: "À comparer" | "À étudier";
  cost: string;
  url: string;
  note: string;
};

/**
 * Point de départ du modèle vierge, pas une liste d'affiliation imposée.
 *
 * Les logiciels sont présentés par cas d'usage afin que le dirigeant n'en
 * choisisse qu'un lorsque leurs fonctions se recouvrent.
 */
export const plumbingPilotEcosystemRecommendations: PlumbingPilotEcosystemRecommendation[] =
  [
    {
      category: "Outil métier",
      need: "Devis, factures, commandes et interventions",
      name: "Obat",
      recommendation:
        "Utiliser Obat comme logiciel central pour les devis, factures, acomptes, situations de travaux et suivi de chantier.",
      initialStatus: "À comparer",
      cost: "Voir tarif actuel",
      url: "https://demaa.co/annuaire-outils/obat",
      note: "Ne pas cumuler par défaut avec un autre logiciel de gestion complet.",
    },
    {
      category: "Outil métier",
      need: "Planning des équipes et suivi de plusieurs chantiers",
      name: "Alobees",
      recommendation:
        "Ajouter Alobees si la priorité est de coordonner plusieurs équipes, les heures et l’avancement des chantiers.",
      initialStatus: "À comparer",
      cost: "Voir tarif actuel",
      url: "https://demaa.co/annuaire-outils/alobees",
      note: "Particulièrement pertinent à partir de plusieurs salariés terrain.",
    },
    {
      category: "Outil métier",
      need: "Formulaires, photos, signatures et rapports terrain",
      name: "Kizeo Forms",
      recommendation:
        "Ajouter Kizeo Forms pour remplacer les fiches papier par des formulaires, photos, signatures et rapports terrain.",
      initialStatus: "À comparer",
      cost: "Voir tarif actuel",
      url: "https://demaa.co/annuaire-outils/kizeo-forms",
      note: "Utile pour les fiches d’intervention, contrôles, PV et rapports.",
    },
    {
      category: "Outil métier",
      need: "Visibilité locale et avis clients",
      name: "Google Business Profile",
      recommendation:
        "Créer et tenir à jour Google Business Profile pour apparaître localement et collecter les avis clients.",
      initialStatus: "À étudier",
      cost: "Gratuit",
      url: "https://www.google.com/intl/fr_fr/business/",
      note: "Renseigner zones, horaires, téléphone, services, photos et lien d’avis.",
    },
    {
      category: "Professionnel",
      need: "Comptabilité, TVA, paie et conseil",
      name: EM2A_FIRM_NAME,
      recommendation:
        "Pour la comptabilité, la TVA, la paie, le bilan et le conseil.",
      initialStatus: "À étudier",
      cost: "Sur devis",
      url: EM2A_PROFILE_URL,
      note: "Cabinet inscrit à l’Ordre des experts-comptables.",
    },
    {
      category: "Fournisseur",
      need: "Pièces de plomberie, chauffage et sanitaire",
      name: "CEDEO",
      recommendation:
        "Utiliser CEDEO comme fournisseur principal pour les pièces techniques, retraits en agence et livraisons chantier.",
      initialStatus: "À comparer",
      cost: "Selon commandes",
      url: "https://demaa.co/annuaire-fournisseurs/cedeo-pro",
      note: "Fournisseur critique principal recommandé pour la plomberie et le chauffage.",
    },
    {
      category: "Fournisseur",
      need: "Outillage, consommables, visserie et EPI",
      name: "Würth",
      recommendation:
        "Utiliser Würth pour l’outillage, la visserie, les consommables techniques et les équipements de protection.",
      initialStatus: "À comparer",
      cost: "Selon commandes",
      url: "https://demaa.co/annuaire-fournisseurs/wurth",
      note: "Comparer les conditions professionnelles et conserver une liste d’articles récurrents.",
    },
    {
      category: "Fournisseur",
      need: "Location ponctuelle de matériel de chantier",
      name: "Kiloutou",
      recommendation:
        "Utiliser Kiloutou pour louer le matériel nécessaire ponctuellement plutôt que l’acheter sans usage récurrent.",
      initialStatus: "À comparer",
      cost: "Selon location",
      url: "https://demaa.co/annuaire-fournisseurs/kiloutou",
      note: "Comparer le coût complet de location, la disponibilité et le retrait chantier.",
    },
    {
      category: "Banque / assurance / financement",
      need: "Décennale, responsabilité civile et financement",
      name: "Orus",
      recommendation:
        "Demander un devis Orus pour la RC Pro, la multirisque et la décennale correspondant aux activités déclarées.",
      initialStatus: "À comparer",
      cost: "Sur devis",
      url: "https://demaa.co/annuaire-fournisseurs/orus",
      note: "Faire confirmer les garanties avant toute nouvelle activité.",
    },
  ];
