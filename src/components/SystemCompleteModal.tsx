"use client";

import { ExternalLink, LoaderCircle, Mail, X } from "lucide-react";
import { useEffect, useRef, useState, type FormEvent } from "react";
import {
  getLeadAttributionPayload,
  trackLeadConversion,
} from "@/lib/lead-attribution-client";
import {
  clearLeadSubmissionKey,
  getLeadSubmissionKey,
} from "@/lib/lead-submission-client";
type SystemCompleteModalProps = {
  systemSlug: string;
  systemName: string;
  onClose: () => void;
};

export default function SystemCompleteModal({
  systemSlug,
  systemName,
  onClose,
}: SystemCompleteModalProps) {
  const dialogRef = useRef<HTMLElement>(null);
  const firstNameInputRef = useRef<HTMLInputElement>(null);
  const copyLinkRef = useRef<HTMLAnchorElement>(null);
  const [firstName, setFirstName] = useState("");
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState("");
  const [copyUrl, setCopyUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const previouslyFocused = document.activeElement instanceof HTMLElement
      ? document.activeElement
      : null;
    const dialog = dialogRef.current;

    const getFocusableElements = () =>
      Array.from(
        dialog?.querySelectorAll<HTMLElement>(
          'button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [href], [tabindex]:not([tabindex="-1"])',
        ) ?? [],
      ).filter((element) => element.getAttribute("aria-hidden") !== "true");

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
    if (copyUrl) copyLinkRef.current?.focus();
  }, [copyUrl]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const flowKey = `system-kit:${systemSlug}`;
      const idempotencyKey = getLeadSubmissionKey(flowKey);
      const response = await fetch("/api/systeme-kit/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          attribution: getLeadAttributionPayload(),
          email,
          firstName,
          idempotencyKey,
          sectorName: systemName,
          sectorSlug: systemSlug,
          website,
        }),
      });
      const payload = (await response.json().catch(() => null)) as
        | { copyUrl?: string; error?: string; ok?: boolean }
        | null;

      if (!response.ok || !payload?.ok || !payload.copyUrl) {
        throw new Error(payload?.error || "Impossible d’envoyer le tableau pour le moment.");
      }

      clearLeadSubmissionKey(flowKey);
      setCopyUrl(payload.copyUrl);
      trackLeadConversion({
        requestType: "system_kit_request",
        systemSlug,
      });
    } catch (submissionError) {
      setError(
        submissionError instanceof Error
          ? submissionError.message
          : "Impossible d’envoyer le tableau pour le moment.",
      );
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
        aria-labelledby="system-complete-modal-title"
        aria-describedby="system-complete-modal-description"
        tabIndex={-1}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Fermer"
          className="absolute right-4 top-4 inline-flex h-10 w-10 items-center justify-center rounded-full text-brand-blue transition hover:text-dema-forest"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>

        <div className="p-6 sm:p-8">
          <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-dema-sage text-dema-forest">
            <Mail className="h-5 w-5" aria-hidden="true" />
          </span>
          <h2
            id="system-complete-modal-title"
            className="mt-5 pr-10 text-2xl font-semibold tracking-tight text-brand-blue"
          >
            Recevoir le tableau de pilotage
          </h2>

          <p
            id="system-complete-modal-description"
            className="mt-3 text-sm leading-relaxed text-dema-muted"
          >
            Une copie prête à personnaliser pour {systemName}.
          </p>

          {copyUrl ? (
            <div className="mt-6 rounded-[1rem] bg-dema-cream/55 p-5" role="status">
              <h3 className="text-lg font-semibold text-brand-blue">
                Votre tableau de pilotage est prêt
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-dema-muted">
                Le lien vient aussi d’être envoyé à {email}. Connectez-vous à Google,
                puis créez votre copie personnelle et modifiable dans votre Drive.
              </p>
              <a
                ref={copyLinkRef}
                href={copyUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="demaa-primary-button mt-5 inline-flex w-full items-center justify-center gap-2"
              >
                Créer ma copie du tableau
                <ExternalLink className="h-4 w-4" aria-hidden="true" />
              </a>
            </div>
          ) : (
            <form className="mt-6 space-y-3" onSubmit={handleSubmit} aria-busy={isSubmitting}>
              <label className="block text-sm font-medium text-brand-blue" htmlFor="kit-first-name">
                Prénom
              </label>
              <input
                ref={firstNameInputRef}
                id="kit-first-name"
                className="demaa-input"
                value={firstName}
                onChange={(event) => setFirstName(event.target.value)}
                autoComplete="given-name"
                required
              />
              <label className="block pt-1 text-sm font-medium text-brand-blue" htmlFor="kit-email">
                Adresse e-mail
              </label>
              <input
                id="kit-email"
                className="demaa-input"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                autoComplete="email"
                required
              />
              <input
                type="text"
                value={website}
                onChange={(event) => setWebsite(event.target.value)}
                tabIndex={-1}
                autoComplete="off"
                className="hidden"
                aria-hidden="true"
              />

              {error ? (
                <p className="text-sm text-brand-coral" role="alert">
                  {error}
                </p>
              ) : null}

              <button
                type="submit"
                disabled={isSubmitting}
                className="demaa-primary-button mt-3 inline-flex w-full items-center justify-center gap-2 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? (
                  <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />
                ) : null}
                {isSubmitting ? "Envoi…" : "Recevoir mon tableau"}
              </button>
              <p className="text-center text-xs text-dema-muted">
                Gratuit · Lien envoyé immédiatement
              </p>
            </form>
          )}
        </div>
      </section>
    </div>
  );
}
