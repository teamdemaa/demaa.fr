import { describe, expect, it } from "vitest";
import {
  FRANCE_COMMERCIAL_CONTEXT,
  GLOBAL_ENGLISH_BETA_COMMERCIAL_CONTEXT,
  createInternationalContext,
  getBrowserInterfaceLocale,
  getReturnToInterfaceLocale,
  parseCommercialContext,
  resolveInterfaceLocale,
} from "@/lib/international-context";
import { getSafeCustomerReturnTo } from "@/lib/customer-space-redirect";
import {
  InvalidActionPlanLocaleContextError,
  normalizeActionPlanLocaleContext,
  parseActionPlanLocaleContext,
  resolveActionPlanLocaleContextForCreation,
} from "@/lib/action-plan-localization";

describe("international context foundation", () => {
  it("keeps an explicitly opened route ahead of every stored preference", () => {
    expect(resolveInterfaceLocale({
      acceptLanguage: "en-US,en;q=0.9",
      cookiePreference: "en",
      manualPreference: "en",
      memberPreference: "en",
      pathname: "/plans",
    })).toBe("fr");
    expect(resolveInterfaceLocale({
      cookiePreference: "fr",
      memberPreference: "fr",
      pathname: "/en",
    })).toBe("en");
  });

  it("uses manual, member, cookie, browser, then French fallback order", () => {
    expect(resolveInterfaceLocale({
      acceptLanguage: "fr-FR",
      cookiePreference: "fr",
      manualPreference: "en",
      memberPreference: "fr",
    })).toBe("en");
    expect(resolveInterfaceLocale({
      acceptLanguage: "fr-FR",
      cookiePreference: "en",
      memberPreference: "fr",
    })).toBe("fr");
    expect(resolveInterfaceLocale({
      acceptLanguage: "fr-FR",
      cookiePreference: "en",
    })).toBe("en");
    expect(resolveInterfaceLocale({ acceptLanguage: "en-GB,en;q=0.8" })).toBe("en");
    expect(resolveInterfaceLocale({ acceptLanguage: "de-DE" })).toBe("fr");
  });

  it("keeps locale, market, country, and currency separate", () => {
    expect(createInternationalContext("fr", FRANCE_COMMERCIAL_CONTEXT)).toEqual({
      countryCode: null,
      currencyCode: "EUR",
      localeCode: "fr",
      marketCode: "fr-fr",
    });
    expect(createInternationalContext("en", FRANCE_COMMERCIAL_CONTEXT)).toEqual({
      countryCode: null,
      currencyCode: "EUR",
      localeCode: "en",
      marketCode: "fr-fr",
    });
    expect(createInternationalContext("en", GLOBAL_ENGLISH_BETA_COMMERCIAL_CONTEXT)).toEqual({
      countryCode: null,
      currencyCode: "EUR",
      localeCode: "en",
      marketCode: "global-en-beta",
    });
    expect(getBrowserInterfaceLocale("es-ES,en;q=0.8")).toBe("en");
    expect(getBrowserInterfaceLocale("en;q=0,fr;q=0.5")).toBe("fr");
  });

  it("validates commercial context independently from interface locale", () => {
    expect(parseCommercialContext({
      countryCode: "gb",
      currencyCode: "gbp",
      marketCode: "global-en-beta",
    })).toEqual({
      countryCode: "GB",
      currencyCode: "GBP",
      marketCode: "global-en-beta",
    });
    expect(parseCommercialContext({
      countryCode: "USA",
      currencyCode: "USD",
      marketCode: "global-en-beta",
    })).toBeNull();
    expect(parseCommercialContext({
      currencyCode: "EUR",
      marketCode: "unknown-market",
    })).toBeNull();
  });

  it("preserves safe English return destinations through authentication", () => {
    for (const returnTo of [
      "/en",
      "/en?intent=generate-plan",
      "/en/plans",
      "/en/plans/latest",
      "/en/plans/new",
      "/en/plans/plan_123",
    ]) {
      expect(getSafeCustomerReturnTo(returnTo)).toBe(returnTo);
      expect(getReturnToInterfaceLocale(returnTo)).toBe("en");
    }
    expect(getSafeCustomerReturnTo("/en/unknown")).toBe("/");
    expect(getSafeCustomerReturnTo("//evil.example/en")).toBe("/");
  });

  it("keeps plan content language independent from its creation market", () => {
    expect(parseActionPlanLocaleContext({
      contentLocaleCode: "en",
      marketCodeAtCreation: "fr-fr",
    })).toEqual({
      contentLocaleCode: "en",
      marketCodeAtCreation: "fr-fr",
    });
    expect(parseActionPlanLocaleContext({
      contentLocaleCode: "fr",
      marketCodeAtCreation: "global-en-beta",
    })).toEqual({
      contentLocaleCode: "fr",
      marketCodeAtCreation: "global-en-beta",
    });
    expect(parseActionPlanLocaleContext({
      contentLocaleCode: "en",
    })).toBeNull();
    expect(normalizeActionPlanLocaleContext({})).toEqual({
      contentLocaleCode: "fr",
      marketCodeAtCreation: "fr-fr",
    });
    expect(resolveActionPlanLocaleContextForCreation()).toEqual({
      contentLocaleCode: "fr",
      marketCodeAtCreation: "fr-fr",
    });
    expect(() => resolveActionPlanLocaleContextForCreation({
      contentLocaleCode: "en",
    })).toThrow(InvalidActionPlanLocaleContextError);
  });
});
