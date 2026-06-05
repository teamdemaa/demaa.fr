"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";

type SystemSetupModalProps = {
  isOpen: boolean;
  onClose: () => void;
  initialSector?: string;
};

const INITIAL_FORM = {
  firstName: "",
  sector: "",
  whatsapp: "",
  availability: "",
};

export default function SystemSetupModal({
  isOpen,
  onClose,
  initialSector,
}: SystemSetupModalProps) {
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    setFormData((current) => ({
      ...current,
      sector: initialSector ?? "",
    }));
  }, [initialSector, isOpen]);

  if (!isOpen) return null;

  const handleChange =
    (field: keyof typeof INITIAL_FORM) =>
    (
      event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
      setFormData((current) => ({
        ...current,
        [field]: event.target.value,
      }));
    };

  const handleClose = () => {
    setError(null);
    setSuccessMessage(null);
    onClose();
  };

  const validateForm = () => {
    if (!formData.firstName.trim()) return "Merci d'indiquer votre prénom.";
    if (!formData.sector.trim()) return "Merci d'indiquer votre secteur d'activité.";
    if (!formData.whatsapp.trim()) return "Merci d'indiquer votre WhatsApp.";
    if (!formData.availability.trim()) return "Merci d'indiquer vos disponibilités pour l'appel.";
    return null;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await fetch("/api/system-setup-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const payload = (await response.json().catch(() => null)) as
        | { error?: string }
        | null;

      if (!response.ok) {
        throw new Error(
          payload?.error ||
            "Impossible d'envoyer votre demande pour le moment. Merci de réessayer."
        );
      }

      setSuccessMessage(
        `Merci ${formData.firstName.trim()}, on vous recontacte rapidement sur WhatsApp.`
      );
      setFormData(INITIAL_FORM);
    } catch (submissionError) {
      setError(
        submissionError instanceof Error
          ? submissionError.message
          : "Impossible d'envoyer votre demande pour le moment. Merci de réessayer."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-brand-blue/35 px-4 py-8"
      onClick={handleClose}
    >
      <div
        className="w-full max-w-xl rounded-[1.25rem] border border-dema-line bg-dema-paper p-6 shadow-[0_24px_60px_rgba(23,35,29,0.14)] md:p-8"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-dema-forest">
              Audit de votre organisation
            </p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight text-brand-blue">
              Audit de votre organisation
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-dema-muted">
              C&apos;est un appel gratuit de 30 minutes. Vous exposez votre
              organisation, vos blocages et on identifie les premières améliorations ensemble.
            </p>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="rounded-full border border-dema-line bg-dema-paper p-2 text-brand-blue transition hover:border-dema-forest/25 hover:text-dema-forest"
            aria-label="Fermer la fenêtre"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {successMessage ? (
          <div className="mt-6 rounded-[1.25rem] border border-dema-line bg-dema-paper px-5 py-4">
            <p className="text-sm font-medium text-brand-blue">{successMessage}</p>
          </div>
        ) : (
          <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
            <input
              value={formData.firstName}
              onChange={handleChange("firstName")}
              placeholder="Prénom"
              className="demaa-input"
            />
            <input
              value={formData.sector}
              onChange={handleChange("sector")}
              placeholder="Secteur d&apos;activité"
              className="demaa-input"
            />
            <input
              value={formData.whatsapp}
              onChange={handleChange("whatsapp")}
              placeholder="Numéro WhatsApp"
              className="demaa-input"
            />
            <textarea
              value={formData.availability}
              onChange={handleChange("availability")}
              placeholder="Vos disponibilités pour un appel"
              rows={4}
              className="demaa-textarea"
            />

            {error ? (
              <p className="text-sm text-dema-forest">{error}</p>
            ) : null}

            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex rounded-full bg-dema-forest px-6 py-3 text-sm font-medium text-dema-paper transition hover:bg-[#284f3a] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? "Envoi en cours..." : "Être recontacté"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
