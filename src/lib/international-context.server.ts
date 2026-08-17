import "server-only";

import { cookies, headers } from "next/headers";
import { getCurrentCustomerIdentityFromSession } from "@/lib/customer-space-session.server";
import {
  LOCALE_PREFERENCE_COOKIE,
  getExplicitInterfaceLocaleFromPathname,
  getInternationalContext,
  normalizeInterfaceLocaleCode,
  resolveInterfaceLocale,
} from "@/lib/international-context";
import { readMemberLocalePreference } from "@/lib/member-locale-preference.server";

export async function resolveRequestInternationalContext(input: {
  manualPreference?: unknown;
  pathname?: string | null;
} = {}) {
  const headerStore = await headers();
  const pathname = input.pathname ?? null;
  const explicitLocale = pathname
    ? getExplicitInterfaceLocaleFromPathname(pathname)
    : normalizeInterfaceLocaleCode(headerStore.get("x-demaa-locale"));
  if (explicitLocale) return getInternationalContext(explicitLocale);

  const manualLocale = normalizeInterfaceLocaleCode(input.manualPreference);
  if (manualLocale) return getInternationalContext(manualLocale);

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
  const localeCode = resolveInterfaceLocale({
    acceptLanguage: headerStore.get("accept-language"),
    cookiePreference: cookieStore.get(LOCALE_PREFERENCE_COOKIE)?.value,
    memberPreference,
  });
  return getInternationalContext(localeCode);
}
