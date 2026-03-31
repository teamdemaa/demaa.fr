"use client";

import Link from "next/link";
import { ChevronDown, X, Briefcase, Wrench, PenLine } from "lucide-react";
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const pathname = usePathname();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isActive = (path: string) => {
    if (path === "/" && (pathname === "/" || pathname.startsWith("/services"))) return true;
    if (path !== "/" && pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <>
      <nav className="sticky top-0 z-40 bg-[#FFF9F8] border-b border-brand-coral/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between py-1.5 md:py-2.5 items-center">
            {/* Logo */}
            <Link href="/" className="text-lg sm:text-xl font-bold tracking-tight text-brand-blue shrink-0">
              Demaa<span className="text-brand-coral">.</span>
            </Link>

            {/* Desktop Links */}
            <div className="hidden md:flex space-x-10 items-center">
            {/* Dropdown */}
            <div className="relative">
              <button 
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className={`flex items-center space-x-1.5 transition-colors text-[13px] font-bold ${isActive('/outils') ? 'text-brand-coral' : 'text-brand-blue hover:text-brand-coral'}`}
              >
                <span>Outils</span>
                <ChevronDown className={`w-3.5 h-3.5 pointer-events-none transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {isDropdownOpen && (
                <div className="absolute top-full mt-4 w-72 bg-white rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-gray-100 py-3 animate-in fade-in slide-in-from-top-2 z-50">
                  <Link href="/outils" className="block px-5 py-3 text-sm text-brand-coral hover:bg-brand-coral/5 font-bold transition-colors border-b border-gray-100 mb-2">
                    Voir tout →
                  </Link>
                  <Link href="/outils/generation-de-qr-code-pour-card" className="block px-5 py-2.5 text-sm text-brand-blue hover:bg-gray-50 transition-colors">Génération de QR code pour card</Link>
                  <Link href="/outils/generation-de-tampon" className="block px-5 py-2.5 text-sm text-brand-blue hover:bg-gray-50 transition-colors">Génération de Tampon</Link>
                  <Link href="/outils/qr-code-pour-avis-client" className="block px-5 py-2.5 text-sm text-brand-blue hover:bg-gray-50 transition-colors">QR code pour avis client</Link>
                  <Link href="/outils/creation-de-fiche-google-optimisee" className="block px-5 py-2.5 text-sm text-brand-blue hover:bg-gray-50 transition-colors">Création de fiche Google optimisée</Link>
                  <Link href="/outils/signature-email-pro" className="block px-5 py-2.5 text-sm text-brand-blue hover:bg-gray-50 transition-colors">Signature email pro</Link>
                  <Link href="/outils/qr-code-commande-rapide" className="block px-5 py-2.5 text-sm text-brand-blue hover:bg-gray-50 transition-colors">QR code commande rapide</Link>
                  <Link href="/outils/signez-un-document-electroniquement" className="block px-5 py-2.5 text-sm text-brand-blue hover:bg-gray-50 transition-colors">Signez un document électroniquement</Link>
                  <Link href="/outils/generation-de-menu-avec-qr-code" className="block px-5 py-2.5 text-sm text-brand-blue hover:bg-gray-50 transition-colors">Génération de menu avec QR code</Link>
                  <Link href="/outils/generation-de-qr-code" className="block px-5 py-2.5 text-sm text-brand-blue hover:bg-gray-50 transition-colors">Génération de QR code</Link>
                </div>
              )}
            </div>

            {/* Conseils Link */}
            <Link 
              href="/blog" 
              className={`transition-colors text-[13px] font-bold ${isActive('/blog') ? 'text-brand-coral underline decoration-2 underline-offset-4' : 'text-brand-blue hover:text-brand-coral'}`}
            >
              Conseils
            </Link>
          </div>
        </div>
      </div>
    </nav>

      {/* Mobile Bottom Navigation Bar */}
      <div className="md:hidden fixed bottom-0 left-0 w-full z-40 bg-white/95 backdrop-blur-xl border-t border-gray-100 shadow-[0_-10px_40px_rgba(0,0,0,0.06)]" style={{paddingBottom: "max(env(safe-area-inset-bottom), 12px)"}}>
        <div className="flex justify-evenly items-center pt-3 pb-4 px-2">
          <Link href="/" className={`flex flex-col items-center justify-center w-full transition-colors gap-1 ${isActive('/') ? 'text-brand-coral' : 'text-brand-blue'}`}>
            <Briefcase className="w-[22px] h-[22px]" />
            <span className="text-[11px] font-bold">Services</span>
          </Link>
          <Link href="/outils" className={`flex flex-col items-center justify-center w-full transition-colors gap-1 ${isActive('/outils') ? 'text-brand-coral' : 'text-brand-blue'}`}>
            <Wrench className="w-[22px] h-[22px]" />
            <span className="text-[11px] font-bold">Outils</span>
          </Link>
          <Link href="/blog" className={`flex flex-col items-center justify-center w-full transition-colors gap-1 ${isActive('/blog') ? 'text-brand-coral' : 'text-brand-blue'}`}>
            <PenLine className="w-[22px] h-[22px]" />
            <span className="text-[11px] font-bold">Conseils</span>
          </Link>
        </div>
      </div>

      {/* Fillout Modal Component */}
      {mounted && isModalOpen && createPortal(
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-brand-blue/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-[2rem] w-full max-w-2xl h-[75vh] md:h-[650px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 relative flex flex-col">
            
            <div className="p-6 border-b border-gray-100 flex justify-between items-start bg-white z-10 rounded-t-[2rem]">
              <div className="pr-8">
                <h3 className="font-bold text-brand-blue text-xl">Consultation de Structuration</h3>
                <p className="text-xs md:text-sm text-gray-500 mt-1.5 leading-relaxed leading-snug">
                  Conversation de 30 minutes avec un spécialiste de la structuration d'entreprise. 
                  Objectifs : vous sentir moins dépassé(e) et vous aider à reprendre le contrôle de votre entreprise.
                </p>
                <p className="text-[10px] uppercase tracking-widest text-brand-coral font-bold mt-2">
                  Gratuit - Par téléphone
                </p>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)} 
                className="p-2 bg-gray-50 rounded-full hover:bg-red-50 text-gray-500 hover:text-red-500 transition-colors shadow-sm focus:outline-none shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex-1 w-full bg-gray-50">
              <iframe 
                src="https://teamdemaa.fillout.com/t/4QP8VeqUAaus" 
                className="w-full h-full border-none"
                title="Formulaire consultation"
              />
            </div>

          </div>
        </div>,
        document.body
      )}

    </>
  );
}
