"use client";

import { Check, X } from "lucide-react";
import { type FormEvent, useEffect, useRef, useState } from "react";
import { isValidEmail } from "@/lib/email";
import type { SystemResource } from "@/lib/system-resource-catalog";

export default function GuideNotifyModal({ resource, systemSlug, onClose }: { resource: SystemResource; systemSlug: string; onClose: () => void }) {
  const dialogRef = useRef<HTMLDivElement>(null); const inputRef = useRef<HTMLInputElement>(null);
  const [email, setEmail] = useState(""); const [website, setWebsite] = useState(""); const [error, setError] = useState<string | null>(null); const [busy, setBusy] = useState(false); const [success, setSuccess] = useState(false);
  useEffect(() => {
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null; const previousOverflow = document.body.style.overflow;
    function keydown(event: KeyboardEvent) { if (event.key === "Escape") { event.preventDefault(); onClose(); } }
    document.body.style.overflow = "hidden"; document.addEventListener("keydown", keydown); inputRef.current?.focus();
    return () => { document.body.style.overflow = previousOverflow; document.removeEventListener("keydown", keydown); previousFocus?.focus(); };
  }, [onClose]);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); const normalized = email.trim();
    if (!isValidEmail(normalized)) { setError("Merci d’indiquer une adresse e-mail valide."); return; }
    setBusy(true); setError(null);
    try { const response = await fetch("/api/systeme-kit/notify", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: normalized, resourceSlug: resource.resourceSlug, systemSlug, website }) }); const payload = await response.json().catch(() => null); if (!response.ok) throw new Error(payload?.error); setSuccess(true); } catch (reason) { setError(reason instanceof Error && reason.message ? reason.message : "Impossible d’enregistrer votre inscription pour le moment."); } finally { setBusy(false); }
  }
  return <div className="fixed inset-0 z-[80] flex items-center justify-center bg-brand-blue/35 p-4 backdrop-blur-sm" onMouseDown={onClose}><div ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="guide-notify-title" className="relative w-full max-w-lg rounded-[1.5rem] border border-dema-line bg-dema-paper p-6 shadow-[0_24px_70px_rgba(23,35,29,0.14)] sm:p-8" onMouseDown={(event) => event.stopPropagation()}><button type="button" onClick={onClose} aria-label="Fermer" className="absolute right-4 top-4 inline-flex h-10 w-10 items-center justify-center rounded-full"><X className="h-4 w-4" /></button>{success ? <div role="status"><Check className="h-7 w-7 text-dema-forest" /><h2 id="guide-notify-title" className="mt-4 text-2xl font-semibold text-brand-blue">Vous serez informé.</h2><p className="mt-3 text-sm leading-relaxed text-dema-muted">Nous vous écrirons uniquement lorsque « {resource.title} » sera disponible.</p><button type="button" onClick={onClose} className="demaa-primary-button mt-6 w-full">Fermer</button></div> : <><h2 id="guide-notify-title" className="pr-10 text-2xl font-semibold text-brand-blue">Être informé</h2><p className="mt-3 text-sm leading-relaxed text-dema-muted">Laissez votre e-mail pour recevoir une notification à la sortie de ce guide. Ce n’est pas une inscription à une newsletter.</p><form className="mt-6 space-y-4" onSubmit={submit}><label className="block text-sm font-medium text-brand-blue" htmlFor="guide-notify-email">Adresse e-mail</label><input ref={inputRef} id="guide-notify-email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} className="demaa-input" autoComplete="email" required /><input className="absolute -left-[10000px]" tabIndex={-1} aria-hidden="true" value={website} onChange={(event) => setWebsite(event.target.value)} autoComplete="off" /><p className="text-xs leading-relaxed text-dema-muted">Votre adresse sert uniquement à vous prévenir de la sortie de ce guide.</p>{error ? <p role="alert" className="text-sm text-brand-coral">{error}</p> : null}<button disabled={busy} className="demaa-primary-button w-full disabled:opacity-60">{busy ? "Envoi…" : "M’informer"}</button></form></>}</div></div>;
}
