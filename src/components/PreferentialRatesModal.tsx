"use client";

import { Check, HandCoins, LoaderCircle, X } from "lucide-react";
import { type FormEvent, useEffect, useRef, useState } from "react";
import {
  getLeadAttributionPayload,
  trackLeadConversion,
} from "@/lib/lead-attribution-client";
import {
  clearLeadSubmissionKey,
  getLeadSubmissionKey,
} from "@/lib/lead-submission-client";
import { isValidEmail } from "@/lib/email";

type PreferentialRatesModalProps = {
  onClose: () => void;
  systemSlug: string;
};

type SubscribePayload = { error?: string } | { ok: true } | null;

function getErrorMessage(response: Response, payload: SubscribePayload) {
  const serverError = payload && "error" in payload ? payload.error : undefined;
  if (response.status === 400 && serverError) return serverError;
  if (response.status === 429) {
    return "Vous avez effectué trop de demandes. Réessayez un peu plus tard.";
  }
  return "Impossible d’enregistrer votre inscription pour le moment. Réessayez dans quelques instants.";
}

export default function PreferentialRatesModal({
  onClose,
  systemSlug,
}: PreferentialRatesModalProps) {
  const dialogRef = useRef<HTMLElement>(null);
  const emailInputRef = useRef<HTMLInputElement>(null);
  const successRef = useRef<HTMLDivElement>(null);
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    const previouslyFocused =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const dialog = dialogRef.current;

    function getFocusableElements() {
      return Array.from(
        dialog?.querySelectorAll<HTMLElement>(
          'button:not([disabled]), input:not([disabled]):not([type="hidden"]), [href], [tabindex]:not([tabindex="-1"])',
        ) ?? [],
      ).filter((element) => element.getAttribute("aria-hidden") !== "true");
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
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

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleKeyDown);
    emailInputRef.current?.focus();

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
      previouslyFocused?.focus();
    };
  }, [onClose]);

  useEffect(() => {
    if (isSuccess) successRef.current?.focus();
  }, [isSuccess]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSubmitting) return;

    const normalizedEmail = email.trim();
    if (!normalizedEmail) {
      setError("Merci de renseigner votre adresse e-mail.");
      return;
    }
    if (!isValidEmail(normalizedEmail)) {
      setError("Merci d’indiquer une adresse e-mail valide.");
      return;
    }

    setError(null);
    setIsSubmitting(true);

    const flowKey = `preferential-rates:${systemSlug}`;

    try {
      const response = await fetch("/api/preferential-rates/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          attribution: getLeadAttributionPayload(),
          email: normalizedEmail,
          idempotencyKey: getLeadSubmissionKey(flowKey),
          systemSlug,
          website,
        }),
      });
      const payload = (await response.json().catch(() => null)) as SubscribePayload;

      if (!response.ok || !payload || !("ok" in payload) || payload.ok !== true) {
        setError(getErrorMessage(response, payload));
        return;
      }

      clearLeadSubmissionKey(flowKey);
      setIsSuccess(true);
      trackLeadConversion({ requestType: "preferential_rates_subscription", systemSlug });
    } catch {
      setError(
        "Impossible d’enregistrer votre inscription pour le moment. Réessayez dans quelques instants.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center overflow-y-auto bg-brand-blue/35 px-4 py-4 backdrop-blur-sm sm:py-6"
      onClick={onClose}
    >
      <section
        ref={dialogRef}
        className="relative max-h-[calc(100dvh-2rem)] w-full max-w-[28rem] overflow-y-auto rounded-[1.5rem] border border-dema-line bg-dema-paper shadow-[0_24px_70px_rgba(23,35,29,0.14)] sm:max-h-[calc(100dvh-3rem)]"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="preferential-rates-modal-title"
        aria-describedby="preferential-rates-modal-description"
        tabIndex={-1}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Fermer"
          className="absolute right-4 top-4 z-10 inline-flex h-10 w-10 items-center justify-center rounded-full bg-dema-paper/90 text-brand-blue transition hover:bg-dema-sage hover:text-dema-forest focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dema-forest/35"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>

        <div className="flex flex-col p-6 sm:p-8">
          {isSuccess ? (
            <div ref={successRef} className="outline-none" role="status" tabIndex={-1}>
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-dema-sage text-dema-forest">
                <Check className="h-5 w-5" aria-hidden="true" />
              </span>
              <h2
                id="preferential-rates-modal-title"
                className="mt-5 pr-10 text-2xl font-semibold leading-tight tracking-[-0.025em] text-brand-blue"
              >
                Vous y êtes.
              </h2>
              <p
                id="preferential-rates-modal-description"
                className="mt-3 text-sm leading-relaxed text-dema-muted"
              >
                Vous recevrez les tarifs négociés dès votre première demande de mise en relation
                avec un partenaire.
              </p>
              <button
                type="button"
                onClick={onClose}
                className="demaa-primary-button mt-6 inline-flex w-full items-center justify-center"
              >
                Fermer
              </button>
            </div>
          ) : (
            <>
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-dema-sage text-dema-forest">
                <HandCoins className="h-5 w-5" aria-hidden="true" />
              </span>
              <h2
                id="preferential-rates-modal-title"
                className="mt-4 pr-10 text-2xl font-semibold leading-tight tracking-[-0.025em] text-brand-blue"
              >
                Recevoir les tarifs préférentiels
              </h2>
              <p
                id="preferential-rates-modal-description"
                className="mt-3 text-sm leading-relaxed text-dema-muted"
              >
                Laissez votre e-mail pour recevoir la liste des partenaires recommandés et les
                réductions négociées pour vous.
              </p>

              <form
                className="mt-6 space-y-3"
                onSubmit={handleSubmit}
                aria-busy={isSubmitting}
                noValidate
              >
                <label
                  className="block text-sm font-medium text-brand-blue"
                  htmlFor="preferential-rates-email"
                >
                  Adresse e-mail
                </label>
                <input
                  ref={emailInputRef}
                  id="preferential-rates-email"
                  name="email"
                  className="demaa-input"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  autoComplete="email"
                  required
                />

                <div
                  className="absolute -left-[10000px] top-auto h-px w-px overflow-hidden"
                  aria-hidden="true"
                >
                  <label htmlFor="preferential-rates-website">Site internet</label>
                  <input
                    id="preferential-rates-website"
                    name="website"
                    type="text"
                    value={website}
                    onChange={(event) => setWebsite(event.target.value)}
                    tabIndex={-1}
                    autoComplete="off"
                  />
                </div>

                {error ? (
                  <p className="text-sm text-brand-coral" role="alert">
                    {error}
                  </p>
                ) : null}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="demaa-primary-button mt-3 inline-flex w-full items-center justify-center gap-2 disabled:cursor-wait disabled:opacity-60"
                >
                  {isSubmitting ? (
                    <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />
                  ) : null}
                  {isSubmitting ? "Envoi…" : "Recevoir les tarifs préférentiels"}
                </button>
              </form>
            </>
          )}
        </div>
      </section>
    </div>
  );
}
