"use client";

import Link from "next/link";
import { useState } from "react";
import {
  BadgeEuro,
  Blocks,
  Check,
  ChevronDown,
  CircleDollarSign,
  Clock3,
  FileCheck,
  FolderKanban,
  Mail,
  Users,
} from "lucide-react";

type ServiceExpandedContentProps = {
  serviceSlug: string;
  variant?: "modal" | "page";
};

const GOOGLE_AUDIT_BOOKING_URL = "https://calendar.app.google/E9WX9qfHxViWZ3uq8";

const organisationSignals = [
  {
    icon: FileCheck,
    title: "Appels d'offres et dossiers sensibles",
    description:
      "Quand les documents, validations et responsabilités ne sont pas cadrés, chaque réponse devient un sprint.",
  },
  {
    icon: Users,
    title: "Croissance d'équipe",
    description:
      "Sans cadre clair, chaque nouvelle arrivée recrée du flou, des questions et de la dépendance au dirigeant.",
  },
  {
    icon: Blocks,
    title: "Plusieurs sociétés ou flux",
    description:
      "Les doublons, oublis et validations croisées finissent par ralentir tout le monde.",
  },
  {
    icon: BadgeEuro,
    title: "Transmission ou revente",
    description:
      "Une entreprise plus autonome et plus lisible est aussi plus facile à valoriser.",
  },
] as const;

const organisationSteps = [
  {
    title: "On analyse votre fonctionnement",
    description:
      "On identifie les tâches répétitives, les outils, les documents, les validations et les points de friction.",
  },
  {
    title: "On priorise les process utiles",
    description:
      "On choisit les process à clarifier, les tableaux à créer et les automatisations qui auront un vrai impact.",
  },
  {
    title: "On met en place le système",
    description:
      "On configure, on teste sur vos cas réels, puis on vous transmet un système clair et exploitable.",
  },
] as const;

const organisationResults = [
  "36 jours/an gagnés côté comptabilité",
  "30 jours/an gagnés côté paie",
  "Jusqu'à 30 000 € de capacité récupérée/an",
] as const;

const organisationFaq = [
  {
    question: "Quelles tâches pouvez-vous organiser ou automatiser en priorité ?",
    answer:
      "En général, on commence par les relances, les documents récurrents, les suivis clients, les tableaux, les validations internes et les routines administratives qui consomment du temps chaque semaine.",
  },
  {
    question: "Est-ce adapté si mon activité est encore très manuelle ?",
    answer:
      "Oui. L'objectif n'est pas d'automatiser trop vite, mais d'abord de clarifier ce qui doit être structuré, puis de n'automatiser que ce qui se répète vraiment.",
  },
  {
    question: "Est-ce que vous travaillez avec mes outils actuels ?",
    answer:
      "Oui, on part d'abord de votre réalité terrain. On regarde ce qui peut être amélioré avec vos outils actuels avant de recommander un changement.",
  },
  {
    question: "L'audit gratuit m'engage-t-il à acheter quelque chose ?",
    answer:
      "Non. L'audit sert à clarifier vos blocages et vos priorités. Vous repartez avec une lecture plus nette, même si vous ne lancez pas la mission ensuite.",
  },
] as const;

const assistantHighlights = [
  "Organisation, structuration, suivi et bases administratives travaillés en amont.",
  "Montée en compétence mieux cadrée pour éviter de tout porter seul.",
  "Intégration plus fluide dans votre activité et vos outils.",
] as const;

const assistantTimeline = [
  {
    step: "Étape 1",
    title: "1 mois de formation à temps plein",
    description:
      "La formation pose les bases de l'organisation, de la structuration et des routines administratives utiles en entreprise.",
  },
  {
    step: "Étape 2",
    title: "12 mois d'alternance",
    description:
      "L'assistante est en entreprise 4 jours par semaine pour reprendre progressivement l'administratif du quotidien.",
  },
] as const;

const assistantResponsibilities = [
  {
    icon: FolderKanban,
    title: "Devis, factures, documents",
    description: "Préparer, trier, suivre et classer les documents du quotidien.",
  },
  {
    icon: Mail,
    title: "Emails, relances, suivi",
    description: "Gérer les échanges, relancer et garder le fil dans les dossiers.",
  },
  {
    icon: CircleDollarSign,
    title: "Tableaux, CRM, coordination",
    description: "Mettre à jour les tableaux et suivre les dossiers utiles à l'équipe.",
  },
  {
    icon: Clock3,
    title: "Organisation & outils",
    description: "Structurer les dossiers et fluidifier le travail administratif.",
  },
] as const;

const assistantComparison = [
  {
    title: "Assistante polyvalente salariée",
    amount: "2 579,56 € / mois",
    description: "Repère de coût employeur pour 1 700 € net / mois.",
    emphasis: false,
  },
  {
    title: "Avec Demaa (POEI + alternance)",
    amount: "Jusqu'à 1 450,35 € / mois",
    description: "Aides déduites, selon l'âge et le profil recruté.",
    emphasis: true,
  },
] as const;

const assistantFaq = [
  {
    question: "Quelles tâches l'assistant(e) peut-il ou elle reprendre concrètement ?",
    answer:
      "Les tâches administratives récurrentes : devis, factures, classement documentaire, relances, emails, suivis, tableaux, CRM et coordination du quotidien.",
  },
  {
    question: "À partir de quand la personne peut-elle être opérationnelle dans l'entreprise ?",
    answer:
      "Le parcours est pensé pour qu'une base solide soit déjà posée avant l'arrivée en entreprise, puis que l'autonomie monte progressivement pendant l'alternance.",
  },
  {
    question: "Pourquoi ce format est-il plus accessible qu'une embauche classique ?",
    answer:
      "Le coût est allégé par le cadre du dispositif et les aides mobilisables, tout en sécurisant la montée en compétence sur les bases administratives utiles.",
  },
  {
    question: "Combien de temps dois-je prévoir de mon côté pour l'intégration ?",
    answer:
      "Il faut prévoir un cadrage au départ, puis un suivi régulier mais raisonnable. L'objectif est justement d'éviter que toute la transmission repose sur vous seul.",
  },
] as const;

export default function ServiceExpandedContent({
  serviceSlug,
  variant = "modal",
}: ServiceExpandedContentProps) {
  if (serviceSlug === "organisation-automatisation") {
    return <OrganisationExpandedContent variant={variant} />;
  }

  if (serviceSlug === "assistant-polyvalent") {
    return <AssistantExpandedContent variant={variant} />;
  }

  return null;
}

function OrganisationExpandedContent({
  variant,
}: {
  variant: "modal" | "page";
}) {
  const sectionGap = variant === "modal" ? "space-y-8" : "space-y-8";
  const sectionClass =
    variant === "modal"
      ? ""
      : "rounded-[1.15rem] border border-dema-line bg-dema-paper p-5";

  return (
    <div className={sectionGap}>
      <section className={sectionClass}>
        <div className="flex flex-col gap-4">
          <div className="max-w-2xl">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-dema-forest">
              Récap de l&apos;offre
            </p>
            <h3 className="mt-2 text-xl font-semibold tracking-tight text-brand-blue md:text-2xl">
              Quand structurer devient prioritaire
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-dema-muted">
              Cette offre devient pertinente quand l&apos;activité repose encore trop sur le
              dirigeant, que les validations se perdent et que les routines freinent
              l&apos;exécution.
            </p>
          </div>
          <Link href={GOOGLE_AUDIT_BOOKING_URL} className="demaa-primary-button w-fit">
            Audit organisation gratuit
          </Link>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {organisationSignals.map((item) => (
            <article
              key={item.title}
              className="rounded-[0.95rem] border border-dema-line/70 bg-dema-cream/60 px-4 py-4 sm:rounded-[1rem]"
            >
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-dema-sage/55 text-dema-forest">
                <item.icon className="h-4.5 w-4.5" aria-hidden="true" />
              </span>
              <h4 className="mt-3 text-base font-semibold leading-snug text-brand-blue">
                {item.title}
              </h4>
              <p className="mt-2 text-sm leading-relaxed text-dema-muted">
                {item.description}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className={sectionClass}>
        <h3 className="text-xl font-semibold tracking-tight text-brand-blue md:text-2xl">
          Comment ça se passe concrètement
        </h3>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {organisationSteps.map((step, index) => (
            <article
              key={step.title}
              className="rounded-[0.95rem] border border-dema-line/70 bg-dema-paper/95 px-4 py-4 sm:rounded-[1rem]"
            >
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-dema-sage/55 text-sm font-semibold text-dema-forest">
                {index + 1}
              </span>
              <h4 className="mt-3 text-base font-semibold leading-snug text-brand-blue">
                {step.title}
              </h4>
              <p className="mt-2 text-sm leading-relaxed text-dema-muted">
                {step.description}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className={sectionClass}>
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-dema-forest">
          Repères de résultat
        </p>
        <h3 className="mt-2 text-xl font-semibold tracking-tight text-brand-blue md:text-2xl">
          Ce type de mission vise à libérer du temps utile
        </h3>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 md:grid-cols-3">
          {organisationResults.map((result) => (
            <div
              key={result}
              className="rounded-[0.95rem] border border-dema-line/70 bg-dema-sage/35 px-4 py-4 text-sm font-medium text-brand-blue sm:rounded-[1rem]"
            >
              {result}
            </div>
          ))}
        </div>
      </section>

      <FaqSection title="Questions fréquentes" items={organisationFaq} />
    </div>
  );
}

function AssistantExpandedContent({
  variant,
}: {
  variant: "modal" | "page";
}) {
  const sectionGap = variant === "modal" ? "space-y-5 sm:space-y-6" : "space-y-8";
  const sectionClass =
    variant === "modal"
      ? "rounded-[1.05rem] border border-dema-line bg-dema-paper p-4 sm:rounded-[1.15rem] sm:p-5"
      : "rounded-[1.15rem] border border-dema-line bg-dema-paper p-5";

  return (
    <div className={sectionGap}>
      <section className={sectionClass}>
        <div className="max-w-3xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-dema-forest">
            Récap de l&apos;offre
          </p>
          <h3 className="mt-2 text-xl font-semibold tracking-tight text-brand-blue md:text-2xl">
            Un parcours pensé pour déléguer sans tout construire seul
          </h3>
          <p className="mt-3 text-sm leading-relaxed text-dema-muted">
            L&apos;idée n&apos;est pas seulement de recruter un renfort. Le parcours prépare
            d&apos;abord les bases, puis l&apos;alternance permet une reprise progressive de
            l&apos;administratif dans l&apos;entreprise.
          </p>
        </div>
        <div className="mt-5 grid gap-3">
          {assistantHighlights.map((item) => (
            <div key={item} className="flex gap-3">
              <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-dema-sage text-dema-forest">
                <Check className="h-3.5 w-3.5" aria-hidden="true" />
              </span>
              <p className="text-sm leading-relaxed text-dema-muted">{item}</p>
            </div>
          ))}
        </div>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          {assistantTimeline.map((item) => (
            <article
              key={item.step}
              className="rounded-[0.95rem] border border-dema-line/70 bg-dema-sage/35 px-4 py-4 sm:rounded-[1rem]"
            >
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-dema-forest/80">
                {item.step}
              </p>
              <h4 className="mt-2 text-base font-semibold leading-snug text-brand-blue">
                {item.title}
              </h4>
              <p className="mt-2 text-sm leading-relaxed text-dema-muted">
                {item.description}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className={sectionClass}>
        <h3 className="text-xl font-semibold tracking-tight text-brand-blue md:text-2xl">
          Ce qui peut être repris
        </h3>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          {assistantResponsibilities.map((item) => (
            <article
              key={item.title}
              className="rounded-[0.95rem] border border-dema-line/70 bg-dema-paper px-4 py-4 sm:rounded-[1rem]"
            >
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-dema-sage/55 text-dema-forest">
                <item.icon className="h-4.5 w-4.5" aria-hidden="true" />
              </span>
              <h4 className="mt-3 text-base font-semibold leading-snug text-brand-blue">
                {item.title}
              </h4>
              <p className="mt-2 text-sm leading-relaxed text-dema-muted">
                {item.description}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className={sectionClass}>
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-dema-forest">
          Repère de coût
        </p>
        <h3 className="mt-2 text-xl font-semibold tracking-tight text-brand-blue md:text-2xl">
          Un coût plus accessible qu&apos;une embauche classique
        </h3>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          {assistantComparison.map((item) => (
            <article
              key={item.title}
              className={`rounded-[0.95rem] border px-4 py-4 sm:rounded-[1rem] ${
                item.emphasis
                  ? "border-dema-forest/15 bg-dema-sage/35"
                  : "border-dema-line/70 bg-dema-paper"
              }`}
            >
              <p className="text-sm font-semibold text-brand-blue">{item.title}</p>
              <p
                className={`mt-2 text-2xl font-semibold tracking-tight ${
                  item.emphasis ? "text-dema-forest" : "text-brand-blue"
                }`}
              >
                {item.amount}
              </p>
              <p className="mt-2 text-sm leading-relaxed text-dema-muted">
                {item.description}
              </p>
            </article>
          ))}
        </div>
      </section>

      <FaqSection title="Questions fréquentes" items={assistantFaq} />
    </div>
  );
}

function FaqSection({
  title,
  items,
}: {
  title: string;
  items: readonly {
    question: string;
    answer: string;
  }[];
}) {
  const [openIndex, setOpenIndex] = useState(0);
  const sectionClass =
    "rounded-[1.05rem] border border-dema-line bg-dema-paper p-4 sm:rounded-[1.15rem] sm:p-5";

  return (
    <section className={sectionClass}>
      <h3 className="text-xl font-semibold tracking-tight text-brand-blue md:text-2xl">
        {title}
      </h3>
      <div className="mt-5 divide-y divide-dema-line/70 rounded-[1rem] border border-dema-line/70 bg-dema-paper">
        {items.map((item, index) => {
          const isOpen = openIndex === index;
          const answerId = `service-faq-answer-${title}-${index}`;

          return (
            <div key={item.question}>
              <button
                type="button"
                onClick={() => setOpenIndex(isOpen ? -1 : index)}
                className="flex w-full items-center justify-between gap-4 px-4 py-4 text-left transition hover:bg-dema-sage/35 sm:px-5"
                aria-expanded={isOpen}
                aria-controls={answerId}
              >
                <span className="text-sm font-semibold leading-snug text-brand-blue">
                  {item.question}
                </span>
                <ChevronDown
                  className={`h-4 w-4 shrink-0 text-dema-forest transition ${
                    isOpen ? "rotate-180" : ""
                  }`}
                  aria-hidden="true"
                />
              </button>
              {isOpen ? (
                <div id={answerId} className="px-4 pb-4 sm:px-5">
                  <p className="text-sm leading-relaxed text-dema-muted">{item.answer}</p>
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </section>
  );
}
