import {
  BarChart3,
  Check,
  Cog,
  Handshake,
  Repeat2,
  UsersRound,
  Workflow,
} from "lucide-react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import StudioInterestForm from "@/components/StudioInterestForm";
import { satoshiHeroTitleClassName } from "@/lib/marketing-hero-style";

const partnershipAreas = [
  {
    icon: Repeat2,
    title: "Commercial et clients",
    description: "Rendre les demandes, les offres, les relances et le suivi client plus réguliers et moins dépendants d’une seule personne.",
  },
  {
    icon: Workflow,
    title: "Opérations et qualité",
    description: "Définir comment le travail avance, qui décide et quels contrôles garantissent la qualité et les délais.",
  },
  {
    icon: UsersRound,
    title: "Équipe et responsabilités",
    description: "Donner à chacun un rôle clair et les informations nécessaires pour agir sans tout faire remonter au dirigeant.",
  },
  {
    icon: BarChart3,
    title: "Marge et pilotage",
    description: "Connaître la rentabilité par client, mission ou chantier et décider à partir de chiffres fiables.",
  },
  {
    icon: Cog,
    title: "Processus et outils",
    description: "Documenter les façons de faire, relier les outils et automatiser ce qui ralentit encore l’équipe.",
  },
] as const;

const partnershipSteps = [
  {
    title: "Mesurer",
    description: "Repérer où se perdent le temps, la marge et la qualité, puis ce qui dépend encore du dirigeant.",
  },
  {
    title: "Structurer",
    description: "Définir les processus, les responsabilités, les contrôles et les indicateurs qui doivent tenir ensemble.",
  },
  {
    title: "Installer",
    description: "Mettre en place les outils et les habitudes de travail avec l’équipe, puis vérifier leur usage réel.",
  },
  {
    title: "Faire progresser",
    description: "Améliorer la marge, la qualité, la capacité et l’autonomie à partir de résultats suivis dans le temps.",
  },
] as const;

const companySignals = [
  "Une entreprise de services avec des clients et un chiffre d’affaires réels",
  "Un savoir-faire reconnu, mais encore peu formalisé ou difficile à déléguer",
  "Des opérations, des décisions ou des relations clients encore concentrées autour du dirigeant",
  "Des gains identifiables sur la marge, la qualité, la capacité ou la récurrence",
  "Un dirigeant prêt à faire évoluer durablement son organisation avec son équipe",
] as const;

const assetQualities = [
  "Une rentabilité plus lisible et plus prévisible",
  "Une équipe capable d’avancer sans tout faire remonter au dirigeant",
  "Des processus documentés, pilotables et transmissibles",
] as const;

export default function DemaaPartnersLandingPage() {
  return (
    <>
      <Navbar minimal publicNavigationActiveView="none" />

      <main className="overflow-x-clip bg-dema-cream pb-24 text-brand-blue xl:pb-0">
        <section className="border-b border-dema-line px-5 pb-20 pt-14 text-left sm:px-8 sm:pb-24 sm:pt-20 sm:text-center lg:pb-28 lg:pt-24">
          <div className="mx-auto max-w-6xl">
            <p className="text-sm font-medium text-dema-forest">Demaa Partners · Partenaire de structuration</p>
            <h1
              aria-label="Faites grandir la valeur de votre entreprise. Pas votre charge de travail."
              className={`${satoshiHeroTitleClassName} mx-auto mt-5 max-w-6xl`}
            >
              <span aria-hidden="true">
                <span className="block">Faites grandir la valeur de votre entreprise.</span>
                <span className="demaa-hero-title mt-2 block text-dema-forest">
                  Pas votre charge de travail.
                </span>
              </span>
            </h1>
            <p className="mx-auto mt-8 max-w-3xl text-base leading-7 text-dema-muted sm:text-lg sm:leading-8">
              Construisez une entreprise plus rentable, plus prévisible et moins dépendante de vous, avec des processus clairs, une équipe responsabilisée et un pilotage fiable.
            </p>
            <div className="mt-8 flex justify-start sm:justify-center">
              <Link
                href="#partners-contact"
                className="inline-flex min-h-12 items-center justify-center rounded-full bg-dema-forest px-7 text-sm font-semibold text-white transition hover:bg-[#284f3a] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dema-forest/35 focus-visible:ring-offset-2"
              >
                Faire le point sur votre entreprise
              </Link>
            </div>
          </div>
        </section>

        <section aria-labelledby="partners-problem-heading" className="px-5 py-16 sm:px-8 sm:py-20 lg:py-24">
          <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(20rem,0.8fr)] lg:items-start lg:gap-20">
            <div>
              <p className="text-sm font-medium text-dema-forest">Le vrai sujet</p>
              <h2 id="partners-problem-heading" className="demaa-marketing-section-title mt-4 max-w-3xl">
                Une activité rentable n’est pas encore un actif autonome.
              </h2>
              <p className="mt-5 max-w-3xl text-base leading-7 text-dema-muted">
                Tant que les décisions, la relation client, les méthodes et les chiffres restent concentrés autour du dirigeant, la valeur de l’entreprise dépend encore de sa présence.
              </p>
              <p className="mt-4 max-w-3xl text-base leading-7 text-dema-muted">
                Ce fonctionnement peut tenir pendant des années. Il limite pourtant la marge, la capacité à grandir, la délégation et la valeur que l’entreprise peut conserver ou transmettre.
              </p>
            </div>
            <aside className="rounded-[2rem] border border-dema-line bg-dema-paper p-7 sm:p-8">
              <p className="text-base font-medium">Une entreprise prend davantage de valeur lorsqu’elle devient :</p>
              <ul className="mt-5 space-y-4">
                {assetQualities.map((item) => (
                  <li key={item} className="flex gap-3 text-sm leading-6 text-dema-muted">
                    <Check className="mt-1 h-4 w-4 shrink-0 text-dema-forest" aria-hidden="true" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </aside>
          </div>
        </section>

        <section aria-labelledby="partners-role-heading" className="bg-dema-forest px-5 py-16 text-dema-paper sm:px-8 sm:py-20 lg:py-24">
          <div className="mx-auto max-w-6xl">
            <p className="text-sm font-medium text-dema-sage">Le partenaire de l’ombre</p>
            <h2 id="partners-role-heading" className="demaa-marketing-section-title mt-4 max-w-4xl text-dema-paper">
              Vous dirigez l’entreprise. Demaa fait tenir la structure derrière vous.
            </h2>
            <p className="mt-5 max-w-3xl text-base leading-7 text-dema-paper/72">
              Vous gardez le métier, les clients et les décisions qui engagent l’avenir. Demaa structure en coulisses les processus, les responsabilités, les outils et le pilotage qui permettent à l’organisation d’avancer sans tout faire remonter jusqu’à vous.
            </p>
            <div className="mt-10 grid gap-5 lg:grid-cols-2">
              <article className="rounded-[2rem] border border-dema-paper/16 bg-dema-paper/[0.06] p-7 sm:p-8">
                <UsersRound className="h-5 w-5 text-dema-sage" strokeWidth={1.6} aria-hidden="true" />
                <h3 className="mt-5 text-xl font-medium tracking-[-0.03em]">Vous gardez la direction</h3>
                <p className="mt-4 text-sm leading-6 text-dema-paper/72">
                  Vous portez la vision, les clients, l’équipe et les choix qui définissent ce que l’entreprise doit devenir.
                </p>
              </article>
              <article className="rounded-[2rem] border border-dema-paper/16 bg-dema-paper/[0.06] p-7 sm:p-8">
                <Handshake className="h-5 w-5 text-dema-sage" strokeWidth={1.6} aria-hidden="true" />
                <h3 className="mt-5 text-xl font-medium tracking-[-0.03em]">Demaa structure en coulisses</h3>
                <p className="mt-4 text-sm leading-6 text-dema-paper/72">
                  Nous installons les processus, le rythme de suivi, les outils et les indicateurs qui rendent l’entreprise plus efficace et moins fragile.
                </p>
              </article>
            </div>
          </div>
        </section>

        <section aria-labelledby="partners-systems-heading" className="border-b border-dema-line bg-dema-paper px-5 py-16 sm:px-8 sm:py-20 lg:py-24">
          <div className="mx-auto max-w-6xl">
            <p className="text-sm font-medium text-dema-forest">L’efficacité opérationnelle</p>
            <h2 id="partners-systems-heading" className="demaa-marketing-section-title mt-4 max-w-4xl">
              Ce qui transforme un savoir-faire en organisation qui prend de la valeur.
            </h2>
            <div className="mt-11 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              {partnershipAreas.map(({ icon: Icon, title, description }) => (
                <article key={title} className="rounded-[1.5rem] border border-dema-line bg-dema-cream p-6">
                  <span className="flex h-11 w-11 items-center justify-center rounded-full bg-dema-sage text-dema-forest">
                    <Icon className="h-5 w-5" strokeWidth={1.7} aria-hidden="true" />
                  </span>
                  <h3 className="mt-5 text-lg font-medium leading-snug tracking-[-0.02em]">{title}</h3>
                  <p className="mt-3 text-sm leading-6 text-dema-muted">{description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section aria-labelledby="partners-method-heading" className="border-b border-dema-line px-5 py-16 sm:px-8 sm:py-20 lg:py-24">
          <div className="mx-auto max-w-6xl">
            <p className="text-sm font-medium text-dema-forest">Du fonctionnement réel à l’actif</p>
            <h2 id="partners-method-heading" className="demaa-marketing-section-title mt-4 max-w-4xl">
              Structurer d’abord. Déléguer ensuite. Accélérer quand le socle tient.
            </h2>
            <div className="mt-11 grid gap-px overflow-hidden rounded-[2rem] border border-dema-line bg-dema-line md:grid-cols-4">
              {partnershipSteps.map((step, index) => (
                <article key={step.title} className="bg-dema-paper p-6 sm:p-7">
                  <p className="font-serif text-3xl italic text-dema-forest/55">{String(index + 1).padStart(2, "0")}</p>
                  <h3 className="mt-5 text-base font-medium tracking-[-0.02em]">{step.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-dema-muted">{step.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section aria-labelledby="partners-technology-heading" className="border-b border-dema-line bg-dema-sage/35 px-5 py-16 sm:px-8 sm:py-20 lg:py-24">
          <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[minmax(0,0.85fr)_minmax(20rem,1.15fr)] lg:items-start lg:gap-20">
            <div>
              <p className="text-sm font-medium text-dema-forest">Outils, automatisation et IA</p>
              <h2 id="partners-technology-heading" className="demaa-marketing-section-title mt-4">
                Automatiser un bon processus, pas un désordre.
              </h2>
            </div>
            <div className="space-y-4 text-base leading-7 text-dema-muted">
              <p>
                Nous commençons par clarifier les étapes, les responsabilités, les décisions et les contrôles. Ensuite seulement, nous utilisons les logiciels, l’automatisation et l’IA pour mieux servir les clients, fiabiliser les opérations et réduire le travail répétitif.
              </p>
              <p>
                L’objectif n’est pas d’ajouter de la technologie. Il est de rendre le fonctionnement plus rapide, plus fiable et plus facile à piloter avec les outils les plus utiles.
              </p>
            </div>
          </div>
        </section>

        <section aria-labelledby="partners-profile-heading" className="px-5 py-16 sm:px-8 sm:py-20 lg:py-24">
          <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[minmax(0,0.85fr)_minmax(20rem,1.15fr)] lg:gap-20">
            <div>
              <p className="text-sm font-medium text-dema-forest">Pour qui</p>
              <h2 id="partners-profile-heading" className="demaa-marketing-section-title mt-4">
                Une entreprise réelle, avec un potentiel encore bloqué par son fonctionnement.
              </h2>
              <p className="mt-5 max-w-xl text-base leading-7 text-dema-muted">
                Services terrain ou services professionnels : Demaa intervient lorsque l’activité a déjà une base solide et que l’organisation devient le principal levier de valeur.
              </p>
            </div>
            <ul className="divide-y divide-dema-line border-y border-dema-line">
              {companySignals.map((signal) => (
                <li key={signal} className="flex gap-3 py-4 text-sm leading-6">
                  <Check className="mt-1 h-4 w-4 shrink-0 text-dema-forest" aria-hidden="true" />
                  <span>{signal}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section aria-labelledby="partners-outcome-heading" className="bg-dema-forest px-5 py-16 text-dema-paper sm:px-8 sm:py-20 lg:py-24">
          <div className="mx-auto max-w-6xl">
            <p className="text-sm font-medium text-dema-sage">Ce que nous cherchons à construire</p>
            <h2 id="partners-outcome-heading" className="demaa-marketing-section-title mt-4 max-w-4xl text-dema-paper">
              Une entreprise rentable, prévisible et capable d’avancer sans tout dépendre de vous.
            </h2>
            <p className="mt-5 max-w-3xl text-base leading-7 text-dema-paper/72">
              Une entreprise prend de la valeur lorsque ses clients restent, que sa marge est maîtrisée, que l’équipe sait décider, que ses processus sont documentés et que ses résultats sont lisibles. C’est ce socle que Demaa construit avec vous. Il vous donne davantage de choix pour poursuivre la croissance, ouvrir le capital ou transmettre au bon moment.
            </p>
          </div>
        </section>

        <section id="partners-contact" aria-labelledby="partners-contact-heading" className="scroll-mt-24 border-t border-dema-line bg-dema-paper px-5 py-16 sm:px-8 sm:py-20 lg:py-24">
          <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[minmax(0,0.8fr)_minmax(22rem,1.2fr)] lg:gap-20">
            <div>
              <p className="text-sm font-medium text-dema-forest">Parlons de l’entreprise</p>
              <h2 id="partners-contact-heading" className="demaa-marketing-section-title mt-4">
                Où la valeur se perd-elle encore aujourd’hui ?
              </h2>
              <p className="mt-5 max-w-xl text-base leading-7 text-dema-muted">
                Présentez-nous l’activité, l’équipe, ce qui dépend encore de vous et les points qui limitent aujourd’hui la marge, la qualité ou la capacité à grandir.
              </p>
            </div>
            <StudioInterestForm />
          </div>
        </section>
      </main>
    </>
  );
}
