import { getTools } from "@/lib/api";
import Navbar from "@/components/Navbar";
import HomeToolsClient from "@/components/HomeToolsClient";

export const metadata = {
  title: "Outils Gratuits - Demaa",
  description: "Accédez à notre bibliothèque d'outils gratuits pour optimiser votre entreprise : QR codes, modèles, et bien plus.",
};

export default async function OutilsGratuitsPage() {
  const tools = await getTools();

  return (
    <>
      <Navbar />
      <main className="flex-1 w-full bg-background animate-in fade-in duration-700">
        <div className="pb-16">
          <HomeToolsClient 
            title={
              <h1 className="text-4xl md:text-5xl font-black text-brand-blue tracking-tight">
                Outils Gratuits
              </h1>
            }
            subtitle="Une sélection d'outils pragmatiques pour automatiser vos tâches quotidiennes sans frais."
            initialTools={tools} 
            placeholder="Rechercher un outil spécifique..."
          />
        </div>
      </main>
    </>
  );
}
