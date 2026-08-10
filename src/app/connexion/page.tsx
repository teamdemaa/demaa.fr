import type { Metadata } from "next";
import Link from "next/link";
import CustomerMagicLinkConsumer from "@/components/CustomerMagicLinkConsumer";
import Navbar from "@/components/Navbar";
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
    <div data-action-plan-workspace className="min-h-screen bg-dema-cream text-brand-blue">
      <Navbar minimal />
      <main className="px-4 py-12 md:px-8 md:py-20">
        <section className="mx-auto max-w-md rounded-[1.15rem] border border-dema-line bg-dema-paper p-6 shadow-[0_12px_36px_rgba(23,35,29,0.04)] md:p-8">
          <h1 className="text-center text-3xl font-light tracking-[-0.04em] md:text-4xl">
            Se connecter
          </h1>
          <div className="mt-7">
            {token ? (
              <CustomerMagicLinkConsumer token={token} returnTo={returnTo} />
            ) : (
              <div className="text-center">
                <p className="text-sm leading-relaxed text-dema-muted">
                  Ce lien n’est plus valide. Demandez un nouveau lien.
                </p>
                <Link
                  href="/mon-espace"
                  className="mt-5 inline-flex min-h-11 items-center justify-center rounded-full bg-dema-forest px-6 text-sm font-medium text-dema-paper"
                >
                  Recevoir un nouveau lien
                </Link>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
