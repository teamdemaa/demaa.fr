import type { Metadata } from "next";
import SystemsHubPage from "@/components/SystemsHubPage";

export const metadata: Metadata = {
  title: "La Boîte à Outils du dirigeant | Systèmes d'organisation - Demaa",
  description:
    "Découvrez les bons systèmes pour structurer votre entreprise, mieux déléguer et construire une activité plus stable et plus autonome.",
  alternates: {
    canonical: "/systemes",
  },
  openGraph: {
    title: "La Boîte à Outils du dirigeant | Systèmes d'organisation - Demaa",
    description:
      "Découvrez les bons systèmes pour structurer votre entreprise, mieux déléguer et construire une activité plus stable et plus autonome.",
    url: "/systemes",
    siteName: "Demaa",
    locale: "fr_FR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "La Boîte à Outils du dirigeant | Systèmes d'organisation - Demaa",
    description:
      "Découvrez les bons systèmes pour structurer votre entreprise, mieux déléguer et construire une activité plus stable et plus autonome.",
  },
};

export default async function SystemesPage() {
  return <SystemsHubPage />;
}
