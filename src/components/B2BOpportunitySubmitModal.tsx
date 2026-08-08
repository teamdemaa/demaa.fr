"use client";

import { Check, LoaderCircle, Plus, X } from "lucide-react";
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

type B2BOpportunitySubmitModalProps = {
  onClose: () => void;
};

type SubmitPayload = { error?: string } | { ok: true } | null;

function getErrorMessage(response: Response, payload: SubmitPayload) {
  const serverError = payload && "error" in payload ? payload.error : undefined;
  if (response.status === 400 && serverError) return serverError;
  if (response.status === 429) {
    return "Vous avez effectué trop de demandes. Réessayez un peu plus tard.";
  }
  return "Impossible d’envoyer votre proposition pour le moment. Réessayez dans quelques instants.";
}

export default function B2BOpportunitySubmitModal({
  onClose,
}: B2BOpportunitySubmitModalProps) {
  const dialogRef = useRef<HTMLElement>(null);
  const firstFieldRef = useRef<HTMLInputElement>(null);
  const successRef = useRef<HTMLDivElement>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
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
          'button:not([disabled]), input:not([disabled]):not([type="hidden"]), textarea:not([disabled]), [href], [tabindex]:not([tabindex="-1"])',
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
    firstFieldRef.current?.focus();

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

    const normalizedTitle = title.trim();
    const normalizedDescription = description.trim();
    const normalizedName = fullName.trim();
    const normalizedEmail = email.trim();

    if (!normalizedTitle || normalizedDescription.length < 20 || !normalizedName || !normalizedEmail) {
      setError("Merci de compléter le titre, la description et vos coordonnées.");
      return;
    }
    if (!isValidEmail(normalizedEmail)) {
      setError("Merci d’indiquer une adresse e-mail valide.");
      return;
    }

    setError(null);
    setIsSubmitting(true);

    const flowKey = `b2b-opportunity-submission:${normalizedEmail}`;

    try {
      const response = await fetch("/api/opportunites-b2b/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          attribution: getLeadAttributionPayload(),
          company,
          description: normalizedDescription,
          email: normalizedEmail,
          fullName: normalizedName,
          idempotencyKey: getLeadSubmissionKey(flowKey),
          title: normalizedTitle,
          website,
        }),
      });
      const payload = (await response.json().catch(() => null)) as SubmitPayload;

      if (!response.ok || !payload || !("ok" in payload) || payload.ok !== true) {
        setError(getErrorMessage(response, payload));
        return;
      }

      clearLeadSubmissionKey(flowKey);
      setIsSuccess(true);
      trackLeadConversion({ requestType: "b2b_opportunity_submission" });
    } catch {
      setError(
        "Impossible d’envoyer votre proposition pour le moment. Réessayez dans quelques instants.",
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
        className="relative max-h-[calc(100dvh-2rem)] w-full max-w-[32rem] overflow-y-auto rounded-[1.5rem] border border-dema-line bg-dema-paper shadow-[0_24px_70px_rgba(23,35,29,0.14)] sm:max-h-[calc(100dvh-3rem)]"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="b2b-submit-modal-title"
        aria-describedby="b2b-submit-modal-description"
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
                id="b2b-submit-modal-title"
                className="mt-5 pr-10 text-2xl font-semibold leading-tight tracking-[-0.025em] text-brand-blue"
              >
                Proposition envoyée.
              </h2>
              <p
                id="b2b-submit-modal-description"
                className="mt-3 text-sm leading-relaxed text-dema-muted"
              >
                Merci. L’équipe Demaa étudie votre opportunité avant publication.
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
                <Plus className="h-5 w-5" aria-hidden="true" />
              </span>
              <h2
                id="b2b-submit-modal-title"
                className="mt-4 pr-10 text-2xl font-semibold leading-tight tracking-[-0.025em] text-brand-blue"
              >
                Proposer une opportunité
              </h2>
              <p
                id="b2b-submit-modal-description"
                className="mt-3 text-sm leading-relaxed text-dema-muted"
              >
                Décrivez le besoin, l’équipe Demaa la publie après relecture.
              </p>

              <form
                className="mt-6 space-y-3"
                onSubmit={handleSubmit}
                aria-busy={isSubmitting}
                noValidate
              >
                <label className="block text-sm font-medium text-brand-blue" htmlFor="b2b-submit-title">
                  Titre de l’opportunité
                </label>
                <input
                  ref={firstFieldRef}
                  id="b2b-submit-title"
                  name="title"
                  className="demaa-input"
                  type="text"
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder="Ex. Recherche graphiste pour une refonte de logo"
                  maxLength={160}
                  required
                />

                <label className="block text-sm font-medium text-brand-blue" htmlFor="b2b-submit-description">
                  Description
                </label>
                <textarea
                  id="b2b-submit-description"
                  name="description"
                  className="demaa-input resize-y"
                  rows={3}
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  placeholder="Le besoin, le contexte et ce qui rend l’opportunité intéressante…"
                  minLength={20}
                  maxLength={2000}
                  required
                />

                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-brand-blue" htmlFor="b2b-submit-name">
                      Nom et prénom
                    </label>
                    <input
                      id="b2b-submit-name"
                      name="fullName"
                      className="demaa-input mt-2"
                      type="text"
                      value={fullName}
                      onChange={(event) => setFullName(event.target.value)}
                      autoComplete="name"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-brand-blue" htmlFor="b2b-submit-email">
                      E-mail
                    </label>
                    <input
                      id="b2b-submit-email"
                      name="email"
                      className="demaa-input mt-2"
                      type="email"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      autoComplete="email"
                      required
                    />
                  </div>
                </div>

                <label className="block text-sm font-medium text-brand-blue" htmlFor="b2b-submit-company">
                  Entreprise <span className="font-normal text-dema-muted">(facultatif)</span>
                </label>
                <input
                  id="b2b-submit-company"
                  name="company"
                  className="demaa-input"
                  type="text"
                  value={company}
                  onChange={(event) => setCompany(event.target.value)}
                  autoComplete="organization"
                />

                <div
                  className="absolute -left-[10000px] top-auto h-px w-px overflow-hidden"
                  aria-hidden="true"
                >
                  <label htmlFor="b2b-submit-website">Site internet</label>
                  <input
                    id="b2b-submit-website"
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
                  {isSubmitting ? "Envoi…" : "Envoyer ma proposition"}
                </button>
              </form>
            </>
          )}
        </div>
      </section>
    </div>
  );
}
