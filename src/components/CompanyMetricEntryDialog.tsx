"use client";

import { LoaderCircle, X } from "lucide-react";
import { useEffect, useId, useState } from "react";
import { useAccessibleDialog } from "@/components/useAccessibleDialog";
import {
  companyMonthSchema,
  type CompanyMonth,
  type CompanyMonthlyMetric,
} from "@/lib/company-pilotage-contract";

function centsToInput(value: number | null | undefined) {
  return value == null ? "" : (value / 100).toFixed(2).replace(".", ",");
}

function inputToCents(value: string, allowNegative: boolean) {
  const normalized = value.trim().replace(/\s/g, "").replace(",", ".");
  if (!normalized) return null;
  if (!/^-?\d+(?:\.\d{1,2})?$/.test(normalized)) throw new Error("Saisissez un montant avec deux décimales maximum.");
  const cents = Math.round(Number(normalized) * 100);
  if (!Number.isSafeInteger(cents) || (!allowNegative && cents < 0)) {
    throw new Error(allowNegative ? "Montant invalide." : "Ce montant ne peut pas être négatif.");
  }
  return cents;
}

export default function CompanyMetricEntryDialog({
  open,
  initialPeriod,
  initialMetric,
  onClose,
  onSaved,
}: {
  open: boolean;
  initialPeriod: CompanyMonth;
  initialMetric: CompanyMonthlyMetric | null;
  onClose: () => void;
  onSaved: (metric: CompanyMonthlyMetric) => void;
}) {
  const id = useId();
  const [period, setPeriod] = useState(initialPeriod);
  const [revenue, setRevenue] = useState("");
  const [expenses, setExpenses] = useState("");
  const [cash, setCash] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expectedRevision, setExpectedRevision] = useState(0);
  const [conflictCurrent, setConflictCurrent] = useState<CompanyMonthlyMetric | null>(null);
  const dialogRef = useAccessibleDialog({ isOpen: open, onClose });

  useEffect(() => {
    if (!open) return;
    setPeriod(initialPeriod);
    setRevenue(centsToInput(initialMetric?.revenueCents));
    setExpenses(centsToInput(initialMetric?.expensesCents));
    setCash(centsToInput(initialMetric?.cashBalanceCents));
    setExpectedRevision(initialMetric?.revision ?? 0);
    setConflictCurrent(null);
    setError(null);
  }, [initialMetric, initialPeriod, open]);

  if (!open) return null;

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    const parsedPeriod = companyMonthSchema.safeParse(period);
    if (!parsedPeriod.success) {
      setError("Choisissez un mois valide.");
      return;
    }
    try {
      setSaving(true);
      const response = await fetch(`/api/company/pilotage/metrics/${encodeURIComponent(period)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          expectedRevision,
          revenueCents: inputToCents(revenue, false),
          expensesCents: inputToCents(expenses, false),
          cashBalanceCents: inputToCents(cash, true),
        }),
      });
      const body = await response.json().catch(() => null) as { metric?: CompanyMonthlyMetric; error?: string; code?: string; current?: CompanyMonthlyMetric | null } | null;
      if (response.status === 409 && body?.code === "revision_conflict" && body.current) {
        setConflictCurrent(body.current);
        setError(body.error || "Ce mois a été modifié ailleurs.");
        return;
      }
      if (!response.ok || !body?.metric) throw new Error(body?.error || "Impossible d’enregistrer ce mois.");
      onSaved(body.metric);
      onClose();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Impossible d’enregistrer ce mois.");
    } finally {
      setSaving(false);
    }
  }

  const inputClass = "mt-1 w-full rounded-xl border border-dema-line bg-white px-3 py-2.5 text-base text-dema-ink outline-none focus:border-dema-forest";
  return (
    <div className="fixed inset-0 z-[170] flex items-end justify-center bg-black/40 p-3 sm:items-center" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <div ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby={`${id}-title`} tabIndex={-1} className="max-h-[92dvh] w-full max-w-lg overflow-y-auto rounded-2xl bg-dema-paper p-5 shadow-2xl outline-none sm:p-7">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 id={`${id}-title`} className="text-xl font-semibold text-dema-ink">Saisir les chiffres du mois</h2>
            <p className="mt-1 text-sm text-dema-muted">Les montants sont enregistrés en euros, au niveau de l’entreprise.</p>
          </div>
          <button data-dialog-initial-focus type="button" onClick={onClose} aria-label="Fermer" className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-dema-line text-dema-forest"><X className="h-4 w-4" aria-hidden="true" /></button>
        </div>
        <form className="mt-6 space-y-4" onSubmit={submit}>
          <label className="block text-sm font-medium text-dema-ink">Mois<input type="month" value={period} onChange={(event) => { const nextPeriod = event.target.value as CompanyMonth; setPeriod(nextPeriod); setExpectedRevision(nextPeriod === initialMetric?.period ? initialMetric.revision : 0); setConflictCurrent(null); setError(null); }} className={inputClass} /></label>
          <label className="block text-sm font-medium text-dema-ink">Chiffre d’affaires (€)<input inputMode="decimal" value={revenue} onChange={(event) => setRevenue(event.target.value)} placeholder="0,00" className={inputClass} /></label>
          <label className="block text-sm font-medium text-dema-ink">Charges (€)<input inputMode="decimal" value={expenses} onChange={(event) => setExpenses(event.target.value)} placeholder="0,00" className={inputClass} /></label>
          <label className="block text-sm font-medium text-dema-ink">Trésorerie en fin de mois (€)<input inputMode="decimal" value={cash} onChange={(event) => setCash(event.target.value)} placeholder="0,00" className={inputClass} /></label>
          {error ? <div role="alert" className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700"><p>{error}</p>{conflictCurrent ? <div className="mt-2 flex flex-wrap gap-3"><button type="button" className="font-semibold underline" onClick={() => { setExpectedRevision(conflictCurrent.revision); setConflictCurrent(null); setError(null); }}>Garder mes valeurs</button><button type="button" className="font-semibold underline" onClick={() => { setRevenue(centsToInput(conflictCurrent.revenueCents)); setExpenses(centsToInput(conflictCurrent.expensesCents)); setCash(centsToInput(conflictCurrent.cashBalanceCents)); setExpectedRevision(conflictCurrent.revision); setConflictCurrent(null); setError(null); }}>Utiliser la version récente</button></div> : <button type="button" className="mt-1 font-semibold underline" onClick={() => setError(null)}>Réessayer</button>}</div> : null}
          <button disabled={saving} type="submit" className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-dema-forest px-5 py-3 text-sm font-semibold text-white disabled:opacity-60">
            {saving ? <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" /> : null}
            {initialMetric && initialMetric.period === period ? "Mettre à jour" : "Ajouter"}
          </button>
        </form>
      </div>
    </div>
  );
}
