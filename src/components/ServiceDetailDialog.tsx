"use client";

import Link from "next/link";
import { ArrowUpRight, Check, X } from "lucide-react";
import { useState } from "react";
import DeleguerPricingPreviewModal from "@/components/DeleguerPricingPreviewModal";
import { ServiceIcon } from "@/components/ServiceIcon";
import ServiceIntroductionModal from "@/components/ServiceIntroductionModal";
import type { DemaaService } from "@/lib/service-catalog";

type ServiceDetailDialogProps = {
  service: DemaaService;
  source?: string;
  onClose: () => void;
};

export default function ServiceDetailDialog({
  service,
  source,
  onClose,
}: ServiceDetailDialogProps) {
  const [isIntroductionOpen, setIsIntroductionOpen] = useState(false);
  const [isPricingPreviewOpen, setIsPricingPreviewOpen] = useState(false);
  const serviceSource =
    service.slug === "organisation-automatisation" ? "Demaa" : "Partenaire";
  const isOrganisationService = service.slug === "organisation-automatisation";
  const isAssistantLanding = service.slug === "assistant-polyvalent";

  return (
    <>
      <div
        className="fixed inset-0 z-[80] flex items-center justify-center bg-brand-blue/45 p-4"
        role="dialog"
        aria-modal="true"
        aria-label={service.name}
        onClick={onClose}
      >
        <div
          className="relative flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-[1.25rem] border border-dema-line bg-dema-paper shadow-[0_24px_70px_rgba(23,35,29,0.2)]"
          onClick={(event) => event.stopPropagation()}
        >
          <div className="flex items-start justify-between gap-4 border-b border-dema-line px-5 py-4">
            <div className="flex min-w-0 items-center gap-3">
              <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-dema-sage text-dema-forest">
                <ServiceIcon icon={service.icon} className="h-5 w-5" aria-hidden="true" />
              </span>
              <div className="min-w-0">
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-dema-forest">
                  {service.category}
                </p>
                <h2 className="mt-1 text-2xl font-semibold leading-tight text-brand-blue">
                  {service.name}
                </h2>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-dema-line bg-dema-paper text-brand-blue transition hover:border-dema-forest/25 hover:text-dema-forest"
              aria-label="Fermer"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>

          <div className="min-h-0 overflow-y-auto p-5 soft-scroll">
            <p className="max-w-3xl text-base leading-relaxed text-dema-muted">
              {service.description}
            </p>

            <div className="mt-5 grid gap-4 md:grid-cols-[1fr_0.85fr]">
              <section className="rounded-[1.15rem] border border-dema-line bg-dema-paper p-5">
                <h3 className="text-lg font-semibold text-brand-blue">Ce qui est inclus</h3>
                <ul className="mt-4 space-y-3">
                  {service.deliverables.map((deliverable) => (
                    <li
                      key={deliverable}
                      className="flex items-start gap-3 text-sm leading-relaxed text-dema-muted"
                    >
                      <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-dema-sage text-dema-forest">
                        <Check className="h-3.5 w-3.5" aria-hidden="true" />
                      </span>
                      {deliverable}
                    </li>
                  ))}
                </ul>
              </section>

              <aside className="rounded-[1.15rem] border border-dema-line bg-dema-cream/70 p-5">
                <p className="text-sm font-semibold text-brand-blue">Tarif</p>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <span className="inline-flex rounded-full bg-dema-sage/75 px-3 py-1 text-[10px] font-medium text-brand-blue/70">
                    {service.price}
                  </span>
                  <span className="inline-flex rounded-full bg-dema-sage/75 px-2.5 py-1 text-[10px] font-medium lowercase text-brand-blue/70">
                    {service.category}
                  </span>
                  <span className="inline-flex rounded-full bg-dema-sage/75 px-2.5 py-1 text-[10px] font-medium lowercase text-brand-blue/70">
                    {serviceSource}
                  </span>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-dema-muted">
                  {service.bestFor}
                </p>
                {isOrganisationService ? (
                  <button
                    type="button"
                    onClick={() => setIsPricingPreviewOpen(true)}
                    className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-dema-forest px-5 py-3 text-sm font-semibold text-dema-paper transition hover:bg-brand-blue"
                  >
                    Voir le pricing
                    <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                  </button>
                ) : isAssistantLanding ? (
                  <Link
                    href={`/annuaire-services/${service.slug}`}
                    className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-dema-forest px-5 py-3 text-sm font-semibold text-dema-paper transition hover:bg-brand-blue"
                  >
                    Voir l&apos;offre
                    <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                  </Link>
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsIntroductionOpen(true)}
                    className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-dema-forest px-5 py-3 text-sm font-semibold text-dema-paper transition hover:bg-brand-blue"
                  >
                    Demander ce service
                  </button>
                )}
              </aside>
            </div>
          </div>
        </div>
      </div>

      {isIntroductionOpen ? (
        <ServiceIntroductionModal
          service={service}
          source={source}
          onClose={() => setIsIntroductionOpen(false)}
        />
      ) : null}
      {isPricingPreviewOpen ? (
        <DeleguerPricingPreviewModal onClose={() => setIsPricingPreviewOpen(false)} />
      ) : null}
    </>
  );
}
