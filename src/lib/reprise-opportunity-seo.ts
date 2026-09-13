import type { RepriseOpportunity } from "@/lib/reprise-opportunities";
import { getCanonicalOrigin } from "@/lib/site-url";

export function getRepriseOpportunityPath(opportunity: Pick<RepriseOpportunity, "id">) {
  return `/a-reprendre/${opportunity.id}`;
}

export function getRepriseOpportunityDescription(opportunity: RepriseOpportunity) {
  const location = opportunity.location.includes("non communiquée")
    ? "en France"
    : opportunity.location.startsWith("France")
      ? `en ${opportunity.location}`
      : opportunity.location.startsWith("À ")
        ? `à ${opportunity.location.slice(2)}`
        : `à ${opportunity.location}`;
  const revenue = opportunity.revenue
    ? ` Chiffre d’affaires publié : ${opportunity.revenue}.`
    : "";

  return `${opportunity.activity} à reprendre ${location}.${revenue} Consultez les informations disponibles et demandez une mise en relation.`;
}

export function buildRepriseMarketplaceJsonLd(opportunities: readonly RepriseOpportunity[]) {
  const origin = getCanonicalOrigin();
  const marketplaceUrl = `${origin}/a-reprendre`;

  return [
    {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      "@id": `${marketplaceUrl}#collection`,
      name: "PME de services à reprendre | Demaa",
      description: "Découvrez des entreprises de services en activité, avec des clients, une équipe et un savoir-faire déjà en place.",
      url: marketplaceUrl,
      isPartOf: { "@id": `${origin}/#website` },
      mainEntity: { "@id": `${marketplaceUrl}#opportunities` },
    },
    {
      "@context": "https://schema.org",
      "@type": "ItemList",
      "@id": `${marketplaceUrl}#opportunities`,
      name: "Entreprises à reprendre",
      numberOfItems: opportunities.length,
      itemListElement: opportunities.map((opportunity, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: opportunity.activity,
        url: `${origin}${getRepriseOpportunityPath(opportunity)}`,
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
          name: "À reprendre",
          item: marketplaceUrl,
        },
      ],
    },
  ];
}

export function buildRepriseOpportunityJsonLd(opportunity: RepriseOpportunity) {
  const origin = getCanonicalOrigin();
  const marketplaceUrl = `${origin}/a-reprendre`;
  const opportunityUrl = `${origin}${getRepriseOpportunityPath(opportunity)}`;

  return [
    {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "@id": `${opportunityUrl}#page`,
      name: `${opportunity.activity} à reprendre`,
      description: getRepriseOpportunityDescription(opportunity),
      url: opportunityUrl,
      datePublished: opportunity.publishedAt,
      inLanguage: "fr-FR",
      isPartOf: { "@id": `${origin}/#website` },
      about: {
        "@type": "Thing",
        name: opportunity.activity,
        description: [
          opportunity.category,
          opportunity.location,
          opportunity.revenue,
          opportunity.ebe,
          opportunity.employees,
          opportunity.askingPrice,
          ...opportunity.highlights,
        ].filter(Boolean).join(" · "),
      },
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
          name: "À reprendre",
          item: marketplaceUrl,
        },
        {
          "@type": "ListItem",
          position: 3,
          name: opportunity.activity,
          item: opportunityUrl,
        },
      ],
    },
  ];
}

export function serializeRepriseJsonLd(value: unknown) {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}
