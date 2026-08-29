import {
  CalendarRange,
  ChevronDown,
  ClipboardCheck,
  FileOutput,
  ListChecks,
  MessageSquareText,
  RefreshCcw,
  UsersRound,
} from "lucide-react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import OrganiserProcessMap from "@/components/OrganiserProcessMap";
import OrganiserProjectDiscussionButton from "@/components/OrganiserProjectDiscussionButton";
import StructureNewsletterBlock from "@/components/StructureNewsletterBlock";
import {
  getAllAcademyContent,
  type AcademyContentDefinition,
} from "@/lib/academy-course-content";
import { satoshiHeroTitleClassName } from "@/lib/marketing-hero-style";

// Conserved as an unpublished draft for a possible future accompanied setup page.
// The public /organiser route intentionally renders the process directory instead.
const diagnosticButtonClassName =
  "inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-dema-forest px-7 text-sm font-semibold text-white transition hover:bg-[#284f3a] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dema-forest/35 focus-visible:ring-offset-2";

const situations = [
  {
    title: "Centraliser les demandes",
    description: "Réunir les demandes entrantes pour les traiter sans perte d’information.",
    Icon: MessageSquareText,
  },
  {
    title: "Organiser les plannings",
    description: "Rendre les priorités, les disponibilités et les prochaines étapes visibles.",
    Icon: CalendarRange,
  },
  {
    title: "Clarifier qui fait quoi",
    description: "Définir les rôles et les responsabilités pour éviter les doubles traitements.",
    Icon: UsersRound,
  },
  {
    title: "Réduire les relances",
    description: "Faire avancer le suivi sans dépendre des rappels du dirigeant.",
    Icon: RefreshCcw,
  },
  {
    title: "Automatiser les rapports",
    description: "Produire les documents récurrents à partir d’informations fiables.",
    Icon: FileOutput,
  },
  {
    title: "Relier le suivi à la facturation",
    description: "Éviter les ressaisies entre le travail réalisé et la facture envoyée.",
    Icon: ListChecks,
  },
] as const;

const method = [
  {
    title: "Comprendre votre fonctionnement",
    description: "Le diagnostic permet d’identifier ce qui vous ralentit et les priorités à traiter.",
  },
  {
    title: "Définir ce qu’il faut mettre en place",
    description: "Nous choisissons les processus, les règles et les outils en fonction de votre fonctionnement.",
  },
  {
    title: "Le mettre en place avec votre équipe",
    description: "Nous configurons, testons et ajustons la nouvelle organisation avec les personnes concernées.",
  },
] as const;

const faq = [
  {
    question: "Le diagnostic organisation est-il gratuit ?",
    answer: "Oui. Il vous donne une première lecture de votre situation et des priorités possibles, sans engagement.",
  },
  {
    question: "Que se passe-t-il après le diagnostic ?",
    answer: "Si une mise en place accompagnée est utile, nous précisons le périmètre et vous envoyons un devis avant tout démarrage.",
  },
  {
    question: "Que comprend la mise en place ?",
    answer: "Le travail porte sur vos processus réels : règles de fonctionnement, supports, configurations simples, tests avec l’équipe, ajustements et transmission de la méthode.",
  },
  {
    question: "Combien de temps dure l’accompagnement ?",
    answer: "La plupart des accompagnements se déroulent sur quatre semaines. La durée exacte dépend de ce qu’il faut réellement mettre en place.",
  },
  {
    question: "Comment le prix est-il calculé ?",
    answer: "L’accompagnement commence à 1 500 € HT, sur une base de 550 € HT par jour. Le nombre de jours et le prix total sont confirmés dans le devis, sans dépassement non validé.",
  },
  {
    question: "Pouvons-nous conserver nos outils actuels ?",
    answer: "Oui. Nous partons de votre fonctionnement et conservons ce qui est utile. Nous pouvons aussi travailler avec des outils que nous connaissons bien, notamment Airtable, Fillout et Make.",
  },
  {
    question: "Quand faut-il plutôt une application métier ?",
    answer: "Lorsque les outils existants ne peuvent pas couvrir votre fonctionnement sans ressaisies, contournements ou fragilité, une application métier peut devenir pertinente. Cette prestation est distincte et commence à 4 500 € HT, sur une base de 700 € HT par jour.",
  },
] as const;

function DiagnosticLink({ className = "" }: { className?: string }) {
  return (
    <Link href="/diagnostic-organisation" className={`${diagnosticButtonClassName} ${className}`}>
      <ClipboardCheck className="h-4 w-4" aria-hidden="true" />
      Diagnostic organisation
    </Link>
  );
}

function OrganiserProcessPreviewCard({
  content,
}: {
  content: AcademyContentDefinition;
}) {
  const guide = content.processGuide;
  if (!guide) return null;

  const title = content.identity.card.title;
  const meta = `Process · ${guide.system.label} · ${content.identity.durationMinutes} min`;

  return (
    <Link
      href={`/organiser/${content.identity.slug}`}
      className="group block w-full rounded-[1.25rem] text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dema-forest/35 focus-visible:ring-offset-4"
      aria-label={`Ouvrir ${title}`}
    >
      <article className="transition-transform duration-200 ease-out group-hover:-translate-y-px motion-reduce:transform-none">
        <div className="relative aspect-video overflow-hidden rounded-[1.25rem] bg-[#F0F4F1] transition-colors duration-200">
          <OrganiserProcessMap steps={guide.steps} compact />
        </div>
        <div className="px-0.5 pb-1 pt-3.5">
          <h3 className="line-clamp-2 text-[0.84rem] font-normal leading-[1.3] text-brand-blue opacity-[0.59] transition-colors group-hover:text-dema-forest sm:text-[0.9rem]">
            {title}
          </h3>
          <p className="mt-1.5 line-clamp-1 text-[0.7rem] text-dema-muted opacity-[0.59]">{meta}</p>
        </div>
      </article>
    </Link>
  );
}

export default function OrganiserLandingPage() {
  const processPreviews = getAllAcademyContent()
    .filter((content) => content.kind === "case-study" && Boolean(content.processGuide))
    .slice(0, 3);

  return (
    <>
      <Navbar minimal publicNavigationActiveView="academy" />

      <main className="overflow-x-clip bg-dema-cream pb-24 text-brand-blue xl:pb-0">
        <section className="border-b border-dema-line px-5 pb-20 pt-14 text-center sm:pb-24 sm:pt-20 lg:pb-28 lg:pt-24">
          <div className="mx-auto max-w-5xl">
            <h1
              aria-label="Mettre en place une organisation qui fonctionne vraiment."
              className={`${satoshiHeroTitleClassName} mx-auto max-w-5xl`}
            >
              <span aria-hidden="true">
                <span className="block">Mettre en place une organisation</span>
                <span className="demaa-hero-title mt-2 block text-dema-forest">
                  qui fonctionne vraiment.
                </span>
              </span>
            </h1>
            <p className="mx-auto mt-7 max-w-2xl text-balance text-base leading-7 text-dema-muted md:text-lg">
              On vous aide à simplifier votre fonctionnement pour gagner du temps et rendre votre entreprise moins dépendante de vous.
            </p>
            <div className="mt-9 flex flex-col items-center gap-3">
              <DiagnosticLink />
              <p className="text-xs text-dema-muted">Gratuit · Sans engagement</p>
            </div>
          </div>
        </section>

        <section aria-labelledby="situations-heading" className="px-5 py-16 sm:px-8 sm:py-20 lg:py-24">
          <div className="mx-auto max-w-6xl">
            <h2
              id="situations-heading"
              className="text-center text-[2rem] font-light leading-[1.08] tracking-[-0.04em] sm:text-[2.65rem]"
            >
              Simplifier votre organisation, concrètement
            </h2>
            <div className="mt-12 grid gap-x-10 gap-y-0 sm:grid-cols-2 lg:grid-cols-3">
              {situations.map(({ title, description, Icon }) => (
                <article key={title} className="border-b border-dema-line py-8 first:pt-0 sm:[&:nth-child(-n+2)]:pt-0 lg:[&:nth-child(-n+3)]:pt-0">
                  <Icon className="h-5 w-5 text-dema-forest" strokeWidth={1.7} aria-hidden="true" />
                  <h3 className="mt-5 text-lg font-medium tracking-[-0.025em]">{title}</h3>
                  <p className="mt-3 max-w-sm text-sm leading-6 text-dema-muted">{description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section aria-labelledby="method-heading" className="bg-dema-forest px-5 py-18 text-dema-paper sm:px-8 sm:py-22 lg:py-24">
          <div className="mx-auto max-w-6xl">
            <h2 id="method-heading" className="text-[2rem] font-light leading-[1.08] tracking-[-0.04em] sm:text-[2.65rem]">
              Comment ça se passe concrètement ?
            </h2>
            <ol className="mt-12 grid gap-9 lg:grid-cols-3 lg:gap-12">
              {method.map((step, index) => (
                <li key={step.title} className="border-l border-dema-paper/22 pl-5 lg:border-l-0 lg:pl-0">
                  <span className="demaa-section-title text-4xl text-dema-sage">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <h3 className="mt-5 text-base font-medium leading-6">{step.title}</h3>
                  <p className="mt-3 max-w-sm text-sm leading-6 text-dema-paper/72">{step.description}</p>
                </li>
              ))}
            </ol>
            <p className="mt-12 max-w-3xl border-t border-dema-paper/18 pt-6 text-sm leading-6 text-dema-paper/72">
              Nous pouvons travailler avec vos outils actuels ou avec ceux que nous connaissons bien, notamment Airtable, Fillout et Make.
            </p>
          </div>
        </section>

        <section aria-labelledby="offer-heading" className="bg-dema-sage px-5 py-16 sm:px-8 sm:py-20 lg:py-24">
          <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[1fr_0.78fr] lg:items-end lg:gap-20">
            <div>
              <p className="text-sm font-medium text-dema-forest">Mise en place accompagnée</p>
              <h2 id="offer-heading" className="mt-4 max-w-3xl text-[2.35rem] font-light leading-[1.02] tracking-[-0.05em] sm:text-[3.25rem]">
                Un mois pour simplifier votre organisation
              </h2>
              <p className="mt-6 max-w-2xl text-base leading-7 text-brand-blue/76">
                Après votre diagnostic organisation, nous définissons ce qu’il faut réellement mettre en place et vous proposons un devis adapté.
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-dema-forest">Tarifs</p>
              <p className="mt-3 text-[2.4rem] font-light leading-none tracking-[-0.05em] sm:text-[3.25rem]">
                À partir de 1 500 € HT
              </p>
              <p className="mt-4 text-sm text-dema-muted">Base de calcul : 550 € HT / jour</p>
              <DiagnosticLink className="mt-7" />
            </div>
          </div>
        </section>

        <section aria-labelledby="examples-heading" className="px-5 py-16 sm:px-8 sm:py-20 lg:py-24">
          <div className="mx-auto max-w-6xl">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 id="examples-heading" className="text-[2rem] font-light leading-[1.08] tracking-[-0.04em] sm:text-[2.65rem]">
                  Des cas concrets pour organiser votre activité
                </h2>
                <p className="mt-4 max-w-2xl text-base leading-7 text-dema-muted">
                  Découvrez des processus adaptés à des situations réelles.
                </p>
              </div>
              <Link href="/organiser" className="hidden text-sm font-medium text-dema-forest underline decoration-dema-forest/30 underline-offset-4 transition hover:decoration-dema-forest sm:inline-flex">
                Voir tous les processus
              </Link>
            </div>
            <div className="mt-10 grid grid-cols-1 gap-x-8 gap-y-9 md:grid-cols-2 lg:grid-cols-3">
              {processPreviews.map((content) => (
                <OrganiserProcessPreviewCard key={content.identity.slug} content={content} />
              ))}
            </div>
            <div className="mt-10 text-center sm:hidden">
              <Link href="/organiser" className="demaa-secondary-button inline-flex items-center justify-center">
                Voir tous les processus
              </Link>
            </div>
          </div>
        </section>

        <section aria-labelledby="automation-bridge-heading" className="border-t border-dema-line px-5 pt-16 sm:px-8 sm:pt-20 lg:pt-24">
          <div className="mx-auto flex max-w-6xl flex-col gap-7 rounded-[1.5rem] bg-dema-sage/55 px-6 py-8 sm:px-8 sm:py-10 lg:flex-row lg:items-end lg:justify-between lg:gap-12">
            <div className="max-w-3xl">
              <h2 id="automation-bridge-heading" className="text-[1.75rem] font-light leading-[1.08] tracking-[-0.04em] sm:text-[2.25rem]">
                Faites gagner du temps à votre équipe
              </h2>
              <p className="mt-4 max-w-2xl text-base leading-7 text-dema-muted">
                Nous vous accompagnons pour automatiser les tâches réellement utiles et rendre votre équipe autonome.
              </p>
            </div>
            <div className="flex shrink-0 flex-col gap-3 sm:flex-row">
              <Link href="/automatisation" className="demaa-secondary-button inline-flex min-h-12 items-center justify-center">
                Découvrir l’accompagnement
              </Link>
              <OrganiserProjectDiscussionButton className={diagnosticButtonClassName} />
            </div>
          </div>
        </section>

        <section aria-labelledby="faq-heading" className="px-5 py-16 sm:px-8 sm:py-20 lg:py-24">
          <div className="mx-auto max-w-5xl">
            <h2 id="faq-heading" className="text-[2rem] font-light leading-[1.08] tracking-[-0.04em] sm:text-[2.65rem]">
              Questions-réponses
            </h2>
            <div className="mt-9 divide-y divide-dema-line border-y border-dema-line">
              {faq.map((item) => (
                <details key={item.question} className="group py-5">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-5 text-base font-medium marker:hidden">
                    <span>{item.question}</span>
                    <ChevronDown className="h-4 w-4 shrink-0 text-dema-forest transition group-open:rotate-180" aria-hidden="true" />
                  </summary>
                  <p className="mt-3 max-w-3xl pr-9 text-sm leading-6 text-dema-muted">{item.answer}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section className="px-5 pb-16 sm:px-8 sm:pb-20 lg:pb-24">
          <div className="mx-auto max-w-6xl">
            <StructureNewsletterBlock />
          </div>
        </section>
      </main>
    </>
  );
}
