import { ArrowRight, ChevronDown } from "lucide-react";
import Link from "next/link";
import type { SystemProcessGuideDetail } from "@/lib/system-process-guide-details";

export default function SystemProcessGuideDetails({
  details,
}: {
  details: readonly SystemProcessGuideDetail[];
}) {
  if (!details.length) return null;

  return (
    <div className="mt-5 space-y-3 print:hidden">
      {details.map((detail) => (
        <details
          key={detail.slug}
          className="group rounded-[1rem] border border-dema-forest/12 bg-dema-sage/25 px-4 py-3"
        >
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-medium text-dema-forest marker:content-none">
            <span>Voir le cas concret</span>
            <ChevronDown
              className="h-4 w-4 shrink-0 transition group-open:rotate-180"
              aria-hidden="true"
            />
          </summary>

          <div className="border-t border-dema-forest/10 pb-2 pt-5 mt-3">
            <h5 className="text-lg font-medium tracking-[-0.02em] text-brand-blue">
              {detail.title}
            </h5>
            <p className="mt-3 text-sm leading-6 text-dema-muted">
              {detail.result}
            </p>

            <ol className="mt-6 space-y-5">
              {detail.steps.map((step, index) => (
                <li key={`${detail.slug}-${step.label}`} className="grid grid-cols-[1.75rem_1fr] gap-3">
                  <span className="pt-0.5 font-mono text-[0.68rem] font-semibold text-dema-forest/60">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <p className="text-sm font-medium text-brand-blue">{step.title}</p>
                    <p className="mt-1 text-xs leading-5 text-dema-muted">{step.output}</p>
                  </div>
                </li>
              ))}
            </ol>

            {detail.tools.length || detail.model ? (
              <div className="mt-6 flex flex-wrap gap-2 border-t border-dema-forest/10 pt-4">
                {detail.tools.map((tool) => (
                  <Link
                    key={tool.href}
                    href={tool.href}
                    className="demaa-chip inline-flex items-center gap-1.5 text-xs"
                  >
                    {tool.name}
                    <ArrowRight className="h-3 w-3" aria-hidden="true" />
                  </Link>
                ))}
                {detail.model ? (
                  <Link
                    href={detail.model.href}
                    className="demaa-chip demaa-chip-active inline-flex items-center gap-1.5 text-xs"
                  >
                    {detail.model.title}
                    <ArrowRight className="h-3 w-3" aria-hidden="true" />
                  </Link>
                ) : null}
              </div>
            ) : null}
          </div>
        </details>
      ))}
    </div>
  );
}
