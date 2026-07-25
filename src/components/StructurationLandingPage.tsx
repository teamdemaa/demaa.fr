import Image from "next/image";
import Link from "next/link";
import { Suspense, type ComponentType } from "react";
import {
  ArrowRight,
  BarChart3,
  BriefcaseBusiness,
  Check,
  ChevronDown,
  ClipboardCheck,
  FileText,
  Globe2,
  LayoutDashboard,
  ListChecks,
  LockKeyhole,
  Megaphone,
  MonitorSmartphone,
  Settings2,
  Target,
  Users,
  Workflow,
} from "lucide-react";
import DemaaWordmark from "@/components/DemaaWordmark";
import OrganisationSessionBookingButton from "@/components/OrganisationSessionBookingButton";
import { StructureNewsletterSignup } from "@/components/StructureNewsletterSignup";

type IconType = ComponentType<{ className?: string; "aria-hidden"?: boolean }>;

const proofPoints = [
  { value: "+ de 200", label: "dirigeants accompagnés" },
  { value: "115", label: "activités couvertes" },
  { value: "+ de 500", label: "processus métier structurés" },
] as const;

const sectorItems = [
  {
    title: "Bâtiment & travaux",
    image: "/images/structuration-sectors/batiment-travaux.jpg",
    imageClassName:
      "object-[64%_50%] saturate-[.42] contrast-[.93] brightness-[.98] sepia-[.1]",
  },
  {
    title: "Cabinets comptables",
    image: "/images/structuration-sectors/cabinets-comptables.jpg",
    imageClassName:
      "object-[center_44%] saturate-[.56] contrast-[.94] brightness-[1.02] sepia-[.08]",
  },
  {
    title: "Services de terrain",
    image: "/images/structuration-sectors/services-terrain.jpg",
    imageClassName:
      "object-[center_45%] saturate-[.4] contrast-[.92] brightness-[.99] sepia-[.1]",
  },
  {
    title: "Commerce & restauration",
    image: "/images/structuration-sectors/commerce-restauration.jpg",
    imageClassName:
      "object-[center_46%] saturate-[.55] contrast-[.94] brightness-[1.01] sepia-[.07]",
  },
] as const;

const structurationPillars = [
  {
    number: "01",
    title: "Pilotage & direction",
    description: "Priorités, indicateurs et rythme de décision",
  },
  {
    number: "02",
    title: "Marketing & ventes",
    description: "Acquisition, opportunités et relances",
  },
  {
    number: "03",
    title: "Finance & administratif",
    description: "Trésorerie, marge, facturation et échéances",
  },
  {
    number: "04",
    title: "Opérations",
    description: "Étapes, qualité, contrôles et passages de relais",
  },
  {
    number: "05",
    title: "Équipe & responsabilités",
    description: "Rôles, autonomie et transmission",
  },
] as const;

const methodSteps = [
  {
    number: "01",
    title: "Comprendre votre fonctionnement",
    description:
      "Nous réunissons l’essentiel : priorités, chiffres, outils, responsabilités et processus existants.",
  },
  {
    number: "02",
    title: "Structurer l’organisation",
    description:
      "Un atelier de travail pour repérer les blocages, clarifier les rôles et définir qui fait quoi.",
  },
  {
    number: "03",
    title: "Formaliser les processus",
    description:
      "Demaa documente les étapes, les responsabilités et les règles de décision adaptées à votre activité.",
  },
  {
    number: "04",
    title: "Installer le pilotage",
    description:
      "Nous configurons votre espace de pilotage, accompagnons sa prise en main et l’ajustons avec votre équipe.",
  },
] as const;

const teamExpertiseItems: ReadonlyArray<{
  icon: IconType;
  title: string;
  description: string;
}> = [
  {
    icon: BarChart3,
    title: "Expert financier",
    description: "Chiffres, rentabilité et points de vigilance.",
  },
  {
    icon: Users,
    title: "Structuration & pilotage",
    description: "Priorités, rôles et rythme de fonctionnement.",
  },
  {
    icon: Workflow,
    title: "Processus & opérations",
    description: "Étapes claires, responsabilités et autonomie.",
  },
  {
    icon: Settings2,
    title: "Outils & automatisation",
    description: "Seulement les solutions réellement utiles.",
  },
];

const cockpitHighlights: ReadonlyArray<{
  icon: IconType;
  label: string;
}> = [
  { icon: ListChecks, label: "Vos priorités" },
  { icon: BarChart3, label: "Vos chiffres" },
  { icon: Workflow, label: "Vos processus" },
];

const caseResults = [
  { value: "36 jours/an", label: "gagnés côté comptabilité" },
  { value: "30 jours/an", label: "gagnés côté paie" },
  { value: "Jusqu’à 30 000 €", label: "de capacité facturable récupérée par an" },
] as const;

const retainedItems: ReadonlyArray<{
  icon: IconType;
  label: string;
}> = [
  { icon: Settings2, label: "Votre organisation documentée" },
  { icon: ClipboardCheck, label: "Vos processus et responsabilités" },
  { icon: MonitorSmartphone, label: "Votre espace de pilotage configuré" },
  { icon: FileText, label: "Votre plan d’action" },
];

const partnerItems: ReadonlyArray<{
  icon: IconType;
  label: string;
}> = [
  { icon: LayoutDashboard, label: "Logiciels" },
  { icon: Globe2, label: "Site internet" },
  { icon: Megaphone, label: "Prospection" },
  { icon: Target, label: "Services spécialisés" },
];

const priceItems = [
  "Diagnostic et atelier de structuration",
  "Formalisation des rôles et des processus",
  "Configuration de l’espace de pilotage",
  "Mise en place et suivi pendant deux mois",
  "Accès à l’outil de pilotage gratuit à vie",
] as const;

const faqItems = [
  {
    question: "Dois-je changer tous mes outils ?",
    answer:
      "Non. Demaa organise d’abord ce que vous utilisez déjà. Un nouvel outil n’est proposé que s’il répond à un besoin réel.",
  },
  {
    question: "Est-ce adapté à une petite entreprise ?",
    answer:
      "Oui. La mission est pensée pour les TPE, les cabinets, les indépendants en croissance et les petites équipes.",
  },
  {
    question: "La première session m’engage-t-elle ?",
    answer:
      "Non. Elle sert à comprendre votre fonctionnement, identifier les premières priorités et vérifier si la mission est adaptée.",
  },
  {
    question: "Qu’est-ce que je conserve après la mission ?",
    answer:
      "Vos processus, vos responsabilités, votre plan d’action et votre espace de pilotage, accessible gratuitement à vie.",
  },
] as const;

function BookingButton({
  className,
  label,
  source,
}: {
  className: string;
  label: string;
  source: string;
}) {
  return (
    <Suspense
      fallback={(
        <span className={className} aria-hidden="true">
          {label}
        </span>
      )}
    >
      <OrganisationSessionBookingButton
        className={className}
        label={label}
        source={source}
      />
    </Suspense>
  );
}

function SectionHeading({
  eyebrow,
  title,
  description,
  centered = true,
}: {
  eyebrow?: string;
  title: React.ReactNode;
  description?: string;
  centered?: boolean;
}) {
  return (
    <div className={centered ? "mx-auto max-w-3xl text-center" : "max-w-3xl"}>
      {eyebrow ? (
        <p className="text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-dema-forest">
          {eyebrow}
        </p>
      ) : null}
      <h2 className="mt-4 text-balance text-[clamp(2.15rem,5vw,4.35rem)] font-light leading-[1.02] tracking-[-0.045em] text-brand-blue">
        {title}
      </h2>
      {description ? (
        <p className="mx-auto mt-6 max-w-2xl text-balance text-base leading-7 text-dema-muted md:text-lg md:leading-8">
          {description}
        </p>
      ) : null}
    </div>
  );
}

function CockpitPhone() {
  return (
    <div className="relative mx-auto w-full max-w-[22rem] rounded-[3.25rem] border-[9px] border-brand-blue bg-dema-paper p-3 shadow-[0_40px_90px_rgba(23,35,29,0.16)]">
      <div className="absolute left-1/2 top-2 h-6 w-24 -translate-x-1/2 rounded-full bg-brand-blue" />
      <div className="rounded-[2.35rem] bg-dema-canvas px-4 pb-5 pt-10">
        <div className="flex items-start justify-between">
          <div>
            <DemaaWordmark className="text-xl" />
            <p className="mt-3 text-sm font-semibold text-brand-blue">
              Nova Construction
            </p>
            <p className="text-[0.68rem] text-dema-muted">
              Entreprise du bâtiment
            </p>
          </div>
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-dema-positive text-[0.65rem] font-semibold text-dema-forest">
            NC
          </span>
        </div>

        <div className="mt-5 rounded-2xl border border-dema-line bg-dema-paper p-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[0.62rem] text-dema-muted">
                Kit Bâtiment actif
              </p>
              <p className="mt-1 text-xs font-semibold text-brand-blue">
                7 processus · 15 outils
              </p>
            </div>
            <span className="rounded-full bg-dema-positive px-2 py-1 text-[0.55rem] font-semibold text-dema-forest">
              Actif
            </span>
          </div>
        </div>

        <div className="mt-3 space-y-2.5">
          <CockpitMetric
            icon={LayoutDashboard}
            label="Trésorerie disponible"
            value="42 800 €"
            note="3 mois de sécurité"
          />
          <CockpitMetric
            icon={ListChecks}
            label="Priorités à 15 jours"
            value="3 / 5"
            note="2 à lancer"
          />
          <CockpitMetric
            icon={Users}
            label="Processus autonomes"
            value="68 %"
            note="4 dépendent encore de vous"
          />
        </div>

        <div className="mt-5">
          <p className="text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-dema-muted">
            À faire maintenant
          </p>
          <div className="mt-2 divide-y divide-dema-line rounded-2xl border border-dema-line bg-dema-paper px-3">
            {[
              ["Valider le planning des trois prochains chantiers", "Issa"],
              ["Formaliser la réception de chantier", "Sam"],
              ["Relancer les factures à plus de 30 jours", "Maya"],
            ].map(([task, owner]) => (
              <div
                key={task}
                className="grid grid-cols-[1fr_auto] gap-3 py-2.5"
              >
                <p className="text-[0.62rem] leading-4 text-brand-blue">
                  {task}
                </p>
                <p className="text-[0.58rem] text-dema-muted">{owner}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function CockpitMetric({
  icon: Icon,
  label,
  value,
  note,
}: {
  icon: IconType;
  label: string;
  value: string;
  note: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-dema-line bg-dema-paper p-3">
      <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-dema-positive text-dema-forest">
        <Icon className="h-4 w-4" aria-hidden />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[0.62rem] text-dema-muted">{label}</p>
        <p className="mt-0.5 text-lg font-semibold leading-none text-dema-forest">
          {value}
        </p>
        <p className="mt-1 text-[0.56rem] text-dema-forest">{note}</p>
      </div>
      <ArrowRight className="h-3.5 w-3.5 text-dema-muted" aria-hidden />
    </div>
  );
}

export default function StructurationLandingPage() {
  return (
    <main className="overflow-hidden bg-dema-cream text-brand-blue">
      <header className="border-b border-dema-line/70 bg-dema-cream/95">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-5 py-5 sm:px-8 lg:px-12">
          <Link href="/" aria-label="Retour à l’accueil">
            <DemaaWordmark className="text-[1.8rem] md:text-[2.1rem]" />
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/kits-operationnels"
              aria-label="Découvrir les kits opérationnels"
              className="demaa-secondary-button h-10 min-h-10 w-auto shrink-0 gap-2 px-3 text-xs md:px-4 md:text-sm"
            >
              <BriefcaseBusiness
                className="h-4 w-4 shrink-0"
                aria-hidden="true"
              />
              <span className="md:hidden">Kit opérationnel</span>
              <span className="hidden md:inline">
                Découvrir les kits opérationnels
              </span>
            </Link>
            <Link
              href="/connexion"
              className="hidden text-sm font-medium text-brand-blue/62 transition hover:text-dema-forest sm:inline-flex"
            >
              Se connecter
            </Link>
          </div>
        </div>
      </header>

      <section className="px-5 pb-28 pt-[3.36rem] sm:px-8 sm:pb-36 sm:pt-[4.48rem] lg:pb-44 lg:pt-[5.6rem]">
        <div className="mx-auto max-w-6xl text-center">
          <h1 className="mx-auto max-w-5xl text-balance text-[clamp(2.65rem,6.8vw,5.95rem)] font-light leading-[0.92] tracking-[-0.06em] text-brand-blue">
            <span className="font-sans font-light text-[#6F756E]">
              Structurez votre entreprise pour qu’elle
            </span>{" "}
            <span className="demaa-hero-title text-dema-forest">
              dépende moins de vous.
            </span>
          </h1>
          <p className="mx-auto mt-9 max-w-2xl text-balance text-base leading-7 text-dema-muted sm:text-lg sm:leading-8">
            En deux mois, Demaa clarifie les responsabilités, formalise les
            processus et configure un espace de pilotage adapté à votre
            activité.
          </p>
          <div className="mt-9">
            <BookingButton
              className="demaa-primary-button min-h-13 w-full px-7 text-sm sm:w-auto sm:min-w-[22rem]"
              label="Première session de structuration offerte"
              source="Accueil structuration — Hero"
            />
            <p className="mt-4 text-xs text-dema-muted">
              30 min · Sans engagement
            </p>
          </div>
        </div>
      </section>

      <section
        aria-label="Expérience Demaa"
        className="border-y border-dema-line/70 bg-dema-paper px-5 py-14 sm:px-8 sm:py-18"
      >
        <div className="mx-auto grid max-w-5xl gap-10 sm:grid-cols-3 sm:gap-0">
          {proofPoints.map((proof, index) => (
            <div
              key={proof.label}
              className={`text-center ${
                index > 0 ? "sm:border-l sm:border-dema-line" : ""
              }`}
            >
              <p className="text-4xl font-light tracking-[-0.04em] text-brand-blue md:text-5xl">
                {proof.value}
              </p>
              <p className="mt-2 text-sm text-dema-muted">{proof.label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-dema-sage/45 px-5 py-28 sm:px-8 sm:py-36 lg:py-44">
        <SectionHeading
          title="Si vous vous absentez un mois, qu’est-ce qui s’arrête ?"
          description="Demaa repère les décisions, les tâches et les informations qui reposent encore sur vous, puis organise leur transmission à votre équipe."
        />
      </section>

      <section
        aria-labelledby="secteurs-heading"
        className="px-5 py-24 sm:px-8 sm:py-28 lg:px-12 lg:py-32"
      >
        <div className="mx-auto max-w-7xl">
          <h2
            id="secteurs-heading"
            className="mx-auto max-w-6xl text-center text-balance text-[clamp(2.15rem,4.4vw,4.2rem)] font-light leading-[1.02] tracking-[-0.05em] text-brand-blue"
          >
            Des activités différentes. Un même besoin :{" "}
            <span className="demaa-section-title text-dema-forest">
              ne plus tout porter.
            </span>
          </h2>

          <div className="mt-14 grid grid-cols-2 gap-x-4 gap-y-9 sm:gap-x-5 lg:mt-18 lg:grid-cols-4">
            {sectorItems.map((sector) => (
              <figure key={sector.title}>
                <div className="relative aspect-[1.45/1] overflow-hidden rounded-[1.15rem] bg-dema-sage sm:aspect-[1.35/1] lg:aspect-[1.42/1]">
                  <Image
                    src={sector.image}
                    alt=""
                    fill
                    sizes="(max-width: 1023px) 50vw, 25vw"
                    className={`object-cover ${sector.imageClassName}`}
                  />
                </div>
                <figcaption className="pt-4 text-center text-sm font-medium tracking-[-0.015em] text-brand-blue sm:text-base">
                  {sector.title}
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      <section
        aria-labelledby="structuration-heading"
        className="border-b border-dema-line/70 bg-dema-paper px-5 py-24 sm:px-8 sm:py-28 lg:px-12 lg:py-32"
      >
        <div className="mx-auto grid max-w-7xl gap-14 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-start lg:gap-20">
          <div>
            <p className="text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-dema-forest">
              Ce que nous structurons avec vous
            </p>
            <h2
              id="structuration-heading"
              className="mt-5 max-w-2xl text-balance text-[clamp(2.35rem,5vw,4.7rem)] font-light leading-[0.98] tracking-[-0.05em] text-brand-blue"
            >
              On installe les systèmes qui font tourner{" "}
              <span className="demaa-section-title text-dema-forest">
                votre entreprise.
              </span>
            </h2>

            <div className="mt-9 flex max-w-xl items-center gap-5 rounded-[1.25rem] border border-dema-forest/25 bg-dema-cream/70 px-5 py-5 sm:px-6 sm:py-6">
              <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-dema-forest/20 bg-dema-positive text-dema-forest">
                <BriefcaseBusiness className="h-6 w-6" aria-hidden />
              </span>
              <div>
                <p className="font-medium text-dema-forest">
                  Votre kit opérationnel sert de base
                </p>
                <p className="mt-1 text-sm leading-6 text-dema-muted">
                  Nous l’adaptons à vos chiffres, vos rôles, vos outils et votre
                  activité.
                </p>
              </div>
            </div>
          </div>

          <div>
            <div className="border-t border-dema-forest/20">
              {structurationPillars.map((pillar) => (
                <div
                  key={pillar.number}
                  className="grid gap-2 border-b border-dema-forest/15 py-5 sm:grid-cols-[3.5rem_minmax(10rem,0.8fr)_minmax(0,1.2fr)] sm:items-center sm:gap-4"
                >
                  <span className="demaa-section-title text-xl text-dema-forest">
                    {pillar.number}
                  </span>
                  <h3 className="text-base font-medium tracking-[-0.02em] text-brand-blue sm:text-lg">
                    {pillar.title}
                  </h3>
                  <p className="col-start-1 text-sm leading-6 text-dema-muted sm:col-start-auto">
                    {pillar.description}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-5 flex items-start gap-4 rounded-[1.15rem] border border-dema-forest/10 bg-dema-sage/75 px-5 py-5 sm:px-6">
              <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-dema-forest text-2xl font-light leading-none text-dema-forest">
                +
              </span>
              <div>
                <p className="text-sm font-semibold text-dema-forest">
                  Et les piliers propres à votre activité
                </p>
                <p className="mt-1 text-xs leading-5 text-dema-muted sm:text-sm">
                  Chantier, conformité, stocks, qualité, planning, suivi client…
                  Nous ajoutons uniquement ce qui est utile à votre métier.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="px-5 py-28 sm:px-8 sm:py-36 lg:py-44">
        <div className="mx-auto max-w-7xl">
          <SectionHeading
            eyebrow="La méthode"
            title={(
              <>
                En deux mois, Demaa structure{" "}
                <span className="demaa-section-title text-dema-forest">
                  votre organisation.
                </span>
              </>
            )}
            description="À la fin, les rôles, les processus et les outils de pilotage sont en place."
          />

          <div className="mt-18 grid gap-5 md:mt-24 md:grid-cols-2 xl:grid-cols-4">
            {methodSteps.map((step) => (
              <article
                key={step.number}
                className="rounded-[1.5rem] border border-dema-line bg-dema-paper p-6 shadow-[0_14px_40px_rgba(23,35,29,0.035)] md:min-h-[19rem] md:p-7"
              >
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-dema-forest/20 bg-dema-positive font-serif text-xl italic text-dema-forest">
                  {step.number}
                </span>
                <h3 className="mt-7 text-xl font-medium leading-tight tracking-[-0.02em] text-brand-blue">
                  {step.title}
                </h3>
                <p className="mt-4 text-sm leading-6 text-dema-muted">
                  {step.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-dema-line/70 bg-dema-paper px-5 py-28 sm:px-8 sm:py-36 lg:py-44">
        <div className="mx-auto grid max-w-7xl gap-14 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)] lg:items-center lg:gap-20">
          <div>
            <p className="text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-dema-forest">
              L’équipe derrière Demaa
            </p>
            <h2 className="mt-5 max-w-2xl text-balance text-[clamp(2.35rem,5vw,4.75rem)] font-light leading-[0.98] tracking-[-0.05em] text-brand-blue">
              Plusieurs expertises.{" "}
              <span className="demaa-section-title text-dema-forest">
                Une organisation cohérente pour votre entreprise.
              </span>
            </h2>
            <p className="mt-7 max-w-xl text-base leading-7 text-dema-muted md:text-lg md:leading-8">
              Chaque mission croise quatre regards : finance, structuration,
              opérations et outils.
            </p>
            <p className="mt-7 max-w-xl text-base font-medium leading-7 text-brand-blue">
              Une équipe mobilisée du diagnostic jusqu’à la mise en place.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {teamExpertiseItems.map((item) => (
              <article
                key={item.title}
                className="rounded-[1.5rem] border border-dema-line bg-dema-cream p-6 shadow-[0_14px_40px_rgba(23,35,29,0.035)] sm:min-h-[13rem] sm:p-7"
              >
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-dema-positive text-dema-forest">
                  <item.icon className="h-5 w-5" aria-hidden />
                </span>
                <h3 className="mt-6 text-xl font-medium leading-tight tracking-[-0.02em] text-brand-blue">
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

      <section className="px-5 pb-28 sm:px-8 sm:pb-36 lg:pb-44">
        <div className="mx-auto max-w-5xl rounded-[2rem] border border-dema-line bg-dema-paper px-6 py-12 text-center shadow-[0_28px_80px_rgba(23,35,29,0.05)] sm:px-12 sm:py-16 lg:px-20 lg:py-20">
          <p className="text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-dema-forest">
            Avant de commencer
          </p>
          <h2 className="mt-5 text-balance text-[clamp(2.2rem,5vw,4rem)] font-light leading-[1.02] tracking-[-0.045em] text-brand-blue">
            Tout commence par une{" "}
            <span className="demaa-section-title text-dema-forest">
              session offerte.
            </span>
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-dema-muted md:text-lg md:leading-8">
            30 minutes pour comprendre votre situation, identifier ce qui
            dépend encore de vous et définir les premières priorités.
          </p>
          <div className="mt-8">
            <BookingButton
              className="demaa-primary-button min-h-13 w-full px-7 sm:w-auto sm:min-w-[20rem]"
              label="Commencer par la session offerte"
              source="Accueil structuration — Après la méthode"
            />
            <p className="mt-4 text-xs text-dema-muted">
              Gratuit · Sans engagement
            </p>
          </div>
        </div>
      </section>

      <section className="px-5 py-28 sm:px-8 sm:py-36 lg:py-44">
        <div className="mx-auto max-w-7xl">
          <SectionHeading
            title={(
              <>
                Gardez la visibilité.{" "}
                <span className="demaa-section-title text-dema-forest">
                  Sans tout porter.
                </span>
              </>
            )}
            description="Vos priorités, vos chiffres et vos processus sont réunis dans un espace partagé avec les personnes concernées."
          />

          <div className="mt-20 grid items-center gap-16 lg:mx-auto lg:mt-28 lg:max-w-4xl lg:grid-cols-[minmax(22rem,0.78fr)_minmax(0,0.9fr)]">
            <CockpitPhone />

            <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
              {cockpitHighlights.map((item) => (
                <div
                  key={item.label}
                  className="flex items-center gap-4 rounded-2xl border border-dema-line bg-dema-paper px-5 py-5"
                >
                  <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-dema-positive text-dema-forest">
                    <item.icon className="h-5 w-5" aria-hidden />
                  </span>
                  <p className="font-medium text-brand-blue">{item.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-dema-paper px-5 py-28 sm:px-8 sm:py-36 lg:py-44">
        <div className="mx-auto grid max-w-7xl gap-12 rounded-[2rem] border border-dema-line bg-dema-cream p-7 sm:p-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16 lg:p-16">
          <div>
            <p className="text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-dema-forest">
              Étude de cas — EM2A
            </p>
            <h2 className="mt-6 max-w-2xl text-balance text-[clamp(2.4rem,5vw,4.8rem)] font-light leading-[0.98] tracking-[-0.05em] text-brand-blue">
              Deux mois rendus à l’équipe{" "}
              <span className="demaa-section-title text-dema-forest">
                chaque année.
              </span>
            </h2>
            <p className="mt-7 max-w-xl text-base leading-7 text-dema-muted">
              Chez EM2A, cabinet d’expertise comptable, la nouvelle organisation
              a remis de l’ordre dans les échanges et libéré du temps utile.
            </p>
          </div>

          <div className="grid gap-4">
            {caseResults.map((result) => (
              <div
                key={result.value}
                className="rounded-[1.25rem] border border-dema-line bg-dema-paper px-6 py-6"
              >
                <p className="text-3xl font-light tracking-[-0.035em] text-dema-forest">
                  {result.value}
                </p>
                <p className="mt-2 text-sm text-dema-muted">{result.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-5 py-28 sm:px-8 sm:py-36 lg:py-44">
        <figure className="mx-auto max-w-6xl rounded-[2rem] bg-dema-forest px-7 py-14 text-center text-dema-paper sm:px-12 sm:py-18 lg:px-20 lg:py-24">
          <blockquote className="mx-auto max-w-5xl text-balance font-serif text-[clamp(1.8rem,3.8vw,3.5rem)] font-light italic leading-[1.08] tracking-[-0.035em]">
            « Avant, tout passait par moi. Depuis qu’on a mis en place une vraie
            organisation, chacun sait ce qu’il peut décider. Je respire enfin. »
          </blockquote>
          <figcaption className="mt-8 text-sm text-dema-paper/70">
            D.K., dirigeant d’une entreprise de nettoyage industriel
          </figcaption>
        </figure>
      </section>

      <section className="border-y border-dema-line/70 bg-dema-paper px-5 py-28 sm:px-8 sm:py-36 lg:py-44">
        <div className="mx-auto max-w-7xl">
          <SectionHeading title="À la fin de la mission, vous gardez tout ce qui a été mis en place." />

          <div className="mt-18 grid gap-4 sm:grid-cols-2 lg:mt-24 lg:grid-cols-4">
            {retainedItems.map((item) => (
              <div
                key={item.label}
                className="rounded-[1.25rem] border border-dema-line bg-dema-cream px-5 py-7 text-center"
              >
                <span className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-full bg-dema-positive text-dema-forest">
                  <item.icon className="h-5 w-5" aria-hidden />
                </span>
                <p className="mt-5 text-sm font-medium leading-6 text-brand-blue">
                  {item.label}
                </p>
              </div>
            ))}
          </div>

          <div className="mx-auto mt-12 flex max-w-5xl flex-col items-center gap-5 rounded-[1.5rem] border border-dema-forest/10 bg-dema-positive px-6 py-8 text-center sm:flex-row sm:px-10 sm:py-10 sm:text-left">
            <span className="inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-dema-paper text-dema-forest">
              <LockKeyhole className="h-6 w-6" aria-hidden />
            </span>
            <div>
              <p className="text-balance text-2xl font-light leading-tight tracking-[-0.025em] text-dema-forest md:text-3xl">
                Votre outil de pilotage reste accessible gratuitement, à vie.
              </p>
              <p className="mt-2 text-sm text-dema-muted">
                Sans abonnement supplémentaire après la mission.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="px-5 py-28 sm:px-8 sm:py-36 lg:py-44">
        <div className="mx-auto max-w-6xl">
          <SectionHeading
            title="Les bonnes solutions, à de meilleures conditions."
            description="Accédez à des tarifs négociés sur une sélection de logiciels et de services utiles à votre entreprise."
          />

          <div className="mt-18 grid gap-4 sm:grid-cols-2 lg:mt-24 lg:grid-cols-4">
            {partnerItems.map((item) => (
              <div
                key={item.label}
                className="flex items-center gap-4 rounded-[1.25rem] border border-dema-line bg-dema-paper px-5 py-6"
              >
                <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-dema-positive text-dema-forest">
                  <item.icon className="h-5 w-5" aria-hidden />
                </span>
                <p className="font-medium text-brand-blue">{item.label}</p>
              </div>
            ))}
          </div>
          <p className="mt-8 text-center text-sm text-dema-muted">
            Vous restez libre de choisir uniquement ce dont vous avez besoin.
          </p>
        </div>
      </section>

      <section className="border-y border-dema-line/70 bg-dema-paper px-5 py-28 sm:px-8 sm:py-36 lg:py-44">
        <div className="mx-auto max-w-5xl">
          <SectionHeading title="Un tarif simple." />
          <div className="mx-auto mt-18 max-w-xl rounded-[2rem] border border-dema-line bg-dema-cream px-6 py-9 shadow-[0_28px_80px_rgba(23,35,29,0.05)] sm:px-10 sm:py-11 lg:mt-24">
            <p className="text-center text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-dema-forest">
              Mission de 2 mois
            </p>
            <p className="mt-5 text-center text-5xl font-light tracking-[-0.05em] text-brand-blue sm:text-6xl">
              1 500 €{" "}
              <span className="text-base font-medium tracking-normal text-dema-forest">
                HT
              </span>
            </p>
            <ul className="mt-9 space-y-4">
              {priceItems.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-3 text-sm leading-6 text-dema-muted"
                >
                  <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-dema-positive text-dema-forest">
                    <Check className="h-3.5 w-3.5" aria-hidden />
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <div className="mt-9">
              <BookingButton
                className="demaa-primary-button min-h-13 w-full px-6"
                label="Commencer par la session offerte"
                source="Accueil structuration — Tarif"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="px-5 py-28 sm:px-8 sm:py-36 lg:py-44">
        <div className="mx-auto max-w-4xl">
          <SectionHeading title="Questions fréquentes." />
          <div className="mt-18 space-y-3 lg:mt-24">
            {faqItems.map((item) => (
              <details
                key={item.question}
                className="demaa-accordion px-5 py-5 sm:px-7 sm:py-6"
              >
                <summary className="flex cursor-pointer items-center justify-between gap-5">
                  <span className="text-base font-medium text-brand-blue sm:text-lg">
                    {item.question}
                  </span>
                  <ChevronDown
                    className="demaa-accordion-chevron h-5 w-5 shrink-0 text-dema-forest transition-transform"
                    aria-hidden
                  />
                </summary>
                <p className="demaa-accordion-content mt-4 max-w-2xl pr-8 text-sm leading-7 text-dema-muted sm:text-base">
                  {item.answer}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-dema-sage/55 px-5 py-28 text-center sm:px-8 sm:py-36 lg:py-44">
        <SectionHeading
          title={(
            <>
              Commencez par{" "}
              <span className="demaa-section-title text-dema-forest">
                faire le point.
              </span>
            </>
          )}
          description="Identifions ce qui dépend encore de vous aujourd’hui."
        />
        <div className="mt-9">
          <BookingButton
            className="demaa-primary-button min-h-13 w-full px-7 sm:w-auto sm:min-w-[22rem]"
            label="Réserver ma session de structuration offerte"
            source="Accueil structuration — CTA final"
          />
          <p className="mt-4 text-xs text-dema-muted">
            30 min · Sans engagement · Réponse sous 48 h
          </p>
        </div>
      </section>

      <section
        aria-labelledby="structure-newsletter-title"
        className="bg-dema-cream px-5 py-16 sm:px-8 sm:py-20 lg:px-12"
      >
        <div className="mx-auto grid max-w-[92rem] items-center gap-12 rounded-[1.5rem] bg-dema-forest px-7 py-12 text-dema-paper shadow-[0_22px_70px_rgba(23,35,29,0.08)] sm:px-12 sm:py-16 lg:grid-cols-[minmax(20rem,0.78fr)_minmax(32rem,1.22fr)] lg:gap-20 lg:px-20 lg:py-16">
          <div>
            <p className="text-[0.7rem] font-medium uppercase tracking-[0.32em] text-dema-paper/75 sm:text-xs">
              La lettre Demaa
            </p>
            <h2
              id="structure-newsletter-title"
              className="mt-4 font-serif text-[clamp(3.4rem,6vw,5.3rem)] font-light italic leading-[0.9] tracking-[-0.04em] text-dema-paper"
            >
              Structure.
            </h2>
            <p className="mt-7 max-w-md text-base leading-7 text-dema-paper/75 sm:text-lg sm:leading-8">
              5 minutes de lecture pour que votre entreprise dépende moins de
              vous.
            </p>
          </div>

          <StructureNewsletterSignup />
        </div>
      </section>
    </main>
  );
}
