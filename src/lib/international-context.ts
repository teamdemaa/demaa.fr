export const INTERFACE_LOCALE_CODES = ["fr", "en"] as const;
export type InterfaceLocaleCode = (typeof INTERFACE_LOCALE_CODES)[number];

export const MARKET_CODES = ["fr-fr", "global-en-beta"] as const;
export type MarketCode = (typeof MARKET_CODES)[number];

export type CurrencyCode = "EUR";

export type InternationalContext = Readonly<{
  countryCode: string | null;
  currencyCode: CurrencyCode;
  localeCode: InterfaceLocaleCode;
  marketCode: MarketCode;
}>;

export const LOCALE_PREFERENCE_COOKIE = "demaa_locale";
export const LOCALE_PREFERENCE_MAX_AGE_SECONDS = 180 * 24 * 60 * 60;

export const FRANCE_CONTEXT: InternationalContext = {
  countryCode: null,
  currencyCode: "EUR",
  localeCode: "fr",
  marketCode: "fr-fr",
};

export const ENGLISH_BETA_CONTEXT: InternationalContext = {
  countryCode: null,
  currencyCode: "EUR",
  localeCode: "en",
  marketCode: "global-en-beta",
};

export function isInterfaceLocaleCode(
  value: unknown,
): value is InterfaceLocaleCode {
  return typeof value === "string"
    && INTERFACE_LOCALE_CODES.includes(value as InterfaceLocaleCode);
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

export function getInternationalContext(
  localeCode: InterfaceLocaleCode,
): InternationalContext {
  return localeCode === "en" ? ENGLISH_BETA_CONTEXT : FRANCE_CONTEXT;
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
