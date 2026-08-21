"use client";

import { Check, LoaderCircle, X } from "lucide-react";
import { type FormEvent, useEffect, useMemo, useState } from "react";
import CustomerSpaceAccessForm from "@/components/CustomerSpaceAccessForm";
import { useAccessibleDialog } from "@/components/useAccessibleDialog";
import {
  getLeadAttributionPayload,
  trackLeadConversion,
} from "@/lib/lead-attribution-client";
import {
  clearLeadSubmissionKey,
  getLeadSubmissionKey,
} from "@/lib/lead-submission-client";
import type { ExpertiseCatalogEntry } from "@/lib/expertise-catalog-contract";
import {
  OPPORTUNITY_TYPE_LABELS,
  type PublicOpportunity,
} from "@/lib/opportunity-contract";
import { useCustomerIdentity } from "@/lib/use-customer-identity";

type ProviderProfileModalProps = {
  expertises: readonly ExpertiseCatalogEntry[];
  initialEmail?: string;
  initialExpertiseId?: string | null;
  onClose: () => void;
  opportunity?: PublicOpportunity | null;
};

type ResponsePayload = { error?: string } | { ok: true } | null;

function responseError(response: Response, payload: ResponsePayload) {
  const serverError = payload && "error" in payload ? payload.error : undefined;
  if ((response.status === 400 || response.status === 404) && serverError) {
    return serverError;
  }
  if (response.status === 429) {
    return "Vous avez effectué trop de demandes. Réessayez un peu plus tard.";
  }
  return "Votre demande n’a pas pu être envoyée. Réessayez dans quelques instants.";
}

export default function ProviderProfileModal({
  expertises,
  initialEmail = "",
  initialExpertiseId,
  onClose,
  opportunity = null,
}: ProviderProfileModalProps) {
  const dialogRef = useAccessibleDialog({ onClose });
  const [fullName, setFullName] = useState("");
  const { email: authenticatedEmail, loading: identityLoading } =
    useCustomerIdentity(initialEmail);
  const [returnTo, setReturnTo] = useState("/");
  const [company, setCompany] = useState("");
  const [profileUrl, setProfileUrl] = useState("");
  const [countries, setCountries] = useState("");
  const [message, setMessage] = useState("");
  const [consent, setConsent] = useState(false);
  const [website, setWebsite] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const lockedExpertiseId = opportunity?.expertiseId ?? null;
  const defaultExpertiseId = opportunity
    ? (lockedExpertiseId ?? "")
    : (initialExpertiseId ?? "");
  const [expertiseIds, setExpertiseIds] = useState<string[]>(
    defaultExpertiseId ? [defaultExpertiseId] : [],
  );

  const selectedLabels = useMemo(
    () => expertises
      .filter((expertise) => expertiseIds.includes(expertise.expertiseId))
      .map((expertise) => expertise.label),
    [expertiseIds, expertises],
  );

  useEffect(() => {
    const url = new URL(window.location.href);
    url.searchParams.set(
      "intent",
      opportunity ? "opportunity" : "team-demaa-profile",
    );
    if (opportunity) {
      url.searchParams.set("opportunityId", opportunity.opportunityId);
    } else if (initialExpertiseId) {
      url.searchParams.set("expertiseId", initialExpertiseId);
    }
    setReturnTo(`${url.pathname}${url.search}`);
  }, [initialExpertiseId, opportunity]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);
    const submissionKey = getLeadSubmissionKey(
      opportunity ? "opportunity-interest" : "provider-profile",
    );
    try {
      const response = await fetch("/api/provider-profile-submission", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          attribution: getLeadAttributionPayload(),
          company,
          consent,
          countries,
          expertiseIds,
          fullName,
          idempotencyKey: submissionKey,
          message,
          opportunityId: opportunity?.opportunityId ?? null,
          profileUrl,
          website,
        }),
      });
      const payload = await response.json().catch(() => null) as ResponsePayload;
      if (!response.ok) throw new Error(responseError(response, payload));
      clearLeadSubmissionKey(
        opportunity ? "opportunity-interest" : "provider-profile",
      );
      trackLeadConversion({
        requestType: opportunity
          ? "opportunity_interest"
          : "provider_profile_submission",
      });
      setIsSuccess(true);
    } catch (submissionError) {
      setError(
        submissionError instanceof Error
          ? submissionError.message
          : "Votre demande n’a pas pu être envoyée.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center bg-brand-blue/35 p-0 backdrop-blur-[2px] sm:items-center sm:p-5">
      <section
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="provider-profile-title"
        tabIndex={-1}
        className="demaa-dialog-shadow relative max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-t-[1.5rem] bg-white p-5 sm:rounded-[1.5rem] sm:p-8"
      >
        <button
          type="button"
          onClick={onClose}
          data-dialog-initial-focus
          className="absolute right-4 top-4 inline-flex h-10 w-10 items-center justify-center rounded-full text-brand-blue transition hover:bg-dema-sage"
          aria-label="Fermer"
        >
          <X className="h-5 w-5" aria-hidden="true" />
        </button>

        {isSuccess ? (
          <div className="py-10 text-center" aria-live="polite">
            <span className="mx-auto inline-flex h-14 w-14 items-center justify-center rounded-full bg-dema-sage text-dema-forest">
              <Check className="h-6 w-6" aria-hidden="true" />
            </span>
            <h2 id="provider-profile-title" className="mt-5 text-2xl font-medium text-brand-blue">
              {opportunity
                ? "Votre intérêt a bien été transmis"
                : "Votre profil a bien été envoyé"}
            </h2>
            <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-dema-muted">
              {opportunity
                ? "Nous reviendrons vers vous si une suite peut être donnée à votre demande."
                : "Demaa vous contactera lorsqu’un besoin correspondra à votre expertise."}
            </p>
            <button
              type="button"
              onClick={onClose}
              className="mt-7 inline-flex min-h-11 items-center justify-center rounded-full bg-dema-forest px-7 text-sm font-medium text-white"
            >
              Fermer
            </button>
          </div>
        ) : (
          <>
            <p className="pr-12 text-xs font-medium uppercase tracking-[0.14em] text-dema-forest">
              {opportunity
                ? OPPORTUNITY_TYPE_LABELS[opportunity.opportunityType]
                : "Rejoindre Team Demaa"}
            </p>
            <h2 id="provider-profile-title" className="mt-2 pr-12 text-2xl font-medium tracking-[-0.025em] text-brand-blue sm:text-3xl">
              {opportunity?.title ?? selectedLabels[0] ?? "Présenter votre profil"}
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-dema-muted">
              {opportunity?.summary
                ?? "Présentez simplement votre activité. Nous vous contacterons lorsqu’un besoin correspondra à votre profil."}
            </p>

            {!identityLoading && !authenticatedEmail ? (
              <div className="mt-7 rounded-[1.1rem] border border-dema-line bg-dema-cream/55 p-4 sm:p-5">
                <div>
                  <CustomerSpaceAccessForm choiceTitle="Connectez-vous" returnTo={returnTo} />
                </div>
              </div>
            ) : null}

            {lockedExpertiseId && selectedLabels[0] ? (
              <p className="mt-3 text-xs font-medium uppercase tracking-[0.12em] text-dema-forest">
                {selectedLabels[0]}
              </p>
            ) : null}

            {authenticatedEmail ? <form onSubmit={submit} className="mt-7 space-y-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="space-y-2 text-sm text-brand-blue">
                  <span>Nom et prénom</span>
                  <input required value={fullName} onChange={(event) => setFullName(event.target.value)} className="w-full rounded-xl border border-dema-line bg-white px-4 py-3 outline-none focus:border-dema-forest" />
                </label>
                <label className="space-y-2 text-sm text-brand-blue">
                  <span>{opportunity ? "Entreprise ou activité" : "Entreprise"}</span>
                  <input required value={company} onChange={(event) => setCompany(event.target.value)} className="w-full rounded-xl border border-dema-line bg-white px-4 py-3 outline-none focus:border-dema-forest" />
                </label>
                <label className="space-y-2 text-sm text-brand-blue">
                  <span>Site ou profil professionnel <span className="text-dema-muted">(facultatif)</span></span>
                  <input value={profileUrl} onChange={(event) => setProfileUrl(event.target.value)} placeholder="https://" className="w-full rounded-xl border border-dema-line bg-white px-4 py-3 outline-none focus:border-dema-forest" />
                </label>
              </div>

              {!opportunity ? (
                <label className="block space-y-2 text-sm text-brand-blue">
                  <span>Expertise principale</span>
                  <select
                    required
                    value={expertiseIds[0] ?? ""}
                    onChange={(event) => {
                      setExpertiseIds(event.target.value ? [event.target.value] : []);
                    }}
                    className="min-h-12 w-full rounded-xl border border-dema-line bg-white px-4 outline-none focus:border-dema-forest"
                  >
                    <option value="">Choisir une expertise</option>
                    {expertises.map((expertise) => (
                      <option key={expertise.expertiseId} value={expertise.expertiseId}>
                        {expertise.label}
                      </option>
                    ))}
                  </select>
                </label>
              ) : null}

              {!opportunity ? (
                <label className="block space-y-2 text-sm text-brand-blue">
                  <span>Pays ou zones couverts</span>
                  <input required value={countries} onChange={(event) => setCountries(event.target.value)} placeholder="Ex. France, Côte d’Ivoire, à distance…" className="w-full rounded-xl border border-dema-line bg-white px-4 py-3 outline-none focus:border-dema-forest" />
                </label>
              ) : null}

              <label className="block space-y-2 text-sm text-brand-blue">
                <span>{opportunity ? "Votre message" : "Présentez brièvement votre expérience"}</span>
                <textarea required minLength={20} rows={4} value={message} onChange={(event) => setMessage(event.target.value)} className="w-full resize-y rounded-xl border border-dema-line bg-white px-4 py-3 outline-none focus:border-dema-forest" />
              </label>

              <label className="hidden" aria-hidden="true">
                Site secondaire
                <input tabIndex={-1} autoComplete="off" value={website} onChange={(event) => setWebsite(event.target.value)} />
              </label>

              <label className="flex items-start gap-3 text-xs leading-relaxed text-dema-muted">
                <input type="checkbox" required checked={consent} onChange={(event) => setConsent(event.target.checked)} className="mt-0.5 h-4 w-4 rounded border-dema-line accent-dema-forest" />
                <span>
                  {opportunity
                    ? "J’accepte que Demaa conserve ces informations afin de me recontacter au sujet de cette opportunité."
                    : "J’accepte que Demaa conserve ces informations afin de me contacter lorsqu’un besoin correspond à mon profil."}
                </span>
              </label>

              {error ? <p role="alert" className="text-sm text-red-700">{error}</p> : null}

              <button
                type="submit"
                disabled={isSubmitting || (!opportunity && expertiseIds.length === 0)}
                className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-dema-forest px-6 text-sm font-medium text-white transition hover:bg-brand-blue disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" /> : null}
                {opportunity ? "Manifester mon intérêt" : "Envoyer mon profil"}
              </button>
            </form> : null}
          </>
        )}
      </section>
    </div>
  );
}
