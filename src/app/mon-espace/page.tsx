import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import CustomerSpaceAccessForm from "@/components/CustomerSpaceAccessForm";
import Navbar from "@/components/Navbar";
import { CUSTOMER_SPACE_COOKIE, getEmailFromCustomerSessionToken } from "@/lib/customer-space-auth";
import { getOwnedActionPlans } from "@/lib/action-plan-storage.server";

export const metadata: Metadata = {
  title: "Se connecter | Demaa",
  description: "Connectez-vous pour retrouver votre plan d’action Demaa.",
  alternates: {
    canonical: "/mon-espace",
  },
  robots: {
    index: false,
    follow: false,
  },
  openGraph: {
    title: "Se connecter | Demaa",
    description: "Connectez-vous pour retrouver votre plan d’action Demaa.",
    url: "/mon-espace",
    siteName: "Demaa",
    locale: "fr_FR",
    type: "website",
  },
};

export const dynamic = "force-dynamic";

type MonEspacePageProps = {
  searchParams: Promise<{
    error?: string | string[];
    message?: string | string[];
  }>;
};

export default async function MonEspacePage({ searchParams }: MonEspacePageProps) {
  const params = await searchParams;
  const error = Array.isArray(params.error) ? params.error[0] : params.error;
  const message = Array.isArray(params.message) ? params.message[0] : params.message;
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(CUSTOMER_SPACE_COOKIE)?.value || null;
  const email = await getEmailFromCustomerSessionToken(sessionToken);

  if (!email) {
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
            {error ? (
              <p className="mt-4 rounded-[0.9rem] border border-dema-forest/15 bg-dema-sage/70 px-4 py-3 text-sm text-dema-forest">
                {error === "lien-expire"
                  ? "Le lien n’est plus valide. Demandez un nouveau lien."
                  : message || "Impossible de finaliser l’accès. Demandez un nouveau lien."}
              </p>
            ) : null}
            <div className="mt-6">
              <CustomerSpaceAccessForm returnTo="/mon-espace" simple />
            </div>
          </section>
        </main>
      </div>
    );
  }

  const [latestPlan] = await getOwnedActionPlans(email);
  redirect(latestPlan ? `/plans/${latestPlan.id}` : "/");
}
