import { ShieldCheck, Target, HeartHandshake } from "lucide-react";

export default function SocialProof() {
  return (
    <section className="w-full py-16 md:py-24 bg-brand-blue text-white overflow-hidden relative">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-brand-coral/5 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl opacity-20" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-brand-coral/10 rounded-full translate-x-1/3 translate-y-1/3 blur-3xl opacity-10" />

      <div className="max-w-5xl mx-auto px-6 relative z-10">
        <div className="flex flex-col items-center text-center">
          
          <div className="inline-flex items-center space-x-2 bg-white/10 px-4 py-2 rounded-full mb-8 backdrop-blur-sm border border-white/5">
            <ShieldCheck className="w-4 h-4 text-brand-coral" />
            <span className="text-xs font-bold uppercase tracking-widest text-white/90">Pourquoi nous choisir</span>
          </div>

          <h2 className="text-5xl md:text-7xl font-bold tracking-tight mb-6">
            + <span className="text-brand-coral">300</span> entrepreneurs
          </h2>
          <p className="text-xl md:text-2xl font-medium text-white/80 max-w-2xl leading-relaxed mb-10">
            accompagnés vers la réussite.
          </p>

          <div className="h-px w-24 bg-brand-coral/30 mb-10" />

          <p className="text-base md:text-lg text-white/70 max-w-3xl leading-relaxed font-light italic">
            "Parce que le quotidien d'un entrepreneur est un défi constant, surtout pour les petites structures, nous simplifions chaque étape complexe pour vous redonner le contrôle total sur votre avenir."
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16 w-full text-left">
            <div className="p-6 rounded-2xl bg-white/5 border border-white/5 backdrop-blur-sm">
              <Target className="w-6 h-6 text-brand-coral mb-4" />
              <h4 className="font-bold text-base mb-2 uppercase tracking-wide">Objectif Clair</h4>
              <p className="text-sm text-white/60 leading-relaxed">Simplifier l'administration pour libérer votre temps et votre créativité.</p>
            </div>
            <div className="p-6 rounded-2xl bg-white/5 border border-white/5 backdrop-blur-sm">
              <HeartHandshake className="w-6 h-6 text-brand-coral mb-4" />
              <h4 className="font-bold text-base mb-2 uppercase tracking-wide">Soutien Réel</h4>
              <p className="text-sm text-white/60 leading-relaxed">Un accompagnement humain, pas juste des outils froids.</p>
            </div>
            <div className="p-6 rounded-2xl bg-white/5 border border-white/5 backdrop-blur-sm">
              <ShieldCheck className="w-6 h-6 text-brand-coral mb-4" />
              <h4 className="font-bold text-base mb-2 uppercase tracking-wide">Sécurité Totale</h4>
              <p className="text-sm text-white/60 leading-relaxed">Des démarches conformes et sans surprises pour dormir sur vos deux oreilles.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
