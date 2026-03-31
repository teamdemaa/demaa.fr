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
    <div className="w-full max-w-6xl mx-auto mt-8 md:mt-10 animate-in fade-in slide-in-from-top-4 duration-700 delay-300">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-16 px-8">
        {usps.map((usp, i) => (
          <div key={i} className="flex flex-col items-center text-center space-y-3 group md:flex-row md:text-left md:space-y-0 md:space-x-4 md:justify-center">
            <div className="flex-none w-11 h-11 md:w-10 md:h-10 rounded-full bg-white shadow-sm border border-brand-coral/15 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <usp.icon className="w-5 h-5 md:w-4.5 md:h-4.5 text-brand-coral" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs md:text-sm font-bold text-brand-blue uppercase tracking-widest leading-none">
                {usp.text}
              </span>
              <span className="text-[11px] md:text-xs text-gray-500 font-normal mt-1.5 leading-snug max-w-[200px]">
                {usp.subtext}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
