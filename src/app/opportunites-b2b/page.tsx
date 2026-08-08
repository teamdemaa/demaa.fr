import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import B2BOpportunitiesClient from "@/components/B2BOpportunitiesClient";
import { getPublishedB2BOpportunities } from "@/lib/b2b-opportunities.server";

export const dynamic = "force-dynamic";

const title = "Opportunités B2B | Demaa";
const description = "Des entreprises recherchent une solution ou un prestataire pour un besoin concret.";

export const metadata: Metadata = {
  alternates: { canonical: "/opportunites-b2b" },
  description,
  openGraph: { description, locale: "fr_FR", siteName: "Demaa", title, type: "website", url: "/opportunites-b2b" },
  title,
};

export default async function OpportunitesB2BPage() {
  const opportunities = await getPublishedB2BOpportunities();
  return (
    <>
      <Navbar />
      <main className="flex-1 bg-dema-cream">
        <B2BOpportunitiesClient opportunities={opportunities} />
      </main>
    </>
  );
}
