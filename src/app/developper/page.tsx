import type { Metadata } from "next";
import DevelopperOpportunitiesClient from "@/components/DevelopperOpportunitiesClient";
import Navbar from "@/components/Navbar";
import { actifyOpportunities } from "@/lib/actify-opportunities";

export const metadata: Metadata = {
  title: "Opportunités à reprendre - Demaa",
  description:
    "Consultez des entreprises à reprendre en France : secteur, localisation, chiffre d'affaires, effectif, date limite et dossier source.",
  alternates: {
    canonical: "/developper",
  },
  openGraph: {
    title: "Opportunités à reprendre - Demaa",
    description:
      "Consultez des entreprises à reprendre en France : secteur, localisation, chiffre d'affaires, effectif, date limite et dossier source.",
    url: "/developper",
    siteName: "Demaa",
    locale: "fr_FR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Opportunités à reprendre - Demaa",
    description:
      "Consultez des entreprises à reprendre en France : secteur, localisation, chiffre d'affaires, effectif, date limite et dossier source.",
  },
};

export default function DevelopperPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-dema-cream text-brand-blue">
        <DevelopperOpportunitiesClient opportunities={actifyOpportunities} />
      </main>
    </>
  );
}
