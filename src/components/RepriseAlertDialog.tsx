"use client";

import Link from "next/link";
import { Bell, Check } from "lucide-react";
import { type FormEvent, useState } from "react";
import DirectoryDetailDialogShell from "@/components/DirectoryDetailDialogShell";
import { clearLeadSubmissionKey, getLeadSubmissionKey } from "@/lib/lead-submission-client";
import type { RepriseAlertCriteria } from "@/lib/reprise-alerts";
import {
  repriseOpportunityCategories,
  repriseOpportunityRegions,
  type RepriseOpportunity,
  type RepriseOpportunityCategory,
  type RepriseOpportunityRegion,
} from "@/lib/reprise-opportunities";

type RepriseAlertDialogProps = {
  initialCriteria: RepriseAlertCriteria;
  onClose: () => void;
  onOpenOpportunity: (opportunity: RepriseOpportunity) => void;
  opportunities: readonly RepriseOpportunity[];
};

type State = "idle" | "submitting" | "success" | "error";

const inputClassName = "mt-2 min-h-12 w-full rounded-2xl border border-dema-line bg-dema-cream/35 px-4 py-3 text-sm text-brand-blue outline-none transition placeholder:text-dema-muted/55 focus:border-dema-forest/45 focus:ring-2 focus:ring-dema-forest/15";

function toggleValue<T extends string>(values: readonly T[], value: T) {
  return values.includes(value) ? values.filter((item) => item !== value) : [...values, value];
}
export function RepriseAlertCriteriaFields({
  criteria,
  onChange,
}: {
  criteria: RepriseAlertCriteria;
  onChange: (criteria: RepriseAlertCriteria) => void;
}) {
  function update(values: Partial<RepriseAlertCriteria>) {
    onChange({ ...criteria, ...values });
  }

  return (
    <div className="space-y-6">
      <label className="block text-sm font-medium">
        Activité ou mots-clés
        <input className={inputClassName} value={criteria.query} onChange={(event) => update({ query: event.target.value })} maxLength={120} placeholder="Ex. maintenance, cabinet, logiciel métier" />
      </label>

      <fieldset>
        <legend className="text-sm font-medium">Catégories recherchées</legend>
        <div className="mt-3 flex flex-wrap gap-2">
          {repriseOpportunityCategories.map((category) => {
            const selected = criteria.categories.includes(category);
            return <button key={category} type="button" aria-pressed={selected} onClick={() => update({ categories: toggleValue(criteria.categories, category as RepriseOpportunityCategory) })} className={`demaa-chip inline-flex items-center gap-1.5 ${selected ? "demaa-chip-active" : ""}`}>{selected ? <Check className="h-3.5 w-3.5" aria-hidden="true" /> : null}{category}</button>;
          })}
        </div>
      </fieldset>

      <fieldset>
        <legend className="text-sm font-medium">Régions</legend>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {repriseOpportunityRegions.map((region) => {
            const selected = criteria.regions.includes(region);
            return <label key={region} className={`flex cursor-pointer items-center gap-3 rounded-2xl border px-3 py-2.5 text-sm transition ${selected ? "border-dema-forest/35 bg-dema-sage/45 text-dema-forest" : "border-dema-line bg-dema-paper text-dema-muted"}`}><input type="checkbox" className="h-4 w-4 accent-dema-forest" checked={selected} onChange={() => update({ regions: toggleValue(criteria.regions, region as RepriseOpportunityRegion) })} /><span>{region}</span></label>;
          })}
        </div>
      </fieldset>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm font-medium">
          Budget maximal
          <span className="relative block"><input className={`${inputClassName} pr-10`} type="number" min="0" max="1000000000" step="10000" value={criteria.budgetMax ?? ""} onChange={(event) => update({ budgetMax: event.target.value ? Number(event.target.value) : null })} placeholder="500 000" /><span className="pointer-events-none absolute right-4 top-1/2 mt-1 -translate-y-1/2 text-sm text-dema-muted">€</span></span>
        </label>
        <label className="block text-sm font-medium">
          Chiffre d’affaires minimal
          <span className="relative block"><input className={`${inputClassName} pr-10`} type="number" min="0" max="1000000000" step="10000" value={criteria.revenueMin ?? ""} onChange={(event) => update({ revenueMin: event.target.value ? Number(event.target.value) : null })} placeholder="300 000" /><span className="pointer-events-none absolute right-4 top-1/2 mt-1 -translate-y-1/2 text-sm text-dema-muted">€</span></span>
        </label>
      </div>

      <label className="flex cursor-pointer items-start gap-3 text-sm leading-6 text-dema-muted"><input type="checkbox" className="mt-1 h-4 w-4 accent-dema-forest" checked={criteria.includeMissing} onChange={(event) => update({ includeMissing: event.target.checked })} /><span>Inclure les annonces dont certaines informations ne sont pas disponibles.</span></label>
    </div>
  );
}

export default function RepriseAlertDialog({ initialCriteria, onClose, onOpenOpportunity, opportunities }: RepriseAlertDialogProps) {
  const [criteria, setCriteria] = useState(initialCriteria);
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [matchIds, setMatchIds] = useState<string[]>([]);
  const [state, setState] = useState<State>("idle");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (state === "submitting") return;
    const formData = new FormData(event.currentTarget);
    setState("submitting");
    setError("");
    try {
      const response = await fetch("/api/reprise-alerts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          criteria,
          email,
          idempotencyKey: getLeadSubmissionKey("reprise-alert"),
          website: formData.get("website"),
        }),
      });
      const body = (await response.json().catch(() => null)) as { error?: string; matchIds?: string[]; ok?: boolean } | null;
      if (response.status !== 202 || body?.ok !== true) throw new Error(body?.error || "Impossible de créer l’alerte.");
      clearLeadSubmissionKey("reprise-alert");
      setMatchIds(body.matchIds ?? []);
      setState("success");
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : "Impossible de créer l’alerte.");
      setState("error");
    }
  }

  const currentMatches = matchIds.flatMap((id) => {
    const opportunity = opportunities.find((item) => item.id === id);
    return opportunity ? [opportunity] : [];
  });

  return (
    <DirectoryDetailDialogShell ariaLabel="Créer une alerte de reprise" maxWidthClassName="max-w-3xl" onClose={onClose}>
      {state === "success" ? (
        <div className="py-5 text-center">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-dema-sage text-dema-forest"><Check className="h-5 w-5" aria-hidden="true" /></span>
          <h2 className="mt-5 text-3xl font-normal tracking-[-0.04em]">Votre alerte est créée.</h2>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-dema-muted">Vous recevrez un email lorsqu’une nouvelle entreprise correspondra à vos critères.</p>
          <div className="mt-7 rounded-3xl border border-dema-line bg-dema-cream/35 p-5 text-left">
            <p className="text-sm font-medium">{currentMatches.length} opportunité{currentMatches.length > 1 ? "s" : ""} correspond{currentMatches.length > 1 ? "ent" : ""} déjà à votre recherche.</p>
            {currentMatches.length > 0 ? <ul className="mt-3 divide-y divide-dema-line">{currentMatches.slice(0, 4).map((opportunity) => <li key={opportunity.id}><button type="button" onClick={() => onOpenOpportunity(opportunity)} className="w-full py-3 text-left text-sm text-dema-forest underline decoration-dema-forest/25 underline-offset-4 hover:decoration-dema-forest">{opportunity.activity}</button></li>)}</ul> : null}
          </div>
          <button type="button" onClick={onClose} className="mt-7 text-sm font-medium text-dema-forest underline underline-offset-4">Fermer</button>
        </div>
      ) : (
        <>
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-dema-sage text-dema-forest"><Bell className="h-5 w-5" strokeWidth={1.7} aria-hidden="true" /></span>
          <h2 className="mt-5 text-3xl font-normal tracking-[-0.04em] sm:text-4xl">Recevoir les nouvelles opportunités.</h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-dema-muted">Choisissez vos critères. Nous vous écrirons uniquement lorsqu’une nouvelle entreprise correspondra à votre recherche.</p>
          <form className="mt-7" onSubmit={handleSubmit} noValidate>
            <RepriseAlertCriteriaFields criteria={criteria} onChange={setCriteria} />
            <div className="mt-8 border-t border-dema-line pt-7">
              <label className="block text-sm font-medium">Votre email<input className={inputClassName} type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} maxLength={160} required /></label>
              <label className="hidden" aria-hidden="true">Site internet<input name="website" tabIndex={-1} autoComplete="off" /></label>
              {error ? <p className="mt-3 text-sm font-medium text-red-700" role="alert">{error}</p> : null}
              <button type="submit" disabled={state === "submitting"} className="mt-5 inline-flex min-h-12 w-full items-center justify-center rounded-full bg-dema-forest px-6 py-3 text-sm font-semibold text-dema-paper transition hover:bg-brand-blue disabled:cursor-wait disabled:opacity-65">{state === "submitting" ? "Création…" : "Créer mon alerte"}</button>
              <p className="mt-3 text-xs leading-5 text-dema-muted">Votre email sert uniquement à cette alerte. Vous pourrez la modifier ou la supprimer à tout moment. Consultez notre <Link href="/politique-de-confidentialite" className="underline underline-offset-2">politique de confidentialité</Link>.</p>
            </div>
          </form>
        </>
      )}
    </DirectoryDetailDialogShell>
  );
}
