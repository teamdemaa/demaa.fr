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
  const isDirectDemaaOffer = serviceEntry.delivery === "demaa";
  const unitText = pricing.mode === "fixed-daily"
    ? "DAY"
    : pricing.mode === "fixed-monthly-hours"
    ? "MONTH"
    : null;
  const directOffer = isDirectDemaaOffer && "amountMinor" in pricing
    ? {
        "@type": "Offer",
        description: pricing.note,
        price: (pricing.amountMinor / 100).toFixed(2),
        priceCurrency: pricing.currency,
        ...(unitText
          ? {
              priceSpecification: {
                "@type": "UnitPriceSpecification",
                price: (pricing.amountMinor / 100).toFixed(2),
                priceCurrency: pricing.currency,
                valueAddedTaxIncluded: false,
                unitText,
              },
            }
          : {}),
        url: pageUrl,
      }
    : null;
  const service = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: serviceEntry.name,
    description: serviceEntry.summary,
    url: pageUrl,
    serviceType: serviceEntry.eyebrow,
    ...(serviceEntry.delivery === "demaa"
      ? {
          provider: {
            "@type": "Organization",
            name: "Demaa",
          },
        }
      : {}),
    ...(directOffer ? { offers: directOffer } : {}),
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
