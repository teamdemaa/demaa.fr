import {
  BarChart3,
  Check,
  ClipboardCheck,
  FileCheck2,
  Laptop,
  Megaphone,
  Network,
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

const systems = [
  {
    icon: Network,
    title: "Commercial et clients",
    text: "Demandes, offres, relances et suivi client.",
  },
  {
    icon: ClipboardCheck,
    title: "Missions et opérations",
    text: "Interventions, chantiers ou missions, avec les bonnes informations.",
  },
  {
    icon: FileCheck2,
    title: "Administration et finance",
    text: "Documents, facturation, échéances et données utiles.",
  },
  {
    icon: UsersRound,
    title: "Équipe et responsabilités",
    text: "Rôles, savoir-faire et décisions qui ne reposent plus sur une seule personne.",
  },
  {
    icon: BarChart3,
    title: "Pilotage",
    text: "Chiffres utiles, rythme de suivi et décisions.",
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
    "Choisir",
    "Le fonctionnement prioritaire à rendre plus clair et plus autonome.",
  ],
  [
    "03",
    "Structurer",
    "Les processus, responsabilités, outils, automatisations et contrôles utiles.",
  ],
  [
    "04",
    "Documenter et transmettre",
    "Un fonctionnement compris par l’équipe et plus facile à présenter à un repreneur.",
  ],
] as const;

const included = [
  "Diagnostic initial de l’entreprise",
  "Priorités de structuration définies avec vous",
  "Mise en place progressive des processus et responsabilités",
  "Outils et automatisations utiles",
  "Points de travail réguliers avec le dirigeant et l’équipe",
  "Documentation et transmission des savoir-faire",
] as const;

const specialists = [
  {
    icon: Workflow,
    title: "Automatisation & IA",
    text: "Pour supprimer les ressaisies et faire circuler les informations entre les outils.",
  },
  {
    icon: UsersRound,
    title: "Assistant digital",
    text: "Pour prendre en charge les tâches récurrentes et faire vivre le nouveau fonctionnement.",
  },
  {
    icon: Laptop,
    title: "Application métier",
    text: "Pour centraliser un processus lorsque les outils existants ne suffisent plus.",
  },
  {
    icon: BarChart3,
    title: "Pilotage financier",
    text: "Pour fiabiliser les indicateurs et éclairer les décisions importantes.",
  },
  {
    icon: Target,
    title: "Prospection ciblée",
    text: "Pour construire un flux d’opportunités qualifiées et mieux suivi.",
  },
  {
    icon: Megaphone,
    title: "Publicité et marketing",
    text: "Pour renforcer la visibilité et l’acquisition lorsque l’entreprise est prête.",
  },
] as const;

export default function TransmissionLandingPage() {
  return (
    <>
      <Navbar minimal publicNavigationActiveView="services" />
      <main className="overflow-x-clip bg-dema-cream text-brand-blue">
        <section className="border-b border-dema-line px-5 pb-16 pt-14 text-left sm:px-8 sm:pb-20 sm:pt-20 sm:text-center lg:pt-24">
          <div className="mx-auto max-w-6xl">
            <h1 className={`${satoshiHeroTitleClassName} mx-auto max-w-5xl`}>
              Préparez votre entreprise pour mieux la vendre.
            </h1>
            <div className="mt-8">
              <BusinessSellerActions variant="sale" />
            </div>
          </div>
        </section>

        <section className="px-5 py-16 sm:px-8 sm:py-20">
          <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(20rem,0.8fr)] lg:items-start lg:gap-20">
            <div>
              <h2 className="demaa-marketing-section-title max-w-3xl">
                Une entreprise rentable n’est pas toujours facile à transmettre.
              </h2>
              <p className="mt-5 max-w-3xl text-base leading-7 text-dema-muted">
                Lorsque les décisions, les clients, les méthodes et les chiffres
                reposent encore sur le dirigeant, le repreneur voit surtout une
                entreprise difficile à comprendre et à reprendre.
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

        <section className="border-y border-dema-line bg-dema-paper px-5 py-16 sm:px-8 sm:py-20">
          <div className="mx-auto max-w-6xl">
            <h2 className="demaa-marketing-section-title max-w-4xl">
              Nous structurons ce qui dépend encore trop de vous.
            </h2>
            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              {systems.map(({ icon: Icon, title, text }) => (
                <article
                  key={title}
                  className="rounded-[1.5rem] border border-dema-line bg-dema-cream p-6"
                >
                  <span className="flex h-11 w-11 items-center justify-center rounded-full bg-dema-sage text-dema-forest">
                    <Icon
                      className="h-5 w-5"
                      strokeWidth={1.7}
                      aria-hidden="true"
                    />
                  </span>
                  <h3 className="mt-5 text-lg font-medium leading-snug tracking-[-0.02em]">
                    {title}
                  </h3>
                  <p className="mt-3 text-sm leading-6 text-dema-muted">
                    {text}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section
          id="structuration"
          className="scroll-mt-24 bg-dema-forest px-5 py-16 text-dema-paper sm:px-8 sm:py-20"
        >
          <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[0.78fr_1.22fr] lg:items-start lg:gap-20">
            <h2 className="demaa-marketing-section-title text-dema-paper">
              Comment ça marche ?
            </h2>
            <ol className="divide-y divide-dema-paper/18 border-y border-dema-paper/18">
              {steps.map(([number, title, text]) => (
                <li
                  key={number}
                  className="grid grid-cols-[3rem_1fr] gap-4 py-5"
                >
                  <span className="font-serif text-2xl italic text-dema-sage">
                    {number}
                  </span>
                  <span>
                    <strong className="block font-medium text-dema-paper">
                      {title}
                    </strong>
                    <span className="mt-1 block text-sm leading-6 text-dema-paper/65">
                      {text}
                    </span>
                  </span>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="border-y border-dema-line bg-dema-paper px-5 py-16 sm:px-8 sm:py-20">
          <div className="mx-auto max-w-6xl">
            <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr] lg:items-end lg:gap-16">
              <h2 className="demaa-marketing-section-title">
                Un écosystème de spécialistes mobilisés au bon moment.
              </h2>
              <div className="max-w-2xl">
                <p className="text-base leading-7 text-dema-muted">
                  Nous pilotons le plan et mobilisons la compétence utile lorsque
                  l’entreprise en a réellement besoin.
                </p>
                <p className="mt-3 text-xs leading-5 text-dema-muted">
                  (Ces interventions sont proposées séparément. Leur périmètre et
                  leur tarif sont validés avant le démarrage)
                </p>
              </div>
            </div>
            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {specialists.map(({ icon: Icon, title, text }) => (
                <article
                  key={title}
                  className="rounded-[1.5rem] border border-dema-line bg-dema-cream p-6"
                >
                  <span className="flex h-11 w-11 items-center justify-center rounded-full bg-dema-sage text-dema-forest">
                    <Icon
                      className="h-5 w-5"
                      strokeWidth={1.7}
                      aria-hidden="true"
                    />
                  </span>
                  <h3 className="mt-5 text-lg font-medium leading-snug tracking-[-0.02em]">
                    {title}
                  </h3>
                  <p className="mt-3 text-sm leading-6 text-dema-muted">
                    {text}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="px-5 py-16 sm:px-8 sm:py-20">
          <div className="mx-auto grid max-w-6xl gap-12 rounded-[2rem] bg-dema-forest p-7 text-dema-paper sm:p-10 lg:grid-cols-[1fr_0.88fr] lg:gap-16 lg:p-12">
            <div>
              <h2 className="demaa-marketing-section-title text-dema-paper">
                Six mois pour rendre votre entreprise plus autonome et
                transmissible.
              </h2>
              <p className="mt-5 max-w-2xl text-base leading-7 text-dema-paper/72">
                Nous avançons chaque mois sur les priorités qui renforcent la
                valeur de l’entreprise et réduisent sa dépendance au dirigeant.
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
                  label="Préparer mon entreprise"
                />
              </div>
            </div>
          </div>
        </section>

        <section className="border-y border-dema-line bg-dema-paper px-5 py-16 sm:px-8 sm:py-20">
          <blockquote className="mx-auto max-w-5xl">
            <h2 className="demaa-marketing-section-title max-w-4xl text-dema-forest">
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
