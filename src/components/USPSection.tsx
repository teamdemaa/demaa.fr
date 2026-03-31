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
    <div className="w-full max-w-6xl mx-auto mt-10 md:mt-12 animate-in fade-in slide-in-from-top-4 duration-700 delay-300">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-12 px-8">
        {usps.map((usp, i) => (
          <div key={i} className="flex flex-col items-center text-center space-y-3 group md:flex-row md:text-left md:space-y-0 md:space-x-5 md:justify-center">
            <div className="flex-none w-12 h-12 md:w-11 md:h-11 rounded-full bg-white shadow-md border border-brand-coral/15 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <usp.icon className="w-6 h-6 md:w-5 md:h-5 text-brand-coral" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm md:text-sm font-bold text-brand-blue uppercase tracking-widest leading-none">
                {usp.text}
              </span>
              <span className="text-[10px] md:text-xs text-gray-400 font-light mt-1.5 uppercase tracking-tight max-w-[200px]">
                {usp.subtext}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
