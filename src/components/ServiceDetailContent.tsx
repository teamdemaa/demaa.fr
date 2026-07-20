"use client";

import { Check } from "lucide-react";
import OrganisationAuditBookingButton from "@/components/OrganisationAuditBookingButton";
import type { DemaaService } from "@/lib/service-catalog";
import { ServiceIcon } from "@/components/ServiceIcon";
import ServiceRequestCta from "@/components/ServiceRequestCta";

type ServiceDetailContentProps = {
  service: DemaaService;
  compact?: boolean;
};

export default function ServiceDetailContent({
  service,
  compact = false,
}: ServiceDetailContentProps) {
  const isOrganisationAudit = service.slug === "organisation-automatisation";
  const isBillingAssistant = service.slug === "assistante-facturation";

  return (
    <div className={compact ? "space-y-6" : "space-y-8"}>
      <section className={compact ? "" : "rounded-[1.25rem] border border-dema-line bg-dema-paper p-6 sm:p-8"}>
        <div className="max-w-3xl">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-dema-sage text-dema-forest">
              <ServiceIcon icon={service.icon} className="h-5 w-5" aria-hidden="true" />
            </span>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-dema-forest">
              {service.category}
            </p>
          </div>
          <h1 className="mt-4 text-[2.3rem] font-semibold tracking-tight text-brand-blue md:text-[3rem]">
            {service.name}
          </h1>
          <p className="mt-4 text-[1.05rem] leading-relaxed text-dema-muted md:text-[1.28rem]">
            {service.description}
          </p>
          {isOrganisationAudit ? (
            <OrganisationAuditBookingButton />
          ) : null}
        </div>
      </section>

      {isOrganisationAudit ? null : (
        <section className="space-y-5">
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
            <h2 className="text-2xl font-semibold text-brand-blue md:text-[1.7rem]">Tarif</h2>
            {!isBillingAssistant ? (
              <>
                <p className="mt-4 text-[1.9rem] font-semibold tracking-tight text-brand-blue md:text-[2.15rem]">
                  {service.price}
                </p>
                <p className="mt-4 text-[1rem] leading-relaxed text-dema-muted md:text-[1.05rem]">
                  Durée
                </p>
                <p className="mt-2 text-lg font-semibold tracking-tight text-brand-blue">
                  {service.duration}
                </p>
              </>
            ) : null}
            <div className="mt-5">
              <ServiceRequestCta service={service} />
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
