import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import ActionPlanExperience from "@/components/ActionPlanExperience";
import Navbar from "@/components/Navbar";
import { parseActionPlanAppContext } from "@/lib/action-plan-app-context";
import { actionPlanSystemOptions } from "@/lib/action-plan-system-catalog";
import {
  CUSTOMER_SPACE_COOKIE,
  getEmailFromCustomerSessionToken,
} from "@/lib/customer-space-auth";

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
    resource?: string | string[];
    resourceSlug?: string | string[];
    system?: string | string[];
    systemSlug?: string | string[];
    systemTab?: string | string[];
    view?: string | string[];
  }>;
}) {
  const [cookieStore, query] = await Promise.all([cookies(), searchParams]);
  const sessionToken = cookieStore.get(CUSTOMER_SPACE_COOKIE)?.value || null;
  const email = await getEmailFromCustomerSessionToken(sessionToken);
  const initialAppContext = parseActionPlanAppContext(query);
  const requestedIntent = Array.isArray(query.intent) ? query.intent[0] : query.intent;
  const requestedNewPlan = Array.isArray(query.new) ? query.new[0] : query.new;

  if (
    email
    && initialAppContext.view === "plan"
    && !requestedIntent
    && requestedNewPlan !== "1"
  ) {
    redirect("/plans");
  }

  return (
    <>
      <Navbar anonymousLanding isAuthenticated={Boolean(email)} minimal />
      <ActionPlanExperience
        initialEmail={email || ""}
        initialAppContext={initialAppContext}
        systemOptions={actionPlanSystemOptions}
      />
    </>
  );
}
