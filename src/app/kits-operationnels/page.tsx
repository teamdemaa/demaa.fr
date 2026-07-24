import type { Metadata } from "next";
import SystemsHubPage from "@/components/SystemsHubPage";

const title = "Kits opérationnels pour dirigeants | Demaa";
const description =
  "Découvrez des kits opérationnels avec des process concrets pour structurer votre entreprise, mieux déléguer et gagner en autonomie.";

export const metadata: Metadata = {
  title,
  description,
  alternates: {
    canonical: "/kits-operationnels",
  },
  openGraph: {
    title,
    description,
    url: "/kits-operationnels",
    siteName: "Demaa",
    locale: "fr_FR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
  },
};

export default async function OperationalKitsPage() {
  return <SystemsHubPage />;
}
