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
    if (path === "/" && pathname === "/") return true;
    if (path !== "/" && pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <>
      <nav className="sticky top-0 z-50 bg-brand-coral/5 backdrop-blur-md border-b border-brand-coral/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between py-2.5 md:py-8 items-center">
            {/* Logo */}
            <Link href="/" className="text-2xl sm:text-3xl font-bold tracking-tight text-brand-blue shrink-0">
              Demaa<span className="text-brand-coral">.</span>
            </Link>

            {/* Mobile Top Bar CTA (Visible only on mobile) */}
            <button
              onClick={() => setIsModalOpen(true)}
              className="md:hidden ml-auto shrink-0 flex flex-col items-center justify-center bg-brand-blue text-white px-4 py-1.5 rounded-full shadow-md active:scale-95 transition-transform"
            >
              <span className="font-semibold text-[11px] leading-tight whitespace-nowrap">Consultation Structuration</span>
              <span className="text-[9px] font-medium text-white/70 tracking-wide whitespace-nowrap">Gratuit · Par téléphone</span>
            </button>

            {/* Desktop Links */}
            <div className="hidden md:flex space-x-10 items-center">
            {/* Dropdown */}
            <div className="relative">
              <button 
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className={`flex items-center space-x-2 transition-colors text-lg font-semibold ${isActive('/outils') ? 'text-brand-coral' : 'text-brand-blue hover:text-brand-coral'}`}
              >
                <span>Outils</span>
                <ChevronDown className={`w-5 h-5 pointer-events-none transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {isDropdownOpen && (
                <div className="absolute top-full mt-4 w-72 bg-white rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-gray-100 py-3 animate-in fade-in slide-in-from-top-2 z-50">
                  <Link href="/outils" className="block px-5 py-3 text-sm text-brand-coral hover:bg-brand-coral/5 font-bold transition-colors border-b border-gray-100 mb-2">
                    Voir tout →
                  </Link>
                  <Link href="/outils/generation-de-document" className="block px-5 py-2.5 text-sm text-brand-blue hover:bg-gray-50 transition-colors">Génération de document</Link>
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
              className={`transition-colors text-lg font-semibold ${isActive('/blog') ? 'text-brand-coral underline decoration-2 underline-offset-8' : 'text-brand-blue hover:text-brand-coral'}`}
            >
              Conseils
            </Link>

            {/* Consultation CTA */}
            <button
              onClick={() => setIsModalOpen(true)}
              className="ml-6 flex flex-col items-center justify-center bg-brand-blue text-white px-6 py-2.5 rounded-full hover:bg-brand-coral transition-all duration-300 transform hover:-translate-y-0.5 shadow-md hover:shadow-lg"
            >
              <span className="font-bold text-base leading-tight">Consultation Structuration</span>
              <span className="text-[0.65rem] font-medium text-white/80 mt-0.5 tracking-wider">Gratuit - Par téléphone</span>
            </button>
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
          <div className="bg-white rounded-[2rem] w-full max-w-4xl h-[85vh] md:h-[800px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 relative flex flex-col">
            
            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-white absolute top-0 w-full z-10 rounded-t-[2rem]">
              <h3 className="font-bold text-brand-blue text-lg ml-2">Consultation de Structuration</h3>
              <button 
                onClick={() => setIsModalOpen(false)} 
                className="p-2 bg-gray-50 rounded-full hover:bg-red-50 text-gray-500 hover:text-red-500 transition-colors shadow-sm focus:outline-none"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex-1 w-full pt-[4.5rem] bg-gray-50">
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
