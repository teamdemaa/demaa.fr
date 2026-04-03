import { notFound } from "next/navigation";
import { getSystemBySlug, getSystems } from "@/lib/api";
import { Metadata } from "next";
import Navbar from "@/components/Navbar";
import * as Icons from "lucide-react";
import Link from "next/link";

export async function generateMetadata(
  props: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const params = await props.params;
  const system = await getSystemBySlug(params.slug);
  
  if (!system) return { title: "Système introuvable - Demaa" };

  return {
    title: `${system.name} - Demaa`,
    description: system.description,
  };
}

export async function generateStaticParams() {
  const systems = await getSystems();
  return systems.map((system) => ({
    slug: system.slug,
  }));
}

export default async function SystemDetailPage(
  props: { params: Promise<{ slug: string }> }
) {
  const params = await props.params;
  const system = await getSystemBySlug(params.slug);
  
  if (!system) {
    notFound();
  }

  // @ts-ignore
  const IconComponent = Icons[system.icon] || Icons.Settings2;

  return (
    <>
      <Navbar />
      <main className="flex-1 w-full bg-background min-h-screen pb-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 animate-in slide-in-from-bottom-4 duration-500">
          
          {/* Header Section */}
          <div className="flex flex-col mb-10 pb-10 border-b border-gray-100">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 bg-gray-50 border border-gray-100 rounded-2xl flex items-center justify-center shadow-sm">
                <IconComponent className="w-6 h-6 text-brand-blue" />
              </div>
              <span className="text-sm font-semibold text-brand-coral uppercase tracking-wider bg-brand-coral/10 px-3 py-1 rounded-full">
                Système Métier
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-brand-blue mb-4 leading-tight">
              {system.name}
            </h1>
            <p className="text-xl md:text-2xl font-medium text-brand-coral">
              {system.description}
            </p>
          </div>

          {/* Details Section (Airbnb Style Layout) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
            
            {/* Left Content */}
            <div className="md:col-span-2 space-y-10">
              <section>
                <h2 className="text-2xl font-semibold text-brand-blue mb-6">Le Problème</h2>
                <div className="prose text-gray-600 leading-relaxed text-lg">
                  <p>
                    Beaucoup d'entreprises dans le secteur {system.name.toLowerCase()} reposent encore entièrement sur le dirigeant ou sur des processus manuels qui ralentissent la croissance. 
                    L'absence de structure claire engendre souvent :
                  </p>
                  <ul className="list-disc pl-5 mt-4 space-y-2">
                    <li>Une perte de temps sur des tâches administratives répétitives</li>
                    <li>Un manque de visibilité sur les métriques clés de l'activité</li>
                    <li>Une difficulté à déléguer ou à scaler sereinement</li>
                  </ul>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-brand-blue mb-6">La Solution Demaa</h2>
                <div className="prose text-gray-600 leading-relaxed text-lg">
                  <p>
                    Nous construisons pour vous un système d'exploitation complet qui automatise la gestion de votre activité. 
                    Ce n'est pas juste un logiciel, c'est une méthode de travail structurée pour que votre entreprise performe et se libère de la dépendance humaine.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-brand-blue mb-6">Bénéfices concrets</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    "Libération de 10h+ par semaine",
                    "Zéro oubli dans le suivi client",
                    "Tableau de bord en temps réel",
                    "Structure prête à déléguer"
                  ].map((benefit, i) => (
                    <div key={i} className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                      <Icons.CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
                      <span className="text-brand-blue font-medium">{benefit}</span>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            {/* Right Sticky CTA */}
            <div className="md:col-span-1">
              <div className="sticky top-28 bg-white border border-gray-100 rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.06)]">
                 <div className="mb-6 pb-6 border-b border-gray-100">
                   <div className="text-sm font-medium text-gray-400 mb-1 uppercase tracking-tight">Investissement</div>
                   <span className="text-3xl font-bold text-brand-blue">Audit Gratuit</span>
                 </div>
                 
                 <h3 className="text-xl font-semibold text-brand-blue mb-3">Prêt à transformer votre entreprise ?</h3>
                 <p className="text-gray-500 text-sm mb-8 leading-relaxed">
                   Discutons de vos processus actuels pour identifier les leviers d'automatisation.
                 </p>
                 
                 <Link 
                   href="https://wa.me/33600000000" // Numéro placeholder
                   className="flex items-center justify-center gap-2 w-full py-4 bg-brand-blue text-white font-bold rounded-2xl hover:bg-brand-coral transition-all shadow-lg shadow-brand-blue/10"
                   target="_blank"
                 >
                   <Icons.MessageCircle className="w-5 h-5" />
                   Discuter sur WhatsApp
                 </Link>
              </div>
            </div>

          </div>

        </div>
      </main>
    </>
  );
}
