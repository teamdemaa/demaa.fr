"use client";

import { Check, LoaderCircle, X } from "lucide-react";
import Link from "next/link";
import { type FormEvent, useEffect, useRef, useState } from "react";
import { isValidEmail } from "@/lib/email";
import { getLeadAttributionPayload, trackLeadConversion } from "@/lib/lead-attribution-client";
import { clearLeadSubmissionKey, getLeadSubmissionKey } from "@/lib/lead-submission-client";
import type { PublicLiveTraining } from "@/lib/live-session-catalog";
import { formatLiveSessionDate } from "@/lib/live-session-format";

type ResponsePayload = { error?: string } | { ok: true } | null;

function getErrorMessage(response: Response, payload: ResponsePayload) {
  const serverError = payload && "error" in payload ? payload.error : undefined;
  if ((response.status === 400 || response.status === 404) && serverError) return serverError;
  if (response.status === 429) return "Trop de demandes ont été effectuées. Réessayez un peu plus tard.";
  return "Impossible d’enregistrer votre demande pour le moment.";
}

export default function AcademyLiveRegistrationModal({
  onClose,
  training,
}: {
  onClose: () => void;
  training: PublicLiveTraining;
}) {
  const dialogRef = useRef<HTMLElement>(null);
  const slotSelectRef = useRef<HTMLSelectElement>(null);
  const successRef = useRef<HTMLDivElement>(null);
  const [company, setCompany] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [fullName, setFullName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [slotId, setSlotId] = useState(training.slots[0]?.id ?? "");
  const [website, setWebsite] = useState("");

  useEffect(() => {
    const previouslyFocused = document.activeElement instanceof HTMLElement
      ? document.activeElement
      : null;
    const dialog = dialogRef.current;

    function getFocusableElements() {
      return Array.from(dialog?.querySelectorAll<HTMLElement>(
        'button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), [href], [tabindex]:not([tabindex="-1"])',
      ) ?? []);
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key !== "Tab") return;
      const focusable = getFocusableElements();
      const first = focusable[0];
      const last = focusable.at(-1);
      if (!first || !last) return;
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleKeyDown);
    slotSelectRef.current?.focus();
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
      previouslyFocused?.focus();
    };
  }, [onClose]);

  useEffect(() => {
    if (isSuccess) successRef.current?.focus();
  }, [isSuccess]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSubmitting) return;

    const normalizedName = fullName.trim();
    const normalizedEmail = email.trim();
    const normalizedCompany = company.trim();
    if (!normalizedName || !normalizedCompany || !slotId || !isValidEmail(normalizedEmail)) {
      setError("Merci de compléter votre nom, votre e-mail professionnel, votre entreprise et le créneau.");
      return;
    }

    const flowKey = `academy-live:${training.slug}:${slotId}`;
    setError(null);
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/academy-live-registration", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          attribution: getLeadAttributionPayload(),
          company: normalizedCompany,
          email: normalizedEmail,
          fullName: normalizedName,
          idempotencyKey: getLeadSubmissionKey(flowKey),
          slotId,
          trainingSlug: training.slug,
          website,
        }),
      });
      const payload = (await response.json().catch(() => null)) as ResponsePayload;
      if (!response.ok || !payload || !("ok" in payload) || payload.ok !== true) {
        setError(getErrorMessage(response, payload));
        return;
      }

      clearLeadSubmissionKey(flowKey);
      setIsSuccess(true);
      trackLeadConversion({ requestType: "academy_live_registration", systemSlug: null });
    } catch {
      setError("Impossible d’enregistrer votre demande pour le moment.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center overflow-y-auto bg-brand-blue/35 px-4 py-4 backdrop-blur-sm sm:py-6"
      onClick={onClose}
    >
      <section
        ref={dialogRef}
        className="demaa-dialog-shadow relative max-h-[calc(100dvh-2rem)] w-full max-w-[32rem] overflow-y-auto rounded-[1.5rem] border border-dema-line bg-dema-paper"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="academy-live-modal-title"
        aria-describedby="academy-live-modal-description"
        tabIndex={-1}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Fermer"
          className="absolute right-4 top-4 inline-flex h-10 w-10 items-center justify-center rounded-full bg-dema-paper text-brand-blue transition hover:bg-dema-sage"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
        <div className="p-6 sm:p-8">
          {isSuccess ? (
            <div ref={successRef} role="status" tabIndex={-1} className="outline-none">
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-dema-sage text-dema-forest">
                <Check className="h-5 w-5" aria-hidden="true" />
              </span>
              <h2 id="academy-live-modal-title" className="mt-5 text-2xl font-semibold text-brand-blue">
                Votre demande est enregistrée.
              </h2>
              <p id="academy-live-modal-description" className="mt-3 text-sm leading-relaxed text-dema-muted">
                Demaa vous recontactera pour confirmer la disponibilité du créneau et vous transmettre les modalités de facturation.
              </p>
              <button type="button" onClick={onClose} className="demaa-primary-button mt-6 w-full">
                Fermer
              </button>
            </div>
          ) : (
            <>
              <h2 id="academy-live-modal-title" className="pr-10 text-2xl font-semibold leading-tight text-brand-blue">
                {training.title}
              </h2>
              <p id="academy-live-modal-description" className="mt-3 text-sm leading-relaxed text-dema-muted">
                2 h · 250 € HT. Demaa coordonne la session et vous adressera la facture après confirmation du créneau.
              </p>
              <form className="mt-6 space-y-4" onSubmit={handleSubmit} aria-busy={isSubmitting} noValidate>
                <label className="block text-sm font-medium text-brand-blue" htmlFor="academy-live-slot">
                  Créneau
                </label>
                <select ref={slotSelectRef} id="academy-live-slot" className="demaa-input" value={slotId} onChange={(event) => setSlotId(event.target.value)} required>
                  {training.slots.map((slot) => (
                    <option key={slot.id} value={slot.id}>{formatLiveSessionDate(slot.startsAt)}</option>
                  ))}
                </select>

                <label className="block text-sm font-medium text-brand-blue" htmlFor="academy-live-company">
                  Entreprise
                </label>
                <input id="academy-live-company" className="demaa-input" autoComplete="organization" value={company} onChange={(event) => setCompany(event.target.value)} required />

                <label className="block text-sm font-medium text-brand-blue" htmlFor="academy-live-name">
                  Nom et prénom
                </label>
                <input id="academy-live-name" className="demaa-input" autoComplete="name" value={fullName} onChange={(event) => setFullName(event.target.value)} required />

                <label className="block text-sm font-medium text-brand-blue" htmlFor="academy-live-email">
                  E-mail professionnel
                </label>
                <input id="academy-live-email" className="demaa-input" type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} required />

                <div className="absolute -left-[10000px] top-auto h-px w-px overflow-hidden" aria-hidden="true">
                  <label htmlFor="academy-live-website">Site internet</label>
                  <input id="academy-live-website" value={website} onChange={(event) => setWebsite(event.target.value)} tabIndex={-1} autoComplete="off" />
                </div>

                {error ? <p role="alert" className="text-sm text-brand-coral">{error}</p> : null}
                <button type="submit" disabled={isSubmitting} className="demaa-primary-button inline-flex w-full items-center justify-center gap-2 disabled:opacity-60">
                  {isSubmitting ? <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" /> : null}
                  {isSubmitting ? "Envoi…" : "Demander mon inscription"}
                </button>
                <p className="text-center text-[11px] leading-relaxed text-dema-muted">
                  Aucune carte bancaire n’est demandée. Consultez notre{" "}
                  <Link href="/politique-de-confidentialite" className="underline underline-offset-2">politique de confidentialité</Link>.
                </p>
              </form>
            </>
          )}
        </div>
      </section>
    </div>
  );
}
