"use client";

import type { FormEvent } from "react";
import { useState } from "react";

type FormState = "idle" | "submitting" | "success" | "error";

type NewsletterSubscribeFormProps = {
  newsletterSlug: string;
  newsletterTitle: string;
};

export default function NewsletterSubscribeForm({
  newsletterSlug,
  newsletterTitle,
}: NewsletterSubscribeFormProps) {
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [status, setStatus] = useState<FormState>("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("submitting");
    setMessage("");

    try {
      const response = await fetch("/api/newsletters/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          firstName,
          newsletterSlug,
        }),
      });
      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(payload.error || "Impossible de finaliser l'inscription.");
      }

      setStatus("success");
      setMessage(`C'est noté. Vous recevrez les prochaines éditions de ${newsletterTitle}.`);
      setEmail("");
      setFirstName("");
    } catch (error) {
      setStatus("error");
      setMessage(
        error instanceof Error
          ? error.message
          : "Impossible de finaliser l'inscription pour le moment.",
      );
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <input
        type="text"
        value={firstName}
        onChange={(event) => setFirstName(event.target.value)}
        placeholder="Prénom"
        aria-label="Prénom"
        required
        className="h-11 w-full rounded-xl border border-brand-blue/10 bg-white px-4 text-[13px] font-medium text-brand-blue outline-none transition-colors placeholder:text-gray-400 focus:border-brand-coral/40"
      />
      <input
        type="email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        placeholder="Email"
        aria-label="Email"
        required
        className="h-11 w-full rounded-xl border border-brand-blue/10 bg-white px-4 text-[13px] font-medium text-brand-blue outline-none transition-colors placeholder:text-gray-400 focus:border-brand-coral/40"
      />
      <button
        type="submit"
        disabled={status === "submitting"}
        className="inline-flex h-11 w-full items-center justify-center rounded-full bg-dema-forest px-6 text-[13px] font-semibold text-white transition-colors hover:bg-brand-blue disabled:cursor-not-allowed disabled:bg-dema-forest/40"
      >
        {status === "submitting" ? "Inscription..." : "S'abonner à cette newsletter"}
      </button>
      {message ? (
        <p
          className={`text-[13px] leading-relaxed ${
            status === "success" ? "text-brand-blue" : "text-brand-coral"
          }`}
        >
          {message}
        </p>
      ) : null}
    </form>
  );
}
