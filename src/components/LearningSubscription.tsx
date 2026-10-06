"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";

export default function LearningSubscription({ localeCode = "fr" }: { localeCode?: "fr" | "en" }) {
  const en = localeCode === "en";
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
      if (!response.ok || payload.ok !== true) throw new Error((en ? "Subscriptions are temporarily unavailable. Please try again." : payload.error || "L’inscription est momentanément indisponible."));
      setState("done");
    } catch (cause) {
      setError(en ? "Subscriptions are temporarily unavailable. Please try again." : cause instanceof Error ? cause.message : "L’inscription est momentanément indisponible.");
      setState("idle");
    }
  }

  return <section aria-label={en ? "Subscribe to our insights" : "S’abonner aux apprentissages"} className="rounded-2xl bg-dema-sage/45 p-6 text-left [container-type:inline-size] sm:p-8">
    <h2 className="demaa-section-title whitespace-nowrap text-[clamp(1rem,7cqw,1.875rem)] leading-tight">{en ? "Our insights, by email." : "Nos apprentissages, par e-mail."}</h2>
    {en && <p className="mt-3 text-sm text-dema-muted">Updates are currently sent in French.</p>}
    {state === "done" ? <p role="status" className="mt-6 text-dema-forest">{en ? "Thank you. Your subscription is confirmed." : "Merci, votre inscription est confirmée."}</p> : <form onSubmit={subscribe} aria-busy={state === "sending"} className="mt-6 w-full max-w-xl">
      <label className="sr-only" htmlFor="learning-email">{en ? "Your email address" : "Votre adresse e-mail"}</label>
      <div className="mt-2 flex flex-col gap-3 sm:flex-row">
        <input id="learning-email" type="email" autoComplete="email" required value={email} onChange={event => setEmail(event.target.value)} className="min-h-12 min-w-0 flex-1 rounded-xl border border-dema-line bg-dema-paper px-4 transition-colors focus:border-dema-forest/60 focus-visible:outline-none!" placeholder={en ? "you@example.com" : "vous@exemple.fr"} aria-describedby={error ? "learning-error" : undefined} />
        <button type="submit" disabled={state === "sending"} className="min-h-12 rounded-full bg-brand-blue px-6 text-sm font-medium text-dema-paper disabled:opacity-60">{state === "sending" ? (en ? "Subscribing…" : "Inscription…") : (en ? "Subscribe" : "S’abonner")}</button>
      </div>
      <div className="absolute -left-[10000px] h-px w-px overflow-hidden" aria-hidden="true"><label htmlFor="learning-website">{en ? "Website" : "Site internet"}</label><input id="learning-website" tabIndex={-1} autoComplete="off" value={website} onChange={event => setWebsite(event.target.value)} /></div>
      {error ? <p id="learning-error" role="alert" className="mt-3 text-sm text-brand-coral">{error}</p> : null}
      <p className="mt-3 text-xs leading-5 text-dema-muted">{en ? "Unsubscribe at any time. " : "Désinscription à tout moment. "}<Link href="/politique-de-confidentialite" className="underline underline-offset-4">{en ? "Privacy policy" : "Confidentialité"}</Link></p>
    </form>}
  </section>;
}
