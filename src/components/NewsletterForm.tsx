"use client";

import type { FormEvent } from "react";
import { useState } from "react";

type FormState = "idle" | "submitting" | "success" | "error";

export default function NewsletterForm() {
  const [firstName, setFirstName] = useState("");
  const [sector, setSector] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<FormState>("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus("submitting");
    setMessage("");

    try {
      const response = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName,
          sector,
          email,
          source: "newsletter_page",
        }),
      });
      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(payload.error || "Impossible de finaliser l'inscription.");
      }

      setStatus("success");
      setMessage("C'est noté. Vous êtes bien inscrit à la newsletter Demaa.");
      setFirstName("");
      setSector("");
      setEmail("");
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
    <form onSubmit={handleSubmit} className="mx-auto mt-8 w-full max-w-xl space-y-4">
      <div className="grid gap-4">
        <input
          type="text"
          value={firstName}
          onChange={(event) => setFirstName(event.target.value)}
          aria-label="Prénom"
          placeholder="Prénom"
          required
          className="h-14 rounded-2xl border border-brand-blue/10 bg-white px-5 text-sm font-medium text-brand-blue outline-none transition-colors placeholder:text-gray-400 focus:border-brand-coral/40"
        />
        <input
          type="text"
          value={sector}
          onChange={(event) => setSector(event.target.value)}
          aria-label="Secteur d'activité"
          placeholder="Secteur d'activité"
          required
          className="h-14 rounded-2xl border border-brand-blue/10 bg-white px-5 text-sm font-medium text-brand-blue outline-none transition-colors placeholder:text-gray-400 focus:border-brand-coral/40"
        />
      </div>

      <input
        type="email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        aria-label="Email"
        placeholder="Email"
        required
        className="h-14 w-full rounded-2xl border border-brand-blue/10 bg-white px-5 text-sm font-medium text-brand-blue outline-none transition-colors placeholder:text-gray-400 focus:border-brand-coral/40"
      />

      <button
        type="submit"
        disabled={status === "submitting"}
        className="inline-flex h-14 w-full items-center justify-center rounded-full bg-brand-blue px-6 text-sm font-semibold text-white transition-colors hover:bg-brand-coral disabled:cursor-not-allowed disabled:bg-brand-blue/40"
      >
        {status === "submitting" ? "Inscription..." : "Recevoir la newsletter"}
      </button>

      {message && (
        <p
          className={`text-center text-sm font-medium ${
            status === "success" ? "text-brand-blue" : "text-brand-coral"
          }`}
        >
          {message}
        </p>
      )}
    </form>
  );
}
