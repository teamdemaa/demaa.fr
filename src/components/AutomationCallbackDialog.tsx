"use client";

import DirectoryDetailDialogShell from "@/components/DirectoryDetailDialogShell";
import ServiceCallbackForm from "@/components/ServiceCallbackForm";
import { AUTOMATION_OFFER } from "@/lib/automation-offer";

const AUTOMATION_PACKAGE = [{
  name: AUTOMATION_OFFER.name,
  pricing: {
    label: AUTOMATION_OFFER.price.label,
    note: "Un mois pour mettre en place les systèmes opérationnels prioritaires définis avec vous.",
  },
  slug: AUTOMATION_OFFER.packageSlug,
  summary: AUTOMATION_OFFER.summary,
}] as const;

export default function AutomationCallbackDialog({ onClose }: { onClose: () => void }) {
  return (
    <DirectoryDetailDialogShell
      ariaLabel="Demande de rappel pour la mise en place de systèmes opérationnels"
      maxWidthClassName="max-w-lg"
      onClose={onClose}
    >
      <div className="mx-auto max-w-md">
        <p className="text-sm font-medium text-dema-forest">
          Mise en place de systèmes opérationnels
        </p>
        <h2 className="mt-3 text-3xl font-light leading-tight tracking-[-0.04em] text-brand-blue">
          Parlons de votre organisation.
        </h2>
        <p className="mt-4 text-sm leading-6 text-dema-muted">
          Laissez-nous vos coordonnées. Nous vous rappelons pour comprendre ce qui repose encore sur vous et identifier les systèmes à mettre en place en priorité.
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
