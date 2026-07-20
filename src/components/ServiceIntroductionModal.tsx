"use client";

import { useState } from "react";
import { X } from "lucide-react";
import {
  getLeadAttributionPayload,
  trackLeadConversion,
} from "@/lib/lead-attribution-client";
import type { DemaaService } from "@/lib/service-catalog";

type ServiceIntroductionModalProps = {
  service: DemaaService;
  source?: string;
  systemSlug?: string;
  onClose: () => void;
};

const INITIAL_FORM = {
  name: "",
  phone: "",
  email: "",
  company: "",
  details: "",
};

export default function ServiceIntroductionModal({
  service,
  source = "Service modal",
  systemSlug,
  onClose,
}: ServiceIntroductionModalProps) {
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  function handleChange(
    field: keyof typeof INITIAL_FORM,
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    setFormData((current) => ({
      ...current,
      [field]: event.target.value,
    }));
  }

  function validateForm() {
    if (!formData.name.trim()) return "Merci d'indiquer votre nom.";
    if (!formData.phone.trim()) return "Merci d'indiquer votre téléphone ou WhatsApp.";
    return null;
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await fetch("/api/service-introduction-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          attribution: getLeadAttributionPayload(),
          serviceName: service.name,
          serviceSlug: service.slug,
          source,
          sourceUrl: window.location.href,
          systemSlug,
        }),
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

      setSuccessMessage("Demande envoyée. On vous recontacte rapidement.");
      trackLeadConversion({
        requestType: "service_introduction",
        systemSlug,
      });
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
  }

  return (
    <div
      className="fixed inset-0 z-[90] flex items-center justify-center bg-brand-blue/45 px-4 py-8"
      role="dialog"
      aria-modal="true"
      aria-label={`Demande de mise en relation pour ${service.name}`}
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-[1.25rem] border border-dema-line bg-dema-paper p-6 shadow-[0_24px_70px_rgba(23,35,29,0.2)]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-dema-forest">
              Mise en relation
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-brand-blue">
              {service.name}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-dema-line bg-dema-paper text-brand-blue transition hover:border-dema-forest/25 hover:text-dema-forest"
            aria-label="Fermer"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        {successMessage ? (
          <div className="mt-5 rounded-[1rem] border border-dema-line bg-dema-sage/55 px-4 py-3">
            <p className="text-sm font-medium text-brand-blue">{successMessage}</p>
          </div>
        ) : (
          <form className="mt-5 space-y-3" onSubmit={handleSubmit}>
            <input
              value={formData.name}
              onChange={(event) => handleChange("name", event)}
              placeholder="Nom"
              className="demaa-input"
            />
            <input
              value={formData.phone}
              onChange={(event) => handleChange("phone", event)}
              placeholder="Téléphone / WhatsApp"
              className="demaa-input"
            />
            <input
              value={formData.email}
              onChange={(event) => handleChange("email", event)}
              placeholder="Email"
              className="demaa-input"
            />
            <input
              value={formData.company}
              onChange={(event) => handleChange("company", event)}
              placeholder="Entreprise"
              className="demaa-input"
            />
            <textarea
              value={formData.details}
              onChange={(event) => handleChange("details", event)}
              placeholder="Votre besoin ou contexte"
              rows={4}
              className="demaa-textarea"
            />

            {error ? <p className="text-sm text-dema-forest">{error}</p> : null}

            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex w-full items-center justify-center rounded-full bg-dema-forest px-5 py-3 text-sm font-semibold text-dema-paper transition hover:bg-brand-blue disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? "Envoi en cours..." : "Envoyer la demande"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
