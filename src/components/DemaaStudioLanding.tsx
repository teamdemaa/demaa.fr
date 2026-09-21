import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, Building2, Compass, HeartHandshake, Sprout } from "lucide-react";
import DemaaWordmark from "@/components/DemaaWordmark";
import { DEMAA_STUDIO_PROJECTS } from "@/lib/demaa-studio-projects";

const principles = [
  { icon: HeartHandshake, label: "Les personnes au centre" },
  { icon: Sprout, label: "Une approche responsable" },
  { icon: Building2, label: "Des fondations solides" },
  { icon: Compass, label: "Des opportunités ouvertes" },
];

const opportunities = [
  { label: "À explorer", title: "Une idée qui répond à un besoin concret.", description: "Nous partons du terrain, des personnes et des usages avant d’imaginer une réponse." },
  { label: "À construire", title: "Un projet qui mérite une équipe engagée.", description: "Nous testons une direction clairement avant de lui donner les moyens de grandir." },
  { label: "À accompagner", title: "Une entreprise qui cherche un nouveau cap.", description: "Nous apportons une méthode, des ressources et une attention réelle à l’exécution." },
];

function StudioTabs() {
  return (
    <nav aria-label="Navigation du Studio" className="min-w-0 overflow-x-auto no-scrollbar">
      <div className="inline-flex min-w-max items-center rounded-full bg-[#eee9e2] p-1">
        <a href="#studio" className="rounded-full bg-[#191816] px-4 py-2 text-xs font-medium text-white sm:px-5">Studio</a>
        <a href="#projets" className="rounded-full px-4 py-2 text-xs font-medium text-[#4d4841] transition hover:bg-white/70 sm:px-5">Projets</a>
        <a href="#opportunites" className="rounded-full px-4 py-2 text-xs font-medium text-[#4d4841] transition hover:bg-white/70 sm:px-5">Opportunités</a>
      </div>
    </nav>
  );
}

export default function DemaaStudioLanding() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#fbfaf7] text-[#1b1b18]">
      <header className="sticky top-0 z-40 border-b border-[#ddd7ce]/80 bg-[#fbfaf7]/95 backdrop-blur">
        <div className="mx-auto flex min-h-[76px] w-full max-w-[1160px] items-center gap-4 px-5 sm:px-8">
          <Link href="/studio" aria-label="Studio Demaa" className="shrink-0"><DemaaWordmark className="text-[1.6rem]" colorClassName="text-[#1b1b18]" /></Link>
          <div className="min-w-0 flex-1"><StudioTabs /></div>
          <Link href="mailto:team@demaa.fr" className="hidden shrink-0 rounded-full bg-[#191816] px-4 py-2.5 text-xs font-medium text-white transition hover:bg-[#39342e] sm:inline-flex">Nous contacter</Link>
        </div>
      </header>

      <section id="studio" className="border-b border-[#ddd7ce] scroll-mt-24">
        <div className="mx-auto grid min-h-[min(700px,calc(100vh-76px))] max-w-[1440px] lg:grid-cols-[minmax(0,1.04fr)_minmax(420px,.96fr)]">
          <div className="flex items-center px-5 py-20 sm:px-10 lg:px-[max(3rem,calc((100vw-1160px)/2))] lg:pr-16">
            <div className="max-w-[590px]">
              <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-[#756d64]">Des idées. Des personnes. Des opportunités.</p>
              <h1 className="mt-5 max-w-[680px] font-serif text-[clamp(3.55rem,6.5vw,6.3rem)] font-normal leading-[0.9] tracking-[-0.055em] text-[#191816]">Construire des entreprises solides et rentables.</h1>
              <p className="mt-7 max-w-[530px] text-[15px] leading-7 text-[#514c45] sm:text-base">DEMAA est un studio d’entreprises. Nous identifions des opportunités, testons des idées et construisons des entreprises avec discipline, attention au marché et patience.</p>
              <a href="#projets" className="mt-8 inline-flex items-center gap-2 rounded-full bg-[#191816] px-5 py-3 text-xs font-medium text-white transition hover:bg-[#39342e]">Voir les projets <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" /></a>
            </div>
          </div>
          <div aria-hidden="true" className="relative min-h-[410px] overflow-hidden bg-[#d6c0ab]">
            <div className="absolute inset-y-0 left-0 w-1/3 bg-[#c99176]/35" />
            <div className="absolute -left-16 bottom-0 h-[78%] w-[65%] rounded-t-[55%] bg-[#926a59]" />
            <div className="absolute bottom-0 left-[19%] h-[82%] w-[54%] rounded-t-[49%] bg-[#201c1a]" />
            <div className="absolute bottom-0 left-[31%] h-[66%] w-[44%] rounded-t-[42%] bg-[#eee7dd]" />
            <div className="absolute right-[12%] top-[14%] max-w-[170px] text-[10px] font-medium uppercase leading-5 tracking-[0.17em] text-[#413a35]">Des perspectives différentes pour des opportunités plus larges</div>
            <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#b8846c]/35 to-transparent" />
          </div>
        </div>
        <div className="border-t border-[#ddd7ce] px-5 py-5 sm:px-8"><div className="mx-auto flex max-w-[1160px] flex-wrap justify-between gap-x-6 gap-y-2 text-[10px] font-medium uppercase tracking-[0.15em] text-[#5a544c]"><span>Afrique × Europe × Marchés globaux</span><span>Des perspectives différentes. Des opportunités plus larges.</span></div></div>
      </section>

      <section className="mx-auto max-w-[1160px] px-5 py-24 sm:px-8 lg:py-32">
        <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-[#756d64]">Notre manière de construire</p>
        <div className="mt-4 grid gap-12 lg:grid-cols-[1.1fr_.9fr] lg:items-end"><h2 className="max-w-[600px] font-serif text-[clamp(3rem,5vw,5.3rem)] font-normal leading-[0.9] tracking-[-0.05em]">Faire les choses intentionnellement.</h2><p className="max-w-[420px] text-[15px] leading-7 text-[#5d574f]">Nous plaçons les personnes au centre des décisions. Nous écoutons avant de construire, servons avant de vendre et privilégions des fondations solides aux raccourcis.</p></div>
        <div className="mt-16 grid border-y border-[#ddd7ce] sm:grid-cols-2 lg:grid-cols-4">{principles.map(({ icon: Icon, label }) => <div key={label} className="border-b border-[#ddd7ce] px-5 py-7 last:border-b-0 sm:border-b-0 sm:border-r sm:last:border-r-0"><Icon className="h-5 w-5 text-[#514c45]" strokeWidth={1.4} aria-hidden="true" /><p className="mt-10 max-w-28 text-sm leading-5 text-[#37332e]">{label}</p></div>)}</div>
      </section>

      <section id="projets" className="scroll-mt-24 border-y border-[#ddd7ce] bg-[#f4f0e9] px-5 py-24 sm:px-8 lg:py-32"><div className="mx-auto max-w-[1160px]"><div className="flex flex-wrap items-end justify-between gap-5"><div><p className="text-[10px] font-medium uppercase tracking-[0.18em] text-[#756d64]">Nos projets</p><h2 className="mt-4 font-serif text-[clamp(3rem,5vw,5.3rem)] font-normal leading-[0.9] tracking-[-0.05em]">Des projets concrets.</h2></div><p className="max-w-[340px] text-sm leading-6 text-[#5d574f]">Des entreprises pensées avec leurs usages, leur marché et les personnes qui les feront vivre.</p></div><div className="mt-16 grid gap-5 md:grid-cols-3">{DEMAA_STUDIO_PROJECTS.map((project, index) => <a key={project.name} href={project.href} target="_blank" rel="noreferrer" className="group border-t border-[#cfc6ba] pt-4"><div className={`flex h-44 items-end border border-[#ded6cb] p-5 ${index === 1 ? "bg-[#e9dfd1]" : index === 2 ? "bg-[#d8c2ad]" : "bg-[#e7e9e3]"}`}><Image src={project.logo} alt="" width={160} height={56} className="h-auto max-h-11 w-auto max-w-[10rem] object-contain object-left" /></div><div className="mt-4 flex items-start justify-between gap-4"><div><h3 className="text-sm font-medium tracking-[0.06em]">{project.name}</h3><p className="mt-1 text-sm text-[#676057]">{project.sector}</p></div><ArrowUpRight className="mt-0.5 h-4 w-4 shrink-0 text-[#5c554d] transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden="true" /></div></a>)}</div></div></section>

      <section id="opportunites" className="scroll-mt-24 px-5 py-24 sm:px-8 lg:py-32"><div className="mx-auto grid max-w-[1160px] gap-12 lg:grid-cols-[.9fr_1.1fr] lg:gap-20"><div><p className="text-[10px] font-medium uppercase tracking-[0.18em] text-[#756d64]">Opportunités</p><h2 className="mt-4 font-serif text-[clamp(3rem,5vw,5.3rem)] font-normal leading-[0.9] tracking-[-0.05em]">Voir plus loin, sans précipitation.</h2><p className="mt-7 max-w-[390px] text-[15px] leading-7 text-[#5d574f]">Une opportunité n’est pas une promesse. C’est un sujet à regarder sérieusement, avec les bonnes personnes et le temps nécessaire.</p><Link href="/academie" className="mt-9 inline-flex items-center gap-2 border-b border-[#1b1b18] pb-1 text-sm font-medium text-[#1b1b18] transition hover:border-[#a36e58] hover:text-[#a36e58]">Découvrir l’Académie <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link></div><div className="divide-y divide-[#ddd7ce] border-y border-[#ddd7ce]">{opportunities.map((opportunity, index) => <article key={opportunity.label} className="grid gap-4 py-7 sm:grid-cols-[3rem_1fr]"><span className="text-sm text-[#a36e58]">0{index + 1}</span><div><p className="text-[10px] font-medium uppercase tracking-[0.18em] text-[#756d64]">{opportunity.label}</p><h3 className="mt-3 text-xl font-medium leading-tight tracking-[-0.03em]">{opportunity.title}</h3><p className="mt-3 max-w-[510px] text-sm leading-6 text-[#676057]">{opportunity.description}</p></div></article>)}</div></div></section>

      <section className="bg-[#251c18] px-5 py-20 text-[#fbfaf7] sm:px-8 lg:py-28"><div className="mx-auto grid max-w-[1160px] gap-10 md:grid-cols-[1fr_auto] md:items-end"><div><p className="text-[10px] font-medium uppercase tracking-[0.18em] text-[#d7b8a2]">Et après ?</p><h2 className="mt-4 max-w-[700px] font-serif text-[clamp(3rem,5vw,5.3rem)] font-normal leading-[0.9] tracking-[-0.05em]">Construisons ce qui compte.</h2></div><Link href="mailto:team@demaa.fr" className="inline-flex w-fit items-center gap-2 rounded-full bg-[#fbfaf7] px-5 py-3 text-xs font-medium text-[#251c18] transition hover:bg-[#ead9cc]">Nous contacter <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" /></Link></div></section>
    </main>
  );
}
