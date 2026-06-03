import Navbar from "@/components/Navbar";
import HomeTabsClient from "@/components/HomeTabsClient";
import NewsletterPrompt from "@/components/NewsletterPrompt";
import { enterpriseToSystem, getEnterpriseCatalog } from "@/lib/enterprise-annuaire";
import { buildOperationalSystemDetails } from "@/lib/system-operations";
import {
  freeToolsDirectory,
  freeToolsDirectoryCategories,
  freeToolsDirectorySectors,
} from "@/lib/free-tools-directory";
import { getToolDirectorySlug } from "@/lib/tool-directory";
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
  const toolboxTools = toolDirectory
    .filter((tool) => tool.toolbox)
    .map((tool) => ({
      ...tool,
      url: `/annuaire-logiciel/${getToolDirectorySlug(tool)}`,
    }));
  const toolCategories = ["Tous", ...Array.from(new Set(toolDirectory.map((tool) => tool.category)))];

  return (
    <>
      <Navbar />
      <main className="flex-1 w-full bg-white min-h-screen">
        <HomeTabsClient
          systems={systems}
          detailsBySlug={detailsBySlug}
          tools={freeToolsDirectory}
          otherTools={toolboxTools}
          toolSectors={freeToolsDirectorySectors}
          toolCategories={[
            ...freeToolsDirectoryCategories,
            ...toolCategories.filter((category) => category !== "Tous"),
          ].filter((category, index, list) => list.indexOf(category) === index)}
          initialTab={initialTab}
          initialCategory={initialCategory}
          initialSector={initialSector}
          initialSystem={initialSystem}
        />
      </main>
      <NewsletterPrompt />
    </>
  );
}
