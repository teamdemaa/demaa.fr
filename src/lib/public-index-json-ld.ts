import { getCanonicalOrigin } from "@/lib/site-url";

export type PublicIndexItem = {
  name: string;
  path: string;
};

export function buildSiteIdentityJsonLd() {
  const origin = getCanonicalOrigin();

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${origin}/#organization`,
        name: "Demaa",
        url: origin,
        logo: `${origin}/icon.svg`,
      },
      {
        "@type": "WebSite",
        "@id": `${origin}/#website`,
        name: "Demaa",
        url: origin,
        inLanguage: "fr-FR",
        publisher: { "@id": `${origin}/#organization` },
      },
    ],
  };
}

export function buildPublicIndexJsonLd(input: {
  name: string;
  description: string;
  path: string;
  items: PublicIndexItem[];
}) {
  const origin = getCanonicalOrigin();
  const url = `${origin}${input.path}`;

  return [
    {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      "@id": `${url}#collection`,
      name: input.name,
      description: input.description,
      url,
      isPartOf: { "@id": `${origin}/#website` },
      mainEntity: { "@id": `${url}#items` },
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Accueil",
          item: `${origin}/solutions`,
        },
        {
          "@type": "ListItem",
          position: 2,
          name: input.name,
          item: url,
        },
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "ItemList",
      "@id": `${url}#items`,
      numberOfItems: input.items.length,
      itemListElement: input.items.map((item, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: item.name,
        url: `${origin}${item.path}`,
      })),
    },
  ];
}

export function serializePublicJsonLd(value: unknown) {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}
