import type { Metadata } from "next";
import SystemsHubPage from "@/components/SystemsHubPage";

export const metadata: Metadata = {
  title: "Kits opérationnels pour dirigeants | Demaa",
  description:
    "Découvrez les bons systèmes pour structurer votre entreprise, mieux déléguer et construire une activité plus stable et plus autonome.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Kits opérationnels pour dirigeants | Demaa",
    description:
      "Découvrez les bons systèmes pour structurer votre entreprise, mieux déléguer et construire une activité plus stable et plus autonome.",
    url: "/",
    siteName: "Demaa",
    locale: "fr_FR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Kits opérationnels pour dirigeants | Demaa",
    description:
      "Découvrez les bons systèmes pour structurer votre entreprise, mieux déléguer et construire une activité plus stable et plus autonome.",
  },
};

export default async function HomePage() {
  return <SystemsHubPage />;
}
