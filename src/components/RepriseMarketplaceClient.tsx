"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { ArrowLeftRight, Bell, Building2, Check, Clock3, Euro, Map as MapIcon, MapPin, Search, SlidersHorizontal, UsersRound, X } from "lucide-react";
import { type CSSProperties, type FormEvent, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import BusinessEstimateControl from "@/components/BusinessEstimateControl";
import DirectoryDetailDialogShell from "@/components/DirectoryDetailDialogShell";
import Navbar from "@/components/Navbar";
import RepriseOpportunityMap from "@/components/RepriseOpportunityMap";
import { getLeadAttributionPayload, trackLeadConversion } from "@/lib/lead-attribution-client";
import { clearLeadSubmissionKey, getLeadSubmissionKey } from "@/lib/lead-submission-client";
import { satoshiHeroTitleClassName } from "@/lib/marketing-hero-style";
import { sortRepriseOpportunitiesByInformation, type RepriseOpportunity } from "@/lib/reprise-opportunities";

const categories = ["Toutes", "Services terrain", "Services professionnels", "Logiciels"] as const;
const RepriseAlertDialog = dynamic(() => import("@/components/RepriseAlertDialog"), { ssr: false });
const MAX_COMPARISON_SIZE = 3;
type CategoryFilter = (typeof categories)[number];
type SubmissionState = "idle" | "submitting" | "success" | "error";

const inputClassName = "mt-2 min-h-12 w-full rounded-2xl border border-dema-line bg-dema-cream/35 px-4 py-3 text-sm text-brand-blue outline-none transition placeholder:text-dema-muted/55 focus:border-dema-forest/45 focus:ring-2 focus:ring-dema-forest/15";
const primaryButtonClassName = "inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-dema-forest px-6 py-3 text-sm font-semibold text-dema-paper transition hover:bg-brand-blue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dema-forest/35 disabled:cursor-wait disabled:opacity-65";

async function submitForm(endpoint: string, payload: Record<string, unknown>) {
  const response = await fetch(endpoint, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
  const body = (await response.json().catch(() => null)) as { error?: string; ok?: boolean } | null;
  if (response.status !== 202 || body?.ok !== true) throw new Error(body?.error || "Impossible d’envoyer la demande pour le moment.");
}

function BuyerRequestForm({ opportunity }: { opportunity: RepriseOpportunity }) {
  const [state, setState] = useState<SubmissionState>("idle");
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (state === "submitting") return;
    const form = event.currentTarget;
    const data = new FormData(form);
    const flowKey = `reprise-interest:${opportunity.id}`;
    setState("submitting");
    setError("");
    try {
      await submitForm("/api/reprise-interest", { attribution: getLeadAttributionPayload(), company: data.get("company"), email: data.get("email"), faxNumber: data.get("faxNumber"), idempotencyKey: getLeadSubmissionKey(flowKey), message: data.get("message"), name: data.get("name"), opportunityId: opportunity.id, phone: data.get("phone") });
      clearLeadSubmissionKey(flowKey);
      form.reset();
      setState("success");
      trackLeadConversion({ requestType: "reprise_interest", systemSlug: opportunity.id });
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : "Impossible d’envoyer la demande.");
      setState("error");
    }
  }

  if (state === "success") return <div className="mt-7 rounded-3xl bg-dema-sage/55 p-6 text-center"><span className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-dema-forest text-dema-paper"><Check className="h-5 w-5" aria-hidden="true" /></span><h3 className="mt-4 text-xl font-medium">Demande envoyée.</h3><p className="mt-2 text-sm leading-6 text-dema-muted">Demaa vous recontacte avant de transmettre votre demande à la personne concernée.</p></div>;

  return (
    <form onSubmit={handleSubmit} className="mt-7 space-y-4" noValidate>
      <label className="block text-sm font-medium">Votre projet en quelques mots<textarea className={`${inputClassName} min-h-28 resize-y`} name="message" maxLength={2000} placeholder="Votre expérience, votre recherche ou vos questions." required /></label>
      <label className="block text-sm font-medium">Prénom et nom<input className={inputClassName} name="name" autoComplete="name" maxLength={160} required /></label>
      <label className="block text-sm font-medium">Email<input className={inputClassName} name="email" type="email" autoComplete="email" maxLength={160} required /></label>
      <label className="block text-sm font-medium">Téléphone<input className={inputClassName} name="phone" type="tel" autoComplete="tel" maxLength={40} required /></label>
      <label className="block text-sm font-medium">Entreprise<input className={inputClassName} name="company" autoComplete="organization" maxLength={160} required /></label>
      <label className="hidden" aria-hidden="true">Fax<input name="faxNumber" tabIndex={-1} autoComplete="off" /></label>
      {error ? <p className="text-sm font-medium text-red-700" role="alert">{error}</p> : null}
      <button className={`${primaryButtonClassName} w-full`} disabled={state === "submitting"} type="submit">{state === "submitting" ? "Envoi…" : "Demander une mise en relation"}</button>
      <p className="text-xs leading-5 text-dema-muted">Vos informations servent uniquement à traiter cette demande. Consultez notre <Link href="/politique-de-confidentialite" className="underline underline-offset-2">politique de confidentialité</Link>.</p>
    </form>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return <div className="rounded-2xl border border-dema-line bg-dema-cream/40 p-4"><dt className="text-xs text-dema-muted">{label}</dt><dd className="mt-2 text-sm font-medium leading-6 text-brand-blue">{value}</dd></div>;
}

function OpportunityDialog({ opportunity, onClose }: { opportunity: RepriseOpportunity; onClose: () => void }) {
  return <DirectoryDetailDialogShell ariaLabel={`Détail de l’opportunité ${opportunity.activity}`} maxWidthClassName="max-w-3xl" onClose={onClose}><p className="text-xs font-medium uppercase tracking-[0.14em] text-dema-forest">{opportunity.category}</p><h2 className="mt-3 text-3xl font-normal tracking-[-0.04em] sm:text-4xl">{opportunity.activity}</h2><p className="mt-4 inline-flex items-center gap-2 text-sm text-dema-muted"><MapPin className="h-4 w-4" aria-hidden="true" />{opportunity.location}</p><dl className="mt-7 grid gap-3 sm:grid-cols-2"><Metric label="Chiffre d’affaires publié" value={opportunity.revenue ?? "Non disponible"} /><Metric label="EBE ou rentabilité publiée" value={opportunity.ebe ?? "Non disponible"} /><Metric label="Équipe publiée" value={opportunity.employees ?? "Non disponible"} /><Metric label="Prix demandé publié" value={opportunity.askingPrice ?? "Non disponible"} /></dl><div className="mt-7 border-t border-dema-line pt-6"><h3 className="text-sm font-medium">Ce qui est communiqué</h3><ul className="mt-3 space-y-2 text-sm leading-6 text-dema-muted">{opportunity.highlights.map((highlight) => <li key={highlight} className="flex gap-2"><Check className="mt-1 h-4 w-4 shrink-0 text-dema-forest" aria-hidden="true" /><span>{highlight}</span></li>)}</ul></div><BuyerRequestForm opportunity={opportunity} /></DirectoryDetailDialogShell>;
}

type CardProps = { opportunity: RepriseOpportunity; isCompared: boolean; onCompare: () => void; onPreview: (id?: string) => void; onSelect: () => void };

function OpportunityCard({ opportunity, isCompared, onCompare, onPreview, onSelect }: CardProps) {
  return (
    <article className="flex h-full min-h-[20rem] flex-col rounded-[1.75rem] border border-dema-line bg-dema-paper p-6 transition hover:border-dema-forest/30 sm:p-7" onMouseEnter={() => onPreview(opportunity.id)} onMouseLeave={() => onPreview(undefined)}>
      <button type="button" onClick={onSelect} onFocus={() => onPreview(opportunity.id)} className="flex flex-1 flex-col text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dema-forest/30">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-dema-sage text-dema-forest"><Building2 className="h-5 w-5" strokeWidth={1.7} aria-hidden="true" /></span>
        <span className="mt-6 text-[11px] font-medium uppercase tracking-[0.14em] text-dema-forest">{opportunity.category}</span>
        <h2 className="mt-3 text-2xl font-normal leading-tight tracking-[-0.035em]">{opportunity.activity}</h2>
        <span className="mt-4 inline-flex items-center gap-2 text-sm text-dema-muted"><MapPin className="h-4 w-4" aria-hidden="true" />{opportunity.location}</span>
        <dl className="mt-7 grid grid-cols-2 gap-4 border-t border-dema-line pt-5"><div><dt className="text-xs text-dema-muted">CA publié</dt><dd className="mt-1 text-sm font-normal">{opportunity.revenue ?? "Non disponible"}</dd></div><div><dt className="text-xs text-dema-muted">Équipe</dt><dd className="mt-1 line-clamp-2 text-sm font-normal">{opportunity.employees ?? "Non disponible"}</dd></div></dl>
      </button>
      <button
        type="button"
        onClick={onCompare}
        aria-pressed={isCompared}
        className={isCompared
          ? "mt-5 inline-flex min-h-9 self-start items-center gap-1.5 rounded-full bg-dema-sage px-3 py-2 text-xs font-medium text-dema-forest transition hover:bg-dema-sage/75"
          : "mt-5 self-start border-b border-dema-forest/45 pb-0.5 text-xs font-medium text-dema-forest transition hover:border-dema-forest"}
      >
        {isCompared ? <Check className="h-3.5 w-3.5" strokeWidth={2} aria-hidden="true" /> : null}
        {isCompared ? "Retirer du comparatif" : "Ajouter au comparatif"}
      </button>
    </article>
  );
}

function ComparisonDialog({ opportunities, onClose, onOpenOpportunity }: { opportunities: readonly RepriseOpportunity[]; onClose: () => void; onOpenOpportunity: (opportunity: RepriseOpportunity) => void }) {
  const rows = [
    ["Catégorie", (item: RepriseOpportunity) => item.category],
    ["Localisation", (item: RepriseOpportunity) => item.location],
    ["Chiffre d’affaires", (item: RepriseOpportunity) => item.revenue],
    ["EBE ou rentabilité", (item: RepriseOpportunity) => item.ebe],
    ["Équipe", (item: RepriseOpportunity) => item.employees],
    ["Prix demandé", (item: RepriseOpportunity) => item.askingPrice],
    ["Éléments communiqués", (item: RepriseOpportunity) => item.highlights.join(" · ")],
  ] as const;
  const mobileTableWidth = 8.5 + opportunities.length * 11.5;
  const desktopTableWidth = 11 + opportunities.length * 17;

  return (
    <DirectoryDetailDialogShell ariaLabel="Comparer les entreprises" maxWidthClassName="max-w-6xl" onClose={onClose}>
      <p className="text-xs font-medium uppercase tracking-[0.14em] text-dema-forest">Comparatif</p>
      <h2 className="mt-3 text-3xl font-normal tracking-[-0.04em] sm:text-4xl">Comparer les entreprises.</h2>
      <p className="mt-5 inline-flex items-center gap-2 rounded-full bg-dema-sage/60 px-3 py-2 text-xs font-medium text-dema-forest sm:hidden">
        <ArrowLeftRight className="h-4 w-4 shrink-0" aria-hidden="true" />
        Faites glisser pour voir les autres entreprises
      </p>
      <div className="soft-scroll mt-4 overflow-x-auto overscroll-x-contain rounded-[1.1rem] border border-dema-line bg-dema-paper sm:mt-7">
        <table
          className="table-fixed border-separate border-spacing-0 [width:var(--comparison-width-mobile)] sm:[width:var(--comparison-width-desktop)]"
          style={{
            "--comparison-width-mobile": `${mobileTableWidth}rem`,
            "--comparison-width-desktop": `${desktopTableWidth}rem`,
          } as CSSProperties}
        >
          <caption className="sr-only">Comparaison des entreprises sélectionnées</caption>
          <colgroup>
            <col className="w-[8.5rem] sm:w-[11rem]" />
            {opportunities.map((opportunity) => <col key={opportunity.id} className="w-[11.5rem] sm:w-[17rem]" />)}
          </colgroup>
          <thead>
            <tr>
              <th scope="col" className="sticky left-0 top-0 z-30 w-[8.5rem] border-b border-r border-dema-line bg-dema-paper px-3 py-4 text-left text-[10px] font-semibold uppercase tracking-[0.12em] text-dema-muted sm:w-[11rem] sm:px-5 sm:text-xs">Critères</th>
              {opportunities.map((opportunity) => (
                <th key={opportunity.id} scope="col" className="sticky top-0 z-20 w-[11.5rem] border-b border-r border-dema-line bg-dema-paper p-0 text-left last:border-r-0 sm:w-[17rem]">
                  <button type="button" onClick={() => onOpenOpportunity(opportunity)} aria-label={`Ouvrir la fiche ${opportunity.activity}`} className="group block h-full w-full px-3 py-4 text-left outline-none transition hover:bg-dema-sage/30 focus-visible:bg-dema-sage/40 sm:px-5">
                    <span className="block text-[9px] font-medium uppercase leading-4 tracking-[0.1em] text-dema-forest sm:text-[10px] sm:tracking-[0.12em]">{opportunity.category}</span>
                    <span className="mt-2 block text-sm font-medium leading-5 text-brand-blue underline decoration-transparent underline-offset-4 transition group-hover:decoration-dema-forest/45 sm:text-base">{opportunity.activity}</span>
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map(([label, resolve]) => (
              <tr key={label}>
                <th scope="row" className="sticky left-0 z-10 w-[8.5rem] border-b border-r border-dema-line bg-dema-paper px-3 py-3.5 text-left align-top text-[11px] font-medium leading-4 text-brand-blue sm:w-[11rem] sm:px-5 sm:py-4 sm:text-sm sm:leading-5">{label}</th>
                {opportunities.map((opportunity) => (
                  <td key={opportunity.id} className="w-[11.5rem] border-b border-r border-dema-line bg-dema-paper px-3 py-3.5 align-top text-xs leading-5 text-dema-muted last:border-r-0 sm:w-[17rem] sm:px-5 sm:py-4 sm:text-sm sm:leading-6">
                    <span className={!resolve(opportunity) ? "text-dema-muted/65" : "text-brand-blue"}>{resolve(opportunity) || "Non disponible"}</span>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DirectoryDetailDialogShell>
  );
}

export default function RepriseMarketplaceClient({ initialOpportunityId, opportunities }: { initialOpportunityId?: string; opportunities: readonly RepriseOpportunity[] }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<CategoryFilter>("Toutes");
  const [areFiltersVisible, setAreFiltersVisible] = useState(false);
  const [activeLocation, setActiveLocation] = useState<string>();
  const [previewOpportunityId, setPreviewOpportunityId] = useState<string>();
  const [showDesktopMap, setShowDesktopMap] = useState(true);
  const [showMobileMap, setShowMobileMap] = useState(false);
  const [selectedOpportunity, setSelectedOpportunity] = useState<RepriseOpportunity | null>(() => opportunities.find((opportunity) => opportunity.id === initialOpportunityId) ?? null);
  const [comparisonIds, setComparisonIds] = useState<string[]>([]);
  const [comparisonOpen, setComparisonOpen] = useState(false);
  const [alertOpen, setAlertOpen] = useState(false);

  const searchMatches = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase("fr");
    const matches = opportunities.filter((opportunity) => {
      const matchesCategory = category === "Toutes" || opportunity.category === category;
      const haystack = `${opportunity.activity} ${opportunity.location} ${opportunity.category}`.toLocaleLowerCase("fr");
      return matchesCategory && (!normalizedQuery || haystack.includes(normalizedQuery));
    });
    return sortRepriseOpportunitiesByInformation(matches);
  }, [category, opportunities, query]);
  const filtered = useMemo(() => activeLocation ? searchMatches.filter((opportunity) => opportunity.mapPosition?.label === activeLocation) : searchMatches, [activeLocation, searchMatches]);
  const comparison = useMemo(() => comparisonIds.flatMap((id) => { const opportunity = opportunities.find((item) => item.id === id); return opportunity ? [opportunity] : []; }), [comparisonIds, opportunities]);
  const initialAlertCriteria = useMemo(() => ({
    budgetMax: null,
    categories: category === "Toutes" ? [] : [category],
    includeMissing: true,
    query,
    regions: activeLocation
      ? [...new Set(opportunities.filter((opportunity) => opportunity.mapPosition?.label === activeLocation).map((opportunity) => opportunity.region))]
      : [],
    revenueMin: null,
  }), [activeLocation, category, opportunities, query]);

  function resetFilters() { setQuery(""); setCategory("Toutes"); setActiveLocation(undefined); }
  function toggleComparison(id: string) { setComparisonIds((current) => current.includes(id) ? current.filter((item) => item !== id) : current.length < MAX_COMPARISON_SIZE ? [...current, id] : current); }
  const map = <RepriseOpportunityMap opportunities={searchMatches} activeLocation={activeLocation} highlightedOpportunityId={previewOpportunityId} onLocationSelect={setActiveLocation} onOpportunityPreview={setPreviewOpportunityId} onOpenOpportunity={setSelectedOpportunity} onAfterLocationSelect={() => setShowMobileMap(false)} />;

  return (
    <>
      <Navbar minimal publicCtaLabel="Vendre mon entreprise" publicNavigationActiveView="marketplace" />
      <main className="bg-dema-cream text-brand-blue">
        <section className="px-5 pb-6 pt-14 text-center sm:px-8 sm:pb-10 sm:pt-20 lg:pt-24"><div className="mx-auto max-w-6xl"><header className="text-left sm:text-center"><h1 className={`${satoshiHeroTitleClassName} mx-auto max-w-5xl`}>Reprenez une entreprise qui fonctionne déjà.</h1><p className="mx-auto mt-6 max-w-4xl font-serif text-2xl font-light italic leading-tight tracking-[-0.025em] text-dema-forest sm:text-3xl">Entreprises en activité · Clients existants · Équipe ou savoir-faire déjà en place</p></header><BusinessEstimateControl className="mx-auto mt-8 inline-flex min-h-11 items-center justify-center rounded-full border border-dema-forest/20 bg-dema-paper px-5 text-sm font-medium text-dema-forest transition hover:border-dema-forest/35 hover:bg-dema-sage/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dema-forest/25" label="Vendre mon entreprise" /><div className="demaa-search-shell mx-auto mt-5 max-w-3xl p-1.5"><div className="relative"><Search className="pointer-events-none absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-dema-forest/42" aria-hidden="true" /><label className="sr-only" htmlFor="reprise-search">Rechercher une activité ou une région</label><input id="reprise-search" type="search" value={query} onChange={(event) => { setQuery(event.target.value); setActiveLocation(undefined); }} className="w-full rounded-full bg-dema-paper py-4 pl-12 pr-16 text-sm text-brand-blue outline-none transition placeholder:text-brand-blue/30 focus:ring-2 focus:ring-dema-forest/20 sm:text-base md:py-5 md:pl-16 md:pr-20" placeholder="Activité, région…" /><button type="button" onClick={() => setAreFiltersVisible((visible) => !visible)} aria-expanded={areFiltersVisible} aria-label={areFiltersVisible ? "Masquer les catégories" : "Afficher les catégories"} className={`absolute right-2 top-1/2 inline-flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full transition md:right-2.5 md:h-10 md:w-10 ${areFiltersVisible || category !== "Toutes" ? "bg-dema-sage text-dema-forest" : "bg-dema-canvas text-dema-muted"}`}><SlidersHorizontal className="h-4 w-4" aria-hidden="true" /></button></div></div>{areFiltersVisible ? <div className="mx-auto mt-4 max-w-3xl overflow-x-auto pb-1 soft-scroll" role="group" aria-label="Filtrer les opportunités par catégorie"><div className="flex min-w-max justify-center gap-2 px-1">{categories.map((item) => <button key={item} type="button" onClick={() => { setCategory(item); setActiveLocation(undefined); setAreFiltersVisible(false); }} aria-pressed={category === item} className={`demaa-chip shrink-0 whitespace-nowrap ${category === item ? "demaa-chip-active" : ""}`}>{item}</button>)}</div></div> : null}<button type="button" onClick={() => setAlertOpen(true)} className="mt-5 inline-flex items-center gap-2 border-b border-dema-forest/35 pb-0.5 text-sm font-medium text-dema-forest transition hover:border-dema-forest"><Bell className="h-4 w-4" strokeWidth={1.7} aria-hidden="true" />Recevoir les nouvelles opportunités</button></div></section>
        <section aria-label="Entreprises à reprendre" className="border-t border-dema-line px-5 pb-14 pt-6 sm:px-8 sm:pb-20 sm:pt-10"><div className="mx-auto max-w-6xl"><div className="mb-5 flex items-center justify-between gap-4"><p className="text-sm text-dema-muted">{filtered.length} opportunité{filtered.length > 1 ? "s" : ""}{activeLocation ? ` · ${activeLocation}` : ""}</p><div className="flex gap-4"><button type="button" className="inline-flex items-center gap-1.5 text-sm font-medium text-dema-forest lg:hidden" onClick={() => setShowMobileMap(true)}><MapIcon className="h-4 w-4" aria-hidden="true" />Carte</button><button type="button" className="hidden items-center gap-1.5 text-sm font-medium text-dema-forest lg:inline-flex" onClick={() => setShowDesktopMap((visible) => !visible)}><MapIcon className="h-4 w-4" strokeWidth={1.7} aria-hidden="true" />{showDesktopMap ? "Masquer la carte" : "Afficher la carte"}</button></div></div>{filtered.length ? <div className={showDesktopMap ? "grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(20rem,0.8fr)]" : ""}><div className={`grid gap-5 ${showDesktopMap ? "md:grid-cols-2" : "md:grid-cols-2 xl:grid-cols-3"}`}>{filtered.map((opportunity) => <OpportunityCard key={opportunity.id} opportunity={opportunity} isCompared={comparisonIds.includes(opportunity.id)} onCompare={() => toggleComparison(opportunity.id)} onPreview={setPreviewOpportunityId} onSelect={() => setSelectedOpportunity(opportunity)} />)}</div>{showDesktopMap ? <div className="hidden lg:block">{map}</div> : null}</div> : <div className="rounded-[1.75rem] border border-dema-line bg-dema-paper p-10 text-center"><p className="text-lg font-medium">Aucune opportunité ne correspond à cette recherche.</p><button className="mt-4 text-sm font-medium text-dema-forest underline underline-offset-4" type="button" onClick={resetFilters}>Réinitialiser les filtres</button></div>}</div></section>
        <section className="border-y border-dema-line bg-dema-sage/55 px-5 py-16 sm:px-8 sm:py-20"><div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[1fr_0.85fr] lg:items-center"><div><p className="text-xs font-medium uppercase tracking-[0.14em] text-dema-forest">Vous envisagez de vendre ?</p><h2 className="mt-4 text-4xl font-normal leading-[1.02] tracking-[-0.045em] sm:text-6xl">Obtenez une première estimation de votre entreprise.</h2><p className="mt-6 max-w-2xl text-base leading-7 text-dema-muted">Un entretien de 30 minutes pour regarder votre activité et vos chiffres. Vous recevez ensuite une synthèse écrite avec une fourchette indicative et les éléments à préparer.</p><BusinessEstimateControl className="mt-8 text-sm font-medium text-dema-forest underline decoration-dema-forest/30 underline-offset-4 hover:decoration-dema-forest" label="Prendre rendez-vous" /></div><ul className="divide-y divide-dema-line rounded-[1.75rem] border border-dema-line bg-dema-paper px-6 sm:px-8">{[{ Icon: Clock3, label: "30 minutes", detail: "Un échange simple et préparé" }, { Icon: Euro, label: "Fourchette indicative", detail: "Avec les chiffres et références utilisés" }, { Icon: UsersRound, label: "Synthèse écrite", detail: "Forces, points à préparer et prochaines actions" }].map(({ Icon, label, detail }) => <li key={label} className="flex gap-4 py-6"><span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-dema-sage text-dema-forest"><Icon className="h-5 w-5" strokeWidth={1.7} aria-hidden="true" /></span><span><strong className="block text-sm font-medium">{label}</strong><span className="mt-1 block text-sm text-dema-muted">{detail}</span></span></li>)}</ul></div></section>
      </main>
      {selectedOpportunity ? createPortal(<OpportunityDialog opportunity={selectedOpportunity} onClose={() => setSelectedOpportunity(null)} />, document.body) : null}
      {showMobileMap ? createPortal(<DirectoryDetailDialogShell ariaLabel="Carte des opportunités" maxWidthClassName="max-w-xl" onClose={() => setShowMobileMap(false)}>{map}</DirectoryDetailDialogShell>, document.body) : null}
      {comparisonOpen ? createPortal(<ComparisonDialog opportunities={comparison} onClose={() => setComparisonOpen(false)} onOpenOpportunity={(opportunity) => { setComparisonOpen(false); setSelectedOpportunity(opportunity); }} />, document.body) : null}
      {alertOpen ? createPortal(<RepriseAlertDialog initialCriteria={initialAlertCriteria} onClose={() => setAlertOpen(false)} onOpenOpportunity={(opportunity) => { setAlertOpen(false); setSelectedOpportunity(opportunity); }} opportunities={opportunities} />, document.body) : null}
      {comparison.length ? <div className="fixed inset-x-0 bottom-0 z-40 border-t border-dema-line bg-dema-paper/95 px-4 py-3 backdrop-blur"><div className="mx-auto flex max-w-6xl items-center justify-between gap-4"><div className="min-w-0"><p className="text-sm font-medium">{comparison.length} sur {MAX_COMPARISON_SIZE} sélectionnée{comparison.length > 1 ? "s" : ""}</p><p className="truncate text-xs text-dema-muted">{comparison.map((item) => item.activity).join(" · ")}</p></div><div className="flex shrink-0 items-center gap-3"><button type="button" onClick={() => setComparisonIds([])} className="hidden text-xs text-dema-muted underline underline-offset-4 sm:inline">Vider</button><button type="button" disabled={comparison.length < 2} onClick={() => setComparisonOpen(true)} className={`${primaryButtonClassName} min-h-10 px-4 py-2`}>Comparer ({comparison.length})</button><button type="button" aria-label="Vider le comparatif" onClick={() => setComparisonIds([])} className="sm:hidden"><X className="h-5 w-5" aria-hidden="true" /></button></div></div></div> : null}
    </>
  );
}
