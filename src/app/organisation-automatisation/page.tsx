import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import AssistantsCatalogClient from "@/components/AssistantsCatalogClient";

export const metadata: Metadata = {
  title: "Organisation et automatisation pour TPE - Demaa",
  description:
    "Organisez votre entreprise avec les bons systemes, process et automatisations pour mieux piloter l'activite, deleguer plus sereinement et soutenir une croissance durable.",
  alternates: {
    canonical: "/organisation-automatisation",
  },
  openGraph: {
    title: "Organisation et automatisation pour TPE - Demaa",
    description:
      "Organisez votre entreprise avec les bons systemes, process et automatisations pour mieux piloter l'activite, deleguer plus sereinement et soutenir une croissance durable.",
    url: "/organisation-automatisation",
    siteName: "Demaa",
    locale: "fr_FR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Organisation et automatisation : systemes, process et automatisations - Demaa",
    description:
      "Organisez votre entreprise avec les bons systemes, process et automatisations pour mieux piloter l'activite, deleguer plus sereinement et soutenir une croissance durable.",
  },
};

export default function OrganisationAutomatisationPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-dema-cream text-brand-blue">
        <AssistantsCatalogClient />
      </main>
    </>
  );
}
