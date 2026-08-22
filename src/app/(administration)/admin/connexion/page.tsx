import type { Metadata } from "next";
import { redirect } from "next/navigation";
import CustomerSpaceAccessForm from "@/components/CustomerSpaceAccessForm";
import Navbar from "@/components/Navbar";
import { getCurrentAdminIdentity } from "@/lib/admin-auth.server";
import { getSafeAdminReturnTo } from "@/lib/admin-auth-redirect";

type AdminConnexionPageProps = {
  searchParams: Promise<{
    returnTo?: string | string[];
  }>;
};

export const metadata: Metadata = {
  title: "Connexion Team | Demaa",
  robots: { follow: false, index: false },
};

export default async function AdminConnexionPage({
  searchParams,
}: AdminConnexionPageProps) {
  const params = await searchParams;
  const rawReturnTo = Array.isArray(params.returnTo)
    ? params.returnTo[0]
    : params.returnTo;
  const returnTo = getSafeAdminReturnTo(rawReturnTo);
  const identity = await getCurrentAdminIdentity();
  if (identity) redirect(returnTo);

  return (
    <div className="min-h-screen bg-dema-cream text-brand-blue">
      <Navbar minimal />
      <main className="px-4 py-12 md:px-8 md:py-20">
        <section className="mx-auto max-w-md rounded-[1.15rem] border border-dema-line bg-dema-paper p-6 text-center shadow-[0_12px_36px_rgba(23,35,29,0.04)] md:p-8">
          <h1 className="sr-only">Connexion à la Team Demaa</h1>
          <CustomerSpaceAccessForm
            accessKind="admin"
            choiceTitle="Accès Team Demaa"
            returnTo={returnTo}
          />
          <p className="mt-5 text-xs leading-relaxed text-dema-muted">
            Cet accès est réservé aux comptes Firebase autorisés de la Team Demaa.
          </p>
        </section>
      </main>
    </div>
  );
}
