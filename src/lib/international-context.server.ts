import "server-only";

import { cookies, headers } from "next/headers";
import type { CustomerSessionIdentity } from "@/lib/customer-space-auth";
import { getCurrentCustomerIdentityFromSession } from "@/lib/customer-space-session.server";
import {
  getActiveCompanyContextForIdentity,
  type ActiveCompanyContext,
} from "@/lib/company-membership.server";
import {
  FRANCE_COMMERCIAL_CONTEXT,
  GLOBAL_ENGLISH_BETA_COMMERCIAL_CONTEXT,
  LOCALE_PREFERENCE_COOKIE,
  type CommercialContext,
  type InterfaceLocaleCode,
  type InternationalContext,
  createInternationalContext,
  getExplicitInterfaceLocaleFromPathname,
  normalizeInterfaceLocaleCode,
  resolveInterfaceLocale,
} from "@/lib/international-context";
import { readMemberLocalePreference } from "@/lib/member-locale-preference.server";

export async function resolveRequestInterfaceLocale(input: {
  manualPreference?: unknown;
  pathname?: string | null;
} = {}) {
  const headerStore = await headers();
  const pathname = input.pathname ?? null;
  const explicitLocale = pathname
    ? getExplicitInterfaceLocaleFromPathname(pathname)
    : normalizeInterfaceLocaleCode(headerStore.get("x-demaa-locale"));
  if (explicitLocale) return explicitLocale;

  const manualLocale = normalizeInterfaceLocaleCode(input.manualPreference);
  if (manualLocale) return manualLocale;

  const [cookieStore, identity] = await Promise.all([
    cookies(),
    getCurrentCustomerIdentityFromSession(),
  ]);
  let memberPreference = null;
  if (identity) {
    try {
      memberPreference = await readMemberLocalePreference(identity.uid);
    } catch (error) {
      console.error(
        "[international-context] Member preference unavailable",
        error instanceof Error ? error.message : "Unknown error",
      );
    }
  }
  return resolveInterfaceLocale({
    acceptLanguage: headerStore.get("accept-language"),
    cookiePreference: cookieStore.get(LOCALE_PREFERENCE_COOKIE)?.value,
    memberPreference,
  });
}

export async function resolveRequestInternationalContext(input: {
  commercialContext: CommercialContext;
  manualPreference?: unknown;
  pathname?: string | null;
}) {
  const localeCode = await resolveRequestInterfaceLocale(input);
  return createInternationalContext(localeCode, input.commercialContext);
}

/**
 * Returns the explicit server configuration used before authentication.
 * This is a product entry-point decision, not a general locale-to-market
 * inference. Authenticated surfaces must use the company resolver below.
 */
export function getConfiguredVisitorCommercialContext(
  localeCode: InterfaceLocaleCode,
): CommercialContext {
  return localeCode === "en"
    ? GLOBAL_ENGLISH_BETA_COMMERCIAL_CONTEXT
    : FRANCE_COMMERCIAL_CONTEXT;
}

export type AuthenticatedInternationalContext = Readonly<{
  companyContext: ActiveCompanyContext;
  internationalContext: InternationalContext;
}>;

/**
 * Builds the international context for an authenticated product surface.
 * Locale is a presentation choice; market, country and currency remain
 * server-owned company data and are never accepted from the browser here.
 */
export async function resolveAuthenticatedInternationalContext(input: {
  identity: Pick<CustomerSessionIdentity, "uid">;
  localeCode: InterfaceLocaleCode;
}): Promise<AuthenticatedInternationalContext> {
  const companyContext = await getActiveCompanyContextForIdentity(input.identity);
  if (!companyContext) {
    throw new Error("The active company context is unavailable.");
  }

  return {
    companyContext,
    internationalContext: createInternationalContext(
      input.localeCode,
      {
        countryCode: companyContext.countryCode,
        currencyCode: companyContext.currencyCode,
        marketCode: companyContext.marketCode,
      },
    ),
  };
}
