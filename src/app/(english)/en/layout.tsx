import type { Metadata } from "next";
import Script from "next/script";
import DocumentLocale from "@/components/DocumentLocale";
import {
  ENGLISH_BETA_DESCRIPTION,
  ENGLISH_BETA_SOCIAL_IMAGE_ALT,
  ENGLISH_BETA_TITLE,
} from "@/lib/english-beta-metadata";

export const metadata: Metadata = {
  description: ENGLISH_BETA_DESCRIPTION,
  openGraph: {
    description: ENGLISH_BETA_DESCRIPTION,
    images: [
      {
        alt: ENGLISH_BETA_SOCIAL_IMAGE_ALT,
        url: "/opengraph-image",
      },
    ],
    locale: "en",
    siteName: "Demaa",
    title: ENGLISH_BETA_TITLE,
    type: "website",
  },
  robots: { follow: false, index: false },
  twitter: {
    card: "summary_large_image",
    description: ENGLISH_BETA_DESCRIPTION,
    images: [
      {
        alt: ENGLISH_BETA_SOCIAL_IMAGE_ALT,
        url: "/twitter-image",
      },
    ],
    title: ENGLISH_BETA_TITLE,
  },
};

export default function EnglishLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <Script id="demaa-english-document-locale" strategy="beforeInteractive">
        {`document.documentElement.lang="en";`}
      </Script>
      <DocumentLocale localeCode="en" />
      {children}
    </>
  );
}
