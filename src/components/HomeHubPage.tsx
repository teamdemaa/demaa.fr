import Navbar from "@/components/Navbar";
import HomeTabsClient from "@/components/HomeTabsClient";
import { enterpriseToSystem, getEnterpriseCatalog } from "@/lib/enterprise-annuaire";
import { buildOperationalSystemDetails } from "@/lib/system-operations";
import { getUnifiedToolDirectory } from "@/lib/tool-directory-firestore";

type HomeHubPageProps = {
  initialSystem?: string;
};

export default async function HomeHubPage({
  initialSystem,
}: HomeHubPageProps) {
  const [enterprises, toolDirectory] = await Promise.all([
    getEnterpriseCatalog(),
    getUnifiedToolDirectory(),
  ]);
  const systems = enterprises.map(enterpriseToSystem);
  const detailsBySlug = await buildOperationalSystemDetails(systems, enterprises, toolDirectory);

  return (
    <>
      <Navbar homeTabsMode="client" />
      <main className="flex-1 w-full bg-dema-cream min-h-screen">
        <HomeTabsClient
          systems={systems}
          detailsBySlug={detailsBySlug}
          initialSystem={initialSystem}
        />
      </main>
    </>
  );
}
