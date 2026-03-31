"use client";

import { Search } from "lucide-react";

export default function HeroSearch({ onSearch }: { onSearch: (q: string) => void }) {
  return (
    <section className="w-full flex flex-col items-center justify-center pt-10 pb-8 md:pt-24 md:pb-16 px-4 text-center bg-brand-coral/5">

      <h1 className="text-3xl md:text-5xl lg:text-7xl font-bold tracking-tight text-brand-blue mb-4 md:mb-8 leading-tight max-w-4xl mx-auto z-10 relative drop-shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
        Les services clés pour votre entreprise, <span className="text-brand-coral">simplement</span>
      </h1>
      
      {/* Big Rounded Searchbar */}
      <div className="relative w-full max-w-xs sm:max-w-md md:max-w-2xl mx-auto shadow-sm group">
        <div className="absolute inset-y-0 left-0 pl-4 md:pl-6 flex items-center pointer-events-none">
          <Search className="h-5 w-5 md:h-6 md:w-6 text-gray-400 group-focus-within:text-brand-coral transition-colors" />
        </div>
        <input 
          type="text" 
          onChange={(e) => onSearch(e.target.value)}
          placeholder="Rechercher un service" 
          className="peer block w-full pl-12 md:pl-16 pr-4 md:pr-6 py-3.5 md:py-5 border-2 border-gray-100 rounded-full text-base md:text-lg focus:ring-4 focus:ring-brand-coral/20 focus:border-brand-coral outline-none transition-all shadow-md placeholder-gray-400 bg-white" 
        />
      </div>
    </section>
  );
}
