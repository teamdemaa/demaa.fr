import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import ToolDirectoryClient from "@/components/ToolDirectoryClient";
import {
  freeToolsDirectory,
  freeToolsDirectoryCategories,
  freeToolsDirectorySectors,
} from "@/lib/free-tools-directory";
import {
  getToolDirectoryInitialFilters,
  type ToolDirectorySearchParams,
} from "@/lib/tool-directory-page";

export const metadata: Metadata = {
  title: "Outils Gratuits - Demaa",
  description:
    "Retrouvez les outils gratuits créés par Demaa pour générer un QR code, créer une signature email, signer un document et gagner du temps au quotidien.",
};

type OutilsGratuitsPageProps = {
  searchParams: ToolDirectorySearchParams;
};

export default async function OutilsGratuitsPage({
  searchParams,
}: OutilsGratuitsPageProps) {
  const { initialCategory, initialSector } = await getToolDirectoryInitialFilters(searchParams);

  return (
    <>
      <Navbar />
      <main className="flex-1 w-full bg-background animate-in fade-in duration-700">
        <ToolDirectoryClient
          key={`${initialSector ?? "tous"}-${initialCategory ?? "tous"}`}
          title="Outils Gratuits"
          description="Les outils gratuits créés par Demaa pour faire avancer l'activité plus vite."
          searchPlaceholder="Rechercher un outil gratuit, un usage, un secteur..."
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
