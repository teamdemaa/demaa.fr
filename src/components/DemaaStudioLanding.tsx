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
import { DEMAA_RESOURCE_NAVIGATION } from "@/lib/demaa-public-routes";

export type StudioView = "studio" | "projets" | "opportunites";
const sectionClass = "mx-auto w-full max-w-7xl px-5 py-16 sm:px-8 lg:px-16 lg:py-24";
const titleClass = "demaa-section-title text-4xl leading-[1.08] tracking-tight sm:text-5xl lg:text-6xl";
const eyebrowClass = "text-xs font-medium uppercase tracking-[0.18em] text-dema-muted";
const contactClass = "inline-flex min-h-12 items-center justify-center gap-3 rounded-full bg-brand-blue px-6 py-3 text-sm font-medium text-dema-paper transition hover:bg-dema-forest";

function StudioHeader({ view }: { view: StudioView }) {
  return <Navbar publicNavigationActiveView={view} publicCtaHref="mailto:team@demaa.fr" publicCtaLabel="Nous contacter" />;
}

function ContactSection() {
  return <section className="bg-brand-blue text-dema-paper">
    <div className={`${sectionClass} flex flex-col items-start justify-between gap-8 sm:flex-row sm:items-end`}>
      <div><p className="text-xs uppercase tracking-[0.18em] text-dema-paper/70">Et après ?</p><h2 className={`${titleClass} mt-5 max-w-2xl`}>Construisons ce qui compte.</h2></div>
      <a href="mailto:team@demaa.fr" className="inline-flex min-h-12 shrink-0 items-center gap-3 rounded-full bg-dema-paper px-6 py-3 text-sm font-medium text-brand-blue transition hover:bg-dema-sage">Nous contacter <ArrowUpRight className="h-4 w-4" aria-hidden="true" /></a>
    </div>
  </section>;
}

function ProjectCard({ project }: { project: DemaaStudioProject }) {
  return <article className="group min-w-0">
    <Link href={`/projets/${project.slug}`} className="block">
      <div className="relative aspect-[4/3] overflow-hidden bg-dema-sage">
        {project.image ? <Image src={project.image} alt={project.imageAlt ?? project.name} fill sizes="(max-width: 639px) calc(100vw - 40px), (max-width: 1023px) 45vw, 380px" className="object-cover transition duration-500 group-hover:scale-[1.03]" /> : project.logo ? <div className="flex h-full items-center justify-center p-10"><Image src={project.logo} alt="" width={210} height={80} className="max-h-20 w-auto max-w-full object-contain" /></div> : <div className="flex h-full items-center justify-center p-8 font-serif text-4xl">{project.name}</div>}
      </div>
      <p className={`${eyebrowClass} mt-5`}>{project.pole} · {project.status}</p>
      <div className="mt-2 flex items-center justify-between gap-4"><h3 className="text-2xl font-medium tracking-tight">{project.name}</h3><ArrowRight className="h-5 w-5 shrink-0 transition group-hover:translate-x-1" aria-hidden="true" /></div>
      <p className="mt-3 text-sm leading-6 text-dema-muted">{project.summary}</p>
    </Link>
  </article>;
}

function ResourcesSection() {
  return <section id="ressources" className="border-t border-dema-line bg-dema-paper">
    <div className={sectionClass}>
      <p className={eyebrowClass}>Ressources</p><h2 className={`${titleClass} mt-5 max-w-3xl`}>Des ressources pour faire avancer votre entreprise.</h2>
      <p className="mt-5 max-w-2xl text-base leading-7 text-dema-muted">Nos solutions par activité, tutoriels et accompagnements restent accessibles pour vous aider à organiser le travail et passer à l’action.</p>
      <div className="mt-10 grid gap-8 md:grid-cols-3">
        {DEMAA_RESOURCE_NAVIGATION.map(({ label, href, description }) => <Link key={href} href={href} className="group border-t border-dema-line pt-5"><div className="flex items-center justify-between gap-4"><h3 className="text-xl font-medium">{label}</h3><ArrowRight className="h-4 w-4 shrink-0 transition group-hover:translate-x-1" aria-hidden="true" /></div><p className="mt-3 max-w-sm text-sm leading-6 text-dema-muted">{description}</p></Link>)}
      </div>
    </div>
  </section>;
}

function StudioContent() {
  return <>
    <section className="relative isolate flex min-h-[640px] items-center overflow-hidden lg:min-h-[760px]">
      <Image src="/images/studio/cover.webp" alt="" fill preload sizes="100vw" className="-z-20 object-cover object-[68%_center]" />
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-dema-cream via-dema-cream/90 to-dema-cream/10 lg:via-dema-cream/60" />
      <div className={`${sectionClass} py-20`}>
        <p className={eyebrowClass}>Studio d’entreprises · Afrique & Europe</p>
        <h1 className="demaa-hero-title mt-6 max-w-[760px] text-[clamp(2.8rem,5.5vw,5.7rem)] leading-[1.02] tracking-[-0.045em]">On crée des entreprises sur des marchés qu’on connaît de l’intérieur.</h1>
        <p className="mt-7 max-w-[520px] text-base leading-7 text-brand-blue/80">Nous identifions des opportunités, testons les idées sur le terrain et construisons des entreprises avec méthode, patience et intention.</p>
        <div className="mt-9 flex flex-wrap gap-4"><Link href="/projets" className={contactClass}>Voir les projets <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link><a href="mailto:team@demaa.fr" className="inline-flex min-h-12 items-center border-b border-brand-blue px-1 text-sm font-medium">Nous contacter</a></div>
      </div>
    </section>
    <section className="border-y border-dema-line">
      <div className={`${sectionClass} grid gap-10 lg:grid-cols-2`}>
        <div><p className={eyebrowClass}>Notre point de départ</p><h2 className={`${titleClass} mt-5`}>Le terrain avant tout.</h2></div>
        <div><p className="text-lg leading-8 text-brand-blue/85">Nous partons de problèmes que nous connaissons de près. Une équipe partagée réunit finance, opérations, technologie et développement commercial pour faire avancer chaque projet.</p><p className="mt-5 text-base leading-7 text-dema-muted">Nous cherchons des entreprises solides, capables d’atteindre la rentabilité. Nous concentrons nos moyens sur les projets qui montrent du potentiel.</p><ul className="mt-8 grid grid-cols-2 gap-x-5 gap-y-4 border-t border-dema-line pt-5">{DEMAA_STUDIO_POLES.map((pole) => <li key={pole} className="text-sm font-medium">{pole}</li>)}</ul></div>
      </div>
    </section>
    <section className={sectionClass}>
      <p className={eyebrowClass}>Les projets prioritaires</p><div className="mt-5 flex flex-col justify-between gap-6 sm:flex-row sm:items-end"><h2 className={titleClass}>Trois projets à faire grandir.</h2><Link href="/projets" className="inline-flex items-center gap-3 text-sm font-medium underline underline-offset-8">Tous les projets <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link></div>
      <div className="mt-12 grid gap-12 sm:grid-cols-2 lg:grid-cols-3">{DEMAA_PRIORITY_STUDIO_PROJECTS.map((project) => <ProjectCard key={project.slug} project={project} />)}</div>
      <p className="mt-6 text-xs leading-5 text-dema-muted">Les visuels illustrent les concepts des projets.</p>
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
    <section className={sectionClass}>
      <p className={eyebrowClass}>Les fondatrices</p><h2 className={`${titleClass} mt-5`}>Deux parcours complémentaires.</h2>
      <div className="mt-12 grid gap-10 md:grid-cols-2">
        <article className="border-t border-dema-line pt-6"><h3 className="text-2xl font-medium">Aïssata Gory</h3><p className="mt-2 text-sm text-dema-forest">Finance & pilotage</p><p className="mt-5 max-w-lg text-base leading-7 text-dema-muted">Directrice financière et entrepreneure, Aïssata apporte son expérience de la gestion financière et de la comptabilité, notamment chez CBRE et Transdev.</p></article>
        <article className="border-t border-dema-line pt-6"><h3 className="text-2xl font-medium">Oumou Gory</h3><p className="mt-2 text-sm text-dema-forest">Développement & opérations</p><p className="mt-5 max-w-lg text-base leading-7 text-dema-muted">Spécialiste du lancement et de la structuration de projets, Oumou a été directrice pays chez Heetch et consultante senior chez Deloitte et PwC.</p></article>
      </div>
    </section>
    <ContactSection /><ResourcesSection />
  </>;
}

function ProjectsContent() {
  const studioProjects = DEMAA_PUBLISHED_STUDIO_PROJECTS.filter(({ portfolio }) => portfolio !== "other");
  const otherProjects = DEMAA_PUBLISHED_STUDIO_PROJECTS.filter(({ portfolio }) => portfolio === "other");
  return <>
    <section className={sectionClass}><p className={eyebrowClass}>Le portefeuille</p><h1 className={`${titleClass} mt-5 max-w-4xl`}>Des projets concrets, des marchés que l’on connaît.</h1><p className="mt-6 max-w-2xl text-base leading-7 text-dema-muted">Trois priorités et des concepts à tester progressivement. Chaque projet avance à son rythme, avec un besoin et une offre propres.</p><ul className="mt-8 flex flex-wrap gap-x-6 gap-y-3">{DEMAA_STUDIO_POLES.map((pole) => <li key={pole} className="text-sm text-dema-forest">{pole}</li>)}</ul></section>
    <section className={`${sectionClass} !pt-0`} aria-label="Projets du Studio"><div className="grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">{studioProjects.map((project) => <ProjectCard key={project.slug} project={project} />)}</div><p className="mt-8 text-xs text-dema-muted">Les visuels illustrent les concepts des projets.</p></section>
    <section className="border-t border-dema-line"><div className={sectionClass}><h2 className={titleClass}>Autres projets et partenaires</h2><p className="mt-5 max-w-2xl text-base leading-7 text-dema-muted">Retrouvez aussi les outils et initiatives présentés par Demaa.</p><div className="mt-10 grid gap-10 sm:grid-cols-2 lg:grid-cols-4">{otherProjects.map((project) => <ProjectCard key={project.slug} project={project} />)}</div></div></section>
    <ContactSection /><ResourcesSection />
  </>;
}

function OpportunitiesContent() {
  return <>
    <section className={sectionClass}><p className={eyebrowClass}>Collaborer avec Demaa</p><h1 className={`${titleClass} mt-5 max-w-4xl`}>Construisons la suite ensemble.</h1><p className="mt-6 max-w-2xl text-lg leading-8 text-dema-muted">Vous connaissez un marché, développez un produit ou souhaitez contribuer à un projet ? Parlons de ce que nous pouvons construire ensemble.</p><div className="mt-12 grid gap-10 md:grid-cols-3">{[
      ["Porter un projet", "Une expérience du terrain, un besoin identifié et l’envie de construire une entreprise."],
      ["Contribuer à l’exécution", "Technologie, contenu, développement commercial ou opérations : partager une expertise utile aux projets."],
      ["Créer un partenariat", "Tester une offre, apporter un savoir-faire ou relier un projet à ses premiers clients."],
    ].map(([title, description]) => <article key={title} className="border-t border-dema-line pt-6"><h2 className="text-2xl font-medium">{title}</h2><p className="mt-4 text-base leading-7 text-dema-muted">{description}</p></article>)}</div><a href="mailto:team@demaa.fr?subject=Collaborer%20avec%20Demaa" className={`${contactClass} mt-12`}>Parlons de votre contribution <ArrowUpRight className="h-4 w-4" aria-hidden="true" /></a><Link href="/projets" className="ml-0 mt-6 flex w-fit items-center gap-3 text-sm underline underline-offset-8 sm:ml-6 sm:inline-flex">Découvrir les projets <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link></section>
    <ResourcesSection />
  </>;
}

export default function DemaaStudioLanding({ view }: { view: StudioView }) {
  return <><StudioHeader view={view} /><main className="min-h-screen bg-dema-cream text-brand-blue">{view === "studio" ? <StudioContent /> : view === "projets" ? <ProjectsContent /> : <OpportunitiesContent />}</main></>;
}

export function DemaaStudioProjectPage({ project }: { project: DemaaStudioProject }) {
  return <><StudioHeader view="projets" /><main className="min-h-screen bg-dema-cream text-brand-blue">
    <section className={sectionClass}><Link href="/projets" className="text-sm underline underline-offset-8">← Tous les projets</Link><div className="mt-12 grid items-center gap-10 lg:grid-cols-2"><div><p className={eyebrowClass}>{project.pole} · {project.status}</p><h1 className={`${titleClass} mt-5`}>{project.name}</h1><p className="mt-6 text-lg leading-8 text-dema-muted">{project.summary}</p>{project.href ? <a href={project.href} target="_blank" rel="noopener noreferrer" className={`${contactClass} mt-8`}>Visiter le site <ArrowUpRight className="h-4 w-4" aria-hidden="true" /><span className="sr-only"> (nouvel onglet)</span></a> : null}</div>{project.image ? <figure><div className="relative aspect-[4/3] overflow-hidden bg-dema-sage"><Image src={project.image} alt={project.imageAlt ?? project.name} fill sizes="(max-width: 1023px) 90vw, 560px" className="object-cover" /></div><figcaption className="mt-3 text-xs text-dema-muted">Visuel de concept du projet</figcaption></figure> : null}</div></section>
    <section className={`${sectionClass} !pt-0`}><div className="grid gap-10 border-t border-dema-line pt-10 md:grid-cols-2"><article><h2 className="text-2xl font-medium">Le besoin</h2><p className="mt-5 text-base leading-7 text-dema-muted">{project.problem}</p></article><article><h2 className="text-2xl font-medium">La réponse</h2><p className="mt-5 text-base leading-7 text-dema-muted">{project.solution}</p></article></div>{project.need ? <p className="mt-8 text-base leading-7 text-dema-muted">{project.need}</p> : null}</section>
    <ContactSection /><ResourcesSection />
  </main></>;
}
