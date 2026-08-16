import { notFound, redirect } from "next/navigation";
import { isEnglishBetaEnabled } from "@/lib/english-beta.server";
import { getActionPlanIndexForIdentity } from "@/lib/action-plan-storage.server";
import { getCurrentCustomerAppIdentityFromSession } from "@/lib/customer-space-session.server";

export const dynamic = "force-dynamic";

export default async function LatestEnglishActionPlanPage() {
  if (!isEnglishBetaEnabled()) notFound();
  const identity = await getCurrentCustomerAppIdentityFromSession();
  if (!identity) redirect("/connexion?returnTo=%2Fen%2Fplans%2Flatest");

  const [latestPlan] = await getActionPlanIndexForIdentity(identity);
  redirect(latestPlan ? `/en/plans/${latestPlan.id}` : "/en/plans/new");
}
