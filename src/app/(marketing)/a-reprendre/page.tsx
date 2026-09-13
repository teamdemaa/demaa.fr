import type { Metadata } from "next";
import RepriseMarketplaceClient from "@/components/RepriseMarketplaceClient";
import { repriseOpportunities } from "@/lib/reprise-opportunities";

export const metadata: Metadata = {
  title: "PME de services à reprendre | Demaa",
  description:
    "Découvrez des entreprises de services en activité, avec des clients, une équipe et un savoir-faire déjà en place.",
  alternates: { canonical: "/a-reprendre" },
  openGraph: {
    title: "Reprenez une entreprise qui fonctionne déjà | Demaa",
    description: "Marketplace d’entreprises de services à reprendre.",
    url: "/a-reprendre",
    siteName: "Demaa",
    locale: "fr_FR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Reprenez une entreprise qui fonctionne déjà | Demaa",
    description: "Marketplace d’entreprises de services à reprendre.",
  },
};

export default function RepriseMarketplacePage() {
  return <RepriseMarketplaceClient opportunities={repriseOpportunities} />;
}
