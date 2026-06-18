"use client";

import { useState } from "react";
import { ArrowRight, Check, CircleDollarSign, Clock3, FolderKanban, Mail, ShieldCheck } from "lucide-react";
import Navbar from "@/components/Navbar";
import PrimaryMobileNav from "@/components/PrimaryMobileNav";
import ServiceIntroductionModal from "@/components/ServiceIntroductionModal";
import type { DemaaService } from "@/lib/service-catalog";

const valuePoints = [
  "Moins de coûts",
  "Moins de risques",
  "Plus de temps",
] as const;

const offerHighlights = [
  "Salaire et charges allégées",
  "Parcours encadré et sécurisé",
  "Tâches adaptées à vos besoins réels",
] as const;

const comparisonDetails = [
  {
    title: "Embauche classique",
    amount: "2 200 € / mois",
    description: "Coût employeur estimé",
    emphasis: false,
  },
  {
    title: "Avec Demaa (POEI + alternance)",
    amount: "866 € / mois",
    description: "Coût moyen estimé sur 15 mois",
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
  service,
}: {
  service: DemaaService;
}) {
  const [isIntroductionOpen, setIsIntroductionOpen] = useState(false);

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-dema-cream text-brand-blue">
        <section className="ml-[calc(50%-50vw)] mr-[calc(50%-50vw)] w-screen bg-dema-cream px-4 pb-8 pt-5 text-center md:px-8 md:pb-10 md:pt-16">
          <div className="mx-auto max-w-6xl space-y-6 md:space-y-7">
            <PrimaryMobileNav activeTab="deleguer" />

            <div className="mx-auto max-w-5xl demaa-fade-up">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-dema-forest">
                Assistante polyvalente
              </p>
              <h1 className="mt-4 text-[clamp(3rem,14.5vw,3.36rem)] leading-[0.92] tracking-tight sm:text-[2.75rem] md:text-[3.75rem] lg:text-[4.5rem]">
                <span className="demaa-hero-title text-brand-blue/86">Recrutez</span>
                <br />
                <span className="demaa-hero-title text-brand-blue/86">une assistante</span>
                <br />
                <span className="font-sans font-light not-italic text-brand-blue/56">
                  polyvalente.
                </span>
              </h1>
              <p className="mx-auto mt-5 max-w-2xl text-sm leading-relaxed text-dema-muted md:text-base">
                Déléguez vos tâches administratives à une professionnelle formée,
                sans supporter le coût d&apos;une embauche classique.
              </p>

              <div className="mt-6 flex flex-wrap items-center justify-center gap-2.5">
                {valuePoints.map((point) => (
                  <span
                    key={point}
                    className="inline-flex items-center gap-2 rounded-full border border-dema-line/70 bg-dema-paper px-3 py-1.5 text-xs font-medium text-brand-blue/72"
                  >
                    <ShieldCheck className="h-3.5 w-3.5 text-dema-forest" aria-hidden="true" />
                    {point}
                  </span>
                ))}
              </div>

              <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={() => setIsIntroductionOpen(true)}
                  className="inline-flex min-w-[13rem] items-center justify-center rounded-full bg-dema-forest px-5 py-3 text-sm font-semibold text-dema-paper transition hover:bg-brand-blue"
                >
                  Prendre rendez-vous
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </button>
                <a
                  href="#comparaison"
                  className="inline-flex min-w-[13rem] items-center justify-center rounded-full border border-dema-line bg-dema-paper px-5 py-3 text-sm font-semibold text-brand-blue transition hover:border-dema-forest/25 hover:text-dema-forest"
                >
                  Voir l&apos;estimation
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
            <div className="grid gap-5 lg:grid-cols-2">
              <article className="demaa-fade-up rounded-[1rem] border border-dema-line/70 bg-dema-paper px-5 py-6">
                <p className="inline-flex rounded-full bg-dema-forest/10 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-dema-forest">
                  Offre Demaa
                </p>
                <h2 className="mt-4 max-w-xl text-2xl font-semibold tracking-tight text-brand-blue md:text-3xl">
                  Vous récupérez du temps sans supporter le coût plein d&apos;une embauche classique.
                </h2>
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
              </article>

              <article
                id="comparaison"
                className="demaa-fade-up demaa-delay-1 rounded-[1rem] border border-dema-line/70 bg-dema-paper px-5 py-6 scroll-mt-24"
              >
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-dema-forest">
                  Comparaison indicative
                </p>
                <div className="mt-5 space-y-3">
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
                  Simulation indicative sur la base d&apos;hypothèses moyennes. Le coût réel peut varier selon votre situation.
                </p>
              </article>
            </div>

            <div className="mt-20 md:mt-28">
              <div className="mx-auto max-w-3xl text-center demaa-fade-up">
                <h2 className="text-2xl font-semibold tracking-tight text-brand-blue md:text-3xl">
                  Ce qu&apos;une assistante polyvalente peut reprendre
                </h2>
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

            <div className="mt-20 md:mt-28 demaa-fade-up">
              <div className="rounded-[1rem] border border-dema-line/70 bg-dema-paper px-5 py-12 text-center shadow-[0_18px_50px_rgba(23,35,29,0.04)] md:px-12 md:py-16">
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-dema-forest">
                  Prochaine étape
                </p>
                <h2 className="mx-auto mt-4 max-w-3xl text-3xl font-semibold tracking-tight text-brand-blue md:text-4xl">
                  Prêt à déléguer intelligemment ?
                </h2>
                <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-dema-muted md:text-lg">
                  On regarde ensemble si ce format correspond à vos besoins, à vos tâches et à votre rythme.
                </p>
                <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                  <button
                    type="button"
                    onClick={() => setIsIntroductionOpen(true)}
                    className="demaa-primary-button inline-flex items-center gap-2 px-5 py-3"
                  >
                    Prendre rendez-vous
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {isIntroductionOpen ? (
        <ServiceIntroductionModal
          service={service}
          source="Landing assistant polyvalent"
          onClose={() => setIsIntroductionOpen(false)}
        />
      ) : null}
    </>
  );
}
