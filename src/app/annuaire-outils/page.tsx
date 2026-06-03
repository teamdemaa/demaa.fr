import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import ToolDirectoryClient from "@/components/ToolDirectoryClient";
import {
  getToolDirectoryFilterValues,
  getToolDirectoryInitialFilters,
  type ToolDirectorySearchParams,
  withInternalSoftwareUrls,
} from "@/lib/tool-directory-page";
import { getUnifiedToolDirectoryMeta } from "@/lib/tool-directory-firestore";

export const metadata: Metadata = {
  title: "Annuaire Outils - Demaa",
  description:
    "Explorez les outils utiles aux TPE pour organiser, automatiser, créer et piloter leur activité au quotidien.",
};

export const dynamic = "force-dynamic";

type AnnuaireOutilsPageProps = {
  searchParams: ToolDirectorySearchParams;
};

export default async function AnnuaireOutilsPage({
  searchParams,
}: AnnuaireOutilsPageProps) {
  const { initialCategory, initialSector } = await getToolDirectoryInitialFilters(searchParams);
  const toolDirectoryMeta = await getUnifiedToolDirectoryMeta();
  const toolboxTools = withInternalSoftwareUrls(toolDirectoryMeta.toolboxTools);
  const { sectors, categories } = getToolDirectoryFilterValues(toolboxTools);

  return (
    <>
      <Navbar />
      <main className="flex-1 w-full bg-background animate-in fade-in duration-700">
        <ToolDirectoryClient
          key={`${initialSector ?? "tous"}-${initialCategory ?? "tous"}`}
          title="Annuaire Outils"
          description="Les outils utiles aux TPE pour organiser, automatiser, créer et piloter l'activité."
          searchPlaceholder="Rechercher un outil, un usage, un secteur..."
          items={toolboxTools}
          sectors={sectors}
          categories={categories}
          initialCategory={initialCategory}
          initialSector={initialSector}
          hideTransverseOnSector={false}
          externalLinks={false}
        />
      </main>
    </>
  );
}
