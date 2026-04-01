"use client";

import { Search } from "lucide-react";
import USPSection from "./USPSection";

export default function HeroSearch({ 
  onSearch, 
  title = "Les services clés pour votre entreprise au même endroit",
  placeholder = "Rechercher un outil",
  showUSP = true,
  subtitle
}: { 
  onSearch: (q: string) => void,
  title?: string,
  placeholder?: string,
  showUSP?: boolean,
  subtitle?: string
}) {
  return (
    <section className="w-full flex flex-col items-center justify-center pt-8 pb-12 md:pt-14 md:pb-16 px-4 text-center bg-[#FFF9F8] border-b border-brand-coral/10">

      <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold tracking-tight text-brand-blue mb-4 md:mb-6 leading-[1.1] max-w-5xl mx-auto z-10 relative px-2">
        {title.split(/(clés|gagner du temps au quotidien)/).map((part, i) => (
          <span key={i} className={part === "clés" || part === "gagner du temps au quotidien" ? "text-brand-coral" : ""}>
            {part}
          </span>
        ))}
      </h1>

      {subtitle && (
        <p className="text-sm md:text-lg text-gray-500 font-medium mb-8 md:mb-10 max-w-3xl mx-auto animate-in fade-in duration-700">
          {subtitle}
        </p>
      )}
      
      {/* Big Rounded Searchbar */}
      <div className="relative w-full max-w-xs sm:max-w-md md:max-w-2xl mx-auto group">
        <div className="absolute inset-y-0 left-0 pl-4 md:pl-6 flex items-center pointer-events-none">
          <Search className="h-5 w-5 md:h-5 md:w-5 text-gray-400 group-focus-within:text-brand-coral transition-colors" />
        </div>
        <input 
          type="text" 
          onChange={(e) => onSearch(e.target.value)}
          placeholder={placeholder}
          className="peer block w-full pl-10 md:pl-14 pr-4 md:pr-6 py-2.5 md:py-3.5 border-2 border-brand-coral/25 rounded-full text-sm md:text-base focus:ring-4 focus:ring-brand-coral/20 focus:border-brand-coral outline-none transition-all shadow-md placeholder-gray-400 bg-white" 
        />
      </div>

      {/* Conditional USP Section */}
      {showUSP && <USPSection />}
    </section>
  );
}
