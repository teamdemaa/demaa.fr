import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import ActionPlanExperience from "@/components/ActionPlanExperience";
import DocumentLocale from "@/components/DocumentLocale";
import Navbar from "@/components/Navbar";
import { isEnglishBetaEnabled } from "@/lib/english-beta.server";
import { parseActionPlanAppContext } from "@/lib/action-plan-app-context";
import { shouldRedirectAuthenticatedHomeToPlans } from "@/lib/action-plan-home-routing";
import { englishActionPlanSystemOptions } from "@/lib/action-plan-localization";
import { resolveRequestInternationalContext } from "@/lib/international-context.server";
import { getCurrentCustomerAppIdentityFromSession } from "@/lib/customer-space-session.server";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  alternates: { canonical: "/en", languages: { fr: "/", en: "/en" } },
  description:
    "Clarify your priorities and build a more profitable business that depends less on you.",
  openGraph: {
    locale: "en",
    title: "Demaa | Build a business that depends less on you",
  },
  robots: { follow: false, index: false },
  title: "Demaa | Build a business that depends less on you",
};

export default async function EnglishActionPlanPage({
  searchParams,
}: {
  searchParams: Promise<{
    intent?: string | string[];
    new?: string | string[];
    planTab?: string | string[];
    view?: string | string[];
  }>;
}) {
  if (!isEnglishBetaEnabled()) notFound();
  const [context, identity, query] = await Promise.all([
    resolveRequestInternationalContext({ pathname: "/en" }),
    getCurrentCustomerAppIdentityFromSession(),
    searchParams,
  ]);
  const initialAppContext = parseActionPlanAppContext(query);
  const englishView = initialAppContext.view === "solutions" || initialAppContext.view === "academy"
    ? initialAppContext.view
    : "plan";
  const requestedIntent = Array.isArray(query.intent) ? query.intent[0] : query.intent;
  const requestedNewPlan = Array.isArray(query.new) ? query.new[0] : query.new;

  if (shouldRedirectAuthenticatedHomeToPlans({
    isAuthenticated: Boolean(identity),
    appContext: initialAppContext,
    requestedIntent,
    requestedNewPlan,
  })) {
    redirect("/en/plans/latest");
  }

  return (
    <>
      <script
        dangerouslySetInnerHTML={{
          __html: `document.documentElement.lang=${JSON.stringify(context.localeCode)}`,
        }}
      />
      <DocumentLocale localeCode={context.localeCode} />
      <Navbar
        anonymousLanding
        isAuthenticated={Boolean(identity)}
        localeCode="en"
        minimal
      />
      <ActionPlanExperience
        contentLocaleCode="en"
        initialEmail={identity?.email ?? ""}
        initialIsAuthenticated={Boolean(identity)}
        initialAppContext={{ ...initialAppContext, view: englishView }}
        initialGenerationIntent={requestedIntent === "generate-plan"}
        marketCodeAtCreation="global-en-beta"
        showCoaching
        systemOptions={englishActionPlanSystemOptions}
        visibleViews={["plan", "solutions", "academy"]}
      />
    </>
  );
}
