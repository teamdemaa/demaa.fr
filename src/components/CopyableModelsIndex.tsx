"use client";

import { ArrowLeft, Search } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import CopyableModelCard from "@/components/CopyableModelCard";
import type { CopyableModelDefinition } from "@/lib/copyable-model-catalog";

const MODEL_GROUPS = [
  {
    id: "fundamentaux",
    title: "Les fondamentaux",
    slugs: [
      "structure-google-drive-entreprise",
      "suivi-commercial-et-devis",
      "suivi-previsionnel-financier",
    ],
  },
  {
    id: "realisation",
    title: "La réalisation du travail",
    slugs: [
      "projets-et-missions-clients",
      "interventions-et-chantiers",
      "suivi-administratif-et-echeances",
    ],
  },
  {
    id: "developpement",
    title: "Le développement de l’entreprise",
    slugs: [
      "suivi-client-et-support",
      "planning-marketing-et-contenus",
      "recrutement-et-candidatures",
    ],
  },
] as const;

export default function CopyableModelsIndex({
  fromOrganisation = false,
  models,
  systemName,
}: {
  fromOrganisation?: boolean;
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
  const filteredModelsBySlug = new Map(
    filteredModels.map((model) => [model.slug, model] as const),
  );
  const visibleGroups = MODEL_GROUPS.map((group) => ({
    ...group,
    models: group.slugs.flatMap((slug) => {
      const model = filteredModelsBySlug.get(slug);
      return model ? [model] : [];
    }),
  })).filter((group) => group.models.length > 0);

  return (
    <>
      <section className="mx-auto w-full max-w-7xl px-4 pb-20 pt-12 sm:px-6 md:pt-16 lg:px-8">
        {fromOrganisation ? (
          <Link
            href="/organiser#cas-concrets"
            className="mb-10 inline-flex items-center gap-2 text-sm font-medium text-dema-muted transition hover:text-dema-forest"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Retour à Organisation
          </Link>
        ) : null}

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

        {visibleGroups.length > 0 ? (
          <div className="mt-12 max-w-full space-y-12">
            {visibleGroups.map((group) => (
              <section
                key={group.id}
                aria-labelledby={`model-group-${group.id}`}
                className="min-w-0 max-w-full"
              >
                <h2
                  id={`model-group-${group.id}`}
                  className="demaa-catalog-section-title text-brand-blue"
                >
                  {group.title}
                </h2>
                <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {group.models.map((model) => (
                    <div key={model.slug} className="min-w-0">
                      <CopyableModelCard
                        href={fromOrganisation
                          ? `/modeles/${model.slug}?from=organisation`
                          : undefined}
                        model={model}
                        titleLevel={3}
                      />
                    </div>
                  ))}
                </div>
              </section>
            ))}
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
    </>
  );
}
