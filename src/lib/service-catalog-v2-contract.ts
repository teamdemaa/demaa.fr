import "server-only";

import type { PublishedServiceOfferDto } from "@/lib/service-catalog-v2-dto";
import {
  deepFreeze,
  parseArray,
  parseEnum,
  parseRecord,
  parseString,
  parseStringArray,
  parseVersion,
  validationError,
} from "@/lib/registry-contract-utils";

export const SERVICE_OFFER_SLUGS = [
  "systeme-automatisation-commerciale",
  "application-metier-web-mobile",
  "site-vitrine-prise-contact",
  "visibilite-locale-avis-clients",
  "referencement-naturel",
  "campagnes-google-ads",
  "campagnes-reseaux-sociaux",
] as const;
export type ServiceOfferSlug = (typeof SERVICE_OFFER_SLUGS)[number];

export const SERVICE_STATUSES = ["draft", "published", "archived"] as const;
export const SERVICE_OPERATOR_TYPES = ["demaa", "odema", "pending_legal_validation"] as const;
export const SERVICE_CATEGORY_IDS = ["structurer-digitaliser", "developper-visibilite"] as const;
export const SERVICE_CATEGORY_TITLES = {
  "structurer-digitaliser": "Structurer et digitaliser votre activité",
  "developper-visibilite": "Développer votre visibilité",
} as const;
export const SERVER_TRUSTED_FIXED_PRICES: Readonly<Partial<Record<ServiceOfferSlug, number>>> =
  deepFreeze({
    "site-vitrine-prise-contact": 95000,
    "visibilite-locale-avis-clients": 49000,
  });

export type ServiceOfferStatus = (typeof SERVICE_STATUSES)[number];
export type ServiceOperatorType = (typeof SERVICE_OPERATOR_TYPES)[number];
export type ServiceCategoryId = (typeof SERVICE_CATEGORY_IDS)[number];
export type FixedServicePricing = Readonly<{
  mode: "fixed";
  amountMinor: number;
  currency: "EUR";
  taxMode: "excluding_tax";
}>;
export type QuoteServicePricing = Readonly<{ mode: "quote" }>;
export type ServiceOfferScope = Readonly<{
  deliverables: readonly string[];
  prerequisites: readonly string[];
  exclusions: readonly string[];
  clientResponsibilities: readonly string[];
}>;
export type ServiceOffer = Readonly<{
  slug: ServiceOfferSlug;
  title: string;
  categoryId: ServiceCategoryId;
  categoryTitle: (typeof SERVICE_CATEGORY_TITLES)[ServiceCategoryId];
  description: string;
  operatorType: ServiceOperatorType;
  offerVersion: string;
  pricing: FixedServicePricing | QuoteServicePricing;
  status: ServiceOfferStatus;
  scope: ServiceOfferScope;
  publicationBlockers: readonly string[];
}>;
export type ServiceCatalogV2 = Readonly<{
  schemaVersion: 1;
  catalogId: "demaa-services-v2";
  offers: readonly ServiceOffer[];
}>;
const CATALOG_KEYS = ["schemaVersion", "catalogId", "offers"] as const;
const OFFER_KEYS = [
  "slug",
  "title",
  "categoryId",
  "categoryTitle",
  "description",
  "operatorType",
  "offerVersion",
  "pricing",
  "status",
  "scope",
  "publicationBlockers",
] as const;
const SCOPE_KEYS = ["deliverables", "prerequisites", "exclusions", "clientResponsibilities"] as const;

function parsePricing(input: unknown, path: string): FixedServicePricing | QuoteServicePricing {
  const envelope = parseRecord(input, path, ["mode", "amountMinor", "currency", "taxMode"]);
  const mode = parseEnum(envelope.mode, ["fixed", "quote"] as const, `${path}.mode`);
  if (mode === "quote") {
    parseRecord(input, path, ["mode"]);
    return deepFreeze({ mode });
  }
  if (!Number.isSafeInteger(envelope.amountMinor) || (envelope.amountMinor as number) <= 0) {
    throw new TypeError(`${path}.amountMinor must be a positive safe integer`);
  }
  return deepFreeze({
    mode,
    amountMinor: envelope.amountMinor as number,
    currency: parseEnum(envelope.currency, ["EUR"] as const, `${path}.currency`),
    taxMode: parseEnum(envelope.taxMode, ["excluding_tax"] as const, `${path}.taxMode`),
  });
}

function parseScope(input: unknown, path: string): ServiceOfferScope {
  const record = parseRecord(input, path, SCOPE_KEYS);
  return deepFreeze({
    deliverables: parseStringArray(record.deliverables, `${path}.deliverables`),
    prerequisites: parseStringArray(record.prerequisites, `${path}.prerequisites`),
    exclusions: parseStringArray(record.exclusions, `${path}.exclusions`),
    clientResponsibilities: parseStringArray(record.clientResponsibilities, `${path}.clientResponsibilities`),
  });
}

export function parseServiceCatalogV2(input: unknown): ServiceCatalogV2 {
  const record = parseRecord(input, "serviceCatalog", CATALOG_KEYS);
  if (record.schemaVersion !== 1) throw new TypeError("serviceCatalog.schemaVersion must be 1");
  if (record.catalogId !== "demaa-services-v2") {
    throw new TypeError("serviceCatalog.catalogId must be demaa-services-v2");
  }
  const offers = parseArray(record.offers, "serviceCatalog.offers").map((inputOffer, index) => {
    const path = `serviceCatalog.offers[${index}]`;
    const offer = parseRecord(inputOffer, path, OFFER_KEYS);
    const categoryId = parseEnum(offer.categoryId, SERVICE_CATEGORY_IDS, `${path}.categoryId`);
    const categoryTitle = parseEnum(
      offer.categoryTitle,
      Object.values(SERVICE_CATEGORY_TITLES),
      `${path}.categoryTitle`,
    );
    if (SERVICE_CATEGORY_TITLES[categoryId] !== categoryTitle) {
      throw new TypeError(`${path}.categoryTitle does not match categoryId`);
    }
    return deepFreeze({
      slug: parseEnum(offer.slug, SERVICE_OFFER_SLUGS, `${path}.slug`),
      title: parseString(offer.title, `${path}.title`),
      categoryId,
      categoryTitle,
      description: parseString(offer.description, `${path}.description`),
      operatorType: parseEnum(offer.operatorType, SERVICE_OPERATOR_TYPES, `${path}.operatorType`),
      offerVersion: parseVersion(offer.offerVersion, `${path}.offerVersion`),
      pricing: parsePricing(offer.pricing, `${path}.pricing`),
      status: parseEnum(offer.status, SERVICE_STATUSES, `${path}.status`),
      scope: parseScope(offer.scope, `${path}.scope`),
      publicationBlockers: parseStringArray(offer.publicationBlockers, `${path}.publicationBlockers`),
    });
  });
  return deepFreeze({ schemaVersion: 1, catalogId: "demaa-services-v2", offers });
}

export function validateServiceCatalogV2(input: unknown): string[] {
  let catalog: ServiceCatalogV2;
  try {
    catalog = parseServiceCatalogV2(input);
  } catch (error) {
    return [validationError(error)];
  }
  const errors: string[] = [];
  const slugs = catalog.offers.map((offer) => offer.slug);
  if (catalog.offers.length !== SERVICE_OFFER_SLUGS.length) errors.push("catalog must contain exactly seven offers");
  if (new Set(slugs).size !== slugs.length) errors.push("service offer slugs must be unique");
  if (SERVICE_OFFER_SLUGS.some((slug) => !slugs.includes(slug))) {
    errors.push("catalog is missing an allowlisted service slug");
  }
  if (catalog.offers.filter((offer) => offer.pricing.mode === "fixed").length !== 2) {
    errors.push("catalog must contain exactly two fixed-price offers");
  }
  if (catalog.offers.filter((offer) => offer.pricing.mode === "quote").length !== 5) {
    errors.push("catalog must contain exactly five quote offers");
  }
  for (const offer of catalog.offers) {
    const expectedPrice = SERVER_TRUSTED_FIXED_PRICES[offer.slug];
    if (expectedPrice === undefined && offer.pricing.mode !== "quote") {
      errors.push(`${offer.slug}: offer must remain quote-priced`);
    }
    if (
      expectedPrice !== undefined &&
      (offer.pricing.mode !== "fixed" || offer.pricing.amountMinor !== expectedPrice)
    ) {
      errors.push(`${offer.slug}: fixed price is not server-trusted`);
    }
    if (offer.status !== "draft") errors.push(`${offer.slug}: M2a offers must remain draft`);
    if (offer.status === "published") {
      if (offer.operatorType === "pending_legal_validation") {
        errors.push(`${offer.slug}: published offer requires a legal operator`);
      }
      if (offer.publicationBlockers.length > 0) {
        errors.push(`${offer.slug}: published offer cannot have blockers`);
      }
      for (const [field, entries] of Object.entries(offer.scope)) {
        if (entries.length === 0) errors.push(`${offer.slug}: published offer requires scope.${field}`);
      }
    } else if (offer.publicationBlockers.length === 0) {
      errors.push(`${offer.slug}: draft offer must expose publication blockers`);
    }
  }
  return errors;
}

function toPublishedServiceOfferDto(offer: ServiceOffer): PublishedServiceOfferDto | null {
  if (
    offer.status !== "published" ||
    offer.operatorType === "pending_legal_validation" ||
    offer.publicationBlockers.length > 0 ||
    Object.values(offer.scope).some((entries) => entries.length === 0)
  ) {
    return null;
  }
  return deepFreeze({
    slug: offer.slug,
    title: offer.title,
    categoryId: offer.categoryId,
    categoryTitle: offer.categoryTitle,
    description: offer.description,
    operatorType: offer.operatorType,
    offerVersion: offer.offerVersion,
    pricing: offer.pricing.mode === "fixed" ? { ...offer.pricing } : { mode: "quote" },
    scope: {
      deliverables: [...offer.scope.deliverables],
      prerequisites: [...offer.scope.prerequisites],
      exclusions: [...offer.scope.exclusions],
      clientResponsibilities: [...offer.scope.clientResponsibilities],
    },
  });
}

export function selectPublishedServiceOffersV2(input: unknown): readonly PublishedServiceOfferDto[] {
  if (validateServiceCatalogV2(input).length > 0) return deepFreeze([]);
  let catalog: ServiceCatalogV2;
  try {
    catalog = parseServiceCatalogV2(input);
  } catch {
    return deepFreeze([]);
  }
  return deepFreeze(catalog.offers.flatMap((offer) => {
    const published = toPublishedServiceOfferDto(offer);
    return published ? [published] : [];
  }));
}
