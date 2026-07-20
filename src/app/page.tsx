import type { Metadata } from "next";
import SystemsHubPage from "@/components/SystemsHubPage";

export const metadata: Metadata = {
  title: "Kits opérationnels pour dirigeants | Demaa",
  description:
    "Découvrez des kits opérationnels avec des process concrets pour structurer votre entreprise, mieux déléguer et gagner en autonomie.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Kits opérationnels pour dirigeants | Demaa",
    description:
      "Découvrez des kits opérationnels avec des process concrets pour structurer votre entreprise, mieux déléguer et gagner en autonomie.",
    url: "/",
    siteName: "Demaa",
    locale: "fr_FR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Kits opérationnels pour dirigeants | Demaa",
    description:
      "Découvrez des kits opérationnels avec des process concrets pour structurer votre entreprise, mieux déléguer et gagner en autonomie.",
  },
};

export default async function HomePage() {
  return <SystemsHubPage />;
}
