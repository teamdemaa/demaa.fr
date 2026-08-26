import type { Metadata } from "next";
import { redirect } from "next/navigation";
import ActionPlanHomeView from "@/components/ActionPlanHomeView";
import { loadActionPlanHomePage } from "@/lib/action-plan-pages.server";

export const metadata: Metadata = {
  title: "Diagnostic organisation | Demaa",
  description:
    "Décrivez ce qui ralentit votre entreprise pour obtenir un plan d’action avec les processus, ressources et solutions à mettre en place.",
  robots: { index: false, follow: true },
};

export default async function DiagnosticOrganisationPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const query = {
    ...await searchParams,
    view: "plan",
  };
  const page = await loadActionPlanHomePage({
    localeCode: "fr",
    searchParams: query,
  });

  if (!page.guestProductEnabled) redirect("/?view=plan");

  return <ActionPlanHomeView {...page} focusedDiagnostic />;
}
