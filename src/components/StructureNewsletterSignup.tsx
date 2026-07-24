"use client";

import { useState } from "react";

type NewsletterResponse = {
  error?: string;
};

export function StructureNewsletterSignup() {
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubscribed, setIsSubscribed] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    try {
      setIsSubmitting(true);
      const response = await fetch("/api/newsletter-subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, website }),
      });
      const payload = (await response.json().catch(() => null)) as
        | NewsletterResponse
        | null;

      if (!response.ok) {
        throw new Error(
          payload?.error ||
            "L’inscription est momentanément indisponible. Merci de réessayer.",
        );
      }

      setEmail("");
      setIsSubscribed(true);
    } catch (submissionError) {
      setError(
        submissionError instanceof Error
          ? submissionError.message
          : "L’inscription est momentanément indisponible. Merci de réessayer.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div>
      {isSubscribed ? (
        <div
          className="flex min-h-[4.6rem] items-center rounded-xl border border-dema-paper/35 bg-dema-paper/10 px-5 text-sm text-dema-paper sm:px-7 sm:text-base"
          role="status"
        >
          Merci, votre inscription à Structure est confirmée.
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="website"
            value={website}
            onChange={(event) => setWebsite(event.target.value)}
            tabIndex={-1}
            autoComplete="off"
            className="absolute -left-[9999px]"
            aria-hidden="true"
          />
          <div className="grid overflow-hidden rounded-xl border border-dema-paper/45 bg-dema-paper shadow-[0_12px_35px_rgba(9,24,16,0.12)] focus-within:ring-2 focus-within:ring-dema-paper/25 sm:grid-cols-[minmax(0,1fr)_17.8rem]">
            <label className="sr-only" htmlFor="structure-newsletter-email">
              Votre adresse e-mail
            </label>
            <input
              id="structure-newsletter-email"
              name="email"
              type="email"
              autoComplete="email"
              inputMode="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="Votre adresse e-mail"
              className="min-h-[4.5rem] min-w-0 bg-dema-paper px-5 text-base text-brand-blue outline-none placeholder:text-brand-blue/45 sm:px-7 sm:text-lg"
              aria-describedby={
                error ? "structure-newsletter-error" : undefined
              }
            />
            <button
              type="submit"
              disabled={isSubmitting}
              className="min-h-[4.5rem] border-t border-dema-forest/20 bg-dema-forest px-6 text-sm font-medium text-dema-paper transition hover:bg-[#284f3a] disabled:cursor-not-allowed disabled:opacity-65 sm:border-l sm:border-t-0 sm:text-base"
            >
              {isSubmitting ? "Inscription…" : "Recevoir Structure"}
            </button>
          </div>
          {error ? (
            <p
              id="structure-newsletter-error"
              className="mt-3 text-sm text-dema-paper"
              role="alert"
            >
              {error}
            </p>
          ) : null}
        </form>
      )}

      <p className="mt-4 text-sm text-dema-paper/70 sm:text-base">
        Deux fois par mois · Désinscription en un clic.
      </p>
    </div>
  );
}
