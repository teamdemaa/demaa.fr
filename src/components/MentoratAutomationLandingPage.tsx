import Image from "next/image";
import { Check, ChevronDown } from "lucide-react";
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
                <span className="block">{content.hero.lead}</span>
                <span className="demaa-hero-title mt-2 block text-dema-forest">
                  {content.hero.emphasis}
                </span>
              </span>
            </h1>
            <p className="mx-auto mt-7 max-w-3xl text-base leading-7 text-dema-muted sm:text-lg sm:leading-8">
              {content.hero.description}
            </p>
            <div className="mt-8 flex flex-col items-center">
              <AutomationCallbackControl variant="hero" label="Faire le point ensemble" />
              <p className="mt-3 text-xs text-dema-muted">
                Échange de 30 minutes · Sans engagement
              </p>
            </div>
            <Image
              src="/images/accompagnement/dirigeante-debordee.png"
              alt="Une dirigeante sollicitée par les messages, les appels, les documents et le suivi de ses clients"
              width={1536}
              height={1024}
              priority
              sizes="(min-width: 1024px) 800px, 92vw"
              className="mx-auto mt-8 h-auto w-full max-w-4xl mix-blend-darken"
            />
          </div>
        </section>

        <section
          aria-labelledby="why-heading"
          className="bg-dema-forest px-5 py-16 text-dema-paper sm:px-8 sm:py-20"
        >
          <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(20rem,0.78fr)] lg:gap-16">
            <h2 id="why-heading" className="demaa-marketing-section-title max-w-4xl">
              {content.why.title}
            </h2>
            <div className="space-y-5 text-base leading-7 text-dema-paper/76">
              {content.why.paragraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </div>
        </section>

        <section
          aria-labelledby="journey-heading"
          className="border-y border-dema-line bg-dema-paper px-5 py-16 sm:px-8 sm:py-20"
        >
          <div className="mx-auto max-w-6xl">
            <div className="grid items-center gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(20rem,0.78fr)] lg:gap-12">
              <div className="max-w-4xl">
                <h2 id="journey-heading" className="demaa-marketing-section-title">
                  {content.journeyIntro.title}
                </h2>
                <p className="mt-5 max-w-3xl text-base leading-7 text-dema-muted">
                  {content.journeyIntro.description}
                </p>
              </div>
              <Image
                src="/images/accompagnement/organisation-claire.png"
                alt="Les étapes du parcours commercial et client réunies dans une organisation claire"
                width={1536}
                height={1024}
                sizes="(min-width: 1024px) 440px, 92vw"
                className="mx-auto h-auto w-full max-w-xl mix-blend-darken lg:max-w-none"
              />
            </div>

            <ol className="mt-11 grid gap-5 md:grid-cols-2">
              {content.journey.map((stage, index) => (
                <li
                  key={stage.title}
                  className="rounded-[1.5rem] border border-dema-line bg-dema-cream/45 p-6 sm:p-8"
                >
                  <p className="demaa-section-title text-2xl text-dema-forest/48">
                    {String(index + 1).padStart(2, "0")}
                  </p>
                  <h3 className="mt-5 text-xl font-medium leading-snug tracking-[-0.025em] sm:text-2xl">
                    {stage.title}
                  </h3>
                  <p className="mt-3 text-sm leading-6 text-dema-muted">{stage.promise}</p>
                  <ul className="mt-6 grid gap-x-6 gap-y-2.5 sm:grid-cols-2">
                    {stage.items.map((item) => (
                      <li key={item} className="flex gap-2.5 text-sm leading-5 text-brand-blue/78">
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-dema-forest" aria-hidden="true" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section
          aria-labelledby="foundations-heading"
          className="bg-dema-cream px-5 py-16 sm:px-8 sm:py-20"
        >
          <div className="mx-auto max-w-6xl">
            <div className="max-w-4xl">
              <h2 id="foundations-heading" className="demaa-marketing-section-title">
                {content.foundations.title}
              </h2>
              <p className="mt-5 max-w-3xl text-base leading-7 text-dema-muted">
                {content.foundations.description}
              </p>
            </div>
            <ol className="mt-11 grid gap-x-8 gap-y-7 sm:grid-cols-2 lg:grid-cols-5">
              {content.foundations.items.map((item, index) => (
                <li key={item.title} className="border-t border-dema-line pt-5">
                  <p className="text-xs font-medium tracking-[0.14em] text-dema-forest/55">
                    {String(index + 1).padStart(2, "0")}
                  </p>
                  <h3 className="mt-4 text-lg font-medium tracking-[-0.02em]">{item.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-dema-muted">{item.description}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section
          aria-labelledby="cockpit-heading"
          className="border-y border-dema-line bg-dema-paper px-5 py-16 sm:px-8 sm:py-20"
        >
          <div className="mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-[minmax(0,0.88fr)_minmax(24rem,1.12fr)] lg:gap-14">
            <div>
              <h2 id="cockpit-heading" className="demaa-marketing-section-title">
                {content.cockpit.title}
              </h2>
              <p className="mt-5 max-w-3xl text-base leading-7 text-dema-muted">
                {content.cockpit.description}
              </p>
              <ol className="mt-8 grid gap-3 sm:grid-cols-2">
                {content.cockpit.items.map((item) => (
                  <li
                    key={item.title}
                    className="flex gap-3 rounded-2xl border border-dema-line bg-dema-cream/38 px-4 py-4"
                  >
                    <Check className="mt-1 h-4 w-4 shrink-0 text-dema-forest" aria-hidden="true" />
                    <div>
                      <h3 className="font-medium tracking-[-0.015em]">{item.title}</h3>
                      <p className="mt-1 text-sm leading-5 text-dema-muted">{item.description}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
            <Image
              src="/images/accompagnement/outils-organises-transparent.png"
              alt="Les actions commerciales et client à contacter, préparer, valider et relancer réunies dans un cockpit"
              width={1536}
              height={1024}
              sizes="(min-width: 1024px) 560px, 92vw"
              className="mx-auto h-auto w-full max-w-2xl"
            />
          </div>
        </section>

        <section
          aria-labelledby="impacts-heading"
          className="bg-dema-sage/35 px-5 py-16 sm:px-8 sm:py-20"
        >
          <div className="mx-auto max-w-6xl">
            <h2 id="impacts-heading" className="demaa-marketing-section-title">
              {content.impacts.title}
            </h2>
            <div className="mt-11 grid gap-x-8 gap-y-8 sm:grid-cols-2 lg:grid-cols-4">
              {content.impacts.items.map((item) => (
                <article key={item.title} className="border-t border-dema-forest/18 pt-5">
                  <h3 className="text-lg font-medium tracking-[-0.02em] text-dema-forest">
                    {item.title}
                  </h3>
                  <p className="mt-3 text-sm leading-6 text-dema-muted">{item.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section
          id="methode"
          aria-labelledby="method-heading"
          className="border-y border-dema-line bg-dema-paper px-5 py-16 sm:px-8 sm:py-20"
        >
          <div className="mx-auto max-w-6xl">
            <h2 id="method-heading" className="demaa-marketing-section-title">
              {content.methodIntro.title}
            </h2>
            <p className="mt-5 max-w-3xl text-base leading-7 text-dema-muted">
              {content.methodIntro.description}
            </p>
            <ol className="mt-11 grid gap-x-10 gap-y-8 md:grid-cols-3">
              {content.method.map((step, index) => (
                <li key={step.title} className="border-t border-dema-line pt-5">
                  <span className="demaa-section-title text-2xl text-dema-forest/48">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <h3 className="mt-4 text-xl font-medium leading-snug tracking-[-0.025em] sm:text-2xl">
                    {step.title}
                  </h3>
                  <p className="mt-3 text-sm leading-6 text-dema-muted">{step.description}</p>
                </li>
              ))}
            </ol>
            <Image
              src="/images/accompagnement/atelier-organisation.png"
              alt="Une dirigeante et son équipe travaillent avec Demaa sur leur parcours commercial et client"
              width={1536}
              height={1024}
              sizes="(min-width: 1024px) 800px, 92vw"
              className="mx-auto mt-10 h-auto w-full max-w-4xl mix-blend-darken"
            />
          </div>
        </section>

        <section aria-labelledby="proof-heading" className="px-5 py-16 sm:px-8 sm:py-20">
          <div className="mx-auto max-w-5xl">
            <h2 id="proof-heading" className="demaa-marketing-section-title">
              {content.testimonialsIntro.title}
            </h2>
            <div className="mt-11 grid gap-x-12 gap-y-8 md:grid-cols-2">
              {content.testimonials.map((testimonial) => (
                <blockquote
                  key={testimonial.attribution}
                  className="flex h-full flex-col border-t border-dema-line pt-5"
                >
                  <p className="text-base leading-7 text-brand-blue">“{testimonial.quote}”</p>
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
                {content.offer.eyebrow}
              </p>
              <h2 id="offer-heading" className="demaa-marketing-section-title mt-4">
                {content.offer.title}
              </h2>
              <p className="mt-5 max-w-2xl text-sm leading-6 text-dema-paper/72">
                {content.offer.scope}
              </p>
              <ul className="mt-7 grid gap-3 sm:grid-cols-2 sm:gap-x-8">
                {content.offerIncludes.map((item) => (
                  <li key={item} className="flex gap-3 text-sm leading-6 text-dema-paper/76">
                    <Check className="mt-1 h-4 w-4 shrink-0 text-dema-sage" aria-hidden="true" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-7 text-2xl font-medium">{content.offer.price}</p>
              <p className="mt-2 text-xs text-dema-paper/62">Pour la mission d’un mois</p>
            </div>
            <div className="flex flex-col items-start sm:items-end">
              <AutomationCallbackControl variant="offer" label="Faire le point ensemble" />
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
          <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(20rem,0.78fr)] lg:gap-16">
            <div>
              <p className="text-sm font-medium text-dema-forest">À la fin de la mission</p>
              <h2 id="ongoing-heading" className="demaa-marketing-section-title mt-4">
                {content.ongoing.title}
              </h2>
            </div>
            <div className="lg:pt-8">
              <p className="max-w-3xl text-base leading-7 text-dema-muted">
                {content.ongoing.description}
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

        <section className="border-t border-dema-line bg-dema-paper px-5 py-16 text-center sm:px-8 sm:py-20">
          <div className="mx-auto max-w-3xl">
            <h2 className="demaa-marketing-section-title">{content.finalCta.title}</h2>
            <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-dema-muted">
              {content.finalCta.description}
            </p>
            <div className="mt-7 flex flex-col items-center">
              <AutomationCallbackControl variant="hero" label="Faire le point ensemble" />
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
