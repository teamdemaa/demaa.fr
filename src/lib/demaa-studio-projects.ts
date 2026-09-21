export type DemaaStudioProject = {
  slug: string;
  name: string;
  href?: string;
  logo?: string;
  sector: string;
  status: string;
  summary: string;
  problem: string;
  solution: string;
  need?: string;
  objective?: string;
};

export type DemaaStudioOpportunity = {
  slug: string;
  projectSlug: string;
  projectName: string;
  sector: string;
  title: string;
  description: string;
};

export const DEMAA_STUDIO_PROJECTS: readonly DemaaStudioProject[] = [
  {
    slug: "tiimora", name: "Tiimora", href: "https://www.tiimora.com/", logo: "/portfolio/tiimora-logo.svg", sector: "Cabinets comptables", status: "Projet actif · Équipe constituée",
    summary: "Un cockpit qui rend le suivi client et l’exécution plus lisibles pour les cabinets comptables.",
    problem: "Les demandes, documents et relances sont dispersés, ce qui rend la relation client difficile à suivre.",
    solution: "Un espace commun pour centraliser les demandes, les documents et les prochaines actions.",
  },
  {
    slug: "oryka", name: "Oryka", href: "https://pointage-2.vercel.app/", logo: "/portfolio/oryka-logo.svg", sector: "Équipes terrain", status: "Version en ligne",
    summary: "Un outil de pointage et de suivi pensé pour les équipes qui travaillent sur le terrain.",
    problem: "Les présences, les plannings et le suivi des chantiers restent souvent éparpillés.",
    solution: "Un outil simple pour planifier les équipes, suivre les présences et garder chaque chantier sous contrôle.",
  },
  {
    slug: "revyo", name: "Revyo", href: "https://revio-gules.vercel.app/", logo: "/portfolio/revyo-logo.svg", sector: "Restaurants", status: "Version en ligne",
    summary: "Une fidélité digitale simple, conçue pour transformer chaque passage en relation durable.",
    problem: "Les restaurants ont peu de moyens simples pour entretenir une relation directe avec leurs clients réguliers.",
    solution: "Un parcours de fidélité digital facile à utiliser, pour prolonger le lien après la visite.",
  },
  {
    slug: "jagoya", name: "Jagoya", sector: "Commerce B2B2C", status: "Projet en cours",
    summary: "Une plateforme B2B qui relie producteurs et marques africaines à des revendeurs.",
    problem: "Les producteurs et marques africaines accèdent difficilement aux revendeurs étrangers et gèrent seuls une logistique complexe.",
    solution: "Une plateforme qui facilite la découverte, la commande et l’acheminement jusqu’aux revendeurs.",
  },
  {
    slug: "sira", name: "Sira", sector: "SaaS", status: "Projet en cours",
    summary: "Un logiciel de gestion conçu pour les commerçants africains.",
    problem: "De nombreux commerçants manquent de visibilité sur leurs ventes, leurs stocks, leurs marges et les crédits accordés.",
    solution: "Un outil de gestion ancré dans leur quotidien, plus fiable qu’un cahier et plus simple qu’un tableur.",
  },
  {
    slug: "tendera", name: "Tendera", sector: "SaaS", status: "Projet en cours",
    summary: "Un espace public et professionnel commun pour organiser contenus et ressources.",
    problem: "Les organisations dispersent leurs contenus, leurs ressources et leurs échanges entre trop d’outils.",
    solution: "Un espace cohérent qui relie la présence publique et le travail des équipes.",
  },
  {
    slug: "kurata", name: "Kurata", sector: "SaaS", status: "Projet en cours",
    summary: "Une sélection éditoriale publique, alimentée par une donnée structurée.",
    problem: "Transformer une donnée structurée en sélection publique impose souvent de reconstruire un site à chaque fois.",
    solution: "Un système qui organise la donnée puis la rend lisible dans une expérience éditoriale.",
  },
  {
    slug: "dumaan-food", name: "Dumaan Food", sector: "FoodTech", status: "Projet en cours",
    summary: "Des plats ouest-africains prêts à déguster, pensés pour le quotidien.",
    problem: "Les personnes qui aiment la cuisine ouest-africaine trouvent peu de repas pratiques sans compromis sur le goût et la qualité.",
    solution: "Une marque de plats prêts à déguster, fidèle aux goûts et adaptée aux rythmes de vie actuels.",
  },
  {
    slug: "natural-mande", name: "Natural Mandé", sector: "Commerce B2B2C", status: "Projet en cours",
    summary: "Une sélection de produits naturels pensée pour les restaurateurs africains.",
    problem: "Les restaurateurs africains trouvent difficilement des produits naturels réguliers, adaptés à leur cuisine et à leurs volumes.",
    solution: "Une sélection de mil, fonio et infusions conçue pour leurs usages professionnels.",
  },
  {
    slug: "djaty", name: "Djaty", sector: "Immobilier", status: "Projet en cours",
    summary: "Des maisons de vacances sélectionnées pour les séjours personnels et les retraites d’équipe.",
    problem: "Trouver une maison adaptée à un séjour ou une retraite d’équipe suppose de comparer une offre dispersée et peu lisible.",
    solution: "Une sélection claire de maisons, avec une organisation du séjour et une prise de contact simplifiées.",
  },
  {
    slug: "the-done-studio", name: "The Done Studio", sector: "Formation & emploi", status: "Association partenaire",
    summary: "Une association qui aide les petites entreprises à recruter et intégrer des alternants opérationnels.",
    problem: "Les petites entreprises ont besoin de renfort mais manquent de temps et de ressources pour recruter, former et accompagner un alternant toute l’année.",
    solution: "The Done Studio réunit recrutement, formation et accompagnement des missions pour que l’alternant soit réellement épaulé dans son emploi.",
    need: "Des entreprises prêtes à accueillir un alternant et à construire un cadre de travail utile.",
    objective: "Faire du recrutement d’alternants un levier d’exécution durable, porté par l’association.",
  },
  {
    slug: "awamali", name: "Awamali", sector: "À clarifier", status: "Projet en étude",
    summary: "Un projet actuellement en cadrage au sein du studio.",
    problem: "Le besoin et le périmètre restent à préciser avec les personnes concernées.",
    solution: "Le Studio clarifie d’abord l’usage, le marché et les conditions d’exécution avant de construire.",
  },
  {
    slug: "levier", name: "Levier", sector: "Finance", status: "Projet en cours",
    summary: "Un cockpit de pilotage financier pour rendre les décisions plus lisibles.",
    problem: "Les données financières restent souvent difficiles à relier aux décisions quotidiennes.",
    solution: "Levier transforme les données financières en scénarios, indicateurs et décisions actionnables.",
  },
  {
    slug: "mnd", name: "MND", sector: "À clarifier", status: "Projet en étude",
    summary: "Un projet en cours de cadrage au sein du studio.",
    problem: "Le besoin et le périmètre restent à préciser avant toute exécution.",
    solution: "Le Studio prend le temps de définir une proposition solide avant de lui donner une forme publique.",
  },
  {
    slug: "lafiasso", name: "Lafiasso", sector: "Immobilier", status: "Projet en cours",
    summary: "Les programmes immobiliers d’Afrique de l’Ouest réunis au même endroit.",
    problem: "Les programmes immobiliers sont dispersés entre de nombreux promoteurs et difficiles à trouver puis à comparer.",
    solution: "Une plateforme qui centralise les programmes, structure les informations essentielles et facilite comparaison et prise de contact.",
    need: "Un catalogue fiable et un réseau de promoteurs pour enrichir l’offre.",
    objective: "Construire le premier catalogue structuré des programmes immobiliers de la zone.",
  },
  {
    slug: "afrotaste", name: "AfroTaste", sector: "Média & contenu", status: "Projet à construire",
    summary: "Un média qui raconte les cuisines et produits afro avec exigence et simplicité.",
    problem: "Les cuisines et produits afro font partie du quotidien mais restent sous-représentés dans les médias.",
    solution: "Un média qui produit et diffuse des contenus réguliers pour faire découvrir cet univers.",
  },
  {
    slug: "afro-hair-academy", name: "Afro Hair Academy", sector: "Formation & emploi", status: "Projet à construire",
    summary: "Une école et un institut de coiffure afro où la formation s’appuie sur de vrais cas.",
    problem: "Les élèves trouvent peu de formations pratiques spécialisées et les clientes peinent à identifier une expertise fiable.",
    solution: "Un lieu hybride qui réunit école et institut ouvert au public, avec une pratique encadrée.",
  },
  {
    slug: "kalan", name: "Kalan", sector: "Formation & emploi", status: "Projet à construire",
    summary: "Des formations concrètes pour préparer les jeunes Africains aux métiers qui recrutent.",
    problem: "De nombreux jeunes manquent de formations directement alignées avec les besoins réels du marché du travail.",
    solution: "Des parcours professionnalisants construits à partir des métiers qui recrutent et des compétences prioritaires.",
  },
];

export const DEMAA_STUDIO_OPPORTUNITIES: readonly DemaaStudioOpportunity[] = [
  {
    slug: "cofondateur-media-afro-food", projectSlug: "afrotaste", projectName: "AfroTaste", sector: "Média & contenu",
    title: "Recherche cofondateur·rice pour lancer AfroTaste",
    description: "Une personne qui aime raconter, produire et diffuser des contenus autour des cuisines et produits afro. La ligne éditoriale, les formats et les rôles seront construits ensemble.",
  },
  {
    slug: "cofondateur-afro-hair-academy", projectSlug: "afro-hair-academy", projectName: "Afro Hair Academy", sector: "Formation & emploi",
    title: "Recherche cofondateur·rice pour développer Afro Hair Academy",
    description: "Une personne pour construire et développer l’école-institut aux côtés du porteur de projet. Les priorités, le rôle et les responsabilités seront définis ensemble.",
  },
  {
    slug: "cofondateur-kalan", projectSlug: "kalan", projectName: "Kalan", sector: "Formation & emploi",
    title: "Recherche cofondateur·rice pour développer Kalan",
    description: "Une personne pour construire des formations alignées avec les besoins réels du marché du travail africain. Les premiers parcours et les responsabilités seront définis ensemble.",
  },
];

export function getDemaaStudioProject(slug: string) {
  return DEMAA_STUDIO_PROJECTS.find((project) => project.slug === slug);
}
