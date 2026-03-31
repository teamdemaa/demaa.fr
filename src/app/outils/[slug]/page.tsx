"use client";

import { use, useState } from "react";
import Navbar from "@/components/Navbar";
import SubscriptionModal from "@/components/SubscriptionModal";

// Function to reverse engineering the slug into a human readable title
function formatSlugToTitle(slug: string) {
  const text = slug.replace(/-/g, " ");
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export default function OutilPage(
  props: { params: Promise<{ slug: string }> }
) {
  const params = use(props.params);
  const title = formatSlugToTitle(params.slug);
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <Navbar />
      <main className="flex-1 w-full bg-background min-h-[85vh] flex flex-col items-center justify-center px-4">
        <div className="text-center max-w-2xl animate-in slide-in-from-bottom-6 duration-700">
          <div className="w-24 h-24 bg-brand-coral/10 rounded-[2.5rem] flex items-center justify-center mx-auto mb-10 shadow-lg shadow-brand-coral/5 group hover:scale-105 transition-transform duration-500">
             <span className="text-4xl transform group-hover:rotate-12 transition-transform">🛠️</span>
          </div>
          <p className="text-[10px] font-bold text-brand-coral uppercase tracking-[0.2em] mb-4">
             Bientôt disponible
          </p>
          <h1 className="text-4xl sm:text-6xl font-bold text-brand-blue mb-8 leading-tight tracking-tight">
            {title}
          </h1>
          <p className="text-lg md:text-xl text-gray-500 mb-12 leading-relaxed font-light max-w-xl mx-auto">
            Cet outil est actuellement en cours de développement. Inscrivez-vous pour être prévenu dès sa mise à disposition gratuite.
          </p>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="px-10 py-5 bg-brand-blue text-white rounded-[1.5rem] font-bold hover:bg-brand-coral transition-all shadow-xl shadow-brand-blue/10 transform hover:-translate-y-1 active:scale-95"
          >
            Être notifié du lancement
          </button>
        </div>
      </main>

      <SubscriptionModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        toolName={title} 
      />
    </>
  );
}
