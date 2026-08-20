import { redirectToLatestActionPlan } from "@/lib/action-plan-pages.server";

export const dynamic = "force-dynamic";

export default async function LatestActionPlanPage() {
  return redirectToLatestActionPlan("fr");
}
