import { Check, CircleAlert, ClipboardCheck } from "lucide-react";
import { Suspense } from "react";
import ServiceCallbackForm from "@/components/ServiceCallbackForm";
import CoachBusinessCallbackForm from "@/components/CoachBusinessCallbackForm";
import type { CanonicalService } from "@/lib/canonical-service-contract";
import type { InterfaceLocaleCode } from "@/lib/international-context";
import { getServiceUiCopy } from "@/lib/service-ui-copy";

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
  localeCode,
  marketCode,
  service,
  source,
  systemSlug,
}: {
  compact?: boolean;
  localeCode: InterfaceLocaleCode;
  marketCode: string;
  service: CanonicalService;
  source?: string;
  systemSlug?: string;
}) {
  const ui = getServiceUiCopy(localeCode);
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
      ) : (
        <>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-dema-muted">
            {ui.packagesHeading}
          </p>
          <p className="mt-3 text-sm leading-relaxed text-dema-muted">
            {ui.packagesDescription}
          </p>
        </>
      )}
      {service.monthlyAccompanimentDiscountEligible ? (
        <p className="mt-3 text-xs font-normal text-dema-muted">
          {ui.monthlyBenefit}
        </p>
      ) : null}

      <Suspense fallback={<ServiceCtaFallback label={service.cta.label} />}>
        {service.slug === "coach-business" && localeCode === "fr" ? (
          <CoachBusinessCallbackForm />
        ) : (
          <ServiceCallbackForm
            key={service.slug}
            localeCode={localeCode}
            marketCode={marketCode}
            packages={service.packages}
            serviceName={service.name}
            serviceSlug={service.slug}
            source={source}
            systemSlug={systemSlug}
          />
        )}
      </Suspense>
    </aside>
  );
}

function CompactServiceDetails({
  Heading,
  localeCode,
  marketCode,
  service,
  source,
  systemSlug,
}: {
  Heading: "h1" | "h2";
  localeCode: InterfaceLocaleCode;
  marketCode: string;
  service: CanonicalService;
  source?: string;
  systemSlug?: string;
}) {
  const ui = getServiceUiCopy(localeCode);
  return (
    <div className="min-w-0 max-w-full">
      <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-dema-forest">
        {service.eyebrow}
      </p>
      <Heading className="mt-3 text-3xl font-semibold tracking-[-0.035em] text-brand-blue sm:text-4xl">
        {service.name}
      </Heading>
      <p className="mt-4 max-w-2xl text-base leading-7 text-dema-muted">
        {service.result}
      </p>

      <div className="mt-7 grid min-w-0 gap-6">
        <section className="min-w-0 border-t border-dema-line pt-5">
          <h3 className="text-base font-semibold text-brand-blue">
            {ui.included}
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

        <ServicePricingAndCta
          compact
          localeCode={localeCode}
          marketCode={marketCode}
          service={service}
          source={source}
          systemSlug={systemSlug}
        />
      </div>
    </div>
  );
}

export default function CanonicalServiceDetails({
  headingAs: Heading = "h1",
  localeCode = "fr",
  marketCode = "fr-fr",
  service,
  source,
  systemSlug,
  variant = "page",
}: {
  headingAs?: "h1" | "h2";
  localeCode?: InterfaceLocaleCode;
  marketCode?: string;
  service: CanonicalService;
  source?: string;
  systemSlug?: string;
  variant?: "modal" | "page";
}) {
  const ui = getServiceUiCopy(localeCode);
  if (variant === "modal") {
    return (
      <CompactServiceDetails
        Heading={Heading}
        localeCode={localeCode}
        marketCode={marketCode}
        service={service}
        source={source}
        systemSlug={systemSlug}
      />
    );
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
              {ui.expectedResult}
            </p>
            <p className="mt-3 text-base leading-relaxed text-brand-blue/75">
              {service.result}
            </p>
          </div>
        </section>

        <ServicePricingAndCta
          localeCode={localeCode}
          marketCode={marketCode}
          service={service}
          source={source}
          systemSlug={systemSlug}
        />
      </div>

      <div className="mt-8 grid min-w-0 gap-4 md:grid-cols-3">
        <DetailList icon={ClipboardCheck} items={service.included} title={ui.included} />
        <DetailList icon={Check} items={service.conditions} title={ui.conditions} />
        <DetailList icon={CircleAlert} items={service.notIncluded} title={ui.notIncluded} />
      </div>
    </div>
  );
}
