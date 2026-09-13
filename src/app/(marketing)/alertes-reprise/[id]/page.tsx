import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import RepriseAlertManagement from "@/components/RepriseAlertManagement";
import { getRepriseAlertByAccess } from "@/lib/reprise-alert-storage.server";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Gérer mon alerte de reprise | Demaa",
  robots: { follow: false, index: false },
};

export default async function RepriseAlertPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ action?: string | string[]; token?: string | string[] }>;
}) {
  const [{ id }, query] = await Promise.all([params, searchParams]);
  const token = typeof query.token === "string" ? query.token : "";
  const alert = token ? await getRepriseAlertByAccess(id, token) : null;

  return (
    <>
      <Navbar minimal />
      <main className="flex min-h-[70vh] items-center bg-dema-cream px-5 py-16 text-brand-blue sm:px-8 sm:py-24">
        <div className="mx-auto w-full max-w-3xl">
          {alert ? <RepriseAlertManagement accessToken={token} alertId={alert.id} initialCriteria={alert.criteria} initialDeleteIntent={query.action === "unsubscribe"} /> : <div className="rounded-[1.75rem] border border-dema-line bg-dema-paper p-7 text-center sm:p-10"><h1 className="text-3xl font-normal tracking-[-0.04em]">Ce lien n’est plus valide.</h1><p className="mt-3 text-sm leading-6 text-dema-muted">L’alerte a peut-être déjà été supprimée.</p><Link href="/a-reprendre" className="mt-6 inline-block text-sm font-medium text-dema-forest underline underline-offset-4">Créer une nouvelle alerte</Link></div>}
        </div>
      </main>
    </>
  );
}
