"use client";

import { Search } from "lucide-react";
import { useMemo, useState } from "react";
import ProviderProfileModal from "@/components/ProviderProfileModal";
import {
  EXPERTISE_FAMILIES,
  EXPERTISE_FAMILY_LABELS,
  type ExpertiseCatalogEntry,
} from "@/lib/expertise-catalog-contract";
import { matchesSearchQuery } from "@/lib/search";

export default function ExpertiseCatalogClient({
  expertises,
}: {
  expertises: readonly ExpertiseCatalogEntry[];
}) {
  const [query, setQuery] = useState("");
  const [selectedExpertiseId, setSelectedExpertiseId] = useState<string | null>(null);
  const filtered = useMemo(
    () => expertises.filter((expertise) => matchesSearchQuery(query, [
      expertise.label,
      expertise.description,
      ...expertise.aliases,
      ...expertise.specialties,
    ])),
    [expertises, query],
  );

  return (
    <>
      <label className="demaa-search-shell relative mx-auto mt-8 block max-w-xl">
        <span className="sr-only">Rechercher une expertise</span>
        <Search className="pointer-events-none absolute left-5 top-1/2 h-4 w-4 -translate-y-1/2 text-dema-muted" aria-hidden="true" />
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Rechercher une expertise…"
          className="w-full rounded-full bg-dema-paper py-3 pl-12 pr-5 text-sm text-brand-blue outline-none placeholder:text-brand-blue/36"
        />
      </label>

      <div className="mt-12 space-y-12">
        {EXPERTISE_FAMILIES.map((family) => {
          const entries = filtered.filter((entry) => entry.family === family);
          if (entries.length === 0) return null;
          return (
            <section key={family}>
              <h2 className="text-2xl font-light tracking-[-0.025em] text-brand-blue">
                {EXPERTISE_FAMILY_LABELS[family]}
              </h2>
              <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {entries.map((expertise) => (
                  <button
                    key={expertise.expertiseId}
                    type="button"
                    onClick={() => setSelectedExpertiseId(expertise.expertiseId)}
                    className="min-h-52 rounded-[1.2rem] border border-dema-line bg-white p-5 text-left shadow-[0_8px_24px_rgba(23,35,29,0.035)] transition hover:border-dema-forest/25 hover:shadow-[0_12px_28px_rgba(23,35,29,0.065)]"
                  >
                    <h3 className="text-lg font-medium leading-snug text-brand-blue">
                      {expertise.label}
                    </h3>
                    <p className="mt-3 text-sm leading-relaxed text-dema-muted">
                      {expertise.description}
                    </p>
                    <span className="mt-6 inline-flex text-sm font-medium text-dema-forest">
                      Proposer mon profil
                    </span>
                  </button>
                ))}
              </div>
            </section>
          );
        })}
      </div>

      {filtered.length === 0 ? (
        <p className="mt-10 rounded-[1.15rem] border border-dema-line bg-white px-5 py-8 text-center text-sm text-dema-muted">
          Aucune expertise ne correspond à votre recherche.
        </p>
      ) : null}

      {selectedExpertiseId ? (
        <ProviderProfileModal
          expertises={expertises}
          initialExpertiseId={selectedExpertiseId}
          onClose={() => setSelectedExpertiseId(null)}
        />
      ) : null}
    </>
  );
}
