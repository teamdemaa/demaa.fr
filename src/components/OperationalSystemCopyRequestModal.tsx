"use client";

import { Check, LoaderCircle, Mail, X } from "lucide-react";
import Link from "next/link";
import {
  type FormEvent,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  getLeadAttributionPayload,
  trackLeadConversion,
} from "@/lib/lead-attribution-client";
import {
  clearLeadSubmissionKey,
  getLeadSubmissionKey,
} from "@/lib/lead-submission-client";
import { isValidEmail } from "@/lib/email";
import { trackSystemJourneyEvent } from "@/lib/kit-analytics-client";
import type {
  OperationalSystemDeliveryRequest,
  OperationalSystemDeliverySuccess,
} from "@/lib/operational-system-delivery-contract";

type OperationalSystemCopyRequestModalProps = {
  onClose: () => void;
  systemName: string;
  systemSlug: string;
};

type DeliveryErrorPayload = {
  error?: string;
};

type DeliveryPayload =
  | DeliveryErrorPayload
  | OperationalSystemDeliverySuccess
  | null;

function isSuccessfulPayload(
  payload: DeliveryPayload,
): payload is OperationalSystemDeliverySuccess {
  return Boolean(payload && "ok" in payload && payload.ok === true);
}

function getErrorMessage(response: Response, payload: DeliveryPayload) {
  const serverError =
    payload && "error" in payload ? payload.error : undefined;

  if (response.status === 400 && serverError) {
    return serverError;
  }
  if (response.status === 404) {
    return "Cette copie n’est pas disponible pour le moment.";
  }
  if (response.status === 429) {
    return "Vous avez effectué trop de demandes. Réessayez un peu plus tard.";
  }

  return "Impossible d’envoyer le lien pour le moment. Réessayez dans quelques instants.";
}

export default function OperationalSystemCopyRequestModal({
  onClose,
  systemName,
  systemSlug,
}: OperationalSystemCopyRequestModalProps) {
  const dialogRef = useRef<HTMLElement>(null);
  const firstNameInputRef = useRef<HTMLInputElement>(null);
  const successRef = useRef<HTMLDivElement>(null);
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [firstName, setFirstName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccessful, setIsSuccessful] = useState(false);
  const [website, setWebsite] = useState("");

  useEffect(() => {
    const previouslyFocused =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
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
    firstNameInputRef.current?.focus();

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
      previouslyFocused?.focus();
    };
  }, [onClose]);

  useEffect(() => {
    if (isSuccessful) successRef.current?.focus();
  }, [isSuccessful]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSubmitting) return;

    const normalizedFirstName = firstName.trim();
    const normalizedEmail = email.trim();
    if (!normalizedFirstName || !normalizedEmail) {
      setError("Merci de renseigner votre prénom et votre adresse e-mail.");
      return;
    }
    if (!isValidEmail(normalizedEmail)) {
      setError("Merci d’indiquer une adresse e-mail valide.");
      return;
    }

    setError(null);
    setIsSubmitting(true);
    trackSystemJourneyEvent("system_copy_form_submitted", { systemSlug });

    const flowKey = `system-copy:${systemSlug}`;
    const requestPayload: OperationalSystemDeliveryRequest = {
      attribution: getLeadAttributionPayload(),
      email: normalizedEmail,
      firstName: normalizedFirstName,
      idempotencyKey: getLeadSubmissionKey(flowKey),
      systemSlug,
      website,
    };

    try {
      const response = await fetch("/api/systeme-kit/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestPayload),
      });
      const payload = (await response.json().catch(() => null)) as DeliveryPayload;

      if (!response.ok || !isSuccessfulPayload(payload)) {
        setError(getErrorMessage(response, payload));
        trackSystemJourneyEvent("system_copy_form_failed", {
          statusCode: response.status,
          systemSlug,
        });
        return;
      }

      clearLeadSubmissionKey(flowKey);
      setIsSuccessful(true);
      trackLeadConversion({
        requestType: "system_kit_request",
        systemSlug,
      });
    } catch {
      setError(
        "Impossible d’envoyer le lien pour le moment. Réessayez dans quelques instants.",
      );
      trackSystemJourneyEvent("system_copy_form_failed", { systemSlug });
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
        className="relative max-h-[calc(100dvh-2rem)] w-full max-w-[30rem] overflow-y-auto rounded-[1.5rem] border border-dema-line bg-dema-paper shadow-[0_24px_70px_rgba(23,35,29,0.14)] sm:max-h-[calc(100dvh-3rem)]"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="system-copy-modal-title"
        aria-describedby="system-copy-modal-description"
        tabIndex={-1}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Fermer"
          className="absolute right-4 top-4 inline-flex h-10 w-10 items-center justify-center rounded-full text-brand-blue transition hover:bg-dema-sage/55 hover:text-dema-forest focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dema-forest/35"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>

        <div className="p-6 sm:p-8">
          <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-dema-sage text-dema-forest">
            {isSuccessful ? (
              <Check className="h-5 w-5" aria-hidden="true" />
            ) : (
              <Mail className="h-5 w-5" aria-hidden="true" />
            )}
          </span>

          <h2
            id="system-copy-modal-title"
            className="mt-5 pr-10 text-2xl font-semibold tracking-tight text-brand-blue"
          >
            {isSuccessful ? "C’est envoyé" : "Recevoir ma copie modifiable"}
          </h2>

          <p
            id="system-copy-modal-description"
            className="mt-3 text-sm leading-relaxed text-dema-muted"
          >
            {isSuccessful
              ? "Le lien permettant de créer votre copie personnelle dans Google Drive vient d’être envoyé par e-mail. Pensez à vérifier vos courriers indésirables."
              : "Nous vous envoyons le lien permettant de créer votre copie personnelle dans Google Drive."}
          </p>

          {isSuccessful ? (
            <div
              ref={successRef}
              className="mt-6 rounded-[1rem] bg-dema-cream/55 p-5 outline-none"
              role="status"
              tabIndex={-1}
            >
              <p className="text-sm leading-relaxed text-dema-muted">
                Votre demande pour le système opérationnel {systemName} a bien
                été prise en compte.
              </p>
              <button
                type="button"
                onClick={onClose}
                className="demaa-primary-button mt-5 inline-flex w-full items-center justify-center"
              >
                Fermer
              </button>
            </div>
          ) : (
            <form
              className="mt-6 space-y-3"
              onSubmit={handleSubmit}
              aria-busy={isSubmitting}
              noValidate
            >
              <label
                className="block text-sm font-medium text-brand-blue"
                htmlFor="system-copy-first-name"
              >
                Prénom
              </label>
              <input
                ref={firstNameInputRef}
                id="system-copy-first-name"
                name="firstName"
                className="demaa-input"
                value={firstName}
                onChange={(event) => setFirstName(event.target.value)}
                autoComplete="given-name"
                required
              />

              <label
                className="block pt-1 text-sm font-medium text-brand-blue"
                htmlFor="system-copy-email"
              >
                Adresse e-mail
              </label>
              <input
                id="system-copy-email"
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
                <label htmlFor="system-copy-website">Site internet</label>
                <input
                  id="system-copy-website"
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
                  <LoaderCircle
                    className="h-4 w-4 animate-spin"
                    aria-hidden="true"
                  />
                ) : null}
                {isSubmitting ? "Envoi…" : "Recevoir ma copie"}
              </button>

              <p className="text-center text-xs leading-relaxed text-dema-muted">
                Ces informations sont utilisées pour vous envoyer la copie
                demandée.{" "}
                <Link
                  href="/politique-de-confidentialite"
                  className="font-medium text-dema-forest underline underline-offset-2"
                >
                  Politique de confidentialité
                </Link>
              </p>
            </form>
          )}
        </div>
      </section>
    </div>
  );
}
