"use client";

import { Check, ChevronDown, Clock3 } from "lucide-react";
import type { ActionPlan, ActionPlanAction } from "@/lib/action-plan-contract";

const strategySections = [
  {
    key: "alignment" as const,
    label: "Alignement",
    questions: [
      ["L’entreprise que vous voulez construire", "desiredCompany" as const],
      ["Vos limites et vos valeurs", "boundariesAndValues" as const],
      ["Vos priorités et vos renoncements", "prioritiesAndTradeoffs" as const],
    ],
  },
  {
    key: "positioning" as const,
    label: "Positionnement",
    questions: [
      ["Le client précis", "preciseCustomer" as const],
      ["Le problème important", "importantProblem" as const],
      ["Les preuves et les alternatives", "evidenceAndAlternatives" as const],
    ],
  },
  {
    key: "offer" as const,
    label: "Offre",
    questions: [
      ["Le résultat proposé", "promisedOutcome" as const],
      ["Le périmètre", "scope" as const],
      ["Le prix, l’engagement et le risque", "priceCommitmentAndRisk" as const],
    ],
  },
  {
    key: "promotion" as const,
    label: "Promotion",
    questions: [
      ["Attirer", "attract" as const],
      ["Faciliter l’achat", "facilitatePurchase" as const],
      ["Fidéliser et renforcer", "retainAndStrengthen" as const],
    ],
  },
] as const;

const strategyPillarLabels: Record<ActionPlanAction["strategyPillar"], string> = {
  alignement: "Alignement",
  positionnement: "Positionnement",
  offre: "Offre",
  promotion: "Promotion",
};

function ActionCard({ action, index }: { action: ActionPlanAction; index: number }) {
  return (
    <details className="demaa-accordion group" open={index === 0}>
      <summary className="flex min-h-20 cursor-pointer items-center gap-4 px-5 py-4 sm:px-6">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-dema-sage text-xs font-semibold text-dema-forest">
          {String(index + 1).padStart(2, "0")}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-base font-medium leading-snug text-brand-blue">
            {action.title}
          </span>
          <span className="mt-1 flex items-center gap-1.5 text-xs text-dema-muted">
            <Clock3 className="h-3.5 w-3.5" aria-hidden="true" />
            {action.estimatedMinutes} min · {action.channelOrTool} · {strategyPillarLabels[action.strategyPillar]}
          </span>
        </span>
        <ChevronDown className="demaa-accordion-chevron h-4 w-4 shrink-0 text-dema-muted transition-transform" aria-hidden="true" />
      </summary>
      <div className="demaa-accordion-content border-t border-dema-line px-5 pb-6 pt-5 sm:px-6">
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.12em] text-dema-muted">Objectif</p>
            <p className="mt-2 text-sm leading-relaxed text-brand-blue">{action.objective}</p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.12em] text-dema-muted">Pourquoi maintenant</p>
            <p className="mt-2 text-sm leading-relaxed text-brand-blue">{action.why}</p>
          </div>
        </div>

        <div className="mt-5 rounded-xl bg-dema-sage/55 p-4">
          <p className="text-xs font-medium uppercase tracking-[0.12em] text-dema-forest">Étapes</p>
          <ol className="mt-3 space-y-2.5">
            {action.steps.map((step, stepIndex) => (
              <li key={`${action.id}-${stepIndex}`} className="flex gap-3 text-sm leading-relaxed text-brand-blue">
                <span className="font-mono text-xs text-dema-forest">{stepIndex + 1}.</span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </div>

        {action.readyToUse ? (
          <div className="mt-5 rounded-xl border border-dema-forest/12 bg-dema-paper p-4">
            <p className="text-xs font-medium uppercase tracking-[0.12em] text-dema-forest">
              {action.readyToUse.label}
            </p>
            <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-brand-blue">
              {action.readyToUse.content}
            </p>
          </div>
        ) : null}

        <dl className="mt-5 grid gap-4 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-xs text-dema-muted">Livrable</dt>
            <dd className="mt-1 text-brand-blue">{action.deliverable}</dd>
          </div>
          <div>
            <dt className="text-xs text-dema-muted">Réussite</dt>
            <dd className="mt-1 text-brand-blue">{action.successCriterion}</dd>
          </div>
        </dl>
        <p className="mt-5 flex gap-2 border-t border-dema-line pt-4 text-xs leading-relaxed text-dema-muted">
          <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-dema-forest" aria-hidden="true" />
          {action.ethicalGuardrail}
        </p>
      </div>
    </details>
  );
}

export default function ActionPlanResult({ plan }: { plan: ActionPlan }) {
  return (
    <div className="space-y-14">
      <section aria-labelledby="weekly-actions-title">
        <p className="text-xs font-medium uppercase tracking-[0.14em] text-dema-forest">Votre priorité</p>
        <h2 id="weekly-actions-title" className="mt-2 text-3xl font-light tracking-[-0.04em] text-brand-blue sm:text-4xl">
          À faire cette semaine
        </h2>
        <p className="mt-4 max-w-3xl text-base leading-relaxed text-dema-muted">{plan.summary}</p>
        <div className="mt-7 space-y-3">
          {plan.weeklyActions.map((action, index) => (
            <ActionCard key={action.id} action={action} index={index} />
          ))}
        </div>
      </section>

      <section aria-labelledby="strategy-title">
        <p className="text-xs font-medium uppercase tracking-[0.14em] text-dema-forest">Prendre de la hauteur</p>
        <h2 id="strategy-title" className="mt-2 text-3xl font-light tracking-[-0.04em] text-brand-blue sm:text-4xl">
          Stratégie
        </h2>
        <div className="mt-7 space-y-3">
          {strategySections.map((section, index) => {
            const pillar = plan.strategy[section.key];
            const pillarFields = pillar as unknown as Readonly<Record<string, string>>;
            return (
              <details key={section.key} className="demaa-accordion" open={index === 0}>
                <summary className="flex min-h-20 cursor-pointer items-center gap-4 px-5 py-4 sm:px-6">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-dema-forest/15 text-xs font-semibold text-dema-forest">
                    {index + 1}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-base font-medium text-brand-blue">{section.label}</span>
                    <span className="mt-1 block text-sm text-dema-muted">{pillar.headline}</span>
                  </span>
                  <ChevronDown className="demaa-accordion-chevron h-4 w-4 shrink-0 text-dema-muted transition-transform" aria-hidden="true" />
                </summary>
                <div className="demaa-accordion-content space-y-5 border-t border-dema-line px-5 pb-6 pt-5 sm:px-6">
                  {section.questions.map(([label, key]) => (
                    <div key={key}>
                      <h3 className="text-xs font-medium uppercase tracking-[0.12em] text-dema-muted">{label}</h3>
                      <p className="mt-2 text-sm leading-relaxed text-brand-blue">{pillarFields[key]}</p>
                    </div>
                  ))}
                </div>
              </details>
            );
          })}
        </div>
      </section>

      {plan.assumptions.length > 0 ? (
        <section className="border-t border-dema-line pt-7" aria-labelledby="assumptions-title">
          <h2 id="assumptions-title" className="text-sm font-medium text-brand-blue">Hypothèses à vérifier</h2>
          <ul className="mt-3 space-y-2 text-sm leading-relaxed text-dema-muted">
            {plan.assumptions.map((assumption) => (
              <li key={assumption}>• {assumption}</li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
