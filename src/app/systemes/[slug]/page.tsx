import { getSystemBySlug, getSystems } from "@/lib/api";
import { notFound } from "next/navigation";
import Navbar from "@/components/Navbar";
import { 
  CheckCircle2, 
  ArrowRight, 
  Zap, 
  ShieldCheck, 
  TrendingUp,
  Search,
  Settings2,
  Rocket
} from "lucide-react";
import Link from "next/link";
import * as Icons from "lucide-react";

export async function generateStaticParams() {
  const systems = await getSystems();
  return systems.map((system) => ({
    slug: system.slug,
  }));
}

export default async function SystemPage({ params }: { params: any }) {
  // Dual-handling params for Next.js 15/16 compatibility
  const resolvedParams = await params;
  const slug = resolvedParams?.slug;
  
  if (!slug) {
    notFound();
  }

  const system = await getSystemBySlug(slug);

  if (!system) {
    notFound();
  }

  // @ts-ignore
  const IconComponent = Icons[system.icon] || Icons.Box;

  return (
    <div className="min-h-screen bg-white">
      <Navbar minimal={true} />
      
      {/* Hero Section */}
      <section className="pt-24 pb-16 px-4 md:pt-32 md:pb-24 bg-[#FFF9F8] border-b border-brand-blue/5">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-brand-coral/10 rounded-full text-brand-coral text-xs font-black uppercase tracking-widest mb-16 animate-in fade-in zoom-in duration-700">
            <IconComponent className="w-4 h-4" />
            Système pour : {system.name}
          </div>
          
          <h1 className="text-4xl md:text-6xl font-black text-brand-blue tracking-tight leading-[1.1] mb-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            Booster la croissance de votre <span className="text-brand-coral">{system.name}</span>
          </h1>
          
          <p className="text-lg md:text-xl text-gray-500 font-medium leading-relaxed max-w-2xl mx-auto mb-10 animate-in fade-in slide-in-from-bottom-6 duration-700">
            Mettez en place une structure solide pour que votre entreprise ne dépende plus uniquement de vous et performe en automatique.
          </p>

          <Link 
            href="https://wa.me/33600000000" // Replace with real WhatsApp or modal trigger
            className="inline-flex items-center gap-3 px-10 py-5 bg-brand-blue text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-brand-coral transition-all hover:scale-105 shadow-xl shadow-brand-blue/10 group animate-in fade-in slide-in-from-bottom-8 duration-700"
          >
            Demander mon audit gratuit
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </section>

      {/* The 3 Phases Section */}
      <section className="py-24 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-3xl md:text-4xl font-black text-brand-blue tracking-tight mb-4">La Méthode Demaa en 3 Étapes</h2>
            <div className="h-1.5 w-24 bg-brand-coral mx-auto rounded-full" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
            {/* Phase 01 */}
            <div className="relative p-10 bg-gray-50 rounded-[3rem] border border-gray-100 hover:border-brand-coral/20 transition-all group">
              <div className="absolute -top-6 left-10 w-14 h-14 bg-brand-blue rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-lg">
                01
              </div>
              <div className="mb-8 pt-4">
                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center mb-6 shadow-sm group-hover:bg-brand-coral/5 transition-colors">
                  <Search className="w-6 h-6 text-brand-blue group-hover:text-brand-coral transition-colors" />
                </div>
                <h3 className="text-xl font-black text-brand-blue mb-4 tracking-tight">Phase 01 : Clarté</h3>
                <p className="text-gray-500 font-medium leading-relaxed italic border-l-2 border-brand-coral/30 pl-4 py-1">
                  "Voir clairement ce qui existe & comprendre avant d'agir"
                </p>
              </div>
              <ul className="space-y-4">
                <li className="flex items-start gap-3 text-sm font-medium text-gray-500">
                  <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                  Audit complet de vos processus actuels
                </li>
                <li className="flex items-start gap-3 text-sm font-medium text-gray-500">
                  <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                  Identification des goulots d'étranglement
                </li>
                <li className="flex items-start gap-3 text-sm font-medium text-gray-500">
                  <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                  Mapping de votre parcours client idéal
                </li>
              </ul>
            </div>

            {/* Phase 02 */}
            <div className="relative p-10 bg-gray-50 rounded-[3rem] border border-gray-100 hover:border-brand-coral/20 transition-all group">
              <div className="absolute -top-6 left-10 w-14 h-14 bg-brand-blue rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-lg">
                02
              </div>
              <div className="mb-8 pt-4">
                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center mb-6 shadow-sm group-hover:bg-brand-coral/5 transition-colors">
                  <Settings2 className="w-6 h-6 text-brand-blue group-hover:text-brand-coral transition-colors" />
                </div>
                <h3 className="text-xl font-black text-brand-blue mb-4 tracking-tight">Phase 02 : Structure</h3>
                <p className="text-gray-500 font-medium leading-relaxed italic border-l-2 border-brand-coral/30 pl-4 py-1">
                  "Construire les systèmes qui font tourner l'entreprise"
                </p>
              </div>
              <ul className="space-y-4">
                <li className="flex items-start gap-3 text-sm font-medium text-gray-500">
                  <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                  Mise en place d'un CRM et d'outils de gestion
                </li>
                <li className="flex items-start gap-3 text-sm font-medium text-gray-500">
                  <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                  Automatisation des tâches répétitives
                </li>
                <li className="flex items-start gap-3 text-sm font-medium text-gray-500">
                  <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                  Rédaction de vos manuels opératoires (SOP)
                </li>
              </ul>
            </div>

            {/* Phase 03 */}
            <div className="relative p-10 bg-gray-50 rounded-[3rem] border border-gray-100 hover:border-brand-coral/20 transition-all group">
              <div className="absolute -top-6 left-10 w-14 h-14 bg-brand-blue rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-lg">
                03
              </div>
              <div className="mb-8 pt-4">
                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center mb-6 shadow-sm group-hover:bg-brand-coral/5 transition-colors">
                  <Rocket className="w-6 h-6 text-brand-blue group-hover:text-brand-coral transition-colors" />
                </div>
                <h3 className="text-xl font-black text-brand-blue mb-4 tracking-tight">Phase 03 — Piloter</h3>
                <p className="text-gray-500 font-medium leading-relaxed italic border-l-2 border-brand-coral/30 pl-4 py-1">
                  "Se libérer du quotidien pour piloter la croissance"
                </p>
              </div>
              <ul className="space-y-4">
                <li className="flex items-start gap-3 text-sm font-medium text-gray-500">
                  <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                  Suivi de vos KPIs via un tableau de bord
                </li>
                <li className="flex items-start gap-3 text-sm font-medium text-gray-500">
                  <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                  Management par les systèmes et non par l'urgence
                </li>
                <li className="flex items-start gap-3 text-sm font-medium text-gray-500">
                  <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                  Focus exclusif sur la stratégie et le développement
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="py-24 px-4 bg-brand-blue overflow-hidden relative">
        {/* Background elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand-coral/10 rounded-full blur-[100px] -mr-48 -mt-48" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/5 rounded-full blur-[100px] -ml-48 -mb-48" />

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight mb-8">Prêt à transformer votre entreprise ?</h2>
          <p className="text-white/60 text-lg md:text-xl font-medium mb-12 max-w-2xl mx-auto">
            Discutons ensemble de vos systèmes actuels et identifions les leviers pour passer à l'étape supérieure.
          </p>
          <Link 
            href="#" 
            className="inline-flex items-center gap-3 px-10 py-5 bg-brand-coral text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-white hover:text-brand-blue transition-all hover:scale-105 shadow-2xl shadow-black/20 group"
          >
            Demander mon audit gratuit
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </section>
    </div>
  );
}
