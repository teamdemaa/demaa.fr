"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import type { System } from "@/lib/types";
import type { OperationalSystemDetail, SystemPillar } from "@/lib/system-operations";

type SystemsCatalogClientProps = {
  systems: System[];
  detailsBySlug: Record<string, OperationalSystemDetail>;
  showIntro?: boolean;
  pageSize?: number;
};

const PILLARS: SystemPillar[] = [
  "Stratégie",
  "Marketing & Vente",
  "Opérations",
  "Finance & Juridique",
  "Équipe",
];

export default function SystemsCatalogClient({
  systems,
  detailsBySlug,
  showIntro = true,
  pageSize = 8,
}: SystemsCatalogClientProps) {
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"processus" | "outils">("processus");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeSector, setActiveSector] = useState("Tous");
  const [currentPage, setCurrentPage] = useState(1);

  const sectors = useMemo(
    () => [
      "Tous",
      ...Array.from(
        new Set(
          systems.map((system) => detailsBySlug[system.slug]?.sectorLabel ?? "Services & conseil")
        )
      ),
    ],
    [detailsBySlug, systems]
  );

  const filteredSystems = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return systems.filter((system) => {
      const detail = detailsBySlug[system.slug];
      const sectorLabel = detail?.sectorLabel ?? "Services & conseil";

      const matchesSearch =
        !query ||
        system.name.toLowerCase().includes(query) ||
        system.description.toLowerCase().includes(query) ||
        system.tags.some((tag) => tag.toLowerCase().includes(query)) ||
        sectorLabel.toLowerCase().includes(query) ||
        detail?.editorialSubtitle.toLowerCase().includes(query);

      const matchesSector = activeSector === "Tous" || sectorLabel === activeSector;

      return matchesSearch && matchesSector;
    });
  }, [activeSector, detailsBySlug, searchQuery, systems]);

  const totalPages = Math.max(1, Math.ceil(filteredSystems.length / pageSize));
  const visibleSystems = filteredSystems.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const selectedSystem = useMemo(
    () => systems.find((system) => system.slug === selectedSlug) ?? null,
    [selectedSlug, systems]
  );
  const detail = selectedSlug ? detailsBySlug[selectedSlug] : null;

  return (
    <>
      <section
        className={
          showIntro
            ? "w-full border-b border-brand-blue/5 bg-[#FFF9F8] px-4 pb-12 pt-14 md:pb-16 md:pt-24"
            : "w-full"
        }
      >
        <div className="mx-auto max-w-6xl">
          {showIntro ? (
            <div className="max-w-3xl">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-brand-coral">
                Entreprises & systèmes
              </p>
              <h1 className="mt-3 demaa-section-title text-4xl tracking-tight text-brand-blue md:text-5xl">
                Les processus essentiels par entreprise
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-relaxed text-gray-600">
                Un catalogue d&apos;entreprises pour voir les systèmes à mettre en place,
                les processus prioritaires et les outils métiers les plus utiles.
              </p>
            </div>
          ) : null}

          <div className={showIntro ? "mt-10" : ""}>
            <div className="mx-auto max-w-4xl rounded-full border border-brand-blue/5 bg-white p-1.5 shadow-[0_10px_30px_rgba(25,27,48,0.035)]">
              <div className="relative">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-300" />
                <input
                  value={searchQuery}
                  onChange={(event) => {
                    setSearchQuery(event.target.value);
                    setCurrentPage(1);
                  }}
                  placeholder="Rechercher une entreprise, un processus, un outil..."
                  className="w-full rounded-full bg-white py-3 pl-10 pr-5 text-sm font-normal text-brand-blue outline-none transition placeholder:text-brand-blue/40"
                />
              </div>
            </div>

            <div className="mx-auto mt-5 max-w-4xl overflow-x-auto pb-2 soft-scroll">
              <div className="flex min-w-max justify-center gap-2 px-1">
                {sectors.map((sector) => (
                  <button
                    key={sector}
                    type="button"
                    onClick={() => {
                      setActiveSector(sector);
                      setCurrentPage(1);
                    }}
                    className={`whitespace-nowrap rounded-full px-4 py-2 text-xs transition ${
                      activeSector === sector
                        ? "bg-brand-blue text-white shadow-sm"
                        : "bg-[#FFF3EF] text-brand-blue/65 hover:bg-brand-coral/15"
                    }`}
                  >
                    {sector}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-8 px-4 py-2 md:mt-10 md:py-4">
            <p className="max-w-3xl text-left text-base italic font-normal leading-relaxed text-brand-blue/80 md:text-[1.15rem]">
              Choisissez votre entreprise et consultez les processus et les outils
            </p>
          </div>

          <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {visibleSystems.map((system) => {
              const detail = detailsBySlug[system.slug];

              return (
                <button
                  key={system.id}
                  type="button"
                  onClick={() => {
                    setSelectedSlug(system.slug);
                    setActiveTab("processus");
                  }}
                  className="group flex h-full cursor-pointer flex-col rounded-[1.25rem] border border-brand-blue/8 bg-white p-5 text-left shadow-[0_8px_24px_rgba(25,27,48,0.025)] transition hover:-translate-y-0.5 hover:border-brand-coral/25 hover:shadow-[0_16px_42px_rgba(25,27,48,0.06)] md:p-6"
                >
                  <div>
                    <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-brand-coral">
                      {detail?.sectorLabel ?? "Système opérationnel"}
                    </p>
                    <h2 className="mt-1.5 text-lg font-bold tracking-tight text-brand-blue">
                      {system.name}
                    </h2>
                  </div>

                  <p className="mt-4 text-sm font-normal leading-relaxed text-gray-600">
                    {detail?.editorialSubtitle ?? system.description}
                  </p>

                  <div className="mt-5 flex flex-wrap gap-2">
                    {[detail?.sectorLabel, ...system.tags]
                      .filter(Boolean)
                      .slice(0, 2)
                      .map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full bg-[#FFF3EF] px-2.5 py-1 text-[10px] font-normal text-brand-blue/70"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                </button>
              );
            })}
          </div>

          {totalPages > 1 ? (
            <div className="mt-6 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                disabled={currentPage === 1}
                className="rounded-full border border-brand-blue/10 bg-white px-4 py-2 text-sm font-medium text-brand-blue transition disabled:cursor-not-allowed disabled:opacity-35"
              >
                Précédent
              </button>
              <span className="text-sm text-brand-blue/65">
                Page {currentPage} / {totalPages}
              </span>
              <button
                type="button"
                onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                disabled={currentPage === totalPages}
                className="rounded-full border border-brand-blue/10 bg-white px-4 py-2 text-sm font-medium text-brand-blue transition disabled:cursor-not-allowed disabled:opacity-35"
              >
                Suivant
              </button>
            </div>
          ) : null}
        </div>
      </section>

      {selectedSystem && detail ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-brand-blue/35 p-4"
          onClick={() => setSelectedSlug(null)}
        >
          <div
            className="max-h-[92vh] w-full max-w-7xl overflow-y-auto rounded-[1.25rem] bg-[#FFF9F8] p-6 shadow-[0_30px_80px_rgba(25,27,48,0.18)] md:p-8"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 text-left">
                <p className="text-left text-[11px] font-semibold uppercase tracking-[0.18em] text-brand-coral">
                  {selectedSystem.name}
                </p>
                <h2 className="mt-2 text-3xl font-semibold tracking-tight text-brand-blue md:text-4xl">
                  {`Système ${selectedSystem.name}`}
                </h2>
                <p className="mt-3 max-w-3xl text-base leading-relaxed text-gray-600">
                  {selectedSystem.description}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedSlug(null)}
                className="rounded-full border border-brand-blue/10 bg-white px-4 py-2 text-sm font-medium text-brand-blue transition hover:border-brand-coral/20 hover:text-brand-coral"
              >
                Fermer
              </button>
            </div>

            <div className="mt-6 flex items-center gap-2">
              <button
                type="button"
                onClick={() => setActiveTab("processus")}
                className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                  activeTab === "processus"
                    ? "bg-brand-blue text-white"
                    : "bg-white text-brand-blue/70"
                }`}
              >
                Processus
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("outils")}
                className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                  activeTab === "outils"
                    ? "bg-brand-blue text-white"
                    : "bg-white text-brand-blue/70"
                }`}
              >
                Outils
              </button>
            </div>

            {activeTab === "processus" ? (
              <div className="mt-6 overflow-x-auto pb-2 soft-scroll">
                <div className="mx-auto flex min-w-max justify-center gap-4">
                  {PILLARS.map((pillar) => {
                    const pillarCards = detail.processes.filter(
                      (process) => process.pillar === pillar
                    );

                    return (
                      <div
                        key={pillar}
                        className="w-[18rem] shrink-0 rounded-[1.75rem] bg-white p-4 shadow-[0_8px_24px_rgba(25,27,48,0.025)]"
                      >
                        <h3 className="text-sm font-semibold text-brand-blue">{pillar}</h3>
                        <div className="mt-4 space-y-3">
                          {pillarCards.length > 0 ? (
                            pillarCards.map((process) => (
                              <article
                                key={process.title}
                                className="rounded-[1.25rem] border border-brand-blue/8 bg-transparent p-3 text-left shadow-none"
                              >
                                <h4 className="text-left text-sm font-semibold leading-snug text-brand-blue">
                                  {process.title}
                                </h4>
                                <p className="mt-2 text-left text-xs leading-relaxed text-gray-600">
                                  {process.description}
                                </p>
                              </article>
                            ))
                          ) : (
                            <div className="rounded-[1.25rem] border border-brand-blue/8 bg-transparent p-3">
                              <p className="text-left text-xs leading-relaxed text-gray-500">
                                Pas de processus prioritaire ajouté pour ce pilier.
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {detail.tools.map((tool) => (
                  <article
                    key={tool.name}
                    className="rounded-[1.75rem] border border-brand-blue/8 bg-white p-5 text-left transition hover:-translate-y-0.5 hover:border-brand-coral/20 hover:shadow-[0_16px_40px_rgba(25,27,48,0.05)]"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-brand-coral">
                          {tool.type}
                        </p>
                        <h3 className="mt-2 text-lg font-semibold text-brand-blue">
                          {tool.name}
                        </h3>
                      </div>
                      <span
                        className={`rounded-full px-3 py-1 text-[10px] font-medium ${
                          tool.priority === "Principal"
                            ? "bg-brand-blue text-white"
                            : "bg-[#FFF3EF] text-brand-blue/75"
                        }`}
                      >
                        {tool.priority}
                      </span>
                    </div>
                    <p className="mt-3 text-sm leading-relaxed text-gray-600">
                      {tool.usage}
                    </p>
                  </article>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : null}
    </>
  );
}
