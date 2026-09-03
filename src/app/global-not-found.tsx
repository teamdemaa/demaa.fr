import type { Metadata } from "next";
import localFont from "next/font/local";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import "./globals.css";

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
  title: "Page introuvable | Demaa",
  description: "La page demandée n’existe pas ou a été déplacée.",
};

export default function GlobalNotFound() {
  return (
    <html
      lang="fr"
      className={`${satoshi.variable} ${gambetta.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-background font-sans text-foreground">
        <Navbar minimal />
        <main className="flex min-h-screen items-center bg-dema-cream px-4 py-16 text-brand-blue md:px-8">
          <section className="mx-auto w-full max-w-3xl rounded-[1.15rem] border border-dema-line/70 bg-dema-paper p-6 text-center shadow-[0_6px_18px_rgba(23,35,29,0.024)] md:p-8">
            <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-dema-forest">
              Page introuvable
            </p>
            <h1 className="mt-4 text-[2.4rem] font-light leading-[1.02] tracking-tight text-brand-blue/44 md:text-[3rem]">
              <span className="demaa-hero-title text-brand-blue/86">Cette page</span>
              <br />
              n&apos;existe pas
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-dema-muted">
              Le lien est peut-être incomplet, ancien, ou la page a été déplacée.
            </p>
            <Link href="/" className="demaa-primary-button mt-6">
              Retour à l&apos;accueil
            </Link>
          </section>
        </main>
      </body>
    </html>
  );
}
