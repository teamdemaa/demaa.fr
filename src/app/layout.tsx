import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import CookieConsentManager from "@/components/CookieConsentManager";
import Footer from "@/components/Footer";
import ServiceWorkerRegister from "@/components/ServiceWorkerRegister";

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
  title: "Demaa - Déléguer, structurer, s'équiper",
  description:
    "Demaa aide les dirigeants de TPE à déléguer les tâches opérationnelles, structurer leur activité et s'équiper avec les bons outils.",
  metadataBase: new URL('https://demaa.fr'),
  openGraph: {
    title: "Demaa - Déléguer, structurer, s'équiper",
    description:
      "Demaa aide les dirigeants de TPE à déléguer les tâches opérationnelles, structurer leur activité et s'équiper avec les bons outils.",
    siteName: "Demaa",
    locale: "fr_FR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Demaa - Déléguer, structurer, s'équiper",
    description:
      "Demaa aide les dirigeants de TPE à déléguer les tâches opérationnelles, structurer leur activité et s'équiper avec les bons outils.",
  },
  applicationName: "Demaa",
  appleWebApp: {
    capable: true,
    title: "Demaa",
    statusBarStyle: "default",
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  themeColor: "#ffffff",
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
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
