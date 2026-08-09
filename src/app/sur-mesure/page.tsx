import type { Metadata } from "next";
import {
  ArrowRight,
  Check,
  ChevronDown,
  ClipboardList,
  Cloud,
  Headphones,
  KeyRound,
  LayoutDashboard,
  ListChecks,
  Mail,
  MonitorSmartphone,
  ShieldCheck,
  Workflow,
} from "lucide-react";
import { Suspense, type ComponentType } from "react";
import Navbar from "@/components/Navbar";
import OrganisationSessionBookingButton from "@/components/OrganisationSessionBookingButton";
import StructureNewsletterBlock from "@/components/StructureNewsletterBlock";
import { surMesurePageContent as content } from "@/lib/sur-mesure-page-content";

const title = "Application métier sur mesure | Demaa";
const description =
  "Demaa simplifie un processus qui vous ralentit et crée une application adaptée à votre métier.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/sur-mesure" },
  openGraph: {
    title,
    description,
    url: "/sur-mesure",
    siteName: "Demaa",
    locale: "fr_FR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
  },
};

type IconType = ComponentType<{ className?: string; "aria-hidden"?: boolean }>;

const benefitIcons: readonly IconType[] = [
  Workflow,
  LayoutDashboard,
  ListChecks,
  MonitorSmartphone,
];

const exampleIcons: readonly IconType[] = [ClipboardList, Mail, LayoutDashboard];

const guaranteeIcons: readonly IconType[] = [Cloud, ShieldCheck, KeyRound, Headphones];

function BookingFallback({ className }: { className: string }) {
  return (
    <button type="button" disabled className={`${className} opacity-60`}>
      {content.hero.ctaLabel}
    </button>
  );
}

function BookingButton({ source, className }: { source: string; className: string }) {
  return (
    <Suspense fallback={<BookingFallback className={className} />}>
      <OrganisationSessionBookingButton
        className={className}
        label={content.hero.ctaLabel}
        source={source}
      />
    </Suspense>
  );
}

function SectionHeading({
  title: heading,
  description: headingDescription,
  id,
  light = false,
}: {
  title: string;
  description?: string;
  id: string;
  light?: boolean;
}) {
  return (
    <div className="max-w-3xl">
      <h2
        id={id}
        className={`text-[2rem] leading-[1.08] tracking-[-0.04em] text-brand-blue sm:text-[2.65rem] ${
          light ? "font-light" : "font-medium"
        }`}
      >
        {heading}
      </h2>
      {headingDescription ? (
        <p className="mt-5 max-w-2xl text-base leading-7 text-dema-muted sm:text-lg">
          {headingDescription}
        </p>
      ) : null}
    </div>
  );
}

function ApplicationPreview() {
  const previewSteps = [
    ["Demande client", "À traiter"],
    ["Intervention", "En cours"],
    ["Validation", "Terminée"],
  ] as const;

  return (
    <div
      role="img"
      aria-label="Exemple illustratif d’une application métier avec un tableau de bord et un suivi des étapes"
      className="relative mx-auto w-full max-w-[42rem]"
    >
      <div className="overflow-hidden rounded-[1.4rem] border border-brand-blue/12 bg-dema-paper shadow-[0_28px_80px_rgba(23,35,29,0.13)]">
        <div className="flex h-10 items-center gap-2 border-b border-dema-line bg-dema-canvas px-4">
          <span className="h-2.5 w-2.5 rounded-full bg-brand-blue/12" />
          <span className="h-2.5 w-2.5 rounded-full bg-brand-blue/12" />
          <span className="h-2.5 w-2.5 rounded-full bg-dema-forest/30" />
          <span className="ml-3 text-[10px] font-medium text-dema-muted">
            Application métier
          </span>
        </div>
        <div className="grid min-h-[23rem] grid-cols-[4.3rem_1fr] sm:grid-cols-[8.5rem_1fr]">
          <div className="border-r border-dema-line bg-dema-canvas px-2 py-5 sm:px-3">
            <p className="hidden text-xs font-semibold text-brand-blue sm:block">Votre logo</p>
            <div className="mt-2 space-y-2 sm:mt-6">
              {["Pilotage", "Demandes", "Planning", "Clients"].map((item, index) => (
                <div
                  key={item}
                  className={`flex min-h-9 items-center gap-2 rounded-lg px-2 text-[10px] sm:text-[11px] ${
                    index === 0
                      ? "bg-dema-positive font-semibold text-dema-forest"
                      : "text-dema-muted"
                  }`}
                >
                  <span className="h-2 w-2 shrink-0 rounded-full border border-current" />
                  <span className="hidden sm:inline">{item}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="min-w-0 p-4 sm:p-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[10px] uppercase tracking-[0.12em] text-dema-muted">Aujourd’hui</p>
                <p className="mt-1 text-base font-semibold text-brand-blue sm:text-lg">Tableau de bord</p>
              </div>
              <span className="rounded-full border border-dema-forest/30 bg-dema-paper px-3 py-2 text-[9px] font-medium text-dema-forest sm:text-[10px]">
                Nouvelle demande
              </span>
            </div>

            <div className="mt-5 grid gap-2 sm:grid-cols-3">
              {["À traiter", "En cours", "Terminées"].map((label, index) => (
                <div key={label} className="rounded-xl border border-dema-line bg-dema-paper p-3">
                  <div className="flex items-center gap-2">
                    <span
                      className={`h-2 w-2 rounded-full ${
                        index === 0
                          ? "bg-[#c99843]"
                          : index === 1
                            ? "bg-dema-forest"
                            : "bg-dema-forest/35"
                      }`}
                    />
                    <span className="text-[10px] text-dema-muted">{label}</span>
                  </div>
                  <div className="mt-3 h-2.5 w-10 rounded-full bg-dema-sage" />
                </div>
              ))}
            </div>

            <div className="mt-5 rounded-xl border border-dema-line bg-dema-paper p-3 sm:p-4">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-brand-blue">Suivi du processus</p>
                <span className="text-[9px] text-dema-muted">Cette semaine</span>
              </div>
              <div className="mt-3 divide-y divide-dema-line">
                {previewSteps.map(([label, status], index) => (
                  <div key={label} className="grid grid-cols-[1fr_auto] items-center gap-2 py-3">
                    <div className="flex min-w-0 items-center gap-2">
                      <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-dema-sage text-[9px] font-semibold text-dema-forest">
                        {index + 1}
                      </span>
                      <span className="truncate text-[10px] text-brand-blue sm:text-[11px]">{label}</span>
                    </div>
                    <span className="rounded-full bg-dema-sage px-2 py-1 text-[8px] text-dema-forest sm:text-[9px]">
                      {status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="absolute bottom-10 -right-1 z-10 flex aspect-[9/19.5] w-24 flex-col rounded-[1.55rem] border-[4px] border-brand-blue bg-dema-paper p-2.5 shadow-[0_18px_45px_rgba(23,35,29,0.18)] sm:-bottom-7 sm:right-4 sm:w-28 sm:rounded-[1.8rem] sm:p-3 lg:right-[-1.2rem] lg:w-32">
        <div className="mx-auto h-1.5 w-9 rounded-full bg-brand-blue sm:w-10" />
        <p className="mt-3 text-[8px] font-medium text-brand-blue sm:mt-4 sm:text-[9px]">Intervention</p>
        <div className="mt-2 space-y-1.5 sm:mt-3 sm:space-y-2">
          {["Client", "Statut", "Photos"].map((item) => (
            <div key={item} className="rounded-lg bg-dema-canvas px-2 py-1.5 text-[7px] text-dema-muted sm:py-2 sm:text-[8px]">
              {item}
            </div>
          ))}
        </div>
        <div className="mt-auto rounded-full border border-dema-forest/30 bg-dema-paper py-1.5 text-center text-[7px] font-medium text-dema-forest sm:py-2 sm:text-[8px]">
          Terminer
        </div>
      </div>
    </div>
  );
}

export default function SurMesureLandingPage() {
  return (
    <>
      <Navbar />
      <main className="overflow-x-clip bg-dema-cream text-brand-blue">
        <section className="px-4 pb-20 pt-14 sm:px-6 sm:pb-24 sm:pt-20 lg:px-8 lg:pb-28">
          <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.88fr_1.12fr] lg:items-center lg:gap-14">
            <div className="max-w-2xl">
              <h1
                className="text-left font-light leading-[0.94] tracking-tight"
                style={{ fontSize: "clamp(2.4rem, 6.8vw, 4.6rem)" }}
              >
                <span className="text-brand-blue/62">Votre application métier, conçue autour de votre{" "}</span>
                <span className="demaa-hero-title text-dema-forest">façon de travailler.</span>
              </h1>
              <p className="mt-6 max-w-xl text-base leading-7 text-dema-muted sm:text-lg sm:leading-8">
                {content.hero.introduction}
              </p>
              <div className="mt-8 flex w-full flex-col items-center gap-2.5 lg:w-fit">
                <BookingButton
                  className="demaa-primary-button min-h-12 min-w-44 gap-2 px-8"
                  source="Page sur mesure : Hero"
                />
                <span className="text-center text-xs text-dema-muted">{content.hero.reassurance}</span>
              </div>
            </div>
            <ApplicationPreview />
          </div>
        </section>

        <section
          aria-labelledby="starting-point-heading"
          className="border-y border-dema-line bg-dema-paper px-4 py-16 sm:px-6 sm:py-20 lg:px-8"
        >
          <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-start lg:gap-16">
            <SectionHeading
              id="starting-point-heading"
              title={content.startingPoint.title}
              description={content.startingPoint.description}
              light
            />
            <div className="divide-y divide-dema-line rounded-[1.25rem] border border-dema-line bg-dema-cream px-5 sm:px-6">
              {content.startingPoint.transformations.map((item) => (
                <div key={item.before} className="grid gap-2 py-5 sm:grid-cols-[1fr_auto_1fr] sm:items-center sm:gap-5">
                  <p className="text-sm text-dema-muted">{item.before}</p>
                  <ArrowRight className="h-4 w-4 rotate-90 text-dema-forest sm:rotate-0" aria-hidden="true" />
                  <p className="text-sm font-medium text-brand-blue">{item.after}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section
          aria-labelledby="benefits-heading"
          className="px-4 py-16 sm:px-6 sm:py-20 lg:px-8"
        >
          <div className="mx-auto max-w-6xl">
            <SectionHeading
              id="benefits-heading"
              title={content.benefits.title}
              light
            />
            <div className="mt-9 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {content.benefits.items.map((item, index) => {
                const Icon = benefitIcons[index];
                return (
                  <article key={item.title} className="rounded-[1.1rem] border border-dema-line bg-dema-paper p-5 sm:p-6">
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-dema-positive text-dema-forest">
                      <Icon className="h-4.5 w-4.5" aria-hidden={true} />
                    </span>
                    <h3 className="mt-5 text-lg font-medium leading-snug tracking-[-0.02em]">{item.title}</h3>
                    <p className="mt-3 text-sm leading-6 text-dema-muted">{item.description}</p>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section
          aria-labelledby="examples-heading"
          className="border-y border-dema-line bg-dema-canvas px-4 py-16 sm:px-6 sm:py-20 lg:px-8"
        >
          <div className="mx-auto max-w-6xl">
            <SectionHeading
              id="examples-heading"
              title={content.examples.title}
              description={content.examples.description}
              light
            />
            <div className="mt-9 grid gap-4 lg:grid-cols-3">
              {content.examples.items.map((item, index) => {
                const Icon = exampleIcons[index];
                return (
                  <article
                    key={item.title}
                    className="flex items-start gap-4 rounded-[1.1rem] border border-dema-line bg-dema-paper p-5 sm:p-6"
                  >
                    <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-dema-positive text-dema-forest">
                      <Icon className="h-4 w-4" aria-hidden={true} />
                    </span>
                    <div>
                      <h3 className="text-lg font-medium tracking-[-0.02em]">{item.title}</h3>
                      <p className="mt-3 text-sm leading-6 text-dema-muted">{item.description}</p>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section
          aria-labelledby="method-heading"
          className="px-4 py-16 sm:px-6 sm:py-20 lg:px-8"
        >
          <div className="mx-auto max-w-6xl">
            <SectionHeading
              id="method-heading"
              title={content.method.title}
              light
            />
            <ol className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
              {content.method.steps.map((step, index) => (
                <li key={step.title} className="relative border-l border-dema-line pl-5 lg:border-l-0 lg:border-t lg:pl-0 lg:pt-7">
                  <span className="absolute -left-3 top-0 inline-flex h-6 w-6 items-center justify-center rounded-full border border-dema-forest/30 bg-dema-cream text-[10px] font-semibold text-dema-forest lg:-top-3 lg:left-0">
                    {index + 1}
                  </span>
                  <h3 className="text-lg font-medium tracking-[-0.02em]">{step.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-dema-muted">{step.description}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section
          aria-labelledby="commercial-frame-heading"
          className="border-y border-dema-line bg-dema-forest px-4 py-16 text-dema-paper sm:px-6 sm:py-20 lg:px-8"
        >
          <div className="mx-auto max-w-6xl">
            <div className="max-w-3xl">
              <h2 id="commercial-frame-heading" className="text-[2rem] font-medium leading-[1.08] tracking-[-0.04em] sm:text-[2.65rem]">
                {content.commercialFrame.title}
              </h2>
            </div>
            <div className="mt-9 overflow-hidden rounded-[1.3rem] bg-dema-paper text-brand-blue shadow-[0_22px_60px_rgba(0,0,0,0.13)]">
              <div className="grid lg:grid-cols-[0.82fr_1.18fr]">
                <div className="border-b border-dema-line p-6 sm:p-8 lg:border-b-0 lg:border-r lg:p-10">
                  <p className="text-2xl font-medium tracking-[-0.03em]">
                    {content.commercialFrame.pricing.label}
                  </p>
                  <p className="mt-8 text-sm text-dema-muted">
                    {content.commercialFrame.pricing.prefix}
                  </p>
                  <p className="mt-1 flex items-end gap-2 text-dema-forest">
                    <span className="text-[3rem] font-normal leading-none tracking-[-0.045em] sm:text-[3.8rem]">
                      {content.commercialFrame.pricing.value}
                    </span>
                    <span className="pb-1 text-sm font-medium">
                      {content.commercialFrame.pricing.tax}
                    </span>
                  </p>
                  <div className="mt-8 space-y-2 text-sm text-dema-muted">
                    {content.commercialFrame.pricing.notes.map((note) => (
                      <p key={note}>{note}</p>
                    ))}
                  </div>
                </div>
                <div className="p-6 sm:p-8 lg:p-10">
                  <h3 className="text-lg font-medium">
                    {content.commercialFrame.included.title}
                  </h3>
                  <ul className="mt-6 grid gap-3 sm:grid-cols-2">
                    {content.commercialFrame.included.items.map((item) => (
                      <li key={item} className="flex items-start gap-3 text-sm leading-6 text-dema-muted">
                        <Check className="mt-1 h-4 w-4 shrink-0 text-dema-forest" aria-hidden="true" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            <div className="mt-10 grid gap-4 sm:grid-cols-2">
              {content.commercialFrame.guarantees.map((item, index) => {
                const Icon = guaranteeIcons[index];
                return (
                  <article
                    key={item.title}
                    className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 rounded-[1.1rem] border border-dema-paper/15 bg-dema-paper/7 p-5 text-dema-paper sm:p-6"
                  >
                    <Icon className="row-span-2 mt-0.5 h-5 w-5 text-dema-paper/85" aria-hidden={true} />
                    <h4 className="text-base font-medium">{item.title}</h4>
                    <p className="text-sm leading-6 text-dema-paper/70">{item.description}</p>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section
          aria-labelledby="faq-heading"
          className="px-4 py-16 sm:px-6 sm:py-20 lg:px-8"
        >
          <div className="mx-auto max-w-4xl">
            <SectionHeading id="faq-heading" title={content.faq.title} />
            <div className="mt-8 divide-y divide-dema-line border-y border-dema-line">
              {content.faq.items.map((item) => (
                <details key={item.question} className="group py-5">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-5 text-base font-medium marker:hidden">
                    <span>{item.question}</span>
                    <ChevronDown className="h-4 w-4 shrink-0 text-dema-forest transition group-open:rotate-180" aria-hidden="true" />
                  </summary>
                  <p className="mt-3 max-w-3xl pr-9 text-sm leading-6 text-dema-muted">{item.answer}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section
          aria-labelledby="sur-mesure-cta-heading"
          className="px-4 pb-20 sm:px-6 sm:pb-24 lg:px-8"
        >
          <div className="mx-auto flex max-w-6xl flex-col gap-7 rounded-[1.5rem] border border-dema-line bg-dema-paper p-6 shadow-[0_18px_55px_rgba(23,35,29,0.055)] sm:p-9 lg:flex-row lg:items-center lg:justify-between lg:p-11">
            <div className="max-w-2xl">
              <h2 id="sur-mesure-cta-heading" className="text-[2rem] font-medium leading-[1.08] tracking-[-0.04em] sm:text-[2.5rem]">
                {content.finalCta.title}
              </h2>
              <p className="mt-4 text-base leading-7 text-dema-muted">{content.finalCta.description}</p>
            </div>
            <div className="shrink-0">
              <BookingButton
                className="demaa-primary-button min-h-12 w-full gap-2 px-6 lg:w-auto"
                source="Page sur mesure : Final"
              />
              <p className="mt-3 text-center text-xs text-dema-muted">{content.finalCta.reassurance}</p>
            </div>
          </div>
        </section>

        <div className="px-4 pb-20 sm:px-6 sm:pb-24 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <StructureNewsletterBlock />
          </div>
        </div>
      </main>
    </>
  );
}
