import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import CookieConsentManager from "@/components/CookieConsentManager";
import { DEMAA_HOME_DESCRIPTION, DEMAA_HOME_TITLE } from "@/lib/demaa-positioning";
import { getCanonicalOrigin } from "@/lib/site-url";

const satoshi = localFont({
  src: [
    {
      path: "./fonts/satoshi-light.woff2",
      weight: "300",
      style: "normal",
    },
    {
      path: "./fonts/satoshi-regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "./fonts/satoshi-medium.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "./fonts/satoshi-bold.woff2",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-satoshi",
  display: "swap",
  fallback: ["Avenir Next", "Avenir", "Segoe UI", "Arial", "sans-serif"],
});

const gambetta = localFont({
  src: [
    {
      path: "./fonts/gambetta-light-italic.woff2",
      weight: "300",
      style: "italic",
    },
    {
      path: "./fonts/gambetta-regular-italic.woff2",
      weight: "400",
      style: "italic",
    },
  ],
  variable: "--font-gambetta",
  display: "swap",
  fallback: ["Georgia", "serif"],
  adjustFontFallback: "Times New Roman",
});

export const metadata: Metadata = {
  title: DEMAA_HOME_TITLE,
  description: DEMAA_HOME_DESCRIPTION,
  metadataBase: new URL(getCanonicalOrigin()),
  openGraph: {
    title: DEMAA_HOME_TITLE,
    description: DEMAA_HOME_DESCRIPTION,
    siteName: "Demaa",
    locale: "fr_FR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: DEMAA_HOME_TITLE,
    description: DEMAA_HOME_DESCRIPTION,
  },
  applicationName: "Demaa",
  manifest: "/manifest.webmanifest",
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

export default function RootLayout({
  children,
  modal,
}: Readonly<{
  children: React.ReactNode;
  modal: React.ReactNode;
}>) {
  return (
    <html
      suppressHydrationWarning
      lang="fr"
      className={`${satoshi.variable} ${gambetta.variable} h-full antialiased`}
    >
      <body
        suppressHydrationWarning
        className="min-h-full flex flex-col bg-background text-foreground font-sans"
      >
        {children}
        {modal}
        <CookieConsentManager />
      </body>
    </html>
  );
}
