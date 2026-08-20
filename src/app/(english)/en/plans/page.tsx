import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ActionPlansIndexView from "@/components/ActionPlansIndexView";
import { isEnglishBetaEnabled } from "@/lib/english-beta.server";
import { loadActionPlansPage } from "@/lib/action-plan-pages.server";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "My action plans | Demaa",
  robots: { index: false, follow: false },
};

export default async function EnglishActionPlansPage() {
  if (!isEnglishBetaEnabled()) notFound();
  return <ActionPlansIndexView {...await loadActionPlansPage("en")} />;
}
