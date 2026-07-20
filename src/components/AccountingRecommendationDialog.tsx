"use client";

import type React from "react";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { Briefcase, LoaderCircle, X } from "lucide-react";
import {
  getLeadAttributionPayload,
  trackLeadConversion,
} from "@/lib/lead-attribution-client";
import {
  clearLeadSubmissionKey,
  getLeadSubmissionKey,
} from "@/lib/lead-submission-client";

type AccountingRecommendationDialogProps = {
  buttonClassName: string;
  sectorLabel: string;
  systemName: string;
  systemSlug: string;
  triggerContent?: React.ReactNode;
};

const INITIAL_FORM = {
  lastName: "",
  firstName: "",
  phone: "",
  email: "",
  website: "",
};

export default function AccountingRecommendationDialog({
  buttonClassName,
  sectorLabel,
  systemSlug,
  triggerContent,
}: AccountingRecommendationDialogProps) {
  const fieldId = useId();
  const triggerButtonRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  function handleChange(field: keyof typeof INITIAL_FORM, value: string) {
    setFormData((current) => ({ ...current, [field]: value }));
    if (error) setError(null);
  }

  const closeDialog = useCallback(() => {
    setIsOpen(false);
    setFormData(INITIAL_FORM);
    setIsSubmitting(false);
    setError(null);
    setSuccess(null);
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    const previouslyFocused = document.activeElement instanceof HTMLElement
      ? document.activeElement
      : null;
    const previousBodyOverflow = document.body.style.overflow;
    const dialog = dialogRef.current;

    document.body.style.overflow = "hidden";

    const getFocusableElements = () =>
      Array.from(
        dialog?.querySelectorAll<HTMLElement>(
          'button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [href], [tabindex]:not([tabindex="-1"])',
        ) ?? [],
      ).filter((element) => element.getAttribute("aria-hidden") !== "true");

    getFocusableElements()[0]?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        closeDialog();
        return;
      }

      if (event.key !== "Tab") return;

      const focusableElements = getFocusableElements();
      const firstFocusable = focusableElements[0];
      const lastFocusable = focusableElements.at(-1);

      if (!firstFocusable || !lastFocusable) {
        event.preventDefault();
        dialog?.focus();
        return;
      }

      if (event.shiftKey && document.activeElement === firstFocusable) {
        event.preventDefault();
        lastFocusable.focus();
      } else if (!event.shiftKey && document.activeElement === lastFocusable) {
        event.preventDefault();
        firstFocusable.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousBodyOverflow;
      previouslyFocused?.focus();
    };
  }, [closeDialog, isOpen]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (
      !formData.lastName.trim() ||
      !formData.firstName.trim() ||
      !formData.phone.trim() ||
      !formData.email.trim()
    ) {
      setError("Merci de remplir vos nom, prénom, téléphone et email.");
      return;
    }

    try {
      setIsSubmitting(true);
      const flowKey = `accounting-recommendation:${systemSlug}`;
      const idempotencyKey = getLeadSubmissionKey(flowKey);
      const response = await fetch("/api/accounting-directory-appointment-request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          attribution: getLeadAttributionPayload(),
          recommendationRequest: true,
          lastName: formData.lastName,
          firstName: formData.firstName,
          phone: formData.phone,
          email: formData.email,
          idempotencyKey,
          sourceUrl: window.location.href,
          systemSlug,
          website: formData.website,
        }),
      });
      const payload = (await response.json().catch(() => null)) as
        | { error?: string }
        | null;

      if (!response.ok) {
        throw new Error(
          payload?.error ||
            "Impossible d’envoyer la demande pour le moment. Merci de réessayer.",
        );
      }

      clearLeadSubmissionKey(flowKey);
      setSuccess("Demande envoyée. Nous revenons vers vous avec un expert-comptable adapté.");
      trackLeadConversion({
        requestType: "accounting_recommendation",
        systemSlug,
      });
      setFormData(INITIAL_FORM);
    } catch (submissionError) {
      setError(
        submissionError instanceof Error
          ? submissionError.message
          : "Impossible d’envoyer la demande pour le moment. Merci de réessayer.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <button
        ref={triggerButtonRef}
        type="button"
        className={buttonClassName}
        onClick={() => setIsOpen(true)}
        aria-haspopup="dialog"
      >
        {triggerContent ?? (
          <>
            <div className="flex items-start justify-between gap-4">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-dema-sage text-dema-forest transition group-hover:bg-dema-forest group-hover:text-dema-paper">
                <Briefcase className="h-4 w-4" aria-hidden="true" />
              </span>
            </div>
            <p className="mt-4 text-[10px] font-semibold uppercase tracking-[0.14em] text-dema-muted">
              Comptabilité & pilotage
            </p>
            <h3 className="mt-2 line-clamp-2 text-lg font-semibold leading-snug text-brand-blue">
              Trouver un expert-comptable
            </h3>
            <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-dema-muted">
              Recevoir la recommandation d’un professionnel adapté à votre activité et à votre secteur.
            </p>
          </>
        )}
      </button>

      {isOpen ? (
        <div
          className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto bg-brand-blue/45 px-4 py-4 sm:py-8"
          onClick={closeDialog}
        >
          <div
            ref={dialogRef}
            className="my-auto max-h-[calc(100dvh-2rem)] w-full max-w-xl overflow-y-auto rounded-[1.25rem] border border-dema-line bg-dema-paper p-6 shadow-[0_24px_70px_rgba(23,35,29,0.2)] sm:max-h-[calc(100dvh-4rem)]"
            role="dialog"
            aria-modal="true"
            aria-labelledby={`${fieldId}-title`}
            aria-describedby={`${fieldId}-description`}
            tabIndex={-1}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-dema-forest">
                  Mise en relation
                </p>
                <h2
                  id={`${fieldId}-title`}
                  className="mt-2 text-2xl font-semibold tracking-tight text-brand-blue"
                >
                  On vous recommande l’expert-comptable adapté à votre activité
                </h2>
                <p
                  id={`${fieldId}-description`}
                  className="mt-2 text-sm leading-relaxed text-dema-muted"
                >
                  Secteur pris en compte automatiquement : {sectorLabel}
                </p>
              </div>
              <button
                type="button"
                onClick={closeDialog}
                className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-dema-line bg-dema-paper text-brand-blue transition hover:border-dema-forest/25 hover:text-dema-forest"
                aria-label="Fermer"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>

            {success ? (
              <div
                className="mt-5 rounded-[1rem] border border-dema-line bg-dema-sage/55 px-4 py-3"
                role="status"
              >
                <p className="text-sm font-medium text-brand-blue">{success}</p>
              </div>
            ) : (
              <form className="mt-5 space-y-4" onSubmit={handleSubmit}>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field
                    id={`${fieldId}-last-name`}
                    label="Nom"
                    value={formData.lastName}
                    onChange={(value) => handleChange("lastName", value)}
                    autoComplete="family-name"
                  />
                  <Field
                    id={`${fieldId}-first-name`}
                    label="Prénom"
                    value={formData.firstName}
                    onChange={(value) => handleChange("firstName", value)}
                    autoComplete="given-name"
                  />
                  <Field
                    id={`${fieldId}-phone`}
                    label="Numéro de téléphone"
                    value={formData.phone}
                    onChange={(value) => handleChange("phone", value)}
                    autoComplete="tel"
                    type="tel"
                  />
                  <Field
                    id={`${fieldId}-email`}
                    label="Email"
                    value={formData.email}
                    onChange={(value) => handleChange("email", value)}
                    autoComplete="email"
                    type="email"
                  />
                </div>

                <input
                  type="text"
                  value={formData.website}
                  onChange={(event) => handleChange("website", event.target.value)}
                  tabIndex={-1}
                  autoComplete="off"
                  className="hidden"
                  aria-hidden="true"
                />

                {error ? (
                  <p className="text-sm text-dema-forest" role="alert">
                    {error}
                  </p>
                ) : null}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-dema-forest px-5 py-3 text-sm font-semibold text-dema-paper transition hover:bg-brand-blue disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSubmitting ? (
                    <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />
                  ) : null}
                  {isSubmitting ? "Envoi en cours..." : "Recevoir ma recommandation"}
                </button>
              </form>
            )}
          </div>
        </div>
      ) : null}
    </>
  );
}

function Field({
  id,
  label,
  value,
  onChange,
  type = "text",
  autoComplete,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  autoComplete: string;
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-brand-blue">
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        autoComplete={autoComplete}
        className="demaa-input"
      />
    </div>
  );
}
