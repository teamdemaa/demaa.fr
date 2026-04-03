"use client";

import { useState, useRef } from "react";
import Navbar from "@/components/Navbar";
import { 
  User, 
  Briefcase, 
  Phone, 
  Mail, 
  Globe, 
  MapPin, 
  Copy, 
  CheckCircle2, 
  ExternalLink,
  Share2,
  Pencil,
  Signature,
  Camera
} from "lucide-react";

export default function SignaturePro() {
  const [name, setName] = useState("Jean Dupont");
  const [title, setTitle] = useState("Directeur Commercial");
  const [company, setCompany] = useState("Demaa Plomberie");
  const [phone, setPhone] = useState("+33 6 12 34 56 78");
  const [email, setEmail] = useState("jean.dupont@demaa.fr");
  const [website, setWebsite] = useState("www.demaa.fr");
  const [address, setAddress] = useState("123 Rue de la République, 75001 Paris");
  const [linkedin, setLinkedin] = useState("");
  const [logo, setLogo] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  
  const signatureRef = useRef<HTMLDivElement>(null);

  const copyToClipboard = async () => {
    if (!signatureRef.current) return;
    
    // Create rich HTML content for clipboard
    const htmlContent = signatureRef.current.innerHTML;
    const textContent = signatureRef.current.innerText;

    try {
      const type = "text/html";
      const blob = new Blob([htmlContent], { type });
      const data = [new ClipboardItem({ [type]: blob, "text/plain": new Blob([textContent], { type: "text/plain" }) })];
      
      await navigator.clipboard.write(data);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy signature", err);
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogo(reader.result as string);
      };
      reader.readAsDataURL(file);
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
              Signature <span className="text-brand-coral">Mail Pro</span>
            </h1>
            <p className="text-gray-500 text-xs md:text-sm leading-relaxed max-w-sm font-medium">
              Créez une signature e-mail élégante et professionnelle en un clic. 
            </p>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-blue/30 ml-1">Nom complet</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                  <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full pl-11 pr-5 py-3 bg-white border-2 border-brand-coral/5 rounded-xl focus:border-brand-coral/30 outline-none text-xs font-semibold shadow-sm" />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-blue/30 ml-1">Poste occupé</label>
                <div className="relative">
                  <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                  <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full pl-11 pr-5 py-3 bg-white border-2 border-brand-coral/5 rounded-xl focus:border-brand-coral/30 outline-none text-xs font-semibold shadow-sm" />
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-blue/30 ml-1">Nom de l'entreprise</label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-coral font-black text-[10px] flex items-center justify-center border border-brand-coral rounded-sm italic">D</div>
                <input type="text" value={company} onChange={(e) => setCompany(e.target.value)} className="w-full pl-11 pr-5 py-3 bg-white border-2 border-brand-coral/5 rounded-xl focus:border-brand-coral/30 outline-none text-xs font-semibold shadow-sm" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-blue/30 ml-1">Téléphone</label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                  <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full pl-11 pr-5 py-3 bg-white border-2 border-brand-coral/5 rounded-xl focus:border-brand-coral/30 outline-none text-xs font-semibold shadow-sm" />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-blue/30 ml-1">Email pro</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full pl-11 pr-5 py-3 bg-white border-2 border-brand-coral/5 rounded-xl focus:border-brand-coral/30 outline-none text-xs font-semibold shadow-sm" />
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-blue/30 ml-1">Adresse physique</label>
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} className="w-full pl-11 pr-5 py-3 bg-white border-2 border-brand-coral/5 rounded-xl focus:border-brand-coral/30 outline-none text-xs font-semibold shadow-sm" />
              </div>
            </div>

            <div className="space-y-1.5 pt-2">
              <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-blue/30 ml-1">Logo / Image (Optionnel)</label>
              <div className="flex items-center gap-4">
                <label className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-white border-2 border-dashed border-brand-coral/20 rounded-xl hover:border-brand-coral/40 cursor-pointer transition-all">
                  <Camera className="w-4 h-4 text-brand-coral" />
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-tight">Charger une image</span>
                  <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                </label>
                {logo && (
                  <button onClick={() => setLogo(null)} className="w-10 h-10 flex items-center justify-center text-red-500 bg-red-50 rounded-xl hover:bg-red-100 transition-colors">
                    <CheckCircle2 className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT PANE: LIVE PREVIEW */}
        <div className="flex-1 bg-white md:bg-transparent flex flex-col items-center justify-center p-4 md:p-8 pr-6 md:pr-24 lg:pr-40 relative py-12 md:py-8">
          
          <div className="w-full max-w-lg animate-in fade-in zoom-in-95 duration-500">
            {/* PREVIEW CARD */}
            <div className="bg-white rounded-3xl shadow-[0_20px_60px_rgba(10,29,54,0.06)] border border-brand-coral/10 p-8 md:p-12 mb-8">
              <div className="flex items-center gap-2 mb-8 border-b border-gray-50 pb-4">
                <div className="w-3 h-3 rounded-full bg-red-400 opacity-50" />
                <div className="w-3 h-3 rounded-full bg-yellow-400 opacity-50" />
                <div className="w-3 h-3 rounded-full bg-green-400 opacity-50" />
                <span className="ml-2 text-[10px] font-bold text-gray-300 uppercase tracking-widest">Aperçu Signature</span>
              </div>

              {/* RENDERED SIGNATURE (Copy Target) */}
              <div 
                ref={signatureRef}
                className="bg-white p-4"
                style={{ fontFamily: "Arial, Helvetica, sans-serif", fontSize: "14px", lineHeight: "1.5" }}
              >
                <table cellPadding="0" cellSpacing="0" style={{ verticalAlign: "-webkit-baseline-middle", fontSize: "14px", fontFamily: "Arial, sans-serif" }}>
                  <tbody>
                    <tr>
                      <td style={{ verticalAlign: "top", paddingRight: "25px", borderRight: "2px solid #f39d66" }}>
                        <div style={{ width: "80px", textAlign: "center" }}>
                          {logo ? (
                            <img src={logo} alt="Logo" style={{ maxWidth: "80px", maxHeight: "80px", objectFit: "contain" }} />
                          ) : (
                            <span style={{ fontSize: "28px", fontWeight: "bold", color: "#191b30", fontStyle: "italic" }}>D</span>
                          )}
                        </div>
                      </td>
                      <td style={{ verticalAlign: "top", paddingLeft: "15px" }}>
                        <h3 style={{ margin: "0", fontSize: "18px", color: "#191b30", fontWeight: "bold" }}>{name || "Votre Nom"}</h3>
                        <p style={{ margin: "2px 0 12px 0", fontSize: "14px", color: "#f39d66", fontWeight: "bold" }}>{title || "Votre Poste"}</p>
                        
                        <table cellPadding="0" cellSpacing="0" style={{ verticalAlign: "-webkit-baseline-middle", fontSize: "13px", color: "#666" }}>
                          <tbody>
                            <tr style={{ height: "22px" }}>
                              <td style={{ paddingRight: "10px" }}>🏢</td>
                              <td style={{ fontWeight: "bold", color: "#333" }}>{company || "Demaa"}</td>
                            </tr>
                            <tr style={{ height: "22px" }}>
                              <td style={{ paddingRight: "10px" }}>📞</td>
                              <td>{phone || "+33 6 00 00 00 00"}</td>
                            </tr>
                            <tr style={{ height: "22px" }}>
                              <td style={{ paddingRight: "10px" }}>✉️</td>
                              <td><a href={`mailto:${email}`} style={{ color: "#191b30", textDecoration: "none" }}>{email || "contact@demaa.fr"}</a></td>
                            </tr>
                            <tr style={{ height: "22px" }}>
                              <td style={{ paddingRight: "10px" }}>📍</td>
                              <td style={{ opacity: 0.8 }}>{address}</td>
                            </tr>
                          </tbody>
                        </table>
                        
                        {linkedin && (
                          <div style={{ marginTop: "15px" }}>
                            <a href={linkedin} style={{ backgroundColor: "#191b30", color: "#fff", padding: "4px 12px", borderRadius: "14px", textDecoration: "none", fontSize: "10px", fontWeight: "bold" }}>
                              🔗 LINKEDIN
                            </a>
                          </div>
                        )}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* ACTION BUTTONS */}
            <div className="space-y-4">
              <button 
                onClick={copyToClipboard}
                className="w-full flex items-center justify-center gap-3 py-5 bg-brand-blue text-white rounded-3xl text-sm font-bold hover:bg-brand-blue/95 shadow-2xl shadow-brand-blue/20 transition-all active:scale-95 group overflow-hidden relative"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                {copied ? <CheckCircle2 className="w-5 h-5 text-green-400" /> : <Copy className="w-5 h-5 opacity-70" />}
                {copied ? "SIGNATURE COPIÉE !" : "COPIER LA SIGNATURE"}
              </button>
              
              <div className="flex items-center gap-4 p-5 bg-white/40 backdrop-blur-md rounded-2xl border border-brand-coral/10">
                <div className="w-10 h-10 rounded-full bg-brand-coral/10 flex items-center justify-center shrink-0">
                  <Pencil className="w-5 h-5 text-brand-coral" />
                </div>
                <p className="text-xs text-brand-blue/70 leading-relaxed font-medium">
                  <strong>Astuce Pro :</strong> Après avoir copié, allez dans les réglages de votre messagerie (Gmail, Outlook) et faites simplement <strong>Coller</strong>.
                </p>
              </div>
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
