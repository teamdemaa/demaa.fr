import type { Metadata } from "next";
import GoogleAuthCallbackClient from "./GoogleAuthCallbackClient";
import { getSafeCustomerReturnTo } from "@/lib/customer-space-redirect";
import {
  getReturnToInterfaceLocale,
  normalizeInterfaceLocaleCode,
} from "@/lib/international-context";

export const metadata: Metadata = {
  title: "Connexion Google | Demaa",
  robots: { index: false, follow: false },
};

export default async function GoogleAuthPage({
  searchParams,
}: {
  searchParams: Promise<{
    locale?: string | string[];
    returnTo?: string | string[];
  }>;
}) {
  const params = await searchParams;
  const rawReturnTo = Array.isArray(params.returnTo)
    ? params.returnTo[0]
    : params.returnTo;
  const returnTo = getSafeCustomerReturnTo(rawReturnTo);
  const rawLocale = Array.isArray(params.locale) ? params.locale[0] : params.locale;
  const localeCode = normalizeInterfaceLocaleCode(rawLocale)
    ?? getReturnToInterfaceLocale(returnTo);

  return <GoogleAuthCallbackClient localeCode={localeCode} returnTo={returnTo} />;
}
