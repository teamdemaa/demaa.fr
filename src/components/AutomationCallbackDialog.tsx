"use client";

import DirectoryDetailDialogShell from "@/components/DirectoryDetailDialogShell";
import ServiceCallbackForm from "@/components/ServiceCallbackForm";

const AUTOMATION_PACKAGE = [{
  name: "Accompagnement à l’automatisation",
  pricing: {
    label: "3 000 € HT",
    note: "Le programme est défini après le diagnostic.",
  },
  slug: "automatisation-essentielle",
  summary: "Deux mois pour cadrer jusqu’à 3 processus prioritaires et rendre votre équipe autonome.",
}] as const;

export default function AutomationCallbackDialog({ onClose }: { onClose: () => void }) {
  return (
    <DirectoryDetailDialogShell
      ariaLabel="Demande de rappel pour un besoin d’automatisation"
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
          Laissez-nous votre numéro. Nous vous rappellerons pour comprendre votre situation et vérifier si cet accompagnement est adapté.
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
