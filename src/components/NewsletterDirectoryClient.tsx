"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowRight, Mail } from "lucide-react";
import LibraryIndexHeader from "@/components/LibraryIndexHeader";
import { matchesSearchQuery } from "@/lib/search";
import type { NewsletterDirectoryEntry } from "@/lib/newsletter-content";

type NewsletterDirectoryClientProps = {
  entries: NewsletterDirectoryEntry[];
};

export default function NewsletterDirectoryClient({
  entries,
}: NewsletterDirectoryClientProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("Tous");
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);

  const filters = useMemo(() => {
    const sectorFilters = Array.from(
      new Set(entries.map((entry) => entry.sectorLabel).filter(Boolean)),
    );

    return ["Tous", ...sectorFilters];
  }, [entries]);

  const filteredEntries = useMemo(() => {
    return entries.filter((entry) => {
      const matchesSearch = matchesSearchQuery(searchQuery, [
        entry.title,
        entry.description,
        entry.sectorLabel,
        entry.slug,
        ...entry.tags,
      ]);

      const matchesFilter = activeFilter === "Tous" || entry.sectorLabel === activeFilter;

      return matchesSearch && matchesFilter;
    });
  }, [activeFilter, entries, searchQuery]);

  const entriesBySlug = useMemo(
    () => Object.fromEntries(entries.map((entry) => [entry.slug, entry])),
    [entries],
  );

  const specificEntries = useMemo(
    () => filteredEntries.filter((entry) => entry.kind === "specific"),
    [filteredEntries],
  );

  const sectorEntries = useMemo(
    () => filteredEntries.filter((entry) => entry.kind === "sector"),
    [filteredEntries],
  );

  function renderNewsletterCard(entry: NewsletterDirectoryEntry) {
    const parentEntry = entry.parentSlug ? entriesBySlug[entry.parentSlug] : null;

    return (
      <Link
        key={entry.slug}
        href={`/annuaire-newsletters/${entry.slug}`}
        className="block h-full group"
      >
        <article className="flex h-full flex-col overflow-hidden rounded-3xl border border-gray-100 bg-white transition-all duration-300 group-hover:-translate-y-0.5 group-hover:shadow-[0_6px_18px_rgba(0,0,0,0.045)]">
          <div className="flex aspect-[16/10] items-end justify-between gap-3 border-b border-gray-100 bg-[linear-gradient(135deg,#f8f5ef_0%,#f3efe6_100%)] p-5">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-brand-blue">
              <Mail className="h-3.5 w-3.5" />
              {entry.kind === "specific" ? "Newsletter métier" : "Newsletter secteur"}
            </span>
            <span className="rounded-full bg-brand-blue px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-white">
              {entry.frequency}
            </span>
          </div>
          <div className="flex flex-1 flex-col p-6">
            <div className="flex items-center justify-between gap-4">
              <span className="rounded-full bg-neutral-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-neutral-700">
                {entry.sectorLabel}
              </span>
            </div>
            <h2 className="mt-4 text-[1.85rem] font-normal leading-tight text-brand-blue transition-colors group-hover:text-neutral-700">
              {entry.title}
            </h2>
            <p className="mt-3 leading-relaxed text-gray-500">
              {entry.description}
            </p>
            {parentEntry ? (
              <p className="mt-3 text-xs font-medium text-dema-muted">
                Rattachée à : <span className="text-brand-blue">{parentEntry.title}</span>
              </p>
            ) : null}
            <div className="mt-4 flex flex-wrap gap-2">
              {entry.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-dema-sage/75 px-2.5 py-1 text-[10px] font-medium text-brand-blue/75"
                >
                  {tag}
                </span>
              ))}
            </div>
            <div className="mt-5 flex justify-end">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-50 text-brand-blue transition-colors group-hover:bg-neutral-100 group-hover:text-neutral-700">
                <ArrowRight className="h-5 w-5" />
              </div>
            </div>
          </div>
        </article>
      </Link>
    );
  }

  return (
    <div className="w-full">
      <LibraryIndexHeader
        title="Annuaire newsletters"
        description="Retrouvez les newsletters Demaa par secteur d'activité, avec leurs articles publics et la possibilité de vous abonner aux prochaines éditions."
        searchValue={searchQuery}
        searchPlaceholder="Rechercher une newsletter, un secteur, un sujet..."
        activeFilter={activeFilter}
        defaultFilter="Tous"
        isFilterOpen={isFilterPanelOpen}
        filters={filters}
        onSearchChange={setSearchQuery}
        onFilterClick={() => setIsFilterPanelOpen((current) => !current)}
        onFilterSelect={(filter) => {
          setActiveFilter(filter);
          setIsFilterPanelOpen(false);
        }}
      />

      <section className="mx-auto max-w-6xl px-4 py-7">
        {!searchQuery && activeFilter === "Tous" ? (
          <div className="mb-6 grid gap-4 md:grid-cols-3">
            <div className="rounded-[1.15rem] border border-dema-line bg-dema-paper p-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-dema-forest">
                Annuaire global
              </p>
              <p className="mt-2 text-3xl font-semibold text-brand-blue">{entries.length}</p>
              <p className="mt-2 text-sm leading-relaxed text-dema-muted">
                newsletters publiques actuellement structurées dans Demaa.
              </p>
            </div>
            <div className="rounded-[1.15rem] border border-dema-line bg-dema-paper p-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-dema-forest">
                Newsletters métier
              </p>
              <p className="mt-2 text-3xl font-semibold text-brand-blue">{entries.filter((entry) => entry.kind === "specific").length}</p>
              <p className="mt-2 text-sm leading-relaxed text-dema-muted">
                déclinaisons plus précises pour les métiers à forte densité éditoriale.
              </p>
            </div>
            <div className="rounded-[1.15rem] border border-dema-line bg-dema-paper p-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-dema-forest">
                Newsletters secteur
              </p>
              <p className="mt-2 text-3xl font-semibold text-brand-blue">{entries.filter((entry) => entry.kind === "sector").length}</p>
              <p className="mt-2 text-sm leading-relaxed text-dema-muted">
                newsletters mères qui structurent la base éditoriale globale.
              </p>
            </div>
          </div>
        ) : null}

        <div className="flex items-center justify-end pb-5">
          {searchQuery || activeFilter !== "Tous" ? (
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                setActiveFilter("Tous");
              }}
              className="text-xs font-medium text-dema-muted transition hover:text-dema-forest"
            >
              Réinitialiser
            </button>
          ) : null}
        </div>

        {filteredEntries.length === 0 ? (
          <div className="rounded-[1.25rem] border border-dashed border-dema-line bg-dema-paper p-10 text-center">
            <h2 className="text-xl font-bold text-brand-blue">Aucune newsletter trouvée</h2>
            <p className="mt-3 text-sm font-normal text-dema-muted">
              Essayez un autre mot-clé ou un filtre plus large.
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {specificEntries.length ? (
              <section>
                <div className="pb-5">
                  <h2 className="text-2xl font-bold text-brand-blue">Newsletters métier</h2>
                  <p className="mt-2 max-w-2xl text-sm leading-relaxed text-dema-muted">
                    Les déclinaisons les plus spécifiques, pensées pour les métiers où la matière éditoriale mérite une newsletter dédiée.
                  </p>
                </div>
                <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                  {specificEntries.map((entry) => renderNewsletterCard(entry))}
                </div>
              </section>
            ) : null}

            {sectorEntries.length ? (
              <section>
                <div className="pb-5">
                  <h2 className="text-2xl font-bold text-brand-blue">Newsletters secteur</h2>
                  <p className="mt-2 max-w-2xl text-sm leading-relaxed text-dema-muted">
                    Les newsletters mères qui structurent la veille par grand secteur d&apos;activité.
                  </p>
                </div>
                <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                  {sectorEntries.map((entry) => renderNewsletterCard(entry))}
                </div>
              </section>
            ) : null}
          </div>
        )}
      </section>
    </div>
  );
}
