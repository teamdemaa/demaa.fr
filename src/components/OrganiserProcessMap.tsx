import type { AcademyProcessStep } from "@/lib/academy-course-content";

type OrganiserProcessMapProps = {
  steps: readonly AcademyProcessStep[];
  compact?: boolean;
};

function Arrow({ direction }: { direction: "right" | "down" | "left" }) {
  return (
    <span
      aria-hidden="true"
      className="flex items-center justify-center text-dema-forest/55"
    >
      {direction === "right" ? "→" : direction === "left" ? "←" : "↓"}
    </span>
  );
}

export default function OrganiserProcessMap({
  steps,
  compact = false,
}: OrganiserProcessMapProps) {
  if (steps.length !== 6) return null;

  const ariaLabel = `Processus en six étapes : ${steps.map((step) => step.label).join(", ")}.`;

  if (compact) {
    const compactCardClassName =
      "flex h-full min-h-0 items-center justify-center rounded-[0.45rem] border border-[#C7D4CB] bg-white px-1.5 text-center text-[0.58rem] font-medium leading-[1.15] text-[#2D3B33] sm:px-2 sm:text-[0.67rem]";

    return (
      <div
        className="flex h-full items-center rounded-[1.25rem] bg-[#F0F4F1] p-3 sm:p-4"
        role="img"
        aria-label={ariaLabel}
      >
        <div
          className="grid aspect-[3.3/1] w-full grid-cols-[minmax(0,1fr)_0.75rem_minmax(0,1fr)_0.75rem_minmax(0,1fr)] grid-rows-[minmax(0,1fr)_0.75rem_minmax(0,1fr)] items-stretch gap-x-0 gap-y-1 sm:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)_auto_minmax(0,1fr)]"
          aria-hidden="true"
        >
          <div className={compactCardClassName}>{steps[0].label}</div>
          <Arrow direction="right" />
          <div className={compactCardClassName}>{steps[1].label}</div>
          <Arrow direction="right" />
          <div className={compactCardClassName}>{steps[2].label}</div>

          <div />
          <div />
          <div />
          <div />
          <Arrow direction="down" />

          <div className={compactCardClassName}>{steps[5].label}</div>
          <Arrow direction="left" />
          <div className={compactCardClassName}>{steps[4].label}</div>
          <Arrow direction="left" />
          <div className={compactCardClassName}>{steps[3].label}</div>
        </div>
      </div>
    );
  }

  const cardClassName =
    "flex min-h-[6.1rem] items-center justify-center rounded-[1rem] border border-[#C7D4CB] bg-white px-4 text-center text-sm font-medium leading-snug text-[#2D3B33] sm:min-h-[7rem] sm:text-base";

  return (
    <div
      className="rounded-[1.5rem] bg-[#F0F4F1] p-4 sm:p-6"
      role="img"
      aria-label={ariaLabel}
    >
      <div className="space-y-2 sm:hidden" aria-hidden="true">
        {steps.map((step, index) => (
          <div key={step.label}>
            <div className={cardClassName}>{step.label}</div>
            {index < steps.length - 1 ? (
              <div className="h-6 text-lg"><Arrow direction="down" /></div>
            ) : null}
          </div>
        ))}
      </div>

      <div
        className="hidden grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-x-3 gap-y-3 sm:grid"
        aria-hidden="true"
      >
        <div className={cardClassName}>{steps[0].label}</div>
        <Arrow direction="right" />
        <div className={cardClassName}>{steps[1].label}</div>
        <Arrow direction="right" />
        <div className={cardClassName}>{steps[2].label}</div>

        <div />
        <div />
        <div />
        <div />
        <div className="h-8 text-xl">
          <Arrow direction="down" />
        </div>

        <div className={cardClassName}>{steps[5].label}</div>
        <Arrow direction="left" />
        <div className={cardClassName}>{steps[4].label}</div>
        <Arrow direction="left" />
        <div className={cardClassName}>{steps[3].label}</div>
      </div>
    </div>
  );
}
