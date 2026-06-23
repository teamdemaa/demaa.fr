export interface CourseEntry {
  slug: string;
  title: string;
  seoTitle?: string;
  date: string;
  featuredRank?: number;
  description: string;
  seoDescription?: string;
  content: string;
  category: string;
  image?: string;
  slides?: string[];
  presentationOnly?: boolean;
  tags: string[];
  duration: string;
  faq?: Array<{
    question: string;
    answer: string;
  }>;
}

const courseEntries: CourseEntry[] = [
  {
    slug: "obligations-finances-entreprise",
    title: "Maîtriser les obligations et les finances de son entreprise",
    seoTitle: "Maîtriser les obligations et les finances de son entreprise",
    date: "2026-06-23",
    featuredRank: 1,
    description:
      "Un support visuel pour clarifier les obligations fiscales, sociales, comptables et les risques à anticiper quand on pilote une petite entreprise.",
    seoDescription:
      "Slides Demaa pour mieux comprendre les obligations et les points de vigilance financiers d'une petite entreprise.",
    category: "Obligations & pilotage",
    image: "/images/courses/obligations-finances/01.png",
    slides: [
      "/images/courses/obligations-finances/01.png",
      "/images/courses/obligations-finances/02.png",
      "/images/courses/obligations-finances/03.png",
      "/images/courses/obligations-finances/04.png",
      "/images/courses/obligations-finances/05.png",
    ],
    presentationOnly: true,
    tags: ["cours", "obligations", "fiscal", "comptabilité"],
    duration: "5 slides",
    content: "",
  },
  {
    slug: "facture-electronique",
    title: "La facturation électronique",
    seoTitle: "La facturation électronique : ce qui va changer pour votre entreprise",
    date: "2026-06-23",
    featuredRank: 2,
    description:
      "Les dates à retenir, les obligations à distinguer et les actions concrètes à vérifier pour préparer votre entreprise à la réforme.",
    seoDescription:
      "Support Demaa sur la facture électronique avec les échéances 2026-2027, les cas d'usage et la checklist opérationnelle.",
    category: "Conformité & gestion",
    image: "/images/courses/facturation-electronique/01.png",
    slides: [
      "/images/courses/facturation-electronique/01.png",
      "/images/courses/facturation-electronique/02.png",
      "/images/courses/facturation-electronique/03.png",
      "/images/courses/facturation-electronique/04.png",
      "/images/courses/facturation-electronique/05.png",
      "/images/courses/facturation-electronique/06.png",
      "/images/courses/facturation-electronique/07.png",
      "/images/courses/facturation-electronique/08.png",
      "/images/courses/facturation-electronique/09.png",
    ],
    presentationOnly: true,
    tags: ["cours", "facturation", "réforme", "conformité"],
    duration: "9 slides",
    content: "",
  },
  {
    slug: "systeme-marketing-vente",
    title: "Construire un système marketing & vente",
    seoTitle: "Construire un système marketing et vente",
    date: "2026-06-23",
    featuredRank: 3,
    description:
      "Une étude de cas simple pour visualiser comment attirer, convertir et fidéliser avec un plan d'action concret sur trois mois.",
    seoDescription:
      "Support Demaa sur la construction d'un système marketing et vente avec étude de cas et plan d'action sur trois mois.",
    category: "Marketing & vente",
    image: "/images/courses/systeme-marketing/01.png",
    slides: [
      "/images/courses/systeme-marketing/01.png",
      "/images/courses/systeme-marketing/02.png",
      "/images/courses/systeme-marketing/03.png",
      "/images/courses/systeme-marketing/04.png",
      "/images/courses/systeme-marketing/05.png",
    ],
    presentationOnly: true,
    tags: ["cours", "marketing", "vente", "système"],
    duration: "5 slides",
    content: "",
  },
];

export function getAllCourseEntries(): CourseEntry[] {
  return [...courseEntries].sort((a, b) => {
    const rankA = a.featuredRank ?? Number.MAX_SAFE_INTEGER;
    const rankB = b.featuredRank ?? Number.MAX_SAFE_INTEGER;

    if (rankA !== rankB) return rankA - rankB;
    if (a.date < b.date) return 1;
    if (a.date > b.date) return -1;
    return a.title.localeCompare(b.title, "fr");
  });
}

export function getCourseEntryBySlug(slug: string): CourseEntry | null {
  return courseEntries.find((entry) => entry.slug === slug) ?? null;
}
