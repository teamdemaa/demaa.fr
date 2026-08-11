import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import ActionPlanExperience from "@/components/ActionPlanExperience";
import type { ActionPlanView } from "@/components/ActionPlanNavbar";
import Navbar from "@/components/Navbar";
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

const APP_VIEWS = new Set<ActionPlanView>([
  "plan",
  "system",
  "academy",
  "opportunities",
]);

function getInitialView(value: string | string[] | undefined): ActionPlanView {
  const view = Array.isArray(value) ? value[0] : value;
  return view && APP_VIEWS.has(view as ActionPlanView)
    ? (view as ActionPlanView)
    : "plan";
}

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{
    intent?: string | string[];
    new?: string | string[];
    view?: string | string[];
  }>;
}) {
  const [cookieStore, query] = await Promise.all([cookies(), searchParams]);
  const sessionToken = cookieStore.get(CUSTOMER_SPACE_COOKIE)?.value || null;
  const email = await getEmailFromCustomerSessionToken(sessionToken);
  const initialView = getInitialView(query.view);
  const requestedIntent = Array.isArray(query.intent) ? query.intent[0] : query.intent;
  const requestedNewPlan = Array.isArray(query.new) ? query.new[0] : query.new;

  if (
    email
    && initialView === "plan"
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
        initialView={initialView}
        systemOptions={actionPlanSystemOptions}
      />
    </>
  );
}
