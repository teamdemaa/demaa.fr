"use client";

import { useState, useMemo } from "react";
import HeroSearch from "./HeroSearch";
import TagFilters from "./TagFilters";
import ServiceRow from "./ServiceRow";
import { ServiceRecord } from "@/lib/data";

export default function HomeClient({ services, allTags }: { services: ServiceRecord[], allTags: string[] }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  const filteredServices = useMemo(() => {
    return services.filter(service => {
      const matchesSearch = service.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            service.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedTag ? service.category === selectedTag : true;
      return matchesSearch && matchesCategory;
    });
  }, [services, searchQuery, selectedTag]);

  // Group services by category after filtering
  const categoriesMap = filteredServices.reduce((acc, curr) => {
    if (!acc[curr.category]) acc[curr.category] = [];
    acc[curr.category].push(curr);
    return acc;
  }, {} as Record<string, typeof services>);

  return (
    <div className="w-full">
      <HeroSearch onSearch={setSearchQuery} />
      {/* Les filtres sont masqués selon votre demande */}
      {/* <TagFilters tags={allTags} selectedTag={selectedTag} onSelectTag={setSelectedTag} /> */}
      
      <div className="mt-16 space-y-16 animate-in fade-in duration-700 pb-20">
        {Object.keys(categoriesMap).length === 0 ? (
          <div className="text-center text-gray-400 py-20 text-lg">
            Aucun service trouvé pour cette recherche.
          </div>
        ) : (
          Object.entries(categoriesMap).map(([cat, items]) => (
            <ServiceRow key={cat} title={cat} services={items} />
          ))
        )}
      </div>
    </div>
  );
}
