import Link from "next/link";
import { ArrowLeft, ArrowRight, Check, Clock3, ExternalLink } from "lucide-react";
import Navbar from "@/components/Navbar";
import NumberedSectionHeading from "@/components/NumberedSectionHeading";
import ResourcesNavigation from "@/components/ResourcesNavigation";
import type { MethodDefinition } from "@/lib/method-catalog";

export default function MethodArticle({ method }: { method: MethodDefinition }) {
  return (
    <>
      <Navbar minimal publicNavigationActiveView="academy" />
      <main className="min-w-0 max-w-full flex-1 overflow-x-clip bg-background">
        <ResourcesNavigation activeView="tutorials" />
        <article className="mx-auto w-full min-w-0 max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
          <Link
            href="/tutoriels"
            className="inline-flex items-center gap-2 text-sm text-dema-muted transition hover:text-dema-forest"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Retour aux méthodes
          </Link>

          <header className="mx-auto mt-8 max-w-5xl text-left">
            <h1 className="demaa-section-title mt-5 max-w-4xl text-4xl leading-[1.02] tracking-tight text-brand-blue sm:text-5xl lg:text-6xl">
              {method.title}
            </h1>
            <p className="mt-5 max-w-3xl text-base leading-relaxed text-dema-muted sm:text-lg">
              {method.summary}
            </p>
          </header>

          <div className="mx-auto mt-12 grid min-w-0 max-w-5xl gap-10 lg:grid-cols-[minmax(0,1fr)_17rem]">
            <div className="min-w-0 space-y-12">
              <section
                aria-labelledby="method-short-answer-title"
                className="rounded-[1.5rem] bg-dema-forest px-6 py-7 text-dema-paper sm:px-8 sm:py-9"
              >
                <p className="text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-dema-sage">
                  Réponse courte
                </p>
                <h2 id="method-short-answer-title" className="sr-only">
                  Réponse courte à la question
                </h2>
                <div className="mt-4 space-y-4 text-base leading-7 text-dema-paper/88 sm:text-lg sm:leading-8">
                  {method.answer.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
                </div>
              </section>

              {method.sections.map((section, index) => (
                <section key={section.title} aria-labelledby={`method-section-${index + 1}`}>
                  <NumberedSectionHeading
                    id={`method-section-${index + 1}`}
                    number={index + 1}
                    title={section.title}
                  />
                  <div className="mt-5 space-y-4 text-base leading-8 text-dema-muted">
                    {section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
                    {section.items ? (
                      <ul className="space-y-3 pt-1">
                        {section.items.map((item) => (
                          <li key={item} className="flex gap-3">
                            <Check className="mt-1.5 h-4 w-4 shrink-0 text-dema-forest" aria-hidden="true" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </div>
                </section>
              ))}

              <section
                aria-labelledby="method-example-title"
                className="border-y border-dema-line py-8"
              >
                <p className="font-serif text-lg italic text-dema-forest">Exemple construit</p>
                <h2 id="method-example-title" className="mt-2 text-2xl font-medium tracking-[-0.025em] text-brand-blue sm:text-3xl">
                  {method.example.title}
                </h2>
                <div className="mt-5 space-y-4 text-base leading-8 text-dema-muted">
                  {method.example.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
                </div>
              </section>

              <section
                aria-labelledby="method-action-title"
                className="rounded-[1.5rem] border border-dema-forest/15 bg-dema-sage/45 p-6 sm:p-8"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-dema-forest">
                    Une action aujourd’hui
                  </p>
                  <span className="inline-flex items-center gap-1.5 text-xs text-dema-muted">
                    <Clock3 className="h-3.5 w-3.5" aria-hidden="true" />
                    {method.action.duration}
                  </span>
                </div>
                <h2 id="method-action-title" className="mt-3 text-2xl font-medium tracking-[-0.025em] text-brand-blue sm:text-3xl">
                  {method.action.title}
                </h2>
                <p className="mt-4 text-base leading-7 text-dema-muted">{method.action.introduction}</p>
                <ol className="mt-5 space-y-3">
                  {method.action.steps.map((step, index) => (
                    <li key={step} className="flex gap-3 text-sm leading-6 text-brand-blue">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-dema-paper font-serif text-xs text-dema-forest">
                        {index + 1}
                      </span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ol>
                <p className="mt-5 border-t border-dema-forest/10 pt-5 text-sm font-medium leading-6 text-dema-forest">
                  Résultat : {method.action.result}
                </p>
              </section>

              <section aria-labelledby="method-professional-title">
                <h2 id="method-professional-title" className="text-2xl font-medium tracking-[-0.025em] text-brand-blue">
                  Quand faire intervenir un professionnel ?
                </h2>
                <p className="mt-4 text-base leading-8 text-dema-muted">{method.professionalHelp}</p>
              </section>

              <section aria-labelledby="method-sources-title" className="border-t border-dema-line pt-8">
                <h2 id="method-sources-title" className="text-sm font-semibold text-brand-blue">Sources pour approfondir</h2>
                <ul className="mt-4 space-y-3">
                  {method.sources.map((source) => (
                    <li key={source.url}>
                      <a
                        href={source.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-start gap-2 text-sm leading-6 text-dema-muted underline decoration-dema-line underline-offset-4 transition hover:text-dema-forest hover:decoration-dema-forest"
                      >
                        {source.label}
                        <ExternalLink className="mt-1 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                      </a>
                    </li>
                  ))}
                </ul>
              </section>

              <aside className="rounded-[1.5rem] bg-dema-paper p-6 shadow-[0_16px_50px_rgba(23,35,29,0.06)] ring-1 ring-dema-line sm:p-8" aria-labelledby="method-cta-title">
                <h2 id="method-cta-title" className="text-2xl font-medium tracking-[-0.025em] text-brand-blue">
                  {method.cta.title}
                </h2>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-dema-muted">{method.cta.description}</p>
                <Link href={method.cta.href} className="demaa-primary-button mt-6 min-h-11 gap-2 px-5">
                  {method.cta.label}
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </aside>
            </div>

            <aside className="h-fit rounded-[1.5rem] border border-dema-line bg-dema-paper p-6 lg:sticky lg:top-28">
              <h2 className="text-lg font-medium text-brand-blue">À retenir</h2>
              <ul className="mt-4 space-y-4 text-sm leading-relaxed text-dema-muted">
                {method.keyPoints.map((point) => (
                  <li key={point} className="flex gap-2.5">
                    <Check className="mt-1 h-4 w-4 shrink-0 text-dema-forest" aria-hidden="true" />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </aside>
          </div>
        </article>
      </main>
    </>
  );
}
