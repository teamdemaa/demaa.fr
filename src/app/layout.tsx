import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import Footer from "@/components/Footer";

import { Analytics } from "@vercel/analytics/next";

export const metadata: Metadata = {
  title: "Demaa - Annuaire d'outils et de services",
  description: "Demaa est un annuaire SEO-friendly ultra-minimaliste pour trouver les meilleurs outils et services.",
  metadataBase: new URL('https://demaa.fr'),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-background text-foreground font-sans pb-24 md:pb-0">
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
          <img
            height="1"
            width="1"
            style={{ display: "none" }}
            src="https://www.facebook.com/tr?id=3030409753790915&ev=PageView&noscript=1"
            alt=""
          />
        </noscript>
        {children}
        <Footer />
        <Analytics />
      </body>
    </html>
  );
}
