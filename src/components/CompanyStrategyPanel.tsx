"use client";

import { LoaderCircle, Plus } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import CompanyStrategyCycleDialog from "@/components/CompanyStrategyCycleDialog";
import CompanyStrategyHistory from "@/components/CompanyStrategyHistory";
import CompanyStrategyPillar from "@/components/CompanyStrategyPillar";
import { ActionPlanSaveQueue } from "@/lib/action-plan-save-queue.client";
import {
  COMPANY_STRATEGY_PILLAR_KEYS,
  getCurrentCompanyMonth,
  mergeCompanyStrategyAnswers,
  shiftCompanyMonth,
  type CompanyStrategyAnswerKey,
  type CompanyStrategyAnswers,
  type CompanyStrategyCycle,
  type CompanyStrategyPillar as StrategyPillar,
} from "@/lib/company-pilotage-contract";
import { formatCompanyMonth, getCompanyPilotageUiCopy } from "@/lib/company-pilotage-ui-copy";
import type { InterfaceLocaleCode } from "@/lib/international-context";

type SaveDraft = { answers: CompanyStrategyAnswers };
type SaveError = Error & { code?: string; current?: CompanyStrategyCycle };

function nextCycleLabel(localeCode: InterfaceLocaleCode, separator: string) {
  const startMonth = getCurrentCompanyMonth();
  const endMonth = shiftCompanyMonth(startMonth, 2);
  return `${formatCompanyMonth(startMonth, localeCode)} ${separator} ${formatCompanyMonth(endMonth, localeCode)}`;
}

export default function CompanyStrategyPanel({ localeCode }: { localeCode: InterfaceLocaleCode }) {
  const pilotageCopy = getCompanyPilotageUiCopy(localeCode);
  const copy = pilotageCopy.strategy;
  const pillars = pilotageCopy.pillars;
  const [cycle, setCycle] = useState<CompanyStrategyCycle | null>(null);
  const [answers, setAnswers] = useState<CompanyStrategyAnswers | null>(null);
  const [openPillar, setOpenPillar] = useState<StrategyPillar>("alignment");
  const [loading, setLoading] = useState(true);
  const [saveState, setSaveState] = useState<"idle" | "saving" | "error" | "conflict">("idle");
  const [message, setMessage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [conflicts, setConflicts] = useState<Partial<Record<CompanyStrategyAnswerKey, string>>>({});
  const [cycleDialogOpen, setCycleDialogOpen] = useState(false);
  const [creatingCycle, setCreatingCycle] = useState(false);
  const [cycleError, setCycleError] = useState<string | null>(null);
  const confirmedRef = useRef<CompanyStrategyCycle | null>(null);
  const draftRef = useRef<CompanyStrategyAnswers | null>(null);
  const saveQueueRef = useRef(new ActionPlanSaveQueue<SaveDraft>());
  const saveTimeoutRef = useRef<number | null>(null);
  const conflictKeysRef = useRef(new Set<CompanyStrategyAnswerKey>());

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let response = await fetch("/api/company/pilotage/strategy", { cache: "no-store" });
      let body = await response.json().catch(() => null) as { cycle?: CompanyStrategyCycle | null; error?: string } | null;
      if (!response.ok) throw new Error(localeCode === "fr" && body?.error ? body.error : copy.loadError);
      if (!body?.cycle) {
        response = await fetch("/api/company/pilotage/strategy/initialize", { method: "POST", headers: { "Content-Type": "application/json" }, body: "{}" });
        body = await response.json().catch(() => null) as { cycle?: CompanyStrategyCycle; error?: string } | null;
      }
      if (!response.ok || !body?.cycle) throw new Error(localeCode === "fr" && body?.error ? body.error : copy.initializeError);
      confirmedRef.current = body.cycle;
      draftRef.current = body.cycle.answers;
      setCycle(body.cycle);
      setAnswers(body.cycle.answers);
      setConflicts({});
      conflictKeysRef.current.clear();
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : copy.loadError);
    } finally {
      setLoading(false);
    }
  }, [copy.initializeError, copy.loadError, localeCode]);

  useEffect(() => { void load(); }, [load]);

  const flush = useCallback(async () => {
    const result = await saveQueueRef.current.drain(async ({ answers: target }) => {
      let confirmed = confirmedRef.current;
      if (!confirmed) return;
      for (const pillar of COMPANY_STRATEGY_PILLAR_KEYS) {
        const keys = pillar.questions;
        const changed = Object.fromEntries(keys.filter((key) =>
          !conflictKeysRef.current.has(key) && target[key] !== confirmed!.answers[key]
        ).map((key) => [key, target[key]]));
        if (!Object.keys(changed).length) continue;
        setSaveState("saving");
        setMessage(copy.saving);
        const response = await fetch(`/api/company/pilotage/strategy/cycles/${encodeURIComponent(confirmed.id)}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          keepalive: true,
          body: JSON.stringify({ expectedRevision: confirmed.revision, pillar: pillar.key, answers: changed }),
        });
        const body = await response.json().catch(() => null) as { cycle?: CompanyStrategyCycle; error?: string; code?: string; current?: CompanyStrategyCycle } | null;
        if (response.status === 409 && body?.code === "revision_conflict" && body.current) {
          const merged = mergeCompanyStrategyAnswers({ base: confirmed.answers, local: target, remote: body.current.answers });
          confirmed = body.current;
          confirmedRef.current = body.current;
          draftRef.current = merged.merged;
          setCycle(body.current);
          setAnswers(merged.merged);
          if (merged.conflicts.length) {
            conflictKeysRef.current = new Set(merged.conflicts);
            setConflicts(Object.fromEntries(merged.conflicts.map((key) => [key, body.current!.answers[key]])));
            const conflictError = new Error(copy.conflict) as SaveError;
            conflictError.code = "revision_conflict";
            conflictError.current = body.current;
            throw conflictError;
          }
          saveQueueRef.current.enqueue({ answers: merged.merged });
          return;
        }
        if (!response.ok || !body?.cycle) throw new Error(localeCode === "fr" && body?.error ? body.error : copy.saveError);
        confirmed = body.cycle;
        confirmedRef.current = body.cycle;
        setCycle(body.cycle);
      }
    });
    if (result.ok) {
      setSaveState("idle");
      setError(null);
      setMessage(copy.saved);
      return true;
    }
    const saveError = result.error as SaveError;
    const conflict = saveError.code === "revision_conflict";
    setSaveState(conflict ? "conflict" : "error");
    setError(saveError.message || copy.saveError);
    setMessage(conflict ? copy.conflictStatus : copy.failedStatus);
    return false;
  }, [copy.conflict, copy.conflictStatus, copy.failedStatus, copy.saved, copy.saveError, copy.saving, localeCode]);

  useEffect(() => () => {
    if (saveTimeoutRef.current !== null) window.clearTimeout(saveTimeoutRef.current);
    void flush();
  }, [flush]);

  function scheduleSave(next: CompanyStrategyAnswers) {
    saveQueueRef.current.enqueue({ answers: next });
    setSaveState("saving");
    setMessage(copy.savePending);
    if (saveTimeoutRef.current !== null) window.clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = window.setTimeout(() => {
      saveTimeoutRef.current = null;
      void flush();
    }, 700);
  }

  function changeAnswer(key: CompanyStrategyAnswerKey, value: string) {
    if (!answers) return;
    const next = { ...answers, [key]: value };
    draftRef.current = next;
    setAnswers(next);
    if (conflictKeysRef.current.has(key)) return;
    scheduleSave(next);
  }

  function resolveConflict(key: CompanyStrategyAnswerKey, useRemote: boolean) {
    const remote = conflicts[key];
    const current = draftRef.current;
    if (!current || remote === undefined) return;
    const next = useRemote ? { ...current, [key]: remote } : current;
    draftRef.current = next;
    setAnswers(next);
    conflictKeysRef.current.delete(key);
    setConflicts((previous) => { const copy = { ...previous }; delete copy[key]; return copy; });
    scheduleSave(next);
  }

  async function createCycle() {
    setCreatingCycle(true);
    setCycleError(null);
    if (saveTimeoutRef.current !== null) { window.clearTimeout(saveTimeoutRef.current); saveTimeoutRef.current = null; }
    const saved = await flush();
    const confirmed = confirmedRef.current;
    if (!saved || !confirmed || Object.keys(conflicts).length) {
      setCycleError(copy.cycleBlocked);
      setCreatingCycle(false);
      return;
    }
    try {
      const response = await fetch("/api/company/pilotage/strategy/cycles", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ expectedRevision: confirmed.revision }) });
      const body = await response.json().catch(() => null) as { cycle?: CompanyStrategyCycle; error?: string } | null;
      if (!response.ok || !body?.cycle) throw new Error(localeCode === "fr" && body?.error ? body.error : copy.cycleCreateError);
      confirmedRef.current = body.cycle;
      draftRef.current = body.cycle.answers;
      setCycle(body.cycle);
      setAnswers(body.cycle.answers);
      setOpenPillar("alignment");
      setCycleDialogOpen(false);
      setConflicts({});
      conflictKeysRef.current.clear();
      setSaveState("idle");
      setMessage(copy.cycleCreated);
    } catch (createError) {
      setCycleError(createError instanceof Error ? createError.message : copy.cycleCreateError);
    } finally {
      setCreatingCycle(false);
    }
  }

  const hasConflicts = Object.keys(conflicts).length > 0;
  if (loading) return <p role="status" className="flex items-center gap-2 py-8 text-sm text-dema-muted"><LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />{copy.loading}</p>;
  if (error && !cycle) return <div role="alert" className="rounded-xl bg-red-50 p-4 text-sm text-red-700"><p>{error}</p><button type="button" onClick={() => void load()} className="mt-2 font-semibold underline">{copy.retry}</button></div>;
  if (!cycle || !answers) return null;

  return (
    <div className="mx-auto max-w-3xl pb-12">
      <div className="flex items-start justify-between gap-4">
        <div><h1 className="text-2xl font-semibold text-dema-ink">{copy.title}</h1><p className="mt-1 text-sm text-dema-muted">{copy.description}</p></div>
        <button type="button" aria-label={copy.newCycle} onClick={() => { setCycleError(null); setCycleDialogOpen(true); }} className="inline-flex h-10 items-center justify-center gap-2 rounded-full bg-dema-forest px-3 text-sm font-semibold text-white sm:px-4"><Plus className="h-4 w-4" aria-hidden="true" /><span className="hidden sm:inline">{copy.newCycle}</span></button>
      </div>
      <div className="sr-only" role="status" aria-live="polite">{message}</div>
      {saveState === "error" ? <div role="alert" className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700"><p>{error}</p><button type="button" className="mt-1 font-semibold underline" onClick={() => void flush()}>{copy.retry}</button></div> : null}
      {hasConflicts ? <p className="mt-4 text-sm text-amber-800" role="status">{copy.conflictsInstruction}</p> : null}
      <div className="mt-6 divide-y divide-dema-line">
        {pillars.map((pillar) => <CompanyStrategyPillar key={pillar.key} copy={copy} pillar={pillar} open={openPillar === pillar.key} answers={answers} conflicts={conflicts} onOpen={() => setOpenPillar(pillar.key)} onAnswerChange={changeAnswer} onKeepLocal={(key) => resolveConflict(key, false)} onUseRemote={(key) => resolveConflict(key, true)} />)}
      </div>
      <CompanyStrategyHistory key={cycle.id} localeCode={localeCode} />
      <CompanyStrategyCycleDialog localeCode={localeCode} open={cycleDialogOpen} creating={creatingCycle} error={cycleError} periodLabel={nextCycleLabel(localeCode, copy.rangeSeparator)} onClose={() => { if (!creatingCycle) setCycleDialogOpen(false); }} onConfirm={() => void createCycle()} />
    </div>
  );
}
