import type { Metadata } from "next";

export const PUBLIC_SOCIAL_IMAGE = {
  url: "/opengraph-image",
  width: 1200,
  height: 630,
  alt: "Demaa - Organiser son entreprise",
} as const;

export type PublicPageMetadataInput = {
  title: string;
  description: string;
  path: string;
  type?: "article" | "website";
  keywords?: Metadata["keywords"];
  robots?: Metadata["robots"];
};

export function buildPublicPageMetadata({
  title,
  description,
  path,
  type = "website",
  keywords,
  robots,
}: PublicPageMetadataInput): Metadata {
  return {
    title,
    description,
    ...(keywords ? { keywords } : {}),
    ...(robots ? { robots } : {}),
    alternates: { canonical: path },
    openGraph: {
      title,
      description,
      url: path,
      siteName: "Demaa",
      locale: "fr_FR",
      type,
      images: [PUBLIC_SOCIAL_IMAGE],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/twitter-image"],
    },
  };
}
