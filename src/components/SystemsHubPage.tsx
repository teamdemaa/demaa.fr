import Navbar from "@/components/Navbar";
import HomeTabsClient from "@/components/HomeTabsClient";
import { enterpriseToSystem } from "@/lib/enterprise-annuaire";
import { getEnterpriseCatalog } from "@/lib/enterprise-annuaire-server";
import { buildOperationalSystemDetails } from "@/lib/system-operations";
import { getUnifiedToolDirectory } from "@/lib/tool-directory-firestore";

export default async function SystemsHubPage() {
  const [enterprises, toolDirectory] = await Promise.all([
    getEnterpriseCatalog(),
    getUnifiedToolDirectory(),
  ]);
  const systems = enterprises.map(enterpriseToSystem);
  const detailsBySlug = await buildOperationalSystemDetails(systems, enterprises, toolDirectory);

  return (
    <>
      <Navbar />
      <main className="flex-1 min-h-screen w-full bg-dema-cream">
        <HomeTabsClient systems={systems} detailsBySlug={detailsBySlug} />
      </main>
    </>
  );
}
