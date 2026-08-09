import "server-only";

import type { CanonicalService } from "@/lib/canonical-service-catalog";
import { getCanonicalOrigin } from "@/lib/site-url";

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

export function buildServicePageJsonLd(serviceEntry: CanonicalService) {
  const origin = getCanonicalOrigin();
  const pageUrl = `${origin}/services/${serviceEntry.slug}`;
  const pricing = serviceEntry.pricing;
  const isDirectDemaaOffer = pricing.mode !== "third-party-starting-monthly";
  const unitText = pricing.mode === "fixed-daily" ? "DAY" : "MONTH";
  const service = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: serviceEntry.name,
    description: serviceEntry.summary,
    url: pageUrl,
    serviceType: serviceEntry.eyebrow,
    provider: {
      "@type": "Organization",
      name: "Demaa",
    },
    ...(isDirectDemaaOffer
      ? {
          offers: {
            "@type": "Offer",
            description: pricing.note,
            price: (pricing.amountMinor / 100).toFixed(2),
            priceCurrency: pricing.currency,
            priceSpecification: {
              "@type": "UnitPriceSpecification",
              price: (pricing.amountMinor / 100).toFixed(2),
              priceCurrency: pricing.currency,
              valueAddedTaxIncluded: false,
              unitText,
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
          name: serviceEntry.name,
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
