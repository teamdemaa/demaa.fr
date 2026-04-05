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

          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
            <div className="rounded-[2.5rem] border border-brand-blue/10 bg-white px-6 py-16 md:px-12 md:py-20 text-center shadow-[0_20px_60px_rgba(10,29,54,0.04)]">
              <h2 className="text-2xl md:text-4xl font-black tracking-tight text-brand-blue">
                Besoin d&apos;un outil spécifique ?
              </h2>
              <p className="mt-5 max-w-3xl mx-auto text-sm md:text-lg text-gray-500 leading-relaxed">
                Nous ajoutons régulièrement de nouveaux outils. Suggérez-nous un besoin concret, et nous verrons comment le transformer en ressource utile pour les petites entreprises.
              </p>
              <a
                href="mailto:team@demaa.fr?subject=Suggestion%20d%27outil%20Demaa"
                className="mt-10 inline-flex items-center justify-center rounded-full bg-brand-blue px-8 py-4 text-sm font-bold text-white shadow-[0_14px_30px_rgba(25,27,48,0.16)] transition-colors hover:bg-brand-blue/95 active:scale-[0.98]"
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
