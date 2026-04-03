"use client";

import { Search } from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import USPSection from "./USPSection";

export default function HeroSearch({ 
  onSearch, 
  title,
  animatedWord,
  rotatingWords,
  placeholder = "Rechercher un outil",
  showUSP = true,
  subtitle,
  children
}: { 
  onSearch: (q: string) => void,
  title?: string,
  animatedWord?: string,
  rotatingWords?: string[],
  placeholder?: string,
  showUSP?: boolean,
  subtitle?: string,
  children?: React.ReactNode
}) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (rotatingWords && rotatingWords.length > 0) {
      const interval = setInterval(() => {
        setIndex((prev) => (prev + 1) % rotatingWords.length);
      }, 3500); // 3.5 seconds for readability
      return () => clearInterval(interval);
    }
  }, [rotatingWords]);

  return (
    <section className="w-full flex flex-col items-center justify-center pt-8 md:pt-14 px-4 text-center bg-[#FFF9F8] border-b border-brand-blue/5 overflow-hidden">

      <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-brand-blue mb-4 md:mb-6 leading-[1.2] max-w-5xl mx-auto z-10 relative px-2">
        {rotatingWords ? (
          <div className="flex flex-col items-center">
            <div className="flex items-center justify-center gap-x-[0.3em] md:gap-x-[0.4em]">
               <div className="relative h-[1.14em] overflow-hidden inline-flex items-center justify-end">
                  {/* Ghost element to reserve space for the longest word */}
                  <span className="invisible pointer-events-none whitespace-nowrap text-right pr-[0.1em]">
                    Bons Plans
                  </span>
                  
                  <div className="absolute inset-0 flex items-center justify-end">
                    <AnimatePresence mode="popLayout" initial={false}>
                      <motion.span
                        key={rotatingWords[index]}
                        initial={{ y: "100%", opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: "-100%", opacity: 0 }}
                        transition={{ 
                          duration: 0.6, 
                          ease: [0.23, 1, 0.32, 1]
                        }}
                        className="text-brand-coral relative whitespace-nowrap block text-right pr-[0.1em]"
                      >
                        {rotatingWords[index]}
                      </motion.span>
                    </AnimatePresence>
                  </div>
               </div>
               <span className="flex-shrink-0 leading-none">pour</span>
            </div>
            <div className="basis-full h-0 md:h-2" />
            <div className="flex flex-wrap items-center justify-center gap-x-[0.3em] md:gap-x-[0.4em]">
               <span className="flex-shrink-0 leading-none">gagner du temps</span>
               <span className="flex-shrink-0 leading-none">au quotidien</span>
            </div>
          </div>
        ) : animatedWord ? (
          <div className="flex flex-wrap items-center justify-center gap-x-3">
            <span key={animatedWord} className="text-brand-coral inline-block animate-in slide-in-from-bottom-full duration-500 fill-mode-both">
              {animatedWord}
            </span>
            <span>pour</span>
            <div className="basis-full h-0" />
            <span className="text-brand-coral">gagner du temps</span>
            <span>au quotidien</span>
          </div>
        ) : (
          title?.split(/(Gagnez du temps|au quotidien)/).map((part, i) => (
            <span key={i} className={part === "Gagnez du temps" ? "text-brand-coral" : ""}>
              {part}
            </span>
          ))
        )}
      </h1>

      {subtitle && (
        <p className="text-sm md:text-lg text-gray-500 font-medium mb-8 md:mb-10 max-w-3xl mx-auto animate-in fade-in duration-700">
          {subtitle}
        </p>
      )}
      
      {/* Big Rounded Searchbar */}
      <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-0 group mb-4">
        <div className="max-w-xs sm:max-w-md md:max-w-3xl mx-auto relative">
          <div className="absolute inset-y-0 left-0 pl-4 md:pl-6 flex items-center pointer-events-none">
            <Search className="h-4 w-4 md:h-5 md:w-5 text-gray-400 group-focus-within:text-brand-blue/60 transition-colors" />
          </div>
          <input 
            type="text" 
            onChange={(e) => onSearch(e.target.value)}
            placeholder={placeholder}
            className="peer block w-full pl-10 md:pl-14 pr-4 md:pr-6 py-2.5 md:py-3.5 border border-brand-blue/50 rounded-full text-sm md:text-base focus:ring-4 focus:ring-brand-blue/5 focus:border-brand-blue/80 outline-none transition-all shadow-sm focus:shadow-md placeholder-gray-400 bg-white" 
          />
        </div>
      </div>

      {/* Tabs / Children slot */}
      {children}

      {/* Conditional USP Section */}
      {showUSP && <USPSection />}
    </section>
  );
}
