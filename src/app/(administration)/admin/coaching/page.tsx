import type { Metadata } from "next";
import { connection } from "next/server";
import Navbar from "@/components/Navbar";
import CoachingAdminClient from "@/components/CoachingAdminClient";
import { requireAdminIdentity } from "@/lib/admin-auth.server";

export const metadata: Metadata = {
  title: "Conversations historiques | Demaa",
  robots: { follow: false, index: false },
};

export default async function CoachingAdminPage() {
  await connection();
  await requireAdminIdentity("/admin/coaching");
  return (
    <>
      <Navbar adminControls minimal />
      <main className="flex-1 bg-dema-cream px-5 pb-20 pt-12">
        <div className="mx-auto max-w-5xl">
          <h1 className="text-center text-4xl font-light tracking-[-0.04em] text-brand-blue">
            Conversations historiques
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-center text-sm leading-relaxed text-dema-muted">
            Cet ancien espace de conversation est conservé temporairement pour consultation et rollback.
            Les demandes actuelles, dont les Diagnostics, sont traitées dans Demandes et reçoivent une réponse par e-mail.
          </p>
          <CoachingAdminClient />
        </div>
      </main>
    </>
  );
}
