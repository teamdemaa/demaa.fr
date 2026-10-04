import { ARCHIVED_STUDIO_PROJECTS, type DemaaStudioProject as ArchivedProject } from "./demaa-studio-archive";

export type DemaaStudioProject = ArchivedProject & {
  pole: string;
  portfolio: "priority" | "pipeline" | "other" | "archive";
  image?: string;
  imageAlt?: string;
};

const primaryProjects: readonly DemaaStudioProject[] = [
  {
    slug: "tiimora", name: "Tiimora", href: "https://www.tiimora.com/", sector: "Cabinets comptables", pole: "Tech & services", portfolio: "priority", status: "En phase pilote",
    summary: "Le logiciel opérationnel des cabinets comptables : clients, demandes, documents et échéances au même endroit.",
    problem: "Les demandes clients, les pièces et les échéances sont dispersées. Leur suivi repose trop souvent sur des relances manuelles.",
    solution: "Un espace commun pour suivre les clients, les prochaines actions et les échéances fiscales et sociales.",
    image: "/images/studio/tiimora-v3.webp", imageAlt: "Interface actuelle de Tiimora sur ordinateur et mobile, avec des données de démonstration",
  },
  {
    slug: "dumaan-food", name: "Dumaan", sector: "Restauration professionnelle", pole: "Alimentation B2B", portfolio: "priority", status: "En test",
    summary: "Des pastels, préparations de mafé et légumes découpés surgelés pour les restaurants et traiteurs.",
    problem: "La préparation de recettes ouest-africaines demande du temps et une régularité d’approvisionnement que les équipes doivent assurer chaque semaine.",
    solution: "Des pastels, préparations de mafé et légumes découpés surgelés, conditionnés pour les cuisines professionnelles.",
    image: "/images/studio/dumaan-restauration-v3.webp", imageAlt: "Visuel de concept Dumaan : livraison de grands conditionnements surgelés de pastels, mafé et légumes découpés à une restauratrice",
  },
  {
    slug: "mnd", name: "MND", sector: "Média & commerce", pole: "Média & commerce", portfolio: "other", status: "En test",
    summary: "Un média pour découvrir les produits et les usages ouest-africains, avec une activité e-commerce dans un second temps.",
    problem: "Les produits sont dispersés et leurs usages parfois difficiles à découvrir. Composer une recette complète demande plusieurs achats.",
    solution: "Du contenu pour découvrir les produits et des lots réunissant une recette et ses ingrédients, puis des sélections autour du style, du soin et de la maison.",
    image: "/images/studio/mnd.webp", imageAlt: "Visuel de concept MND : préparation d’un repas avec du fonio et du bissap",
  },
  {
    slug: "jagoya", name: "Jago", sector: "Commerce B2B", pole: "Tech & services", portfolio: "priority", status: "En test",
    summary: "Une plateforme de vente en gros qui relie les marques africaines aux revendeurs.",
    problem: "Les marques africaines accèdent difficilement aux revendeurs et doivent organiser seules la présentation de leur offre et les commandes.",
    solution: "Une plateforme B2B pour découvrir les marques, comparer leurs produits et commander en gros.",
    image: "/images/studio/jago.webp", imageAlt: "Visuel de concept Jago : présentation de produits africains et d’un catalogue B2B",
  },
  {
    slug: "tendera", name: "Tendera", sector: "BTP", pole: "Tech & services", portfolio: "pipeline", status: "Concept en préparation",
    summary: "Des appels d’offres BTP plus faciles à identifier et à préparer, avec l’aide de l’IA.",
    problem: "Identifier les appels d’offres pertinents et préparer les dossiers mobilise un temps important pour les entreprises du BTP.",
    solution: "Un service pour repérer les opportunités, comprendre les pièces attendues et aider à préparer les réponses.",
    image: "/images/studio/tendera.webp", imageAlt: "Visuel de concept Tendera autour des appels d’offres du bâtiment",
  },
  {
    slug: "kahe", name: "Kahé", sector: "Coffee shop", pole: "Concepts franchisés", portfolio: "pipeline", status: "Concept en préparation",
    summary: "Un concept de coffee shop inspiré du Mandé, pensé pour être développé en franchise.",
    problem: "Les saveurs et les cultures du Mandé trouvent encore peu de place dans les lieux de café du quotidien.",
    solution: "Un lieu de café et de rencontre qui réunit une identité inspirée du Mandé et une offre conçue pour être reproductible.",
    image: "/images/studio/kahe.webp", imageAlt: "Visuel de concept du coffee shop Kahé, dans des tons bois et sable",
  },
  {
    slug: "mandya", name: "Mandya", sector: "Bien-être", pole: "Concepts franchisés", portfolio: "pipeline", status: "Concept en préparation",
    summary: "Un concept de spa premium inspiré du Mandé, pensé pour être développé en franchise.",
    problem: "Les traditions de soin du Mandé sont peu représentées dans les offres de bien-être contemporaines.",
    solution: "Une expérience de spa qui associe ces inspirations à une qualité de service et à une organisation reproductibles.",
    image: "/images/studio/mandya.webp", imageAlt: "Visuel de concept du spa Mandya",
  },
  {
    slug: "lafiasso", name: "Lafiasso", sector: "Terrains & maisons", pole: "Immobilier", portfolio: "pipeline", status: "Concept en préparation",
    summary: "Une plateforme de vente de terrains en Afrique de l’Ouest, puis de maisons.",
    problem: "Les offres de terrains sont dispersées et les informations essentielles difficiles à réunir et comparer.",
    solution: "Une présentation structurée des terrains et de leurs informations, avec une mise en relation pour faire avancer les projets d’achat.",
    image: "/images/studio/lafiasso.webp", imageAlt: "Visuel de concept Lafiasso : terrain et travail de repérage en Afrique de l’Ouest",
  },
  {
    slug: "djaty", name: "Djaty", sector: "Rénovation", pole: "Immobilier", portfolio: "pipeline", status: "Concept en préparation",
    summary: "Un studio de rénovation spécialisé dans les maisons de vacances.",
    problem: "Rénover une maison de vacances demande de coordonner les choix, les travaux et les intervenants, souvent à distance.",
    solution: "Un accompagnement dédié à la rénovation, de la définition du projet au suivi de sa réalisation.",
    image: "/images/studio/djaty.webp", imageAlt: "Visuel de concept Djaty : maison de vacances rénovée",
  },
];

const primarySlugs = new Set(primaryProjects.map(({ slug }) => slug));
const otherPublicSlugs = new Set(["sini", "oryka", "revyo", "the-done-studio"]);

// Keep historical projects without publishing unconfirmed concepts as active.
export const DEMAA_STUDIO_PROJECTS: readonly DemaaStudioProject[] = [
  ...primaryProjects,
  ...ARCHIVED_STUDIO_PROJECTS.filter(({ slug }) => !primarySlugs.has(slug)).map((project): DemaaStudioProject => ({
    ...project, pole: project.sector, portfolio: otherPublicSlugs.has(project.slug) ? "other" : "archive",
  })),
];

export const DEMAA_PUBLISHED_STUDIO_PROJECTS = DEMAA_STUDIO_PROJECTS.filter(({ portfolio }) => portfolio !== "archive");
export const DEMAA_PRIORITY_STUDIO_PROJECTS = ["jagoya", "dumaan-food", "tiimora"].map(slug => primaryProjects.find(project => project.slug === slug)!);
export const DEMAA_STUDIO_POLES = ["Tech & services", "Concepts franchisés", "E-commerce", "Immobilier"] as const;

export function getDemaaStudioProject(slug: string) {
  return DEMAA_PUBLISHED_STUDIO_PROJECTS.find((project) => project.slug === slug);
}
