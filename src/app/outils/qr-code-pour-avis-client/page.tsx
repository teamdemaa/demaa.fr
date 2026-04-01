"use client";

import { useState, useRef, useEffect } from "react";
import { QRCodeSVG } from "qrcode.react";
import Navbar from "@/components/Navbar";
import { Upload, Trash2, Monitor, Share2, Download, Star, MapPin } from "lucide-react";
import { toPng, toJpeg, toSvg } from "html-to-image";

export default function CustomerReviewQRCode() {
  const [placeId, setPlaceId] = useState("");
  const [customUrl, setCustomUrl] = useState("https://g.page/r/YOUR_ID/review");
  const [title, setTitle] = useState("Notez-nous 5 étoiles !");
  const [fgColor, setFgColor] = useState("#191b30"); // Brand Blue
  const [starsColor, setStarsColor] = useState("#f39d66"); // Brand Coral
  const [bgColor, setBgColor] = useState("#FFFFFF");
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [qrSize, setQrSize] = useState(240);
  const [isExporting, setIsExporting] = useState(false);
  
  const cardRef = useRef<HTMLDivElement>(null);

  // Compute Review Link
  const fullUrl = placeId 
    ? `https://search.google.com/local/writereview?placeid=${placeId}` 
    : customUrl;

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
      link.download = `demaa-avis-client-${format}.${format}`;
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
      const file = new File([blob], 'avis-demaa.png', { type: 'image/png' });
      if (navigator.share && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: 'Mon QR Code Avis Client',
          text: 'Laissez-nous un avis sur Google !'
        });
      } else {
        navigator.clipboard.writeText(fullUrl);
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
              QR Code <span className="text-brand-coral">Avis Client</span>
            </h1>
            <p className="text-gray-500 text-xs md:text-sm leading-relaxed max-w-sm">
              Incitez vos clients à laisser un avis positif avec style.
            </p>
          </div>

          <div className="space-y-6">
            {/* Review Link Input */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-blue/30 ml-1">Lien Google Review ou Place ID</label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300">
                  <MapPin className="w-4 h-4" />
                </div>
                <input 
                  type="text" 
                  value={placeId || customUrl}
                  onChange={(e) => {
                    if (e.target.value.length < 30) setPlaceId(e.target.value);
                    else {
                      setPlaceId("");
                      setCustomUrl(e.target.value);
                    }
                  }}
                  placeholder="ID de fiche ou lien direct..."
                  className="w-full pl-11 pr-5 py-3 bg-white border-2 border-brand-coral/5 rounded-xl focus:border-brand-coral/30 outline-none transition-all text-brand-blue font-medium text-sm shadow-sm"
                />
              </div>
            </div>

            {/* Title / Incitation */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-blue/30 ml-1">Message d'incitation</label>
              <input 
                type="text" 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: Notez-nous 5 étoiles !"
                className="w-full px-5 py-3 bg-white border-2 border-brand-coral/5 rounded-xl focus:border-brand-coral/30 outline-none transition-all text-brand-blue font-medium text-sm shadow-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-blue/30 ml-1">Couleur QR</label>
                <div className="flex gap-2">
                  <input type="color" value={fgColor} onChange={(e) => setFgColor(e.target.value)} className="w-9 h-9 rounded-lg cursor-pointer border-none p-0 overflow-hidden shrink-0 shadow-sm" />
                  <div className="px-2 py-1 bg-white border border-brand-coral/10 rounded-lg text-[9px] font-bold text-brand-blue flex-1 flex items-center shadow-sm uppercase tracking-tighter">{fgColor}</div>
                </div>
              </div>
              
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-blue/30 ml-1">Couleur Étoiles</label>
                <div className="flex gap-2">
                  <input type="color" value={starsColor} onChange={(e) => setStarsColor(e.target.value)} className="w-9 h-9 rounded-lg cursor-pointer border-none p-0 overflow-hidden shrink-0 shadow-sm" />
                  <div className="px-2 py-1 bg-white border border-brand-coral/10 rounded-lg text-[9px] font-bold text-brand-blue flex-1 flex items-center shadow-sm uppercase tracking-tighter">{starsColor}</div>
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-blue/30 ml-1">Logo Central</label>
              <div className="flex gap-2">
                <label className="flex-1 flex items-center justify-center h-9 border-2 border-dashed border-brand-coral/10 rounded-lg cursor-pointer hover:bg-white transition-all group">
                  <Upload className="w-3.5 h-3.5 text-gray-300 group-hover:text-brand-coral" />
                  <input type="file" className="hidden" accept="image/*" onChange={handleLogoUpload} />
                </label>
                {logoUrl && (
                  <button onClick={() => setLogoUrl(null)} className="p-2.5 bg-red-50 text-red-500 rounded-lg hover:bg-red-100 transition-colors">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT PANE: LIVE PREVIEW */}
        <div className="flex-1 bg-white md:bg-transparent flex flex-col items-center justify-center p-4 md:p-8 pr-12 md:pr-24 lg:pr-40 relative">
          
          <div className="scale-[0.8] md:scale-[0.9] lg:scale-100 transition-transform origin-center">
            {/* THE CARD */}
            <div 
              ref={cardRef}
              className="bg-white rounded-[2rem] p-8 md:p-12 shadow-[0_20px_50px_rgba(10,29,54,0.06)] flex flex-col items-center space-y-8 animate-in fade-in zoom-in-95 duration-500"
            >
              {/* QR Code */}
              <div className="relative p-5 rounded-[1.5rem] bg-white shadow-sm border border-gray-50 flex items-center justify-center">
                <QRCodeSVG
                  value={fullUrl || "https://demaa.fr"}
                  size={qrSize}
                  fgColor={fgColor}
                  bgColor={bgColor}
                  level="H"
                  imageSettings={{ 
                    src: logoUrl || "https://img.icons8.com/color/96/star--v1.png", 
                    height: 48, 
                    width: 48, 
                    excavate: true 
                  }}
                />
              </div>

              <div className="text-center space-y-3">
                <div className="flex justify-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 shrink-0 transition-colors duration-300" style={{ color: starsColor, fill: starsColor }} />
                  ))}
                </div>
                <div className="space-y-1">
                  <h2 className="text-xl md:text-2xl font-bold text-brand-blue">{title || "Notez-nous 5 étoiles !"}</h2>
                  <p className="text-gray-400 text-[10px] md:text-xs font-medium truncate max-w-[200px]">{fullUrl.substring(0, 40)}...</p>
                </div>
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
              <span>Partager ce QR Code</span>
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
