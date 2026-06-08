import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import OpportunitiesClient from "@/components/OpportunitiesClient";

export const metadata: Metadata = {
  title: "Opportunités B2B - Demaa",
  description:
    "Publiez et consultez des opportunités B2B qualifiées entre dirigeants : missions à confier, sous-traitance et besoins métier.",
  alternates: {
    canonical: "/opportunites",
  },
  openGraph: {
    title: "Opportunités B2B - Demaa",
    description:
      "Publiez et consultez des opportunités B2B qualifiées entre dirigeants : missions à confier, sous-traitance et besoins métier.",
    url: "/opportunites",
    siteName: "Demaa",
    locale: "fr_FR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Opportunités B2B - Demaa",
    description:
      "Publiez et consultez des opportunités B2B qualifiées entre dirigeants : missions à confier, sous-traitance et besoins métier.",
  },
};

export default function OpportunitesPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-dema-cream text-brand-blue">
        <OpportunitiesClient />
      </main>
    </>
  );
}
