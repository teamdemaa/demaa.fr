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
  title: "PME B2B rentables à reprendre | Demaa",
  description: "Découvrez des PME B2B rentables à reprendre dans les services, les activités techniques, l’industrie et les logiciels métier.",
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
