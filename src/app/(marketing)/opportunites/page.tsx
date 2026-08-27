import { connection } from "next/server";
import Navbar from "@/components/Navbar";
import PublicOpportunitiesClient from "@/components/PublicOpportunitiesClient";
import {
  buildOpportunitiesJsonLd,
  serializeOpportunitiesJsonLd,
} from "@/lib/opportunities-seo";
import {
  getPublicExpertises,
  getPublicOpenOpportunities,
} from "@/lib/provider-network.server";
import { preserveOpportunityEnrichment } from "@/lib/public-opportunities-snapshot";
import { buildPublicPageMetadata } from "@/lib/public-page-metadata";

const title = "Annonces | Demaa";
const description =
  "Découvrez les annonces actuellement disponibles.";

export const metadata = buildPublicPageMetadata({
  title,
  description,
  path: "/opportunites",
});

export default async function OpportunitiesPage() {
  await connection();
  const [expertises, opportunities] = await Promise.all([
    getPublicExpertises(),
    getPublicOpenOpportunities(),
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: serializeOpportunitiesJsonLd(buildOpportunitiesJsonLd(opportunities)),
        }}
      />
      <Navbar />
      <main className="flex-1 bg-dema-cream px-5 pb-20 pt-12 sm:pb-24 sm:pt-16">
        <div className="mx-auto max-w-4xl">
          <header className="mx-auto max-w-3xl text-center">
            <h1 className="text-balance text-4xl font-light leading-[1.05] tracking-[-0.045em] text-brand-blue sm:text-5xl lg:text-[3.6rem]">
              Annonces
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-balance text-base font-light leading-7 text-dema-muted sm:text-lg">
              Découvrez les annonces actuellement disponibles.
            </p>
          </header>
          <PublicOpportunitiesClient
            expertises={expertises}
            initialEmail=""
            opportunities={preserveOpportunityEnrichment(opportunities)}
          />
        </div>
      </main>
    </>
  );
}
