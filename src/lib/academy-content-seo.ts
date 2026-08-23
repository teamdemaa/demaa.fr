import "server-only";

import type { Metadata } from "next";
import type { AcademyContentDefinition } from "@/lib/academy-course-content";
import { getCanonicalOrigin } from "@/lib/site-url";

function getAcademyContentUrl(content: AcademyContentDefinition) {
  return `${getCanonicalOrigin()}/academie/${content.identity.slug}`;
}

function getAcademyContentImageUrl(content: AcademyContentDefinition) {
  const image = content.identity.card.image;
  return image ? `${getCanonicalOrigin()}${image}` : null;
}

export function buildAcademyContentMetadata(
  content: AcademyContentDefinition,
): Metadata {
  const title = `${content.identity.shortTitle} | Structurer avec Demaa`;
  const description = content.identity.promise;
  const canonicalUrl = getAcademyContentUrl(content);
  const imageUrl = getAcademyContentImageUrl(content);

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: "Demaa",
      locale: "fr_FR",
      type: "article",
      images: imageUrl
        ? [{ url: imageUrl, alt: content.identity.card.imageAlt }]
        : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: imageUrl ? [imageUrl] : undefined,
    },
  };
}

export function buildAcademyContentJsonLd(
  content: AcademyContentDefinition,
) {
  const origin = getCanonicalOrigin();
  const pageUrl = getAcademyContentUrl(content);
  const imageUrl = getAcademyContentImageUrl(content);
  const breadcrumb = {
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
        name: "Structurer",
        item: `${origin}/academie`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: content.identity.shortTitle,
        item: pageUrl,
      },
    ],
  };

  if (content.kind === "course") {
    return [
      breadcrumb,
      {
        "@context": "https://schema.org",
        "@type": ["Course", "LearningResource"],
        "@id": `${pageUrl}#course`,
        url: pageUrl,
        name: content.identity.shortTitle,
        description: content.identity.promise,
        inLanguage: "fr-FR",
        timeRequired: `PT${content.identity.durationMinutes}M`,
        educationalUse: "Autoformation",
        audience: {
          "@type": "Audience",
          audienceType: content.identity.audience,
        },
        about: content.identity.category,
        provider: {
          "@type": "Organization",
          name: "Demaa",
          url: origin,
        },
        ...(imageUrl ? { image: imageUrl } : {}),
      },
    ];
  }

  return [
    breadcrumb,
    {
      "@context": "https://schema.org",
      "@type": "Article",
      "@id": `${pageUrl}#article`,
      url: pageUrl,
      mainEntityOfPage: pageUrl,
      headline: content.identity.title,
      name: content.identity.shortTitle,
      description: content.identity.promise,
      inLanguage: "fr-FR",
      articleSection: content.identity.category,
      author: {
        "@type": "Organization",
        name: "Demaa",
        url: origin,
      },
      publisher: {
        "@type": "Organization",
        name: "Demaa",
        url: origin,
      },
      ...(imageUrl ? { image: imageUrl } : {}),
    },
  ];
}

export function serializeAcademyContentJsonLd(value: unknown) {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}
