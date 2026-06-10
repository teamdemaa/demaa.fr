"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowLeft, Search } from "lucide-react";
import { ServiceIcon } from "@/components/ServiceIcon";
import ServiceDetailDialog from "@/components/ServiceDetailDialog";
import type { DemaaService, ServiceCategory } from "@/lib/service-catalog";

type ServiceDirectoryClientProps = {
  services: DemaaService[];
  categories: readonly ServiceCategory[];
  initialCategory?: string;
  initialSearch?: string;
  backLink?: {
    href: string;
    label: string;
  };
};

export default function ServiceDirectoryClient({
  services,
  categories,
  initialCategory,
  initialSearch = "",
  backLink,
}: ServiceDirectoryClientProps) {
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [activeCategory, setActiveCategory] = useState(
    initialCategory && categories.includes(initialCategory as ServiceCategory)
      ? initialCategory
      : "Tous"
  );
  const [selectedService, setSelectedService] = useState<DemaaService | null>(null);
  const filteredServices = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return services.filter((service) => {
      const matchesCategory =
        activeCategory === "Tous" || service.category === activeCategory;
      const matchesSearch =
        !query ||
        service.name.toLowerCase().includes(query) ||
        service.description.toLowerCase().includes(query) ||
        service.bestFor.toLowerCase().includes(query) ||
        service.tags.some((tag) => tag.toLowerCase().includes(query)) ||
        service.usefulFor.some((item) => item.toLowerCase().includes(query));

      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, searchQuery, services]);

  return (
    <div className="w-full">
      <section className="w-full border-b border-dema-line/65 bg-dema-cream px-4 pb-5 pt-8 md:pt-10">
        <div className="mx-auto max-w-5xl text-center">
          {backLink ? (
            <div className="mb-4 flex justify-start">
              <Link
                href={backLink.href}
                className="inline-flex items-center gap-2 rounded-full border border-dema-line bg-dema-paper px-3.5 py-2 text-xs font-medium text-brand-blue/70 transition hover:border-dema-forest/25 hover:text-dema-forest"
              >
                <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
                {backLink.label}
              </Link>
            </div>
          ) : null}
          <h1 className="demaa-section-title text-4xl tracking-tight text-brand-blue md:text-5xl">
            Annuaire Services
          </h1>
          <p className="mx-auto mt-2 max-w-2xl text-sm font-normal leading-relaxed text-dema-muted">
            Les services Demaa pour lancer, structurer, déléguer et développer une activité.
          </p>

          <div className="demaa-search-shell mx-auto mt-5 max-w-4xl p-1.5">
            <div className="relative">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-dema-forest/42 md:left-5 md:h-5 md:w-5" />
              <input
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Rechercher un service, un besoin, une activité..."
                className="w-full rounded-full bg-dema-paper py-3.5 pl-10 pr-5 text-sm font-normal text-brand-blue outline-none transition placeholder:text-brand-blue/36 md:py-4 md:pl-12 md:text-base"
              />
            </div>
          </div>

          <div className="mx-auto mt-3 max-w-4xl overflow-x-auto pb-2 soft-scroll">
            <div className="flex min-w-max gap-2">
              {["Tous", ...categories].map((category) => (
                <button
                  key={category}
                  type="button"
                  onClick={() => setActiveCategory(category)}
                  className={`demaa-chip shrink-0 whitespace-nowrap ${
                    activeCategory === category ? "demaa-chip-active" : ""
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-7 sm:px-6 lg:px-8">
        <div className="flex items-center justify-end pb-5">
          {(activeCategory !== "Tous" || searchQuery) ? (
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                setActiveCategory("Tous");
              }}
              className="text-xs font-medium text-dema-muted transition hover:text-dema-forest"
            >
              Réinitialiser
            </button>
          ) : null}
        </div>

        {filteredServices.length === 0 ? (
          <div className="rounded-[1.25rem] border border-dashed border-dema-line bg-dema-paper p-10 text-center">
            <h2 className="text-xl font-bold text-brand-blue">Aucun service trouvé</h2>
            <p className="mt-3 text-sm font-normal text-dema-muted">
              Essayez un autre mot-clé ou une catégorie plus large.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filteredServices.map((service) => (
              <ServiceCard
                key={service.slug}
                service={service}
                onOpenDetails={setSelectedService}
              />
            ))}
          </div>
        )}
      </section>

      {selectedService ? (
        <ServiceDetailDialog
          service={selectedService}
          source="Annuaire services"
          onClose={() => setSelectedService(null)}
        />
      ) : null}
    </div>
  );
}

function ServiceCard({
  service,
  onOpenDetails,
}: {
  service: DemaaService;
  onOpenDetails: (service: DemaaService) => void;
}) {
  const serviceSource =
    service.slug === "structuration-automatisation" ? "Demaa" : "Partenaire";

  return (
    <button
      type="button"
      onClick={() => onOpenDetails(service)}
      className="demaa-card group flex min-h-[15.5rem] flex-col rounded-[1.15rem] p-5 text-left"
    >
      <div className="flex items-center justify-between gap-4">
        <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-dema-sage text-dema-forest transition group-hover:bg-dema-forest group-hover:text-dema-paper">
          <ServiceIcon icon={service.icon} className="h-4 w-4" aria-hidden="true" />
        </span>
      </div>
      <h2 className="mt-4 text-lg font-semibold tracking-tight text-brand-blue">
        {service.name}
      </h2>
      <p className="mt-2 text-sm leading-relaxed text-dema-muted">
        {service.shortDescription}
      </p>
      <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-brand-blue/65">
        {service.bestFor}
      </p>
      <div className="mt-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex rounded-full bg-dema-forest px-3 py-1 text-[10px] font-medium text-dema-paper">
            {service.price}
          </span>
          <span className="inline-flex rounded-full bg-dema-sage/75 px-2.5 py-1 text-[10px] font-medium lowercase text-brand-blue/70">
            {service.category}
          </span>
          <span className="inline-flex rounded-full bg-dema-sage/75 px-2.5 py-1 text-[10px] font-medium lowercase text-brand-blue/70">
            {serviceSource}
          </span>
        </div>
      </div>
    </button>
  );
}
