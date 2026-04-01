"use client";

import { useState, useRef, useEffect } from "react";
import { QRCodeSVG } from "qrcode.react";
import Navbar from "@/components/Navbar";
import { Copy, Download, Upload, Trash2, Smartphone, Monitor, Share2 } from "lucide-react";
import { toPng, toJpeg, toSvg } from "html-to-image";

export default function QRCodeGenerator() {
  const [url, setUrl] = useState("https://demaa.fr");
  const [title, setTitle] = useState("Scannez moi !");
  const [fgColor, setFgColor] = useState("#191b30"); // Brand Blue
  const [bgColor, setBgColor] = useState("#FFFFFF");
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [qrSize, setQrSize] = useState(240);
  const [isExporting, setIsExporting] = useState(false);
  
  const cardRef = useRef<HTMLDivElement>(null);
  const qrRef = useRef<SVGSVGElement>(null);

  // Handle Logo Upload
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const exportCard = async (format: 'png' | 'jpeg' | 'svg') => {
    if (!cardRef.current) return;
    setIsExporting(true);
    
    try {
      let dataUrl = "";
      if (format === 'png') {
        dataUrl = await toPng(cardRef.current, { cacheBust: true, pixelRatio: 3 });
      } else if (format === 'jpeg') {
        dataUrl = await toJpeg(cardRef.current, { cacheBust: true, quality: 0.95, pixelRatio: 3 });
      } else {
        dataUrl = await toSvg(cardRef.current, { cacheBust: true });
      }
      
      const link = document.createElement("a");
      link.download = `demaa-qrcode-${format}.${format}`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Export failed", err);
    } finally {
      setIsExporting(false);
    }
  };

  const shareQRCode = async () => {
    if (!cardRef.current) return;
    try {
      const dataUrl = await toPng(cardRef.current, { cacheBust: true, pixelRatio: 2 });
      const blob = await (await fetch(dataUrl)).blob();
      const file = new File([blob], 'qrcode-demaa.png', { type: 'image/png' });
      
      if (navigator.share && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: 'Mon QR Code Demaa',
          text: 'Généré sur Demaa.fr'
        });
      } else {
        // Fallback: Copy link
        navigator.clipboard.writeText(url);
        alert("Lien copié ! (Partage de fichier non supporté sur ce navigateur)");
      }
    } catch (err) {
      console.error("Share failed", err);
    }
  };

  return (
    <div className="h-screen bg-[#FFF9F8] flex flex-col overflow-hidden">
      <Navbar />
      
      <main className="flex-1 flex flex-col md:flex-row w-full overflow-hidden">
        
        {/* LEFT PANE: CONFIGURATION */}
        <div className="w-full md:w-[45%] pl-12 md:pl-24 lg:pl-40 pr-6 flex flex-col justify-center space-y-7 md:border-r border-brand-coral/5">
          <div className="space-y-2">
            <h1 className="text-2xl md:text-3xl font-bold text-brand-blue tracking-tight">
              Générateur de <span className="text-brand-coral">QR Code</span>
            </h1>
            <p className="text-gray-500 text-xs md:text-sm leading-relaxed max-w-sm">
              Personnalisé, professionnel et permanent.
            </p>
          </div>

          <div className="space-y-6">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-blue/30 ml-1">Lien de destination</label>
              <input 
                type="url" 
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://votre-site.com"
                className="w-full px-5 py-3 bg-white border-2 border-brand-coral/5 rounded-xl focus:border-brand-coral/30 focus:ring-4 focus:ring-brand-coral/5 outline-none transition-all text-brand-blue font-medium text-sm shadow-sm"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-blue/30 ml-1">Message (Titre)</label>
              <input 
                type="text" 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: Scannez moi !"
                className="w-full px-5 py-3 bg-white border-2 border-brand-coral/5 rounded-xl focus:border-brand-coral/30 focus:ring-4 focus:ring-brand-coral/5 outline-none transition-all text-brand-blue font-medium text-sm shadow-sm"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-blue/30 ml-1">Logo au centre</label>
              <div className="flex items-center gap-3">
                <label className="flex-1 flex items-center justify-center gap-2 px-5 py-3 border-2 border-dashed border-brand-coral/10 rounded-xl cursor-pointer hover:bg-white hover:border-brand-coral/20 transition-all group">
                  <Upload className="w-4 h-4 text-gray-300 group-hover:text-brand-coral" />
                  <span className="text-xs font-semibold text-gray-400 group-hover:text-brand-blue">Image facultative</span>
                  <input type="file" className="hidden" accept="image/*" onChange={handleLogoUpload} />
                </label>
                {logoUrl && (
                  <button onClick={() => setLogoUrl(null)} className="p-3 bg-red-50 text-red-500 rounded-xl hover:bg-red-100 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-blue/30 ml-1">Couleur</label>
                <div className="flex gap-2">
                  <input type="color" value={fgColor} onChange={(e) => setFgColor(e.target.value)} className="w-9 h-9 rounded-lg cursor-pointer border-none p-0 overflow-hidden shrink-0 shadow-sm" />
                  <div className="px-2 py-1 bg-white border border-brand-coral/10 rounded-lg text-[9px] font-bold text-brand-blue flex-1 flex items-center uppercase tracking-tighter shadow-sm">{fgColor}</div>
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-blue/30 ml-1">Fond</label>
                <div className="flex gap-2">
                  <input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)} className="w-9 h-9 rounded-lg cursor-pointer border-none p-0 overflow-hidden shrink-0 shadow-sm" />
                  <div className="px-2 py-1 bg-white border border-brand-coral/10 rounded-lg text-[9px] font-bold text-brand-blue flex-1 flex items-center uppercase tracking-tighter shadow-sm">{bgColor}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT PANE: LIVE PREVIEW */}
        <div className="flex-1 bg-white md:bg-transparent flex flex-col items-center justify-center p-4 md:p-8 pr-12 md:pr-24 lg:pr-40 relative">
          
          <div className="scale-[0.8] md:scale-[0.9] lg:scale-100 transition-transform origin-center">
            {/* THIS IS THE EXPORTABLE CARD */}
            <div 
              ref={cardRef}
              className="bg-white rounded-[2rem] p-8 md:p-12 shadow-[0_20px_50px_rgba(10,29,54,0.06)] flex flex-col items-center space-y-8 animate-in fade-in zoom-in-95 duration-500"
            >
              <div className="relative p-5 rounded-[1.5rem] bg-white shadow-sm border border-gray-50 flex items-center justify-center">
                <QRCodeSVG
                  ref={qrRef}
                  value={url}
                  size={qrSize}
                  fgColor={fgColor}
                  bgColor={bgColor}
                  level="H"
                  imageSettings={logoUrl ? { src: logoUrl, x: undefined, y: undefined, height: 48, width: 48, excavate: true } : undefined}
                />
              </div>

              <div className="text-center space-y-1.5">
                <h2 className="text-xl md:text-2xl font-bold text-brand-blue">{title || "Scannez moi !"}</h2>
                <p className="text-gray-400 text-[10px] md:text-xs font-medium truncate max-w-[200px]">{url}</p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="w-full max-w-[320px] md:max-w-[400px] mt-6 md:mt-8 space-y-3 px-4">
            <div className="grid grid-cols-3 gap-2">
              <button onClick={() => exportCard('jpeg')} className="flex flex-col items-center justify-center py-2.5 bg-brand-blue text-white rounded-xl text-[10px] font-bold hover:bg-brand-blue/90 shadow-lg shadow-brand-blue/10 transition-all active:scale-95">
                <Download className="w-3.5 h-3.5 mb-1" />
                JPEG
              </button>
              <button onClick={() => exportCard('png')} className="flex flex-col items-center justify-center py-2.5 border-2 border-brand-blue text-brand-blue rounded-xl text-[10px] font-bold hover:bg-brand-blue/5 transition-all active:scale-95">
                <Download className="w-3.5 h-3.5 mb-1" />
                PNG
              </button>
              <button onClick={() => exportCard('svg')} className="flex flex-col items-center justify-center py-2.5 border-2 border-brand-blue text-brand-blue rounded-xl text-[10px] font-bold hover:bg-brand-blue/5 transition-all active:scale-95">
                <Monitor className="w-3.5 h-3.5 mb-1" />
                SVG
              </button>
            </div>
            
            <button onClick={shareQRCode} className="w-full flex items-center justify-center gap-2 py-3 bg-gray-50 text-brand-blue rounded-xl text-xs font-bold hover:bg-gray-100 transition-all group">
              <Share2 className="w-4 h-4 text-gray-400 group-hover:text-brand-blue transition-colors" />
              <span>Partager le QR Code</span>
            </button>
          </div>
        </div>
      </main>

      <style jsx global>{`
        body { overflow: hidden; }
      `}</style>
    </div>
  );
}
