"use client";

import { useState, useRef } from "react";
import Navbar from "@/components/Navbar";
import { 
  Search, 
  MapPin, 
  Phone, 
  Globe, 
  Clock, 
  Star, 
  Copy, 
  CheckCircle2, 
  AlertCircle,
  ExternalLink,
  Info
} from "lucide-react";

export default function GoogleProfileOptimizer() {
  const [name, setName] = useState("Mon Entreprise Locale");
  const [category, setCategory] = useState("Services Professionnels");
  const [address, setAddress] = useState("123 Rue de la Réussite, 75001 Paris");
  const [description, setDescription] = useState("Ma description optimisée pour le SEO local...");
  const [phone, setPhone] = useState("01 23 45 67 89");
  const [website, setWebsite] = useState("www.mon-entreprise.fr");
  const [copied, setCopied] = useState(false);

  const DESC_LIMIT = 750;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Logic for the optimization checklist
  const checklist = [
    { label: "Nom de l'entreprise (Keywords)", status: name.length > 5 && name.length < 60 },
    { label: "Description optimisée (SEO)", status: description.length > 150 && description.length <= 750 },
    { label: "Catégorie principale", status: category.length > 3 },
    { label: "Coordonnées complètes (NAP)", status: address.length > 10 && phone.length > 8 },
  ];

  return (
    <div className="min-h-screen md:h-screen bg-[#FFF9F8] flex flex-col overflow-y-auto md:overflow-hidden text-[#191b30]">
      <Navbar />
      
      <main className="flex-1 flex flex-col md:flex-row w-full overflow-y-auto md:overflow-hidden">
        
        {/* LEFT PANE: CONFIGURATION */}
        <div className="w-full md:w-[45%] pl-12 md:pl-24 lg:pl-40 pr-6 flex flex-col justify-center space-y-7 md:border-r border-brand-coral/5 overflow-y-auto no-scrollbar py-12">
          <div className="space-y-2">
            <h1 className="text-2xl md:text-3xl font-bold text-brand-blue tracking-tight">
              Création de fiche <span className="text-brand-coral">Google optimisée</span>
            </h1>
            <p className="text-gray-500 text-xs md:text-sm leading-relaxed max-w-sm">
              Rédigez une fiche établissement irrésistible pour Google et vos clients.
            </p>
          </div>

          <div className="space-y-5">
            {/* Business Name */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-blue/30 ml-1">Nom de l'établissement</label>
              <input 
                type="text" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Demaa Plomberie Paris"
                className="w-full px-5 py-3 bg-white border-2 border-brand-coral/5 rounded-xl focus:border-brand-coral/30 outline-none transition-all text-brand-blue font-medium text-sm shadow-sm"
              />
            </div>

            {/* Category */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-blue/30 ml-1">Catégorie principale</label>
              <input 
                type="text" 
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="Ex: Expert-comptable"
                className="w-full px-5 py-3 bg-white border-2 border-brand-coral/5 rounded-xl focus:border-brand-coral/30 outline-none transition-all text-brand-blue font-medium text-sm shadow-sm"
              />
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-end ml-1">
                <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-blue/30">Description (Optimisée SEO)</label>
                <span className={`text-[9px] font-bold ${description.length > DESC_LIMIT ? "text-red-500" : "text-brand-blue/40"}`}>
                  {description.length} / {DESC_LIMIT}
                </span>
              </div>
              <textarea 
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Décrivez vos services, votre zone d'intervention..."
                className="w-full px-5 py-3 bg-white border-2 border-brand-coral/5 rounded-xl focus:border-brand-coral/30 outline-none transition-all text-brand-blue font-medium text-sm shadow-sm resize-none h-32"
              />
            </div>

            {/* NAP Info (Small Grid) */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-blue/30 ml-1">Adresse</label>
                <input 
                  type="text" 
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white border-2 border-brand-coral/5 rounded-lg focus:border-brand-coral/30 outline-none transition-all text-brand-blue text-xs shadow-sm"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-blue/30 ml-1">Téléphone</label>
                <input 
                  type="text" 
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white border-2 border-brand-coral/5 rounded-lg focus:border-brand-coral/30 outline-none transition-all text-brand-blue text-xs shadow-sm"
                />
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT PANE: GOOGLE PREVIEW */}
        <div className="flex-1 bg-white md:bg-transparent flex flex-col items-center justify-center p-4 md:p-8 pr-6 md:pr-24 lg:pr-40 relative py-12 md:py-8">
          
          <div className="scale-[0.7] sm:scale-[0.8] md:scale-[1] transition-transform origin-center">
            {/* GOOGLE FICHE SIMULATION */}
            <div className="bg-white rounded-2xl shadow-[0_10px_40px_rgba(10,29,54,0.08)] border border-gray-100 overflow-hidden animate-in fade-in zoom-in-95 duration-500">
              {/* Header Bar */}
              <div className="bg-gray-50 border-b border-gray-100 px-6 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center shadow-sm">
                    <img src="/google-icon.svg" alt="G" className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Aperçu fiche établissement</span>
                </div>
                <div className="flex gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-gray-200" />
                  <div className="w-1.5 h-1.5 rounded-full bg-gray-200" />
                  <div className="w-1.5 h-1.5 rounded-full bg-gray-200" />
                </div>
              </div>

              <div className="p-8 space-y-6">
                <div>
                    <h2 className="text-2xl font-bold text-brand-blue hover:underline cursor-pointer leading-tight mb-1">{name}</h2>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-0.5 text-orange-400">
                        {[...Array(5)].map((_, i) => <Star key={i} className="w-3.5 h-3.5 fill-current" />)}
                      </div>
                      <span className="text-xs font-medium text-gray-500">5.0 (24 avis)</span>
                      <span className="text-xs text-gray-300">•</span>
                      <span className="text-xs font-semibold text-gray-500">{category}</span>
                    </div>
                  </div>
  
                  <div className="space-y-3.5 border-y border-gray-50 py-6">
                    <div className="flex items-start gap-4 group">
                      <MapPin className="w-4 h-4 text-gray-400 mt-0.5 group-hover:text-brand-blue transition-colors" />
                      <p className="text-xs text-gray-600 leading-relaxed font-medium">{address}</p>
                    </div>
                    <div className="flex items-center gap-4 group">
                      <Clock className="w-4 h-4 text-gray-400 group-hover:text-brand-blue transition-colors" />
                      <p className="text-xs text-gray-600 font-medium">Ouvert ⋅ Ferme à 19:00</p>
                    </div>
                    <div className="flex items-center gap-4 group">
                      <Phone className="w-4 h-4 text-gray-400 group-hover:text-brand-blue transition-colors" />
                      <p className="text-xs text-brand-blue font-bold">{phone}</p>
                    </div>
                    <div className="flex items-center gap-4 group">
                      <Globe className="w-4 h-4 text-gray-400 group-hover:text-brand-blue transition-colors" />
                      <p className="text-xs text-brand-blue font-medium truncate">{website}</p>
                    </div>
                  </div>

                <div className="space-y-2">
                  <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">À propos</h3>
                  <p className="text-[11px] text-gray-500 leading-relaxed italic">
                    {description || "Saisissez une description pour voir l'aperçu..."}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="bg-gray-50/50 px-8 py-5 flex gap-3">
                <button 
                  onClick={() => copyToClipboard(description)}
                  className="flex-1 flex items-center justify-center gap-2 py-3 bg-brand-blue text-white rounded-xl text-xs font-bold hover:bg-brand-blue/90 transition-all active:scale-95 shadow-lg shadow-brand-blue/10"
                >
                  <Copy className="w-3.5 h-3.5" />
                  {copied ? "Description copiée !" : "Copier la description"}
                </button>
              </div>
            </div>

            {/* CHECKLIST SECTION */}
            <div className="space-y-4 px-2">
              <h4 className="text-xs font-bold text-brand-blue flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-brand-coral" />
                Score d'optimisation (Checklist)
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {checklist.map((item, idx) => (
                  <div key={idx} className={`p-3 rounded-xl border flex items-center gap-3 transition-all ${item.status ? "bg-green-50/50 border-green-100" : "bg-gray-50/50 border-gray-100 opacity-60"}`}>
                    {item.status ? (
                      <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                    ) : (
                      <div className="w-4 h-4 border-2 border-gray-200 rounded-full shrink-0" />
                    )}
                    <span className="text-[10px] font-bold text-gray-600 leading-tight">{item.label}</span>
                  </div>
                ))}
              </div>
              <div className="p-4 bg-brand-coral/5 rounded-xl border border-brand-coral/10 flex items-start gap-4">
                <Info className="w-5 h-5 text-brand-coral shrink-0 mt-0.5" />
                <p className="text-[10px] text-brand-blue/70 leading-relaxed italic">
                  <strong>Astuce SEO :</strong> Incluez votre ville principale dès les premiers mots de votre description pour un meilleur impact local.
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
