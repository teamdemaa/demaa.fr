"use client";

import { useState, useRef, useEffect } from "react";
import { QRCodeSVG } from "qrcode.react";
import Navbar from "@/components/Navbar";
import { Copy, Download, Upload, Trash2, Smartphone, Monitor } from "lucide-react";

export default function QRCodeGenerator() {
  const [url, setUrl] = useState("https://demaa.fr");
  const [title, setTitle] = useState("Scannez moi !");
  const [fgColor, setFgColor] = useState("#0A1D36"); // Brand Blue
  const [bgColor, setBgColor] = useState("#FFFFFF");
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [logoPadding, setLogoPadding] = useState(5);
  const [qrSize, setQrSize] = useState(256);
  const [copied, setCopied] = useState(false);
  
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

  // Download SVG
  const downloadSVG = () => {
    if (!qrRef.current) return;
    const svgData = new XMLSerializer().serializeToString(qrRef.current);
    const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
    const svgUrl = URL.createObjectURL(svgBlob);
    const downloadLink = document.createElement("a");
    downloadLink.href = svgUrl;
    downloadLink.download = `qrcode-${title.replace(/\s+/g, '-').toLowerCase()}.svg`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  };

  // Download PNG
  const downloadPNG = () => {
    if (!qrRef.current) return;
    const canvas = document.createElement("canvas");
    const svgData = new XMLSerializer().serializeToString(qrRef.current);
    const img = new Image();
    const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(svgBlob);

    img.onload = () => {
      canvas.width = qrSize * 4; // Higher resolution for print
      canvas.height = qrSize * 4;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        const pngUrl = canvas.toDataURL("image/png");
        const downloadLink = document.createElement("a");
        downloadLink.href = pngUrl;
        downloadLink.download = `qrcode-${title.replace(/\s+/g, '-').toLowerCase()}.png`;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
      }
      URL.revokeObjectURL(url);
    };
    img.src = url;
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#FFF9F8] flex flex-col">
      <Navbar />
      
      <main className="flex-1 flex flex-col md:flex-row max-w-[1440px] mx-auto w-full">
        
        {/* LEFT PANE: CONFIGURATION */}
        <div className="w-full md:w-[45%] p-6 md:p-12 lg:p-16 space-y-10 border-r border-brand-coral/5 overflow-y-auto max-h-[calc(100vh-80px)]">
          <div className="space-y-4">
            <h1 className="text-3xl md:text-4xl font-bold text-brand-blue tracking-tight">
              Générateur de <span className="text-brand-coral underline decoration-from-font underline-offset-4 decoration-brand-coral/30">QR Code</span>
            </h1>
            <p className="text-gray-500 text-sm md:text-base max-w-md leading-relaxed">
              Créez un QR code personnalisé, professionnel et qui n'expire jamais en quelques secondes.
            </p>
          </div>

          <div className="space-y-8">
            {/* Input: URL */}
            <div className="space-y-2.5">
              <label className="text-xs font-bold uppercase tracking-widest text-brand-blue/60 ml-1">Lien de destination</label>
              <div className="relative group">
                <input 
                  type="url" 
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://votre-site.com"
                  className="w-full px-5 py-4 bg-white border-2 border-brand-coral/10 rounded-2xl focus:border-brand-coral focus:ring-4 focus:ring-brand-coral/5 outline-none transition-all shadow-sm text-brand-blue font-medium"
                />
              </div>
            </div>

            {/* Input: Titre */}
            <div className="space-y-2.5">
              <label className="text-xs font-bold uppercase tracking-widest text-brand-blue/60 ml-1">Message optionnel</label>
              <input 
                type="text" 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: Scannez moi !"
                className="w-full px-5 py-4 bg-white border-2 border-brand-coral/10 rounded-2xl focus:border-brand-coral focus:ring-4 focus:ring-brand-coral/5 outline-none transition-all shadow-sm text-brand-blue font-medium"
              />
            </div>

            {/* Logo Upload */}
            <div className="space-y-2.5">
              <label className="text-xs font-bold uppercase tracking-widest text-brand-blue/60 ml-1">Logo au centre</label>
              <div className="flex items-center gap-4">
                <label className="flex-1 flex items-center justify-center gap-3 px-5 py-4 border-2 border-dashed border-brand-coral/20 rounded-2xl cursor-pointer hover:bg-white hover:border-brand-coral/40 transition-all group">
                  <Upload className="w-5 h-5 text-gray-400 group-hover:text-brand-coral" />
                  <span className="text-sm font-medium text-gray-500 group-hover:text-brand-blue">Ajouter une image</span>
                  <input type="file" className="hidden" accept="image/*" onChange={handleLogoUpload} />
                </label>
                {logoUrl && (
                  <button 
                    onClick={() => setLogoUrl(null)}
                    className="p-4 bg-red-50 text-red-500 rounded-2xl hover:bg-red-100 transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>

            {/* Colors */}
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2.5">
                <label className="text-xs font-bold uppercase tracking-widest text-brand-blue/60 ml-1">QR Color</label>
                <div className="flex gap-2">
                  <input 
                    type="color" 
                    value={fgColor}
                    onChange={(e) => setFgColor(e.target.value)}
                    className="w-12 h-12 rounded-xl cursor-pointer border-none p-0 overflow-hidden" 
                  />
                  <div className="px-3 py-2.5 bg-white border-2 border-brand-coral/10 rounded-xl text-sm font-bold text-brand-blue flex-1 flex items-center uppercase">
                    {fgColor}
                  </div>
                </div>
              </div>
              <div className="space-y-2.5">
                <label className="text-xs font-bold uppercase tracking-widest text-brand-blue/60 ml-1">Fond (BG)</label>
                <div className="flex gap-2">
                  <input 
                    type="color" 
                    value={bgColor}
                    onChange={(e) => setBgColor(e.target.value)}
                    className="w-12 h-12 rounded-xl cursor-pointer border-none p-0 overflow-hidden" 
                  />
                  <div className="px-3 py-2.5 bg-white border-2 border-brand-coral/10 rounded-xl text-sm font-bold text-brand-blue flex-1 flex items-center uppercase">
                    {bgColor}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT PANE: LIVE PREVIEW */}
        <div className="w-full md:w-[55%] bg-white md:bg-transparent flex items-center justify-center p-8 md:p-12 lg:p-20 relative">
          
          <div className="w-full max-w-sm lg:max-w-md bg-white rounded-[2.5rem] p-8 md:p-12 shadow-[0_20px_50px_rgba(10,29,54,0.08)] flex flex-col items-center space-y-10 animate-in fade-in zoom-in-95 duration-500">
            
            {/* The QR Code Wrapper */}
            <div className="relative group">
              {/* Outer glowing ring */}
              <div className="absolute -inset-4 bg-brand-coral/5 rounded-[2rem] blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
              
              <div className="relative bg-white p-6 rounded-[2rem] shadow-sm border border-gray-50 flex items-center justify-center">
                <QRCodeSVG
                  ref={qrRef}
                  value={url}
                  size={qrSize}
                  fgColor={fgColor}
                  bgColor={bgColor}
                  level="H" // High error correction to allow logo
                  imageSettings={logoUrl ? {
                    src: logoUrl,
                    x: undefined,
                    y: undefined,
                    height: 50,
                    width: 50,
                    excavate: true,
                  } : undefined}
                />
              </div>
            </div>

            {/* Description/Label */}
            <div className="text-center space-y-2">
              {title ? (
                <h2 className="text-2xl font-bold text-brand-blue">{title}</h2>
              ) : (
                <h2 className="text-xl font-bold text-gray-300 italic">Sans titre</h2>
              )}
              <p className="text-gray-400 text-sm font-medium truncate max-w-[250px]">{url}</p>
            </div>

            {/* Actions */}
            <div className="w-full space-y-4 pt-4">
              <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={downloadPNG}
                  className="flex items-center justify-center gap-2.5 px-6 py-4 bg-brand-blue text-white rounded-2xl font-bold hover:bg-brand-blue/90 shadow-lg shadow-brand-blue/20 transition-all active:scale-95"
                >
                  <Download className="w-5 h-5" />
                  <span>JPG/PNG</span>
                </button>
                <button 
                  onClick={downloadSVG}
                  className="flex items-center justify-center gap-2.5 px-6 py-4 border-2 border-brand-blue text-brand-blue rounded-2xl font-bold hover:bg-brand-blue/5 transition-all active:scale-95"
                >
                  <Monitor className="w-5 h-5" />
                  <span>SVG Pro</span>
                </button>
              </div>
              
              <button 
                onClick={copyToClipboard}
                className="w-full flex items-center justify-center gap-2.5 px-6 py-4 bg-gray-50 text-brand-blue rounded-2xl font-bold hover:bg-gray-100 transition-all group"
              >
                {copied ? (
                  <span className="text-green-600">Lien copié !</span>
                ) : (
                  <>
                    <Copy className="w-5 h-5 text-gray-400 group-hover:text-brand-blue transition-colors" />
                    <span>Partager le lien</span>
                  </>
                )}
              </button>
            </div>
          </div>
          
          {/* Subtle decoration/Badge */}
          <div className="hidden lg:flex absolute bottom-12 right-12 items-center gap-2 text-[10px] uppercase tracking-widest font-bold text-brand-blue/20">
            <Smartphone className="w-4 h-4" />
            Optimisé pour mobile-first
          </div>
        </div>
      </main>
      
      {/* Visual background elements */}
      <div className="fixed top-1/2 left-0 -translate-y-1/2 w-64 h-64 bg-brand-coral/5 rounded-full blur-[120px] pointer-events-none -z-10"></div>
      <div className="fixed bottom-0 right-0 w-96 h-96 bg-brand-blue/5 rounded-full blur-[150px] pointer-events-none -z-10"></div>
    </div>
  );
}
