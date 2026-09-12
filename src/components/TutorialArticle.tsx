import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Check, Clock3, Copy } from "lucide-react";
import CopyableTutorialTable from "@/components/CopyableTutorialTable";
import Navbar from "@/components/Navbar";
import NumberedSectionHeading from "@/components/NumberedSectionHeading";
import { getPublishedCopyableModelBySlug } from "@/lib/copyable-model-catalog";
import type { TutorialDefinition } from "@/lib/tutorial-catalog";

export default function TutorialArticle({ tutorial }: { tutorial: TutorialDefinition }) {
  const model = getPublishedCopyableModelBySlug(tutorial.modelSlug);

  return (
    <>
      <Navbar minimal publicNavigationActiveView="academy" />
      <main className="flex-1 bg-background">
        <article className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
          <Link
            href="/tutoriels"
            className="inline-flex items-center gap-2 text-sm text-dema-muted transition hover:text-dema-forest"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Retour aux tutoriels
          </Link>

          <header className="mx-auto mt-8 max-w-5xl text-left">
            <div className="flex flex-wrap items-center gap-2 text-xs text-dema-muted">
              <span className="rounded-full bg-dema-sage/65 px-3 py-1 font-medium text-dema-forest">
                Tutoriel · {tutorial.tool}
              </span>
              <span>{tutorial.category}</span>
              <span aria-hidden="true">·</span>
              <span className="inline-flex items-center gap-1.5">
                <Clock3 className="h-3.5 w-3.5" aria-hidden="true" />
                {tutorial.minutes} min
              </span>
            </div>
            <h1 className="demaa-section-title mt-5 text-4xl leading-tight tracking-tight text-brand-blue sm:text-5xl lg:text-6xl">
              {tutorial.title}
            </h1>
            <p className="mt-5 max-w-3xl text-base font-normal leading-relaxed text-dema-muted sm:text-lg">
              {tutorial.summary}
            </p>
          </header>

          <div className="mx-auto mt-14 grid max-w-5xl gap-10 lg:grid-cols-[minmax(0,1fr)_17rem]">
            <div className="space-y-12">
              <section aria-labelledby="tutorial-structure-title">
                <NumberedSectionHeading
                  id="tutorial-structure-title"
                  number={1}
                  title="La structure à reproduire"
                />
                <p className="mb-5 mt-4 text-base leading-8 text-dema-muted">
                  Vous pouvez copier ce tableau dans Airtable, Excel ou Google Sheets. Si vous utilisez le modèle Demaa, ces champs sont déjà préparés et reliés aux bonnes tables.
                </p>
                <CopyableTutorialTable fields={tutorial.fields} />
              </section>

              <section aria-labelledby="tutorial-steps-title">
                <NumberedSectionHeading
                  id="tutorial-steps-title"
                  number={2}
                  title="Le tutoriel, étape par étape"
                />
                <div className="mt-7 space-y-12">
                  {tutorial.steps.map((step, index) => (
                    <section key={step.title} aria-labelledby={`tutorial-step-${index + 1}`}>
                      <div className="flex gap-4">
                        <span
                          aria-hidden="true"
                          className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-dema-forest/20 text-sm font-medium text-dema-forest"
                        >
                          {index + 1}
                        </span>
                        <div className="min-w-0 flex-1">
                          <h3 id={`tutorial-step-${index + 1}`} className="text-xl font-medium tracking-[-0.02em] text-brand-blue sm:text-2xl">
                            {step.title}
                          </h3>
                          <div className="mt-3 space-y-4 text-base leading-8 text-dema-muted">
                            {step.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
                            {step.items ? (
                              <ul className="space-y-2.5 pt-1">
                                {step.items.map((item) => (
                                  <li key={item} className="flex gap-2.5">
                                    <Check className="mt-1.5 h-4 w-4 shrink-0 text-dema-forest" aria-hidden="true" />
                                    <span>{item}</span>
                                  </li>
                                ))}
                              </ul>
                            ) : null}
                          </div>
                        </div>
                      </div>

                      {step.screenshot ? (
                        <figure className="mt-6 overflow-hidden rounded-[1.25rem] border border-dema-line bg-dema-paper shadow-[0_14px_36px_rgba(23,35,29,0.04)]">
                          <div className="relative aspect-[8/5] w-full overflow-hidden bg-[#f4f4f5]">
                            <Image
                              src={step.screenshot.src}
                              alt={step.screenshot.alt}
                              fill
                              sizes="(min-width: 1024px) 750px, 100vw"
                              className="object-cover object-top"
                            />
                          </div>
                          <figcaption className="border-t border-dema-line px-4 py-3 text-xs leading-5 text-dema-muted sm:px-5">
                            {step.screenshot.caption}
                          </figcaption>
                        </figure>
                      ) : null}
                    </section>
                  ))}
                </div>
              </section>

              {model ? (
                <aside className="rounded-[1.25rem] border border-dema-forest/15 bg-dema-sage/45 p-6 sm:p-8" aria-labelledby="tutorial-model-title">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-dema-paper text-dema-forest">
                    <Copy className="h-4 w-4" aria-hidden="true" />
                  </div>
                  <p className="mt-5 text-xs font-semibold uppercase tracking-[0.14em] text-dema-forest">
                    Le modèle utilisé dans ce tutoriel
                  </p>
                  <h2 id="tutorial-model-title" className="mt-3 text-2xl font-light tracking-[-0.025em] text-brand-blue sm:text-3xl">
                    {model.title}
                  </h2>
                  <p className="mt-3 max-w-2xl text-sm leading-6 text-dema-muted">
                    {model.description}
                  </p>
                  <Link
                    href={`/modeles/${model.slug}?from=tutoriels`}
                    className="demaa-secondary-button mt-6 min-h-11 gap-2 px-5"
                  >
                    Copier le modèle
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </Link>
                </aside>
              ) : null}
            </div>

            <aside className="h-fit rounded-[1.5rem] border border-dema-line bg-dema-paper p-6 lg:sticky lg:top-28">
              <h2 className="text-lg font-medium text-brand-blue">À retenir</h2>
              <ul className="mt-4 space-y-4 text-sm leading-relaxed text-dema-muted">
                {tutorial.keyPoints.map((point) => (
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
