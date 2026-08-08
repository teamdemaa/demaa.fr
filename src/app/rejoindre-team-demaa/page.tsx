import type { Metadata } from "next";
import { connection } from "next/server";
import ExpertiseCatalogClient from "@/components/ExpertiseCatalogClient";
import Navbar from "@/components/Navbar";
import { getPublicExpertises } from "@/lib/provider-network.server";

const title = "Rejoindre Team Demaa | Demaa";
const description =
  "Présentez votre profil professionnel à Demaa et soyez contacté lorsqu’un besoin correspond à votre expertise.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/rejoindre-team-demaa" },
  openGraph: {
    title,
    description,
    url: "/rejoindre-team-demaa",
    siteName: "Demaa",
    locale: "fr_FR",
    type: "website",
  },
};

export default async function JoinTeamDemaaPage() {
  await connection();
  const expertises = await getPublicExpertises();

  return (
    <>
      <Navbar />
      <main className="flex-1 bg-dema-cream px-5 pb-20 pt-12 sm:pb-24 sm:pt-16">
        <div className="mx-auto max-w-6xl">
          <header className="mx-auto max-w-3xl text-center">
            <h1 className="text-balance text-4xl font-light leading-[1.05] tracking-[-0.045em] text-brand-blue sm:text-5xl lg:text-[3.6rem]">
              Rejoindre Team Demaa
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-balance text-base font-light leading-7 text-dema-muted sm:text-lg">
              Demaa constitue un réseau de professionnels de confiance. Présentez votre profil et nous vous contacterons lorsqu’un besoin correspond à votre expertise.
            </p>
          </header>
          <ExpertiseCatalogClient expertises={expertises} />
        </div>
      </main>
    </>
  );
}
