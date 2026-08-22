"use client";

import { Check, LoaderCircle, Mail, Stethoscope } from "lucide-react";
import { type FormEvent, useEffect, useRef, useState } from "react";
import { getLeadAttributionPayload } from "@/lib/lead-attribution-client";
import type { GuestAccess } from "@/lib/guest-action-plan.client";

type Status = "idle" | "sending" | "success" | "error";

function idempotencyKey(prefix: string) {
  return `${prefix}:${crypto.randomUUID()}`;
}

async function submit(path: string, access: GuestAccess, body: Record<string, unknown>) {
  const response = await fetch(
    `/api/guest/action-plans/${encodeURIComponent(access.generationId)}/${path}`,
    {
      body: JSON.stringify(body),
      headers: {
        Authorization: `Bearer ${access.accessKey}`,
        "Content-Type": "application/json",
      },
      method: "POST",
    },
  );
  const payload = await response.json().catch(() => null) as { error?: string; ok?: boolean } | null;
  if (!response.ok || payload?.ok !== true) {
    throw new Error(payload?.error ?? "La demande n’a pas pu être envoyée.");
  }
}

export default function GuestActionPlanDelivery({ access }: { access: GuestAccess }) {
  const [emailKey] = useState(() => idempotencyKey("guest-plan-email"));
  const [diagnosticKey] = useState(() => idempotencyKey("guest-plan-diagnostic"));
  const [emailStatus, setEmailStatus] = useState<Status>("idle");
  const [emailError, setEmailError] = useState<string | null>(null);
  const [diagnosticOpen, setDiagnosticOpen] = useState(false);
  const [diagnosticStatus, setDiagnosticStatus] = useState<Status>("idle");
  const [diagnosticError, setDiagnosticError] = useState<string | null>(null);
  const diagnosticEmailRef = useRef<HTMLInputElement | null>(null);
  const emailSuccessRef = useRef<HTMLParagraphElement | null>(null);
  const diagnosticSuccessRef = useRef<HTMLParagraphElement | null>(null);

  useEffect(() => {
    if (diagnosticOpen) diagnosticEmailRef.current?.focus();
  }, [diagnosticOpen]);

  useEffect(() => {
    if (emailStatus === "success") emailSuccessRef.current?.focus();
  }, [emailStatus]);

  useEffect(() => {
    if (diagnosticStatus === "success") diagnosticSuccessRef.current?.focus();
  }, [diagnosticStatus]);

  async function sendPlan(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (emailStatus === "sending") return;
    const form = new FormData(event.currentTarget);
    setEmailStatus("sending");
    setEmailError(null);
    try {
      await submit("email", access, {
        email: form.get("email"),
        idempotencyKey: emailKey,
        website: form.get("website"),
      });
      setEmailStatus("success");
    } catch (error) {
      setEmailStatus("error");
      setEmailError(error instanceof Error ? error.message : "L’e-mail n’a pas pu être envoyé.");
    }
  }

  async function requestDiagnostic(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (diagnosticStatus === "sending") return;
    const form = new FormData(event.currentTarget);
    setDiagnosticStatus("sending");
    setDiagnosticError(null);
    try {
      await submit("diagnostic", access, {
        attribution: getLeadAttributionPayload(),
        contactConsent: form.get("contactConsent") === "on",
        email: form.get("email"),
        idempotencyKey: diagnosticKey,
        message: form.get("message"),
        phone: form.get("phone"),
        website: form.get("website"),
      });
      setDiagnosticStatus("success");
    } catch (error) {
      setDiagnosticStatus("error");
      setDiagnosticError(error instanceof Error ? error.message : "La demande n’a pas pu être envoyée.");
    }
  }

  return (
    <section aria-labelledby="guest-plan-next-title" className="grid gap-4 pb-24 md:grid-cols-2">
      <h2 id="guest-plan-next-title" className="sr-only">Conserver le plan ou demander un diagnostic</h2>
      <div className="rounded-[1.2rem] border border-dema-line bg-dema-paper p-5 sm:p-6">
        <Mail className="h-5 w-5 text-dema-forest" aria-hidden="true" />
        <h3 className="mt-4 text-lg font-medium text-brand-blue">Recevoir ce plan par e-mail</h3>
        <p className="mt-2 text-sm leading-relaxed text-dema-muted">Le plan vous est envoyé tel qu’il apparaît ici.</p>
        {emailStatus === "success" ? (
          <p ref={emailSuccessRef} tabIndex={-1} className="mt-5 flex items-center gap-2 text-sm text-dema-forest outline-none" role="status">
            <Check className="h-4 w-4" aria-hidden="true" /> Plan envoyé.
          </p>
        ) : (
          <form onSubmit={sendPlan} className="mt-5">
            <label className="sr-only" htmlFor="guest-plan-email">Adresse e-mail</label>
            <div className="flex overflow-hidden rounded-xl border border-dema-line focus-within:border-dema-forest/40">
              <input id="guest-plan-email" name="email" type="email" required autoComplete="email" placeholder="Votre adresse e-mail" className="min-w-0 flex-1 bg-transparent px-4 text-sm text-brand-blue outline-none" />
              <button type="submit" disabled={emailStatus === "sending"} className="inline-flex min-h-12 shrink-0 items-center justify-center bg-dema-forest px-4 text-sm font-medium text-white disabled:opacity-60">
                {emailStatus === "sending" ? <LoaderCircle className="h-4 w-4 animate-spin" aria-label="Envoi" /> : "Envoyer"}
              </button>
            </div>
            <input name="website" tabIndex={-1} autoComplete="off" className="sr-only" aria-hidden="true" />
            {emailError ? <p className="mt-2 text-sm text-red-700" role="alert">{emailError}</p> : null}
          </form>
        )}
      </div>

      <div className="rounded-[1.2rem] border border-dema-line bg-dema-paper p-5 sm:p-6">
        <Stethoscope className="h-5 w-5 text-dema-forest" aria-hidden="true" />
        <h3 className="mt-4 text-lg font-medium text-brand-blue">Demander un diagnostic</h3>
        <p className="mt-2 text-sm leading-relaxed text-dema-muted">L’équipe Demaa relit votre situation et vous répond par e-mail.</p>
        {diagnosticStatus === "success" ? (
          <p ref={diagnosticSuccessRef} tabIndex={-1} className="mt-5 flex items-center gap-2 text-sm text-dema-forest outline-none" role="status">
            <Check className="h-4 w-4" aria-hidden="true" /> Demande envoyée.
          </p>
        ) : !diagnosticOpen ? (
          <button type="button" onClick={() => setDiagnosticOpen(true)} className="mt-5 inline-flex min-h-11 items-center justify-center rounded-full bg-dema-forest px-5 text-sm font-medium text-white transition hover:bg-brand-blue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dema-forest/35 focus-visible:ring-offset-2">
            Demander un diagnostic
          </button>
        ) : (
          <form onSubmit={requestDiagnostic} className="mt-5 space-y-3">
            <label className="block text-sm text-brand-blue">
              Adresse e-mail
              <input ref={diagnosticEmailRef} name="email" type="email" required autoComplete="email" className="demaa-input mt-2" />
            </label>
            <label className="block text-sm text-brand-blue">
              Téléphone <span className="text-dema-muted">(facultatif)</span>
              <input name="phone" type="tel" autoComplete="tel" className="demaa-input mt-2" />
            </label>
            <label className="block text-sm text-brand-blue">
              Comment pouvons-nous vous aider ?
              <textarea name="message" rows={3} maxLength={2_000} className="demaa-textarea mt-2" />
            </label>
            <label className="flex items-start gap-2 text-xs leading-relaxed text-dema-muted">
              <input name="contactConsent" type="checkbox" required className="mt-0.5 h-4 w-4 accent-dema-forest" />
              <span>J’accepte que Demaa utilise mes coordonnées et ce plan pour me répondre par e-mail.</span>
            </label>
            <input name="website" tabIndex={-1} autoComplete="off" className="sr-only" aria-hidden="true" />
            {diagnosticError ? <p className="text-sm text-red-700" role="alert">{diagnosticError}</p> : null}
            <div className="flex items-center gap-3">
              <button type="submit" disabled={diagnosticStatus === "sending"} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-dema-forest px-5 text-sm font-medium text-white disabled:opacity-60">
                {diagnosticStatus === "sending" ? <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" /> : null}
                Envoyer
              </button>
              <button type="button" onClick={() => setDiagnosticOpen(false)} className="min-h-11 px-3 text-sm text-dema-muted">Annuler</button>
            </div>
          </form>
        )}
      </div>
    </section>
  );
}
