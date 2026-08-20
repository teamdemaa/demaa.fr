import type { Metadata } from "next";
import NewActionPlanView from "@/components/NewActionPlanView";
import { loadNewActionPlanPage } from "@/lib/action-plan-pages.server";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Nouveau plan d’action | Demaa",
  robots: { index: false, follow: false },
};

export default async function NewActionPlanPage({
  searchParams,
}: {
  searchParams: Promise<{ resume?: string | string[] }>;
}) {
  return (
    <NewActionPlanView
      {...await loadNewActionPlanPage({ localeCode: "fr", searchParams })}
    />
  );
}
