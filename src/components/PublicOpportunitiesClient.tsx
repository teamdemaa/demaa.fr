"use client";

import { Search } from "lucide-react";
import { useMemo, useState } from "react";
import ProviderProfileModal from "@/components/ProviderProfileModal";
import type { ExpertiseCatalogEntry } from "@/lib/expertise-catalog-contract";
import type { PublicOpportunity } from "@/lib/opportunity-contract";
import { matchesSearchQuery } from "@/lib/search";

export default function PublicOpportunitiesClient({
  expertises,
  opportunities,
}: {
  expertises: readonly ExpertiseCatalogEntry[];
  opportunities: readonly PublicOpportunity[];
}) {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<PublicOpportunity | null>(null);
  const filtered = useMemo(
    () => opportunities.filter((opportunity) => matchesSearchQuery(query, [
      opportunity.title,
      opportunity.summary,
      opportunity.category,
      opportunity.geography ?? "",
    ])),
    [opportunities, query],
  );

  return (
    <>
      <label className="demaa-search-shell relative mx-auto mt-8 block max-w-xl">
        <span className="sr-only">Rechercher une opportunité</span>
        <Search className="pointer-events-none absolute left-5 top-1/2 h-4 w-4 -translate-y-1/2 text-dema-muted" aria-hidden="true" />
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Rechercher un besoin ou une expertise…"
          className="w-full rounded-full bg-dema-paper py-3 pl-12 pr-5 text-sm text-brand-blue outline-none placeholder:text-brand-blue/36"
        />
      </label>

      <div className="mt-10 space-y-4">
        {filtered.map((opportunity) => (
          <article key={opportunity.opportunityId} className="rounded-[1.2rem] border border-dema-line bg-white p-5 shadow-[0_8px_24px_rgba(23,35,29,0.035)] sm:p-6">
            <p className="text-xs font-medium uppercase tracking-[0.12em] text-dema-forest">
              {[opportunity.category, opportunity.geography].filter(Boolean).join(" · ")}
            </p>
            <h2 className="mt-2 text-xl font-medium tracking-[-0.02em] text-brand-blue">
              {opportunity.title}
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-dema-muted">
              {opportunity.summary}
            </p>
            <button
              type="button"
              onClick={() => setSelected(opportunity)}
              className="mt-6 inline-flex min-h-11 items-center justify-center rounded-full border border-dema-forest/20 bg-white px-5 text-sm font-medium text-dema-forest transition hover:bg-dema-sage"
            >
              Proposer mon profil
            </button>
          </article>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="mt-10 rounded-[1.15rem] border border-dema-line bg-white px-5 py-8 text-center text-sm text-dema-muted">
          Aucune opportunité ne correspond à votre recherche.
        </p>
      ) : null}

      {selected ? (
        <ProviderProfileModal
          expertises={expertises}
          opportunity={selected}
          onClose={() => setSelected(null)}
        />
      ) : null}
    </>
  );
}
