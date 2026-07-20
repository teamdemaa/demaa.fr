"use client";

import { ExternalLink, LoaderCircle, Mail, X } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import {
  getLeadAttributionPayload,
  trackLeadConversion,
} from "@/lib/lead-attribution-client";
import type { SystemeDetail } from "@/lib/systeme-catalog";

type SystemCompleteModalProps = {
  systemSlug: string;
  systemName: string;
  systeme: SystemeDetail | null | undefined;
  onClose: () => void;
};

export default function SystemCompleteModal({
  systemSlug,
  systemName,
  systeme,
  onClose,
}: SystemCompleteModalProps) {
  const [firstName, setFirstName] = useState("");
  const [email, setEmail] = useState("");
  const [copyUrl, setCopyUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const processCount =
    systeme?.cards.reduce((total, card) => total + card.items.length, 0) ?? 0;

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/systeme-kit/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          attribution: getLeadAttributionPayload(),
          email,
          firstName,
          sectorName: systemName,
          sectorSlug: systemSlug,
        }),
      });
      const payload = (await response.json().catch(() => null)) as
        | { copyUrl?: string; error?: string; ok?: boolean }
        | null;

      if (!response.ok || !payload?.ok || !payload.copyUrl) {
        throw new Error(payload?.error || "Impossible d’envoyer le kit pour le moment.");
      }

      setCopyUrl(payload.copyUrl);
      trackLeadConversion({
        requestType: "system_kit_request",
        systemSlug,
      });
    } catch (submissionError) {
      setError(
        submissionError instanceof Error
          ? submissionError.message
          : "Impossible d’envoyer le kit pour le moment.",
      );
      setIsSubmitting(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-brand-blue/35 px-4 py-6 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="system-complete-modal-title"
    >
      <section
        className="relative w-full max-w-lg rounded-[1.5rem] border border-dema-line bg-dema-paper p-6 shadow-[0_24px_70px_rgba(23,35,29,0.14)] sm:p-8"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Fermer"
          className="absolute right-4 top-4 inline-flex h-10 w-10 items-center justify-center rounded-full text-brand-blue transition hover:text-dema-forest"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>

        <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-dema-sage text-dema-forest">
          <Mail className="h-5 w-5" aria-hidden="true" />
        </span>
        <p className="mt-5 text-[11px] font-semibold uppercase tracking-[0.16em] text-dema-forest">
          Kit opérationnel
        </p>
        <h2
          id="system-complete-modal-title"
          className="mt-2 pr-10 text-2xl font-semibold tracking-tight text-brand-blue"
        >
          Recevoir le kit opérationnel {systemName}
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-dema-muted">
          Le fichier regroupe {processCount || "les"} process avec les tâches détaillées,
          le responsable et la récurrence à adapter à votre entreprise.
        </p>

        {copyUrl ? (
          <div className="mt-6 rounded-[1rem] bg-dema-cream/55 p-5">
            <h3 className="text-lg font-semibold text-brand-blue">
              Votre kit opérationnel est prêt
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-dema-muted">
              Le lien vient aussi d’être envoyé à {email}. Connectez-vous à Google,
              puis créez votre copie personnelle et modifiable dans votre Drive.
            </p>
            <a
              href={copyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="demaa-primary-button mt-5 inline-flex w-full items-center justify-center gap-2"
            >
              Créer ma copie
              <ExternalLink className="h-4 w-4" aria-hidden="true" />
            </a>
          </div>
        ) : (
        <form className="mt-6 space-y-3" onSubmit={handleSubmit}>
          <label className="block text-sm font-medium text-brand-blue" htmlFor="kit-first-name">
            Prénom
          </label>
          <input
            id="kit-first-name"
            className="demaa-input"
            value={firstName}
            onChange={(event) => setFirstName(event.target.value)}
            autoComplete="given-name"
            required
          />
          <label className="block pt-1 text-sm font-medium text-brand-blue" htmlFor="kit-email">
            E-mail
          </label>
          <input
            id="kit-email"
            className="demaa-input"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="email"
            required
          />

          {error ? <p className="text-sm text-brand-coral">{error}</p> : null}

          <button
            type="submit"
            disabled={isSubmitting}
            className="demaa-primary-button mt-3 inline-flex w-full items-center justify-center gap-2 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" /> : null}
            {isSubmitting ? "Envoi…" : "Recevoir le kit opérationnel"}
          </button>
          <p className="text-xs leading-relaxed text-dema-muted">
            Le modèle est partagé en lecture seule. Google créera une copie
            modifiable dans votre Drive.
          </p>
        </form>
        )}
      </section>
    </div>
  );
}
