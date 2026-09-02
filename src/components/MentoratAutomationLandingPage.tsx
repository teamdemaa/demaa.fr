import Link from "next/link";
import { ArrowRight, Check, ChevronDown, ClipboardCheck } from "lucide-react";
import AutomationCallbackControl from "@/components/AutomationCallbackControl";
import Navbar from "@/components/Navbar";
import { mentoratAutomationContent as content } from "@/lib/mentorat-automation-content";
import { satoshiHeroTitleClassName } from "@/lib/marketing-hero-style";

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
                <span className="block">Organisez votre entreprise</span>
                <span className="demaa-hero-title mt-2 block text-dema-forest">
                  pour qu’elle dépende moins de vous.
                </span>
              </span>
            </h1>
            <p className="mx-auto mt-7 max-w-3xl text-base leading-7 text-dema-muted sm:text-lg sm:leading-8">
              {content.hero.description}
            </p>
            <div className="mt-8 flex flex-col items-center">
              <AutomationCallbackControl variant="hero" label="Être accompagné" />
              <p className="mt-3 text-xs text-dema-muted">
                Échange de 30 minutes · Sans engagement
              </p>
            </div>
          </div>
        </section>

        <section
          aria-labelledby="examples-heading"
          className="border-y border-dema-line bg-dema-paper px-5 py-16 sm:px-8 sm:py-20"
        >
          <div className="mx-auto max-w-6xl">
            <div className="max-w-4xl">
              <h2 id="examples-heading" className="demaa-marketing-section-title">
                Ce que nous pouvons remettre en ordre.
              </h2>
            </div>

            <ul className="mt-11 grid gap-x-10 gap-y-8 md:grid-cols-2">
              {content.examples.map((example) => (
                <li key={example} className="border-t border-dema-line pt-5">
                  <div className="flex items-start gap-3">
                    <Check className="mt-1 h-4 w-4 shrink-0 text-dema-forest" aria-hidden="true" />
                    <p className="text-base font-medium leading-7 tracking-[-0.02em]">
                      {example}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="px-5 py-16 text-center sm:px-8 sm:py-20">
          <p className="demaa-marketing-section-title mx-auto max-w-4xl">
            <span className="block">Moins de temps consacré aux tâches chronophages.</span>
            <span className="demaa-section-title mt-2 block text-dema-forest">
              Plus de temps pour vos clients.
            </span>
          </p>
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
            <p className="mt-10 border-t border-dema-line pt-6 text-base leading-7 text-dema-muted">
              Vous nous apportez la réalité du terrain. Nous concevons et mettons en place. Vous validez et gardez la main.
            </p>
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
            <div
              aria-hidden="true"
              className="mt-10 grid items-center gap-3 text-center sm:grid-cols-[1fr_auto_1fr_auto_1fr]"
            >
              <span className="rounded-full border border-dema-line bg-dema-paper px-5 py-4 text-sm text-brand-blue">
                Vos outils actuels
              </span>
              <span className="hidden text-dema-forest/45 sm:block">→</span>
              <span className="rounded-full border border-dema-forest bg-dema-forest px-5 py-4 text-sm font-medium text-dema-paper">
                Une organisation plus claire
              </span>
              <span className="hidden text-dema-forest/45 sm:block">→</span>
              <span className="rounded-full border border-dema-line bg-dema-paper px-5 py-4 text-sm text-brand-blue">
                Moins de travail manuel
              </span>
            </div>
          </div>
        </section>

        <section aria-labelledby="proof-heading" className="px-5 py-16 sm:px-8 sm:py-20">
          <div className="mx-auto max-w-5xl">
            <h2 id="proof-heading" className="demaa-marketing-section-title">
              Ce qu’ils en retiennent.
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
                Maestro · Accompagnement · 1 mois
              </p>
              <h2 id="offer-heading" className="demaa-marketing-section-title mt-4">
                Votre nouvelle organisation, mise en place en un mois.
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
              <p className="mt-2 text-xs text-dema-paper/62">Par entreprise</p>
            </div>
            <div className="flex flex-col items-start sm:items-end">
              <AutomationCallbackControl variant="offer" label="Être accompagné" />
              <p className="mt-3 text-xs text-dema-paper/68">
                Échange de 30 minutes · Sans engagement
              </p>
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
                Décrivez ce qui ralentit votre entreprise et obtenez un premier plan d’action.
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
              Commençons par ce qui vous fait perdre le plus de temps.
            </h2>
            <div className="mt-7 flex flex-col items-center">
              <AutomationCallbackControl variant="hero" label="Être accompagné" />
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
