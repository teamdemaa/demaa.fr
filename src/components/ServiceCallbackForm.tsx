"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { type FormEvent, useRef, useState } from "react";
import { LoaderCircle } from "lucide-react";
import CustomerSpaceAccessForm from "@/components/CustomerSpaceAccessForm";
import {
  getLeadAttributionPayload,
  trackLeadConversion,
} from "@/lib/lead-attribution-client";
import {
  clearLeadSubmissionKey,
  getLeadSubmissionKey,
} from "@/lib/lead-submission-client";
import { getServiceCallbackUiCopy } from "@/lib/service-callback-ui-copy";
import { useCustomerIdentity } from "@/lib/use-customer-identity";

type CallbackFields = Readonly<{
  company: string;
  phone: string;
  website: string;
}>;

type CallbackFieldErrors = Partial<Record<"company" | "phone", string>>;

export type CallbackPackage = Readonly<{
  name: string;
  pricing: Readonly<{ label: string; note: string }>;
  slug: string;
  summary: string;
}>;

export function CallbackPackageOverview({
  legend,
  packages,
}: {
  legend: string;
  packages: readonly CallbackPackage[];
}) {
  if (packages.length === 0) return null;

  return (
    <section className="space-y-3" aria-label={legend}>
      <h3 className="text-sm font-semibold text-brand-blue">{legend}</h3>
      {packages.map((servicePackage) => (
        <div
          key={servicePackage.slug}
          className="rounded-[0.9rem] border border-dema-line bg-dema-paper p-4"
        >
          <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
            <p className="text-sm font-semibold text-brand-blue">
              {servicePackage.name}
            </p>
            <p className="text-sm font-normal text-dema-muted">
              {servicePackage.pricing.label}
            </p>
          </div>
          <p className="mt-1.5 text-xs leading-relaxed text-dema-muted">
            {servicePackage.summary}
          </p>
        </div>
      ))}
    </section>
  );
}

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

export function validateCallbackFields(fields: CallbackFields, localeCode: "fr" | "en" = "fr"): CallbackFieldErrors {
  const ui = getServiceCallbackUiCopy(localeCode);
  const errors: CallbackFieldErrors = {};
  if (!fields.company.trim()) {
    errors.company = ui.companyError;
  }
  if (localeCode === "fr" && !isValidCallbackPhone(fields.phone)) {
    errors.phone = ui.phoneError;
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
  packages = [],
  serviceName,
  serviceSlug,
  localeCode = "fr",
  marketCode = "fr-fr",
  source,
  systemSlug,
}: {
  packages?: readonly CallbackPackage[];
  serviceName: string;
  serviceSlug: string;
  localeCode?: "fr" | "en";
  marketCode?: string;
  source?: string;
  systemSlug?: string;
}) {
  const ui = getServiceCallbackUiCopy(localeCode);
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { email: authenticatedEmail, loading: identityLoading } = useCustomerIdentity();
  const formRef = useRef<HTMLFormElement>(null);
  const submissionInFlightRef = useRef(false);
  const [fields, setFields] = useState<CallbackFields>(EMPTY_FIELDS);
  const [errors, setErrors] = useState<CallbackFieldErrors>({});
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [selectedPackageSlug, setSelectedPackageSlug] = useState(
    packages[0]?.slug ?? "",
  );

  function updateField(field: keyof CallbackFields, value: string) {
    setFields((current) => ({ ...current, [field]: value }));
    if (field !== "website") {
      setErrors((current) => ({ ...current, [field]: undefined }));
    }
    if (status !== "idle") setStatus("idle");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors = validateCallbackFields(fields, localeCode);
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

    const flowKey = `service-callback:${serviceSlug}:${selectedPackageSlug || "default"}`;
    try {
      const idempotencyKey = getLeadSubmissionKey(flowKey);
      await submitCallbackRequest({
        attribution: getLeadAttributionPayload(),
        company: fields.company.trim(),
        localeCode,
        marketCode,
        idempotencyKey,
        packageSlug: selectedPackageSlug || undefined,
        phone: localeCode === "fr" ? fields.phone.trim() : undefined,
        serviceSlug,
        source: source ?? searchParams.get("source") ?? undefined,
        sourcePage: pathname,
        systemSlug: systemSlug ?? searchParams.get("systemSlug") ?? undefined,
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

  if (localeCode === "en" && identityLoading) {
    return (
      <div className="mt-6 space-y-4">
        <CallbackPackageOverview legend={ui.packageLegend} packages={packages} />
        <div className="flex min-h-20 items-center justify-center text-sm text-dema-muted" role="status">
          <LoaderCircle className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
          Checking your access…
        </div>
      </div>
    );
  }

  if (localeCode === "en" && !authenticatedEmail) {
    const query = searchParams.toString();
    const returnTo = `${pathname}${query ? `?${query}` : ""}`;
    return (
      <div className="mt-6 space-y-4">
        <CallbackPackageOverview legend={ui.packageLegend} packages={packages} />
        <div className="rounded-[1rem] border border-dema-line bg-dema-sage/35 p-4 sm:p-5">
          <CustomerSpaceAccessForm
            choiceTitle="Sign in to send your request"
            localeCode="en"
            returnTo={returnTo}
          />
        </div>
      </div>
    );
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} noValidate className="mt-6 space-y-4">
      {packages.length > 0 ? (
        <fieldset
          disabled={status === "submitting"}
          aria-busy={status === "submitting"}
          className="space-y-3 disabled:pointer-events-none disabled:opacity-70"
        >
          <legend className="text-sm font-semibold text-brand-blue">
            {ui.packageLegend}
          </legend>
          {packages.map((servicePackage) => {
            const selected = selectedPackageSlug === servicePackage.slug;
            return (
              <label
                key={servicePackage.slug}
                className={`block cursor-pointer rounded-[0.9rem] border p-4 transition ${
                  selected
                    ? "border-dema-forest/40 bg-dema-sage/45"
                    : "border-dema-line bg-dema-paper hover:border-dema-forest/25"
                } has-[:disabled]:cursor-wait`}
              >
                <span className="flex items-start gap-3">
                  <input
                    type="radio"
                    name="packageSlug"
                    value={servicePackage.slug}
                    checked={selected}
                    onChange={() => {
                      setSelectedPackageSlug(servicePackage.slug);
                      if (status !== "idle") setStatus("idle");
                    }}
                    className="mt-1 h-4 w-4 accent-dema-forest"
                  />
                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                      <span className="text-sm font-semibold text-brand-blue">
                        {servicePackage.name}
                      </span>
                      <span className="text-sm font-normal text-dema-muted">
                        {servicePackage.pricing.label}
                      </span>
                    </span>
                    <span className="mt-1.5 block text-xs leading-relaxed text-dema-muted">
                      {servicePackage.summary}
                    </span>
                  </span>
                </span>
              </label>
            );
          })}
        </fieldset>
      ) : null}

      <label className="block text-sm font-semibold text-brand-blue">
        {ui.company}
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

      {localeCode === "fr" ? (
        <label className="block text-sm font-semibold text-brand-blue">
          {ui.phone}
          <input
            name="phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            placeholder={ui.phonePlaceholder}
            maxLength={60}
            value={fields.phone}
            onChange={(event) => updateField("phone", event.target.value)}
            aria-invalid={Boolean(errors.phone)}
            aria-describedby={errors.phone
              ? "callback-phone-help callback-phone-error"
              : "callback-phone-help"}
            className={fieldClassName}
          />
          <span id="callback-phone-help" className="mt-1.5 block text-xs font-normal leading-relaxed text-dema-muted">
            {ui.phoneHelp}
          </span>
          {errors.phone ? (
            <span id="callback-phone-error" className="mt-1.5 block text-xs font-medium text-red-700">
              {errors.phone}
            </span>
          ) : null}
        </label>
      ) : null}

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
        {status === "submitting" ? ui.sending : ui.submit}
      </button>

      <p className="text-xs leading-relaxed text-dema-muted">
        {ui.consent(serviceName)}{" "}
        <Link
          href="/politique-de-confidentialite"
          className="font-medium text-dema-forest underline underline-offset-2"
        >
          {ui.privacy}
        </Link>
      </p>

      {status === "success" ? (
        <p role="status" className="text-sm font-medium text-dema-forest">
          {ui.success}
        </p>
      ) : null}
      {status === "error" ? (
        <p role="alert" className="text-sm font-medium text-red-700">
          {Object.keys(errors).length > 0
            ? ui.invalid
            : ui.failure}
        </p>
      ) : null}
    </form>
  );
}
