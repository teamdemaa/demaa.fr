import { ArrowRight, ChevronDown } from "lucide-react";
import Link from "next/link";
import OrganiserProcessMap from "@/components/OrganiserProcessMap";
import type { SystemProcessGuideDetail } from "@/lib/system-process-guide-details";

export default function SystemProcessGuideDetails({
  details,
}: {
  details: readonly SystemProcessGuideDetail[];
}) {
  if (!details.length) return null;

  const label = details.length > 1 ? "Exemples de processus" : "Exemple de processus";

  return (
    <details
      open
      className="group overflow-hidden rounded-[1.25rem] border border-dema-forest/14 bg-dema-sage/25 print:hidden"
    >
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-5 marker:content-none sm:px-6">
        <span className="text-lg font-medium tracking-[-0.02em] text-brand-blue sm:text-xl">
          {label}
        </span>
        <span className="flex items-center gap-3">
          <span className="rounded-full bg-white px-2.5 py-1 text-xs font-medium text-dema-forest">
            {details.length}
          </span>
          <ChevronDown
            className="h-4 w-4 shrink-0 text-dema-forest transition group-open:rotate-180"
            aria-hidden="true"
          />
        </span>
      </summary>

      <div className="space-y-10 border-t border-dema-forest/10 px-5 py-6 sm:px-6 sm:py-8">
        {details.map((detail) => (
          <article key={detail.slug}>
            <h3 className="text-xl font-medium tracking-[-0.025em] text-brand-blue sm:text-2xl">
              {detail.title}
            </h3>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-dema-muted sm:text-base">
              {detail.result}
            </p>

            <div className="mt-6">
              <OrganiserProcessMap steps={detail.steps} />
            </div>

            {detail.model ? (
              <Link
                href={detail.model.href}
                className="demaa-secondary-button mt-6 inline-flex min-h-11 items-center gap-2 px-5"
              >
                Utiliser le modèle : {detail.model.title}
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            ) : null}
          </article>
        ))}
      </div>
    </details>
  );
}

export function SystemProcessGuidePrintDetails({
  details,
}: {
  details: readonly SystemProcessGuideDetail[];
}) {
  if (!details.length) return null;

  return (
    <section className="mt-10 hidden break-before-page print:block">
      <h2 className="text-2xl font-semibold tracking-[-0.025em] text-brand-blue">
        {details.length > 1 ? "Exemples de processus détaillés" : "Exemple de processus détaillé"}
      </h2>
      <div className="mt-6 space-y-10">
        {details.map((detail) => (
          <article key={detail.slug} className="break-inside-avoid">
            <h3 className="text-lg font-semibold text-brand-blue">{detail.title}</h3>
            <p className="mt-2 text-sm leading-6 text-dema-muted">{detail.result}</p>
            <ol className="mt-5 space-y-5">
              {detail.steps.map((step, index) => (
                <li key={`${detail.slug}-${step.label}`} className="grid grid-cols-[2rem_1fr] gap-3">
                  <span className="font-mono text-xs font-semibold text-dema-forest">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-brand-blue">{step.title}</p>
                    <p className="mt-1 text-xs leading-5 text-dema-muted">{step.description}</p>
                    <p className="mt-1 text-xs leading-5 text-dema-muted">
                      <strong>Point de départ :</strong> {step.input}
                    </p>
                    <p className="mt-1 text-xs leading-5 text-dema-muted">
                      <strong>Responsable :</strong> {step.owner}
                    </p>
                    <p className="mt-1 text-xs leading-5 text-dema-muted">
                      <strong>Résultat :</strong> {step.output}
                    </p>
                    <p className="mt-1 text-xs leading-5 text-dema-muted">
                      <strong>Contrôle :</strong> {step.control}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
            {detail.model ? (
              <p className="mt-5 text-sm text-dema-muted">
                <strong>Modèle associé :</strong> {detail.model.title}
              </p>
            ) : null}
          </article>
        ))}
      </div>
    </section>
  );
}
