import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import Script from "next/script";
import "./globals.css";
import Footer from "@/components/Footer";
import ServiceWorkerRegister from "@/components/ServiceWorkerRegister";

import { Analytics } from "@vercel/analytics/next";

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
  title: "Demaa - Systèmes, outils et accompagnement pour dirigeants",
  description:
    "Demaa aide les dirigeants de TPE à structurer leur activité avec des systèmes métier, des outils du quotidien, des ressources pratiques et des accompagnements ciblés.",
  metadataBase: new URL('https://demaa.fr'),
  openGraph: {
    title: "Demaa - Systèmes, outils et accompagnement pour dirigeants",
    description:
      "Demaa aide les dirigeants de TPE à structurer leur activité avec des systèmes métier, des outils du quotidien, des ressources pratiques et des accompagnements ciblés.",
    siteName: "Demaa",
    locale: "fr_FR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Demaa - Systèmes, outils et accompagnement pour dirigeants",
    description:
      "Demaa aide les dirigeants de TPE à structurer leur activité avec des systèmes métier, des outils du quotidien, des ressources pratiques et des accompagnements ciblés.",
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
        className="min-h-full flex flex-col bg-background text-foreground font-sans pb-24 md:pb-0"
      >
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-V1V4EX55K6"
          strategy="afterInteractive"
        />
        <Script id="google-analytics-base" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-V1V4EX55K6');
          `}
        </Script>
        <Script id="meta-pixel-base" strategy="afterInteractive">
          {`
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '3030409753790915');
            fbq('track', 'PageView');
          `}
        </Script>
        <noscript>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            height="1"
            width="1"
            style={{ display: "none" }}
            src="https://www.facebook.com/tr?id=3030409753790915&ev=PageView&noscript=1"
            alt=""
          />
        </noscript>
        {children}
        {modal}
        <Footer />
        <ServiceWorkerRegister />
        <Analytics />
      </body>
    </html>
  );
}
