"use client";

import { useState } from "react";
import { X, Send } from "lucide-react";
import { createPortal } from "react-dom";

export default function OrderModal({ serviceName }: { serviceName: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    prenom: "",
    email: "",
    telephone: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const text = `Bonjour, je suis intéressé(e) par le service : *${serviceName}*.
    
Mes informations :
- Prénom : ${formData.prenom}
- Email : ${formData.email}
- Téléphone : ${formData.telephone}

Merci de me recontacter !`;

    const encodedText = encodeURIComponent(text);
    const whatsappUrl = `https://wa.me/33782842435?text=${encodedText}`;
    window.open(whatsappUrl, "_blank");
    setIsOpen(false);
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="w-full bg-brand-blue text-white font-medium py-4 px-6 rounded-2xl hover:bg-brand-coral hover:text-white transition-all transform hover:scale-[1.02] shadow-md"
      >
        Commander
      </button>
      
      {/* Subtle indicator as requested by user */}
      <p className="text-center text-xs text-gray-400 mt-4 flex items-center justify-center">
        <span className="w-2 h-2 rounded-full bg-emerald-500 mr-2"></span>
        Traitement rapide via WhatsApp
      </p>

      {typeof document !== "undefined" && isOpen && createPortal(
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-brand-blue/60 backdrop-blur-sm p-4 animate-in fade-in duration-200 soft-scroll overflow-y-auto"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-[2rem] w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
          >
            
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <div>
                <h3 className="text-xl font-bold text-brand-blue">Finaliser la demande</h3>
                <p className="text-sm text-brand-coral font-medium mt-1 truncate max-w-[250px]">{serviceName}</p>
              </div>
              <button 
                onClick={() => setIsOpen(false)} 
                className="p-2 bg-white rounded-full hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors shadow-sm focus:outline-none"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-8 space-y-5">
              <div>
                <label className="block text-sm font-semibold text-brand-blue mb-1.5">Prénom</label>
                <input required type="text" value={formData.prenom} onChange={e => setFormData({...formData, prenom: e.target.value})} className="demaa-input" placeholder="Votre prénom" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-brand-blue mb-1.5">Email</label>
                <input required type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="demaa-input" placeholder="votre@email.com" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-brand-blue mb-1.5">Téléphone</label>
                <input required type="tel" value={formData.telephone} onChange={e => setFormData({...formData, telephone: e.target.value})} className="demaa-input" placeholder="06 12 34 56 78" />
              </div>
              
              <div className="pt-4">
                <button type="submit" className="w-full flex items-center justify-center bg-brand-blue hover:bg-brand-coral text-white font-medium py-4 rounded-xl transition-all shadow-lg shadow-brand-blue/20 transform hover:-translate-y-0.5">
                  <Send className="w-5 h-5 mr-3" />
                  Envoyer via WhatsApp
                </button>
                <p className="text-center text-xs text-gray-400 mt-5">
                   Vous allez être redirigé vers l&apos;application WhatsApp pour valider l&apos;envoi de façon sécurisée.
                </p>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
