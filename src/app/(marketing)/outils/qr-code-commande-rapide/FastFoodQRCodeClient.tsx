"use client";

import { useState, useRef } from "react";
import FreeToolBackLink from "@/components/FreeToolBackLink";
import Navbar from "@/components/Navbar";
import { 
  Download, 
  Palette, 
  Type, 
  CheckCircle2,
  Zap,
  Clock,
  Store,
  ShoppingBag,
  CreditCard
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { toPng } from "html-to-image";

export default function FastFoodQRCode() {
  const [restaurantName, setRestaurantName] = useState("Mon établissement");
  const [orderUrl, setOrderUrl] = useState("https://demaa.fr/order-now");
  const [ctaText, setCtaText] = useState("Commandez ici");
  const [color, setColor] = useState("#141414");
  const [icon, setIcon] = useState<"time" | "order" | "payment">("time");
  const [isExporting, setIsExporting] = useState(false);
  
  const designRef = useRef<HTMLDivElement>(null);

  const exportAsPng = async () => {
    if (!designRef.current) return;
    setIsExporting(true);
    try {
      const dataUrl = await toPng(designRef.current, { cacheBust: true, pixelRatio: 4, backgroundColor: 'transparent' });
      const link = document.createElement("a");
      link.download = `commande-rapide-${restaurantName.toLowerCase().replace(/\s+/g, '-')}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Export failed", err);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#ffffff] flex flex-col text-[#141414]">
      <Navbar />
      <FreeToolBackLink />
      
      <main className="flex-1 flex flex-col md:flex-row w-full">
        
        {/* LEFT PANE: CONFIGURATION */}
        <div className="w-full md:w-[45%] pl-12 md:pl-24 lg:pl-40 pr-6 flex flex-col justify-center space-y-7 md:border-r border-brand-coral/5 py-12">
          <div className="space-y-2">
            <h1 className="text-2xl md:text-3xl font-bold text-brand-blue tracking-tight">
              Commande <span className="text-brand-coral">rapide</span>
            </h1>
            <p className="text-gray-500 text-xs md:text-sm leading-relaxed max-w-sm font-medium">
              Créez un QR code de commande clair pour vos clients.
            </p>
          </div>

          <div className="space-y-5">
            {/* Form Inputs */}
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-blue/30 ml-1">Nom de l&apos;établissement</label>
                <div className="relative">
                  <Store className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                  <input type="text" value={restaurantName} onChange={(e) => setRestaurantName(e.target.value)} className="demaa-input demaa-input-with-icon text-xs" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-blue/30 ml-1">Lien de commande / Paiement</label>
                <div className="relative">
                  <Zap className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                  <input type="text" value={orderUrl} onChange={(e) => setOrderUrl(e.target.value)} className="demaa-input demaa-input-with-icon text-xs" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-blue/30 ml-1">Appel à l&apos;action</label>
                <div className="relative">
                  <Type className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                  <input type="text" value={ctaText} onChange={(e) => setCtaText(e.target.value)} className="demaa-input demaa-input-with-icon text-xs" />
                </div>
              </div>
            </div>

            {/* Icon Picker */}
            <div className="space-y-2.5">
              <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-blue/30 ml-1">Icône</label>
              <div className="flex gap-3">
                <button onClick={() => setIcon("time")} className={`flex-1 flex items-center justify-center py-3 rounded-xl border-2 transition-all ${icon === "time" ? "border-brand-coral bg-neutral-100 text-neutral-700" : "border-white bg-white text-gray-400 opacity-60"}`}><Clock className="w-4 h-4" /></button>
                <button onClick={() => setIcon("order")} className={`flex-1 flex items-center justify-center py-3 rounded-xl border-2 transition-all ${icon === "order" ? "border-brand-coral bg-neutral-100 text-neutral-700" : "border-white bg-white text-gray-400 opacity-60"}`}><ShoppingBag className="w-4 h-4" /></button>
                <button onClick={() => setIcon("payment")} className={`flex-1 flex items-center justify-center py-3 rounded-xl border-2 transition-all ${icon === "payment" ? "border-brand-coral bg-neutral-100 text-neutral-700" : "border-white bg-white text-gray-400 opacity-60"}`}><CreditCard className="w-4 h-4" /></button>
              </div>
            </div>

            {/* Colors */}
            <div className="space-y-2.5">
              <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-blue/30 ml-1 flex items-center gap-2">
                <Palette className="w-3 h-3 text-gray-300" /> Couleur
              </label>
              <div className="flex items-center gap-3 rounded-xl border border-brand-coral/10 bg-white px-4 py-3 shadow-sm">
                <input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="h-9 w-9 shrink-0 cursor-pointer overflow-hidden rounded-lg border-none p-0 shadow-sm" />
                <span className="text-xs font-semibold uppercase tracking-[0.08em] text-brand-blue/45">{color}</span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT PANE: LIVE PREVIEW */}
        <div className="flex-1 bg-white md:bg-transparent flex flex-col items-center justify-center p-4 md:p-8 pr-6 md:pr-24 lg:pr-40 relative py-12 md:py-8">
          
          <div className="scale-[0.8] sm:scale-[0.85] md:scale-[1] transition-transform origin-center">
            {/* DESIGN CONTAINER (Export Target) */}
            <div 
              ref={designRef}
              className="bg-white rounded-[40px] shadow-[0_30px_100px_rgba(10,29,54,0.08)] border-4 p-12 w-[360px] h-[520px] flex flex-col items-center justify-between text-center relative overflow-hidden"
              style={{ borderColor: color }}
            >
               <div className="relative z-10 w-full">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full mb-4 bg-[#ffffff]" style={{ color }}>
                    {icon === "time" ? <Clock className="w-6 h-6" /> : icon === "order" ? <ShoppingBag className="w-6 h-6" /> : <CreditCard className="w-6 h-6" />}
                  </div>
                  <h2 className="text-2xl font-black uppercase tracking-tight mb-1" style={{ color }}>{restaurantName}</h2>
               </div>

               <div className="relative z-10 flex flex-col items-center gap-6 w-full">
                  <div className="p-4 bg-white rounded-3xl shadow-2xl border-4" style={{ borderColor: color }}>
                    <QRCodeSVG 
                      value={orderUrl}
                      size={180}
                      fgColor={color}
                      level="H"
                      includeMargin={false}
                    />
                  </div>
                  <div className="px-6 py-3 rounded-full shadow-lg" style={{ backgroundColor: color }}>
                    <p className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                       {ctaText}
                    </p>
                  </div>
               </div>

               <div className="relative z-10 space-y-2">
                  <p className="text-[12px] font-black tracking-[0.2em] uppercase" style={{ color }}>Demaa Commandes</p>
                  <p className="text-[10px] font-medium text-gray-400 opacity-60">Scannez maintenant</p>
               </div>
            </div>
          </div>

          <div className="w-full max-w-[360px] mt-10 md:mt-12 space-y-4 px-4">
            <button 
              onClick={exportAsPng}
              disabled={isExporting}
              className="w-full flex items-center justify-center gap-3 py-5 bg-brand-blue text-white rounded-3xl text-sm font-bold hover:bg-brand-blue/95 shadow-2xl shadow-brand-blue/20 transition-all active:scale-95 disabled:opacity-50"
            >
              <Download className="w-5 h-5" />
              {isExporting ? "Chargement..." : "TÉLÉCHARGER LE QR CODE (PNG)"}
            </button>
            
            <div className="flex items-center gap-3 p-4 bg-white/40 backdrop-blur-md rounded-2xl border border-brand-coral/10">
              <CheckCircle2 className="w-5 h-5 text-dema-forest shrink-0" />
              <p className="text-[11px] text-brand-blue/60 leading-relaxed italic">
                <strong>Prêt à imprimer :</strong> Idéal pour vos stickers, chevalets ou supports d&apos;accueil.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
