import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import AssistantsCatalogClient from "@/components/AssistantsCatalogClient";

export const metadata: Metadata = {
  title: "Structurez pour mieux piloter - Demaa",
  description:
    "Auditez votre organisation puis structurez vos process, outils et automatisations avec Demaa.",
  alternates: {
    canonical: "/structurer",
  },
  openGraph: {
    title: "Structurez pour mieux piloter - Demaa",
    description:
      "Auditez votre organisation puis structurez vos process, outils et automatisations avec Demaa.",
    url: "/structurer",
    siteName: "Demaa",
    locale: "fr_FR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Structurez pour mieux piloter - Demaa",
    description:
      "Auditez votre organisation puis structurez vos process, outils et automatisations avec Demaa.",
  },
};

export default function StructurerPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-dema-cream text-brand-blue">
        <AssistantsCatalogClient />
      </main>
    </>
  );
}
