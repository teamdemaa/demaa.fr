"use client";

import { useState, useRef } from "react";
import Navbar from "@/components/Navbar";
import { 
  Download, 
  RotateCw, 
  Square, 
  Circle, 
  Type, 
  MapPin, 
  Building2, 
  Hash, 
  Palette,
  CheckCircle2
} from "lucide-react";
import { toPng, toSvg } from "html-to-image";

export default function StampGenerator() {
  const [name, setName] = useState("Demaa Plomberie");
  const [siret, setSiret] = useState("123 456 789 00010");
  const [address, setAddress] = useState("123 Rue de Paris, 75001");
  const [capital, setCapital] = useState("SARL au capital de 5 000 €");
  const [type, setType] = useState<"circle" | "rect">("rect");
  const [color, setColor] = useState("#191b30"); // Demaa Blue by default
  const [isExporting, setIsExporting] = useState(false);
  
  const stampRef = useRef<HTMLDivElement>(null);

  const colors = [
    { name: "Bleu Demaa", hex: "#191b30" },
    { name: "Rouge", hex: "#e53935" },
    { name: "Noir", hex: "#000000" },
    { name: "Vert", hex: "#2e7d32" },
  ];

  const exportStamp = async (format: 'png' | 'svg') => {
    if (!stampRef.current) return;
    setIsExporting(true);
    try {
      let dataUrl = "";
      if (format === 'png') {
        dataUrl = await toPng(stampRef.current, { cacheBust: true, pixelRatio: 4, backgroundColor: 'transparent' });
      } else {
        dataUrl = await toSvg(stampRef.current, { cacheBust: true });
      }
      const link = document.createElement("a");
      link.download = `tampon-demaa-${format}.${format}`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Export failed", err);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="min-h-screen md:h-screen bg-[#FFF9F8] flex flex-col overflow-y-auto md:overflow-hidden">
      <Navbar />
      
      <main className="flex-1 flex flex-col md:flex-row w-full overflow-y-auto md:overflow-hidden">
        
        {/* LEFT PANE: CONFIGURATION */}
        <div className="w-full md:w-[45%] pl-12 md:pl-24 lg:pl-40 pr-6 flex flex-col justify-center space-y-7 md:border-r border-brand-coral/5 overflow-y-auto no-scrollbar py-12">
          <div className="space-y-2">
            <h1 className="text-2xl md:text-3xl font-bold text-brand-blue tracking-tight">
              Génération de <span className="text-brand-coral">Tampon Pro</span>
            </h1>
            <p className="text-gray-500 text-xs md:text-sm leading-relaxed max-w-sm">
              Créez votre cachet commercial officiel en quelques secondes. 
            </p>
          </div>

          <div className="space-y-5">
            {/* Stamp Type */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-blue/30 ml-1">Forme du tampon</label>
              <div className="flex gap-3">
                <button 
                  onClick={() => setType("circle")}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border-2 transition-all ${type === "circle" ? "border-brand-coral bg-brand-coral/5 text-brand-coral" : "border-gray-50 bg-white text-gray-400 hover:border-gray-100"}`}
                >
                  <Circle className="w-4 h-4" />
                  <span className="text-xs font-bold uppercase tracking-tight">Circulaire</span>
                </button>
                <button 
                  onClick={() => setType("rect")}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border-2 transition-all ${type === "rect" ? "border-brand-coral bg-brand-coral/5 text-brand-coral" : "border-gray-50 bg-white text-gray-400 hover:border-gray-100"}`}
                >
                  <Square className="w-4 h-4" />
                  <span className="text-xs font-bold uppercase tracking-tight">Rectangulaire</span>
                </button>
              </div>
            </div>

            {/* Inputs */}
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-blue/30 ml-1">Nom de l&apos;entreprise</label>
                <div className="relative">
                  <Type className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                  <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="demaa-input demaa-input-with-icon" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-blue/30 ml-1">Informations Légales (Capital/Statut)</label>
                <div className="relative">
                  <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                  <input type="text" value={capital} onChange={(e) => setCapital(e.target.value)} className="demaa-input demaa-input-with-icon" />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-blue/30 ml-1">SIRET / SIREN</label>
                  <div className="relative">
                    <Hash className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                    <input type="text" value={siret} onChange={(e) => setSiret(e.target.value)} className="demaa-input demaa-input-with-icon" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-blue/30 ml-1">Adresse</label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                    <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} className="demaa-input demaa-input-with-icon" />
                  </div>
                </div>
              </div>
            </div>

            {/* Colors */}
            <div className="space-y-2.5">
              <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-blue/30 ml-1 flex items-center gap-2">
                <Palette className="w-3 h-3 text-gray-300" /> Couleur de l&apos;encre
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
                {/* Custom Color Picker */}
                <div className="relative flex items-center gap-2 ml-2 pl-4 border-l border-gray-100">
                  <input 
                    type="color" 
                    value={color} 
                    onChange={(e) => setColor(e.target.value)}
                    className="w-10 h-10 rounded-full border-4 border-white cursor-pointer shadow-sm overflow-hidden p-0"
                  />
                  <span className="text-[9px] font-bold text-gray-300 uppercase">{color}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT PANE: LIVE PREVIEW */}
        <div className="flex-1 bg-white md:bg-transparent flex flex-col items-center justify-center p-4 md:p-8 pr-12 md:pr-24 lg:pr-40 relative">
          
          <div className="scale-[0.7] sm:scale-[0.8] md:scale-[1] transition-transform origin-center">
            {/* STAMP CONTAINER */}
            <div 
              ref={stampRef}
              className="relative p-12 bg-transparent flex items-center justify-center select-none"
            >
              {type === "circle" ? (
                <svg width="320" height="320" viewBox="0 0 320 320" className="animate-in fade-in zoom-in-95 duration-500 overflow-visible">
                  {/* Outer Circles */}
                  <circle cx="160" cy="160" r="145" fill="none" stroke={color} strokeWidth="4" />
                  <circle cx="160" cy="160" r="135" fill="none" stroke={color} strokeWidth="1" strokeDasharray="4 4" />
                  <circle cx="160" cy="160" r="95" fill="none" stroke={color} strokeWidth="2.5" />
                  
                  {/* Paths for text */}
                  <path id="circlePathName" d="M 160, 160 m -120, 0 a 120,120 0 1,1 240,0 a 120,120 0 1,1 -240,0" fill="none" />
                  <path id="circlePathAddress" d="M 160, 160 m -112, 0 a 112,112 0 1,0 224,0 a 112,112 0 1,0 -224,0" fill="none" />
                  
                  <text fill={color} className="font-bold text-[18px] uppercase tracking-[0.1em]">
                    <textPath xlinkHref="#circlePathName" startOffset="50%" textAnchor="middle">
                      {name}
                    </textPath>
                  </text>
                  
                  <text fill={color} className="font-medium text-[11px] uppercase tracking-[0.1em]">
                    <textPath xlinkHref="#circlePathAddress" startOffset="50%" textAnchor="middle">
                      {address}
                    </textPath>
                  </text>

                  {/* Inner Content */}
                  <foreignObject x="85" y="115" width="150" height="90">
                    <div className="w-full h-full flex flex-col items-center justify-center text-center space-y-1 p-2">
                      <p className="text-[10px] font-bold leading-tight" style={{ color }}>{siret}</p>
                      <div className="w-10 h-[1px]" style={{ backgroundColor: color }} />
                      <p className="text-[9px] font-medium leading-tight opacity-90" style={{ color }}>{capital}</p>
                    </div>
                  </foreignObject>
                </svg>
              ) : (
                <div className="w-[420px] h-[240px] border-[5px] rounded-sm p-4 flex flex-col items-center justify-center animate-in fade-in zoom-in-95 duration-500" style={{ borderColor: color }}>
                  <div className="w-full h-full border-2 p-6 flex flex-col items-center justify-center space-y-4" style={{ borderColor: color }}>
                    <div className="text-center space-y-2">
                       <h2 className="text-3xl font-black uppercase tracking-tighter" style={{ color }}>{name}</h2>
                       <div className="h-1 w-24 mx-auto" style={{ backgroundColor: color }} />
                    </div>
                    <div className="space-y-1 text-center">
                      <p className="text-sm font-bold uppercase" style={{ color }}>{capital}</p>
                      <p className="text-xs font-medium uppercase" style={{ color }}>SIRET : {siret}</p>
                      <p className="text-xs font-medium uppercase opacity-80" style={{ color }}>{address}</p>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Subtle Grunge Effect (Overlay) */}
              <div className="absolute inset-0 pointer-events-none opacity-20 mix-blend-overlay grayscale contrast-125" 
                   style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }} />
            </div>
          </div>

          {/* EXPORT ACTIONS */}
          <div className="w-full max-w-[320px] md:max-w-[400px] mt-10 md:mt-12 space-y-4 px-4 overflow-visible">
            <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={() => exportStamp('png')} 
                disabled={isExporting}
                className="flex items-center justify-center gap-2 py-4 bg-brand-blue text-white rounded-2xl text-[11px] font-bold hover:bg-brand-blue/90 shadow-xl shadow-brand-blue/20 transition-all active:scale-95 disabled:opacity-50"
              >
                <Download className="w-4 h-4" />
                {isExporting ? "Chargement..." : "TÉLÉCHARGER (PNG)"}
              </button>
              <button 
                onClick={() => exportStamp('svg')} 
                disabled={isExporting}
                className="flex items-center justify-center gap-2 py-4 border-2 border-brand-blue text-brand-blue rounded-2xl text-[11px] font-bold hover:bg-brand-blue/5 transition-all active:scale-95 disabled:opacity-50"
              >
                <RotateCw className="w-4 h-4" />
                DÉTAILS VECTORIELS (SVG)
              </button>
            </div>
            
            <div className="flex items-center gap-3 p-4 bg-white/50 backdrop-blur-sm rounded-xl border border-brand-coral/10">
              <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
              <p className="text-[10px] text-brand-blue/60 leading-relaxed italic">
                <strong>Format Pro :</strong> Le PNG possède un fond transparent, idéal pour signer vos devis et factures numériques.
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
