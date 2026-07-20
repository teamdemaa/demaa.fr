export type RecruitmentFamily = "Alternance" | "Recrutement";

export type DemaaRecruitmentItem = {
  slug: string;
  name: string;
  provider: string;
  family: RecruitmentFamily;
  category: string;
  shortDescription: string;
  description: string;
  bestFor: string;
  tags: string[];
  icon: string;
  usefulFor: string[];
  sectors: string[];
  href: string;
  cta: string;
  format?: string;
  location?: string;
};

export const recruitmentFamilies = [
  "Alternance",
  "Recrutement",
] as const satisfies readonly RecruitmentFamily[];

const demaaRecruitmentItems = [
  {
    slug: "bravus-akademy",
    name: "Bravus Akademy",
    provider: "Bravus Akademy",
    family: "Alternance",
    category: "École & alternance",
    shortDescription:
      "Un partenaire pour identifier et former des profils en alternance dans la vente, le digital, l’audiovisuel et le management.",
    description:
      "Centre de formation en apprentissage proposant des parcours certifiants et diplômants, en initial ou en alternance, notamment dans la vente, le digital, l’audiovisuel et le management.",
    bestFor:
      "Les entreprises qui veulent accueillir un alternant sur des fonctions commerciales, digitales, audiovisuelles ou de management.",
    tags: ["Alternance", "École", "Apprentissage"],
    icon: "GraduationCap",
    usefulFor: ["Alternance", "Sourcing", "Formation"],
    sectors: [
      "Conseil & services aux entreprises",
      "Tech & Digital",
      "BTP & services techniques",
      "Immobilier",
      "Hébergement & tourisme",
      "Patrimoine",
      "Mobilité & logistique",
      "Restauration",
      "Commerce & retail",
      "Santé, bien-être & esthétique",
      "Services aux particuliers",
      "Éducation & formation",
      "Industrie & production",
      "Automobile & réparation",
      "Associations & événements",
    ],
    href: "https://bravusakademy.com/",
    cta: "Découvrir Bravus",
    format: "École et CFA",
    location: "Bagneux (92)",
  },
  {
    slug: "la-bonne-alternance",
    name: "La bonne alternance",
    provider: "Beta.gouv / Ministère du Travail",
    family: "Alternance",
    category: "Alternance",
    shortDescription:
      "La porte d'entrée la plus claire pour une TPE qui veut recruter un alternant sans perdre du temps à chercher les bons relais.",
    description:
      "Plateforme publique pour identifier des offres d'alternance, des entreprises qui recrutent et des pistes concrètes pour structurer une recherche ou un recrutement en alternance.",
    bestFor:
      "Les TPE qui veulent recruter un alternant plus simplement, avec un point d'entrée officiel et déjà orienté action.",
    tags: ["Alternance", "Plateforme publique", "Apprentissage"],
    icon: "GraduationCap",
    usefulFor: ["Alternance", "Premier recrutement", "Transmission"],
    sectors: [
      "Conseil & services aux entreprises",
      "Tech & Digital",
      "BTP & services techniques",
      "Immobilier",
      "Hébergement & tourisme",
      "Patrimoine",
      "Mobilité & logistique",
      "Restauration",
      "Commerce & retail",
      "Santé, bien-être & esthétique",
      "Services aux particuliers",
      "Éducation & formation",
      "Industrie & production",
      "Automobile & réparation",
      "Associations & événements",
    ],
    href: "https://labonnealternance.apprentissage.beta.gouv.fr/?utm_source=pda&utm_medium=redirect301&utm_campaign=accueil",
    cta: "Voir la plateforme",
    format: "Plateforme publique",
  },
  {
    slug: "hellowork-recruteur",
    name: "HelloWork Recruteur",
    provider: "HelloWork",
    family: "Recrutement",
    category: "Job board",
    shortDescription:
      "Une solution utile pour publier une offre et gagner en visibilité rapidement quand une TPE veut recruter sans équipe RH dédiée.",
    description:
      "Espace recruteur HelloWork pour diffuser des offres, recevoir des candidatures et toucher une audience large sur plusieurs univers métiers.",
    bestFor:
      "Les TPE et PME qui veulent diffuser une offre sans monter un système de recrutement complexe.",
    tags: ["Job board", "Offres d'emploi", "Candidatures"],
    icon: "Search",
    usefulFor: ["Diffusion d'offre", "Visibilité", "Sourcing"],
    sectors: [
      "Conseil & services aux entreprises",
      "Tech & Digital",
      "BTP & services techniques",
      "Immobilier",
      "Hébergement & tourisme",
      "Patrimoine",
      "Mobilité & logistique",
      "Restauration",
      "Commerce & retail",
      "Santé, bien-être & esthétique",
      "Services aux particuliers",
      "Éducation & formation",
      "Industrie & production",
      "Automobile & réparation",
      "Associations & événements",
    ],
    href: "https://recruteur.hellowork.com/fr/",
    cta: "Voir la solution",
    format: "Diffusion d'offres",
  },
  {
    slug: "france-travail-pro",
    name: "France Travail Pro",
    provider: "France Travail",
    family: "Recrutement",
    category: "Job board",
    shortDescription:
      "Un passage très utile pour publier une offre, bénéficier d'un relais institutionnel et garder une option simple pour recruter sans intermédiaire.",
    description:
      "Espace employeur France Travail pour publier des offres, rechercher des profils et s'appuyer sur un canal très accessible pour les besoins de recrutement du quotidien.",
    bestFor:
      "Les TPE qui veulent un canal large, simple et reconnu pour recruter sans multiplier les outils.",
    tags: ["Emploi", "Offres", "Service public"],
    icon: "Briefcase",
    usefulFor: ["Offres d'emploi", "Recrutement direct", "Canal large"],
    sectors: [
      "Conseil & services aux entreprises",
      "Tech & Digital",
      "BTP & services techniques",
      "Immobilier",
      "Hébergement & tourisme",
      "Patrimoine",
      "Mobilité & logistique",
      "Restauration",
      "Commerce & retail",
      "Santé, bien-être & esthétique",
      "Services aux particuliers",
      "Éducation & formation",
      "Industrie & production",
      "Automobile & réparation",
      "Associations & événements",
    ],
    href: "https://pro.francetravail.fr/accueil/",
    cta: "Voir la solution",
    format: "Espace employeur",
  },
  {
    slug: "side-recrutement-flexible",
    name: "Side",
    provider: "Side",
    family: "Recrutement",
    category: "Intérim & flexible",
    shortDescription:
      "Une option très utile quand il faut recruter vite, couvrir un pic d'activité ou trouver un renfort terrain sans lancer un process long.",
    description:
      "Plateforme orientée intérim, recrutement flexible, saisonnier et placement, utile pour les entreprises qui ont besoin d'un renfort opérationnel rapide.",
    bestFor:
      "Les activités avec pics d'activité, besoins urgents, saisonnalité ou forte contrainte terrain.",
    tags: ["Intérim", "Saisonnier", "Renfort rapide"],
    icon: "Zap",
    usefulFor: ["Renfort rapide", "Saisonnier", "Terrain"],
    sectors: [
      "BTP & services techniques",
      "Hébergement & tourisme",
      "Mobilité & logistique",
      "Restauration",
      "Commerce & retail",
      "Services aux particuliers",
      "Industrie & production",
      "Automobile & réparation",
    ],
    href: "https://www.side.co/",
    cta: "Voir la solution",
    format: "Intérim et recrutement flexible",
  },
  {
    slug: "randstad-recruteurs",
    name: "Randstad pour les recruteurs",
    provider: "Randstad",
    family: "Recrutement",
    category: "Intérim & recrutement",
    shortDescription:
      "Une solution utile si la TPE veut être accompagnée sur l'intérim ou sur un besoin de recrutement plus encadré.",
    description:
      "Entrée Randstad pour les entreprises qui cherchent un appui sur l'intérim, le recrutement ou la couverture de besoins opérationnels réguliers.",
    bestFor:
      "Les entreprises qui veulent sécuriser un recrutement ou un besoin intérim avec un acteur déjà structuré.",
    tags: ["Intérim", "Cabinet", "Recrutement"],
    icon: "Users",
    usefulFor: ["Besoin récurrent", "Accompagnement", "Renfort encadré"],
    sectors: [
      "BTP & services techniques",
      "Mobilité & logistique",
      "Restauration",
      "Commerce & retail",
      "Industrie & production",
      "Services aux particuliers",
      "Conseil & services aux entreprises",
    ],
    href: "https://www.randstad.fr/recruteurs/",
    cta: "Voir la solution",
    format: "Intérim et recrutement",
  },
] satisfies readonly DemaaRecruitmentItem[];

export type DemaaRecruitmentSlug = (typeof demaaRecruitmentItems)[number]["slug"];

const recruitmentBySlug = Object.fromEntries(
  demaaRecruitmentItems.map((item) => [item.slug, item]),
) as Partial<Record<DemaaRecruitmentSlug, DemaaRecruitmentItem>>;

export function getDemaaRecruitmentItems(): DemaaRecruitmentItem[] {
  return [...demaaRecruitmentItems];
}

export function getDemaaRecruitmentItemBySlug(slug: string): DemaaRecruitmentItem | null {
  return recruitmentBySlug[slug as DemaaRecruitmentSlug] ?? null;
}
