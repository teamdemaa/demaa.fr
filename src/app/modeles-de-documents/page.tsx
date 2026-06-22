import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import ResourcesIndexClient from "@/components/ResourcesIndexClient";
import { getAllDocumentModels } from "@/lib/document-models";

export const metadata: Metadata = {
  title: "Modèles de documents pour structurer son entreprise - Demaa",
  description:
    "Retrouvez les modèles de documents Demaa pour piloter, organiser et structurer votre activité avec une base concrète.",
  alternates: {
    canonical: "/modeles-de-documents",
  },
  openGraph: {
    title: "Modèles de documents pour structurer son entreprise - Demaa",
    description:
      "Retrouvez les modèles de documents Demaa pour piloter, organiser et structurer votre activité avec une base concrète.",
    url: "/modeles-de-documents",
    siteName: "Demaa",
    locale: "fr_FR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Modèles de documents pour structurer son entreprise - Demaa",
    description:
      "Retrouvez les modèles de documents Demaa pour piloter, organiser et structurer votre activité avec une base concrète.",
  },
};

export default function DocumentModelsIndexPage() {
  const entries = getAllDocumentModels();

  return (
    <>
      <Navbar />
      <main className="min-h-[85vh] w-full flex-1 bg-background">
        <ResourcesIndexClient entries={entries} />
      </main>
    </>
  );
}
