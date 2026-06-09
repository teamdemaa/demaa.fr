import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import OpportunitiesClient from "@/components/OpportunitiesClient";

export const metadata: Metadata = {
  title: "Développer par reprise d'entreprise - Demaa",
  description:
    "Consultez des entreprises à reprendre entre dirigeants : secteur, localisation, montant, chiffre d'affaires, résultat, salariés et dossier qualifié.",
  alternates: {
    canonical: "/developper",
  },
  openGraph: {
    title: "Développer par reprise d'entreprise - Demaa",
    description:
      "Consultez des entreprises à reprendre entre dirigeants : secteur, localisation, montant, chiffre d'affaires, résultat, salariés et dossier qualifié.",
    url: "/developper",
    siteName: "Demaa",
    locale: "fr_FR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Développer par reprise d'entreprise - Demaa",
    description:
      "Consultez des entreprises à reprendre entre dirigeants : secteur, localisation, montant, chiffre d'affaires, résultat, salariés et dossier qualifié.",
  },
};

export default function DevelopperPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-dema-cream text-brand-blue">
        <OpportunitiesClient />
      </main>
    </>
  );
}
