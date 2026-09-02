import type { Metadata } from "next";
import type { ContentCatalogEntry } from "@/lib/content-catalog";
import { PUBLIC_SOCIAL_IMAGE } from "@/lib/public-page-metadata";
import { getCanonicalOrigin } from "@/lib/site-url";
import { getOrganiserThumbnailPath } from "@/lib/organiser-thumbnail-catalog";

export function buildContentMetadata(entry: ContentCatalogEntry): Metadata {
  const canonicalUrl = `${getCanonicalOrigin()}/contenus/${entry.slug}`;
  const image = getOrganiserThumbnailPath(entry.slug)
    ?? entry.media.youtubeThumbnail
    ?? entry.media.slides?.[0];

  return {
    title: `${entry.shortTitle} | Demaa`,
    description: entry.summary,
    alternates: { canonical: canonicalUrl },
    openGraph: {
      title: entry.title,
      description: entry.summary,
      url: canonicalUrl,
      siteName: "Demaa",
      locale: "fr_FR",
      type: "article",
      publishedTime: entry.publishedAt,
      modifiedTime: entry.updatedAt,
      images: image
        ? [{ url: image, alt: entry.shortTitle }]
        : [PUBLIC_SOCIAL_IMAGE],
    },
    twitter: {
      card: "summary_large_image",
      title: entry.title,
      description: entry.summary,
      images: [image ?? "/twitter-image"],
    },
  };
}

export function buildContentJsonLd(entry: ContentCatalogEntry) {
  const origin = getCanonicalOrigin();
  const canonicalUrl = `${origin}/contenus/${entry.slug}`;
  const image = getOrganiserThumbnailPath(entry.slug)
    ?? entry.media.youtubeThumbnail
    ?? entry.media.slides?.[0];
  const imageUrl = image
    ? (image.startsWith("http://") || image.startsWith("https://") ? image : `${origin}${image}`)
    : undefined;

  return [
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Accueil", item: origin },
        { "@type": "ListItem", position: 2, name: "Contenus", item: `${origin}/contenus` },
        { "@type": "ListItem", position: 3, name: entry.shortTitle, item: canonicalUrl },
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "Article",
      "@id": `${canonicalUrl}#article`,
      mainEntityOfPage: canonicalUrl,
      url: canonicalUrl,
      headline: entry.title,
      description: entry.summary,
      articleSection: entry.category,
      datePublished: entry.publishedAt,
      dateModified: entry.updatedAt,
      ...(imageUrl ? { image: imageUrl } : {}),
      author: { "@type": "Organization", name: "Demaa", url: origin },
      publisher: { "@type": "Organization", name: "Demaa", url: origin },
    },
  ];
}

export function serializeContentJsonLd(value: unknown) {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}
