import Image from "next/image";
import { Check, ChevronDown } from "lucide-react";
import {
  ApplicationDiagnosticButton,
  ApplicationDiagnosticProvider,
} from "@/components/ApplicationDiagnosticExperience";
import ApplicationMetierCaseStudies from "@/components/ApplicationMetierCaseStudies";
import Navbar from "@/components/Navbar";
import { APPLICATION_METIER_CASE_STUDIES } from "@/lib/application-metier-case-studies";
import { satoshiHeroTitleClassName } from "@/lib/marketing-hero-style";
import { surMesurePageContent as content } from "@/lib/sur-mesure-page-content";

const primaryButtonClassName =
  "inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-dema-forest px-7 text-sm font-semibold text-white transition hover:bg-[#284f3a] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dema-forest/35 focus-visible:ring-offset-2";

function SectionIntroduction({
  title,
  description,
  id,
}: {
  title: string;
  description?: string;
  id: string;
}) {
  return (
    <div className="max-w-3xl">
      <h2 id={id} className="demaa-marketing-section-title text-brand-blue">
        {title}
      </h2>
      {description ? (
        <p className="mt-4 max-w-2xl text-base leading-7 text-dema-muted">
          {description}
        </p>
      ) : null}
    </div>
  );
}

export default function ApplicationMetierLandingPage({
  offer,
}: {
  offer: {
    included: readonly string[];
    pricing: { label: string; note: string };
  };
}) {
  return (
    <ApplicationDiagnosticProvider>
      <Navbar minimal publicNavigationActiveView="services" />

      <main className="overflow-x-clip bg-dema-cream pb-24 text-brand-blue xl:pb-0">
        <section className="border-b border-dema-line px-5 py-12 text-center sm:px-8 sm:py-16 lg:py-20">
          <div className="mx-auto max-w-5xl">
            <div>
              <h1
                aria-label={content.hero.title}
                className={`${satoshiHeroTitleClassName} mx-auto max-w-5xl`}
              >
                <span aria-hidden="true">
                  <span className="block">Nous créons votre logiciel métier</span>
                  <span className="demaa-hero-title mt-2 block text-dema-forest">
                    sur mesure.
                  </span>
                </span>
              </h1>
              <p className="mx-auto mt-7 max-w-3xl text-base leading-7 text-dema-muted sm:text-lg sm:leading-8">
                {content.hero.introduction}
              </p>
              <div className="mt-8 flex flex-col items-center gap-3">
                <ApplicationDiagnosticButton
                  className={primaryButtonClassName}
                  label={content.hero.ctaLabel}
                />
                <p className="text-xs text-dema-muted">{content.hero.reassurance}</p>
              </div>
            </div>

            <Image
              src="/images/sur-mesure/logiciel-metier-sur-mesure-v8.png"
              alt="Des informations dispersées dans un tableur, des e-mails et des documents sont réunies dans un logiciel métier"
              width={1488}
              height={691}
              sizes="(min-width: 1024px) 800px, 92vw"
              className="mx-auto mt-9 h-auto w-[92%] max-w-3xl mix-blend-multiply sm:w-full"
              priority
            />
          </div>
        </section>

        <section
          aria-labelledby="starting-point-heading"
          className="px-5 py-16 sm:px-8 sm:py-20"
        >
          <div className="mx-auto max-w-6xl">
            <SectionIntroduction
              id="starting-point-heading"
              title={content.startingPoint.title}
              description={content.startingPoint.description}
            />
            <div className="mt-11 grid overflow-hidden rounded-[1.4rem] border border-dema-line bg-dema-paper md:grid-cols-3">
              {content.startingPoint.transformations.map((item, index) => (
                <article
                  key={item.before}
                  className={`p-6 sm:p-7 ${index > 0 ? "border-t border-dema-line md:border-l md:border-t-0" : ""}`}
                >
                  <p className="text-sm text-dema-muted line-through decoration-dema-muted/45">
                    {item.before}
                  </p>
                  <p className="mt-4 text-xl font-medium tracking-[-0.025em] text-dema-forest">
                    {item.after}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section
          aria-labelledby="projects-heading"
          className="border-y border-dema-line px-5 py-16 sm:px-8 sm:py-20"
        >
          <div className="mx-auto max-w-6xl">
            <SectionIntroduction
              id="projects-heading"
              title="Des logiciels construits pour des situations concrètes"
              description="Trois situations réelles. Chaque cas détaille le problème, l’outil construit et les étapes de travail réunies dans le logiciel."
            />
            <ApplicationMetierCaseStudies caseStudies={APPLICATION_METIER_CASE_STUDIES} />
          </div>
        </section>

        <section
          aria-labelledby="method-heading"
          className="border-y border-dema-line bg-dema-paper px-5 py-16 text-brand-blue sm:px-8 sm:py-20"
        >
          <div className="mx-auto grid max-w-6xl items-start gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
            <div className="lg:sticky lg:top-28">
              <h2 id="method-heading" className="demaa-marketing-section-title">
                {content.method.title}
              </h2>
              <p className="mt-4 max-w-xl text-base leading-7 text-dema-muted">
                {content.method.description}
              </p>
              <Image
                src="/images/accompagnement/atelier-organisation-afro.png"
                alt="Trois membres d’une équipe, dont une femme voilée, cadrent ensemble les étapes d’un processus"
                width={1536}
                height={1024}
                sizes="(min-width: 1024px) 42vw, 100vw"
                className="mt-7 h-auto w-full mix-blend-multiply"
              />
            </div>
            <ol className="border-t border-dema-line">
              {content.method.steps.map((step, index) => (
                <li
                  key={step.title}
                  className="grid gap-4 border-b border-dema-line py-6 sm:grid-cols-[4rem_1fr] sm:gap-6"
                >
                  <span className="demaa-section-title text-3xl text-dema-forest">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <h3 className="text-base font-medium leading-6">{step.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-dema-muted">
                      {step.description}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section
          aria-labelledby="pricing-heading"
          className="bg-dema-sage px-5 py-16 sm:px-8 sm:py-20"
        >
          <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[0.78fr_1.22fr] lg:gap-16">
            <div>
              <p className="text-sm font-medium text-dema-forest">Tarif</p>
              <h2
                id="pricing-heading"
                className="mt-4 text-[2.35rem] font-light leading-none tracking-[-0.05em] sm:text-[3.25rem]"
              >
                {offer.pricing.label}
              </h2>
              <p className="mt-5 max-w-sm text-sm leading-6 text-dema-muted">
                Base de calcul : 700 € HT / jour. Le périmètre et le prix total sont confirmés avant le démarrage.
              </p>
              <ApplicationDiagnosticButton
                className={`${primaryButtonClassName} mt-7`}
                label={content.hero.ctaLabel}
              />
            </div>
            <div className="rounded-[1.4rem] bg-dema-paper p-6 sm:p-8">
              <h3 className="text-xl font-medium tracking-[-0.025em] text-brand-blue">
                Ce qui est inclus
              </h3>
              <ul className="mt-6 divide-y divide-dema-line border-y border-dema-line">
                {offer.included.map((item) => (
                  <li key={item} className="flex gap-3 py-4 text-sm leading-6 text-brand-blue/80">
                    <Check className="mt-1 h-4 w-4 shrink-0 text-dema-forest" aria-hidden="true" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-5 text-xs leading-5 text-dema-muted">{offer.pricing.note}</p>
            </div>
          </div>
        </section>

        <section
          aria-labelledby="faq-heading"
          className="px-5 py-16 sm:px-8 sm:py-20"
        >
          <div className="mx-auto max-w-5xl">
            <SectionIntroduction id="faq-heading" title="Questions fréquentes" />
            <div className="mt-9 divide-y divide-dema-line border-y border-dema-line">
              {content.faq.items.map((item, index) => (
                <details key={item.question} className="group py-5" open={index === 0}>
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-5 text-base font-medium marker:hidden">
                    <span>{item.question}</span>
                    <ChevronDown className="h-4 w-4 shrink-0 text-dema-forest transition group-open:rotate-180" aria-hidden="true" />
                  </summary>
                  <p className="mt-3 max-w-3xl pr-9 text-sm leading-6 text-dema-muted">
                    {item.answer}
                  </p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-dema-sage/55 px-5 py-16 text-center sm:px-8 sm:py-20">
          <div className="mx-auto max-w-4xl">
            <h2 className="demaa-marketing-section-title text-balance">
              {content.finalCta.title}
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-dema-muted">
              {content.finalCta.description}
            </p>
            <div className="mt-8 flex flex-col items-center gap-3">
              <ApplicationDiagnosticButton
                className={primaryButtonClassName}
                label={content.finalCta.label}
              />
              <p className="text-xs text-dema-muted">{content.finalCta.reassurance}</p>
            </div>
          </div>
        </section>
      </main>
    </ApplicationDiagnosticProvider>
  );
}
