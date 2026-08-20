import { notFound } from "next/navigation";
import { isEnglishBetaEnabled } from "@/lib/english-beta.server";
import { redirectToLatestActionPlan } from "@/lib/action-plan-pages.server";

export const dynamic = "force-dynamic";

export default async function LatestEnglishActionPlanPage() {
  if (!isEnglishBetaEnabled()) notFound();
  return redirectToLatestActionPlan("en");
}
