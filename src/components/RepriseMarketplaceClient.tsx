"use client";

import Link from "next/link";
import {
  Building2,
  Check,
  ChevronRight,
  Clock3,
  Euro,
  MapPin,
  Search,
  SlidersHorizontal,
  UsersRound,
} from "lucide-react";
import { type FormEvent, useMemo, useState } from "react";
import BusinessEstimateControl from "@/components/BusinessEstimateControl";
import DirectoryDetailDialogShell from "@/components/DirectoryDetailDialogShell";
import Navbar from "@/components/Navbar";
import {
  getLeadAttributionPayload,
  trackLeadConversion,
} from "@/lib/lead-attribution-client";
import {
  clearLeadSubmissionKey,
  getLeadSubmissionKey,
} from "@/lib/lead-submission-client";
import { satoshiHeroTitleClassName } from "@/lib/marketing-hero-style";
import type { RepriseOpportunity } from "@/lib/reprise-opportunities";

const categories = ["Toutes", "Services terrain", "Services professionnels", "Logiciels"] as const;
type CategoryFilter = (typeof categories)[number];

const inputClassName =
  "mt-2 min-h-12 w-full rounded-2xl border border-dema-line bg-dema-cream/35 px-4 py-3 text-sm text-brand-blue outline-none transition placeholder:text-dema-muted/55 focus:border-dema-forest/45 focus:ring-2 focus:ring-dema-forest/15";
const primaryButtonClassName =
  "inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-dema-forest px-6 py-3 text-sm font-semibold text-dema-paper transition hover:bg-brand-blue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dema-forest/35 disabled:cursor-wait disabled:opacity-65";

type SubmissionState = "idle" | "submitting" | "success" | "error";

async function submitForm(endpoint: string, payload: Record<string, unknown>) {
  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const body = (await response.json().catch(() => null)) as { error?: string; ok?: boolean } | null;
  if (response.status !== 202 || body?.ok !== true) {
    throw new Error(body?.error || "Impossible d’envoyer la demande pour le moment.");
  }
}

function BuyerRequestForm({ opportunity }: { opportunity: RepriseOpportunity }) {
  const [state, setState] = useState<SubmissionState>("idle");
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (state === "submitting") return;
    const form = event.currentTarget;
    const data = new FormData(form);
    setState("submitting");
    setError("");
    const flowKey = `reprise-interest:${opportunity.id}`;
    try {
      await submitForm("/api/reprise-interest", {
        attribution: getLeadAttributionPayload(),
        email: data.get("email"),
        faxNumber: data.get("faxNumber"),
        idempotencyKey: getLeadSubmissionKey(flowKey),
        message: data.get("message"),
        name: data.get("name"),
        opportunityId: opportunity.id,
        phone: data.get("phone"),
      });
      clearLeadSubmissionKey(flowKey);
      form.reset();
      setState("success");
      trackLeadConversion({ requestType: "reprise_interest", systemSlug: opportunity.id });
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : "Impossible d’envoyer la demande.");
      setState("error");
    }
  }

  if (state === "success") {
    return (
      <div className="mt-7 rounded-[1.5rem] bg-dema-sage/55 p-6 text-center">
        <span className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-dema-forest text-dema-paper">
          <Check className="h-5 w-5" aria-hidden="true" />
        </span>
        <h3 className="mt-4 text-xl font-medium">Demande envoyée.</h3>
        <p className="mt-2 text-sm leading-6 text-dema-muted">
          Demaa vérifie d’abord que l’opportunité est toujours disponible, puis transmet votre demande au contact concerné.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-7 space-y-4" noValidate>
      <label className="block text-sm font-medium">
        Nom et prénom
        <input className={inputClassName} name="name" autoComplete="name" maxLength={160} required />
      </label>
      <label className="block text-sm font-medium">
        Email
        <input className={inputClassName} name="email" type="email" autoComplete="email" maxLength={160} required />
      </label>
      <label className="block text-sm font-medium">
        Téléphone <span className="font-normal text-dema-muted">(facultatif)</span>
        <input className={inputClassName} name="phone" type="tel" autoComplete="tel" maxLength={40} />
      </label>
      <label className="block text-sm font-medium">
        Votre projet <span className="font-normal text-dema-muted">(facultatif)</span>
        <textarea className={`${inputClassName} min-h-28 resize-y`} name="message" maxLength={2000} placeholder="Votre expérience, votre recherche ou vos questions." />
      </label>
      <label className="hidden" aria-hidden="true">
        Fax
        <input name="faxNumber" tabIndex={-1} autoComplete="off" />
      </label>
      {error ? <p className="text-sm font-medium text-red-700" role="alert">{error}</p> : null}
      <button className={`${primaryButtonClassName} w-full`} disabled={state === "submitting"} type="submit">
        {state === "submitting" ? "Envoi…" : "Demander une mise en relation"}
      </button>
      <p className="text-xs leading-5 text-dema-muted">
        Vos informations servent uniquement à traiter cette demande. Consultez notre{" "}
        <Link href="/politique-de-confidentialite" className="underline underline-offset-2">politique de confidentialité</Link>.
      </p>
    </form>
  );
}

function OpportunityDialog({ opportunity, onClose }: { opportunity: RepriseOpportunity; onClose: () => void }) {
  return (
    <DirectoryDetailDialogShell ariaLabel={`Détail de l’opportunité ${opportunity.activity}`} maxWidthClassName="max-w-3xl" onClose={onClose}>
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-dema-forest">{opportunity.category}</p>
      <h2 className="mt-3 text-3xl font-medium tracking-[-0.04em] sm:text-4xl">{opportunity.activity}</h2>
      <p className="mt-4 inline-flex items-center gap-2 text-sm text-dema-muted">
        <MapPin className="h-4 w-4" aria-hidden="true" />{opportunity.location}
      </p>
      <dl className="mt-7 grid gap-3 sm:grid-cols-2">
        <Metric label="Chiffre d’affaires publié" value={opportunity.revenue ?? "Non disponible"} />
        <Metric label="EBE ou rentabilité publiée" value={opportunity.ebe ?? "Non disponible"} />
        <Metric label="Équipe publiée" value={opportunity.employees ?? "Non disponible"} />
        <Metric label="Prix demandé publié" value={opportunity.askingPrice ?? "Non disponible"} />
      </dl>
      <div className="mt-7 border-t border-dema-line pt-6">
        <h3 className="text-sm font-semibold">Ce qui est communiqué</h3>
        <ul className="mt-3 space-y-2 text-sm leading-6 text-dema-muted">
          {opportunity.highlights.map((highlight) => <li key={highlight} className="flex gap-2"><Check className="mt-1 h-4 w-4 shrink-0 text-dema-forest" aria-hidden="true" /><span>{highlight}</span></li>)}
        </ul>
      </div>
      <BuyerRequestForm opportunity={opportunity} />
    </DirectoryDetailDialogShell>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return <div className="rounded-2xl border border-dema-line bg-dema-cream/40 p-4"><dt className="text-xs text-dema-muted">{label}</dt><dd className="mt-2 text-sm font-semibold leading-6 text-brand-blue">{value}</dd></div>;
}

function OpportunityCard({ opportunity, onSelect }: { opportunity: RepriseOpportunity; onSelect: () => void }) {
  return (
    <button type="button" onClick={onSelect} className="group flex h-full min-h-[23rem] w-full flex-col rounded-[1.75rem] border border-dema-line bg-dema-paper p-6 text-left transition hover:-translate-y-0.5 hover:border-dema-forest/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dema-forest/30 sm:p-7">
      <span className="flex items-start justify-between gap-4"><span className="flex h-12 w-12 items-center justify-center rounded-full bg-dema-sage text-dema-forest"><Building2 className="h-5 w-5" strokeWidth={1.7} aria-hidden="true" /></span><ChevronRight className="mt-3 h-5 w-5 text-dema-muted transition group-hover:translate-x-1 group-hover:text-dema-forest" aria-hidden="true" /></span>
      <span className="mt-6 text-[11px] font-semibold uppercase tracking-[0.14em] text-dema-forest">{opportunity.category}</span>
      <h2 className="mt-3 text-2xl font-medium leading-tight tracking-[-0.035em]">{opportunity.activity}</h2>
      <span className="mt-4 inline-flex items-center gap-2 text-sm text-dema-muted"><MapPin className="h-4 w-4" aria-hidden="true" />{opportunity.location}</span>
      <dl className="mt-7 grid grid-cols-2 gap-4 border-t border-dema-line pt-5">
        {opportunity.revenue ? <div><dt className="text-xs text-dema-muted">CA publié</dt><dd className="mt-1 text-sm font-semibold">{opportunity.revenue}</dd></div> : null}
        {opportunity.employees ? <div><dt className="text-xs text-dema-muted">Équipe</dt><dd className="mt-1 line-clamp-2 text-sm font-semibold">{opportunity.employees}</dd></div> : null}
      </dl>
      <span className="mt-auto pt-7 text-xs text-dema-muted">Informations déclaratives · disponibilité à confirmer</span>
    </button>
  );
}

export default function RepriseMarketplaceClient({ opportunities }: { opportunities: readonly RepriseOpportunity[] }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<CategoryFilter>("Toutes");
  const [areFiltersVisible, setAreFiltersVisible] = useState(false);
  const [selectedOpportunity, setSelectedOpportunity] = useState<RepriseOpportunity | null>(null);

  const filtered = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase("fr");
    return opportunities.filter((opportunity) => {
      const matchesCategory = category === "Toutes" || opportunity.category === category;
      const haystack = `${opportunity.activity} ${opportunity.location} ${opportunity.category}`.toLocaleLowerCase("fr");
      return matchesCategory && (!normalizedQuery || haystack.includes(normalizedQuery));
    });
  }, [category, opportunities, query]);

  return (
    <>
      <Navbar minimal publicNavigationActiveView="marketplace" />
      <main className="bg-dema-cream text-brand-blue">
        <section className="px-5 pb-14 pt-14 text-center sm:px-8 sm:pb-20 sm:pt-20 lg:pt-24">
          <div className="mx-auto max-w-6xl">
            <h1
              aria-label="La marketplace des PME de services à reprendre. Reprenez une entreprise qui fonctionne déjà."
              className={`${satoshiHeroTitleClassName} mx-auto max-w-5xl`}
            >
              <span aria-hidden="true">
                <span className="block">La marketplace des PME de services à reprendre.</span>
                <span className="demaa-hero-title mt-2 block text-dema-forest">
                  Reprenez une entreprise qui fonctionne déjà.
                </span>
              </span>
            </h1>
            <p className="mt-7 text-sm font-medium text-dema-forest">Entreprises en activité · Clients existants · Équipe ou savoir-faire déjà en place</p>
            <div className="demaa-search-shell mx-auto mt-10 max-w-3xl p-1.5">
              <div className="relative">
                <Search className="pointer-events-none absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-dema-forest/42" aria-hidden="true" />
                <label className="sr-only" htmlFor="reprise-search">Rechercher une activité ou une région</label>
                <input id="reprise-search" type="search" value={query} onChange={(event) => setQuery(event.target.value)} className="w-full rounded-full bg-dema-paper py-4 pl-12 pr-16 text-sm text-brand-blue outline-none transition placeholder:text-brand-blue/30 focus:ring-2 focus:ring-dema-forest/20 sm:text-base md:py-5 md:pl-16 md:pr-20" placeholder="Activité, région…" />
                <button
                  type="button"
                  onClick={() => setAreFiltersVisible((visible) => !visible)}
                  aria-expanded={areFiltersVisible}
                  aria-label={areFiltersVisible ? "Masquer les catégories" : "Afficher les catégories"}
                  className={`absolute right-2 top-1/2 inline-flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full transition md:right-2.5 md:h-10 md:w-10 ${
                    areFiltersVisible || category !== "Toutes"
                      ? "bg-dema-sage text-dema-forest"
                      : "bg-dema-canvas text-dema-muted"
                  }`}
                >
                  <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
            </div>
            {areFiltersVisible ? (
              <div className="mx-auto mt-4 max-w-3xl overflow-x-auto pb-1 soft-scroll" role="group" aria-label="Filtrer les opportunités par catégorie">
                <div className="flex min-w-max justify-center gap-2 px-1">
                  {categories.map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => {
                        setCategory(item);
                        setAreFiltersVisible(false);
                      }}
                      aria-pressed={category === item}
                      className={`demaa-chip shrink-0 whitespace-nowrap ${category === item ? "demaa-chip-active" : ""}`}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        </section>

        <section aria-label="Entreprises à reprendre" className="border-t border-dema-line px-5 py-14 sm:px-8 sm:py-20">
          <div className="mx-auto max-w-6xl">
            {filtered.length ? <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">{filtered.map((opportunity) => <OpportunityCard key={opportunity.id} opportunity={opportunity} onSelect={() => setSelectedOpportunity(opportunity)} />)}</div> : <div className="rounded-[1.75rem] border border-dema-line bg-dema-paper p-10 text-center"><p className="text-lg font-medium">Aucune opportunité ne correspond à cette recherche.</p><button className="mt-4 text-sm font-semibold text-dema-forest underline underline-offset-4" type="button" onClick={() => { setQuery(""); setCategory("Toutes"); }}>Réinitialiser les filtres</button></div>}
          </div>
        </section>

        <section className="border-y border-dema-line bg-dema-sage/55 px-5 py-16 sm:px-8 sm:py-20">
          <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[1fr_0.85fr] lg:items-center">
            <div><p className="text-xs font-semibold uppercase tracking-[0.14em] text-dema-forest">Vous envisagez de vendre ?</p><h2 className="mt-4 text-4xl font-medium leading-tight tracking-[-0.045em] sm:text-6xl">Obtenez une première estimation de votre entreprise.</h2><p className="mt-6 max-w-2xl text-base leading-7 text-dema-muted">Un entretien de 30 minutes pour regarder votre activité et vos chiffres. Vous recevez ensuite une synthèse écrite avec une fourchette indicative et les éléments à préparer.</p><BusinessEstimateControl className={`${primaryButtonClassName} mt-8`} label="Prendre rendez-vous" /></div>
            <ul className="divide-y divide-dema-line rounded-[1.75rem] border border-dema-line bg-dema-paper px-6 sm:px-8">
              {[{ Icon: Clock3, label: "30 minutes", detail: "Un échange simple et préparé" }, { Icon: Euro, label: "Fourchette indicative", detail: "Avec les chiffres et références utilisés" }, { Icon: UsersRound, label: "Synthèse écrite", detail: "Forces, points à préparer et prochaines actions" }].map(({ Icon, label, detail }) => <li key={label} className="flex gap-4 py-6"><span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-dema-sage text-dema-forest"><Icon className="h-5 w-5" strokeWidth={1.7} aria-hidden="true" /></span><span><strong className="block text-sm font-semibold">{label}</strong><span className="mt-1 block text-sm text-dema-muted">{detail}</span></span></li>)}
            </ul>
          </div>
        </section>
      </main>
      {selectedOpportunity ? <OpportunityDialog opportunity={selectedOpportunity} onClose={() => setSelectedOpportunity(null)} /> : null}
    </>
  );
}
