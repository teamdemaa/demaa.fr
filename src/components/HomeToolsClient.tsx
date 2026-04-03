"use client";

import { useState, useMemo } from "react";
import HeroSearch from "./HeroSearch";
import ServiceCard from "./ServiceCard";
import TemplateCard from "./TemplateCard";
import { ServiceRecord } from "@/lib/data";
import { TemplateRecord } from "@/lib/templates";
import { 
  Wrench, 
  PenLine, 
  Briefcase,
  Search,
} from "lucide-react";
import AutoJoinPopup from "./AutoJoinPopup";

type TabType = "outils" | "bons-plans" | "modeles";

export default function HomeToolsClient({ 
  initialTools,
  initialServices,
  initialTemplates,
  title = "Gagnez du temps au quotidien",
  placeholder = "Que cherchez-vous aujourd'hui ?"
}: { 
  initialTools: ServiceRecord[],
  initialServices: ServiceRecord[],
  initialTemplates: TemplateRecord[],
  title?: string,
  placeholder?: string
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<TabType>("outils");

  const filteredData = useMemo(() => {
    const query = searchQuery.toLowerCase();
    
    return {
      tools: initialTools.filter(t => 
        t.name.toLowerCase().includes(query) || 
        t.description.toLowerCase().includes(query) ||
        t.category.toLowerCase().includes(query)
      ),
      bonsPlans: initialServices.filter(s => 
        s.name.toLowerCase().includes(query) || 
        s.description.toLowerCase().includes(query) ||
        s.category.toLowerCase().includes(query)
      ),
      templates: initialTemplates.filter(m => 
        m.name.toLowerCase().includes(query) || 
        m.shortDescription?.toLowerCase().includes(query) ||
        m.category.toLowerCase().includes(query)
      )
    };
  }, [initialTools, initialServices, initialTemplates, searchQuery]);

  const currentItems = activeTab === "outils" ? filteredData.tools : 
                       activeTab === "bons-plans" ? filteredData.bonsPlans : 
                       filteredData.templates;

  const tabs = [
    { id: "outils", label: "Outils", icon: Wrench },
    { id: "modeles", label: "Modèles", icon: PenLine },
    { id: "bons-plans", label: "Services", icon: Briefcase },
  ];

  // Grouping logic for Services tab sections
  const sections = useMemo(() => {
    if (activeTab !== "bons-plans") return null;
    
    const categories = ["Finance - Juridique", "Opérations - Systèmes", "Croissance - Ads"];
    return categories.map(cat => ({
      title: cat,
      items: filteredData.bonsPlans.filter(item => item.category === cat)
    })).filter(section => section.items.length > 0);
  }, [activeTab, filteredData.bonsPlans]);

  return (
    <div className="w-full">
      <HeroSearch 
        onSearch={setSearchQuery} 
        rotatingWords={["Outils", "Modèles", "Services"]}
        placeholder={placeholder}
        showUSP={false}
      >
        {/* AIRBNB-STYLE TABS INTEGRATED IN HERO */}
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-2">
          <div className="flex items-center justify-center gap-12 md:gap-32 overflow-x-auto scrollbar-hide no-scrollbar">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`group flex flex-col items-center gap-2 pt-2 pb-4 min-w-[80px] md:min-w-[120px] border-b-[3px] transition-all duration-300 ${
                  activeTab === tab.id 
                    ? "border-brand-blue text-brand-blue opacity-100" 
                    : "border-transparent text-gray-400 opacity-60 hover:opacity-100 hover:text-gray-900"
                }`}
              >
                <tab.icon className={`w-6 h-6 md:w-8 md:h-8 transition-all duration-300 ${activeTab === tab.id ? "text-brand-coral scale-110" : "group-hover:scale-110"}`} />
                <span className={`text-[11px] md:text-sm font-black uppercase tracking-[0.05em] ${activeTab === tab.id ? "" : "group-hover:text-gray-900"}`}>
                  {tab.label}
                </span>
              </button>
            ))}
          </div>
        </div>
      </HeroSearch>

      <div className="mt-8 md:mt-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-32 animate-in fade-in duration-1000">
        
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 md:gap-10">
                {initialTemplates.filter(m => currentItems.map(item => item.id).includes(m.id)).map(template => (
                  <TemplateCard 
                    key={template.id} 
                    template={template} 
                  />
                ))}
              </div>
            ) : activeTab === "bons-plans" && !searchQuery ? (
              sections?.map((section) => (
                <div key={section.title} className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                  <div className="flex items-center gap-4 mb-8">
                    <h3 className="text-xl md:text-2xl font-black text-brand-blue tracking-tight shrink-0">{section.title}</h3>
                    <div className="h-px bg-gray-100 w-full" />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 md:gap-10">
                    {section.items.map(item => (
                      <ServiceCard 
                        key={item.id} 
                        service={item as ServiceRecord} 
                        fullWidth 
                        baseUrl="/services"
                        hidePrice={true}
                      />
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 md:gap-10">
                {currentItems.map(item => (
                  <ServiceCard 
                    key={item.id} 
                    service={item as ServiceRecord} 
                    fullWidth 
                    baseUrl={activeTab === "outils" ? "/outils" : "/services"}
                    hidePrice={activeTab === "bons-plans"}
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
