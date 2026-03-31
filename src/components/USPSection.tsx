import { Zap, MessageCircle, ShieldCheck } from "lucide-react";

export default function USPSection() {
  const usps = [
    {
      icon: Zap,
      text: "Demande simplifiée",
      subtext: "Adieu les formulaires interminables"
    },
    {
      icon: MessageCircle,
      text: "Suivi Direct",
      subtext: "Tout se passe sur WhatsApp"
    },
    {
      icon: ShieldCheck,
      text: "Vrai Conseil",
      subtext: "Pas juste de la prestation"
    }
  ];

  return (
    <div className="w-full max-w-6xl mx-auto mt-6 md:mt-10 relative pb-2 animate-in fade-in slide-in-from-top-4 duration-700 delay-300 px-6">
      
      {/* DESKTOP VIEW: Stable 3-Column Grid */}
      <div className="hidden md:grid md:grid-cols-3 gap-12 px-8">
        {usps.map((usp, i) => (
          <div key={i} className="flex items-center space-x-4 justify-center group">
            <div className="flex-none w-10 h-10 rounded-full bg-white shadow-sm border border-brand-coral/15 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <usp.icon className="w-4.5 h-4.5 text-brand-coral" />
            </div>
            <div className="flex flex-col text-left">
              <span className="text-sm font-bold text-brand-blue uppercase tracking-widest leading-none">
                {usp.text}
              </span>
              <span className="text-xs text-gray-500 font-normal mt-1.5 leading-tight">
                {usp.subtext}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* MOBILE VIEW: Animated Infinite Marquee */}
      <div className="md:hidden relative">
        <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-[#FFF9F8] to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-[#FFF9F8] to-transparent z-10 pointer-events-none" />
        
        <div className="flex flex-row overflow-hidden w-max animate-marquee-slow">
          {/* Loop twice for infinite scroll */}
          {[1, 2].map((loop) => (
            <div key={loop} className="flex flex-row space-x-12 pr-12">
              {usps.map((usp, i) => (
                <div key={`${loop}-${i}`} className="flex items-center space-x-3.5 whitespace-nowrap">
                  <div className="flex-none w-9 h-9 rounded-full bg-white border border-brand-coral/15 flex items-center justify-center">
                    <usp.icon className="w-4.5 h-4.5 text-brand-coral" />
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="text-[11px] font-bold text-brand-blue uppercase tracking-widest leading-none">
                      {usp.text}
                    </span>
                    <span className="text-[10px] text-gray-500 font-normal mt-1 leading-tight">
                      {usp.subtext}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
