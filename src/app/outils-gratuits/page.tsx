import Navbar from "@/components/Navbar";
import ToolDirectoryClient from "@/components/ToolDirectoryClient";
import {
  freeToolsDirectory,
  freeToolsDirectoryCategories,
  freeToolsDirectorySectors,
} from "@/lib/free-tools-directory";

export const metadata = {
  title: "Outils Gratuits - Demaa",
  description:
    "Retrouvez les outils gratuits créés par Demaa pour générer un QR code, créer une signature email, signer un document et gagner du temps au quotidien.",
};

type OutilsGratuitsPageProps = {
  searchParams: Promise<{
    secteur?: string | string[];
    categorie?: string | string[];
  }>;
};

function getParamValue(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function OutilsGratuitsPage({
  searchParams,
}: OutilsGratuitsPageProps) {
  const params = await searchParams;
  const initialCategory = getParamValue(params.categorie);
  const initialSector = getParamValue(params.secteur);

  return (
    <>
      <Navbar />
      <main className="flex-1 w-full bg-background animate-in fade-in duration-700">
        <ToolDirectoryClient
          key={`${initialSector ?? "tous"}-${initialCategory ?? "tous"}`}
          title="Outils Gratuits"
          description="Les outils gratuits créés par Demaa pour faire avancer l'activité plus vite."
          searchPlaceholder="Rechercher un outil gratuit, un usage, un secteur..."
          resultLabel="outils gratuits trouvés"
          items={freeToolsDirectory}
          sectors={freeToolsDirectorySectors}
          categories={freeToolsDirectoryCategories}
          initialCategory={initialCategory}
          initialSector={initialSector}
          hideTransverseOnSector={false}
          externalLinks={false}
        />
      </main>
    </>
  );
}
