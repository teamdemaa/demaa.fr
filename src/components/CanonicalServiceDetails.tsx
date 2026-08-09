import { Check, CircleAlert, ClipboardCheck } from "lucide-react";
import { Suspense } from "react";
import OrganisationSessionBookingButton from "@/components/OrganisationSessionBookingButton";
import ServiceCallbackForm from "@/components/ServiceCallbackForm";
import type { CanonicalService } from "@/lib/canonical-service-catalog";

function DetailList({
  icon: Icon,
  items,
  title,
}: {
  icon: typeof Check;
  items: readonly string[];
  title: string;
}) {
  return (
    <section className="rounded-[1.1rem] border border-dema-line bg-dema-paper p-5 sm:p-6">
      <div className="flex items-center gap-3">
        <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-dema-sage text-dema-forest">
          <Icon className="h-4 w-4" aria-hidden="true" />
        </span>
        <h3 className="text-lg font-semibold text-brand-blue">{title}</h3>
      </div>
      <ul className="mt-5 space-y-3">
        {items.map((item) => (
          <li key={item} className="flex items-start gap-3 text-sm leading-relaxed text-dema-muted">
            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-dema-forest" aria-hidden="true" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
export default function CanonicalServiceDetails({
  headingAs: Heading = "h1",
  service,
}: {
  headingAs?: "h1" | "h2";
  service: CanonicalService;
}) {
  return (
    <div className="min-w-0 max-w-full">
      <div className="grid min-w-0 gap-7 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <section className="min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-dema-forest">
            {service.eyebrow}
          </p>
          <Heading className="mt-3 text-3xl font-semibold tracking-[-0.035em] text-brand-blue sm:text-4xl lg:text-5xl">
            {service.name}
          </Heading>
          <p className="mt-5 max-w-3xl text-lg leading-8 text-brand-blue/75">
            {service.summary}
          </p>
          <p className="mt-5 max-w-3xl text-base leading-7 text-dema-muted">
            {service.description}
          </p>
          <div className="mt-7 rounded-[1.1rem] border border-dema-line bg-dema-sage/45 p-5 sm:p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-dema-forest">
              Résultat attendu
            </p>
            <p className="mt-3 text-base leading-relaxed text-brand-blue/75">
              {service.result}
            </p>
          </div>
        </section>

        <aside className="h-fit rounded-[1.1rem] border border-dema-line bg-dema-paper p-5 sm:p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-dema-muted">
            Tarif
          </p>
          <p className="mt-3 text-2xl font-semibold tracking-[-0.025em] text-brand-blue">
            {service.pricing.label}
          </p>
          {service.pricing.mode === "fixed-monthly" ? (
            <p className="mt-3 text-sm leading-relaxed text-dema-muted">
              Engagement initial de trois mois, puis reconduction mensuelle.
            </p>
          ) : null}

          {service.cta.kind === "fillout" ? (
            <Suspense
              fallback={(
                <span className="mt-6 inline-flex min-h-11 w-full items-center justify-center rounded-full bg-dema-forest px-5 py-3 text-center text-sm font-semibold text-white opacity-70">
                  {service.cta.label}
                </span>
              )}
            >
              <OrganisationSessionBookingButton
                className="mt-6 inline-flex min-h-11 w-full items-center justify-center rounded-full bg-dema-forest px-5 py-3 text-center text-sm font-semibold text-white transition hover:bg-brand-blue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dema-forest/35 focus-visible:ring-offset-2"
                label={service.cta.label}
                source="Service - Marketing externalisé"
                sourceIsAuthoritative
                requestType="marketing_strategy_booking"
              />
            </Suspense>
          ) : (
            <div className="mt-6 border-t border-dema-line pt-1">
              <ServiceCallbackForm
                serviceName={service.name}
                serviceSlug={service.slug}
              />
            </div>
          )}
        </aside>
      </div>

      <div className="mt-8 grid min-w-0 gap-4 md:grid-cols-3">
        <DetailList icon={ClipboardCheck} items={service.included} title="Ce qui est inclus" />
        <DetailList icon={Check} items={service.conditions} title="Conditions" />
        <DetailList icon={CircleAlert} items={service.notIncluded} title="Non inclus" />
      </div>
    </div>
  );
}
