"use client";

import { ArrowRight, BookOpen, Search } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import CopyableModelCard from "@/components/CopyableModelCard";
import type { CopyableModelDefinition } from "@/lib/copyable-model-catalog";

export default function CopyableModelsIndex({
  models,
  systemName,
}: {
  models: readonly CopyableModelDefinition[];
  systemName?: string;
}) {
  const [query, setQuery] = useState("");
  const normalizedQuery = query.trim().toLocaleLowerCase("fr");
  const filteredModels = normalizedQuery
    ? models.filter((model) => [
      model.title,
      model.description,
      model.category,
      ...model.searchTerms,
    ].join(" ").toLocaleLowerCase("fr").includes(normalizedQuery))
    : models;

  return (
    <>
      <section className="mx-auto w-full max-w-7xl px-4 pb-20 pt-12 sm:px-6 md:pt-16 lg:px-8">
        <div className="text-center">
          <h1
            aria-label="Des modèles prêts à copier pour organiser votre activité"
            className="text-balance font-light leading-[0.94] tracking-tight"
            style={{ fontSize: "clamp(2.4rem, 6.8vw, 4.6rem)" }}
          >
            <span aria-hidden="true">
              <span className="block text-brand-blue/62">Des modèles prêts à copier</span>
              <span className="demaa-hero-title block text-dema-forest">pour organiser votre activité</span>
            </span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-balance text-base leading-7 text-dema-muted md:text-lg">
            Des structures simples, déjà pensées pour suivre un flux de travail précis.
          </p>
          {systemName ? (
            <p className="mx-auto mt-4 w-fit rounded-full bg-dema-sage/45 px-4 py-2 text-sm text-dema-forest">
              Modèles compatibles avec l’activité « {systemName} »
            </p>
          ) : null}
        </div>

        <label className="mx-auto mt-10 flex min-h-13 max-w-xl items-center gap-3 rounded-full border border-dema-line bg-white px-5 shadow-[0_10px_35px_rgba(31,52,43,0.06)] focus-within:border-dema-forest/35">
          <Search className="h-4 w-4 shrink-0 text-brand-blue/40" aria-hidden="true" />
          <span className="sr-only">Rechercher un modèle</span>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Rechercher un modèle (devis, suivi, CRM…)"
            className="min-w-0 flex-1 bg-transparent py-3 text-sm text-brand-blue outline-none placeholder:text-brand-blue/35"
          />
        </label>

        {filteredModels.length > 0 ? (
          <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredModels.map((model) => <CopyableModelCard key={model.slug} model={model} />)}
          </div>
        ) : (
          <div className="mx-auto mt-10 max-w-2xl rounded-[1.25rem] border border-dema-line bg-white p-8 text-center">
            <p className="text-lg font-medium text-brand-blue">Aucun modèle ne correspond à cette recherche.</p>
            <button type="button" onClick={() => setQuery("")} className="mt-4 text-sm font-medium text-dema-forest underline underline-offset-4">
              Effacer la recherche
            </button>
          </div>
        )}
      </section>

      <section className="px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 rounded-[1.5rem] border border-dema-forest/15 bg-dema-sage/45 px-6 py-8 sm:flex-row sm:items-center sm:justify-between sm:px-8 md:px-10 md:py-9">
          <div className="max-w-2xl">
            <BookOpen className="h-5 w-5 text-dema-forest" aria-hidden="true" />
            <h2 className="mt-3 text-2xl font-light tracking-[-0.03em] text-brand-blue sm:text-3xl">Les processus derrière les modèles</h2>
            <p className="mt-3 text-sm leading-6 text-dema-muted sm:text-base">Retrouvez les étapes, les responsabilités, les points de contrôle et les erreurs fréquentes pour mettre ces modèles en place dans votre entreprise.</p>
          </div>
          <Link href="/organiser" className="inline-flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-full bg-dema-forest px-7 text-sm font-semibold text-white transition hover:bg-[#284f3a] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dema-forest/35 focus-visible:ring-offset-2">
            Explorer les processus
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </section>
    </>
  );
}
