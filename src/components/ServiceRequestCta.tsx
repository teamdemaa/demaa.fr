"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { useState } from "react";
import ServiceIntroductionModal from "@/components/ServiceIntroductionModal";
import type { DemaaService } from "@/lib/service-catalog";

export default function ServiceRequestCta({ service }: { service: DemaaService }) {
  const [isIntroductionOpen, setIsIntroductionOpen] = useState(false);

  if (service.slug === "organisation-automatisation") {
    return (
      <Link
        href="/organisation-automatisation"
        className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-dema-forest px-5 py-3 text-sm font-semibold text-dema-paper transition hover:bg-brand-blue"
      >
        Voir l&apos;offre
        <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
      </Link>
    );
  }

  if (service.slug === "assistant-polyvalent") {
    return (
      <Link
        href={`/annuaire-services/${service.slug}`}
        className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-dema-forest px-5 py-3 text-sm font-semibold text-dema-paper transition hover:bg-brand-blue"
      >
        Voir l&apos;offre
        <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
      </Link>
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
