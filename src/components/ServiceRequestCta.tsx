"use client";

import { useState } from "react";
import OrganisationSessionBookingButton from "@/components/OrganisationSessionBookingButton";
import ServiceIntroductionModal from "@/components/ServiceIntroductionModal";
import type { DemaaService } from "@/lib/service-catalog";

type ServiceRequestCtaProps = {
  service: DemaaService;
};

export default function ServiceRequestCta(props: ServiceRequestCtaProps) {
  return <ServiceRequestCtaWithOptions {...props} />;
}

function ServiceRequestCtaWithOptions({
  service,
}: ServiceRequestCtaProps) {
  const [isIntroductionOpen, setIsIntroductionOpen] = useState(false);

  if (service.slug === "organisation-automatisation") {
    return (
      <OrganisationSessionBookingButton
        source="Page service"
        className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-dema-forest px-5 py-3 text-sm font-semibold text-dema-paper transition hover:bg-brand-blue"
      />
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
