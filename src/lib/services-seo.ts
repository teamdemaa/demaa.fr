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
        name: "Accompagnement",
        item: `${origin}/services`,
      },
    ],
  };
}

export function buildServicePageJsonLd(serviceEntry: CanonicalService) {
  const origin = getCanonicalOrigin();
  const pageUrl = `${origin}${serviceEntry.detailHref}`;
  const pricing = serviceEntry.pricing;
  const isDirectDemaaOffer = serviceEntry.delivery === "demaa";
  const unitText = pricing?.label.includes("/ jour")
    ? "DAY"
    : pricing?.label.includes("/ mois") ? "MONTH" : null;
  const directOffer = isDirectDemaaOffer && pricing && typeof pricing.amountMinor === "number"
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
  const packageOffers = isDirectDemaaOffer
    ? serviceEntry.packages.map((servicePackage) => ({
        "@type": "Offer",
        name: servicePackage.name,
        description: servicePackage.summary,
        price: (servicePackage.pricing.amountMinor / 100).toFixed(2),
        priceCurrency: servicePackage.pricing.currency,
        url: pageUrl,
      }))
    : [];
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
    ...(packageOffers.length > 0
      ? { offers: packageOffers }
      : directOffer ? { offers: directOffer } : {}),
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
          name: "Accompagnement",
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
