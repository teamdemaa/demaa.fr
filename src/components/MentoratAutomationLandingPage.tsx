import { BookOpen, Check, ChevronDown, CirclePlay } from "lucide-react";
import AutomationCallbackControl from "@/components/AutomationCallbackControl";
import Navbar from "@/components/Navbar";
import StructureNewsletterBlock from "@/components/StructureNewsletterBlock";
import { mentoratAutomationContent as content } from "@/lib/mentorat-automation-content";
import { satoshiHeroTitleClassName } from "@/lib/marketing-hero-style";

const offerFacts = [
  { value: "1 mois", label: "d’accompagnement" },
  { value: "4 × 1 heure", label: "avec un mentor" },
  { value: "12 mois", label: "d’accès aux tutoriels" },
  { value: content.offer.price, label: "par entreprise" },
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
                <span className="block">Gagnez du temps</span>
                <span className="demaa-hero-title mt-2 block text-dema-forest">
                  avec l’automatisation et l’IA.
                </span>
              </span>
            </h1>
            <p className="mx-auto mt-7 max-w-3xl text-base leading-7 text-dema-muted sm:text-lg sm:leading-8">
              {content.hero.description}
            </p>
            <div className="mt-8 flex flex-col items-center">
              <AutomationCallbackControl
                variant="hero"
                label="Demander à être rappelé"
              />
              <p className="mt-3 text-xs text-dema-muted">
                Échange de 30 minutes · Sans engagement
              </p>
            </div>
          </div>

          <ul className="mx-auto mt-12 grid max-w-5xl border-y border-dema-line sm:grid-cols-2 lg:grid-cols-4">
            {offerFacts.map((fact) => (
              <li
                key={fact.value}
                className="border-b border-dema-line px-4 py-5 last:border-b-0 sm:[&:nth-child(3)]:border-b-0 sm:[&:nth-child(4)]:border-b-0 lg:border-b-0 lg:border-r lg:last:border-r-0"
              >
                <span className="block text-lg font-medium tracking-[-0.025em] text-brand-blue">
                  {fact.value}
                </span>
                <span className="mt-1 block text-xs leading-5 text-dema-muted">
                  {fact.label}
                </span>
              </li>
            ))}
          </ul>
        </section>

        <section
          aria-labelledby="examples-heading"
          className="border-y border-dema-line bg-dema-paper px-5 py-16 sm:px-8 sm:py-20"
        >
          <div className="mx-auto max-w-6xl">
            <div className="max-w-4xl">
              <h2 id="examples-heading" className="demaa-marketing-section-title">
                Ce que nous pouvons améliorer avec vous.
              </h2>
              <p className="mt-5 text-base leading-7 text-dema-muted">
                Nous choisissons les priorités avec vous selon votre activité, vos outils actuels et le temps que vos équipes peuvent réellement récupérer.
              </p>
            </div>

            <ul className="mt-11 grid gap-x-10 gap-y-8 md:grid-cols-2">
              {content.examples.map((example) => (
                <li
                  key={example.title}
                  className="border-t border-dema-line pt-5"
                >
                  <div className="flex items-start gap-3">
                    <Check
                      className="mt-1 h-4 w-4 shrink-0 text-dema-forest"
                      aria-hidden="true"
                    />
                    <div>
                      <h3 className="text-base font-medium tracking-[-0.02em]">
                        {example.title}
                      </h3>
                      <p className="mt-2 text-sm leading-6 text-dema-muted">
                        {example.description}
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section
          id="parcours"
          aria-labelledby="journey-heading"
          className="scroll-mt-24 px-5 py-16 sm:px-8 sm:py-20"
        >
          <div className="mx-auto max-w-6xl">
            <div className="max-w-4xl">
              <h2 id="journey-heading" className="demaa-marketing-section-title">
                Des tutoriels pour apprendre. Un mentor pour avancer.
              </h2>
              <p className="mt-5 max-w-3xl text-base leading-7 text-dema-muted">
                Les tutoriels vous montrent les manipulations essentielles. Chaque semaine, votre mentor vous aide à les appliquer aux priorités de votre entreprise.
              </p>
            </div>

            <ol className="mt-11 grid gap-x-12 gap-y-8 md:grid-cols-2">
              {content.approachPillars.map((step, index) => (
                <li key={step.title} className="border-t border-dema-line pt-5">
                  <span className="demaa-section-title text-2xl text-dema-forest/48">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <h3 className="mt-4 text-base font-medium tracking-[-0.02em]">
                    {step.title}
                  </h3>
                  <ul className="mt-4 space-y-2">
                    {step.points.map((point) => (
                      <li key={point} className="flex gap-3 text-sm leading-6 text-dema-muted">
                        <span
                          className="mt-2.5 h-1 w-1 shrink-0 rounded-full bg-dema-forest/55"
                          aria-hidden="true"
                        />
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section
          aria-labelledby="tutorials-heading"
          className="border-y border-dema-line bg-dema-paper px-5 py-16 sm:px-8 sm:py-20"
        >
          <div className="mx-auto max-w-6xl">
            <div className="max-w-4xl">
              <p className="text-sm font-medium text-dema-forest">Tutoriels pratiques</p>
              <h2 id="tutorials-heading" className="demaa-marketing-section-title">
                Des démonstrations concrètes, outil par outil.
              </h2>
              <p className="mt-5 max-w-3xl text-base leading-7 text-dema-muted">
                Vous voyez chaque action à l’écran, vous la reproduisez et vous l’adaptez à votre fonctionnement.
              </p>
            </div>

            <div className="mt-11 overflow-hidden rounded-[1.75rem] border border-dema-line bg-dema-cream">
              <div className="flex flex-col gap-3 border-b border-dema-line px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-7">
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-dema-forest text-dema-paper">
                    <BookOpen className="h-4 w-4" aria-hidden="true" />
                  </span>
                  <div>
                    <p className="text-sm font-medium text-brand-blue">Tutoriels Demaa</p>
                    <p className="text-xs text-dema-muted">Des démonstrations pratiques, accessibles pendant 12 mois</p>
                  </div>
                </div>
              </div>

              <div className="grid lg:grid-cols-[0.34fr_0.66fr]">
                <aside className="bg-dema-forest px-5 py-7 text-dema-paper sm:px-7">
                  <p className="text-xs font-medium uppercase tracking-[0.16em] text-dema-sage">
                    Les outils abordés
                  </p>
                  <ul className="mt-5 flex flex-wrap gap-2">
                    {content.tutorialTracks.map((track) => (
                      <li
                        key={track.title}
                        className="rounded-full border border-dema-paper/20 px-3 py-2 text-sm text-dema-paper/82"
                      >
                        {track.title}
                      </li>
                    ))}
                  </ul>

                  <div className="mt-8 border-t border-dema-paper/18 pt-6">
                    <p className="text-xs font-medium uppercase tracking-[0.16em] text-dema-sage">
                      La méthode
                    </p>
                    <p className="mt-4 text-sm leading-6 text-dema-paper/72">
                      Une manipulation montrée à l’écran, puis reproduite et adaptée à votre entreprise.
                    </p>
                  </div>
                </aside>

                <div className="px-5 py-7 sm:px-8 sm:py-9 lg:px-10">
                  <p className="text-xs font-medium uppercase tracking-[0.16em] text-dema-forest">
                    Exemples de tutoriels
                  </p>
                  <ul className="mt-5 divide-y divide-dema-line border-y border-dema-line">
                    {content.tutorialTracks.map((track) => (
                      <li key={track.title} className="flex items-start gap-4 py-4">
                        <CirclePlay className="mt-0.5 h-4 w-4 shrink-0 text-dema-forest" aria-hidden="true" />
                        <div>
                          <h3 className="text-sm font-medium text-brand-blue">{track.title}</h3>
                          <p className="mt-1 text-sm leading-6 text-dema-muted">{track.outcome}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section
          aria-labelledby="proof-heading"
          className="px-5 py-16 sm:px-8 sm:py-20"
        >
          <div className="mx-auto max-w-6xl">
            <div className="max-w-4xl">
              <h2 id="proof-heading" className="demaa-marketing-section-title">
                Ce qu’ils en retiennent.
              </h2>
            </div>

            <div className="mt-11 grid gap-x-10 gap-y-8 md:grid-cols-3">
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
              <h2 id="offer-heading" className="demaa-marketing-section-title">
                <span className="block">Un mois pour mieux organiser</span>
                <span className="demaa-section-title mt-2 block text-dema-sage">
                  et automatiser votre entreprise.
                </span>
              </h2>
              <ul className="mt-6 grid gap-3 sm:grid-cols-2 sm:gap-x-8">
                {content.offerIncludes.map((item) => (
                  <li key={item} className="flex gap-3 text-sm leading-6 text-dema-paper/76">
                    <Check
                      className="mt-1 h-4 w-4 shrink-0 text-dema-sage"
                      aria-hidden="true"
                    />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-6 text-2xl font-medium">{content.offer.price}</p>
            </div>
            <div className="flex flex-col items-start sm:items-end">
              <AutomationCallbackControl
                variant="offer"
                label="Demander à être rappelé"
              />
              <p className="mt-3 text-xs text-dema-paper/68">
                Échange de 30 minutes · Sans engagement
              </p>
            </div>
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

        <section className="px-5 pb-16 sm:px-8 sm:pb-20 lg:pb-24">
          <div className="mx-auto max-w-6xl">
            <StructureNewsletterBlock />
          </div>
        </section>
      </main>
    </>
  );
}
