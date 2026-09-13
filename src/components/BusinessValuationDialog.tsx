"use client";

import { ArrowLeft, Check, TrendingUp } from "lucide-react";
import { type FormEvent, useState } from "react";
import DirectoryDetailDialogShell from "@/components/DirectoryDetailDialogShell";
import {
  businessActivityOptions,
  calculateBusinessValuation,
  getBusinessValuationModel,
  type BusinessActivityId,
  type BusinessValuationInput,
  type BusinessValuationResult,
  type QualitativeLevel,
} from "@/lib/business-valuation";

const inputClassName = "mt-2 min-h-12 w-full rounded-2xl border border-dema-line bg-dema-cream/35 px-4 py-3 text-sm text-brand-blue outline-none transition focus:border-dema-forest/45 focus:ring-2 focus:ring-dema-forest/15";
const primaryButtonClassName = "inline-flex min-h-12 items-center justify-center rounded-full bg-dema-forest px-7 py-3 text-sm font-semibold text-dema-paper transition hover:bg-brand-blue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dema-forest/35";
const secondaryButtonClassName = "inline-flex min-h-12 items-center justify-center gap-2 px-2 text-sm font-medium text-dema-forest underline decoration-dema-forest/30 underline-offset-4 hover:decoration-dema-forest";

type FinancialValues = { revenue: string; ebe: string; arr: string; growth: string; churn: string; grossMargin: string };
const emptyFinancialValues: FinancialValues = { revenue: "", ebe: "", arr: "", growth: "", churn: "", grossMargin: "" };

export default function BusinessValuationDialog({ onClose, onContinue }: { onClose: () => void; onContinue: (input: BusinessValuationInput, result: BusinessValuationResult) => void }) {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [activityId, setActivityId] = useState<BusinessActivityId>("btp-maintenance");
  const [financials, setFinancials] = useState<FinancialValues>(emptyFinancialValues);
  const [recurrence, setRecurrence] = useState<QualitativeLevel>("moderate");
  const [concentration, setConcentration] = useState<QualitativeLevel>("moderate");
  const [autonomy, setAutonomy] = useState<QualitativeLevel>("moderate");
  const [dependence, setDependence] = useState<QualitativeLevel>("moderate");
  const [result, setResult] = useState<BusinessValuationResult>();
  const [error, setError] = useState("");
  const model = getBusinessValuationModel(activityId);

  function updateFinancial(name: keyof FinancialValues, value: string) {
    setFinancials((current) => ({ ...current, [name]: value }));
  }

  function handleFinancialSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const hasValidFinancials = model === "cabinet"
      ? isPositive(financials.revenue) && isPositive(financials.ebe)
      : model === "arr" || model === "software"
        ? isPositive(financials.arr) && isFiniteNumber(financials.growth) && isPercentage(financials.churn) && isPercentage(financials.grossMargin)
        : isPositive(financials.ebe);
    if (!hasValidFinancials) {
      setError("Merci de renseigner les chiffres demandés.");
      return;
    }
    setError("");
    setStep(3);
  }

  function calculate() {
    const input = buildInput();
    try {
      const nextResult = calculateBusinessValuation(input);
      setResult(nextResult);
      setError("");
      setStep(4);
    } catch (calculationError) {
      setError(calculationError instanceof Error ? calculationError.message : "Impossible de calculer cette estimation.");
    }
  }

  function buildInput(): BusinessValuationInput {
    return {
      activityId,
      revenue: optionalNumber(financials.revenue),
      ebe: optionalNumber(financials.ebe),
      arr: optionalNumber(financials.arr),
      growth: optionalNumber(financials.growth),
      churn: optionalNumber(financials.churn),
      grossMargin: optionalNumber(financials.grossMargin),
      recurrence,
      concentration,
      autonomy,
      dependence,
    };
  }

  return (
    <DirectoryDetailDialogShell ariaLabel="Estimer mon entreprise" maxWidthClassName="max-w-4xl" onClose={onClose}>
      <div className="mx-auto max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-dema-forest">{step < 4 ? `Étape ${step} sur 3` : "Première estimation"}</p>
        {step === 1 ? (
          <form className="mt-3" onSubmit={(event) => { event.preventDefault(); setStep(2); }}>
            <h2 className="text-3xl font-medium tracking-[-0.04em] sm:text-5xl">Quelle est votre activité ?</h2>
            <p className="mt-4 text-sm leading-6 text-dema-muted">L’activité détermine les chiffres demandés et la méthode utilisée.</p>
            <label className="mt-8 block text-sm font-medium">Votre activité
              <select className={inputClassName} value={activityId} onChange={(event) => { setActivityId(event.target.value as BusinessActivityId); setFinancials(emptyFinancialValues); }}>
                {["Entreprises de services", "Logiciels"].map((group) => <optgroup key={group} label={group}>{businessActivityOptions.filter((option) => option.group === group).map((option) => <option key={option.id} value={option.id}>{option.label}</option>)}</optgroup>)}
              </select>
            </label>
            <button className={`${primaryButtonClassName} mt-8 w-full sm:w-auto`} type="submit">Continuer</button>
          </form>
        ) : null}

        {step === 2 ? (
          <form className="mt-3" onSubmit={handleFinancialSubmit}>
            <h2 className="text-3xl font-medium tracking-[-0.04em] sm:text-5xl">Vos chiffres essentiels.</h2>
            <p className="mt-4 text-sm leading-6 text-dema-muted">Utilisez les montants annuels les plus récents, hors taxes.</p>
            <div className="mt-8 grid gap-5 sm:grid-cols-2">
              {model === "cabinet" ? <MoneyField label="Chiffre d’affaires annuel" name="revenue" value={financials.revenue} onChange={updateFinancial} /> : null}
              {model === "ebe" || model === "hybrid" || model === "cabinet" ? <MoneyField label="Excédent brut d’exploitation annuel (EBE)" name="ebe" value={financials.ebe} onChange={updateFinancial} /> : null}
              {model === "arr" || model === "software" ? (
                <>
                  <MoneyField label="Revenu annuel récurrent (ARR)" name="arr" value={financials.arr} onChange={updateFinancial} />
                  <PercentField label="Croissance annuelle" name="growth" value={financials.growth} onChange={updateFinancial} min={-100} />
                  <PercentField label="Churn annuel" name="churn" value={financials.churn} onChange={updateFinancial} />
                  <PercentField label="Marge brute" name="grossMargin" value={financials.grossMargin} onChange={updateFinancial} />
                </>
              ) : null}
            </div>
            {error ? <p className="mt-4 text-sm font-medium text-red-700" role="alert">{error}</p> : null}
            <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:items-center"><button className={secondaryButtonClassName} type="button" onClick={() => setStep(1)}><ArrowLeft className="h-4 w-4" aria-hidden="true" />Retour</button><button className={`${primaryButtonClassName} sm:ml-auto`} type="submit">Continuer</button></div>
          </form>
        ) : null}

        {step === 3 ? (
          <div className="mt-3">
            <h2 className="text-3xl font-medium tracking-[-0.04em] sm:text-5xl">Votre organisation.</h2>
            <p className="mt-4 text-sm leading-6 text-dema-muted">Ces critères ajustent la fourchette sans remplacer l’analyse détaillée de l’entreprise.</p>
            <div className="mt-8 grid gap-5 sm:grid-cols-2">
              <LevelField label="Récurrence des revenus" value={recurrence} onChange={setRecurrence} />
              <LevelField label="Concentration des clients" value={concentration} onChange={setConcentration} />
              <LevelField label="Autonomie de l’équipe" value={autonomy} onChange={setAutonomy} />
              <LevelField label="Dépendance au dirigeant" value={dependence} onChange={setDependence} />
            </div>
            {error ? <p className="mt-4 text-sm font-medium text-red-700" role="alert">{error}</p> : null}
            <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:items-center"><button className={secondaryButtonClassName} type="button" onClick={() => setStep(2)}><ArrowLeft className="h-4 w-4" aria-hidden="true" />Retour</button><button className={`${primaryButtonClassName} sm:ml-auto`} type="button" onClick={calculate}>Voir mon estimation</button></div>
          </div>
        ) : null}

        {step === 4 && result ? (
          <div className="mt-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-dema-sage text-dema-forest"><TrendingUp className="h-5 w-5" aria-hidden="true" /></span>
            <h2 className="mt-5 text-3xl font-medium tracking-[-0.04em] sm:text-5xl">Une première fourchette indicative.</h2>
            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              <ResultValue label="Fourchette basse" value={result.low} />
              <ResultValue label="Estimation centrale" value={result.central} emphasized />
              <ResultValue label="Fourchette haute" value={result.high} />
            </div>
            <div className="mt-7 rounded-2xl border border-dema-line p-5">
              <p className="text-sm font-medium">Calcul de l’estimation</p>
              <p className="mt-2 text-sm leading-6 text-dema-muted">{result.methodLabel}</p>
              <ul className="mt-4 space-y-2">{result.factors.map((factor) => <li key={factor} className="flex gap-2 text-sm leading-6 text-dema-muted"><Check className="mt-1 h-4 w-4 shrink-0 text-dema-forest" aria-hidden="true" />{factor}</li>)}</ul>
            </div>
            <p className="mt-5 text-xs leading-5 text-dema-muted">Cette estimation constitue un ordre de grandeur. Le prix final dépend notamment de la trésorerie, des dettes, des risques et des conditions de la transmission.</p>
            <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:items-center"><button className={secondaryButtonClassName} type="button" onClick={() => setStep(1)}>Modifier mes réponses</button><button className={`${primaryButtonClassName} sm:ml-auto`} type="button" onClick={() => onContinue(buildInput(), result)}>Transmettre mon entreprise</button></div>
          </div>
        ) : null}
      </div>
    </DirectoryDetailDialogShell>
  );
}

function MoneyField({ label, name, value, onChange }: { label: string; name: keyof FinancialValues; value: string; onChange: (name: keyof FinancialValues, value: string) => void }) {
  return <label className="block text-sm font-medium">{label}<span className="relative mt-2 block"><input className={`${inputClassName} mt-0 pr-12`} name={name} type="number" inputMode="numeric" min="0" step="1000" value={value} onChange={(event) => onChange(name, event.target.value)} required /><span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sm text-dema-muted">€</span></span></label>;
}

function PercentField({ label, name, value, onChange, min = 0 }: { label: string; name: keyof FinancialValues; value: string; onChange: (name: keyof FinancialValues, value: string) => void; min?: number }) {
  return <label className="block text-sm font-medium">{label}<span className="relative mt-2 block"><input className={`${inputClassName} mt-0 pr-12`} name={name} type="number" inputMode="decimal" min={min} max="100" step="0.1" value={value} onChange={(event) => onChange(name, event.target.value)} required /><span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sm text-dema-muted">%</span></span></label>;
}

function LevelField({ label, value, onChange }: { label: string; value: QualitativeLevel; onChange: (value: QualitativeLevel) => void }) {
  return <label className="block text-sm font-medium">{label}<select className={inputClassName} value={value} onChange={(event) => onChange(event.target.value as QualitativeLevel)}><option value="very_high">Très élevée</option><option value="high">Élevée</option><option value="moderate">Modérée</option><option value="low">Faible</option></select></label>;
}

function ResultValue({ label, value, emphasized = false }: { label: string; value: number; emphasized?: boolean }) {
  return <div className={`rounded-2xl border p-5 ${emphasized ? "border-dema-forest bg-dema-sage/55" : "border-dema-line bg-dema-paper"}`}><span className="block text-xs text-dema-muted">{label}</span><strong className="mt-2 block text-xl font-medium tracking-[-0.03em]">{formatCurrency(value)}</strong></div>;
}

function optionalNumber(value: string) {
  if (value.trim() === "") return undefined;
  const number = Number(value);
  return Number.isFinite(number) ? number : undefined;
}

function isFiniteNumber(value: string) {
  return value.trim() !== "" && Number.isFinite(Number(value));
}

function isPositive(value: string) {
  return isFiniteNumber(value) && Number(value) > 0;
}

function isPercentage(value: string) {
  return isFiniteNumber(value) && Number(value) >= 0 && Number(value) <= 100;
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(value);
}
