"use client";

import type { FormEvent } from "react";
import { useState } from "react";

type FormState = "idle" | "submitting" | "success" | "error";

interface PartnerOffersFormProps {
  compact?: boolean;
  initialSector?: string;
  onSuccess?: (firstName: string) => void;
  source?: string;
  successAriaLabel?: string;
  submitLabel?: string;
  submitClassName?: string;
  submittingLabel?: string;
  successMessage?: (firstName: string) => string;
}

export default function PartnerOffersForm({
  compact = false,
  initialSector = "",
  onSuccess,
  source = "partner_offers_page",
  successAriaLabel,
  submitLabel = "Recevoir les offres et mini-cours",
  submitClassName,
  submittingLabel = "Inscription...",
  successMessage,
}: PartnerOffersFormProps) {
  const [firstName, setFirstName] = useState("");
  const [sector, setSector] = useState(initialSector);
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<FormState>("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus("submitting");
    setMessage("");
    const submittedFirstName = firstName.trim();

    try {
      const response = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName,
          sector,
          email,
          newsletterOptIn: true,
          source,
          sourceUrl: window.location.href,
        }),
      });
      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(payload.error || "Impossible de finaliser l'inscription.");
      }

      setStatus("success");
      setMessage(
        successMessage?.(submittedFirstName) ||
          "C'est noté. Vous recevrez les offres partenaires et les mini-cours Demaa."
      );
      setFirstName("");
      setSector(initialSector);
      setEmail("");
      onSuccess?.(submittedFirstName);
    } catch (error) {
      setStatus("error");
      setMessage(
        error instanceof Error
          ? error.message
          : "Impossible de finaliser l'inscription pour le moment."
      );
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={`mx-auto w-full ${compact ? "mt-5 max-w-none space-y-3" : "mt-8 max-w-xl space-y-4"}`}
    >
      <div className="grid gap-4">
        <input
          type="text"
          value={firstName}
          onChange={(event) => setFirstName(event.target.value)}
          aria-label="Prénom"
          placeholder="Prénom"
          required
          className={`${compact ? "h-11 rounded-xl px-4 text-[13px]" : "h-14 rounded-2xl px-5 text-sm"} border border-brand-blue/10 bg-white font-medium text-brand-blue outline-none transition-colors placeholder:text-gray-400 focus:border-brand-coral/40`}
        />
        <input
          type="text"
          value={sector}
          onChange={(event) => setSector(event.target.value)}
          aria-label="Secteur d'activité"
          placeholder="Secteur d'activité"
          required
          className={`${compact ? "h-11 rounded-xl px-4 text-[13px]" : "h-14 rounded-2xl px-5 text-sm"} border border-brand-blue/10 bg-white font-medium text-brand-blue outline-none transition-colors placeholder:text-gray-400 focus:border-brand-coral/40`}
        />
      </div>

      <input
        type="email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        aria-label="Email"
        placeholder="Email"
        required
        className={`${compact ? "h-11 rounded-xl px-4 text-[13px]" : "h-14 rounded-2xl px-5 text-sm"} w-full border border-brand-blue/10 bg-white font-medium text-brand-blue outline-none transition-colors placeholder:text-gray-400 focus:border-brand-coral/40`}
      />

      <p className="text-left text-xs leading-relaxed text-brand-blue/55">
        En vous inscrivant, vous acceptez de recevoir par e-mail les offres partenaires et
        les mini-cours Demaa. Désinscription possible à tout moment.
      </p>

      <button
        type="submit"
        disabled={status === "submitting"}
        className={`inline-flex w-full items-center justify-center px-6 text-white transition-colors disabled:cursor-not-allowed ${submitClassName ?? "bg-dema-forest hover:bg-brand-blue disabled:bg-dema-forest/40"} ${compact ? "h-11 rounded-full text-[13px] font-semibold" : "h-14 rounded-full text-sm font-semibold"}`}
      >
        {status === "submitting" ? submittingLabel : submitLabel}
      </button>

      {message && (
        <p
          aria-label={successAriaLabel}
          className={`text-center ${status === "success" && compact ? "font-normal leading-relaxed" : "font-medium"} ${compact ? "text-[13px]" : "text-sm"} ${
            status === "success" ? "text-brand-blue" : "text-brand-coral"
          }`}
        >
          {message}
        </p>
      )}
    </form>
  );
}
