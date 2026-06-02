"use client";

import { useEffect, useMemo, useState } from "react";
import Navbar from "@/components/Navbar";
import { CheckCircle2, LoaderCircle, Send, X } from "lucide-react";

type VerificationState =
  | { status: "loading" }
  | {
      status: "success";
      credits: number | null;
      email: string | null;
      firstName: string | null;
      lastName: string | null;
      name: string | null;
      offerLabel: string;
    }
  | { status: "error"; message: string };

type OnboardingForm = {
  availability: string;
  problems: string;
};

const WHATSAPP_NUMBER = "33782842435";

const INITIAL_FORM: OnboardingForm = {
  availability: "",
  problems: "",
};

export default function AssistantSuccessClient({
  sessionId,
}: {
  sessionId: string | null;
}) {
  const [verification, setVerification] = useState<VerificationState>({
    status: "loading",
  });
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (!sessionId) {
      setVerification({
        status: "error",
        message:
          "Impossible de vérifier votre paiement. Merci d'utiliser le lien de retour Stripe.",
      });
      return;
    }

    void (async () => {
      try {
        const response = await fetch(
          `/api/stripe/checkout-session?session_id=${encodeURIComponent(sessionId)}`,
          { cache: "no-store" }
        );

        const payload = (await response.json().catch(() => null)) as
          | {
              credits?: number | null;
              email?: string | null;
              error?: string;
              firstName?: string | null;
              lastName?: string | null;
              name?: string | null;
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

        setVerification({
          status: "success",
          credits: payload.credits ?? null,
          email: payload.email || null,
          firstName: payload.firstName || null,
          lastName: payload.lastName || null,
          name: payload.name || null,
          offerLabel: payload.offerLabel || "Crédits assistant",
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
  }, [sessionId]);

  const displayName = useMemo(() => {
    if (verification.status !== "success") return null;

    return (
      [verification.firstName, verification.lastName].filter(Boolean).join(" ") ||
      verification.name ||
      null
    );
  }, [verification]);

  const handleChange =
    (field: keyof OnboardingForm) =>
    (event: React.ChangeEvent<HTMLTextAreaElement>) => {
      setFormData((current) => ({
        ...current,
        [field]: event.target.value,
      }));
    };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (!formData.availability.trim()) {
      setError("Merci d'indiquer vos disponibilités.");
      return;
    }

    if (!formData.problems.trim()) {
      setError("Merci d'indiquer ce que vous voulez déléguer.");
      return;
    }

    if (verification.status !== "success") return;

    const whatsappText = [
      "Bonjour Demaa, je viens de payer mes crédits assistant.",
      "",
      `Nom : ${displayName || "non renseigné"}`,
      `Email : ${verification.email || "non renseigné"}`,
      `Offre : ${verification.offerLabel}`,
      `Crédits : ${verification.credits ?? "non renseigné"}`,
      `Session Stripe : ${sessionId || "non renseignée"}`,
      "",
      `Disponibilités : ${formData.availability.trim()}`,
      `Ce que je veux déléguer : ${formData.problems.trim()}`,
    ].join("\n");

    window.location.assign(
      `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(whatsappText)}`
    );
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
              <p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-red-500 md:text-base">
                {verification.message}
              </p>
            </div>
          ) : null}

          {verification.status === "success" ? (
            <div className="py-16">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-50 text-green-600">
                <CheckCircle2 className="h-7 w-7" />
              </div>
              <h1 className="mt-6 text-3xl font-semibold tracking-tight md:text-4xl">
                Paiement confirmé
              </h1>
              <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-gray-600 md:text-base">
                {displayName ? `Merci ${displayName}, ` : ""}
                vos crédits assistant sont validés. Il reste juste à nous dire
                vos disponibilités et ce que vous voulez déléguer.
              </p>
              <div className="mt-7">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(true)}
                  className="inline-flex rounded-full bg-brand-blue px-6 py-3 text-sm font-medium text-white transition hover:bg-brand-coral"
                >
                  Finaliser sur WhatsApp
                </button>
              </div>
            </div>
          ) : null}
        </div>
      </main>

      {isModalOpen && verification.status === "success" ? (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-brand-blue/35 px-4 py-8"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="w-full max-w-xl bg-white p-6 shadow-[0_30px_80px_rgba(20,20,20,0.18)] md:p-8"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-brand-coral">
                  Dernière étape
                </p>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight text-brand-blue md:text-3xl">
                  Dites-nous quoi traiter en priorité.
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-gray-600">
                  Ces informations seront envoyées dans WhatsApp avec votre
                  paiement confirmé.
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

            <div className="mt-5 bg-neutral-50 px-4 py-3 text-left text-sm text-gray-600">
              <p>
                <span className="font-medium text-brand-blue">Paiement :</span>{" "}
                {verification.offerLabel}
              </p>
              <p className="mt-1">
                <span className="font-medium text-brand-blue">Client :</span>{" "}
                {displayName || verification.email || "non renseigné"}
              </p>
            </div>

            <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
              <textarea
                value={formData.availability}
                onChange={handleChange("availability")}
                placeholder="Vos disponibilités pour démarrer"
                rows={3}
                className="w-full resize-none rounded-[1rem] border border-brand-blue/10 bg-white px-4 py-3 text-sm text-brand-blue outline-none transition placeholder:text-brand-blue/40 focus:border-brand-coral/35"
              />
              <textarea
                value={formData.problems}
                onChange={handleChange("problems")}
                placeholder="Les tâches, problèmes ou sujets à déléguer"
                rows={5}
                className="w-full resize-none rounded-[1rem] border border-brand-blue/10 bg-white px-4 py-3 text-sm text-brand-blue outline-none transition placeholder:text-brand-blue/40 focus:border-brand-coral/35"
              />

              {error ? <p className="text-sm text-red-500">{error}</p> : null}

              <button
                type="submit"
                className="inline-flex w-full items-center justify-center rounded-full bg-brand-blue px-6 py-3 text-sm font-medium text-white transition hover:bg-brand-coral"
              >
                <Send className="mr-2 h-4 w-4" />
                Envoyer sur WhatsApp
              </button>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
