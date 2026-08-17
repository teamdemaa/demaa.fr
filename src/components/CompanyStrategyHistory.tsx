"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  COMPANY_STRATEGY_PILLARS,
  formatCompanyMonth,
  type CompanyStrategyCycle,
} from "@/lib/company-pilotage-contract";

function cycleLabel(cycle: CompanyStrategyCycle) {
  return `${formatCompanyMonth(cycle.startMonth)} — ${formatCompanyMonth(cycle.endMonth)}`;
}

export default function CompanyStrategyHistory() {
  const [cycles, setCycles] = useState<CompanyStrategyCycle[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedCycle, setExpandedCycle] = useState<string | null>(null);
  const initialLoadStartedRef = useRef(false);

  const load = useCallback(async (reset = false) => {
    setLoading(true);
    setError(null);
    try {
      const nextCursor = reset ? null : cursor;
      const response = await fetch(`/api/company/pilotage/strategy/history${nextCursor ? `?cursor=${encodeURIComponent(nextCursor)}` : ""}`, { cache: "no-store" });
      const body = await response.json().catch(() => null) as { cycles?: CompanyStrategyCycle[]; nextCursor?: string | null; error?: string } | null;
      if (!response.ok || !body?.cycles) throw new Error(body?.error || "Impossible de charger l’historique.");
      setCycles((current) => reset ? body.cycles! : [...current, ...body.cycles!]);
      setCursor(body.nextCursor ?? null);
      setLoaded(true);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Impossible de charger l’historique.");
    } finally {
      setLoading(false);
    }
  }, [cursor]);

  useEffect(() => {
    if (initialLoadStartedRef.current) return;
    initialLoadStartedRef.current = true;
    void load(true);
  }, [load]);

  if (loading && !loaded) return null;
  if (loaded && cycles.length === 0 && !error) return null;

  return (
    <section className="mt-8 border-t border-dema-line pt-6" aria-labelledby="strategy-history-title">
      <h2 id="strategy-history-title" className="text-lg font-semibold text-dema-ink">Historique des cycles</h2>
      {error ? <div role="alert" className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700"><p>{error}</p><button type="button" className="mt-1 font-semibold underline" onClick={() => void load(!loaded)}>Réessayer</button></div> : null}
      <div className="mt-3 divide-y divide-dema-line border-y border-dema-line">
        {cycles.map((cycle) => (
          <article key={cycle.id} className="py-4">
            <button type="button" aria-expanded={expandedCycle === cycle.id} onClick={() => setExpandedCycle((current) => current === cycle.id ? null : cycle.id)} className="flex w-full items-center justify-between gap-4 text-left"><span><strong className="block font-medium text-dema-ink">{cycleLabel(cycle)}</strong><span className="text-xs text-dema-muted">Créé le {new Intl.DateTimeFormat("fr-FR", { dateStyle: "long" }).format(new Date(cycle.createdAt))}</span></span><span className="text-sm font-semibold text-dema-forest">{expandedCycle === cycle.id ? "Masquer" : "Consulter"}</span></button>
            {expandedCycle === cycle.id ? <div className="mt-5 space-y-5">{COMPANY_STRATEGY_PILLARS.map((pillar) => <section key={pillar.key}><h3 className="font-medium text-dema-forest">{pillar.label}</h3><p className="mt-1 text-sm text-dema-muted">{pillar.framing}</p><dl className="mt-3 space-y-3">{pillar.questions.map((question) => <div key={question.key}><dt className="text-sm font-medium text-dema-ink">{question.label}</dt><dd className="mt-1 whitespace-pre-wrap text-sm text-dema-muted">{cycle.answers[question.key] || "—"}</dd></div>)}</dl></section>)}</div> : null}
          </article>
        ))}
      </div>
      {cursor ? <button disabled={loading} type="button" onClick={() => void load()} className="mt-4 rounded-full border border-dema-line px-4 py-2 text-sm font-semibold text-dema-forest disabled:opacity-50">Afficher 10 cycles de plus</button> : null}
    </section>
  );
}
