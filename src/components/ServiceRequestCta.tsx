"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { useState } from "react";
import AssistantPackSelector from "@/components/AssistantPackSelector";
import ServiceIntroductionModal from "@/components/ServiceIntroductionModal";
import ServicePurchaseCta from "@/components/ServicePurchaseCta";
import { ASSISTANT_SERVICE_SLUG } from "@/lib/assistant-service-packs";
import { ORGANISATION_AUDIT_BOOKING_URL } from "@/lib/organisation-audit";
import { getPurchasableServiceConfig } from "@/lib/service-purchase";
import type { DemaaService } from "@/lib/service-catalog";

type ServiceRequestCtaProps = {
  service: DemaaService;
  purchaseButtonLabel?: string;
  purchaseSelectedLabel?: string;
  purchaseButtonClassName?: string;
};

export default function ServiceRequestCta(props: ServiceRequestCtaProps) {
  return <ServiceRequestCtaWithOptions {...props} />;
}

export function ServiceRequestCtaWithOptions({
  service,
  purchaseButtonLabel,
  purchaseSelectedLabel,
  purchaseButtonClassName,
}: ServiceRequestCtaProps) {
  const [isIntroductionOpen, setIsIntroductionOpen] = useState(false);
  const purchaseConfig = getPurchasableServiceConfig(service.slug);

  if (service.slug === ASSISTANT_SERVICE_SLUG) {
    return <AssistantPackSelector className="mt-5" />;
  }

  if (purchaseConfig) {
    return (
      <ServicePurchaseCta
        serviceName={service.name}
        serviceSlug={service.slug}
        defaultLabel={purchaseButtonLabel}
        selectedLabel={purchaseSelectedLabel}
        buttonClassName={purchaseButtonClassName}
      />
    );
  }

  if (service.slug === "expert-comptable") {
    return (
      <Link
        href="/annuaire-experts-comptables"
        className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-dema-forest px-5 py-3 text-sm font-semibold text-dema-paper transition hover:bg-brand-blue"
      >
        Voir l&apos;annuaire
        <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
      </Link>
    );
  }

  if (service.slug === "organisation-automatisation") {
    return (
      <Link
        href={ORGANISATION_AUDIT_BOOKING_URL}
        className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-dema-forest px-5 py-3 text-sm font-semibold text-dema-paper transition hover:bg-brand-blue"
      >
        Prendre RDV
      </Link>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setIsIntroductionOpen(true)}
        className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-dema-forest px-5 py-3 text-sm font-semibold text-dema-paper transition hover:bg-brand-blue"
      >
        Demander ce service
      </button>
      {isIntroductionOpen ? (
        <ServiceIntroductionModal
          service={service}
          source="Page service"
          onClose={() => setIsIntroductionOpen(false)}
        />
      ) : null}
    </>
  );
}
