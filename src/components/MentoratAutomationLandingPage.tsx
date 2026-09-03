import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  Calendar,
  Check,
  ChevronDown,
  ClipboardCheck,
  ClipboardList,
  FileText,
  Folder,
  Mail,
  MessageSquare,
  Receipt,
  Send,
} from "lucide-react";
import AutomationCallbackControl from "@/components/AutomationCallbackControl";
import Navbar from "@/components/Navbar";
import { mentoratAutomationContent as content } from "@/lib/mentorat-automation-content";
import { satoshiHeroTitleClassName } from "@/lib/marketing-hero-style";

const systemIcons = [
  Mail,
  MessageSquare,
  FileText,
  Receipt,
  ClipboardList,
  Folder,
  Calendar,
  Send,
] as const;

export default function MentoratAutomationLandingPage() {
  return (
    <>
      <Navbar minimal publicNavigationActiveView="services" />

      <main className="overflow-x-clip bg-dema-cream text-brand-blue">
        <section className="px-5 pb-12 pt-14 text-center sm:px-8 sm:pb-16 sm:pt-20 lg:pt-24">
          <div className="mx-auto max-w-5xl">
            <h1
              aria-label={content.hero.title}
              className={`${satoshiHeroTitleClassName} mx-auto max-w-5xl`}
            >
              <span aria-hidden="true">
                <span className="block">Mettez de l’ordre dans votre entreprise.</span>
                <span className="demaa-hero-title mt-2 block text-dema-forest">
                  Et des systèmes pour que ça dure.
                </span>
              </span>
            </h1>
            <p className="mx-auto mt-7 max-w-3xl text-base leading-7 text-dema-muted sm:text-lg sm:leading-8">
              {content.hero.description}
            </p>
            <div className="mt-8 flex flex-col items-center">
              <AutomationCallbackControl variant="hero" label="Faire le point sur mon organisation" />
              <p className="mt-3 text-xs text-dema-muted">
                Échange de 30 minutes · Sans engagement
              </p>
            </div>
            <Image
              src="/images/accompagnement/dirigeante-debordee.png"
              alt="Une dirigeante sollicitée par les messages, les appels, les documents et le planning de son entreprise"
              width={1536}
              height={1024}
              priority
              sizes="(min-width: 1024px) 800px, 92vw"
              className="mx-auto mt-8 h-auto w-full max-w-4xl mix-blend-darken"
            />
          </div>
        </section>

        <section className="bg-dema-forest px-5 py-16 text-center text-dema-paper sm:px-8 sm:py-20">
          <p className="demaa-marketing-section-title mx-auto max-w-4xl">
            <span className="block">Aujourd’hui, trop de choses reposent sur vous.</span>
            <span className="demaa-section-title mt-2 block text-dema-sage">
              Demain, chaque tâche importante suit un fonctionnement clair.
            </span>
          </p>
        </section>

        <section
          aria-labelledby="examples-heading"
          className="border-y border-dema-line bg-dema-paper px-5 py-16 sm:px-8 sm:py-20"
        >
          <div className="mx-auto max-w-6xl">
            <div className="grid items-center gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(20rem,0.78fr)] lg:gap-12">
              <div className="max-w-4xl">
                <h2 id="examples-heading" className="demaa-marketing-section-title">
                  Les systèmes que nous pouvons mettre en place.
                </h2>
              </div>
              <Image
                src="/images/accompagnement/organisation-claire.png"
                alt="Des informations dispersées réunies dans une organisation claire"
                width={1536}
                height={1024}
                sizes="(min-width: 1024px) 440px, 92vw"
                className="mx-auto h-auto w-full max-w-xl mix-blend-darken lg:max-w-none"
              />
            </div>

            <ul className="mt-11 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {content.examples.map((example, index) => {
                const Icon = systemIcons[index];
                return (
                  <li
                    key={example.title}
                    className="flex min-h-52 flex-col rounded-[1.5rem] border border-dema-line bg-dema-cream/45 p-6"
                  >
                    <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-dema-sage/45 text-dema-forest">
                      <Icon className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <h3 className="mt-7 text-lg font-medium leading-snug tracking-[-0.025em]">
                      {example.title}
                    </h3>
                    <p className="mt-3 text-sm leading-6 text-dema-muted">
                      {example.description}
                    </p>
                  </li>
                );
              })}
            </ul>
          </div>
        </section>

        <section
          aria-labelledby="operational-brain-heading"
          className="bg-dema-cream px-5 py-16 sm:px-8 sm:py-20"
        >
          <div className="mx-auto max-w-6xl">
            <div className="max-w-4xl">
              <h2 id="operational-brain-heading" className="demaa-marketing-section-title">
                {content.operationalBrain.title}
              </h2>
              <p className="mt-5 max-w-3xl text-base leading-7 text-dema-muted">
                {content.operationalBrain.description}
              </p>
            </div>
            <ol className="mt-10 grid gap-5 md:grid-cols-3">
              {content.operationalBrain.levels.map((level, index) => (
                <li
                  key={level.title}
                  className="rounded-[1.5rem] border border-dema-line bg-dema-paper p-6 sm:p-7"
                >
                  <span className="demaa-section-title text-xl text-dema-forest/48">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <h3 className="mt-5 text-xl font-medium leading-snug tracking-[-0.025em]">
                    {level.title}
                  </h3>
                  <p className="mt-3 text-sm leading-6 text-dema-muted">
                    {level.description}
                  </p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section
          id="methode"
          aria-labelledby="method-heading"
          className="border-y border-dema-line bg-dema-paper px-5 py-16 sm:px-8 sm:py-20"
        >
          <div className="mx-auto max-w-6xl">
            <h2 id="method-heading" className="demaa-marketing-section-title">
              Comment ça se passe ?
            </h2>
            <ol className="mt-11 grid gap-x-10 gap-y-8 md:grid-cols-3">
              {content.method.map((step, index) => (
                <li key={step.title} className="border-t border-dema-line pt-5">
                  <span className="demaa-section-title text-2xl text-dema-forest/48">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <h3 className="mt-4 text-xl font-medium leading-snug tracking-[-0.025em] sm:text-2xl">
                    {step.title}
                  </h3>
                  <p className="mt-3 text-sm leading-6 text-dema-muted">
                    {step.description}
                  </p>
                </li>
              ))}
            </ol>
            <Image
              src="/images/accompagnement/atelier-organisation.png"
              alt="Une dirigeante et son équipe travaillent avec Demaa sur leur organisation"
              width={1536}
              height={1024}
              sizes="(min-width: 1024px) 800px, 92vw"
              className="mx-auto mt-10 h-auto w-full max-w-4xl mix-blend-darken"
            />
          </div>
        </section>

        <section
          aria-labelledby="tools-heading"
          className="px-5 py-16 sm:px-8 sm:py-20"
        >
          <div className="mx-auto max-w-6xl">
            <div className="max-w-4xl">
              <h2 id="tools-heading" className="demaa-marketing-section-title">
                {content.tools.title}
              </h2>
              <p className="mt-5 max-w-3xl text-base leading-7 text-dema-muted">
                {content.tools.description}
              </p>
            </div>
            <Image
              src="/images/accompagnement/outils-organises.png"
              alt="Un dirigeant retrouve ses emails, son agenda, ses demandes clients, ses devis et ses documents organisés dans ses outils habituels"
              width={1536}
              height={1024}
              sizes="(min-width: 1024px) 900px, 92vw"
              className="mx-auto mt-8 h-auto w-full max-w-5xl mix-blend-darken"
            />
            <p className="mt-5 max-w-4xl text-base font-medium leading-7 text-brand-blue">
              Nous mettons en place le classement, les modèles, les étapes, les responsables et
              les relances — directement dans vos outils.
            </p>
            <ul className="mt-6 flex flex-wrap gap-2">
              {content.tools.examples.map((tool) => (
                <li
                  key={tool}
                  className="rounded-full border border-dema-line bg-dema-paper px-4 py-2 text-xs text-dema-muted"
                >
                  {tool}
                </li>
              ))}
            </ul>
            <p className="mt-6 flex max-w-3xl items-start gap-3 rounded-2xl bg-dema-sage/35 px-5 py-4 text-sm leading-6 text-dema-forest">
              <Check className="mt-1 h-4 w-4 shrink-0" aria-hidden="true" />
              <span>{content.tools.access}</span>
            </p>
          </div>
        </section>

        <section aria-labelledby="proof-heading" className="px-5 py-16 sm:px-8 sm:py-20">
          <div className="mx-auto max-w-5xl">
            <h2 id="proof-heading" className="demaa-marketing-section-title">
              Ce que ces systèmes changent au quotidien.
            </h2>
            <div className="mt-11 grid gap-x-12 gap-y-8 md:grid-cols-2">
              {content.testimonials.map((testimonial) => (
                <blockquote
                  key={testimonial.attribution}
                  className="flex h-full flex-col border-t border-dema-line pt-5"
                >
                  <p className="text-base leading-7 text-brand-blue">
                    “{testimonial.quote}”
                  </p>
                  <footer className="mt-6 text-sm text-dema-muted">
                    {testimonial.attribution}
                  </footer>
                </blockquote>
              ))}
            </div>
          </div>
        </section>

        <section
          id="tarif"
          aria-labelledby="offer-heading"
          className="scroll-mt-24 bg-dema-forest px-5 py-16 text-dema-paper sm:px-8 sm:py-20"
        >
          <div className="mx-auto flex max-w-6xl flex-col items-start gap-9 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-3xl">
              <p className="text-xs font-medium uppercase tracking-[0.16em] text-dema-sage">
                Maestro · Mise en place de systèmes · 1 mois
              </p>
              <h2 id="offer-heading" className="demaa-marketing-section-title mt-4">
                Vos premiers systèmes opérationnels, mis en place en un mois.
              </h2>
              <ul className="mt-6 grid gap-3 sm:grid-cols-2 sm:gap-x-8">
                {content.offerIncludes.map((item) => (
                  <li key={item} className="flex gap-3 text-sm leading-6 text-dema-paper/76">
                    <Check className="mt-1 h-4 w-4 shrink-0 text-dema-sage" aria-hidden="true" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-6 text-2xl font-medium">{content.offer.price}</p>
              <p className="mt-2 text-xs text-dema-paper/62">Pour la mission d’un mois</p>
            </div>
            <div className="flex flex-col items-start sm:items-end">
              <AutomationCallbackControl variant="offer" label="Faire le point" />
              <p className="mt-3 text-xs text-dema-paper/68">
                Échange de 30 minutes · Sans engagement
              </p>
            </div>
          </div>
        </section>

        <section
          id="suivi"
          aria-labelledby="ongoing-heading"
          className="border-b border-dema-line bg-dema-paper px-5 py-16 sm:px-8 sm:py-20"
        >
          <div className="mx-auto max-w-6xl">
            <div className="max-w-4xl">
              <p className="text-sm font-medium text-dema-forest">Une fois les systèmes installés</p>
              <h2 id="ongoing-heading" className="demaa-marketing-section-title mt-4">
                {content.ongoing.title}
              </h2>
              <p className="mt-5 max-w-3xl text-base leading-7 text-dema-muted">
                {content.ongoing.description}
              </p>
            </div>

            <div className="mt-10 grid gap-5 md:grid-cols-2">
              {content.ongoing.options.map((option, index) => (
                <article
                  key={option.title}
                  className="rounded-[1.5rem] border border-dema-line bg-dema-cream/40 p-6 sm:p-8"
                >
                  <p className="demaa-section-title text-2xl text-dema-forest/48">
                    {String(index + 1).padStart(2, "0")}
                  </p>
                  <h3 className="mt-5 text-xl font-medium leading-snug tracking-[-0.025em] sm:text-2xl">
                    {option.title}
                  </h3>
                  <p className="mt-3 text-sm leading-6 text-dema-muted">
                    {option.description}
                  </p>
                </article>
              ))}
            </div>

            <div className="mt-7 rounded-2xl bg-dema-sage/35 px-6 py-5">
              <p className="text-sm leading-6 text-dema-forest">{content.ongoing.note}</p>
            </div>
          </div>
        </section>

        <section
          aria-labelledby="diagnostic-heading"
          className="border-b border-dema-line bg-dema-sage/35 px-5 py-14 sm:px-8 sm:py-16"
        >
          <div className="mx-auto flex max-w-6xl flex-col gap-7 sm:flex-row sm:items-center sm:justify-between sm:gap-12">
            <div className="max-w-3xl">
              <p className="flex items-center gap-2 text-sm font-medium text-dema-forest">
                <ClipboardCheck className="h-4 w-4" aria-hidden="true" />
                Diagnostic organisation
              </p>
              <h2 id="diagnostic-heading" className="demaa-marketing-section-title mt-4">
                Vous ne savez pas encore par où commencer ?
              </h2>
              <p className="mt-4 max-w-2xl text-base leading-7 text-dema-muted">
                Décrivez ce qui ralentit votre entreprise et identifiez le premier système à mettre en place.
              </p>
            </div>
            <Link
              href="/diagnostic-organisation"
              className="inline-flex min-h-12 shrink-0 items-center justify-center gap-2 self-start rounded-full border border-dema-forest/22 bg-dema-paper px-6 text-sm font-medium text-dema-forest transition hover:border-dema-forest/40 hover:bg-dema-forest hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dema-forest/30 focus-visible:ring-offset-2 sm:self-center"
            >
              Commencer le diagnostic
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </section>

        <section
          id="faq"
          aria-labelledby="faq-heading"
          className="scroll-mt-24 px-5 py-16 sm:px-8 sm:py-20"
        >
          <div className="mx-auto max-w-5xl">
            <p className="text-sm font-medium text-dema-forest">Questions fréquentes</p>
            <h2 id="faq-heading" className="demaa-marketing-section-title mt-4">
              Avant de démarrer
            </h2>
            <div className="mt-9 divide-y divide-dema-line border-y border-dema-line">
              {content.faq.map((item) => (
                <details key={item.question} className="group py-5">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-5 text-base font-medium marker:hidden">
                    <span>{item.question}</span>
                    <ChevronDown
                      className="h-4 w-4 shrink-0 text-dema-forest transition group-open:rotate-180"
                      aria-hidden="true"
                    />
                  </summary>
                  <p className="mt-3 max-w-3xl pr-9 text-sm leading-6 text-dema-muted">
                    {item.answer}
                  </p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section className="border-t border-dema-line bg-dema-paper px-5 py-16 text-center sm:px-8 sm:py-20">
          <div className="mx-auto max-w-3xl">
            <h2 className="demaa-marketing-section-title">
              Commençons par ce qui repose encore trop sur vous.
            </h2>
            <div className="mt-7 flex flex-col items-center">
              <AutomationCallbackControl variant="hero" label="Faire le point sur mon organisation" />
              <p className="mt-3 text-xs text-dema-muted">
                Échange de 30 minutes · Sans engagement
              </p>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
