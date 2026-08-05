import "server-only";

import type { PublishedServiceOfferDto } from "@/lib/service-catalog-v2-dto";
import { getCanonicalOrigin } from "@/lib/site-url";

function hasLegallyCompleteFixedPrice(offer: PublishedServiceOfferDto) {
  return (
    offer.pricing.mode === "fixed" &&
    (offer.operatorType === "demaa" || offer.operatorType === "odema") &&
    Object.values(offer.scope).every((entries) => entries.length > 0)
  );
}

export function buildServicesIndexJsonLd() {
  const origin = getCanonicalOrigin();

  return {
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
        name: "Services",
        item: `${origin}/services`,
      },
    ],
  };
}

export function buildServicePageJsonLd(offer: PublishedServiceOfferDto) {
  const origin = getCanonicalOrigin();
  const pageUrl = `${origin}/services/${offer.slug}`;
  const service = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: offer.title,
    description: offer.description,
    url: pageUrl,
    serviceType: offer.categoryTitle,
    provider: {
      "@type": "Organization",
      name: offer.operatorType === "demaa" ? "Demaa" : "ODEMA",
    },
    ...(hasLegallyCompleteFixedPrice(offer) && offer.pricing.mode === "fixed"
      ? {
          offers: {
            "@type": "Offer",
            price: (offer.pricing.amountMinor / 100).toFixed(2),
            priceCurrency: offer.pricing.currency,
            priceSpecification: {
              "@type": "UnitPriceSpecification",
              price: (offer.pricing.amountMinor / 100).toFixed(2),
              priceCurrency: offer.pricing.currency,
              valueAddedTaxIncluded: offer.pricing.taxMode !== "excluding_tax",
            },
            url: pageUrl,
          },
        }
      : {}),
  };

  return [
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
          name: "Services",
          item: `${origin}/services`,
        },
        {
          "@type": "ListItem",
          position: 3,
          name: offer.title,
          item: pageUrl,
        },
      ],
    },
    service,
  ];
}

export function serializeServicesJsonLd(value: unknown) {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}
