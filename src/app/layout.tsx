import type { Metadata } from "next";
import localFont from "next/font/local";
import Script from "next/script";
import "./globals.css";
import Footer from "@/components/Footer";

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
      path: "./fonts/gambetta-light.woff2",
      weight: "300",
      style: "normal",
    },
    {
      path: "./fonts/gambetta-regular.woff2",
      weight: "400",
      style: "normal",
    },
  ],
  variable: "--font-gambetta",
  display: "swap",
  fallback: ["Georgia", "serif"],
  adjustFontFallback: "Times New Roman",
});

export const metadata: Metadata = {
  title: "Demaa - Annuaire d'outils et de services",
  description: "Demaa est un annuaire SEO-friendly ultra-minimaliste pour trouver les meilleurs outils et services.",
  metadataBase: new URL('https://demaa.fr'),
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
        <Analytics />
      </body>
    </html>
  );
}
