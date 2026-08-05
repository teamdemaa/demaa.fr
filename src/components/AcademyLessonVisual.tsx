import Image from "next/image";
import type { AcademyLesson } from "@/lib/academy-course-content";

function text(value: unknown) {
  return typeof value === "string" || typeof value === "number" ? String(value) : "";
}

function records(value: unknown): Array<Record<string, unknown>> {
  return Array.isArray(value)
    ? value.filter(
        (item): item is Record<string, unknown> =>
          typeof item === "object" && item !== null && !Array.isArray(item),
      )
    : [];
}

function strings(value: unknown): string[] {
  return Array.isArray(value) ? value.map(text).filter(Boolean) : [];
}

function Arrow() {
  return <div className="ml-[0.7rem] h-5 w-px bg-dema-forest/25" aria-hidden="true" />;
}

function ComparisonVisual({ data }: { data: Record<string, unknown> }) {
  return (
    <div>
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-dema-muted">
          {text(data.leftLabel)}
        </p>
        <p className="mt-1.5 text-lg font-semibold leading-relaxed text-brand-blue">
          {text(data.leftText)}
        </p>
      </div>

      <div className="my-5 flex items-center gap-3" aria-hidden="true">
        <div className="h-px flex-1 bg-dema-forest/15" />
        <span className="text-lg font-semibold text-dema-forest">{text(data.operator) || "≠"}</span>
        <div className="h-px flex-1 bg-dema-forest/15" />
      </div>

      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-dema-forest">
          {text(data.rightLabel)}
        </p>
        <p className="mt-1.5 text-lg font-semibold leading-relaxed text-brand-blue">
          {text(data.rightText)}
        </p>
      </div>
    </div>
  );
}

function TimelineVisual({ data }: { data: Record<string, unknown> }) {
  const steps = records(data.steps);
  const duringDelay = Array.isArray(data.duringDelay) ? data.duringDelay.map(text).filter(Boolean) : [];

  return (
    <div>
      {steps.map((step, index) => (
        <div key={`${text(step.label)}-${index}`}>
          <div className="grid grid-cols-[1.5rem_1fr] gap-3">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-dema-forest text-xs font-semibold text-white">
              {index + 1}
            </span>
            <div>
              <p className="font-semibold text-brand-blue">{text(step.label)}</p>
              {text(step.timing) ? <p className="mt-0.5 text-sm text-dema-muted">{text(step.timing)}</p> : null}
            </div>
          </div>
          {index < steps.length - 1 ? <Arrow /> : null}
        </div>
      ))}

      {duringDelay.length ? (
        <div className="mt-6 border-t border-dema-forest/15 pt-5">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-dema-muted">
            Pendant l’attente, il faut quand même payer
          </p>
          <p className="mt-2 font-semibold leading-relaxed text-brand-blue">{duringDelay.join(" · ")}</p>
        </div>
      ) : null}

      {text(data.newsletterFrequency) ? (
        <div className="mt-6 border-t border-dema-forest/15 pt-5">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-dema-muted">Pour garder le lien</p>
          <p className="mt-1 text-xl font-semibold text-dema-forest">
            {text(data.newsletterFrequency)} · newsletters utiles
          </p>
        </div>
      ) : null}
    </div>
  );
}

function CalculationVisual({ data }: { data: Record<string, unknown> }) {
  const result = (data.result ?? {}) as Record<string, unknown>;
  const cash = (data.cash ?? {}) as Record<string, unknown>;

  if (text(data.floorPrice)) {
    const costs = [
      ["Achats directs", data.directCost],
      ["Autres coûts variables", data.otherVariableCosts],
      ["Temps de travail", data.time],
      ["Part des charges fixes", data.fixedCostsShare],
    ].filter((entry) => text(entry[1]));

    return (
      <div>
        <div className="divide-y divide-dema-forest/15">
          {costs.map(([label, value]) => (
            <p key={text(label)} className="flex items-baseline justify-between gap-4 py-3 first:pt-0">
              <span className="text-sm text-brand-blue">{text(label)}</span>
              <strong className="text-brand-blue">{text(value)}</strong>
            </p>
          ))}
        </div>
        <div className="mt-4 border-t border-dema-forest/20 pt-4">
          <p className="text-sm text-dema-muted">Avec une commission de {text(data.commissionRate)}</p>
          <p className="mt-1 text-sm font-medium text-brand-blue">{text(data.formula)}</p>
          <p className="mt-4 text-xs font-semibold uppercase tracking-[0.12em] text-dema-muted">Prix minimum</p>
          <p className="mt-1 text-3xl font-semibold text-dema-forest">{text(data.floorPrice)}</p>
        </div>
      </div>
    );
  }

  if (text(data.breakEvenRevenue)) {
    return (
      <div>
        <p className="text-sm text-brand-blue">Charges fixes : <strong>{text(data.fixedCosts)}</strong></p>
        <p className="mt-2 text-sm text-brand-blue">Taux de marge : <strong>{text(data.marginRate)}</strong></p>
        <div className="my-5 border-t border-dema-forest/15" />
        <p className="text-sm font-medium text-brand-blue">{text(data.formula)}</p>
        <p className="mt-4 text-xs font-semibold uppercase tracking-[0.12em] text-dema-muted">Minimum à vendre</p>
        <p className="mt-1 text-3xl font-semibold text-dema-forest">{text(data.breakEvenRevenue)}</p>
      </div>
    );
  }

  if (text(data.revenue)) {
    const rows = [
      ["Ventes", data.revenue],
      ["− Coûts variables", data.variableCosts],
      ["= Marge", data.margin],
      ["− Charges fixes", data.fixedCosts],
    ];

    return (
      <div>
        <div className="divide-y divide-dema-forest/15">
          {rows.map(([label, value]) => (
            <p key={text(label)} className="flex items-baseline justify-between gap-4 py-3 first:pt-0">
              <span className="text-sm text-brand-blue">{text(label)}</span>
              <strong className="text-brand-blue">{text(value)}</strong>
            </p>
          ))}
        </div>
        <div className="mt-4 border-t border-dema-forest/20 pt-4">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-dema-muted">Bénéfice réel</p>
          <p className="mt-1 text-3xl font-semibold text-dema-forest">{text(data.profit)}</p>
        </div>
      </div>
    );
  }

  const charges = strings(data.charges);
  if (charges.length) {
    return (
      <div>
        <p className="text-xl font-semibold leading-relaxed text-brand-blue">{text(data.formula)}</p>
        <div className="mt-5 border-t border-dema-forest/15 pt-4">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-dema-muted">Toutes les charges comprennent</p>
          <p className="mt-2 font-medium leading-relaxed text-brand-blue">{charges.join(" · ")}</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-dema-muted">
        {text(result.label) || "Résultat de la mission"}
      </p>
      <p className="mt-1 text-3xl font-semibold text-dema-forest">{text(result.value)}</p>

      <div className="my-6 border-t border-dema-forest/15" />

      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-dema-muted">
        Mais avant le paiement du client
      </p>
      <div className="mt-4 space-y-3">
        <p className="flex items-baseline justify-between gap-4 text-brand-blue">
          <span>Disponible sur le compte</span>
          <strong className="text-lg">{text(cash.available)}</strong>
        </p>
        <p className="flex items-baseline justify-between gap-4 text-brand-blue">
          <span>À payer avant l’encaissement</span>
          <strong className="text-lg">− {text(cash.payments)}</strong>
        </p>
        <p className="flex items-baseline justify-between gap-4 border-t border-dema-forest/20 pt-3 text-brand-blue">
          <span className="font-semibold">Solde minimum prévu</span>
          <strong className="text-2xl text-dema-forest">{text(cash.lowPoint)}</strong>
        </p>
      </div>
    </div>
  );
}

function MetricsVisual({ data }: { data: Record<string, unknown> }) {
  const inputs = strings(data.inputs);
  const fields = strings(data.fields);
  const indicators = records(data.indicators);
  const correctionCauses = strings(data.correctionCauses);

  if (text(data.sellingPrice)) {
    return (
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-dema-muted">L’offre</p>
        <p className="mt-1 text-lg font-semibold text-brand-blue">{text(data.offer)}</p>
        <div className="mt-5 divide-y divide-dema-forest/15 border-t border-dema-forest/15 pt-2">
          <p className="flex items-baseline justify-between gap-4 py-2.5 text-brand-blue">
            <span>Prix de vente</span>
            <strong className="text-lg">{text(data.sellingPrice)}</strong>
          </p>
          <p className="flex items-baseline justify-between gap-4 py-2.5 text-brand-blue">
            <span>− Coûts directs</span>
            <strong className="text-lg">{text(data.directCosts)}</strong>
          </p>
          <p className="flex items-baseline justify-between gap-4 py-2.5 text-brand-blue">
            <span>= Disponible avant publicité et charges fixes</span>
            <strong className="text-lg">{text(data.contributionBeforeAds)}</strong>
          </p>
        </div>
        <div className="mt-4 border-t border-dema-forest/20 pt-4">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-dema-muted">Acquisition maximale retenue</p>
          <p className="mt-1 text-3xl font-semibold text-dema-forest">{text(data.maximumAcquisitionCost)}</p>
        </div>
      </div>
    );
  }

  if (fields.length) {
    return (
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-dema-muted">Les informations à avoir</p>
        <div className="mt-4 divide-y divide-dema-forest/15">
          {fields.map((field, index) => (
            <div key={field} className="grid grid-cols-[1.5rem_1fr] gap-3 py-3 first:pt-0 last:pb-0">
              <span className="text-sm font-semibold text-dema-forest">{index + 1}</span>
              <p className="font-semibold text-brand-blue">{field}</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (indicators.length) {
    return (
      <div>
        {text(data.expected) ? (
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-dema-muted">Résultat attendu</p>
            <p className="mt-1 text-lg font-semibold text-brand-blue">{text(data.expected)}</p>
          </div>
        ) : null}
        <div className="mt-5 divide-y divide-dema-forest/15 border-t border-dema-forest/15 pt-2">
          {indicators.map((indicator) => (
            <p key={text(indicator.label)} className="flex items-baseline justify-between gap-4 py-2.5">
              <span className="text-sm text-brand-blue">{text(indicator.label)}</span>
              <strong className="text-lg text-dema-forest">{text(indicator.value)}</strong>
            </p>
          ))}
        </div>
        {correctionCauses.length ? (
          <p className="mt-4 border-t border-dema-forest/15 pt-4 text-sm leading-relaxed text-dema-muted">
            Si ça dérape : {correctionCauses.join(" · ")}
          </p>
        ) : null}
      </div>
    );
  }

  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-dema-muted">
        Projection sur {text(data.horizon)}
      </p>
      <div className="mt-4">
        {inputs.map((input, index) => (
          <div key={input}>
            <div className="grid grid-cols-[1.5rem_1fr] gap-3">
              <span className="pt-0.5 text-sm font-semibold text-dema-forest">{index + 1}</span>
              <p className="font-semibold text-brand-blue">{input}</p>
            </div>
            <Arrow />
          </div>
        ))}
        <div className="grid grid-cols-[1.5rem_1fr] gap-3">
          <span className="text-lg text-dema-forest" aria-hidden="true">↓</span>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-dema-muted">À repérer</p>
            <p className="mt-1 text-xl font-semibold text-dema-forest">{text(data.output)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function PipelineVisual({ data }: { data: Record<string, unknown> }) {
  const stepRecords = records(data.steps);
  const stepLabels = strings(data.steps);
  const channels = strings(data.channels);
  const nextActions = strings(data.nextActions);
  const qualification = strings(data.qualification);
  const stages = strings(data.stages);

  if (channels.length && nextActions.length) {
    return (
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-dema-muted">Pour chaque canal, une seule suite</p>
        <div className="mt-4 divide-y divide-dema-forest/15">
          {channels.map((channel, index) => (
            <div key={channel} className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 py-3 first:pt-0 last:pb-0">
              <p className="font-semibold text-brand-blue">{channel}</p>
              <span className="text-dema-forest" aria-hidden="true">→</span>
              <p className="text-sm text-brand-blue">{nextActions[index]}</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (qualification.length && stages.length) {
    return (
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-dema-muted">Vérifier avant d’avancer</p>
        <p className="mt-2 font-medium leading-relaxed text-brand-blue">{qualification.join(" · ")}</p>
        <div className="mt-5 border-t border-dema-forest/15 pt-4">
          {stages.map((stage, index) => (
            <div key={stage}>
              <div className="grid grid-cols-[1.5rem_1fr] gap-3">
                <span className="text-sm font-semibold text-dema-forest">{index + 1}</span>
                <p className="font-semibold text-brand-blue">{stage}</p>
              </div>
              {index < stages.length - 1 ? <Arrow /> : null}
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (stepRecords.length) {
    const maxValue = Math.max(...stepRecords.map((step) => Number(step.value) || 0), 1);
    return (
      <div>
        <div className="space-y-3">
          {stepRecords.map((step, index) => {
            const value = Number(step.value) || 0;
            return (
              <div key={`${text(step.label)}-${index}`}>
                <div className="flex items-baseline justify-between gap-4">
                  <p className="text-sm font-semibold text-brand-blue">{text(step.label)}</p>
                  <strong className="text-lg text-dema-forest">{text(step.value)}</strong>
                </div>
                <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-white/70">
                  <div className="h-full rounded-full bg-dema-forest/55" style={{ width: `${Math.max((value / maxValue) * 100, 8)}%` }} />
                </div>
              </div>
            );
          })}
        </div>
        {text(data.weeklyReviewMinutes) ? (
          <p className="mt-5 border-t border-dema-forest/15 pt-4 text-sm font-medium text-brand-blue">
            Revue chaque semaine : {text(data.weeklyReviewMinutes)} minutes
          </p>
        ) : null}
        {text(data.dealValue) ? (
          <p className="mt-5 border-t border-dema-forest/15 pt-4 text-sm font-medium text-brand-blue">
            Valeur moyenne : {text(data.dealValue)}
          </p>
        ) : null}
      </div>
    );
  }

  return (
    <div>
      {stepLabels.map((step, index) => (
        <div key={step}>
          <div className="grid grid-cols-[1.5rem_1fr] gap-3">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-dema-forest text-xs font-semibold text-white">
              {index + 1}
            </span>
            <p className="font-semibold text-brand-blue">{step}</p>
          </div>
          {index < stepLabels.length - 1 ? <Arrow /> : null}
        </div>
      ))}
    </div>
  );
}

function StepsVisual({ data }: { data: Record<string, unknown> }) {
  const steps = records(data.steps);
  const alerts = strings(data.alerts);

  return (
    <div>
      <div className="divide-y divide-dema-forest/15">
        {steps.map((step, index) => (
          <div key={`${text(step.title)}-${index}`} className="grid grid-cols-[2rem_1fr] gap-3 py-4 first:pt-0 last:pb-0">
            <span className="text-sm font-semibold text-dema-forest">
              {text(step.number) || String(index + 1).padStart(2, "0")}
            </span>
            <div>
              <p className="font-semibold text-brand-blue">{text(step.title) || text(step.label)}</p>
              {text(step.detail) ? <p className="mt-1 text-sm leading-relaxed text-dema-muted">{text(step.detail)}</p> : null}
            </div>
          </div>
        ))}
      </div>
      {alerts.length ? (
        <div className="mt-5 border-t border-dema-forest/15 pt-4">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-dema-muted">Alerter immédiatement si</p>
          <p className="mt-2 text-sm font-medium leading-relaxed text-brand-blue">{alerts.join(" · ")}</p>
        </div>
      ) : null}
    </div>
  );
}

function FallbackVisual({ data }: { data: Record<string, unknown> }) {
  return (
    <div className="divide-y divide-dema-forest/15">
      {Object.entries(data).map(([key, value]) => (
        <div key={key} className="py-3 first:pt-0 last:pb-0">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-dema-muted">{key}</p>
          <p className="mt-1 font-semibold leading-relaxed text-brand-blue">
            {Array.isArray(value) ? value.map(text).filter(Boolean).join(" · ") : text(value)}
          </p>
        </div>
      ))}
    </div>
  );
}

function BrandCaseVisual({ data }: { data: Record<string, unknown> }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-dema-muted">
        {text(data.brand)} · {text(data.business)}
      </p>
      <div className="mt-5 flex items-center gap-4">
        <div>
          <p className="text-3xl font-semibold text-dema-forest">{text(data.monthsSinceLaunch)} mois</p>
          <p className="mt-1 text-sm text-dema-muted">depuis le lancement</p>
        </div>
        <span className="text-xl text-dema-forest/45" aria-hidden="true">→</span>
        <div>
          <p className="text-3xl font-semibold text-dema-forest">{text(data.sales)} ventes</p>
          <p className="mt-1 text-sm text-dema-muted">au total</p>
        </div>
      </div>
      <p className="mt-5 border-t border-dema-forest/15 pt-4 font-medium leading-relaxed text-brand-blue">
        {text(data.problem)}
      </p>
    </div>
  );
}

function StoryVisual({ data }: { data: Record<string, unknown> }) {
  const panel = Math.min(Math.max(Number(data.panel) || 1, 1), 4);
  const isRight = panel === 2 || panel === 4;
  const isBottom = panel === 3 || panel === 4;

  return (
    <figure className="overflow-hidden rounded-[1rem] border border-dema-forest/10 bg-[#F1F3F0]">
      <div className="relative aspect-[3/2] overflow-hidden">
        <Image
          src={text(data.image)}
          alt={text(data.alt)}
          width={1536}
          height={1024}
          sizes="(max-width: 767px) 100vw, 42rem"
          className="absolute max-w-none"
          style={{
            width: "200%",
            height: "auto",
            left: isRight ? "-100%" : "0",
            top: isBottom ? "-100%" : "0",
          }}
        />
      </div>
    </figure>
  );
}

export default function AcademyLessonVisual({ lesson }: { lesson: AcademyLesson }) {
  if (lesson.visual.type === "comparison") return <ComparisonVisual data={lesson.visual.data} />;
  if (lesson.visual.type === "timeline") return <TimelineVisual data={lesson.visual.data} />;
  if (lesson.visual.type === "calculation") return <CalculationVisual data={lesson.visual.data} />;
  if (lesson.visual.type === "metrics") return <MetricsVisual data={lesson.visual.data} />;
  if (lesson.visual.type === "steps") return <StepsVisual data={lesson.visual.data} />;
  if (lesson.visual.type === "pipeline") return <PipelineVisual data={lesson.visual.data} />;
  if (lesson.visual.type === "brand-case") return <BrandCaseVisual data={lesson.visual.data} />;
  if (lesson.visual.type === "story") return <StoryVisual data={lesson.visual.data} />;

  return <FallbackVisual data={lesson.visual.data} />;
}
