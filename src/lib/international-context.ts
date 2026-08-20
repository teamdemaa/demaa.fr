export const INTERFACE_LOCALE_CODES = ["fr", "en"] as const;
export type InterfaceLocaleCode = (typeof INTERFACE_LOCALE_CODES)[number];

export const MARKET_CODES = ["fr-fr", "global-en-beta"] as const;
export type MarketCode = (typeof MARKET_CODES)[number];

declare const currencyCodeBrand: unique symbol;
export type CurrencyCode = string & { readonly [currencyCodeBrand]: true };

export type CommercialContext = Readonly<{
  countryCode: string | null;
  currencyCode: CurrencyCode;
  marketCode: MarketCode;
}>;

export type InternationalContext = CommercialContext & Readonly<{
  localeCode: InterfaceLocaleCode;
}>;

export const LOCALE_PREFERENCE_COOKIE = "demaa_locale";
export const LOCALE_PREFERENCE_MAX_AGE_SECONDS = 180 * 24 * 60 * 60;

export const EUR_CURRENCY_CODE = "EUR" as CurrencyCode;

export const FRANCE_COMMERCIAL_CONTEXT: CommercialContext = {
  countryCode: null,
  currencyCode: EUR_CURRENCY_CODE,
  marketCode: "fr-fr",
};

export const GLOBAL_ENGLISH_BETA_COMMERCIAL_CONTEXT: CommercialContext = {
  countryCode: null,
  currencyCode: EUR_CURRENCY_CODE,
  marketCode: "global-en-beta",
};

export const FRANCE_CONTEXT: InternationalContext = {
  ...FRANCE_COMMERCIAL_CONTEXT,
  localeCode: "fr",
};

export const ENGLISH_BETA_CONTEXT: InternationalContext = {
  ...GLOBAL_ENGLISH_BETA_COMMERCIAL_CONTEXT,
  localeCode: "en",
};

export function isInterfaceLocaleCode(
  value: unknown,
): value is InterfaceLocaleCode {
  return typeof value === "string"
    && INTERFACE_LOCALE_CODES.includes(value as InterfaceLocaleCode);
}

export function isMarketCode(value: unknown): value is MarketCode {
  return typeof value === "string"
    && MARKET_CODES.includes(value as MarketCode);
}

export function normalizeCountryCode(value: unknown): string | null {
  if (value == null || value === "") return null;
  if (typeof value !== "string") return null;
  const countryCode = value.trim().toUpperCase();
  return /^[A-Z]{2}$/.test(countryCode) ? countryCode : null;
}

export function normalizeCurrencyCode(value: unknown): CurrencyCode | null {
  if (typeof value !== "string") return null;
  const currencyCode = value.trim().toUpperCase();
  return /^[A-Z]{3}$/.test(currencyCode)
    ? currencyCode as CurrencyCode
    : null;
}

export function parseCommercialContext(input: {
  countryCode?: unknown;
  currencyCode?: unknown;
  marketCode?: unknown;
}): CommercialContext | null {
  if (!isMarketCode(input.marketCode)) return null;
  const currencyCode = normalizeCurrencyCode(input.currencyCode);
  if (!currencyCode) return null;
  if (input.countryCode != null && input.countryCode !== "") {
    const countryCode = normalizeCountryCode(input.countryCode);
    if (!countryCode) return null;
  }
  return {
    countryCode: normalizeCountryCode(input.countryCode),
    currencyCode,
    marketCode: input.marketCode,
  };
}

export function createInternationalContext(
  localeCode: InterfaceLocaleCode,
  commercialContext: CommercialContext,
): InternationalContext {
  return { ...commercialContext, localeCode };
}

export function normalizeInterfaceLocaleCode(
  value: unknown,
): InterfaceLocaleCode | null {
  if (typeof value !== "string") return null;
  const localeCode = value.trim().toLowerCase().split("-")[0];
  return isInterfaceLocaleCode(localeCode) ? localeCode : null;
}

export function getExplicitInterfaceLocaleFromPathname(
  pathname: string,
): InterfaceLocaleCode | null {
  if (pathname === "/en" || pathname.startsWith("/en/")) return "en";
  if (pathname.startsWith("/")) return "fr";
  return null;
}

export function getBrowserInterfaceLocale(
  acceptLanguage: string | null | undefined,
): InterfaceLocaleCode | null {
  if (!acceptLanguage) return null;
  const entries = acceptLanguage.split(",").map((entry, index) => {
    const [language, ...parameters] = entry.trim().split(";");
    const qualityParameter = parameters.find((parameter) => parameter.trim().startsWith("q="));
    const quality = qualityParameter
      ? Number.parseFloat(qualityParameter.trim().slice(2))
      : 1;
    return {
      index,
      language,
      quality: Number.isFinite(quality) ? quality : 0,
    };
  }).filter((entry) => entry.quality > 0)
    .sort((left, right) => right.quality - left.quality || left.index - right.index);
  for (const entry of entries) {
    const localeCode = normalizeInterfaceLocaleCode(entry.language);
    if (localeCode) return localeCode;
  }
  return null;
}

export function resolveInterfaceLocale(input: {
  pathname?: string | null;
  manualPreference?: unknown;
  memberPreference?: unknown;
  cookiePreference?: unknown;
  acceptLanguage?: string | null;
}): InterfaceLocaleCode {
  const explicitRoute = input.pathname
    ? getExplicitInterfaceLocaleFromPathname(input.pathname)
    : null;
  return explicitRoute
    ?? normalizeInterfaceLocaleCode(input.manualPreference)
    ?? normalizeInterfaceLocaleCode(input.memberPreference)
    ?? normalizeInterfaceLocaleCode(input.cookiePreference)
    ?? getBrowserInterfaceLocale(input.acceptLanguage)
    ?? "fr";
}

export function getClientInterfaceLocale(
  pathname = typeof window === "undefined" ? "/" : window.location.pathname,
): InterfaceLocaleCode {
  return getExplicitInterfaceLocaleFromPathname(pathname) ?? "fr";
}

export function getReturnToInterfaceLocale(returnTo: string) {
  try {
    const url = new URL(returnTo, "https://demaa.invalid");
    if (url.origin !== "https://demaa.invalid") return "fr";
    return getExplicitInterfaceLocaleFromPathname(url.pathname) ?? "fr";
  } catch {
    return "fr";
  }
}
