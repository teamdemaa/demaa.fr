import "server-only";

import { deepFreeze } from "@/lib/registry-contract-utils";

export const EXTERNAL_RECOMMENDATION_SLUGS = [
  "assistance-administrative",
  "sous-traitance-formalites-juridiques",
] as const;

export type ExternalRecommendationSlug =
  (typeof EXTERNAL_RECOMMENDATION_SLUGS)[number];
export type ExternalRecommendationCatalogItem = Readonly<{
  active: boolean;
  category: string;
  connectionProcess: string;
  description: string;
  included: readonly string[];
  limits: readonly string[];
  name: string;
  needs: readonly Readonly<{ key: string; label: string }>[];
  slug: ExternalRecommendationSlug;
  version: string;
  visibility: "recommendation_only";
}>;

const catalog = deepFreeze([
  {
    active: true,
    category: "Support administratif",
    connectionProcess: "Demaa qualifie votre besoin puis recherche un professionnel adapté. Vous restez libre d’accepter la mise en relation.",
    description: "Un renfort pour déléguer des tâches administratives clairement définies.",
    included: ["Qualification des tâches et du volume", "Recherche d’un professionnel adapté", "Transmission du contexte utile"],
    limits: ["La mission est contractualisée avec le professionnel", "La tenue comptable n’est pas incluse"],
    name: "Assistance administrative",
    needs: [] as readonly Readonly<{ key: string; label: string }>[],
    slug: "assistance-administrative",
    version: "2026-08-14",
    visibility: "recommendation_only",
  },
  {
    active: true,
    category: "Renfort pour les professionnels",
    connectionProcess: "Demaa qualifie le volume et recherche un prestataire spécialisé. Vous restez libre d’accepter la mise en relation.",
    description: "Un renfort confidentiel pour exécuter les formalités des clients d’un professionnel.",
    included: ["Qualification du volume", "Recherche d’un prestataire spécialisé", "Cadrage de la confidentialité"],
    limits: ["Le conseil et la validation juridique ne sont pas fournis par Demaa", "La mission commence après validation du périmètre"],
    name: "Sous-traitance de formalités juridiques",
    needs: [] as readonly Readonly<{ key: string; label: string }>[],
    slug: "sous-traitance-formalites-juridiques",
    version: "2026-08-14",
    visibility: "recommendation_only",
  },
] satisfies readonly ExternalRecommendationCatalogItem[]);

export function getExternalRecommendationCatalog() {
  return catalog;
}

export function getExternalRecommendationBySlug(slug: unknown) {
  if (typeof slug !== "string") return null;
  return catalog.find((item) => item.slug === slug) ?? null;
}

export function isValidExternalRecommendationNeed(
  item: ExternalRecommendationCatalogItem,
  needKey: unknown,
) {
  if (item.needs.length === 0) return needKey === null || needKey === undefined || needKey === "";
  return typeof needKey === "string"
    && item.needs.some((need) => need.key === needKey);
}
