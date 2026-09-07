"use client";

import { Check, LoaderCircle } from "lucide-react";
import Link from "next/link";
import { type FormEvent, useEffect, useState } from "react";
import {
  getLeadAttributionPayload,
  trackLeadConversion,
} from "@/lib/lead-attribution-client";
import {
  clearLeadSubmissionKey,
  getLeadSubmissionKey,
} from "@/lib/lead-submission-client";
import { useCustomerIdentity } from "@/lib/use-customer-identity";

type ApiResponse = { error?: string; ok?: boolean } | null;

type StudioInterestFields = {
  companyActivity: string;
  consent: boolean;
  currentSolution: string;
  marketEvidence: string;
  problem: string;
  website: string;
};

const EMPTY_FIELDS: StudioInterestFields = {
  companyActivity: "",
  consent: false,
  currentSolution: "",
  marketEvidence: "",
  problem: "",
  website: "",
};

function responseError(response: Response, payload: ApiResponse) {
  if (payload?.error) return payload.error;
  if (response.status === 429) {
    return "Vous avez effectué trop de demandes. Merci de réessayer plus tard.";
  }
  return "Impossible d’envoyer votre demande pour le moment. Merci de réessayer.";
}

export default function StudioInterestForm() {
  const { email: knownEmail } = useCustomerIdentity();
  const [fields, setFields] = useState(EMPTY_FIELDS);
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSent, setIsSent] = useState(false);

  useEffect(() => {
    if (!knownEmail) return;
    setEmail((current) => current || knownEmail);
  }, [knownEmail]);

  function updateField<Field extends keyof StudioInterestFields>(
    field: Field,
    value: StudioInterestFields[Field],
  ) {
    setFields((current) => ({ ...current, [field]: value }));
  }

  async function submitInterest(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSubmitting) return;

    setError(null);
    setIsSubmitting(true);
    const flowKey = "studio-interest";

    try {
      const response = await fetch("/api/studio-interest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...fields,
          attribution: getLeadAttributionPayload(),
          email,
          idempotencyKey: getLeadSubmissionKey(flowKey),
        }),
      });
      const payload = (await response.json().catch(() => null)) as ApiResponse;
      if (!response.ok || payload?.ok !== true) {
        setError(responseError(response, payload));
        return;
      }

      clearLeadSubmissionKey(flowKey);
      setFields(EMPTY_FIELDS);
      setIsSent(true);
      trackLeadConversion({ requestType: "studio_interest_request" });
    } catch {
      setError("Impossible d’envoyer votre demande pour le moment. Merci de réessayer.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isSent) {
    return (
      <div className="rounded-[2rem] border border-dema-line bg-dema-cream p-7 text-center sm:p-9">
        <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-dema-sage text-dema-forest">
          <Check className="h-5 w-5" aria-hidden="true" />
        </span>
        <h3 className="mt-5 font-serif text-3xl font-light tracking-[-0.03em]">
          Merci, le besoin est transmis.
        </h3>
        <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-dema-muted">
          Nous allons le lire et vous recontacter pour comprendre votre métier et le contexte du problème.
        </p>
      </div>
    );
  }

  return (
    <form
      className="rounded-[2rem] border border-dema-line bg-dema-cream p-6 sm:p-8"
      onSubmit={submitInterest}
      aria-busy={isSubmitting}
    >
      <div>
        <label className="block text-sm font-medium" htmlFor="studio-problem">
          Quel besoin reste mal couvert dans votre métier ?
        </label>
        <textarea
          id="studio-problem"
          className="demaa-textarea mt-2 min-h-32"
          value={fields.problem}
          onChange={(event) => updateField("problem", event.target.value)}
          required
          minLength={20}
          maxLength={4000}
          rows={5}
          placeholder="Décrivez le problème, les personnes concernées et ce qu’il complique aujourd’hui."
        />
      </div>

      <div className="mt-5 grid gap-5 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium" htmlFor="studio-company">
            Votre entreprise et son activité
          </label>
          <input
            id="studio-company"
            className="demaa-input mt-2"
            value={fields.companyActivity}
            onChange={(event) => updateField("companyActivity", event.target.value)}
            autoComplete="organization"
            required
            maxLength={160}
          />
        </div>
        <div>
          <label className="block text-sm font-medium" htmlFor="studio-email">
            Votre adresse e-mail
          </label>
          <input
            id="studio-email"
            className="demaa-input mt-2"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="email"
            required
            maxLength={160}
          />
        </div>
      </div>

      <div className="mt-5">
        <label className="block text-sm font-medium" htmlFor="studio-current-solution">
          Comment gérez-vous ce besoin aujourd’hui ? <span className="font-normal text-dema-muted">(facultatif)</span>
        </label>
        <textarea
          id="studio-current-solution"
          className="demaa-textarea mt-2 min-h-24"
          value={fields.currentSolution}
          onChange={(event) => updateField("currentSolution", event.target.value)}
          maxLength={1500}
          rows={3}
        />
      </div>

      <div className="mt-5">
        <label className="block text-sm font-medium" htmlFor="studio-market-evidence">
          D’autres entreprises sont-elles concernées ? <span className="font-normal text-dema-muted">(facultatif)</span>
        </label>
        <textarea
          id="studio-market-evidence"
          className="demaa-textarea mt-2 min-h-24"
          value={fields.marketEvidence}
          onChange={(event) => updateField("marketEvidence", event.target.value)}
          maxLength={1500}
          rows={3}
        />
      </div>

      <label className="mt-5 flex items-start gap-3 text-xs leading-relaxed text-dema-muted" htmlFor="studio-consent">
        <input
          id="studio-consent"
          type="checkbox"
          checked={fields.consent}
          onChange={(event) => updateField("consent", event.target.checked)}
          className="mt-0.5 h-4 w-4 shrink-0 accent-dema-forest"
          required
        />
        <span>
          J’accepte que Demaa utilise ces informations pour me recontacter au sujet de ce besoin métier. Voir la{" "}
          <Link href="/politique-de-confidentialite" className="underline underline-offset-2 hover:text-dema-forest">
            politique de confidentialité
          </Link>.
        </span>
      </label>

      <div className="absolute -left-[10000px] top-auto h-px w-px overflow-hidden" aria-hidden="true">
        <label htmlFor="studio-website">Site</label>
        <input
          id="studio-website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={fields.website}
          onChange={(event) => updateField("website", event.target.value)}
        />
      </div>

      {error ? <p className="mt-4 text-sm text-brand-coral" role="alert">{error}</p> : null}

      <button
        type="submit"
        disabled={isSubmitting}
        className="demaa-primary-button mt-6 inline-flex min-h-12 w-full items-center justify-center gap-2 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
      >
        {isSubmitting ? <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" /> : null}
        Échanger sur ce besoin
      </button>
    </form>
  );
}
