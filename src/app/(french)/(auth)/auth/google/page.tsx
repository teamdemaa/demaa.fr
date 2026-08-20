import type { Metadata } from "next";
import DocumentLocale from "@/components/DocumentLocale";
import GoogleAuthCallbackClient from "./GoogleAuthCallbackClient";
import { getSafeCustomerReturnTo } from "@/lib/customer-space-redirect";
import {
  getReturnToInterfaceLocale,
  normalizeInterfaceLocaleCode,
} from "@/lib/international-context";

type GoogleAuthPageProps = {
  searchParams: Promise<{
    locale?: string | string[];
    returnTo?: string | string[];
  }>;
};

async function resolveGoogleAuthContext(searchParams: GoogleAuthPageProps["searchParams"]) {
  const params = await searchParams;
  const rawReturnTo = Array.isArray(params.returnTo)
    ? params.returnTo[0]
    : params.returnTo;
  const returnTo = getSafeCustomerReturnTo(rawReturnTo);
  const rawLocale = Array.isArray(params.locale) ? params.locale[0] : params.locale;
  const localeCode = normalizeInterfaceLocaleCode(rawLocale)
    ?? getReturnToInterfaceLocale(returnTo);

  return { localeCode, returnTo };
}

export async function generateMetadata({
  searchParams,
}: GoogleAuthPageProps): Promise<Metadata> {
  const { localeCode } = await resolveGoogleAuthContext(searchParams);
  return {
    title: localeCode === "en" ? "Google sign-in | Demaa" : "Connexion Google | Demaa",
    robots: { index: false, follow: false },
  };
}

export default async function GoogleAuthPage({
  searchParams,
}: GoogleAuthPageProps) {
  const { localeCode, returnTo } = await resolveGoogleAuthContext(searchParams);

  return (
    <>
      <DocumentLocale localeCode={localeCode} />
      <GoogleAuthCallbackClient localeCode={localeCode} returnTo={returnTo} />
    </>
  );
}
