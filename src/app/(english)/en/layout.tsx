import type { Metadata, Viewport } from "next";
import "../../globals.css";
import { rootFontClassName } from "@/app/root-fonts";
import CookieConsentManager from "@/components/CookieConsentManager";
import {
  ENGLISH_BETA_DESCRIPTION,
  ENGLISH_BETA_SOCIAL_IMAGE_ALT,
  ENGLISH_BETA_TITLE,
} from "@/lib/english-beta-metadata";
import { getCanonicalOrigin } from "@/lib/site-url";

export const metadata: Metadata = {
  applicationName: "Demaa",
  description: ENGLISH_BETA_DESCRIPTION,
  metadataBase: new URL(getCanonicalOrigin()),
  manifest: "/en/manifest.webmanifest",
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
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Demaa",
  },
  formatDetection: {
    telephone: false,
  },
  verification: {
    other: {
      "facebook-domain-verification": "q8v7yql2wdk1p643wdls8vnr4e8b4h",
    },
  },
};

export const viewport: Viewport = {
  themeColor: "#315f46",
  viewportFit: "cover",
};

export default function EnglishLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      suppressHydrationWarning
      lang="en"
      className={rootFontClassName}
    >
      <body
        suppressHydrationWarning
        className="min-h-full flex flex-col bg-background text-foreground font-sans"
      >
        {children}
        <CookieConsentManager />
      </body>
    </html>
  );
}
