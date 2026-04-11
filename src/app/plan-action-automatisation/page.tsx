import Navbar from "@/components/Navbar";
import AssistantHub from "@/components/AssistantHub";
import NewsletterPrompt from "@/components/NewsletterPrompt";
import { getSystems } from "@/lib/api";
import { buildOperationalSystemDetail } from "@/lib/system-operations";

export const metadata = {
  title: "Plan d'action automatisation - Demaa",
  description:
    "Décrivez votre activité et obtenez un premier plan d'action pour repérer les tâches à automatiser.",
};

export default async function PlanActionAutomatisationPage() {
  const systems = await getSystems();
  const detailsBySlug = Object.fromEntries(
    systems.map((system) => [system.slug, buildOperationalSystemDetail(system)])
  );

  return (
    <>
      <Navbar />
      <main className="flex-1 w-full bg-[#FFF9F8] min-h-screen">
        <AssistantHub systems={systems} detailsBySlug={detailsBySlug} mode="tool" />
      </main>
      <NewsletterPrompt />
    </>
  );
}
