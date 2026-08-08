"use client";

import { useEffect, useId, useRef, useState } from "react";
import { getLeadAttributionPayload, trackLeadConversion } from "@/lib/lead-attribution-client";
import { clearLeadSubmissionKey, getLeadSubmissionKey } from "@/lib/lead-submission-client";

type CallbackContext = "process" | "solutions";

type SystemCallbackRequestButtonProps = {
  className: string;
  context: CallbackContext;
  systemSlug: string;
};

const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

export default function SystemCallbackRequestButton({
  className,
  context,
  systemSlug,
}: SystemCallbackRequestButtonProps) {
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const triggerRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const firstNameRef = useRef<HTMLInputElement>(null);
  const successRef = useRef<HTMLParagraphElement>(null);
  const titleId = useId();
  const descriptionId = useId();
  const flowKey = `callback:${context}:${systemSlug}`;

  useEffect(() => {
    if (!open) return;
    (success ? successRef.current : firstNameRef.current)?.focus();

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        close();
        return;
      }
      if (event.key !== "Tab" || !dialogRef.current) return;
      const focusable = [...dialogRef.current.querySelectorAll<HTMLElement>(FOCUSABLE)];
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable.at(-1)!;
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, success]);

  function close() {
    setOpen(false);
    setError("");
    setSuccess(false);
    requestAnimationFrame(() => triggerRef.current?.focus());
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const form = new FormData(event.currentTarget);
    setPending(true);

    try {
      const response = await fetch("/api/callback-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          attribution: getLeadAttributionPayload(),
          context,
          firstName: form.get("firstName"),
          idempotencyKey: getLeadSubmissionKey(flowKey),
          need: form.get("need"),
          phone: form.get("phone"),
          preferredTime: form.get("preferredTime"),
          systemSlug,
          website: form.get("website"),
        }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(typeof result.error === "string" ? result.error : "Impossible d’envoyer votre demande.");

      clearLeadSubmissionKey(flowKey);
      trackLeadConversion({
        requestType: `system_callback_request_${context}`,
        systemSlug,
      });
      setSuccess(true);
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : "Impossible d’envoyer votre demande.");
    } finally {
      setPending(false);
    }
  }

  return (
    <>
      <button ref={triggerRef} type="button" onClick={() => setOpen(true)} className={className} data-resource-cta>
        Demander à être rappelé
      </button>
      {open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-dema-forest/45 p-4" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) close(); }}>
          <div ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby={titleId} aria-describedby={descriptionId} className="w-full max-w-lg rounded-2xl bg-dema-paper p-6 shadow-xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 id={titleId} className="text-xl font-semibold text-brand-blue">Demander un rappel</h2>
                <p id={descriptionId} className="mt-1 text-sm text-dema-muted">Un spécialiste Demaa vous rappellera au sujet de votre besoin.</p>
              </div>
              <button type="button" onClick={close} className="min-h-11 min-w-11 rounded-full text-dema-forest focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dema-forest" aria-label="Fermer la demande de rappel">×</button>
            </div>
            {success ? (
              <div className="mt-6" aria-live="polite">
                <p ref={successRef} tabIndex={-1} className="text-base font-semibold text-brand-blue">Votre demande de rappel est bien reçue.</p>
                <p className="mt-2 text-sm text-dema-muted">Nous vous recontactons dès que possible.</p>
                <button type="button" onClick={close} className="demaa-primary-button mt-5">Fermer</button>
              </div>
            ) : (
              <form className="mt-6 space-y-4" onSubmit={submit}>
                <label className="block text-sm font-medium text-brand-blue">Prénom<input ref={firstNameRef} required name="firstName" autoComplete="given-name" className="mt-1 w-full rounded-lg border border-dema-line bg-white px-3 py-2" /></label>
                <label className="block text-sm font-medium text-brand-blue">Téléphone<input required name="phone" type="tel" autoComplete="tel" inputMode="tel" className="mt-1 w-full rounded-lg border border-dema-line bg-white px-3 py-2" /></label>
                <label className="block text-sm font-medium text-brand-blue">Besoin<textarea required name="need" rows={4} className="mt-1 w-full rounded-lg border border-dema-line bg-white px-3 py-2" /></label>
                <label className="block text-sm font-medium text-brand-blue">Moment préféré <span className="font-normal text-dema-muted">(facultatif)</span><select name="preferredTime" defaultValue="" className="mt-1 w-full rounded-lg border border-dema-line bg-white px-3 py-2"><option value="">Sans préférence</option><option>Matin</option><option>Midi</option><option>Après-midi</option></select></label>
                <input name="website" tabIndex={-1} autoComplete="off" className="sr-only" aria-hidden="true" />
                <p className="text-xs leading-relaxed text-dema-muted">En envoyant ce formulaire, vous demandez à être rappelé par un spécialiste Demaa au sujet de votre besoin.</p>
                <p aria-live="assertive" className="text-sm text-red-700">{error}</p>
                <button type="submit" disabled={pending} className="demaa-primary-button w-full disabled:opacity-60">{pending ? "Envoi…" : "Demander à être rappelé"}</button>
              </form>
            )}
          </div>
        </div>
      ) : null}
    </>
  );
}
