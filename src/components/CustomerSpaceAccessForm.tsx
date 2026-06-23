"use client";

import { useState } from "react";
import { CheckCircle2, LoaderCircle, Mail } from "lucide-react";
import { isValidEmail, normalizeEmail } from "@/lib/email";

export default function CustomerSpaceAccessForm({
  compact = false,
}: {
  compact?: boolean;
}) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [devLink, setDevLink] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalizedEmail = normalizeEmail(email);

    setError(null);
    setDevLink(null);

    if (!isValidEmail(normalizedEmail)) {
      setError("Merci d'indiquer une adresse email valide.");
      return;
    }

    setIsSending(true);

    try {
      const response = await fetch("/api/customer-space/magic-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: normalizedEmail }),
      });
      const payload = (await response.json().catch(() => null)) as
        | { devLink?: string | null; error?: string; sent?: boolean }
        | null;

      if (!response.ok) {
        setDevLink(payload?.devLink || null);
        throw new Error(payload?.error || "Impossible d'envoyer le lien.");
      }

      if (!payload?.sent) {
        setDevLink(payload?.devLink || null);
        throw new Error("Impossible d'envoyer le lien.");
      }

      setSent(true);
      setDevLink(payload?.devLink || null);
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Impossible d'envoyer le lien."
      );
    } finally {
      setIsSending(false);
    }
  }

  if (sent) {
    return (
      <div className={compact ? "space-y-3" : "mx-auto max-w-md text-center"}>
        <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-dema-sage text-dema-forest">
          <CheckCircle2 className="h-5 w-5" />
        </div>
        <h2 className="text-xl font-semibold tracking-tight text-brand-blue">
          Lien envoyé.
        </h2>
        <p className="text-sm leading-relaxed text-dema-muted">
          Vérifiez votre boîte mail pour accéder à votre espace membre Demaa.
        </p>
        {devLink ? (
          <a
            href={devLink}
            className="inline-flex text-sm font-medium text-dema-forest underline"
          >
            Ouvrir le lien de test
          </a>
        ) : null}
      </div>
    );
  }

  return (
    <form className={compact ? "space-y-3" : "mx-auto max-w-md space-y-4"} onSubmit={handleSubmit}>
      <div className="text-left">
        <label className="text-xs font-medium text-brand-blue/70" htmlFor="customer-email">
          Email utilisé pour votre paiement, votre demande ou votre accès
        </label>
        <div className="relative mt-1.5">
          <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-dema-forest/45" />
          <input
            id="customer-email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="vous@entreprise.fr"
            className="w-full rounded-full border border-dema-line bg-dema-paper py-3 pl-10 pr-4 text-sm text-brand-blue outline-none transition placeholder:text-brand-blue/35 focus:border-dema-forest/30"
          />
        </div>
      </div>

      {error ? <p className="text-sm text-dema-forest">{error}</p> : null}

      <button
        type="submit"
        disabled={isSending}
        className="inline-flex w-full items-center justify-center rounded-full bg-dema-forest px-5 py-3 text-sm font-medium text-dema-paper transition hover:bg-[#284f3a] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSending ? <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> : null}
        {isSending ? "Envoi du lien..." : "Recevoir mon lien sécurisé"}
      </button>
    </form>
  );
}
