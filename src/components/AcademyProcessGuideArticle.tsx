"use client";

import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import OrganiserProcessMap from "@/components/OrganiserProcessMap";
import type { AcademyContentDefinition } from "@/lib/academy-course-content";
import { buildOrganiserHref } from "@/lib/organiser-navigation";
import { getPublishedCopyableModelForOrganiserSlug } from "@/lib/copyable-model-catalog";

type AcademyProcessGuideArticleProps = {
  content: AcademyContentDefinition;
  embedded?: boolean;
  onBack?: () => void;
};

export default function AcademyProcessGuideArticle({
  content,
  embedded = false,
  onBack,
}: AcademyProcessGuideArticleProps) {
  const guide = content.processGuide;
  if (!guide) return null;
  const relatedModel = getPublishedCopyableModelForOrganiserSlug(
    content.identity.slug,
  );
  const ArticleContainer = embedded ? "div" : "main";
  const isPlumbingGoldenMaster =
    content.identity.slug === "organiser-entreprise-plomberie";

  return (
    <ArticleContainer className={embedded ? "min-h-[60vh] bg-[#FAFAFA]" : "min-h-[calc(100vh-72px)] bg-[#FAFAFA]"}>
      <article className="mx-auto max-w-4xl px-5 pb-24 pt-6 sm:px-7 sm:pt-10">
        <div className="mb-11">
          {embedded && onBack ? (
            <button
              type="button"
              onClick={onBack}
              className="inline-flex min-h-11 items-center gap-2 text-sm font-medium text-dema-muted transition hover:text-dema-forest focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dema-forest/35 focus-visible:ring-offset-2"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Retour aux cas concrets
            </button>
          ) : (
            <Link
              href={buildOrganiserHref({ tab: "processus" })}
              className="inline-flex min-h-11 items-center gap-2 text-sm font-medium text-dema-muted transition hover:text-dema-forest focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dema-forest/35 focus-visible:ring-offset-2"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Retour aux cas concrets
            </Link>
          )}
        </div>

        <header>
          <p className="text-xs font-semibold uppercase tracking-[0.17em] text-dema-forest">
            {guide.sector} · {content.identity.durationMinutes} min
          </p>
          <h1 className="mt-5 text-balance font-serif text-[2.65rem] font-light leading-[1.02] tracking-[-0.045em] text-[#1F2D25] sm:text-[4.25rem]">
            {content.identity.title}
          </h1>
          <p className="mt-7 max-w-3xl text-lg leading-8 text-dema-muted sm:text-xl">
            {content.identity.promise}
          </p>
        </header>

        <section
          className="mt-12 border-l-2 border-dema-forest/40 pl-5 sm:mt-14 sm:pl-6"
          aria-label="Situation de l’entreprise"
        >
          <p className="font-medium leading-8 text-brand-blue">
            {guide.company.profile}
          </p>
          <p className="mt-3 leading-8 text-dema-muted">
            {guide.company.friction}
          </p>
        </section>

        <section className="mt-14 sm:mt-16" aria-labelledby="process-title">
          <h2 id="process-title" className="text-2xl font-semibold tracking-[-0.025em] text-[#25352C] sm:text-3xl">
            {guide.processTitle}
          </h2>
          <p className="mt-5 leading-8 text-dema-muted">
            {guide.processIntroduction}
          </p>
          <div className="mt-2">
            <OrganiserProcessMap steps={guide.steps} />
          </div>
        </section>

        {relatedModel ? (
          <aside className="mt-8 flex flex-col gap-5 rounded-[1.15rem] border border-dema-forest/15 bg-dema-sage/45 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-7">
            <div className="max-w-2xl">
              <p className="text-xs font-medium uppercase tracking-[0.16em] text-dema-forest">
                Modèle prêt à copier
              </p>
              <h2 className="mt-2 text-xl font-light tracking-[-0.025em] text-brand-blue sm:text-2xl">
                {relatedModel.title}
              </h2>
              <p className="mt-2 text-sm leading-6 text-dema-muted">
                {relatedModel.description}
              </p>
            </div>
            <Link
              href={`/modeles/${relatedModel.slug}`}
              className="demaa-secondary-button min-h-11 shrink-0 gap-2 px-5"
            >
              Voir le modèle
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </aside>
        ) : null}

        <section className="mt-16" aria-labelledby="rules-title">
          <h2 id="rules-title" className="text-2xl font-semibold tracking-[-0.025em] text-[#25352C] sm:text-3xl">
            {guide.rulesTitle}
          </h2>
          <ol className="mt-6 divide-y divide-dema-line border-y border-dema-line">
            {guide.rules.map((rule, index) => (
              <li key={rule.title} className="grid grid-cols-[2rem_1fr] gap-4 py-5">
                <span className="font-serif text-xl text-dema-forest" aria-hidden="true">
                  {index + 1}
                </span>
                <div>
                  <h3 className="font-semibold text-[#25352C]">{rule.title}</h3>
                  <p className="mt-1.5 leading-7 text-dema-muted">{rule.description}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section
          className="mt-10 rounded-[1.15rem] bg-[#F0F4F1] p-6 sm:p-7"
          aria-label="Exemple concret"
        >
          <p className="leading-8 text-dema-muted">
            <strong className="font-semibold text-[#25352C]">
              Exemple : {guide.example.title}.
            </strong>{" "}
            {guide.example.body}
          </p>
        </section>

        {guide.tools.length ? (
          <section className="mt-16" aria-labelledby="tools-title">
            <h2 id="tools-title" className="text-2xl font-semibold tracking-[-0.025em] text-[#25352C] sm:text-3xl">
              {isPlumbingGoldenMaster
                ? "Quel logiciel choisir pour gérer les interventions ?"
                : guide.toolsTitle ?? "Quels logiciels choisir pour soutenir ce processus ?"}
            </h2>
            <p className="mt-4 leading-7 text-dema-muted">
              {guide.toolsIntroduction
                ?? "Choisissez d’abord une solution métier unique. Les automatisations viennent ensuite, lorsque le circuit fonctionne déjà sans ambiguïté."}
            </p>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {guide.tools.map((tool, index) => (
                <Link
                  key={tool.slug}
                  href={`/annuaire-outils/${tool.slug}`}
                  className="group rounded-[1.15rem] border border-dema-line bg-white p-5 transition hover:-translate-y-0.5 hover:border-dema-forest/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dema-forest/35 focus-visible:ring-offset-2"
                >
                  <p className="mb-3 text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-dema-forest">
                    {index === 0 ? "Recommandation" : "Alternative"}
                  </p>
                  <div className="flex items-center justify-between gap-4">
                    <h3 className="text-lg font-semibold text-brand-blue">{tool.name}</h3>
                    <ArrowRight className="h-4 w-4 text-dema-forest transition group-hover:translate-x-0.5" aria-hidden="true" />
                  </div>
                  <p className="mt-3 text-sm leading-6 text-dema-muted">{tool.description}</p>
                </Link>
              ))}
            </div>
            <Link
              href={buildOrganiserHref({
                tab: "solutions",
                systemId: guide.system.slug,
              })}
              className="demaa-primary-button mt-7 inline-flex min-h-12 items-center gap-2"
            >
              Voir les solutions {guide.system.label}
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </section>
        ) : null}

        <section className="mt-16 border-y border-dema-line py-9" aria-labelledby="checklist-title">
          <h2 id="checklist-title" className="text-2xl font-semibold text-[#25352C] sm:text-3xl">
            Les premières actions à mettre en place
          </h2>
          <ul className="mt-6 space-y-4">
            {guide.checklist.map((item) => (
              <li key={item} className="grid grid-cols-[1.25rem_1fr] gap-3 leading-7 text-brand-blue">
                <span className="mt-1.5 h-2.5 w-2.5 rounded-full border border-dema-forest/55" aria-hidden="true" />
                {item}
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-16" aria-labelledby="faq-title">
          <h2 id="faq-title" className="text-2xl font-semibold text-[#25352C] sm:text-3xl">Questions fréquentes</h2>
          <div className="mt-6 divide-y divide-dema-line border-y border-dema-line">
            {guide.faqs.map((faq) => (
              <details key={faq.question} className="group py-6">
                <summary className="cursor-pointer list-none font-semibold text-[#25352C] marker:content-none">
                  {faq.question}
                </summary>
                <p className="mt-2 leading-7 text-dema-muted">{faq.answer}</p>
              </details>
            ))}
          </div>
        </section>

        <footer className="mt-14 rounded-[1.15rem] bg-[#E4EFE8] px-6 py-7 sm:px-8">
          <p className="text-lg font-medium leading-8 text-[#294436]">{guide.conclusion}</p>
        </footer>
      </article>
    </ArticleContainer>
  );
}
