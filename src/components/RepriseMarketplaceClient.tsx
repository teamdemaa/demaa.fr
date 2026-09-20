"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { ArrowLeftRight, Bell, Building2, Check, Map as MapIcon, MapPin, Search, SlidersHorizontal, X } from "lucide-react";
import { type CSSProperties, type MouseEvent, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import DirectoryDetailDialogShell from "@/components/DirectoryDetailDialogShell";
import Navbar from "@/components/Navbar";
import RepriseOpportunityDetail from "@/components/RepriseOpportunityDetail";
import RepriseOpportunityMap from "@/components/RepriseOpportunityMap";
import RepriseProjectControl from "@/components/RepriseProjectControl";
import { satoshiHeroTitleClassName } from "@/lib/marketing-hero-style";
import { getRepriseOpportunityPath } from "@/lib/reprise-opportunity-seo";
import { sortRepriseOpportunitiesByInformation, type RepriseOpportunity } from "@/lib/reprise-opportunities";

const categories = ["Toutes", "Services terrain", "Services professionnels", "Logiciels"] as const;
const RepriseAlertDialog = dynamic(() => import("@/components/RepriseAlertDialog"), { ssr: false });
const MAX_COMPARISON_SIZE = 3;
const subscribeToBrowserEnvironment = () => () => undefined;
const getBrowserSnapshot = () => true;
const getServerSnapshot = () => false;
type CategoryFilter = (typeof categories)[number];

const primaryButtonClassName = "inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-dema-forest px-6 py-3 text-sm font-semibold text-dema-paper transition hover:bg-brand-blue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dema-forest/35 disabled:cursor-wait disabled:opacity-65";

function OpportunityDialog({ opportunity, onClose }: { opportunity: RepriseOpportunity; onClose: () => void }) {
  return <DirectoryDetailDialogShell ariaLabel={`Détail de l’opportunité ${opportunity.activity}`} maxWidthClassName="max-w-3xl" onClose={onClose}><RepriseOpportunityDetail opportunity={opportunity} /></DirectoryDetailDialogShell>;
}

type CardProps = { opportunity: RepriseOpportunity; isCompared: boolean; onCompare: () => void; onPreview: (id?: string) => void; onSelect: () => void };

function OpportunityCard({ opportunity, isCompared, onCompare, onPreview, onSelect }: CardProps) {
  const cardMetrics = [
    { label: "Chiffre d’affaires", value: opportunity.revenue ?? "ND" },
    { label: "Équipe", value: opportunity.employees ?? "ND" },
  ];

  function handleOpportunityClick(event: MouseEvent<HTMLAnchorElement>) {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    onSelect();
  }

  return (
    <article className="flex h-full min-h-[20rem] flex-col rounded-[1.75rem] border border-dema-line bg-dema-paper p-6 transition hover:border-dema-forest/30 sm:p-7" onMouseEnter={() => onPreview(opportunity.id)} onMouseLeave={() => onPreview(undefined)}>
      <Link href={getRepriseOpportunityPath(opportunity)} prefetch={false} onClick={handleOpportunityClick} onFocus={() => onPreview(opportunity.id)} aria-haspopup="dialog" className="flex flex-1 flex-col text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dema-forest/30">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-dema-sage text-dema-forest"><Building2 className="h-5 w-5" strokeWidth={1.7} aria-hidden="true" /></span>
        <span className="mt-6 text-[11px] font-medium uppercase tracking-[0.14em] text-dema-forest">{opportunity.category}</span>
        <h2 className="mt-3 text-2xl font-normal leading-tight tracking-[-0.035em]">{opportunity.activity}</h2>
        <span className="mt-4 inline-flex items-center gap-2 text-sm text-dema-muted"><MapPin className="h-4 w-4" aria-hidden="true" />{opportunity.location}</span>
        <dl className="mt-7 grid grid-cols-2 gap-4 border-t border-dema-line pt-5">
          {cardMetrics.map((metric) => (
            <div key={metric.label}>
              <dt className="text-xs text-dema-muted">{metric.label}</dt>
              <dd className="mt-1 line-clamp-2 text-sm font-normal">{metric.value}</dd>
            </div>
          ))}
        </dl>
      </Link>
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
    ["À savoir", (item: RepriseOpportunity) => item.highlights.join(" · ")],
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
                    <span className={!resolve(opportunity) ? "text-dema-muted/65" : "text-brand-blue"}>{resolve(opportunity) || "ND"}</span>
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
  const [previewOpportunityId, setPreviewOpportunityId] = useState<string>();
  const [showDesktopMap, setShowDesktopMap] = useState(true);
  const [showMobileMap, setShowMobileMap] = useState(false);
  const [selectedOpportunity, setSelectedOpportunity] = useState<RepriseOpportunity | null>(() => opportunities.find((opportunity) => opportunity.id === initialOpportunityId) ?? null);
  const [comparisonIds, setComparisonIds] = useState<string[]>([]);
  const [comparisonOpen, setComparisonOpen] = useState(false);
  const [alertOpen, setAlertOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const mobileSearchInputRef = useRef<HTMLInputElement>(null);
  const isBrowser = useSyncExternalStore(subscribeToBrowserEnvironment, getBrowserSnapshot, getServerSnapshot);
  const portalRoot = isBrowser ? document.body : null;

  useEffect(() => {
    if (isMobileSearchOpen) mobileSearchInputRef.current?.focus();
  }, [isMobileSearchOpen]);

  const searchMatches = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase("fr");
    const matches = opportunities.filter((opportunity) => {
      const matchesCategory = category === "Toutes" || opportunity.category === category;
      const haystack = `${opportunity.activity} ${opportunity.location} ${opportunity.category}`.toLocaleLowerCase("fr");
      return matchesCategory && (!normalizedQuery || haystack.includes(normalizedQuery));
    });
    return sortRepriseOpportunitiesByInformation(matches);
  }, [category, opportunities, query]);
  const filtered = searchMatches;
  const comparison = useMemo(() => comparisonIds.flatMap((id) => { const opportunity = opportunities.find((item) => item.id === id); return opportunity ? [opportunity] : []; }), [comparisonIds, opportunities]);
  const initialAlertCriteria = useMemo(() => ({
    budgetMax: null,
    categories: category === "Toutes" ? [] : [category],
    includeMissing: true,
    query,
    regions: [],
    revenueMin: null,
  }), [category, query]);

  function resetFilters() { setQuery(""); setCategory("Toutes"); }
  function toggleComparison(id: string) { setComparisonIds((current) => current.includes(id) ? current.filter((item) => item !== id) : current.length < MAX_COMPARISON_SIZE ? [...current, id] : current); }
  const desktopMap = <RepriseOpportunityMap opportunities={searchMatches} highlightedOpportunityId={previewOpportunityId} onOpportunityPreview={setPreviewOpportunityId} onOpenOpportunity={setSelectedOpportunity} />;
  const mobileMap = <RepriseOpportunityMap opportunities={searchMatches} highlightedOpportunityId={previewOpportunityId} onOpportunityPreview={setPreviewOpportunityId} onOpenOpportunity={(opportunity) => { setShowMobileMap(false); setSelectedOpportunity(opportunity); }} />;

  return (
    <>
      <Navbar minimal publicNavigationActiveView="marketplace" publicNavigationVariant="sini" />
      <main className="bg-sini-background text-brand-blue">
        <section className="px-5 pb-6 pt-14 text-center sm:px-8 sm:pb-10 sm:pt-20 lg:pt-24"><div className="mx-auto max-w-6xl"><header className="text-left sm:text-center"><h1 className={`${satoshiHeroTitleClassName} mx-auto max-w-5xl`}>Reprenez une PME B2B rentable.</h1><p className="mx-auto mt-6 max-w-4xl text-base leading-7 text-dema-muted sm:text-lg sm:leading-8">Des PME sélectionnées, avec des clients, un savoir-faire et une activité déjà lancée pour accélérer votre croissance externe ou entreprendre par la reprise.</p><div className="mt-8"><RepriseProjectControl /></div></header><div className="mx-auto mt-5 grid max-w-3xl items-center gap-2 transition-[grid-template-columns] duration-300 ease-out sm:hidden" style={{ gridTemplateColumns: isMobileSearchOpen ? "minmax(0, 0fr) minmax(0, 1fr) 3.125rem" : "minmax(0, 1fr) 3.125rem 3.125rem" }}><button type="button" onClick={() => setAlertOpen(true)} aria-hidden={isMobileSearchOpen} tabIndex={isMobileSearchOpen ? -1 : 0} className={`inline-flex min-w-0 items-center gap-2 overflow-hidden whitespace-nowrap text-left text-sm font-medium text-dema-forest transition duration-200 ${isMobileSearchOpen ? "pointer-events-none -translate-x-2 opacity-0" : "opacity-100"}`}><Bell className="h-4 w-4 shrink-0" strokeWidth={1.7} aria-hidden="true" /><span className="truncate border-b border-dema-forest/35 pb-0.5">Recevoir les nouvelles opportunités</span></button><div className="demaa-search-shell flex min-w-0 items-center overflow-hidden"><button type="button" onClick={() => setIsMobileSearchOpen(true)} aria-expanded={isMobileSearchOpen} aria-label="Ouvrir la recherche" className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-dema-forest"><Search className="h-4 w-4" aria-hidden="true" /></button><label className="sr-only" htmlFor="reprise-search-mobile">Rechercher une activité ou une région</label><input ref={mobileSearchInputRef} id="reprise-search-mobile" type="search" value={query} onChange={(event) => setQuery(event.target.value)} className={`min-w-0 bg-transparent text-base leading-6 text-brand-blue outline-none transition-opacity placeholder:text-brand-blue/30 ${isMobileSearchOpen ? "flex-1 opacity-100" : "w-0 pointer-events-none opacity-0"}`} placeholder="Activité, région…" tabIndex={isMobileSearchOpen ? 0 : -1} /><button type="button" onClick={() => { setQuery(""); setIsMobileSearchOpen(false); }} aria-label="Fermer la recherche" className={`h-10 w-9 shrink-0 items-center justify-center rounded-full text-dema-muted ${isMobileSearchOpen ? "inline-flex" : "hidden"}`}><X className="h-4 w-4" aria-hidden="true" /></button></div><button type="button" onClick={() => setAreFiltersVisible((visible) => !visible)} aria-expanded={areFiltersVisible} aria-label={areFiltersVisible ? "Masquer les catégories" : "Afficher les catégories"} className={`inline-flex h-[3.125rem] w-[3.125rem] items-center justify-center rounded-full border border-dema-line/75 transition ${areFiltersVisible || category !== "Toutes" ? "bg-dema-sage text-dema-forest" : "bg-dema-paper text-dema-muted"}`}><SlidersHorizontal className="h-4 w-4" aria-hidden="true" /></button></div><div className="demaa-search-shell mx-auto mt-5 hidden max-w-3xl sm:block"><div className="relative"><Search className="pointer-events-none absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-dema-forest/42" aria-hidden="true" /><label className="sr-only" htmlFor="reprise-search">Rechercher une activité ou une région</label><input id="reprise-search" type="search" value={query} onChange={(event) => setQuery(event.target.value)} className="demaa-search-control" placeholder="Activité, région…" /><button type="button" onClick={() => setAreFiltersVisible((visible) => !visible)} aria-expanded={areFiltersVisible} aria-label={areFiltersVisible ? "Masquer les catégories" : "Afficher les catégories"} className={`absolute right-2 top-1/2 inline-flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full transition ${areFiltersVisible || category !== "Toutes" ? "bg-dema-sage text-dema-forest" : "bg-dema-canvas text-dema-muted"}`}><SlidersHorizontal className="h-4 w-4" aria-hidden="true" /></button></div></div>{areFiltersVisible ? <div className="mx-auto mt-4 max-w-3xl overflow-x-auto pb-1 soft-scroll" role="group" aria-label="Filtrer les opportunités par catégorie"><div className="flex min-w-max justify-center gap-2 px-1">{categories.map((item) => <button key={item} type="button" onClick={() => { setCategory(item); setAreFiltersVisible(false); }} aria-pressed={category === item} className={`demaa-chip shrink-0 whitespace-nowrap ${category === item ? "demaa-chip-active" : ""}`}>{item}</button>)}</div></div> : null}<button type="button" onClick={() => setAlertOpen(true)} className="mt-5 hidden items-center gap-2 border-b border-dema-forest/35 pb-0.5 text-sm font-medium text-dema-forest transition hover:border-dema-forest sm:inline-flex"><Bell className="h-4 w-4" strokeWidth={1.7} aria-hidden="true" />Recevoir les nouvelles opportunités</button></div></section>
        <section aria-label="Entreprises à reprendre" className="border-t border-dema-line px-5 pb-14 pt-6 sm:px-8 sm:pb-20 sm:pt-10"><div className="mx-auto max-w-6xl"><div className="mb-5 flex items-center justify-between gap-4"><p className="text-sm text-dema-muted">{filtered.length} opportunité{filtered.length > 1 ? "s" : ""}</p><div className="flex gap-4"><button type="button" className="inline-flex items-center gap-1.5 text-sm font-medium text-dema-forest lg:hidden" onClick={() => setShowMobileMap(true)}><MapIcon className="h-4 w-4" aria-hidden="true" />Carte</button><button type="button" className="hidden items-center gap-1.5 text-sm font-medium text-dema-forest lg:inline-flex" onClick={() => setShowDesktopMap((visible) => !visible)}><MapIcon className="h-4 w-4" strokeWidth={1.7} aria-hidden="true" />{showDesktopMap ? "Masquer la carte" : "Afficher la carte"}</button></div></div>{filtered.length ? <div className={showDesktopMap ? "grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(20rem,0.8fr)]" : ""}><div className={`grid gap-5 ${showDesktopMap ? "md:grid-cols-2" : "md:grid-cols-2 xl:grid-cols-3"}`}>{filtered.map((opportunity) => <OpportunityCard key={opportunity.id} opportunity={opportunity} isCompared={comparisonIds.includes(opportunity.id)} onCompare={() => toggleComparison(opportunity.id)} onPreview={setPreviewOpportunityId} onSelect={() => setSelectedOpportunity(opportunity)} />)}</div>{showDesktopMap ? <div className="hidden lg:block">{desktopMap}</div> : null}</div> : <div className="rounded-[1.75rem] border border-dema-line bg-dema-paper p-10 text-center"><p className="text-lg font-medium">Aucune opportunité ne correspond à cette recherche.</p><button className="mt-4 text-sm font-medium text-dema-forest underline underline-offset-4" type="button" onClick={resetFilters}>Réinitialiser les filtres</button></div>}</div></section>
        <section className="border-y border-dema-line bg-dema-paper px-5 py-16 sm:px-8 sm:py-20"><div className="mx-auto max-w-5xl"><h2 className="demaa-marketing-section-title text-center">Comment ça marche ?</h2><ol className="mt-10 grid gap-px overflow-hidden rounded-[1.75rem] border border-dema-line bg-dema-line md:grid-cols-3">{[["01", "Vous nous confiez votre recherche", "Activité, région, budget et critères importants."], ["02", "Nous recherchons", "Notre équipe examine les opportunités disponibles et recherche des entreprises adaptées."], ["03", "Nous organisons la mise en relation", "Lorsqu’une entreprise semble compatible, nous vous recontactons avant tout échange avec le cédant."]].map(([number, title, text]) => <li key={number} className="bg-dema-cream p-6 sm:p-7"><span className="font-serif text-3xl italic text-dema-forest/55">{number}</span><h3 className="mt-5 text-lg font-medium">{title}</h3><p className="mt-3 text-sm leading-6 text-dema-muted">{text}</p></li>)}</ol><div className="mt-8 text-center"><RepriseProjectControl /></div></div></section>
      </main>
      {portalRoot && selectedOpportunity ? createPortal(<OpportunityDialog opportunity={selectedOpportunity} onClose={() => setSelectedOpportunity(null)} />, portalRoot) : null}
      {portalRoot && showMobileMap ? createPortal(<DirectoryDetailDialogShell ariaLabel="Carte des opportunités" maxWidthClassName="max-w-xl" onClose={() => setShowMobileMap(false)}>{mobileMap}</DirectoryDetailDialogShell>, portalRoot) : null}
      {portalRoot && comparisonOpen ? createPortal(<ComparisonDialog opportunities={comparison} onClose={() => setComparisonOpen(false)} onOpenOpportunity={(opportunity) => { setComparisonOpen(false); setSelectedOpportunity(opportunity); }} />, portalRoot) : null}
      {portalRoot && alertOpen ? createPortal(<RepriseAlertDialog initialCriteria={initialAlertCriteria} onClose={() => setAlertOpen(false)} onOpenOpportunity={(opportunity) => { setAlertOpen(false); setSelectedOpportunity(opportunity); }} opportunities={opportunities} />, portalRoot) : null}
      {comparison.length ? <div className="fixed inset-x-0 bottom-0 z-40 border-t border-dema-line bg-dema-paper/95 px-4 py-3 backdrop-blur"><div className="mx-auto flex max-w-6xl items-center justify-between gap-4"><div className="min-w-0"><p className="text-sm font-medium">{comparison.length} sur {MAX_COMPARISON_SIZE} sélectionnée{comparison.length > 1 ? "s" : ""}</p><p className="truncate text-xs text-dema-muted">{comparison.map((item) => item.activity).join(" · ")}</p></div><div className="flex shrink-0 items-center gap-3"><button type="button" onClick={() => setComparisonIds([])} className="hidden text-xs text-dema-muted underline underline-offset-4 sm:inline">Vider</button><button type="button" disabled={comparison.length < 2} onClick={() => setComparisonOpen(true)} className={`${primaryButtonClassName} min-h-10 px-4 py-2`}>Comparer ({comparison.length})</button><button type="button" aria-label="Vider le comparatif" onClick={() => setComparisonIds([])} className="sm:hidden"><X className="h-5 w-5" aria-hidden="true" /></button></div></div></div> : null}
    </>
  );
}
