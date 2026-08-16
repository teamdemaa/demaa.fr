import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import ActionPlanExperience from "@/components/ActionPlanExperience";
import Navbar from "@/components/Navbar";
import { actionPlanSystemOptions } from "@/lib/action-plan-system-catalog";
import { getActionPlanIndexForIdentity } from "@/lib/action-plan-storage.server";
import { getCurrentCustomerAppIdentityFromSession } from "@/lib/customer-space-session.server";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Nouveau plan d’action | Demaa",
  robots: { index: false, follow: false },
};

export default async function NewActionPlanPage({
  searchParams,
}: {
  searchParams: Promise<{ resume?: string | string[] }>;
}) {
  const [identity, params] = await Promise.all([
    getCurrentCustomerAppIdentityFromSession(),
    searchParams,
  ]);
  if (!identity) redirect("/connexion?returnTo=%2Fplans%2Fnew");
  const plans = await getActionPlanIndexForIdentity(identity);

  return (
    <>
      <Navbar anonymousLanding isAuthenticated minimal />
      {plans.length ? (
        <div className="mx-auto w-full max-w-[68rem] px-4 pt-3 sm:px-6 lg:px-8">
          <Link
            href="/plans"
            className="inline-flex min-h-11 items-center text-sm text-dema-muted transition hover:text-dema-forest focus-visible:outline-none focus-visible:underline"
          >
            ← Retour à mes plans
          </Link>
        </div>
      ) : null}
      <ActionPlanExperience
        initialEmail={identity.email}
        initialIsAuthenticated
        initialGenerationIntent={
          (Array.isArray(params.resume) ? params.resume[0] : params.resume) === "generation"
        }
        systemOptions={actionPlanSystemOptions}
      />
    </>
  );
}
