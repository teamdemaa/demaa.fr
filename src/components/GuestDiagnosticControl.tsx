"use client";

import { Check, ClipboardCheck, LoaderCircle, X } from "lucide-react";
import { type FormEvent, useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useAccessibleDialog } from "@/components/useAccessibleDialog";
import { getLeadAttributionPayload } from "@/lib/lead-attribution-client";
import type { GuestAccess } from "@/lib/guest-action-plan.client";
import {
  createGuestFollowUpIdempotencyKey,
  submitGuestActionPlanFollowUp,
  submitGuestDiagnosticWithoutPlan,
} from "@/lib/guest-action-plan-follow-up.client";

type Status = "idle" | "sending" | "success" | "error";

export default function GuestDiagnosticControl({
  access,
  dialogDescription = "L’équipe Demaa analyse votre situation et vous propose des pistes concrètes pour améliorer votre organisation.",
  dialogTitle = "Demander un diagnostic de mon organisation",
  onClose,
  onOpen,
  open,
  showNavbarTrigger = true,
  situation,
}: {
  access: GuestAccess | null;
  dialogDescription?: string;
  dialogTitle?: string;
  onClose: () => void;
  onOpen: () => void;
  open: boolean;
  showNavbarTrigger?: boolean;
  situation: string;
}) {
  const [target, setTarget] = useState<HTMLElement | null>(null);
  const [idempotencyKey] = useState(
    () => createGuestFollowUpIdempotencyKey("guest-plan-diagnostic"),
  );
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  const successRef = useRef<HTMLParagraphElement | null>(null);
  const closeDialog = useCallback(() => onClose(), [onClose]);
  const dialogRef = useAccessibleDialog({ isOpen: open, onClose: closeDialog });

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      setTarget(document.getElementById("action-plan-navbar-specialist"));
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    if (status === "success") successRef.current?.focus();
  }, [status]);

  async function requestDiagnostic(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === "sending") return;
    const form = new FormData(event.currentTarget);
    setStatus("sending");
    setError(null);
    try {
      const body = {
        attribution: getLeadAttributionPayload(),
        contactConsent: form.get("contactConsent") === "on",
        email: form.get("email"),
        idempotencyKey,
        message: form.get("message"),
        phone: form.get("phone"),
        ...(!access ? { situation } : {}),
        website: form.get("website"),
      };
      if (access) await submitGuestActionPlanFollowUp("diagnostic", access, body);
      else await submitGuestDiagnosticWithoutPlan(body);
      setStatus("success");
    } catch (requestError) {
      setStatus("error");
      setError(
        requestError instanceof Error
          ? requestError.message
          : "La demande n’a pas pu être envoyée.",
      );
    }
  }

  return (
    <>
      {showNavbarTrigger && target
        ? createPortal(
            <button
              type="button"
              onClick={onOpen}
              className="inline-flex min-h-10 items-center gap-2 whitespace-nowrap rounded-full bg-dema-forest px-3 text-xs font-medium text-white transition hover:bg-brand-blue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dema-forest/30 sm:min-h-11 sm:px-5 sm:text-sm"
              aria-label="Ouvrir le diagnostic de mon organisation"
              title="Ouvrir le diagnostic de mon organisation"
            >
              <ClipboardCheck className="h-4 w-4" aria-hidden="true" />
              <span>Diagnostic organisation</span>
            </button>,
            target,
          )
        : null}

      {open
        ? createPortal(
            <div
              className="fixed inset-0 z-[140] flex items-end justify-center bg-brand-blue/25 p-0 backdrop-blur-sm sm:items-center sm:p-6"
              role="presentation"
              onMouseDown={closeDialog}
            >
              <div
                ref={dialogRef}
                role="dialog"
                aria-modal="true"
                aria-labelledby="guest-diagnostic-title"
                tabIndex={-1}
                className="demaa-dialog-shadow relative max-h-dvh w-full max-w-lg overflow-y-auto rounded-t-[1.5rem] bg-dema-paper p-6 sm:rounded-[1.5rem] sm:p-7"
                onMouseDown={(event) => event.stopPropagation()}
              >
                <button
                  type="button"
                  onClick={closeDialog}
                  className="absolute right-4 top-4 inline-flex h-10 w-10 items-center justify-center rounded-full border border-dema-line text-brand-blue"
                  aria-label="Fermer le diagnostic"
                >
                  <X className="h-4 w-4" aria-hidden="true" />
                </button>
                <ClipboardCheck className="h-5 w-5 text-dema-forest" aria-hidden="true" />
                <h2
                  id="guest-diagnostic-title"
                  className="mt-4 pr-12 text-2xl font-medium tracking-[-0.03em] text-brand-blue"
                >
                  {dialogTitle}
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-dema-muted">
                  {dialogDescription}
                </p>

                {status === "success" ? (
                  <p
                    ref={successRef}
                    tabIndex={-1}
                    className="mt-6 flex items-center gap-2 text-sm text-dema-forest outline-none"
                    role="status"
                  >
                    <Check className="h-4 w-4" aria-hidden="true" />
                    Demande envoyée.
                  </p>
                ) : (
                  <form onSubmit={requestDiagnostic} className="mt-6 space-y-3">
                    <label className="block text-sm text-brand-blue">
                      Qu’est-ce qui vous prend trop de temps aujourd’hui ?
                      <textarea
                        data-dialog-initial-focus
                        name="message"
                        rows={3}
                        maxLength={2_000}
                        required={!access}
                        className="demaa-textarea mt-2"
                      />
                    </label>
                    <label className="block text-sm text-brand-blue">
                      Adresse e-mail
                      <input
                        name="email"
                        type="email"
                        required
                        autoComplete="email"
                        className="demaa-input mt-2"
                      />
                    </label>
                    <label className="block text-sm text-brand-blue">
                      Téléphone <span className="text-dema-muted">(facultatif)</span>
                      <input
                        name="phone"
                        type="tel"
                        autoComplete="tel"
                        className="demaa-input mt-2"
                      />
                    </label>
                    <label className="flex items-start gap-2 text-xs leading-relaxed text-dema-muted">
                      <input
                        name="contactConsent"
                        type="checkbox"
                        required
                        className="mt-0.5 h-4 w-4 accent-dema-forest"
                      />
                      <span>
                        J’accepte que Demaa utilise mes coordonnées{access ? " et ce plan" : ""} pour me répondre par e-mail.
                      </span>
                    </label>
                    <input
                      name="website"
                      tabIndex={-1}
                      autoComplete="off"
                      className="sr-only"
                      aria-hidden="true"
                    />
                    {error ? (
                      <p className="text-sm text-red-700" role="alert">{error}</p>
                    ) : null}
                    <div className="flex items-center gap-3 pt-1">
                      <button
                        type="submit"
                        disabled={status === "sending"}
                        className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-dema-forest px-5 text-sm font-medium text-white disabled:opacity-60"
                      >
                        {status === "sending" ? (
                          <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />
                        ) : null}
                        Envoyer
                      </button>
                      <button
                        type="button"
                        onClick={closeDialog}
                        className="min-h-11 px-3 text-sm text-dema-muted"
                      >
                        Annuler
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>,
            document.body,
          )
        : null}
    </>
  );
}
