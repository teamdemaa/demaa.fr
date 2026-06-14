import type { Metadata } from "next";
import HomeHubPage from "@/components/HomeHubPage";

export const metadata: Metadata = {
  title: "Analysez votre organisation - Demaa",
  description:
    "Analysez votre activité, repérez les systèmes essentiels et identifiez les priorités pour mieux piloter votre entreprise.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Analysez votre organisation - Demaa",
    description:
      "Analysez votre activité, repérez les systèmes essentiels et identifiez les priorités pour mieux piloter votre entreprise.",
    url: "/",
    siteName: "Demaa",
    locale: "fr_FR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Analysez votre organisation - Demaa",
    description:
      "Analysez votre activité, repérez les systèmes essentiels et identifiez les priorités pour mieux piloter votre entreprise.",
  },
};

export const dynamic = "force-dynamic";

export default async function HomePage() {
  return <HomeHubPage />;
}
