"use client";

import { LoaderCircle, Plus } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import CompanyMetricEntryDialog from "@/components/CompanyMetricEntryDialog";
import {
  enumerateCompanyMonths,
  getCompanyMetricResult,
  getCurrentCompanyMonth,
  shiftCompanyMonth,
  summarizeCompanyMetrics,
  type CompanyMonth,
  type CompanyMonthlyMetric,
} from "@/lib/company-pilotage-contract";
import {
  formatCompanyMetricCents,
  formatCompanyMonth,
  getCompanyPilotageUiCopy,
} from "@/lib/company-pilotage-ui-copy";
import type { InterfaceLocaleCode } from "@/lib/international-context";

type RangePreset = "current" | "3" | "6" | "12" | "custom";
type Comparison = "revenue-expenses" | "revenue-cash" | "result-cash";

function getSeries(metric: CompanyMonthlyMetric | undefined, comparison: Comparison) {
  if (comparison === "revenue-expenses") return [metric?.revenueCents ?? null, metric?.expensesCents ?? null] as const;
  if (comparison === "revenue-cash") return [metric?.revenueCents ?? null, metric?.cashBalanceCents ?? null] as const;
  return [metric ? getCompanyMetricResult(metric) : null, metric?.cashBalanceCents ?? null] as const;
}

export default function CompanyFiguresPanel({ localeCode }: { localeCode: InterfaceLocaleCode }) {
  const copy = getCompanyPilotageUiCopy(localeCode).figures;
  const formatCents = (value: number | null) => formatCompanyMetricCents(value, localeCode);
  const formatMonth = (period: CompanyMonth) => formatCompanyMonth(period, localeCode);
  const currentMonth = useMemo(() => getCurrentCompanyMonth(), []);
  const [preset, setPreset] = useState<RangePreset>("6");
  const [from, setFrom] = useState<CompanyMonth>(shiftCompanyMonth(currentMonth, -5));
  const [to, setTo] = useState<CompanyMonth>(currentMonth);
  const [metrics, setMetrics] = useState<CompanyMonthlyMetric[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [comparison, setComparison] = useState<Comparison>("revenue-expenses");
  const [selectedPeriod, setSelectedPeriod] = useState<CompanyMonth>(currentMonth);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [focusedPeriod, setFocusedPeriod] = useState<CompanyMonth | null>(null);
  const periods = useMemo(() => {
    try { return enumerateCompanyMonths(from, to); } catch { return []; }
  }, [from, to]);

  const loadMetrics = useCallback(async () => {
    if (!periods.length) {
      setError(copy.invalidPeriod);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/company/pilotage/metrics?from=${from}&to=${to}`, { cache: "no-store" });
      const body = await response.json().catch(() => null) as { metrics?: CompanyMonthlyMetric[]; error?: string } | null;
      if (!response.ok || !body?.metrics) throw new Error(localeCode === "fr" && body?.error ? body.error : copy.loadError);
      setMetrics(body.metrics);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : copy.loadError);
    } finally {
      setLoading(false);
    }
  }, [copy.invalidPeriod, copy.loadError, from, localeCode, periods.length, to]);

  useEffect(() => { void loadMetrics(); }, [loadMetrics]);

  function changePreset(value: RangePreset) {
    setPreset(value);
    if (value === "custom") return;
    const count = value === "current" ? 1 : Number(value);
    setFrom(shiftCompanyMonth(currentMonth, -(count - 1)));
    setTo(currentMonth);
  }

  const byPeriod = useMemo(() => new Map(metrics.map((metric) => [metric.period, metric])), [metrics]);
  const summary = useMemo(() => summarizeCompanyMetrics(periods, metrics), [metrics, periods]);
  const allValues = periods.flatMap((period) => getSeries(byPeriod.get(period), comparison)).filter((value): value is number => value !== null);
  const chartMinimum = Math.min(0, ...allValues);
  const chartMaximum = Math.max(0, ...allValues);
  const chartRange = Math.max(1, chartMaximum - chartMinimum);
  const zeroFromTop = chartMaximum / chartRange * 100;
  const labels = comparison === "revenue-expenses" ? [copy.revenueShort, copy.expenses] : comparison === "revenue-cash" ? [copy.revenueShort, copy.cashShort] : [copy.result, copy.cashShort];
  const focusedMetric = focusedPeriod ? byPeriod.get(focusedPeriod) : undefined;
  const focusedValues = focusedPeriod ? getSeries(focusedMetric, comparison) : null;

  return (
    <div className="mx-auto max-w-[68rem] pb-12">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <label className="text-sm font-medium text-dema-ink">{copy.period}<select value={preset} onChange={(event) => changePreset(event.target.value as RangePreset)} className="mt-1 block rounded-xl border border-dema-line bg-white px-3 py-2 text-sm"><option value="current">{copy.current}</option><option value="3">{copy.months3}</option><option value="6">{copy.months6}</option><option value="12">{copy.months12}</option><option value="custom">{copy.custom}</option></select></label>
        {preset === "custom" ? <><label className="text-sm font-medium text-dema-ink">{copy.from}<input type="month" value={from} onChange={(event) => setFrom(event.target.value as CompanyMonth)} className="mt-1 block rounded-xl border border-dema-line bg-white px-3 py-2 text-sm" /></label><label className="text-sm font-medium text-dema-ink">{copy.to}<input type="month" value={to} onChange={(event) => setTo(event.target.value as CompanyMonth)} className="mt-1 block rounded-xl border border-dema-line bg-white px-3 py-2 text-sm" /></label></> : null}
        <button type="button" onClick={() => { setSelectedPeriod(currentMonth); setDialogOpen(true); }} className="inline-flex items-center gap-2 rounded-full bg-dema-forest px-4 py-2.5 text-sm font-semibold text-white"><Plus className="h-4 w-4" aria-hidden="true" />{copy.enterMonth}</button>
      </div>
      {error ? <div role="alert" className="mt-5 rounded-xl bg-red-50 p-4 text-sm text-red-700"><p>{error}</p><button type="button" onClick={() => void loadMetrics()} className="mt-2 font-semibold underline">{copy.retry}</button></div> : null}
      {loading ? <div role="status" className="mt-8 flex items-center gap-2 text-sm text-dema-muted"><LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />{copy.loading}</div> : null}
      {!loading && periods.length ? (
        <>
          <dl className="mt-6 grid grid-cols-2 gap-3">
            {[[copy.revenue, summary.revenueCents], [copy.expenses, summary.expensesCents], [copy.result, summary.resultCents], [copy.cash, summary.cashBalanceCents]].map(([label, value], index) => <div key={String(label)} className="min-w-0 rounded-2xl border border-dema-line bg-dema-paper p-3 sm:p-4"><dt className="text-xs text-dema-muted sm:text-sm">{label}</dt><dd className="mt-1 break-words text-lg font-semibold text-dema-ink sm:text-xl">{formatCents(value as number | null)}</dd>{index === 2 ? <p className="mt-1 text-[11px] leading-snug text-dema-muted sm:text-xs">{copy.nonAccounting}</p> : null}</div>)}
          </dl>
          {periods.length > 1 ? <section className="mt-8 border-t border-dema-line pt-6" aria-labelledby="company-metrics-chart-title">
            <div className="flex flex-wrap items-end justify-between gap-3"><h2 id="company-metrics-chart-title" className="text-lg font-semibold text-dema-ink">{copy.monthlyChange}</h2><label className="text-sm font-medium text-dema-ink">{copy.compare}<select value={comparison} onChange={(event) => setComparison(event.target.value as Comparison)} className="mt-1 block rounded-xl border border-dema-line bg-white px-3 py-2 text-sm"><option value="revenue-expenses">{copy.revenueShort} / {copy.expenses}</option><option value="revenue-cash">{copy.revenueShort} / {copy.cashShort}</option><option value="result-cash">{copy.result} / {copy.cashShort}</option></select></label></div>
            <p id="company-metrics-chart-instructions" className="sr-only">{copy.keyboardInstructions}</p>
              <div className="mt-5 min-w-0 rounded-2xl border border-dema-line bg-dema-paper p-4" role="group" aria-label={`${copy.chart} ${labels[0]} ${labels[1]} ${copy.overMonths.replace("{count}", String(periods.length))}`} aria-describedby="company-metrics-chart-instructions">
                <div className="flex h-48 min-w-0 gap-2">
                  <div className="relative w-16 shrink-0 text-right text-[10px] text-dema-muted" aria-hidden="true"><span className="absolute right-0 top-0">{formatCents(chartMaximum)}</span>{chartMinimum < 0 ? <span className="absolute right-0 -translate-y-1/2" style={{ top: `${zeroFromTop}%` }}>0 €</span> : null}<span className="absolute bottom-0 right-0">{formatCents(chartMinimum)}</span></div>
                  <div className="relative flex min-w-0 flex-1 items-stretch gap-1 border-b border-dema-line sm:gap-2">
                    <span className="pointer-events-none absolute inset-x-0 border-t border-dema-line" style={{ top: `${zeroFromTop}%` }} aria-hidden="true" />
                    {periods.map((period) => {
                      const values = getSeries(byPeriod.get(period), comparison);
                      return <button key={period} type="button" onFocus={() => setFocusedPeriod(period)} onMouseEnter={() => setFocusedPeriod(period)} onClick={() => setFocusedPeriod(period)} aria-label={`${formatMonth(period)} : ${labels[0]} ${formatCents(values[0])}, ${labels[1]} ${formatCents(values[1])}`} className="group relative min-w-0 flex-1 rounded-t outline-none focus-visible:ring-2 focus-visible:ring-dema-forest">{values.map((value, index) => value === null ? null : <span key={index} className={`absolute w-[32%] min-w-[3px] transition-opacity group-hover:opacity-75 ${index === 0 ? "left-[16%] bg-dema-forest" : "right-[16%] bg-brand-blue"} ${value >= 0 ? "rounded-t" : "rounded-b"}`} style={{ height: `${Math.max(2, Math.abs(value) / chartRange * 100)}%`, ...(value >= 0 ? { bottom: `${100 - zeroFromTop}%` } : { top: `${zeroFromTop}%` }) }} />)}</button>;
                    })}
                  </div>
                </div>
                <div className="mt-2 ml-[4.5rem] flex gap-1 text-center text-[10px] text-dema-muted sm:gap-2">{periods.map((period) => <span key={period} className="min-w-0 flex-1 truncate">{period.slice(5)}</span>)}</div>
                <div className="mt-4 flex flex-wrap gap-4 text-xs text-dema-muted"><span><i className="mr-1 inline-block h-2.5 w-2.5 rounded-sm bg-dema-forest" />{labels[0]}</span><span><i className="mr-1 inline-block h-2.5 w-2.5 rounded-sm bg-brand-blue" />{labels[1]}</span></div>
                {focusedPeriod && focusedValues ? <p className="mt-3 text-sm text-dema-ink" role="status">{formatMonth(focusedPeriod)} · {labels[0]} {formatCents(focusedValues[0])} · {labels[1]} {formatCents(focusedValues[1])}</p> : null}
              </div>
          </section> : null}
          <section className="mt-8 border-t border-dema-line pt-6"><h2 className="text-lg font-semibold text-dema-ink">{copy.monthlyDetail}</h2><div className="mt-3 divide-y divide-dema-line border-y border-dema-line">{periods.map((period) => { const metric = byPeriod.get(period); return <button key={period} type="button" onClick={() => { setSelectedPeriod(period); setDialogOpen(true); }} className="grid w-full grid-cols-[1fr_auto] gap-3 py-4 text-left"><span><strong className="block font-medium text-dema-ink">{formatMonth(period)}</strong><span className="text-sm text-dema-muted">{copy.revenueShort} {formatCents(metric?.revenueCents ?? null)} · {copy.expenses} {formatCents(metric?.expensesCents ?? null)} · {copy.cashShort} {formatCents(metric?.cashBalanceCents ?? null)}</span></span><span className="self-center text-sm font-semibold text-dema-forest">{metric ? copy.edit : copy.add}</span></button>; })}</div></section>
        </>
      ) : null}
      <CompanyMetricEntryDialog localeCode={localeCode} open={dialogOpen} initialPeriod={selectedPeriod} metricsByPeriod={byPeriod} onClose={() => setDialogOpen(false)} onSaved={(metric) => { setMetrics((current) => [...current.filter((item) => item.period !== metric.period), metric].sort((a, b) => a.period.localeCompare(b.period))); }} />
    </div>
  );
}
