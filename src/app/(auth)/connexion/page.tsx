import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import CustomerSpaceAccessForm from "@/components/CustomerSpaceAccessForm";
import DocumentLocale from "@/components/DocumentLocale";
import Navbar from "@/components/Navbar";
import {
  CUSTOMER_SPACE_COOKIE,
  getIdentityFromCustomerSessionToken,
} from "@/lib/customer-space-auth";
import { getSafeCustomerReturnTo } from "@/lib/customer-space-redirect";
import { getReturnToInterfaceLocale } from "@/lib/international-context";

type ConnexionPageProps = {
  searchParams: Promise<{
    returnTo?: string | string[];
    message?: string | string[];
  }>;
};

async function resolveConnexionContext(searchParams: ConnexionPageProps["searchParams"]) {
  const params = await searchParams;
  const rawReturnTo = Array.isArray(params.returnTo) ? params.returnTo[0] : params.returnTo;
  const rawMessage = Array.isArray(params.message) ? params.message[0] : params.message;
  const returnTo = getSafeCustomerReturnTo(rawReturnTo || "/plans/latest");
  return {
    localeCode: getReturnToInterfaceLocale(returnTo),
    rawMessage,
    returnTo,
  };
}

export async function generateMetadata({
  searchParams,
}: ConnexionPageProps): Promise<Metadata> {
  const { localeCode } = await resolveConnexionContext(searchParams);
  return {
    title: localeCode === "en" ? "Secure sign-in | Demaa" : "Connexion sécurisée | Demaa",
    robots: { index: false, follow: false },
  };
}

export default async function ConnexionPage({ searchParams }: ConnexionPageProps) {
  const { localeCode, rawMessage, returnTo } = await resolveConnexionContext(searchParams);

  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(CUSTOMER_SPACE_COOKIE)?.value || null;
  const identity = await getIdentityFromCustomerSessionToken(sessionToken);
  if (identity) redirect(returnTo);

  return (
      <div data-action-plan-workspace className="min-h-screen bg-dema-cream text-brand-blue">
        <DocumentLocale localeCode={localeCode} />
        <Navbar minimal localeCode={localeCode} />
        <main className="px-4 py-12 md:px-8 md:py-20">
          <section className="mx-auto max-w-md rounded-[1.15rem] border border-dema-line bg-dema-paper p-6 text-center shadow-[0_12px_36px_rgba(23,35,29,0.04)] md:p-8">
            <h1 className="sr-only">{localeCode === "en" ? "Sign in to Demaa" : "Connexion à Demaa"}</h1>
            {rawMessage ? (
              <p className="mb-4 rounded-[0.9rem] border border-dema-forest/15 bg-dema-sage/70 px-4 py-3 text-sm text-dema-forest">
                {localeCode === "en" ? "Sign in to continue." : rawMessage.slice(0, 180)}
              </p>
            ) : null}
            <CustomerSpaceAccessForm
              choiceTitle={localeCode === "en" ? "Sign in" : "Connectez-vous"}
              localeCode={localeCode}
              returnTo={returnTo}
            />
          </section>
        </main>
      </div>
  );
}
