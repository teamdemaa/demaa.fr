"use client";

import { useState, useRef } from "react";
import FreeToolBackLink from "@/components/FreeToolBackLink";
import Navbar from "@/components/Navbar";
import { 
  Download, 
  Palette, 
  Calendar, 
  User, 
  Briefcase,
  FileText,
  ShieldCheck
} from "lucide-react";
import { toPng } from "html-to-image";

export default function SignDocument() {
  const [fullName, setFullName] = useState("Alexandre Martin");
  const [role, setRole] = useState("Président-Directeur Général");
  const [date, setDate] = useState(new Date().toLocaleDateString('fr-FR'));
  const [inkColor, setInkColor] = useState("#141414");
  const [isExporting, setIsExporting] = useState(false);
  
  const signatureRef = useRef<HTMLDivElement>(null);

  const exportSignature = async () => {
    if (!signatureRef.current) return;
    setIsExporting(true);
    try {
      const dataUrl = await toPng(signatureRef.current, { cacheBust: true, pixelRatio: 4, backgroundColor: 'transparent' });
      const link = document.createElement("a");
      link.download = `signature-electronique-${fullName.toLowerCase().replace(/\s+/g, '-')}.png`;
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
              Signature <span className="text-brand-coral">digitale</span>
            </h1>
            <p className="text-gray-500 text-xs md:text-sm leading-relaxed max-w-sm font-medium">
              Créez votre griffe de signature électronique pour vos contrats et devis PDF.
            </p>
          </div>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-blue/30 ml-1">Nom du signataire</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} className="demaa-input demaa-input-with-icon text-xs" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-blue/30 ml-1">Fonction / Titre</label>
              <div className="relative">
                <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                <input type="text" value={role} onChange={(e) => setRole(e.target.value)} className="demaa-input demaa-input-with-icon text-xs" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-blue/30 ml-1">Date de signature</label>
              <div className="relative">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                <input type="text" value={date} onChange={(e) => setDate(e.target.value)} className="demaa-input demaa-input-with-icon text-xs" />
              </div>
            </div>

            <div className="space-y-2.5 pt-2">
              <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-blue/30 ml-1 flex items-center gap-2">
                <Palette className="w-3 h-3 text-gray-300" /> Couleur de l&apos;encre
              </label>
              <div className="flex items-center gap-3 rounded-xl border border-brand-coral/10 bg-white px-4 py-3 shadow-sm">
                <input
                  type="color"
                  value={inkColor}
                  onChange={(e) => setInkColor(e.target.value)}
                  className="h-9 w-9 shrink-0 cursor-pointer overflow-hidden rounded-lg border-none p-0 shadow-sm"
                />
                <span className="text-xs font-semibold uppercase tracking-[0.08em] text-brand-blue/45">{inkColor}</span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT PANE: LIVE PREVIEW */}
        <div className="flex-1 bg-white md:bg-transparent flex flex-col items-center justify-center p-4 md:p-8 pr-6 md:pr-24 lg:pr-40 relative py-12 md:py-8">
          
          <div className="w-full max-w-lg scale-[0.8] sm:scale-[0.9] md:scale-[1] transition-transform origin-center">
            {/* SIGNATURE STAMP (Export Target) */}
            <div 
              ref={signatureRef}
              className="bg-white/10 p-8 md:p-12 w-full min-h-[220px] flex flex-col items-start justify-center relative overflow-hidden group select-none"
            >
               {/* Reference lines (not exported if transparent, but here for UI) */}
               <div className="w-full border-b-2 border-[#141414]/10 mb-6 italic text-[10px] text-gray-300 uppercase tracking-widest">Zone de signature certifiée</div>
               
               <div className="space-y-1 relative z-10">
                  <div 
                    className="text-4xl md:text-5xl lg:text-6xl mb-4 italic tracking-wide" 
                    style={{ color: inkColor, fontFamily: "'Brush Script MT', cursive, sans-serif" }}
                  >
                    {fullName}
                  </div>
                  <div className="space-y-0.5 border-t-2 pt-4" style={{ borderColor: `${inkColor}20` }}>
                    <p className="text-[11px] font-black uppercase tracking-widest" style={{ color: inkColor }}>Signé numériquement par {fullName}</p>
                    <p className="text-[10px] font-bold opacity-60 uppercase" style={{ color: inkColor }}>{role}</p>
                    <p className="text-[9px] font-medium opacity-40 uppercase" style={{ color: inkColor }}>Le {date}</p>
                  </div>
               </div>

               {/* Security Badge (Overlay) */}
               <div className="absolute right-8 top-1/2 -translate-y-1/2 opacity-[0.05]" style={{ color: inkColor }}>
                 <ShieldCheck className="w-32 h-32" />
               </div>
            </div>
          </div>

          <div className="w-full max-w-[400px] mt-10 md:mt-12 space-y-4 px-4 overflow-visible">
            <button 
              onClick={exportSignature}
              disabled={isExporting}
              className="w-full flex items-center justify-center gap-3 py-5 bg-brand-blue text-white rounded-3xl text-sm font-bold hover:bg-brand-blue/95 shadow-2xl shadow-brand-blue/20 transition-all active:scale-95 disabled:opacity-50"
            >
              <Download className="w-5 h-5" />
              {isExporting ? "Génération..." : "TÉLÉCHARGER LA SIGNATURE (PNG)"}
            </button>
            
            <div className="flex items-center gap-3 p-4 bg-white/40 backdrop-blur-md rounded-2xl border border-brand-coral/10">
              <FileText className="w-5 h-5 text-brand-coral shrink-0" />
              <p className="text-[11px] text-brand-blue/60 leading-relaxed italic">
                <strong>Utilisation :</strong> Insérez ce fichier PNG transparent sur vos devis et factures PDF pour une signature professionnelle instantanée.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
