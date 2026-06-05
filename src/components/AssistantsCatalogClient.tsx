"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  ArrowRight,
  BadgeEuro,
  FileCheck2,
  HandCoins,
  Megaphone,
  ReceiptText,
  Search,
  Workflow,
} from "lucide-react";

const assistantOffers = [
  {
    title: "Assistant facturation",
    category: "Finance",
    tags: ["Finance", "Administration"],
    format: "À l'heure",
    description:
      "Classement des pièces, suivi des paiements, préparation comptable et mise à jour de vos documents de gestion.",
    icon: ReceiptText,
  },
  {
    title: "Assistant contenu / marketing",
    category: "Marketing",
    tags: ["Marketing"],
    format: "À l'heure",
    description:
      "Posts, newsletters, supports simples, idées de contenu et mise en forme pour garder une présence régulière.",
    icon: Megaphone,
  },
  {
    title: "Assistant prospection",
    category: "Commercial",
    tags: ["Commercial"],
    format: "À l'heure",
    description:
      "Recherche de contacts, enrichissement de listes, préparation des messages et suivi des opportunités.",
    icon: Search,
  },
  {
    title: "Assistant subventions",
    category: "Financement",
    tags: ["Finance", "Dossiers"],
    format: "Dossier ou heures",
    description:
      "Recherche d'aides, vérification de l'éligibilité, préparation des pièces et suivi du dossier.",
    icon: HandCoins,
  },
  {
    title: "Assistant appels d'offres",
    category: "Dossiers",
    tags: ["Dossiers", "Commercial"],
    format: "Dossier ou heures",
    description:
      "Repérage des opportunités, liste des pièces à fournir, organisation des documents et préparation des réponses.",
    icon: FileCheck2,
  },
  {
    title: "Assistant automatisation",
    category: "Automatisation",
    tags: ["Automatisation", "Administration"],
    format: "À l'heure",
    description:
      "Cadrage des tâches répétitives, préparation des scénarios et suivi des automatisations simples avec vos outils.",
    icon: Workflow,
  },
] as const;

const filterTags = [
  "Tous",
  "Finance",
  "Marketing",
  "Commercial",
  "Dossiers",
  "Automatisation",
  "Administration",
] as const;

type FilterTag = (typeof filterTags)[number];

export default function AssistantsCatalogClient() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTag, setActiveTag] = useState<FilterTag>("Tous");

  const filteredOffers = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return assistantOffers.filter((offer) => {
      const matchesTag =
        activeTag === "Tous" || (offer.tags as readonly string[]).includes(activeTag);
      const matchesSearch =
        !query ||
        offer.title.toLowerCase().includes(query) ||
        offer.category.toLowerCase().includes(query) ||
        offer.format.toLowerCase().includes(query) ||
        offer.description.toLowerCase().includes(query) ||
        offer.tags.some((tag) => tag.toLowerCase().includes(query));

      return matchesTag && matchesSearch;
    });
  }, [activeTag, searchQuery]);

  return (
    <>
      <section className="ml-[calc(50%-50vw)] mr-[calc(50%-50vw)] w-screen bg-dema-cream px-4 pb-5 pt-12 text-center md:px-8 md:pb-6 md:pt-16">
        <div className="mx-auto max-w-6xl space-y-6 md:space-y-7">
          <div className="mx-auto max-w-5xl">
            <h1 className="text-[2.24rem] tracking-tight leading-[0.98] sm:text-[2.75rem] md:text-[3.75rem] lg:text-[4.5rem]">
              <span className="demaa-hero-title text-brand-blue/86">Déléguez</span>{" "}
              <span className="font-sans font-light not-italic text-brand-blue/44">
                ce qui vous ralentit.
              </span>
            </h1>
          </div>

          <div className="demaa-search-shell mx-auto w-full max-w-4xl">
            <div className="relative">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-dema-forest/42 md:left-5 md:h-5 md:w-5" />
              <input
                type="search"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Rechercher un assistant"
                aria-label="Rechercher un assistant"
                className="w-full rounded-full bg-dema-paper py-2.5 pl-10 pr-5 text-sm font-normal text-brand-blue outline-none transition placeholder:text-brand-blue/36 md:py-3 md:pl-12 md:text-base"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="w-full border-b border-dema-line/65 bg-dema-cream px-4 pb-4 pt-1 md:pb-5">
        <div className="mx-auto max-w-6xl">
          <div className="mx-auto max-w-4xl overflow-x-auto pb-2 soft-scroll">
            <div className="flex min-w-max justify-center gap-2 px-1">
              {filterTags.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => setActiveTag(tag)}
                  className={`demaa-chip ${
                    activeTag === tag ? "demaa-chip-active" : ""
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 pb-20 pt-8 md:px-8 md:pb-28 md:pt-10">
        {filteredOffers.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredOffers.map((offer) => {
              const Icon = offer.icon;

              return (
                <article
                  key={offer.title}
                  className="demaa-card flex min-h-[18rem] flex-col rounded-[1.15rem] p-5"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-dema-forest">
                        {offer.category}
                      </p>
                      <h2 className="mt-3 text-xl font-semibold leading-tight tracking-tight text-brand-blue">
                        {offer.title}
                      </h2>
                    </div>
                    <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-dema-sage text-dema-forest">
                      <Icon className="h-5 w-5" aria-hidden="true" />
                    </span>
                  </div>
                  <p className="mt-4 text-sm leading-relaxed text-dema-muted">
                    {offer.description}
                  </p>
                  <div className="mt-auto pt-6">
                    <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-dema-sage px-3 py-1.5 text-xs font-medium text-brand-blue/70">
                      <BadgeEuro className="h-3.5 w-3.5 text-dema-forest" aria-hidden="true" />
                      {offer.format}
                    </div>
                    <Link
                      href="/assistant"
                      className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-dema-forest px-4 py-3 text-sm font-medium text-dema-paper transition hover:bg-[#284f3a]"
                    >
                      Commencer
                      <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="rounded-[1.15rem] border border-dashed border-dema-line bg-dema-paper px-6 py-10 text-center">
            <h2 className="text-xl font-semibold tracking-tight text-brand-blue">
              Aucun assistant trouvé
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-dema-muted">
              Essayez un autre mot-clé ou un autre filtre.
            </p>
          </div>
        )}
      </section>
    </>
  );
}
