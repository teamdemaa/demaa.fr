import type { Metadata } from "next";
import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import Navbar from "@/components/Navbar";
import SavedActionPlanDetail from "@/components/SavedActionPlanDetail";
import { parseActionPlanAppContext } from "@/lib/action-plan-app-context";
import {
  ACTION_PLAN_ACCESS_COOKIE,
  getActionPlanForAccess,
  getOwnedActionPlans,
} from "@/lib/action-plan-storage.server";
import { actionPlanSystemOptions } from "@/lib/action-plan-system-catalog";
import {
  CUSTOMER_SPACE_COOKIE,
  getEmailFromCustomerSessionToken,
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
  const temporaryAccessToken =
    cookieStore.get(ACTION_PLAN_ACCESS_COOKIE)?.value || null;
  const email = await getEmailFromCustomerSessionToken(sessionToken);

  if (!email && !temporaryAccessToken) {
    redirect(
      `/connexion?message=${encodeURIComponent("Connectez-vous pour ouvrir ce plan.")}&returnTo=${encodeURIComponent(`/plans/${id}`)}`,
    );
  }

  const stored = await getActionPlanForAccess({
    email,
    id,
    temporaryAccessToken,
  });
  if (!stored) notFound();

  const availablePlans = email
    ? (await getOwnedActionPlans(email)).map(({ id: availableId, title, updatedAt }) => ({
        id: availableId,
        title,
        updatedAt,
      }))
    : [{ id: stored.id, title: stored.title, updatedAt: stored.updatedAt }];

  return (
    <div data-action-plan-workspace className="min-h-screen bg-dema-cream text-brand-blue">
      <Navbar anonymousLanding isAuthenticated minimal />
      <main className="px-4 pb-24 pt-2 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-[68rem]">
          <h1 className="sr-only">Mon plan d’action</h1>
          <SavedActionPlanDetail
            key={stored.id}
            initialEmail={email || ""}
            initialAppContext={initialAppContext}
            plan={stored.plan}
            planId={stored.id}
            initialTitle={stored.title}
            initialRevision={stored.revision}
            initialWorkspace={stored.workspaceState}
            systemOptions={actionPlanSystemOptions}
            availablePlans={availablePlans}
          />
        </div>
      </main>
    </div>
  );
}
