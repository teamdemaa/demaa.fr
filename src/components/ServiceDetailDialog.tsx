"use client";

import { Check, X } from "lucide-react";
import { useRouter } from "next/navigation";
import ServiceExpandedContent from "@/components/ServiceExpandedContent";
import { ServiceIcon } from "@/components/ServiceIcon";
import ServiceRequestCta from "@/components/ServiceRequestCta";
import OrganisationSessionBookingButton from "@/components/OrganisationSessionBookingButton";
import { hasExpandedServiceContent } from "@/lib/service-expanded-content";
import { type DemaaService } from "@/lib/service-catalog";

type ServiceDetailDialogProps = {
  service: DemaaService;
  source?: string;
  onClose?: () => void;
};

export default function ServiceDetailDialog({
  service,
  source = "Annuaire services",
  onClose,
}: ServiceDetailDialogProps) {
  const router = useRouter();
  const closeDialog = onClose ?? (() => router.back());
  const hasExpandedContent = hasExpandedServiceContent(service.slug);
  const isOrganisationSession = service.slug === "organisation-automatisation";
  const isBillingAssistant = service.slug === "assistante-facturation";

  return (
    <>
      <div
        className="fixed inset-0 z-[80] flex items-center justify-center bg-brand-blue/45 p-3 sm:p-4"
        role="dialog"
        aria-modal="true"
        aria-label={service.name}
        onClick={closeDialog}
      >
        <div
          className={`relative flex max-h-[94vh] w-full flex-col overflow-hidden rounded-[1.2rem] border border-dema-line bg-dema-paper shadow-[0_24px_70px_rgba(23,35,29,0.2)] sm:max-h-[92vh] sm:rounded-[1.25rem] ${
            hasExpandedContent ? "max-w-5xl" : "max-w-4xl"
          }`}
          onClick={(event) => event.stopPropagation()}
        >
          <div className="flex items-start justify-between gap-3 border-b border-dema-line px-5 py-5 sm:gap-4 sm:px-6 sm:py-5">
            <div className="flex min-w-0 items-center gap-3">
              <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-dema-sage text-dema-forest sm:h-12 sm:w-12">
                <ServiceIcon icon={service.icon} className="h-5 w-5" aria-hidden="true" />
              </span>
              <div className="min-w-0">
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-dema-forest">
                  {service.category}
                </p>
                <h2 className="mt-1 text-[1.7rem] font-semibold leading-[1.02] text-brand-blue sm:text-[1.95rem] md:text-[2.1rem]">
                  {service.name}
                </h2>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <button
                type="button"
                onClick={closeDialog}
                className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-dema-line bg-dema-paper text-brand-blue transition hover:border-dema-forest/25 hover:text-dema-forest"
                aria-label="Fermer"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          </div>

          <div className="min-h-0 overflow-y-auto p-6 soft-scroll sm:p-7 md:p-8">
            <p className="max-w-3xl text-[1.02rem] leading-relaxed text-dema-muted sm:text-[1.08rem] md:text-[1.15rem]">
              {service.description}
            </p>
            {isOrganisationSession ? (
              <OrganisationSessionBookingButton source={source} />
            ) : null}

            {!isOrganisationSession ? (
              <div className="mt-8 space-y-6">
                <section className="rounded-[1.05rem] border border-dema-line bg-dema-paper p-4 sm:rounded-[1.15rem] sm:p-5">
                  <h3 className="text-[1.35rem] font-semibold text-brand-blue md:text-[1.55rem]">Ce qui est inclus</h3>
                  <ul className="mt-5 space-y-3.5">
                    {service.deliverables.map((deliverable) => (
                      <li
                        key={deliverable}
                        className="flex items-start gap-3 text-[1rem] leading-relaxed text-dema-muted md:text-[1.05rem]"
                      >
                        <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-dema-sage text-dema-forest">
                          <Check className="h-3.5 w-3.5" aria-hidden="true" />
                        </span>
                        {deliverable}
                      </li>
                    ))}
                  </ul>
                </section>

                <aside className="rounded-[1.05rem] border border-dema-line bg-dema-cream/70 p-5 sm:rounded-[1.15rem] sm:p-6">
                  <p className="text-base font-semibold text-brand-blue">Tarif</p>
                  {!isBillingAssistant ? (
                    <>
                      <p className="mt-3 text-[1.35rem] font-normal tracking-tight text-brand-blue md:text-[1.5rem]">
                        {service.price}
                      </p>
                      <p className="mt-4 text-sm font-medium text-dema-muted">Durée</p>
                      <p className="mt-1 text-lg font-normal tracking-tight text-brand-blue">
                        {service.duration}
                      </p>
                    </>
                  ) : null}
                  <ServiceRequestCta
                    service={service}
                  />
                </aside>
              </div>
            ) : null}

            <div className={isOrganisationSession ? "mt-16" : "mt-8"}>
              <ServiceExpandedContent serviceSlug={service.slug} variant="modal" />
            </div>
          </div>
        </div>
      </div>

    </>
  );
}
