import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import {
  DEMAA_PUBLISHED_STUDIO_PROJECTS,
  DEMAA_PRIORITY_STUDIO_PROJECTS,
  DEMAA_STUDIO_POLES,
  type DemaaStudioProject,
} from "@/lib/demaa-studio-projects";

export type StudioView = "studio" | "projets" | "opportunites";
const sectionClass = "mx-auto w-full max-w-7xl px-5 py-16 sm:px-8 lg:px-16 lg:py-24";
const titleClass = "demaa-section-title text-4xl leading-[1.08] tracking-tight sm:text-5xl lg:text-6xl";
const eyebrowClass = "text-xs font-medium uppercase tracking-[0.18em] text-dema-muted";
const contactClass = "inline-flex min-h-12 items-center justify-center gap-3 rounded-full bg-brand-blue px-6 py-3 text-sm font-medium text-dema-paper transition hover:bg-dema-forest";

function StudioHeader({ view }: { view: StudioView }) {
  return <Navbar publicNavigationActiveView={view} />;
}

function ContactSection() {
  return <section className="bg-brand-blue text-dema-paper">
    <div className={`${sectionClass} flex flex-col items-start justify-between gap-8 sm:flex-row sm:items-end`}>
      <div><p className="text-xs uppercase tracking-[0.18em] text-dema-paper/70">Et après ?</p><h2 className={`${titleClass} mt-5 max-w-2xl`}>Construisons ce qui compte.</h2></div>
      <a href="mailto:team@demaa.fr" className="inline-flex min-h-12 shrink-0 items-center gap-3 rounded-full bg-dema-paper px-6 py-3 text-sm font-medium text-brand-blue transition hover:bg-dema-sage">Contact <ArrowUpRight className="h-4 w-4" aria-hidden="true" /></a>
    </div>
  </section>;
}

function ProjectCard({ project }: { project: DemaaStudioProject }) {
  return <article className="min-w-0">
    <div>
      <div className="relative aspect-[4/3] overflow-hidden bg-dema-sage">
        {project.image ? <Image src={project.image} alt={project.imageAlt ?? project.name} fill sizes="(max-width: 639px) calc(100vw - 40px), (max-width: 1023px) 45vw, 380px" className="object-cover" /> : project.logo ? <div className="flex h-full items-center justify-center p-10"><Image src={project.logo} alt="" width={210} height={80} className="max-h-20 w-auto max-w-full object-contain" /></div> : <div className="flex h-full items-center justify-center p-8 font-serif text-4xl">{project.name}</div>}
      </div>
      <p className={`${eyebrowClass} mt-5`}>{project.pole}</p>
      <div className="mt-2 flex items-center justify-between gap-4"><h3 className="text-2xl font-medium tracking-tight">{project.name}</h3></div>
      <p className="mt-3 text-sm leading-6 text-dema-muted">{project.summary}</p>
    </div>
  </article>;
}

function ResourcesSection() {
  return <section className="border-t border-dema-line"><div className={sectionClass}><h2 className={titleClass}>On partage nos apprentissages.</h2><p className="mt-5 max-w-2xl text-base leading-7 text-dema-muted">Des cas concrets pour expliquer comment on aborde la création et le développement d’entreprises.</p><Link href="/apprentissages" className={`${contactClass} mt-8`}>Découvrir les apprentissages <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link></div></section>;
}

function StudioContent() {
  return <>
    <section className="relative isolate overflow-hidden lg:flex lg:min-h-[760px] lg:items-center">
      <div className="absolute inset-x-0 top-0 -z-20 h-[280px] sm:h-[360px] lg:inset-0 lg:h-auto"><Image src="/images/studio/cover.webp" alt="" fill preload sizes="100vw" className="object-cover object-[68%_35%] lg:object-[68%_center]" /></div>
      <div className="absolute inset-0 -z-10 hidden bg-gradient-to-r from-dema-cream/85 via-dema-cream/25 to-transparent lg:block" />
      <div className={`${sectionClass} pb-16 pt-[320px] sm:pt-[400px] lg:py-20`}>
        <h1 className="demaa-hero-title max-w-[760px] text-[clamp(2.8rem,5.5vw,5.7rem)] leading-[1.02] tracking-[-0.045em] lg:mt-6">On crée des entreprises sur des marchés qu’on connaît de l’intérieur.</h1>
        <p className="mt-7 max-w-[520px] text-base leading-7 text-brand-blue/80">DEMAA est un studio d’entreprises : on crée plusieurs sociétés, on les fait grandir, puis on en revend certaines et on garde les autres pour leurs revenus.</p>
        <div className="mt-9 flex flex-wrap gap-4"><Link href="/projets" className={contactClass}>Voir les projets <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link></div>
      </div>
    </section>
    <section className="border-y border-dema-line">
      <div className={`${sectionClass} grid gap-10 lg:grid-cols-2`}>
        <div><p className={eyebrowClass}>Notre point de départ</p><h2 className={`${titleClass} mt-5`}>Le terrain avant tout.</h2></div>
        <div><p className="text-lg leading-8 text-brand-blue/85">On part de problèmes qu’on connaît de près. Une équipe partagée réunit finance, opérations, technologie et développement commercial pour faire avancer chaque projet.</p><ul className="mt-8 grid grid-cols-2 gap-x-5 gap-y-4 border-t border-dema-line pt-5">{DEMAA_STUDIO_POLES.map((pole) => <li key={pole} className="text-sm font-medium">{pole}</li>)}</ul></div>
      </div>
    </section>
    <section className={sectionClass}>
      <div className="mt-5 flex flex-col justify-between gap-6 sm:flex-row sm:items-end"><h2 className={titleClass}>Nos projets</h2><Link href="/projets" className="inline-flex items-center gap-3 text-sm font-medium underline underline-offset-8">Tous les projets <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link></div>
      <div className="mt-12 grid gap-12 sm:grid-cols-2 lg:grid-cols-3">{DEMAA_PRIORITY_STUDIO_PROJECTS.map((project) => <ProjectCard key={project.slug} project={project} />)}</div>
    </section>
    <section className="bg-dema-sage">
      <div className={sectionClass}>
        <p className={eyebrowClass}>Notre méthode</p><h2 className={`${titleClass} mt-5 max-w-3xl`}>De l’idée à l’exécution, avec calme.</h2>
        <ol className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">{[
          ["Identifier", "Un besoin concret, un marché connu et un premier client clair."],
          ["Tester", "Trois à six mois pour confronter l’offre à la demande réelle."],
          ["Décider", "Arrêter, ajuster ou réunir les conditions pour créer l’entreprise."],
          ["Développer", "Une équipe, des systèmes durables et une progression maîtrisée."],
        ].map(([title, description], index) => <li key={title} className="border-t border-brand-blue/20 pt-5"><span className="text-xs text-dema-muted">0{index + 1}</span><h3 className="mt-4 text-xl font-medium">{title}</h3><p className="mt-3 text-sm leading-6 text-dema-muted">{description}</p></li>)}</ol>
      </div>
    </section>
    <BuildTogetherSection /><ResourcesSection />
  </>;
}

function BuildTogetherSection() {
  return <section className="border-t border-dema-line"><div className={sectionClass}>
    <p className={eyebrowClass}>Construire ensemble</p>
    <h2 className={`${titleClass} mt-5 max-w-3xl`}>Un marché que vous connaissez. Une entreprise à construire.</h2>
    <p className="mt-6 max-w-2xl text-base leading-7 text-dema-muted">Vous connaissez le terrain et souhaitez porter un projet ? Découvrez les pistes sur lesquelles on aimerait construire avec vous.</p>
    <Link href="/studio/opportunites" className={`${contactClass} mt-8`}>Découvrir les pistes <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
  </div></section>;
}

function ProjectsContent() {
  const otherProjects = DEMAA_PUBLISHED_STUDIO_PROJECTS.filter(({ portfolio, slug }) => portfolio === "pipeline" || slug === "mnd");
  return <>
    <header className="mx-auto w-full max-w-7xl px-4 pb-10 pt-12 text-center sm:px-6 md:pb-12 md:pt-16 lg:px-8">
      <h1 className="text-balance font-light leading-[0.94] tracking-tight" style={{ fontSize: "clamp(2.4rem, 6.8vw, 4.6rem)" }}>
        <span className="block text-brand-blue/62">Les entreprises</span>
        <span className="demaa-hero-title block text-dema-forest">qu’on construit.</span>
      </h1>
    </header>
    <section className={`${sectionClass} !pt-0`} aria-label="Projets du Studio"><div className="grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">{DEMAA_PRIORITY_STUDIO_PROJECTS.map((project) => <ProjectCard key={project.slug} project={project} />)}</div></section>
    <section className="border-t border-dema-line"><div className={sectionClass}><h2 className="text-3xl font-medium">Les autres projets</h2><div className="mt-8 grid gap-8 sm:grid-cols-2">{otherProjects.map((project) => <article key={project.slug} className="border-t border-dema-line pt-5"><h3 className="text-xl font-medium">{project.name}</h3><p className="mt-3 text-sm leading-6 text-dema-muted">{project.summary}</p></article>)}</div></div></section>
    <BuildTogetherSection /><ResourcesSection />
  </>;
}

const founderProfiles: Record<string, string> = {
  jagoya: "Commerce de gros, distribution ou développement de marques africaines.",
  tendera: "BTP, appels d’offres ou développement de produits numériques.",
  kahe: "Café, restauration et gestion d’un lieu accueillant.",
  mandya: "Bien-être, soins et exploitation d’un spa.",
  lafiasso: "Immobilier et connaissance du terrain en Afrique de l’Ouest.",
  djaty: "Rénovation, coordination de travaux et relation avec les propriétaires.",
};

function OpportunitiesContent() {
  const ideas = DEMAA_PUBLISHED_STUDIO_PROJECTS.filter(({ portfolio }) => portfolio === "pipeline");
  return <>
    <section className={sectionClass}><p className={eyebrowClass}>Construire ensemble</p><h1 className={`${titleClass} mt-5 max-w-4xl`}>Des idées à porter ensemble.</h1><p className="mt-6 max-w-2xl text-lg leading-8 text-dema-muted">On cherche des personnes qui connaissent ces marchés et souhaitent construire une entreprise ensemble. Voici les pistes dont on peut discuter.</p>
    <div className="mt-12 grid gap-x-12 gap-y-10 md:grid-cols-2">{ideas.map((project) => <article key={project.slug} className="border-t border-dema-line pt-6"><h2 className="text-2xl font-medium">{project.name}</h2><p className="mt-4 text-base leading-7 text-dema-muted">{project.summary}</p><p className="mt-5 text-sm leading-6"><span className="font-medium">Votre expérience : </span>{founderProfiles[project.slug]}</p><a href={`mailto:team@demaa.fr?subject=${encodeURIComponent(`Porter le projet ${project.name}`)}`} className="mt-6 inline-flex min-h-11 items-center gap-3 text-sm underline underline-offset-8">Parlons de ce projet <ArrowUpRight className="h-4 w-4" aria-hidden="true" /></a></article>)}</div>
    <p className="mt-10 max-w-2xl text-sm leading-6 text-dema-muted">Une première conversation pour confronter l’idée à votre expérience et explorer ce qu’on pourrait construire ensemble.</p></section>
    <ResourcesSection />
  </>;
}

export default function DemaaStudioLanding({ view }: { view: StudioView }) {
  return <><StudioHeader view={view} /><main className="min-h-screen bg-dema-cream text-brand-blue">{view === "studio" ? <StudioContent /> : view === "projets" ? <ProjectsContent /> : <OpportunitiesContent />}</main></>;
}

export function DemaaStudioProjectPage({ project }: { project: DemaaStudioProject }) {
  return <><StudioHeader view="projets" /><main className="min-h-screen bg-dema-cream text-brand-blue">
    <section className={sectionClass}><Link href="/projets" className="text-sm underline underline-offset-8">← Tous les projets</Link><div className="mt-12 grid items-center gap-10 lg:grid-cols-2"><div><p className={eyebrowClass}>{project.pole}</p><h1 className={`${titleClass} mt-5`}>{project.name}</h1><p className="mt-6 text-lg leading-8 text-dema-muted">{project.summary}</p>{project.href ? <a href={project.href} target="_blank" rel="noopener noreferrer" className={`${contactClass} mt-8`}>Visiter le site <ArrowUpRight className="h-4 w-4" aria-hidden="true" /><span className="sr-only"> (nouvel onglet)</span></a> : null}</div>{project.portfolio === "priority" && project.image ? <figure><div className="relative aspect-[4/3] overflow-hidden bg-dema-sage"><Image src={project.image} alt={project.imageAlt ?? project.name} fill sizes="(max-width: 1023px) 90vw, 560px" className="object-cover" /></div><figcaption className="mt-3 text-xs text-dema-muted">Visuel de concept du projet</figcaption></figure> : null}</div></section>
    <section className={`${sectionClass} !pt-0`}><div className="grid gap-10 border-t border-dema-line pt-10 md:grid-cols-2"><article><h2 className="text-2xl font-medium">Le besoin</h2><p className="mt-5 text-base leading-7 text-dema-muted">{project.problem}</p></article><article><h2 className="text-2xl font-medium">La réponse</h2><p className="mt-5 text-base leading-7 text-dema-muted">{project.solution}</p></article></div>{project.need ? <p className="mt-8 text-base leading-7 text-dema-muted">{project.need}</p> : null}</section>
    {project.portfolio === "pipeline" ? <BuildTogetherSection /> : <ContactSection />}<ResourcesSection />
  </main></>;
}
