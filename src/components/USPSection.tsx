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
    <div className="w-full max-w-6xl mx-auto mt-6 md:mt-10 relative group overflow-hidden animate-in fade-in slide-in-from-top-4 duration-700 delay-300">
      {/* Scroll indicator fades for mobile indicator only if manual scroll possible, but here it's automatic */}
      <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-[#FFF9F8] via-[#FFF9F8]/60 to-transparent z-10 pointer-events-none md:hidden" />
      <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-[#FFF9F8] via-[#FFF9F8]/60 to-transparent z-10 pointer-events-none md:hidden" />

      {/* Marquee container */}
      <div className="flex flex-row md:grid md:grid-cols-3 gap-6 md:gap-16 px-6 md:px-8 w-max md:w-full animate-marquee-slow md:animate-none">
        {/* First set of items */}
        {usps.map((usp, i) => (
          <div 
            key={`first-${i}`} 
            className="flex-none w-[260px] md:w-auto flex items-center space-x-3.5 group md:justify-center bg-white/40 md:bg-transparent p-3 md:p-0 rounded-2xl border border-brand-coral/5 md:border-none shadow-sm md:shadow-none mr-2 md:mr-0"
          >
            <div className="flex-none w-9 h-9 rounded-full bg-white shadow-sm border border-brand-coral/15 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <usp.icon className="w-4.5 h-4.5 text-brand-coral" />
            </div>
            <div className="flex flex-col text-left">
              <span className="text-[11px] md:text-sm font-bold text-brand-blue uppercase tracking-widest leading-none">
                {usp.text}
              </span>
              <span className="text-[10px] md:text-xs text-gray-500 font-normal mt-1 leading-tight whitespace-nowrap">
                {usp.subtext}
              </span>
            </div>
          </div>
        ))}
        
        {/* Duplicate set of items for seamless loop (mobile only) */}
        {usps.map((usp, i) => (
          <div 
            key={`second-${i}`} 
            className="flex-none w-[260px] md:hidden flex items-center space-x-3.5 group bg-white/40 p-3 rounded-2xl border border-brand-coral/5 shadow-sm mr-2"
          >
            <div className="flex-none w-9 h-9 rounded-full bg-white shadow-sm border border-brand-coral/15 flex items-center justify-center">
              <usp.icon className="w-4.5 h-4.5 text-brand-coral" />
            </div>
            <div className="flex flex-col text-left">
              <span className="text-[11px] font-bold text-brand-blue uppercase tracking-widest leading-none">
                {usp.text}
              </span>
              <span className="text-[10px] text-gray-500 font-normal mt-1 leading-tight whitespace-nowrap">
                {usp.subtext}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
