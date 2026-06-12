import type { Metadata } from "next";
import {
  ArrowRight,
  Briefcase,
  Calculator,
  Check,
  CircleHelp,
  FileText,
  HandCoins,
  Mail,
  SearchCheck,
  Users,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import PrimaryMobileNav from "@/components/PrimaryMobileNav";

const missionItems = [
  {
    icon: FileText,
    title: "Devis, factures, documents",
    description:
      "Préparer les documents, suivre les pièces, remettre de l’ordre dans les tâches administratives du quotidien.",
  },
  {
    icon: Mail,
    title: "Emails, relances, suivi",
    description:
      "Traiter les demandes entrantes, relancer proprement et garder un suivi clair sans vous disperser.",
  },
  {
    icon: Calculator,
    title: "Tableaux, CRM, coordination",
    description:
      "Mettre à jour les suivis, centraliser les informations et fluidifier les échanges avec vos clients et partenaires.",
  },
] as const;

const comparisonItems = [
  {
    title: "Embauche classique",
    eyebrow: "Sans montage accompagné",
    price: "2 200 € / mois",
    subprice: "26 400 € sur 12 mois",
    points: [
      "Recrutement à piloter seul",
      "Coût d’entrée complet dès le départ",
      "Peu d’optimisation du budget de lancement",
    ],
  },
  {
    title: "Avec Demaa + POEI + alternance",
    eyebrow: "Selon éligibilité",
    price: "866 € / mois",
    subprice: "13 000 € sur 15 mois en moyenne",
    points: [
      "3 mois de POEI pris en charge avant l’alternance",
      "Parcours cadré pour trouver le bon profil",
      "Budget nettement plus léger au démarrage",
    ],
  },
] as const;

const explanationSteps = [
  {
    title: "POEI",
    description:
      "Une phase préparatoire peut permettre de former la personne avant la prise de poste, selon l’éligibilité du dossier.",
  },
  {
    title: "Alternance",
    description:
      "Le recrutement se poursuit dans un cadre plus accessible, avec une prise en charge partielle de la formation selon le contrat et l’OPCO.",
  },
  {
    title: "Accompagnement Demaa",
    description:
      "On aide à cadrer le besoin, à chercher le profil et à structurer le démarrage pour que la personne soit utile vite.",
  },
] as const;

const processSteps = [
  "On échange sur vos besoins réels et les tâches à reprendre.",
  "On vérifie si le montage POEI puis alternance est pertinent pour votre cas.",
  "On lance la recherche et la présélection des profils.",
  "On prépare un démarrage cadré pour les premières semaines.",
] as const;

const includedItems = [
  "Cadrage du poste et des missions prioritaires",
  "Recherche et présélection de profils",
  "Aide à la structuration du parcours de démarrage",
  "Vision claire du comparatif de coût avant de vous engager",
] as const;

const faqItems = [
  {
    question: "Est-ce que le montage POEI + alternance est possible dans tous les cas ?",
    answer:
      "Non. Cela dépend du profil, de votre besoin, du contrat retenu et des critères d’éligibilité. La page présente une logique de budget possible, pas une promesse automatique.",
  },
  {
    question: "Pourquoi afficher 866 € par mois ?",
    answer:
      "C’est un coût moyen ramené à la période complète de 15 mois dans l’exemple présenté. L’objectif est de comparer ce que vous auriez payé dans une embauche classique avec ce que vous pouvez viser avec ce montage.",
  },
  {
    question: "À qui s’adresse cette offre ?",
    answer:
      "Aux dirigeants de TPE et PME qui ont un vrai volume administratif à déléguer, mais pas l’envie ou le budget d’une embauche classique dès le départ.",
  },
] as const;

export const metadata: Metadata = {
  title: "V1 Déléguer - Assistante polyvalente - Demaa",
  description:
    "Version de travail de la landing page Assistante polyvalente, construite pour comparer une embauche classique avec un parcours POEI puis alternance.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function DeleguerV1Page() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-dema-cream text-brand-blue">
        <section className="ml-[calc(50%-50vw)] mr-[calc(50%-50vw)] w-screen bg-dema-cream px-4 pb-8 pt-5 text-center md:px-8 md:pb-10 md:pt-16">
          <div className="mx-auto max-w-6xl space-y-6 md:space-y-7">
            <PrimaryMobileNav activeTab="deleguer" />

            <div className="mx-auto max-w-5xl demaa-fade-up">
              <h1 className="text-[clamp(3rem,14.5vw,3.36rem)] tracking-tight leading-[0.92] sm:text-[2.75rem] md:text-[3.75rem] lg:text-[4.5rem]">
                <span className="demaa-hero-title text-brand-blue/86">Recrutez</span>
                <br />
                <span className="font-sans font-light not-italic text-brand-blue/44">
                  une assistante polyvalente
                </span>
              </h1>
              <p className="mx-auto mt-5 max-w-3xl text-sm leading-relaxed text-dema-muted md:text-base">
                Une page centrée sur une seule offre: reprendre l’administratif,
                le suivi et les relances avec un budget plus léger qu’une embauche
                classique, grâce à un parcours POEI puis alternance selon l’éligibilité.
              </p>
            </div>

            <div className="mx-auto grid max-w-5xl gap-4 text-left md:grid-cols-[1.1fr_0.9fr]">
              <div className="demaa-card demaa-fade-up demaa-delay-2 rounded-[1.15rem] p-5 md:p-6">
                <p className="inline-flex rounded-full bg-dema-forest/10 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-dema-forest">
                  Offre ciblée
                </p>
                <h2 className="mt-4 text-2xl font-semibold tracking-tight text-brand-blue md:text-3xl">
                  Vous récupérez du temps sans supporter le coût plein d’une embauche classique.
                </h2>
                <div className="mt-5 space-y-3">
                  {[
                    "Support administratif du quotidien",
                    "Relances et suivi opérationnel",
                    "Tableaux, documents et coordination simple",
                  ].map((item) => (
                    <div key={item} className="flex gap-3">
                      <span className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-dema-sage text-dema-forest">
                        <Check className="h-3.5 w-3.5" aria-hidden="true" />
                      </span>
                      <p className="text-sm leading-relaxed text-dema-muted">{item}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="demaa-surface demaa-fade-up demaa-delay-3 rounded-[1.15rem] p-5 md:p-6">
                <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-dema-forest">
                  Comparatif de budget
                </p>
                <div className="mt-4 space-y-4">
                  <div className="rounded-[0.9rem] border border-dema-line/70 bg-dema-paper px-4 py-4">
                    <p className="text-sm font-medium text-brand-blue">Embauche classique</p>
                    <p className="mt-2 text-3xl font-semibold tracking-tight text-brand-blue">2 200 € / mois</p>
                    <p className="mt-1 text-sm text-dema-muted">26 400 € sur 12 mois</p>
                  </div>
                  <div className="rounded-[0.9rem] border border-dema-line/70 bg-dema-sage/75 px-4 py-4">
                    <p className="text-sm font-medium text-brand-blue">Avec Demaa</p>
                    <p className="mt-2 text-3xl font-semibold tracking-tight text-dema-forest">866 € / mois</p>
                    <p className="mt-1 text-sm text-dema-muted">13 000 € sur 15 mois en moyenne</p>
                  </div>
                </div>
                <p className="mt-4 text-xs leading-relaxed text-dema-muted">
                  Exemple de comparaison construit pour illustrer l’écart entre une embauche
                  classique et un parcours POEI puis alternance. À valider selon le profil,
                  le contrat retenu et les aides mobilisables.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto w-full max-w-6xl px-4 pb-24 md:px-8 md:pb-36">
          <div className="border-t border-dema-line/65 pt-14 md:pt-20">
            <div className="max-w-3xl demaa-fade-up demaa-delay-1">
              <h2 className="text-2xl font-semibold tracking-tight text-brand-blue md:text-3xl">
                Ce qu’une assistante polyvalente peut reprendre
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-dema-muted md:text-base">
                On ne vend pas une promesse floue de délégation. On vend une personne
                capable de reprendre des tâches concrètes qui consomment votre temps.
              </p>
            </div>

            <div className="mx-auto mt-8 grid gap-4 md:grid-cols-3 md:gap-5">
              {missionItems.map((item, index) => (
                <div
                  key={item.title}
                  className={`demaa-fade-up demaa-lift-soft rounded-[1rem] border border-dema-line/70 bg-dema-paper px-4 py-5 md:min-h-[14rem] md:px-5 ${
                    index === 0 ? "demaa-delay-2" : index === 1 ? "demaa-delay-3" : "demaa-delay-4"
                  }`}
                >
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-dema-sage/55 text-dema-forest">
                    <item.icon className="demaa-icon-float h-4.5 w-4.5" aria-hidden="true" />
                  </span>
                  <h3 className="mt-4 text-[1.05rem] font-medium leading-snug text-brand-blue md:text-[1.3rem]">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-dema-muted">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-20 md:mt-28">
              <div className="max-w-3xl demaa-fade-up demaa-delay-2">
                <h2 className="text-2xl font-semibold tracking-tight text-brand-blue md:text-3xl">
                  Ce qu’ils auraient payé seuls, versus ce qu’ils paient avec vous
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-dema-muted md:text-base">
                  Le cœur de la page, c’est ce comparatif. On aide le visiteur à voir
                  rapidement l’écart entre une embauche classique et un montage plus accessible.
                </p>
              </div>

              <div className="mt-8 grid gap-4 md:grid-cols-2 md:gap-5">
                {comparisonItems.map((item, index) => (
                  <article
                    key={item.title}
                    className={`demaa-card rounded-[1.15rem] p-5 md:p-6 ${
                      index === 0 ? "demaa-fade-up demaa-delay-3" : "demaa-fade-up demaa-delay-4"
                    }`}
                  >
                    <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-dema-forest">
                      {item.eyebrow}
                    </p>
                    <h3 className="mt-2 text-2xl font-semibold tracking-tight text-brand-blue">
                      {item.title}
                    </h3>
                    <p className="mt-5 text-[2.4rem] font-light leading-[1.02] tracking-tight text-brand-blue/44 md:text-[3rem]">
                      <span className="demaa-hero-title text-brand-blue/86">{item.price}</span>
                    </p>
                    <p className="mt-2 text-sm leading-relaxed text-dema-muted">{item.subprice}</p>
                    <div className="mt-5 space-y-3">
                      {item.points.map((point) => (
                        <div key={point} className="flex gap-3">
                          <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-dema-forest" />
                          <p className="text-sm leading-relaxed text-dema-muted">{point}</p>
                        </div>
                      ))}
                    </div>
                  </article>
                ))}
              </div>
            </div>

            <div className="mt-20 md:mt-28 demaa-fade-up demaa-delay-3">
              <h2 className="mb-6 text-2xl font-semibold tracking-tight text-brand-blue md:mb-8 md:text-3xl">
                Pourquoi cet écart de budget est possible
              </h2>
              <div className="mx-auto grid gap-4 md:max-w-5xl md:grid-cols-3 md:gap-5">
                {explanationSteps.map((step, index) => (
                  <div
                    key={step.title}
                    className={`demaa-fade-up demaa-lift-soft rounded-[1rem] border border-dema-line/70 bg-dema-paper px-4 py-4 md:min-h-[11.5rem] md:px-5 md:py-5 ${
                      index === 0 ? "demaa-delay-4" : index === 1 ? "demaa-delay-5" : "demaa-delay-6"
                    }`}
                  >
                    <div className="flex gap-3 md:flex-col">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-dema-sage/55 text-sm font-semibold text-dema-forest">
                        {index + 1}
                      </span>
                      <div>
                        <h3 className="text-[1.05rem] font-medium leading-snug text-brand-blue md:text-[1.3rem]">
                          {step.title}
                        </h3>
                        <p className="mt-1 text-sm leading-relaxed text-dema-muted">
                          {step.description}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-20 grid gap-6 lg:grid-cols-[1.05fr_0.95fr] md:mt-28">
              <div className="demaa-card demaa-fade-up demaa-delay-4 rounded-[1.15rem] p-5 md:p-6">
                <p className="inline-flex rounded-full bg-dema-forest/10 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-dema-forest">
                  Process simple
                </p>
                <h2 className="mt-4 text-[2.45rem] font-light leading-[1.02] tracking-tight text-brand-blue/44 md:text-[3.45rem]">
                  <span className="demaa-hero-title text-brand-blue/86">Une offre</span> <br />
                  claire à comprendre
                </h2>
                <div className="mt-5 space-y-4">
                  {processSteps.map((step, index) => (
                    <div key={step} className="flex gap-3">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-dema-sage text-xs font-semibold text-dema-forest">
                        {index + 1}
                      </span>
                      <p className="text-sm leading-relaxed text-dema-muted">{step}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="demaa-surface demaa-fade-up demaa-delay-5 rounded-[1.15rem] p-5 md:p-6">
                <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-dema-forest">
                  Ce que comprend l’accompagnement
                </p>
                <div className="mt-5 space-y-4">
                  {includedItems.map((item) => (
                    <div key={item} className="flex gap-3">
                      <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-dema-sage text-dema-forest">
                        <Briefcase className="h-4 w-4" aria-hidden="true" />
                      </span>
                      <p className="text-sm leading-relaxed text-dema-muted">{item}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-6 rounded-[0.9rem] border border-dema-line/70 bg-dema-paper px-4 py-4">
                  <p className="text-sm font-medium text-brand-blue">
                    Message principal à faire passer
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-dema-muted">
                    Vous n’avez peut-être pas envie de porter une embauche classique
                    maintenant. Mais vous pouvez tout de même vous faire épauler sérieusement.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-20 rounded-[1rem] border border-dema-line/70 bg-dema-paper px-4 py-6 shadow-[0_8px_22px_rgba(23,35,29,0.02)] md:mt-28 md:px-6 md:py-7">
              <div className="max-w-3xl demaa-fade-up demaa-delay-5">
                <h2 className="text-2xl font-semibold tracking-tight text-brand-blue md:text-3xl">
                  Pour qui cette page est pensée
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-dema-muted md:text-base">
                  Des dirigeants qui ont besoin d’une personne fiable pour reprendre
                  l’administratif, mais qui ne veulent pas partir sur un recrutement classique
                  à plein coût dès le départ.
                </p>
              </div>
              <div className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                {[
                  { icon: Users, label: "TPE et PME débordées" },
                  { icon: SearchCheck, label: "Structures qui ont besoin d’un vrai relais admin" },
                  { icon: HandCoins, label: "Budgets de lancement à préserver" },
                  { icon: ArrowRight, label: "Dirigeants qui veulent avancer sans tout gérer seuls" },
                ].map((item, index) => (
                  <div
                    key={item.label}
                    className={`rounded-[0.9rem] border border-dema-line/70 bg-dema-cream px-4 py-4 ${
                      index === 0 ? "demaa-fade-up demaa-delay-3" : index === 1 ? "demaa-fade-up demaa-delay-4" : index === 2 ? "demaa-fade-up demaa-delay-5" : "demaa-fade-up demaa-delay-6"
                    }`}
                  >
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-dema-paper text-dema-forest">
                      <item.icon className="h-4 w-4" aria-hidden="true" />
                    </span>
                    <p className="mt-4 text-sm font-medium leading-relaxed text-brand-blue">
                      {item.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-20 md:mt-28">
              <div className="max-w-3xl demaa-fade-up demaa-delay-5">
                <h2 className="text-3xl font-semibold tracking-tight text-brand-blue md:text-4xl">
                  Questions fréquentes
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-dema-muted md:text-base">
                  Une V1 volontairement simple, pour garder la page crédible et facile à lire.
                </p>
              </div>

              <div className="mt-6 space-y-3">
                {faqItems.map((item, index) => (
                  <details
                    key={item.question}
                    open={index === 0}
                    className={`rounded-[1rem] border border-dema-line/70 bg-dema-paper px-5 py-4 ${
                      index === 0 ? "demaa-fade-up demaa-delay-4" : index === 1 ? "demaa-fade-up demaa-delay-5" : "demaa-fade-up demaa-delay-6"
                    }`}
                  >
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-left text-[1.05rem] font-medium leading-snug text-brand-blue md:text-[1.15rem]">
                      {item.question}
                      <CircleHelp className="h-4 w-4 shrink-0 text-dema-forest" aria-hidden="true" />
                    </summary>
                    <p className="mt-3 pr-6 text-sm leading-relaxed text-dema-muted">
                      {item.answer}
                    </p>
                  </details>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
