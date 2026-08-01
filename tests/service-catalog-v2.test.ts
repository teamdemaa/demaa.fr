import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import rawServiceCatalogV2 from "@/lib/service-catalog-v2.generated.json";
import {
  parseServiceCatalogV2,
  selectPublishedServiceOffersV2,
  SERVER_TRUSTED_FIXED_PRICES,
  SERVICE_OFFER_SLUGS,
  validateServiceCatalogV2,
} from "@/lib/service-catalog-v2-contract";
import {
  getPublishedServiceOffersV2,
  getPublishedServiceOfferV2BySlug,
} from "@/lib/service-catalog-v2";

describe("Services V2 server contract", () => {
  it("keeps exactly seven allowlisted offers, all draft and server-validated", () => {
    const catalog = parseServiceCatalogV2(rawServiceCatalogV2);
    expect(validateServiceCatalogV2(rawServiceCatalogV2)).toEqual([]);
    expect(catalog.offers.map((offer) => offer.slug)).toEqual(SERVICE_OFFER_SLUGS);
    expect(catalog.offers.every((offer) => offer.status === "draft")).toBe(true);
    expect(catalog.offers.every((offer) => offer.publicationBlockers.length > 0)).toBe(true);
    expect(getPublishedServiceOffersV2()).toEqual([]);
  });

  it("locks 950 and 490 EUR HT and keeps the five other offers on quote", () => {
    const catalog = parseServiceCatalogV2(rawServiceCatalogV2);
    const fixed = catalog.offers.filter((offer) => offer.pricing.mode === "fixed");
    expect(fixed.map((offer) => [offer.slug, offer.pricing.mode === "fixed" ? offer.pricing.amountMinor : null])).toEqual([
      ["site-vitrine-prise-contact", 95000],
      ["visibilite-locale-avis-clients", 49000],
    ]);
    expect(SERVER_TRUSTED_FIXED_PRICES).toEqual({
      "site-vitrine-prise-contact": 95000,
      "visibilite-locale-avis-clients": 49000,
    });
    expect(catalog.offers.filter((offer) => offer.pricing.mode === "quote")).toHaveLength(5);
    expect(fixed.every((offer) =>
      offer.pricing.mode === "fixed" &&
      offer.pricing.currency === "EUR" &&
      offer.pricing.taxMode === "excluding_tax"
    )).toBe(true);
  });

  it("rejects price changes instead of trusting browser input", () => {
    const changed = structuredClone(rawServiceCatalogV2) as unknown as {
      offers: Array<{ slug: string; pricing: { mode: string; amountMinor?: number } }>;
    };
    const site = changed.offers.find((offer) => offer.slug === "site-vitrine-prise-contact");
    if (!site) throw new Error("missing fixture offer");
    site.pricing.amountMinor = 95001;
    expect(validateServiceCatalogV2(changed)).toContain(
      "site-vitrine-prise-contact: fixed price is not server-trusted",
    );
    expect(selectPublishedServiceOffersV2(changed)).toEqual([]);
  });

  it("rejects a category title mismatch through exported runtime APIs", () => {
    const changed = structuredClone(rawServiceCatalogV2) as unknown as {
      offers: Array<{ categoryTitle: string }>;
    };
    changed.offers[0].categoryTitle = "Développer votre visibilité";
    expect(validateServiceCatalogV2(changed)[0]).toContain("categoryTitle does not match categoryId");
    expect(selectPublishedServiceOffersV2(changed)).toEqual([]);
  });

  it.each([
    null,
    "{not-json",
    {},
    { schemaVersion: 1, catalogId: "demaa-services-v2", offers: "invalid" },
    { ...rawServiceCatalogV2, offers: [{ ...rawServiceCatalogV2.offers[0], status: "online" }] },
    { ...rawServiceCatalogV2, offers: [{ ...rawServiceCatalogV2.offers[0], operatorType: "somebody" }] },
  ])("returns a controlled validation error for malformed runtime input %#", (payload) => {
    expect(() => validateServiceCatalogV2(payload)).not.toThrow();
    expect(validateServiceCatalogV2(payload).length).toBeGreaterThan(0);
  });

  it("deep-freezes parsed data and resolves neither drafts nor unknown slugs", () => {
    const catalog = parseServiceCatalogV2(rawServiceCatalogV2);
    expect(Object.isFrozen(catalog)).toBe(true);
    expect(Object.isFrozen(catalog.offers[0].scope.deliverables)).toBe(true);
    expect(() => {
      (catalog.offers as unknown as Array<{ status: string }>)[0].status = "published";
    }).toThrow();
    expect(getPublishedServiceOfferV2BySlug("site-vitrine-prise-contact")).toBeNull();
    expect(getPublishedServiceOfferV2BySlug("slug-fourni-par-le-client")).toBeNull();
    expect(getPublishedServiceOfferV2BySlug(42)).toBeNull();
  });
});
