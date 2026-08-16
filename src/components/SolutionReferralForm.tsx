"use client";

import Link from "next/link";
import { LoaderCircle } from "lucide-react";
import { type FormEvent, useRef, useState } from "react";
import CustomerSpaceAccessForm from "@/components/CustomerSpaceAccessForm";
import { getLeadAttributionPayload } from "@/lib/lead-attribution-client";
import type { LeadAttributionPayload } from "@/lib/lead-attribution";
import {
  clearLeadSubmissionKey,
  getLeadSubmissionKey,
} from "@/lib/lead-submission-client";
import { buildCustomerIntentReturnTo } from "@/lib/customer-space-redirect";
import { useCustomerIdentity } from "@/lib/use-customer-identity";

export type SolutionReferralFields = Readonly<{
  firstName: string;
  email: string;
  company: string;
  need: string;
}>;

export type SolutionReferralPayload = Readonly<{
  attribution?: LeadAttributionPayload;
  company: string;
  email: string;
  firstName: string;
  idempotencyKey: string;
  marketingConsent: false;
  need: string;
  resourceSlug: string;
  systemSlug: string;
}>;

type FieldErrors = Partial<Record<keyof SolutionReferralFields, string>>;

const EMPTY_FIELDS: SolutionReferralFields = {
  firstName: "",
  email: "",
  company: "",
  need: "",
};

export function validateSolutionReferralFields(
  fields: SolutionReferralFields,
): FieldErrors {
  const errors: FieldErrors = {};
  if (!fields.firstName.trim()) errors.firstName = "Indiquez votre prénom.";
  if (!fields.company.trim()) errors.company = "Indiquez le nom de votre cabinet.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email.trim())) {
    errors.email = "Indiquez une adresse e-mail valide.";
  }
  if (!fields.need.trim()) errors.need = "Décrivez brièvement votre besoin.";
  return errors;
}

export function buildSolutionReferralPayload(
  fields: SolutionReferralFields,
  input: {
    attribution?: LeadAttributionPayload | null;
    idempotencyKey: string;
    resourceSlug: string;
    systemSlug: string;
  },
): SolutionReferralPayload {
  return {
    ...(input.attribution ? { attribution: input.attribution } : {}),
    company: fields.company.trim(),
    email: fields.email.trim().toLowerCase(),
    firstName: fields.firstName.trim(),
    idempotencyKey: input.idempotencyKey,
    marketingConsent: false,
    need: fields.need.trim(),
    resourceSlug: input.resourceSlug,
    systemSlug: input.systemSlug,
  };
}

type FetchSolutionReferral = (
  input: RequestInfo | URL,
  init?: RequestInit,
) => Promise<Response>;

export async function submitSolutionReferral(
  payload: SolutionReferralPayload,
  fetchRequest: FetchSolutionReferral = fetch,
) {
  const response = await fetchRequest("/api/solution-referral", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const mediaType = response.headers
    .get("content-type")
    ?.split(";", 1)[0]
    ?.trim()
    .toLowerCase();
  if (response.status !== 202 || mediaType !== "application/json") {
    throw new Error("solution referral failed");
  }
  const result = await response.json().catch(() => null) as unknown;
  if (
    !result
    || typeof result !== "object"
    || Array.isArray(result)
    || Object.keys(result).length !== 1
    || Reflect.get(result, "ok") !== true
  ) {
    throw new Error("solution referral failed");
  }
}

export default function SolutionReferralForm({
  initialEmail = "",
  referralMode = "direct",
  resourceName,
  resourceSlug,
  systemSlug,
}: {
  initialEmail?: string;
  referralMode?: "direct" | "matching";
  resourceName: string;
  resourceSlug: string;
  systemSlug: string;
}) {
  const { email: authenticatedEmail, loading: identityLoading } =
    useCustomerIdentity(initialEmail);
  const formRef = useRef<HTMLFormElement>(null);
  const submissionInFlightRef = useRef(false);
  const [fields, setFields] = useState<SolutionReferralFields>(EMPTY_FIELDS);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");

  function updateField(field: keyof SolutionReferralFields, value: string) {
    setFields((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
    if (status !== "idle") setStatus("idle");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!authenticatedEmail) return;
    const authenticatedFields = { ...fields, email: authenticatedEmail };
    const nextErrors = validateSolutionReferralFields(authenticatedFields);
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      setStatus("error");
      requestAnimationFrame(() => {
        formRef.current
          ?.querySelector<HTMLElement>('[aria-invalid="true"]')
          ?.focus();
      });
      return;
    }
    if (submissionInFlightRef.current) return;
    submissionInFlightRef.current = true;
    setErrors({});
    setStatus("submitting");

    const flowKey = `solution-referral:${systemSlug}:${resourceSlug}`;
    try {
      await submitSolutionReferral(buildSolutionReferralPayload(authenticatedFields, {
        attribution: getLeadAttributionPayload(),
        idempotencyKey: getLeadSubmissionKey(flowKey),
        resourceSlug,
        systemSlug,
      }));
      clearLeadSubmissionKey(flowKey);
      setFields(EMPTY_FIELDS);
      setStatus("success");
    } catch {
      setStatus("error");
    } finally {
      submissionInFlightRef.current = false;
    }
  }

  const fieldClassName =
    "mt-2 min-h-11 w-full rounded-[0.9rem] border border-dema-line bg-dema-paper px-4 py-3 text-sm text-brand-blue outline-none transition placeholder:text-dema-muted/65 focus:border-dema-forest/40 focus:ring-2 focus:ring-dema-forest/15";

  if (identityLoading) {
    return (
      <div className="mt-6 flex min-h-28 items-center justify-center text-sm text-dema-muted" role="status">
        <LoaderCircle className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
        Vérification de votre accès…
      </div>
    );
  }

  if (!authenticatedEmail) {
    return (
      <div className="mt-6 rounded-[1rem] border border-dema-line bg-dema-sage/35 p-4 sm:p-5">
        <p className="mb-4 text-sm leading-relaxed text-brand-blue">
          Connectez-vous pour envoyer votre demande sans renseigner de nouveau votre adresse e-mail.
        </p>
        <CustomerSpaceAccessForm
          choiceTitle="Connectez-vous pour envoyer"
          returnTo={buildCustomerIntentReturnTo({
            kind: "solution-referral",
            resourceSlug,
            systemSlug,
          })}
        />
      </div>
    );
  }

  if (status === "success") {
    return (
      <p
        role="status"
        className="mt-6 rounded-[1rem] border border-dema-line bg-dema-sage/55 px-4 py-4 text-sm leading-relaxed text-brand-blue"
      >
        {referralMode === "matching"
          ? "Votre demande a bien été envoyée. Demaa revient vers vous après avoir étudié votre besoin."
          : "Votre demande a bien été envoyée. Demaa revient vers vous rapidement pour organiser la mise en relation."}
      </p>
    );
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} noValidate className="mt-6 space-y-4">
      <div>
        <label className="block text-sm font-medium text-brand-blue">
          Prénom
          <input
            name="firstName"
            autoComplete="given-name"
            maxLength={80}
            value={fields.firstName}
            onChange={(event) => updateField("firstName", event.target.value)}
            aria-invalid={Boolean(errors.firstName)}
            className={fieldClassName}
          />
          {errors.firstName ? (
            <span className="mt-1.5 block text-xs text-red-700">{errors.firstName}</span>
          ) : null}
        </label>
      </div>

      <label className="block text-sm font-medium text-brand-blue">
        Cabinet ou entreprise
        <input
          name="company"
          autoComplete="organization"
          maxLength={160}
          value={fields.company}
          onChange={(event) => updateField("company", event.target.value)}
          aria-invalid={Boolean(errors.company)}
          className={fieldClassName}
        />
        {errors.company ? (
          <span className="mt-1.5 block text-xs text-red-700">{errors.company}</span>
        ) : null}
      </label>

      <label className="block text-sm font-medium text-brand-blue">
        Votre besoin
        <textarea
          name="need"
          rows={4}
          maxLength={2000}
          placeholder={referralMode === "matching"
            ? "Décrivez en quelques mots ce dont vous avez besoin."
            : "Décrivez en quelques mots ce que vous souhaitez déléguer."}
          value={fields.need}
          onChange={(event) => updateField("need", event.target.value)}
          aria-invalid={Boolean(errors.need)}
          className={fieldClassName}
        />
        {errors.need ? (
          <span className="mt-1.5 block text-xs text-red-700">{errors.need}</span>
        ) : null}
      </label>

      <p className="text-xs leading-relaxed text-dema-muted">
        {referralMode === "matching"
          ? "En envoyant cette demande, vous acceptez que Demaa utilise ces informations pour étudier votre besoin et vous recontacter au sujet d’une éventuelle mise en relation."
          : `En envoyant cette demande, vous acceptez que Demaa transmette ces informations à ${resourceName} afin d’organiser la mise en relation.`} {" "}
        <Link
          href="/politique-de-confidentialite"
          className="font-medium text-dema-forest underline underline-offset-2"
        >
          Politique de confidentialité
        </Link>
      </p>

      <button
        type="submit"
        disabled={status === "submitting"}
        aria-busy={status === "submitting"}
        className="inline-flex min-h-11 w-full items-center justify-center rounded-full bg-dema-forest px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-blue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dema-forest/35 focus-visible:ring-offset-2 disabled:cursor-wait disabled:opacity-60"
      >
        {status === "submitting" ? "Envoi…" : "Envoyer ma demande"}
      </button>

      {status === "error" ? (
        <p role="alert" className="text-sm text-red-700">
          {Object.keys(errors).length > 0
            ? "Corrigez les champs signalés."
            : "La demande n’a pas pu être envoyée. Merci de réessayer."}
        </p>
      ) : null}
    </form>
  );
}
