"use client";

import { useEffect, useState, type FormEvent } from "react";
import { ChevronLeft, ChevronRight, FileText, LoaderCircle, Mail, X } from "lucide-react";
import type { SystemeDetail } from "@/lib/systeme-catalog";

type SystemCompleteModalProps = {
  systemSlug: string;
  systemName: string;
  systeme: SystemeDetail | null | undefined;
  onClose: () => void;
};

type SubmitState = "idle" | "loading" | "success";

export default function SystemCompleteModal({
  systemSlug,
  systemName,
  systeme,
  onClose,
}: SystemCompleteModalProps) {
  const [firstName, setFirstName] = useState("");
  const [email, setEmail] = useState("");
  const [submitState, setSubmitState] = useState<SubmitState>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  useEffect(() => {
    setActiveSlideIndex(0);
  }, [systemSlug]);

  const kitHref = `/kit-systeme/${encodeURIComponent(systemSlug)}`;
  const cards = systeme?.cards ?? [];
  const activeCard = cards[activeSlideIndex] ?? null;

  function goToPreviousSlide() {
    if (!cards.length) {
      return;
    }

    setActiveSlideIndex((currentIndex) =>
      currentIndex === 0 ? cards.length - 1 : currentIndex - 1,
    );
  }

  function goToNextSlide() {
    if (!cards.length) {
      return;
    }

    setActiveSlideIndex((currentIndex) =>
      currentIndex === cards.length - 1 ? 0 : currentIndex + 1,
    );
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (submitState === "loading") {
      return;
    }

    setSubmitState("loading");
    setErrorMessage(null);

    try {
      const response = await fetch("/api/systeme-kit/request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firstName,
          email,
          sectorSlug: systemSlug,
          sectorName: systemName,
        }),
      });

      const payload = (await response.json().catch(() => null)) as
        | { ok?: boolean; error?: string }
        | null;

      if (!response.ok || !payload?.ok) {
        throw new Error(payload?.error || "Impossible d'envoyer le kit pour le moment.");
      }

      setSubmitState("success");
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Impossible d'envoyer le kit pour le moment."
      );
      setSubmitState("idle");
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
        className="relative flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-[1.5rem] border border-dema-line bg-dema-paper shadow-[0_24px_70px_rgba(23,35,29,0.14)]"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Fermer"
          className="absolute right-4 top-4 inline-flex h-10 w-10 items-center justify-center rounded-full bg-transparent text-brand-blue transition hover:text-dema-forest"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>

        <div className="min-h-0 overflow-y-auto p-5 soft-scroll sm:p-6 md:p-7">
          <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr] lg:gap-8">
            <div>
              <div className="overflow-hidden rounded-[1.25rem] border border-dema-line bg-[#f6f4ee] p-4 sm:p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-dema-forest">
                      Aperçu du kit
                    </p>
                    <p className="mt-2 text-sm leading-relaxed text-dema-muted">
                      {cards.length} piliers à parcourir, un slide par pilier.
                    </p>
                  </div>

                  {cards.length > 1 ? (
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={goToPreviousSlide}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-dema-line bg-white text-brand-blue transition hover:border-dema-forest/25 hover:text-dema-forest"
                        aria-label="Pilier précédent"
                      >
                        <ChevronLeft className="h-4 w-4" aria-hidden="true" />
                      </button>
                      <button
                        type="button"
                        onClick={goToNextSlide}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-dema-line bg-white text-brand-blue transition hover:border-dema-forest/25 hover:text-dema-forest"
                        aria-label="Pilier suivant"
                      >
                        <ChevronRight className="h-4 w-4" aria-hidden="true" />
                      </button>
                    </div>
                  ) : null}
                </div>

                {activeCard ? (
                  <div className="mt-5 flex min-h-[15.5rem] flex-col rounded-[1.2rem] bg-transparent p-1 sm:min-h-[17rem]">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-lg font-semibold tracking-tight text-brand-blue">
                          {activeCard.pillar}
                        </p>
                      </div>
                      {cards.length > 1 ? (
                        <p className="text-xs font-medium text-dema-muted">
                          {activeSlideIndex + 1}/{cards.length}
                        </p>
                      ) : null}
                    </div>

                    <div className="mt-5 flex-1 space-y-3">
                      {activeCard.items.map((item) => (
                        <div
                          key={`${activeCard.pillar}-${item.process}`}
                          className="flex items-start gap-2 text-sm text-dema-muted"
                        >
                          <FileText className="mt-0.5 h-3.5 w-3.5 shrink-0 text-dema-forest" aria-hidden="true" />
                          <span className="leading-5">{item.document}</span>
                        </div>
                      ))}
                    </div>

                    {cards.length > 1 ? (
                      <div className="mt-6 flex flex-wrap gap-2">
                        {cards.map((card, index) => (
                          <button
                            key={`slide-dot-${card.pillar}`}
                            type="button"
                            onClick={() => setActiveSlideIndex(index)}
                            className={
                              index === activeSlideIndex
                                ? "h-2.5 w-6 rounded-full bg-dema-forest"
                                : "h-2.5 w-2.5 rounded-full bg-dema-line"
                            }
                            aria-label={`Voir le pilier ${card.pillar}`}
                          />
                        ))}
                      </div>
                    ) : null}
                  </div>
                ) : (
                  <div className="mt-5 min-h-[15.5rem] rounded-[1.2rem] bg-transparent p-1 text-sm text-dema-muted sm:min-h-[17rem]">
                    Aucun document disponible pour ce système.
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-5">
              <div>
                <h2
                  id="system-complete-modal-title"
                  className="text-[2rem] font-semibold leading-[1.02] tracking-tight text-brand-blue sm:text-[2.2rem]"
                >
                  Recevoir le système {systemName}
                </h2>
              </div>

              {submitState === "success" ? (
                <div className="bg-dema-cream/45 p-1 sm:p-1">
                  <div className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-dema-sage text-dema-forest">
                    <Mail className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <h3 className="mt-4 text-lg font-semibold text-brand-blue">
                    Le système a été envoyé
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-dema-muted">
                    Un lien d&apos;accès au système {systemName} vient d&apos;être envoyé à {email}.
                  </p>
                  <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                    <a href={kitHref} className="demaa-primary-button">
                      Accéder aux téléchargements
                    </a>
                    <button
                      type="button"
                      onClick={onClose}
                      className="inline-flex items-center justify-center rounded-full border border-dema-line bg-dema-paper px-5 py-3 text-sm font-medium text-brand-blue transition hover:border-dema-forest/25 hover:text-dema-forest"
                    >
                      Fermer
                    </button>
                  </div>
                </div>
              ) : (
                <form
                  onSubmit={handleSubmit}
                  className="p-1"
                >
                  <div className="space-y-4">
                    <label className="block">
                      <span className="text-sm font-medium text-brand-blue">Prénom</span>
                      <input
                        type="text"
                        name="firstName"
                        value={firstName}
                        onChange={(event) => setFirstName(event.target.value)}
                        className="mt-2 w-full rounded-[1rem] border border-dema-line bg-white px-4 py-3 text-sm text-brand-blue outline-none transition placeholder:text-dema-muted/70 focus:border-dema-forest/35"
                        placeholder="Votre prénom"
                        autoComplete="given-name"
                        required
                      />
                    </label>

                    <label className="block">
                      <span className="text-sm font-medium text-brand-blue">Email</span>
                      <input
                        type="email"
                        name="email"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        className="mt-2 w-full rounded-[1rem] border border-dema-line bg-white px-4 py-3 text-sm text-brand-blue outline-none transition placeholder:text-dema-muted/70 focus:border-dema-forest/35"
                        placeholder="vous@entreprise.fr"
                        autoComplete="email"
                        required
                      />
                    </label>
                  </div>

                  {errorMessage ? (
                    <p className="mt-4 text-sm text-brand-coral">{errorMessage}</p>
                  ) : null}

                  <button
                    type="submit"
                    disabled={submitState === "loading"}
                    className="demaa-primary-button mt-5"
                  >
                    {submitState === "loading" ? (
                      <>
                        <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />
                        Envoi en cours...
                      </>
                    ) : null}
                    Recevoir le système
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
