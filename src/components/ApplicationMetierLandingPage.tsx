import { ArrowRight, ArrowUpRight, ChevronDown } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import ActionPlanNavbar from "@/components/ActionPlanNavbar";
import {
  ApplicationDiagnosticButton,
  ApplicationDiagnosticProvider,
} from "@/components/ApplicationDiagnosticExperience";
import Navbar from "@/components/Navbar";
import { surMesurePageContent as content } from "@/lib/sur-mesure-page-content";

const dailyChanges = [
  {
    title: "Moins de tâches chronophages",
    description: "L’application automatise les saisies, les relances et les mises à jour qui vous font perdre du temps.",
  },
  {
    title: "Tout est centralisé",
    description: "Les demandes, les informations et les documents sont réunis au même endroit.",
  },
  {
    title: "Chacun sait quoi faire",
    description: "Les prochaines étapes sont claires et visibles par toute votre équipe.",
  },
] as const;

const projects = [
  {
    name: "Tiimora",
    href: "https://www.tiimora.com/",
    logo: "/portfolio/tiimora-logo.svg",
  },
  {
    name: "Oryka",
    href: "https://pointage-2.vercel.app/",
    logo: "/portfolio/oryka-logo.svg",
  },
  {
    name: "Revyo",
    href: "https://revio-gules.vercel.app/",
    logo: "/portfolio/revyo-logo.svg",
  },
] as const;

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
      <h2
        id={id}
        className="text-[2rem] font-light leading-[1.08] tracking-[-0.04em] text-brand-blue sm:text-[2.65rem]"
      >
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

export default function ApplicationMetierLandingPage() {
  return (
    <ApplicationDiagnosticProvider>
      <Navbar minimal showDiagnostic={false} />
      <ActionPlanNavbar activeView="services" routeNavigation />

      <main className="overflow-x-clip bg-dema-cream pb-24 text-brand-blue xl:pb-0">
        <section className="border-b border-dema-line px-5 pb-20 pt-14 text-center sm:pb-24 sm:pt-20 lg:pb-28 lg:pt-24">
          <div className="mx-auto max-w-5xl">
            <h1 className="mx-auto max-w-4xl text-balance text-[2.7rem] font-light leading-[0.98] tracking-[-0.055em] sm:text-[4rem] lg:text-[5rem]">
              <span className="block text-brand-blue">Gagnez du temps</span>
              <span className="demaa-hero-title mt-2 block text-dema-forest">
                et rendez votre entreprise plus autonome.
              </span>
            </h1>
            <div className="mt-9 flex flex-col items-center gap-3">
              <ApplicationDiagnosticButton className={primaryButtonClassName} />
              <p className="text-xs text-dema-muted">
                Premier échange offert · Sans engagement
              </p>
            </div>
          </div>
        </section>

        <section
          aria-labelledby="daily-change-heading"
          className="px-5 py-16 sm:px-8 sm:py-20 lg:py-24"
        >
          <div className="mx-auto max-w-6xl">
            <SectionIntroduction
              id="daily-change-heading"
              title="Qu’est-ce que l’application change dans votre quotidien ?"
              description="Un outil de travail adapté à votre façon de travailler."
            />
            <div className="mt-12 grid gap-10 md:grid-cols-3 md:gap-12">
              {dailyChanges.map((item) => (
                <article key={item.title}>
                  <h3 className="text-lg font-medium tracking-[-0.025em]">
                    {item.title}
                  </h3>
                  <p className="mt-3 text-sm leading-6 text-dema-muted">
                    {item.description}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section
          aria-labelledby="method-heading"
          className="bg-dema-forest px-5 py-18 text-dema-paper sm:px-8 sm:py-22 lg:py-24"
        >
          <div className="mx-auto max-w-6xl">
            <h2
              id="method-heading"
              className="text-[2rem] font-light leading-[1.08] tracking-[-0.04em] sm:text-[2.65rem]"
            >
              Comment ça se passe concrètement ?
            </h2>
            <ol className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-4 lg:gap-5">
              {content.method.steps.map((step, index) => (
                <li key={step.title} className="relative border-l border-dema-paper/22 pl-5 lg:border-l-0 lg:pl-0 lg:pr-7">
                  <span className="demaa-section-title text-4xl text-dema-sage">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <h3 className="mt-5 text-base font-medium leading-6">
                    {step.title}
                  </h3>
                  {index < content.method.steps.length - 1 ? (
                    <ArrowRight
                      className="absolute right-0 top-2 hidden h-5 w-5 text-dema-sage/75 lg:block"
                      aria-hidden="true"
                    />
                  ) : null}
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section
          aria-labelledby="projects-heading"
          className="border-b border-dema-line px-5 py-16 sm:px-8 sm:py-20 lg:py-24"
        >
          <div className="mx-auto max-w-6xl">
            <SectionIntroduction
              id="projects-heading"
              title="Certaines applications réalisées par notre équipe"
              description="Des outils conçus autour d’un métier et de sa façon de travailler."
            />
            <div className="mt-11 grid border-y border-dema-line sm:grid-cols-2 lg:grid-cols-3">
              {projects.map((project, index) => {
                const sharedClassName = `flex min-h-28 items-center gap-4 px-5 py-6 ${
                  index > 0 ? "border-t border-dema-line sm:border-t-0" : ""
                } ${index % 2 === 1 ? "sm:border-l" : ""} ${index > 1 ? "sm:border-t lg:border-t-0" : ""} ${
                  index > 0 ? "lg:border-l" : ""
                }`;

                return (
                  <Link
                    key={project.name}
                    href={project.href}
                    target="_blank"
                    rel="noreferrer"
                    className={`${sharedClassName} transition hover:bg-dema-sage/45`}
                    aria-label={`Découvrir ${project.name}, nouvelle fenêtre`}
                  >
                    <Image
                      src={project.logo}
                      alt=""
                      width={42}
                      height={42}
                      unoptimized
                    />
                    <span className="text-xl font-medium tracking-[-0.03em]">{project.name}</span>
                    <ArrowUpRight className="ml-auto h-4 w-4 text-dema-forest" aria-hidden="true" />
                  </Link>
                );
              })}
            </div>
          </div>
        </section>

        <section
          aria-labelledby="pricing-heading"
          className="bg-dema-sage px-5 py-16 sm:px-8 sm:py-20"
        >
          <div className="mx-auto grid max-w-6xl gap-9 lg:grid-cols-[0.8fr_1.2fr] lg:items-end lg:gap-16">
            <div>
              <p className="text-sm font-medium text-dema-forest">Tarifs</p>
              <h2
                id="pricing-heading"
                className="mt-4 text-[2.35rem] font-light leading-none tracking-[-0.05em] sm:text-[3.25rem]"
              >
                À partir de 4 500 € HT
              </h2>
              <p className="mt-4 text-sm text-dema-muted">
                Base de calcul : 700 € HT / jour
              </p>
            </div>
            <div className="max-w-2xl">
              <p className="text-base leading-7 text-brand-blue/78">
                Le périmètre, le nombre de jours et le prix total sont confirmés avant le démarrage. Aucun dépassement sans validation.
              </p>
              <ApplicationDiagnosticButton className={`${primaryButtonClassName} mt-7`} />
            </div>
          </div>
        </section>

        <section
          aria-labelledby="faq-heading"
          className="px-5 py-16 sm:px-8 sm:py-20 lg:py-24"
        >
          <div className="mx-auto max-w-5xl">
            <SectionIntroduction id="faq-heading" title="Questions-réponses" />
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
            <h2 className="text-balance text-[2rem] font-light leading-[1.08] tracking-[-0.04em] sm:text-[2.65rem]">
              Quel processus vous fait perdre du temps aujourd’hui ?
            </h2>
            <div className="mt-8 flex flex-col items-center gap-3">
              <ApplicationDiagnosticButton className={primaryButtonClassName} />
              <p className="text-xs text-dema-muted">
                Premier échange offert · Sans engagement
              </p>
            </div>
          </div>
        </section>
      </main>
    </ApplicationDiagnosticProvider>
  );
}
