import type { Metadata } from "next";
import ActionPlansIndexView from "@/components/ActionPlansIndexView";
import { loadActionPlansPage } from "@/lib/action-plan-pages.server";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Plans d’action | Demaa",
  robots: { index: false, follow: false },
};

export default async function ActionPlansPage() {
  return <ActionPlansIndexView {...await loadActionPlansPage("fr")} />;
}
