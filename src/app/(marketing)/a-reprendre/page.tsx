import type { Metadata } from "next";
import RepriseMarketplaceClient from "@/components/RepriseMarketplaceClient";
import {
  buildRepriseMarketplaceJsonLd,
  serializeRepriseJsonLd,
} from "@/lib/reprise-opportunity-seo";
import {
  repriseOpportunities,
  sortRepriseOpportunitiesByInformation,
} from "@/lib/reprise-opportunities";
import { buildPublicPageMetadata } from "@/lib/public-page-metadata";

export const metadata: Metadata = buildPublicPageMetadata({
  title: "Entreprises à reprendre : PME de services | Demaa",
  description: "Découvrez des entreprises à reprendre, en activité, avec des clients, une équipe et un savoir-faire déjà en place.",
  path: "/a-reprendre",
});

export default async function RepriseMarketplacePage({
  searchParams,
}: {
  searchParams: Promise<{ opportunite?: string | string[] }>;
}) {
  const opportunity = (await searchParams).opportunite;
  const sortedOpportunities = sortRepriseOpportunitiesByInformation(repriseOpportunities);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: serializeRepriseJsonLd(buildRepriseMarketplaceJsonLd(sortedOpportunities)),
        }}
      />
      <RepriseMarketplaceClient
        initialOpportunityId={typeof opportunity === "string" ? opportunity : undefined}
        opportunities={repriseOpportunities}
      />
    </>
  );
}
