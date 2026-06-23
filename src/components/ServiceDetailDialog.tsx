"use client";

import { Check, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import ServiceExpandedContent from "@/components/ServiceExpandedContent";
import { ServiceIcon } from "@/components/ServiceIcon";
import ServiceIntroductionModal from "@/components/ServiceIntroductionModal";
import { hasExpandedServiceContent } from "@/lib/service-expanded-content";
import type { DemaaService } from "@/lib/service-catalog";
import { getPurchasableServiceConfig } from "@/lib/service-purchase";

type ServiceDetailDialogProps = {
  service: DemaaService;
  source?: string;
  onClose?: () => void;
};

const ORGANISATION_AUDIT_PILLARS = [
  "Direction & stratégie",
  "Marketing & vente",
  "Opérations (cœur de métier)",
  "Finance & administration",
  "Équipe",
] as const;

export default function ServiceDetailDialog({
  service,
  source,
  onClose,
}: ServiceDetailDialogProps) {
  const router = useRouter();
  const [isIntroductionOpen, setIsIntroductionOpen] = useState(false);
  const serviceSource =
    service.slug === "organisation-automatisation" ? "Demaa" : "Partenaire";
  const isPurchasable = Boolean(getPurchasableServiceConfig(service.slug));
  const closeDialog = onClose ?? (() => router.back());
  const hasExpandedContent = hasExpandedServiceContent(service.slug);
  const isOrganisationAutomation = service.slug === "organisation-automatisation";

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
          <div className="flex items-start justify-between gap-3 border-b border-dema-line px-4 py-4 sm:gap-4 sm:px-5">
            <div className="flex min-w-0 items-center gap-3">
              <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-dema-sage text-dema-forest sm:h-12 sm:w-12">
                <ServiceIcon icon={service.icon} className="h-5 w-5" aria-hidden="true" />
              </span>
              <div className="min-w-0">
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-dema-forest">
                  {service.category}
                </p>
                <h2 className="mt-1 text-[1.75rem] font-semibold leading-[1.02] text-brand-blue sm:text-2xl md:text-[2rem]">
                  {service.name}
                </h2>
              </div>
            </div>
            <button
              type="button"
              onClick={closeDialog}
              className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-dema-line bg-dema-paper text-brand-blue transition hover:border-dema-forest/25 hover:text-dema-forest"
              aria-label="Fermer"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>

          <div className="min-h-0 overflow-y-auto p-5 soft-scroll sm:p-6 md:p-7">
            {!isOrganisationAutomation ? (
              <p className="max-w-3xl text-[15px] leading-relaxed text-dema-muted sm:text-base">
                {service.description}
              </p>
            ) : null}

            {isOrganisationAutomation ? (
              <section className="rounded-[1.05rem] bg-dema-cream/55 p-5 sm:rounded-[1.15rem] sm:p-6">
                <div className="max-w-3xl">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-dema-forest">
                    Audit gratuit
                  </p>
                  <h3 className="mt-2 text-xl font-semibold tracking-tight text-brand-blue md:text-2xl">
                    Ce qui va être analysé
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-dema-muted">
                    L&apos;audit sert à voir rapidement où l&apos;activité se bloque, où elle
                    dépend encore trop de vous et quels leviers d&apos;organisation ou
                    d&apos;automatisation sont prioritaires.
                  </p>
                </div>
                <div className="mt-6 grid gap-3.5 sm:grid-cols-2 xl:grid-cols-3">
                  {ORGANISATION_AUDIT_PILLARS.map((pillar, index) => (
                    <div
                      key={pillar}
                      className="rounded-[0.95rem] border border-dema-line/60 bg-dema-paper/92 px-4 py-4"
                    >
                      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-dema-forest/75">
                        Pilier {index + 1}
                      </p>
                      <p className="mt-2 text-sm font-semibold leading-relaxed text-brand-blue">
                        {pillar}
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            ) : null}

            <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,0.82fr)]">
              <section
                className={
                  isOrganisationAutomation
                    ? "rounded-[1.05rem] bg-dema-cream/35 p-5 sm:rounded-[1.15rem] sm:p-6"
                    : "rounded-[1.05rem] border border-dema-line bg-dema-paper p-4 sm:rounded-[1.15rem] sm:p-5"
                }
              >
                <h3 className="text-lg font-semibold text-brand-blue">Ce qui est inclus</h3>
                <ul className="mt-5 space-y-3.5">
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

              <aside
                className={`self-start rounded-[1.05rem] p-5 lg:sticky lg:top-0 sm:rounded-[1.15rem] sm:p-6 ${
                  isOrganisationAutomation
                    ? "border border-dema-line/70 bg-dema-paper/95"
                    : "border border-dema-line bg-dema-cream/70"
                }`}
              >
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
                <p className="mt-4 text-sm leading-relaxed text-dema-muted">
                  {service.bestFor}
                </p>
                {!isPurchasable ? (
                  <button
                    type="button"
                    onClick={() => setIsIntroductionOpen(true)}
                    className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-dema-forest px-5 py-3 text-sm font-semibold text-dema-paper transition hover:bg-brand-blue"
                  >
                    Demander ce service
                  </button>
                ) : null}
              </aside>
            </div>

            {hasExpandedContent ? (
              <div className="mt-8">
                <ServiceExpandedContent serviceSlug={service.slug} variant="modal" />
              </div>
            ) : null}
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
    </>
  );
}
