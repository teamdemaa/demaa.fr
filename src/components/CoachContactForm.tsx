"use client";

import { useId, useState, type FormEvent } from "react";
import { LoaderCircle } from "lucide-react";
import type { CoachProfile } from "@/lib/coach-directory";
import { getLeadAttributionPayload, trackLeadConversion } from "@/lib/lead-attribution-client";
import { clearLeadSubmissionKey, getLeadSubmissionKey } from "@/lib/lead-submission-client";

const EMPTY_FORM = { name: "", company: "", email: "", phone: "", message: "", website: "" };

export default function CoachContactForm({ coach }: { coach: CoachProfile }) {
  const id = useId();
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      setError("Merci d’indiquer votre nom, votre email et votre besoin.");
      return;
    }

    const flowKey = `coach-directory:${coach.slug}`;
    try {
      setSubmitting(true);
      const response = await fetch("/api/coach-directory-contact-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          attribution: getLeadAttributionPayload(),
          coachSlug: coach.slug,
          name: form.name,
          company: form.company,
          email: form.email,
          phone: form.phone,
          message: form.message,
          website: form.website,
          idempotencyKey: getLeadSubmissionKey(flowKey),
          sourceUrl: window.location.href,
        }),
      });
      const payload = (await response.json().catch(() => null)) as { error?: string } | null;
      if (!response.ok) throw new Error(payload?.error || "L’envoi a échoué. Merci de réessayer.");
      clearLeadSubmissionKey(flowKey);
      trackLeadConversion({ requestType: "coach_directory_contact" });
      setForm(EMPTY_FORM);
      setSuccess(true);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "L’envoi a échoué. Merci de réessayer.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mt-7 border-t border-dema-line pt-6">
      <h3 className="text-lg font-medium text-brand-blue">Demander un contact à Demaa</h3>
      <p className="mt-2 text-sm leading-6 text-dema-muted">
        Votre demande est envoyée à Demaa, pas directement au coach. Ce profil public n’est pas encore un partenaire vérifié ; nous vérifierons la possibilité d’une mise en relation avant de vous répondre.
      </p>
      {success ? (
        <p className="mt-5 rounded-2xl bg-dema-sage/55 p-4 text-sm text-dema-forest" role="status">
          Demande reçue. Demaa vous répondra après vérification ; aucun rendez-vous avec le coach n’est garanti.
        </p>
      ) : (
        <form className="mt-5 grid gap-4 sm:grid-cols-2" onSubmit={handleSubmit}>
          <label className="text-sm font-medium text-brand-blue" htmlFor={`${id}-name`}>Nom
            <input id={`${id}-name`} className="demaa-input mt-1.5" autoComplete="name" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required maxLength={160} />
          </label>
          <label className="text-sm font-medium text-brand-blue" htmlFor={`${id}-company`}>Entreprise <span className="font-normal text-dema-muted">(facultatif)</span>
            <input id={`${id}-company`} className="demaa-input mt-1.5" autoComplete="organization" value={form.company} onChange={(event) => setForm({ ...form, company: event.target.value })} maxLength={160} />
          </label>
          <label className="text-sm font-medium text-brand-blue" htmlFor={`${id}-email`}>Email
            <input id={`${id}-email`} className="demaa-input mt-1.5" type="email" autoComplete="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} required maxLength={160} />
          </label>
          <label className="text-sm font-medium text-brand-blue" htmlFor={`${id}-phone`}>Téléphone <span className="font-normal text-dema-muted">(facultatif)</span>
            <input id={`${id}-phone`} className="demaa-input mt-1.5" type="tel" autoComplete="tel" value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} maxLength={60} />
          </label>
          <label className="sm:col-span-2 text-sm font-medium text-brand-blue" htmlFor={`${id}-message`}>Votre besoin
            <textarea id={`${id}-message`} className="demaa-textarea mt-1.5" rows={3} value={form.message} onChange={(event) => setForm({ ...form, message: event.target.value })} required maxLength={2000} placeholder="Quelle situation souhaitez-vous travailler avec un coach ?" />
          </label>
          <div className="sr-only" aria-hidden="true"><label htmlFor={`${id}-website`}>Site web</label><input id={`${id}-website`} tabIndex={-1} autoComplete="off" value={form.website} onChange={(event) => setForm({ ...form, website: event.target.value })} /></div>
          {error ? <p className="sm:col-span-2 text-sm text-red-700" role="alert">{error}</p> : null}
          <button type="submit" disabled={submitting} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-dema-forest px-5 text-sm font-medium text-white transition hover:bg-brand-blue disabled:opacity-60 sm:col-span-2 sm:justify-self-start">
            {submitting ? <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" /> : null}
            {submitting ? "Envoi…" : "Envoyer ma demande"}
          </button>
        </form>
      )}
    </div>
  );
}
