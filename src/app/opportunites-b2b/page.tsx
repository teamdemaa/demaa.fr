import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import B2BOpportunitiesClient from "@/components/B2BOpportunitiesClient";
import { B2B_OPPORTUNITIES } from "@/lib/b2b-opportunities";

const title = "Opportunités B2B | Demaa";
const description =
  "Des entreprises du réseau Demaa cherchent un prestataire, un profil ou un partenaire. Manifestez votre intérêt en un clic.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/opportunites-b2b" },
  openGraph: {
    title,
    description,
    url: "/opportunites-b2b",
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

export default function OpportunitesB2BPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1 bg-dema-cream">
        <B2BOpportunitiesClient opportunities={B2B_OPPORTUNITIES} />
      </main>
    </>
  );
}
