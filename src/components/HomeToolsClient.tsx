"use client";

import { useState, useMemo } from "react";
import HeroSearch from "./HeroSearch";
import ServiceCard from "./ServiceCard";
import { ServiceRecord } from "@/lib/data";

export default function HomeToolsClient({ 
  initialTools,
  title = "Les outils gratuits pour vous faire gagner du temps au quotidien",
  placeholder = "Rechercher un outil gratuit"
}: { 
  initialTools: ServiceRecord[],
  title?: string,
  placeholder?: string
}) {
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
      <HeroSearch 
        onSearch={setSearchQuery} 
        title={title} 
        placeholder={placeholder}
        showUSP={false}
      />
      
      <div className="mt-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-32 animate-in fade-in duration-700">

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
