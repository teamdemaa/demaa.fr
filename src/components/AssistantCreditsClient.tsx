"use client";

import { useMemo, useState } from "react";
import {
  Check,
  ChevronDown,
  FileCheck2,
  HandCoins,
  Megaphone,
  ReceiptText,
  Search,
} from "lucide-react";

const CREDIT_OPTIONS = [
  { credits: 250 },
  { credits: 500 },
  { credits: 750 },
  { credits: 1000 },
] as const;

type CreditAmount = (typeof CREDIT_OPTIONS)[number]["credits"];

const ASSISTANT_USES = [
  {
    title: "Facturation",
    rate: "25 crédits / heure",
    icon: ReceiptText,
    description:
      "Classement des pièces, suivi des paiements, préparation des éléments comptables et mise à jour de vos documents de gestion.",
  },
  {
    title: "Contenu / Marketing",
    rate: "30 crédits / heure",
    icon: Megaphone,
    description:
      "Posts, newsletters, supports simples, idées de contenu et mises en forme pour garder une présence régulière.",
  },
  {
    title: "Prospection",
    rate: "30 crédits / heure",
    icon: Search,
    description:
      "Recherche de contacts, enrichissement de listes, préparation des messages et suivi des opportunités.",
  },
  {
    title: "Subventions",
    rate: "40 crédits / heure",
    icon: HandCoins,
    description:
      "Recherche d'aides, vérification de l'éligibilité, préparation des pièces et suivi du dossier.",
  },
  {
    title: "Appels d'offres",
    rate: "50 crédits / heure",
    icon: FileCheck2,
    description:
      "Repérage des opportunités, liste des pièces à fournir, organisation des documents et préparation des réponses.",
  },
] as const;

const STEPS = [
  {
    title: "Vous choisissez vos crédits",
    description: "Vous achetez des crédits simples, sans abonnement et sans recrutement.",
  },
  {
    title: "Vous déléguez",
    description: "Vous confiez les tâches qui bloquent votre semaine : factures, contenus, dossiers, suivi ou prospection.",
  },
  {
    title: "On exécute intelligemment",
    description: "On avance par priorité, avec un suivi simple, et vos crédits sont consommés selon le temps réellement passé.",
  },
] as const;

const FAQ_ITEMS = [
  {
    question: "Est-ce un abonnement ?",
    answer:
      "Non. Vous achetez des crédits, sans abonnement. Vous les utilisez selon vos besoins.",
  },
  {
    question: "Dois-je choisir les tâches maintenant ?",
    answer:
      "Non. Vous choisissez seulement vos crédits. Les premières tâches sont définies au démarrage, selon ce qui vous fait perdre le plus de temps.",
  },
  {
    question: "Puis-je mélanger plusieurs besoins ?",
    answer:
      "Oui. Vous pouvez utiliser vos crédits pour une seule mission ou les répartir entre facturation, contenu, prospection, subventions ou appels d'offres.",
  },
  {
    question: "Comment sont consommés les crédits ?",
    answer:
      "Les crédits sont consommés selon le temps réellement passé sur les tâches validées.",
  },
  {
    question: "Que se passe-t-il si je n'utilise pas tout ou si une tâche dépasse ?",
    answer:
      "Les crédits non utilisés restent disponibles pour d'autres tâches. Si une tâche demande plus de temps que prévu, on vous prévient avant de continuer.",
  },
  {
    question: "Puis-je commencer petit ?",
    answer:
      "Oui. Vous pouvez commencer avec 250 crédits pour tester sur une première série de tâches.",
  },
] as const;

function formatCredits(credits: number) {
  return `${credits} crédits`;
}

function formatPrice(credits: number) {
  return `${credits} €`;
}

export default function AssistantCreditsClient() {
  const [selectedCredits, setSelectedCredits] = useState<CreditAmount>(CREDIT_OPTIONS[0].credits);
  const [isCreditMenuOpen, setIsCreditMenuOpen] = useState(false);
  const [isStartingCheckout, setIsStartingCheckout] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [openUseIndex, setOpenUseIndex] = useState<number | null>(0);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const selectedOption = useMemo(
    () => CREDIT_OPTIONS.find((option) => option.credits === selectedCredits) ?? CREDIT_OPTIONS[0],
    [selectedCredits]
  );

  const handlePayment = async () => {
    setCheckoutError(null);
    setIsStartingCheckout(true);

    try {
      const response = await fetch("/api/stripe/assistant-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ credits: selectedOption.credits }),
      });

      const payload = (await response.json().catch(() => null)) as
        | { error?: string; url?: string }
        | null;

      if (!response.ok || !payload?.url) {
        throw new Error(
          payload?.error ||
            "Impossible de créer le paiement Stripe pour le moment."
        );
      }

      window.location.assign(payload.url);
    } catch (error) {
      setCheckoutError(
        error instanceof Error
          ? error.message
          : "Impossible de créer le paiement Stripe pour le moment."
      );
      setIsStartingCheckout(false);
    }
  };

  const selectedFacturationHours = Math.floor(selectedCredits / 25);

  return (
    <div className="min-h-screen bg-white text-brand-blue">
      <section className="mx-auto w-full max-w-6xl px-4 pb-20 pt-20 md:px-8 md:pb-32 md:pt-28">
        <div className="mx-auto max-w-5xl text-center">
          <h1 className="demaa-hero-title text-[3rem] leading-[0.98] tracking-tight text-brand-blue md:text-[5rem]">
            Déléguez ce qui vous ralentit.
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-gray-600 md:text-lg">
            Des crédits pour confier les tâches opérationnelles qui prennent du
            temps : factures, contenus, prospection, dossiers, suivi
            administratif et préparation de documents.
          </p>
          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <a
              href="#pricing"
              className="inline-flex min-h-12 w-full items-center justify-center rounded-full bg-brand-blue px-6 text-sm font-medium text-white transition hover:bg-brand-coral sm:w-auto"
            >
              Choisir mes crédits
            </a>
            <a
              href="#deleguer"
              className="inline-flex min-h-12 w-full items-center justify-center rounded-full bg-neutral-100 px-6 text-sm font-medium text-brand-blue transition hover:bg-neutral-200 sm:w-auto"
            >
              Voir ce que je peux déléguer
            </a>
          </div>
        </div>

        <section className="mx-auto mt-24 max-w-5xl md:mt-32">
          <div className="max-w-2xl">
            <h2 className="text-2xl font-semibold tracking-tight text-brand-blue md:text-3xl">
              Un renfort simple, quand vous en avez besoin.
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-gray-600 md:text-base">
              Vous choisissez vos crédits, vous confiez les tâches à traiter,
              puis on avance par priorité avec un suivi clair.
            </p>
          </div>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
          {STEPS.map((step, index) => (
            <div key={step.title} className="bg-neutral-50 px-5 py-6">
              <p className="text-xs font-semibold text-brand-coral">0{index + 1}</p>
              <h2 className="mt-4 text-base font-semibold text-brand-blue">{step.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-gray-600">{step.description}</p>
            </div>
          ))}
          </div>
        </section>

        <section id="deleguer" className="mx-auto mt-28 grid max-w-5xl gap-12 lg:grid-cols-[0.85fr_1.15fr] md:mt-36">
          <div className="pt-1">
            <h2 className="text-2xl font-semibold tracking-tight text-brand-blue md:text-3xl">
              Ce que vous pouvez nous confier.
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-gray-600 md:text-base">
              On commence par les sujets qui vous font perdre du temps ou qui
              restent trop souvent en attente.
            </p>
          </div>

          <div className="space-y-2">
            {ASSISTANT_USES.map((item, index) => {
              const isOpen = openUseIndex === index;
              const UseIcon = item.icon;

              return (
                <div key={item.title} className="bg-white">
                  <button
                    type="button"
                    onClick={() => setOpenUseIndex(isOpen ? null : index)}
                    className="flex w-full items-center justify-between gap-4 py-4 text-left"
                    aria-expanded={isOpen}
                  >
                    <span className="flex min-w-0 items-center gap-3">
                      <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-neutral-50 text-brand-blue">
                        <UseIcon className="h-4 w-4" aria-hidden="true" />
                      </span>
                      <span className="text-base font-semibold text-brand-blue">
                        {item.title}
                      </span>
                    </span>
                    <span className="flex items-center gap-3">
                      <span className="hidden text-sm font-medium text-brand-coral sm:inline">
                        {item.rate}
                      </span>
                      <ChevronDown
                        className={`h-5 w-5 shrink-0 text-brand-blue transition-transform ${
                          isOpen ? "rotate-180" : ""
                        }`}
                      />
                    </span>
                  </button>

                  {isOpen ? (
                    <div className="pb-4">
                      <p className="text-sm font-medium text-brand-coral sm:hidden">
                        {item.rate}
                      </p>
                      <p className="mt-2 text-sm leading-relaxed text-gray-600">
                        {item.description}
                      </p>
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        </section>

        <section id="pricing" className="mx-auto mt-28 max-w-3xl bg-neutral-50 px-5 py-10 md:mt-36 md:px-8 md:py-12">
          <div className="mx-auto max-w-2xl text-center">
            <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-brand-coral">
              Assistant à la demande
            </p>
            <h2 className="text-2xl font-semibold tracking-tight text-brand-blue md:text-3xl">
              Choisissez vos crédits.
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-gray-600 md:text-base">
              1 crédit = 1 €. Vous achetez vos crédits, puis vous les utilisez
              selon vos besoins.
            </p>
          </div>

          <div className="mx-auto mt-7 max-w-xl">
            <button
              type="button"
              onClick={() => setIsCreditMenuOpen((isOpen) => !isOpen)}
              className="flex min-h-14 w-full items-center justify-between rounded-[0.9rem] bg-white px-4 text-left text-lg font-medium text-neutral-950 shadow-[0_10px_30px_rgba(20,20,20,0.06)] transition hover:bg-neutral-50"
              aria-expanded={isCreditMenuOpen}
            >
              <span>
                {formatCredits(selectedCredits)} - {formatPrice(selectedCredits)}
              </span>
              <ChevronDown
                className={`h-5 w-5 transition-transform ${isCreditMenuOpen ? "rotate-180" : ""}`}
              />
            </button>

            {isCreditMenuOpen ? (
              <div className="mt-3 overflow-hidden rounded-[0.9rem] bg-white py-3 shadow-[0_18px_34px_rgba(20,20,20,0.10)]">
                {CREDIT_OPTIONS.map((option) => {
                  const isSelected = option.credits === selectedCredits;

                  return (
                    <button
                      key={option.credits}
                      type="button"
                      onClick={() => {
                        setSelectedCredits(option.credits);
                        setIsCreditMenuOpen(false);
                      }}
                      className={`flex w-full items-center justify-between px-5 py-3 text-left text-lg transition ${
                        isSelected
                          ? "font-semibold text-brand-coral"
                          : "font-medium text-neutral-950 hover:bg-neutral-50"
                      }`}
                    >
                      <span>
                        {formatCredits(option.credits)} - {formatPrice(option.credits)}
                      </span>
                      {isSelected ? <Check className="h-5 w-5" /> : null}
                    </button>
                  );
                })}
              </div>
            ) : null}

            <p className="mt-5 text-center text-sm font-medium text-neutral-950">
              1 crédit assistant = 1 €
            </p>

            <button
              type="button"
              onClick={handlePayment}
              disabled={isStartingCheckout}
              className="mt-7 inline-flex w-full items-center justify-center rounded-full bg-brand-blue px-5 py-3 text-sm font-medium text-white transition hover:bg-brand-coral disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isStartingCheckout
                ? "Ouverture du paiement..."
                : `Acheter ${formatCredits(selectedCredits)}`}
            </button>
            {checkoutError ? (
              <p className="mx-auto mt-3 max-w-md text-center text-sm leading-relaxed text-red-500">
                {checkoutError}
              </p>
            ) : null}
            <p className="mx-auto mt-4 max-w-md text-center text-xs leading-relaxed text-gray-500">
              Exemple : {formatCredits(selectedCredits)} peuvent couvrir jusqu&apos;à{" "}
              {selectedFacturationHours}h de facturation, ou être répartis entre
              plusieurs tâches.
            </p>
          </div>
        </section>

        <section className="mx-auto mt-28 max-w-5xl md:mt-36">
          <div className="max-w-2xl">
            <h2 className="text-2xl font-semibold tracking-tight text-brand-blue md:text-3xl">
              Les questions avant de démarrer.
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-gray-600 md:text-base">
              Le but : vous faire gagner du temps sans abonnement lourd, sans
              recrutement, et sans complexité.
            </p>
          </div>

          <div className="mt-8 space-y-2">
            {FAQ_ITEMS.map((item, index) => {
              const isOpen = openFaqIndex === index;

              return (
                <div key={item.question} className="bg-neutral-50 px-5">
                  <button
                    type="button"
                    onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                    className="flex w-full items-center justify-between gap-4 py-4 text-left"
                    aria-expanded={isOpen}
                  >
                    <span className="text-sm font-semibold text-brand-blue">
                      {item.question}
                    </span>
                    <ChevronDown
                      className={`h-5 w-5 shrink-0 text-brand-blue transition-transform ${
                        isOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {isOpen ? (
                    <p className="pb-4 text-sm leading-relaxed text-gray-600">
                      {item.answer}
                    </p>
                  ) : null}
                </div>
              );
            })}
          </div>
        </section>

        <section className="mx-auto mt-28 max-w-3xl pb-8 text-center md:mt-36">
          <h2 className="text-2xl font-semibold tracking-tight text-brand-blue md:text-3xl">
            Déléguez une première tâche cette semaine.
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-gray-600 md:text-base">
            Commencez avec des crédits, puis confiez les sujets qui vous freinent
            au quotidien.
          </p>
          <a
            href="#pricing"
            className="mt-6 inline-flex rounded-full bg-brand-blue px-6 py-3 text-sm font-medium text-white transition hover:bg-brand-coral"
          >
            Choisir mes crédits
          </a>
        </section>
      </section>
    </div>
  );
}
