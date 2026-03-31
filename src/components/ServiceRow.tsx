"use client";

import { useRef, useState, useEffect } from "react";
import { ChevronRight, ChevronLeft } from "lucide-react";
import ServiceCard from "./ServiceCard";
import { ServiceRecord } from "@/lib/data";

export default function ServiceRow({ title, services }: { title: string, services: ServiceRecord[] }) {
  const rowRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(false);

  const checkArrows = () => {
    if (!rowRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = rowRef.current;
    setShowLeftArrow(scrollLeft > 0);
    // Add a small 5px buffer to prevent precision issues
    setShowRightArrow(Math.ceil(scrollLeft + clientWidth) < scrollWidth - 5);
  };

  useEffect(() => {
    // Initial check when component mounts or services load
    checkArrows();
    // Add resize listener to recheck
    window.addEventListener('resize', checkArrows);
    return () => window.removeEventListener('resize', checkArrows);
  }, [services]);

  const scrollLeft = () => {
    if (rowRef.current) {
      rowRef.current.scrollBy({ left: -400, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    if (rowRef.current) {
      rowRef.current.scrollBy({ left: 400, behavior: "smooth" });
    }
  };

  if (services.length === 0) return null;

  return (
    <div className="mb-16 relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between mb-6 pr-2">
        <h2 className="text-2xl font-bold tracking-tight text-brand-blue">
          {title}
        </h2>
        {/* Mobile Swipe Indicator */}
        {showRightArrow && (
          <div 
            className="flex md:hidden items-center justify-center w-10 h-10 rounded-full bg-brand-coral/10 text-brand-coral animate-pulse shrink-0" 
          >
            <ChevronRight className="w-5 h-5 ml-0.5" />
          </div>
        )}
      </div>

      {/* Desktop Navigation Arrows */}
      {showLeftArrow && (
        <button 
          onClick={scrollLeft}
          className="absolute -left-5 top-1/2 -translate-y-1/2 z-10 w-14 h-14 bg-brand-coral/10 rounded-full text-brand-coral hover:bg-brand-coral/20 hover:scale-105 transition-all hidden md:flex items-center justify-center shadow-sm"
        >
          <ChevronLeft className="w-8 h-8 mr-0.5" />
        </button>
      )}

      {showRightArrow && (
        <button 
          onClick={scrollRight}
          className="absolute -right-5 top-1/2 -translate-y-1/2 z-10 w-14 h-14 bg-brand-coral/10 rounded-full text-brand-coral hover:bg-brand-coral/20 hover:scale-105 transition-all hidden md:flex items-center justify-center shadow-sm"
        >
          <ChevronRight className="w-8 h-8 ml-0.5" />
        </button>
      )}

      {/* Scrollable Container */}
      <div 
        ref={rowRef}
        onScroll={checkArrows}
        className="flex overflow-x-auto gap-6 pb-10 pt-4 no-scrollbar scroll-smooth snap-x snap-mandatory"
      >
        {services.map((service) => (
          <ServiceCard key={service.id} service={service} />
        ))}
      </div>
    </div>
  );
}
