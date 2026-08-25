import type { Metadata } from "next";
import SystemsHubPage from "@/components/SystemsHubPage";

const title = "Solutions adaptées à votre activité | Demaa";
const description =
  "Choisissez votre activité pour découvrir les outils, fournisseurs, financements, aides et réseaux professionnels adaptés à votre entreprise.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/solutions" },
  openGraph: {
    title,
    description,
    url: "/solutions",
    siteName: "Demaa",
    locale: "fr_FR",
    type: "website",
  },
  twitter: { card: "summary_large_image", title, description },
};

export default async function SolutionsPage() {
  return <SystemsHubPage />;
}
