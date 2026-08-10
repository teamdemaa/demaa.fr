import type { Metadata } from "next";
import CustomerMagicLinkConsumer from "@/components/CustomerMagicLinkConsumer";
import { getSafeCustomerReturnTo } from "@/lib/customer-space-redirect";

export const metadata: Metadata = {
  title: "Connexion sécurisée | Demaa",
  robots: { index: false, follow: false },
};

type ConnexionPageProps = {
  searchParams: Promise<{
    returnTo?: string | string[];
    token?: string | string[];
  }>;
};

export default async function ConnexionPage({ searchParams }: ConnexionPageProps) {
  const params = await searchParams;
  const rawToken = Array.isArray(params.token) ? params.token[0] : params.token;
  const rawReturnTo = Array.isArray(params.returnTo) ? params.returnTo[0] : params.returnTo;
  const token = rawToken?.trim().slice(0, 80) || "";
  const returnTo = getSafeCustomerReturnTo(rawReturnTo);

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
