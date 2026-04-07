"use client";

import { useState, useMemo } from "react";
import HeroSearch from "./HeroSearch";
import ServiceCard from "./ServiceCard";
import { Tool } from "@/lib/types";
import { Search } from "lucide-react";
import AutoJoinPopup from "./AutoJoinPopup";

type ToolFilterGroup = {
  label: string;
  matches: (tool: Tool) => boolean;
};

export default function HomeToolsClient({ 
  initialTools,
  title,
  subtitle,
  filterMode = "tags",
}: { 
  initialTools: Tool[],
  title?: React.ReactNode,
  subtitle?: React.ReactNode,
  placeholder?: string,
  filterMode?: "tags" | "tools-groups"
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<string | null>(null);

  const toolFilterGroups = useMemo<ToolFilterGroup[]>(() => {
    if (filterMode !== "tools-groups") return [];

    return [
      {
        label: "QR Code",
        matches: (tool) =>
          tool.slug.includes("qr-code") ||
          tool.tags?.some((tag) => tag.toLowerCase() === "qr"),
      },
      {
        label: "Visibilité locale",
        matches: (tool) =>
          tool.slug.includes("fiche-google") ||
          tool.tags?.some((tag) =>
            ["google", "seo", "avis"].includes(tag.toLowerCase())
          ),
      },
      {
        label: "Signature & documents",
        matches: (tool) =>
          ["signature-pro", "signez-un-document-electroniquement"].includes(tool.slug),
      },
      {
        label: "Image & admin",
        matches: (tool) => ["generation-de-tampon"].includes(tool.slug),
      },
    ];
  }, [filterMode]);

  const availableFilters = useMemo(() => {
    if (filterMode === "tools-groups") {
      return toolFilterGroups.map((group) => group.label);
    }

    const allTags = initialTools.flatMap(t => t.tags || []);
    return Array.from(new Set(allTags)).sort();
  }, [filterMode, initialTools, toolFilterGroups]);

  const filteredData = useMemo(() => {
    const query = searchQuery.toLowerCase();
    
    let tools = initialTools.filter(t => 
      t.name.toLowerCase().includes(query) || 
      t.description.toLowerCase().includes(query) ||
      t.category.toLowerCase().includes(query) ||
      t.tags?.some(tag => tag.toLowerCase().includes(query))
    );

    if (activeFilter) {
      if (filterMode === "tools-groups") {
        const selectedGroup = toolFilterGroups.find((group) => group.label === activeFilter);
        if (selectedGroup) {
          tools = tools.filter((tool) => selectedGroup.matches(tool));
        }
      } else {
        tools = tools.filter(t => t.tags?.includes(activeFilter));
      }
    }

    return tools;
  }, [activeFilter, filterMode, initialTools, searchQuery, toolFilterGroups]);

  const currentItems = filteredData;

  const filtersComponent = availableFilters.length > 0 ? (
    <div className="w-full max-w-4xl mx-auto px-4 mt-2">
      <div className="flex overflow-x-auto space-x-2 pb-2 no-scrollbar items-center justify-center">
        <button 
          onClick={() => setActiveFilter(null)}
          className={`whitespace-nowrap rounded-full px-5 py-1.5 text-xs transition-all ${
            activeFilter === null 
              ? "bg-brand-blue text-white shadow-md font-medium" 
              : "bg-[#FFF3EF] text-brand-blue/70 font-light hover:bg-brand-coral/20"
          }`}
        >
          Tous
        </button>
        
        {availableFilters.map((filter: string) => (
          <button
            key={filter}
            onClick={() => setActiveFilter(filter)}
            className={`whitespace-nowrap rounded-full px-5 py-1.5 text-xs transition-all ${
              activeFilter === filter 
                ? "bg-brand-blue text-white shadow-md font-medium" 
                : "bg-[#FFF3EF] text-brand-blue/70 font-light hover:bg-brand-coral/20"
            }`}
          >
            {filter}
          </button>
        ))}
      </div>
    </div>
  ) : null;

  return (
    <div className="w-full">
      <HeroSearch 
        onSearch={setSearchQuery} 
        title={title}
        subtitle={subtitle}
        placeholder="Que cherchez-vous aujourd'hui ? (ex: QR code, Compta...)"
        showUSP={false}
        bottomSlot={filtersComponent}
      />

      <div className="mt-4 md:mt-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-32 animate-in fade-in duration-1000">
        
        {/* Search results helper */}
        {searchQuery && (
          <div className="mb-10 pb-6 border-b border-gray-100/50">
             <div className="flex items-center gap-2 px-6 py-3 bg-brand-blue/5 rounded-full w-fit text-xs font-bold text-brand-blue uppercase tracking-widest">
                <Search className="w-3.5 h-3.5" />
                Résultats pour : <span className="text-brand-coral ml-1">&quot;{searchQuery}&quot;</span>
             </div>
          </div>
        )}

        {currentItems.length === 0 ? (
          <div className="text-center py-32 bg-gray-50/50 rounded-[3rem] border-2 border-dashed border-gray-100 mb-20 animate-in fade-in duration-700">
            <div className="w-20 h-20 bg-white rounded-3xl shadow-sm flex items-center justify-center mx-auto mb-6">
              <Search className="w-8 h-8 text-gray-200" />
            </div>
            <h3 className="text-xl font-bold text-gray-400 tracking-tight">Aucun outil trouvé</h3>
            <p className="text-sm text-gray-300 mt-3 max-w-xs mx-auto">Essayez d&apos;ajuster vos mots-clés ou les filtres.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 md:gap-10">
            {currentItems.map((item) => (
              <ServiceCard 
                key={item.id} 
                service={item as never} 
                fullWidth 
                baseUrl="/outils"
              />
            ))}
          </div>
        )}
      </div>

      <AutoJoinPopup />

      <style jsx global>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
