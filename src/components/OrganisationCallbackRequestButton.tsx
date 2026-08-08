"use client";

import { Check, LoaderCircle, PhoneCall } from "lucide-react";
import { type FormEvent, useState } from "react";
import DirectoryDetailDialogShell from "@/components/DirectoryDetailDialogShell";
import {
  getLeadAttributionPayload,
  trackLeadConversion,
} from "@/lib/lead-attribution-client";
import {
  clearLeadSubmissionKey,
  getLeadSubmissionKey,
} from "@/lib/lead-submission-client";

type OrganisationCallbackRequestButtonProps = {
  className?: string;
  label?: string;
  source?: string;
  systemSlug: string;
};

type FormState = {
  email: string;
  firstName: string;
  need: string;
  phone: string;
  website: string;
};

const INITIAL_FORM: FormState = {
  email: "",
  firstName: "",
  need: "",
  phone: "",
  website: "",
};

type CallbackResponse = { error?: string; ok?: boolean } | null;

function getErrorMessage(response: Response, payload: CallbackResponse) {
  if (payload?.error) return payload.error;
  if (response.status === 429) {
    return "Vous avez effectué trop de demandes. Réessayez un peu plus tard.";
  }
  return "Impossible d’envoyer votre demande pour le moment. Merci de réessayer.";
}

export default function OrganisationCallbackRequestButton({
  className = "demaa-primary-button mt-5 w-fit",
  label = "Demander à être rappelé(e)",
  source = "Système métier - Demande de rappel organisation",
  systemSlug,
}: OrganisationCallbackRequestButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [form, setForm] = useState(INITIAL_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function close() {
    setIsOpen(false);
    setError(null);
  }

  function update(field: keyof FormState, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSubmitting) return;

    setError(null);
    setIsSubmitting(true);
    const flowKey = `organisation-callback:${systemSlug}`;

    try {
      const response = await fetch("/api/organisation-callback-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          attribution: getLeadAttributionPayload(),
          email: form.email,
          firstName: form.firstName,
          idempotencyKey: getLeadSubmissionKey(flowKey),
          need: form.need,
          phone: form.phone,
          source,
          systemSlug,
          website: form.website,
        }),
      });
      const payload = (await response.json().catch(() => null)) as CallbackResponse;
      if (!response.ok || payload?.ok !== true) {
        setError(getErrorMessage(response, payload));
        return;
      }

      clearLeadSubmissionKey(flowKey);
      setForm(INITIAL_FORM);
      setIsSuccess(true);
      trackLeadConversion({
        requestType: "organisation_callback_request",
        systemSlug,
      });
    } catch {
      setError("Impossible d’envoyer votre demande pour le moment. Merci de réessayer.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setIsSuccess(false);
          setIsOpen(true);
        }}
        className={className}
        data-resource-cta
      >
        {label}
      </button>

      {isOpen ? (
        <DirectoryDetailDialogShell
          ariaLabel="Demander à être rappelé"
          maxWidthClassName="max-w-lg"
          onClose={close}
        >
          {isSuccess ? (
            <div className="text-center">
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-dema-sage text-dema-forest">
                <Check className="h-5 w-5" aria-hidden="true" />
              </span>
              <h2 className="mt-5 text-2xl font-semibold tracking-[-0.025em] text-brand-blue">
                C’est bien reçu.
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-dema-muted">
                Nous vous rappellerons pour faire le point sur votre besoin.
              </p>
              <button
                type="button"
                onClick={close}
                className="demaa-primary-button mt-6 inline-flex w-full items-center justify-center"
              >
                Fermer
              </button>
            </div>
          ) : (
            <>
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-dema-sage text-dema-forest">
                <PhoneCall className="h-5 w-5" aria-hidden="true" />
              </span>
              <h2 className="mt-4 text-2xl font-semibold tracking-[-0.025em] text-brand-blue">
                Demander à être rappelé(e)
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-dema-muted">
                Laissez vos coordonnées et quelques mots sur votre besoin. Nous vous recontactons dès que possible.
              </p>

              <form className="mt-6 space-y-4" onSubmit={submit} noValidate aria-busy={isSubmitting}>
                <div>
                  <label className="block text-sm font-medium text-brand-blue" htmlFor="callback-first-name">
                    Prénom
                  </label>
                  <input
                    id="callback-first-name"
                    data-dialog-initial-focus
                    className="demaa-input mt-2"
                    value={form.firstName}
                    onChange={(event) => update("firstName", event.target.value)}
                    autoComplete="given-name"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-brand-blue" htmlFor="callback-phone">
                    Téléphone
                  </label>
                  <input
                    id="callback-phone"
                    className="demaa-input mt-2"
                    type="tel"
                    value={form.phone}
                    onChange={(event) => update("phone", event.target.value)}
                    autoComplete="tel"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-brand-blue" htmlFor="callback-email">
                    Adresse e-mail
                  </label>
                  <input
                    id="callback-email"
                    className="demaa-input mt-2"
                    type="email"
                    value={form.email}
                    onChange={(event) => update("email", event.target.value)}
                    autoComplete="email"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-brand-blue" htmlFor="callback-need">
                    Qu’aimeriez-vous améliorer ?
                  </label>
                  <textarea
                    id="callback-need"
                    className="demaa-textarea mt-2"
                    value={form.need}
                    onChange={(event) => update("need", event.target.value)}
                    rows={4}
                    required
                  />
                </div>
                <div className="absolute -left-[10000px] top-auto h-px w-px overflow-hidden" aria-hidden="true">
                  <label htmlFor="callback-website">Site internet</label>
                  <input
                    id="callback-website"
                    type="text"
                    value={form.website}
                    onChange={(event) => update("website", event.target.value)}
                    tabIndex={-1}
                    autoComplete="off"
                  />
                </div>
                {error ? <p className="text-sm text-brand-coral" role="alert">{error}</p> : null}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="demaa-primary-button inline-flex w-full items-center justify-center gap-2 disabled:cursor-wait disabled:opacity-60"
                >
                  {isSubmitting ? <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" /> : null}
                  {isSubmitting ? "Envoi…" : "Demander à être rappelé(e)"}
                </button>
              </form>
            </>
          )}
        </DirectoryDetailDialogShell>
      ) : null}
    </>
  );
}
