import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import ToolDirectoryClient from "@/components/ToolDirectoryClient";
import { getToolDirectorySlug } from "@/lib/tool-directory";
import { getUnifiedToolDirectoryMeta } from "@/lib/tool-directory-firestore";

export const metadata: Metadata = {
  title: "Annuaire Outils - Demaa",
  description:
    "Explorez les outils utiles aux TPE pour organiser, automatiser, créer et piloter leur activité au quotidien.",
};

export const dynamic = "force-dynamic";

type AnnuaireOutilsPageProps = {
  searchParams: Promise<{
    secteur?: string | string[];
    categorie?: string | string[];
  }>;
};

function getParamValue(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function AnnuaireOutilsPage({
  searchParams,
}: AnnuaireOutilsPageProps) {
  const params = await searchParams;
  const initialCategory = getParamValue(params.categorie);
  const initialSector = getParamValue(params.secteur);
  const toolDirectoryMeta = await getUnifiedToolDirectoryMeta();
  const toolboxTools = toolDirectoryMeta.toolboxTools.map((tool) => ({
    ...tool,
    url: `/annuaire-logiciel/${getToolDirectorySlug(tool)}`,
  }));
  const sectors = ["Tous", ...Array.from(new Set(toolboxTools.flatMap((tool) => tool.sectors)))];
  const categories = ["Tous", ...Array.from(new Set(toolboxTools.map((tool) => tool.category)))];

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
