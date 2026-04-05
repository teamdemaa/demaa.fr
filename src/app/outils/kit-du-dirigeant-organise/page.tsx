import Navbar from "@/components/Navbar";
import { templatesData } from "@/lib/templates";
import TemplateCard from "@/components/TemplateCard";

export const metadata = {
  title: "Le Kit du Dirigeant Organisé - Demaa",
  description:
    "Les documents essentiels pour cadrer votre activité, gagner du temps et organiser votre entreprise plus sereinement.",
};

export default function OrganizedLeaderKitPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1 w-full bg-background min-h-screen pb-24">
        <section className="w-full flex flex-col items-center justify-center pt-10 pb-12 md:pt-16 md:pb-16 px-4 text-center bg-[#FFF9F8] border-b border-brand-coral/10">
          <div className="inline-flex items-center px-3 py-1 bg-brand-coral/10 text-brand-coral text-[10px] font-bold uppercase tracking-widest rounded-full mb-6">
            Ressources téléchargeables
          </div>
          <h1 className="text-3xl md:text-5xl lg:text-5xl font-bold tracking-tight text-brand-blue mb-4 leading-tight max-w-4xl mx-auto z-10 relative">
            Le Kit du Dirigeant Organisé
          </h1>
          <p className="text-sm md:text-lg text-gray-500 max-w-2xl mx-auto font-medium leading-relaxed px-4">
            Les documents essentiels pour cadrer votre activité, gagner du temps et mieux vous organiser au quotidien.
          </p>
        </section>

        <div className="mt-12 md:mt-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
          <div className="flex items-center justify-between mb-10 border-b border-gray-50 pb-6">
            <h2 className="text-lg font-bold text-brand-blue flex items-center gap-2">
              <span className="w-2 h-2 bg-brand-coral rounded-full"></span>
              Ressources essentielles ({templatesData.length})
            </h2>
            <div className="hidden md:flex gap-1 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              Lien externe{" "}
              <svg className="w-3 h-3 translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                />
              </svg>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
            {templatesData.map((template) => (
              <TemplateCard key={template.id} template={template} />
            ))}
          </div>

          <div className="mt-20 p-8 md:p-12 bg-brand-blue/5 rounded-[2.5rem] border border-brand-blue/5 text-center">
            <h3 className="text-xl font-bold text-brand-blue mb-4">Besoin d&apos;un document spécifique ?</h3>
            <p className="text-gray-500 text-sm max-w-lg mx-auto mb-8">
              Nous ajoutons régulièrement de nouvelles ressources. N&apos;hésitez pas à nous suggérer les documents qui vous seraient utiles.
            </p>
            <a
              href="mailto:team@demaa.fr"
              className="inline-flex items-center px-6 py-3 bg-brand-blue text-white font-bold text-sm rounded-full hover:bg-brand-coral transition-colors shadow-lg active:scale-95"
            >
              Envoyer une suggestion
            </a>
          </div>
        </div>
      </main>
    </>
  );
}
