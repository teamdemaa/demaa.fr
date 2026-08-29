import { ArrowRight, Check, ChevronDown, Workflow } from "lucide-react";
import ApplicationMetierCaseStudies from "@/components/ApplicationMetierCaseStudies";
import AutomationCallbackControl from "@/components/AutomationCallbackControl";
import MentoratAutomationDiagnostic from "@/components/MentoratAutomationDiagnostic";
import Navbar from "@/components/Navbar";
import StructureNewsletterBlock from "@/components/StructureNewsletterBlock";
import { AUTOMATION_CASE_STUDIES } from "@/lib/automation-case-studies";
import { mentoratAutomationContent as content } from "@/lib/mentorat-automation-content";
import { satoshiHeroTitleClassName } from "@/lib/marketing-hero-style";

const automationFlow = [
  "Une demande arrive",
  "Le dossier est créé",
  "La bonne personne est prévenue",
  "Le suivi est mis à jour",
] as const;

const automationAudiences = [
  {
    title: "Le dirigeant",
    description:
      "Pour réduire les relances, mieux suivre l’activité et ne plus être le point de passage de chaque information.",
  },
  {
    title: "L’assistante de direction ou l’office manager",
    description:
      "Pour gagner du temps sur l’organisation, les documents, les demandes internes, les échéances et la coordination.",
  },
  {
    title: "Le référent interne",
    description:
      "Responsable opérations, administratif, finance, commercial ou RH qui souhaite maîtriser les outils et aider ensuite le reste de l’équipe.",
  },
] as const;

export default function MentoratAutomationLandingPage() {
  return (
    <>
      <Navbar
        minimal
        publicCta={<AutomationCallbackControl />}
        publicNavigationActiveView="services"
      />
      <main className="overflow-x-clip bg-dema-cream pb-24 text-brand-blue xl:pb-0">
        <section className="px-5 pb-12 pt-14 text-center sm:px-8 sm:pb-14 sm:pt-20 lg:pt-24">
          <div className="mx-auto max-w-5xl">
            <h1
              aria-label={content.hero.title}
              className={`${satoshiHeroTitleClassName} mx-auto max-w-5xl`}
            >
              <span aria-hidden="true">
                <span className="block">Faites gagner du temps à votre équipe</span>
                <span className="demaa-hero-title mt-2 block text-dema-forest">
                  grâce à l’automatisation.
                </span>
              </span>
            </h1>
            <p className="mx-auto mt-7 max-w-2xl text-base leading-7 text-dema-muted sm:text-lg sm:leading-8">
              {content.hero.description}
            </p>
          </div>
        </section>

        <section aria-labelledby="results-heading" className="border-y border-dema-line bg-dema-paper px-5 py-16 sm:px-8 sm:py-20">
          <div className="mx-auto max-w-6xl">
            <div className="max-w-3xl">
              <p className="text-sm font-medium text-dema-forest">Ce qui change concrètement</p>
              <h2 id="results-heading" className="mt-4 text-[2rem] font-light leading-[1.08] tracking-[-0.04em] sm:text-[2.65rem]">
                <span className="block">Moins de tâches répétitives.</span>
                <span className="demaa-section-title mt-2 block text-dema-forest">
                  Une équipe qui garde la main.
                </span>
              </h2>
            </div>
            <div className="mt-11 grid gap-8 md:grid-cols-3 md:gap-10">
              {content.outcomes.map((outcome, index) => (
                <article key={outcome.title} className="border-t border-dema-line pt-6">
                  <span className="demaa-section-title text-3xl text-dema-forest/45">0{index + 1}</span>
                  <h3 className="mt-5 text-lg font-medium tracking-[-0.025em]">{outcome.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-dema-muted">{outcome.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section
          aria-labelledby="automation-problem-heading"
          className="px-5 py-16 sm:px-8 sm:py-20 lg:py-24"
        >
          <div className="mx-auto max-w-6xl">
            <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-end lg:gap-16">
              <div className="max-w-3xl">
                <p className="text-sm font-medium text-dema-forest">Le vrai problème</p>
                <h2
                  id="automation-problem-heading"
                  className="mt-4 text-[2rem] font-light leading-[1.08] tracking-[-0.04em] sm:text-[2.65rem]"
                >
                  <span className="block">Le problème n’est pas le nombre d’outils.</span>
                  <span className="demaa-section-title mt-2 block text-dema-forest">
                    C’est tout ce qui se passe entre eux.
                  </span>
                </h2>
              </div>
              <div className="max-w-2xl text-base leading-7 text-dema-muted">
                <p>
                  Copier une information, créer un dossier, prévenir un collègue, relancer un client, mettre à jour un tableau… Chaque tâche paraît minime. Mises bout à bout, elles ralentissent toute l’équipe.
                </p>
                <p className="mt-4 font-medium text-brand-blue">
                  L’objectif est d’orchestrer ces petites tâches pour que l’information circule sans intervention inutile.
                </p>
              </div>
            </div>

            <ol className="mt-10 grid overflow-hidden rounded-[1.35rem] bg-dema-forest text-dema-paper lg:grid-cols-4">
              {automationFlow.map((step, index) => (
                <li
                  key={step}
                  className="flex min-h-28 items-center gap-5 border-b border-dema-paper/15 px-6 py-5 last:border-b-0 lg:border-b-0 lg:border-r lg:last:border-r-0"
                >
                  <div>
                    <span className="demaa-section-title text-xl text-dema-sage">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <p className="mt-2 text-sm font-medium leading-5">{step}</p>
                  </div>
                  {index < automationFlow.length - 1 ? (
                    <ArrowRight
                      className="ml-auto h-4 w-4 shrink-0 rotate-90 text-dema-sage lg:rotate-0"
                      aria-hidden="true"
                    />
                  ) : null}
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section
          aria-labelledby="automation-cases-heading"
          className="border-y border-dema-line bg-dema-paper px-5 py-16 sm:px-8 sm:py-20 lg:py-24"
        >
          <div className="mx-auto max-w-6xl">
            <div className="max-w-3xl">
              <p className="text-sm font-medium text-dema-forest">Cas précis</p>
              <h2
                id="automation-cases-heading"
                className="mt-4 text-[2rem] font-light leading-[1.08] tracking-[-0.04em] sm:text-[2.65rem]"
              >
                Trois exemples dans des entreprises concrètes.
              </h2>
              <p className="mt-5 max-w-2xl text-base leading-7 text-dema-muted">
                Cabinet comptable, bâtiment ou maintenance&nbsp;: nous partons du travail réel et des outils déjà présents dans l’entreprise.
              </p>
            </div>
            <ApplicationMetierCaseStudies
              caseStudies={AUTOMATION_CASE_STUDIES}
              variant="automation"
            />
          </div>
        </section>

        <section
          aria-labelledby="automation-audience-heading"
          className="px-5 py-16 sm:px-8 sm:py-20 lg:py-24"
        >
          <div className="mx-auto max-w-6xl">
            <div className="max-w-4xl">
              <p className="text-sm font-medium text-dema-forest">À qui cela s’adresse</p>
              <h2
                id="automation-audience-heading"
                className="mt-4 text-[2rem] font-light leading-[1.08] tracking-[-0.04em] sm:text-[2.65rem]"
              >
                Pour le dirigeant et la personne qui fera fonctionner les automatisations au quotidien.
              </h2>
            </div>

            <div className="mt-11 grid gap-8 md:grid-cols-3 md:gap-10">
              {automationAudiences.map((audience, index) => (
                <article key={audience.title} className="border-t border-dema-line pt-6">
                  <span className="demaa-section-title text-3xl text-dema-forest/45">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <h3 className="mt-5 text-lg font-medium tracking-[-0.025em]">
                    {audience.title}
                  </h3>
                  <p className="mt-3 text-sm leading-6 text-dema-muted">
                    {audience.description}
                  </p>
                </article>
              ))}
            </div>

            <div className="mt-12 grid gap-4 border-t border-dema-line pt-7 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
              <p className="text-lg font-medium leading-7 text-brand-blue">
                Aucun profil technique n’est nécessaire. Il faut surtout bien connaître le fonctionnement quotidien de l’entreprise.
              </p>
              <p className="text-base leading-7 text-dema-muted">
                Nous ne venons pas multiplier les logiciels ni tout faire à la place de votre équipe. Nous aidons une personne clé à comprendre, orchestrer et maintenir les automatisations utiles.
              </p>
            </div>
          </div>
        </section>

        <MentoratAutomationDiagnostic />

        <section aria-labelledby="offer-heading" className="bg-dema-forest px-5 py-16 text-dema-paper sm:px-8 sm:py-20">
          <div className="mx-auto flex max-w-5xl flex-col items-start gap-8 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-2xl">
              <p className="text-sm font-medium text-dema-sage">L’accompagnement</p>
              <h2 id="offer-heading" className="mt-4 text-[2rem] font-light leading-[1.08] tracking-[-0.04em] sm:text-[2.65rem]">
                Passez du diagnostic à la mise en œuvre.
              </h2>
              <p className="mt-5 text-base leading-7 text-dema-paper/72">
                Un accompagnement personnalisé sur 2 mois pour automatiser ce qui compte vraiment et rendre votre équipe autonome.
              </p>
              <p className="mt-6 text-2xl font-medium">{content.offer.price}</p>
            </div>
            <AutomationCallbackControl variant="offer" />
          </div>
        </section>

        <section aria-labelledby="scope-heading" className="bg-dema-sage px-5 py-16 sm:px-8 sm:py-20">
          <div className="mx-auto max-w-6xl">
            <h2 id="scope-heading" className="max-w-3xl text-[2rem] font-light leading-[1.08] tracking-[-0.04em] sm:text-[2.65rem]">
              Un périmètre clair pour obtenir un résultat concret
            </h2>
            <div className="mt-10 grid gap-5 lg:grid-cols-2">
              <article className="rounded-[1.25rem] bg-dema-paper p-6 sm:p-8">
                <h3 className="text-lg font-medium">Ce qui est inclus</h3>
                <ul className="mt-6 space-y-4">
                  {content.included.map((item) => (
                    <li key={item} className="flex gap-3 text-sm leading-6 text-dema-muted">
                      <Check className="mt-1 h-4 w-4 shrink-0 text-dema-forest" aria-hidden="true" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </article>
              <article className="rounded-[1.25rem] border border-dema-forest/15 bg-dema-cream p-6 sm:p-8">
                <h3 className="text-lg font-medium">Ce qui reste hors périmètre</h3>
                <ul className="mt-6 space-y-4">
                  {content.notIncluded.map((item) => (
                    <li key={item} className="flex gap-3 text-sm leading-6 text-dema-muted">
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-dema-forest/45" aria-hidden="true" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </article>
            </div>
          </div>
        </section>

        <section aria-labelledby="faq-heading" className="px-5 py-16 sm:px-8 sm:py-20 lg:py-24">
          <div className="mx-auto max-w-5xl">
            <div className="flex items-center gap-3 text-dema-forest">
              <Workflow className="h-5 w-5" aria-hidden="true" />
              <p className="text-sm font-medium">Questions fréquentes</p>
            </div>
            <h2 id="faq-heading" className="mt-4 text-[2rem] font-light leading-[1.08] tracking-[-0.04em] sm:text-[2.65rem]">
              Avant de démarrer
            </h2>
            <div className="mt-9 divide-y divide-dema-line border-y border-dema-line">
              {content.faq.map((item, index) => (
                <details key={item.question} className="group py-5" open={index === 0}>
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
