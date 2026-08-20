import type { Metadata } from "next";
import { connection } from "next/server";
import Navbar from "@/components/Navbar";
import OpportunityAdminClient from "@/components/OpportunityAdminClient";
import { requireAdminIdentity } from "@/lib/admin-auth.server";
import { getPublicExpertises } from "@/lib/provider-network.server";

export const metadata: Metadata = {
  title: "Gestion des opportunités | Demaa",
  robots: { follow: false, index: false },
};

export default async function OpportunityAdminPage() {
  await connection();
  await requireAdminIdentity("/admin/opportunites");
  const expertises = await getPublicExpertises();
  return (
    <>
      <Navbar minimal />
      <main className="flex-1 bg-dema-cream px-5 pb-20 pt-12">
        <div className="mx-auto max-w-5xl">
          <h1 className="text-center text-4xl font-light tracking-[-0.04em] text-brand-blue">
            Gérer les opportunités
          </h1>
          <OpportunityAdminClient expertises={expertises} />
        </div>
      </main>
    </>
  );
}
