import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import ContentDirectoryClient from "@/components/ContentDirectoryClient";
import { getAllPublishedContent } from "@/lib/content-catalog";

export const metadata: Metadata = {
  title: "Contenus | Demaa",
  description: "Des contenus pratiques pour comprendre les sujets qui structurent et font avancer une entreprise.",
  alternates: { canonical: "/contenus" },
  openGraph: {
    title: "Contenus | Demaa",
    description: "Des contenus pratiques pour comprendre les sujets qui structurent et font avancer une entreprise.",
    url: "/contenus",
    siteName: "Demaa",
    locale: "fr_FR",
    type: "website",
  },
};

export default function ContentDirectoryPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-[85vh] w-full flex-1 bg-background">
        <ContentDirectoryClient entries={getAllPublishedContent()} />
      </main>
    </>
  );
}
