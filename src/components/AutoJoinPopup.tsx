"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, BadgePercent, ArrowRight } from "lucide-react";
import TeamLeadModal from "./TeamLeadModal";

export default function AutoJoinPopup() {
  const [isVisible, setIsVisible] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [hasBeenDismissed, setHasBeenDismissed] = useState(false);

  useEffect(() => {
    // Check if user has already dismissed it in this session
    const dismissed = sessionStorage.getItem("tarifs_negocies_popup_dismissed");
    if (dismissed) {
      setHasBeenDismissed(true);
      return;
    }

    const timer = setTimeout(() => {
      if (!hasBeenDismissed) {
        setIsVisible(true);
      }
    }, 15000); // 15 seconds

    return () => clearTimeout(timer);
  }, [hasBeenDismissed]);

  const handleDismiss = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsVisible(false);
    setHasBeenDismissed(true);
    sessionStorage.setItem("tarifs_negocies_popup_dismissed", "true");
  };

  const handleOpenModal = () => {
    setIsModalOpen(true);
    setIsVisible(false); // Hide the small popup when modal is open
  };

  return (
    <>
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, y: 100, x: 20, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, x: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.8 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed bottom-6 right-6 z-50 w-[320px] md:w-[380px] pointer-events-auto"
          >
            <div 
              onClick={handleOpenModal}
              className="bg-white border border-gray-100 rounded-[2.5rem] p-6 shadow-[0_20px_50px_rgba(25,27,48,0.15)] cursor-pointer group hover:shadow-[0_30px_60px_rgba(25,27,48,0.2)] transition-all duration-500 relative overflow-hidden"
            >
              {/* Subtle background glow */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-brand-coral/5 rounded-full blur-2xl -mr-10 -mt-10 group-hover:bg-brand-coral/10 transition-colors" />
              
              <button 
                onClick={handleDismiss}
                className="absolute top-4 right-4 p-1 rounded-full hover:bg-gray-100 text-gray-400 transition-colors z-10"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex gap-4 items-start relative z-10">
                <div className="w-12 h-12 bg-brand-blue rounded-2xl flex items-center justify-center shrink-0 shadow-lg shadow-brand-blue/20">
                  <BadgePercent className="w-6 h-6 text-brand-coral" />
                </div>
                <div className="space-y-2">
                  <h4 className="text-sm font-black text-brand-blue leading-tight tracking-tight uppercase">
                    15 à 30&nbsp;% négociés
                  </h4>
                  <p className="text-xs text-gray-500 leading-relaxed font-medium">
                    Services, logiciel et fournisseurs : tarifs négociés pour votre activité. Une demande suffit.
                  </p>
                  <div className="flex items-center gap-2 text-[10px] font-black text-brand-coral uppercase tracking-widest pt-1">
                    Découvrir <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <TeamLeadModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </>
  );
}
