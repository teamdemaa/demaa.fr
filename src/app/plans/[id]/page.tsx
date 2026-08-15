import type { Metadata } from "next";
import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import Navbar from "@/components/Navbar";
import SavedActionPlanDetail from "@/components/SavedActionPlanDetail";
import {
  buildActionPlanAppHref,
  parseActionPlanAppContext,
} from "@/lib/action-plan-app-context";
import {
  getActionPlanForAccess,
  getOwnedActionPlansForIdentity,
} from "@/lib/action-plan-storage.server";
import { actionPlanSystemOptions } from "@/lib/action-plan-system-catalog";
import {
  CUSTOMER_SPACE_COOKIE,
  getIdentityFromCustomerSessionToken,
} from "@/lib/customer-space-auth";

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
  const [{ id }, query, cookieStore] = await Promise.all([
    params,
    searchParams,
    cookies(),
  ]);
  const initialAppContext = parseActionPlanAppContext(query);
  const sessionToken = cookieStore.get(CUSTOMER_SPACE_COOKIE)?.value || null;
  const identity = await getIdentityFromCustomerSessionToken(sessionToken);

  if (!identity) {
    const returnTo = buildActionPlanAppHref({
      context: initialAppContext,
      pathname: `/plans/${id}`,
    });
    redirect(
      `/connexion?message=${encodeURIComponent("Connectez-vous pour ouvrir ce plan.")}&returnTo=${encodeURIComponent(returnTo)}`,
    );
  }

  const stored = await getActionPlanForAccess({
    uid: identity.uid,
    id,
  });
  if (!stored) notFound();

  const availablePlans = (await getOwnedActionPlansForIdentity(identity)).map(({ id: availableId, title, updatedAt }) => ({
        id: availableId,
        title,
        updatedAt,
      }));

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
