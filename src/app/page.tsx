import Navbar from "@/components/Navbar";
import ToolDirectoryClient from "@/components/ToolDirectoryClient";
import {
  getToolDirectorySlug,
  toolDirectory,
  toolDirectoryCategories,
  toolDirectorySectors,
} from "@/lib/tool-directory";

export const metadata = {
  title: "Annuaire Logiciels - Demaa",
  description:
    "Découvrez les principaux logiciels utiles aux TPE, classés par secteur d'activité et catégorie : CRM, automatisation, finance, marketing et outils métier.",
};

type HomePageProps = {
  searchParams: Promise<{
    secteur?: string | string[];
    categorie?: string | string[];
  }>;
};

function getParamValue(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const params = await searchParams;
  const initialCategory = getParamValue(params.categorie);
  const initialSector = getParamValue(params.secteur);
  const softwareDirectoryItems = toolDirectory.map((tool) => ({
    ...tool,
    url: `/annuaire-logiciels/${getToolDirectorySlug(tool)}`,
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
          resultLabel="logiciels trouvés"
          items={softwareDirectoryItems}
          sectors={toolDirectorySectors}
          categories={toolDirectoryCategories}
          initialCategory={initialCategory}
          initialSector={initialSector}
          hideTransverseOnSector
          externalLinks={false}
        />
      </main>
    </>
  );
}
