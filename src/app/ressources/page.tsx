import Navbar from "@/components/Navbar";
import { Metadata } from "next";
import { getAllEditorialEntries } from "@/lib/editorial-content";
import ResourcesIndexClient from "@/components/ResourcesIndexClient";

export const metadata: Metadata = {
  title: "Ressources pour structurer son entreprise - Demaa",
  description: "Retrouvez les articles, ressources et templates utiles pour structurer, piloter et développer votre activité.",
  alternates: {
    canonical: "/ressources",
  },
  openGraph: {
    title: "Ressources pour structurer son entreprise - Demaa",
    description: "Retrouvez les articles, ressources et templates utiles pour structurer, piloter et développer votre activité.",
    url: "/ressources",
    siteName: "Demaa",
    locale: "fr_FR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Ressources pour structurer son entreprise - Demaa",
    description: "Retrouvez les articles, ressources et templates utiles pour structurer, piloter et développer votre activité.",
  },
};

export default function ResourcesIndexPage() {
  const entries = getAllEditorialEntries();

  return (
    <>
      <Navbar />
      <main className="flex-1 w-full bg-background min-h-[85vh]">
        <ResourcesIndexClient entries={entries} />
      </main>
    </>
  );
}
