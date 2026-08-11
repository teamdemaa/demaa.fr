import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getOwnedActionPlans } from "@/lib/action-plan-storage.server";
import {
  CUSTOMER_SPACE_COOKIE,
  getEmailFromCustomerSessionToken,
} from "@/lib/customer-space-auth";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Plans d’action | Demaa",
  robots: { index: false, follow: false },
};

export default async function LatestActionPlanPage() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(CUSTOMER_SPACE_COOKIE)?.value || null;
  const email = await getEmailFromCustomerSessionToken(sessionToken);

  if (!email) redirect("/connexion?returnTo=%2Fplans");

  const [latestPlan] = await getOwnedActionPlans(email);
  redirect(latestPlan ? `/plans/${latestPlan.id}` : "/");
}
