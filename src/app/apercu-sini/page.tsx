import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, Compass, Handshake, ShieldCheck, Waypoints } from "lucide-react";
import { SiniPreviewHtmlLang } from "./preview-html-lang";

type Locale = "fr" | "en";

const journeyPaths = ["/a-reprendre", "/transmettre", "/apercu-sini/conseil"] as const;
const guidePaths = [
  "/apercu-sini/conseil/premiere-estimation-realiste-entreprise",
  "/apercu-sini/conseil/presenter-entreprise-repreneur-une-page",
  "/apercu-sini/conseil/entreprise-fonctionner-sans-dirigeant",
] as const;
const journeyImages = [
  "/images/structuration-sectors/cabinets-comptables.jpg",
  "/images/structuration-sectors/commerce-restauration.jpg",
  "/images/structuration-sectors/services-terrain.jpg",
] as const;
const pillarIcons = [Compass, ShieldCheck, Waypoints, Handshake] as const;

const copy = {
  fr: {
    nav: ["Reprendre", "Vendre", "Conseils"],
    contact: "Parler d’un projet",
    heroEyebrow: "REPRISE · TRANSMISSION · CONTINUITÉ",
    heroTitle: "La suite d’une entreprise se construit ensemble.",
    heroBody: "Reprendre, transmettre, préparer le passage de relais : SINI rassemble les chemins et les personnes qui donnent une suite aux entreprises.",
    heroCta: "Voir les entreprises",
    heroSecondary: "Transmettre la mienne",
    heroImageAlt: "Deux professionnels étudient des documents autour d’une table",
    heroImageNote: "DEUX PROJETS. UNE RENCONTRE JUSTE.",
    strip: ["DES ENTREPRISES À REPRENDRE", "DES HISTOIRES À TRANSMETTRE", "UN AVENIR À PRÉPARER"],
    philosophyEyebrow: "NOTRE CONVICTION",
    philosophyTitle: "Faire passer le relais, sans perdre l’essentiel.",
    philosophyBody: "Une transmission ne se résume pas à une annonce. Elle engage une histoire, une équipe, un savoir-faire et un projet d’avenir. Nous avançons avec clarté, attention et méthode.",
    pillars: [
      { title: "Comprendre", body: "L’entreprise et les personnes derrière les chiffres." },
      { title: "Préparer", body: "Les informations et les décisions utiles au bon moment." },
      { title: "Protéger", body: "La confidentialité et le rythme de chacun." },
      { title: "Relier", body: "Des projets compatibles, sans précipiter la rencontre." },
    ],
    journeysEyebrow: "TROIS CHEMINS, UNE MÊME ATTENTION",
    journeysTitle: "À chaque projet, son point de départ.",
    journeys: [
      { title: "Reprendre", body: "Découvrir des entreprises existantes et préciser votre projet de reprise.", action: "Explorer les opportunités", imageAlt: "Deux professionnels examinent un dossier d’entreprise" },
      { title: "Vendre", body: "Présenter votre entreprise et ouvrir le dialogue avec des repreneurs pertinents.", action: "Découvrir la transmission", imageAlt: "Une équipe au travail dans un commerce" },
      { title: "Conseils", body: "Des méthodes pour clarifier vos décisions et préparer le passage de relais.", action: "Lire les méthodes", imageAlt: "Deux professionnels travaillent ensemble dans un atelier" },
    ],
    guidesEyebrow: "POUR ALLER PLUS LOIN",
    guidesTitle: "Des repères pour décider.",
    guidesNote: "Les guides existants s’ouvrent dans leur version française actuelle.",
    guides: ["Estimer son entreprise avec réalisme", "Présenter son entreprise à un repreneur", "Préparer une entreprise qui fonctionne sans son dirigeant"],
    approachEyebrow: "NOTRE APPROCHE",
    approachTitle: "Du premier échange à la suite possible.",
    approachImageQuote: "Une histoire continue quand le passage de relais est bien préparé.",
    approachImageAlt: "Paysage côtier au coucher du soleil",
    approachSteps: [
      { title: "Écouter", body: "Le projet, les attentes et les contraintes de chacun." },
      { title: "Clarifier", body: "Ce qui est prêt, ce qui manque et ce qui compte vraiment." },
      { title: "Mettre en relation", body: "Quand les projets semblent pouvoir se rencontrer." },
      { title: "Accompagner", body: "La préparation de l’entreprise, lorsque c’est utile." },
    ],
    modelEyebrow: "NOTRE MODÈLE",
    modelTitle: "Un cadre clair, pour avancer à votre rythme.",
    modelBody: "SINI réunit la découverte d’entreprises, la présentation des projets de transmission et un accompagnement de préparation distinct. Chaque chemin garde ses propres étapes ; rien n’est engagé automatiquement.",
    modelCta: "Comprendre l’accompagnement",
    banner: "Les belles histoires d’entreprise méritent une suite.",
    nextEyebrow: "ET MAINTENANT ?",
    nextTitle: "Parlons de ce que vous souhaitez construire ou transmettre.",
    nextBody: "Choisissez le chemin qui correspond à votre situation. Les parcours existants restent accessibles sans changement.",
    nextCta: "Explorer les entreprises",
    footerTagline: "Des entreprises. Des personnes. Une suite.",
    footerJourneys: "Les parcours",
    footerLegal: "Informations",
    legalNotice: "Mentions légales",
    privacy: "Confidentialité",
    footerNote: "Aperçu de conception : formulaires, données et cadre légal demeurent ceux du site actuel.",
  },
  en: {
    nav: ["Acquire", "Sell", "Advice"],
    contact: "Discuss a project",
    heroEyebrow: "ACQUISITION · TRANSFER · CONTINUITY",
    heroTitle: "The next chapter of a business is built together.",
    heroBody: "Acquire, transfer, prepare the handover: SINI brings together the paths and people who give businesses a future.",
    heroCta: "Explore businesses",
    heroSecondary: "Transfer mine",
    heroImageAlt: "Two professionals reviewing documents at a table",
    heroImageNote: "TWO VISIONS. THE RIGHT CONNECTION.",
    strip: ["BUSINESSES TO ACQUIRE", "STORIES TO PASS ON", "A FUTURE TO PREPARE"],
    philosophyEyebrow: "WHAT WE BELIEVE",
    philosophyTitle: "Pass the torch without losing what matters.",
    philosophyBody: "A transfer is more than a listing. It involves a story, a team, expertise and a vision for the future. We move forward with clarity, care and method.",
    pillars: [
      { title: "Understand", body: "The business and the people behind the numbers." },
      { title: "Prepare", body: "Useful information and decisions at the right time." },
      { title: "Protect", body: "Confidentiality and each person’s pace." },
      { title: "Connect", body: "Compatible projects, without rushing the introduction." },
    ],
    journeysEyebrow: "THREE PATHS, THE SAME CARE",
    journeysTitle: "Every project starts somewhere.",
    journeys: [
      { title: "Acquire", body: "Discover existing businesses and define your acquisition project.", action: "Explore opportunities", imageAlt: "Two professionals reviewing a business dossier" },
      { title: "Sell", body: "Present your business and open a conversation with relevant buyers.", action: "Explore the transfer path", imageAlt: "A team working in a local business" },
      { title: "Advice", body: "Practical methods to make decisions and prepare a handover.", action: "Read the methods", imageAlt: "Two professionals working together in a workshop" },
    ],
    guidesEyebrow: "GO FURTHER",
    guidesTitle: "Guidance for better decisions.",
    guidesNote: "Existing guides currently open in French.",
    guides: ["Value your business realistically", "Present your business to a buyer", "Prepare a business that runs beyond its founder"],
    approachEyebrow: "OUR APPROACH",
    approachTitle: "From the first conversation to a possible next chapter.",
    approachImageQuote: "A story can continue when the handover is well prepared.",
    approachImageAlt: "Coastal landscape at sunset",
    approachSteps: [
      { title: "Listen", body: "The project, expectations and constraints on each side." },
      { title: "Clarify", body: "What is ready, what is missing and what really matters." },
      { title: "Connect", body: "When the projects appear ready to meet." },
      { title: "Support", body: "Preparing the business when that is useful." },
    ],
    modelEyebrow: "HOW IT WORKS",
    modelTitle: "A clear framework, at your own pace.",
    modelBody: "SINI brings together business discovery, transfer projects and a separate preparation service. Each path has its own steps; nothing is set in motion automatically.",
    modelCta: "Understand advisory",
    banner: "Great business stories deserve a next chapter.",
    nextEyebrow: "WHAT NEXT?",
    nextTitle: "Let's talk about what you want to build or pass on.",
    nextBody: "Choose the path that fits your situation. Existing journeys remain available without changes.",
    nextCta: "Explore businesses",
    footerTagline: "Businesses. People. A next chapter.",
    footerJourneys: "Journeys",
    footerLegal: "Information",
    legalNotice: "Legal notice",
    privacy: "Privacy",
    footerNote: "Design preview: forms, data and legal terms remain those of the existing site.",
  },
} as const;

const darkButton = "inline-flex min-h-11 items-center justify-center gap-3 rounded-full bg-[#252622] px-6 py-3 text-sm font-medium text-white transition hover:bg-[#4b5345] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6b735c] focus-visible:ring-offset-2";
const eyebrow = "text-[10px] font-medium uppercase tracking-[0.19em] text-[#677064]";

export async function generateMetadata({ searchParams }: { searchParams: Promise<{ lang?: string | string[] }> }): Promise<Metadata> {
  const english = (await searchParams).lang === "en";
  const title = english ? "SINI — editorial preview" : "SINI — aperçu de la future page d’accueil";
  const description = english
    ? "Unpublished SINI preview: acquiring, transferring and preparing the next chapter of a business."
    : "Prévisualisation non publiée de SINI : reprendre, transmettre et préparer la suite d’une entreprise.";
  return {
    title,
    description,
    robots: { index: false, follow: false, googleBot: { index: false, follow: false } },
    openGraph: { title, description, siteName: "SINI", locale: english ? "en_GB" : "fr_FR", type: "website" },
    twitter: { card: "summary", title, description },
  };
}

function PreviewNav({ locale }: { locale: Locale }) {
  return (
    <nav aria-label={locale === "fr" ? "Navigation principale" : "Main navigation"} className="grid w-full grid-cols-3 gap-1 rounded-full border border-[#ded9d0] bg-white/90 p-1 shadow-[0_4px_18px_rgba(45,42,36,0.06)]">
      {journeyPaths.map((path, index) => (
        <Link key={path} href={path} className="inline-flex min-h-10 min-w-0 items-center justify-center rounded-full px-1 text-center text-[10px] font-medium leading-tight text-[#33362f] transition hover:bg-[#e9e7de] focus-visible:bg-[#e9e7de] focus-visible:outline-none sm:px-5 sm:text-xs">
          {copy[locale].nav[index]}
        </Link>
      ))}
    </nav>
  );
}

export default async function SiniPreviewPage({
  searchParams,
}: {
  searchParams: Promise<{ lang?: string | string[] }>;
}) {
  const locale: Locale = (await searchParams).lang === "en" ? "en" : "fr";
  const t = copy[locale];

  return (
    <div lang={locale} className="min-h-screen bg-[#faf8f4] font-sans text-[#262822] [&_a:focus-visible]:outline-2 [&_a:focus-visible]:outline-offset-4 [&_a:focus-visible]:outline-[#536653]">
      <SiniPreviewHtmlLang locale={locale} />
      <header className="relative z-10 border-b border-[#e7e1d8] bg-[#faf8f4]">
        <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-4 px-5 py-4 md:px-10 xl:px-16">
          <Link href={locale === "en" ? "/apercu-sini?lang=en" : "/apercu-sini"} aria-label={locale === "fr" ? "Accueil SINI" : "SINI home"} className="shrink-0 text-[1.35rem] font-medium tracking-[0.31em] text-[#252622] sm:text-[1.55rem]">
            SINI
          </Link>
          <div className="hidden w-[min(38vw,33rem)] lg:block"><PreviewNav locale={locale} /></div>
          <div className="flex items-center gap-3 sm:gap-5">
            <div role="group" className="flex items-center gap-1 text-[11px] font-medium tracking-[0.06em] text-[#65675e]" aria-label={locale === "fr" ? "Langue" : "Language"}>
              <Link href="/apercu-sini?lang=fr" aria-current={locale === "fr" ? "page" : undefined} className={locale === "fr" ? "text-[#22231e] underline underline-offset-4" : "hover:text-[#22231e]"}>FR</Link>
              <span aria-hidden="true" className="text-[#aaa89e]">|</span>
              <Link href="/apercu-sini?lang=en" aria-current={locale === "en" ? "page" : undefined} className={locale === "en" ? "text-[#22231e] underline underline-offset-4" : "hover:text-[#22231e]"}>EN</Link>
            </div>
            <Link href="/accompagnement" className="hidden min-h-10 items-center rounded-full bg-[#252622] px-5 text-xs font-medium text-white transition hover:bg-[#4b5345] sm:inline-flex">{t.contact}</Link>
          </div>
        </div>
        <div className="mx-auto max-w-[1440px] px-5 pb-4 md:px-10 lg:hidden"><PreviewNav locale={locale} /></div>
      </header>

      <main>
        <section className="mx-auto grid max-w-[1440px] border-b border-[#e7e1d8] lg:min-h-[650px] lg:grid-cols-[51%_49%]">
          <div className="flex flex-col justify-center px-5 py-16 md:px-10 lg:py-20 xl:px-16">
            <p className={eyebrow}>{t.heroEyebrow}</p>
            <h1 className="mt-6 max-w-[680px] font-serif text-[clamp(3.4rem,6vw,6.7rem)] leading-[0.98] tracking-[-0.055em] text-[#22241f]">{t.heroTitle}</h1>
            <p className="mt-7 max-w-[540px] text-base leading-7 text-[#5d625a] md:text-[1.08rem]">{t.heroBody}</p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link href="/a-reprendre" className={darkButton}>{t.heroCta}<ArrowUpRight className="h-4 w-4" aria-hidden="true" /></Link>
              <Link href="/transmettre" className="inline-flex min-h-11 items-center gap-2 rounded-full px-4 text-sm font-medium text-[#30382e] underline decoration-[#879083] underline-offset-4 transition hover:text-[#66745f]">{t.heroSecondary}<ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
            </div>
          </div>
          <div className="relative min-h-[390px] overflow-hidden bg-[#d7c6b5] lg:min-h-full">
            <Image src="/images/structuration-sectors/cabinets-comptables.jpg" alt={t.heroImageAlt} fill preload loading="eager" sizes="(min-width: 1024px) 49vw, 100vw" className="object-cover object-[center_42%] grayscale-[0.12] sepia-[0.17]" />
            <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-r from-[#d3b89e]/35 via-transparent to-[#20221d]/15" />
            <p className="absolute right-5 top-7 max-w-28 text-right text-[10px] font-medium leading-4 tracking-[0.15em] text-white drop-shadow-md md:right-10">{t.heroImageNote}</p>
          </div>
        </section>

        <div className="border-b border-[#e7e1d8] bg-white">
          <div className="mx-auto flex max-w-[1440px] flex-wrap gap-x-7 gap-y-2 px-5 py-5 md:px-10 xl:px-16">
            {t.strip.map((item, index) => <span key={item} className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#5e625a]">{index > 0 ? <span aria-hidden="true" className="mr-7 text-[#a1a59a]">×</span> : null}{item}</span>)}
          </div>
        </div>

        <section className="border-b border-[#e7e1d8] bg-white px-5 py-20 md:px-10 lg:py-28 xl:px-16">
          <div className="mx-auto max-w-[1312px]">
            <div className="grid gap-8 lg:grid-cols-[1fr_0.9fr] lg:gap-16">
              <div><p className={eyebrow}>{t.philosophyEyebrow}</p><h2 className="mt-5 max-w-[680px] font-serif text-[clamp(2.8rem,5vw,5.4rem)] leading-[1.02] tracking-[-0.05em]">{t.philosophyTitle}</h2></div>
              <p className="max-w-[540px] self-end text-base leading-8 text-[#5d625a] md:text-lg">{t.philosophyBody}</p>
            </div>
            <div className="mt-16 grid gap-0 border-y border-[#e9e5de] sm:grid-cols-2 lg:grid-cols-4">
              {t.pillars.map((pillar, index) => {
                const Icon = pillarIcons[index];
                return <div key={pillar.title} className="border-b border-[#e9e5de] px-4 py-7 last:border-b-0 sm:border-b-0 sm:border-r sm:px-6 sm:last:border-r-0 lg:px-8"><Icon aria-hidden="true" className="h-7 w-7 stroke-[1.3] text-[#455244]" /><h3 className="mt-6 text-sm font-semibold">{pillar.title}</h3><p className="mt-2 max-w-[210px] text-sm leading-6 text-[#73766f]">{pillar.body}</p></div>;
              })}
            </div>
          </div>
        </section>

        <section className="border-b border-[#e7e1d8] bg-[#faf8f4] px-5 py-20 md:px-10 lg:py-28 xl:px-16">
          <div className="mx-auto max-w-[1312px]">
            <p className={eyebrow}>{t.journeysEyebrow}</p>
            <h2 className="mt-5 max-w-[790px] font-serif text-[clamp(2.8rem,5vw,5.4rem)] leading-[1.02] tracking-[-0.05em]">{t.journeysTitle}</h2>
            <div className="mt-12 grid gap-8 md:grid-cols-3">
              {t.journeys.map((journey, index) => (
                <Link key={journey.title} href={journeyPaths[index]} className="group block border-b border-[#d8d7cf] pb-7 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#879083]">
                  <div className="relative aspect-[4/3] overflow-hidden bg-[#ded9cc]"><Image src={journeyImages[index]} alt={journey.imageAlt} fill sizes="(min-width: 768px) 33vw, 100vw" className="object-cover transition duration-500 group-hover:scale-[1.035]" /></div>
                  <div className="mt-5 flex items-start justify-between gap-4"><div><p className={eyebrow}>0{index + 1}</p><h3 className="mt-2 font-serif text-3xl leading-tight tracking-[-0.03em] md:text-4xl">{journey.title}</h3></div><ArrowUpRight aria-hidden="true" className="mt-2 h-5 w-5 shrink-0 transition group-hover:-translate-y-1 group-hover:translate-x-1" /></div>
                  <p className="mt-3 max-w-[360px] text-sm leading-6 text-[#6e7169]">{journey.body}</p>
                  <span className="mt-5 inline-block border-b border-[#4b554a] pb-1 text-xs font-medium">{journey.action}</span>
                </Link>
              ))}
            </div>

            <div className="mt-20 grid gap-8 border-t border-[#dedbd2] pt-10 lg:grid-cols-[0.55fr_1fr]">
              <div><p className={eyebrow}>{t.guidesEyebrow}</p><h3 className="mt-3 font-serif text-[clamp(2.2rem,4vw,3.7rem)] leading-[1.05] tracking-[-0.04em]">{t.guidesTitle}</h3><p className="mt-5 max-w-xs text-xs leading-5 text-[#80827b]">{t.guidesNote}</p></div>
              <div className="border-t border-[#d8d7cf]">{t.guides.map((title, index) => <Link key={title} href={guidePaths[index]} className="group flex items-center justify-between gap-4 border-b border-[#d8d7cf] py-5 text-sm font-medium transition hover:text-[#637761]"><span>{title}</span><ArrowUpRight aria-hidden="true" className="h-4 w-4 shrink-0 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5" /></Link>)}</div>
            </div>
          </div>
        </section>

        <section className="grid bg-white lg:grid-cols-2">
          <div className="relative min-h-[420px] overflow-hidden bg-[#817060] lg:min-h-[620px]"><Image src="/sini-preview/coast.webp" alt={t.approachImageAlt} fill sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover object-center" /><div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-[#171b17]/75 via-transparent to-transparent" /><p className="absolute bottom-9 left-7 max-w-md font-serif text-4xl leading-[1.05] tracking-[-0.04em] text-white md:bottom-12 md:left-12 md:text-5xl">{t.approachImageQuote}</p></div>
          <div className="flex flex-col justify-center px-5 py-16 md:px-10 lg:px-16 lg:py-20"><p className={eyebrow}>{t.approachEyebrow}</p><h2 className="mt-4 max-w-[630px] font-serif text-[clamp(2.65rem,4.5vw,4.8rem)] leading-[1.02] tracking-[-0.045em]">{t.approachTitle}</h2><ol className="mt-9 border-t border-[#e2dfd8]">{t.approachSteps.map((step, index) => <li key={step.title} className="grid grid-cols-[2.5rem_1fr] gap-4 border-b border-[#e2dfd8] py-4"><span className="pt-1 text-[10px] font-semibold text-[#6f766d]">0{index + 1}</span><div><h3 className="text-sm font-semibold">{step.title}</h3><p className="mt-1 text-sm leading-6 text-[#72766f]">{step.body}</p></div></li>)}</ol></div>
        </section>

        <section className="border-y border-[#e7e1d8] bg-[#f3eee7] px-5 py-20 md:px-10 lg:py-24 xl:px-16"><div className="mx-auto grid max-w-[1312px] gap-10 lg:grid-cols-[1fr_0.8fr] lg:items-end"><div><p className={eyebrow}>{t.modelEyebrow}</p><h2 className="mt-5 max-w-[700px] font-serif text-[clamp(2.7rem,4.8vw,5rem)] leading-[1.02] tracking-[-0.05em]">{t.modelTitle}</h2></div><div><p className="max-w-[550px] text-base leading-8 text-[#60665d]">{t.modelBody}</p><Link href="/accompagnement" className={`${darkButton} mt-7`}>{t.modelCta}<ArrowUpRight aria-hidden="true" className="h-4 w-4" /></Link></div></div></section>

        <section className="relative min-h-[350px] overflow-hidden bg-[#34352c] px-5 py-20 text-white md:px-10 lg:min-h-[430px] xl:px-16"><Image src="/sini-preview/architecture.webp" alt="" fill sizes="100vw" className="object-cover object-center" /><div aria-hidden="true" className="absolute inset-0 bg-[#25291f]/55" /><div className="relative mx-auto flex min-h-[210px] max-w-[1312px] flex-col justify-end"><h2 className="max-w-[780px] font-serif text-[clamp(2.7rem,5vw,5.2rem)] leading-[1.03] tracking-[-0.05em]">{t.banner}</h2><div className="mt-8 h-px w-14 bg-white/80" /><span className="mt-5 text-xs font-medium tracking-[0.25em]">SINI</span></div></section>

        <section className="bg-white px-5 py-20 md:px-10 lg:py-24 xl:px-16"><div className="mx-auto grid max-w-[1312px] gap-10 lg:grid-cols-[1fr_0.55fr] lg:items-end"><div><p className={eyebrow}>{t.nextEyebrow}</p><h2 className="mt-5 max-w-[780px] font-serif text-[clamp(2.7rem,4.6vw,4.8rem)] leading-[1.04] tracking-[-0.045em]">{t.nextTitle}</h2></div><div><p className="max-w-[440px] text-sm leading-7 text-[#667067]">{t.nextBody}</p><Link href="/a-reprendre" className={`${darkButton} mt-6`}>{t.nextCta}<ArrowUpRight aria-hidden="true" className="h-4 w-4" /></Link></div></div></section>
      </main>

      <footer className="border-t border-[#e7e1d8] bg-[#f7f4ef] px-5 py-12 md:px-10 xl:px-16"><div className="mx-auto grid max-w-[1312px] gap-10 md:grid-cols-[1fr_1fr_1fr]"><div><p className="text-xl font-medium tracking-[0.28em]">SINI</p><p className="mt-3 max-w-xs font-serif text-2xl leading-tight text-[#62685e]">{t.footerTagline}</p></div><div><h2 className="text-[10px] font-semibold uppercase tracking-[0.17em] text-[#7a7e74]">{t.footerJourneys}</h2><div className="mt-4 flex flex-col items-start gap-3">{t.nav.map((label, index) => <Link key={label} href={journeyPaths[index]} className="text-sm hover:underline hover:underline-offset-4">{label}</Link>)}</div></div><div><h2 className="text-[10px] font-semibold uppercase tracking-[0.17em] text-[#7a7e74]">{t.footerLegal}</h2><div className="mt-4 flex flex-col items-start gap-3"><Link href="/mentions-legales" className="text-sm hover:underline hover:underline-offset-4">{t.legalNotice}</Link><Link href="/politique-de-confidentialite" className="text-sm hover:underline hover:underline-offset-4">{t.privacy}</Link></div></div></div><div className="mx-auto mt-12 max-w-[1312px] border-t border-[#dedbd2] pt-5 text-xs leading-5 text-[#898b82]">{t.footerNote}</div></footer>
    </div>
  );
}
