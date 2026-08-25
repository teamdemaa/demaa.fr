import { Check, CircleAlert, ClipboardCheck } from "lucide-react";
import { Suspense } from "react";
import ServiceCallbackForm from "@/components/ServiceCallbackForm";
import CoachBusinessCallbackForm from "@/components/CoachBusinessCallbackForm";
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

function ServiceCtaFallback({ label }: { label: string }) {
  return (
    <span className="mt-6 inline-flex min-h-11 w-full items-center justify-center rounded-full bg-dema-forest px-5 py-3 text-center text-sm font-semibold text-white opacity-70">
      {label}
    </span>
  );
}

function ServicePricingAndCta({
  compact = false,
  service,
}: {
  compact?: boolean;
  service: CanonicalService;
}) {
  const singlePackage = service.packages.length === 1
    ? service.packages[0]
    : null;

  return (
    <aside
      className={compact
        ? "h-fit rounded-[1.1rem] bg-dema-sage/45 p-5 sm:p-6"
        : "h-fit rounded-[1.1rem] border border-dema-line bg-dema-paper p-5 sm:p-6"}
    >
      {service.pricing ? (
        <>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-dema-muted">
            {service.pricing.heading}
          </p>
          <p className="mt-3 text-base font-normal text-dema-muted">
            {service.pricing.label}
          </p>
          <p className="mt-3 text-sm leading-relaxed text-dema-muted">
            {service.pricing.note}
          </p>
        </>
      ) : singlePackage ? (
        <>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-dema-muted">
            Tarif
          </p>
          <p className="mt-3 text-base font-normal text-dema-muted">
            {singlePackage.pricing.label}
          </p>
          <p className="mt-3 text-sm leading-relaxed text-dema-muted">
            {singlePackage.pricing.note}
          </p>
        </>
      ) : (
        <>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-dema-muted">
            Forfaits
          </p>
          <p className="mt-3 text-sm leading-relaxed text-dema-muted">
            Choisissez le périmètre le plus proche de votre besoin. La Team confirme son adéquation avant tout démarrage.
          </p>
        </>
      )}
      {service.monthlyAccompanimentDiscountEligible ? (
        <p className="mt-3 text-xs font-normal text-dema-muted">
          Avantage accompagnement mensuel : −12 % sur les prestations Demaa éligibles.
        </p>
      ) : null}

      <Suspense fallback={<ServiceCtaFallback label={service.cta.label} />}>
        {service.slug === "coach-business" ? (
          <CoachBusinessCallbackForm />
        ) : (
          <ServiceCallbackForm
            key={service.slug}
            packages={service.packages}
            serviceName={service.name}
            serviceSlug={service.slug}
          />
        )}
      </Suspense>
    </aside>
  );
}

function CompactServiceDetails({
  Heading,
  service,
}: {
  Heading: "h1" | "h2";
  service: CanonicalService;
}) {
  return (
    <div className="min-w-0 max-w-full">
      <div className="pr-12">
        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-dema-forest">
          {service.eyebrow}
        </p>
        <Heading className="mt-3 text-3xl font-semibold tracking-[-0.035em] text-brand-blue sm:text-4xl">
          {service.name}
        </Heading>
        <p className="mt-4 max-w-2xl text-base leading-7 text-dema-muted">
          {service.result}
        </p>
      </div>

      <div className="mt-7 grid min-w-0 gap-6">
        <section className="min-w-0 border-t border-dema-line pt-5">
          <h3 className="text-base font-semibold text-brand-blue">
            Ce qui est inclus
          </h3>
          <ul className="mt-4 space-y-3">
            {service.included.slice(0, 3).map((item) => (
              <li key={item} className="flex items-start gap-3 text-sm leading-relaxed text-dema-muted">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-dema-forest" aria-hidden="true" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>

        <ServicePricingAndCta compact service={service} />
      </div>
    </div>
  );
}

export default function CanonicalServiceDetails({
  headingAs: Heading = "h1",
  service,
  variant = "page",
}: {
  headingAs?: "h1" | "h2";
  service: CanonicalService;
  variant?: "modal" | "page";
}) {
  if (variant === "modal") {
    return <CompactServiceDetails Heading={Heading} service={service} />;
  }

  return (
    <div className="min-w-0 max-w-full">
      <div className="grid min-w-0 gap-7">
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

        <ServicePricingAndCta service={service} />
      </div>

      <div className="mt-8 grid min-w-0 gap-4 md:grid-cols-3">
        <DetailList icon={ClipboardCheck} items={service.included} title="Ce qui est inclus" />
        <DetailList icon={Check} items={service.conditions} title="Conditions" />
        <DetailList icon={CircleAlert} items={service.notIncluded} title="Non inclus" />
      </div>
    </div>
  );
}
