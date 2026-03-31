"use client";

import { Search } from "lucide-react";

export default function HeroSearch({ onSearch }: { onSearch: (q: string) => void }) {
  return (
    <section className="w-full flex flex-col items-center justify-center pt-8 pb-8 md:pt-14 md:pb-12 px-4 text-center bg-white border-b border-gray-100">

      <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold tracking-tight text-brand-blue mb-4 md:mb-6 leading-tight max-w-4xl mx-auto z-10 relative">
        Les services clés pour votre entreprise, <span className="text-brand-coral">simplement</span>
      </h1>
      
      {/* Big Rounded Searchbar */}
      <div className="relative w-full max-w-xs sm:max-w-md md:max-w-2xl mx-auto shadow-sm group">
        <div className="absolute inset-y-0 left-0 pl-4 md:pl-6 flex items-center pointer-events-none">
          <Search className="h-5 w-5 md:h-5 md:w-5 text-gray-400 group-focus-within:text-brand-coral transition-colors" />
        </div>
        <input 
          type="text" 
          onChange={(e) => onSearch(e.target.value)}
          placeholder="Rechercher un service" 
          className="peer block w-full pl-10 md:pl-14 pr-4 md:pr-6 py-2.5 md:py-3.5 border-2 border-gray-100 rounded-full text-sm md:text-base focus:ring-4 focus:ring-brand-coral/20 focus:border-brand-coral outline-none transition-all shadow-md placeholder-gray-400 bg-white" 
        />
      </div>
    </section>
  );
}
