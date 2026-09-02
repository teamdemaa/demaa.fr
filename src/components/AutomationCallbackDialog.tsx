"use client";

import DirectoryDetailDialogShell from "@/components/DirectoryDetailDialogShell";
import ServiceCallbackForm from "@/components/ServiceCallbackForm";
import { AUTOMATION_OFFER } from "@/lib/automation-offer";

const AUTOMATION_PACKAGE = [{
  name: AUTOMATION_OFFER.name,
  pricing: {
    label: AUTOMATION_OFFER.price.label,
    note: "Un mois pour organiser votre fonctionnement et mettre en place les éléments validés avec vous.",
  },
  slug: AUTOMATION_OFFER.packageSlug,
  summary: AUTOMATION_OFFER.summary,
}] as const;

export default function AutomationCallbackDialog({ onClose }: { onClose: () => void }) {
  return (
    <DirectoryDetailDialogShell
      ariaLabel="Demande de rappel pour un accompagnement à l’automatisation"
      maxWidthClassName="max-w-lg"
      onClose={onClose}
    >
      <div className="mx-auto max-w-md">
        <p className="text-sm font-medium text-dema-forest">
          Accompagnement automatisation et IA
        </p>
        <h2 className="mt-3 text-3xl font-light leading-tight tracking-[-0.04em] text-brand-blue">
          Parlons de votre organisation.
        </h2>
        <p className="mt-4 text-sm leading-6 text-dema-muted">
          Laissez-nous vos coordonnées. Nous vous rappelons pour comprendre ce qui vous prend du temps et vérifier si l’accompagnement peut vous convenir.
        </p>
        <ServiceCallbackForm
          packages={AUTOMATION_PACKAGE}
          serviceSlug="automatisation-processus"
          submitLabel="Envoyer ma demande"
          successMessage="Votre demande est bien envoyée. Nous vous recontactons rapidement."
        />
      </div>
    </DirectoryDetailDialogShell>
  );
}
