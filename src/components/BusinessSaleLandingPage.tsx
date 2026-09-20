import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import BusinessSellerActions from "@/components/BusinessSellerActions";
import Navbar from "@/components/Navbar";
import { satoshiHeroTitleClassName } from "@/lib/marketing-hero-style";

const steps = [
  {
    number: "01",
    title: "Comprendre votre entreprise",
    text: "Nous prenons le temps de comprendre son activité, ses clients, son savoir-faire, son équipe et ses principaux chiffres.",
  },
  {
    number: "02",
    title: "Préparer sa présentation",
    text: "Nous mettons en valeur les informations qui permettent de comprendre clairement l’entreprise, sans exposer inutilement son identité.",
  },
  {
    number: "03",
    title: "La présenter aux repreneurs",
    text: "Nous la présentons aux repreneurs dont le projet peut correspondre, puis organisons les premiers échanges avec votre accord.",
  },
] as const;

const frequentlyAskedQuestions = [
  {
    question: "Est-ce réellement gratuit ?",
    answer:
      "Oui. La préparation de la présentation de votre entreprise et l’organisation des premières mises en relation sont gratuites pour le vendeur. Vous n’avez pas besoin de souscrire notre accompagnement de structuration.",
  },
  {
    question: "L’accompagnement payant est-il obligatoire ?",
    answer:
      "Non. Il est proposé uniquement si votre entreprise gagnerait à être mieux structurée avant sa vente, et seulement si vous souhaitez être accompagné. Son périmètre et son tarif sont alors validés séparément.",
  },
  {
    question: "Mes informations restent-elles confidentielles ?",
    answer:
      "Oui. Votre demande est d’abord étudiée par notre équipe. Les informations sensibles de votre entreprise ne sont pas publiées automatiquement ni transmises sans échange préalable avec vous.",
  },
  {
    question: "Quels types d’entreprises pouvez-vous présenter ?",
    answer:
      "Nous présentons principalement des PME de services, des activités techniques et des entreprises de terrain déjà en activité. Chaque projet est néanmoins étudié selon son fonctionnement, son équipe et son potentiel de continuité.",
  },
  {
    question: "Pouvez-vous garantir la vente ?",
    answer:
      "Non. Nous ne pouvons garantir ni la présence d’un acheteur, ni un prix, ni un délai. Notre rôle est de présenter clairement votre entreprise et de faciliter les premiers échanges lorsqu’un projet de reprise correspond.",
  },
] as const;

export default function BusinessSaleLandingPage() {
  return (
    <>
      <Navbar minimal publicNavigationActiveView="services" publicNavigationVariant="sini" />
      <main className="overflow-x-clip bg-sini-background text-brand-blue">
        <section className="border-b border-dema-line px-5 pb-14 pt-14 text-left sm:px-8 sm:pb-20 sm:pt-20 sm:text-center lg:pt-24">
          <div className="mx-auto max-w-6xl">
            <h1 className={`${satoshiHeroTitleClassName} mx-auto max-w-5xl`}>
              Nous vous aidons à vendre votre entreprise.
            </h1>
            <p className="mx-auto mt-6 max-w-3xl text-base leading-7 text-dema-muted sm:text-lg sm:leading-8">
              On présente votre entreprise à des repreneurs, gratuitement, puis
              on organise la mise en relation lorsqu’un projet correspond.
            </p>
            <BusinessSellerActions variant="hero" />
          </div>
        </section>

        <section className="bg-dema-sage/45 px-5 py-16 sm:px-8 sm:py-20">
          <div className="mx-auto max-w-6xl">
            <div className="grid gap-8 lg:grid-cols-[1fr_0.8fr] lg:items-start lg:gap-20">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.14em] text-dema-forest">
                  Présentation et mise en relation
                </p>
                <h2 className="demaa-marketing-section-title mt-4 max-w-3xl">
                  Votre entreprise, présentée à sa juste valeur.
                </h2>
              </div>
              <div className="space-y-5 text-base leading-7 text-dema-muted">
                <p>
                  Clients, savoir-faire, équipe, organisation et résultats :
                  nous préparons une présentation claire de votre entreprise
                  pour permettre aux repreneurs de comprendre rapidement son
                  activité et son potentiel.
                </p>
                <p className="flex gap-3 text-sm leading-6 text-brand-blue">
                  <Check
                    className="mt-1 h-4 w-4 shrink-0 text-dema-forest"
                    aria-hidden="true"
                  />
                  Vous choisissez les repreneurs avec lesquels vous souhaitez
                  poursuivre les échanges.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="border-b border-dema-line bg-dema-paper px-5 py-16 sm:px-8 sm:py-20">
          <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[0.72fr_1.28fr] lg:gap-20">
            <h2 className="demaa-marketing-section-title text-dema-forest">
              Comment ça marche ?
            </h2>
            <ol className="divide-y divide-dema-line border-y border-dema-line">
              {steps.map(({ number, title, text }) => (
                <li
                  key={number}
                  className="grid grid-cols-[3rem_1fr] gap-4 py-5"
                >
                  <span className="font-serif text-2xl italic text-dema-forest/55">
                    {number}
                  </span>
                  <span>
                    <strong className="block font-medium text-dema-ink">
                      {title}
                    </strong>
                    <span className="mt-1 block text-sm leading-6 text-dema-muted">
                      {text}
                    </span>
                  </span>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="border-b border-dema-line bg-[#f3f8fc] px-5 py-14 sm:px-8 sm:py-20">
          <div className="mx-auto grid max-w-6xl gap-8 text-brand-blue lg:grid-cols-[1fr_0.72fr] lg:items-end lg:gap-20">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.14em] text-dema-forest">
                Accompagnement à la mise en vente
              </p>
              <h2 className="demaa-marketing-section-title mt-4 max-w-3xl text-brand-blue">
                Votre entreprise dépend encore beaucoup de vous ?
              </h2>
              <p className="mt-5 max-w-3xl text-base leading-7 text-dema-muted">
                Nous pouvons aussi vous aider à la structurer avant la vente.
                Cet accompagnement est facultatif et facturé séparément.
              </p>
            </div>
            <Link
              href="/accompagnement"
              className="inline-flex min-h-12 w-fit items-center justify-center gap-2 rounded-full bg-dema-forest px-7 py-3 text-sm font-semibold text-white transition hover:bg-brand-blue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dema-forest/35 focus-visible:ring-offset-2"
            >
              Être accompagné
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </section>

        <section className="border-b border-dema-line bg-dema-sage/45 px-5 py-16 sm:px-8 sm:py-20">
          <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[0.72fr_1.28fr] lg:gap-20">
            <h2 className="demaa-marketing-section-title max-w-xl">
              Ce que les dirigeants veulent savoir.
            </h2>
            <div className="border-t border-dema-line">
              {frequentlyAskedQuestions.map(({ question, answer }) => (
                <details key={question} className="group border-b border-dema-line">
                  <summary className="flex cursor-pointer list-none items-start justify-between gap-6 py-5 text-base font-medium leading-6 tracking-[-0.01em] [&::-webkit-details-marker]:hidden">
                    <span>{question}</span>
                    <span
                      className="mt-0.5 text-2xl font-light leading-none text-dema-forest transition-transform group-open:rotate-45"
                      aria-hidden="true"
                    >
                      +
                    </span>
                  </summary>
                  <p className="max-w-2xl pb-6 pr-10 text-sm leading-6 text-dema-muted">
                    {answer}
                  </p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section className="border-b border-dema-line px-5 py-16 text-left sm:px-8 sm:py-20 sm:text-center">
          <div className="mx-auto max-w-4xl">
            <h2 className="demaa-marketing-section-title">
              Obtenez une première estimation de votre entreprise.
            </h2>
            <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-dema-muted">
              Renseignez votre activité et quelques chiffres pour obtenir une
              première fourchette indicative.
            </p>
            <BusinessSellerActions variant="estimate" />
          </div>
        </section>

        <section className="px-5 py-16 text-left sm:px-8 sm:py-20 sm:text-center">
          <div className="mx-auto max-w-4xl">
            <h2 className="demaa-marketing-section-title">
              Parlez-nous de votre projet de vente.
            </h2>
            <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-dema-muted">
              Quelques informations suffisent pour que nous puissions étudier
              votre entreprise et préparer une présentation utile aux
              repreneurs.
            </p>
            <div className="mt-8">
              <BusinessSellerActions variant="sale" />
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
