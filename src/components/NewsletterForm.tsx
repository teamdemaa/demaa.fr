"use client";

import type { FormEvent } from "react";
import { useState } from "react";

type FormState = "idle" | "submitting" | "success" | "error";

interface NewsletterFormProps {
  compact?: boolean;
  onSuccess?: (firstName: string) => void;
  source?: string;
  successMessage?: (firstName: string) => string;
}

export default function NewsletterForm({
  compact = false,
  onSuccess,
  source = "newsletter_page",
  successMessage,
}: NewsletterFormProps) {
  const [firstName, setFirstName] = useState("");
  const [sector, setSector] = useState("");
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
          source,
        }),
      });
      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(payload.error || "Impossible de finaliser l'inscription.");
      }

      setStatus("success");
      setMessage(
        successMessage?.(submittedFirstName) ||
          "C'est noté. Vous êtes bien inscrit à la newsletter Demaa."
      );
      setFirstName("");
      setSector("");
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

      <button
        type="submit"
        disabled={status === "submitting"}
        className={`inline-flex w-full items-center justify-center bg-brand-blue px-6 text-white transition-colors hover:bg-brand-coral disabled:cursor-not-allowed disabled:bg-brand-blue/40 ${compact ? "h-11 rounded-full text-[13px] font-semibold" : "h-14 rounded-full text-sm font-semibold"}`}
      >
        {status === "submitting" ? "Inscription..." : "Recevoir la newsletter"}
      </button>

      {message && (
        <p
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
