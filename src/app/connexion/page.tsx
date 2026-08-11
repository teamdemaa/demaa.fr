import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import CustomerSpaceAccessForm from "@/components/CustomerSpaceAccessForm";
import CustomerMagicLinkConsumer from "@/components/CustomerMagicLinkConsumer";
import Navbar from "@/components/Navbar";
import {
  CUSTOMER_SPACE_COOKIE,
  getEmailFromCustomerSessionToken,
} from "@/lib/customer-space-auth";
import { getSafeCustomerReturnTo } from "@/lib/customer-space-redirect";

export const metadata: Metadata = {
  title: "Connexion sécurisée | Demaa",
  robots: { index: false, follow: false },
};

type ConnexionPageProps = {
  searchParams: Promise<{
    returnTo?: string | string[];
    token?: string | string[];
    message?: string | string[];
  }>;
};

export default async function ConnexionPage({ searchParams }: ConnexionPageProps) {
  const params = await searchParams;
  const rawToken = Array.isArray(params.token) ? params.token[0] : params.token;
  const rawReturnTo = Array.isArray(params.returnTo) ? params.returnTo[0] : params.returnTo;
  const rawMessage = Array.isArray(params.message) ? params.message[0] : params.message;
  const token = rawToken?.trim().slice(0, 80) || "";
  const returnTo = getSafeCustomerReturnTo(rawReturnTo || "/plans");

  if (!token) {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get(CUSTOMER_SPACE_COOKIE)?.value || null;
    const email = await getEmailFromCustomerSessionToken(sessionToken);
    if (email) redirect(returnTo);

    return (
      <div data-action-plan-workspace className="min-h-screen bg-dema-cream text-brand-blue">
        <Navbar minimal />
        <main className="px-4 py-12 md:px-8 md:py-20">
          <section className="mx-auto max-w-md rounded-[1.15rem] border border-dema-line bg-dema-paper p-6 text-center shadow-[0_12px_36px_rgba(23,35,29,0.04)] md:p-8">
            <h1 className="text-3xl font-light tracking-[-0.04em] md:text-4xl">
              Se connecter
            </h1>
            <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-dema-muted">
              Entrez votre adresse e-mail pour recevoir un lien sécurisé.
            </p>
            {rawMessage ? (
              <p className="mt-4 rounded-[0.9rem] border border-dema-forest/15 bg-dema-sage/70 px-4 py-3 text-sm text-dema-forest">
                {rawMessage.slice(0, 180)}
              </p>
            ) : null}
            <div className="mt-6">
              <CustomerSpaceAccessForm returnTo={returnTo} simple />
            </div>
          </section>
        </main>
      </div>
    );
  }

  return (
    <div data-action-plan-workspace className="flex min-h-dvh items-center justify-center bg-dema-forest px-6 text-dema-paper">
      <main className="w-full max-w-md text-center">
        <p className="demaa-hero-title text-4xl">Demaa</p>
        <h1 className="sr-only">Connexion sécurisée</h1>
        <div className="mt-8 text-dema-paper/80">
          {token ? (
            <CustomerMagicLinkConsumer token={token} returnTo={returnTo} />
          ) : (
            <p className="text-sm leading-relaxed">
              Ce lien n’est plus valide. Revenez dans l’application pour en demander un nouveau.
            </p>
          )}
        </div>
      </main>
    </div>
  );
}
