import { redirect } from "next/navigation";
import { getActionPlanIndexForIdentity } from "@/lib/action-plan-storage.server";
import { getCurrentCustomerAppIdentityFromSession } from "@/lib/customer-space-session.server";

export const dynamic = "force-dynamic";

export default async function LatestActionPlanPage() {
  const identity = await getCurrentCustomerAppIdentityFromSession();

  if (!identity) redirect("/connexion?returnTo=%2Fplans%2Flatest");

  const [latestPlan] = await getActionPlanIndexForIdentity(identity);
  redirect(latestPlan ? `/plans/${latestPlan.id}` : "/plans/new");
}
