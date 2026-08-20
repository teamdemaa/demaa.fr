import { describe, expect, it } from "vitest";
import {
  buildInternationalCacheKey,
  defineLocaleDictionary,
  isProjectionPublishedForContext,
  type LocalizedProjection,
} from "@/lib/international-publication";

describe("international publication contracts", () => {
  const englishProjection: LocalizedProjection<{ name: string }> = {
    canonicalId: "service.process-automation-ai",
    content: { name: "Process automation and AI" },
    contentVersion: "1",
    localeCode: "en",
    marketCodes: ["fr-fr", "global-en-beta"],
    publicationStatus: "published",
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

  it("publishes only an explicit locale and market combination", () => {
    expect(isProjectionPublishedForContext(englishProjection, {
      localeCode: "en",
      marketCode: "fr-fr",
    })).toBe(true);
    expect(isProjectionPublishedForContext(englishProjection, {
      localeCode: "fr",
      marketCode: "fr-fr",
    })).toBe(false);
    expect(isProjectionPublishedForContext({
      ...englishProjection,
      publicationStatus: "draft",
    }, {
      localeCode: "en",
      marketCode: "global-en-beta",
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
