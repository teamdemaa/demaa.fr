import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import AssistantsCatalogClient from "@/components/AssistantsCatalogClient";

export const metadata: Metadata = {
  title: "Structuration & automatisation d'entreprise - Demaa",
  description:
    "Auditez votre organisation puis structurez vos process, outils et automatisations avec Demaa.",
  alternates: {
    canonical: "/deleguer",
  },
  openGraph: {
    title: "Structuration & automatisation d'entreprise - Demaa",
    description:
      "Auditez votre organisation puis structurez vos process, outils et automatisations avec Demaa.",
    url: "/deleguer",
    siteName: "Demaa",
    locale: "fr_FR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Structuration & automatisation d'entreprise - Demaa",
    description:
      "Auditez votre organisation puis structurez vos process, outils et automatisations avec Demaa.",
  },
};

export default function DeleguerPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-dema-cream text-brand-blue">
        <AssistantsCatalogClient />
      </main>
    </>
  );
}
