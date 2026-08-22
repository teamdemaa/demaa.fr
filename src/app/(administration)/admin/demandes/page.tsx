import type { Metadata } from "next";
import { connection } from "next/server";
import Navbar from "@/components/Navbar";
import LeadRequestsAdminClient from "@/components/LeadRequestsAdminClient";
import { requireAdminIdentity } from "@/lib/admin-auth.server";

export const metadata: Metadata = {
  title: "Récap des demandes | Demaa",
  robots: { follow: false, index: false },
};

export default async function LeadRequestsAdminPage() {
  await connection();
  await requireAdminIdentity("/admin/demandes");
  return (
    <>
      <Navbar adminControls minimal />
      <main className="flex-1 bg-dema-cream px-5 pb-20 pt-12">
        <div className="mx-auto max-w-5xl">
          <h1 className="text-center text-4xl font-light tracking-[-0.04em] text-brand-blue">
            Récap des demandes
          </h1>
          <LeadRequestsAdminClient />
        </div>
      </main>
    </>
  );
}
