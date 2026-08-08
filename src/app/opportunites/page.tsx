import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import PublicOpportunitiesClient from "@/components/PublicOpportunitiesClient";
import {
  getPublicExpertises,
  getPublicOpenOpportunities,
} from "@/lib/provider-network.server";

const title = "Opportunités | Demaa";
const description =
  "Consultez les besoins actuellement ouverts et proposez votre profil à Demaa.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/opportunites" },
  openGraph: {
    title,
    description,
    url: "/opportunites",
    siteName: "Demaa",
    locale: "fr_FR",
    type: "website",
  },
};

export default async function OpportunitiesPage() {
  const [expertises, opportunities] = await Promise.all([
    getPublicExpertises(),
    getPublicOpenOpportunities(),
  ]);

  return (
    <>
      <Navbar />
      <main className="flex-1 bg-dema-cream px-5 pb-20 pt-12 sm:pb-24 sm:pt-16">
        <div className="mx-auto max-w-4xl">
          <header className="mx-auto max-w-3xl text-center">
            <h1 className="text-balance text-4xl font-light leading-[1.05] tracking-[-0.045em] text-brand-blue sm:text-5xl lg:text-[3.6rem]">
              Opportunités
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-balance text-base font-light leading-7 text-dema-muted sm:text-lg">
              Des entreprises ont un besoin concret maintenant. Consultez les opportunités ouvertes et proposez votre profil.
            </p>
          </header>
          <PublicOpportunitiesClient
            expertises={expertises}
            opportunities={opportunities}
          />
        </div>
      </main>
    </>
  );
}
