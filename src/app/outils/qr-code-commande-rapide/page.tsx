"use client";

import { useState, useRef } from "react";
import Navbar from "@/components/Navbar";
import { 
  Utensils, 
  Pizza, 
  Download, 
  Palette, 
  Type, 
  CheckCircle2,
  Zap,
  Clock,
  Beef
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { toPng } from "html-to-image";

export default function FastFoodQRCode() {
  const [restaurantName, setRestaurantName] = useState("Big Burger Fast");
  const [orderUrl, setOrderUrl] = useState("https://demaa.fr/order-now");
  const [ctaText, setCtaText] = useState("Éviter la file : Commandez ici !");
  const [color, setColor] = useState("#e53935"); // Fast Food Red by default
  const [icon, setIcon] = useState<"burger" | "pizza" | "fries">("burger");
  const [isExporting, setIsExporting] = useState(false);
  
  const designRef = useRef<HTMLDivElement>(null);

  const colors = [
    { name: "Rouge Ketchup", hex: "#e53935" },
    { name: "Jaune Moutarde", hex: "#ffb300" },
    { name: "Vert Frais", hex: "#43a047" },
    { name: "Noir Charbon", hex: "#212121" },
  ];

  const exportAsPng = async () => {
    if (!designRef.current) return;
    setIsExporting(true);
    try {
      const dataUrl = await toPng(designRef.current, { cacheBust: true, pixelRatio: 4, backgroundColor: 'transparent' });
      const link = document.createElement("a");
      link.download = `fastfood-qr-${restaurantName.toLowerCase().replace(/\s+/g, '-')}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Export failed", err);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="min-h-screen md:h-screen bg-[#FFF9F8] flex flex-col overflow-y-auto md:overflow-hidden text-[#191b30]">
      <Navbar />
      
      <main className="flex-1 flex flex-col md:flex-row w-full overflow-y-auto md:overflow-hidden">
        
        {/* LEFT PANE: CONFIGURATION */}
        <div className="w-full md:w-[45%] pl-12 md:pl-24 lg:pl-40 pr-6 flex flex-col justify-center space-y-7 md:border-r border-brand-coral/5 py-12">
          <div className="space-y-2">
            <h1 className="text-2xl md:text-3xl font-bold text-brand-blue tracking-tight">
              Commande <span className="text-brand-coral">Rapide 🍟</span>
            </h1>
            <p className="text-gray-500 text-xs md:text-sm leading-relaxed max-w-sm font-medium">
              Boostez vos ventes Click & Collect avec un QR code de commande express.
            </p>
          </div>

          <div className="space-y-5">
            {/* Form Inputs */}
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-blue/30 ml-1">Nom du Fast-Food</label>
                <div className="relative">
                  <Beef className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
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
              <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-blue/30 ml-1">Icône Cuisine</label>
              <div className="flex gap-3">
                <button onClick={() => setIcon("burger")} className={`flex-1 flex items-center justify-center py-3 rounded-xl border-2 transition-all ${icon === "burger" ? "border-brand-coral bg-brand-coral/5 text-brand-coral" : "border-white bg-white text-gray-400 opacity-60"}`}><Clock className="w-4 h-4" /></button>
                <button onClick={() => setIcon("pizza")} className={`flex-1 flex items-center justify-center py-3 rounded-xl border-2 transition-all ${icon === "pizza" ? "border-brand-coral bg-brand-coral/5 text-brand-coral" : "border-white bg-white text-gray-400 opacity-60"}`}><Pizza className="w-4 h-4" /></button>
                <button onClick={() => setIcon("fries")} className={`flex-1 flex items-center justify-center py-3 rounded-xl border-2 transition-all ${icon === "fries" ? "border-brand-coral bg-brand-coral/5 text-brand-coral" : "border-white bg-white text-gray-400 opacity-60"}`}><Utensils className="w-4 h-4" /></button>
              </div>
            </div>

            {/* Colors */}
            <div className="space-y-2.5">
              <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-blue/30 ml-1 flex items-center gap-2">
                <Palette className="w-3 h-3 text-gray-300" /> Couleur Appétissante
              </label>
              <div className="flex items-center gap-3">
                {colors.map((c) => (
                  <button 
                    key={c.hex}
                    onClick={() => setColor(c.hex)}
                    className={`w-10 h-10 rounded-full border-4 transition-all ${color === c.hex ? "border-brand-coral scale-110 shadow-md" : "border-white"}`}
                    style={{ backgroundColor: c.hex }}
                    title={c.name}
                  />
                ))}
                <div className="relative flex items-center gap-2 ml-2 pl-4 border-l border-gray-100">
                  <input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="w-8 h-8 rounded-full border-4 border-white cursor-pointer shadow-sm overflow-hidden p-0" />
                </div>
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
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full mb-4 bg-[#FFF9F8]" style={{ color }}>
                    {icon === "burger" ? <Clock className="w-6 h-6" /> : icon === "pizza" ? <Pizza className="w-6 h-6" /> : <Utensils className="w-6 h-6" />}
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
              {isExporting ? "Chargement..." : "TÉLÉCHARGER LE SCANNER (PNG)"}
            </button>
            
            <div className="flex items-center gap-3 p-4 bg-white/40 backdrop-blur-md rounded-2xl border border-brand-coral/10">
              <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
              <p className="text-[11px] text-brand-blue/60 leading-relaxed italic">
                <strong>Boost de ventes :</strong> Idéal pour vos stickers de table, menu Click & Collect ou vitrine.
              </p>
            </div>
          </div>
        </div>
      </main>

      <style jsx global>{`
        @media (min-width: 768px) {
          body { overflow: hidden; }
        }
      `}</style>
    </div>
  );
}
