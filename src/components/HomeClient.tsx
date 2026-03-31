"use client";

import { useState, useMemo } from "react";
import HeroSearch from "./HeroSearch";
import ServiceRow from "./ServiceRow";
import ServiceCard from "./ServiceCard";
import { ServiceRecord } from "@/lib/data";

export default function HomeClient({ services, allTags }: { services: ServiceRecord[], allTags: string[] }) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredServices = useMemo(() => {
    return services.filter(service => {
      const query = searchQuery.toLowerCase();
      return service.name.toLowerCase().includes(query) || 
             service.description.toLowerCase().includes(query) ||
             service.category.toLowerCase().includes(query);
    });
  }, [services, searchQuery]);

  // Specific grouping logic
  const financeServices = filteredServices.filter(s => s.category === "Finance - Juridique");
  const otherServices = filteredServices.filter(s => s.category !== "Finance - Juridique");

  return (
    <div className="w-full">
      <HeroSearch onSearch={setSearchQuery} />
      
      <div className="mt-12 space-y-12 animate-in fade-in duration-700 pb-20">
        {filteredServices.length === 0 ? (
          <div className="text-center text-gray-400 py-20 text-lg">
            Aucun service trouvé pour cette recherche.
          </div>
        ) : (
          <>
            {/* 1. Scrolling Row for Finance & Juridique */}
            {financeServices.length > 0 && (
              <ServiceRow title="Finance - Juridique" services={financeServices} />
            )}

            {/* 2. Static Grid for all other categories */}
            {otherServices.length > 0 && (
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between mb-2 pr-2">
                  <h2 className="text-lg font-light tracking-wide text-brand-blue/80">
                    Autres Catégories
                  </h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pt-4">
                  {otherServices.map(service => (
                    <ServiceCard 
                      key={service.id} 
                      service={service} 
                      fullWidth 
                    />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
