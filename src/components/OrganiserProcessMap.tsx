type OrganiserProcessMapProps = {
  steps: readonly Readonly<{ label: string }>[];
  compact?: boolean;
};

function Arrow({ direction }: { direction: "right" | "down" | "left" }) {
  return (
    <span
      aria-hidden="true"
      className="flex shrink-0 items-center justify-center text-dema-forest/45"
    >
      {direction === "right" ? "→" : direction === "left" ? "←" : "↓"}
    </span>
  );
}

function splitIntoRows(
  steps: readonly Readonly<{ label: string }>[],
): readonly (readonly Readonly<{ label: string }>[])[] {
  const rows: Readonly<{ label: string }>[][] = [];

  for (let index = 0; index < steps.length; index += 3) {
    rows.push(steps.slice(index, index + 3));
  }

  return rows;
}

export default function OrganiserProcessMap({
  steps,
  compact = false,
}: OrganiserProcessMapProps) {
  if (steps.length < 2 || steps.length > 6) return null;

  const rows = splitIntoRows(steps);
  const ariaLabel = `Processus en ${steps.length} étapes : ${steps.map((step) => step.label).join(", ")}.`;
  const cardClassName = compact
    ? "flex min-h-10 flex-1 items-center justify-center rounded-[0.55rem] border border-[#C7D4CB] bg-white px-2 text-center text-[0.62rem] font-medium leading-[1.2] text-[#2D3B33] sm:min-h-12 sm:text-[0.7rem]"
    : "flex min-h-[5.5rem] flex-1 items-center justify-center rounded-[0.9rem] border border-[#C7D4CB] bg-white px-3 text-center text-sm font-medium leading-snug text-[#2D3B33] sm:min-h-[6.25rem] sm:px-4 sm:text-[0.95rem]";

  return (
    <div
      className={compact
        ? "flex h-full items-center rounded-[1.25rem] bg-[#F0F4F1] p-3 sm:p-4"
        : "rounded-[1.35rem] bg-[#F0F4F1] p-4 sm:p-5"
      }
      role="img"
      aria-label={ariaLabel}
    >
      <div className="w-full space-y-1.5 sm:hidden" aria-hidden="true">
        {steps.map((step, index) => (
          <div key={`${index}-${step.label}`}>
            <div className={cardClassName}>{step.label}</div>
            {index < steps.length - 1 ? (
              <div className={compact ? "h-4 text-sm" : "h-5 text-base"}>
                <Arrow direction="down" />
              </div>
            ) : null}
          </div>
        ))}
      </div>

      <div
        className={compact ? "hidden w-full space-y-1 sm:block" : "hidden w-full space-y-2 sm:block"}
        aria-hidden="true"
      >
        {rows.map((row, rowIndex) => {
          const movesLeft = rowIndex % 2 === 1;
          const visibleSteps = movesLeft ? [...row].reverse() : row;

          return (
            <div key={rowIndex}>
              <div className={compact ? "flex items-stretch gap-1" : "flex items-stretch gap-2.5"}>
                {movesLeft && visibleSteps.length < 3 ? (
                  <>
                    <div className="flex-1" />
                    <div className={compact ? "w-3" : "w-5"} />
                  </>
                ) : null}
                {visibleSteps.map((step, stepIndex) => (
                  <div key={`${stepIndex}-${step.label}`} className="contents">
                    <div className={cardClassName}>{step.label}</div>
                    {stepIndex < visibleSteps.length - 1 ? (
                      <div className={compact ? "w-3 text-xs" : "w-5 text-lg"}>
                        <Arrow direction={movesLeft ? "left" : "right"} />
                      </div>
                    ) : null}
                  </div>
                ))}
                {!movesLeft && visibleSteps.length < 3 ? (
                  <>
                    <div className={compact ? "w-3" : "w-5"} />
                    <div className="flex-1" />
                  </>
                ) : null}
              </div>

              {rowIndex < rows.length - 1 ? (
                <div
                  className={`${compact ? "h-4 text-sm" : "h-6 text-lg"} flex ${movesLeft ? "justify-start" : "justify-end"}`}
                >
                  <div className={visibleSteps.length === 3 ? "w-[31%]" : "w-[48%]"}>
                    <Arrow direction="down" />
                  </div>
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
