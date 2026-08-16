import type { Metadata } from "next";
import { redirect } from "next/navigation";
import ActionPlanExperience from "@/components/ActionPlanExperience";
import Navbar from "@/components/Navbar";
import { actionPlanSystemOptions } from "@/lib/action-plan-system-catalog";
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

  return (
    <>
      <Navbar anonymousLanding isAuthenticated minimal />
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
