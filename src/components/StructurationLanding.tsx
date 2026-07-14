"use client";

import Image from "next/image";
import {
  BadgeEuro,
  Blocks,
  Check,
  ChevronDown,
  FileCheck,
  FolderKanban,
  Gauge,
  Target,
  Users,
  Workflow,
} from "lucide-react";
import { useState } from "react";
import { ORGANISATION_AUDIT_BOOKING_URL } from "@/lib/organisation-audit";

type DiscoveryAnswer = "yes" | "no" | null;

const responseContent = {
  yes: {
    title: "Bravo. Votre entreprise peut déjà respirer sans vous.",
  },
  no: {
    title: "C’est le signal qu’il faut commencer à structurer maintenant.",
  },
} as const;

const structurationSignals = [
  {
    icon: BadgeEuro,
    title: "Vous préparez une transmission ou une revente",
    description:
      "Une entreprise autonome, lisible et moins dépendante de son dirigeant est plus facile à transmettre et à mieux valoriser.",
  },
  {
    icon: Users,
    title: "Vous recrutez ou faites grandir votre équipe",
    description:
      "Sans cadre clair, chaque arrivée recrée du flou, des questions et de la dépendance au dirigeant.",
  },
  {
    icon: FileCheck,
    title: "Vous souhaitez répondre à des appels d’offres",
    description:
      "Si les documents, les références, les validations et les responsabilités ne sont pas prêts, chaque réponse devient un sprint.",
  },
  {
    icon: Blocks,
    title: "Vous gérez plusieurs sociétés ou activités",
    description:
      "Les doublons, les oublis et les validations croisées finissent par ralentir tout le monde.",
  },
] as const;

const serviceFlowSteps = [
  {
    step: "01",
    title: "Diagnostic de votre organisation",
    description:
      "On analyse les tâches répétitives, les outils, les documents, les échanges, les validations et les points de blocage.",
  },
  {
    step: "02",
    title: "Priorisation des sujets",
    description:
      "On choisit ce qui doit être structuré en premier pour redonner du cadre, du suivi et de l’autonomie.",
  },
  {
    step: "03",
    title: "Accompagnement sur 3 mois",
    description:
      "On met en place les solutions avec un suivi toutes les deux semaines, comme bras droit du dirigeant.",
  },
] as const;

const outcomes = [
  "Vous arrêtez de tout porter seul.",
  "Les sujets avancent sans revenir sur votre bureau à chaque étape.",
  "Votre équipe sait où trouver l’information et ce qu’elle peut décider.",
  "Vous gardez de la visibilité sans y passer votre journée.",
] as const;

const deliverables = [
  { icon: Users, label: "Des responsabilités plus claires" },
  { icon: Workflow, label: "Des process simples et accessibles" },
  { icon: FolderKanban, label: "Des documents centralisés" },
  { icon: Target, label: "Des outils mieux organisés" },
  { icon: Gauge, label: "Des tableaux de pilotage utiles" },
  { icon: Check, label: "Des routines de suivi" },
] as const;

const em2aResults = [
  "36 jours par an gagnés côté comptabilité",
  "30 jours par an gagnés côté paie",
  "Jusqu’à 30 000 € de capacité récupérée par an",
] as const;

const em2aSteps = [
  "Diagnostic des frictions, des relances et des points de blocage",
  "Reprise en main des demandes clients et de la collecte paie",
  "Mise en place d’un système opérationnel clair et centralisé",
] as const;

const faqItems = [
  {
    question: "Est-ce que le diagnostic offert m’engage à acheter quelque chose ?",
    answer:
      "Non. Le diagnostic sert à comprendre votre organisation et à identifier les priorités. Vous décidez ensuite librement si vous souhaitez être accompagné.",
  },
  {
    question: "Est-ce que nous devons changer tous nos outils ?",
    answer:
      "Non. Nous cherchons d’abord à mieux organiser ce que vous utilisez déjà. Un nouvel outil n’est proposé que lorsqu’il répond à un besoin réel.",
  },
  {
    question: "Est-ce adapté à une petite entreprise ?",
    answer:
      "Oui. L’accompagnement est pensé pour les dirigeants de TPE, les cabinets, les indépendants en croissance et les petites équipes.",
  },
  {
    question: "Qu’est-ce que je récupère à la fin ?",
    answer:
      "Vous repartez avec une organisation structurée : des process, des responsabilités, des outils, des documents et des routines adaptés à votre entreprise.",
  },
  {
    question: "Combien de temps dure l’accompagnement ?",
    answer:
      "L’accompagnement se déroule sur trois mois, avec un suivi régulier pour mettre en place les changements progressivement et faciliter leur adoption.",
  },
] as const;

export function StructurationLanding() {
  const [answer, setAnswer] = useState<DiscoveryAnswer>(null);
  const selectedResponse = answer ? responseContent[answer] : null;

  return (
    <>
      <section
        className={`flex items-center px-4 text-center transition-[min-height,padding] duration-1000 md:px-8 ${
          selectedResponse
            ? "min-h-0 pb-4 pt-8 md:pb-6 md:pt-10"
            : "min-h-[calc(100svh-4.5rem)] py-12 md:py-18"
        }`}
      >
        <div
          className={`mx-auto max-w-6xl transition-transform duration-1000 ${
            selectedResponse
              ? "translate-y-0"
              : "-translate-y-[54%] min-[26rem]:-translate-y-[38%] min-[30rem]:-translate-y-[32%] min-[35rem]:-translate-y-[24%] sm:-translate-y-[20%] md:translate-y-0"
          }`}
        >
          <div className="mx-auto max-w-5xl demaa-fade-up">
            <h1 className="text-[clamp(2.5rem,9vw,5rem)] leading-[0.98] tracking-tight">
              <span className="font-sans font-light not-italic text-brand-blue/42">
                Est-ce que votre entreprise peut tourner
              </span>{" "}
              <span className="demaa-hero-title text-brand-blue/88">
                3 mois sans vous ?
              </span>
            </h1>
          </div>

          <div
            className="mt-8 flex flex-row items-center justify-center gap-3 demaa-fade-up demaa-delay-1"
            role="group"
            aria-label="Votre réponse"
          >
            <button
              type="button"
              aria-pressed={answer === "yes"}
              onClick={() => setAnswer("yes")}
              className={`inline-flex min-h-12 min-w-0 flex-1 items-center justify-center rounded-full border px-4 text-sm font-medium transition sm:flex-none sm:px-7 sm:text-base ${
                answer === "yes"
                  ? "border-dema-forest bg-dema-forest text-dema-paper shadow-[0_10px_24px_rgba(49,95,70,0.18)]"
                  : "border-dema-forest/45 bg-dema-paper text-dema-forest hover:border-dema-forest"
              }`}
            >
              Oui, à peu près
            </button>
            <button
              type="button"
              aria-pressed={answer === "no"}
              onClick={() => setAnswer("no")}
              className={`inline-flex min-h-12 min-w-0 flex-1 items-center justify-center rounded-full border px-4 text-sm font-medium transition sm:flex-none sm:px-7 sm:text-base ${
                answer === "no"
                  ? "border-dema-forest bg-dema-forest text-dema-paper shadow-[0_10px_24px_rgba(49,95,70,0.18)]"
                  : "border-dema-forest/45 bg-dema-paper text-dema-forest hover:border-dema-forest"
              }`}
            >
              Non, pas encore
            </button>
          </div>

          <div
            className={`mx-auto grid max-w-3xl transition-[grid-template-rows,opacity,margin] duration-700 ${
              selectedResponse
                ? "mt-7 grid-rows-[1fr] opacity-100"
                : "mt-0 grid-rows-[0fr] opacity-0"
            }`}
            aria-live="polite"
          >
            <div className="overflow-hidden">
              {selectedResponse ? (
                <div>
                  <p className="text-base font-normal text-brand-blue">
                    {selectedResponse.title}
                  </p>
                  <a
                    href="#methode"
                    className="mt-4 inline-flex text-sm font-semibold text-dema-forest transition hover:text-brand-blue sm:text-base"
                  >
                    Voir comment nous vous aidons
                  </a>
                  <div className="mt-2 flex justify-center" aria-hidden="true">
                    <Image
                      src="/images/home/hand-arrow.png"
                      alt=""
                      width={112}
                      height={70}
                      className="demaa-arrow-nudge h-12 w-28 object-contain"
                    />
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </section>

      {selectedResponse ? (
      <section className="mx-auto w-full max-w-6xl px-4 pb-24 demaa-fade-up md:px-8 md:pb-36">
        <div className="border-t border-dema-line/80 pt-10 md:pt-14">
          <div className="max-w-4xl">
            <p className="text-[13px] font-semibold uppercase tracking-[0.16em] text-dema-forest md:text-[15px]">
              Organiser pour mieux avancer
            </p>
            <h2 className="mt-4 text-3xl font-normal leading-tight tracking-tight text-brand-blue md:text-[2.8rem]">
              Votre entreprise doit pouvoir avancer, même lorsque vous n’êtes pas là.
            </h2>
            <p className="mt-5 max-w-3xl text-base leading-relaxed text-dema-muted md:text-lg">
              L’objectif n’est pas d’ajouter des procédures partout, mais de mettre en place une organisation
              simple, claire et utilisable par toute l’équipe.
            </p>
          </div>

          <div className="mt-16 md:mt-24">
            <div className="max-w-3xl">
              <h2 className="text-2xl font-semibold tracking-tight text-brand-blue md:text-3xl">
                Quand l’organisation devient indispensable
              </h2>
            </div>

            <div className="mt-8 grid gap-4 md:grid-cols-2 md:gap-5 xl:grid-cols-4">
              {structurationSignals.map((signal, index) => (
                <article
                  key={signal.title}
                  className={`demaa-lift-soft rounded-[1rem] border border-dema-line/70 bg-dema-paper px-5 py-6 md:min-h-[16rem] ${
                    index === 0 ? "shadow-[0_14px_36px_rgba(49,95,70,0.06)]" : ""
                  }`}
                >
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-dema-sage/70 text-dema-forest">
                    <signal.icon className="demaa-icon-float h-4.5 w-4.5" aria-hidden="true" />
                  </span>
                  <p className="mt-5 text-[11px] font-semibold uppercase tracking-[0.16em] text-dema-forest/70">
                    0{index + 1}
                  </p>
                  <h3 className="mt-2 text-[1.1rem] font-medium leading-snug text-brand-blue md:text-[1.25rem]">
                    {signal.title}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-dema-muted">
                    {signal.description}
                  </p>
                </article>
              ))}
            </div>
          </div>

          <div id="methode" className="scroll-mt-28 pt-20 md:pt-28">
            <div className="max-w-3xl">
              <p className="text-[13px] font-semibold uppercase tracking-[0.16em] text-dema-forest md:text-[15px]">
                Comment ça marche
              </p>
              <h2 className="mt-4 text-3xl font-normal tracking-tight text-brand-blue md:text-[2.65rem]">
                On diagnostique.
                <br />
                On structure.
                <br />
                On vous aide à reprendre la main.
              </h2>
            </div>

            <div className="mt-10 grid gap-8 md:grid-cols-3 md:gap-10">
              {serviceFlowSteps.map((item) => (
                <article key={item.step} className="space-y-3">
                  <p className="text-[2.2rem] font-semibold uppercase leading-none tracking-[0.18em] text-dema-forest/55 md:text-[2.5rem]">
                    {item.step}
                  </p>
                  <h3 className="text-[1.22rem] font-medium leading-snug text-brand-blue">
                    {item.title}
                  </h3>
                  <p className="max-w-sm text-sm leading-relaxed text-dema-muted md:text-[0.98rem]">
                    {item.description}
                  </p>
                </article>
              ))}
            </div>
          </div>

          <div className="mt-20 rounded-[1.5rem] bg-dema-sage/65 px-6 py-12 md:mt-28 md:px-10 md:py-16">
            <div className="grid gap-10 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] md:items-start">
              <div>
                <p className="text-[13px] font-semibold uppercase tracking-[0.16em] text-dema-forest md:text-[15px]">
                  Ce que ça change
                </p>
                <h2 className="mt-4 text-3xl font-normal tracking-tight text-brand-blue md:text-[2.6rem]">
                  Moins de charge mentale.
                  <br />
                  Plus d’autonomie.
                </h2>
              </div>
              <div className="space-y-4">
                {outcomes.map((outcome) => (
                  <p
                    key={outcome}
                    className="border-b border-dema-line/90 pb-4 text-[1.05rem] leading-relaxed text-brand-blue/86"
                  >
                    {outcome}
                  </p>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-20 md:mt-28">
            <div className="max-w-3xl">
              <p className="text-[13px] font-semibold uppercase tracking-[0.16em] text-dema-forest md:text-[15px]">
                Ce que nous mettons en place
              </p>
              <h2 className="mt-4 text-3xl font-normal tracking-tight text-brand-blue md:text-[2.6rem]">
                Une organisation concrète, installée et utilisable au quotidien.
              </h2>
            </div>
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {deliverables.map((deliverable) => (
                <article
                  key={deliverable.label}
                  className="rounded-[1rem] border border-dema-line/70 bg-dema-paper px-5 py-6"
                >
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-dema-sage text-dema-forest">
                    <deliverable.icon className="h-4.5 w-4.5" aria-hidden="true" />
                  </span>
                  <p className="mt-4 text-[1.05rem] font-medium leading-snug text-brand-blue">
                    {deliverable.label}
                  </p>
                </article>
              ))}
            </div>
          </div>

          <div className="mt-20 md:mt-28 lg:-mx-[5.25rem]">
            <div className="grid gap-8 rounded-[1.25rem] border border-dema-line/70 bg-dema-paper px-5 py-8 shadow-[0_8px_22px_rgba(23,35,29,0.025)] md:grid-cols-[1.05fr_0.95fr] md:px-8 md:py-9">
              <div>
                <p className="inline-flex rounded-full bg-dema-forest/10 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-dema-forest">
                  Étude de cas EM2A
                </p>
                <h2 className="mt-5 text-[2.6rem] font-light leading-[1.02] tracking-tight text-brand-blue/44 md:text-[3.6rem]">
                  <span className="demaa-hero-title text-brand-blue/86">Deux mois</span>{" "}
                  rendus à l’équipe chaque année.
                </h2>
                <p className="mt-5 max-w-2xl text-sm leading-relaxed text-dema-muted md:text-base">
                  Chez EM2A, cabinet d’expertise comptable, l’équipe avançait entre les relances clients,
                  la collecte des éléments de paie et des suivis dispersés. Le système a remis de l’ordre
                  dans les échanges et libéré du temps utile.
                </p>
              </div>

              <div className="rounded-[1rem] border border-dema-line/70 bg-dema-cream px-5 py-6">
                <p className="text-[1.2rem] font-medium text-brand-blue">Résultats</p>
                <div className="mt-4 space-y-3">
                  {em2aResults.map((result) => (
                    <div key={result} className="flex gap-3">
                      <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-dema-forest" />
                      <p className="text-sm leading-relaxed text-dema-muted">{result}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-6 border-t border-dema-line/80 pt-5">
                  <p className="text-[1.2rem] font-medium text-brand-blue">Méthode</p>
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

          <div className="mx-auto mt-10 max-w-4xl rounded-[1.5rem] bg-dema-forest px-7 py-11 text-center text-dema-paper md:mt-14 md:px-14 md:py-14">
            <blockquote className="demaa-section-title text-[1.8rem] leading-tight tracking-tight text-dema-paper md:text-[2.4rem]">
              “Avant, tout passait par moi. Depuis qu’on a mis en place une vraie organisation,
              chacun sait ce qu’il peut décider. Je respire enfin.”
            </blockquote>
            <p className="mt-5 text-sm font-medium tracking-[0.01em] text-dema-paper/72">
              D.K, dirigeant d’une entreprise de nettoyage industriel
            </p>
          </div>

          <div className="mt-20 max-w-4xl md:mt-28">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-dema-forest">
              Expérience
            </p>
            <h2 className="mt-4 max-w-3xl text-3xl font-semibold tracking-tight text-brand-blue md:text-4xl">
              Plus de 200 dirigeants accompagnés.
            </h2>
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-dema-muted md:text-lg">
              Des dirigeants de TPE, des cabinets, des indépendants et des petites équipes accompagnés
              pour structurer leur organisation et alléger leur quotidien.
            </p>
          </div>

          <section id="diagnostic" className="scroll-mt-28 pt-20 md:pt-28">
            <div className="max-w-4xl rounded-[1.5rem] bg-dema-sage/65 px-6 py-12 text-left text-brand-blue md:px-14 md:py-16">
              <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-dema-forest">
                Par où commencer ?
              </p>
              <h2 className="mt-4 max-w-3xl text-3xl font-normal tracking-tight md:text-[2.75rem]">
                Commencez par un diagnostic offert.
              </h2>
              <p className="mt-5 max-w-2xl text-base leading-relaxed text-dema-muted">
                Nous faisons le point sur votre organisation, vos outils, vos documents, vos tâches
                récurrentes et les sujets qui vous ralentissent. Vous repartez avec un regard extérieur
                et des premières priorités concrètes, sans engagement.
              </p>
              <a
                href={ORGANISATION_AUDIT_BOOKING_URL}
                target="_blank"
                rel="noreferrer"
                className="demaa-primary-button mt-8 min-h-12 px-6"
              >
                Demander mon diagnostic organisation
              </a>
            </div>
          </section>

          <div className="mt-20 md:mt-28">
            <div className="max-w-3xl">
              <p className="text-[13px] font-semibold uppercase tracking-[0.16em] text-dema-forest md:text-[15px]">
                Questions fréquentes
              </p>
              <h2 className="mt-4 text-3xl font-normal tracking-tight text-brand-blue md:text-[2.6rem]">
                Ce que vous voulez savoir
              </h2>
            </div>
            <div className="mx-auto mt-8 max-w-4xl space-y-3">
              {faqItems.map((item) => (
                <details key={item.question} className="demaa-accordion px-5 py-4">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4">
                    <span className="text-base font-medium leading-snug text-brand-blue">
                      {item.question}
                    </span>
                    <ChevronDown
                      className="demaa-accordion-chevron h-4 w-4 shrink-0 text-dema-muted transition-transform"
                      aria-hidden="true"
                    />
                  </summary>
                  <p className="demaa-accordion-content mt-3 max-w-2xl pr-4 text-sm leading-relaxed text-dema-muted md:text-[0.98rem]">
                    {item.answer}
                  </p>
                </details>
              ))}
            </div>
          </div>
        </div>
      </section>
      ) : null}
    </>
  );
}
