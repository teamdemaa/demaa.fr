import type { PublishedAcademyVideoEntry } from "@/lib/academy-video-catalog";
import { getCanonicalOrigin } from "@/lib/site-url";

export function buildAcademyPageJsonLd(video: PublishedAcademyVideoEntry) {
  const origin = getCanonicalOrigin();
  const pageUrl = `${origin}/academie/${video.slug}`;

  return [
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Accueil", item: origin },
        {
          "@type": "ListItem",
          position: 2,
          name: "Académie",
          item: `${origin}/academie`,
        },
        {
          "@type": "ListItem",
          position: 3,
          name: video.cardTitle,
          item: pageUrl,
        },
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: video.h1,
      description: video.seoDescription,
      datePublished: video.editorialPublishedAt,
      dateModified: video.updatedAt,
      inLanguage: "fr-FR",
      mainEntityOfPage: pageUrl,
      author: { "@type": "Organization", name: "Demaa", url: origin },
      publisher: { "@type": "Organization", name: "Demaa", url: origin },
    },
    {
      "@context": "https://schema.org",
      "@type": "VideoObject",
      name: video.publication.youtubeTitle,
      description: video.seoDescription,
      thumbnailUrl: [video.publication.thumbnailUrl],
      uploadDate: video.publication.uploadDate,
      duration: video.publication.durationIso,
      embedUrl: video.publication.embedUrl,
      url: pageUrl,
    },
  ];
}

export function serializeJsonLd(value: unknown) {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}
