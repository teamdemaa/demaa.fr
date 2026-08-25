import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import ActionPlanNavbar from "@/components/ActionPlanNavbar";
import OrganiserWorkspace from "@/components/OrganiserWorkspace";
import { getAllAcademyContent } from "@/lib/academy-course-content";
import { getActionPlanSystemOptionsForContext } from "@/lib/action-plan-localization";
import { parseOrganiserTab } from "@/lib/organiser-navigation";

const title = "Organiser son entreprise | Demaa";
const description =
  "Des solutions par métier et des processus concrets pour organiser les demandes, les interventions, les documents et le suivi d’une TPE.";

export const metadata: Metadata = {
  title,
  description,
  alternates: {
    canonical: "/organiser",
  },
  openGraph: {
    title,
    description,
    url: "/organiser",
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

type AcademyIndexPageProps = {
  searchParams: Promise<{
    resource?: string | string[];
    system?: string | string[];
    tab?: string | string[];
    toolSource?: string | string[];
  }>;
};

function getParamValue(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function AcademyIndexPage({ searchParams }: AcademyIndexPageProps) {
  const resolvedSearchParams = await searchParams;
  const systemOptions = getActionPlanSystemOptionsForContext({
    contentLocaleCode: "fr",
    marketCodeAtCreation: "fr-fr",
  });
  const requestedSystemId = getParamValue(resolvedSearchParams.system);
  const initialSystemId = systemOptions.some(({ id }) => id === requestedSystemId)
    ? requestedSystemId
    : undefined;
  const initialResourceSlug = getParamValue(resolvedSearchParams.resource);
  const initialTab = parseOrganiserTab(resolvedSearchParams.tab);
  const toolOutboundSurface = getParamValue(resolvedSearchParams.toolSource)
    === "action_recommendation"
    ? "action_recommendation"
    : "solutions";

  return (
    <>
      <Navbar />
      <ActionPlanNavbar activeView="academy" routeNavigation />
      <OrganiserWorkspace
        key={[initialTab, initialSystemId ?? "", initialResourceSlug ?? ""].join(":")}
        contents={getAllAcademyContent()}
        initialResourceSlug={initialResourceSlug}
        initialSystemId={initialSystemId}
        initialTab={initialTab}
        systemOptions={systemOptions}
        toolOutboundSurface={toolOutboundSurface}
      />
    </>
  );
}
