"use client";

import Link from "next/link";
import { Check } from "lucide-react";
import type { DemaaService } from "@/lib/service-catalog";
import { ServiceIcon } from "@/components/ServiceIcon";
import ServiceRequestCta from "@/components/ServiceRequestCta";
import { ORGANISATION_AUDIT_BOOKING_URL } from "@/lib/organisation-audit";

type ServiceDetailContentProps = {
  service: DemaaService;
  compact?: boolean;
};

export default function ServiceDetailContent({
  service,
  compact = false,
}: ServiceDetailContentProps) {
  const isOrganisationAudit = service.slug === "organisation-automatisation";

  return (
    <div className={compact ? "space-y-6" : "space-y-8"}>
      <section className={compact ? "" : "rounded-[1.25rem] border border-dema-line bg-dema-paper p-6 sm:p-8"}>
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-3xl">
            <div className="flex items-center gap-3">
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-dema-sage text-dema-forest">
                <ServiceIcon icon={service.icon} className="h-5 w-5" aria-hidden="true" />
              </span>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-dema-forest">
                {service.category}
              </p>
            </div>
            <h1 className="mt-4 text-[2.9rem] font-semibold tracking-tight text-brand-blue md:text-[3.75rem]">
              {service.name}
            </h1>
            <p className="mt-4 text-[1.05rem] leading-relaxed text-dema-muted md:text-[1.28rem]">
              {service.description}
            </p>
            {isOrganisationAudit ? (
              <Link
                href={ORGANISATION_AUDIT_BOOKING_URL}
                className="demaa-primary-button mt-5 w-fit"
              >
                Prendre RDV
              </Link>
            ) : null}
          </div>
          {isOrganisationAudit ? null : (
            <aside className="w-full rounded-[1.15rem] border border-dema-line bg-dema-cream/70 p-5 lg:max-w-sm">
              <p className="text-base font-semibold text-brand-blue">Tarif</p>
              <p className="mt-3 text-[1.9rem] font-semibold tracking-tight text-brand-blue md:text-[2.15rem]">
                {service.price}
              </p>
              <ServiceRequestCta service={service} />
            </aside>
          )}
        </div>
      </section>

      {isOrganisationAudit ? null : (
        <section className="grid gap-5 lg:grid-cols-[1fr_0.9fr]">
          <div className="rounded-[1.25rem] border border-dema-line bg-dema-paper p-6">
            <h2 className="text-2xl font-semibold text-brand-blue md:text-[1.7rem]">Ce qui est inclus</h2>
            <ul className="mt-4 space-y-3">
              {service.deliverables.map((deliverable) => (
                <li key={deliverable} className="flex items-start gap-3 text-[1rem] leading-relaxed text-dema-muted md:text-[1.05rem]">
                  <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-dema-sage text-dema-forest">
                    <Check className="h-3.5 w-3.5" aria-hidden="true" />
                  </span>
                  {deliverable}
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-[1.25rem] border border-dema-line bg-dema-paper p-6">
            <h2 className="text-2xl font-semibold text-brand-blue md:text-[1.7rem]">Utile pour</h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {service.usefulFor.map((item) => (
                <span
                  key={item}
                  className="rounded-full bg-dema-sage/75 px-3 py-1.5 text-xs font-medium text-brand-blue/75"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
