"use client";

import { useMemo, useState } from "react";
import { Check, ChevronDown } from "lucide-react";

const CREDIT_OPTIONS = [
  {
    credits: 250,
    paymentUrl: process.env.NEXT_PUBLIC_STRIPE_URL_ASSISTANT_250?.trim() || "",
  },
  {
    credits: 500,
    paymentUrl: process.env.NEXT_PUBLIC_STRIPE_URL_ASSISTANT_500?.trim() || "",
  },
  {
    credits: 750,
    paymentUrl: process.env.NEXT_PUBLIC_STRIPE_URL_ASSISTANT_750?.trim() || "",
  },
  {
    credits: 1000,
    paymentUrl: process.env.NEXT_PUBLIC_STRIPE_URL_ASSISTANT_1000?.trim() || "",
  },
] as const;

type CreditAmount = (typeof CREDIT_OPTIONS)[number]["credits"];

const ASSISTANT_USES = [
  {
    title: "Facturation",
    rate: "25 crédits / heure",
    description:
      "Pour relancer des factures, classer des pièces, mettre à jour un suivi ou préparer les informations pour votre comptable.",
  },
  {
    title: "Contenu / Marketing",
    rate: "30 crédits / heure",
    description:
      "Pour préparer des posts, newsletters, supports simples, idées de contenu ou mises en forme.",
  },
  {
    title: "Prospection",
    rate: "30 crédits / heure",
    description:
      "Pour chercher des prospects, enrichir une liste, préparer des messages et organiser les relances.",
  },
  {
    title: "Subventions",
    rate: "40 crédits / heure",
    description:
      "Pour chercher des aides, vérifier si vous êtes éligible, préparer les pièces et suivre le dossier.",
  },
  {
    title: "Appels d'offres",
    rate: "50 crédits / heure",
    description:
      "Pour repérer les dossiers, lister les pièces à fournir, organiser les documents et préparer les réponses.",
  },
] as const;

const BENEFITS = [
  "Gagner du temps chaque semaine",
  "Déléguer sans recruter",
  "Utiliser vos crédits selon vos priorités",
] as const;

const STEPS = [
  {
    title: "Vous choisissez vos crédits",
    description: "Vous prenez une réserve simple, adaptée au volume de tâches que vous voulez sortir de votre agenda.",
  },
  {
    title: "On vous contacte",
    description: "Après paiement, on fixe un rendez-vous pour comprendre ce qui vous prend le plus de temps.",
  },
  {
    title: "Vous déléguez",
    description: "On commence par les tâches les plus utiles, puis les crédits sont consommés selon le temps passé.",
  },
] as const;

const FAQ_ITEMS = [
  {
    question: "Dois-je choisir les tâches maintenant ?",
    answer:
      "Non. Vous choisissez seulement votre réserve de crédits. On décide ensemble des premières tâches après le rendez-vous.",
  },
  {
    question: "Puis-je mélanger plusieurs besoins ?",
    answer:
      "Oui. Vous pouvez utiliser vos crédits pour de la facturation, du contenu, de la prospection ou d'autres tâches selon vos priorités.",
  },
  {
    question: "Que se passe-t-il si une tâche prend plus de temps ?",
    answer:
      "On vous prévient avant d'aller plus loin. L'idée est de garder une règle simple et de ne pas consommer vos crédits sans validation.",
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
  const [openUseIndex, setOpenUseIndex] = useState<number | null>(0);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const selectedOption = useMemo(
    () => CREDIT_OPTIONS.find((option) => option.credits === selectedCredits) ?? CREDIT_OPTIONS[0],
    [selectedCredits]
  );

  const handlePayment = () => {
    if (!selectedOption.paymentUrl) {
      return;
    }

    window.location.assign(selectedOption.paymentUrl);
  };

  const selectedFacturationHours = Math.floor(selectedCredits / 25);

  return (
    <div className="min-h-screen bg-white text-brand-blue">
      <section className="mx-auto w-full max-w-6xl px-4 pb-14 pt-16 md:px-8 md:pb-20 md:pt-20">
        <div className="mx-auto max-w-5xl text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-brand-coral">
            Assistant à la demande
          </p>
          <h1 className="demaa-hero-title mt-5 text-[3rem] leading-[0.98] tracking-tight text-brand-blue md:text-[5rem]">
            Vous gérez déjà l&apos;essentiel. Déléguez le reste.
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-gray-600 md:text-lg">
            Gagnez du temps en déléguant les tâches qui vous prennent la tête :
            factures, contenus, prospection, dossiers, relances.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-2">
            {BENEFITS.map((benefit) => (
              <span
                key={benefit}
                className="rounded-full bg-neutral-100 px-4 py-2 text-xs font-medium text-neutral-700"
              >
                {benefit}
              </span>
            ))}
          </div>
        </div>

        <section className="mx-auto mt-14 grid max-w-5xl gap-5 md:grid-cols-3">
          {STEPS.map((step, index) => (
            <div key={step.title} className="bg-[#FFF9F8]/60 px-5 py-5">
              <p className="text-xs font-semibold text-brand-coral">0{index + 1}</p>
              <h2 className="mt-3 text-base font-semibold text-brand-blue">{step.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-gray-600">{step.description}</p>
            </div>
          ))}
        </section>

        <section id="pricing" className="mx-auto mt-16 max-w-3xl bg-[#FFF9F8]/70 px-5 py-7 md:px-8 md:py-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-2xl font-semibold tracking-tight text-brand-blue md:text-3xl">
              Choisissez vos crédits assistant
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-gray-600 md:text-base">
              Vous achetez une réserve simple. Ensuite, on voit ensemble ce que
              vous voulez déléguer en priorité.
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
            <p className="mx-auto mt-2 max-w-md text-center text-sm leading-relaxed text-gray-600">
              Après paiement, on vous contacte pour organiser le rendez-vous et
              définir les premières tâches à déléguer.
            </p>
            <p className="mx-auto mt-4 max-w-md text-center text-sm leading-relaxed text-gray-600">
              Exemple : avec {formatCredits(selectedCredits)}, vous pouvez déléguer
              jusqu&apos;à {selectedFacturationHours}h de facturation, ou mixer plusieurs
              besoins selon vos priorités.
            </p>

            <button
              type="button"
              onClick={handlePayment}
              disabled={!selectedOption.paymentUrl}
              className={`mt-6 inline-flex w-full items-center justify-center rounded-full px-5 py-3 text-sm font-medium transition ${
                selectedOption.paymentUrl
                  ? "bg-brand-blue text-white hover:bg-brand-coral"
                  : "cursor-not-allowed bg-white text-neutral-400"
              }`}
            >
              {selectedOption.paymentUrl
                ? `Acheter ${formatCredits(selectedCredits)}`
                : "Paiement bientôt disponible"}
            </button>
          </div>
        </section>

        <section className="mx-auto mt-14 grid max-w-5xl gap-8 lg:grid-cols-[0.85fr_1.15fr]">
          <div className="pt-1">
            <h2 className="text-2xl font-semibold tracking-tight text-brand-blue md:text-3xl">
              Ce que vous pouvez déléguer
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-gray-600 md:text-base">
              Vous n&apos;avez pas besoin de choisir maintenant. On décide ensemble
              après le rendez-vous, selon ce qui vous fait perdre le plus de temps.
            </p>
            <p className="mt-5 text-sm font-semibold text-brand-blue">
              Pas d&apos;abonnement. Pas de recrutement.
            </p>
          </div>

          <div className="space-y-2">
            {ASSISTANT_USES.map((item, index) => {
              const isOpen = openUseIndex === index;

              return (
                <div key={item.title} className="bg-white">
                  <button
                    type="button"
                    onClick={() => setOpenUseIndex(isOpen ? null : index)}
                    className="flex w-full items-center justify-between gap-4 py-4 text-left"
                    aria-expanded={isOpen}
                  >
                    <span className="text-base font-semibold text-brand-blue">
                      {item.title}
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

        <section className="mx-auto mt-16 max-w-5xl">
          <div className="max-w-2xl">
            <h2 className="text-2xl font-semibold tracking-tight text-brand-blue md:text-3xl">
              Questions simples
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-gray-600 md:text-base">
              L&apos;objectif est de vous faire gagner du temps sans vous ajouter une
              nouvelle charge à gérer.
            </p>
          </div>

          <div className="mt-6 space-y-2">
            {FAQ_ITEMS.map((item, index) => {
              const isOpen = openFaqIndex === index;

              return (
                <div key={item.question} className="bg-[#FFF9F8]/55 px-5">
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

        <section className="mx-auto mt-16 max-w-3xl pb-6 text-center">
          <h2 className="text-2xl font-semibold tracking-tight text-brand-blue md:text-3xl">
            Prêt à vous libérer du temps ?
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-gray-600 md:text-base">
            Commencez avec une réserve de crédits assistant. On vous aide ensuite
            à choisir les premières tâches à sortir de votre agenda.
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
