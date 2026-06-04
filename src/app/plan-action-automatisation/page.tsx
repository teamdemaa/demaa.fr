import Navbar from "@/components/Navbar";
import AssistantHub from "@/components/AssistantHub";
import { enterpriseToSystem, getEnterpriseCatalog } from "@/lib/enterprise-annuaire";
import { buildOperationalSystemDetails } from "@/lib/system-operations";
import { getUnifiedToolDirectory } from "@/lib/tool-directory-firestore";

export const metadata = {
  title: "Plan d'action automatisation - Demaa",
  description:
    "Décrivez votre activité et obtenez un premier plan d'action pour repérer les tâches à automatiser.",
};

export const dynamic = "force-dynamic";

export default async function PlanActionAutomatisationPage() {
  const [enterprises, toolDirectory] = await Promise.all([
    getEnterpriseCatalog(),
    getUnifiedToolDirectory(),
  ]);
  const systems = enterprises.map(enterpriseToSystem);
  const detailsBySlug = await buildOperationalSystemDetails(systems, enterprises, toolDirectory);

  return (
    <>
      <Navbar />
      <main className="flex-1 w-full bg-[#ffffff] min-h-screen">
        <AssistantHub systems={systems} detailsBySlug={detailsBySlug} mode="tool" />
      </main>
    </>
  );
}
