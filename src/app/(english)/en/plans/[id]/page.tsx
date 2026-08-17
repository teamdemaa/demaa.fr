import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import ActionPlanNavbar from "@/components/ActionPlanNavbar";
import DocumentLocale from "@/components/DocumentLocale";
import Navbar from "@/components/Navbar";
import SavedActionPlanDetail from "@/components/SavedActionPlanDetail";
import SavedActionPlanGenerationState from "@/components/SavedActionPlanGenerationState";
import { parseActionPlanAppContext } from "@/lib/action-plan-app-context";
import { englishActionPlanSystemOptions } from "@/lib/action-plan-localization";
import { getActionPlanWorkspacePageForIdentity } from "@/lib/action-plan-storage.server";
import { getCurrentCustomerAppIdentityFromSession } from "@/lib/customer-space-session.server";
import { isEnglishBetaEnabled } from "@/lib/english-beta.server";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "My action plan | Demaa",
  robots: { index: false, follow: false },
};

export default async function EnglishActionPlanPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  if (!isEnglishBetaEnabled()) notFound();
  const [{ id }, query, identity] = await Promise.all([
    params,
    searchParams,
    getCurrentCustomerAppIdentityFromSession(),
  ]);
  if (!identity) {
    redirect(`/connexion?returnTo=${encodeURIComponent(`/en/plans/${id}`)}`);
  }
  const parsedContext = parseActionPlanAppContext(query);
  const initialAppContext = { ...parsedContext, view: parsedContext.view === "solutions" ? "solutions" : "plan" } as const;
  const { generationState, plans } = await getActionPlanWorkspacePageForIdentity(identity, id);
  if (!generationState) notFound();

  if (generationState.status !== "active") {
    return (
      <div data-action-plan-workspace className="min-h-screen bg-dema-cream text-brand-blue">
        <DocumentLocale localeCode="en" />
        <Navbar anonymousLanding isAuthenticated localeCode="en" minimal />
        <ActionPlanNavbar activeView="plan" localeCode="en" routeNavigation visibleViews={["plan", "solutions"]} />
        <SavedActionPlanGenerationState canRetry={generationState.status === "failed" && generationState.canRetry} localeCode="en" planId={generationState.id} status={generationState.status} />
      </div>
    );
  }

  const stored = generationState.actionPlan;
  return (
    <div data-action-plan-workspace className="min-h-screen bg-dema-cream text-brand-blue">
      <DocumentLocale localeCode="en" />
      <Navbar anonymousLanding isAuthenticated localeCode="en" minimal />
      <main className="px-4 pb-24 pt-2 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-[68rem]">
          <h1 className="sr-only">My action plan</h1>
          <SavedActionPlanDetail
            availablePlans={plans}
            contentLocaleCode={stored.contentLocaleCode}
            initialAppContext={initialAppContext}
            initialEmail={identity.email}
            initialIsAuthenticated
            initialRevision={stored.revision}
            initialSourceText={stored.sourceText}
            initialTitle={stored.title}
            initialWorkspace={stored.workspaceState}
            interfaceLocaleCode="en"
            marketCodeAtCreation={stored.marketCodeAtCreation}
            plan={stored.plan}
            planId={stored.id}
            showCoaching
            systemOptions={englishActionPlanSystemOptions}
            visibleViews={["plan", "solutions"]}
          />
        </div>
      </main>
    </div>
  );
}
