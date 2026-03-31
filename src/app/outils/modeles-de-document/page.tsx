import Navbar from "@/components/Navbar";
import { templatesData } from "@/lib/templates";
import TemplateCard from "@/components/TemplateCard";

export const metadata = {
  title: "Modèles de Documents Gratuits - Demaa",
  description: "Téléchargez nos modèles exclusifs pour structurer votre TPE : obligations légales, suivi financier et systèmes opérationnels. Des ressources prêtes à l'emploi pour gagner du temps."
};

export default function TemplatesPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1 w-full bg-background min-h-screen pb-24">
        {/* Hero Section */}
        <section className="w-full flex flex-col items-center justify-center pt-10 pb-12 md:pt-16 md:pb-16 px-4 text-center bg-[#FFF9F8] border-b border-brand-coral/10">
          <div className="inline-flex items-center px-3 py-1 bg-brand-coral/10 text-brand-coral text-[10px] font-bold uppercase tracking-widest rounded-full mb-6">
            Ressources téléchargeables
          </div>
          <h1 className="text-3xl md:text-5xl lg:text-5xl font-bold tracking-tight text-brand-blue mb-4 leading-tight max-w-4xl mx-auto z-10 relative">
            Nos modèles de <span className="text-brand-coral">documents</span>
          </h1>
          <p className="text-sm md:text-lg text-gray-500 max-w-2xl mx-auto font-medium leading-relaxed px-4">
            Gagnez des heures de travail avec nos modèles structurés et prêts à l'emploi pour la gestion quotidienne de votre entreprise.
          </p>
        </section>

        {/* Content Section */}
        <div className="mt-12 md:mt-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
          {/* Header for list */}
          <div className="flex items-center justify-between mb-10 border-b border-gray-50 pb-6">
            <h2 className="text-lg font-bold text-brand-blue flex items-center gap-2">
              <span className="w-2 h-2 bg-brand-coral rounded-full"></span>
              Modèles essentiels (3)
            </h2>
            <div className="hidden md:flex gap-1 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              Lien externe <svg className="w-3 h-3 translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
            </div>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
            {templatesData.map(template => (
              <TemplateCard 
                key={template.id} 
                template={template} 
              />
            ))}
          </div>

          {/* Help Footer */}
          <div className="mt-20 p-8 md:p-12 bg-brand-blue/5 rounded-[2.5rem] border border-brand-blue/5 text-center">
            <h3 className="text-xl font-bold text-brand-blue mb-4">Besoin d'un modèle spécifique ?</h3>
            <p className="text-gray-500 text-sm max-w-lg mx-auto mb-8">
              Nous ajoutons régulièrement de nouvelles ressources. N'hésitez pas à nous suggérer des outils qui pourraient vous aider.
            </p>
            <a 
               href="mailto:contact@demaa.fr" 
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
