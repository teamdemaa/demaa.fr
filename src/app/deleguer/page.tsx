import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import AssistantsCatalogClient from "@/components/AssistantsCatalogClient";

export const metadata: Metadata = {
  title: "Déléguer des tâches opérationnelles - Demaa",
  description:
    "Choisissez le pack Demaa adapté à vos besoins : accompagnement structuration, assistant polyvalent ou appels d'offres.",
  alternates: {
    canonical: "/deleguer",
  },
  openGraph: {
    title: "Déléguer des tâches opérationnelles - Demaa",
    description:
      "Choisissez le pack Demaa adapté à vos besoins : accompagnement structuration, assistant polyvalent ou appels d'offres.",
    url: "/deleguer",
    siteName: "Demaa",
    locale: "fr_FR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Déléguer des tâches opérationnelles - Demaa",
    description:
      "Choisissez le pack Demaa adapté à vos besoins : accompagnement structuration, assistant polyvalent ou appels d'offres.",
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
