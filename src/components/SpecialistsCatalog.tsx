"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Bot,
  Calculator,
  ClipboardCheck,
  Compass,
  Laptop,
  Megaphone,
  MessagesSquare,
  PanelsTopLeft,
  SearchCheck,
  Workflow,
  type LucideIcon,
} from "lucide-react";
import type { CanonicalService } from "@/lib/canonical-service-catalog";
import GuestDiagnosticControl from "@/components/GuestDiagnosticControl";
import type { SpecialistSection } from "@/lib/specialist-catalog";
import { LIBRARY_CARD_TITLE_CLASSNAME } from "@/lib/library-card-ui";

const ICONS: Partial<Record<CanonicalService["slug"], LucideIcon>> = {
  "automatisation-ia": Bot,
  "automatisation-processus": Workflow,
  "application-metier": PanelsTopLeft,
  "coach-business": Compass,
  "expert-comptable": Calculator,
  "assistance-administrative": Laptop,
  "publicite-en-ligne": Megaphone,
  "gestion-reseaux-sociaux": MessagesSquare,
  "prospection-ciblee": SearchCheck,
};

function getPriceLabel(service: CanonicalService) {
  if (service.pricing) return service.pricing.label;
  const lowestPackage = service.packages.reduce<CanonicalService["packages"][number] | null>(
    (lowest, current) => !lowest || current.pricing.amountMinor < lowest.pricing.amountMinor
      ? current
      : lowest,
    null,
  );
  if (!lowestPackage) return null;
  return service.packages.length > 1
    ? `À partir de ${lowestPackage.pricing.label}`
    : lowestPackage.pricing.label;
}

function SpecialistCard({ service }: { service: CanonicalService }) {
  const Icon = ICONS[service.slug] ?? Bot;
  const priceLabel = getPriceLabel(service);

  return (
    <article className="min-w-0">
      <Link
        href={service.detailHref}
        className="group flex h-full min-h-60 min-w-0 flex-col rounded-[1.25rem] border border-dema-line bg-dema-paper p-5 text-left shadow-[0_8px_24px_rgba(23,35,29,0.025)] transition hover:-translate-y-0.5 hover:border-dema-forest/30 hover:shadow-[0_12px_30px_rgba(23,35,29,0.065)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dema-forest/35 sm:p-6"
      >
        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-dema-sage text-dema-forest">
          <Icon className="h-5 w-5" strokeWidth={1.7} aria-hidden="true" />
        </span>
        <h3 className={`mt-5 ${LIBRARY_CARD_TITLE_CLASSNAME}`}>{service.name}</h3>
        <p className="mt-3 text-sm leading-6 text-dema-muted">{service.summary}</p>
        {priceLabel ? (
          <p className="mt-auto pt-6 text-sm font-medium text-brand-blue/70">{priceLabel}</p>
        ) : null}
      </Link>
    </article>
  );
}

export default function SpecialistsCatalog({
  sections,
}: {
  sections: readonly SpecialistSection[];
}) {
  const [diagnosticOpen, setDiagnosticOpen] = useState(false);

  return (
    <div>
      <div className="mb-14 flex justify-center sm:mb-16">
        <button
          type="button"
          onClick={() => setDiagnosticOpen(true)}
          className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-dema-forest px-7 text-sm font-semibold text-white transition hover:bg-[#284f3a] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dema-forest/35 focus-visible:ring-offset-2"
        >
          <ClipboardCheck className="h-4 w-4 shrink-0" aria-hidden="true" />
          <span>Diagnostic des besoins</span>
        </button>
      </div>
      <GuestDiagnosticControl
        access={null}
        collectName
        dialogDescription="Une session de 30 à 45 minutes : nous identifions les besoins de votre entreprise pour vous guider vers le bon spécialiste."
        dialogTitle="Diagnostic des besoins"
        onClose={() => setDiagnosticOpen(false)}
        onOpen={() => setDiagnosticOpen(true)}
        open={diagnosticOpen}
        requirePhone
        showCallbackAvailability
        showNavbarTrigger={false}
        situation=""
      />

      <div className="space-y-14 sm:space-y-16">
        {sections.map((section) => (
          <section key={section.id} aria-labelledby={section.id}>
            <h2 id={section.id} className="text-2xl font-normal tracking-[-0.02em] text-brand-blue sm:text-3xl">
              {section.title}
            </h2>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-dema-muted sm:text-base">
              {section.description}
            </p>
            <div className="mt-6 grid min-w-0 grid-cols-1 items-stretch gap-4 md:grid-cols-2 lg:grid-cols-3">
              {section.services.map((service) => (
                <SpecialistCard key={service.slug} service={service} />
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
