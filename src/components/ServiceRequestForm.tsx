"use client";

import Link from "next/link";
import { type FormEvent, useRef, useState } from "react";
import { getLeadAttributionPayload } from "@/lib/lead-attribution-client";
import type { LeadAttributionPayload } from "@/lib/lead-attribution";
import {
  clearLeadSubmissionKey,
  getLeadSubmissionKey,
} from "@/lib/lead-submission-client";
import type { ServiceOfferSlug } from "@/lib/service-catalog-v2-dto";

export type ServiceRequestFields = Readonly<{
  firstName: string;
  email: string;
  company: string;
  need: string;
}>;

export type ServiceRequestPayload = Readonly<{
  attribution?: LeadAttributionPayload;
  company: string;
  email: string;
  firstName: string;
  idempotencyKey: string;
  marketingConsent: false;
  need: string;
  serviceSlug: ServiceOfferSlug;
  systemSlug: null;
}>;

type FieldErrors = Partial<Record<keyof ServiceRequestFields, string>>;

const EMPTY_FIELDS: ServiceRequestFields = {
  firstName: "",
  email: "",
  company: "",
  need: "",
};

const PERSONAL_EMAIL_DOMAINS = new Set([
  "gmail.com",
  "hotmail.com",
  "hotmail.fr",
  "aol.com",
  "icloud.com",
  "live.com",
  "live.fr",
  "outlook.com",
  "outlook.fr",
  "proton.me",
  "protonmail.com",
  "yahoo.com",
  "yahoo.fr",
]);

export function validateServiceRequestFields(fields: ServiceRequestFields): FieldErrors {
  const errors: FieldErrors = {};
  const email = fields.email.trim().toLowerCase();
  const emailDomain = email.split("@")[1] ?? "";

  if (!fields.firstName.trim()) errors.firstName = "Indiquez votre prénom.";
  if (!fields.company.trim()) errors.company = "Indiquez le nom de votre entreprise.";
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = "Indiquez une adresse e-mail professionnelle valide.";
  } else if (PERSONAL_EMAIL_DOMAINS.has(emailDomain)) {
    errors.email = "Utilisez votre adresse e-mail professionnelle.";
  }
  if (!fields.need.trim()) errors.need = "Décrivez brièvement votre besoin.";

  return errors;
}

export function buildServiceRequestPayload(
  fields: ServiceRequestFields,
  serviceSlug: ServiceOfferSlug,
  idempotencyKey: string,
  attribution?: LeadAttributionPayload | null,
): ServiceRequestPayload {
  return {
    ...(attribution ? { attribution } : {}),
    company: fields.company.trim(),
    email: fields.email.trim().toLowerCase(),
    firstName: fields.firstName.trim(),
    idempotencyKey,
    marketingConsent: false,
    need: fields.need.trim(),
    serviceSlug,
    systemSlug: null,
  };
}

const SERVICE_REQUEST_SUCCESS_STATUS = 202;

type FetchServiceRequest = (
  input: RequestInfo | URL,
  init?: RequestInit,
) => Promise<Response>;

function isStrictSuccessPayload(value: unknown): value is { ok: true } {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const keys = Object.keys(value);
  return keys.length === 1 && keys[0] === "ok" && Reflect.get(value, "ok") === true;
}

export async function submitServiceRequest(
  endpoint: string,
  payload: ServiceRequestPayload,
  fetchRequest: FetchServiceRequest = fetch,
) {
  const response = await fetchRequest(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const mediaType = response.headers
    .get("content-type")
    ?.split(";", 1)[0]
    ?.trim()
    .toLowerCase();

  if (response.status !== SERVICE_REQUEST_SUCCESS_STATUS || mediaType !== "application/json") {
    throw new Error("service request failed");
  }

  let result: unknown;
  try {
    result = await response.json();
  } catch {
    throw new Error("service request failed");
  }

  if (!isStrictSuccessPayload(result)) throw new Error("service request failed");
}

export function acquireServiceRequestSubmission(lock: { current: boolean }) {
  if (lock.current) return false;
  lock.current = true;
  return true;
}

export default function ServiceRequestForm({
  endpoint = "/api/service-request",
  serviceSlug,
}: {
  endpoint?: string;
  serviceSlug: ServiceOfferSlug;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const submissionInFlightRef = useRef(false);
  const [fields, setFields] = useState<ServiceRequestFields>(EMPTY_FIELDS);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");

  function updateField(field: keyof ServiceRequestFields, value: string) {
    setFields((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
    if (status !== "idle") setStatus("idle");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors = validateServiceRequestFields(fields);

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

    if (!acquireServiceRequestSubmission(submissionInFlightRef)) return;

    setErrors({});
    setStatus("submitting");

    const flowKey = `service-request:${serviceSlug}`;
    try {
      const idempotencyKey = getLeadSubmissionKey(flowKey);
      await submitServiceRequest(
        endpoint,
        buildServiceRequestPayload(
          fields,
          serviceSlug,
          idempotencyKey,
          getLeadAttributionPayload(),
        ),
      );
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
    "mt-2 min-h-11 w-full rounded-[0.9rem] border border-dema-line bg-dema-paper px-4 py-3 text-sm text-brand-blue outline-none transition placeholder:text-dema-muted/70 focus:border-dema-forest/40 focus:ring-2 focus:ring-dema-forest/20";

  return (
    <form ref={formRef} onSubmit={handleSubmit} noValidate className="mt-7 space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="text-sm font-semibold text-brand-blue">
          Prénom
          <input
            name="firstName"
            autoComplete="given-name"
            maxLength={80}
            value={fields.firstName}
            onChange={(event) => updateField("firstName", event.target.value)}
            aria-invalid={Boolean(errors.firstName)}
            aria-describedby={errors.firstName ? "service-first-name-error" : undefined}
            className={fieldClassName}
          />
          {errors.firstName ? (
            <span id="service-first-name-error" className="mt-1.5 block text-xs font-medium text-red-700">
              {errors.firstName}
            </span>
          ) : null}
        </label>

        <label className="text-sm font-semibold text-brand-blue">
          E-mail professionnel
          <input
            name="email"
            type="email"
            autoComplete="email"
            maxLength={160}
            value={fields.email}
            onChange={(event) => updateField("email", event.target.value)}
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? "service-email-error" : undefined}
            className={fieldClassName}
          />
          {errors.email ? (
            <span id="service-email-error" className="mt-1.5 block text-xs font-medium text-red-700">
              {errors.email}
            </span>
          ) : null}
        </label>
      </div>

      <label className="block text-sm font-semibold text-brand-blue">
        Entreprise
        <input
          name="company"
          autoComplete="organization"
          maxLength={160}
          value={fields.company}
          onChange={(event) => updateField("company", event.target.value)}
          aria-invalid={Boolean(errors.company)}
          aria-describedby={errors.company ? "service-company-error" : undefined}
          className={fieldClassName}
        />
        {errors.company ? (
          <span id="service-company-error" className="mt-1.5 block text-xs font-medium text-red-700">
            {errors.company}
          </span>
        ) : null}
      </label>

      <label className="block text-sm font-semibold text-brand-blue">
        Votre besoin
        <textarea
          name="need"
          rows={4}
          maxLength={2000}
          value={fields.need}
          onChange={(event) => updateField("need", event.target.value)}
          aria-invalid={Boolean(errors.need)}
          aria-describedby={errors.need ? "service-need-error" : undefined}
          className={fieldClassName}
        />
        {errors.need ? (
          <span id="service-need-error" className="mt-1.5 block text-xs font-medium text-red-700">
            {errors.need}
          </span>
        ) : null}
      </label>

      <button
        type="submit"
        disabled={status === "submitting"}
        aria-busy={status === "submitting"}
        className="inline-flex min-h-11 items-center justify-center rounded-full bg-dema-forest px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-blue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dema-forest/35 focus-visible:ring-offset-2 disabled:cursor-wait disabled:opacity-60"
      >
        {status === "submitting" ? "Envoi…" : "Parler de mon projet"}
      </button>

      <p className="text-xs leading-relaxed text-dema-muted">
        <Link
          href="/politique-de-confidentialite"
          className="font-medium text-dema-forest underline underline-offset-2"
        >
          Politique de confidentialité
        </Link>
      </p>

      {status === "success" ? (
        <p role="status" className="text-sm font-medium text-dema-forest">
          Votre demande a bien été envoyée. Nous revenons vers vous rapidement.
        </p>
      ) : null}
      {status === "error" ? (
        <p role="alert" className="text-sm font-medium text-red-700">
          {Object.keys(errors).length > 0
            ? "Corrigez les champs signalés avant de réessayer."
            : "La demande n’a pas pu être envoyée. Vérifiez vos informations puis réessayez."}
        </p>
      ) : null}
    </form>
  );
}
