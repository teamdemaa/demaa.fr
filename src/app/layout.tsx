import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import CookieConsentManager from "@/components/CookieConsentManager";
import Footer from "@/components/Footer";
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
  title: "Demaa | Structurez votre entreprise",
  description:
    "Demaa clarifie les responsabilités, formalise les processus et configure un espace de pilotage pour que votre entreprise dépende moins de vous.",
  metadataBase: new URL(getCanonicalOrigin()),
  openGraph: {
    title: "Demaa | Structurez votre entreprise",
    description:
      "Demaa clarifie les responsabilités, formalise les processus et configure un espace de pilotage pour que votre entreprise dépende moins de vous.",
    siteName: "Demaa",
    locale: "fr_FR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Demaa | Structurez votre entreprise",
    description:
      "Demaa clarifie les responsabilités, formalise les processus et configure un espace de pilotage pour que votre entreprise dépende moins de vous.",
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
  themeColor: "#ffffff",
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
        <Footer />
        <CookieConsentManager />
      </body>
    </html>
  );
}
