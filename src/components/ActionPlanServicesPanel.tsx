"use client";

import { useState } from "react";
import { X } from "lucide-react";
import CanonicalServiceDetails from "@/components/CanonicalServiceDetails";
import ServicesCatalog from "@/components/ServicesCatalog";
import { useAccessibleDialog } from "@/components/useAccessibleDialog";
import type { CanonicalService } from "@/lib/canonical-service-catalog";

export default function ActionPlanServicesPanel({
  onServiceSlugChange,
  selectedServiceSlug,
  services,
}: {
  onServiceSlugChange?: (serviceSlug: string | undefined) => void;
  selectedServiceSlug?: string;
  services: readonly CanonicalService[];
}) {
  const [localServiceSlug, setLocalServiceSlug] = useState<string>();
  const activeServiceSlug = onServiceSlugChange
    ? selectedServiceSlug
    : localServiceSlug;
  const selectedService = services.find(({ slug }) => slug === activeServiceSlug) ?? null;

  function selectService(serviceSlug: string | undefined) {
    if (onServiceSlugChange) {
      onServiceSlugChange(serviceSlug);
      return;
    }
    setLocalServiceSlug(serviceSlug);
  }

  const dialogRef = useAccessibleDialog({
    isOpen: Boolean(selectedService),
    onClose: () => selectService(undefined),
  });

  return (
    <section className="py-5 sm:py-7" aria-label="Services Demaa">
      <ServicesCatalog
        services={services}
        onServiceSelect={(service) => selectService(service.slug)}
      />
      {selectedService ? (
        <div
          className="fixed inset-0 z-[140] flex items-end justify-center overflow-y-auto bg-brand-blue/25 p-0 backdrop-blur-sm sm:items-center sm:p-6"
          onMouseDown={() => selectService(undefined)}
        >
          <section
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-label={selectedService.name}
            onMouseDown={(event) => event.stopPropagation()}
            className="relative max-h-[92dvh] w-full max-w-[46rem] overflow-y-auto rounded-t-[1.5rem] bg-dema-paper p-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] shadow-[0_24px_70px_rgba(23,35,29,0.14)] sm:rounded-[1.5rem] sm:p-8"
          >
            <button
              type="button"
              data-dialog-initial-focus
              onClick={() => selectService(undefined)}
              className="absolute right-5 top-5 inline-flex h-10 w-10 items-center justify-center rounded-full border border-dema-line text-brand-blue transition hover:bg-dema-sage focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dema-forest/35"
              aria-label="Fermer"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
            <div className="pr-12">
              <CanonicalServiceDetails headingAs="h2" service={selectedService} variant="modal" />
            </div>
          </section>
        </div>
      ) : null}
    </section>
  );
}
