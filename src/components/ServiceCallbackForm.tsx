"use client";

import Link from "next/link";
import { type FormEvent, useRef, useState } from "react";
import {
  getLeadAttributionPayload,
  trackLeadConversion,
} from "@/lib/lead-attribution-client";
import {
  clearLeadSubmissionKey,
  getLeadSubmissionKey,
} from "@/lib/lead-submission-client";

type CallbackFields = Readonly<{
  company: string;
  phone: string;
  website: string;
}>;

type CallbackFieldErrors = Partial<Record<"company" | "phone", string>>;

const EMPTY_FIELDS: CallbackFields = {
  company: "",
  phone: "",
  website: "",
};

export function isValidCallbackPhone(value: string) {
  const phone = value.trim();
  if (!/^\+?[0-9\s().-]+$/.test(phone)) return false;
  const digitCount = phone.replace(/\D/g, "").length;
  return digitCount >= 8 && digitCount <= 15;
}

export function validateCallbackFields(fields: CallbackFields): CallbackFieldErrors {
  const errors: CallbackFieldErrors = {};
  if (!fields.company.trim()) {
    errors.company = "Indiquez le nom de votre entreprise.";
  }
  if (!isValidCallbackPhone(fields.phone)) {
    errors.phone = "Indiquez un numéro de téléphone valide.";
  }
  return errors;
}

type FetchCallback = (
  input: RequestInfo | URL,
  init?: RequestInit,
) => Promise<Response>;

function isStrictSuccessPayload(value: unknown): value is { ok: true } {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const keys = Object.keys(value);
  return keys.length === 1 && keys[0] === "ok" && Reflect.get(value, "ok") === true;
}

export async function submitCallbackRequest(
  payload: Record<string, unknown>,
  fetchCallback: FetchCallback = fetch,
) {
  const response = await fetchCallback("/api/service-callback-request", {
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
    throw new Error("callback request failed");
  }

  const body = await response.json().catch(() => null);
  if (!isStrictSuccessPayload(body)) throw new Error("callback request failed");
}

export default function ServiceCallbackForm({
  serviceName,
  serviceSlug,
}: {
  serviceName: string;
  serviceSlug: string;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const submissionInFlightRef = useRef(false);
  const [fields, setFields] = useState<CallbackFields>(EMPTY_FIELDS);
  const [errors, setErrors] = useState<CallbackFieldErrors>({});
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");

  function updateField(field: keyof CallbackFields, value: string) {
    setFields((current) => ({ ...current, [field]: value }));
    if (field !== "website") {
      setErrors((current) => ({ ...current, [field]: undefined }));
    }
    if (status !== "idle") setStatus("idle");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors = validateCallbackFields(fields);
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

    const flowKey = `service-callback:${serviceSlug}`;
    try {
      const idempotencyKey = getLeadSubmissionKey(flowKey);
      await submitCallbackRequest({
        attribution: getLeadAttributionPayload(),
        company: fields.company.trim(),
        idempotencyKey,
        phone: fields.phone.trim(),
        serviceSlug,
        website: fields.website,
      });
      clearLeadSubmissionKey(flowKey);
      setFields(EMPTY_FIELDS);
      setStatus("success");
      trackLeadConversion({ requestType: "service_callback_request" });
    } catch {
      setStatus("error");
    } finally {
      submissionInFlightRef.current = false;
    }
  }

  const fieldClassName =
    "mt-2 min-h-11 w-full rounded-[0.9rem] border border-dema-line bg-dema-paper px-4 py-3 text-sm text-brand-blue outline-none transition placeholder:text-dema-muted/70 focus:border-dema-forest/40 focus:ring-2 focus:ring-dema-forest/20";

  return (
    <form ref={formRef} onSubmit={handleSubmit} noValidate className="mt-6 space-y-4">
      <label className="block text-sm font-semibold text-brand-blue">
        Entreprise
        <input
          name="company"
          autoComplete="organization"
          maxLength={160}
          value={fields.company}
          onChange={(event) => updateField("company", event.target.value)}
          aria-invalid={Boolean(errors.company)}
          aria-describedby={errors.company ? "callback-company-error" : undefined}
          className={fieldClassName}
        />
        {errors.company ? (
          <span id="callback-company-error" className="mt-1.5 block text-xs font-medium text-red-700">
            {errors.company}
          </span>
        ) : null}
      </label>

      <label className="block text-sm font-semibold text-brand-blue">
        Téléphone
        <input
          name="phone"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          maxLength={60}
          value={fields.phone}
          onChange={(event) => updateField("phone", event.target.value)}
          aria-invalid={Boolean(errors.phone)}
          aria-describedby={errors.phone ? "callback-phone-error" : undefined}
          className={fieldClassName}
        />
        {errors.phone ? (
          <span id="callback-phone-error" className="mt-1.5 block text-xs font-medium text-red-700">
            {errors.phone}
          </span>
        ) : null}
      </label>

      <input
        name="website"
        type="text"
        value={fields.website}
        onChange={(event) => updateField("website", event.target.value)}
        tabIndex={-1}
        autoComplete="off"
        className="hidden"
        aria-hidden="true"
      />

      <button
        type="submit"
        disabled={status === "submitting"}
        aria-busy={status === "submitting"}
        className="inline-flex min-h-11 w-full items-center justify-center rounded-full bg-dema-forest px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-blue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dema-forest/35 focus-visible:ring-offset-2 disabled:cursor-wait disabled:opacity-60"
      >
        {status === "submitting" ? "Envoi…" : "Être rappelé"}
      </button>

      <p className="text-xs leading-relaxed text-dema-muted">
        En envoyant cette demande, vous acceptez d’être contacté au sujet de {serviceName}.{" "}
        <Link
          href="/politique-de-confidentialite"
          className="font-medium text-dema-forest underline underline-offset-2"
        >
          Politique de confidentialité
        </Link>
      </p>

      {status === "success" ? (
        <p role="status" className="text-sm font-medium text-dema-forest">
          Demande reçue. Nous vous rappelons rapidement.
        </p>
      ) : null}
      {status === "error" ? (
        <p role="alert" className="text-sm font-medium text-red-700">
          {Object.keys(errors).length > 0
            ? "Corrigez les champs signalés avant de réessayer."
            : "La demande n’a pas pu être envoyée. Merci de réessayer."}
        </p>
      ) : null}
    </form>
  );
}
