import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import ActionPlanExperience from "@/components/ActionPlanExperience";
import Navbar from "@/components/Navbar";
import { actionPlanSystemOptions } from "@/lib/action-plan-system-catalog";
import {
  CUSTOMER_SPACE_COOKIE,
  getIdentityFromCustomerSessionToken,
} from "@/lib/customer-space-auth";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Nouveau plan d’action | Demaa",
  robots: { index: false, follow: false },
};

export default async function NewActionPlanPage() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(CUSTOMER_SPACE_COOKIE)?.value || null;
  const identity = await getIdentityFromCustomerSessionToken(sessionToken);
  if (!identity) redirect("/connexion?returnTo=%2Fplans%2Fnew");

  return (
    <>
      <Navbar anonymousLanding isAuthenticated minimal />
      <ActionPlanExperience
        initialEmail={identity.email}
        initialIsAuthenticated
        systemOptions={actionPlanSystemOptions}
      />
    </>
  );
}
