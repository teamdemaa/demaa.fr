export type B2BOpportunity = Readonly<{
  category: string;
  description: string;
  slug: string;
  title: string;
}>;

export const INITIAL_B2B_OPPORTUNITIES: readonly (B2BOpportunity & Readonly<{ status: "published" }>)[] = Object.freeze([
  {
    category: "BTP",
    description: "Accompagnement pour répondre à des appels d’offres publics dans le secteur du bâtiment.",
    slug: "prestataire-appel-offres-btp",
    status: "published",
    title: "Recherche prestataire spécialisé appels d’offres BTP",
  },
  {
    category: "Contenu",
    description: "Production régulière de contenus pour les réseaux sociaux d’une enseigne de restauration rapide.",
    slug: "createur-contenu-fast-food",
    status: "published",
    title: "Recherche créateur de contenu pour un fast food",
  },
  {
    category: "Produit",
    description: "Construction d’un logiciel destiné aux restaurants, pour une association à but non lucratif.",
    slug: "product-builder-association-saas-restaurants",
    status: "published",
    title: "Recherche product builder pour une association",
  },
]);
