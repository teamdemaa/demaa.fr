"use client";

import { Plus, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import AppLibrarySearch from "@/components/AppLibrarySearch";
import OpportunitySubmissionDialog from "@/components/OpportunitySubmissionDialog";
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
        id="opportunity-details-dialog"
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
  initialOpportunityId,
  onOpportunityChange,
  opportunities,
}: {
  expertises: readonly ExpertiseCatalogEntry[];
  initialEmail?: string;
  initialOpportunityId?: string;
  onOpportunityChange?: (opportunityId?: string) => void;
  opportunities: readonly PublicOpportunity[];
}) {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState(
    ALL_OPPORTUNITY_CATEGORIES,
  );
  const [areCategoryTagsVisible, setAreCategoryTagsVisible] = useState(false);
  const [localSelected, setLocalSelected] = useState<PublicOpportunity | null>(null);
  const [applicationOpportunity, setApplicationOpportunity] =
    useState<PublicOpportunity | null>(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const [submissionOpen, setSubmissionOpen] = useState(false);
  const [submissionNotice, setSubmissionNotice] = useState<string | null>(null);
  const autoSubmissionTokenRef = useRef("");
  const selected = initialOpportunityId
    ? opportunities.find(
      (entry) => entry.opportunityId === initialOpportunityId,
    ) ?? null
    : localSelected;
  const closeDetails = useCallback(() => {
    setLocalSelected(null);
    onOpportunityChange?.(undefined);
    const url = new URL(window.location.href);
    if (!url.searchParams.has("opportunity")) return;
    url.searchParams.delete("opportunity");
    window.history.replaceState(
      window.history.state,
      "",
      `${url.pathname}${url.search}${url.hash}`,
    );
  }, [onOpportunityChange]);
  const openApplication = useCallback(() => {
    setApplicationOpportunity(selected);
    setLocalSelected(null);
    onOpportunityChange?.(undefined);
  }, [onOpportunityChange, selected]);
  const closeProfile = useCallback(() => {
    setProfileOpen(false);
    const url = new URL(window.location.href);
    if (url.searchParams.get("intent") !== "team-demaa-profile") return;
    url.searchParams.delete("intent");
    url.searchParams.delete("expertiseId");
    window.history.replaceState(
      window.history.state,
      "",
      `${url.pathname}${url.search}${url.hash}`,
    );
  }, []);
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
        opportunity.domainLabel ?? "",
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
    const searchParams = new URLSearchParams(window.location.search);
    if (searchParams.get("intent") !== "team-demaa-profile") return;
    const timeout = window.setTimeout(() => setProfileOpen(true), 0);
    return () => window.clearTimeout(timeout);
  }, []);

  useEffect(() => {
    const opportunityId = new URLSearchParams(window.location.search).get(
      "opportunity",
    );
    if (!opportunityId) return;
    const opportunity = opportunities.find(
      (entry) => entry.opportunityId === opportunityId,
    );
    if (!opportunity) return;
    const timeout = window.setTimeout(() => setLocalSelected(opportunity), 0);
    return () => window.clearTimeout(timeout);
  }, [opportunities]);

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

  useEffect(() => {
    if (!initialEmail) return;
    const url = new URL(window.location.href);
    if (url.searchParams.get("intent") !== "opportunity-submit") return;
    const draftToken = url.searchParams.get("draftToken") ?? "";
    if (!/^[A-Za-z0-9_-]{43}$/.test(draftToken)) return;
    if (autoSubmissionTokenRef.current === draftToken) return;
    autoSubmissionTokenRef.current = draftToken;

    void fetch("/api/opportunity-submissions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ draftToken }),
    }).then(async (response) => {
      const payload = await response.json().catch(() => null) as {
        error?: string;
        ok?: boolean;
      } | null;
      if (!response.ok || !payload?.ok) {
        throw new Error(payload?.error || "L’opportunité n’a pas pu être envoyée.");
      }
      window.sessionStorage.removeItem("demaa_opportunity_submission_draft");
      url.searchParams.delete("intent");
      url.searchParams.delete("draftToken");
      window.history.replaceState(window.history.state, "", `${url.pathname}${url.search}${url.hash}`);
      setSubmissionNotice("Votre opportunité a été transmise à l’équipe Demaa pour modération.");
    }).catch((submissionError: unknown) => {
      autoSubmissionTokenRef.current = "";
      setSubmissionOpen(true);
      setSubmissionNotice(
        submissionError instanceof Error
          ? submissionError.message
          : "L’opportunité n’a pas pu être envoyée.",
      );
    });
  }, [initialEmail]);

  return (
    <>
      <div className="mx-auto grid w-full max-w-[39.25rem] grid-cols-[minmax(0,1fr)_auto] items-center gap-2 pt-3">
        <div className="min-w-0 flex-1">
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
            unconstrained
          />
        </div>
        <button
          type="button"
          onClick={() => setSubmissionOpen(true)}
          aria-label="Soumettre une opportunité"
          title="Soumettre une opportunité"
          className="inline-flex h-11 w-11 shrink-0 items-center justify-center gap-2 rounded-full border border-dema-line bg-white text-dema-forest transition hover:border-dema-forest/30 hover:bg-dema-sage focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dema-forest/35 md:w-auto md:px-4"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          <span className="hidden text-sm font-medium md:inline">Soumettre</span>
        </button>
      </div>

      {submissionNotice ? (
        <p className="mt-4 rounded-xl bg-dema-sage px-4 py-3 text-sm text-dema-forest" role="status">
          {submissionNotice}
        </p>
      ) : null}

      <div className="mt-6 grid gap-3">
        {filtered.map((opportunity) => (
          <article key={opportunity.opportunityId} className="h-full">
            <button
              type="button"
              onClick={() => {
                setLocalSelected(opportunity);
                onOpportunityChange?.(opportunity.opportunityId);
              }}
              aria-label={`Ouvrir l’opportunité : ${opportunity.title}`}
              aria-haspopup="dialog"
              aria-expanded={selected?.opportunityId === opportunity.opportunityId}
              aria-controls="opportunity-details-dialog"
              className={`group flex h-[13rem] w-full flex-col rounded-[1.2rem] border bg-white p-4 text-left shadow-[0_8px_24px_rgba(23,35,29,0.035)] transition hover:border-dema-forest/25 hover:bg-dema-paper focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-dema-forest sm:h-44 sm:p-5 ${selected?.opportunityId === opportunity.opportunityId ? "border-dema-forest/45" : "border-dema-line"}`}
            >
              <h2 className="line-clamp-2 min-h-[2.75rem] text-lg font-medium leading-snug tracking-[-0.015em] text-brand-blue sm:text-xl">
                {opportunity.title}
              </h2>
              <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-dema-muted">
                {opportunity.summary}
              </p>
              <div className="mt-auto flex flex-wrap gap-2 pt-5" aria-label="Caractéristiques de l’opportunité">
                {Array.from(new Set([
                  opportunity.category,
                  opportunity.domainLabel,
                  OPPORTUNITY_TYPE_LABELS[opportunity.opportunityType],
                ].filter((value): value is string => Boolean(value)))).slice(0, 3).map((tag) => (
                  <span key={tag} className="inline-flex min-h-8 items-center rounded-[0.45rem] bg-dema-sage/70 px-3 text-xs font-medium text-dema-forest">
                    {tag}
                  </span>
                ))}
              </div>
            </button>
          </article>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="mt-10 rounded-[1.15rem] border border-dema-line bg-white px-5 py-8 text-center text-sm text-dema-muted">
          Aucune opportunité ne correspond à votre recherche.
        </p>
      ) : null}

      <div className="mt-10 text-center">
        <button
          type="button"
          onClick={() => setProfileOpen(true)}
          className="inline-flex min-h-11 items-center px-1 text-sm font-medium text-dema-forest underline decoration-dema-line underline-offset-4 transition hover:text-brand-blue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dema-forest/25"
        >
          Rejoindre Team Demaa
        </button>
      </div>

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

      {profileOpen ? (
        <ProviderProfileModal
          expertises={expertises}
          initialEmail={initialEmail}
          onClose={closeProfile}
        />
      ) : null}

      {submissionOpen ? (
        <OpportunitySubmissionDialog
          initialEmail={initialEmail}
          onClose={() => setSubmissionOpen(false)}
          onSubmitted={() => {
            const url = new URL(window.location.href);
            if (url.searchParams.get("intent") === "opportunity-submit") {
              url.searchParams.delete("intent");
              url.searchParams.delete("draftToken");
              window.history.replaceState(
                window.history.state,
                "",
                `${url.pathname}${url.search}${url.hash}`,
              );
            }
            setSubmissionOpen(false);
            setSubmissionNotice("Votre opportunité a été transmise à l’équipe Demaa pour modération.");
          }}
        />
      ) : null}
    </>
  );
}
