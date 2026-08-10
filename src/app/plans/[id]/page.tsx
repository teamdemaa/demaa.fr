import type { Metadata } from "next";
import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import Navbar from "@/components/Navbar";
import SavedActionPlanDetail from "@/components/SavedActionPlanDetail";
import { getOwnedActionPlan } from "@/lib/action-plan-storage.server";
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
}: {
  params: Promise<{ id: string }>;
}) {
  const [{ id }, cookieStore] = await Promise.all([params, cookies()]);
  const sessionToken = cookieStore.get(CUSTOMER_SPACE_COOKIE)?.value || null;
  const email = await getEmailFromCustomerSessionToken(sessionToken);

  if (!email) {
    redirect(
      `/mon-espace?message=${encodeURIComponent("Connectez-vous pour ouvrir ce plan.")}`,
    );
  }

  const stored = await getOwnedActionPlan(email, id);
  if (!stored) notFound();

  return (
    <div data-action-plan-workspace className="min-h-screen bg-dema-cream text-brand-blue">
      <Navbar />
      <main className="px-4 pb-24 pt-2 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-[68rem]">
          <h1 className="sr-only">Mon plan d’action</h1>
          <SavedActionPlanDetail
            plan={stored.plan}
            planId={stored.id}
            initialRevision={stored.revision}
            initialWorkspace={stored.workspaceState}
            systemOptions={actionPlanSystemOptions}
          />
        </div>
      </main>
    </div>
  );
}
