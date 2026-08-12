"use client";

import { X } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import AppLibrarySearch from "@/components/AppLibrarySearch";
import ProviderProfileModal from "@/components/ProviderProfileModal";
import { useAccessibleDialog } from "@/components/useAccessibleDialog";
import type { ExpertiseCatalogEntry } from "@/lib/expertise-catalog-contract";
import {
  OPPORTUNITY_TYPE_LABELS,
  OPPORTUNITY_WORK_MODE_LABELS,
  type PublicOpportunity,
} from "@/lib/opportunity-contract";
import { matchesSearchQuery } from "@/lib/search";

const ALL_OPPORTUNITY_CATEGORIES = "Toutes";

function OpportunityDetailsDialog({
  onApply,
  onClose,
  opportunity,
}: {
  onApply: () => void;
  onClose: () => void;
  opportunity: PublicOpportunity;
}) {
  const dialogRef = useAccessibleDialog({ onClose });
  const metadata = [
    OPPORTUNITY_TYPE_LABELS[opportunity.opportunityType],
    opportunity.category,
    opportunity.workMode
      ? OPPORTUNITY_WORK_MODE_LABELS[opportunity.workMode]
      : opportunity.geography,
  ].filter(Boolean).join(" · ");
  const frameLabel = opportunity.opportunityType === "mission"
    ? "Mission indépendante"
    : OPPORTUNITY_TYPE_LABELS[opportunity.opportunityType];
  const details: [string, string][] = [];
  if (opportunity.workMode) {
    details.push([
      "Modalité",
      OPPORTUNITY_WORK_MODE_LABELS[opportunity.workMode],
    ]);
  }
  if (opportunity.geography) details.push(["Zone", opportunity.geography]);
  details.push([
    "Cadre",
    frameLabel,
  ]);
  if (opportunity.cadence) {
    details.push(["Rythme / durée", opportunity.cadence]);
  }
  if (opportunity.startTiming) {
    details.push(["Démarrage", opportunity.startTiming]);
  }
  if (opportunity.compensation) {
    details.push(["Budget / rémunération", opportunity.compensation]);
  }
  if (opportunity.companyName) {
    details.push(["Entreprise", opportunity.companyName]);
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center bg-brand-blue/35 p-0 backdrop-blur-[2px] sm:items-center sm:p-5">
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="opportunity-details-title"
        tabIndex={-1}
        className="relative max-h-[calc(100dvh-1rem)] w-full max-w-xl overflow-y-auto rounded-t-[1.5rem] bg-white p-5 shadow-2xl sm:max-h-[calc(100dvh-2.5rem)] sm:rounded-[1.5rem] sm:p-8"
      >
        <button
          type="button"
          onClick={onClose}
          data-dialog-initial-focus
          className="absolute right-4 top-4 inline-flex h-10 w-10 items-center justify-center rounded-full text-brand-blue transition hover:bg-dema-sage focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-dema-forest"
          aria-label="Fermer"
        >
          <X className="h-5 w-5" aria-hidden="true" />
        </button>

        <p className="pr-12 text-xs font-medium uppercase tracking-[0.14em] text-dema-forest">
          {metadata}
        </p>
        <h2
          id="opportunity-details-title"
          className="mt-2 pr-12 text-2xl font-medium tracking-[-0.025em] text-brand-blue sm:text-3xl"
        >
          {opportunity.title}
        </h2>
        <p className="mt-4 text-sm leading-relaxed text-dema-muted sm:text-base">
          {opportunity.summary}
        </p>
        {opportunity.expectations.length > 0 ? (
          <div className="mt-6">
            <h3 className="text-sm font-medium text-brand-blue">
              Ce qui est attendu
            </h3>
            <ul className="mt-3 space-y-2 text-sm leading-relaxed text-dema-muted">
              {opportunity.expectations.map((expectation) => (
                <li key={expectation} className="flex gap-3">
                  <span className="mt-[0.55rem] h-1 w-1 shrink-0 rounded-full bg-dema-forest" aria-hidden="true" />
                  <span>{expectation}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
        {details.length > 0 ? (
          <dl className="mt-6 grid grid-cols-2 gap-x-5 gap-y-4 rounded-[1rem] bg-dema-paper p-4 sm:gap-x-8">
            {details.map(([label, value]) => (
              <div key={label} className="min-w-0">
                <dt className="text-[0.68rem] font-medium uppercase tracking-[0.12em] text-dema-muted">
                  {label}
                </dt>
                <dd className="mt-1 break-words text-sm leading-relaxed text-brand-blue">
                  {value}
                </dd>
              </div>
            ))}
          </dl>
        ) : null}
        <button
          type="button"
          onClick={onApply}
          className="mt-7 inline-flex min-h-12 w-full items-center justify-center rounded-full bg-dema-forest px-6 text-sm font-medium text-white transition hover:bg-brand-blue focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-dema-forest"
        >
          Intéressé(e)
        </button>
      </div>
    </div>
  );
}

export default function PublicOpportunitiesClient({
  expertises,
  initialEmail = "",
  opportunities,
}: {
  expertises: readonly ExpertiseCatalogEntry[];
  initialEmail?: string;
  opportunities: readonly PublicOpportunity[];
}) {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState(
    ALL_OPPORTUNITY_CATEGORIES,
  );
  const [areCategoryTagsVisible, setAreCategoryTagsVisible] = useState(false);
  const [selected, setSelected] = useState<PublicOpportunity | null>(null);
  const [applicationOpportunity, setApplicationOpportunity] =
    useState<PublicOpportunity | null>(null);
  const closeDetails = useCallback(() => setSelected(null), []);
  const openApplication = useCallback(() => {
    setApplicationOpportunity(selected);
    setSelected(null);
  }, [selected]);
  const categories = useMemo(
    () => [
      ALL_OPPORTUNITY_CATEGORIES,
      ...Array.from(new Set(opportunities.map((opportunity) => opportunity.category))),
    ],
    [opportunities],
  );
  const filtered = useMemo(
    () => opportunities.filter((opportunity) => {
      const matchesCategory =
        activeCategory === ALL_OPPORTUNITY_CATEGORIES
        || opportunity.category === activeCategory;
      const matchesQuery = matchesSearchQuery(query, [
        opportunity.title,
        opportunity.summary,
        opportunity.category,
        OPPORTUNITY_TYPE_LABELS[opportunity.opportunityType],
        opportunity.workMode
          ? OPPORTUNITY_WORK_MODE_LABELS[opportunity.workMode]
          : "",
        opportunity.geography ?? "",
        opportunity.cadence ?? "",
        opportunity.startTiming ?? "",
        opportunity.compensation ?? "",
        opportunity.companyName ?? "",
        ...opportunity.expectations,
      ]);
      return matchesCategory && matchesQuery;
    }),
    [activeCategory, opportunities, query],
  );

  useEffect(() => {
    if (!initialEmail) return;
    const searchParams = new URLSearchParams(window.location.search);
    if (searchParams.get("intent") !== "opportunity") return;
    const opportunityId = searchParams.get("opportunityId");
    const opportunity = opportunities.find(
      (entry) => entry.opportunityId === opportunityId,
    );
    if (!opportunity) return;
    const timeout = window.setTimeout(
      () => setApplicationOpportunity(opportunity),
      0,
    );
    return () => window.clearTimeout(timeout);
  }, [initialEmail, opportunities]);

  return (
    <>
      <div className="pt-3">
        <AppLibrarySearch
          activeFilter={activeCategory}
          filters={categories}
          isFilterOpen={areCategoryTagsVisible}
          onFilterSelect={(category) => {
            setActiveCategory(category);
            setQuery("");
            setAreCategoryTagsVisible(false);
          }}
          onFilterToggle={() => setAreCategoryTagsVisible((visible) => !visible)}
          onQueryChange={(value) => {
            setQuery(value);
            setActiveCategory(ALL_OPPORTUNITY_CATEGORIES);
          }}
          placeholder="Rechercher un besoin ou une expertise…"
          query={query}
        />
      </div>

      <div className="mt-6 space-y-4">
        {filtered.map((opportunity) => (
          <article key={opportunity.opportunityId}>
            <button
              type="button"
              onClick={() => setSelected(opportunity)}
              aria-label={`Ouvrir l’opportunité : ${opportunity.title}`}
              className="group block w-full rounded-[1.2rem] border border-dema-line bg-white p-5 text-left shadow-[0_8px_24px_rgba(23,35,29,0.035)] transition hover:border-dema-forest/25 hover:bg-dema-paper focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-dema-forest sm:p-6"
            >
              <p className="text-xs font-medium uppercase tracking-[0.12em] text-dema-forest">
                {[
                  OPPORTUNITY_TYPE_LABELS[opportunity.opportunityType],
                  opportunity.category,
                ].filter(Boolean).join(" · ")}
              </p>
              <h2 className="mt-2 text-lg font-normal tracking-[-0.015em] text-brand-blue sm:text-xl">
                {opportunity.title}
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-dema-muted">
                {opportunity.summary}
              </p>
            </button>
          </article>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="mt-10 rounded-[1.15rem] border border-dema-line bg-white px-5 py-8 text-center text-sm text-dema-muted">
          Aucune opportunité ne correspond à votre recherche.
        </p>
      ) : null}

      <aside className="mt-12 rounded-[1.2rem] border border-dema-line bg-dema-paper px-5 py-6 sm:flex sm:items-center sm:justify-between sm:gap-8 sm:px-6">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.12em] text-dema-forest">
            Rejoindre Team Demaa
          </p>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-dema-muted">
            Présentez votre profil une seule fois et soyez contacté lorsqu’un besoin correspond à votre expertise.
          </p>
        </div>
        <Link
          href="/rejoindre-team-demaa"
          className="mt-5 inline-flex min-h-11 shrink-0 items-center justify-center rounded-full border border-dema-forest/20 bg-white px-5 text-sm font-medium text-dema-forest transition hover:bg-dema-sage sm:mt-0"
        >
          Présenter mon profil
        </Link>
      </aside>

      {selected ? (
        <OpportunityDetailsDialog
          onApply={openApplication}
          onClose={closeDetails}
          opportunity={selected}
        />
      ) : null}

      {applicationOpportunity ? (
        <ProviderProfileModal
          expertises={expertises}
          initialEmail={initialEmail}
          opportunity={applicationOpportunity}
          onClose={() => setApplicationOpportunity(null)}
        />
      ) : null}
    </>
  );
}
