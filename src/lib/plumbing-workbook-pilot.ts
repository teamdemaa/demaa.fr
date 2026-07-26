export type PlumbingPilotTeamRole = {
  role: string;
  manager: string;
  mainResponsibility: string;
  relatedProcesses: string;
};

/**
 * Rôles recommandés à afficher dans le modèle vierge.
 *
 * Les colonnes Personne, Situation et Date cible restent volontairement
 * vides : une même personne peut cumuler plusieurs rôles dans une TPE.
 */
export const plumbingPilotTeamRoles: PlumbingPilotTeamRole[] = [
  {
    role: "Dirigeant",
    manager: "",
    mainResponsibility:
      "Fixer les priorités, arbitrer les exceptions et suivre les résultats.",
    relatedProcesses:
      "Cap annuel, autorité, accès essentiels et point mensuel",
  },
  {
    role: "Administration et facturation",
    manager: "Dirigeant",
    mainResponsibility:
      "Tenir les dossiers, les échéances, la facturation et les relances.",
    relatedProcesses:
      "Rentabilité, paiements, encaissements et fidélisation client",
  },
  {
    role: "Commercial et relation client",
    manager: "Dirigeant",
    mainResponsibility:
      "Qualifier les demandes, suivre les devis et entretenir la relation client.",
    relatedProcesses:
      "Acquisition, devis, avis, rappels et réclamations",
  },
  {
    role: "Responsable de chantier",
    manager: "Dirigeant",
    mainResponsibility:
      "Préparer, coordonner, suivre et clôturer les chantiers.",
    relatedProcesses:
      "Avancement, démarrage, réception, aléas et équipes",
  },
  {
    role: "Référent technique",
    manager: "Dirigeant",
    mainResponsibility:
      "Définir les standards techniques et contrôler la qualité des interventions.",
    relatedProcesses:
      "Checklists techniques, réception et conformité",
  },
  {
    role: "Planification des équipes",
    manager: "Dirigeant",
    mainResponsibility:
      "Construire le planning et organiser les remplacements.",
    relatedProcesses:
      "Planning, compétences, absences et intégration",
  },
  {
    role: "Référent sécurité",
    manager: "Dirigeant",
    mainResponsibility:
      "Suivre les assurances, habilitations, EPI et contrôles obligatoires.",
    relatedProcesses:
      "Sécurité, assurances et chantiers sensibles",
  },
  {
    role: "Achats et stock",
    manager: "Dirigeant",
    mainResponsibility:
      "Anticiper les besoins, passer les commandes et contrôler les livraisons.",
    relatedProcesses:
      "Stock, matériel, commandes et fournisseurs",
  },
  {
    role: "Technicien plombier-chauffagiste",
    manager: "Responsable de chantier",
    mainResponsibility:
      "Réaliser les interventions, documenter l’avancement et signaler les écarts.",
    relatedProcesses:
      "Chantiers, checklists techniques, sécurité et matériel",
  },
];
