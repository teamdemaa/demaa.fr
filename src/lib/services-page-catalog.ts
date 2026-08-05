export const SERVICE_PAGE_CATEGORY_IDS = ["structurer", "visibilite"] as const;

export type ServicePageCategoryId = (typeof SERVICE_PAGE_CATEGORY_IDS)[number];

export type ServicePageEntry = {
  slug: string;
  name: string;
  category: ServicePageCategoryId;
  description: string;
  price: string;
  icon:
    | "workflow"
    | "application"
    | "website"
    | "local"
    | "seo"
    | "google-ads"
    | "social-ads";
};

export const servicePageCategories: Array<{
  id: ServicePageCategoryId;
  eyebrow: string;
  title: string;
}> = [
  {
    id: "structurer",
    eyebrow: "Mieux fonctionner",
    title: "Structurer et digitaliser votre activité",
  },
  {
    id: "visibilite",
    eyebrow: "Mieux vous faire connaître",
    title: "Développer votre visibilité",
  },
];

export const servicePageEntries: ServicePageEntry[] = [
  {
    slug: "systeme-automatisation-commerciale",
    name: "Système & automatisation commerciale",
    category: "structurer",
    description:
      "Structurez le parcours prospect → client et automatisez les tâches commerciales répétitives.",
    price: "Sur devis",
    icon: "workflow",
  },
  {
    slug: "application-metier-web-mobile",
    name: "Application métier web ou mobile",
    category: "structurer",
    description:
      "Un outil simple centré sur le besoin prioritaire de votre activité.",
    price: "Sur devis",
    icon: "application",
  },
  {
    slug: "site-vitrine-prise-contact",
    name: "Site vitrine & prise de contact",
    category: "structurer",
    description:
      "Un site clair jusqu’à trois pages, responsive et prêt à recevoir des demandes.",
    price: "950 € HT",
    icon: "website",
  },
  {
    slug: "visibilite-locale-avis-clients",
    name: "Visibilité locale & avis clients",
    category: "visibilite",
    description:
      "Une fiche Google optimisée et une méthode simple pour obtenir et suivre les avis.",
    price: "490 € HT",
    icon: "local",
  },
  {
    slug: "referencement-naturel",
    name: "Référencement naturel",
    category: "visibilite",
    description:
      "Un diagnostic priorisé et l’optimisation des pages qui comptent.",
    price: "Sur devis",
    icon: "seo",
  },
  {
    slug: "campagnes-google-ads",
    name: "Campagnes Google Ads",
    category: "visibilite",
    description:
      "Une campagne structurée, mesurable et adaptée à votre objectif.",
    price: "Sur devis",
    icon: "google-ads",
  },
  {
    slug: "campagnes-reseaux-sociaux",
    name: "Campagnes sur les réseaux sociaux",
    category: "visibilite",
    description:
      "La bonne plateforme, le bon ciblage et un lancement suivi.",
    price: "Sur devis",
    icon: "social-ads",
  },
];
