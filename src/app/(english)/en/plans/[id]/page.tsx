import type { Metadata } from "next";
import { notFound } from "next/navigation";
import SavedActionPlanPageView from "@/components/SavedActionPlanPageView";
import { loadSavedActionPlanPage } from "@/lib/action-plan-pages.server";
import { isEnglishBetaEnabled } from "@/lib/english-beta.server";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "My action plan | Demaa",
  robots: { index: false, follow: false },
};

export default async function EnglishActionPlanPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  if (!isEnglishBetaEnabled()) notFound();
  const [{ id }, query] = await Promise.all([params, searchParams]);
  return (
    <SavedActionPlanPageView
      {...await loadSavedActionPlanPage({ id, localeCode: "en", searchParams: query })}
    />
  );
}
