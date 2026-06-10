"use client";

import { useEffect, useMemo, useState } from "react";
import { Plus, SlidersHorizontal, X } from "lucide-react";
import PrimaryMobileNav from "@/components/PrimaryMobileNav";
import type { ActifyOpportunity } from "@/lib/actify-opportunities";

type FilterState = {
  sector: string;
  department: string;
  revenue: string;
  employee: string;
  deadline: string;
  sort: "deadline" | "views" | "revenue";
};

type DevelopperOpportunitiesClientProps = {
  opportunities: ActifyOpportunity[];
};

const emptyFilters: FilterState = {
  sector: "",
  department: "",
  revenue: "",
  employee: "",
  deadline: "",
  sort: "deadline",
};

function compact(value?: string | number | null) {
  return value === null || value === undefined || value === "" ? "Non renseigné" : String(value);
}

function formatDate(value?: string | null) {
  if (!value) return "Non renseignée";

  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return "Non renseignée";

  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function daysUntil(value?: string | null) {
  if (!value) return null;

  const today = new Date();
  const deadline = new Date(`${value}T00:00:00`);
  if (Number.isNaN(deadline.getTime())) return null;

  return Math.ceil((deadline.getTime() - today.getTime()) / 86400000);
}

function deadlineLabel(value?: string | null) {
  const remaining = daysUntil(value);
  if (remaining === null) return "Date limite non renseignée";
  if (remaining < 0) return `${formatDate(value)} · Échue`;
  if (remaining === 0) return `${formatDate(value)} · Aujourd’hui`;
  return `${formatDate(value)} · J-${remaining}`;
}

function deadlineRank(value?: string | null) {
  const remaining = daysUntil(value);
  if (remaining === null) return 20000;
  if (remaining < 0) return 10000 + Math.abs(remaining);
  return remaining;
}

function uniqueSorted(values: Array<string | null | undefined>) {
  return [...new Set(values.filter((value): value is string => Boolean(value)))].sort((a, b) =>
    a.localeCompare(b, "fr")
  );
}

export default function DevelopperOpportunitiesClient({
  opportunities,
}: DevelopperOpportunitiesClientProps) {
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState<FilterState>(emptyFilters);
  const [draftFilters, setDraftFilters] = useState<FilterState>(emptyFilters);
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
  const [selectedOpportunity, setSelectedOpportunity] = useState<ActifyOpportunity | null>(null);
  const [informationOpportunity, setInformationOpportunity] =
    useState<ActifyOpportunity | null>(null);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);

  const filterOptions = useMemo(() => {
    return {
      sectors: uniqueSorted(opportunities.flatMap((opportunity) => opportunity.sectors)),
      departments: uniqueSorted(opportunities.map((opportunity) => opportunity.department)),
      revenues: uniqueSorted(opportunities.map((opportunity) => opportunity.revenue_range)),
      employees: uniqueSorted(opportunities.map((opportunity) => opportunity.employee_count_range)),
    };
  }, [opportunities]);

  const filteredOpportunities = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return opportunities
      .filter((opportunity) => {
        const itemDeadline = daysUntil(opportunity.deadline);
        const searchable = [
          opportunity.title,
          opportunity.city,
          opportunity.department,
          opportunity.revenue_range,
          opportunity.employee_count_range,
          opportunity.short_description,
          ...opportunity.sectors,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        return (
          (!normalizedQuery || searchable.includes(normalizedQuery)) &&
          (!filters.sector || opportunity.sectors.includes(filters.sector)) &&
          (!filters.department || opportunity.department === filters.department) &&
          (!filters.revenue || opportunity.revenue_range === filters.revenue) &&
          (!filters.employee || opportunity.employee_count_range === filters.employee) &&
          (!filters.deadline ||
            (itemDeadline !== null && itemDeadline >= 0 && itemDeadline <= Number(filters.deadline)))
        );
      })
      .sort((a, b) => {
        if (filters.sort === "views") return (a.views_count ?? 9999) - (b.views_count ?? 9999);
        if (filters.sort === "revenue") {
          return Number(Boolean(b.revenue_range)) - Number(Boolean(a.revenue_range));
        }
        return deadlineRank(a.deadline) - deadlineRank(b.deadline);
      });
  }, [filters, opportunities, query]);

  const isModalOpen = Boolean(selectedOpportunity) || Boolean(informationOpportunity) || isSubmitModalOpen;

  useEffect(() => {
    if (!isModalOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isModalOpen]);

  function toggleFilterPanel() {
    setDraftFilters(filters);
    setIsFilterPanelOpen((current) => !current);
  }

  function applyDraftFilters() {
    setFilters(draftFilters);
    setIsFilterPanelOpen(false);
  }

  function resetFilters() {
    setQuery("");
    setFilters(emptyFilters);
    setDraftFilters(emptyFilters);
    setIsFilterPanelOpen(false);
  }

  return (
    <>
      <section className="ml-[calc(50%-50vw)] mr-[calc(50%-50vw)] w-screen bg-dema-cream px-4 pb-6 pt-5 text-center md:px-8 md:pb-7 md:pt-16">
        <div className="mx-auto max-w-6xl space-y-6 md:space-y-7">
          <PrimaryMobileNav activeTab="developper" />

          <div className="mx-auto max-w-5xl">
            <h1 className="text-[clamp(3rem,14.5vw,3.36rem)] leading-[0.92] tracking-tight sm:text-[2.75rem] md:text-[3.75rem] lg:text-[4.5rem]">
              <span className="demaa-hero-title text-brand-blue/86">Développez </span>
              <br />
              <span className="font-sans font-light not-italic text-brand-blue/44">
                avec la reprise
              </span>
            </h1>
          </div>

          <div className="relative mx-auto grid w-full max-w-4xl grid-cols-[minmax(0,1fr)_auto] items-center gap-2 md:block">
            <div className="demaa-search-shell min-w-0">
              <div className="flex items-center gap-1">
                <input
                  type="search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Rechercher une opportunité, une ville, un secteur..."
                  aria-label="Rechercher une opportunité"
                  className="h-12 min-w-0 flex-1 rounded-full border-0 bg-dema-paper px-5 text-sm font-normal text-brand-blue outline-none placeholder:text-brand-blue/36 md:text-base"
                />
                <button
                  type="button"
                  onClick={toggleFilterPanel}
                  className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-dema-sage text-dema-forest transition hover:bg-[#ebeee9] md:h-12 md:w-12"
                  aria-expanded={isFilterPanelOpen}
                  aria-label="Afficher les filtres"
                >
                  <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsSubmitModalOpen(true)}
              className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-dema-forest text-dema-paper transition hover:bg-[#28513b] md:hidden"
              aria-label="Soumettre une entreprise à reprendre"
            >
              <Plus className="h-5 w-5" aria-hidden="true" />
            </button>

            {isFilterPanelOpen ? (
              <FilterPanel
                draftFilters={draftFilters}
                filterOptions={filterOptions}
                onApply={applyDraftFilters}
                onChange={setDraftFilters}
                onReset={resetFilters}
              />
            ) : null}
          </div>
        </div>
      </section>

      <section className="mx-auto grid w-full max-w-6xl items-start gap-5 px-4 pb-20 pt-5 md:grid-cols-[minmax(0,1fr)_20rem] md:px-8 md:pb-24 md:pt-8">
        <div className="grid gap-3">
          {filteredOpportunities.length > 0 ? (
            filteredOpportunities.map((opportunity) => (
              <OpportunityCard
                key={opportunity.source_id}
                opportunity={opportunity}
                onOpen={() => setSelectedOpportunity(opportunity)}
              />
            ))
          ) : (
            <div className="rounded-[1.15rem] border border-dashed border-dema-line bg-dema-paper p-6 text-sm leading-relaxed text-dema-muted">
              Aucune entreprise ne correspond à cette recherche.
            </div>
          )}
        </div>

        <aside
          aria-label="Soumettre une entreprise à reprendre"
          className="hidden rounded-[1.15rem] border border-dema-line/80 bg-dema-paper p-5 shadow-[0_4px_14px_rgba(23,35,29,0.018)] md:block"
        >
          <h2 className="text-lg font-medium leading-tight tracking-tight text-brand-blue/86">
            Soumettre une entreprise à reprendre
          </h2>
          <p className="mt-2 text-xs leading-relaxed text-dema-muted">
            Partagez une piste ou un dossier à regarder. On garde uniquement les informations utiles pour qualifier l’opportunité.
          </p>
          <SubmitForm />
        </aside>
      </section>

      <OpportunityDetailModal
        opportunity={selectedOpportunity}
        onInformationRequest={setInformationOpportunity}
        onClose={() => setSelectedOpportunity(null)}
      />

      <InformationRequestModal
        opportunity={informationOpportunity}
        onClose={() => setInformationOpportunity(null)}
      />

      <SubmitModal isOpen={isSubmitModalOpen} onClose={() => setIsSubmitModalOpen(false)} />
    </>
  );
}

function FilterPanel({
  draftFilters,
  filterOptions,
  onApply,
  onChange,
  onReset,
}: {
  draftFilters: FilterState;
  filterOptions: {
    sectors: string[];
    departments: string[];
    revenues: string[];
    employees: string[];
  };
  onApply: () => void;
  onChange: (filters: FilterState) => void;
  onReset: () => void;
}) {
  function updateFilter(key: keyof FilterState, value: string) {
    onChange({ ...draftFilters, [key]: value });
  }

  return (
    <div className="fixed inset-x-3 bottom-3 z-50 max-h-[calc(100dvh-1.5rem)] overflow-auto rounded-[1.35rem] border border-dema-line/90 bg-dema-paper/98 p-4 text-left shadow-[0_18px_45px_rgba(23,35,29,0.07)] md:absolute md:bottom-auto md:left-auto md:right-0 md:top-full md:mt-2 md:w-full md:max-w-xl">
      <div className="grid gap-3 md:grid-cols-2">
        <FilterSelect
          label="Secteur"
          value={draftFilters.sector}
          onChange={(value) => updateFilter("sector", value)}
          placeholder="Tous les secteurs"
          options={filterOptions.sectors}
        />
        <FilterSelect
          label="Département"
          value={draftFilters.department}
          onChange={(value) => updateFilter("department", value)}
          placeholder="Tous les départements"
          options={filterOptions.departments}
        />
        <FilterSelect
          label="CA"
          value={draftFilters.revenue}
          onChange={(value) => updateFilter("revenue", value)}
          placeholder="Tous les CA"
          options={filterOptions.revenues}
        />
        <FilterSelect
          label="Effectif"
          value={draftFilters.employee}
          onChange={(value) => updateFilter("employee", value)}
          placeholder="Tous les effectifs"
          options={filterOptions.employees}
        />
        <FilterSelect
          label="Date limite"
          value={draftFilters.deadline}
          onChange={(value) => updateFilter("deadline", value)}
          placeholder="Toutes"
          options={[
            { label: "7 jours", value: "7" },
            { label: "14 jours", value: "14" },
            { label: "30 jours", value: "30" },
          ]}
        />
        <FilterSelect
          label="Tri"
          value={draftFilters.sort}
          onChange={(value) => updateFilter("sort", value as FilterState["sort"])}
          options={[
            { label: "Date limite proche", value: "deadline" },
            { label: "Vues croissantes", value: "views" },
            { label: "CA renseigné", value: "revenue" },
          ]}
        />
      </div>
      <div className="mt-4 flex flex-col gap-3 border-t border-dema-line/80 pt-4 md:flex-row md:items-center md:justify-between">
        <span className="text-xs text-dema-muted">Affiner la liste</span>
        <div className="grid grid-cols-2 gap-2 md:flex">
          <button
            type="button"
            onClick={onReset}
            className="inline-flex h-9 items-center justify-center rounded-full bg-dema-sage px-4 text-sm font-normal text-dema-forest transition hover:bg-[#ebeee9]"
          >
            Réinitialiser
          </button>
          <button
            type="button"
            onClick={onApply}
            className="inline-flex h-9 items-center justify-center rounded-full bg-dema-forest px-4 text-sm font-medium text-dema-paper transition hover:bg-[#28513b]"
          >
            Appliquer
          </button>
        </div>
      </div>
    </div>
  );
}

function FilterSelect({
  label,
  onChange,
  options,
  placeholder,
  value,
}: {
  label: string;
  onChange: (value: string) => void;
  options: Array<string | { label: string; value: string }>;
  placeholder?: string;
  value: string;
}) {
  return (
    <label className="grid gap-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-brand-blue/44">
      {label}
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-11 appearance-none rounded-full border border-dema-line bg-dema-paper px-4 text-sm font-normal normal-case tracking-normal text-brand-blue outline-none"
      >
        {placeholder ? <option value="">{placeholder}</option> : null}
        {options.map((option) => {
          const optionValue = typeof option === "string" ? option : option.value;
          const optionLabel = typeof option === "string" ? option : option.label;

          return (
            <option key={optionValue} value={optionValue}>
              {optionLabel}
            </option>
          );
        })}
      </select>
    </label>
  );
}

function OpportunityCard({
  opportunity,
  onOpen,
}: {
  opportunity: ActifyOpportunity;
  onOpen: () => void;
}) {
  const facts = [opportunity.revenue_range, opportunity.employee_count_range].filter(Boolean);
  const primarySector = opportunity.sectors[0];

  return (
    <button
      type="button"
      onClick={onOpen}
      aria-label={`Voir le détail : ${opportunity.title}`}
      className="flex w-full cursor-pointer flex-col rounded-[1.15rem] border border-brand-blue/[0.08] bg-dema-paper p-4 text-left shadow-[0_4px_14px_rgba(23,35,29,0.018)] transition hover:-translate-y-px hover:border-dema-forest/14 hover:shadow-[0_10px_26px_rgba(23,35,29,0.035)] md:p-[17px_18px]"
    >
      <div className="min-w-0">
        <h2 className="line-clamp-2 text-base font-medium leading-[1.24] tracking-tight text-brand-blue">
          {opportunity.title}
        </h2>
        <div className="mt-2 flex flex-wrap gap-2 text-xs font-normal text-dema-muted">
          <span>{compact(opportunity.city)}</span>
          <span>Dpt. {compact(opportunity.department)}</span>
          <span>{compact(opportunity.views_count ?? 0)} vues</span>
        </div>
        {facts.length > 0 ? (
          <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-xs font-normal text-dema-muted">
            {facts.map((fact) => (
              <span key={fact}>{fact}</span>
            ))}
          </div>
        ) : null}
      </div>
      <div className="mt-4 flex min-w-0 flex-wrap items-start gap-2">
        <span className="rounded-full bg-dema-forest/10 px-2.5 py-1 text-[11px] font-normal text-dema-forest">
          {deadlineLabel(opportunity.deadline)}
        </span>
        {primarySector ? (
          <span className="rounded-full bg-dema-forest/10 px-2.5 py-1 text-[11px] font-normal text-dema-forest">
            {primarySector}
          </span>
        ) : null}
      </div>
    </button>
  );
}

function SubmitForm() {
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("sending");
    setErrorMessage("");

    const form = new FormData(event.currentTarget);
    const name = String(form.get("name") || "");
    const company = String(form.get("company") || "");
    const email = String(form.get("email") || "");
    const details = String(form.get("details") || "");

    try {
      const response = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          company,
          email,
          details,
          offer: "Soumission entreprise a reprendre",
          source: "Developper opportunities submit modal",
        }),
      });
      const payload = (await response.json().catch(() => null)) as
        | { error?: string }
        | null;

      if (!response.ok) {
        throw new Error(payload?.error || "Impossible d'envoyer la soumission.");
      }

      event.currentTarget.reset();
      setStatus("sent");
    } catch (error) {
      setStatus("error");
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Impossible d'envoyer la soumission pour le moment."
      );
    }
  }

  return (
    <form
      className="mt-4 grid gap-3"
      onSubmit={handleSubmit}
    >
      <FormField label="Nom" name="name" autoComplete="name" />
      <FormField label="Société" name="company" autoComplete="organization" />
      <FormField label="Email" name="email" type="email" autoComplete="email" required />
      <label className="grid gap-1.5 text-xs font-normal text-brand-blue/54">
        Lien ou description
        <textarea
          name="details"
          required
          className="min-h-24 resize-y rounded-[0.85rem] border border-dema-line bg-dema-paper px-3 py-2.5 text-sm font-normal text-brand-blue outline-none"
        />
      </label>
      {status === "sent" ? (
        <p className="rounded-[0.9rem] bg-dema-sage/70 px-3 py-2 text-sm text-dema-forest">
          C&apos;est envoyé. On revient vers vous rapidement.
        </p>
      ) : null}
      {status === "error" ? (
        <p className="rounded-[0.9rem] bg-dema-sage/70 px-3 py-2 text-sm text-dema-forest">
          {errorMessage}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={status === "sending"}
        className="mt-1 inline-flex min-h-11 w-full items-center justify-center rounded-full bg-dema-forest px-5 text-sm font-medium text-dema-paper transition hover:bg-[#28513b] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {status === "sending" ? "Envoi..." : "Envoyer"}
      </button>
    </form>
  );
}

function FormField({
  autoComplete,
  label,
  name,
  required = false,
  type = "text",
}: {
  autoComplete?: string;
  label: string;
  name: string;
  required?: boolean;
  type?: string;
}) {
  return (
    <label className="grid gap-1.5 text-xs font-normal text-brand-blue/54">
      {label}
      <input
        autoComplete={autoComplete}
        name={name}
        required={required}
        type={type}
        className="h-11 rounded-full border border-dema-line bg-dema-paper px-3 text-sm font-normal text-brand-blue outline-none"
      />
    </label>
  );
}

function OpportunityDetailModal({
  onClose,
  onInformationRequest,
  opportunity,
}: {
  onClose: () => void;
  onInformationRequest: (opportunity: ActifyOpportunity) => void;
  opportunity: ActifyOpportunity | null;
}) {
  if (!opportunity) return null;

  return (
    <Modal onClose={onClose}>
      <div className="flex items-start justify-between gap-5">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-dema-forest">
            Détail opportunité
          </p>
          <h2 className="mt-3 text-[clamp(1.35rem,3vw,1.85rem)] font-medium leading-[1.12] tracking-tight text-brand-blue">
            {opportunity.title}
          </h2>
          <div className="mt-2 flex flex-wrap gap-2 text-xs text-dema-muted">
            <span>{compact(opportunity.city)}</span>
            <span>Dpt. {compact(opportunity.department)}</span>
            <span>{compact(opportunity.views_count ?? 0)} vues</span>
            <span>{compact(opportunity.status)}</span>
          </div>
        </div>
        <IconCloseButton onClick={onClose} />
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <span className="rounded-full bg-dema-forest/10 px-2.5 py-1 text-[11px] font-normal text-dema-forest">
          {deadlineLabel(opportunity.deadline)}
        </span>
        {opportunity.sectors.map((sector) => (
          <span
            key={sector}
            className="rounded-full bg-dema-forest/10 px-2.5 py-1 text-[11px] font-normal text-dema-forest"
          >
            {sector}
          </span>
        ))}
      </div>

      <div className="my-5 grid gap-4 border-y border-dema-line/80 py-4 md:grid-cols-3">
        <Metric label="CA" value={compact(opportunity.revenue_range)} />
        <Metric label="Effectif" value={compact(opportunity.employee_count_range)} />
        <Metric label="Référence" value={compact(opportunity.reference)} />
        <Metric label="Ancienneté" value={compact(opportunity.company_age)} />
        <Metric label="Déficit" value={compact(opportunity.deficit_carryforward)} />
        <Metric label="Documents" value={opportunity.documents_available ? "Disponibles" : "Non détectés"} />
      </div>

      <div className="border-t border-dema-line/80 pt-5">
        <p className="whitespace-pre-line text-sm leading-relaxed text-dema-muted">
          {compact(opportunity.short_description)}
        </p>
      </div>

      <div className="mt-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <span className="text-xs text-dema-muted">{compact(opportunity.contact_study_name)}</span>
        <button
          type="button"
          onClick={() => onInformationRequest(opportunity)}
          className="inline-flex min-h-10 items-center justify-center rounded-full bg-dema-forest px-5 text-sm font-medium text-dema-paper transition hover:bg-[#28513b]"
        >
          Recevoir les informations
        </button>
      </div>
    </Modal>
  );
}

function InformationRequestModal({
  onClose,
  opportunity,
}: {
  onClose: () => void;
  opportunity: ActifyOpportunity | null;
}) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  if (!opportunity) return null;

  const currentOpportunity = opportunity;

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("sending");
    setErrorMessage("");

    try {
      const response = await fetch("/api/actify-information-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          opportunityId: currentOpportunity.source_id,
        }),
      });
      const payload = (await response.json().catch(() => null)) as
        | { error?: string; ok?: boolean }
        | null;

      if (!response.ok || !payload?.ok) {
        throw new Error(payload?.error || "Impossible d'envoyer la demande.");
      }

      setStatus("sent");
    } catch (error) {
      setStatus("error");
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Impossible d'envoyer la demande pour le moment.",
      );
    }
  }

  return (
    <Modal onClose={onClose}>
      <div className="flex items-start justify-between gap-5">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-dema-forest">
            Informations
          </p>
          <h2 className="mt-3 text-[clamp(1.35rem,7vw,2rem)] font-medium leading-tight tracking-tight text-brand-blue">
            Recevoir les informations
          </h2>
        </div>
        <IconCloseButton onClick={onClose} />
      </div>

      <div className="mt-5 rounded-[1rem] border border-dema-line bg-dema-cream/70 p-4">
        <p className="text-sm font-medium leading-snug text-brand-blue">
          {currentOpportunity.title}
        </p>
        <p className="mt-2 text-xs leading-relaxed text-dema-muted">
          Référence : {compact(currentOpportunity.reference)} · ID : {currentOpportunity.source_id}
        </p>
      </div>

      {status === "sent" ? (
        <div className="mt-5 rounded-[1rem] bg-dema-sage px-4 py-4 text-sm leading-relaxed text-dema-forest">
          C&apos;est envoyé. On revient vers vous avec les informations liées à cette annonce.
        </div>
      ) : (
        <form className="mt-5 grid gap-3" onSubmit={handleSubmit}>
          <label className="grid gap-1.5 text-xs font-normal text-brand-blue/54">
            Email
            <input
              required
              autoComplete="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="h-11 rounded-full border border-dema-line bg-dema-paper px-3 text-sm font-normal text-brand-blue outline-none"
              placeholder="vous@entreprise.fr"
            />
          </label>
          {status === "error" ? (
            <p className="rounded-[0.9rem] bg-dema-sage/70 px-3 py-2 text-sm text-dema-forest">
              {errorMessage}
            </p>
          ) : null}
          <button
            type="submit"
            disabled={status === "sending"}
            className="mt-1 inline-flex min-h-11 w-full items-center justify-center rounded-full bg-dema-forest px-5 text-sm font-medium text-dema-paper transition hover:bg-[#28513b] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {status === "sending" ? "Envoi..." : "Recevoir les informations"}
          </button>
        </form>
      )}
    </Modal>
  );
}

function SubmitModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  if (!isOpen) return null;

  return (
    <Modal onClose={onClose}>
      <div className="flex items-start justify-between gap-5">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-dema-forest">
            Soumission
          </p>
          <h2 className="mt-3 text-[clamp(1.35rem,7vw,2rem)] font-medium leading-tight tracking-tight text-brand-blue">
            Soumettre une entreprise à reprendre
          </h2>
        </div>
        <IconCloseButton onClick={onClose} />
      </div>
      <div className="mt-5 border-t border-dema-line/80 pt-5">
        <SubmitForm />
      </div>
    </Modal>
  );
}

function Modal({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[1100] flex items-end justify-center bg-brand-blue/22 p-3 md:items-start md:p-14"
      role="dialog"
      aria-modal="true"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="max-h-[88vh] w-full max-w-[720px] overflow-auto rounded-[1.15rem] border border-dema-line bg-dema-paper p-5 text-brand-blue shadow-[0_24px_70px_rgba(23,35,29,0.12)] md:max-h-[calc(100vh-6rem)] md:p-6">
        {children}
      </div>
    </div>
  );
}

function IconCloseButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-dema-sage text-dema-forest transition hover:bg-[#ebeee9]"
      aria-label="Fermer"
    >
      <X className="h-4 w-4" aria-hidden="true" />
    </button>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span className="block text-[10px] font-semibold uppercase tracking-[0.12em] text-brand-blue/42">
        {label}
      </span>
      <strong className="mt-1 block text-sm font-medium leading-snug text-brand-blue">
        {value}
      </strong>
    </div>
  );
}
