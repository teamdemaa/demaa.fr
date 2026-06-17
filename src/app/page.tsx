import type { Metadata } from "next";
import HomeHubPage from "@/components/HomeHubPage";

export const metadata: Metadata = {
  title: "Structurez votre entreprise avec les bons systèmes | Organisation TPE - Demaa",
  description:
    "Organisez votre entreprise avec les bons processus et outils pour reprendre le contrôle, mieux déléguer et soutenir une croissance durable.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Structurez votre entreprise avec les bons systèmes | Organisation TPE - Demaa",
    description:
      "Organisez votre entreprise avec les bons processus et outils pour reprendre le contrôle, mieux déléguer et soutenir une croissance durable.",
    url: "/",
    siteName: "Demaa",
    locale: "fr_FR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Structurez votre entreprise avec les bons systèmes | Organisation TPE - Demaa",
    description:
      "Organisez votre entreprise avec les bons processus et outils pour reprendre le contrôle, mieux déléguer et soutenir une croissance durable.",
  },
};

export const dynamic = "force-dynamic";

export default async function HomePage() {
  return <HomeHubPage />;
}
