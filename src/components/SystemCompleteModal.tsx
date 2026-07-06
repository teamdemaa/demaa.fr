"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { LoaderCircle, X } from "lucide-react";
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
  const [isCheckoutLoading, setIsCheckoutLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

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

  const cards = systeme?.cards ?? [];
  const processCount = cards.reduce((total, card) => total + card.items.length, 0);
  const documentCount = new Set(
    cards.flatMap((card) => card.items.map((item) => item.document.trim())).filter(Boolean)
  ).size;
  const productFacts = [
    `${cards.length} piliers structurés`,
    `${processCount} process concrets`,
    `${documentCount} documents associés`,
  ];
  const faqItems = [
    {
      question: "Est-ce que j'achète tous les documents ?",
      answer: "Oui, vous achetez l'ensemble des documents associés au système de ce métier.",
    },
    {
      question: "Est-ce que c'est prêt à utiliser ?",
      answer: "Vous partez d'une base structurée, conçue pour être mise en place plus facilement.",
    },
    {
      question: "Comment vais-je y accéder après achat ?",
      answer: "Après votre paiement, vous êtes redirigé vers la suite prévue pour accéder au système acheté.",
    },
  ];

  async function handleCheckout() {
    if (isCheckoutLoading) return;

    setIsCheckoutLoading(true);
    setCheckoutError(null);

    try {
      const response = await fetch("/api/stripe/create-system-checkout-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sectorSlug: systemSlug,
          sectorName: systemName,
          pillarCount: cards.length,
          processCount,
          documentCount,
        }),
      });

      const payload = (await response.json().catch(() => null)) as { url?: string; error?: string } | null;

      if (!response.ok || !payload?.url) {
        throw new Error(payload?.error || "Impossible de lancer le paiement pour le moment.");
      }

      window.location.href = payload.url;
    } catch (error) {
      setCheckoutError(
        error instanceof Error
          ? error.message
          : "Impossible de lancer le paiement pour le moment."
      );
      setIsCheckoutLoading(false);
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
        className="relative flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-[1.5rem] border border-dema-line bg-dema-paper shadow-[0_24px_70px_rgba(23,35,29,0.14)]"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Fermer"
          className="absolute right-4 top-4 inline-flex h-10 w-10 items-center justify-center rounded-full border border-dema-line bg-dema-paper text-brand-blue transition hover:border-dema-forest/25 hover:text-dema-forest"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>

        <div className="min-h-0 overflow-y-auto p-5 soft-scroll sm:p-6 md:p-7">
          <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:gap-8">
            <div>
              <div className="overflow-hidden rounded-[1.25rem] border border-dema-line bg-dema-cream/35">
                <div className="relative aspect-[4/3] w-full">
                  <Image
                    src="/images/templates/systeme_operationnel.png"
                    alt={`Aperçu du système complet pour ${systemName}`}
                    fill
                    className="object-cover"
                    sizes="(min-width: 1024px) 50vw, 100vw"
                    priority={false}
                  />
                </div>
              </div>

              <div className="mt-5 rounded-[1rem] border border-dema-line bg-dema-paper p-4 sm:p-5">
                <h3 className="text-lg font-semibold text-brand-blue">
                  Questions fréquentes
                </h3>
                <div className="mt-4 space-y-4">
                  {faqItems.map((item) => (
                    <div key={item.question} className="border-t border-dema-line/80 pt-4 first:border-t-0 first:pt-0">
                      <p className="text-sm font-semibold text-brand-blue">{item.question}</p>
                      <p className="mt-1 text-sm leading-relaxed text-dema-muted">{item.answer}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-5">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-dema-forest">
                  Système métier
                </p>
                <h2
                  id="system-complete-modal-title"
                  className="mt-3 text-[2rem] font-semibold leading-[1.02] tracking-tight text-brand-blue sm:text-[2.25rem]"
                >
                  Le système complet pour {systemName}
                </h2>
                <p className="mt-3 max-w-xl text-sm leading-relaxed text-dema-muted">
                  Tous les documents à implémenter pour mettre en place le système de ce métier.
                </p>
              </div>

              <div className="rounded-[1rem] border border-dema-line bg-dema-paper p-4 sm:p-5">
                <h3 className="text-lg font-semibold text-brand-blue">
                  Ce que vous achetez
                </h3>
                <div className="mt-4 space-y-3">
                  {productFacts.map((item) => (
                    <div
                      key={item}
                      className="rounded-[1rem] border border-dema-line bg-dema-paper px-4 py-3 text-sm text-brand-blue"
                    >
                      {item}
                    </div>
                  ))}
                </div>
                <p className="mt-4 text-sm leading-relaxed text-dema-muted">
                  Vous achetez l&apos;ensemble des documents associés au système de ce métier, avec une structure déjà organisée par pilier et par process.
                </p>
              </div>

              <div className="rounded-[1rem] border border-dema-line bg-dema-cream/45 p-4 sm:p-5">
                <p className="text-2xl font-semibold tracking-tight text-brand-blue">
                  550 euros
                </p>
                <p className="mt-2 text-sm leading-relaxed text-dema-muted">
                  Une offre contextualisée pour {systemName}, avec le bon système et les bons documents.
                </p>
                <button
                  type="button"
                  onClick={handleCheckout}
                  disabled={isCheckoutLoading}
                  className="demaa-primary-button mt-5"
                >
                  {isCheckoutLoading ? (
                    <>
                      <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />
                      Redirection...
                    </>
                  ) : null}
                  Acheter le système
                </button>
                {checkoutError ? (
                  <p className="mt-3 text-sm text-brand-coral">{checkoutError}</p>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
