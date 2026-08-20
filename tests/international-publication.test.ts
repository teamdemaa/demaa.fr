import { describe, expect, it } from "vitest";
import {
  buildInternationalCacheKey,
  defineLocaleDictionary,
  isAvailableForContext,
  isProjectionPublishedForLocale,
  type LocalizedProjection,
  type MarketAvailability,
} from "@/lib/international-publication";

describe("international publication contracts", () => {
  const englishProjection: LocalizedProjection<{ name: string }> = {
    canonicalId: "service.process-automation-ai",
    content: { name: "Process automation and AI" },
    contentVersion: "1",
    localeCode: "en",
    publicationStatus: "published",
  };

  const availability: MarketAvailability = {
    canonicalId: englishProjection.canonicalId,
    marketCodes: ["fr-fr", "global-en-beta"],
  };

  it("requires one typed dictionary entry per interface locale", () => {
    expect(defineLocaleDictionary({
      en: { submit: "Send my request" },
      fr: { submit: "Envoyer ma demande" },
    })).toEqual({
      en: { submit: "Send my request" },
      fr: { submit: "Envoyer ma demande" },
    });
  });

  it("keeps publication independent from commercial availability", () => {
    expect(isProjectionPublishedForLocale(englishProjection, "en")).toBe(true);
    expect(isProjectionPublishedForLocale(englishProjection, "fr")).toBe(false);
    expect(isProjectionPublishedForLocale({
      ...englishProjection,
      publicationStatus: "draft",
    }, "en")).toBe(false);

    expect(isAvailableForContext(availability, {
      countryCode: null,
      marketCode: "global-en-beta",
    })).toBe(true);
    expect(isAvailableForContext(availability, {
      countryCode: "FR",
      marketCode: "fr-fr",
    })).toBe(true);
  });

  it("can restrict availability to explicit countries without changing text", () => {
    const franceOnlyAvailability: MarketAvailability = {
      ...availability,
      countryCodes: ["FR"],
    };
    expect(isAvailableForContext(franceOnlyAvailability, {
      countryCode: "FR",
      marketCode: "fr-fr",
    })).toBe(true);
    expect(isAvailableForContext(franceOnlyAvailability, {
      countryCode: "GB",
      marketCode: "fr-fr",
    })).toBe(false);
    expect(isAvailableForContext(franceOnlyAvailability, {
      countryCode: null,
      marketCode: "fr-fr",
    })).toBe(false);
    expect(isAvailableForContext({
      ...availability,
      countryCodes: [],
    }, {
      countryCode: "FR",
      marketCode: "fr-fr",
    })).toBe(false);
  });

  it("isolates cache entries by locale, market, and content version", () => {
    expect(buildInternationalCacheKey({
      contentVersion: "academy-v2",
      localeCode: "en",
      marketCode: "fr-fr",
      namespace: "academy",
    })).toBe("academy:en:fr-fr:academy-v2");
    expect(buildInternationalCacheKey({
      contentVersion: "academy-v2",
      localeCode: "en",
      marketCode: "global-en-beta",
      namespace: "academy",
    })).not.toBe("academy:en:fr-fr:academy-v2");
  });
});
