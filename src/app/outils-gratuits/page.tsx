import Navbar from "@/components/Navbar";
import ToolDirectoryClient from "@/components/ToolDirectoryClient";

export const metadata = {
  title: "Annuaire Outils - Demaa",
  description: "Découvrez les principaux outils utiles aux TPE, classés par secteur d'activité et catégorie : CRM, automatisation, finance, marketing et outils métier.",
};

export default async function OutilsGratuitsPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1 w-full bg-background animate-in fade-in duration-700">
        <ToolDirectoryClient />
      </main>
    </>
  );
}
