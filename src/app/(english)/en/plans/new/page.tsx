import type { Metadata } from "next";
import { notFound } from "next/navigation";
import NewActionPlanView from "@/components/NewActionPlanView";
import { isEnglishBetaEnabled } from "@/lib/english-beta.server";
import { loadNewActionPlanPage } from "@/lib/action-plan-pages.server";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "New action plan | Demaa",
  robots: { index: false, follow: false },
};

export default async function NewEnglishActionPlanPage({
  searchParams,
}: {
  searchParams: Promise<{ resume?: string | string[] }>;
}) {
  if (!isEnglishBetaEnabled()) notFound();
  return (
    <NewActionPlanView
      {...await loadNewActionPlanPage({ localeCode: "en", searchParams })}
    />
  );
}
