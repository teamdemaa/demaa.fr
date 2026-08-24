import "server-only";

import type { PublicOpportunity } from "@/lib/opportunity-contract";
import { getCanonicalOrigin } from "@/lib/site-url";

export function buildOpportunitiesJsonLd(
  opportunities: readonly PublicOpportunity[],
) {
  const origin = getCanonicalOrigin();
  const canonicalUrl = `${origin}/opportunites`;

  return [
    {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: "Annonces | Demaa",
      description: "Découvrez les annonces actuellement disponibles.",
      url: canonicalUrl,
    },
    {
      "@context": "https://schema.org",
      "@type": "ItemList",
      name: "Annonces",
      itemListElement: opportunities.map((opportunity, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: opportunity.title,
        url: `${canonicalUrl}?opportunity=${opportunity.opportunityId}`,
      })),
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Accueil",
          item: origin,
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "Annonces",
          item: canonicalUrl,
        },
      ],
    },
  ];
}

export function serializeOpportunitiesJsonLd(value: unknown) {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}
