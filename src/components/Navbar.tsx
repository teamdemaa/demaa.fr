"use client";

import Link from "next/link";
import { ChevronDown, X, Briefcase, Wrench, PenLine, Menu as MenuIcon } from "lucide-react";
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { usePathname } from "next/navigation";
import ConsultationForm from "./ConsultationForm";

export default function Navbar({ minimal = false }: { minimal?: boolean }) {
  const pathname = usePathname();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    // Global click listener to close dropdown when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      // Close dropdown if it's open and the click is NOT on the dropdown button
      if (isDropdownOpen && !target.closest('.relative')) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    // Close mobile menu on larger screens
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsMobileMenuOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('resize', handleResize);
    };
  }, [isDropdownOpen]);

  // Prevent scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
  }, [isMobileMenuOpen]);

  const isActive = (path: string) => {
    if (path === "/" && (pathname === "/" || pathname.startsWith("/services"))) return true;
    if (path !== "/" && pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <>
      <nav className="sticky top-0 z-40 bg-[#FFF9F8] border-b border-brand-coral/10 py-1">
        <div className="max-w-6xl mx-auto px-4 md:px-6 lg:pl-14 lg:pr-28">
          <div className="flex justify-between py-3 md:py-4 items-center">
            {/* Logo */}
            <Link href="/" onClick={() => setIsMobileMenuOpen(false)} className="text-xl sm:text-2xl font-bold tracking-tight text-brand-blue shrink-0 z-50">
              Demaa<span className="text-brand-coral">.</span>
            </Link>

            {/* Mobile Menu Toggle Button */}
            {/* Toggle Button & Desktop Links (Hidden in minimal mode) */}
            {!minimal && (
              <>
                <button 
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="md:hidden p-2 text-brand-blue hover:text-brand-coral transition-colors z-50"
                >
                  {isMobileMenuOpen ? <X className="w-6 h-6" /> : <MenuIcon className="w-6 h-6" />}
                </button>

                <div className="hidden md:flex space-x-8 md:space-x-12 items-center">
                  <Link 
                    href="/outils/modeles-de-document" 
                    className={`flex items-center space-x-2 transition-colors text-base font-bold ${isActive('/outils/modeles-de-document') ? 'text-brand-coral' : 'text-brand-blue hover:text-brand-coral'}`}
                  >
                    <PenLine className="w-5 h-5 transition-colors" />
                    <span className="whitespace-nowrap">Modèles</span>
                  </Link>

                  <div className="relative">
                    <button 
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                      className={`flex items-center space-x-2 transition-colors text-base font-bold ${(isActive('/services') || isActive('/nos-services')) && !isActive('/outils/modeles-de-document') ? 'text-brand-coral' : 'text-brand-blue hover:text-brand-coral'}`}
                    >
                      <Briefcase className="w-5 h-5 transition-colors" />
                      <span>Services</span>
                      <ChevronDown className={`w-4 h-4 pointer-events-none transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>
                    
                    {isDropdownOpen && (
                      <div className="absolute right-0 md:left-0 top-full mt-4 w-72 bg-white rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-gray-100 py-3 animate-in fade-in slide-in-from-top-2 z-50">
                        <Link href="/nos-services" onClick={() => setIsDropdownOpen(false)} className="block px-5 py-3 text-sm text-brand-coral hover:bg-brand-coral/5 font-bold transition-colors border-b border-gray-100 mb-2">
                           Voir tout les services →
                        </Link>
                        <Link href="/services/creation-societe" onClick={() => setIsDropdownOpen(false)} className="block px-5 py-2.5 text-sm text-brand-blue hover:bg-gray-50 transition-colors font-bold">Création de société</Link>
                        <Link href="/services/previsionnel-financier" onClick={() => setIsDropdownOpen(false)} className="block px-5 py-2.5 text-sm text-brand-blue hover:bg-gray-50 transition-colors font-bold">Prévisionnel financier</Link>
                        <Link href="/services/expert-comptable" onClick={() => setIsDropdownOpen(false)} className="block px-5 py-2.5 text-sm text-brand-blue hover:bg-gray-50 transition-colors font-bold">Expert comptable</Link>
                        <Link href="/services/audit-conformite-fiscale" onClick={() => setIsDropdownOpen(false)} className="block px-5 py-2.5 text-sm text-brand-blue hover:bg-gray-50 transition-colors">Audit conformité fiscale</Link>
                        <Link href="/services/automatisations-taches" onClick={() => setIsDropdownOpen(false)} className="block px-5 py-2.5 text-sm text-brand-blue hover:bg-gray-50 transition-colors">Automatisation des tâches</Link>
                        <Link href="/services/site-web" onClick={() => setIsDropdownOpen(false)} className="block px-5 py-2.5 text-sm text-brand-blue hover:bg-gray-50 transition-colors">Site web Vitrine</Link>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Mobile Menu Overlay */}
        {!minimal && isMobileMenuOpen && (
          <div className="fixed inset-0 top-0 bg-white z-40 md:hidden animate-in fade-in slide-in-from-top duration-300 flex flex-col pt-24 px-6 overflow-y-auto">
            <div className="space-y-6 flex flex-col items-center text-center">
              <Link 
                href="/outils/modeles-de-document" 
                onClick={() => setIsMobileMenuOpen(false)}
                className={`text-2xl font-bold flex items-center space-x-3 ${isActive('/outils/modeles-de-document') ? 'text-brand-coral' : 'text-brand-blue'}`}
              >
                 <PenLine className="w-6 h-6" />
                 <span>Modèles de documents</span>
              </Link>
              
              <div className="w-full h-px bg-gray-100"></div>
              
              <Link 
                href="/nos-services" 
                onClick={() => setIsMobileMenuOpen(false)}
                className={`text-2xl font-bold flex items-center space-x-3 ${isActive('/nos-services') ? 'text-brand-coral' : 'text-brand-blue'}`}
              >
                 <Briefcase className="w-6 h-6" />
                 <span>Tous nos Services</span>
              </Link>

              <div className="w-full grid grid-cols-1 gap-2 pt-2">
                 <Link href="/services/creation-societe" onClick={() => setIsMobileMenuOpen(false)} className="py-3 px-4 rounded-xl hover:bg-gray-50 text-brand-blue font-semibold">Création de société</Link>
                 <Link href="/services/previsionnel-financier" onClick={() => setIsMobileMenuOpen(false)} className="py-3 px-4 rounded-xl hover:bg-gray-50 text-brand-blue font-semibold">Prévisionnel financier</Link>
                 <Link href="/services/expert-comptable" onClick={() => setIsMobileMenuOpen(false)} className="py-3 px-4 rounded-xl hover:bg-gray-50 text-brand-blue font-semibold">Expert comptable</Link>
                 <Link href="/services/audit-conformite-fiscale" onClick={() => setIsMobileMenuOpen(false)} className="py-3 px-4 rounded-xl hover:bg-gray-50 text-gray-500">Audit conformité fiscale</Link>
                 <Link href="/services/automatisations-taches" onClick={() => setIsMobileMenuOpen(false)} className="py-3 px-4 rounded-xl hover:bg-gray-50 text-gray-500">Automatisation des tâches</Link>
                 <Link href="/services/site-web" onClick={() => setIsMobileMenuOpen(false)} className="py-3 px-4 rounded-xl hover:bg-gray-50 text-gray-500">Site web Vitrine</Link>
              </div>
            </div>
          </div>
        )}
      </nav>


      {/* Consultation Modal — Native Form (replaces Fillout iframe) */}
      {mounted && isModalOpen && createPortal(
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-brand-blue/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-[2rem] w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 relative flex flex-col">
            
            <div className="p-6 border-b border-gray-100 flex justify-between items-start bg-white z-10 rounded-t-[2rem]">
              <div className="pr-8">
                <h3 className="font-bold text-brand-blue text-xl">Consultation de Structuration</h3>
                <p className="text-xs md:text-sm text-gray-500 mt-1.5 leading-relaxed">
                  Conversation de 30 minutes avec un spécialiste de la structuration d'entreprise.
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
            
            <ConsultationForm onSuccess={() => setIsModalOpen(false)} />

          </div>
        </div>,
        document.body
      )}

    </>
  );
}
