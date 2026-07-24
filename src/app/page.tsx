import type { Metadata } from "next";
import StructurationLandingPage from "@/components/StructurationLandingPage";

const title = "Structurez votre entreprise pour qu’elle fonctionne sans vous | Demaa";
const description =
  "Demaa installe en deux mois les process, les outils et le pilotage adaptés à votre activité pour rendre l’entreprise moins dépendante de vous.";

export const metadata: Metadata = {
  title,
  description,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title,
    description,
    url: "/",
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

export default function HomePage() {
  return <StructurationLandingPage />;
}
