import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getActionPlanIndexForIdentity } from "@/lib/action-plan-storage.server";
import {
  CUSTOMER_SPACE_COOKIE,
  getIdentityFromCustomerSessionToken,
} from "@/lib/customer-space-auth";

export const dynamic = "force-dynamic";

export default async function LatestActionPlanPage() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(CUSTOMER_SPACE_COOKIE)?.value || null;
  const identity = await getIdentityFromCustomerSessionToken(sessionToken);

  if (!identity) redirect("/connexion?returnTo=%2Fplans%2Flatest");

  const [latestPlan] = await getActionPlanIndexForIdentity(identity);
  redirect(latestPlan ? `/plans/${latestPlan.id}` : "/plans");
}
