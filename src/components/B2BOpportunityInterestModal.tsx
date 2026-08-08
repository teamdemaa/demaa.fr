"use client";

import { Check, LoaderCircle, X } from "lucide-react";
import { type FormEvent, useEffect, useRef, useState } from "react";
import { getLeadAttributionPayload } from "@/lib/lead-attribution-client";
import { clearLeadSubmissionKey, getLeadSubmissionKey } from "@/lib/lead-submission-client";
import { isValidEmail } from "@/lib/email";
import type { B2BOpportunity } from "@/lib/b2b-opportunities-contract";

type Payload = { error?: string; ok?: boolean } | null;

export default function B2BOpportunityInterestModal({ onClose, opportunity }: { onClose: () => void; opportunity: B2BOpportunity }) {
  const firstFieldRef = useRef<HTMLInputElement>(null);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === "Escape") onClose(); };
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKeyDown);
    firstFieldRef.current?.focus();
    return () => { document.body.style.overflow = ""; document.removeEventListener("keydown", onKeyDown); previous?.focus(); };
  }, [onClose]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalizedName = fullName.trim();
    const normalizedEmail = email.trim();
    if (!normalizedName || !isValidEmail(normalizedEmail)) {
      setError("Merci d’indiquer votre nom et une adresse e-mail valide.");
      return;
    }
    setError(null); setSubmitting(true);
    const flowKey = `b2b-opportunity-interest:${opportunity.slug}`;
    try {
      const response = await fetch("/api/opportunites-b2b/interest", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ attribution: getLeadAttributionPayload(), email: normalizedEmail, fullName: normalizedName, idempotencyKey: getLeadSubmissionKey(flowKey), opportunitySlug: opportunity.slug, website }) });
      const payload = await response.json().catch(() => null) as Payload;
      if (!response.ok || !payload?.ok) { setError(payload?.error ?? "Impossible d’enregistrer votre intérêt pour le moment."); return; }
      clearLeadSubmissionKey(flowKey); setSuccess(true);
    } catch { setError("Impossible d’enregistrer votre intérêt pour le moment."); } finally { setSubmitting(false); }
  }

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-brand-blue/35 px-4 backdrop-blur-sm" onMouseDown={onClose}>
      <section role="dialog" aria-modal="true" aria-labelledby="b2b-opportunity-title" className="relative w-full max-w-[30rem] rounded-[1.5rem] border border-dema-line bg-dema-paper p-6 shadow-[0_24px_70px_rgba(23,35,29,0.14)] sm:p-8" onMouseDown={(event) => event.stopPropagation()}>
        <button type="button" onClick={onClose} aria-label="Fermer" className="absolute right-4 top-4 inline-flex h-10 w-10 items-center justify-center rounded-full text-brand-blue hover:bg-dema-sage"><X className="h-4 w-4" /></button>
        {success ? <div role="status"><span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-dema-sage text-dema-forest"><Check className="h-5 w-5" /></span><h2 id="b2b-opportunity-title" className="mt-5 pr-10 text-2xl font-semibold text-brand-blue">Votre intérêt est enregistré.</h2><p className="mt-3 text-sm leading-relaxed text-dema-muted">Nous vous recontacterons si votre profil correspond à cette opportunité.</p><button type="button" onClick={onClose} className="demaa-primary-button mt-6 w-full">Fermer</button></div> : <><p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-dema-forest">{opportunity.category}</p><h2 id="b2b-opportunity-title" className="mt-2 pr-10 text-2xl font-semibold leading-tight text-brand-blue">{opportunity.title}</h2><p className="mt-3 text-sm leading-relaxed text-dema-muted">Laissez vos coordonnées. Nous faisons le lien si votre profil correspond.</p><form className="mt-6 space-y-3" onSubmit={submit} noValidate><label className="block text-sm font-medium text-brand-blue" htmlFor="b2b-interest-name">Nom et prénom</label><input ref={firstFieldRef} id="b2b-interest-name" className="demaa-input" value={fullName} onChange={(event) => setFullName(event.target.value)} autoComplete="name" /><label className="block text-sm font-medium text-brand-blue" htmlFor="b2b-interest-email">Adresse e-mail</label><input id="b2b-interest-email" className="demaa-input" type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" /><input className="absolute -left-[10000px] h-px w-px opacity-0" aria-hidden="true" tabIndex={-1} value={website} onChange={(event) => setWebsite(event.target.value)} autoComplete="off" /><>{error ? <p role="alert" className="text-sm text-brand-coral">{error}</p> : null}</><button type="submit" disabled={submitting} className="demaa-primary-button flex w-full items-center justify-center gap-2 disabled:opacity-60">{submitting ? <LoaderCircle className="h-4 w-4 animate-spin" /> : null}{submitting ? "Envoi…" : "Envoyer mon intérêt"}</button></form></>}
      </section>
    </div>
  );
}
