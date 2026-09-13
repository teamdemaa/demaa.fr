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
    description: "Découvrez des entreprises de services en activité, avec des clients, une équipe et un savoir-faire déjà en place.",
    url: "/a-reprendre",
    siteName: "Demaa",
    locale: "fr_FR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Reprenez une entreprise qui fonctionne déjà | Demaa",
    description: "Découvrez des entreprises de services en activité, avec des clients, une équipe et un savoir-faire déjà en place.",
  },
};

export default async function RepriseMarketplacePage({
  searchParams,
}: {
  searchParams: Promise<{ opportunite?: string | string[] }>;
}) {
  const opportunity = (await searchParams).opportunite;
  return <RepriseMarketplaceClient initialOpportunityId={typeof opportunity === "string" ? opportunity : undefined} opportunities={repriseOpportunities} />;
}
