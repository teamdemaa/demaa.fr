"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Wrench } from "lucide-react";

export default function Navbar() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <nav className="sticky top-0 z-40 bg-[#FFF9F8] border-b border-brand-coral/10 py-1">
      <div className="max-w-6xl mx-auto px-4 md:px-6 lg:pl-14 lg:pr-28">
        <div className="flex justify-between py-3 md:py-4 items-center">
          {/* Logo */}
          <Link href="/" className="text-xl sm:text-2xl font-bold tracking-tight text-brand-blue shrink-0 z-50">
            Demaa<span className="text-brand-coral">.</span>
          </Link>

          {/* New Tools Link */}
          <div className="flex items-center space-x-8">
            <Link 
              href="/outils-gratuits" 
              className="group flex items-center space-x-2 text-brand-blue hover:text-brand-coral transition-all duration-300 font-bold"
            >
              <Wrench className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300" />
              <span className="hidden sm:inline">Outils Gratuits</span>
              <span className="sm:hidden">Outils</span>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
