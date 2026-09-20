import Image from "next/image";
import Link from "next/link";
import {
  BarChart3,
  Check,
  Laptop,
  Megaphone,
  Target,
  UsersRound,
  Workflow,
} from "lucide-react";
import AccompanimentContactControl from "@/components/AccompanimentContactControl";
import BusinessSellerActions from "@/components/BusinessSellerActions";
import Navbar from "@/components/Navbar";
import { AUTOMATION_OFFER } from "@/lib/automation-offer";
import { satoshiHeroTitleClassName } from "@/lib/marketing-hero-style";

const assetQualities = [
  "Une rentabilité plus lisible",
  "Une équipe plus autonome",
  "Des processus documentés et transmissibles",
] as const;

const systemsDelivered = [
  {
    number: "01",
    title: "Pilotage commercial & clients",
    text: "Pour que chaque opportunité avance et que le dirigeant voie immédiatement où agir.",
    deliverables: [
      "Pipeline et étapes de vente configurés dans l’outil retenu",
      "Règles de qualification, devis, relance et passage de relais",
      "Modèles d’e-mails, de propositions et de comptes rendus",
      "Responsables, routine commerciale et indicateurs",
    ],
  },
  {
    number: "02",
    title: "Opérations & qualité",
    text: "Pour que les missions, chantiers ou interventions avancent de la même manière, même sans vous.",
    deliverables: [
      "Parcours d’une demande jusqu’à la livraison",
      "Étapes, validations et points de contrôle",
      "Modes opératoires, check-lists et documents utiles",
      "Responsables, outil de suivi et indicateurs de qualité",
    ],
  },
  {
    number: "03",
    title: "Pilotage de gestion",
    text: "Pour suivre la rentabilité, la trésorerie et les décisions importantes avec des chiffres fiables.",
    deliverables: [
      "Tableau de bord adapté à l’activité",
      "Sources, règles de calcul et responsables des données",
      "Rythme de mise à jour et revue de pilotage",
      "Seuils d’alerte, décisions attendues et suivi des actions",
    ],
  },
  {
    number: "04",
    title: "Équipe & transmission",
    text: "Pour sortir les savoir-faire de la tête du dirigeant et rendre le fonctionnement lisible pour l’équipe comme pour l’acheteur.",
    deliverables: [
      "Cartographie des dépendances et savoir-faire clés",
      "Rôles, responsabilités et règles de décision",
      "Documentation, modèles et procédures prioritaires",
      "Dossier de fonctionnement utilisable par un repreneur",
    ],
  },
] as const;

const steps = [
  [
    "01",
    "Comprendre",
    "L’activité, les chiffres, l’équipe et ce qui repose encore sur le dirigeant.",
  ],
  [
    "02",
    "Prioriser",
    "Identifier les dépendances qui fragilisent le plus l’entreprise et sa valeur.",
  ],
  [
    "03",
    "Structurer",
    "Installer les processus, les responsabilités, les outils et les contrôles utiles.",
  ],
  [
    "04",
    "Préparer la transmission",
    "Documenter un fonctionnement que l’équipe maîtrise et qu’un repreneur peut comprendre.",
  ],
] as const;

const included = [
  "Diagnostic des dépendances et feuille de route sur six mois",
  "Cadrage et mise en place progressive des systèmes retenus",
  "Outils existants configurés, tableaux de suivi et modèles créés",
  "Processus, rôles, responsabilités, routines et indicateurs documentés",
  "Tests en situation réelle et ajustements avec l’équipe",
  "Prise en main par l’équipe et dossier utilisable par un repreneur",
] as const;

const specialists = [
  {
    icon: Workflow,
    title: "Automatisation & IA",
  },
  {
    icon: UsersRound,
    title: "Assistant digital",
  },
  {
    icon: Laptop,
    title: "Application métier",
  },
  {
    icon: BarChart3,
    title: "Pilotage financier",
  },
  {
    icon: Target,
    title: "Prospection ciblée",
  },
  {
    icon: Megaphone,
    title: "Publicité & marketing",
  },
] as const;

const frequentlyAskedQuestions = [
  {
    question: "Est-ce utile si je ne souhaite pas vendre tout de suite ?",
    answer:
      "Oui. Une entreprise moins dépendante de son dirigeant est plus simple à piloter dès aujourd’hui et plus facile à transmettre demain. Vous préparez vos options sans vous engager à vendre.",
  },
  {
    question: "Qu’est-ce qui est réellement mis en place ?",
    answer:
      "Nous construisons avec votre équipe les processus prioritaires, les rôles et responsabilités, les outils configurés, les routines, les indicateurs et la documentation utile. Chaque système est testé dans le fonctionnement réel de l’entreprise.",
  },
  {
    question: "Faut-il remplacer tous nos outils ?",
    answer:
      "Non. Nous partons de l’existant et ne changeons un outil que s’il bloque réellement le fonctionnement. L’objectif est d’obtenir un système simple et maîtrisé, pas d’ajouter de la complexité.",
  },
  {
    question: "Quelle implication cela demande-t-il au dirigeant ?",
    answer:
      "Votre connaissance de l’entreprise est nécessaire pour les décisions et les arbitrages. Nous avançons ensuite avec les personnes concernées afin que la mise en place ne repose pas uniquement sur vous.",
  },
  {
    question: "Les spécialistes sont-ils compris dans les 1 500 € HT par mois ?",
    answer:
      "L’accompagnement et la mise en place des systèmes retenus sont inclus. Lorsqu’une expertise complémentaire est nécessaire, son périmètre et son tarif vous sont présentés et validés séparément avant toute intervention.",
  },
  {
    question: "Est-ce que cela garantit la vente de mon entreprise ?",
    answer:
      "Non. Aucun accompagnement sérieux ne peut garantir un prix ou un délai de vente. Notre rôle est de rendre le fonctionnement plus lisible, plus autonome et plus transmissible afin de réduire les risques perçus par un acheteur.",
  },
] as const;

export default function TransmissionLandingPage() {
  return (
    <>
      <Navbar minimal publicNavigationActiveView="advice" publicNavigationVariant="sini" />
      <main className="overflow-x-clip bg-dema-cream text-brand-blue">
        <section className="border-b border-dema-line px-5 pb-16 pt-14 text-left sm:px-8 sm:pb-20 sm:pt-20 sm:text-center lg:pt-24">
          <div className="mx-auto max-w-6xl">
            <div className="mb-8 flex justify-start">
              <Link
                href="/transmettre"
                className="text-sm text-dema-muted underline decoration-dema-line underline-offset-4 transition hover:text-dema-forest"
              >
                ← Retour à vendre
              </Link>
            </div>
            <h1 className={`${satoshiHeroTitleClassName} mx-auto max-w-5xl`}>
              Préparez votre entreprise pour mieux la vendre.
            </h1>
            <div className="mx-auto mt-8 flex justify-start sm:justify-center">
              <AccompanimentContactControl label="Être accompagné" />
            </div>
            <Image
              src="/illustrations/accompagnement/equipe-autonome-v1.png"
              alt="Une équipe structure son fonctionnement pendant que le dirigeant prend du recul."
              width={1774}
              height={887}
              sizes="(max-width: 767px) 92vw, 48rem"
              preload
              className="mx-auto mt-10 h-auto w-full object-contain sm:mt-12 sm:max-w-3xl"
            />
          </div>
        </section>

        <section className="bg-dema-sage/45 px-5 py-16 sm:px-8 sm:py-20">
          <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(20rem,0.8fr)] lg:items-start lg:gap-20">
            <div>
              <h2 className="demaa-marketing-section-title max-w-3xl">
                Une entreprise peut être rentable et pourtant difficile à
                vendre.
              </h2>
              <p className="mt-5 max-w-3xl text-base leading-7 text-dema-muted">
                Lorsque les décisions, les clients, les méthodes et les chiffres
                reposent encore sur le dirigeant, l’acheteur voit une activité
                difficile à comprendre et à faire fonctionner sans lui.
              </p>
            </div>
            <ul className="divide-y divide-dema-line border-y border-dema-line">
              {assetQualities.map((item) => (
                <li key={item} className="flex gap-3 py-4 text-sm leading-6">
                  <Check
                    className="mt-1 h-4 w-4 shrink-0 text-dema-forest"
                    aria-hidden="true"
                  />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="bg-dema-forest px-5 py-14 sm:px-8 sm:py-20">
          <div className="mx-auto max-w-6xl lg:max-w-5xl">
            <p className="text-xs font-medium uppercase tracking-[0.14em] text-dema-sage">
              Objectif
            </p>
            <p className="mt-4 font-serif text-3xl font-light italic leading-tight tracking-[-0.03em] text-dema-paper sm:mt-5 sm:text-5xl lg:text-6xl">
              Rendre votre entreprise moins dépendante de vous, plus simple à
              piloter et plus facile à vendre.
            </p>
          </div>
        </section>

        <section
          id="structuration"
          className="scroll-mt-24 border-b border-dema-line bg-dema-cream px-5 py-16 sm:px-8 sm:py-20"
        >
          <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[0.78fr_1.22fr] lg:items-start lg:gap-20">
            <h2 className="demaa-marketing-section-title text-dema-forest">
              Comment ça marche ?
            </h2>
            <ol className="divide-y divide-dema-line border-y border-dema-line">
              {steps.map(([number, title, text]) => (
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

        <section className="border-b border-dema-line bg-dema-paper px-5 py-16 sm:px-8 sm:py-20">
          <div className="mx-auto max-w-6xl">
            <div>
              <h2 className="demaa-marketing-section-title max-w-3xl">
                Les systèmes que nous mettons réellement en place.
              </h2>
              <p className="mt-5 max-w-3xl text-base leading-7 text-dema-muted">
                Nous ne remettons pas seulement un plan. Nous construisons avec
                l’équipe les éléments directement utilisables, en commençant par
                ce qui dépend encore trop du dirigeant.
              </p>
            </div>

            <div className="mt-10 grid gap-px overflow-hidden rounded-[1.75rem] border border-dema-line bg-dema-line md:grid-cols-2">
              {systemsDelivered.map((system) => (
                <article key={system.title} className="bg-dema-cream p-6 sm:p-7">
                  <span className="font-serif text-2xl italic text-dema-forest/45">
                    {system.number}
                  </span>
                  <h3 className="mt-4 text-lg font-medium tracking-[-0.02em]">
                    {system.title}
                  </h3>
                  <p className="mt-3 text-sm leading-6 text-dema-muted">
                    {system.text}
                  </p>
                  <ul className="mt-6 divide-y divide-dema-line border-y border-dema-line">
                    {system.deliverables.map((deliverable) => (
                      <li
                        key={deliverable}
                        className="flex gap-3 py-3 text-sm leading-6"
                      >
                        <Check
                          className="mt-1 h-4 w-4 shrink-0 text-dema-forest"
                          aria-hidden="true"
                        />
                        <span>{deliverable}</span>
                      </li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>

            <Image
              src="/illustrations/accompagnement/pilotage-transmissible-v1.png"
              alt="Une équipe prépare des indicateurs clairs qu’un repreneur peut facilement comprendre."
              width={1774}
              height={887}
              sizes="(max-width: 767px) 92vw, 72rem"
              className="mt-10 h-auto w-full object-contain sm:mt-12"
            />
          </div>
        </section>

        <section className="border-y border-dema-line bg-dema-paper px-5 py-16 sm:px-8 sm:py-20">
          <div className="mx-auto max-w-5xl">
            <blockquote>
              <h2 className="demaa-marketing-section-title text-dema-forest">
                « Je peux m’absenter sans que l’activité s’arrête. »
              </h2>
              <div className="mt-8 border-t border-dema-line pt-7 sm:mt-10 sm:pt-8">
                <p className="text-lg leading-8">
                  Les responsabilités sont claires, les méthodes sont
                  documentées et l’équipe sait quoi faire. L’entreprise ne repose
                  plus uniquement sur moi : c’est devenu un véritable actif qu’un
                  acheteur peut comprendre, reprendre et valoriser.
                </p>
                <footer className="mt-5 text-sm text-dema-muted">
                  Dirigeant, EM2A Expertise
                </footer>
              </div>
            </blockquote>
          </div>
        </section>

        <section className="px-5 py-16 sm:px-8 sm:py-20">
          <div className="mx-auto grid max-w-6xl gap-12 rounded-[2rem] bg-dema-forest p-7 text-dema-paper sm:p-10 lg:grid-cols-[1fr_0.88fr] lg:gap-16 lg:p-12">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.14em] text-dema-sage">
                Accompagnement facultatif
              </p>
              <h2 className="demaa-marketing-section-title mt-4 text-dema-paper">
                Six mois pour construire les systèmes qui libèrent le dirigeant
                et rassurent l’acheteur.
              </h2>
              <p className="mt-5 max-w-2xl text-base leading-7 text-dema-paper/72">
                Nous cadrons, configurons, documentons et testons les systèmes
                retenus avec l’équipe. Le périmètre prioritaire est défini au
                démarrage selon la situation et la complexité de l’entreprise.
              </p>
              <p className="mt-8 text-sm font-medium uppercase tracking-[0.12em] text-dema-sage">
                {AUTOMATION_OFFER.durationLabel}
              </p>
              <p className="demaa-section-title mt-3 text-4xl text-dema-paper">
                {AUTOMATION_OFFER.price.label}
              </p>
              <p className="mt-3 text-sm text-dema-paper/65">
                {AUTOMATION_OFFER.commitmentLabel}
              </p>
            </div>
            <div>
              <ul className="divide-y divide-dema-paper/18 border-y border-dema-paper/18">
                {included.map((item) => (
                  <li
                    key={item}
                    className="flex gap-3 py-3 text-sm leading-6 text-dema-paper/78"
                  >
                    <Check
                      className="mt-1 h-4 w-4 shrink-0 text-dema-sage"
                      aria-hidden="true"
                    />
                    {item}
                  </li>
                ))}
              </ul>
              <div className="mt-7">
                <AccompanimentContactControl
                  className="inline-flex min-h-12 w-full items-center justify-center rounded-full bg-dema-paper px-7 py-3 text-sm font-semibold text-dema-forest transition hover:bg-dema-cream focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dema-paper/50"
                  label="Être accompagné"
                />
              </div>
            </div>
          </div>
        </section>

        <section className="border-y border-dema-line bg-dema-paper px-5 py-16 sm:px-8 sm:py-20">
          <div className="mx-auto max-w-6xl">
            <h2 className="demaa-marketing-section-title max-w-4xl">
              Les bons spécialistes, lorsque le plan l’exige.
            </h2>
            <div className="mt-10 grid grid-cols-2 gap-3 lg:grid-cols-3">
              {specialists.map(({ icon: Icon, title }) => (
                <article
                  key={title}
                  className="flex min-h-24 items-center gap-4 rounded-[1.25rem] border border-dema-line bg-dema-cream p-4 sm:min-h-28 sm:p-5"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-dema-sage text-dema-forest">
                    <Icon
                      className="h-4.5 w-4.5"
                      strokeWidth={1.7}
                      aria-hidden="true"
                    />
                  </span>
                  <h3 className="text-sm font-medium leading-snug tracking-[-0.01em] sm:text-base">
                    {title}
                  </h3>
                </article>
              ))}
            </div>
            <p className="mt-5 text-xs leading-5 text-dema-muted">
              (Ces interventions sont proposées séparément. Leur périmètre et
              leur tarif sont validés avant le démarrage.)
            </p>
          </div>
        </section>

        <section className="border-b border-dema-line bg-dema-sage/45 px-5 py-16 sm:px-8 sm:py-20">
          <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[0.72fr_1.28fr] lg:gap-20">
            <div>
              <h2 className="demaa-marketing-section-title max-w-xl">
                Ce que les dirigeants veulent savoir avant de commencer.
              </h2>
            </div>
            <div className="border-t border-dema-line">
              {frequentlyAskedQuestions.map(({ question, answer }) => (
                <details
                  key={question}
                  className="group border-b border-dema-line"
                >
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

        <section className="px-5 py-16 text-center sm:px-8 sm:py-20">
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
      </main>
    </>
  );
}
