import type { Metadata } from "next";
import { cookies } from "next/headers";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
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
  title: "Plan d’action sauvegardé | Demaa",
  robots: { index: false, follow: false },
};

export default async function SavedActionPlanPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [{ id }, cookieStore] = await Promise.all([params, cookies()]);
  const sessionToken = cookieStore.get(CUSTOMER_SPACE_COOKIE)?.value || null;
  const email = await getEmailFromCustomerSessionToken(sessionToken);

  if (!email) {
    redirect(`/mon-espace?message=${encodeURIComponent("Connectez-vous pour retrouver ce plan.")}`);
  }

  const stored = await getOwnedActionPlan(email, id);
  if (!stored) notFound();

  return (
    <div data-action-plan-workspace className="min-h-screen bg-dema-cream text-brand-blue">
      <Navbar />
      <main className="px-4 pb-24 pt-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-[68rem]">
          <Link href="/mon-espace" className="inline-flex min-h-11 items-center gap-2 text-sm text-dema-muted transition hover:text-dema-forest">
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Retour à mon espace
          </Link>
          <p className="mt-5 text-xs font-medium uppercase tracking-[0.14em] text-dema-forest">
            Plan sauvegardé
          </p>
          <h1 className="mt-2 max-w-3xl text-3xl font-light tracking-[-0.04em] sm:text-4xl">
            {stored.plan.summary}
          </h1>
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
