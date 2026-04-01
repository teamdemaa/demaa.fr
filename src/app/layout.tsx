import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import Footer from "@/components/Footer";

import { Analytics } from "@vercel/analytics/react";

const poppins = Poppins({
  variable: "--font-poppins",
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Demaa - Annuaire d'outils et de services",
  description: "Demaa est un annuaire SEO-friendly ultra-minimaliste pour trouver les meilleurs outils et services.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className={`${poppins.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-background text-foreground font-sans pb-24 md:pb-0">
        {children}
        <Footer />
        <Analytics />
      </body>
    </html>
  );
}
