"use client";

import { useState, useRef } from "react";
import Navbar from "@/components/Navbar";
import { 
  UtensilsCrossed, 
  Wine, 
  Coffee, 
  Download, 
  ExternalLink, 
  Palette, 
  Type, 
  ChefHat,
  Smartphone,
  CheckCircle2
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { toPng } from "html-to-image";

export default function MenuQRCode() {
  const [restaurantName, setRestaurantName] = useState("Le Petit Bistro");
  const [menuUrl, setMenuUrl] = useState("https://demaa.fr/menu-exemple");
  const [ctaText, setCtaText] = useState("Scannez pour la carte");
  const [color, setColor] = useState("#191b30"); // Demaa Blue by default
  const [icon, setIcon] = useState<"dish" | "wine" | "coffee">("dish");
  const [isExporting, setIsExporting] = useState(false);
  
  const designRef = useRef<HTMLDivElement>(null);

  const colors = [
    { name: "Bleu Demaa", hex: "#191b30" },
    { name: "Vert Olive", hex: "#556b2f" },
    { name: "Terracotta", hex: "#e2725b" },
    { name: "Noir Profond", hex: "#000000" },
  ];

  const exportAsPng = async () => {
    if (!designRef.current) return;
    setIsExporting(true);
    try {
      const dataUrl = await toPng(designRef.current, { cacheBust: true, pixelRatio: 4, backgroundColor: 'transparent' });
      const link = document.createElement("a");
      link.download = `menu-qr-${restaurantName.toLowerCase().replace(/\s+/g, '-')}.png`;
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
              Menu <span className="text-brand-coral">QR Code</span>
            </h1>
            <p className="text-gray-500 text-xs md:text-sm leading-relaxed max-w-sm font-medium">
              Générez un support de table professionnel pour votre carte numérique. 
            </p>
          </div>

          <div className="space-y-5">
            {/* Form Inputs */}
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-blue/30 ml-1">Nom de l&apos;établissement</label>
                <div className="relative">
                  <ChefHat className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                  <input type="text" value={restaurantName} onChange={(e) => setRestaurantName(e.target.value)} className="demaa-input demaa-input-with-icon text-xs" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-blue/30 ml-1">Lien du Menu (URL ou PDF)</label>
                <div className="relative">
                  <ExternalLink className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                  <input type="text" value={menuUrl} onChange={(e) => setMenuUrl(e.target.value)} className="demaa-input demaa-input-with-icon text-xs" />
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
              <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-blue/30 ml-1">Icône au centre</label>
              <div className="flex gap-3">
                <button onClick={() => setIcon("dish")} className={`flex-1 flex items-center justify-center py-3 rounded-xl border-2 transition-all ${icon === "dish" ? "border-brand-coral bg-brand-coral/5 text-brand-coral" : "border-white bg-white text-gray-400 opacity-60"}`}><UtensilsCrossed className="w-4 h-4" /></button>
                <button onClick={() => setIcon("wine")} className={`flex-1 flex items-center justify-center py-3 rounded-xl border-2 transition-all ${icon === "wine" ? "border-brand-coral bg-brand-coral/5 text-brand-coral" : "border-white bg-white text-gray-400 opacity-60"}`}><Wine className="w-4 h-4" /></button>
                <button onClick={() => setIcon("coffee")} className={`flex-1 flex items-center justify-center py-3 rounded-xl border-2 transition-all ${icon === "coffee" ? "border-brand-coral bg-brand-coral/5 text-brand-coral" : "border-white bg-white text-gray-400 opacity-60"}`}><Coffee className="w-4 h-4" /></button>
              </div>
            </div>

            {/* Colors */}
            <div className="space-y-2.5">
              <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-blue/30 ml-1 flex items-center gap-2">
                <Palette className="w-3 h-3 text-gray-300" /> Thème graphique
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
              className="bg-white rounded-[40px] shadow-[0_30px_100px_rgba(10,29,54,0.08)] border border-brand-coral/10 p-12 w-[380px] h-[520px] flex flex-col items-center justify-between text-center relative overflow-hidden"
            >
               {/* Pattern Background */}
               <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: `radial-gradient(${color} 1px, transparent 1px)`, backgroundSize: '16px 16px' }} />
               
               <div className="relative z-10 w-full">
                  <h2 className="text-2xl font-black uppercase tracking-tight mb-1" style={{ color }}>{restaurantName}</h2>
                  <div className="h-1 w-12 mx-auto rounded-full" style={{ backgroundColor: color }} />
               </div>

               <div className="relative z-10 flex flex-col items-center gap-4">
                  <div className="p-4 bg-white rounded-3xl shadow-xl border-2" style={{ borderColor: `${color}10` }}>
                    <QRCodeSVG 
                      value={menuUrl}
                      size={180}
                      fgColor={color}
                      level="H"
                      includeMargin={false}
                      imageSettings={{
                        src: icon === "dish" ? "https://api.iconify.design/lucide:utensils-crossed.svg?color=" + encodeURIComponent(color) : icon === "wine" ? "https://api.iconify.design/lucide:wine.svg?color=" + encodeURIComponent(color) : "https://api.iconify.design/lucide:coffee.svg?color=" + encodeURIComponent(color),
                        x: undefined, y: undefined, height: 35, width: 35, excavate: true,
                      }}
                    />
                  </div>
                  <p className="text-[13px] font-bold uppercase tracking-widest flex items-center gap-2" style={{ color }}>
                    <Smartphone className="w-4 h-4 opacity-50" /> {ctaText}
                  </p>
               </div>

               <div className="relative z-10 space-y-4">
                  <p className="text-[10px] font-bold text-gray-300 tracking-[0.2em] uppercase">Propulsé par Demaa.fr</p>
               </div>
            </div>
          </div>

          <div className="w-full max-w-[380px] mt-10 md:mt-12 space-y-4">
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
                <strong>Prêt pour impression :</strong> Fond transparent et haute définition. Idéal pour vos stickers de table ou chevalets.
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
