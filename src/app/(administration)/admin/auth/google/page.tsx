import type { Metadata } from "next";
import GoogleAuthCallbackClient from "@/app/(auth)/auth/google/GoogleAuthCallbackClient";
import DocumentLocale from "@/components/DocumentLocale";
import { getSafeAdminReturnTo } from "@/lib/admin-auth-redirect";

type AdminGoogleAuthPageProps = {
  searchParams: Promise<{
    returnTo?: string | string[];
  }>;
};

export const metadata: Metadata = {
  title: "Connexion Google Team | Demaa",
  robots: { follow: false, index: false },
};

export default async function AdminGoogleAuthPage({
  searchParams,
}: AdminGoogleAuthPageProps) {
  const params = await searchParams;
  const rawReturnTo = Array.isArray(params.returnTo)
    ? params.returnTo[0]
    : params.returnTo;
  const returnTo = getSafeAdminReturnTo(rawReturnTo);

  return (
    <>
      <DocumentLocale localeCode="fr" />
      <GoogleAuthCallbackClient
        accessKind="admin"
        localeCode="fr"
        returnTo={returnTo}
      />
    </>
  );
}
