export type B2BOpportunity = Readonly<{
  category: string;
  description: string;
  slug: string;
  title: string;
}>;

export const B2B_OPPORTUNITIES: readonly B2BOpportunity[] = Object.freeze([
  {
    category: "BTP",
    description:
      "Accompagnement pour répondre à des appels d’offres publics, secteur bâtiment.",
    slug: "prestataire-appel-offres-btp",
    title: "Recherche prestataire spécialisé appels d’offres BTP",
  },
  {
    category: "Contenu",
    description:
      "Production régulière de contenus réseaux sociaux pour une enseigne de restauration rapide.",
    slug: "createur-contenu-fast-food",
    title: "Recherche créateur de contenu pour un fast food",
  },
  {
    category: "Product",
    description:
      "Construction d’un SaaS à destination des restaurants, pour une association à but non lucratif.",
    slug: "product-builder-association-saas-restaurants",
    title: "Recherche product builder pour une association",
  },
]);

export function getB2BOpportunity(slug: string): B2BOpportunity | null {
  return B2B_OPPORTUNITIES.find((opportunity) => opportunity.slug === slug) ?? null;
}
