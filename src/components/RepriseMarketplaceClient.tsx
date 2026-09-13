"use client";

import Link from "next/link";
import {
  ArrowRight,
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
        {opportunity.revenue ? <Metric label="Chiffre d’affaires publié" value={opportunity.revenue} /> : null}
        {opportunity.ebe ? <Metric label="EBE ou rentabilité publiée" value={opportunity.ebe} /> : null}
        {opportunity.employees ? <Metric label="Équipe publiée" value={opportunity.employees} /> : null}
        {opportunity.askingPrice ? <Metric label="Prix demandé publié" value={opportunity.askingPrice} /> : null}
      </dl>
      <div className="mt-7 border-t border-dema-line pt-6">
        <h3 className="text-sm font-semibold">Ce qui est communiqué</h3>
        <ul className="mt-3 space-y-2 text-sm leading-6 text-dema-muted">
          {opportunity.highlights.map((highlight) => <li key={highlight} className="flex gap-2"><Check className="mt-1 h-4 w-4 shrink-0 text-dema-forest" aria-hidden="true" /><span>{highlight}</span></li>)}
        </ul>
      </div>
      <p className="mt-7 rounded-2xl bg-dema-cream px-4 py-3 text-xs leading-5 text-dema-muted">
        Informations déclaratives · disponibilité à confirmer. Demaa ne publie pas les coordonnées du contact.
      </p>
      <BuyerRequestForm opportunity={opportunity} />
    </DirectoryDetailDialogShell>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return <div className="rounded-2xl border border-dema-line bg-dema-cream/40 p-4"><dt className="text-xs text-dema-muted">{label}</dt><dd className="mt-2 text-sm font-semibold leading-6 text-brand-blue">{value}</dd></div>;
}

function EstimateDialog({ onClose }: { onClose: () => void }) {
  const [state, setState] = useState<SubmissionState>("idle");
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (state === "submitting") return;
    const form = event.currentTarget;
    const data = new FormData(form);
    const flowKey = "business-estimate:initial";
    setState("submitting");
    setError("");
    try {
      await submitForm("/api/business-estimate", {
        activity: data.get("activity"), company: data.get("company"), email: data.get("email"),
        employees: data.get("employees"), faxNumber: data.get("faxNumber"), idempotencyKey: getLeadSubmissionKey(flowKey),
        name: data.get("name"), phone: data.get("phone"), profitability: data.get("profitability"),
        recurringRevenue: data.get("recurringRevenue"), region: data.get("region"), revenue: data.get("revenue"),
        saleHorizon: data.get("saleHorizon"), saleReason: data.get("saleReason"), websiteOrSiren: data.get("websiteOrSiren"),
      });
      clearLeadSubmissionKey(flowKey);
      form.reset();
      setState("success");
      trackLeadConversion({ requestType: "business_estimate_request" });
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : "Impossible d’envoyer la demande.");
      setState("error");
    }
  }

  return (
    <DirectoryDetailDialogShell ariaLabel="Demander une première estimation" maxWidthClassName="max-w-3xl" onClose={onClose}>
      {state === "success" ? (
        <div className="py-8 text-center">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-dema-forest text-dema-paper"><Check className="h-5 w-5" aria-hidden="true" /></span>
          <h2 className="mt-5 text-3xl font-medium tracking-[-0.04em]">Demande envoyée.</h2>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-dema-muted">Nous vous recontactons pour fixer l’entretien de 30 minutes et préparer les informations utiles.</p>
        </div>
      ) : (
        <>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-dema-forest">Entretien offert · 30 minutes</p>
          <h2 className="mt-3 text-3xl font-medium tracking-[-0.04em] sm:text-4xl">Obtenez une première estimation de votre entreprise.</h2>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-dema-muted">Nous faisons le point sur votre activité, vos chiffres et votre projet de transmission. Après l’entretien, vous recevez une synthèse écrite avec une fourchette indicative et les éléments à préparer.</p>
          <form onSubmit={handleSubmit} className="mt-7 grid gap-4 sm:grid-cols-2" noValidate>
            <label className="block text-sm font-medium">Nom et prénom<input className={inputClassName} name="name" autoComplete="name" maxLength={160} required /></label>
            <label className="block text-sm font-medium">Email<input className={inputClassName} name="email" type="email" autoComplete="email" maxLength={160} required /></label>
            <label className="block text-sm font-medium">Téléphone<input className={inputClassName} name="phone" type="tel" autoComplete="tel" maxLength={40} /></label>
            <label className="block text-sm font-medium">Entreprise<input className={inputClassName} name="company" autoComplete="organization" maxLength={160} required /></label>
            <label className="block text-sm font-medium">Activité<input className={inputClassName} name="activity" maxLength={200} required /></label>
            <label className="block text-sm font-medium">Région<input className={inputClassName} name="region" maxLength={120} /></label>
            <label className="block text-sm font-medium">Site ou SIREN<input className={inputClassName} name="websiteOrSiren" maxLength={200} /></label>
            <label className="block text-sm font-medium">Chiffre d’affaires<input className={inputClassName} name="revenue" maxLength={160} placeholder="Idéalement les 3 derniers exercices" required /></label>
            <label className="block text-sm font-medium">EBE ou résultat<input className={inputClassName} name="profitability" maxLength={160} /></label>
            <label className="block text-sm font-medium">Effectif<input className={inputClassName} name="employees" maxLength={120} /></label>
            <label className="block text-sm font-medium">Revenus récurrents<input className={inputClassName} name="recurringRevenue" maxLength={160} placeholder="Si vous les connaissez" /></label>
            <label className="block text-sm font-medium">Horizon de vente<select className={inputClassName} name="saleHorizon" defaultValue=""><option value="">À préciser</option><option>Moins de 6 mois</option><option>6 à 12 mois</option><option>1 à 2 ans</option><option>Plus de 2 ans</option><option>Je réfléchis</option></select></label>
            <label className="block text-sm font-medium sm:col-span-2">Pourquoi envisagez-vous une vente ? <span className="font-normal text-dema-muted">(facultatif)</span><textarea className={`${inputClassName} min-h-24 resize-y`} name="saleReason" maxLength={1000} /></label>
            <label className="hidden" aria-hidden="true">Fax<input name="faxNumber" tabIndex={-1} autoComplete="off" /></label>
            {error ? <p className="text-sm font-medium text-red-700 sm:col-span-2" role="alert">{error}</p> : null}
            <div className="sm:col-span-2"><button className={`${primaryButtonClassName} w-full sm:w-auto`} disabled={state === "submitting"} type="submit">{state === "submitting" ? "Envoi…" : "Prendre rendez-vous"}</button></div>
            <p className="text-xs leading-5 text-dema-muted sm:col-span-2">La fourchette fournie est indicative : elle ne remplace pas une évaluation complète. Vos informations servent uniquement à préparer cet échange. Consultez notre <Link href="/politique-de-confidentialite" className="underline underline-offset-2">politique de confidentialité</Link>.</p>
          </form>
        </>
      )}
    </DirectoryDetailDialogShell>
  );
}

export function BusinessEstimateControl({
  className = primaryButtonClassName,
  label = "Prendre rendez-vous",
}: {
  className?: string;
  label?: string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={className}>
        {label}
      </button>
      {open ? <EstimateDialog onClose={() => setOpen(false)} /> : null}
    </>
  );
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
  const [selectedOpportunity, setSelectedOpportunity] = useState<RepriseOpportunity | null>(null);
  const [estimateOpen, setEstimateOpen] = useState(false);

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
      <Navbar minimal publicNavigationActiveView="marketplace" publicCta={<button type="button" onClick={() => setEstimateOpen(true)} className="inline-flex min-h-10 items-center rounded-full border border-dema-forest/18 bg-dema-paper px-3 text-xs font-medium text-dema-forest transition hover:border-dema-forest/30 hover:bg-dema-sage/45 sm:min-h-11 sm:px-5 sm:text-sm">Estimer mon entreprise</button>} />
      <main className="bg-dema-cream text-brand-blue">
        <section className="px-5 pb-14 pt-14 text-center sm:px-8 sm:pb-20 sm:pt-20 lg:pt-24">
          <div className="mx-auto max-w-6xl">
            <h1
              aria-label="Achetez une entreprise qui fonctionne déjà. La marketplace des PME de services à reprendre."
              className={`${satoshiHeroTitleClassName} mx-auto max-w-5xl`}
            >
              <span aria-hidden="true">
                <span className="block">Achetez une entreprise qui fonctionne déjà.</span>
                <span className="demaa-hero-title mt-2 block text-dema-forest">
                  La marketplace des PME de services à reprendre.
                </span>
              </span>
            </h1>
            <p className="mx-auto mt-7 max-w-3xl text-base leading-7 text-dema-muted sm:text-lg">Des entreprises dont la valeur repose sur leurs clients, leurs contrats, leur équipe et leur savoir-faire, plutôt que sur un emplacement commercial.</p>
            <p className="mt-6 text-sm font-medium text-dema-forest">Entreprises en activité · Clients existants · Équipe ou savoir-faire déjà en place</p>
            <div className="mx-auto mt-10 flex max-w-3xl items-center gap-3 rounded-full border border-dema-line bg-dema-paper px-5 py-2 shadow-[0_12px_35px_rgba(23,35,29,0.045)]">
              <Search className="h-5 w-5 shrink-0 text-dema-forest" aria-hidden="true" />
              <label className="sr-only" htmlFor="reprise-search">Rechercher une activité ou une région</label>
              <input id="reprise-search" value={query} onChange={(event) => setQuery(event.target.value)} className="min-h-12 w-full bg-transparent text-sm outline-none placeholder:text-dema-muted/70" placeholder="Activité, région…" />
            </div>
          </div>
        </section>

        <section className="border-y border-dema-line bg-dema-paper px-5 py-8 sm:px-8">
          <div className="mx-auto flex max-w-6xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <span className="inline-flex items-center gap-2 text-sm font-medium"><SlidersHorizontal className="h-4 w-4 text-dema-forest" aria-hidden="true" />Filtrer les opportunités</span>
            <div className="flex flex-wrap gap-2">
              {categories.map((item) => <button key={item} type="button" onClick={() => setCategory(item)} aria-pressed={category === item} className={`rounded-full border px-4 py-2 text-xs font-medium transition ${category === item ? "border-dema-forest bg-dema-forest text-dema-paper" : "border-dema-line bg-dema-paper text-dema-muted hover:border-dema-forest/30 hover:text-brand-blue"}`}>{item}</button>)}
            </div>
          </div>
        </section>

        <section className="px-5 py-14 sm:px-8 sm:py-20">
          <div className="mx-auto max-w-6xl">
            <div className="flex items-end justify-between gap-6"><div><h2 className="text-3xl font-medium tracking-[-0.04em] sm:text-5xl">Entreprises à reprendre</h2><p className="mt-3 text-sm text-dema-muted">{filtered.length} opportunité{filtered.length > 1 ? "s" : ""}</p></div></div>
            {filtered.length ? <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">{filtered.map((opportunity) => <OpportunityCard key={opportunity.id} opportunity={opportunity} onSelect={() => setSelectedOpportunity(opportunity)} />)}</div> : <div className="mt-10 rounded-[1.75rem] border border-dema-line bg-dema-paper p-10 text-center"><p className="text-lg font-medium">Aucune opportunité ne correspond à cette recherche.</p><button className="mt-4 text-sm font-semibold text-dema-forest underline underline-offset-4" type="button" onClick={() => { setQuery(""); setCategory("Toutes"); }}>Réinitialiser les filtres</button></div>}
          </div>
        </section>

        <section className="border-y border-dema-line bg-dema-sage/55 px-5 py-16 sm:px-8 sm:py-20">
          <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[1fr_0.85fr] lg:items-center">
            <div><p className="text-xs font-semibold uppercase tracking-[0.14em] text-dema-forest">Vous envisagez de vendre ?</p><h2 className="mt-4 text-4xl font-medium leading-tight tracking-[-0.045em] sm:text-6xl">Obtenez une première estimation de votre entreprise.</h2><p className="mt-6 max-w-2xl text-base leading-7 text-dema-muted">Un entretien de 30 minutes pour regarder votre activité et vos chiffres. Vous recevez ensuite une synthèse écrite avec une fourchette indicative et les éléments à préparer.</p><button type="button" onClick={() => setEstimateOpen(true)} className={`${primaryButtonClassName} mt-8`}>Prendre rendez-vous <ArrowRight className="h-4 w-4" aria-hidden="true" /></button></div>
            <ul className="divide-y divide-dema-line rounded-[1.75rem] border border-dema-line bg-dema-paper px-6 sm:px-8">
              {[{ Icon: Clock3, label: "30 minutes", detail: "Un échange simple et préparé" }, { Icon: Euro, label: "Fourchette indicative", detail: "Avec les chiffres et références utilisés" }, { Icon: UsersRound, label: "Synthèse écrite", detail: "Forces, points à préparer et prochaines actions" }].map(({ Icon, label, detail }) => <li key={label} className="flex gap-4 py-6"><span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-dema-sage text-dema-forest"><Icon className="h-5 w-5" strokeWidth={1.7} aria-hidden="true" /></span><span><strong className="block text-sm font-semibold">{label}</strong><span className="mt-1 block text-sm text-dema-muted">{detail}</span></span></li>)}
            </ul>
          </div>
        </section>
      </main>
      {selectedOpportunity ? <OpportunityDialog opportunity={selectedOpportunity} onClose={() => setSelectedOpportunity(null)} /> : null}
      {estimateOpen ? <EstimateDialog onClose={() => setEstimateOpen(false)} /> : null}
    </>
  );
}
