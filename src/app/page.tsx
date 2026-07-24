import type { Metadata } from "next";
import StructurationLandingPage from "@/components/StructurationLandingPage";

const title =
  "Structurez votre entreprise pour qu’elle dépende moins de vous | Demaa";
const description =
  "En deux mois, Demaa clarifie les responsabilités, formalise les processus et configure un espace de pilotage adapté à votre activité.";

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
