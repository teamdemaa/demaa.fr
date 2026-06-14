"use client";

import Link from "next/link";
import { useState } from "react";
import { BadgeEuro, Blocks, Check, ChevronDown, FileCheck, Users } from "lucide-react";
import PrimaryMobileNav from "@/components/PrimaryMobileNav";

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

const structurationSignals = [
  {
    icon: FileCheck,
    title: "Vous répondez à des appels d’offres",
    description:
      "Si les documents, références, validations et responsabilités ne sont pas prêts, chaque réponse devient un sprint.",
  },
  {
    icon: Users,
    title: "Vous recrutez ou faites grandir l’équipe",
    description:
      "Sans cadre clair, chaque arrivée recrée du flou, des questions et de la dépendance.",
  },
  {
    icon: Blocks,
    title: "Vous gérez plusieurs sociétés ou activités",
    description:
      "Les doublons, oublis et validations croisées finissent par ralentir tout le monde.",
  },
  {
    icon: BadgeEuro,
    title: "Vous préparez une transmission ou une revente",
    description:
      "Une entreprise plus autonome, plus lisible et moins dépendante du dirigeant compte aussi dans la valorisation.",
  },
] as const;

const faqItems = [
  {
    question: "Est-ce que l’audit gratuit m’engage à acheter quelque chose ?",
    answer:
      "Non. L’audit gratuit ne vous engage à rien. Il sert à faire le point sur votre organisation si vous voulez commencer par clarifier les choses.",
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
] as const;

const em2aResults = [
  "36 jours/an gagnés côté comptabilité",
  "30 jours/an gagnés côté paie",
  "Jusqu’à 30 000 € de capacité récupérée/an",
] as const;

const em2aSteps = [
  "Audit complet des frictions, des relances et des points de blocage",
  "Reprise en main des demandes clients et de la collecte paie",
  "Mise en place d’un système opérationnel clair, centralisé et exploitable",
] as const;

const GOOGLE_AUDIT_BOOKING_URL = "https://calendar.app.google/E9WX9qfHxViWZ3uq8";

export default function AssistantsCatalogClient() {
  const [openFaqIndex, setOpenFaqIndex] = useState(0);

  return (
    <>
      <section className="ml-[calc(50%-50vw)] mr-[calc(50%-50vw)] w-screen bg-dema-cream px-4 pb-8 pt-5 text-center md:px-8 md:pb-10 md:pt-16">
        <div className="mx-auto max-w-6xl space-y-6 md:space-y-7">
          <PrimaryMobileNav activeTab="structurer" />

          <div className="mx-auto max-w-5xl demaa-fade-up">
            <h1 className="text-[clamp(3rem,14.5vw,3.36rem)] tracking-tight leading-[0.92] sm:text-[2.75rem] md:text-[3.75rem] lg:text-[4.5rem]">
              <span className="demaa-hero-title text-brand-blue/86">Organisation</span>
              <br />
              <span className="font-sans font-light not-italic text-brand-blue/44">
                & automatisation
              </span>
            </h1>
          </div>

        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 pb-24 md:px-8 md:pb-36">
        <div className="border-t border-dema-line/65 pt-14 md:pt-20">
          <div>
            <div className="max-w-3xl demaa-fade-up demaa-delay-1">
              <h2 className="text-2xl font-semibold tracking-tight text-brand-blue md:text-3xl">
                Quand l&apos;organisation devient indispensable
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-dema-muted md:text-base">
                Certains moments rendent l&apos;organisation indispensable. Pas parce
                que l&apos;entreprise va mal, mais parce qu&apos;elle repose encore trop
                sur le dirigeant.
              </p>
            </div>

            <div className="mx-auto mt-8 grid gap-4 md:grid-cols-2 md:gap-5 xl:grid-cols-4">
              {structurationSignals.map((signal, index) => (
                <div
                  key={signal.title}
                  className={`demaa-fade-up demaa-lift-soft rounded-[1rem] border border-dema-line/70 bg-dema-paper px-4 py-5 md:min-h-[14rem] md:px-5 ${index === 0 ? "demaa-delay-2" : index === 1 ? "demaa-delay-3" : index === 2 ? "demaa-delay-4" : "demaa-delay-5"}`}
                >
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-dema-sage/55 text-dema-forest">
                    <signal.icon className="demaa-icon-float h-4.5 w-4.5" aria-hidden="true" />
                  </span>
                  <h3 className="text-[1.05rem] font-medium leading-snug text-brand-blue md:text-[1.3rem]">
                    <span className="mt-4 block">
                      {signal.title}
                    </span>
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-dema-muted">
                    {signal.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-20 md:mt-28 demaa-fade-up demaa-delay-2">
            <h2 className="mb-6 text-2xl font-semibold tracking-tight text-brand-blue md:mb-8 md:text-3xl">
              Comment ça se passe concrètement ?
            </h2>
            <div className="mx-auto grid gap-4 md:max-w-5xl md:grid-cols-3 md:gap-5">
              {howItWorksSteps.map((step, index) => (
                <div
                  key={step.title}
                  className={`demaa-fade-up demaa-lift-soft rounded-[1rem] border border-dema-line/70 bg-dema-paper px-4 py-4 md:min-h-[11.5rem] md:px-5 md:py-5 ${index === 0 ? "demaa-delay-3" : index === 1 ? "demaa-delay-4" : "demaa-delay-5"}`}
                >
                  <div className="flex gap-3 md:flex-col">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-dema-sage/55 text-sm font-semibold text-dema-forest">
                      {index + 1}
                    </span>
                    <div>
                      <h3 className="text-[1.05rem] font-medium leading-snug text-brand-blue md:text-[1.3rem]">
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

          <div className="mt-20 md:mt-28 lg:-mx-[5.25rem] demaa-fade-up demaa-delay-3">
            <div className="grid gap-6 rounded-[1rem] border border-dema-line/70 bg-dema-paper px-4 py-6 shadow-[0_8px_22px_rgba(23,35,29,0.02)] md:grid-cols-[1.05fr_0.95fr] md:px-6 md:py-7">
              <div>
                <p className="inline-flex rounded-full bg-dema-forest/10 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-dema-forest">
                  Étude de cas EM2A
                </p>
                <h2 className="mt-4 text-[2.45rem] font-light leading-[1.02] tracking-tight text-brand-blue/44 md:text-[3.45rem]">
                  <span className="demaa-hero-title text-brand-blue/86">Deux mois</span>{" "}
                  rendus{" "}
                  <br className="md:hidden" /> à l&apos;équipe
                  <br className="hidden md:block" /> chaque année.
                </h2>
                <p className="mt-4 max-w-2xl text-sm leading-relaxed text-dema-muted md:text-base">
                  Chez EM2A, cabinet d&apos;expertise comptable, l&apos;équipe avançait
                  entre relances clients, collecte paie et suivis dispersés. Le système
                  a remis de l&apos;ordre dans les échanges et libéré du temps utile.
                </p>
              </div>

              <div className="rounded-[0.9rem] border border-dema-line/70 bg-dema-cream px-4 py-5 md:px-5">
                <p className="text-[1.05rem] font-medium text-brand-blue md:text-[1.3rem]">Résultats</p>
                <div className="mt-4 space-y-3">
                  {em2aResults.map((result) => (
                    <div key={result} className="flex gap-3">
                      <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-dema-forest" />
                      <p className="text-sm leading-relaxed text-dema-muted">{result}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-6 border-t border-dema-line/70 pt-5">
                  <p className="text-[1.05rem] font-medium text-brand-blue md:text-[1.3rem]">Méthode</p>
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

          <div id="pricing" className="mx-auto mt-20 max-w-[50.5rem] scroll-mt-24 md:mt-28">
            <div className="mx-auto max-w-3xl text-center">
              <h2 className="text-3xl font-semibold tracking-tight text-brand-blue md:text-4xl">
                Par où commencer ?
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-dema-muted md:text-base">
                Faites le point avec un audit offert ou lancez directement l&apos;organisation et l&apos;automatisation de votre activité.
              </p>
            </div>

            <div className="mt-6 grid gap-4">
              <article className="demaa-card mx-auto flex h-full w-full max-w-[32rem] flex-col rounded-[1.15rem] p-5 text-left">
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
                  <p className="text-sm leading-relaxed text-dema-muted">
                    Un échange pour comprendre vos tâches récurrentes, vos outils, vos documents,
                    vos blocages et les premières priorités à traiter.
                  </p>
                </div>
                <Link
                  href={GOOGLE_AUDIT_BOOKING_URL}
                  className="mt-6 inline-flex w-full items-center justify-center rounded-full border border-dema-forest/20 bg-dema-sage/55 px-5 py-2.5 text-sm font-medium text-dema-forest transition hover:border-dema-forest/30 hover:bg-dema-sage disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Demander l&apos;audit gratuit
                </Link>
              </article>
            </div>
          </div>

          <div className="mt-20 md:mt-28">
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

            <div className="mx-auto mt-20 max-w-4xl rounded-[1rem] border border-dema-line/70 bg-dema-paper px-5 py-12 text-center shadow-[0_18px_50px_rgba(23,35,29,0.04)] md:mt-28 md:px-12 md:py-16">
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
              <Link
                href={GOOGLE_AUDIT_BOOKING_URL}
                className="demaa-primary-button mx-auto mt-8 px-5 py-3"
              >
                Audit organisation gratuit
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
