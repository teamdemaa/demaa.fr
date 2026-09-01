"use client";

import DirectoryDetailDialogShell from "@/components/DirectoryDetailDialogShell";
import ServiceCallbackForm from "@/components/ServiceCallbackForm";
import { AUTOMATION_OFFER } from "@/lib/automation-offer";

const AUTOMATION_PACKAGE = [{
  name: AUTOMATION_OFFER.name,
  pricing: {
    label: AUTOMATION_OFFER.price.label,
    note: "Les sujets avancent selon vos priorités pendant les huit semaines.",
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
          Accompagnement à l’automatisation
        </p>
        <h2 className="mt-3 text-3xl font-light leading-tight tracking-[-0.04em] text-brand-blue">
          Parlons de votre besoin.
        </h2>
        <p className="mt-4 text-sm leading-6 text-dema-muted">
          Laissez-nous votre numéro. Nous vous rappellerons pour comprendre vos priorités et vérifier si cet accompagnement est adapté à votre équipe.
        </p>
        <ServiceCallbackForm
          packages={AUTOMATION_PACKAGE}
          serviceSlug="automatisation-processus"
          submitLabel="Demander à être rappelé"
          successMessage="Votre demande est bien envoyée. Nous vous recontactons rapidement."
        />
      </div>
    </DirectoryDetailDialogShell>
  );
}
