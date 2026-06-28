"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { CheckCircle2, LoaderCircle, Send, X } from "lucide-react";

type VerificationState =
  | { status: "loading" }
  | {
      status: "success";
      cartSummary: string;
      credits: number | null;
      offerLabel: string;
    }
  | { status: "error"; message: string };

type OnboardingForm = {
  firstName: string;
  lastName: string;
  whatsappPhone: string;
  problems: string;
};

const INITIAL_FORM: OnboardingForm = {
  firstName: "",
  lastName: "",
  whatsappPhone: "",
  problems: "",
};

const ASSISTANT_ACCESS_STORAGE_KEY = "demaa-assistant-access-token";

export default function AssistantSuccessClient({
  accessToken: initialAccessToken,
  sessionId,
}: {
  accessToken: string | null;
  sessionId: string | null;
}) {
  const [verification, setVerification] = useState<VerificationState>({
    status: "loading",
  });
  const [assistantAccessToken, setAssistantAccessToken] = useState<string | null>(
    initialAccessToken
  );
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    const storedAccessToken =
      typeof window !== "undefined"
        ? window.sessionStorage.getItem(ASSISTANT_ACCESS_STORAGE_KEY)
        : null;
    const candidateAccessToken = initialAccessToken || storedAccessToken;

    if (!sessionId && !candidateAccessToken) {
      setVerification({
        status: "error",
        message:
          "Impossible de vérifier votre paiement. Merci d'utiliser le lien de retour Stripe.",
      });
      return;
    }

    if (typeof window !== "undefined") {
      if (candidateAccessToken) {
        window.sessionStorage.setItem(
          ASSISTANT_ACCESS_STORAGE_KEY,
          candidateAccessToken
        );
        setAssistantAccessToken(candidateAccessToken);
      }
      window.history.replaceState({}, "", "/assistant/success");
    }

    void (async () => {
      try {
        const query = candidateAccessToken
          ? `access_token=${encodeURIComponent(candidateAccessToken)}`
          : `session_id=${encodeURIComponent(sessionId || "")}`;
        const response = await fetch(`/api/stripe/checkout-session?${query}`, {
          cache: "no-store",
        });

        const payload = (await response.json().catch(() => null)) as
          | {
              accessToken?: string | null;
              cartSummary?: string;
              credits?: number | null;
              error?: string;
              offerLabel?: string;
              paid?: boolean;
            }
          | null;

        if (!response.ok || !payload?.paid) {
          throw new Error(
            payload?.error ||
              "Le paiement n'a pas pu être vérifié. Merci de contacter Demaa."
          );
        }

        const nextAccessToken = payload?.accessToken || candidateAccessToken || null;

        if (nextAccessToken && typeof window !== "undefined") {
          window.sessionStorage.setItem(
            ASSISTANT_ACCESS_STORAGE_KEY,
            nextAccessToken
          );
        }

        setAssistantAccessToken(nextAccessToken);
        setVerification({
          status: "success",
          cartSummary: payload.cartSummary || payload.offerLabel || "Packs assistant",
          credits: payload.credits ?? null,
          offerLabel: payload.offerLabel || "Packs assistant",
        });
        setIsModalOpen(true);
      } catch (paymentError) {
        setVerification({
          status: "error",
          message:
            paymentError instanceof Error
              ? paymentError.message
              : "Le paiement n'a pas pu être vérifié. Merci de contacter Demaa.",
        });
      }
    })();
  }, [initialAccessToken, sessionId]);

  const handleChange =
    (field: keyof OnboardingForm) =>
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      if (event.currentTarget instanceof HTMLTextAreaElement) {
        event.currentTarget.style.height = "auto";
        event.currentTarget.style.height = `${event.currentTarget.scrollHeight}px`;
      }
      setFormData((current) => ({
        ...current,
        [field]: event.target.value,
      }));
    };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (isSubmitted) return;

    if (!formData.firstName.trim()) {
      setError("Merci d'indiquer votre prénom.");
      return;
    }

    if (!formData.whatsappPhone.trim()) {
      setError("Merci d'indiquer votre WhatsApp pour que l'équipe Demaa puisse vous contacter.");
      return;
    }

    if (!formData.problems.trim()) {
      setError("Merci de détailler ce que vous voulez déléguer.");
      return;
    }

    if (verification.status !== "success") return;

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/assistant/delegation-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          accessToken: assistantAccessToken,
          sessionId,
          firstName: formData.firstName.trim(),
          lastName: formData.lastName.trim(),
          whatsappPhone: formData.whatsappPhone.trim(),
          tasks: formData.problems.trim(),
        }),
      });

      const payload = (await response.json().catch(() => null)) as
        | { error?: string }
        | null;

      if (!response.ok) {
        throw new Error(
          payload?.error ||
            "Impossible d'envoyer votre demande. Merci de réessayer."
        );
      }

      setIsSubmitted(true);
      setIsModalOpen(false);
      setIsConfirmationOpen(true);
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Impossible d'envoyer votre demande. Merci de réessayer."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-brand-blue">
      <Navbar />
      <main className="px-4 pb-20 pt-12 md:px-8 md:pb-28 md:pt-16">
        <div className="mx-auto max-w-3xl text-center">
          {verification.status === "loading" ? (
            <div className="py-20">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-neutral-100 text-brand-blue">
                <LoaderCircle className="h-6 w-6 animate-spin" />
              </div>
              <h1 className="mt-6 text-3xl font-semibold tracking-tight md:text-4xl">
                Vérification du paiement
              </h1>
              <p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-gray-600 md:text-base">
                On confirme le paiement Stripe avant d&apos;ouvrir les prochaines étapes.
              </p>
            </div>
          ) : null}

          {verification.status === "error" ? (
            <div className="py-20">
              <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
                Vérification impossible
              </h1>
              <p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-dema-forest md:text-base">
                {verification.message}
              </p>
            </div>
          ) : null}

          {verification.status === "success" ? (
            <div className="py-16">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-dema-sage text-dema-forest">
                <CheckCircle2 className="h-7 w-7" />
              </div>
              <h1 className="mt-6 text-3xl font-semibold tracking-tight md:text-4xl">
                Paiement confirmé
              </h1>
              <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-gray-600 md:text-base">
                votre commande assistant est validée. Ajoutez les tâches à déléguer,
                puis on vous contacte sur WhatsApp sous 24h.
              </p>
              <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(true)}
                  disabled={isSubmitted}
                  className="inline-flex rounded-full bg-brand-blue px-6 py-3 text-sm font-medium text-white transition hover:bg-brand-coral"
                >
                  {isSubmitted ? "Demande envoyée" : "Ajouter les tâches à déléguer"}
                </button>
                <Link
                  href="/mon-espace"
                  className="inline-flex items-center gap-2 rounded-full border border-brand-blue/10 bg-white px-6 py-3 text-sm font-medium text-brand-blue transition hover:border-brand-coral/30 hover:text-brand-coral"
                >
                  Accéder à mon espace membre
                </Link>
              </div>
            </div>
          ) : null}
        </div>
      </main>

      {isModalOpen && verification.status === "success" ? (
        <div
          className="fixed inset-0 z-[70] flex items-start justify-center overflow-y-auto bg-brand-blue/35 px-4 py-4 md:items-center"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="max-h-[calc(100vh-2rem)] w-full max-w-lg overflow-y-auto rounded-[1.1rem] bg-white p-4 shadow-[0_30px_80px_rgba(20,20,20,0.18)] md:p-5"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-brand-coral">
                  Dernière étape
                </p>
                <h2 className="mt-1.5 text-xl font-semibold leading-tight tracking-tight text-brand-blue md:text-2xl">
                  Merci, vous allez enfin pouvoir souffler.
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-gray-600">
                  Ajoutez les détails de votre demande, et on vous contacte sur
                  WhatsApp pour organiser la suite.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="rounded-full bg-neutral-50 p-2 text-brand-blue transition hover:bg-neutral-100"
                aria-label="Fermer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-3 rounded-[0.9rem] bg-neutral-50 px-3 py-2 text-left text-xs leading-relaxed text-gray-600">
              <p>
                <span className="font-medium text-brand-blue">Paiement :</span>{" "}
                {verification.cartSummary || verification.offerLabel}
              </p>
            </div>

            <form className="mt-4 space-y-3" onSubmit={handleSubmit}>
              <div className="grid gap-3 md:grid-cols-2">
                <label className="block text-left">
                  <span className="text-xs font-medium text-brand-blue/70">Prénom</span>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={handleChange("firstName")}
                    disabled={isSubmitting || isSubmitted}
                    autoComplete="given-name"
                    className="mt-1 w-full rounded-[0.9rem] border border-brand-blue/10 bg-white px-3.5 py-2.5 text-sm text-brand-blue outline-none transition placeholder:text-brand-blue/40 focus:border-brand-coral/35"
                  />
                </label>
                <label className="block text-left">
                  <span className="text-xs font-medium text-brand-blue/70">Nom</span>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={handleChange("lastName")}
                    disabled={isSubmitting || isSubmitted}
                    autoComplete="family-name"
                    className="mt-1 w-full rounded-[0.9rem] border border-brand-blue/10 bg-white px-3.5 py-2.5 text-sm text-brand-blue outline-none transition placeholder:text-brand-blue/40 focus:border-brand-coral/35"
                  />
                </label>
              </div>

              <label className="block text-left">
                <span className="text-xs font-medium text-brand-blue/70">
                  WhatsApp pour vous contacter
                </span>
                <input
                  type="tel"
                  value={formData.whatsappPhone}
                  onChange={handleChange("whatsappPhone")}
                  placeholder="+33 6 ..."
                  disabled={isSubmitting || isSubmitted}
                  autoComplete="tel"
                  className="mt-1 w-full rounded-[0.9rem] border border-brand-blue/10 bg-white px-3.5 py-2.5 text-sm text-brand-blue outline-none transition placeholder:text-brand-blue/40 focus:border-brand-coral/35"
                />
              </label>

              <textarea
                value={formData.problems}
                onChange={handleChange("problems")}
                placeholder="Détaillez ce que vous voulez déléguer : contexte, documents, échéance, outils utilisés..."
                rows={2}
                disabled={isSubmitting || isSubmitted}
                className="min-h-[4.75rem] w-full resize-none overflow-hidden rounded-[0.9rem] border border-brand-blue/10 bg-white px-3.5 py-2.5 text-sm text-brand-blue outline-none transition placeholder:text-brand-blue/40 focus:border-brand-coral/35"
              />

              {error ? <p className="text-sm text-dema-forest">{error}</p> : null}

              <button
                type="submit"
                disabled={isSubmitting || isSubmitted}
                className="inline-flex w-full items-center justify-center rounded-full bg-brand-blue px-6 py-2.5 text-sm font-medium text-white transition hover:bg-brand-coral disabled:cursor-not-allowed disabled:bg-dema-forest/60"
              >
                {isSubmitted ? (
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                ) : isSubmitting ? (
                  <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Send className="mr-2 h-4 w-4" />
                )}
                {isSubmitted ? "Envoyé" : isSubmitting ? "Envoi..." : "Envoyer"}
              </button>
            </form>
          </div>
        </div>
      ) : null}

      {isConfirmationOpen ? (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-brand-blue/35 px-4 py-6">
          <div className="w-full max-w-sm rounded-[1.1rem] bg-white p-5 text-center shadow-[0_30px_80px_rgba(20,20,20,0.18)]">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-dema-sage text-dema-forest">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <h2 className="mt-4 text-xl font-semibold tracking-tight text-brand-blue">
              Demande envoyée.
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-gray-600">
              Vous allez enfin pouvoir souffler. On revient vers vous sous 24h
              sur WhatsApp pour organiser la suite.
            </p>
            <button
              type="button"
              onClick={() => setIsConfirmationOpen(false)}
              className="mt-5 inline-flex w-full items-center justify-center rounded-full bg-brand-blue px-5 py-2.5 text-sm font-medium text-white transition hover:bg-brand-coral"
            >
              Fermer
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
