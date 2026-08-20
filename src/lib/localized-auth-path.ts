import type { InterfaceLocaleCode } from "@/lib/international-context";

export function getLocalizedConnexionPath(localeCode: InterfaceLocaleCode) {
  return localeCode === "en" ? "/en/connexion" : "/connexion";
}

export function getLocalizedGoogleAuthPath(localeCode: InterfaceLocaleCode) {
  return localeCode === "en" ? "/en/auth/google" : "/auth/google";
}

export function buildLocalizedConnexionHref(input: {
  localeCode: InterfaceLocaleCode;
  message?: string;
  returnTo: string;
}) {
  const params = new URLSearchParams({ returnTo: input.returnTo });
  if (input.message) params.set("message", input.message);
  return `${getLocalizedConnexionPath(input.localeCode)}?${params.toString()}`;
}

export function buildLocalizedGoogleAuthHref(input: {
  localeCode: InterfaceLocaleCode;
  returnTo: string;
}) {
  const params = new URLSearchParams({
    locale: input.localeCode,
    returnTo: input.returnTo,
  });
  return `${getLocalizedGoogleAuthPath(input.localeCode)}?${params.toString()}`;
}
