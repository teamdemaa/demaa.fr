import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import {
  DEMAA_PUBLISHED_STUDIO_PROJECTS,
  DEMAA_PRIORITY_STUDIO_PROJECTS,
  DEMAA_STUDIO_POLES,
  type DemaaStudioProject,
} from "@/lib/english-studio-projects";

export type StudioView = "studio" | "projets" | "opportunites";
const sectionClass = "mx-auto w-full max-w-7xl px-5 py-16 sm:px-8 lg:px-16 lg:py-24";
const titleClass = "demaa-section-title text-4xl leading-[1.08] tracking-tight sm:text-5xl lg:text-6xl";
const eyebrowClass = "text-xs font-medium uppercase tracking-[0.18em] text-dema-muted";
const contactClass = "inline-flex min-h-12 items-center justify-center gap-3 rounded-full bg-brand-blue px-6 py-3 text-sm font-medium text-dema-paper transition hover:bg-dema-forest";

function StudioHeader({ view }: { view: StudioView }) {
  return <Navbar overlayHero={view === "studio"} localeCode="en" publicNavigationActiveView={view} />;
}

function ContactSection() {
  return <section className="bg-brand-blue text-dema-paper">
    <div className={`${sectionClass} flex flex-col items-start justify-between gap-8 sm:flex-row sm:items-end`}>
      <div><p className="text-xs uppercase tracking-[0.18em] text-dema-paper/70">What’s next?</p><h2 className={`${titleClass} mt-5 max-w-2xl`}>Let’s build something that matters.</h2></div>
      <a href="mailto:team@demaa.fr" className="inline-flex min-h-12 shrink-0 items-center gap-3 rounded-full bg-dema-paper px-6 py-3 text-sm font-medium text-brand-blue transition hover:bg-dema-sage">Contact <ArrowUpRight className="h-4 w-4" aria-hidden="true" /></a>
    </div>
  </section>;
}

function ProjectCard({ project }: { project: DemaaStudioProject }) {
  return <article className="min-w-0">
    <div>
      <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-dema-sage">
        {project.image ? <Image src={project.image} alt={project.imageAlt ?? project.name} fill sizes="(max-width: 639px) calc(100vw - 40px), (max-width: 1023px) 45vw, 380px" className="object-cover" /> : project.logo ? <div className="flex h-full items-center justify-center p-10"><Image src={project.logo} alt="" width={210} height={80} className="max-h-20 w-auto max-w-full object-contain" /></div> : <div className="flex h-full items-center justify-center p-8 font-serif text-4xl">{project.name}</div>}
      </div>
      <p className={`${eyebrowClass} mt-5`}>{project.pole}</p>
      <div className="mt-2 flex items-center justify-between gap-4"><h3 className="text-2xl font-medium tracking-tight">{project.name}</h3></div>
      <p className="mt-3 text-sm leading-6 text-dema-muted">{project.summary}</p>
      {project.href && <a href={project.href} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex min-h-11 items-center gap-2 text-sm underline underline-offset-4">Visit website <ArrowUpRight className="h-4 w-4" aria-hidden="true" /></a>}
    </div>
  </article>;
}

function ResourcesSection() {
  return <section className="border-t border-dema-line"><div className={sectionClass}><h2 className={titleClass}>What we’re learning as we build.</h2><p className="mt-5 max-w-2xl text-base leading-7 text-dema-muted">Real examples of how we approach building and growing businesses.</p><Link href="/en/insights" className={`${contactClass} mt-8`}>Explore our insights <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link></div></section>;
}

function StudioContent() {
  return <>
    <section className="relative isolate overflow-hidden lg:flex lg:min-h-[760px] lg:items-center">
      <div className="absolute inset-x-0 top-0 -z-20 h-[300px] sm:h-[400px] lg:inset-0 lg:h-auto"><Image src="/images/studio/cover-mobile.webp" alt="" fill sizes="100vw" className="object-cover object-[75%_center] lg:hidden" /><Image src="/images/studio/cover.webp" alt="" fill preload sizes="100vw" className="hidden object-cover object-[68%_center] lg:block" /></div>
      <div className="absolute inset-0 -z-10 hidden bg-gradient-to-r from-dema-cream/85 via-dema-cream/25 to-transparent lg:block" />
      <div className={`${sectionClass} pb-16 pt-[328px] sm:pt-[440px] lg:py-20`}>
        <h1 className="demaa-hero-title max-w-[760px] text-[clamp(2.8rem,5.5vw,5.7rem)] leading-[1.02] tracking-[-0.045em] lg:mt-6">We build businesses<br />in markets we know first-hand.</h1>
        <p className="mt-5 sm:mt-7 max-w-[520px] text-base leading-7 text-brand-blue/80">DEMAA is a venture studio. We build and grow businesses, selling some and holding others for the income they generate.</p>
        <div className="mt-6 sm:mt-9 flex flex-wrap gap-4"><Link href="/en/ventures" className={contactClass}>Explore our ventures <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link></div>
      </div>
    </section>
    <section className="border-y border-dema-line">
      <div className={`${sectionClass} grid gap-10 lg:grid-cols-2`}>
        <div><p className={eyebrowClass}>Where we start</p><h2 className={`${titleClass} mt-5`}>Grounded in first-hand experience.</h2></div>
        <div><p className="text-lg leading-8 text-brand-blue/85">We start with problems we understand first-hand. A shared team brings together finance, operations, technology and business development to move each venture forward.</p><ul className="mt-8 grid grid-cols-2 gap-x-5 gap-y-4 border-t border-dema-line pt-5">{DEMAA_STUDIO_POLES.map((pole) => <li key={pole} className="text-sm font-medium">{pole}</li>)}</ul></div>
      </div>
    </section>
    <section className={sectionClass}>
      <div className="mt-5 flex flex-col justify-between gap-6 sm:flex-row sm:items-end"><h2 className={titleClass}>Our ventures</h2><Link href="/en/ventures" className="inline-flex items-center gap-3 text-sm font-medium underline underline-offset-8">All ventures <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link></div>
      <div className="mt-12 grid gap-12 sm:grid-cols-2 lg:grid-cols-3">{DEMAA_PRIORITY_STUDIO_PROJECTS.map((project) => <ProjectCard key={project.slug} project={project} />)}</div>
    </section>
    <section className="bg-dema-sage">
      <div className={sectionClass}>
        <p className={eyebrowClass}>How we work</p><h2 className={`${titleClass} mt-5 max-w-3xl`}>From idea to execution, one considered step at a time.</h2>
        <ol className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">{[
          ["Identify", "A real need, a market we know and a clear first customer."],
          ["Test", "Three to six months to test the offer against real demand."],
          ["Decide", "Stop, refine the idea or put the foundations in place to launch the business."],
          ["Grow", "A dedicated team, lasting systems and steady, deliberate growth."],
        ].map(([title, description], index) => <li key={title} className="border-t border-brand-blue/20 pt-5"><span className="text-xs text-dema-muted">0{index + 1}</span><h3 className="mt-4 text-xl font-medium">{title}</h3><p className="mt-3 text-sm leading-6 text-dema-muted">{description}</p></li>)}</ol>
      </div>
    </section>
    <BuildTogetherSection /><ResourcesSection />
  </>;
}

function BuildTogetherSection() {
  return <section className="border-t border-dema-line"><div className={sectionClass}>
    <p className={eyebrowClass}>Build with us</p>
    <h2 className={`${titleClass} mt-5 max-w-3xl`}>A market you know. A business we could build together.</h2>
    <p className="mt-6 max-w-2xl text-base leading-7 text-dema-muted">Know the market and want to lead a venture? Explore the ideas we’d like to build with you.</p>
    <Link href="/en/studio/build-with-us" className={`${contactClass} mt-8`}>Explore the opportunities <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
  </div></section>;
}

function ProjectsContent() {
  const otherProjects = DEMAA_PUBLISHED_STUDIO_PROJECTS.filter(({ portfolio, slug }) => portfolio === "pipeline" || slug === "mnd");
  return <>
    <header className="mx-auto w-full max-w-7xl px-4 pb-10 pt-12 text-center sm:px-6 md:pb-12 md:pt-16 lg:px-8">
      <h1 className="text-balance font-light leading-[0.94] tracking-tight" style={{ fontSize: "clamp(2.4rem, 6.8vw, 4.6rem)" }}>
        <span className="block text-brand-blue/62">The businesses</span>
        <span className="demaa-hero-title block text-dema-forest">we’re building.</span>
      </h1>
    </header>
    <section className={`${sectionClass} !pt-0`} aria-label="Studio ventures"><div className="grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">{DEMAA_PRIORITY_STUDIO_PROJECTS.map((project) => <ProjectCard key={project.slug} project={project} />)}</div></section>
    <section className="border-t border-dema-line"><div className={sectionClass}><h2 className="text-3xl font-medium">Other ventures</h2><div className="mt-8 grid gap-8 sm:grid-cols-2">{otherProjects.map((project) => <article key={project.slug} className="border-t border-dema-line pt-5"><h3 className="text-xl font-medium">{project.name}</h3><p className="mt-3 text-sm leading-6 text-dema-muted">{project.summary}</p></article>)}</div></div></section>
    <BuildTogetherSection /><ResourcesSection />
  </>;
}

const founderProfiles: Record<string, string> = {
  jagoya: "Wholesale, distribution or developing African brands.",
  tendera: "Construction, tendering or digital product development.",
  kahe: "Coffee, hospitality and running a welcoming venue.",
  mandya: "Wellness, treatments and spa operations.",
  lafiasso: "Property and first-hand knowledge of West African markets.",
  djaty: "Renovation, project coordination and working with homeowners.",
};

function OpportunitiesContent() {
  const ideas = DEMAA_PUBLISHED_STUDIO_PROJECTS.filter(({ portfolio }) => portfolio === "pipeline");
  return <>
    <section className={sectionClass}><p className={eyebrowClass}>Build with us</p><h1 className={`${titleClass} mt-5 max-w-4xl`}>Ideas we could build together.</h1><p className="mt-6 max-w-2xl text-lg leading-8 text-dema-muted">We’re looking for people who know these markets and want to build a business with us. These are some of the ideas we’d like to explore.</p>
    <div className="mt-12 grid gap-x-12 gap-y-10 md:grid-cols-2">{ideas.map((project) => <article key={project.slug} className="border-t border-dema-line pt-6"><h2 className="text-2xl font-medium">{project.name}</h2><p className="mt-4 text-base leading-7 text-dema-muted">{project.summary}</p><p className="mt-5 text-sm leading-6"><span className="font-medium">Your experience: </span>{founderProfiles[project.slug]}</p><a href={`mailto:team@demaa.fr?subject=${encodeURIComponent(`Build ${project.name} with DEMAA`)}`} className="mt-6 inline-flex min-h-11 items-center gap-3 text-sm underline underline-offset-8">Let’s talk about this venture <ArrowUpRight className="h-4 w-4" aria-hidden="true" /></a></article>)}</div>
    <p className="mt-10 max-w-2xl text-sm leading-6 text-dema-muted">An initial conversation to draw on your experience, test the idea and explore what we could build together.</p></section>
    <ResourcesSection />
  </>;
}

export default function EnglishStudioLanding({ view }: { view: StudioView }) {
  return <><StudioHeader view={view} /><main className="min-h-screen bg-dema-cream text-brand-blue">{view === "studio" ? <StudioContent /> : view === "projets" ? <ProjectsContent /> : <OpportunitiesContent />}</main></>;
}

export function EnglishStudioProjectPage({ project }: { project: DemaaStudioProject }) {
  return <><StudioHeader view="projets" /><main className="min-h-screen bg-dema-cream text-brand-blue">
    <section className={sectionClass}><Link href="/en/ventures" className="text-sm underline underline-offset-8">← All ventures</Link><div className="mt-12 grid items-center gap-10 lg:grid-cols-2"><div><p className={eyebrowClass}>{project.pole}</p><h1 className={`${titleClass} mt-5`}>{project.name}</h1><p className="mt-6 text-lg leading-8 text-dema-muted">{project.summary}</p>{project.href ? <a href={project.href} target="_blank" rel="noopener noreferrer" className={`${contactClass} mt-8`}>Visit the website <ArrowUpRight className="h-4 w-4" aria-hidden="true" /><span className="sr-only"> (opens in a new tab)</span></a> : null}</div>{project.portfolio === "priority" && project.image ? <figure><div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-dema-sage"><Image src={project.image} alt={project.imageAlt ?? project.name} fill sizes="(max-width: 1023px) 90vw, 560px" className="object-cover" /></div><figcaption className="mt-3 text-xs text-dema-muted">Concept image</figcaption></figure> : null}</div></section>
    <section className={`${sectionClass} !pt-0`}><div className="grid gap-10 border-t border-dema-line pt-10 md:grid-cols-2"><article><h2 className="text-2xl font-medium">The need</h2><p className="mt-5 text-base leading-7 text-dema-muted">{project.problem}</p></article><article><h2 className="text-2xl font-medium">Our approach</h2><p className="mt-5 text-base leading-7 text-dema-muted">{project.solution}</p></article></div>{project.need ? <p className="mt-8 text-base leading-7 text-dema-muted">{project.need}</p> : null}</section>
    {project.portfolio === "pipeline" ? <BuildTogetherSection /> : <ContactSection />}<ResourcesSection />
  </main></>;
}
