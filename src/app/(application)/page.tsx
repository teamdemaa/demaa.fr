import type { Metadata } from "next";
import ActionPlanHomeView from "@/components/ActionPlanHomeView";
import { loadActionPlanHomePage } from "@/lib/action-plan-pages.server";
import { DEMAA_HOME_DESCRIPTION, DEMAA_HOME_TITLE } from "@/lib/demaa-positioning";

export const metadata: Metadata = {
  title: DEMAA_HOME_TITLE,
  description: DEMAA_HOME_DESCRIPTION,
  alternates: { canonical: "/" },
  openGraph: {
    title: DEMAA_HOME_TITLE,
    description: DEMAA_HOME_DESCRIPTION,
    url: "/",
    siteName: "Demaa",
    locale: "fr_FR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: DEMAA_HOME_TITLE,
    description: DEMAA_HOME_DESCRIPTION,
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
    opportunityId?: string | string[];
    planTab?: string | string[];
    resource?: string | string[];
    resourceSlug?: string | string[];
    system?: string | string[];
    systemSlug?: string | string[];
    systemTab?: string | string[];
    view?: string | string[];
  }>;
}) {
  const query = await searchParams;
  return (
    <ActionPlanHomeView
      {...await loadActionPlanHomePage({ localeCode: "fr", searchParams: query })}
    />
  );
}
