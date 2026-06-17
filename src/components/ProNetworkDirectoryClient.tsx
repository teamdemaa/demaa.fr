"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, type MouseEvent } from "react";
import { ArrowLeft } from "lucide-react";
import ProNetworkDetailDialog from "@/components/ProNetworkDetailDialog";
import SearchFilterControls from "@/components/SearchFilterControls";
import { ServiceIcon } from "@/components/ServiceIcon";
import { getProNetworkCardBadge } from "@/lib/card-badges";
import { matchesSearchQuery } from "@/lib/search";
import {
  type DemaaProNetwork,
  type ProNetworkCategory,
} from "@/lib/pro-network-catalog";

type ProNetworkDirectoryClientProps = {
  networks: DemaaProNetwork[];
  categories: readonly ProNetworkCategory[];
  initialCategory?: string;
  initialSearch?: string;
  backLink?: {
    href: string;
    label: string;
  };
};

export default function ProNetworkDirectoryClient({
  networks,
  categories,
  initialCategory,
  initialSearch = "",
  backLink,
}: ProNetworkDirectoryClientProps) {
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [activeCategory, setActiveCategory] = useState(
    initialCategory && categories.includes(initialCategory as ProNetworkCategory)
      ? initialCategory
      : "Tous"
  );
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
  const [selectedNetwork, setSelectedNetwork] = useState<DemaaProNetwork | null>(null);

  useEffect(() => {
    function handlePopState() {
      setSelectedNetwork(null);
    }

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  const filteredNetworks = useMemo(() => {
    return networks.filter((network) => {
      const matchesCategory =
        activeCategory === "Tous" || network.category === activeCategory;
      const matchesSearch = matchesSearchQuery(searchQuery, [
        network.name,
        network.description,
        network.bestFor,
        ...network.tags,
        ...network.usefulFor,
        network.category,
        network.slug,
      ]);

      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, networks, searchQuery]);
  const filters = useMemo(() => ["Tous", ...categories], [categories]);

  function openNetworkDetails(network: DemaaProNetwork) {
    setSelectedNetwork(network);
    const detailUrl = `/annuaire-reseaux-pro/${network.slug}`;

    if (window.location.pathname !== detailUrl) {
      window.history.pushState({ demaaProNetworkModal: true }, "", detailUrl);
    }
  }

  function closeNetworkDetails() {
    if (window.history.state?.demaaProNetworkModal) {
      window.history.back();
      return;
    }

    setSelectedNetwork(null);
  }

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
            Annuaire Réseaux Pro
          </h1>
          <p className="mx-auto mt-2 max-w-2xl text-sm font-normal leading-relaxed text-dema-muted">
            Les réseaux, organisations, prescripteurs et événements utiles pour gagner en crédibilité et développer l’activité.
          </p>

          <div className="mt-5">
            <SearchFilterControls
              value={searchQuery}
              placeholder="Rechercher un réseau, un prescripteur, une organisation..."
              activeFilter={activeCategory}
              defaultFilter="Tous"
              isFilterOpen={isFilterPanelOpen}
              filters={filters}
              onChange={setSearchQuery}
              onFilterClick={() => setIsFilterPanelOpen((current) => !current)}
              onFilterSelect={(filter) => {
                setActiveCategory(filter);
                setIsFilterPanelOpen(false);
              }}
            />
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

        {filteredNetworks.length === 0 ? (
          <div className="rounded-[1.25rem] border border-dashed border-dema-line bg-dema-paper p-10 text-center">
            <h2 className="text-xl font-bold text-brand-blue">Aucun réseau pro trouvé</h2>
            <p className="mt-3 text-sm font-normal text-dema-muted">
              Essayez un autre mot-clé ou une catégorie plus large.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filteredNetworks.map((network) => (
              <Link
                key={network.slug}
                href={`/annuaire-reseaux-pro/${network.slug}`}
                className="demaa-card group flex min-h-[16rem] flex-col rounded-[1.15rem] p-5 text-left"
                onClick={(event) => handleNetworkCardClick(event, network, openNetworkDetails)}
              >
                <div className="flex items-center justify-between gap-4">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-dema-sage text-dema-forest transition group-hover:bg-dema-forest group-hover:text-dema-paper">
                    <ServiceIcon icon={network.icon} className="h-4 w-4" aria-hidden="true" />
                  </span>
                </div>
                <h2 className="mt-4 text-lg font-semibold tracking-tight text-brand-blue">
                  {network.name}
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-dema-muted">
                  {network.shortDescription}
                </p>
                <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-brand-blue/65">
                  {network.bestFor}
                </p>
                {getProNetworkCardBadge(network) ? (
                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    <span className="inline-flex rounded-full bg-dema-sage/75 px-3 py-1 text-[10px] font-medium text-brand-blue/70">
                      {getProNetworkCardBadge(network)}
                    </span>
                  </div>
                ) : null}
              </Link>
            ))}
          </div>
        )}
      </section>

      {selectedNetwork ? (
        <ProNetworkDetailDialog network={selectedNetwork} onClose={closeNetworkDetails} />
      ) : null}
    </div>
  );
}

function handleNetworkCardClick(
  event: MouseEvent<HTMLAnchorElement>,
  network: DemaaProNetwork,
  onOpenDetails: (network: DemaaProNetwork) => void,
) {
  if (
    event.defaultPrevented ||
    event.button !== 0 ||
    event.metaKey ||
    event.ctrlKey ||
    event.shiftKey ||
    event.altKey
  ) {
    return;
  }

  event.preventDefault();
  onOpenDetails(network);
}
