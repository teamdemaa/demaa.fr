import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  Cable,
  CalendarCheck2,
  Camera,
  Check,
  ChevronDown,
  ClipboardCheck,
  FileCheck2,
  FilePenLine,
  Hammer,
  HardHat,
  Inbox,
  ReceiptText,
  Route,
  Siren,
  Sparkles,
  UserCheck,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import AutomationCallbackControl from "@/components/AutomationCallbackControl";
import Navbar from "@/components/Navbar";
import { satoshiHeroTitleClassName } from "@/lib/marketing-hero-style";
import { mentoratAutomationContent as content } from "@/lib/mentorat-automation-content";
import { PUBLIC_SPECIALISTS_ENABLED } from "@/lib/public-feature-flags";

const sectorIcons: readonly LucideIcon[] = [
  Wrench,
  Cable,
  Siren,
  HardHat,
  Hammer,
  Sparkles,
];

const journeyIcons: readonly LucideIcon[] = [Route, Camera, FileCheck2];
const humanIcons: readonly LucideIcon[] = [Inbox, FilePenLine, UserCheck];
const fieldExampleImagePositions = ["left center", "center", "right center"] as const;

function FlowIllustration() {
  const steps = [
    { title: "Demande", description: "Appel, email ou formulaire", icon: Inbox },
    { title: "Planning", description: "Intervention ou chantier", icon: CalendarCheck2 },
    { title: "Compte rendu", description: "Notes et photos regroupées", icon: ClipboardCheck },
    { title: "Facturation", description: "Éléments prêts à utiliser", icon: ReceiptText },
  ] as const;

  return (
    <div
      aria-label="Le parcours automatisé de la demande client à la facture"
      className="mx-auto mt-11 max-w-5xl"
    >
      <ol className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {steps.map((step, index) => {
          const Icon = step.icon;
          return (
            <li
              key={step.title}
              className="relative flex min-h-40 flex-col items-center justify-center rounded-[1.4rem] border border-dema-line/70 bg-dema-paper px-4 py-6 text-center"
            >
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-dema-sage text-dema-forest">
                <Icon className="h-6 w-6" strokeWidth={1.6} aria-hidden="true" />
              </span>
              <h2 className="mt-4 text-base font-medium tracking-[-0.02em] text-brand-blue">
                {step.title}
              </h2>
              <p className="mt-1.5 text-xs leading-5 text-dema-muted">{step.description}</p>
              {index < steps.length - 1 ? (
                <ArrowRight
                  className="absolute -right-5 top-1/2 z-10 hidden h-4 w-4 -translate-y-1/2 text-dema-forest/45 lg:block"
                  aria-hidden="true"
                />
              ) : null}
            </li>
          );
        })}
      </ol>
    </div>
  );
}

function AppIllustration() {
  const panels = [
    { label: "Planning", icon: CalendarCheck2 },
    { label: "Interventions", icon: Wrench },
    { label: "Clients", icon: Building2 },
    { label: "Documents", icon: FileCheck2 },
  ] as const;

  return (
    <div
      aria-label="Aperçu abstrait d’une application métier sur mesure"
      className="rounded-[1.75rem] border border-dema-line bg-dema-paper p-4 shadow-[0_18px_45px_rgba(23,35,29,0.055)] sm:p-5"
    >
      <div className="flex gap-1.5 border-b border-dema-line pb-3" aria-hidden="true">
        <span className="h-2 w-2 rounded-full bg-dema-line" />
        <span className="h-2 w-2 rounded-full bg-dema-line" />
        <span className="h-2 w-2 rounded-full bg-dema-line" />
      </div>
      <div className="mt-4 grid grid-cols-[0.38fr_1fr] gap-3">
        <div className="rounded-2xl bg-dema-sage p-3" aria-hidden="true">
          <span className="block h-2 w-4/5 rounded-full bg-dema-forest/55" />
          <span className="mt-4 block h-2 rounded-full bg-dema-line" />
          <span className="mt-4 block h-2 rounded-full bg-dema-line" />
          <span className="mt-4 block h-2 rounded-full bg-dema-line" />
        </div>
        <div className="grid grid-cols-2 gap-2.5">
          {panels.map((panel) => {
            const Icon = panel.icon;
            return (
              <div
                key={panel.label}
                className="flex min-h-24 flex-col items-center justify-center rounded-2xl border border-dema-line bg-dema-cream/65 p-3 text-center"
              >
                <Icon className="h-5 w-5 text-dema-forest" strokeWidth={1.6} aria-hidden="true" />
                <span className="mt-2 text-xs text-dema-muted">{panel.label}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function MentoratAutomationLandingPage() {
  return (
    <>
      <Navbar minimal publicNavigationActiveView="services" />

      <main className="overflow-x-clip bg-dema-cream text-brand-blue">
        <section className="px-5 pb-14 pt-14 text-center sm:px-8 sm:pb-20 sm:pt-20 lg:pt-24">
          <div className="mx-auto max-w-6xl">
            {PUBLIC_SPECIALISTS_ENABLED ? (
              <Link
                href="/specialistes"
                className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-dema-muted transition hover:text-dema-forest focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dema-forest/35"
              >
                <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                Retour aux spécialistes
              </Link>
            ) : null}
            <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,1.08fr)_minmax(24rem,0.92fr)] lg:gap-12 lg:text-left">
              <div>
                <h1
                  aria-label={`${content.hero.lead} ${content.hero.emphasis}`}
                  className={`${satoshiHeroTitleClassName} mx-auto max-w-5xl lg:mx-0`}
                >
                  <span aria-hidden="true" className="block">{content.hero.lead}</span>
                  <span aria-hidden="true" className="demaa-section-title block text-dema-forest">
                    {content.hero.emphasis}
                  </span>
                </h1>
                <p className="mx-auto mt-7 max-w-3xl text-base leading-7 text-dema-muted sm:text-lg sm:leading-8 lg:mx-0">
                  {content.hero.description}
                </p>
                <div className="mt-8 flex flex-col items-center lg:items-start">
                  <AutomationCallbackControl variant="hero" label={content.hero.ctaLabel} />
                  <p className="mt-3 text-xs text-dema-muted">
                    Sans engagement
                  </p>
                </div>
              </div>
              <Image
                src="/illustrations/accompagnement/hero-entreprise-terrain-v3.png"
                alt=""
                aria-hidden="true"
                width={1536}
                height={1024}
                sizes="(max-width: 1023px) 92vw, 42vw"
                preload
                className="mx-auto h-auto w-full max-w-2xl object-contain"
              />
            </div>
            <FlowIllustration />
          </div>
        </section>

        <section
          aria-labelledby="sectors-heading"
          className="border-y border-dema-line bg-dema-paper px-5 py-14 sm:px-8 sm:py-16"
        >
          <div className="mx-auto max-w-6xl">
            <h2 id="sectors-heading" className="demaa-marketing-section-title max-w-4xl">
              {content.sectors.title}
            </h2>
            <ul className="mt-9 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
              {content.sectors.items.map((sector, index) => {
                const Icon = sectorIcons[index];
                return (
                  <li
                    key={sector}
                    className="flex min-h-28 flex-col items-center justify-center rounded-[1.35rem] border border-dema-line bg-dema-cream/45 p-4 text-center"
                  >
                    <Icon className="h-5 w-5 text-dema-forest" strokeWidth={1.7} aria-hidden="true" />
                    <span className="mt-3 text-sm font-medium text-brand-blue/80">{sector}</span>
                  </li>
                );
              })}
            </ul>
          </div>
        </section>

        <section
          aria-labelledby="implementation-heading"
          className="bg-dema-forest px-5 py-16 text-dema-paper sm:px-8 sm:py-20"
        >
          <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[minmax(0,0.95fr)_minmax(24rem,1.05fr)] lg:items-center lg:gap-20">
            <div>
              <h2 id="implementation-heading" className="demaa-marketing-section-title">
                {content.implementation.title}
              </h2>
              <p className="mt-6 max-w-xl text-base leading-7 text-dema-paper/74">
                {content.implementation.description}
              </p>
            </div>
            <ol className="divide-y divide-dema-paper/18 border-y border-dema-paper/18">
              {content.implementation.steps.map((step, index) => (
                <li key={step.title} className="grid grid-cols-[2.5rem_1fr] gap-4 py-5">
                  <span className="demaa-section-title text-2xl text-dema-sage">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <h3 className="font-medium text-dema-paper">{step.title}</h3>
                    <p className="mt-1 text-sm leading-6 text-dema-paper/66">{step.description}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section
          aria-labelledby="journey-heading"
          className="px-5 py-16 sm:px-8 sm:py-20"
        >
          <div className="mx-auto max-w-6xl">
            <div className="grid items-end gap-7 lg:grid-cols-[1fr_0.65fr] lg:gap-14">
              <h2 id="journey-heading" className="demaa-marketing-section-title max-w-4xl">
                Du client au terrain. Du terrain au bureau.
              </h2>
              <p className="text-base leading-7 text-dema-muted">
                Les mêmes informations avancent d’une étape à l’autre, sans être recopiées dans plusieurs outils.
              </p>
            </div>
            <Image
              src="/illustrations/accompagnement/flux-client-bureau-terrain-v3.png"
              alt=""
              aria-hidden="true"
              width={2048}
              height={768}
              sizes="(max-width: 767px) 92vw, 80vw"
              className="mt-10 h-auto w-full object-contain"
            />
            <ol className="mt-8 grid gap-5 md:grid-cols-3">
              {content.journey.map((step, index) => {
                const Icon = journeyIcons[index];
                return (
                  <li
                    key={step.title}
                    className="rounded-[1.5rem] border border-dema-line bg-dema-paper p-6 sm:p-8"
                  >
                    <span className="flex h-12 w-12 items-center justify-center rounded-full bg-dema-sage text-dema-forest">
                      <Icon className="h-5 w-5" strokeWidth={1.7} aria-hidden="true" />
                    </span>
                    <h3 className="mt-6 text-xl font-medium leading-snug tracking-[-0.025em]">
                      {step.title}
                    </h3>
                    <p className="mt-3 text-sm leading-6 text-dema-muted">{step.description}</p>
                  </li>
                );
              })}
            </ol>
          </div>
        </section>

        <section
          aria-labelledby="human-heading"
          className="border-y border-dema-line bg-dema-sage/55 px-5 py-16 sm:px-8 sm:py-20"
        >
          <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[minmax(0,1.05fr)_minmax(24rem,0.95fr)] lg:items-center lg:gap-16">
            <div>
              <h2 id="human-heading" className="demaa-marketing-section-title max-w-4xl">
                {content.human.title}
              </h2>
              <p className="mt-6 max-w-2xl text-base leading-7 text-dema-muted">
                {content.human.description}
              </p>
            </div>
            <ul className="rounded-[1.75rem] border border-dema-line bg-dema-paper p-5 sm:p-6">
              {content.human.items.map((item, index) => {
                const Icon = humanIcons[index];
                return (
                  <li
                    key={item.title}
                    className="grid grid-cols-[2.75rem_1fr_auto] items-center gap-3 border-b border-dema-line py-4 first:pt-0 last:border-b-0 last:pb-0"
                  >
                    <span className="flex h-11 w-11 items-center justify-center rounded-full bg-dema-sage text-dema-forest">
                      <Icon className="h-5 w-5" strokeWidth={1.7} aria-hidden="true" />
                    </span>
                    <span>
                      <strong className="block text-sm font-medium">{item.title}</strong>
                      <small className="mt-1 block text-xs leading-5 text-dema-muted">{item.description}</small>
                    </span>
                    <span className="text-xs font-medium text-dema-forest">{item.status}</span>
                  </li>
                );
              })}
            </ul>
          </div>
        </section>

        <section className="px-5 py-16 sm:px-8 sm:py-20">
          <div className="mx-auto max-w-6xl">
            <h2 className="demaa-marketing-section-title">Ce que cela change.</h2>
            <div className="mt-10 grid gap-x-8 gap-y-8 sm:grid-cols-2 lg:grid-cols-4">
              {content.impacts.map((impact) => (
                <article key={impact.title} className="border-t border-dema-line pt-5">
                  <h3 className="text-lg font-medium tracking-[-0.02em] text-dema-forest">
                    {impact.title}
                  </h3>
                  <p className="mt-3 text-sm leading-6 text-dema-muted">{impact.description}</p>
                </article>
              ))}
            </div>
            <div className="mt-14 grid gap-8 rounded-[2rem] bg-dema-sage/45 p-7 sm:p-10 lg:grid-cols-[0.7fr_1.3fr] lg:items-center lg:gap-16">
              <h2 className="demaa-marketing-section-title">{content.advantage.title}</h2>
              <p className="text-base leading-7 text-dema-muted">{content.advantage.description}</p>
            </div>
          </div>
        </section>

        <section
          aria-labelledby="examples-heading"
          className="border-y border-dema-line bg-dema-paper px-5 py-16 sm:px-8 sm:py-20"
        >
          <div className="mx-auto max-w-6xl">
            <h2 id="examples-heading" className="demaa-marketing-section-title">
              {content.fieldExamples.title}
            </h2>
            <div className="mt-10 grid gap-5 md:grid-cols-3">
              {content.fieldExamples.items.map((example, index) => {
                return (
                  <article key={example.sector} className="border-t border-dema-line pt-5">
                    <div className="relative aspect-square w-full overflow-hidden" aria-hidden="true">
                      <Image
                        src="/illustrations/accompagnement/metiers-terrain-v3.png"
                        alt=""
                        fill
                        sizes="(max-width: 767px) 92vw, 30vw"
                        className="object-cover"
                        style={{ objectPosition: fieldExampleImagePositions[index] }}
                      />
                    </div>
                    <h3 className="mt-5 text-lg font-medium tracking-[-0.02em]">{example.sector}</h3>
                    <p className="mt-3 text-sm leading-6 text-dema-muted">{example.description}</p>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section id="tarif" aria-labelledby="offer-heading" className="scroll-mt-24 px-5 py-16 sm:px-8 sm:py-20">
          <div className="mx-auto grid max-w-6xl gap-12 rounded-[2rem] bg-dema-forest p-7 text-dema-paper sm:p-10 lg:grid-cols-[1fr_0.88fr] lg:gap-16 lg:p-12">
            <div>
              <h2 id="offer-heading" className="demaa-marketing-section-title">
                {content.offer.title}
              </h2>
              <p className="mt-5 max-w-2xl text-base leading-7 text-dema-paper/72">
                {content.offer.scope}
              </p>
              <p className="demaa-section-title mt-8 text-4xl text-dema-paper">
                {content.offer.price}
              </p>
              <p className="mt-2 text-xs text-dema-paper/62">Pour la mission d’un mois</p>
            </div>
            <div>
              <ul className="divide-y divide-dema-paper/18 border-y border-dema-paper/18">
                {content.offerIncludes.map((item) => (
                  <li key={item} className="flex gap-3 py-3 text-sm leading-6 text-dema-paper/78">
                    <Check className="mt-1 h-4 w-4 shrink-0 text-dema-sage" aria-hidden="true" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-7">
                <AutomationCallbackControl variant="offer" label={content.hero.ctaLabel} />
              </div>
            </div>
          </div>
        </section>

        <section aria-labelledby="proof-heading" className="border-y border-dema-line bg-dema-paper px-5 py-16 sm:px-8 sm:py-20">
          <div className="mx-auto grid max-w-5xl gap-8 md:grid-cols-[0.38fr_1.62fr] md:items-center md:gap-14">
            <p id="proof-heading" className="demaa-section-title whitespace-nowrap text-7xl text-dema-forest sm:text-8xl">
              {content.proof.value}
            </p>
            <blockquote className="border-t border-dema-line pt-7 md:border-l md:border-t-0 md:pl-10 md:pt-0">
              <p className="text-lg leading-8 text-brand-blue">“{content.proof.quote}”</p>
              <footer className="mt-5 text-sm text-dema-muted">{content.proof.attribution}</footer>
              <p className="mt-3 text-xs leading-5 text-dema-muted">{content.proof.note}</p>
            </blockquote>
          </div>
        </section>

        <section id="faq" aria-labelledby="faq-heading" className="border-t border-dema-line bg-dema-paper px-5 py-16 sm:px-8 sm:py-20">
          <div className="mx-auto max-w-5xl">
            <h2 id="faq-heading" className="demaa-marketing-section-title">Avant de commencer</h2>
            <div className="mt-9 divide-y divide-dema-line border-y border-dema-line">
              {content.faq.map((item) => (
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

        <section className="border-t border-dema-line px-5 py-16 text-center sm:px-8 sm:py-20">
          <div className="mx-auto max-w-3xl">
            <h2 className="demaa-marketing-section-title">{content.finalCta.title}</h2>
            <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-dema-muted">
              {content.finalCta.description}
            </p>
            <div className="mt-7 flex flex-col items-center">
              <AutomationCallbackControl variant="hero" label={content.hero.ctaLabel} />
              <p className="mt-3 text-xs text-dema-muted">Échange de 30 minutes · Sans engagement</p>
            </div>
          </div>
        </section>

        <section className="border-t border-dema-line bg-dema-paper px-5 py-16 sm:px-8 sm:py-20">
          <div className="mx-auto grid max-w-6xl gap-10 rounded-[2rem] bg-dema-sage/45 p-7 sm:p-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:gap-16">
            <div>
              <h2 className="demaa-marketing-section-title">{content.applicationBridge.title}</h2>
              <p className="mt-5 max-w-2xl text-base leading-7 text-dema-muted">
                {content.applicationBridge.description}
              </p>
              <Link
                href={content.applicationBridge.href}
                className="mt-7 inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-dema-forest/25 bg-dema-paper px-6 text-sm font-semibold text-dema-forest transition hover:bg-dema-cream focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dema-forest/30"
              >
                {content.applicationBridge.ctaLabel}
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
            <AppIllustration />
          </div>
        </section>
      </main>
    </>
  );
}
