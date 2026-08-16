import type { Metadata } from "next";
import { redirect } from "next/navigation";
import ActionPlanExperience from "@/components/ActionPlanExperience";
import Navbar from "@/components/Navbar";
import {
  buildLegacyOpportunitiesHref,
  parseActionPlanAppContext,
} from "@/lib/action-plan-app-context";
import { shouldRedirectAuthenticatedHomeToPlans } from "@/lib/action-plan-home-routing";
import { actionPlanSystemOptions } from "@/lib/action-plan-system-catalog";
import { getCurrentCustomerAppIdentityFromSession } from "@/lib/customer-space-session.server";

const title = "Un plan d’action concret pour votre entreprise | Demaa";
const description =
  "Décrivez la situation de votre entreprise et obtenez un plan d’action concret, accompagné du système métier adapté pour l’exécuter.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/" },
  openGraph: {
    title,
    description,
    url: "/",
    siteName: "Demaa",
    locale: "fr_FR",
    type: "website",
  },
  twitter: { card: "summary_large_image", title, description },
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
  const [identity, query] = await Promise.all([
    getCurrentCustomerAppIdentityFromSession(),
    searchParams,
  ]);
  const legacyOpportunitiesHref = buildLegacyOpportunitiesHref(query);
  if (legacyOpportunitiesHref) redirect(legacyOpportunitiesHref);
  const initialAppContext = parseActionPlanAppContext(query);
  const requestedIntent = Array.isArray(query.intent) ? query.intent[0] : query.intent;
  const requestedNewPlan = Array.isArray(query.new) ? query.new[0] : query.new;

  if (shouldRedirectAuthenticatedHomeToPlans({
    isAuthenticated: Boolean(identity),
    appContext: initialAppContext,
    requestedIntent,
    requestedNewPlan,
  })) {
    redirect("/plans/latest");
  }

  return (
    <>
      <Navbar anonymousLanding isAuthenticated={Boolean(identity)} minimal />
      <ActionPlanExperience
        initialEmail={identity?.email ?? ""}
        initialIsAuthenticated={Boolean(identity)}
        initialAppContext={initialAppContext}
        initialGenerationIntent={requestedIntent === "generate-plan"}
        initialStructureIntent={
          requestedIntent === "structure" || requestedIntent === "structure-problem"
        }
        systemOptions={actionPlanSystemOptions}
      />
    </>
  );
}
