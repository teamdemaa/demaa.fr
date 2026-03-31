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
    <div className="w-full max-w-5xl mx-auto mt-8 md:mt-10 animate-in fade-in slide-in-from-top-4 duration-700 delay-300">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 px-4">
        {usps.map((usp, i) => (
          <div key={i} className="flex items-start md:items-center space-x-4 group">
            <div className="flex-none w-10 h-10 rounded-full bg-white shadow-sm border border-brand-coral/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <usp.icon className="w-5 h-5 text-brand-coral" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold text-brand-blue leading-tight uppercase tracking-wide">
                {usp.text}
              </span>
              <span className="text-[11px] md:text-xs text-gray-400 font-light mt-0.5 leading-snug">
                {usp.subtext}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
