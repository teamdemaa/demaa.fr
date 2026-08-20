import type { Metadata, Viewport } from "next";
import "../globals.css";
import CookieConsentManager from "@/components/CookieConsentManager";
import { rootFontClassName } from "@/app/root-fonts";
import { getCanonicalOrigin } from "@/lib/site-url";

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
      className={rootFontClassName}
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
