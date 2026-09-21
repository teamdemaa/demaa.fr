type DemaaStudioProject = {
  name: string;
  href?: string;
  logo?: string;
  sector: string;
  problem: string;
  status: string;
};

export const DEMAA_STUDIO_PROJECTS: readonly DemaaStudioProject[] = [
  {
    name: "Tiimora",
    href: "https://www.tiimora.com/",
    logo: "/portfolio/tiimora-logo.svg",
    sector: "Cabinets comptables",
    problem:
      "Centraliser les demandes, les documents et les relances pour que la relation client reste claire.",
    status: "Projet actif · Équipe constituée",
  },
  {
    name: "Oryka",
    href: "https://pointage-2.vercel.app/",
    logo: "/portfolio/oryka-logo.svg",
    sector: "Équipes terrain",
    problem:
      "Planifier les équipes, suivre les présences et garder chaque chantier sous contrôle.",
    status: "Version en ligne",
  },
  {
    name: "Revyo",
    href: "https://revio-gules.vercel.app/",
    logo: "/portfolio/revyo-logo.svg",
    sector: "Restaurants",
    problem:
      "Transformer chaque passage en relation durable avec une fidélité digitale simple à utiliser.",
    status: "Version en ligne",
  },
  {
    name: "Jagoya",
    sector: "Commerce B2B2C",
    problem: "Relier des producteurs et créateurs africains à des revendeurs, avec une relation commerciale plus simple.",
    status: "Projet en cours",
  },
  {
    name: "Sira",
    sector: "SaaS",
    problem: "Reprendre et simplifier un produit existant pour le rendre plus utile à ses utilisateurs.",
    status: "Projet en cours",
  },
  {
    name: "Tendera",
    sector: "SaaS",
    problem: "Donner aux organisations un site public et un espace professionnel commun pour leurs contenus et ressources.",
    status: "Projet en cours",
  },
  {
    name: "Kurata",
    sector: "SaaS",
    problem: "Transformer une donnée structurée en sélection éditoriale publique, sans reconstruire un site à chaque fois.",
    status: "Projet en cours",
  },
  {
    name: "Dumaan Food",
    sector: "FoodTech",
    problem: "Rassembler recettes, contenus et outils de planification alimentaire dans une expérience mobile.",
    status: "Projet en cours",
  },
  {
    name: "Natural Mandé",
    sector: "Commerce B2B2C",
    problem: "Faciliter l’accès des restaurateurs africains à des produits naturels sélectionnés pour leurs usages.",
    status: "Projet en cours",
  },
  {
    name: "Diaty",
    sector: "Immobilier",
    problem: "Sélectionner des maisons de vacances et simplifier l’organisation de séjours personnels ou d’équipe.",
    status: "Projet en cours",
  },
  {
    name: "Recherche Alternance",
    sector: "Formation & emploi",
    problem: "Faciliter la découverte de profils, de formations et les demandes de mise en relation en alternance.",
    status: "Projet en cours",
  },
  {
    name: "Awamali",
    sector: "À clarifier",
    problem: "Projet en cours de cadrage au sein du studio.",
    status: "Projet en étude",
  },
  {
    name: "Levier",
    sector: "Finance",
    problem: "Rendre les données financières, les scénarios et leurs impacts plus lisibles pour décider.",
    status: "Projet en cours",
  },
  {
    name: "MND",
    sector: "À clarifier",
    problem: "Projet en cours de cadrage au sein du studio.",
    status: "Projet en étude",
  },
  {
    name: "Lafiasso",
    sector: "Immobilier",
    problem: "Rassembler les programmes immobiliers d’Afrique de l’Ouest pour les rendre comparables et accessibles.",
    status: "Projet en cours",
  },
];
