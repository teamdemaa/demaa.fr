import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import Navbar from "@/components/Navbar";
import ActionPlanNavbar from "@/components/ActionPlanNavbar";
import SavedActionPlanDetail from "@/components/SavedActionPlanDetail";
import SavedActionPlanGenerationState from "@/components/SavedActionPlanGenerationState";
import {
  buildActionPlanAppHref,
  parseActionPlanAppContext,
} from "@/lib/action-plan-app-context";
import {
  getActionPlanWorkspacePageForIdentity,
} from "@/lib/action-plan-storage.server";
import { actionPlanSystemOptions } from "@/lib/action-plan-system-catalog";
import { getCurrentCustomerAppIdentityFromSession } from "@/lib/customer-space-session.server";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Mon plan d’action | Demaa",
  robots: { index: false, follow: false },
};

export default async function ActionPlanPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const [{ id }, query, identity] = await Promise.all([
    params,
    searchParams,
    getCurrentCustomerAppIdentityFromSession(),
  ]);
  const initialAppContext = parseActionPlanAppContext(query);

  if (!identity) {
    const returnTo = buildActionPlanAppHref({
      context: initialAppContext,
      pathname: `/plans/${id}`,
    });
    redirect(
      `/connexion?message=${encodeURIComponent("Connectez-vous pour ouvrir ce plan.")}&returnTo=${encodeURIComponent(returnTo)}`,
    );
  }

  const { generationState, plans: availablePlans } =
    await getActionPlanWorkspacePageForIdentity(identity, id);
  if (!generationState) notFound();

  if (generationState.status !== "active") {
    return (
      <div data-action-plan-workspace className="min-h-screen bg-dema-cream text-brand-blue">
        <Navbar anonymousLanding isAuthenticated minimal />
        <ActionPlanNavbar activeView="plan" routeNavigation />
        <SavedActionPlanGenerationState
          canRetry={generationState.status === "failed" && generationState.canRetry}
          planId={generationState.id}
          status={generationState.status}
        />
      </div>
    );
  }

  const stored = generationState.actionPlan;

  return (
    <div data-action-plan-workspace className="min-h-screen bg-dema-cream text-brand-blue">
      <Navbar anonymousLanding isAuthenticated minimal />
      <main className="px-4 pb-24 pt-2 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-[68rem]">
          <h1 className="sr-only">Mon plan d’action</h1>
          <SavedActionPlanDetail
            key={stored.id}
            initialEmail={identity.email}
            initialIsAuthenticated
            initialAppContext={initialAppContext}
            plan={stored.plan}
            planId={stored.id}
            initialTitle={stored.title}
            initialRevision={stored.revision}
            initialSourceText={stored.sourceText}
            initialWorkspace={stored.workspaceState}
            systemOptions={actionPlanSystemOptions}
            availablePlans={availablePlans}
          />
        </div>
      </main>
    </div>
  );
}
