"use client";

import { useState } from "react";
import {
  Check,
  ChevronDown,
  Workflow,
} from "lucide-react";
import {
  ASSISTANT_PACK_OFFERS,
  formatAssistantPrice,
  type AssistantOffer,
  type AssistantPack,
  type AssistantPackId,
} from "@/lib/assistant-packs";
import PrimaryMobileNav from "@/components/PrimaryMobileNav";
import SystemSetupModal from "@/components/SystemSetupModal";

const STRUCTURATION_OFFER_ID = "structuration-automatisation";

const howItWorksSteps = [
  {
    title: "On analyse votre fonctionnement",
    description:
      "On identifie vos tâches répétitives, vos outils, vos documents, vos points de friction et les validations qui ralentissent l’équipe.",
  },
  {
    title: "On priorise les process à structurer",
    description:
      "On choisit les process à clarifier, les tableaux à créer, les formulaires utiles et les automatisations qui auront un vrai impact.",
  },
  {
    title: "On met en place le système",
    description:
      "On configure les outils, on teste les parcours avec vos cas réels, puis on vous transmet un système clair et exploitable.",
  },
] as const;

const faqItems = [
  {
    question: "Est-ce que l’audit gratuit m’engage à acheter quelque chose ?",
    answer:
      "Non. L’audit gratuit ne vous engage à rien. Il sert à faire le point sur votre organisation si vous voulez commencer par clarifier les choses.",
  },
  {
    question: "Comment choisir entre audit, 1 société, 2 sociétés ou 3 sociétés ?",
    answer:
      "L’audit gratuit sert à faire le point avant de vous engager. Le pack 1 société convient si une seule structure doit être organisée. Les packs 2 ou 3 sociétés servent quand plusieurs entités partagent des outils, des tâches ou des validations à coordonner.",
  },
  {
    question: "Est-ce que je garde la main sur les décisions ?",
    answer:
      "Oui. On prend en charge l’exécution, l’organisation et le suivi, mais les décisions importantes restent de votre côté.",
  },
  {
    question: "Qu’est-ce que je dois fournir ?",
    answer:
      "Les informations utiles à la mission : documents, accès, consignes, échéances et validations attendues.",
  },
  {
    question: "Comment se passe la communication ?",
    answer:
      "La communication se fait simplement sur WhatsApp, pour que les échanges soient rapides, faciles à suivre et proches de votre quotidien. Si un document ou une validation est nécessaire, on vous le précise clairement.",
  },
  {
    question: "Et si mon besoin ne rentre pas exactement dans une offre ?",
    answer:
      "Vous pouvez passer par l’audit gratuit ou nous contacter. On vous dira simplement si le besoin est adapté, s’il faut ajuster le périmètre, ou si ce n’est pas le bon sujet.",
  },
] as const;

const em2aResults = [
  "36 jours/an gagnés côté comptabilité",
  "30 jours/an gagnés côté paie",
  "Jusqu’à 30 000 € de capacité récupérée/an",
] as const;

const em2aImpacts = [
  "Moins de relances",
  "Moins de flou dans le suivi",
  "Plus de temps pour les clients",
] as const;

const em2aSteps = [
  "Audit de l’organisation",
  "Priorisation des demandes clients et de la collecte paie",
  "Mise en place du système opérationnel avec Airtable, Fillout et Linktree",
] as const;

const structurationIncludedItems = [
  "Analyse de vos tâches et blocages",
  "Organisation des outils et documents",
  "Automatisations testées et documentées",
] as const;

function getPurchasablePacks(offer: AssistantOffer): readonly AssistantPack[] {
  return offer.packs.filter((pack) => pack.amount > 0);
}

function getPackOffer(offerId: string) {
  return ASSISTANT_PACK_OFFERS.find((offer) => offer.id === offerId);
}

export default function AssistantsCatalogClient() {
  const structurationOffer = getPackOffer(STRUCTURATION_OFFER_ID);
  const structurationPacks = structurationOffer ? getPurchasablePacks(structurationOffer) : [];
  const defaultStructurationPackId = structurationPacks[0]?.id ?? "structuration-1-societe";
  const [selectedStructurationPackId, setSelectedStructurationPackId] =
    useState<AssistantPackId>(defaultStructurationPackId);
  const [isPackDropdownOpen, setIsPackDropdownOpen] = useState(false);
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState(0);
  const [isStartingCheckout, setIsStartingCheckout] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  const selectedStructurationPack =
    structurationPacks.find((pack) => pack.id === selectedStructurationPackId) ??
    structurationPacks[0] ??
    null;

  const startCheckout = async (pack: AssistantPack) => {
    setCheckoutError(null);

    if (pack.amount <= 0) {
      setIsAuditModalOpen(true);
      return;
    }

    setIsStartingCheckout(true);

    try {
      const response = await fetch("/api/stripe/assistant-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: [{ packId: pack.id, quantity: 1 }],
        }),
      });

      const payload = (await response.json().catch(() => null)) as
        | {
            clientSecret?: string;
            error?: string;
            id?: string | null;
            label?: string;
            publishableKey?: string;
            url?: string;
          }
        | null;

      if (!response.ok || !payload?.url) {
        throw new Error(
          payload?.error ||
            "Impossible de créer le paiement Stripe pour le moment."
        );
      }

      if (payload.url) {
        window.location.assign(payload.url);
        return;
      }
    } catch (error) {
      setCheckoutError(
        error instanceof Error
          ? error.message
          : "Impossible de créer le paiement Stripe pour le moment."
      );
      setIsStartingCheckout(false);
    }
  };

  return (
    <>
      <section className="ml-[calc(50%-50vw)] mr-[calc(50%-50vw)] w-screen bg-dema-cream px-4 pb-5 pt-5 text-center md:px-8 md:pb-6 md:pt-16">
        <div className="mx-auto max-w-6xl space-y-6 md:space-y-7">
          <PrimaryMobileNav activeTab="deleguer" />

          <div className="mx-auto max-w-5xl">
            <h1 className="text-[clamp(3rem,14.5vw,3.36rem)] tracking-tight leading-[0.92] sm:text-[2.75rem] md:text-[3.75rem] lg:text-[4.5rem]">
              <span className="demaa-hero-title text-brand-blue/86">Structurez</span>
              <br />
              <span className="font-sans font-light not-italic text-brand-blue/44">
                ce qui vous ralentit
              </span>
            </h1>
          </div>

        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 pb-20 md:px-8 md:pb-28">
        <div className="border-t border-dema-line/65 pt-10 md:pt-14">
          <div>
            <div className="mx-auto grid gap-4 md:max-w-5xl md:grid-cols-3 md:gap-5">
              {howItWorksSteps.map((step, index) => (
                <div
                  key={step.title}
                  className="rounded-[1rem] border border-dema-line/70 bg-dema-sage/30 px-4 py-4 md:min-h-[11.5rem] md:px-5 md:py-5"
                >
                  <div className="flex gap-3 md:flex-col">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-dema-paper text-sm font-semibold text-dema-forest">
                      {index + 1}
                    </span>
                    <div>
                      <h3 className="text-sm font-semibold leading-snug text-brand-blue md:text-base">
                        {step.title}
                      </h3>
                      <p className="mt-1 text-sm leading-relaxed text-dema-muted">
                        {step.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-14 md:mt-20 lg:-mx-[5.25rem]">
            <div className="grid gap-6 rounded-[1rem] border border-dema-line/70 bg-dema-paper px-4 py-6 md:grid-cols-[1.05fr_0.95fr] md:px-6 md:py-7">
              <div>
                <p className="inline-flex rounded-full bg-dema-forest/10 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-dema-forest">
                  Étude de cas EM2A
                </p>
                <h2 className="mt-4 text-[2.45rem] font-light leading-[1.02] tracking-tight text-brand-blue/44 md:text-[3.45rem]">
                  Plus de{" "}
                  <span className="demaa-hero-title text-brand-blue/86">2 mois</span>{" "}
                  de travail
                  <br className="md:hidden" /> récupérés
                  <br className="hidden md:block" /> par an.
                </h2>
                <div className="mt-6 grid gap-3 sm:grid-cols-3">
                  {em2aImpacts.map((impact) => (
                    <div
                      key={impact}
                      className="rounded-[0.9rem] bg-dema-sage/55 px-4 py-3"
                    >
                      <p className="text-sm font-semibold leading-snug text-brand-blue">
                        {impact}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-[0.9rem] border border-dema-line/70 bg-dema-cream px-4 py-5 md:px-5">
                <p className="text-sm font-semibold text-brand-blue">Résultats</p>
                <div className="mt-4 space-y-3">
                  {em2aResults.map((result) => (
                    <div key={result} className="flex gap-3">
                      <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-dema-forest" />
                      <p className="text-sm leading-relaxed text-dema-muted">{result}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-6 border-t border-dema-line/70 pt-5">
                  <p className="text-sm font-semibold text-brand-blue">Méthode</p>
                  <div className="mt-4 space-y-3">
                    {em2aSteps.map((step, index) => (
                      <div key={step} className="flex gap-3">
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-dema-sage text-xs font-semibold text-dema-forest">
                          {index + 1}
                        </span>
                        <p className="text-sm leading-relaxed text-dema-muted">{step}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div id="pricing" className="mx-auto mt-14 max-w-[50.5rem] scroll-mt-24 md:mt-20">
            <div className="mx-auto max-w-3xl text-center">
              <h2 className="text-3xl font-semibold tracking-tight text-brand-blue md:text-4xl">
                Choisissez votre point d&apos;entrée
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-dema-muted md:text-base">
                Commencez par un audit offert ou lancez directement la structuration de votre organisation.
              </p>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2 md:gap-5">
              <article className="demaa-card flex h-full flex-col rounded-[1.15rem] p-5 text-left">
                <div>
                  <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-dema-sage text-dema-forest">
                    <Check className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <p className="mt-4 text-[10px] font-medium uppercase tracking-[0.16em] text-dema-forest">
                    Diagnostic
                  </p>
                  <h3 className="mt-2 text-2xl font-semibold leading-tight tracking-tight text-brand-blue">
                    Audit organisation
                  </h3>
                </div>
                <div className="mt-6">
                  <p className="text-4xl font-semibold tracking-tight text-brand-blue">
                    0 €
                  </p>
                  <p className="mt-3 text-sm leading-relaxed text-dema-muted">
                    Un échange pour comprendre vos tâches récurrentes, vos outils, vos documents,
                    vos blocages et les premières priorités à traiter.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setCheckoutError(null);
                    setIsAuditModalOpen(true);
                  }}
                  className="mt-6 inline-flex w-full items-center justify-center rounded-full border border-dema-forest/20 bg-dema-sage/55 px-5 py-2.5 text-sm font-medium text-dema-forest transition hover:border-dema-forest/30 hover:bg-dema-sage disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Demander l&apos;audit gratuit
                </button>
              </article>

              <article className="demaa-card relative flex h-full flex-col overflow-visible rounded-[1.15rem] p-5 text-left">
                <div>
                  <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-dema-sage text-dema-forest">
                    <Workflow className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <p className="mt-4 text-[10px] font-medium uppercase tracking-[0.16em] text-dema-forest">
                    Organisation
                  </p>
                  <h3 className="mt-2 text-2xl font-semibold leading-tight tracking-tight text-brand-blue">
                    Structuration & Automatisation
                  </h3>
                </div>

                <div className="mt-6">
                  <p className="text-4xl font-semibold tracking-tight text-brand-blue">
                    {selectedStructurationPack
                      ? formatAssistantPrice(selectedStructurationPack.amount)
                      : "À partir de 1 500 €"}
                  </p>
                  <p className="mt-3 text-sm leading-relaxed text-dema-muted">
                    On structure vos process, vos outils, vos tableaux de suivi et les automatisations utiles
                    pour rendre l&apos;activité plus claire et plus simple à piloter.
                  </p>
                </div>

                <div className="mt-5 rounded-[1rem] border border-dema-line/70 bg-dema-cream/60 p-4">
                  <p className="text-sm font-semibold text-brand-blue">Ce qui est inclus</p>
                  <ul className="mt-3 space-y-2.5">
                    {structurationIncludedItems.map((item) => (
                      <li
                        key={item}
                        className="flex items-start gap-3 text-sm leading-relaxed text-dema-muted"
                      >
                        <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-dema-sage text-dema-forest">
                          <Check className="h-3.5 w-3.5" aria-hidden="true" />
                        </span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {selectedStructurationPack ? (
                  <div className="mt-5">
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setIsPackDropdownOpen((current) => !current)}
                        className="group inline-flex h-11 w-full min-w-0 items-center justify-between gap-3 rounded-full border border-dema-line/85 bg-dema-paper px-3.5 text-left text-sm font-medium text-brand-blue shadow-[0_7px_18px_rgba(23,35,29,0.035)] transition hover:border-dema-forest/20 hover:bg-dema-sage/45 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-dema-forest/35"
                        aria-expanded={isPackDropdownOpen}
                        aria-haspopup="listbox"
                      >
                        <span className="min-w-0 truncate">
                          {selectedStructurationPack.label} - {formatAssistantPrice(selectedStructurationPack.amount)}
                        </span>
                        <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-dema-sage text-dema-forest transition group-hover:bg-dema-paper">
                          <ChevronDown
                            className={`h-4 w-4 transition ${
                              isPackDropdownOpen ? "rotate-180" : ""
                            }`}
                            aria-hidden="true"
                          />
                        </span>
                      </button>
                      {isPackDropdownOpen ? (
                        <div
                          className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-[1rem] border border-dema-line bg-dema-paper p-1.5 shadow-[0_18px_46px_rgba(23,35,29,0.12)]"
                          role="listbox"
                        >
                          {structurationPacks.map((pack) => {
                            const isSelected = pack.id === selectedStructurationPack.id;

                            return (
                              <button
                                key={pack.id}
                                type="button"
                                onClick={() => {
                                  setSelectedStructurationPackId(pack.id);
                                  setIsPackDropdownOpen(false);
                                  setCheckoutError(null);
                                }}
                                className={`flex w-full items-start justify-between gap-3 rounded-[0.8rem] px-3 py-2.5 text-left transition ${
                                  isSelected
                                    ? "bg-dema-sage text-brand-blue"
                                    : "text-brand-blue hover:bg-dema-sage/55"
                                }`}
                                role="option"
                                aria-selected={isSelected}
                              >
                                <span className="min-w-0">
                                  <span className="block text-sm font-semibold leading-tight">
                                    {pack.label} - {formatAssistantPrice(pack.amount)}
                                  </span>
                                </span>
                                {isSelected ? (
                                  <Check
                                    className="mt-0.5 h-4 w-4 shrink-0 text-dema-forest"
                                    aria-hidden="true"
                                  />
                                ) : null}
                              </button>
                            );
                          })}
                        </div>
                      ) : null}
                    </div>
                  </div>
                ) : null}

                <button
                  type="button"
                  onClick={() => {
                    if (selectedStructurationPack) void startCheckout(selectedStructurationPack);
                  }}
                  disabled={!selectedStructurationPack || isStartingCheckout}
                  className="mt-4 inline-flex w-full items-center justify-center rounded-full border border-dema-forest/20 bg-dema-sage/55 px-5 py-2.5 text-sm font-medium text-dema-forest transition hover:border-dema-forest/30 hover:bg-dema-sage disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isStartingCheckout ? "Ouverture..." : "Valider"}
                </button>
                {checkoutError ? (
                  <p className="mt-3 text-sm leading-relaxed text-dema-forest">
                    {checkoutError}
                  </p>
                ) : null}
              </article>
            </div>
          </div>

          <div className="mt-14 md:mt-20">
            <h2 className="text-3xl font-semibold tracking-tight text-brand-blue md:text-4xl">
              On répond aux questions fréquentes
            </h2>
            <div className="mt-6 divide-y divide-dema-line/70 rounded-[1rem] border border-dema-line/70 bg-dema-paper">
              {faqItems.map((item, index) => {
                const isOpen = openFaqIndex === index;
                const answerId = `assistant-faq-answer-${index}`;

                return (
                  <div key={item.question}>
                    <button
                      type="button"
                      onClick={() => setOpenFaqIndex(isOpen ? -1 : index)}
                      className="flex w-full items-center justify-between gap-4 px-4 py-5 text-left transition hover:bg-dema-sage/35 md:px-5"
                      aria-expanded={isOpen}
                      aria-controls={answerId}
                    >
                      <span className="text-sm font-semibold leading-snug text-brand-blue md:text-base">
                        {index + 1}. {item.question}
                      </span>
                      <ChevronDown
                        className={`h-4 w-4 shrink-0 text-dema-forest transition ${
                          isOpen ? "rotate-180" : ""
                        }`}
                        aria-hidden="true"
                      />
                    </button>
                    {isOpen ? (
                      <div id={answerId} className="px-4 pb-5 md:px-5">
                        <p className="text-sm leading-relaxed text-dema-muted">
                          {item.answer}
                        </p>
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>

            <div className="mx-auto mt-14 max-w-4xl rounded-[1rem] border border-dema-line/70 bg-dema-paper px-5 py-12 text-center shadow-[0_18px_50px_rgba(23,35,29,0.04)] md:mt-20 md:px-12 md:py-16">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-dema-forest">
                Expérience
              </p>
              <h2 className="mx-auto mt-4 max-w-3xl text-3xl font-semibold tracking-tight text-brand-blue md:text-4xl">
                Plus de 200 dirigeants accompagnés.
              </h2>
              <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-dema-muted md:text-lg">
                Des dirigeants de TPE, cabinets, indépendants et petites équipes, dans différents
                secteurs, accompagnés pour structurer leur organisation et alléger leur quotidien.
              </p>
              <button
                type="button"
                onClick={() => setIsAuditModalOpen(true)}
                className="demaa-primary-button mx-auto mt-8 px-5 py-3"
              >
                Audit organisation gratuit
              </button>
            </div>
          </div>
        </div>
      </section>

      <SystemSetupModal
        isOpen={isAuditModalOpen}
        onClose={() => setIsAuditModalOpen(false)}
      />
    </>
  );
}
