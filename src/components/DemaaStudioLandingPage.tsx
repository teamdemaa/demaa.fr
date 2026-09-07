import { ArrowUpRight, Check, Search, Shapes, Sparkles } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import StudioInterestForm from "@/components/StudioInterestForm";
import { DEMAA_STUDIO_PROJECTS } from "@/lib/demaa-studio-projects";
import { satoshiHeroTitleClassName } from "@/lib/marketing-hero-style";

const needSignals = [
  "Le problème revient souvent",
  "Les outils actuels répondent mal",
  "D’autres entreprises sont concernées",
] as const;

const studioRoles = [
  {
    icon: Search,
    title: "Vous apportez le métier et le terrain",
    description:
      "Votre connaissance du secteur, des usages et des contraintes permet de partir d’un problème réel.",
    items: [
      "L’expertise métier",
      "L’accès aux usages et aux utilisateurs pilotes",
      "Les retours qui orientent le produit",
    ],
  },
  {
    icon: Shapes,
    title: "Demaa porte la construction du produit",
    description:
      "Nous transformons le besoin en un logiciel utilisable, puis nous le testons avec d’autres entreprises du secteur.",
    items: [
      "La validation du besoin",
      "Le produit, le design et le développement",
      "Les tests, le lancement et la recherche de financements publics",
    ],
  },
] as const;

const studioSteps = [
  {
    title: "Comprendre",
    description: "Observer le problème, son contexte et ses conséquences concrètes.",
  },
  {
    title: "Vérifier",
    description: "Confirmer que d’autres entreprises du secteur rencontrent le même besoin.",
  },
  {
    title: "Concevoir",
    description: "Définir une première solution simple avec les futurs utilisateurs.",
  },
  {
    title: "Construire et tester",
    description: "Développer le produit avec une entreprise pilote et l’améliorer sur le terrain.",
  },
  {
    title: "Commercialiser",
    description: "Proposer le logiciel aux autres entreprises du secteur lorsque sa valeur est démontrée.",
  },
] as const;

const leaderBenefits = [
  "Une solution ancrée dans votre réalité métier",
  "Une équipe qui prend en charge la technologie",
  "Le temps, le budget et les responsabilités cadrés avant de construire",
  "Un rôle défini dans un produit destiné à votre secteur",
] as const;

export default function DemaaStudioLandingPage() {
  return (
    <>
      <Navbar minimal publicNavigationActiveView="none" />

      <main className="overflow-x-clip bg-dema-cream pb-24 text-brand-blue xl:pb-0">
        <section className="border-b border-dema-line px-5 pb-20 pt-14 text-center sm:px-8 sm:pb-24 sm:pt-20 lg:pb-28 lg:pt-24">
          <div className="mx-auto max-w-6xl">
            <p className="text-sm font-medium text-dema-forest">Le Studio</p>
            <h1
              aria-label="Construisons le logiciel dont votre métier a besoin."
              className={`${satoshiHeroTitleClassName} mx-auto mt-5 max-w-6xl`}
            >
              <span aria-hidden="true">
                <span className="block">Construisons le logiciel dont</span>
                <span className="demaa-hero-title mt-2 block text-dema-forest">
                  votre métier a besoin.
                </span>
              </span>
            </h1>
            <p className="mx-auto mt-8 max-w-3xl text-base leading-7 text-dema-muted sm:text-lg sm:leading-8">
              Demaa Studio s’associe à des dirigeants de TPE et PME pour identifier un besoin métier mal couvert, construire la solution avec le terrain, puis la commercialiser auprès des entreprises du secteur.
            </p>
            <div className="mt-8 flex flex-col items-center">
              <Link
                href="#studio-contact"
                className="inline-flex min-h-12 items-center justify-center rounded-full bg-dema-forest px-7 text-sm font-semibold text-white transition hover:bg-[#284f3a] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dema-forest/35 focus-visible:ring-offset-2"
              >
                Échanger sur un besoin métier
              </Link>
              <p className="mt-3 text-xs text-dema-muted">
                Un premier échange pour comprendre votre métier · Sans engagement
              </p>
            </div>
          </div>
        </section>

        <section
          aria-labelledby="studio-starting-point-heading"
          className="px-5 py-16 sm:px-8 sm:py-20 lg:py-24"
        >
          <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(20rem,0.8fr)] lg:items-start lg:gap-20">
            <div>
              <p className="text-sm font-medium text-dema-forest">Le point de départ</p>
              <h2 id="studio-starting-point-heading" className="demaa-marketing-section-title mt-4 max-w-3xl">
                Le point de départ n’est pas nécessairement une idée de logiciel.
              </h2>
              <p className="mt-5 max-w-3xl text-base leading-7 text-dema-muted">
                Cela peut être une tâche répétitive, une information difficile à suivre, un processus encore manuel ou un problème que plusieurs entreprises de votre secteur rencontrent.
              </p>
              <p className="mt-4 max-w-3xl text-base leading-7 text-dema-muted">
                Le besoin peut venir de vous, d’une observation de Demaa ou du travail mené ensemble. Nous le structurons avant de décider s’il mérite de devenir un produit.
              </p>
            </div>
            <div className="rounded-[2rem] border border-dema-line bg-dema-paper p-7 sm:p-8">
              <Sparkles className="h-5 w-5 text-dema-forest" strokeWidth={1.6} aria-hidden="true" />
              <p className="mt-5 text-base font-medium">Un besoin peut devenir un produit quand :</p>
              <ul className="mt-5 space-y-4">
                {needSignals.map((signal) => (
                  <li key={signal} className="flex gap-3 text-sm leading-6 text-dema-muted">
                    <Check className="mt-1 h-4 w-4 shrink-0 text-dema-forest" aria-hidden="true" />
                    <span>{signal}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section
          aria-labelledby="studio-partnership-heading"
          className="bg-dema-forest px-5 py-16 text-dema-paper sm:px-8 sm:py-20 lg:py-24"
        >
          <div className="mx-auto max-w-6xl">
            <div className="max-w-4xl">
              <p className="text-sm font-medium text-dema-sage">Le partenariat</p>
              <h2 id="studio-partnership-heading" className="demaa-marketing-section-title mt-4 text-dema-paper">
                Vous apportez le métier. Nous construisons le produit avec vous.
              </h2>
            </div>
            <div className="mt-10 grid gap-5 lg:grid-cols-2">
              {studioRoles.map(({ icon: Icon, title, description, items }) => (
                <article key={title} className="rounded-[2rem] border border-dema-paper/16 bg-dema-paper/[0.06] p-7 sm:p-8">
                  <Icon className="h-5 w-5 text-dema-sage" strokeWidth={1.6} aria-hidden="true" />
                  <h3 className="mt-5 text-xl font-medium tracking-[-0.03em]">{title}</h3>
                  <p className="mt-4 text-sm leading-6 text-dema-paper/72">{description}</p>
                  <ul className="mt-6 space-y-3">
                    {items.map((item) => (
                      <li key={item} className="flex gap-3 text-sm leading-6 text-dema-paper/78">
                        <Check className="mt-1 h-4 w-4 shrink-0 text-dema-sage" aria-hidden="true" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>
            <p className="mt-8 max-w-4xl text-sm leading-6 text-dema-paper/72">
              Les décisions se prennent ensemble. Le dirigeant reste la référence métier ; Demaa prend en charge la construction technologique du produit.
            </p>
          </div>
        </section>

        <section
          aria-labelledby="studio-method-heading"
          className="border-b border-dema-line bg-dema-paper px-5 py-16 sm:px-8 sm:py-20 lg:py-24"
        >
          <div className="mx-auto max-w-6xl">
            <p className="text-sm font-medium text-dema-forest">La méthode</p>
            <h2 id="studio-method-heading" className="demaa-marketing-section-title mt-4">
              Nous validons avant de construire.
            </h2>
            <div className="mt-11 grid gap-px overflow-hidden rounded-[2rem] border border-dema-line bg-dema-line md:grid-cols-5">
              {studioSteps.map((step, index) => (
                <article key={step.title} className="bg-dema-paper p-6 sm:p-7">
                  <p className="font-serif text-3xl italic text-dema-forest/55">{String(index + 1).padStart(2, "0")}</p>
                  <h3 className="mt-5 text-base font-medium tracking-[-0.02em]">{step.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-dema-muted">{step.description}</p>
                </article>
              ))}
            </div>
            <p className="mt-7 max-w-3xl text-sm leading-6 text-dema-muted">
              Chaque étape doit confirmer la suivante. Si le besoin n’est pas assez partagé ou la solution pas assez utile, nous ne lançons pas un développement lourd.
            </p>
          </div>
        </section>

        <section
          aria-labelledby="studio-benefits-heading"
          className="border-b border-dema-line bg-dema-sage/35 px-5 py-16 sm:px-8 sm:py-20 lg:py-24"
        >
          <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(20rem,1.1fr)] lg:gap-20">
            <div>
              <p className="text-sm font-medium text-dema-forest">Pour le dirigeant</p>
              <h2 id="studio-benefits-heading" className="demaa-marketing-section-title mt-4">
                Vous n’avez pas à devenir une entreprise technologique.
              </h2>
            </div>
            <div>
              <ul className="grid gap-4 sm:grid-cols-2">
                {leaderBenefits.map((benefit) => (
                  <li key={benefit} className="flex gap-3 rounded-2xl bg-dema-paper p-5 text-sm leading-6">
                    <Check className="mt-1 h-4 w-4 shrink-0 text-dema-forest" aria-hidden="true" />
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-5 rounded-2xl border border-dema-forest/15 bg-dema-paper p-6">
                <h3 className="text-base font-medium">Rechercher les financements mobilisables</h3>
                <p className="mt-3 text-sm leading-6 text-dema-muted">
                  Demaa recherche les aides et financements publics susceptibles de soutenir le développement du logiciel et accompagne la préparation des dossiers. L’éligibilité et l’obtention dépendent du projet et des organismes concernés.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section
          aria-labelledby="studio-projects-heading"
          className="px-5 py-16 sm:px-8 sm:py-20 lg:py-24"
        >
          <div className="mx-auto max-w-6xl">
            <div className="max-w-3xl">
              <p className="text-sm font-medium text-dema-forest">Les projets du Studio</p>
              <h2 id="studio-projects-heading" className="demaa-marketing-section-title mt-4">
                Des problèmes métier déjà transformés en produits.
              </h2>
            </div>
            <div className="mt-11 divide-y divide-dema-line border-y border-dema-line">
              {DEMAA_STUDIO_PROJECTS.map((project) => (
                <article
                  key={project.name}
                  className="grid gap-6 py-8 sm:grid-cols-[minmax(0,0.7fr)_minmax(0,1.3fr)_auto] sm:items-center sm:gap-8"
                >
                  <div className="flex items-center gap-4">
                    <Image src={project.logo} alt="" width={44} height={44} unoptimized />
                    <div>
                      <h3 className="text-xl font-medium tracking-[-0.03em]">{project.name}</h3>
                      <p className="mt-1 text-xs text-dema-muted">{project.sector}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm leading-6 text-brand-blue/82">{project.problem}</p>
                    <p className="mt-2 text-xs font-medium text-dema-forest">{project.status}</p>
                  </div>
                  <Link
                    href={project.href}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-dema-forest/24 px-5 text-sm font-medium text-dema-forest transition hover:bg-dema-sage focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dema-forest/30"
                    aria-label={`Découvrir ${project.name}, nouvelle fenêtre`}
                  >
                    Découvrir
                    <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                  </Link>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section
          id="studio-contact"
          aria-labelledby="studio-contact-heading"
          className="scroll-mt-24 border-t border-dema-line bg-dema-paper px-5 py-16 sm:px-8 sm:py-20 lg:py-24"
        >
          <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[minmax(0,0.8fr)_minmax(22rem,1.2fr)] lg:gap-20">
            <div>
              <p className="text-sm font-medium text-dema-forest">Premier échange</p>
              <h2 id="studio-contact-heading" className="demaa-marketing-section-title mt-4">
                Échangeons sur un besoin métier.
              </h2>
              <p className="mt-5 max-w-xl text-base leading-7 text-dema-muted">
                Décrivez simplement ce qui fonctionne mal aujourd’hui. Ce premier échange sert à comprendre le besoin, pas à vous engager dans un développement.
              </p>
            </div>
            <StudioInterestForm />
          </div>
        </section>
      </main>
    </>
  );
}
