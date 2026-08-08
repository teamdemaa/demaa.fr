"use client";

import { Check, LoaderCircle } from "lucide-react";
import { type FormEvent, useRef, useState } from "react";
import DirectoryDetailDialogShell from "@/components/DirectoryDetailDialogShell";
import {
  getLeadAttributionPayload,
  trackLeadConversion,
} from "@/lib/lead-attribution-client";
import {
  clearLeadSubmissionKey,
  getLeadSubmissionKey,
} from "@/lib/lead-submission-client";
import { isValidEmail } from "@/lib/email";

type DeliveryPayload = { error?: string } | { ok: true } | null;

function getErrorMessage(response: Response, payload: DeliveryPayload) {
  const serverError = payload && "error" in payload ? payload.error : undefined;
  if (response.status === 400 && serverError) return serverError;
  if (response.status === 429) {
    return "Vous avez effectué trop de demandes. Réessayez un peu plus tard.";
  }
  return "Impossible d’envoyer le récapitulatif pour le moment. Réessayez dans quelques instants.";
}

export default function SystemRecapRequestModal({
  onClose,
  systemName,
  systemSlug,
}: {
  onClose: () => void;
  systemName: string;
  systemSlug: string;
}) {
  const emailRef = useRef<HTMLInputElement>(null);
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [website, setWebsite] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSubmitting) return;

    const normalizedEmail = email.trim();
    if (!isValidEmail(normalizedEmail)) {
      setError("Merci d’indiquer une adresse e-mail valide.");
      emailRef.current?.focus();
      return;
    }

    setError(null);
    setIsSubmitting(true);
    const flowKey = `system-recap:${systemSlug}`;

    try {
      const response = await fetch("/api/systeme-kit/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          attribution: getLeadAttributionPayload(),
          email: normalizedEmail,
          idempotencyKey: getLeadSubmissionKey(flowKey),
          resourceSlug: "recapitulatif-systeme",
          systemSlug,
          website,
        }),
      });
      const payload = (await response.json().catch(() => null)) as DeliveryPayload;

      if (!response.ok || !payload || !("ok" in payload) || payload.ok !== true) {
        setError(getErrorMessage(response, payload));
        return;
      }

      clearLeadSubmissionKey(flowKey);
      setIsSuccess(true);
      trackLeadConversion({
        requestType: "system_kit_request",
        systemSlug,
      });
    } catch {
      setError(
        "Impossible d’envoyer le récapitulatif pour le moment. Réessayez dans quelques instants.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <DirectoryDetailDialogShell
      ariaLabel={`Recevoir le récapitulatif - ${systemName}`}
      maxWidthClassName="max-w-md"
      onClose={onClose}
    >
      {isSuccess ? (
        <div role="status">
          <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-dema-sage text-dema-forest">
            <Check className="h-5 w-5" aria-hidden="true" />
          </span>
          <h2 className="mt-5 text-2xl font-semibold tracking-[-0.025em] text-brand-blue">
            C’est envoyé.
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-dema-muted">
            Le récapitulatif de {systemName} est dans votre boîte mail.
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
          <h2 className="text-2xl font-semibold tracking-[-0.025em] text-brand-blue">
            Recevoir le récapitulatif
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-dema-muted">
            Process, solutions et ressources de {systemName}, réunis sur une seule page.
          </p>
          <form className="mt-6 space-y-3" onSubmit={handleSubmit} noValidate>
            <label className="block text-sm font-medium text-brand-blue" htmlFor="system-recap-email">
              Adresse e-mail
            </label>
            <input
              ref={emailRef}
              id="system-recap-email"
              type="email"
              autoComplete="email"
              inputMode="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="min-h-12 w-full rounded-xl border border-dema-line bg-white px-4 text-base text-brand-blue outline-none transition placeholder:text-dema-muted/60 focus:border-dema-forest/45 focus:ring-2 focus:ring-dema-forest/15"
              placeholder="vous@entreprise.com"
              aria-invalid={Boolean(error)}
              aria-describedby={error ? "system-recap-error" : undefined}
              disabled={isSubmitting}
            />
            <div className="sr-only" aria-hidden="true">
              <label htmlFor="system-recap-website">Site web</label>
              <input
                id="system-recap-website"
                name="website"
                type="text"
                tabIndex={-1}
                autoComplete="off"
                value={website}
                onChange={(event) => setWebsite(event.target.value)}
              />
            </div>
            {error ? (
              <p id="system-recap-error" className="text-sm leading-relaxed text-red-700" role="alert">
                {error}
              </p>
            ) : null}
            <button
              type="submit"
              disabled={isSubmitting}
              className="demaa-primary-button inline-flex w-full items-center justify-center gap-2 disabled:cursor-wait disabled:opacity-70"
            >
              {isSubmitting ? <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" /> : null}
              {isSubmitting ? "Envoi…" : "Recevoir par e-mail"}
            </button>
          </form>
        </>
      )}
    </DirectoryDetailDialogShell>
  );
}
