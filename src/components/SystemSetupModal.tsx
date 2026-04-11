"use client";

import { useState } from "react";
import { X } from "lucide-react";

type SystemSetupModalProps = {
  isOpen: boolean;
  onClose: () => void;
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
}: SystemSetupModalProps) {
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

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
        className="w-full max-w-xl rounded-[2rem] border border-brand-blue/8 bg-[#FFF9F8] p-6 shadow-[0_30px_80px_rgba(25,27,48,0.18)] md:p-8"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-brand-coral">
              Audit de vos systèmes
            </p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight text-brand-blue">
              Audit de vos systèmes
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-gray-600">
              Donnez-nous juste l&apos;essentiel. On vous recontacte sur WhatsApp
              pour cadrer le bon système à mettre en place.
            </p>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="rounded-full border border-brand-blue/10 bg-white p-2 text-brand-blue transition hover:border-brand-coral/20 hover:text-brand-coral"
            aria-label="Fermer la fenêtre"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {successMessage ? (
          <div className="mt-6 rounded-[1.5rem] border border-brand-coral/15 bg-white px-5 py-4">
            <p className="text-sm font-medium text-brand-blue">{successMessage}</p>
          </div>
        ) : (
          <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
            <input
              value={formData.firstName}
              onChange={handleChange("firstName")}
              placeholder="Prénom"
              className="w-full rounded-[1.25rem] border border-brand-blue/10 bg-white px-4 py-3 text-sm text-brand-blue outline-none transition placeholder:text-brand-blue/40 focus:border-brand-coral/25"
            />
            <input
              value={formData.sector}
              onChange={handleChange("sector")}
              placeholder="Secteur d&apos;activité"
              className="w-full rounded-[1.25rem] border border-brand-blue/10 bg-white px-4 py-3 text-sm text-brand-blue outline-none transition placeholder:text-brand-blue/40 focus:border-brand-coral/25"
            />
            <input
              value={formData.whatsapp}
              onChange={handleChange("whatsapp")}
              placeholder="Numéro WhatsApp"
              className="w-full rounded-[1.25rem] border border-brand-blue/10 bg-white px-4 py-3 text-sm text-brand-blue outline-none transition placeholder:text-brand-blue/40 focus:border-brand-coral/25"
            />
            <textarea
              value={formData.availability}
              onChange={handleChange("availability")}
              placeholder="Vos disponibilités pour un appel"
              rows={4}
              className="w-full resize-none rounded-[1.25rem] border border-brand-blue/10 bg-white px-4 py-3 text-sm text-brand-blue outline-none transition placeholder:text-brand-blue/40 focus:border-brand-coral/25"
            />

            {error ? (
              <p className="text-sm text-red-500">{error}</p>
            ) : null}

            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex rounded-full bg-brand-blue px-6 py-3 text-sm font-medium text-white transition hover:bg-brand-coral disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? "Envoi en cours..." : "Être recontacté"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
