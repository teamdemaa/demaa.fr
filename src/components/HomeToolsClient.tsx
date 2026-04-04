"use client";

import { useState, useMemo, useEffect } from "react";
import HeroSearch from "./HeroSearch";
import ServiceCard from "./ServiceCard";
import TemplateCard from "./TemplateCard";
import { Tool, Service, Template, System } from "@/lib/types";
import { getTemplates } from "@/lib/api";
import { 
  Wrench, 
  Search,
  FileText,
  LayoutGrid
} from "lucide-react";
import AutoJoinPopup from "./AutoJoinPopup";
import TagFilters from "./TagFilters";

type TabType = "systemes" | "outils" | "modeles";

export default function HomeToolsClient({ 
  initialTools,
  initialSystems,
  placeholder = "Que cherchez-vous aujourd'hui ?"
}: { 
  initialTools: Tool[],
  initialServices: Service[],
  initialSystems: System[],
  title?: string,
  placeholder?: string
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<TabType>("outils");
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [templates, setTemplates] = useState<Template[]>([]);

  useEffect(() => {
    getTemplates().then(setTemplates);
  }, []);

  // Reset filter when tab changes
  useEffect(() => {
    setActiveFilter(null);
  }, [activeTab]);

  const availableFilters = useMemo(() => {
    if (activeTab === "systemes") {
      return Array.from(new Set(initialSystems.map(s => s.category))).sort();
    }
    if (activeTab === "outils") {
      const allTags = initialTools.flatMap(t => t.tags || []);
      return Array.from(new Set(allTags)).sort();
    }
    if (activeTab === "modeles") {
      return Array.from(new Set(templates.map(t => t.category))).sort();
    }
    return [];
  }, [activeTab, initialSystems, initialTools, templates]);

  const filteredData = useMemo(() => {
    const query = searchQuery.toLowerCase();
    
    let tools = initialTools.filter(t => 
      t.name.toLowerCase().includes(query) || 
      t.description.toLowerCase().includes(query) ||
      t.category.toLowerCase().includes(query) ||
      t.tags?.some(tag => tag.toLowerCase().includes(query))
    );

    let systems = initialSystems.filter(s => 
      s.name.toLowerCase().includes(query) || 
      s.description.toLowerCase().includes(query) ||
      s.category.toLowerCase().includes(query) ||
      s.tags?.some(tag => tag.toLowerCase().includes(query))
    );

    let filteredTemplates = templates.filter(t => 
      t.name.toLowerCase().includes(query) || 
      t.description.toLowerCase().includes(query) ||
      t.category.toLowerCase().includes(query)
    );

    if (activeFilter) {
      if (activeTab === "systemes") {
        systems = systems.filter(s => s.category === activeFilter);
      } else if (activeTab === "outils") {
        tools = tools.filter(t => t.tags?.includes(activeFilter));
      } else if (activeTab === "modeles") {
        filteredTemplates = filteredTemplates.filter(t => t.category === activeFilter);
      }
    }

    return { tools, systems, templates: filteredTemplates };
  }, [initialTools, initialSystems, templates, searchQuery, activeFilter, activeTab]);

  const currentItems = activeTab === "systemes" ? filteredData.systems :
                       activeTab === "outils" ? filteredData.tools : 
                       filteredData.templates;

  const tabs = [
    { id: "outils", label: "Outils", icon: Wrench },
    { id: "modeles", label: "Modèles", icon: FileText },
    { id: "systemes", label: "Systèmes", icon: LayoutGrid },
  ];

  const tabsComponent = (
    <div className="w-full max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
      <div className="flex items-center justify-center gap-6 md:gap-32 overflow-x-auto scrollbar-hide no-scrollbar">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as TabType)}
            className={`group flex flex-col items-center flex-1 md:flex-none gap-2 pt-2 pb-1 min-w-[80px] md:min-w-[120px] border-b-2 transition-all duration-300 ${
              activeTab === tab.id 
                ? "border-brand-blue text-brand-blue opacity-100" 
                : "border-transparent text-gray-400 opacity-60 hover:opacity-100 hover:text-gray-900"
            }`}
          >
            <tab.icon className={`w-6 h-6 md:w-7 md:h-7 transition-all duration-300 ${activeTab === tab.id ? "text-brand-coral scale-110" : "group-hover:scale-110"}`} />
            <span className={`text-[11px] md:text-xs font-black uppercase tracking-[0.05em] ${activeTab === tab.id ? "" : "group-hover:text-gray-900"}`}>
              {tab.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );

  const filtersComponent = availableFilters.length > 0 ? (
    <div className="w-full max-w-4xl mx-auto px-4 mt-2">
      <div className="flex overflow-x-auto space-x-2 pb-2 no-scrollbar items-center justify-center">
        <button 
          onClick={() => setActiveFilter(null)}
          className={`whitespace-nowrap rounded-full px-5 py-1.5 text-xs transition-all ${
            activeFilter === null 
              ? "bg-brand-blue text-white shadow-md font-medium" 
              : "bg-brand-coral/10 text-brand-blue/70 font-light hover:bg-brand-coral/20"
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
                : "bg-brand-coral/10 text-brand-blue/70 font-light hover:bg-brand-coral/20"
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
        rotatingWords={["Systèmes", "Outils", "Modèles"]}
        placeholder={placeholder}
        showUSP={false}
        topSlot={tabsComponent}
        bottomSlot={filtersComponent}
      />

      <div className="mt-4 md:mt-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-32 animate-in fade-in duration-1000">
        
        {/* Active Tab Helper (Subtle Search results only) */}
        {searchQuery && (
          <div className="mb-10 pb-6 border-b border-gray-100/50">
             <div className="flex items-center gap-2 px-6 py-3 bg-brand-blue/5 rounded-full w-fit text-xs font-bold text-brand-blue uppercase tracking-widest">
                <Search className="w-3.5 h-3.5" />
                Résultats pour : <span className="text-brand-coral ml-1">"{searchQuery}"</span>
             </div>
          </div>
        )}

        {currentItems.length === 0 ? (
          <div className="text-center py-32 bg-gray-50/50 rounded-[3rem] border-2 border-dashed border-gray-100 mb-20 animate-in fade-in duration-700">
            <div className="w-20 h-20 bg-white rounded-3xl shadow-sm flex items-center justify-center mx-auto mb-6">
              <Search className="w-8 h-8 text-gray-200" />
            </div>
            <h3 className="text-xl font-bold text-gray-400 tracking-tight">Aucune ressource trouvée</h3>
            <p className="text-sm text-gray-300 mt-3 max-w-xs mx-auto">Essayez d'ajuster vos mots-clés ou l'onglet sélectionné.</p>
          </div>
        ) : (
          <div className="space-y-20">
            {activeTab === "modeles" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
                {(currentItems as Template[]).map((item: Template) => (
                  <TemplateCard 
                    key={item.id} 
                    template={item} 
                  />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 md:gap-10">
                {(currentItems as (Tool | System)[]).map((item) => (
                  <ServiceCard 
                    key={item.id} 
                    //@ts-ignore
                    service={item} 
                    fullWidth 
                    baseUrl={activeTab === "outils" ? "/outils" : "/systemes"}
                    hidePrice={activeTab === "systemes"}
                  />
                ))}
              </div>
            )}
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
