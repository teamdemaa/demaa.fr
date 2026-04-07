import Navbar from "@/components/Navbar";
import ToolDirectoryClient from "@/components/ToolDirectoryClient";

export const metadata = {
  title: "Annuaire Outils - Demaa",
  description:
    "Découvrez les principaux outils utiles aux TPE, classés par secteur d'activité et catégorie : CRM, automatisation, finance, marketing et outils métier.",
};

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

  return (
    <>
      <Navbar />
      <main className="flex-1 w-full bg-background animate-in fade-in duration-700">
        <ToolDirectoryClient
          key={`${initialSector ?? "tous"}-${initialCategory ?? "tous"}`}
          initialCategory={initialCategory}
          initialSector={initialSector}
        />
      </main>
    </>
  );
}
