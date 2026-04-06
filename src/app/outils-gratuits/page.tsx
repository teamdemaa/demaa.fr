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
            filterMode="tools-groups"
            initialTools={tools} 
            placeholder="Rechercher un outil spécifique..."
          />

          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
            <div className="mt-20 p-8 md:p-12 bg-brand-blue/5 rounded-[2.5rem] border border-brand-blue/5 text-center">
              <h2 className="text-xl font-bold text-brand-blue mb-4">
                Besoin d&apos;un outil spécifique ?
              </h2>
              <p className="text-gray-500 text-sm max-w-lg mx-auto mb-8">
                Nous ajoutons régulièrement de nouveaux outils. N&apos;hésitez pas à nous suggérer les ressources qui vous seraient utiles.
              </p>
              <a
                href="mailto:team@demaa.fr?subject=Suggestion%20d%27outil%20Demaa"
                className="inline-flex items-center px-6 py-3 bg-brand-blue text-white font-bold text-sm rounded-full hover:bg-brand-coral transition-colors shadow-lg active:scale-95"
              >
                Suggérer un outil
              </a>
            </div>
          </section>
        </div>
      </main>
    </>
  );
}
