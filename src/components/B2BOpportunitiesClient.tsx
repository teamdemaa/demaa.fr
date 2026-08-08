"use client";

import { Search } from "lucide-react";
import { useMemo, useState } from "react";
import B2BOpportunityInterestModal from "@/components/B2BOpportunityInterestModal";
import type { B2BOpportunity } from "@/lib/b2b-opportunities-contract";
import { matchesSearchQuery } from "@/lib/search";

export default function B2BOpportunitiesClient({ opportunities }: { opportunities: readonly B2BOpportunity[] }) {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<B2BOpportunity | null>(null);
  const matching = useMemo(() => opportunities.filter((opportunity) => matchesSearchQuery(query, [opportunity.title, opportunity.description, opportunity.category])), [opportunities, query]);

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-12 sm:py-16">
      <div className="mx-auto max-w-xl text-center">
        <h1 className="leading-[1.15]">
          <span className="block text-[1.9rem] font-normal tracking-[-0.02em] text-brand-blue/60 sm:text-[2rem]">Des besoins concrets,</span>
          <span className="demaa-hero-title mt-0.5 block text-[2.15rem] text-dema-forest sm:text-[2.35rem]">à pourvoir</span>
        </h1>
      </div>
      <label className="relative mx-auto mt-8 block max-w-xl">
        <span className="sr-only">Rechercher une opportunité</span>
        <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-dema-muted" aria-hidden="true" />
        <input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Rechercher un secteur, un besoin, un métier…" className="h-12 w-full rounded-2xl border border-dema-line bg-white pl-11 pr-4 text-sm text-brand-blue shadow-[0_3px_12px_rgba(23,35,29,0.03)] outline-none transition placeholder:text-dema-muted/60 focus:border-dema-forest/35 focus:ring-2 focus:ring-dema-forest/10" />
      </label>
      <div className="mt-10 flex flex-col gap-3">
        {matching.length ? matching.map((opportunity) => (
          <article key={opportunity.slug} className="flex flex-col gap-4 rounded-[1.15rem] border border-dema-line bg-white p-5 shadow-[0_3px_14px_rgba(23,35,29,0.03)] sm:flex-row sm:items-center sm:justify-between sm:p-6">
            <div className="min-w-0"><span className="block text-[11px] font-medium uppercase tracking-[0.08em] text-dema-forest">{opportunity.category}</span><h2 className="mt-1.5 text-[15px] font-medium leading-snug text-brand-blue">{opportunity.title}</h2><p className="mt-1 text-sm leading-relaxed text-dema-muted">{opportunity.description}</p></div>
            <button type="button" onClick={() => setSelected(opportunity)} className="inline-flex h-10 shrink-0 items-center justify-center rounded-full border border-[#c7d4cc] bg-white px-4 text-sm font-medium text-dema-forest transition hover:bg-dema-sage/40">Je suis intéressé</button>
          </article>
        )) : <p className="rounded-[1.15rem] border border-dema-line bg-white px-5 py-8 text-center text-sm text-dema-muted">Aucune opportunité ne correspond à votre recherche.</p>}
      </div>
      {selected ? <B2BOpportunityInterestModal opportunity={selected} onClose={() => setSelected(null)} /> : null}
    </div>
  );
}
