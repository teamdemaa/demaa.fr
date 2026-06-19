"use client";

import { ArrowRight, Check, CircleDollarSign, Clock3, FolderKanban, Mail } from "lucide-react";
import Navbar from "@/components/Navbar";
import type { DemaaService } from "@/lib/service-catalog";

const ASSISTANT_BOOKING_URL = "https://calendar.app.google/Ka6UkXZeQ7keLKcLA";

const offerHighlights = [
  "Organisation, structuration, suivi et bases administratives travaillés en amont",
  "Montée en compétence mieux cadrée pour éviter de tout porter seul",
  "Intégration plus fluide dans votre activité et vos outils",
] as const;

const offerTimeline = [
  {
    step: "Étape 1",
    title: "1 mois de formation à temps plein",
    description:
      "Formation prise en charge pour poser les bases de l'organisation, de la structuration et des routines administratives.",
  },
  {
    step: "Étape 2",
    title: "12 mois d'alternance",
    description:
      "L'assistante est en entreprise 4 jours par semaine pour reprendre progressivement l'administratif du quotidien.",
  },
] as const;

const comparisonDetails = [
  {
    title: "Assistante polyvalente salariée",
    amount: "2 579,56 € / mois",
    description: "Repère de coût employeur pour 1 700 € net / mois",
    emphasis: false,
  },
  {
    title: "Avec Demaa (POEI + alternance)",
    amount: "Entre ... et 1 450,35 € / mois",
    description: "Aide déduite, selon l'âge et le profil recruté",
    emphasis: true,
  },
] as const;

const responsibilities = [
  {
    icon: FolderKanban,
    title: "Devis, factures, documents",
    description: "Préparer, trier, suivre et classer les documents du quotidien.",
  },
  {
    icon: Mail,
    title: "Emails, relances, suivi",
    description: "Gérer les échanges, relancer et garder le fil au quotidien.",
  },
  {
    icon: CircleDollarSign,
    title: "Tableaux, CRM, coordination",
    description: "Mettre à jour les tableaux et suivre les dossiers utiles à l'équipe.",
  },
  {
    icon: Clock3,
    title: "Organisation & outils",
    description: "Structurer les dossiers et fluidifier le travail administratif.",
  },
] as const;

export default function AssistantPolyvalentLanding({
}: {
  service: DemaaService;
}) {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-dema-cream text-brand-blue">
        <section className="ml-[calc(50%-50vw)] mr-[calc(50%-50vw)] w-screen bg-dema-cream px-4 pb-8 pt-5 text-center md:px-8 md:pb-10 md:pt-16">
          <div className="mx-auto max-w-6xl space-y-6 md:space-y-7">
            <div className="mx-auto max-w-5xl demaa-fade-up">
              <h1 className="mt-4 text-[clamp(2.3rem,8vw,4.5rem)] leading-[0.96] tracking-tight">
                <span className="demaa-hero-title text-brand-blue/86">
                  Recrutez un(e) assistant(e)
                </span>
                <br />
                <span className="font-sans font-light not-italic text-brand-blue/56">
                  polyvalent(e).
                </span>
              </h1>
              <p className="mx-auto mt-5 max-w-2xl text-sm leading-relaxed text-dema-muted md:text-base">
                Déléguez votre administratif à la bonne personne, déjà opérationnelle pour
                reprendre les bases utiles de la gestion d&apos;entreprise sans que tout
                repose sur vous.
              </p>

              <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <a
                  href={ASSISTANT_BOOKING_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex min-w-[13rem] items-center justify-center rounded-full bg-dema-forest px-5 py-3 text-sm font-semibold text-dema-paper transition hover:bg-brand-blue"
                >
                  Prendre rendez-vous
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </a>
                <a
                  href="#missions"
                  className="inline-flex min-w-[13rem] items-center justify-center rounded-full border border-dema-line bg-dema-paper px-5 py-3 text-sm font-semibold text-brand-blue transition hover:border-dema-forest/25 hover:text-dema-forest"
                >
                  Voir les missions
                </a>
              </div>
              <p className="mt-3 text-xs leading-relaxed text-dema-muted">
                Simulation indicative et sans engagement.
              </p>
            </div>
          </div>
        </section>

        <section className="mx-auto w-full max-w-6xl px-4 pb-24 md:px-8 md:pb-36">
          <div className="border-t border-dema-line/65 pt-14 md:pt-20">
            <div>
              <article className="demaa-fade-up rounded-[1.2rem] border border-dema-line/70 bg-dema-paper px-5 py-6 md:px-7 md:py-8">
                <p className="inline-flex rounded-full bg-dema-forest/10 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-dema-forest">
                  Offre Demaa
                </p>
                <div className="mt-5 grid gap-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(20rem,0.95fr)] lg:items-start">
                  <div>
                    <h2 className="max-w-2xl text-2xl font-semibold tracking-tight text-brand-blue md:text-3xl">
                      Vous déléguez à la bonne personne, déjà opérationnelle pour reprendre l&apos;administratif.
                    </h2>
                    <p className="mt-4 max-w-2xl text-sm leading-relaxed text-dema-muted md:text-base">
                      Le parcours est pensé pour que vous n&apos;ayez pas à tout construire seul.
                      Nous formons d&apos;abord à l&apos;organisation et à la structuration, puis
                      l&apos;alternance permet de prendre le relais directement dans votre
                      entreprise, au rythme du terrain.
                    </p>
                    <div className="mt-6 space-y-3">
                      {offerHighlights.map((item) => (
                        <div key={item} className="flex gap-3">
                          <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-dema-sage text-dema-forest">
                            <Check className="h-3.5 w-3.5" aria-hidden="true" />
                          </span>
                          <p className="text-sm leading-relaxed text-dema-muted">{item}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-[1rem] bg-dema-sage/35 p-4 md:p-5">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-dema-forest">
                      Le parcours en 2 temps
                    </p>
                    <div className="mt-4 divide-y divide-dema-forest/10">
                      {offerTimeline.map((item, index) => (
                        <div
                          key={item.step}
                          className={index === 0 ? "pb-4" : "pt-4"}
                        >
                          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-dema-forest/80">
                            {item.step}
                          </p>
                          <h3 className="mt-2 text-lg font-semibold tracking-tight text-brand-blue">
                            {item.title}
                          </h3>
                          <p className="mt-2 text-sm leading-relaxed text-dema-muted">
                            {item.description}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </article>
            </div>

            <div id="missions" className="mt-20 scroll-mt-24 md:mt-28">
              <div className="mx-auto max-w-3xl text-center demaa-fade-up">
                <h2 className="text-2xl font-semibold tracking-tight text-brand-blue md:text-3xl">
                  Ce qu&apos;un(e) assistant(e) polyvalent(e) peut reprendre
                </h2>
                <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-dema-muted md:text-base">
                  L&apos;objectif n&apos;est pas seulement d&apos;ajouter un renfort. C&apos;est de
                  vous permettre de déléguer à la bonne personne, déjà opérationnelle sur
                  les routines administratives d&apos;une petite entreprise.
                </p>
              </div>

              <div className="mx-auto mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {responsibilities.map((item, index) => (
                  <article
                    key={item.title}
                    className={`demaa-fade-up demaa-lift-soft rounded-[1rem] border border-dema-line/70 bg-dema-paper px-4 py-5 md:min-h-[13rem] md:px-5 ${
                      index === 0
                        ? "demaa-delay-1"
                        : index === 1
                          ? "demaa-delay-2"
                          : index === 2
                            ? "demaa-delay-3"
                            : "demaa-delay-4"
                    }`}
                  >
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-dema-sage/55 text-dema-forest">
                      <item.icon className="demaa-icon-float h-4.5 w-4.5" aria-hidden="true" />
                    </span>
                    <h3 className="mt-4 text-[1.05rem] font-medium leading-snug text-brand-blue md:text-[1.2rem]">
                      {item.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-dema-muted">
                      {item.description}
                    </p>
                  </article>
                ))}
              </div>
            </div>

            <div className="mt-20 md:mt-28">
              <article
                id="comparaison"
                className="demaa-fade-up demaa-delay-1 rounded-[1rem] border border-dema-line/70 bg-dema-paper px-5 py-6 scroll-mt-24"
              >
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-dema-forest">
                  Repère de coût
                </p>
                <h2 className="mt-3 max-w-xl text-xl font-semibold tracking-tight text-brand-blue md:text-2xl">
                  Un coût plus accessible qu&apos;une embauche classique
                </h2>
                <p className="mt-3 max-w-xl text-sm leading-relaxed text-dema-muted">
                  En plus du gain de temps et du niveau de préparation du profil, le coût
                  reste souvent plus léger qu&apos;une embauche classique sur un poste
                  administratif.
                </p>
                <div className="mt-6 grid gap-5 lg:grid-cols-2">
                  {comparisonDetails.map((item) => (
                    <div
                      key={item.title}
                      className={`rounded-[0.9rem] border px-4 py-4 ${
                        item.emphasis
                          ? "border-dema-forest/15 bg-dema-sage/35"
                          : "border-dema-line/70 bg-dema-paper"
                      }`}
                    >
                      <p className="text-sm font-semibold text-brand-blue">{item.title}</p>
                      <p
                        className={`mt-2 text-3xl font-semibold tracking-tight ${
                          item.emphasis ? "text-dema-forest" : "text-brand-blue"
                        }`}
                      >
                        {item.amount}
                      </p>
                      <p className="mt-1 text-sm leading-relaxed text-dema-muted">
                        {item.description}
                      </p>
                    </div>
                  ))}
                </div>
                <p className="mt-4 text-xs leading-relaxed text-dema-muted">
                  Comparaison indicative. Le coût réel peut varier selon votre convention,
                  les charges applicables, l&apos;âge du candidat et les aides mobilisables.
                </p>
              </article>
            </div>

            <div className="mt-20 md:mt-28 demaa-fade-up">
              <div className="rounded-[1rem] border border-dema-line/70 bg-dema-paper px-5 py-12 text-center shadow-[0_18px_50px_rgba(23,35,29,0.04)] md:px-12 md:py-16">
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-dema-forest">
                  Prochaine étape
                </p>
                <h2 className="mx-auto mt-4 max-w-3xl text-3xl font-semibold tracking-tight text-brand-blue md:text-4xl">
                  Passez à la délégation avec un profil déjà opérationnel.
                </h2>
                <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-dema-muted md:text-lg">
                  On regarde ensemble si ce format correspond à vos besoins, à vos tâches
                  et au niveau d&apos;autonomie que vous cherchez.
                </p>
                <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                  <a
                    href={ASSISTANT_BOOKING_URL}
                    target="_blank"
                    rel="noreferrer"
                    className="demaa-primary-button inline-flex items-center gap-2 px-5 py-3"
                  >
                    Prendre rendez-vous
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
