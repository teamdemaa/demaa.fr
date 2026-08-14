import type { Metadata } from "next";
import { connection } from "next/server";
import { cookies } from "next/headers";
import Navbar from "@/components/Navbar";
import PublicOpportunitiesClient from "@/components/PublicOpportunitiesClient";
import {
  getPublicExpertises,
  getPublicOpenOpportunities,
} from "@/lib/provider-network.server";
import { preserveOpportunityEnrichment } from "@/lib/public-opportunities-snapshot";
import {
  CUSTOMER_SPACE_COOKIE,
  getEmailFromCustomerSessionToken,
} from "@/lib/customer-space-auth";

const title = "Opportunités | Demaa";
const description =
  "Découvrez les opportunités actuellement disponibles.";

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
  await connection();
  const cookieStore = await cookies();
  const [expertises, opportunities, email] = await Promise.all([
    getPublicExpertises(),
    getPublicOpenOpportunities(),
    getEmailFromCustomerSessionToken(
      cookieStore.get(CUSTOMER_SPACE_COOKIE)?.value ?? null,
    ),
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
              Découvrez les opportunités actuellement disponibles.
            </p>
          </header>
          <PublicOpportunitiesClient
            expertises={expertises}
            initialEmail={email ?? ""}
            opportunities={preserveOpportunityEnrichment(opportunities)}
          />
        </div>
      </main>
    </>
  );
}
