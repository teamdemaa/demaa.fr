import "server-only";

import rawServiceCatalogV2 from "@/lib/service-catalog-v2.generated.json";
import {
  selectPublishedServiceOffersV2,
  validateServiceCatalogV2,
} from "@/lib/service-catalog-v2-contract";
import type { PublishedServiceOfferDto } from "@/lib/service-catalog-v2-dto";

const catalogErrors = validateServiceCatalogV2(rawServiceCatalogV2);
if (catalogErrors.length > 0) {
  throw new Error(`Invalid Services V2 catalog:\n${catalogErrors.join("\n")}`);
}

export function getPublishedServiceOffersV2(): readonly PublishedServiceOfferDto[] {
  return selectPublishedServiceOffersV2(rawServiceCatalogV2);
}

export function getPublishedServiceOfferV2BySlug(slug: unknown): PublishedServiceOfferDto | null {
  if (typeof slug !== "string") return null;
  return getPublishedServiceOffersV2().find((offer) => offer.slug === slug) ?? null;
}
