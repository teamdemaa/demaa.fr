import Link from "next/link";
import { Suspense } from "react";
import {
  BarChart3,
  Check,
  ChevronDown,
  CircleCheck,
  Compass,
  GraduationCap,
  HeartHandshake,
  Layers3,
  Link2,
  Megaphone,
  MousePointerClick,
  Repeat2,
  Route,
} from "lucide-react";
import DemaaWordmark from "@/components/DemaaWordmark";
import OrganisationSessionBookingButton from "@/components/OrganisationSessionBookingButton";
import ProcessMapExplorer from "@/components/ProcessMapExplorer";

const proofPoints = [
  { value: "+ de 200", label: "dirigeants accompagnés" },
  { value: "115", label: "activités couvertes" },
  { value: "+ de 500", label: "processus métier structurés" },
] as const;

const systemPillars = [
  {
    number: "01",
    title: "Attirer les bonnes personnes",
    description:
      "Permettre aux personnes que vous pouvez réellement aider de découvrir votre entreprise.",
    icon: Megaphone,
    items: [
      "Votre positionnement et votre message clarifiés",
      "L’offre prioritaire à mettre en avant",
      "Le moyen le plus pertinent de vous faire connaître",
      "Un premier ensemble de contenus prêt à utiliser",
      "Une première diffusion ou campagne",
      "Des indicateurs pour comprendre l’origine des demandes",
    ],
  },
  {
    number: "02",
    title: "Faciliter le choix",
    description:
      "Permettre à chacun de comprendre précisément votre offre et de savoir si elle lui correspond.",
    icon: MousePointerClick,
    items: [
      "Une offre structurée : public, résultat, contenu, déroulement et prix",
      "Une présence web construite autour de cette offre",
      "Les réalisations, avis et autres preuves utiles",
      "Un devis, une réservation, un rendez-vous ou un paiement",
      "Une confirmation automatique",
      "Un tableau simple pour suivre les demandes",
    ],
  },
  {
    number: "03",
    title: "Fidéliser",
    description:
      "Continuer la relation après l’achat sans dépendre de votre mémoire ou de votre disponibilité.",
    icon: HeartHandshake,
    items: [
      "Une relance adaptée aux contacts ou devis sans réponse",
      "Une demande d’avis ou de recommandation",
      "Un modèle de newsletter",
      "Une base de contacts organisée",
      "Une routine mensuelle simple à reproduire",
    ],
  },
] as const;

const interventionSteps = [
  {
    number: "01",
    label: "Construction : quatre semaines",
    title: "Construire et lancer",
    description:
      "Nous choisissons le chemin utile, produisons les éléments, relions les outils et lançons le système.",
  },
  {
    number: "02",
    label: "Après 30 jours",
    title: "Observer et corriger",
    description:
      "Nous regardons les premiers retours et corrigeons les éventuels blocages.",
  },
  {
    number: "03",
    label: "Après 60 jours",
    title: "Stabiliser et transmettre",
    description:
      "Nous effectuons une dernière mise au point et vous transmettons la manière de maintenir le système.",
  },
] as const;

const retainedItems = [
  { label: "Votre positionnement et votre offre", icon: Compass },
  { label: "Votre présence web", icon: Layers3 },
  { label: "Vos premiers contenus", icon: Megaphone },
  { label: "Votre système de contact et de suivi", icon: Route },
  { label: "Vos modèles et automatisations", icon: Link2 },
  { label: "Vos indicateurs", icon: BarChart3 },
  { label: "Votre routine mensuelle", icon: Repeat2 },
  { label: "L’Académie Demaa en illimité", icon: GraduationCap },
] as const;

const faqItems = [
  {
    question: "Est-ce adapté à mon entreprise ?",
    answer:
      "L’intervention est conçue pour les entreprises qui ont déjà une offre de qualité et des clients, mais dont l’acquisition reste irrégulière ou trop dépendante du dirigeant.",
  },
  {
    question: "Comment savoir ce qu’il faut construire en priorité ?",
    answer:
      "C’est le rôle du diagnostic. Nous regardons ce qui existe, votre activité, vos clients et vos contraintes pour définir le chemin le plus utile.",
  },
  {
    question: "Devrai-je tout réaliser moi-même ?",
    answer:
      "Non. Vous nous expliquez votre activité, prenez les décisions importantes et validez. Demaa organise, rédige, produit, relie et met en place les éléments convenus.",
  },
  {
    question: "Est-ce que vous créez un site complet ?",
    answer:
      "L’offre comprend la présence web nécessaire au système : page dédiée, site d’une page ou réorganisation d’un parcours existant. Un site plus complet fait l’objet d’un périmètre séparé.",
  },
  {
    question: "Que se passe-t-il après les 60 jours ?",
    answer:
      "Le système vous appartient. Vous disposez des modèles, des indicateurs, de la routine et de l’Académie pour continuer.",
  },
  {
    question: "Le diagnostic m’engage-t-il ?",
    answer:
      "Non. Il sert à identifier ce qui manque et à vérifier si cette intervention est adaptée à votre situation.",
  },
] as const;

function BookingButton({
  className,
  source,
}: {
  className: string;
  source: string;
}) {
  const label = "Réserver mon diagnostic marketing offert";

  return (
    <Suspense
      fallback={
        <span className={className} aria-hidden="true">
          {label}
        </span>
      }
    >
      <OrganisationSessionBookingButton
        className={className}
        label={label}
        source={source}
      />
    </Suspense>
  );
}

function SectionTitle({
  children,
  description,
}: {
  children: React.ReactNode;
  description?: string;
}) {
  return (
    <div className="mx-auto max-w-5xl text-center">
      <h2
        className="text-balance font-light tracking-[-0.055em] text-brand-blue"
        style={{ fontSize: "clamp(2.7rem, 5vw, 4.9rem)", lineHeight: 0.98 }}
      >
        {children}
      </h2>
      {description ? (
        <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-dema-muted">
          {description}
        </p>
      ) : null}
    </div>
  );
}

export default function EthicalMarketingLandingPage() {
  return (
    <main className="overflow-hidden bg-dema-canvas text-brand-blue">
      <header className="relative z-30 border-b border-dema-line bg-dema-paper">
        <div className="mx-auto flex min-h-20 max-w-7xl items-center justify-between gap-5 px-5 sm:px-8 lg:px-10">
          <Link href="/" aria-label="Retour à l’accueil Demaa">
            <DemaaWordmark
              className="text-[2rem]"
              colorClassName="text-dema-forest"
            />
          </Link>
          <nav
            className="hidden items-center gap-7 text-sm text-brand-blue/58 lg:flex"
            aria-label="Navigation de la page"
          >
            <Link href="#systeme" className="transition hover:text-dema-forest">
              Le système
            </Link>
            <Link href="#exemples" className="transition hover:text-dema-forest">
              Les exemples
            </Link>
            <Link
              href="#deroulement"
              className="transition hover:text-dema-forest"
            >
              Le déroulement
            </Link>
            <Link href="#prix" className="transition hover:text-dema-forest">
              Le tarif
            </Link>
          </nav>
          <BookingButton
            className="demaa-primary-button min-h-11 px-5"
              source="Système marketing : navigation"
          />
        </div>
      </header>

      <section className="relative isolate border-b border-dema-line bg-dema-paper">
        <div
          className="pointer-events-none absolute inset-0 -z-10 opacity-70"
          aria-hidden="true"
          style={{
            background:
              "radial-gradient(circle at 50% 15%, rgba(49,95,70,.1), transparent 36%)",
          }}
        />
        <div className="mx-auto flex min-h-[calc(100svh-5rem)] max-w-7xl flex-col items-center justify-center px-5 py-20 text-center sm:px-8 lg:px-10">
          <h1
            className="demaa-fade-up max-w-[72rem] text-balance font-light tracking-[-0.067em] text-brand-blue"
            style={{
              fontSize: "clamp(4rem, 8vw, 8rem)",
              lineHeight: 0.88,
            }}
          >
            Votre développement ne devrait pas dépendre{" "}
            <span className="demaa-hero-title text-dema-forest">
              uniquement de vous.
            </span>
          </h1>
          <p className="demaa-fade-up demaa-delay-2 mt-10 max-w-4xl text-xl leading-9 text-dema-muted">
            Nous construisons le système qui aide les bonnes personnes à
            découvrir votre entreprise, à comprendre votre offre et à rester en
            lien avec vous.
          </p>
          <div className="demaa-fade-up demaa-delay-3 mt-9">
            <BookingButton
              className="demaa-primary-button min-h-13 px-7"
                source="Système marketing : introduction"
            />
          </div>
        </div>
      </section>

      <section
        aria-label="Expérience Demaa"
        className="border-b border-dema-line bg-dema-positive px-5 py-14 sm:px-8"
      >
        <div className="mx-auto grid max-w-5xl gap-9 sm:grid-cols-3 sm:gap-0">
          {proofPoints.map((proof, index) => (
            <div
              key={proof.label}
              className={`text-center ${
                index > 0 ? "sm:border-l sm:border-dema-forest/12" : ""
              }`}
            >
              <p className="text-4xl font-light tracking-[-0.04em] text-dema-forest md:text-5xl">
                {proof.value}
              </p>
              <p className="mt-2 text-base text-dema-muted">{proof.label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-dema-forest py-24 text-white md:py-28">
        <div className="mx-auto grid max-w-7xl gap-12 px-5 sm:px-8 lg:grid-cols-[.95fr_1.05fr] lg:items-center lg:px-10">
          <h2
            className="max-w-2xl text-balance font-light tracking-[-0.05em]"
            style={{ fontSize: "clamp(2.8rem, 4.7vw, 4.8rem)", lineHeight: 1 }}
          >
            Vous savez qu’il faut structurer votre acquisition.{" "}
            <span className="demaa-section-title text-white/66">
              Mais par où commencer ?
            </span>
          </h2>
          <div className="max-w-2xl">
            <p className="text-xl leading-9 text-white/78">
              Votre offre fonctionne et votre bouche-à-oreille vous apporte
              déjà des clients.
            </p>
            <p className="mt-5 text-lg leading-8 text-white/62">
              Contenus, Google, site internet, publicité, messages,
              automatisations… Vous ne savez pas toujours ce qui est prioritaire.
              Ou vous n’avez simplement pas le temps de tout mettre en place.
            </p>
            <p className="mt-7 border-l border-white/30 pl-5 text-lg font-medium leading-8 text-white">
              Nous choisissons avec vous le chemin le plus utile, puis nous le
              construisons dans le bon ordre.
            </p>
          </div>
        </div>
      </section>

      <section
        id="systeme"
        className="scroll-mt-10 bg-dema-paper py-24 md:py-32"
      >
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
          <SectionTitle description="Chaque élément conduit naturellement au suivant.">
            Nous ne vous livrons pas des outils isolés.{" "}
            <span className="demaa-section-title text-dema-forest">
              Nous construisons le chemin complet.
            </span>
          </SectionTitle>

          <div className="mt-16 grid gap-5 lg:grid-cols-3">
            {systemPillars.map((pillar) => {
              const Icon = pillar.icon;
              return (
                <article
                  key={pillar.title}
                  className="flex flex-col rounded-[2rem] border border-dema-line bg-dema-canvas p-7 sm:p-8"
                >
                  <div className="flex items-center justify-between">
                    <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-dema-positive text-dema-forest">
                      <Icon className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <span className="text-xs font-bold tracking-[0.16em] text-brand-blue/24">
                      {pillar.number}
                    </span>
                  </div>
                  <h3 className="mt-8 text-3xl font-light leading-tight tracking-[-0.04em]">
                    {pillar.title}
                  </h3>
                  <p className="mt-4 min-h-[5.25rem] text-base leading-7 text-dema-muted">
                    {pillar.description}
                  </p>
                  <ul className="mt-7 space-y-3 border-t border-dema-line pt-6">
                    {pillar.items.map((item) => (
                      <li
                        key={item}
                        className="flex gap-3 text-base leading-6 text-brand-blue/68"
                      >
                        <CircleCheck
                          className="mt-0.5 h-4 w-4 shrink-0 text-dema-forest"
                          aria-hidden="true"
                        />
                        {item}
                      </li>
                    ))}
                  </ul>
                </article>
              );
            })}
          </div>

          <div className="mt-6 rounded-[1.8rem] border border-dema-forest/12 bg-dema-positive px-6 py-8 text-center sm:px-10">
            <p className="text-xl font-medium tracking-[-0.02em] text-dema-forest sm:text-2xl">
              Être découvert{" "}
              <span className="mx-2 text-dema-forest/30">→</span> Comprendre
              l’offre <span className="mx-2 text-dema-forest/30">→</span>{" "}
              Avancer simplement{" "}
              <span className="mx-2 text-dema-forest/30">→</span> Garder le lien
            </p>
            <p className="mx-auto mt-4 max-w-3xl text-base leading-7 text-dema-muted">
              Les contenus conduisent vers l’offre, les demandes sont suivies et
              la relation continue après l’achat. Le fonctionnement est
              documenté pour pouvoir continuer sans nous.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-dema-forest py-24 text-white md:py-28">
        <div className="mx-auto max-w-6xl px-5 text-center sm:px-8">
          <h2
            className="text-balance font-light tracking-[-0.05em]"
            style={{ fontSize: "clamp(2.8rem, 5vw, 5rem)", lineHeight: 0.98 }}
          >
            Vous n’avez pas besoin{" "}
            <span className="demaa-section-title text-white/68">
              de forcer pour être choisi.
            </span>
          </h2>
          <p className="mx-auto mt-7 max-w-3xl text-lg leading-8 text-white/68">
            Vos clients doivent pouvoir comprendre ce que vous proposez, savoir
            si cela leur convient et avancer sans pression.
          </p>
          <p className="mx-auto mt-5 max-w-3xl text-base leading-7 text-white/52">
            Sans promesse exagérée, sans urgence artificielle et sans
            communication qui abîme leur confiance. Tout repose d’abord sur un
            produit ou un service de qualité qui répond à un vrai besoin.
          </p>
        </div>
      </section>

      <section className="border-b border-dema-line bg-dema-paper py-24 md:py-28">
        <div className="mx-auto grid max-w-7xl gap-12 px-5 sm:px-8 lg:grid-cols-[.9fr_1.1fr] lg:items-center lg:px-10">
          <div>
            <h2
              className="max-w-2xl text-balance font-light tracking-[-0.05em]"
              style={{ fontSize: "clamp(2.8rem, 4.7vw, 4.7rem)", lineHeight: 1 }}
            >
              Vous n’avez pas besoin de devenir{" "}
              <span className="demaa-section-title text-dema-forest">
                spécialiste du marketing.
              </span>
            </h2>
            <p className="mt-7 max-w-xl text-lg leading-8 text-dema-muted">
              Vous nous expliquez votre activité et validez les décisions
              importantes. Nous organisons et construisons le reste.
            </p>
          </div>
          <div className="rounded-[2rem] border border-dema-line bg-dema-canvas p-7 sm:p-9">
            <p className="text-xl font-medium tracking-[-0.02em] text-dema-forest">
              Un seul interlocuteur. Un système cohérent.
            </p>
            <p className="mt-4 text-base leading-7 text-dema-muted">
              Vous n’aurez pas à coordonner une personne pour le contenu, une
              autre pour le site et une troisième pour les outils.
            </p>
            <div className="mt-7 grid gap-3 sm:grid-cols-2">
              {[
                "Positionnement & offre",
                "Contenus & diffusion",
                "Présence web",
                "Outils & automatisations",
              ].map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-3 rounded-2xl border border-dema-line bg-dema-paper px-4 py-4 text-base text-brand-blue/70"
                >
                  <Check
                    className="h-4 w-4 shrink-0 text-dema-forest"
                    aria-hidden="true"
                  />
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <ProcessMapExplorer />

      <section
        id="deroulement"
        className="scroll-mt-10 bg-dema-paper py-24 md:py-32"
      >
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
          <SectionTitle>
            Nous construisons. Nous restons.{" "}
            <span className="demaa-section-title text-dema-forest">
              Puis nous vous laissons la main.
            </span>
          </SectionTitle>

          <div className="mt-16 grid gap-5 lg:grid-cols-3">
            {interventionSteps.map((step) => (
              <article
                key={step.number}
                className="rounded-[2rem] border border-dema-line bg-dema-canvas p-7 sm:p-8"
              >
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-dema-forest">
                    {step.label}
                  </p>
                  <span className="text-sm text-brand-blue/25">
                    {step.number}
                  </span>
                </div>
                <h3 className="mt-9 text-3xl font-light tracking-[-0.045em]">
                  {step.title}
                </h3>
                <p className="mt-5 text-base leading-7 text-dema-muted">
                  {step.description}
                </p>
              </article>
            ))}
          </div>

          <div className="mt-6 rounded-[1.6rem] bg-dema-forest px-6 py-7 text-center text-white sm:px-10">
            <p className="text-2xl font-light tracking-[-0.025em]">
              Nous ne disparaissons pas après la mise en place.
            </p>
            <p className="mx-auto mt-3 max-w-3xl text-sm leading-6 text-white/56">
              Les deux mises au point concernent le système installé. Elles ne
              comprennent pas de nouvelles productions.
            </p>
          </div>
        </div>
      </section>

      <section className="border-y border-dema-line bg-dema-canvas py-24 md:py-32">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
          <SectionTitle description="Vous ne repartez pas avec une liste de conseils. Le premier système est déjà construit.">
            À notre départ,{" "}
            <span className="demaa-section-title text-dema-forest">
              le système continue sans nous.
            </span>
          </SectionTitle>

          <div className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {retainedItems.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.label}
                  className="rounded-[1.5rem] border border-dema-line bg-dema-paper px-5 py-7 text-center"
                >
                  <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-dema-positive text-dema-forest">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <p className="mt-5 text-base font-medium leading-6 text-brand-blue/72">
                    {item.label}
                  </p>
                </div>
              );
            })}
          </div>

          <div className="mx-auto mt-6 flex max-w-6xl flex-col items-center gap-5 rounded-[1.7rem] border border-dema-forest/12 bg-dema-positive px-7 py-8 text-center sm:flex-row sm:px-10 sm:text-left">
            <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-dema-paper text-dema-forest">
              <GraduationCap className="h-6 w-6" aria-hidden="true" />
            </span>
            <div>
              <p className="text-2xl font-light tracking-[-0.025em] text-dema-forest">
                L’Académie Demaa reste accessible en illimité.
              </p>
              <p className="mt-2 text-base leading-7 text-dema-muted">
                Pour retrouver les méthodes, comprendre les indicateurs et
                continuer à faire vivre le système à votre rythme.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section
        id="prix"
        className="scroll-mt-10 bg-dema-paper py-24 md:py-32"
      >
        <div className="mx-auto max-w-6xl px-5 sm:px-8 lg:px-10">
          <div className="overflow-hidden rounded-[2.4rem] border border-dema-line bg-dema-canvas shadow-[0_28px_80px_rgba(23,35,29,0.07)]">
            <div className="grid lg:grid-cols-[1.05fr_.95fr]">
              <div className="p-7 sm:p-11 lg:p-14">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-dema-forest">
                  Installation et mise au point
                </p>
                <h2
                  className="mt-5 max-w-2xl text-balance font-light tracking-[-0.05em]"
                  style={{
                    fontSize: "clamp(2.7rem, 4.7vw, 4.5rem)",
                    lineHeight: 0.98,
                  }}
                >
                  Le système construit, lancé{" "}
                  <span className="demaa-section-title text-dema-forest">
                    puis sécurisé.
                  </span>
                </h2>
                <ul className="mt-9 grid gap-3 sm:grid-cols-2">
                  {[
                    "Quatre semaines de construction",
                    "La production convenue",
                    "La mise en place du système",
                    "Deux mises au point",
                    "Les modèles et indicateurs",
                    "L’Académie en illimité",
                  ].map((item) => (
                    <li
                      key={item}
                      className="flex gap-2.5 rounded-xl border border-dema-line bg-dema-paper px-4 py-3 text-base text-brand-blue/67"
                    >
                      <Check
                        className="mt-0.5 h-4 w-4 shrink-0 text-dema-forest"
                        aria-hidden="true"
                      />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <aside className="flex flex-col justify-between bg-dema-forest p-7 text-white sm:p-11 lg:p-14">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/48">
                    Tarif
                  </p>
                  <p className="mt-7 text-6xl font-light tracking-[-0.06em]">
                    2 000 €
                  </p>
                  <p className="mt-4 text-base text-white/66">
                    Payable en deux fois 1 000 €.
                  </p>
                  <div className="mt-8 border-t border-white/10 pt-7 text-base leading-7 text-white/58">
                    <p>Aucun abonnement.</p>
                    <p>Aucun renouvellement automatique.</p>
                  </div>
                </div>
                <div className="mt-10">
                  <BookingButton
                    className="inline-flex min-h-13 w-full items-center justify-center rounded-full bg-white px-6 text-sm font-bold text-dema-forest transition hover:bg-dema-canvas"
                  source="Système marketing : tarif"
                  />
                </div>
              </aside>
            </div>
            <p className="border-t border-dema-line bg-dema-paper px-7 py-5 text-center text-sm leading-6 text-dema-muted">
              Budgets publicitaires, abonnements externes, sites complets,
              productions supplémentaires et développements complexes non
              inclus.
            </p>
          </div>
        </div>
      </section>

      <section className="border-y border-dema-line bg-dema-canvas py-24 md:py-28">
        <div className="mx-auto max-w-4xl px-5 sm:px-8">
          <SectionTitle>Questions fréquentes.</SectionTitle>
          <div className="mt-14 space-y-3">
            {faqItems.map((item) => (
              <details
                key={item.question}
                className="demaa-accordion bg-dema-paper px-5 py-5 sm:px-7 sm:py-6"
              >
                <summary className="flex cursor-pointer items-center justify-between gap-5">
                  <span className="text-base font-medium text-brand-blue sm:text-lg">
                    {item.question}
                  </span>
                  <ChevronDown
                    className="demaa-accordion-chevron h-5 w-5 shrink-0 text-dema-forest transition-transform"
                    aria-hidden="true"
                  />
                </summary>
                <p className="demaa-accordion-content mt-4 max-w-2xl pr-8 text-base leading-7 text-dema-muted">
                  {item.answer}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-dema-paper py-24 text-center">
        <div className="mx-auto max-w-4xl px-5 sm:px-8">
          <h2
            className="text-balance font-light tracking-[-0.05em]"
            style={{ fontSize: "clamp(2.8rem, 5vw, 4.8rem)", lineHeight: 0.98 }}
          >
            Commençons par regarder{" "}
            <span className="demaa-section-title text-dema-forest">
              ce qui existe déjà.
            </span>
          </h2>
          <BookingButton
            className="demaa-primary-button mt-9 min-h-13 px-7"
                source="Système marketing : conclusion"
          />
        </div>
      </section>
    </main>
  );
}
