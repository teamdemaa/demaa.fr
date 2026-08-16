import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import CustomerSpaceAccessForm from "@/components/CustomerSpaceAccessForm";
import Navbar from "@/components/Navbar";
import {
  CUSTOMER_SPACE_COOKIE,
  getIdentityFromCustomerSessionToken,
} from "@/lib/customer-space-auth";
import { getSafeCustomerReturnTo } from "@/lib/customer-space-redirect";

export const metadata: Metadata = {
  title: "Connexion sécurisée | Demaa",
  robots: { index: false, follow: false },
};

type ConnexionPageProps = {
  searchParams: Promise<{
    returnTo?: string | string[];
    message?: string | string[];
  }>;
};

export default async function ConnexionPage({ searchParams }: ConnexionPageProps) {
  const params = await searchParams;
  const rawReturnTo = Array.isArray(params.returnTo) ? params.returnTo[0] : params.returnTo;
  const rawMessage = Array.isArray(params.message) ? params.message[0] : params.message;
  const returnTo = getSafeCustomerReturnTo(rawReturnTo || "/plans/latest");

  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(CUSTOMER_SPACE_COOKIE)?.value || null;
  const identity = await getIdentityFromCustomerSessionToken(sessionToken);
  if (identity) redirect(returnTo);

  return (
      <div data-action-plan-workspace className="min-h-screen bg-dema-cream text-brand-blue">
        <Navbar minimal />
        <main className="px-4 py-12 md:px-8 md:py-20">
          <section className="mx-auto max-w-md rounded-[1.15rem] border border-dema-line bg-dema-paper p-6 text-center shadow-[0_12px_36px_rgba(23,35,29,0.04)] md:p-8">
            <h1 className="text-3xl font-light tracking-[-0.04em] md:text-4xl">
              Se connecter
            </h1>
            <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-dema-muted">
              Retrouvez vos plans avec votre adresse e-mail et votre mot de passe.
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
