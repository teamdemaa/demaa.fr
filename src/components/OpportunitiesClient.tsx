"use client";

import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { ChevronDown, Plus, SlidersHorizontal, X } from "lucide-react";
import PrimaryMobileNav from "@/components/PrimaryMobileNav";
import {
  opportunities,
  opportunitySectors,
  type Opportunity,
} from "@/lib/opportunities";

const ALL_SECTORS = opportunitySectors[0];

type CitySuggestion = {
  id: string;
  label: string;
};

function formatPublishedDate(value: string) {
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return "Publié récemment";

  const today = new Date();
  const todayKey = today.toISOString().slice(0, 10);
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  const yesterdayKey = yesterday.toISOString().slice(0, 10);

  if (value === todayKey) return "Publié aujourd'hui";
  if (value === yesterdayKey) return "Publié hier";

  return `Publié le ${date.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
  })}`;
}

export default function OpportunitiesClient() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeSector, setActiveSector] = useState<string>(ALL_SECTORS);
  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
  const [isAlertSubmitted, setIsAlertSubmitted] = useState(false);
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
  const [isReplyModalOpen, setIsReplyModalOpen] = useState(false);
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  const [isDesktopPublishSubmitted, setIsDesktopPublishSubmitted] = useState(false);
  const [isMobilePublishSubmitted, setIsMobilePublishSubmitted] = useState(false);
  const [isReplySubmitted, setIsReplySubmitted] = useState(false);

  const filteredOpportunities = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return opportunities.filter((opportunity) => {
      const matchesSector =
        activeSector === ALL_SECTORS || opportunity.sector === activeSector;
      const matchesSearch =
        !query ||
        opportunity.sector.toLowerCase().includes(query) ||
        opportunity.location.toLowerCase().includes(query) ||
        opportunity.amount.toLowerCase().includes(query) ||
        Boolean(opportunity.revenue?.toLowerCase().includes(query)) ||
        Boolean(opportunity.result?.toLowerCase().includes(query)) ||
        Boolean(opportunity.employees?.toLowerCase().includes(query)) ||
        opportunity.title.toLowerCase().includes(query) ||
        opportunity.description.toLowerCase().includes(query);

      return matchesSector && matchesSearch;
    });
  }, [activeSector, searchQuery]);

  function openReplyModal() {
    setIsReplySubmitted(false);
    setIsReplyModalOpen(true);
  }

  function openAlertModal() {
    setIsAlertSubmitted(false);
    setIsAlertModalOpen(true);
  }

  function openPublishModal() {
    setIsMobilePublishSubmitted(false);
    setIsPublishModalOpen(true);
  }

  function selectSector(sector: string) {
    setActiveSector(sector);
    setIsFilterPanelOpen(false);
  }

  return (
    <>
      <section className="ml-[calc(50%-50vw)] mr-[calc(50%-50vw)] w-screen bg-dema-cream px-4 pb-3 pt-5 text-center md:px-8 md:pb-3 md:pt-16">
        <div className="mx-auto max-w-6xl space-y-6 md:space-y-7">
          <PrimaryMobileNav activeTab="developper" />

          <div className="mx-auto max-w-5xl">
            <h1 className="text-[clamp(3rem,13vw,3.25rem)] leading-[0.92] tracking-tight sm:text-[2.75rem] md:text-[3.65rem] lg:text-[4.35rem]">
              <span className="demaa-hero-title text-brand-blue/86">
                Développer
              </span>
              <br />
              <span className="font-sans font-light not-italic text-brand-blue/44">
                en reprenant une entreprise.
              </span>
            </h1>
          </div>

          <div className="mx-auto grid w-full max-w-4xl grid-cols-[minmax(0,1fr)_auto] items-center gap-2 md:block">
            <SearchBar
              value={searchQuery}
              placeholder="Rechercher une entreprise, une ville, un secteur..."
              onChange={setSearchQuery}
              activeSector={activeSector}
              isFilterOpen={isFilterPanelOpen}
              onFilterClick={() => setIsFilterPanelOpen((current) => !current)}
            />
            <button
              type="button"
              onClick={openPublishModal}
              className="inline-flex h-[46px] w-[46px] shrink-0 items-center justify-center rounded-full bg-dema-sage text-dema-forest transition hover:bg-[#ebeee9] md:hidden"
              aria-label="Proposer une entreprise"
            >
              <Plus className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
          {isFilterPanelOpen ? (
            <FilterPanel
              sectors={opportunitySectors}
              activeSector={activeSector}
              onSelect={selectSector}
            />
          ) : null}
        </div>
      </section>

      <section className="mx-auto grid w-full max-w-6xl items-start gap-5 px-4 pb-20 pt-9 md:grid-cols-[minmax(0,1fr)_20rem] md:px-8 md:pb-24 md:pt-10">
        <div className="grid gap-3">
          {filteredOpportunities.length > 0 ? (
            filteredOpportunities.map((opportunity) => (
              <OpportunityCard
                key={opportunity.id}
                opportunity={opportunity}
                onReply={openReplyModal}
              />
            ))
          ) : (
            <div className="rounded-[1.15rem] border border-dashed border-dema-line bg-dema-paper p-6 text-sm leading-relaxed text-dema-muted">
              Aucune entreprise ne correspond à cette recherche.
            </div>
          )}
        </div>

        <aside className="hidden rounded-[1.15rem] border border-dema-line/80 bg-dema-paper p-5 shadow-[0_4px_14px_rgba(23,35,29,0.018)] md:block">
          {isDesktopPublishSubmitted ? (
            <SuccessMessage>
              Votre entreprise va être vérifiée puis publiée sous 24 heures.
            </SuccessMessage>
          ) : (
            <>
              <h2 className="text-lg font-medium tracking-tight text-brand-blue/86">
                Proposer une entreprise
              </h2>
              <p className="mt-2 text-xs leading-relaxed text-dema-muted">
                Entreprise à céder. Demaa vérifie avant publication.
              </p>
              <PublishForm onSubmit={() => setIsDesktopPublishSubmitted(true)} />
            </>
          )}
        </aside>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 pb-20 md:px-8 md:pb-24">
        <div className="mx-auto max-w-3xl rounded-[1rem] border border-dema-line/70 bg-dema-sage/30 px-5 py-10 text-center md:px-8 md:py-12">
          <p className="text-base font-semibold leading-snug text-brand-blue md:text-lg">
            Recevoir les nouvelles entreprises à reprendre par mail
          </p>
          <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-dema-muted">
            Créez une alerte selon vos critères.
          </p>
          <button
            type="button"
            onClick={openAlertModal}
            className="mt-6 rounded-full bg-dema-paper px-5 py-2.5 text-sm font-medium text-dema-forest transition hover:bg-[#ebeee9]"
          >
            Créer une alerte
          </button>
        </div>
      </section>

      <ReplyModal
        isOpen={isReplyModalOpen}
        isSubmitted={isReplySubmitted}
        onClose={() => setIsReplyModalOpen(false)}
        onSubmit={() => setIsReplySubmitted(true)}
      />

      <AlertModal
        activeSector={activeSector}
        isOpen={isAlertModalOpen}
        isSubmitted={isAlertSubmitted}
        onClose={() => setIsAlertModalOpen(false)}
        onSubmit={() => setIsAlertSubmitted(true)}
      />

      <PublishModal
        isOpen={isPublishModalOpen}
        isSubmitted={isMobilePublishSubmitted}
        onClose={() => setIsPublishModalOpen(false)}
        onSubmit={() => setIsMobilePublishSubmitted(true)}
      />
    </>
  );
}

function SearchBar({
  value,
  placeholder,
  onChange,
  activeSector,
  isFilterOpen,
  onFilterClick,
}: {
  value: string;
  placeholder: string;
  onChange: (value: string) => void;
  activeSector: string;
  isFilterOpen: boolean;
  onFilterClick: () => void;
}) {
  return (
    <div className="demaa-search-shell mx-auto w-full max-w-4xl">
      <div className="relative">
        <input
          type="search"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          aria-label={placeholder}
          className="w-full rounded-full bg-dema-paper py-2.5 pl-5 pr-24 text-sm font-normal text-brand-blue outline-none transition placeholder:text-brand-blue/36 md:py-3 md:pl-6 md:pr-28 md:text-base"
        />
        <button
          type="button"
          onClick={onFilterClick}
          className={`absolute right-2 top-1/2 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full transition md:h-9 md:w-9 ${
            activeSector === ALL_SECTORS
              ? "bg-dema-sage text-dema-forest"
              : "bg-dema-forest text-dema-paper"
          }`}
          aria-expanded={isFilterOpen}
          aria-label="Afficher les filtres"
        >
          <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
        </button>
        {value ? (
          <button
            type="button"
            onClick={() => onChange("")}
            className="absolute right-11 top-1/2 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-dema-forest/42 transition hover:bg-dema-sage/70 hover:text-dema-forest/70 md:right-12"
            aria-label="Effacer la recherche"
          >
            <X className="h-4 w-4" />
          </button>
        ) : null}
      </div>
    </div>
  );
}

function FilterPanel({
  sectors,
  activeSector,
  onSelect,
}: {
  sectors: readonly string[];
  activeSector: string;
  onSelect: (sector: string) => void;
}) {
  return (
    <div className="mx-auto -mt-1 max-w-4xl overflow-x-auto pb-1 soft-scroll">
      <div className="flex min-w-max gap-2 px-1">
        {sectors.map((sector) => (
          <button
            key={sector}
            type="button"
            onClick={() => onSelect(sector)}
            className={`demaa-chip shrink-0 whitespace-nowrap ${activeSector === sector ? "demaa-chip-active" : ""}`}
          >
            {sector}
          </button>
        ))}
      </div>
    </div>
  );
}

function OpportunityCard({
  opportunity,
  onReply,
}: {
  opportunity: Opportunity;
  onReply: () => void;
}) {
  return (
    <article
      role="button"
      tabIndex={0}
      onClick={onReply}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onReply();
        }
      }}
      className="grid cursor-pointer gap-4 rounded-[1.15rem] border border-dema-line/80 bg-dema-paper p-5 text-left shadow-[0_4px_14px_rgba(23,35,29,0.018)] transition hover:border-dema-forest/14 hover:shadow-[0_14px_32px_rgba(23,35,29,0.045)]"
    >
      <div>
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px]">
          <span className="font-semibold uppercase tracking-[0.14em] text-dema-forest">
            {opportunity.sector}
          </span>
          <time className="font-normal text-brand-blue/34" dateTime={opportunity.publishedAt}>
            {formatPublishedDate(opportunity.publishedAt)}
          </time>
        </div>
        <h2 className="mt-3 max-w-3xl text-lg font-normal leading-snug tracking-tight text-brand-blue/88 md:text-xl">
          {opportunity.title}
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-dema-muted">
          {opportunity.description}
        </p>
        <div className="mt-3 flex flex-wrap gap-2 text-xs font-medium text-brand-blue/58">
          <span className="rounded-full border border-dema-line bg-dema-cream px-3 py-1">
            {opportunity.location}
          </span>
          <span className="rounded-full border border-dema-line bg-dema-cream px-3 py-1">
            {opportunity.amount}
          </span>
          {opportunity.revenue ? (
            <span className="rounded-full border border-dema-line bg-dema-cream px-3 py-1">
              {opportunity.revenue}
            </span>
          ) : null}
          {opportunity.result ? (
            <span className="rounded-full border border-dema-line bg-dema-cream px-3 py-1">
              {opportunity.result}
            </span>
          ) : null}
          {opportunity.employees ? (
            <span className="rounded-full border border-dema-line bg-dema-cream px-3 py-1">
              {opportunity.employees}
            </span>
          ) : null}
        </div>
      </div>
      <button
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          onReply();
        }}
        className="justify-self-start rounded-full border border-dema-forest/16 bg-dema-paper px-4 py-2 text-sm font-medium text-dema-forest transition hover:bg-dema-sage"
      >
        Demander le dossier
      </button>
    </article>
  );
}

function PublishForm({ onSubmit }: { onSubmit: () => void }) {
  return (
    <form
      className="mt-4 grid gap-3"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
    >
      <FormField
        id="company"
        label="Société à céder"
        defaultValue="Agence web Rhône"
      />
      <FormField
        id="need"
        label="Titre de l'entreprise"
        defaultValue="Agence digitale avec portefeuille clients récurrents"
        maxLength={120}
      />
      <label className="grid gap-1.5 text-xs font-medium text-brand-blue/52">
        Secteur
        <span className="relative">
          <select className="h-11 w-full appearance-none rounded-[0.85rem] border border-dema-line bg-dema-paper px-3 py-2.5 pr-10 text-sm font-normal text-brand-blue outline-none">
            {opportunitySectors.slice(1).map((sector) => (
              <option key={sector}>{sector}</option>
            ))}
          </select>
          <ChevronDown
            className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-blue/45"
            aria-hidden="true"
          />
        </span>
      </label>
      <CityAutocompleteField
        id="location"
        label="Localisation"
        placeholder="Ex : Nantes"
        defaultValue="Lyon"
      />
      <FormField
        id="amount"
        label="Prix demandé"
        defaultValue="Prix demandé 280 k€"
      />
      <FormField
        id="revenue"
        label="Chiffre d'affaires approximatif"
        defaultValue="CA annuel 420 k€"
      />
      <FormField
        id="result"
        label="Résultat approximatif"
        defaultValue="Résultat 85 k€"
      />
      <FormField
        id="employees"
        label="Nombre de salariés"
        defaultValue="6 salariés"
      />
      <FormField
        id="email"
        label="Email de contact"
        type="email"
        defaultValue="cession@entreprise.fr"
      />
      <FormField id="phone" label="Téléphone / WhatsApp" defaultValue="+33 6 12 34 56 78" />
      <label className="grid gap-1.5 text-xs font-medium text-brand-blue/52">
        Description courte
        <textarea
          maxLength={350}
          defaultValue="Dossier complet transmis après qualification du repreneur. Accompagnement possible pendant trois mois."
          className="min-h-24 resize-y rounded-[0.85rem] border border-dema-line bg-dema-paper px-3 py-2.5 text-sm font-normal text-brand-blue outline-none"
        />
      </label>
      <button type="submit" className="demaa-primary-button min-h-10 w-full">
        Soumettre
      </button>
    </form>
  );
}

function FormField({
  id,
  label,
  defaultValue,
  maxLength,
  name,
  placeholder,
  required,
  type = "text",
}: {
  id: string;
  label: string;
  defaultValue?: string;
  maxLength?: number;
  name?: string;
  placeholder?: string;
  required?: boolean;
  type?: string;
}) {
  return (
    <label className="grid gap-1.5 text-xs font-medium text-brand-blue/52" htmlFor={id}>
      {label}
      <input
        id={id}
        name={name}
        type={type}
        defaultValue={defaultValue}
        maxLength={maxLength}
        placeholder={placeholder}
        required={required}
        className="rounded-[0.85rem] border border-dema-line bg-dema-paper px-3 py-2.5 text-sm font-normal text-brand-blue outline-none placeholder:text-brand-blue/30"
      />
    </label>
  );
}

function CityAutocompleteField({
  id,
  label,
  placeholder,
  defaultValue,
}: {
  id: string;
  label: string;
  placeholder?: string;
  defaultValue?: string;
}) {
  const [value, setValue] = useState(defaultValue || "");
  const [suggestions, setSuggestions] = useState<CitySuggestion[]>([]);
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    const query = value.trim();

    if (query.length < 2) {
      return;
    }

    const controller = new AbortController();
    const timeout = window.setTimeout(async () => {
      try {
        const params = new URLSearchParams({
          q: query,
          type: "municipality",
          autocomplete: "1",
          limit: "5",
        });
        const response = await fetch(
          `https://api-adresse.data.gouv.fr/search/?${params.toString()}`,
          { signal: controller.signal }
        );
        const payload = (await response.json()) as {
          features?: Array<{
            properties?: {
              id?: string;
              label?: string;
              city?: string;
              postcode?: string;
            };
          }>;
        };

        const nextSuggestions: CitySuggestion[] = [];

        for (const feature of payload.features || []) {
          const properties = feature.properties;
          const suggestionLabel = properties?.label || properties?.city;

          if (suggestionLabel) {
            nextSuggestions.push({
              id: properties?.id || suggestionLabel,
              label: suggestionLabel,
            });
          }
        }

        setSuggestions(nextSuggestions);
      } catch (error) {
        if (!(error instanceof DOMException && error.name === "AbortError")) {
          setSuggestions([]);
        }
      }
    }, 220);

    return () => {
      controller.abort();
      window.clearTimeout(timeout);
    };
  }, [value]);

  return (
    <div className="relative grid gap-1.5 text-xs font-medium text-brand-blue/52">
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        name={id}
        value={value}
        onChange={(event) => {
          const nextValue = event.target.value;
          setValue(nextValue);

          if (nextValue.trim().length < 2) {
            setSuggestions([]);
          }
        }}
        onFocus={() => setIsFocused(true)}
        onBlur={() => window.setTimeout(() => setIsFocused(false), 120)}
        placeholder={placeholder}
        autoComplete="address-level2"
        className="rounded-[0.85rem] border border-dema-line bg-dema-paper px-3 py-2.5 text-sm font-normal text-brand-blue outline-none placeholder:text-brand-blue/30"
      />
      {isFocused && value.trim().length >= 2 && suggestions.length > 0 ? (
        <span className="absolute left-0 right-0 top-full z-20 mt-1 overflow-hidden rounded-[0.85rem] border border-dema-line bg-dema-paper text-sm font-normal text-brand-blue shadow-[0_14px_32px_rgba(23,35,29,0.08)]">
          {suggestions.map((suggestion) => (
            <button
              key={suggestion.id}
              type="button"
              onMouseDown={(event) => {
                event.preventDefault();
                setValue(suggestion.label);
                setSuggestions([]);
              }}
              className="block w-full px-3 py-2 text-left transition hover:bg-dema-sage"
            >
              {suggestion.label}
            </button>
          ))}
        </span>
      ) : null}
    </div>
  );
}

function ReplyModal({
  isOpen,
  isSubmitted,
  onClose,
  onSubmit,
}: {
  isOpen: boolean;
  isSubmitted: boolean;
  onClose: () => void;
  onSubmit: () => void;
}) {
  if (!isOpen) return null;

  return (
    <Modal onClose={onClose}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-medium tracking-tight text-brand-blue/88">
            Demander le dossier
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-dema-muted">
            Laissez vos coordonnées et un message court. Demaa transmettra le dossier si
            votre demande correspond au profil recherché.
          </p>
        </div>
        <CloseButton onClose={onClose} />
      </div>
      {isSubmitted ? (
        <SuccessMessage>
          Merci, c&apos;est bien reçu. Nous qualifions votre demande avant de partager le
          dossier de cession.
        </SuccessMessage>
      ) : (
        <form
          className="mt-5 grid gap-3"
          onSubmit={(event) => {
            event.preventDefault();
            onSubmit();
          }}
        >
          <FormField id="reply-name" label="Nom" />
          <FormField id="reply-company" label="Société" />
          <FormField id="reply-email" label="Email" type="email" />
          <FormField id="reply-phone" label="Téléphone / WhatsApp" />
          <label className="grid gap-1.5 text-xs font-medium text-brand-blue/52">
            Message
            <textarea
              placeholder="Votre intérêt, capacité de reprise ou dossier utile..."
              className="min-h-24 resize-y rounded-[0.85rem] border border-dema-line bg-dema-paper px-3 py-2.5 text-sm font-normal text-brand-blue outline-none placeholder:text-brand-blue/30"
            />
          </label>
          <button type="submit" className="demaa-primary-button min-h-11 w-full">
            Envoyer ma demande
          </button>
        </form>
      )}
    </Modal>
  );
}

function AlertModal({
  activeSector,
  isOpen,
  isSubmitted,
  onClose,
  onSubmit,
}: {
  activeSector: string;
  isOpen: boolean;
  isSubmitted: boolean;
  onClose: () => void;
  onSubmit: () => void;
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const defaultSector = activeSector === ALL_SECTORS ? "" : activeSector;

  if (!isOpen) return null;

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const formData = new FormData(event.currentTarget);
    const sector = String(formData.get("sector") || "").trim();
    const keyword = String(formData.get("keyword") || "").trim();
    const email = String(formData.get("email") || "").trim();

    if (!sector || !email) {
      setError("Merci d'indiquer un secteur et un email.");
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await fetch("/api/opportunity-alerts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sector, keyword, email }),
      });
      const payload = (await response.json().catch(() => null)) as
        | { error?: string }
        | null;

      if (!response.ok) {
        throw new Error(
          payload?.error ||
            "Impossible d'activer l'alerte pour le moment."
        );
      }

      onSubmit();
    } catch (submissionError) {
      setError(
        submissionError instanceof Error
          ? submissionError.message
          : "Impossible d'activer l'alerte pour le moment."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Modal onClose={onClose}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-medium tracking-tight text-brand-blue/88">
            Créer une alerte
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-dema-muted">
            On vous prévient quand une entreprise à reprendre correspond.
          </p>
        </div>
        <CloseButton onClose={onClose} />
      </div>
      {isSubmitted ? (
        <SuccessMessage>
          Alerte activée. Vous serez prévenu par mail lorsqu&apos;une entreprise à reprendre correspond.
        </SuccessMessage>
      ) : (
        <form className="mt-5 grid gap-3" onSubmit={handleSubmit}>
          <label className="grid gap-1.5 text-xs font-medium text-brand-blue/52">
            Secteur
            <span className="relative">
              <select
                name="sector"
                defaultValue={defaultSector}
                className="h-11 w-full appearance-none rounded-[0.85rem] border border-dema-line bg-dema-paper px-3 py-2.5 pr-10 text-sm font-normal text-brand-blue outline-none"
                required
              >
                <option value="">Choisir un secteur</option>
                {opportunitySectors.slice(1).map((sector) => (
                  <option key={sector} value={sector}>
                    {sector}
                  </option>
                ))}
              </select>
              <ChevronDown
                className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-blue/45"
                aria-hidden="true"
              />
            </span>
          </label>
          <FormField id="alert-keyword" name="keyword" label="Mot-clé" placeholder="Ex : Nantes, restaurant, 300 k€" />
          <FormField
            id="alert-email"
            name="email"
            label="Email"
            type="email"
            placeholder="vous@entreprise.fr"
            required
          />
          {error ? (
            <p className="text-sm leading-relaxed text-dema-forest">{error}</p>
          ) : null}
          <button
            type="submit"
            disabled={isSubmitting}
            className="demaa-primary-button min-h-11 w-full disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? "Activation..." : "Activer l’alerte"}
          </button>
        </form>
      )}
    </Modal>
  );
}

function PublishModal({
  isOpen,
  isSubmitted,
  onClose,
  onSubmit,
}: {
  isOpen: boolean;
  isSubmitted: boolean;
  onClose: () => void;
  onSubmit: () => void;
}) {
  if (!isOpen) return null;

  return (
    <Modal onClose={onClose}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-medium tracking-tight text-brand-blue/88">
            Proposer une entreprise
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-dema-muted">
            Entreprise à céder. Demaa vérifie avant publication.
          </p>
        </div>
        <CloseButton onClose={onClose} />
      </div>
      {isSubmitted ? (
        <SuccessMessage>
          Votre entreprise va être vérifiée puis publiée sous 24 heures.
        </SuccessMessage>
      ) : (
        <PublishForm onSubmit={onSubmit} />
      )}
    </Modal>
  );
}

function Modal({
  children,
  onClose,
}: {
  children: ReactNode;
  onClose: () => void;
}) {
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-brand-blue/30 p-4"
      role="presentation"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-[1.25rem] border border-dema-line bg-dema-paper p-5 shadow-[0_24px_60px_rgba(23,35,29,0.14)]"
        role="dialog"
        aria-modal="true"
        onClick={(event) => event.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}

function CloseButton({ onClose }: { onClose: () => void }) {
  return (
    <button
      type="button"
      onClick={onClose}
      className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-dema-line bg-dema-paper text-brand-blue/58 transition hover:text-dema-forest"
      aria-label="Fermer"
    >
      <X className="h-4 w-4" />
    </button>
  );
}

function SuccessMessage({ children }: { children: ReactNode }) {
  return (
    <div className="mt-4 rounded-[0.85rem] bg-dema-sage px-4 py-3 text-sm leading-relaxed text-dema-forest">
      {children}
    </div>
  );
}
