export type CanonicalServiceSlug =
  | "automatisation-processus"
  | "application-metier"
  | "coach-business"
  | "expert-comptable"
  | "assistance-administrative"
  | "formalites-entreprise"
  | "gestion-reseaux-sociaux"
  | "publicite-en-ligne"
  | "prospection-ciblee";

export type CanonicalServicePackageSlug =
  | "automatisation-essentielle"
  | "automatisation-avancee-ia"
  | "application-metier-essentielle"
  | "application-metier-avancee";

export type CanonicalServicePricing = Readonly<{
  amountMinor?: number;
  currency?: "EUR";
  heading: string;
  label: string;
  mode: "fixed" | "quote" | "starting";
  note: string;
}>;

export type CanonicalServicePackage = Readonly<{
  included: readonly string[];
  name: string;
  pricing: CanonicalServicePricing & Readonly<{
    amountMinor: number;
    currency: "EUR";
    mode: "fixed";
  }>;
  slug: CanonicalServicePackageSlug;
  summary: string;
}>;

export type CanonicalService = Readonly<{
  monthlyAccompanimentDiscountEligible: boolean;
  conditions: readonly string[];
  cta: Readonly<{ kind: "callback"; label: string }>;
  delivery: "demaa" | "third-party";
  description: string;
  detailHref: string;
  eyebrow: string;
  included: readonly string[];
  name: string;
  notIncluded: readonly string[];
  packages: readonly CanonicalServicePackage[];
  pricing: CanonicalServicePricing | null;
  result: string;
  slug: CanonicalServiceSlug;
  summary: string;
}>;
