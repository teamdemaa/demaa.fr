import Navbar from "@/components/Navbar";
import HomeTabsClient from "@/components/HomeTabsClient";
import { enterpriseToSystem, getEnterpriseCatalog } from "@/lib/enterprise-annuaire";
import { buildOperationalSystemDetails } from "@/lib/system-operations";
import {
  freeToolsDirectory,
  freeToolsDirectoryCategories,
  freeToolsDirectorySectors,
} from "@/lib/free-tools-directory";
import { getUnifiedToolDirectory } from "@/lib/tool-directory-firestore";

type HomeHubPageProps = {
  initialCategory?: string;
  initialSector?: string;
  initialTab?: string;
  initialSystem?: string;
};

export default async function HomeHubPage({
  initialCategory,
  initialSector,
  initialTab,
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
          tools={freeToolsDirectory}
          otherTools={[]}
          toolSectors={freeToolsDirectorySectors}
          toolCategories={freeToolsDirectoryCategories}
          initialTab={initialTab}
          initialCategory={initialCategory}
          initialSector={initialSector}
          initialSystem={initialSystem}
        />
      </main>
    </>
  );
}
