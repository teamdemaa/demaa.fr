import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import OpportunityAdminClient from "@/components/OpportunityAdminClient";
import { getPublicExpertises } from "@/lib/provider-network.server";

export const metadata: Metadata = {
  title: "Gestion des opportunités | Demaa",
  robots: { follow: false, index: false },
};

export default async function OpportunityAdminPage() {
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
