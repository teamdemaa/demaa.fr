"use client";

import { Search } from "lucide-react";
import USPSection from "./USPSection";

export default function HeroSearch({ 
  onSearch, 
  title,
  placeholder = "Que cherchez-vous aujourd'hui ?",
  showUSP = true,
  subtitle,
  children,
  topSlot,
  bottomSlot
}: { 
  onSearch: (q: string) => void,
  title?: React.ReactNode,
  placeholder?: string,
  showUSP?: boolean,
  subtitle?: React.ReactNode,
  children?: React.ReactNode,
  topSlot?: React.ReactNode,
  bottomSlot?: React.ReactNode
}) {
  return (
    <section
      className={`w-full flex flex-col items-center justify-center px-4 text-center bg-[#FFF9F8] border-b border-brand-blue/5 overflow-hidden ${
        title ? "pt-0 -mt-px" : "pt-8 md:pt-12"
      }`}
    >
      
      {title ? (
        <div className="pt-8 md:pt-10 mb-8 md:mb-10 w-full">
          {title}
        </div>
      ) : (
        <h1 className="text-4xl md:text-5xl lg:text-[52px] font-black tracking-tight text-brand-blue mb-10 md:mb-16 leading-[1.1] w-full max-w-none mx-auto z-10 relative px-2 text-center">
          <span className="block md:whitespace-nowrap">Automatiser pour se </span>
          <span className="text-brand-coral block md:whitespace-nowrap">libérer du temps</span>
        </h1>
      )}

      {subtitle && (
        <div className="text-sm md:text-lg text-gray-400 font-light mb-8 md:mb-10 max-w-3xl mx-auto animate-in fade-in duration-700">
          {subtitle}
        </div>
      )}

      {/* 02. Tabs Slot (Now below Title) */}
      {topSlot && (
        <div className="w-full mb-6 animate-in fade-in slide-in-from-top-4 duration-700">
          {topSlot}
        </div>
      )}
      
      {/* 03. Search Bar Segment */}
      <div className="relative w-full max-w-7xl mx-auto px-2 sm:px-6 lg:px-0 group mb-6">
        <div className="w-full sm:max-w-md md:max-w-2xl mx-auto relative px-2">
          <div className="absolute inset-y-0 left-0 pl-4 md:pl-6 flex items-center pointer-events-none">
            <Search className="h-4 w-4 md:h-5 md:w-5 text-gray-400 group-focus-within:text-brand-blue/60 transition-colors" />
          </div>
          <input 
            type="text" 
            onChange={(e) => onSearch(e.target.value)}
            placeholder={placeholder}
            className="peer block w-full pl-10 md:pl-14 pr-4 md:pr-6 py-5 rounded-full text-sm md:text-base outline-none transition-all bg-white demaa-input border-none focus:shadow-md" 
          />
        </div>
      </div>

      {/* 04. Filters Slot (Bottom of header) */}
      {bottomSlot && (
        <div className="w-full pb-4 md:pb-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
          {bottomSlot}
        </div>
      )}

      {children}

      {/* Conditional USP Section */}
      {showUSP && <USPSection />}
    </section>
  );
}
