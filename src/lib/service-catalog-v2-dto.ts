export type ServiceOfferSlug =
  | "systeme-automatisation-commerciale"
  | "application-metier-web-mobile"
  | "site-vitrine-prise-contact"
  | "visibilite-locale-avis-clients"
  | "referencement-naturel"
  | "campagnes-google-ads"
  | "campagnes-reseaux-sociaux";

export type PublishedServiceOfferDto = Readonly<{
  slug: ServiceOfferSlug;
  title: string;
  categoryId: "structurer-digitaliser" | "developper-visibilite";
  categoryTitle:
    | "Structurer et digitaliser votre activité"
    | "Développer votre visibilité";
  description: string;
  operatorType: "demaa" | "odema";
  offerVersion: string;
  pricing:
    | Readonly<{
        mode: "fixed";
        amountMinor: number;
        currency: "EUR";
        taxMode: "excluding_tax";
      }>
    | Readonly<{ mode: "quote" }>;
  scope: Readonly<{
    deliverables: readonly string[];
    prerequisites: readonly string[];
    exclusions: readonly string[];
    clientResponsibilities: readonly string[];
  }>;
}>;
