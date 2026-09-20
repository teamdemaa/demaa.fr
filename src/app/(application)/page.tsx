import type { Metadata } from "next";
import { permanentRedirect } from "next/navigation";
import ActionPlanHomeView from "@/components/ActionPlanHomeView";
import RepriseMarketplaceClient from "@/components/RepriseMarketplaceClient";
import SiniFooter from "@/components/SiniFooter";
import { buildDefaultHomeMarketplaceHref } from "@/lib/action-plan-home-routing";
import { loadActionPlanHomePage } from "@/lib/action-plan-pages.server";
import { repriseOpportunities } from "@/lib/reprise-opportunities";
import { buildLegacySolutionsRedirect } from "@/lib/organiser-navigation";

export const metadata: Metadata = {
  title: "Entreprises à reprendre | sini",
  description: "Découvrez des entreprises à reprendre et préparez une transmission avec méthode.",
  robots: { index: false, follow: false },
  openGraph: {
    title: "Entreprises à reprendre | sini",
    description: "Découvrez des entreprises à reprendre et préparez une transmission avec méthode.",
    url: "/",
    siteName: "sini",
    locale: "fr_FR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Entreprises à reprendre | sini",
    description: "Découvrez des entreprises à reprendre et préparez une transmission avec méthode.",
  },
};

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{
    intent?: string | string[];
    academy?: string | string[];
    new?: string | string[];
    opportunity?: string | string[];
    opportunite?: string | string[];
    opportunityId?: string | string[];
    planTab?: string | string[];
    section?: string | string[];
    resource?: string | string[];
    resourceSlug?: string | string[];
    system?: string | string[];
    systemSlug?: string | string[];
    systemTab?: string | string[];
    toolSource?: string | string[];
    view?: string | string[];
  }>;
}) {
  const query = await searchParams;
  const organiserRedirect = buildLegacySolutionsRedirect(query);
  if (organiserRedirect) permanentRedirect(organiserRedirect);
  const defaultMarketplaceHref = buildDefaultHomeMarketplaceHref(query);
  if (defaultMarketplaceHref) {
    return (
      <>
        <RepriseMarketplaceClient initialOpportunityId={typeof query.opportunite === "string" ? query.opportunite : undefined} opportunities={repriseOpportunities} />
        <SiniFooter />
      </>
    );
  }

  return (
    <ActionPlanHomeView
      {...await loadActionPlanHomePage({ localeCode: "fr", searchParams: query })}
    />
  );
}
