import { Metadata } from "next";
import { permanentRedirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Modèles de documents pour structurer son entreprise - Demaa",
  description:
    "Cette page redirige vers les modèles de documents Demaa pour piloter, organiser et structurer votre activité.",
  alternates: {
    canonical: "/modeles-de-documents",
  },
  robots: {
    index: false,
    follow: true,
  },
  openGraph: {
    title: "Modèles de documents pour structurer son entreprise - Demaa",
    description:
      "Cette page redirige vers les modèles de documents Demaa pour piloter, organiser et structurer votre activité.",
    url: "/modeles-de-documents",
    siteName: "Demaa",
    locale: "fr_FR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Modèles de documents pour structurer son entreprise - Demaa",
    description:
      "Cette page redirige vers les modèles de documents Demaa pour piloter, organiser et structurer votre activité.",
  },
};

export default function ResourcesIndexPage() {
  permanentRedirect("/modeles-de-documents");

  return null;
}
