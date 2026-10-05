"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";

export default function LearningSubscription() {
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "done">("idle");
  const [error, setError] = useState("");

  async function subscribe(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (state === "sending" || state === "done") return;
    setState("sending");
    setError("");
    try {
      const response = await fetch("/api/newsletter-subscribe", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, website }),
      });
      const payload = await response.json();
      if (!response.ok || payload.ok !== true) throw new Error(payload.error || "L’inscription est momentanément indisponible.");
      setState("done");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "L’inscription est momentanément indisponible.");
      setState("idle");
    }
  }

  return <section aria-label="S’abonner aux apprentissages" className="rounded-2xl bg-dema-sage/45 p-6 text-left [container-type:inline-size] sm:p-8">
    <h2 className="demaa-section-title whitespace-nowrap text-[clamp(1rem,7cqw,1.875rem)] leading-tight">Nos apprentissages, par e-mail.</h2>
    {state === "done" ? <p role="status" className="mt-6 text-dema-forest">Merci, votre inscription est confirmée.</p> : <form onSubmit={subscribe} aria-busy={state === "sending"} className="mt-6 w-full max-w-xl">
      <label className="sr-only" htmlFor="learning-email">Votre adresse e-mail</label>
      <div className="mt-2 flex flex-col gap-3 sm:flex-row">
        <input id="learning-email" type="email" autoComplete="email" required value={email} onChange={event => setEmail(event.target.value)} className="min-h-12 min-w-0 flex-1 rounded-xl border border-dema-line bg-dema-paper px-4" placeholder="vous@exemple.fr" aria-describedby={error ? "learning-error" : undefined} />
        <button type="submit" disabled={state === "sending"} className="min-h-12 rounded-full bg-brand-blue px-6 text-sm font-medium text-dema-paper disabled:opacity-60">{state === "sending" ? "Inscription…" : "S’abonner"}</button>
      </div>
      <div className="absolute -left-[10000px] h-px w-px overflow-hidden" aria-hidden="true"><label htmlFor="learning-website">Site internet</label><input id="learning-website" tabIndex={-1} autoComplete="off" value={website} onChange={event => setWebsite(event.target.value)} /></div>
      {error ? <p id="learning-error" role="alert" className="mt-3 text-sm text-brand-coral">{error}</p> : null}
      <p className="mt-3 text-xs leading-5 text-dema-muted">Désinscription à tout moment. <Link href="/politique-de-confidentialite" className="underline underline-offset-4">Confidentialité</Link></p>
    </form>}
  </section>;
}
