import type { Metadata } from "next";
import SavedActionPlanPageView from "@/components/SavedActionPlanPageView";
import { loadSavedActionPlanPage } from "@/lib/action-plan-pages.server";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Mon plan d’action | Demaa",
  robots: { index: false, follow: false },
};

export default async function ActionPlanPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const [{ id }, query] = await Promise.all([params, searchParams]);
  return (
    <SavedActionPlanPageView
      {...await loadSavedActionPlanPage({ id, localeCode: "fr", searchParams: query })}
    />
  );
}
