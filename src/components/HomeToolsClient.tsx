"use client";

import { useState, useMemo } from "react";
import HeroSearch from "./HeroSearch";
import ServiceCard from "./ServiceCard";
import { ServiceRecord } from "@/lib/data";

export default function HomeToolsClient({ initialTools }: { initialTools: ServiceRecord[] }) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredTools = useMemo(() => {
    return initialTools.filter(tool => {
      const query = searchQuery.toLowerCase();
      return tool.name.toLowerCase().includes(query) || 
             tool.description.toLowerCase().includes(query) ||
             tool.category.toLowerCase().includes(query);
    });
  }, [initialTools, searchQuery]);

  return (
    <div className="w-full">
      <HeroSearch onSearch={setSearchQuery} />
      
      <div className="mt-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-32 animate-in fade-in duration-700">
        <div className="flex items-center justify-between mb-8 pr-2">
           <h2 className="text-xl md:text-2xl font-bold tracking-tight text-brand-blue">
             Tous nos <span className="text-brand-coral">outils gratuits</span>
           </h2>
           <span className="text-xs text-gray-500 font-medium bg-gray-100 px-3 py-1 rounded-full">
             {filteredTools.length} outil{filteredTools.length > 1 ? 's' : ''}
           </span>
        </div>

        {filteredTools.length === 0 ? (
          <div className="text-center text-gray-400 py-20 text-lg">
            Aucun outil trouvé pour cette recherche.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredTools.map(tool => (
              <ServiceCard 
                key={tool.id} 
                service={tool} 
                fullWidth 
                baseUrl="/outils"
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
