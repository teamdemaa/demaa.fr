import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import AssistantsCatalogClient from "@/components/AssistantsCatalogClient";

export const metadata: Metadata = {
  title: "Assistants pour TPE - Demaa",
  description:
    "Choisissez l'assistant Demaa adapté à vos besoins : facturation, marketing, prospection, subventions, appels d'offres ou automatisation.",
  alternates: {
    canonical: "/assistants",
  },
  openGraph: {
    title: "Assistants pour TPE - Demaa",
    description:
      "Choisissez l'assistant Demaa adapté à vos besoins : facturation, marketing, prospection, subventions, appels d'offres ou automatisation.",
    url: "/assistants",
    siteName: "Demaa",
    locale: "fr_FR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Assistants pour TPE - Demaa",
    description:
      "Choisissez l'assistant Demaa adapté à vos besoins : facturation, marketing, prospection, subventions, appels d'offres ou automatisation.",
  },
};

export default function AssistantsPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-dema-cream text-brand-blue">
        <AssistantsCatalogClient />
      </main>
    </>
  );
}
