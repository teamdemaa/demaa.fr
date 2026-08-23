"use client";

import { Check, LoaderCircle, Mail, Stethoscope } from "lucide-react";
import { type FormEvent, useEffect, useRef, useState } from "react";
import type { GuestAccess } from "@/lib/guest-action-plan.client";
import {
  createGuestFollowUpIdempotencyKey,
  submitGuestActionPlanFollowUp,
} from "@/lib/guest-action-plan-follow-up.client";

type Status = "idle" | "sending" | "success" | "error";

export default function GuestActionPlanDelivery({
  access,
  onOpenDiagnostic,
}: {
  access: GuestAccess;
  onOpenDiagnostic: () => void;
}) {
  const [emailKey] = useState(() => (
    createGuestFollowUpIdempotencyKey("guest-plan-email")
  ));
  const [emailStatus, setEmailStatus] = useState<Status>("idle");
  const [emailError, setEmailError] = useState<string | null>(null);
  const emailSuccessRef = useRef<HTMLParagraphElement | null>(null);

  useEffect(() => {
    if (emailStatus === "success") emailSuccessRef.current?.focus();
  }, [emailStatus]);

  async function sendPlan(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (emailStatus === "sending") return;
    const form = new FormData(event.currentTarget);
    setEmailStatus("sending");
    setEmailError(null);
    try {
      await submitGuestActionPlanFollowUp("email", access, {
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
        <button type="button" onClick={onOpenDiagnostic} className="mt-5 inline-flex min-h-11 items-center justify-center rounded-full bg-dema-forest px-5 text-sm font-medium text-white transition hover:bg-brand-blue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dema-forest/35 focus-visible:ring-offset-2">
          Demander un diagnostic
        </button>
      </div>
    </section>
  );
}
