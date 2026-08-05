import type { Metadata } from "next";
import { Check } from "lucide-react";
import { Suspense } from "react";
import Navbar from "@/components/Navbar";
import OrganisationSessionBookingButton from "@/components/OrganisationSessionBookingButton";
import { surMesurePageContent as content } from "@/lib/sur-mesure-page-content";

const title = "Sur mesure pour simplifier vos processus | Demaa";
const description =
  "Clarifiez un processus critique pour que votre entreprise avance sans dépendre de vous à chaque étape.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/sur-mesure" },
  openGraph: {
    title,
    description,
    url: "/sur-mesure",
    siteName: "Demaa",
    locale: "fr_FR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
  },
};

function BookingFallback() {
  return (
    <button
      type="button"
      disabled
      className="demaa-primary-button min-h-12 w-full justify-center opacity-60 sm:w-auto"
    >
      {content.finalCta.label}
    </button>
  );
}

export default function SurMesurePage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen overflow-x-clip bg-dema-cream text-brand-blue">
        <section className="px-4 pb-16 pt-14 sm:px-6 sm:pb-20 sm:pt-20 lg:px-8">
          <div className="mx-auto max-w-[883px]">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-dema-forest">
              {content.eyebrow}
            </p>
            <h1 className="mt-4 max-w-4xl text-[2.55rem] font-semibold leading-[1.04] tracking-[-0.05em] sm:text-[4.5rem]">
              {content.title}
            </h1>
            <p className="mt-6 max-w-3xl text-lg leading-relaxed text-dema-muted sm:text-xl">
              {content.introduction}
            </p>
          </div>
        </section>

        <section
          aria-labelledby="critical-process-heading"
          className="border-y border-dema-line bg-dema-paper px-4 py-14 sm:px-6 sm:py-16 lg:px-8"
        >
          <div className="mx-auto grid max-w-[883px] gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:gap-14">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-dema-forest">
                Le point de départ
              </p>
              <h2
                id="critical-process-heading"
                className="mt-3 text-3xl font-semibold tracking-[-0.035em] sm:text-4xl"
              >
                {content.criticalProcess.title}
              </h2>
              <p className="mt-4 leading-relaxed text-dema-muted">
                {content.criticalProcess.description}
              </p>
            </div>
            <div aria-label="Exemples de situations" className="grid gap-3 sm:grid-cols-2">
              {content.criticalProcess.examples.map((example) => (
                <div
                  key={example}
                  className="rounded-[1.1rem] border border-dema-line bg-dema-cream p-5 text-sm leading-relaxed text-dema-muted"
                >
                  {example}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section
          aria-labelledby="method-heading"
          className="px-4 py-16 sm:px-6 sm:py-20 lg:px-8"
        >
          <div className="mx-auto max-w-[883px]">
            <h2
              id="method-heading"
              className="text-3xl font-semibold tracking-[-0.035em] sm:text-4xl"
            >
              {content.method.title}
            </h2>
            <ol className="mt-8 grid gap-4 sm:grid-cols-2">
              {content.method.steps.map((step, index) => (
                <li
                  key={step.title}
                  className="rounded-[1.2rem] border border-dema-line bg-dema-paper p-6 shadow-[0_8px_24px_rgba(23,35,29,0.025)]"
                >
                  <span className="text-xs font-semibold tabular-nums text-dema-forest">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <h3 className="mt-4 text-xl font-semibold tracking-[-0.02em]">
                    {step.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-dema-muted">
                    {step.description}
                  </p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section
          aria-labelledby="results-heading"
          className="px-4 pb-16 sm:px-6 sm:pb-20 lg:px-8"
        >
          <div className="mx-auto max-w-[883px] rounded-[1.35rem] bg-dema-forest px-6 py-8 text-dema-paper sm:px-9 sm:py-10">
            <h2
              id="results-heading"
              className="text-3xl font-semibold tracking-[-0.035em]"
            >
              {content.results.title}
            </h2>
            <ul className="mt-6 grid gap-4 sm:grid-cols-2">
              {content.results.items.map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm leading-relaxed">
                  <Check className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section
          aria-labelledby="commercial-model-heading"
          className="border-y border-dema-line bg-dema-paper px-4 py-16 sm:px-6 sm:py-20 lg:px-8"
        >
          <div className="mx-auto max-w-[883px]">
            <h2
              id="commercial-model-heading"
              className="max-w-2xl text-3xl font-semibold tracking-[-0.035em] sm:text-4xl"
            >
              {content.commercialModel.title}
            </h2>
            <div className="mt-8 grid gap-4 lg:grid-cols-3">
              {content.commercialModel.items.map((item) => (
                <article key={item.title} className="rounded-[1.1rem] border border-dema-line bg-dema-cream p-6">
                  <h3 className="text-lg font-semibold">{item.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-dema-muted">
                    {item.description}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          <div className="mx-auto grid max-w-[883px] gap-10 lg:grid-cols-2 lg:gap-14">
            <div aria-labelledby="exclusions-heading">
              <h2
                id="exclusions-heading"
                className="text-2xl font-semibold tracking-[-0.03em] sm:text-3xl"
              >
                {content.exclusions.title}
              </h2>
              <ul className="mt-5 space-y-3 text-sm leading-relaxed text-dema-muted">
                {content.exclusions.items.map((item) => (
                  <li key={item} className="border-l-2 border-dema-line pl-4">
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div aria-labelledby="audience-heading">
              <h2
                id="audience-heading"
                className="text-2xl font-semibold tracking-[-0.03em] sm:text-3xl"
              >
                {content.audience.title}
              </h2>
              <ul className="mt-5 space-y-3 text-sm leading-relaxed text-dema-muted">
                {content.audience.items.map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-dema-forest" aria-hidden="true" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section
          aria-labelledby="faq-heading"
          className="border-t border-dema-line bg-dema-paper px-4 py-16 sm:px-6 sm:py-20 lg:px-8"
        >
          <div className="mx-auto max-w-[883px]">
            <h2
              id="faq-heading"
              className="text-3xl font-semibold tracking-[-0.035em] sm:text-4xl"
            >
              {content.faq.title}
            </h2>
            <div className="mt-7 divide-y divide-dema-line border-y border-dema-line">
              {content.faq.items.map((item) => (
                <details key={item.question} className="group py-5">
                  <summary className="cursor-pointer list-none pr-8 text-base font-semibold marker:hidden">
                    {item.question}
                  </summary>
                  <p className="mt-3 max-w-3xl text-sm leading-relaxed text-dema-muted">
                    {item.answer}
                  </p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section
          aria-labelledby="sur-mesure-cta-heading"
          className="px-4 py-16 sm:px-6 sm:py-20 lg:px-8"
        >
          <div className="mx-auto flex max-w-[883px] flex-col gap-6 rounded-[1.35rem] border border-dema-line bg-dema-paper p-6 shadow-[0_12px_36px_rgba(23,35,29,0.04)] sm:p-9 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <h2
                id="sur-mesure-cta-heading"
                className="text-2xl font-semibold tracking-[-0.03em] sm:text-3xl"
              >
                {content.finalCta.title}
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-dema-muted sm:text-base">
                {content.finalCta.description}
              </p>
            </div>
            <Suspense fallback={<BookingFallback />}>
              <OrganisationSessionBookingButton
                className="demaa-primary-button min-h-12 w-full shrink-0 justify-center sm:w-auto"
                label={content.finalCta.label}
                source="Page sur mesure"
              />
            </Suspense>
          </div>
        </section>
      </main>
    </>
  );
}
