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
      <Navbar minimal={true} />
      <main className="flex-1 w-full bg-background min-h-screen pb-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 animate-in slide-in-from-bottom-4 duration-500">
          
          {/* Back Link */}
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 text-sm font-medium text-gray-400 hover:text-brand-coral transition-colors mb-8 group"
          >
            <Icons.ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Hub de ressources
          </Link>
          
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
            <div className="md:col-span-2 space-y-12">
              <section>
                <h2 className="text-2xl font-semibold text-brand-blue mb-6 italic">Pourquoi la plupart des entreprises stagnent ?</h2>
                <div className="prose text-gray-600 leading-relaxed text-lg">
                  <p>
                    Au début, tout repose sur l'énergie du dirigeant. Mais passé un certain stade, cette force devient une limite. 
                    Le problème n'est pas le manque de travail, mais l'absence de **structure réutilisable**. 
                  </p>
                  <p className="mt-4">
                    Pour une activité de type {system.name.toLowerCase()}, cela se manifeste souvent par :
                  </p>
                  <ul className="list-disc pl-5 mt-4 space-y-3">
                    <li>Une information éparpillée (emails, post-it, mémoire) qui crée des erreurs.</li>
                    <li>Un dirigeant qui doit tout valider, empêchant l'équipe d'être autonome.</li>
                    <li>L'impossibilité de prévoir la croissance car les processus sont flous.</li>
                  </ul>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-brand-blue mb-6">L'approche par "Systèmes"</h2>
                <div className="prose text-gray-600 leading-relaxed text-lg">
                  <p>
                    Un système, c'est l'infrastructure invisible qui fait tourner votre boîte sans vous. 
                    Notre rôle est de traduire votre expertise en processus clairs et automatisés. 
                  </p>
                  <p className="mt-4 italic border-l-4 border-brand-coral/20 pl-6 py-2">
                    "L'idée n'est pas de changer votre métier, mais d'automatiser tout ce qui ne demande pas votre génie créatif."
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-brand-blue mb-6">Résultats attendus</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    "Standardisation des opérations",
                    "Délégation facilitée (SOPs)",
                    "Données centralisées & fiables",
                    "Gain de clarté mentale"
                  ].map((benefit, i) => (
                    <div key={i} className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                      <Icons.CheckCircle2 className="w-5 h-5 text-brand-coral shrink-0" />
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
                   <div className="text-sm font-medium text-gray-400 mb-1 uppercase tracking-tight">État des lieux</div>
                   <span className="text-3xl font-bold text-brand-blue">Audit</span>
                   <div className="text-brand-coral font-bold mt-1">Offert</div>
                 </div>
                 
                 <h3 className="text-xl font-semibold text-brand-blue mb-3">Audit de 30 min</h3>
                 <p className="text-gray-500 text-sm mb-8 leading-relaxed">
                   Prenons 30 minutes pour faire un état des lieux de votre activité et comprendre ensemble les éléments clés de votre futur plan d'actions.
                 </p>
                 
                 <Link 
                   href="https://wa.me/33600000000"
                   className="flex items-center justify-center gap-2 w-full py-4 bg-brand-blue text-white font-medium text-sm rounded-2xl hover:bg-brand-coral transition-all shadow-lg shadow-brand-blue/10 group"
                   target="_blank"
                 >
                   <Icons.MessageCircle className="w-5 h-5" />
                   Demander un Audit
                 </Link>
              </div>
            </div>

          </div>

        </div>
      </main>
    </>
  );
}
