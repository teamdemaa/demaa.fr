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
  socialImage?: Readonly<{
    alt: string;
    height?: number;
    url: string;
    width?: number;
  }>;
};

export function buildPublicPageMetadata({
  title,
  description,
  path,
  type = "website",
  keywords,
  robots,
  socialImage,
}: PublicPageMetadataInput): Metadata {
  const resolvedSocialImage = socialImage ?? PUBLIC_SOCIAL_IMAGE;

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
      images: [resolvedSocialImage],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [socialImage?.url ?? "/twitter-image"],
    },
  };
}
