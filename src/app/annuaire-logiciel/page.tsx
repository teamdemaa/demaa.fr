import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import ToolDirectoryClient from "@/components/ToolDirectoryClient";
import { getToolDirectorySlug } from "@/lib/tool-directory";
import { getUnifiedToolDirectoryMeta } from "@/lib/tool-directory-firestore";

export const metadata: Metadata = {
  title: "Annuaire Logiciels - Demaa",
  description:
    "Découvrez les principaux logiciels utiles aux TPE, classés par secteur d'activité et catégorie : CRM, automatisation, finance, marketing et outils métier.",
};

export const dynamic = "force-dynamic";

type AnnuaireLogicielPageProps = {
  searchParams: Promise<{
    secteur?: string | string[];
    categorie?: string | string[];
  }>;
};

function getParamValue(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function AnnuaireLogicielPage({
  searchParams,
}: AnnuaireLogicielPageProps) {
  const params = await searchParams;
  const initialCategory = getParamValue(params.categorie);
  const initialSector = getParamValue(params.secteur);
  const toolDirectoryMeta = await getUnifiedToolDirectoryMeta();
  const softwareDirectoryItems = toolDirectoryMeta.tools.map((tool) => ({
    ...tool,
    url: `/annuaire-logiciel/${getToolDirectorySlug(tool)}`,
  }));

  return (
    <>
      <Navbar />
      <main className="flex-1 w-full bg-background animate-in fade-in duration-700">
        <ToolDirectoryClient
          key={`${initialSector ?? "tous"}-${initialCategory ?? "tous"}`}
          title="Annuaire Logiciels"
          description="Les principaux logiciels utiles aux TPE, classés par secteur et usage."
          searchPlaceholder="Rechercher un logiciel, un usage, un secteur..."
          items={softwareDirectoryItems}
          sectors={toolDirectoryMeta.sectors}
          categories={toolDirectoryMeta.categories}
          initialCategory={initialCategory}
          initialSector={initialSector}
          hideTransverseOnSector
          externalLinks={false}
        />
      </main>
    </>
  );
}
